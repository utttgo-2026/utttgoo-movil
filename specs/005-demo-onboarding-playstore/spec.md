# Specification 005 - Demo invitado, onboarding y preparación Play Store

## Estado

**EN DESARROLLO**. Esta fase complementa `004-ci-cd` y no modifica el Backend.

## Objetivo

Entregar un demo móvil presentable para UTTT-GO, con identidad visual consistente,
flujo de invitado sin Backend y autenticación conectada únicamente a los contratos
autorizados.

## Alcance

- Splash y Welcome alineados con la referencia visual UTTT-GO.
- Demo invitado 1/2 y 2/2 con datos locales aislados en `src/data/demo`.
- Navegación demo hacia Login y Registro.
- Registro mediante `POST /api/v1/auth/register` y tratamiento de `202 Accepted`.
- Login mediante `POST /api/v1/auth/login`, incluyendo `401 INVALID_CREDENTIALS`.
- JWT almacenado con almacenamiento seguro, sin imprimir tokens.
- Confirmación de correo mediante enlace de Supabase, sin token, OTP ni endpoint inventado.
- Icono, adaptive icon, splash, nombre y package Android de producción.
- Pruebas deterministas y evidencia de validación EAS/Expo.

## Fuera de alcance

- Cambios en Backend, Supabase o endpoints no documentados.
- Carrito, favoritos, menús por horario u horarios configurables nuevos.
- Pagos distintos de efectivo.
- Despliegue automático a Google Play.
- Desactivación de Play Protect o permisos especiales.

## Contratos autorizados

- `POST /api/v1/auth/register` con `email`, `password` y `displayName`; éxito `202`.
- `POST /api/v1/auth/login`; errores globales con `correlationId`, `status`, `code` y `message`.
- No existe endpoint autorizado para verificar token ni reenviar correo.

## Criterios de aceptación

1. Un usuario puede recorrer Splash → Demo 1 → Demo 2 sin Backend.
2. Desde el demo puede llegar a Login o Registro.
3. Demo local y datos productivos viven en módulos separados.
4. Registro valida nombre, dominio `@utt.edu.mx`, contraseña y confirmación.
5. Registro exitoso muestra la pantalla de confirmación de enlace de correo.
6. La pantalla de confirmación no solicita ni simula tokens.
7. Login interpreta correctamente éxito y `INVALID_CREDENTIALS`.
8. El nombre visible es `UTTT-GO` y el package es `mx.edu.utt.uttgo`.
9. Preview conserva APK, Production conserva AAB y no contiene secretos.
10. Typecheck, lint, tests, coverage y Expo Doctor pasan, o los bloqueos externos quedan documentados.

## Flujo inicial definitivo

El Splash navega directamente a Demo 1. Welcome se conserva como pantalla de
compatibilidad para rutas existentes, pero no forma parte del arranque inicial.
