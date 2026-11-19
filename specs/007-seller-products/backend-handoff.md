# Contratos faltantes y prueba manual007

## Reapertura188 — informe vigente y repetición pendiente
**NORESUELTO físicamente.** Usuario informa persistencia deTypeError188:59 en consulta/alta y no puede repetirtrazas ahora. No usar como aceptación el reporte anterior.

### Qué se pudo comprobar
- Archivo inicialc606435188: `if (status !== 'authenticated') return { success: false, error: 'Se requiere una sesión validada.' };`. Allí no se llama ninguna función; no es evidencia de sellerSubmissionStateundefined ni de otro método concreto.
- Metro8081: projectRootcorrecto, SDK58, una fuenteAuthContext y su sourceContent coincide conHEADantes deeditar. No había targetsdeinspector en la consulta inicial; no se pudo comprobar el bundle/ExpoGoversion delteléfono. Posible diferencia de simbolicación/bundle/cierreantiguo queda abierta, no diagnosticada comohecho.
- Se corrigió la verificación: usar manifiestoExpoGo con enginehermes/reactCompilertrue/hermes-stable; smokeantiguo usaba querygenérica. Módulos realesMetro compilados ejecutan lookup404→alta201→GETActive/roles→lookup200 enVMNode con bridges/red/storagefake y todas las dependencias consultadas como function. No se replicó el TypeErrorfísico ni se consultóAWSprivado.
- InstrumentaciónDEV temporal [seller-probe-r2] fue retirada del código de aplicación. Solo recogió operación/etapa/typeof/status en entorno aislado; no hay logs de secretos/sessionobj ni datosfísicos para afirmar siAWSrespondió antes delerrorreal.

### Cambios candidatos y seguridad
@refreshreset obliga a renovar la instancia tras actualizar AuthContext en desarrollo y restaurarla por el flujohabitual. Cleanup cancela revision/generación y vacía solo tokenenmemoria del objeto viejo; no borraSecureStore. Vida tardía de consultas/401 de unContextdesmontado no afecta al nuevo. No se cambiaUIFigma/publicación/catálogo.
Si POSTfalla por transporte/interpretación, un únicoGETdeverificación confirma el negocio antes decontinuar; si hayActive y rolesválidos retorna confirmaciónGET200/reconciledtrue. Si no puede verificarse, conservauncertain y nunca reenvíaPOSTautomáticamente. No es promesa deidempotencia delservidor ni201inventado.

### Cómo repetir cuando esté disponible el teléfono
1. Guardar los cambioslocales actuales: NO actualizar desdeGitHub para probar este candidato, porque deliberadamente no haycommit/push.
2. Detener únicamente el Metro que usa este proyecto, ejecutar `npx expo start -c` desde la raíz indicada enentorno y abrir el QR nuevo enExpoGo. Hacer Reloadcompleto una vez para cargar el nuevo ciclo delcoordinador; no borrarSecureStore ni desinstalar.
3. Anotar versiónExpoGo/Android y servidor delproyecto (host/puerto, sin parámetros privados). Probar primero SOLOConsultar/Reconsultar. Active+roleshabilitaMisproductos; missingexacto404 muestraformulario; red/5xx devuelveerror/reintento y401/403 autorización, sin Uncaught.
4. Si una activación anterior pudo llegar aAWS, NO enviarlaotra vez. ReconsultarGET; siActive continuar. Probar alta manual nueva solo si el equipo confirma que no existe y no hay activaciónincierta. Nunca publicar datos automáticamente para diagnosticar.
5. Si persiste, compartir captura con **codeframe completo** (texto exacto señalado, no solo número de línea), stack y versiones. No copiar sesión, JWT, headers, OTP ni cuerpos. Será necesario correlacionar esa captura con el bundle efectivamente recibido por ese dispositivo para identificar la funciónundefined.
6. Confirmar resultado físico de ambas acciones antes de considerar resuelto/commit. Las regresiones locales nuevas prueban Refresh/cancelación/reconciliación, no una reproducción del TypeError188 delcelular.

### Verificación candidata actual
649/649tests/41suites, TypeScript0errores, ESLint0errores/27warnings, ExpoDoctor20/20 y gitdiffchecklimpio. MetroAndroid200/12,938,102bytes siguiendo enginehermes/reactCompilertrue/hermes-stable delmanifiesto, lazyfalse para validar graphcompleto y bytecode0 para inspecciónJS. Módulos reales ejecutados con puente/red/storagefake, sin instrumentaciónfinal. No se dispone de reproducción del TypeErrorfísico: la prueba roja es de retención/resultado tras unmount, no prueba de queésa fuera la funciónundefined delteléfono.

---

## Repetición física urgente — hotfix runSeller176
El usuario reportó TypeError físico al consultar vendedor. Expresión identificada/reproducida: sellerSubmissionState() dentro del catch, ausente en una instancia incompatible aunque exista en claseactual. useState retiene instancias; retención compatible conFastRefresh reproducida en tests, no inspección del objeto real del teléfono.

