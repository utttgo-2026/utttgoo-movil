# Media PR33 — prueba física del frontend

## Estado

**Actualización UX vigente:** el usuario confirma que la integración real funciona.
La interfaz pública ya no muestra marcadores de activación, infraestructura, estados wire
ni IDs internos. Los nombres técnicos que aparecen en esta guía son solo para desarrollo.
El pulido visual aún requiere inspección física; los reportes de errores anteriores se
conservan abajo como historial y no representan una nueva incidencia.

Recorrido visible: elegir o tomar fotografía → vista previa → **Subir fotografía** →
**Revisando fotografía…** → **Fotografía lista** → **Publicar alimento** →
**Publicando alimento…** → **¡Alimento publicado!**. Cambiar/quitar conserva las reglas
de bloqueo existentes; errores ofrecen recuperación sin dar por confirmada una operación.

**Prueba móvil parcial:** el usuario alcanzó `Approved`; después observó POST503 y
GET400. La publicación y lectura de imagen de ese producto siguen sin acreditarse.
Backend autoriza una cuenta Seller de prueba y
reporta pruebas manuales de subida, confirmación/Approved, POST con mediaAssetId y
GET con URL en producción. PATCH está respaldado por código y E2E, pero **no tiene
prueba manual de producción confirmada**. No tratar ninguna de esas evidencias
como resultado E2E del teléfono. **Riesgo confirmado:** S3 elimina a los 30 días todos
los objetos bajo `staging/`, incluidas las fotos `Approved` de productos publicados.
No hay todavía garantía de persistencia a largo plazo.

### Caducidad de URL frente a eliminación del objeto

- **Cinco minutos:** vence la URL presignada PUT/GET, no necesariamente la fotografía.
  Para lectura, renovar mediante GET del producto por su ID, como ya hace el frontend.
- **Treinta días:** el lifecycle actual elimina físicamente el objeto en `staging/`.
  Una URL nueva no reconstruye ni recupera esa imagen. La pantalla puede quedar en
  placeholder aunque el producto continúe registrado y el asset conste como Approved.
- El cliente mantiene errores y renovación acotada; no cambia la moderación ni el producto
  por un fallo de carga, no crea respaldos locales, no guarda URLs permanentemente y no
  sube de nuevo la fotografía automáticamente.
- El código público incorpora promoción a `approved/{owner}/{assetId}` y backend reporta
  corregido el fallo de promoción en producción. Falta acreditar la retención definitiva
  y el tratamiento de objetos anteriores; no construir URLs/claves S3 desde el teléfono.

La prueba manual con una cuenta Seller autorizada sigue disponible; una prueba exitosa
de hoy no demuestra que la imagen permanezca después del lifecycle actual.

Contrato de referencia: backend `6218aad0b5911a1f2427d0a1511667af3679f964`.
Límite actualizado por confirmación del equipo: 4,000,000 bytes exactos, sin compresión.
Media real y asociación están cerrados por defecto. Solo `__DEV__` y
`EXPO_PUBLIC_MEDIA_REAL=controlled` habilitan la prueba manual contra el origen verificado;
la demo deshabilita ese gate y los builds de producción siempre permanecen cerrados.
No modificar el código del gate para probar. El despliegue actual ya expone Media/Catalog;
esta guía no acredita todavía publicación y lectura de imagen de extremo a extremo en Expo Go.

## Activar demostración

1. En tu `.env` local ignorado agrega `EXPO_PUBLIC_MEDIA_DEMO=pr33`.
2. Ejecuta `npx expo start -c` y abre la aplicación en Expo Go Android.
3. Inicia sesión con una cuenta de prueba existente. La autenticación sigue siendo real;
   las pantallas demo no registran vendedores ni conceden Seller en AWS.
4. En Perfil entra al módulo vendedor. Verás **DEMOSTRACIÓN PR33** y un inventario
   independiente vacío en memoria. No se cargan productos ni categorías AWS en ese modo.

## Creación y moderación

1. Agregar alimento → completar datos y elegir la categoría de demostración.
2. Tomar fotografía o elegir galería: aceptar/denegar permiso y cancelar selección.
3. Verificar una imagen admitida y otra mayor de 4,000,000 bytes; debe conservarse el formulario.
4. Seleccionar el resultado de la revisión de demostración antes de **Subir fotografía**.
   No se efectúa ningún PUT ni se envían bytes, IDs o JWT a un servidor.
5. Tras la confirmación se muestra **Revisando fotografía…**. Pulsar **Consultar fotografía**
   hace exactamente una lectura en memoria, sin polling automático.
