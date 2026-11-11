# GATE-M-RELEASE

Estado de auditoría inicial:

- Package Android: `COMPLETADO`, `mx.edu.utt.uttgo`.
- AAB Production: `BLOCKED_BY_FIRST_EAS_BUILD`.
- Project ID EAS: configurado en `app.json`; pendiente validación con EAS CLI.
- `EXPO_TOKEN`: pendiente validar autenticación local/CI.
- Backend Production HTTPS: `BLOCKED_BY_BACKEND_HTTPS`.
- Política de privacidad: `PENDIENTE`, debe exponerse desde la aplicación mediante una spec funcional.
- Landing Netlify: `PENDING_LANDING_URL_DOCUMENTATION`.
- Carga a Google Play: `MANUAL_GOOGLE_PLAY_UPLOAD`.
- Demo invitado: `COMPLETADO` en código; requiere validación manual en Android.
- Icono y splash UTTT-GO: `COMPLETADO` en configuración y assets.
- Expo Doctor: `20/20` checks passed.
- EAS project info: `@utttgoo/uttgoo`, project ID `52014672-c800-4cf6-af6a-330cb13986e8`.
- `punycode`: `NON_BLOCKING_EAS_WARNING`; Node trace apunta a `whatwg-url` dentro de EAS CLI (`C:\Users\Valeria\AppData\Local\npm-cache\_npx\...`), no a código UTTT-GO.

Mientras exista Backend HTTP, ningún release Production se considera listo para Google Play.
