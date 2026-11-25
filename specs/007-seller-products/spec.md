# Specification007 — Vendedor y productos

### Salidas de operaciones finalizadas
En Delivered acreditado por respuesta y GET, el detalle retira el escáner y ofrece Ver pedidos recibidos e Ir a Mi negocio. Volver a abrir el pedido recupera el estado real. Desde la publicación confirmada, Ver mis alimentos retira el formulario de la pila. Ver SDD006.

## Acceso y actualización de pedidos reales

En la prueba física el vendedor no encontró «Pedidos recibidos». Agregar acceso Seller desde Perfil, manteniendo la verificación de negocio activo y propiedad. Bandeja con Todos y filtros por estado desde el servidor, sin perder pedidos avanzados; filtro/página independientes. PATCH con versión del detalle validado, conflicto recuperado por GET sin repetir la escritura. Aplicar al detalle el resultado ya confirmado por GET y volver a consultar la bandeja. Diagnóstico de botón, envío, respuesta y verificación sin IDs privados ni credenciales.

## Pedidos recibidos y entrega — continuación autorizada

Conectar GET /sellers/me/orders y detalle participante mediante sesión Seller existente, sin enviar sellerId. Transiciones oficiales con versión y releer resultado; no fijar Delivered por PATCH. Escaneo QR seleccionado por pedido propio, formato base64url43 y POST delivery-confirmations {token}, sin persistir/loguear credencial. GET posterior confirma Delivered; errores/resultado incierto conservan recuperación sin repetir scan automáticamente. Reutilizar SellerEntry y tema/originales UI038/039, sin pedidos ficticios, realtime supuesto ni reconstrucción de navegación. Ver spec003 para contrato completo.

## Limpieza visual de fotografías — en pruebas

El usuario confirma que la integración real funciona y solicita únicamente UX/UI. Referencias inspeccionadas: UI-035/036/037, UI-006 y UI-013 originales. Conservar tema Poppins/rojo, bloque de fotografía neutro y redondeado, tarjetas compactas con miniatura/precio, formularios y navegación existentes. Sin pantallas nuevas.

- No mostrar estados wire, IDs internos, endpoints, infraestructura, flags ni diagnóstico de activación. La edición se abre desde cada alimento, sin campo público de ID. Mantener advertencia comprensible del alcance parcial del listado.
- Selección con vista previa/cambiar/quitar, actividad discreta, «Revisando fotografía…», «Fotografía lista» únicamente con asset aprobado válido, rechazo claro y consulta/reintento de revisión cuando corresponde. Estado simulado identificado como demostración, sin vocabulario de infraestructura.
- Publicación muestra «Publicando alimento…» y solo tras éxito «¡Alimento publicado!», Crear otro y Ver mis alimentos. Error incierto conserva datos y bloqueo, con revisión de alimentos/soporte; no convertir errores en éxito.
- Traducir errores en la capa de presentación, conservando errores/diagnósticos sanitizados internos existentes. No modificar contratos, transporte, gates, Seller, expiración/renovación acotada, validación MIME/firma/4,000,000 bytes ni exclusión de duplicados.
- Verificar recorridos UI y ausencia de textos técnicos, recuperación, publicación sin foto, reinicio, imágenes reales y renovación; checks completos y bundle Android. El pulido visual físico en Expo Go permanece pendiente de observación.

## Catalog corregido por backend: reintento condicionado

Backend reporta corregido en producción el bug de promoción que provocaba503 antes de guardar; confirma reutilización de mediaAssetId Approved. Esa confirmación no acredita ausencia del registro concreto: no liberar el bloqueo ni repetir POST hasta verificación autorizada de DB/ID. GET público actual default/20/50=200 y100=400; la corrección local50 se conserva. Agregar versión/pantalla y URL de query segura al diagnóstico, mensajes/detalles estructurados sanitizados, sin textos personales ni firmas. No reconstruir IDs desde imageUrl ni reupload automático.

