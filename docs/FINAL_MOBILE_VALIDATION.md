# Validación móvil final

## Baseline

- Rama de trabajo: `feature/final-mobile-validation`.
- Base: `origin/main` en `d40b8af`.
- TypeScript: 0 errores.
- Tests: 72 suites, 923 tests aprobados.
- Lint: 0 errores, 22 warnings preexistentes.
- Expo Doctor: 20/20.
- `expo install --check`: al día.
- `git diff --check`: limpio antes de los cambios de esta rama.

## Device tokens

Contrato desplegado consultado en OpenAPI:

- `POST /api/v1/notifications/device-tokens`.
- Request: `token`, `installationId`, `platform`, `appVersion`; los cuatro campos son requeridos por schema y nullable.
- Response `200` o `201`: `deviceTokenId`, `installationId`, `platform`, `active`, `updatedAt`.
- `DELETE /api/v1/notifications/device-tokens/{deviceTokenId}`.
- Response de baja: `204`.
- Errores documentados: registro `400/401/403/429/503`; baja `401/403/404/429/503`.
- No hay `Idempotency-Key` documentado para estos endpoints.

El móvil obtiene el Expo Push Token únicamente con sesión autenticada, registra listeners después de obtenerlo y trata el registro backend como no bloqueante. El token no se persiste ni se escribe en logs. El identificador devuelto por backend se conserva solo en memoria para poder desregistrarlo durante logout. Un fallo de registro no impide el login ni la navegación.

## E2E auth

1. Registro: `POST /api/v1/auth/register`; comprobar pantalla de verificación y acuse sin sesión.
2. OTP enviado: verificar recepción real, sin copiar códigos a logs o reportes.
3. OTP verificado: comprobar confirmación visual sin auto-login.
4. Activación: iniciar login explícito y confirmar `Active` mediante login, `/auth/me` y `/users/me`.
5. Login: comprobar entrada privada y registro del device token sin bloquear el flujo.
6. Restauración: cerrar y abrir la app; comprobar SecureStore, perfil y acceso privado.
7. Logout: comprobar baja del device token cuando exista y limpieza local aunque la API falle.

Evidencia requerida por etapa: pantalla, hora, status HTTP sanitizado y resultado visual. Nunca incluir JWT, contraseña, OTP, token Expo o cuerpos privados.

## E2E seller

1. Activar vendedor y comprobar `POST /api/v1/sellers/activation-requests` seguido de `GET /api/v1/sellers/me`.
2. Crear producto con `POST /api/v1/products` y guardar únicamente el ID sanitizado.
3. Consultar `GET /api/v1/sellers/me/products` y comprobar persistencia tras refresco.
4. Editar con `PATCH /api/v1/products/{productId}` y comprobar respuesta/ownership.
5. Pausar y reactivar con `PATCH /api/v1/products/{productId}/availability`.
6. Intentar consultar o mutar un recurso ajeno y comprobar rechazo del backend.

No usar fixtures para marcar una operación como aprobada.

## E2E orders y QR

1. Buyer: crear pedido con `POST /api/v1/orders` e `Idempotency-Key`.
2. Buyer: consultar `/orders/mine`, detalle, cancelación y review.
3. Seller: consultar `/sellers/me/orders`, detalle y transiciones de estado.
4. Buyer: cuando el estado sea `Ready`, solicitar `/orders/{orderId}/delivery-token`.
5. Seller: escanear el QR y confirmar con `/orders/{orderId}/delivery-confirmations`.
6. Comprobar GET posterior, `Delivered`, expiración, no repetición y desaparición de acciones.

## Media: bloqueo contractual

El OpenAPI desplegado publica ambos endpoints:

- `POST /api/v1/media/confirm`.
- `POST /api/v1/media/{mediaAssetId}/complete`.

La documentación vigente y el cliente actual usan exclusivamente `confirm` con `{ mediaAssetId }`. La existencia simultánea en OpenAPI no demuestra cuál flujo está operativo con autenticación, S3 y moderación. `complete` no se integrará ni se usará como fallback hasta obtener una respuesta real autorizada o una confirmación backend inequívoca.

## Notificaciones fuera de alcance contractual

No se encontraron contratos para historial de notificaciones, unread count ni mark-as-read. Esos módulos permanecen `BLOCKED_BY_BACKEND` y no deben implementarse con endpoints supuestos.

## QA físico

- Expo Go/device build autorizado y versión registrada.
- Anchos pequeño y grande.
- Font scale normal, 1.3, 1.6 y 2.
- Teclado y foco en búsqueda/formularios.
- Scroll hasta el último elemento.
- Android back y gesto.
- Safe area, loading, empty, error, offline y reconexión.
- Permisos de cámara y scanner QR.
- No usar Expo Go como prueba de push remoto Android; requiere development build y backend.
