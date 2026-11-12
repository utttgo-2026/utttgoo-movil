# Entornos

| Entorno | Configuración | Estado |
|---|---|---|
| development | `EXPO_PUBLIC_APP_ENV=development`; `EXPO_PUBLIC_API_BASE_URL=https://3.129.142.54.nip.io` | Disponible para pruebas controladas |
| preview | Configuración de GitHub/EAS y variables del entorno | `BLOCKED_BY_EXPO_LINK`, `BLOCKED_BY_EXPO_TOKEN` |
| production | `EXPO_PUBLIC_APP_ENV=production`; `EXPO_PUBLIC_API_BASE_URL=https://3.129.142.54.nip.io` | HTTPS verificado; release manual pendiente |

La base pública verificada es `https://3.129.142.54.nip.io`; el documento OpenAPI vive en `/openapi/v1.json` y no se usa como base. Production rechaza cualquier origen que no use HTTPS. No se habilita `usesCleartextTraffic`.

Los endpoints actualmente autorizados por contrato son `GET /health`, autenticación, perfil, vendedor individual y administración de usuarios. Catálogo, ofertas, órdenes, chat, notificaciones, QR, reviews y categorías adicionales permanecen `BLOCKED_BY_BACKEND`.

Cuando se conecte autenticación real, los JWT deberán almacenarse en almacenamiento seguro compatible con Expo, no en AsyncStorage. La implementación actual continúa siendo mock y no maneja JWT.
