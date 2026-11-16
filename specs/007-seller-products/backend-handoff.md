# Contratos faltantes y prueba manual007

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
