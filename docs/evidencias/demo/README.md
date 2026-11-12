# Evidencias Demo y Onboarding

## Flujo esperado

- Splash: identidad `UTTT-GO`, fondo blanco, tagline y universidad.
- Welcome: hero promocional y acciones de Login, Registro y demo invitado.
- Demo 1/2: alimentos locales de ejemplo, sin llamadas al Backend.
- Demo 2/2: comparación local Product/Offer con vendedores, precio, estado y rating.
- Login: contrato `POST /api/v1/auth/login`; `401 INVALID_CREDENTIALS` muestra error sin exponer tokens.
- Registro: contrato `POST /api/v1/auth/register`; `202 Accepted` lleva a confirmación de correo.
- Confirmación: enlace enviado por Supabase; no solicita token ni simula verificación.

## Diagnóstico de onboarding

- `src/app/index.tsx` siempre envía a `/welcome` después del splash.
- `AuthContext` restaura la sesión, pero no redirige ni omite el onboarding.
- Welcome, Demo 1 y Demo 2 usan rutas Expo Router reales y datos locales.
- La inclusión en el bundle se valida mediante el manifest/metadata del export y pruebas de contrato, no solo mediante texto dentro de Hermes.

## Evidencia de validación

- Rama: `eas-google-play`.
- HEAD inspeccionado antes de la corrección: `f60b05b`.
- `npm ci`: completado correctamente.
- `npm run typecheck`: 0 errores.
- `npm run lint`: 0 errores; permanecen 71 warnings preexistentes fuera del alcance.
- `npm test`: 4 suites y 15 tests passed.
- `npm run test:coverage`: 92.5% statements, 80.64% branches, 100% functions, 92.3% lines.
- `npx expo-doctor`: 20/20 checks passed.
- `npx expo export --platform android --clear`: completado; bundle Hermes Android generado.
- Export web oficial de Expo Router: generó chunks para `welcome`, `demo-one`, `demo-two`, `login` y `register`, además del archivo de rutas.
- Los assets demo se mantienen en `src/data/demo` y no importan servicios Backend.

No se reprodujo un defecto de código que omitiera el demo. La evidencia anterior del APK no permitía distinguir entre un problema de navegación y una validación insuficiente del bundle Hermes.

## Deuda conocida

`CartProvider` permanece en el layout porque las pantallas buyer existentes usan `useCart`. El alcance demo no usa carrito; su eliminación queda para una tarea separada.

## Bloqueos y advertencias

- `BLOCKED_BY_BACKEND_EMAIL_RESEND`: no se muestra reenvío porque no existe contrato autorizado.
- `BLOCKED_BY_BACKEND_HTTPS`: Production permanece bloqueada mientras el Backend no tenga HTTPS.
- `EXPECTED_SIDELOAD_WARNING`: Play Protect puede advertir APKs instaladas fuera de Play Store.

No se almacenan contraseñas, JWT, tokens ni credenciales en esta evidencia.
