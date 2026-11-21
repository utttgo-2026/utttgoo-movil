# Tasks007 — Vendedor/productos

## Media revisión despliegue — EN CURSO
- [x] GET OpenAPI y catálogo (seis productos): ProductResponse sin imageUrl y ninguno de los seis la contiene. HEAD público 0e95070: POST rechaza URL y PATCH no admite media; confirm no comprueba propiedad/archivo. No se conoce el SHA EC2.
- [x] Foto seleccionada visible también en vista previa local con etiqueta de no subida; pruebas sintéticas, sin mutaciones AWS.
- [x] TypeScript limpio, Jest 702/702, lint 0 errores/27 advertencias, Doctor19/20, diff check limpio y bundle Android HTTP200 (Hermes/compiler).
- [ ] Confirmar SHA EC2 y corregir ownership/registro de asset, confirmación de objeto y asociación POST/PATCH antes de conectar S3. ProductResponse y GET público aún no entregan imageUrl.

## Mis alimentos AWS — EN CURSO
- [x] OpenAPI actual: GET público sin sellerId ni listado privado; PATCH JsonElement; no DELETE; ProductResponse sin imageUrl. Código público 0e95070 permite name/description/ingredients/price/stock en PATCH pero SHA desplegado no confirmado y CreateProductService aún rechaza imagen.
- [x] Consulta pública paginada desde AuthSession tras Seller Active; filtra sellerId y rechaza páginas inconsistentes, conserva productos conocidos de sesión. UI con búsqueda parcial, pull-to-refresh, reintento y confirmación de pausa; PATCH solo precio/stock modificados.
- [x] TypeScript limpio, Jest 702/702 (47 suites), lint 0 errores/27 advertencias, Doctor 19/20 y diff --check sin errores; Metro Android HTTP200 Hermes/compiler, proceso propio detenido.
- [ ] Validar Expo Go y backend privado: listado propio completo/pausados, PATCH nombre/descripción/ingredientes en despliegue, DELETE e imágenes no están confirmados. No se realizaron mutaciones reales.

## Adaptador S3 aislado — EN CURSO
- [x] Dependencias expo-file-system 58.0.14/expo-image-picker 58.0.10 instaladas; HEAD backend 281c19f mantiene rechazo ImageUrl; OpenAPI no accesible en consulta actual.
- [x] Adaptador aislado presigned/PUT/confirm con hosts exactos, binario, redirect error y reintento explícito del mismo asset; tests sintéticos sin red ni mutaciones reales.
- [x] TypeScript limpio, 700/700 pruebas, lint 0 errores/27 avisos, Doctor19/20, diff check limpio; bundle Android HTTP200, Hermes y React Compiler, Metro propio detenido.
- [ ] Integrar adaptador a sesión/UI y añadir estados/reintentos con política de errores tras validar backend desplegado. El adaptador aislado solo permite reintento explícito y no aplica backoff automático; sin prueba física S3.

## Fotografía local — EN CURSO
- [x] Instalar expo-image-picker ~58.0.10 y expo-file-system ~58.0.14; selector cámara/galería, bytes/tamaño/dimensiones, vista previa/eliminación; publicación con foto bloqueada y sin foto envía null.
- [x] TypeScript limpio, 696/696 pruebas en 46 suites, lint 0 errores/27 advertencias, Expo Doctor 19/20 y diff --check sin errores. Pruebas con picker/archivos simulados, sin subida real.
- [ ] Validar en Expo Go: permisos, cámara/galería y lectura nativa. Preparación S3 limitada a mediaContracts aislado: faltan cliente presigned, PUT binario y confirm; siguen bloqueados SHA EC2, hosts, propiedad/asociación y ProductResponse.

## Creación continua — seguimiento físico
- [x] La confirmación sustituye temporalmente el formulario en la misma pantalla, dejando visibles Crear otro alimento y Ver mis alimentos; crear otro restablece campos y categoría. Sin confirmación física todavía.
- [ ] Mis alimentos sigue limitado a productos conocidos en sesión y consulta por ID; no hay listado privado completo verificado. Un producto idéntico confirmado conserva protección por cuerpo en esta sesión.

## Media API017/018 — BLOQUEADO
- [x] Nueva comprobación GET: OpenAPI no incluye `imageUrl` en ProductResponse y los cuatro productos devueltos tampoco; el HEAD público sigue en b79fa80. Sin identificación de SHA desplegado ni hosts autorizados.
- [x] Parsers aislados presigned/confirm: HTTPS con allowlist explícita, expiración, assetId coincidente y Ready; pruebas sintéticas. No están conectados a red o pantalla. TypeScript limpio, 684/684 pruebas, lint 0 errores/27 avisos, Doctor 19/20 y diff --check sin errores.
- [x] OpenAPI desplegado confirma nombres de DTO media y ProductResponse sin imageUrl; GET público sin mutaciones.
- [x] Backend público PR28 `b79fa80` inspeccionado: CreateProductService rechaza ImageUrl no vacío; SignedUrlService genera ID sin registrar asset, MediaAssetService no comprueba dueño ni objeto y repositorio es InMemory por scope; S3 tiene fallback URL mock si no está configurado. No se ha probado que ese SHA sea el desplegado.
- [ ] Backend debe confirmar SHA, autorización y ownership, persistencia por asset, comprobación del objeto y contenido, orígenes S3 autorizados y aceptación/publicación de imagen. No habilitar flujos S3 ni crear recursos reales hasta verificar.

