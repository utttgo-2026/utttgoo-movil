# Tasks007 — Vendedor/productos

## Pedidos: acceso reportado y recuperación de conflictos
- [x] OpenAPI comprobado; GET de bandeja con/sin Pending responde 401 sin sesión. El usuario no encuentra la bandeja; no hay evidencia de un PATCH físico.
- [x] Acceso Seller directo, filtros paginados, recuperación GET de 409 y trazas seguras. Aplicación de detalle verificado por GET y descarte de lecturas de versión menor.
- [x] TypeScript limpio, Jest 882/882 en 64 suites, lint 0 errores/21 avisos previos, Expo Doctor 20/20, diff check limpio y bundle Android HTTP 200 (13,305,304 bytes, Hermes/React Compiler).
- [ ] Prueba física con dos cuentas autorizadas y pedido existente. No se realizaron mutaciones ni lecturas privadas automatizadas en AWS.

## Pedidos recibidos y QR real — EN PRUEBAS
- [x] Contratos del OpenAPI vivo y fuente8d48ae9 verificados, originales UI038/039 inspeccionados; no se encontró original independiente del escáner en el inventario consultado.
- [x] Bandeja/detalle Seller conectados al coordinador existente, propiedad por sellerId, paginación/refresco, estado con versión y GET posterior. Enlace desde Mi negocio y rutas reales declaradas por archivos, sin duplicación de stacks.
- [x] Cámara Expo Go con permiso explícito, lectura token43 validado y confirmación oficial; Delivered solo con respuesta válida y lectura posterior. Caducidad/foreground/estado y hashes efímeros contra reuso, sin credenciales en logs ni pagos simulados.
- [x] TypeScript limpio, Jest868/868 en63suites, lint0errores/21avisos restantes, Doctor20/20, diff check limpio y bundleAndroid200/13,296,432bytes Hermes/ReactCompiler; Metro propio detenido. Ver tasks003 y docs/PEDIDOS_REALES_EXPO_GO.md.
- [ ] Prueba física con dos cuentas/dispositivos: bandejas, cámara, caducidad, entrega y comparación visual. No pedidos reales automáticos ni commit/push.

## UX pública de fotografías — EN PRUEBAS
- [x] Usuario confirma integración real funcionando. Auditadas UI de creación/vista previa/listado/editor/catálogo/detalle y guardas; inspeccionados originales Figma UI-035/036/037, UI-006 y UI-013.
- [x] Retirados marcadores/gates visibles, infraestructura, estados wire, recibos con ID/status y búsqueda manual por ID. Edición desde tarjeta; alcance parcial del listado informado sin lenguaje técnico.
- [x] Estados breves con indicador, Fotografía lista solo con Approved/ID válido, revisión pendiente y errores comprensibles con cambiar/quitar/consultar/reintentar. Publicando alimento y éxito confirmado, Crear otro/Ver mis alimentos conservados.
- [x] Errores traducidos en presentación; diagnósticos sanitizados internos conservados. Transportes/contratos/gates/4,000,000 bytes/MIME/firma/Seller/duplicados/expiración y renovación sin cambios funcionales.
- [x] TypeScript limpio, Jest792/792 en60suites, lint0errores/27avisos existentes y diff check sin errores. Bundle AndroidHTTP200/13,182,408bytes con Hermes/ReactCompiler, Metro propio detenido. Pruebas de textos públicos, no exposición técnica, recuperación, imágenes reales, renovación, publicación sin foto y reinicio aprobadas.
- [ ] Expo Doctor ejecutado: primer resultado19/20 por servicio React Native Directory; repetición18/20 por Directory y timeout exp.host al validar esquema. Repetir cuando respondan esos servicios externos; no se modificaron dependencias ni se deshabilitaron checks para ocultarlo.
- [ ] Inspección visual física del pulido en Expo Go, incluyendo ancho pequeño y fuente grande. No marcar aceptación visual completa solo por Jest/bundle. Sin commit/push.

