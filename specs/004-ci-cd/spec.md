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
