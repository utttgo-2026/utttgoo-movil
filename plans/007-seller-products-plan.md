# Plan007 — Vendedor/productos

1. Registrar rutas y lagunas contractuales antes de implementar. Reutilizar sellerService/requestBody y única sesión005. No consumir JWT directamente desde UI/SecureStore.
2. Añadir capacidades acotadas de solicitud/consulta a AuthSession+AuthContext, preservando generación de sesión. Solo devolver status y error sanitizado, no cuerpos unknown. Guardas en grupo seller y perfil enlaza a seller. Consulta manual para no ejecutar requests por render/montaje.
3. UI027 para solicitud y UI030 para Mi negocio: formulario permitido, explicación teléfono/imagen no contratados, lectura real bloqueada por parser ausente, consulta HTTP posible. No enum Seller supuesto. Bloquear dup en cliente/coordinador; servidor debe idempotencia y rate-limit.
4. UI035/036 productos: estado integración pendiente, editor en memoria con preview explícito, sin mock de productos publicados. Sin image picker/API subida confirmada se prepara validador y controles upload deshabilitados; categorías no se inventan ni mezclan mocks. Publicación siempre deshabilitada.
5. Definir backend handoff para estado negocio, rol y productos/categorías/media/precios/publicación/retirada/paginación/ownership. Adaptador real futuro debe filtrar solo visibilidad pública sin reemplazar catálogo antes de verificar endpoint.
6. Pruebas activación/errores/duplicación/sesión tardía/guardas/validadores/SDK auth y catálogo previos. Registrar resultados y pendientes en tasks007/memoria/changelog y SDD005 si cambia superficie del coordinador; no marcar completo con mocks.
