# Tasks007 — Vendedor/productos

Estado: EN PRUEBAS (implementación parcial explícita). Alta/consulta HTTP preparadas e integradas; aprobación/perfil remoto/publicación pendientes de contrato y validación física.
- [x] Auditoría: no pantallas vendedor en src/app, sellerService005 existente, solo roles Buyer confirmados.
- [x] Inspección UI027/028/030/035/036: no activación automática, phone/media no admitidos por contrato.
- [x] Intento OpenAPI GET HTTPS actual falló ECONNRESET; no requests privados ni altas automáticas.
- [x] Alta/consulta vía única sesión y sellerService005, cuerpos exactos, validación frontend/límites locales y prevención de duplicados/carreras; no JWT fuera del coordinador.
- [x] Perfil Quiero vender y rutas protegidas seller; statusHTTP y mensajes contractuales, no cuerpo unknown ni estados administrativos supuestos.
- [x] Productos/editor/preview en memoria, publicación/upload/categorías remotos deshabilitados y validadores locales de precio/imagen/categoría/disponibilidad. No CRUD remoto.
- [x]449/449pruebas/31suites (405anteriores+44nuevas), tsc0errores, lint0errores/30warnings previos, Doctor20/20 y diffcheck limpio. Sin regresiones automatizadas pendientes.
- [ ] Contratos JSON/enum de activación/me/sellerById/PATCH y roles/autorización.
- [ ] Productos/categorías/imágenes/publicación/ownership y catálogo real.
- [ ] Expo Go real: solicitud/consulta/edición autorizada y Crear→Consultar→Mostrar comprador. No COMPLETADO hasta evidencia.

Bundle Android root src/app con caché limpia: HTTP200/2477módulos, incluye rutas de seller/alta/draft; proceso8104 detenido al terminar. La primera comprobación textual de activación usaba literal acentuado y no coincidió con la representación escapada del bundle pese aHTTP200; se corrigió solo la comparación del diagnóstico, no código ni tests. Sin dispositivo ni solicitudes reales a sellerAPI, ninguna publicación real. Commit local seguro autorizado por usuario, sin push ni buildrelease; resultado/hash en entrega/historial.
