# Entornos

| Entorno | Configuración | Estado |
|---|---|---|
| development | `EXPO_PUBLIC_APP_ENV=development`; `EXPO_PUBLIC_API_BASE_URL=https://3.129.142.54.nip.io` | Disponible para pruebas controladas |
| preview | EAS environment `preview`: API HTTPS y configuración pública Supabase | `PREVIEW_BUILD_READY_FOR_PHYSICAL_TEST` |
| production | `EXPO_PUBLIC_APP_ENV=production`; `EXPO_PUBLIC_API_BASE_URL=https://3.129.142.54.nip.io` | HTTPS verificado; release manual pendiente |

La base pública verificada es `https://3.129.142.54.nip.io`; el documento OpenAPI vive en `/openapi/v1.json` y no se usa como base. Production rechaza cualquier origen que no use HTTPS. No se habilita `usesCleartextTraffic`.

Los endpoints actualmente autorizados por contrato son `GET /health`, autenticación, perfil, vendedor individual y administración de usuarios. Catálogo, ofertas, órdenes, chat, notificaciones, QR, reviews y categorías adicionales permanecen `BLOCKED_BY_BACKEND`.

Cuando se conecte autenticación real, los JWT deberán almacenarse en almacenamiento seguro compatible con Expo, no en AsyncStorage. La implementación actual continúa siendo mock y no maneja JWT.

## EAS Preview

Preview requiere estas variables públicas de runtime:

- `EXPO_PUBLIC_API_BASE_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

El workflow valida únicamente la presencia de sus nombres antes de iniciar EAS Build. No imprime valores ni guarda el ambiente como artifact. `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, claves secretas, contraseñas SMTP y contraseñas Gmail están prohibidos en el cliente móvil. Production se configura de forma independiente.

El APK Preview anterior `2abb8a71-9b68-46f0-a3ea-f2e98b27f4fe` es evidencia técnica de EAS, pero no candidato funcional final por haber sido generado con el ambiente vacío. El nuevo build EAS `5b4b0280-71e0-44f9-9a84-87b5062dd84a` fue generado con el gate Preview aprobado y queda listo para prueba física.

La rotación/revocación de cualquier Supabase JWT signing secret expuesto corresponde al equipo Backend/Supabase según la estrategia activa de signing keys.