6. Solo `Approved` permite Publicar con esa selección. Rejected y ProcessingFailed
   conservan el formulario; cambiar o quitar la selección permite recuperarse.
7. El recibo dice **guardado solo en demostración**. Crear otro alimento reinicia
   formulario/foto/validaciones y crea otro intento independiente.

## Edición

1. Ver mis alimentos → Editar el alimento seleccionado.
2. Cambiar precio/stock sin guardar; seleccionar/subir/moderar otra foto.
3. **Guardar fotografía simulada** utiliza PATCH en el transporte de memoria, no POST.
   Precio/stock escritos deben conservarse en el editor.
4. **Quitar imagen actual (demostración)** envía `mediaAssetId: null` al transporte de memoria.
5. Guardar solo precio/stock conserva la imagen al omitir `mediaAssetId`.

## Catálogo y renovación

1. En Mis alimentos seleccionar **Ver catálogo de demostración** y abrir el detalle.
2. Las imágenes mostradas en demo son las fotos locales elegidas, etiquetadas como simuladas;
   no se intenta descargar `images.example.test`.
3. **Simular vencimiento de imagen** muestra placeholder; **Renovar imagen simulada**
   reconsulta el mismo producto por GET en memoria, sin crear ni comprar un producto.
4. En el modo AWS normal, el parser conserva los pares `imageUrl/imageUrlExpiresAt`
   válidos cuando el backend los entregue. Cada componente de imagen intenta como máximo
   una renovación por GET público en su montaje; errores persistentes quedan en placeholder.

## Salir de demo

Eliminar o vaciar `EXPO_PUBLIC_MEDIA_DEMO` y reiniciar `npx expo start -c`.
El inventario de demostración no se persiste y jamás se mezcla con pedidos/productos reales.
Con `__DEV__ = false` la variable no activa la demo. Para verificar regresiones reales,
usar el modo AWS normal y no crear/mutar registros sin una prueba expresamente decidida.

## Prueba REAL acotada y autorizada

### Activación interna, sin diagnóstico en pantalla

El marcador media-gate-v2 y sus explicaciones técnicas se retiraron de la interfaz.
La función común de activación y las restricciones de configuración/entorno permanecen.
Si la subida está deshabilitada, solo con fotografía seleccionada se informa que no
puede subirse en ese momento y que puede publicarse sin ella. No se habilita producción.

Expo incluye las variables EXPO_PUBLIC en el bundle: cambiar `.env` no modifica
un bundle ya recibido por el teléfono. Para comprobar la corrección, detener solo
el Metro de este proyecto, iniciar `npx expo start -c`, abrir el QR nuevo y hacer
Reload completo en Expo Go. Si todavía aparece un marcador media-gate-v2 o el aviso
«La publicación con imagen permanece bloqueada», no se muestra este panel actualizado.
Eso no identifica por sí solo qué versión o configuración ejecutaba anteriormente.

Con foto seleccionada se muestra «Sube la fotografía antes de publicar». Los estados
wire se traducen: revisión pendiente → «Revisando fotografía…», aprobado válido →
«Fotografía lista», rechazo → «No se aceptó la fotografía. Elige otra imagen de tu alimento».
Solo Approved con mediaAssetId válido sigue habilitando Publicar con foto.

Evidencia consultada: OpenAPI EC2 publica upload-url/confirm/complete/GET mediaAssetId,
máximo 4,000,000 bytes y mediaAssetId en creación. GET lista/detalle incluye pares de
imagen; una imagen real usa `utttgo-images-2427dbc8.s3.us-east-2.amazonaws.com` y TTL300s.
Actualización de backend: el último SHA de CD-Deploy documentado compartido es
`c809f60ffd422acb759d31fe54b4916b7fbc4da0`, anterior a los cambios finales de PR #45.
El SHA realmente desplegado más reciente **sigue pendiente de verificar**. Las referencias
históricas a `cd98e56` no acreditan esa versión. No se modifican por esta actualización
los contratos vigentes ni las reglas de moderación desde el móvil.

1. Elegir una cuenta Seller autorizada y **una sola foto** inocua de prueba, JPEG/PNG/WebP,
   hasta 4,000,000 bytes. La autorización backend recibida aplica a una cuenta Seller
   de prueba; el usuario ejecuta la prueba, no los tests o scripts.
2. Vaciar `EXPO_PUBLIC_MEDIA_DEMO`; agregar `EXPO_PUBLIC_MEDIA_REAL=controlled` al `.env`
   local ignorado. Mantener `EXPO_PUBLIC_API_BASE_URL=https://3.129.142.54.nip.io`.