1. Detener Metro anterior. Ejecutar `npx expo start -c` desde la raíz del proyecto y volver a abrir el proyecto en ExpoGo.
2. Hacer **Reload completo** desde el menú de Expo Go (o cerrar y abrir el proyecto), no solo guardar un archivo/FastRefresh. No desinstalar ni borrarSecureStore/AsyncStorage para corregir este problema. La instancia nueva restaura la sesión por el flujoAWS habitual; si AWSresponde401, loginexplícito sigue siendo necesario.
3. Perfil→Quiero vender: dejar terminar consultaautomática. Pulsar Reconsultar mi negocio/validarestado nuevamente. Si aparece mensaje fijo de módulo incompatible, repetir apertura completa para cargar el bundle nuevo; ese mensaje no concede permisos ni representa respuestaAWS.
4. GET200Active/isActivetrue y rolesBuyer+Seller confirmados: verMi negocio y habilitarMis productos. GET404SELLER_PROFILE_NOT_FOUND: mostrarformulario, sin fallo general. Otro404/403/red/5xx: mensaje y reintento seguro, no formulario por defecto.401 mantiene invalidación de sesión.
5. Probar primero solo consultas. Si backend/usuario autoriza alta para una cuenta sinnegocio, realizarla manualmente una vez: POST200/201válido→GETperfil→roles. Ante resultadoincierto no repetirPOST. No se crean vendedores automáticamente para verificar elhotfix.
6. Salir y volver a entrar al módulo, comprobarMis productos y catálogo; cerrar sesión con consulta pendiente no debe reponer perfil/rol. Compartir solo secuencia/mensaje y códigoHTTP sanitizados si falla, nunca JWT/headers/cuerpos/contraseñas.

Verificación técnica delhotfix:640/640tests/40suites, tsc0, ESLint0errores/27warnings, Doctor20/20,diffchecklimpio,bundleAndroid200/14,066,037bytes conMetrodetenido. Posteriormente el usuario confirma esta repetición física enExpoGo tras reloadcompleto sinexcepción y autoriza publicar los cambios enV1.2. Esa evidencia se limita al hotfix: el resto del circuito comercial/Figma permanece ENPRUEBAS.

---

## Entrega vigente — Bloque1 y recuperaciónFigma acotada
Ver matrizactual en `specs/006-figma-ui-navigation-fixes/figma-matrix.md`:22PNGs inspeccionados contra código actual, sin capturasfísicas. Bloque1implementado; Bloque3solo efectivo/QRvisual/avisoshonestos. No se afirma restaurada la historia ni el dashboardSeller.

### Contratos/correcciones aplicadas
- GETseller propio:404SELLER_PROFILE_NOT_FOUND únicamente significa sinnegocio. UI entra con consultaautomática y formulario cuando missing; Active/isActivetrue más Buyer+Seller validado habilita Misproductos y loseditores. Otras respuestas no autorizan alta ni publicación. Queriesduplicadas se coalescen por sesión.
- Camposalta exactos businessName/description/pickupPoint; conservar discrepancia storeName/phone. OpenAPIstatus200 y antiguo201confirmado se validan conDTOActive+GETposterior. Recibido no se pierde por error posterior ni autoriza reenvío. No autoridad de roles local.
- ProductResponse completo, requirednullable metadata; solo total en listado, imagenplaceholder porque responseactual noincluyeimageUrl. isAvailable/status/stock reales. Create201preservaIDtrasdecoder; PATCHprecio/stock ystatus conservados. created_descnoHTTP por incompatibilidad400; ordenpredeterminado no envía sortBy.
- GETpúblicos de esta entrega: categorías3,productos1/total1; esquemaactual verificado sin credenciales. No mutaciones ni confirmación física nueva.

### Recorrido Expo Go vigente (pendiente)
1. `npx expo start -c`, fuenteAWS por defecto. Login con cuenta verificada/autorizada, sin compartir claves/JWT/contraseñas en evidencia.
2. Perfil→Quiero vender: observar consultaautomática. Si no existe negocio, debe aparecer formulario sin errorgeneral404. Usuario con negocio existente veMi negocio, no otra solicitud. Red/401/403/404distinto deben mostrar guarda/error/reintento, no alta.
3. Con autorización de backend, registrar una sola vez con nombre/description/puntoentrega. Comprobar respuesta200o201real, GETsellerposteriorActive/isActivetrue y roles revalidados. Si sigueBuyer, usarloginexplícito; no forzarrol. SiPOSTrecibido yGETfalla, reconsultar sinreenviar. Registroaceptado no acredita lectura/permiso por sísolo.
4. Misproductos→Agregar alimento: categoría deAPI, nombre/description/ingredientes/precio/stockpositivo, sinfoto. Previewlocal no envíaPOST. Publicaruna vez→201válido/IDreal, luego consultar producto propio y cambiar precio/stock; comprobarGETposterior. Pausar/Reactivar validan ownership.
5. Volver a comprador: al recuperar foco debe reconsultar y mostrar el IDreal creado sin pedirreinicio; buscar/categoría/página y back conservanquery/input/scroll. Ordenpredeterminado; Másrecientes se indica no disponible y no envíacreated_desc. Producto noavailable/Paused/stock0 impidecompra.
6. Buyer: productoúnico/cantidad/notas→Datos→Confirmar muestraEfectivo; importe previo esestimado, POSTsolo productId/quantity/notes. Tras201validado, reciboIDreal/totalbackend y marcoQRconbloqueo. No debe existir patrónQR generado ni scanner/confirmaciónentrega. CambiarIDenruta no debe mostrarotrorecibo niQR.
7. AvisosAWS: guarda invitado y mensajeintegraciónpendiente, no alertasfixture ni colecciónvacía supuestamenteconsultada. Historial/seguimiento aúnpendientes; no presentarloscomoreales.
8. Logout duranteconsulta/alta y cambio de cuenta: no repoblar negocio/productos/recibo ni habilitar editor por respuesta vieja. CompararAndroidback/gesto, fuentegrande y animaciones según manual006.

