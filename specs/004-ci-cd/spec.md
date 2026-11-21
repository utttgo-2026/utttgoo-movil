# Specification 004 - CI/CD, DevSecOps y Release Mobile

## Estado

**EN DESARROLLO**. Esta es la fase vigente para CI/CD; no se crea una fase paralela.

## Objetivo

Preparar el repositorio móvil para SDD, calidad automatizada, DevSecOps, builds EAS y release Android reproducible, sin modificar Backend ni inventar contratos no publicados.

## Alcance autorizado

- Node 22.13+ en desarrollo, CI y EAS.
- Scripts reales de typecheck, lint, tests, coverage y Expo Doctor.
- Pruebas deterministas independientes del Backend.
- Configuración API por entorno y `ApiError` centralizado.
- CI en Pull Request hacia `main`.
- CodeQL, Dependency Review, npm audit, Dependabot y Gitleaks.
- Workflows manuales de preview, release y smoke test.
- EAS production como AAB con versionado remoto, sin inventar `projectId`.
- Documentación de branch protection, evidencias y bloqueos.

## Fuera de alcance

- Modificar Backend, AWS, MongoDB o Redis.
- Habilitar HTTP inseguro en Production.
- Subir automáticamente a Google Play.
- Crear credenciales, tokens o UUIDs ficticios.
- Sustituir los mocks funcionales por endpoints no aprobados.
- Reintroducir o corregir funcionalidades de negocio fuera de esta fase.

## Criterios de aceptación

1. Los gates ejecutan herramientas reales y fallan ante errores.
2. CI usa Node 22.13.1 y cubre typecheck, lint, tests, coverage, Expo Doctor y trazabilidad SDD.
3. Los errores Backend se interpretan como `correlationId`, `status`, `code` y `message`.
4. Production rechaza configuraciones HTTP con `BLOCKED_BY_BACKEND_HTTPS`.
5. Preview y Production no se declaran operativos sin `EXPO_TOKEN`, `projectId` y primer build EAS exitoso.
6. No se agregan secretos al repositorio.

## Requisitos EAS Preview - Entorno y Seguridad

- **REQ-EAS-ENV-001**: Preview requiere `EXPO_PUBLIC_API_BASE_URL`.
- **REQ-EAS-ENV-002**: Preview requiere `EXPO_PUBLIC_SUPABASE_URL`.
- **REQ-EAS-ENV-003**: Preview requiere `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **REQ-EAS-ENV-004**: El Preview Build falla antes de `eas build` si falta una variable requerida.
- **REQ-EAS-ENV-005**: CI valida nombres de variables sin imprimir valores ni guardar el ambiente como artifact.
- **REQ-EAS-ENV-006**: `service_role`, claves secretas y el JWT signing secret están prohibidos en el cliente móvil.
- **REQ-EAS-ENV-007**: `.env` permanece ignorado y no versionado.
- **REQ-EAS-ENV-008**: Production mantiene su configuración independiente de Preview y se valida mediante sus propios gates.

El ambiente EAS Preview debe estar configurado antes de un build funcional. Un APK generado con el ambiente vacío es evidencia técnica de EAS, pero no evidencia funcional de autenticación/OTP.

La rotación/revocación de cualquier Supabase JWT signing secret expuesto corresponde al equipo Backend/Supabase según la estrategia activa de signing keys; este repositorio móvil no realiza esa rotación ni conserva el secreto.

## Requisitos EAS Production - AAB y Closed Testing

- **PROD-EAS-001**: Production requiere `EXPO_PUBLIC_API_BASE_URL`.
- **PROD-EAS-002**: Production requiere `EXPO_PUBLIC_SUPABASE_URL`.
- **PROD-EAS-003**: Production requiere `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- **PROD-EAS-004**: El Production Build falla antes de EAS si falta una variable requerida.
- **PROD-EAS-005**: El gate valida nombres sin imprimir valores ni guardar resultados sensibles como artifacts.
- **PROD-EAS-006**: Android Production genera un AAB mediante `android.buildType: app-bundle`.
- **PROD-EAS-007**: El workflow no ejecuta `eas submit` automáticamente.
- **PROD-EAS-008**: El destino inicial del AAB es Google Play Closed Testing mediante carga manual.

El estado Preview aprobado es `PREVIEW_PHYSICAL_TEST_PASSED`; el release Production queda preparado para `READY_FOR_CLOSED_TEST_BUILD` después de que CI/Security estén verdes y se confirme el AAB terminado.
