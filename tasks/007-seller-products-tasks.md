# Tasks007 — Vendedor/productos

## Integración V1.2 en `eas-google-play` — EN PRUEBAS
- [x] Integrar rutas Seller, activación protegida, contratos de categorías/productos/pedidos y validación de ownership.
- [x] Integrar catálogo AWS y pedido directo con efectivo; source mock limitado a `__DEV__` y configuración explícita.
- [x] Preservar OTP, SecureStore, sesión única, CI/CD y EAS de `eas-google-play`.
- [x] Documentar límites: `QR_VISUAL_ONLY`, S3/fotografías, historial/seguimiento, notificaciones, dashboard y listado Seller privado.
- [ ] Validar físicamente en Expo Go el recorrido completo y confirmar persistencia backend.
- [x] Generar Production AAB `1.2.0` (versionCode `3`); queda pendiente la carga manual en Google Play Closed Testing.

## Hotfix runSeller — EN PRUEBAS
- [x] Localizar expresión176: sellerSubmissionState() dentro de catch; métodoexiste en claseactual/factory, instanciaretenida poruseState no se recrea al renderizar.
- [x] Reproducción roja: instancia sin sellerSubmissionState rechaza con TypeError del mismo método en catch; trasfix resuelvefailure. RetenciónuseState comprobada, remount usa factoryactual y restaurausuario; no se inspeccionó memoria del teléfono.
- [x] Contrato obligatorio runtime y snapshotbooleano antes/después de operación; catchaislado conservaHTTP y bloqueareenvío incierto, sin optional chaining de métodos ni roles/éxitos ficticios.
- [x]640/640tests/40suites (+15), TypeScript0errores, lint0errores/27warnings previos, Doctor20/20,diffchecklimpio. BundleAndroid200/14,066,037bytes, Metrodetenido. Regresiónfactoryreal/AuthContext/restauración/Active y reintentoUI incluidos, sin solicitudesAWS ni datosrealescreados.
- [x] Usuario confirma prueba física del hotfix enExpoGo tras recargacompleta: validaciónseller funciona sin excepción. Alcance declarado por usuario; no acredita todo el circuito comercial ni completa007. Autoriza subir cambios acumulados a nueva ramaV1.2.

## Bloque 1 actual — EN PRUEBAS
- [x] Reinspección pública sin mutaciones: camposalta originales, responseproducto completo, total; categorías3/productos1 y created_desc400.
- [x] Lookup automático missingexacto/active/error, GETcoalescido y formulario reutilizado.
- [x] Activación200/201→GETActive→roles revalidados; duplicados y resultadosobsoletos protegidos. Editores también exigen rolactual delContext, no solo consulta previa.
- [x] DTO completo y nulabilidad, solo total, placeholderlocal/isAvailable, catálogo al foco y sortincompatible bloqueado.
- [x] Checkpoint inicialBloque1:622/622tests/40suites, tsc0, ESLint0errores/30warnings, Doctor20/20 y diffchecklimpio. FinalconB3acotado/hardening:625/625, tsc0, lint0errores/27warnings, Doctor20/20, diffchecklimpio; bundleAndroid200/14,063,236bytes, Metrodetenido. Memoria/changelog/manual actualizados.
- [ ] ExpoGo real y commit segúnAGENTS. Bloque2auditoría estática22PNG realizada; B3soloefectivo/QRvisual/avisoshonestos. Historia/detalle/dashboard/tabsSeller siguen unidades pendientes, no completados por este bloque.

## P0 PR #24 — EN PRUEBAS
- [x] Verificar despliegue solo GET: OpenAPI con status/notes/imageUrl, healthHealthy, categorías3, productosvacíos/total0. Sorts confirmados created_desc/price_asc retornan400; activación OpenAPI200 vs contrato201.
- [x] Integrar status Active/Paused con permisos y controles vendedor, producto sin imagen y diagnóstico422.
- [x] Integrar notas≤250 y adaptadores de respuestas documentadas; mantener protección de sesión y pedido simple.
- [x] Checks y SDD/memoria:562/562tests/36suites, tsc0, ESLint0errores/30warnings previos, Doctor20/20, diffchecklimpio; bundleAndroid200/14,026,589bytes, Metrodetenido.
- [ ] Commit local solicitado; usuario confirmó «Prueba manual pendiente» tras los checks. Falta evidenciaExpoGo exigida porAGENTS antes de crearlo; sin commit ni push.
- [ ] ExpoGo físico autorizado y persistencia backend. No marcar etapa COMPLETADA.

Los4sorts confirmados devuelven400 en despliegue; default/search/categoryId/maxPrice200/vacío. Se implementan valoresconfirmados con errorhonesto; carga inicial sin sortBy. No mutaciones automáticas ni prueba real de reactivación/alta/pedido. El bloqueo histórico availability fue resuelto por status confirmado y OpenAPI; lectura de schemas no acredita operaciones privadas.

## Iteración DTO productos (EN PRUEBAS)
- [x] Parsers producto/totalCount/sort y create201/PATCH200 con whitelist; availability contradictoria bloqueada.
- [x] Sesión Seller+Active, ownership, exclusión mutua y cancelación; IDs reales de esta sesión.
- [x] Crear/consultar/editar precio-stock, catálogo paginado y detalle AWS; pedidos simples según003.
- [x] Tests/checks y documentación de resultados:526/526pruebas/35suites, tsc0errores, lint0errores/30warnings previos, Doctor20/20, diffcheck limpio. BundleAndroidHTTP200 con src/app y servicios producto/orden presentes, Metro detenido.
- [ ] Expo Go autorizado: Seller activo→crear→consultar→catálogo/detalle→pedido. No marcar etapa COMPLETADA sin evidencia.
- [ ] Commit local tras evidencia manual exigida por AGENTS. Trabajo en working tree, sin push; no acreditar persistencia real por fixtures.

Estado vigente: EN PRUEBAS. Ver iteración DTO al inicio; bloqueos DTOproducto/roles de las listas históricas siguientes ya fueron sustituidos. Disponibilidad de escritura y validación física siguen pendientes.
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