### Checkpoints y siguiente unidad
B1:622tests/40suites ycinco checks. Final625tests/40suites, tsc0, lint0errores/27warnings, Doctor20/20,diffchecklimpio,bundleAndroid200/14,063,236bytes, Metrodetenido. Faltan prueba física y confirmación de persistencia conbackend; no commit porAGENTS.
Siguienteunidad3.1 es integrar GETorders/mine(total/OrderSummary) yGETorders/{id}(OrderResponse) conDTOpublicado/ownership/sesión/contextonavegación. Sus endpoints existen; es trabajo pendiente, no una ausencia deAPI. ColaSeller requiere confirmar alcance/role; acciones/cancelación/reseña/entrega/QRseguro/notificaciones/métricas/media necesitancontratos adicionales. No recuperar datos ficticios para rellenar panelesFigma.

---
Las secciones inferiores son históricas y quedan sustituidas en lo indicado arriba.

## P0 vigente — PR backend #24
PR24 fusionado según confirmación del usuario/compañero. Contratos status/notes/imageUrl aclarados y representados en OpenAPI desplegado por HTTPS. No se consultó repositorio backend ni se hicieron mutaciones remotas, así que no equivale a prueba física de las operaciones.

### Evidencia pública no mutante
- GET /health: Healthy, MongoDB/RedisHealthy.
- GETcategories page1/pageSize20:200,3categorías persistentes (Comida Preparada, Bebidas, Snacks); el bloqueo de seeding ya no se observa en esta consulta. Si otra carga devuelve vacío/error, mostrarlo sin fallbackmock.
- GETproducts sin sort:200,items[],page1,pageSize20,total0. GETsearch=tacos, categoryId de una categoría real y maxPrice60:200,vacíos. No hay producto público con que acreditar detalle ni visibilidad trasalta.
- GETproducts con cada sort confirmado (created_desc,price_asc,price_desc,name_asc):400 VALIDATION_ERROR. UI carga sin sortBy y permite seleccionar Predeterminado AWS; orden explícito conserva su valor y error, sin retry/fallback silencioso ni enums alternos adivinados. Backend debe alinear contrato/despliegue antes de acreditar ordenamiento real.
- OpenAPI ahora incluye UpdateProductAvailabilityRequest.status y respuesta200 ProductResponse; CreateProductRequest.imageUrl nullable y CreateOrderRequest.notes nullable. Enum Active/Paused y límite250 provienen de confirmación del usuario; OpenAPI no publica enum/maxLength.
- Discrepancias adicionales: ProductListResponse.total vs totalCount previo; OrderResponse orderId/buyerUserId/total y metadata vs id/buyerId/totalAmount previos. Adaptadores de lectura explícitos para ambos contratos, solo JSON numérico válido, sin mezclas contradictorias. Pedidos creados admiten Pending y MXN confirmados, no nuevos estados inferidos. POSTorders publica201/200 pero el cliente mantiene201 para creación confirmada. Activación aún documenta200 frente201 confirmado; failclosed ante status inesperado, no mutación para comprobarlo.

### Implementación cliente
Mis alimentos crea/consulta IDs propios de sesión, edita precio/stock y pausa/reactiva con bodyexclusivo status. Se revalidan /me y SellerActive en cada acción. Owner de producto confirmado se conserva solo en sesión para poder reactivar un Paused que deje de ser público; no concede permiso backend ni permiteIDs arbitrarios. Si tras reiniciar un productoPaused devuelve404público, falta listado/consulta privada que permita recuperarlo: resolver con backend, no adivinar endpoint.
Alta omite siempre imageUrl, incluso si entrada tipada trae null. URLs mock/placeholder/S3/file se rechazan antes de fetch. Preview/catálogo/detalle usan placeholder local neutro cuando no hayimagen. Subida real pendienteFase05/S3. Un422IMAGE_NOT_AVAILABLE muestra texto fijo para publicar sinimagen; diagnóstico proyectado a evento/método/pathconstante/status/code/timestamp, sin headers/bodies/IDs/URL/notas/token. Último diagnóstico sanitizado en memoria, console solo desarrollo.
Notas opcionales se editan en Datos del pedido, se revisan en Confirmar y viajan en POST junto a productId/quantity. Máximo250 unidadesUTF16, sin truncado silencioso ni controles peligrosos. Error conserva preparación/notas; solo201 validado limpia preparación. No se vacía ni convierte el carrito mock en pedidos remotos. Backend calcula total; respuesta se valida por identidad/producto/cantidad/total, no se envían importes cliente.
Historial/seguimiento siguen sin simular órdenes: OpenAPI ya publica schemas GETmine/detail, pero integración/enums y recorrido quedan pendientes; UI lo indica. No fotos ni órdenes ficticias productivas.

