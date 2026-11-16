# Plan007 — Vendedor/productos

1. Registrar rutas y lagunas contractuales antes de implementar. Reutilizar sellerService/requestBody y única sesión005. No consumir JWT directamente desde UI/SecureStore.
2. Añadir capacidades acotadas de solicitud/consulta a AuthSession+AuthContext, preservando generación de sesión. Solo devolver status y error sanitizado, no cuerpos unknown. Guardas en grupo seller y perfil enlaza a seller. Consulta manual para no ejecutar requests por render/montaje.
3. UI027 para solicitud y UI030 para Mi negocio: formulario permitido, explicación teléfono/imagen no contratados, lectura real bloqueada por parser ausente, consulta HTTP posible. No enum Seller supuesto. Bloquear dup en cliente/coordinador; servidor debe idempotencia y rate-limit.
4. UI035/036 productos: estado integración pendiente, editor en memoria con preview explícito, sin mock de productos publicados. Sin image picker/API subida confirmada se prepara validador y controles upload deshabilitados; categorías no se inventan ni mezclan mocks. Publicación siempre deshabilitada.
5. Definir backend handoff para estado negocio, rol y productos/categorías/media/precios/publicación/retirada/paginación/ownership. Adaptador real futuro debe filtrar solo visibilidad pública sin reemplazar catálogo antes de verificar endpoint.
6. Pruebas activación/errores/duplicación/sesión tardía/guardas/validadores/SDK auth y catálogo previos. Registrar resultados y pendientes en tasks007/memoria/changelog y SDD005 si cambia superficie del coordinador; no marcar completo con mocks.

## Continuación P0
1. Sustituir bloqueo de respuesta Seller por parser del DTO Active confirmado. Activación201 y consulta200, roles exactos y fechas válidas. Revalidar identidad/perfil con mismoJWT tras operación; si siguen Buyer, indicar login nuevo, no elevar rol desde SellerDTO.
2. Servicio categorías paginado/validado, carga con cancelación y errores reales; fuente productiva AWS y mocks solo EXPO_PUBLIC_CATALOG_SOURCE=mock con __DEV__. No fallback. Reutilizar chips/rutas/estilos, sin taxonomía local para IDs reales.
3. Productos: servicio GET/list/detail unknown y builder exacto create/name/description/ingredients/categoryId/price/stock, PATCHprice/stock y Paused. Mutaciones bloqueadas antes de fetch por falta de parser respuesta; no crear recurso real que no sabemos confirmar. GET valida envelope y reconoce items vacío; no vacío muestra bloqueo de DTO, no lista ficticia. UI comprador usa estados reales de carga/error/vacío, detalle bloqueado honestamente hasta schema.
4. Formulario vendedor usa categorías AWS y campos confirmados, sin imagen. Mantener botóncreate/publicación deshabilitado hastaDTO. Registrar id de producto solo cuando haya respuesta validada (no inventado ahora).
5. Pruebas mocks explícitos en recorridos previos, nuevos casos para fuenteAWS,empty/categories/roles/refreshJWT/contratos incompletos/errores. Todos los checks y commitlocal seguro, sin push.
