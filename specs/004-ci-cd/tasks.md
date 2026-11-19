# Tasks 004 - CI/CD, DevSecOps y Release Mobile

## Estado

**EN DESARROLLO**

## Tareas

- [x] Identificar `004-ci-cd` como fase vigente y evitar duplicarla.
- [x] Actualizar spec, plan y tasks con alcance actual.
- [x] Unificar Node 22.13.1 mediante `.nvmrc`, `engines` y workflows.
- [x] Crear scripts reales de test, coverage e integración.
- [x] Crear pruebas de correo institucional, utilidades y contrato `ApiError`.
- [x] Crear configuración API por entorno sin URL hardcodeada.
- [x] Crear cliente API centralizado aislado de pantallas mock.
- [x] Corregir CI con typecheck, lint, tests, coverage, Expo Doctor y SDD.
- [x] Crear CodeQL, Dependency Review, npm audit, Dependabot y Gitleaks.
- [x] Crear Preview EAS manual no simulado.
- [x] Crear Release Production manual para AAB, sin submit automático.
- [x] Crear smoke test externo separado mediante `API_BASE_URL`.
- [x] Documentar entornos, branch protection, evidencias y bloqueos.
- [x] Ejecutar `npm ci` y validaciones locales finales.
- [ ] Vincular proyecto EAS real (`BLOCKED_BY_EXPO_LINK`).
- [ ] Configurar `EXPO_TOKEN` (`BLOCKED_BY_EXPO_TOKEN`).
- [ ] Ejecutar primer build EAS (`BLOCKED_BY_FIRST_EAS_BUILD`).
- [x] Verificar Backend HTTPS, `GET /health` y OpenAPI en `https://3.129.142.54.nip.io`.
- [ ] Documentar URL real de Landing (`PENDING_LANDING_URL_DOCUMENTATION`).
- [x] Añadir acceso legal desde Perfil > Privacidad y seguridad mediante URLs públicas verificadas.

### Fase 7: EAS Preview Environment Gate
- [x] Documentar REQ-EAS-ENV-001 a REQ-EAS-ENV-008 sin crear una fase SDD paralela.
- [x] Sanitizar `.env.example` y conservar `.env` ignorado/no versionado.
- [x] Declarar explícitamente el ambiente `preview` en el perfil EAS Preview.
- [x] Configurar y verificar las tres variables públicas requeridas en EAS Preview sin incluir sus valores en Git.
- [x] Agregar gate seguro de nombres de variables antes de `eas build`.
- [x] Ejecutar validaciones locales, CI/Security y un nuevo Preview Build con ambiente configurado.

### Fase 8: Production AAB Gate
- [x] Registrar Preview físico aprobado y transición a `READY_FOR_CLOSED_TEST_BUILD`.
- [x] Declarar explícitamente `environment: production` en el perfil EAS Production.
- [x] Documentar PROD-EAS-001 a PROD-EAS-008 en la fase SDD vigente.
- [x] Agregar gate seguro para las tres variables públicas EAS Production antes del build.
- [x] Mantener Production como AAB, sin `eas submit`, con destino inicial Closed Testing.
- [x] Ejecutar validaciones finales y confirmar CI/Security verdes.
- [x] Confirmar EAS Production Build `FINISHED` y artefacto `.aab` (`cd4516ec-4d0c-451b-a77b-2b776380bbc1`, versionCode `3`).

El APK Preview anterior `2abb8a71-9b68-46f0-a3ea-f2e98b27f4fe` no es candidato funcional final porque fue generado con el ambiente Preview vacío. El nuevo build `5b4b0280-71e0-44f9-9a84-87b5062dd84a` corresponde al commit `6b407e8` y superó la prueba física: `PREVIEW_PHYSICAL_TEST_PASSED`.

## Deuda no modificada

Carrito, favoritos, horarios y menús legacy permanecen registrados como deuda técnica y no se alteran en esta fase.