3. Reiniciar `npx expo start -c`, iniciar sesión y entrar a Agregar alimento.
4. Completar datos reales/categoría AWS, seleccionar la foto y pulsar **Subir
   fotografía** una sola vez. Esta acción sí envía bytes reales. El mismo Uint8Array se
   mide para size y se envía directamente con expo/fetch, sin Blob RN, FormData ni JWT S3.
5. Solo PUT HTTP200 habilita la confirmación oficial `POST /api/v1/media/confirm`, con
   `{mediaAssetId}`. El cliente utiliza exclusivamente confirm y nunca llama a complete,
   aunque esa ruta aparezca en el OpenAPI. No hace falta pulsar otro botón para la
   confirmación inicial: ocurre dentro de Subir fotografía después del PUT200.
6. Si queda pendiente, el cliente consulta hasta tres veces con espera1/2/3segundos.
   Si sigue pendiente, permite otra consulta explícita; no hace polling infinito.
   Rejected/ProcessingFailed no permiten asociación. No reenviar un PUT incierto.
7. Si falló confirmación tras PUT200, **Reintentar revisión** usa el mismo asset;
   no solicita otra URL ni repite PUT. Backend decide el estado y moderación.
8. Solo tras Approved, decidir explícitamente si se creará **un producto real** con
   Publicar alimento. Comprobar el recibo/ID. Un POST incierto conserva la protección y
   requiere verificación, no repetición automática.
9. Abrir Mis alimentos y detalle comprador para comprobar la imagen. Esperar más de
   cinco minutos y pulsar **Actualizar alimentos** (o pull-to-refresh) en vendedor;
   en detalle comprador usar **Consultar disponibilidad**, y en catálogo **Volver a consultar**.
   Estos GET no crean otro producto. Cada montaje permite un intento de renovación;
    actualización explícita reinicia el intento. Errores persistentes quedan en placeholder.
    Si S3 ya eliminó el objeto por retención, la renovación no lo restaura: informar a backend
    sin repetir subidas ni crear productos para intentar recuperarlo.
10. **Solo si la primera prueba resulta bien y se autoriza la edición:** elegir
    conscientemente un producto propio activo. PATCH todavía no se ha probado manualmente
    en producción según backend. Subir y aprobar
    una foto nueva, pulsar **Guardar fotografía** (PATCH, no POST), o **Quitar imagen actual**
    (PATCH mediaAssetId:null). Guardar solo precio/stock omite mediaAssetId y conserva foto.
    Quitar desvincula la fotografía del producto; no afirma borrado inmediato del objeto S3.
11. Al terminar, vaciar `EXPO_PUBLIC_MEDIA_REAL` y reiniciar Metro. No guardar firmas ni
    URLs completas, bytes o credenciales en tickets. La política de borrar/retirar el producto
    de prueba debe acordarse con backend; el cliente no inventa DELETE.

## Diagnóstico seguro para backend

### Catalog 400/503: no repetir la primera creación

- Reproducción pública: `/api/v1/products` y `?page=1&pageSize=20` responden200;
  `?page=1&pageSize=100` responde400; `pageSize=50` responde200. Mis alimentos usaba100
  y ahora usa50 (máximo confirmado). Los nombres internos de orden de UI se convierten
  a `priceAsc`, `priceDesc`, `nameAsc`, `createdAtDesc`; los cuatro respondieron200 en
  verificación pública. `price_asc` enviado literalmente respondió400. No hay fallback oculto.
- Backend reporta corregido en producción el bug de promoción a approved/ que causaba
  POST503 antes de guardar; también reporta POST y GET satisfactorios con un asset Approved.
  Esta es evidencia comunicada por backend, no una reproducción nueva desde el teléfono.
  Confirma que el asset anterior puede reutilizarse, pero exige verificar primero el
  intento concreto. La explicación general no acredita ausencia de ese producto ni el SHA EC2.
- HTTP503/CATALOG_UNAVAILABLE no es un rechazo local del parser. Se conserva como error
  HTTP y resultado incierto hasta reconciliar el intento concreto; no inferir ausencia
  de producto únicamente por el código HTTP o por el arreglo general del backend.
- Mantener formulario y asset Approved mientras la pantalla viva. **No publicar otra vez,
  volver a subir la foto ni cerrar sesión para liberar el bloqueo.** Reinicio/Fast Refresh
  puede perder estado de memoria; no equivale a demostrar que el POST anterior falló.
- Consultar Mis alimentos tras corregir GET no genera productos, pero solo recupera catálogo
  público propio y registros conocidos de sesión. Ausencia o coincidencia por nombre no es
  reconciliación concluyente. No hay consulta privada de inventario publicada en el OpenAPI revisado.