Diagnóstico implementado `catalog-v2`: source estable de pantalla/operación, URL completa únicamente cuando es segura, marca urlRedacted explícita y clasificación de validación local/HTTP400, servicio5xx, transporte y contrato. Preservar message solo de allowlist estática y details con campos/límites permitidos; no registrar respuestas originales. La prueba física ya acredita Approved, no publicación/GET de imagen del intento fallido. Promoción a approved/ reportada corregida no acredita retención definitiva ni migración de objetos anteriores.


## Catalog: GET400 demostrado y POST503 incierto — en curso

GET públicos: sin parámetros y pageSize20 responden200; pageSize100 responde400 y50 responde200. Mis alimentos enviaba100; máximo del código backend50. sortBy price_asc responde400 y priceAsc/createdAtDesc responden200; conservar nombres UI y serializar contrato camelCase. POST503 no prueba DTO inválido ni ausencia de producto: CreateProductService puede persistir antes de fallar en proyección/firma/media. No repetir; formulario/asset Approved se conservan mientras siga viva la instancia. Sin listado privado completo ni correlationId del intento original no se acredita existencia/ausencia.


## Activación Media y mensaje físico — corrección en pruebas

El mensaje anterior de ProductPhotoPanel:15 dependía de !demo && !PRODUCT_MEDIA_REAL_ENABLED, una constante evaluada al importar productMedia.ts:2; no de Approved ni mediaAssetId. La configuración local cargada por Expo es controlled/demo vacío, pero no se ha inspeccionado el bundle del teléfono. Sustituir snapshots por isRealProductMediaEnabled() en panel/formularios/hook/cliente; explicar solo clasificaciones públicas de bloqueo en desarrollo con marcador media-gate-v2. El nuevo bundle sigue siendo necesario para cambios .env: el getter no lee un .env remoto en ejecución. No habilitar producción ni ignorar Seller/Approved; publicar con foto solo con asset válido aprobado y acción explícita.


## Seguimiento vigente: SHA y retención de imágenes (confirmación backend)

Esta actualización prevalece sobre las referencias históricas de despliegue y retención que siguen abajo.
- El último SHA de CD-Deploy documentado que backend compartió es `c809f60ffd422acb759d31fe54b4916b7fbc4da0`, anterior a los cambios finales de PR #45. El SHA realmente desplegado de la versión más reciente sigue pendiente de verificar. No presentar referencias anteriores, incluido `cd98e56`, como acreditación de esa versión.
- El lifecycle actual de S3 elimina a los 30 días todos los objetos bajo `staging/`, incluso fotografías `Approved` asociadas a productos publicados. La persistencia de fotografías a largo plazo **no está estabilizada**.
- La caducidad de `uploadUrl` e `imageUrl` a los cinco minutos solo afecta la autorización temporal. Renovar `imageUrl` mediante GET del producto no restaura un objeto eliminado; si no puede recuperarse, conservar placeholder y manejo de errores sin bucles.
- Backend planea almacenamiento definitivo bajo `approved/{owner}/{assetId}`. Es una solución propuesta pendiente de implementación/despliegue/evidencia; no es una ruta de API ni una clave que el frontend deba construir o utilizar.
- Conservar los contratos y la integración real controlada existentes, sin copias locales de respaldo, persistencia de URLs firmadas ni resubidas automáticas. La prueba manual con cuenta Seller autorizada sigue disponible y no acredita retención a largo plazo.