### Expo Go — recorrido manual PR24 (pendiente)
1. FuenteAWS por defecto y `npx expo start -c`. Usar cuenta institucional verificada; comprobar login/restauración existentes.
2. Perfil→Quiero vender: consultar negocio existente o solicitar una vez con autorización. Validar Active y rolesBuyer+Seller mediante /me; si JWT sigueBuyer, login explícito. Registrar statusreal sin credenciales;200 inesperado no acredita201.
3. Mis alimentos→Agregar: nombre/description/ingredientes/categoríaAWS/precio/stock, sin fotografía. Vista previa debe ser local y neutra. Publicar una sola vez; registrarIDreal/201 y comprobar persistencia con backend. No reenviar resultado incierto sin confirmación.
4. Consultar propio, editarprecio/stock y verificar GETposterior. Pausar→200/Paused; refrescar comprador y comprobar que no puede comprarse. Reactivar desde la misma sesión→200/Active; reconsultar. Ajeno/Buyer/401/403 no debe mutar ni elevar permisos.
5. Comprador: Inicio/Buscar/Categoría/Disponible/Detalle con el mismoIDreal, búsqueda/categoría/precio/página. OrdenPredeterminado permite consultar; los sorts explícitos actualmente400 y deben registrarse como bloqueo de despliegue, no éxito.
6. Buyer: cantidad≤stock→Datos→notas(Sin cebolla)→Confirmar→201/reciboIDreal/Pending/totalAWS. Probar250aceptados/251rechazados antes de red. Error no debe mostrar recibo ni limpiar preparación/notas. Sin pedido mock ni QR inventado.
7. Logout con petición pendiente: no repoblar productos/owner/preparación/recibo ni datos de otra cuenta. Revisar back, giro/fontScale/teclado y Figma en dispositivo.

Commit local solicitado tras checks; AGENTS exige además manualExpoGo, por lo que queda pendiente hasta evidencia. Ninguna etapa se marcaCOMPLETADA por fixtures/bundle.

### Verificación técnica PR24
562/562tests en36suites, TypeScript0errores, ESLint0errores/30warnings previos, ExpoDoctor20/20 y diffchecklimpio. BundleAndroidHTTP200/14,026,589bytes con routerRoot=src/app y serviciosproducto/órdenes presentes; procesoMetro detenido. Tests cubren Active/Paused/ownership/duplicados/logout, imágenesomitidas/null/rechazoURL/422diagnóstico seguro en desarrollo y producción, notasválidas250/invalidas251/control/NoSQL, adaptaciónDTO desplegado, catálogo vacío/total/sort400 y regresiones auth/OTP. No schemafixture ni bundle acredita persistencia comercial o prueba física.

---
Las continuaciones siguientes son históricas y sus bloqueos status/notes/imageUrl quedan sustituidos por esta sección.

**Estado vigente:** ver continuación DTO y manual al inicio. La auditoría y continuaciónP0 inferiores son históricas; los DTOs nuevos sustituyen sus bloqueos de producto/sort/órdenes.

## Continuación DTO productos y pedido simple
- Implementado en cliente: producto individual/list/create201/PATCH200 con campos confirmados, estados Active/Paused, sortBy price_asc/price_desc/name_asc/created_desc y listado totalCount. Categorías conservan total. Sin nueva consulta privada real ni mutación AWS durante esta iteración: las respuestas de pruebas son fixtures.
- Create solo categoryId/name/description/price/stock/ingredients. ImageUrl se lee de respuesta, nunca se envía en alta; null/ausencia/HTTP/error de carga→medio neutro. No fotos mock por ID. Confirmar con backend nulabilidad exacta si difiere; tolerancia de lectura no amplía whitelist de escritura.
- Mis alimentos contiene IDs creados/consultados de esta sesión y consulta manual de ID propio. GETsellerActive y rol Seller se revalidan; sellerId del producto debe coincidir antes de PATCHprice/stock. Sin listado privado o filtro sellerId inventado. Salir/iniciar/restaurar sesión limpia datos comerciales en memoria.
- Pedido de un producto: detalle→datos→confirmar→recibo de201. Body solo productId/quantity. Backend conserva autoridad de precio/stock; total estimado local no se envía. Recibo solo para ID coincidente con respuesta validada de sesión; sin QR, fee, notas ni pago no contratado. Historial y seguimiento no usan mock en fuenteAWS.
- POSTs sin reintentos automáticos, bloqueo simultáneo y de resultado incierto; alta repetida del mismo cuerpo de producto bloqueada en sesión. GET propio no levanta bloqueo ambiguo. **No es idempotencia persistente del backend:** login/restauración/logout/reinicio reinician protección en memoria; confirmar con backend antes de repetir tras pérdida de conexión.

### Pendientes contractuales concretos
1. PATCHavailability: status del compañero vs availability de OpenAPI; ambos cuerpos bloqueados hasta aclaración y DTO/status de respuesta confirmado.
2. GETorders/mine/listado/detalle, estados posteriores a Pending y operaciones de seguimiento/cancelación/calificación: faltan DTOs; no llamadas ni rutas API supuestas.
3. Listado privado de productos/visibilidad de Paused, GET propio si no es visible en endpoint público, media/upload y PATCHnegocio completo. Seeding categorías corresponde a backend.
4. Pruebas de concurrencia/idempotencia y evidencia de persistencia requieren backend; tests del cliente no acreditan MongoDB.