- Backend debe comprobar en almacenamiento si existe un producto del sellerId autenticado
  asociado al mediaAssetId de ese intento, por hora/correlación. No confundir sellerId con
  el id del usuario dueño de Media. Hacer esa comprobación con equipo autorizado, sin compartir JWT.
- Si existe, obtener su productId y consultarlo: no usar POST para recuperarlo. Si backend
  prueba que no existe y autoriza una nueva creación, coordinar la recuperación de sesión
  antes de repetir; este cambio no limpia incertidumbres ni agrega un botón de bypass.

Los logs nuevos llevan `request.version: catalog-v2`, `request.source` (pantalla u operación),
hora UTC de inicio, método, ruta plantilla y `request.url` con origen HTTPS y query segura.
`urlRedacted: false` indica URL exacta; `true` indica IDs/búsquedas/parámetros redactados u omitidos.
Mis alimentos debe enviar `https://3.129.142.54.nip.io/api/v1/products?page=1&pageSize=50`;
el catálogo comprador usa pageSize20 y agrega únicamente los filtros seleccionados.
También incluyen query serializada de parámetros no sensibles y resumen del DTO. Nombre/descripción/ingredientes
y assetId se reemplazan por tipo/longitud/formato; categoryId público y números comerciales
se conservan como datos de diagnóstico. El resumen no es un cuerpo que se deba reenviar.
No es posible reconstruir el body ni la correlación del POST físico anterior si no se conservaron.

Correlación: ahora se admiten los TraceIdentifier .NET `0HN…:00000001`, UUID/W3C y headers
permitidos (x-correlation-id/correlation-id/x-request-id/request-id/traceparent). Antes se
filtraban los identificadores .NET y se descartaban headers de errores. No se copian headers
completos ni mensajes que puedan contener datos personales. Si backend expone `errors`,
se comparten solo nombres de campos reconocidos, nunca valores/mensajes de validación.

En la consola de desarrollo buscar `[media-http]`. Compartir exclusivamente los campos
generados: stage, method, operation (ruta sin IDs/URL firmada), recordedAt, failureType,
request.version/source/url/urlRedacted/startedAt/query/body sanitizados cuando correspondan,
status cuando se recibió, code reconocido, correlationId válido de cuerpo o header,
validationFields si existen y detail sanitizado. `failureType` distingue validación HTTP400,
validación local, servicio5xx, transporte, contrato y otros errores.
`message` conserva solo textos estáticos permitidos; los demás se marcan `messageRedacted`.
`details` conserva estructura/campos/límites permitidos y redacta textos o claves desconocidos.
No copiar el cuerpo original, logs de red completos ni respuestas de éxito.
Un error de carga nativa de imagen no expone necesariamente HTTP; se informa sin inventarlo.
No inventar un correlationId si no aparece. Las pruebas Jest usan fixtures, no diagnósticos
de la producción. Los tests no acreditan privacidad AWS ni moderación física desde Expo Go.

### Qué hacer si falla

- `400 INVALID_OBJECT`: detenerse y compartir el diagnóstico de confirmación; revisar
  diferencia de bytes/tamaño/tipo con backend. No repetir PUT ni crear otro producto.
- `422 IMAGE_NOT_APPROVED`: no publicar como si la foto estuviera aprobada; conservar
  formulario y revisar moderación con backend. No sustituir mediaAssetId ni falsificar estado.
- PUT distinto de200, URL vencida o corte de red: no confirmar ni repetir la subida automáticamente.
  El objeto podría haber llegado; verificar antes de una nueva intención.
- Timeout después de PUT200 durante confirmación: reintentar solo confirmación del mismo asset.
- POST incierto: revisar productos o backend por correlación antes de otro POST. Ausencia
  en el catálogo público no prueba que no exista: productos pausados/no visibles pueden faltar.

### Registro de resultado a completar por el usuario

1. Hora aproximada, versión de Expo Go y cuenta de prueba anonimizada (sin email/JWT).
2. Foto: formato y tamaño, sin compartir bytes o metadatos personales.
3. Subida/confirmación: estado mostrado y diagnóstico seguro si falla.
4. Moderación: estado terminal observado; producto: éxito/ID solo si hubo respuesta validada.
5. Imagen observada en Mis alimentos y comprador; renovación después de caducidad.
6. PATCH, si se autoriza después: operación, estado real y resultado observado.

Nada de esta ficha está completado por las pruebas automatizadas. Compartir únicamente
los campos sanitizados del log; si HTTP o correlationId no aparecen, indicar «no disponible».