## Diagnóstico catalog-v2 y corrección backend reportada — EN PRUEBAS
- [x] Confirmación backend registrada: bug de promoción corregido en producción, POST/GET comprobados por su equipo y asset Approved reutilizable condicionado a verificar el intento original. No implica ausencia de ese producto ni prueba del SHA EC2.
- [x] Diagnóstico común con source/pantalla, versión catalog-v2, URL/query segura y marca de redacción. Message estático y details estructurados permitidos; clasificación de validación local/HTTP400, servicio5xx, transporte y contrato. Pruebas de URL, correlación y exclusión de datos privados.
- [x] TypeScript limpio, Jest781/781 en59suites, lint0errores/27avisos existentes y Expo Doctor20/20.
- [x] Bundle Android HTTP200/13,177,135bytes con perfil del manifiesto Hermes/ReactCompiler; Metro propio detenido. git diff --check sin errores (avisos de normalización LF/CRLF).
- [ ] Backend debe verificar el primer POST por sellerId autenticado, mediaAssetId y hora/correlación; entregar productId o ausencia verificada antes de autorizar otro POST. Bloqueo y Approved conservados en memoria; sin bypass, resubidas ni mutaciones reales automáticas.
- [ ] Publicación/lectura de imagen en Expo Go pendientes. El usuario sí alcanzó Approved físicamente; las entradas anteriores de primera prueba pendiente son históricas.

## Catalog tras foto Approved — EN CURSO
- [x] GET sin params y size20=200; size100=400 y50=200. Mis alimentos enviaba100; corregido50 y límite cliente. Orden snake price_asc=400; wirecamel priceAsc/priceDesc/nameAsc/createdAtDesc=200, serialización corregida y filtros UI conservados.
- [x] CorrelationId .NET omitido por regex anterior; captura segura de cuerpo/headers, hora UTC, query/DTO sanitizado y nombres de campos rechazados si aparecen.
- [x] POST503 se conserva HTTP503 y marca resultado incierto; formulario y Approved no se limpian, botón bloqueado y consulta disponible sin otro POST. No se afirma persistencia ni ausencia del producto original.
- [x] Checks finales: TypeScript limpio, Jest778/778 en58suites, ESLint0errores/27avisos existentes, Expo Doctor20/20 y diff check limpio. Bundle AndroidHTTP200/13,172,165bytes con Hermes/ReactCompiler; Metro propio detenido. Regresiones de wirequery,503preservado,correlación yformulario incierto aprobadas.
- [ ] Backend debe verificar el primer POST en DB/logs antes de otra creación. Source público e5dab7e tiene pasos antes/después de persistencia y promoción S3, no prueba la excepción ni SHA EC2 del caso físico. No se ejecutaron POST/PUT/PATCH reales ni se limpiaron incertidumbres.

## Mensaje de publicación bloqueada — EN PRUEBAS
- [x] Localizado ProductPhotoPanel:15; condición !demo && !PRODUCT_MEDIA_REAL_ENABLED. Booleano capturado en productMedia.ts:2. Expo local carga controlled y demo vacío; no atribuir valores al bundle del teléfono sin evidencia.
- [x] Retirado snapshot; getter común en UI/hook/cliente y mensajes por estado. Diagnóstico media-gate-v2 solo con clasificaciones públicas, sin entorno ni valores desconocidos.
- [x] TypeScript limpio, Jest770/770 en57suites, lint0errores/27avisos existentes, Expo Doctor20/20 y diff check limpio. Bundle AndroidHTTP200/13,166,058bytes Hermes/ReactCompiler, Metro propio detenido. Pruebas UI usan el getter/configuración real con servicios simulados (sin mockear el gate).
- [ ] Repetir físicamente con recarga completa y observar media-gate-v2. No se elimina el bloqueo de producción ni la validación Seller/Approved, ni se declara identificado el bundle previo del teléfono.