## Creación consecutiva — EN CURSO
- [x] Referencia UI-036 inspeccionada; bloqueo causado por `published` sin acción de reinicio. Fuente backend limita nombre 1–120, descripción 1–500, ingredientes ≤20 de 1–60, precio hasta 1,000,000 y stock 0–1,000,000. OpenAPI no expresa estos límites.
- [x] Confirmación en línea y reinicio explícito; datos conservados ante fallo, validación por campo, navegación a productos de sesión y pruebas sintéticas.
- [x] TypeScript limpio, Jest 681/681 (44 suites), lint 0 errores/27 advertencias, diff --check sin errores. Expo Doctor 19/20 por cinco versiones recomendadas distintas.
- [ ] Validar físicamente en Expo Go y contrastar UX/Figma. El validador existente del servicio limita nombre 2–100, descripción mínimo 2 y precio máximo 999999.99, más restrictivos que backend; no se alteró el servicio AWS.

## Migración PR27 — EN CURSO
- [x] Reinspección fuente 6932990: listado usa ListForBuyerAsync y role buyer; cancelación solo buyer Pending; confirmación delivery seller propietario y Ready. OpenAPI no confirma listado seller y sin JWT autorizado no se ha comprobado el despliegue privado.
- [x] Parsers aislados PR27 para respuesta completa y resumen paginado, pruebas con DTO sintéticos de ambos roles y rechazo de campos inválidos. TypeScript limpio y 658/658 pruebas; todavía no conectados a la aplicación.
- [x] OpenAPI y GET públicos confirman `storeName`/`phone`, perfil propio y paginación `totalCount`; backend commit 6932990 confirma efectivo `Cash` y estados de pedido.
- [x] Código backend `ListOwnOrdersService`: `/orders/mine` lista solo comprador (`role: buyer`), no pedidos recibidos del vendedor. `CreateDeliveryTokenService`: solo comprador y estado `Ready`.
- [x] Fixtures vendedor/catálogo migrados; TypeScript 0 errores y Jest 650/650, 41 suites. El primer intento había fallado por fixtures anteriores.
- [ ] Fixtures y adaptador de pedidos siguen siendo legacy; las pruebas verdes no acreditan compatibilidad POST PR27. No probar compras hasta migrarlos.
- [ ] Expo Doctor 19/20: expo, expo-router, @expo/ui, jest-expo y expo-web-browser desalineados con las versiones recomendadas actualmente. No se han actualizado dependencias.
- [ ] El inspector Metro de la sesión actual no pudo iniciarse (TypeError en el helper); no acredita bundle ni source map del teléfono.
- [ ] Migrar vendedor y paginación, órdenes y pantallas; verificar contratos y regresiones sin mutaciones reales.
- [ ] Investigar TypeError físico con evidencia del dispositivo; prueba Expo Go y autorización antes de cualquier commit.

## Reapertura188 — EN PRUEBAS / causa física abierta
- [x] Registrar188exacto deHEADc606435: if/return sin llamadas; fuenteúnica delMetro8081 coincide conGit inicialmente, rootcorrecto/SDK58. No identificarfunciónundefined por inercia desde176.
- [x] Inspeccionar perfilreal delmanifiesto (Hermes/ReactCompiler/hermes-stable) y ejecutarmódulos realesMetro enVMNode con red/storage/bridge sintéticos. Missing→alta→GETActive→roles→consulta funcionan; no se reprodujo el TypeErrorfísico ni se conocióversión delcliente.
- [x] ProbesDEV seguros temporales añadidos/retirados. Usuario no puede probarahora;0targetsinspectoreninspeccióninicial. No logs deobjetos/credenciales ni datosrealAWS.
- [x] Rojo→verde: BabelReactRefresh preservabaestado viejo; @refreshreset fuerza descartarlo. ConsultaREALdespuésdeunmount devolvíasuccess; ahora cancelada. Lifecycle invalida generación/revisión sin clearJWT,401tardío no borra sesiónnueva.
- [x] POSTincierto→GETde reconciliación una vez; Active/roles confirmanGET200/reconciledtrue, missing/error conservauncertain. No POSTautomático ni fake201. Cleanup lookup con thenambosresultados conserva errororiginal.
- [x]649/649tests/41suites (+9), TypeScript0errores, ESLint0errores/27warnings previos, Doctor20/20 y diffchecklimpio. BundleAndroid200/12,938,102bytes con perfil delmanifiesto/graphcompleto yMetro8106detenido;8081delusuario no se detiene. Solo códigoJScompilado, no Hermesfísico.
- [ ] Identificar funciónundefined/capturarcodeframe real188 en el teléfono y crear reproducción de ESAexcepción: no se afirma conseguida. Nueva prueba física de ambosrecorridos antes decierre. Sincommit/push.

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
