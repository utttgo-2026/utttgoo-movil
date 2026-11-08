# Entornos

| Entorno | Configuración | Estado |
|---|---|---|
| development | `EXPO_PUBLIC_APP_ENV=development`; URL proporcionada externamente | Disponible para pruebas controladas |
| preview | Configuración de GitHub/EAS y variables del entorno | `BLOCKED_BY_EXPO_LINK`, `BLOCKED_BY_EXPO_TOKEN` |
| production | `EXPO_PUBLIC_APP_ENV=production`; requiere URL HTTPS | `BLOCKED_BY_BACKEND_HTTPS` |

La URL HTTP temporal del Backend no se almacena en el repositorio. Production rechaza cualquier origen que no use HTTPS. No se habilita `usesCleartextTraffic`.

Los endpoints actualmente autorizados por contrato son `GET /health`, autenticación, perfil, vendedor individual y administración de usuarios. Catálogo, ofertas, órdenes, chat, notificaciones, QR, reviews y categorías adicionales permanecen `BLOCKED_BY_BACKEND`.

Cuando se conecte autenticación real, los JWT deberán almacenarse en almacenamiento seguro compatible con Expo, no en AsyncStorage. La implementación actual continúa siendo mock y no maneja JWT.