## Reapertura urgente runSeller188 — no resuelto físicamente
Usuario retira la aceptación previa: TypeError persiste en consulta y alta, trace188:59. En HEADc606435 el188 es un if/return sin llamadas; mapaAndroid delMetro8081 coincide porhash conGit, una sola fuenteAuthContext y proyecto correcto/SDK58. Hay0targets de inspector en la consulta inicial: no se acredita québundleejecuta el teléfono ni quéfunción eraundefined desde ese trace. No repetir conclusión176sin evidencia. Diagnóstico temporal __DEV__ solo operación/etapa/typeof/status, sin sesión/IDs/credenciales; retirar antes delcierre. Corregir estructura si se reproduce incompatibilidad real y conservar GETprevio a reintento de POSTincierto. Sincommit/push ni declaración de solución hasta nueva pruebafísica.
- Evidencia local nueva: manifiesto ExpoGo solicita enginehermes/reactCompilertrue/hermes-stable; smoke previo omitía estos parámetros. Fuente única del servidor no acredita versión delcliente. Se ejecutaron módulos reales emitidos porMetro con ese perfil en VMNode, con puente/fetch/storage sintéticos: missing404→POST201→GETActive→roles y consultaActive funcionan. No equivale a ejecutarHermes del dispositivo ni reproduce el TypeError físico.
- Candidatas estructurales verificables: @refreshreset hace que ReactRefresh descarte estado viejo delProvider y restaure una factorynueva, en vez de mantener coordinador viejo. Cleanup invalida revision y generación delcoordinador sin borrarJWTpersistido;401tardío delContextdesmontado no invalida al nuevo. Contratos de restore/cancel obligatorios se verifican antes de iniciar trabajo, sin llamadas opcionales ocultandoausencias.
- Activaciónincierta: si POSTno pudo interpretarse y todavía no se verificó perfil, hacer un GETde reconciliación, nunca otroPOST. Activevalidado/roles revalidados retorna resultado confirmado porGET200 y marca reconciled, no inventa201delPOST. Si GETmissing/falla, mantenerincierto y permitirsolo consulta segura. Métodoawaitoriginal conserva rechazos; cleanup de lookupusa then de ambosresultados en vez de un catchvacío.
- La funciónundefined del nuevo reporte sigueSINIDENTIFICAR hasta codeframe/traza del teléfono. Las regresiones rojas/verdes nuevas detectan Refresh y resultados tras desmontaje, no se presentan como reproducción del TypeError188. Instrumentacióntemporal retirada; usuario indicó que no puede repetir ahora. MantenerENPRUEBAS/NORESUELTO.

## Hotfix runSeller — contrato de coordinador en memoria
Reporte físico: TypeError en AuthContext176. La expresión en esa posición es sellerSubmissionState(), invocada de nuevo dentro del catch y capaz de ocultar el error original con otra excepción. La claseactual sí define el método; useState conserva la instancia y no garantiza que su contrato coincida tras cambios de módulos/FastRefresh. Reproducir instancia sin método obligatorio, sin afirmar inspección del objeto remoto del teléfono.
Validar contrato runtime sellerOperation/sellerSubmissionState y snapshotbooleano antes de operar; incompatibilidad devuelve fallo explícito con recarga completa, sin optional chaining, roles ficticios, reemplazo automático del coordinador o pérdida deJWT. El catch no puede propagar errores al consultar metadata; conservar errorHTTP/401 y marcar resultado incierto cuando no pueda verificarse un alta iniciada. No actualizarUser antes de verificar el resultado y la metadata. Mantener GETmissingexacto/Active, POST→GET→roles, locks/generaciones y publicación/catálogo sin cambios.

