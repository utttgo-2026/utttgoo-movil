# GATE-M-RELEASE

Estado de auditoría inicial:

- Package Android: `COMPLETADO`, `mx.edu.utt.uttgo`.
- AAB Production: `READY_FOR_CLOSED_TEST_BUILD`, pendiente de ejecutar el release Production.
- Project ID EAS: configurado y usado por el proyecto `@utttgoo/uttgoo`.
- `EXPO_TOKEN`: validado en CI para el Preview y requerido por el release Production.
- Backend Production HTTPS: `RESOLVED`, verificado el 2026-11-12 mediante TLS válido, `GET /health` `200` y OpenAPI accesible.
- Política de privacidad: `PENDIENTE`, debe exponerse desde la aplicación mediante una spec funcional.
- Landing Netlify: `PENDING_LANDING_URL_DOCUMENTATION`.
- Carga a Google Play: `MANUAL_GOOGLE_PLAY_UPLOAD`.
- Demo invitado: `COMPLETADO` en código; requiere validación manual en Android.
- Icono y splash UTTT-GO: `COMPLETADO` en configuración y assets.
- Expo Doctor: `20/20` checks passed.
- EAS project info: `@utttgoo/uttgoo`, project ID `52014672-c800-4cf6-af6a-330cb13986e8`.
- `punycode`: `NON_BLOCKING_EAS_WARNING`; Node trace apunta a `whatwg-url` dentro de EAS CLI (`C:\Users\Valeria\AppData\Local\npm-cache\_npx\...`), no a código UTTT-GO.
- Preview físico: `PREVIEW_PHYSICAL_TEST_PASSED`; Build ID `5b4b0280-71e0-44f9-9a84-87b5062dd84a`; commit validado `6b407e8`.
- Production EAS environment: `3/3` nombres requeridos confirmados sin imprimir valores.
- Production gate: `PROD-EAS-001` a `PROD-EAS-008`; no se ejecuta `eas submit`.
- Destino inicial: Google Play Closed Testing mediante carga manual del AAB.

El release Production sigue siendo manual y requiere CI/Security verdes, ejecución del workflow y confirmación del AAB `FINISHED`.
