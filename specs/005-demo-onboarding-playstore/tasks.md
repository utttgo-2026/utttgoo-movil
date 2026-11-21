# Tasks 005 - Demo invitado, onboarding y preparación Play Store

## Estado

**EN DESARROLLO**

## Tareas

- [x] Crear spec, plan y tasks de la fase.
- [x] Crear fuente aislada de datos demo.
- [x] Implementar Demo invitado 1/2.
- [x] Implementar Demo invitado 2/2.
- [x] Conectar Welcome con el demo.
- [x] Corregir Splash e identidad visual.
- [x] Integrar Login con `POST /api/v1/auth/login`.
- [x] Integrar Registro con `POST /api/v1/auth/register` y respuesta `202`.
- [x] Sustituir token simulado por confirmación de enlace Supabase.
- [x] Añadir almacenamiento seguro para JWT.
- [x] Corregir icono, adaptive icon, splash y nombre Android.
- [x] Agregar pruebas del flujo demo y auth.
- [x] Actualizar documentación y evidencias.
- [x] Ejecutar validaciones locales.
- [x] Ejecutar Preview EAS si la autenticación está disponible.
- [x] Hacer commit y push únicamente a `origin/eas-google-play`.

## Evidencia de validación

- Node: `v22.13.1`.
- TypeScript: `0 errors`.
- Tests: `16 passed`.
- Coverage: `92.5%` statements, `80.64%` branches, `100%` functions, `92.3%` lines.
- Expo Doctor: `20/20 checks passed`.
- EAS project: `@utttgoo/uttgoo`, project ID `52014672-c800-4cf6-af6a-330cb13986e8`.
- Preview Build: `FINISHED`; ID `a79cfe03-5d21-4a04-aa5f-e7d192cd9afe`; commit
  `54ee2e9b8568f4a727dacff10dd226bb30c55dc8`; APK `preview`.

## Bloqueos esperados

- `BLOCKED_BY_BACKEND_EMAIL_RESEND` queda pendiente por falta de contrato de reenvío.
- `BLOCKED_BY_EAS_AUTH`
- `NON_BLOCKING_EAS_WARNING`
- `EXPECTED_SIDELOAD_WARNING`