## Bloque 1 — recuperación vendedor/productos (vigente)
Autorizado ejecutar la corrección antes de auditar/restaurar Figma en bloques posteriores. GET público actual: categorías3, productos1/total1; sortcreated_desc400. SellerActivationRequest conserva businessName/description/pickupPoint. POSTseller admite200 documentado y201 previamente confirmado, ambos con DTOActive validado y GETme posterior obligatorio; no otros2xx. StoreName/phone quedan discrepancia, sin envío.
- Entrada seller consulta automáticamente; solo GETme404+SELLER_PROFILE_NOT_FOUND significa sin negocio. Consultas concurrentes comparten promesa por generación de sesión; ninguna ausencia se infiere de401/403/red/otro404. Formulario existente reutilizado sin nueva autenticación. Productos habilitados solo tras GETActive/isActivetrue y rolesBuyer+Seller revalidados por /me.
- POST recibido bloquea duplicados antes de verificar GET; si verificación falla, mostrar alta recibida/verificación pendiente y reconsultar sin repetirPOST. Rechazo definitivo400/422 no se confunde con timeout/resultadoincierto. Logout/blur/unmount descartan resultados tardíos; guards y animaciones conservados.
- ProductResponse completo: id/sellerId/sellerDisplayName(nullable)/name/description/ingredients/categoryId/categoryName(nullable)/price/stock/status/isAvailable/ratingAverage(nullable)/ratingCount(nullable)/createdAt/updatedAt. Campos nullable obligatorios no se sustituyen por defaults. Números o cadenas decimales permitidas por schema se convierten con formato/rangos seguros, no coerción libre. imageUrl no figura en response: placeholder es presentación local; Create lo omite o acepta null sin enviar URL.
- ProductListResponse solo items/page/pageSize/total. Retirar compatibilidad totalCount. Estado isAvailable del servidor gobierna compra además de status/stock. Reconsultar catálogo al recuperar foco sin perder filtros/input/scroll ni esconder errores con mocks. created_desc no se envía mientras400, sin inventar sustitutos.
- Checkpoint técnico completo antes del Bloque2. Auditoría debe usar capturas originales y códigoactual; Bloque3 solo contratos suficientes. Evidencia física/commit siguen pendientes deExpoGo porAGENTS.

## P0 PR #24 — contratos corregidos (vigente)
Confirmación usuario: PR backend #24 fusionado; PATCH /products/{id}/availability recibe exclusivamente {status:Active|Paused}, respuesta200 producto. Crear producto omite imageUrl (también se permite null), rechaza URLs hasta almacenamientoS3/Fase05. Placeholder solo visual local; 422 IMAGE_NOT_AVAILABLE genera mensaje fijo y diagnóstico sanitizado sin request/response/IDs/tokens.
Reutilizar sesión Seller+Active, comprobar ownership antes de mutación y en respuesta, locks/generación existentes. Pausar/reactivar mediante acciones explícitas de Mis alimentos; nunca enviar propiedad availability. Precio/stock conservan whitelist propia.
Verificación GET pública desplegada: OpenAPI HTTPS ya muestra status, notes e imageUrl nullable; healthHealthy y categorías3. GETproducts sin sort, consearch, categoryId o maxPrice200/items[]/total0; los cuatro sorts confirmados retornan400 VALIDATION_ERROR. No sustituir por enums adivinados ni reintentar silenciosamente: carga inicial sin sortBy, selección explícita conserva valor confirmado y muestra error real.
OpenAPI también difiere del contrato previo: ProductListResponse.total (antes totalCount) y OrderResponse orderId/buyerUserId/total (antes id/buyerId/totalAmount), con más metadata. Adaptadores de lectura explícitos para ambas formas conocidas, rechazando mezclas/valores contradictorios; modelos internos anteriores se conservan. No se acredita mutación real ni recorrido físico por leerOpenAPI. Activación todavía documenta200 frente201 confirmado: conservar201 y registrar discrepancia. Sin listado privado de productos ni fotos reales.
Usuario solicita commit local tras checks en esta iteración. AGENTS mantiene como condición adicional la prueba manual en ExpoGo: registrar el pendiente, no marcar COMPLETADA ni hacerpush.

## Continuación: DTO de productos confirmado
Esta sección sustituye el bloqueo histórico de DTO producto. Respuesta individual/list item/create201/PATCH200: id,categoryId,sellerId,name,description,price,stock,ingredients,imageUrl,status (Active|Paused). Listado usa items,page,pageSize,totalCount; categorías conservan total. SortBy: price_asc,price_desc,name_asc,created_desc. Create solo categoryId,name,description,price,stock,ingredients: imageUrl del ejemplo no pertenece al request confirmado. Imagen null/ausente se muestra como no disponible; solo cargar HTTPS, sin asignar fotografía mock por coincidencia de IDs.
- Crear mediante sesión AWS validada Seller y negocio Active. Registrar únicamente IDs devueltos por AWS; Mis alimentos muestra recursos de esta sesión y permite consultar un ID conocido verificando sellerId, sin simular listado privado. Edición inicial solo precio/stock, ownership comprobado antes del PATCH.
- POST excluido mutuamente y sin reintentos automáticos. Respuesta ambigua bloquea repetición en esa sesión; cambio de sesión invalida resultados tardíos. No declarar persistencia MongoDB ni validación física por pasar tests.
- Availability continúa bloqueada: compañero propone status y OpenAPI availability. Sin DELETE, upload ni filtro sellerId supuesto.
- Catálogo público paginado, búsqueda/categoría/precio/sort confirmados; detalle real con stock/status. Active con stock positivo permite preparar pedido de un producto. No convertir respuesta API a FoodItem mock rellenando rating/vendedor/tiempo inventados.
- La etapa permanece EN PRUEBAS hasta Expo Go y recorrido real autorizado Crear→Consultar→Mostrar.