## Seguimiento vigente: retención S3 y SHA definitivo — pendiente de backend
- [x] Registrar confirmación backend: último CD-Deploy documentado compartido `c809f60ffd422acb759d31fe54b4916b7fbc4da0`, anterior al cierre de PR #45; no acredita la revisión EC2 más reciente.
- [x] Documentar lifecycle: todos los objetos de `staging/` se eliminan a 30 días, incluidos Approved asociados. No confundirlo con TTL5min de URLs; renovación GET y placeholders conservados, sin cambios runtime.
- [ ] Backend debe verificar SHA más reciente y confirmar solución de almacenamiento `approved/{owner}/{assetId}`, política de retención y tratamiento de objetos ya existentes. No declarar durabilidad estable antes de esa evidencia.
- [ ] Mantener prueba manual controlada y registrar su resultado real; no realizar respaldos locales o resubidas automáticas. Sin commit/push por esta actualización.

## Primera E2E móvil — preparación final
- [x] OpenAPI vivo vuelve a confirmar upload-url/confirm/GET media, máximo4,000,000 y PATCH nullable mediaAssetId. Cliente usa solo confirm; PUT conserva URL/headers y Uint8Array medido, sin JWT ni transformaciones.
- [x] Renovación explícita de Mis alimentos reinicia GET acotado incluso con producto en caché. Pruebas reforzadas de identidad del buffer y HTTP422 con error/correlación sanitizados.
- [x] Checks finales: TypeScript limpio, Jest765/765 en56suites, lint0errores/27avisos existentes, Doctor20/20, diff check limpio. Bundle AndroidHTTP200/13,163,458bytes con Hermes/ReactCompiler después de cambios runtime; Metro propio detenido.
- [ ] Prueba física por el usuario. Backend reporta POST/GET/imágenes probados en producción; PATCH manual producción y E2E móvil pendientes. Retención reportada30días, URLs5minutos. Sin mutaciones reales automáticas ni commit/push.

## Media real controlado — EN CURSO
- [x] Verificados OpenAPI EC2, GET lista y detalle con imagen y TTL300s, máximo4,000,000 y rutas oficiales. Deployment GitHub production cd98e56 success; no SHA en health/cabeceras EC2.
- [x] Opt-in __DEV__ + MEDIA_REAL=controlled, demo excluyente y release cerrado; host observado agregado exacto. PUT Uint8Array medido, Content-Type firmado y HTTP200 obligatorio; confirm/status vía AuthSession, polling acotado y diagnósticos sanitizados.
- [x] Deployment GitHub production cd98e563796cb522276046991426aa4b5fe87c49 con success, URL de ejecución45014052703; no atestación SHA en EC2. Fuente actual usa Rekognition fail-closed y propiedad/Approved para POST/PATCH mediaAssetId nullable. GET detalle real trae imagen y TTL300s.
- [x] Verificación final: TypeScript limpio, Jest763/763 en56suites, lint0errores/27avisos, Expo Doctor20/20 y diff check limpio. Bundle Android HTTP200/13,163,308bytes Hermes/ReactCompiler, Metro propio detenido.
- [ ] Prueba manual de una foto/producto propio en Expo Go con MEDIA_REAL=controlled; release sigue cerrado. No se han realizado mutaciones reales automáticamente ni commit/push.

