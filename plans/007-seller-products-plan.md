# Plan007 — Vendedor/productos

## Corrección de acceso y transiciones de pedidos
Reutilizar Perfil, SellerEntry, bandeja y detalle. Añadir filtros de estado del contrato a las páginas del vendedor, conservar Todos; validar detalle antes/después de mutar. Reconsultar ante conflicto y exigir una nueva acción explícita. Añadir diagnósticos sanitizados y probar rutas, estados y QR con mocks antes del bundle y la revisión física.

## Bandeja y entrega de pedidos reales
Reutilizar SellerEntry y único coordinador para GET sellers/me/orders/detalle, transiciones oficiales con versión y entrega QR. Listado paginado al foco/foreground/refresh; detalle con lecturas acotadas. Cámara Expo Go con permiso bajo demanda y scan base64url43; POST oficial seguido de GET Delivered, sin mutación optimista ni token en almacenamiento/logs. Guía/contratos y plan completo en003 y docs/PEDIDOS_REALES_EXPO_GO.md. Actualizar ROUTES.seller.orderDetail a la ruta implementada, sin duplicar hijos en root.

## UX de fotografías sin información técnica
1. Auditar panel, borrador/vista previa/recibo, listado/editor, catálogo/detalle y sus guardas. Contrastar UI-035/036/037, UI-006 y UI-013 sin modificar originales.
2. Centralizar traducción de estados/errores en presentación; conservar diagnóstico sanitizado en servicios. Actividad del hook solo para texto/indicador, sin cambiar secuencia Media ni reglas de reintento. Reutilizar AppButton/MotionFeedback/tema.
3. Eliminar IDs y consulta manual de ID de la interfaz pública; conservar consulta/ownership desde tarjetas y todo el coordinador. Pulir miniaturas y bloque de foto según Figma, sin nuevas capacidades.
4. Actualizar pruebas de estados, recuperación, no exposición técnica, doble pulsación, creación sin imagen, reinicio y renovación. Ejecutar checks y bundle, documentar archivos/mensajes y pendiente de inspección física. No commit/push.

## Catalog-v2 y recuperación condicionada del POST503
1. Mantener pageSize máximo50, orden camelCase y omisión de opcionales vacíos ya contrastados. Etiquetar solicitudes por pantalla/operación en el cliente HTTP común, sin cambiar el transporte ni agregar consultas.
2. Adjuntar versión, URL/query segura y hora; indicar toda redacción. Conservar correlación .NET/headers y únicamente message/details permitidos. Separar validación local/HTTP400, servicio5xx, transporte y contrato; probar privacidad y URL serializada.
3. Registrar la corrección de promoción reportada por backend y el Approved físico observado. Antes de otro POST, exigir comprobación del intento por sellerId/asset/hora: recuperar productId si existe; ausencia verificada y autorización explícita si no. Mantener bloqueo y no agregar bypass ni nueva subida.
4. Verificar TypeScript, suite completa, lint, Doctor, diff y bundle Android; registrar publicación/imagen físicas y SHA/retención como pendientes. No commit/push.

## Reapertura188 — candidato local, no aceptación física
1. Contrastar188deHEAD ymapaAndroid; no reasignar a sellerSubmissionState por inercia. Inspeccionar servidor/manifiesto/perfilHermes/ReactCompiler y factorycompilada; no guardar ni imprimir bundle completo/.env/sessionobj.
2. Probetemporal de tipos/etapas/status enDEV, ejecutar flujos con módulosMetro reales y puentefalso; retirarprobes. Si el dispositivo no está disponible, declarar límite y noinventarfunciónundefined.
3. @refreshreset verificado con Babel/ReactRefresh real y factoryreal. Cleanup deContext cancela generación/revisión sin clearJWT. Test rojo de llamada que devolvía success tras desmontaje debe ser cancelación; test401tardío conservaJWTdeContextnuevo.
4. POSTincierto→GETreconciliar→roles, nunca repetirPOST; ausencia/falloread conserva bloqueo. Tests de DTOPOSTinválido a través de factory/Contextreales y campo reconciled diferencian confirmaciónGET delPOSTfallido.
5. Cinco checks y Metro usando perfil delmanifiesto real (no parámetros genéricos antiguos); documentar qué está probado y qué requiere captura física. Sincommit/push.