Estado vigente: EN PRUEBAS. SellerActive/categorías/productos y pedido simple implementados en cliente según contratos nuevos; validación física y contratos restantes pendientes. Continúa infraestructura005 sin duplicar servicios/AuthContext. Fuente visual UI027/028/030/035/036 inspeccionada y UI037 disponible. Las secciones siguientes conservan el historial de bloqueos, sustituido por la continuación DTO de productos al inicio.

## Contratos y límites de evidencia
Rutas confirmadas por usuario y servicio005: POST /api/v1/sellers/activation-requests (businessName,description,pickupPoint), GET/PATCH /api/v1/sellers/me, GET /api/v1/sellers/{sellerId}. Histórico OpenAPI200 activación y compatibilidad201 existente. Consulta actual GET OpenAPI HTTPS falló ECONNRESET, sin bypassTLS. No respuesta autenticada real observada ni JSON/enum/roles vendedor entregados. No inferir aprobación de POST200/201 ni ausencia de solicitud de un404.

## Requisitos iniciales (históricos; continuaciónP0 los amplía)
- Perfil autenticado ofrece Quiero vender; rutas seller bajo guarda existente. Invitados no consultan ni mandan datos privados. JWT solo en coordinador actual, no accesible a pantallas.
- Solicitud exacta validada (nombre2–100, descripción10–1000, punto2–200; límites frontend a alinear con backend), sin phone/roles/sellerId extras. Exclusión mutua de mutaciones en sesión; respuesta tardía tras logout no se aplica. No retries automáticos; una aceptación impide reenviar en esa sesión, fallo de red ambiguo exige consultar antes de otro intento.
- Resultado real HTTP, error fijo sanitizado y aceptación no aprobación. GETme puede ejecutarse y mostrar código; cuerpo unknown no se imprime ni interpreta como perfil/permiso. Contrato faltante explícito. Edición Mi negocio deshabilitada hasta DTO/enum/ownership verificados. Servicio PATCH existente conservado, sin llamadas automáticas.
- Roles005 actualmente solo Buyer confirmados; no ampliar Seller/Admin por adivinación. Ningún estado local concede permiso ni cambia la identidad. Tras autorización backend debe entregar DTOs ampliados de login/authme/usersme para refresco seguro; hasta entonces failclosed.
- Mis productos sin datos inventados ni falsa lista vacía de servidor. Formulario/preview efímeros no publican ni guardan en catálogo. Nombre/description/precio en centavos/categoría/imágenes/disponibilidad validados localmente; categorías reales vacías hasta contrato. Controles publicar/editar/retirar/upload deshabilitados. No producto real sin autorización y endpoint.
- Figma se conserva con componentes/tema existentes; diferencias contractuales: teléfono/imagen negocio sin soporte permanecen no editables, UI028 de activado nunca se muestra por aceptar solicitud. Sin tabs vendedor nuevos para módulos no implementados.
- Comprador conserva21 mocks, categorías/medios, rutas006 y auth005. Ningún producto draft aparece en comprador. Integración real bloqueada hasta API/identificadores persistentes/publicación/ownership.
- Solo tests simulados; tsc/lint/Jest/Doctor/diffcheck y commit local autorizado si seguro, no push/build ni altas reales automáticas.