## Conexión de pantallas PR33 — EN PRUEBAS
- [x] Demostración EXPO_PUBLIC_MEDIA_DEMO=pr33 y __DEV__: creación/listado/edición de foto, estados de moderación, dos creaciones, reemplazo/quitar y catálogo/detalle conectados a los simuladores existentes mediante transporte de memoria sin red.
- [x] Servicio tipado PR33 y AuthSession.productPhotoOperation preparados con sesión/Active/propiedad, confirmación del mismo asset y asociación solo Approved. Gate real cerrado en código antes del transporte; adaptador histórico también cerrado. No se habilita con un botón ni variable pública.
- [x] DTO comercial conserva campos obligatorios y admite pares imageUrl/imageUrlExpiresAt válidos o ausencia legacy. Consumidores reales de vendedor/comprador/resumen pueden renovar por GET una vez por montaje; sin POST ni bucles. Demo representa las fotos locales explícitamente y nunca descarga hosts fixture.
- [x] Checks finales: TypeScript limpio, Jest 748/748 en 54 suites, ESLint 0 errores/27 advertencias existentes, Expo Doctor20/20 y diff check limpio. Bundle Android HTTP200/13,155,222bytes con Hermes/ReactCompiler, proceso Metro propio detenido.
- [ ] Validación física del árbol actual. Despliegue/IAM/S3/Azure/E2E siguen pendientes; no acreditar persistencia real por pruebas simuladas.
- [ ] Guía física: docs/MEDIA_PR33_EXPO_GO.md. No commit/push en esta iteración.

## Límite de fotografía actualizado — EN PRUEBAS
- [x] MAX_PRODUCT_IMAGE_BYTES = 4_000_000 centralizado; selector, adaptador anterior, simulación PR33 y validador de borrador usan el mismo límite inclusivo decimal.
- [x] Lectura de archivo real y validación de firma/MIME antes de solicitar URL; metadatos del selector sin tamaño se resuelven con File, tamaño real no verificable se rechaza sin red. Sin compresión.
- [x] Mensaje exacto para exceso; selección inválida conserva foto anterior y campos. Pruebas 3,999,999 / 4,000,000 / 4,000,001 bytes, vacío, desconocido, MIME/firma y rechazo previo a upload-url.
- [x] TypeScript limpio, Jest 726/726 (49 suites), lint 0 errores/27 advertencias, Expo Doctor20/20, diff check limpio; bundle Android HTTP200 Hermes/ReactCompiler después de cambios runtime, Metro propio detenido.
- [ ] Prueba física en Expo Go. PR33 sigue simulado y desconectado de pantallas/sesión; asociación/reemplazo/eliminación/renovación no están habilitados en AWS. Nuevo commit/OpenAPI de backend para este límite pendiente de publicación; 6218aad queda como referencia histórica anterior.

## PR33 Media — EN CURSO
- [x] Documentos del commit 6218aad obtenidos: upload-url, confirm y GET mediaAssetId; confirmación no implica Approved; PATCH admite null para quitar; ProductResponse no expone mediaAssetId.
- [x] Simulación aislada de upload/confirm/estado y catálogo PR33 con transporte inyectado, hosts fixture y guardia __DEV__; asociación solo Approved, PATCH null, renovación GET acotada y exclusión de POST incierto, pruebas sintéticas sin red.
- [x] TypeScript limpio; suite completa 714/714 antes de añadir una prueba adicional de POST incierto, que pasa con las suites PR33 focalizadas (12/12). Lint 0 errores/27 advertencias, Doctor20/20, diff check limpio, bundle Android HTTP200 antes del último cambio aislado de simulación.
- [ ] Integrar estados/moderación y edición/renovación en pantallas reales y sesión; simulación no está conectada a UI ni a servicios AWS. Sin tráfico real hasta aprobar/desplegar PR33 y verificar Azure/IAM/S3/E2E.

## Confirmación backend Media — EN CURSO
- [x] Equipo backend confirma persistencia/verificación Media incompletas, Catalog rechaza imageUrl, ProductResponse y PATCH no soportan foto; SHA EC2 y permisos S3 pendientes. Sin auditoría ni mutaciones nuevas.
- [x] Mantener selección local y mejorar recuperación tras PATCH fallido y presentación de disponibilidad real; prueba sintética de conservación de campos.
- [x] TypeScript limpio, Jest 703/703 (47 suites), lint 0 errores/27 avisos, Expo Doctor 20/20 y diff --check limpio.
- [ ] Verificar edición y disponibilidad en Expo Go; esperar SHA, DTO y evidencia E2E del backend antes de conectar Media.

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
