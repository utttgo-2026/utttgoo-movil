# Tasks007 — Vendedor/productos

Estado: EN PRUEBAS (P0 parcial). Contratos nuevos SellerActive/categorías ya implementados; bloqueos anteriores deSeller son históricos. DTOproducto/publicación y validación física pendientes, ver continuaciónP0 final.
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

## P0 contratos confirmados — continuación
- [x] OpenAPI nuevo accesible, rutas productos/categorías/pedidos publicadas; productos sin DTO respuesta. GETcategories/products públicos vacíos observados sin mutaciones.
- [x] Aclaración usuario: avanzar contratos completos, no publicación dependiente de schemas incompletos.
- [x] SellerActiveDTO/roles Buyer+Seller, activación201/consulta200 y revalidación authme/usersme con mismoJWT. Si permisos no se actualizan, login explícito, sin token ficticio.
- [x] Categorías AWS paginadas y sin fallbackmock productivo; todos los consumidores de categorías por defecto usanAPI, mocks solo fuenteexplícita dev.
- [x] Requests productos exactos, capaGET envelopevacío y UI honesta con DTO faltante; mutaciones bloqueadas antes defetch. Formulario con ingredientes/categoríaAWS/precio/stock, sinMedia.
- [x]491/491pruebas/33suites, tsc0errores, lint0errores/30warnings, Doctor20/20, diffcheck limpio. Expectativas históricas actualizadas al contrato201/Active, sin suites eliminadas/omitidas. Commitlocal seguro solicitado, resultado/hash en historial/entrega; sin push.
- [ ] DTOproducto/listado/detalle/create/PATCH/availability, enums y whitelist completa para terminar publicación real.

FuenteAWS es default incluso en ExpoGo; para revisar maquetas previas usar EXPO_PUBLIC_CATALOG_SOURCE=mock con __DEV__, nunca en producción. Pruebas navegación/medios anteriores declaran esa fixture explícita. Vacío actual AWS no es error ni falta de categorías demo: backend debe seedear. Paginación de itemsproductos, fotos, pedidos y sellerId siguen pendientes según alcance aclarado.
BundleAndroidHTTP200/2483módulos, rutas/servicios Seller/categorías/productos/sourcegate presentes, proceso8105 detenido. No render físico ni mutación en AWS. Commitlocal solicitado solo para trabajo seguro; pruebas físicas Crear→Consultar→Mostrar no realizadas ni posibles con DTO faltante.