## Hotfix runSeller
1. Añadir reproducciones en Context con instancia sin sellerSubmissionState y con sellerOperation ausente; verificar que la promesa pública debe resolverfailure, no rechazar. Comprobar retención useState y recuperación mediante remount completo con coordinador compatible.
2. Contrato/snapshot tipado explícito en AuthSession y validación runtime acotada en Context. Leer antes de operar y después de respuesta dentro de try; metadata en catch aislada con errororiginal preservado, incertidumbre conservadora de mutación y cancelación porrevision. No renovar/restaurar automáticamente la sesión para parchear un objeto viejo.
3. Pruebas de getter que lanza, rechazoHTTP/red, respuesta/logout, missing/active/roles/alta y regresiónauth/productos. Cinco checks, SDD/memoria/manual; sin mutaciones reales ni commit hasta confirmaciónExpoGo.

## Bloque 1 — ejecución
1. Lookup discriminado missing/active en servicio/coordinador existente: whitelistcódigo404, GETcoalescido por sesión y consultaautomática al foco con descarte de suscriptores obsoletos. UIcomún seller resuelve loading/error/formulario/Minegocio sin duplicar formulario ni clientes.
2. Activación con lock, DTOActive200/201 y GETperfil posterior; conservaraccepted separado deverified, revalidarroles sin elevarlos desde el negocio. Context mantiene resultado tipado y accionesautorizadas; servicios privados vuelven a verificar permisos.
3. Completar DTOproducto/parser y utilizar total exclusivamente. Consumidores cambian total y placeholderlocal, disponibilidadServer; fixtures de pruebas se actualizan al schema, sin runtime mocks. Mantener request create/price-stock/status y201producto.
4. Revalidación de catálogo al foco con cancelación lógica, datos públicos de la misma selección durante recarga para conservar altura/scroll; otro filtro no muestra resultados anteriores. Rechazar created_desc antes de fetch con mensaje de incompatibilidad.
5. Pruebas bloques de errores/ausencia/altaGET/roles/duplicados/carreras/DTO/nulabilidad/total/foco y regresiones005/006/007. Ejecutar cinco checks antes de auditar capturas; documentar solo alcance efectivamente realizado.

## P0 PR #24
1. Verificar GET OpenAPI/health/categorías/productos sin mutaciones; registrar diferencias de DTO/status/sort. Admitir lectura de las dos versiones documentadas de páginas y órdenes sin mezclar campos; carga inicial omite sort y no oculta errores explícitos.
2. DTO/builder status Active|Paused y PATCH200 producto validado; extender capacidad privada existente y UI Mis alimentos con ownership Seller+Active, locks y descarte tras logout. Mantener precio/stock separados.
3. Create sinimagen (null se omite), rechazo de URLs antes de fetch, 422IMAGE_NOT_AVAILABLE con texto fijo y diagnóstico proyectado. Placeholder local sin JSONmock/S3. Media Fase05.
4. Notes≤250 en preparación003 y POST, sin precios/total cliente. Pruebas de request/response, permisos, duplicados, notas y regresión. ActualizarSDD y commit local solicitado traschecks, documentando manual pendiente.

## Iteración DTO productos
1. Separar ProductPage(totalCount) de ApiPage(total), decodificar producto y enum sort/status; servicios create201/PATCH200 con Bearer y whitelist exacta. Bloquear availability antes de fetch.
2. Extender coordinador y Context existentes sin exportar JWT. Revalidar identidad y negocio seller, ownership para edición; exclusión mutua, bloqueo POST ambiguo y generación contra logout. IDs reales en memoria por sesión.
3. Reutilizar formulario007 y componentes actuales: publicar con respuesta validada, consulta/edición precio-stock de ID propio; catálogo/detalle API paginados sin fotos mock. Conservar fuente mock explícita para maquetas006.
4. Preparación y servicio de pedido simple según continuación003, sin carrito multiitem ni notas/fees inventadas. Tests de contratos, ownership, carreras y UI; registrar checks y pendientes físicos.

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
# Migración PR27 (en curso)

Actualizar validadores, DTO y pantallas al OpenAPI vigente, manteniendo coordinación de sesión y prevención de duplicados; verificar con fixtures y sin mutaciones AWS. La validación física permanece pendiente.
# Creación consecutiva (en curso)

Reutilizar pantalla, SellerEntry, categorías AWS y createProduct; validar antes del envío y presentar éxito en línea. Mantener navegación/estado existentes y no alterar transportes AWS. Añadir pruebas UI sin publicaciones reales.
# Media API017/018 — bloqueado

Preparar validación pura de presigned/confirm sin habilitar requests, respetando hosts suministrados por configuración validada. Añadir pruebas sintéticas; se requiere SHA, origen autorizado y corrección de los bloqueos backend antes de activar el flujo.