## Continuación P0: contratos nuevos y alcance aclarado
Usuario confirma activación inmediata201 y GETme con sellerId/businessName/description/pickupPoint/statusActive/isActivetrue/rolesBuyer+Seller/createdAt/updatedAt. No aprobación administrativa en este contrato. Roles válidos Buyer o Buyer+Seller; revalidar /authme y /usersme usando JWT actual, sin rotación supuesta ni permisos locales.
Categorías reales paginadas: items(id,name,sortOrder),page,pageSize,total. GET públicos actuales de categorías y productos devolvieron items[]/total0. OpenAPI accesible confirma rutas nuevas pero carece de schemas de respuesta producto; PATCH usa JsonElement y sortBy string sin enum.
Usuario aclara avanzar solo contratos completos: vendedor/categorías y requests productos confirmados, sin mocks de producción ni publicación con contratos incompletos. Página vacía de productos es validable, no asumir forma de items no vacíos. Paused es único valor confirmado de mutación availability; no inventar valores de publicación ni sortBy. No DELETE/listado sellerId/media/pedidos. Whitelist PATCH limitada a price/stock mencionados, pendiente confirmación exhaustiva y respuesta. No producto publicado real sin DTO validado y evidencia física.
# Migración PR27 (en curso)

El contrato vigente de activación usa exclusivamente `storeName`, `description` y `phone`; POST 201 y GET propio devuelven SellerOwnProfileResponse. Las listas usan `totalCount`. Se conserva la reconciliación de alta incierta y la revalidación de permisos. La excepción física de `runSeller` sigue sin causa confirmada.
# Creación consecutiva (en curso)

Tras una creación 201 validada, presentar ID y opciones para crear otro o consultar los alimentos conocidos de la sesión. No limpiar formularios ante errores; mantener exclusión de envíos y protección de resultado incierto del coordinador. Validar texto no confiable y límites confirmados sin interpretar HTML. El listado privado completo no está disponible.
# Media API017/018 — BLOQUEADO por contrato operativo

Nueva confirmación verbal de contratos: preparar validación aislada de DTOs con lista explícita de hosts autorizados y expiración; no asumir que una promesa verbal acredita el comportamiento de `b79fa80` ni aceptar orígenes arbitrarios. GET público actual devuelve cuatro productos sin `imageUrl`; no demuestra soporte de lectura de imagen. No se ha identificado SHA desplegado.

OpenAPI desplegado publica `POST /api/v1/media/presigned-url` (fileName, mimeType, size; 201 assetId/uploadUrl/expiresAt) y `POST /api/v1/media/confirm` (assetId; 200 assetId/status/publicUrl). ProductResponse no publica imagen. Código público backend `b79fa80f5a0b8fdb7a5a08845ef48a044a4beb2c` (PR28, sucesor de 6932990) mantiene rechazo de cualquier ImageUrl no vacío en CreateProductService; implementación Media consultada no demuestra propiedad ni validación de objeto y registra repositorio en memoria por scope. OpenAPI no identifica SHA desplegado: no afirmar equivalencia runtime sin evidencia. No habilitar carga hasta verificar despliegue y resolver la asociación autorizada y validación del archivo.
# Selección local de fotografía — en curso

Permitir cámara y galería solo para vista previa local, con verificación de acceso, MIME, tamaño y dimensiones. La selección no se sube ni se asocia a AWS; exigir quitarla para publicar sin foto mientras persista el bloqueo de media. Mantener permisos bajo demanda y reinicio al crear otro alimento.
# Adaptador Media aislado — en curso

Hosts expresamente confirmados: subida `utttgo.s3.us-east-2.amazonaws.com`, lectura `utttgo.s3.amazonaws.com`. Preparar cliente con PUT binario y confirmación idempotente sin conectarlo a UI/productos. HEAD backend público 281c19f mantiene rechazo de ImageUrl y no acredita comprobaciones Media; OpenAPI inaccesible en esta revisión.
# Mis alimentos públicos — en curso

