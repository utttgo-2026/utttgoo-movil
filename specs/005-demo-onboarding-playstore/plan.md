# Plan 005 - Demo invitado, onboarding y preparación Play Store

## Trazabilidad

Spec: `specs/005-demo-onboarding-playstore/spec.md`  
Tasks: `specs/005-demo-onboarding-playstore/tasks.md`

## Fases

1. **SDD y datos:** crear contrato de fase y módulos demo aislados.
2. **Experiencia inicial:** dirigir Splash a Demo 1 y conservar Welcome fuera del arranque.
3. **Demo:** implementar las dos pantallas demo con accesibilidad y responsive layout.
4. **Auth:** conectar Login/Registro al `ApiClient`, asegurar JWT y mostrar confirmación de correo real.
5. **Identidad:** corregir nombre, iconos, adaptive icon y splash de Expo SDK 58.
6. **Calidad:** agregar pruebas específicas y actualizar documentación/evidencias.
7. **Release:** validar EAS, ejecutar Preview si hay autenticación y registrar bloqueos sin ocultarlos.

## Decisiones

- Los datos demo son inmutables y no pasan por servicios API.
- Login y Registro usan el cliente API central; no hay fallback silencioso que invente usuarios.
- La navegación de regreso usa `push`/`back`; logout conserva `replace` para reiniciar sesión.
- La confirmación de correo explica el enlace enviado por Supabase. El reenvío queda `BLOCKED_BY_BACKEND_EMAIL_RESEND` si no hay soporte real.
- HTTPS del Backend queda resuelto para la base `https://3.129.142.54.nip.io`; Production continúa siendo un release manual.
- Un warning de tooling se documenta como `NON_BLOCKING_EAS_WARNING` solo después de revisar su log exacto.

## Validación

`npm ci`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:coverage`,
`npm run doctor`, `npx expo-doctor`, `npx eas-cli@latest project:info` y, si existe
autenticación, `npx eas-cli@latest build --platform android --profile preview`.