### Expo Go — manual vigente (pendiente)
1. Iniciar con fuenteAWS (flagmock ausente) y `npx expo start -c`. Cuenta institucional verificada, login/restauración y autorización backend; no registrar credenciales en evidencia.
2. Activar negocio una vez o consultar existente. Confirmar Active y Seller validado en /me; si sigue Buyer, login explícito. Backend debe disponer categorías persistentes antes de probar alta.
3. Agregar alimento con nombre/description/ingredientes/categoríaAWS/precio/stock. Preview no debe enviarPOST. Publicar explícitamente una vez; comprobar201 y guardar solo ID sanitizado. Backend confirma persistencia y no duplicación.
4. Volver Mis alimentos, consultar ID propio y comprobar coincidencia de campos. Cambiar únicamente precio/stock, guardar, volver a consultar para verificar persistencia. Producto ajeno/403 no habilita edición; stock0/Paused impiden preparar compra.
5. Comprador: catálogo/Buscar/categoría/filtros/sort/página y detalle deben mostrar el mismo ID/valores. Ausencia o fallo de imagen debe ser neutro. Probar giro/fontScale/teclado/back contra UI013/035/036 sin mezclar fixtures.
6. Buyer autorizado: seleccionar cantidad≤stock→Datos→Confirmar una vez→201/recibo con ID real/Pending/total del backend. Error conserva preparación; no éxito, clear de carrito ni recibo ficticio. No repetir resultado incierto sin revisión backend. Confirmar historial pendiente sin pedidos demo.
7. Logout con request pendiente: ninguna respuesta repuebla productos/preparación/recibo ni cambia permiso. Guardas de rutas seller/private siguen vigentes.

La etapa permanece EN PRUEBAS hasta este recorrido físico. Commit local pendiente de cumplir la regla AGENTS de Expo Go; no push.

### Verificación técnica vigente
526/526tests,35suites; TypeScript0errores; lint0errores y30warnings previos; Doctor20/20; gitdiffcheck limpio. BundleAndroidHTTP200/14,015,245bytes con routerRoot=src/app y servicios producto/órdenes presentes, Metro detenido. La primera consulta sinrouterRoot omitía rutas src/app: se corrigió el diagnóstico, no se declaró como validación funcional. No dispositivo ni mutaciones AWS reales; publicación/pedido están implementados en cliente pero el circuito comercial y persistencia física aún no acreditados.

## Auditoría real
- HRDCORE limpio al comenzar, HEADda4a5f2. Etapas001–006 existentes; ninguna spec dedicada a vendedor. Servicios vendedores005 reutilizados; no pantallas seller anteriores.
- Figma inspeccionado: UI027 formulario de activación, UI028 activado, UI030 edición, UI035 lista, UI036 alta. UI028 **no se usa para solicitud aceptada** porque implicaría aprobación ficticia. UI027 incluye teléfono sin campo API: queda no editable con explicación. UI030 foto/teléfono no soportados: no habilitar guardado ni datos inventados. Formulario producto mantiene nombre/description/precio/disponibilidad y agrega categoría bloqueada según requisito; stock/imagen remotos pendientes de schema.
- OpenAPI actual intentado GET HTTPS sin credenciales: webfetch error de transporte, NodeECONNRESET. Sin bypassTLS ni solicitudes privadas/de creación. Rutas basadas en servicio existente005 y confirmación del usuario; no se afirma nuevo éxito de conectividad ni contrato de respuesta observado.
- sellerService ya envía Bearer y cuerpos en whitelist. El coordinador005 ahora permite solo solicitud/consulta sin exponer JWT o cuerpo desconocido a Context/UI. No nuevo storage/session/demo. Las respuestas /me de usuario siguen validando Buyer; si backend devuelve un rol Seller nuevo, faltará el contrato ampliado y se fallará cerrado, no cambiarlo desde un estado local.

## Entregables implementables y limitaciones
| Módulo | Estado |
|---|---|
| Perfil→Quiero vender |Ruta nueva existente sesión protegida, sin cambiar destinos públicos |
| Alta de negocio |POST real preparado con businessName/description/pickupPoint desde UI. Sin envío real en pruebas.200/201 muestran status y aceptación, no aprobación |
| Consulta |GET sellers/me manual con Bearer; muestra status/errores fijos. JSON de perfil/estado desconocido: no afirma Pending/Approved/Rejected/Suspended |
| Mi negocio |Estructura visible y consulta; campos de lectura/edición deshabilitados hasta DTO validable. PATCH existente preservado, **edición no integrada** |
| Mis productos |Entrada sin lista inventada ni supuesto vacío remoto. No API propia confirmada |
| Formulario/preview |Solo memoria y texto ReactNative, precioMXN centavos, disponibilidad draft. Sin alta local presentada como publicación |
| Imagen |Validador de metadata local JPEG/PNG/WebP≤5MB/6000px preparado. Selección/decodificación/subida/tamaño real no implementados ni acreditados por metadata; botón bloqueado |
| Categorías |No se toman IDs del mock como catálogo real; selector bloqueado hasta API |
| Publicar/editar/ocultar/retirar |No habilitados sin API, propiedad y permiso confirmados |
| Catálogo comprador |21 mocks originales/medios/rutas intactos. Ningún draft se mezcla con productos públicos |
| Vendedor autorizado |No se puede determinar ni refrescar a Seller sin DTO/roles/estados confirmados. No crear permisos ni dashboard aprobado ficticio |