Con Seller Active y sellerId verificados, consultar todas las páginas públicas y mostrar solo productos propios visibles, sin afirmar inventario privado completo. Productos conocidos de sesión conservan su identificación de propiedad. No hay DELETE ni listado privado documentado; asociación de fotografías sigue bloqueada.
# Vista previa local de imagen — seguimiento

La vista previa del alimento debe mostrar la fotografía seleccionada con etiqueta explícita de local, sin asociarla al producto. La publicación con foto permanece bloqueada hasta verificar SHA desplegado y asociación Media autorizada.
# Confirmación backend: Media bloqueado

El equipo backend confirma que la verificación de objetos y persistencia MediaAssets están incompletas, Catalog rechaza imageUrl no vacía, ProductResponse no la incluye y PATCH no admite fotografías. SHA EC2 y permisos S3 requieren confirmación. Mantener selección/vista previa local y adaptadores aislados; publicar sin imagen y no conectar S3 hasta contrato, despliegue y E2E confirmados.

La edición de precio y stock conserva los datos introducidos si falla PATCH; las tarjetas distinguen explícitamente disponibilidad del estado de publicación sin presentar stock o estado inventados.
# PR33 Media + Catalog — implementación simulada en curso

Fuente backend commit 6218aad: POST /media/upload-url usa fileName/mimeType/size y devuelve mediaAssetId/uploadUrl/expiresAt/headers; PUT binario; POST /media/confirm usa mediaAssetId y devuelve estado; GET /media/{mediaAssetId} consulta moderación. Solo Approved permite asociación; creación y PATCH usan mediaAssetId y ProductResponse incorpora imageUrl/imageUrlExpiresAt. PR abierto, IAM/Azure y despliegue pendientes: nunca activar tráfico real por el mero OpenAPI.
# Límite Media actualizado — 4 MB decimales

Confirmación de backend para la primera versión: máximo exacto 4,000,000 bytes, inclusivo; sustituye 5 MiB del documento histórico 6218aad. Archivo vacío, inaccesible, de tamaño no verificable o firma/MIME inválidos no producen intención de subida. No compresión automática. Selector y adaptación de subida comparten constante; se vuelve a leer el archivo antes de pedir URL. DTO/commit actualizado pendiente de publicación; producción continúa bloqueada.
# Conexión PR33 — modo demostración explícito

Activar demostración únicamente con __DEV__ y EXPO_PUBLIC_MEDIA_DEMO=pr33; catálogo, IDs y mutaciones de esa demostración permanecen aislados en memoria. No combinar un asset simulado con productos AWS. La asociación real sigue deshabilitada en código hasta despliegue y autorización; los consumidores pueden mostrar pares imageUrl/imageUrlExpiresAt validados sin cambiar el DTO comercial restante. Renovación GET acotada sin crear productos.
# Recorrido real controlado en Expo Go — en curso

GET del despliegue confirma upload-url/confirm/complete/estado y ProductResponse con pares de imagen; máximo 4,000,000 bytes. Catálogo real incluye host exacto utttgo-images-2427dbc8.s3.us-east-2.amazonaws.com. Código público cd98e56 usa Rekognition, propiedad y Approved para asociar, y PATCH mediaAssetId nullable; no hay SHA público que acredite la revisión EC2 exacta. Permitir solo opt-in explícito en desarrollo contra API verificada, sin habilitar release ni ejecutar mutaciones automáticamente. Confirmar únicamente tras PUT200, mismos bytes que size, diagnóstico sin URLs/secretos.
# Primera prueba física real — pendiente

Backend autoriza cuenta Seller de prueba y reporta upload/confirm/Approved/POST/GET probados manualmente en producción; PATCH tiene código/E2E, pero no prueba manual de producción confirmada. Retención reportada de fotografías: 30 días; no confundirla con expiración de URLs PUT/GET a 5 minutos ni implementar borrado local de assets. Prueba manual acotada a una foto y, con autorización, un producto. Renovación explícita de Mis alimentos reinicia el intento GET acotado sin crear productos.
