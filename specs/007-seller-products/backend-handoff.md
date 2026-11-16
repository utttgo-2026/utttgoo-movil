# Contratos faltantes y prueba manual007

**Estado vigente:** ver sección «Continuación P0» al final. La auditoría inicial siguiente es histórica: SellerActive y categorías ya recibieron contratos nuevos, pero producto aún no tiene DTO completo.

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