Algunas solicitudes HTTP pueden retornar errores aunque hayan persistido. Se bloquea doble toque mediante ref UI y lock en el coordinador; una aceptación bloquea un segundo POST en esa sesión. Error ambiguo de mutación mantiene bloqueo conservador en sesión. La pantalla bloquea cualquier segundo envío tras respuesta fallida hasta revisión/consulta: no reintenta sola. Consultar no elimina el bloqueo ambiguo porque no sabemos interpretar el DTO. **No es idempotencia server-side ni persiste al logout/reinicio**: coordinar con backend antes de repetir. No se presentan datos persistidos después de un mero200.

## Lo que debe entregar backend
1. JSON sanitizado real de activación y GET sellers/me/PATCH, con nombres/casing/tipos/nulls e identificadores. Semántica exacta de200/201/202, solicitud existente, errores400/401/403/404/409/422/429/5xx y Retry-After/idempotency si lo soportan.
2. Enums exactos de solicitud/negocio/cuenta y diferencia pendiente/rechazada/suspendida; relación entre solicitud y negocio aprobado. Un404/403 no se interpretará como rechazado o suspendido sin contrato.
3. DTOs de login/authme/usersme para comprador autorizado vendedor (roles/combinaciones/prioridad/capacidades), vínculo MongoDB/sub/sellerId y reglas de refresco. No usar user_metadata de Supabase como autoridad de permisos.
4. Endpoints/metodología para listar/crear/editar/publicar/ocultar/retirar/disponibilidad, identificador estable y versión/concurrencia; precioMXN/centavos, stock, restricciones de texto, estados. **No se proponen rutas ficticias**.
5. Categorías persistentes y catálogo público: paginación, búsqueda/orden/filtros, disponibilidad/publicación/eliminación, relación vendedor/categoría, DTO de detalle/perfil vendedor público. No cambiar mock comprador por vacío mientras API no exista.
6. Media: selección/subida autenticada o URL firmada, mime/bytes/dimensiones/decodificación real antivirus si corresponde, ownership/TTL/CDN; límites, rechazoSVG/scripts y privacidad. No URL arbitraria del cliente como foto publicada sin validar servidor.
7. Ownership siempre derivado del JWT autorizado: backend no confía sellerId/id/roles/accountStatus arbitrarios. NoSQL operadores/JSON coerción/mass assignment se rechazan por esquema, queries seguras, unicidad/idempotencia y Redis rate-limit. Frontend no acredita seguridad de consultas backend.

## Integración futura con comprador
Un adaptador tipado se agregará solo al conocer DTO; guardará identidad persistente de producto/vendedor/categoría. Publicación aprobada devuelve id y estado, luego consulta propia y catálogo público deben mostrar el mismo producto. No mostrar drafts, privados, retirados o eliminados como disponibles. La prueba de aceptación es **Crear→Consultar producto propio→Mostrar en comprador**, con permiso/propiedad reales y negativos; no se ha ejecutado ni implementado hasta disponer de API.

## Expo Go — recorrido manual controlado
1. Cuenta institucional ya verificada y autorizada para Buyer; comprobar login/restauración actuales. Si correo/Active sigue bloqueado, parar y registrar dependencia005, no crear sesión demo.
2. Perfil→Quiero vender→Solicitar activación. Revisar contraste/fontScale/teclado/scroll/back contra UI027. Probar controles y campos inválidos sin envío. Teléfono no editable no forma parte del JSON.
3. Coordinar una única solicitud real con backend; enviar. Registrar hora/status y resultado sanitizado, no token/datos personales. Backend confirma persistencia de solicitud y no duplicación. La app no debe mostrar Perfil activado por aceptación.
4. Consultar mi solicitud ejecuta GET con sesión. Con DTO aún desconocido, debe explicar que falta contrato aunque devuelva200; errores muestran HTTP y texto fijo, no estado administrativo supuesto. No insistir en POST si resultado incierto.
5. Mi negocio no debe habilitar guardado ni inventar campos/aprobación. Mientras schema/roles estén pendientes no hay recorrido seguro de edición real; solicitar contrato antes de probar PATCH.
6. Mis productos→Agregar alimento (preparación)→nombre/description/precio→Vista previa local. Debe decir no publicado, categoría/foto/publicar bloqueados; volver al comprador conserva mocks y no introduce drafts.
7. Cerrar sesión y abrir ruta /seller directa: guarda, sin consulta/solicitud ni datos privados. Respuesta pendiente tras logout no crea estado/permiso.
8. RolSeller ampliado: pendiente contrato, no forzar rol desde Expo. Tras implementarlo en otra iteración probar autorización/rechazo/suspensión reales, propiedad y publicación end-to-end.

Sin operaciones reales automáticas, claves/tokens/cuerpos en logs, push o build. Commit local de trabajo007 seguro autorizado al pasar checks; etapas005/007 siguen EN PRUEBAS hasta evidencia física y contratos restantes. La publicación de productos **no está terminada**.

## Verificaciones ejecutadas
449/449pruebas en31suites,405anteriores conservadas+44nuevas. TypeScript0errores, lint0errores/30warnings previos, Doctor20/20 y gitdiffcheck limpio. BundleAndroidHTTP200/2477módulos, proceso detenido sin dispositivo. Tests de sellerSession prueban DTO de auth real confirmado con respuestas seller/fetch simuladas; solicitudes aceptadas200/201 sin permiso, auth401/403/404/etc, timeout incierto y logout tardío. UI testea guardas, campos, exclusión mutua, consulta sin estado inventado y productos no publicables. No prueba servidor/SMTP/Mongo ni JSON vendedor real.