Mantener creación sin imagen y no instalar dependencias de cámara ni enviar mutaciones hasta confirmar SHA desplegado, propiedad de assets, persistencia y validación de contenido, origen S3 autorizado y aceptación de imagen confirmada en POST producto. Tras corrección, diseñar subida binaria sin JWT al host presignado y pruebas sintéticas.
# Selección local de fotografía — en curso

Reutilizar pantalla de vendedor y servicios Expo compatibles con SDK 58; encapsular selector y validación de archivo separado de UI. Pruebas con módulos nativos simulados y sin peticiones mutantes. No habilitar S3 sin confirmar SHA/hosts/ownership/contrato de producto.
# Adaptador Media aislado — en curso

Encapsular presigned, PUT sin Bearer y confirm con mismo assetId; validar hosts exactos y evitar redirects. Probar con transportes simulados. No habilitar asociación hasta confirmar SHA desplegado y DTO/ownership/media.
# Mis alimentos públicos — en curso

Recorrer paginación pública mediante AuthSession con comprobaciones de sesión y sellerId; rechazar inconsistencias y no mezclar otros vendedores. Presentar listado parcial explícito, consulta y PATCH autorizado existentes y confirmación de pausa. Mantener estados no publicados como limitación explícita.
# Vista previa local de imagen — seguimiento

Reutilizar selección validada para la vista previa del borrador, sin conectar presigned ni mutaciones mientras los contratos de ownership y asociación sigan sin evidencia.
# Continuidad vendedor — en curso

Conservar selección Media local y adaptadores sin invocarlos. Mejorar feedback de disponibilidad y recuperación de edición precio/stock sin agregar endpoints ni asumir inventario privado. Probar fallo/reintento con fixtures.
# PR33 Media + Catalog — en curso

Desarrollar contrato y orquestación con transportes simulados explícitos, estados confirmados y aislamiento de producción. Mantener publicación sin foto y autorización de sesión; no vincular asset hasta validar Approved y despliegue. Tests sintéticos y documentación de limitaciones reales.
# Límite fotografía 4,000,000 bytes

Centralizar MAX_PRODUCT_IMAGE_BYTES, lectura validada del archivo y firma antes de solicitud Media, y probar ambos lados del límite. Conservar selección anterior y formulario ante archivo inválido. Simulaciones PR33 continúan desconectadas de pantallas y producción; no modificar PATCH de fotografía por este ajuste.
# Conexión PR33 — pantallas

Reutilizar simuladores existentes mediante transporte de memoria compartido y puertos de formulario/listado; modo demo visible, sin peticiones AWS para sus datos. Añadir estado de foto y edición a pantallas existentes, conservar el flujo real sin imagen y bloquear servicios Media reales antes del transporte. Preparar decodificación de pares de imagen y renovación acotada por GET público.
# Media real controlado — en curso

Actualizar allowlists exactas con host observado del backend confiable. Abrir solo el gate __DEV__ + opt-in de prueba manual; mantener release cerrado y demo independiente. PUT conserva URL y bytes, timeout/cancelación segura y HTTP200 estricto. Confirmación/lectura autenticadas vía sesión y diagnósticos sanitizados por etapa. Tests con mocks y guía manual de una foto, sin pruebas automáticas contra AWS.
# Validación previa a E2E móvil

Comparar OpenAPI vivo con cliente sin mutaciones. Reforzar tests de identidad de bytes y HTTP422 y renovación explícita; mantener POST confirm como única ruta y distinguir PATCH probado con mocks de PATCH manual pendiente. Actualizar checklist y resultados después de verificaciones completas.
# Activación Media por uso — corrección local

Unificar consultas de activación del panel, formularios, hook y cliente mediante función evaluada al usarla; retirar exportación de booleano capturado. Mostrar causa segura en desarrollo (build, demo, flag ausente/no reconocido) y mensajes específicos de selección/moderación. Pruebas de reevaluación en el mismo módulo y UI controlled/no controlled, sin red real. Actualizar guía de recarga completa para comprobar el bundle real.
# Diagnóstico Catalog físico — en curso

Corregir pageSize del listado Seller y serializar enums wire confirmados; no variar cuerpo comercial para ocultar503. Capturar hora, request Catalog sanitizado y correlación de respuesta incluyendo .NET/header. Mantener error HTTP original y bloqueo producto incierto. Consultas de verificación solo GET públicas/autorizadas y pruebas POST simuladas.
