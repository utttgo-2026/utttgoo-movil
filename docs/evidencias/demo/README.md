# Evidencias Demo y Onboarding

## Flujo esperado

- Splash: identidad `UTTT-GO`, fondo blanco, tagline y universidad.
- Welcome: hero promocional y acciones de Login, Registro y demo invitado.
- Demo 1/2: alimentos locales de ejemplo, sin llamadas al Backend.
- Demo 2/2: comparación local Product/Offer con vendedores, precio, estado y rating.
- Login: contrato `POST /api/v1/auth/login`; `401 INVALID_CREDENTIALS` muestra error sin exponer tokens.
- Registro: contrato `POST /api/v1/auth/register`; `202 Accepted` lleva a confirmación de correo.
- Confirmación: enlace enviado por Supabase; no solicita token ni simula verificación.

## Bloqueos y advertencias

- `BLOCKED_BY_BACKEND_EMAIL_RESEND`: no se muestra reenvío porque no existe contrato autorizado.
- `BLOCKED_BY_BACKEND_HTTPS`: Production permanece bloqueada mientras el Backend no tenga HTTPS.
- `EXPECTED_SIDELOAD_WARNING`: Play Protect puede advertir APKs instaladas fuera de Play Store.

No se almacenan contraseñas, JWT, tokens ni credenciales en esta evidencia.