Limitaciones deliberadas: edición Mi negocio, rolSeller y productos reales no pueden probarse hasta los contratos arriba. No se añadió integración real de catálogo ni pruebas que la pretendan mediante fixtures. Documento y fuente anotan claramente esta separación.

## Continuación P0 — contratos confirmados y aclaración del usuario

### Evidencia nueva (consultas públicas no mutantes)
OpenAPI HTTPS ahora accesible y publica categorías, GET/POSTproductos, GET/PATCHproducto y PATCHavailability. También anuncia pedidos, fuera de esta tarea. Mantiene serversHTTP histórico y respuestas sin schemas, así que la app conserva su origen HTTPS configurado; no adopta HTTP.

GET `/api/v1/categories?page=1&pageSize=20` devolvió `{"items":[],"page":1,"pageSize":20,"total":0}`. GET `/api/v1/products?page=1&pageSize=1` devolvió `{"items":[],"page":1,"pageSize":1,"total":0}`. Estas respuestas no proporcionan un ejemplo de item producto y no justifican inventarlo; el seeding sigue a cargo de backend. No se creó categoría, negocio, cuenta o producto en estas verificaciones.

Se pidió aclaración porque el mensaje no incluía DTO de producto y OpenAPI tampoco. Usuario autorizó explícitamente avanzar contratos completos y preparar el resto, sin habilitar publicación con respuestas/enums incompletos. Ejemplos de requests no se confunden con schema exhaustivo de response.

### Vendedor inmediato y sesión
- POST activación ahora exige201; GETme200. DTOvalidado: sellerId/businessName/description/pickupPoint/statusActive/isActivetrue/roles[Buyer,Seller]/createdAt/updatedAt. No aprobación administrativa ni statusPending supuesto en esta nueva modalidad.
- Sesión admite exactamente [Buyer] o [Buyer,Seller], en ese orden confirmado. Ambas mantienen capacidad compradora; la combinación se representa como role seller para el modelo local existente, sin Admin o combinaciones nuevas.
- Después de activar/consultar se revalidan authme/usersme **con el mismo JWT**. No se cambia la clave SecureStore ni se fabrica otro token. Solo identidad/perfil validados actualizan AuthContext. Si siguen Buyer o el refresco no confirma Seller, negocio puede mostrarse Active, pero la UI pide login nuevo para actualizar permisos. Un401 sigue invalidando con la política existente; error temporal no equivale revocación.
- Mi negocio muestra campos confirmados del GET. Guardar cambios continúa bloqueado: el contrato proporcionado garantiza el DTO de POST/GET, no confirma aquí el response de PATCH. No se usa una respuesta de negocio como sustituto del JWT o permiso de producto.

### Categorías y catálogo sin mocks de producción
- categoryService valida items/id/name/sortOrder y metadata page/pageSize/total, carga todas las páginas (máximo100páginas de20, error explícito si no completa), detecta IDs repetidos y ordena por sortOrder. No IDs inventados, datos de desarrollo o fallback ante error.
- Fuente por defecto AWS. `EXPO_PUBLIC_CATALOG_SOURCE=mock` se admite **solo con __DEV__**; producción nunca lo utiliza. Los recorridos históricos de navegación/medios se prueban con fuente mock explícita, no fallback silencioso.
- Inicio, Buscar, Categoría, Disponible, Filtros y Detalle dejan de leer fixtures por defecto. Se preservan rutas/componentes/formularios anteriores bajo fuente de desarrollo; estados AWS usan tema/Screen existentes, no se rehace diseño de tarjetas sin un DTO.
- Categorías del vendedor siempre AWS, incluso si el comprador está en modo mock de desarrollo. Sin categorías muestra estado seedingpendiente y permite consultar otra vez, no sustituye categorías Figma como si fueran IDs persistentes.
- GETproductos valida envelope y reconoce itemsvacío. Un item no vacío falla cerrado con «DTO completo pendiente», **no se muestra como lista vacía** y no se convierte al FoodItem mock. Search/categoryId/minPrice/maxPrice/page/pageSize están preparados; no se envía sortBy ni disponibilidad locales porque faltan enums.
- Búsqueda mantiene su input y consulta con300ms de debounce; respuestas obsoletas no actualizan pantalla. Error de red/503 muestra error, no productos inventados. Paginación de servicio probada; render/paginación de items reales queda pendiente del DTO.
- GETdetalle consulta id real, pero bloquea visualización/adición al carrito sin schema; placeholder neutro accesible, nunca fotografía por coincidencia con food-1/etc. No se mostrarán precio/stock/vendedor/availability inventados.

### Productos preparados, mutaciones aún bloqueadas
Requestbuilder usa exclusivamente name,description,ingredients,categoryId,price,stock. Precio se valida en centavos y se serializa númeroMXN, stock entero0..int32max, categoría seleccionada de API; no imagen/sellerId/roles extras. Formulario existente ahora incluye ingredientes y stock, categoríaAWS y preview efímero, sin exigir media.

Métodos create/update/pause **fallan antes de fetch** por falta de decoder de response. Se preparan whitelist price/stock (campos mencionados) y bodyavailabilityPaused (único valor confirmado); no se envían otros campos/valores ni DELETE. No success201 sin validar id persistente y objeto completo. Mis productos no inventa listado propio a partir de catálogo público; filtro sellerId sigue pendiente. No hay producto creado del que guardar id porque no hubo mutación autorizable en esta iteración.

### Errores
El envelope correlationId/status/code/message se valida estructuralmente para códigos conocidos: UNAUTHORIZED/SELLER_ROLE_REQUIRED/CATEGORY_NOT_FOUND/PRODUCT_NOT_FOUND/PRODUCT_CONFLICT/VALIDATION_ERROR/RATE_LIMITED/CATALOG_UNAVAILABLE/SELLER_UNAVAILABLE. Mensajes de UI son locales/fijos; no se imprime message/correlationId/cuerpo. Status inesperado conserva errorHTTP genérico y no se deduce rechazo administrativo de404. HTTPS/timeouts/credencialesomit/redirecterror permanecen activos.

### Contratos exactos que debe enviar backend ahora
1. **POST `/api/v1/products`201:** JSONcompleto con todas las propiedades, nombre exacto del identificador persistente, tipos, nulls, campos anidados, identidad/nombre de vendedor, categoría y fechas/versionado. Aclarar si POST deja publicado inmediatamente o crea borrador y qué operación ya existente lo hace público; no inventar un POSTpublish.
2. **GET `/api/v1/products`200:** envelopecompleto y al menosun itemreal sanitizado; confirmar si item y detalle tienen el mismo schema, reglas de filtro público, Paused/exclusión, stock0, tiposmonetarios, estados de negocio/vendedor. No sirven solo itemsvacío ni requestexamples.
3. **GET `/api/v1/products/{productId}`200:** DTOcompleto, diferencia con listitem, visibilidad/propiedad para Paused, sellerName y permisos públicos. Campoimagen no se añadirá hastaMedia.
4. **PATCH `/api/v1/products/{id}`:** whitelist completa, tipos/rangos/nulabilidad/omisión (confirmar price/stock y si admite otros), status de éxito y JSONresponse; concurrencia/productversion/409. Ejemploprice/stock no prueba que nombre/category/etc sean permitidos.
5. **PATCH `/api/v1/products/{id}/availability`:** enumcompleto permitido, transiciones, semántica de Paused, statusresponse y JSONcompleto. Solo Paused conocido; no asumir Available/Active/Published ni transición de reanudar.
6. **sortBy:** lista exacta de valores/direcciones/default/estabilidad; limitespageSize y contrato de paginación producto. Mientras falte, la app no transforma rating/price locales a valores supuestos.
7. **Roles/token:** confirmar DTO de login/authme/usersme con [Buyer,Seller], rol desde DB o claims y cómo se obtiene JWT actualizado si actual devuelve403. No refresh/tokenexchange supuesto. GETsellerById/PATCHnegocio schemas siguen pendientes si difieren del ActiveDTO confirmado.

### Prueba manual actual
1. Login autorizado y verificado; Perfil→Quiero vender→altauna vez o consultar negocio existente. POSTrequiere201/DTOActive válido; no operaciones reales automáticas de agente.
2. Observar negocio activo y permisos. Si AuthContext no recibe Seller al revalidar /me, usar Actualizar permisos en login, escribir contraseña manualmente y comprobar con backend el mismo usuario/negocio. No cambiarJWT/roles desdeExpo.
3. Backend realiza seeding; comprador y formulario vendedor deben mostrar esos IDs/nombres reales. Hoy lasconsultas públicas devolvieron vacío: se espera mensaje honesto, no las6categorías demo.
4. Inicio/Buscar/Categorías/Detalle por defecto fuenteAWS. Sin productos: vacío real. Con productos que backend agregue: mientras falteDTO, mostrar bloqueo decontrato en vez de datos/imagen inventados; errores siguen siendo errores.
5. Formulario prepara ingredientes/categoría/precio/stock sinmedia, preview local y publicaciónbloqueada. No se puede completar Crear→Consultar→Mostrar hasta entregar losJSON anteriores; no es un fallo a sortear habilitando un botón o fabricando DTO.
6. Para revisar regresiónvisual previa, solo en desarrollo EXPO_PUBLIC_CATALOG_SOURCE=mock y reiniciarMetro; volveraws/ausente para prueba comercial. Producción ignora mock aunque variabletrue. No mezclar fuentes ni ocultar fallos deAPI.
7. Media, pedidos y filtro sellerId quedan pendientes. AunqueOpenAPI publique órdenes, no se cambiaron pedido/QR/carrito en este alcance.

### Verificación P0 ejecutada
491/491pruebas/33suites, tsc0errores, lint0errores/30warnings previos, Doctor20/20 y diffchecklimpio. Nuevos tests de contratos/catálogos y roles revalidados con mismoJWT, más regresiones anteriores con fuente fixture explícita. La aceptación200 de activación histórica se reemplazó por201 confirmado; no se borraron suites ni se omitieron tests. BundleAndroidHTTP200/2483módulos, proceso terminado sin dispositivo. No POST/PATCH privado real, productos creados o entrega comercial completa. El commit conserva producto CRUD bloqueado honestamente; no habilitarlo para pasar una prueba manual sin los DTOs anteriores.
