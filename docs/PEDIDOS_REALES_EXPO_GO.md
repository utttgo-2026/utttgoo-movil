# Pedidos reales y entrega QR — guía de prueba

### Validación física del historial y fluidez

1. Abre ambos clientes con `npx expo start --go -c`. Con un pedido existente abre seguimiento desde Mis pedidos, prueba flecha y gesto Atrás y vuelve a entrar; verifica el GET nuevo. En Ready, solicita un QR solo si está autorizado, sal y vuelve: el QR anterior no debe reaparecer. Comprueba expiración, renovación en la misma pantalla y eliminación después de Delivered. No compartas el QR.
2. Con la prueba de compra autorizada, vuelve primero con Modificar pedido y comprueba que Atrás retorna a Producto. Confirma una vez y pulsa Atrás desde el comprobante: debe abrir Mis pedidos con la compra reciente. En pruebas independientes, «Ver mi pedido» debe abrir seguimiento y «Ir al inicio», el catálogo; Atrás no debe abrir el formulario enviado.
3. En Seller usa un pedido autorizado, cambia los estados en el mismo detalle y confirma la entrega con el comprador. Tras el GET Delivered comprueba las dos salidas, vuelve a abrir el pedido y verifica que no aparece la cámara. Prueba Atrás físico o gesto en bandeja, detalle y cámara, y permisos de cámara.
4. Verifica restauración y cerrar sesión/cambiar cuenta sin que vuelvan datos ni QR de la cuenta anterior. En publicación autorizada, comprueba «Ver mis alimentos» y Atrás sin recuperar el formulario enviado. Observa el indicador durante actualización manual y confirma que no parpadea en relecturas automáticas.

## Repetición del bloqueo «no encuentro Pedidos recibidos»

El usuario no llegó al botón de transición. El acceso anterior estaba dentro de Mi negocio; la revisión del código no confirma qué impidió verlo en ese teléfono (ruta, versión del bundle, modo demo o validación de rol/negocio). El OpenAPI vivo confirma el contrato y los GET de la bandeja con y sin `status=Pending` devolvieron 401 sin sesión. No se envió ningún PATCH ni POST real durante esta revisión.

1. En PC, abre Metro con `npx expo start --go -c` y abre el QR de Metro en los dos teléfonos. Desactiva la demostración y usa las cuentas reales de prueba. En comprador, abre **Mis pedidos → Ver seguimiento** de un pedido existente. En el otro teléfono inicia sesión con el usuario dueño del negocio.
2. En vendedor, entra por **Perfil → Pedidos recibidos**, o **Perfil → Mi negocio → Pedidos recibidos**. La validación de negocio activo sigue requerida. Sin acceso directo de Seller, revisa **Quiero vender / Mi negocio** y el mensaje de permisos; no uses la cuenta compradora para aceptar.
3. Desliza para actualizar. En **Pendientes** el servidor recibe `status=Pending`; **Todos** permite encontrar el mismo pedido aunque ya haya avanzado. **Aceptados**, **En preparación** y **Listos** tienen su propia paginación. Abre **Revisar pedido** y verifica estado y referencia. Hasta aquí son solo lecturas de pedidos. No crees otro pedido para diagnosticar el existente.
4. Solo en el pedido autorizado para mutar, pulsa **Aceptar pedido** → **Comenzar preparación** → **Marcar listo para recoger**, esperando cada resultado. La versión de cada PATCH viene del GET inmediatamente anterior, no de la tarjeta ni de un valor fijo. Si hay 409, el detalle se reconsulta; revisa el estado y vuelve a pulsar solo si la acción sigue disponible. No hay reenvío automático. Al volver a la bandeja elige Todos o el filtro correspondiente al estado.
5. Comprador: en el seguimiento pulsa **Actualizar**; cuando diga **Listo para recoger**, pulsa **Mostrar código de entrega**. Debe ser el QR temporal del servidor. Vendedor: en el mismo pedido pulsa **Escanear QR de entrega**, acepta el permiso si corresponde, escanea y pulsa **Confirmar entrega** una vez. La respuesta de confirmación y el GET posterior deben acreditar Entregado. Actualiza seguimiento y bandeja; el QR y las acciones de entrega deben desaparecer.

### Diagnóstico si vuelve a fallar

Comparte solo eventos `[orders-http]` del intento: `screen`, `method`, `route` (plantilla), `phase`, `status`, `code`, `correlationId`, `transition`, `orderVersion` y hora. `action` indica la pulsación efectiva; `blocked` indica que no se llegó a invocar el PATCH; `request` es el intento de envío y `response`/`failed` indica el resultado validado/error. `readback-mismatch` señala una escritura con respuesta recibida cuyo GET no confirma el estado/versión esperados. No adjuntes grabaciones de red ni QR. Un 401 requiere revisar la sesión; un 403 persistente requiere validar negocio, rol y propiedad en backend; un 400 con body válido, un 409 persistente incluso tras relectura, un 2xx con contrato inválido o un GET contradictorio se escalan con correlación. Si todavía no hay `action`, revisar acceso/estado del botón y el bundle cargado antes de atribuir el fallo a backend.

Si Expo Go falla antes de abrir con «Cannot find native module ExpoCrypto», consultar
[recuperación de inicio Android](EXPO_CRYPTO_ANDROID.md). Las versiones npm verificadas
son compatibles; el arranque en frío con `npx expo start --go -c` recuperó el inicio
según el usuario. No sustituir el UUID criptográfico ni borrar la sesión.

## Alcance y evidencia

Cliente conectado al OpenAPI vivo de `https://3.129.142.54.nip.io/openapi/v1.json`.
Fuente adicional: guía móvil, contratos y servicios Orders del backend en
`8d48ae9816e95533ca24a93e5b3d9730af7dcb67`. Esa referencia no acredita el SHA EC2.
Los GET de ambas bandejas se comprobaron sin credenciales:401/UNAUTHORIZED; no
se consultaron pedidos privados ni se ejecutaron mutaciones reales automáticamente.

| Operación | Ruta (prefijo `/api/v1`) | Respuesta validada |
|---|---|---|
| Crear | POST `/orders` | 201, o200 de idempotencia; OrderResponse completo |
| Compras | GET `/orders/mine?page=1&pageSize=20` | 200, items/page/pageSize/totalCount |
| Detalle participante | GET `/orders/{orderId}` | 200, OrderResponse |
| Recibidos vendedor | GET `/sellers/me/orders?page=1&pageSize=20` | 200, mismo envelope, role seller |
| Cancelar comprador | POST `/orders/{orderId}/cancel`, sin body | 200, orderId/status/completedAt/version |
| Estado vendedor | PATCH `/orders/{orderId}/status`, `{status,version}` | 200, orderId/status/version/updatedAt |
| Emitir credencial comprador | POST `/orders/{orderId}/delivery-token`, sin body | 201, orderId/token/expiresAt |
| Confirmar entrega vendedor | POST `/orders/{orderId}/delivery-confirmations`, `{token}` | 200, orderId/status/deliveredAt/version |

OpenAPI declara estados como string; enumeración y reglas se contrastaron con fuente
y documentación: Pending, Accepted, InPreparation, Ready, Delivered, Rejected,
CancelledByBuyer. No se implementan enums ni rutas alternativos por suposición.

## Qué se corrigió en Mis pedidos

- Antes se conservaba la página al regresar: una compra nueva de la página1 podía quedar
  fuera de la página antigua. Hay regresión con router real en memoria: página2 → otra
  pantalla → regreso → nueva consulta de página1.
- Ahora foco, regreso, foreground, actualización manual y gesto vuelven a consultar;
  POST confirmado incrementa revisión de pedidos. Las lecturas privadas solicitan
  no-cache/no-store. No se persisten respuestas del historial.
- Paginación conserva totalCount del servidor, pageSize20 (máximo permitido50) y no
  envía filtros de estado ni sort inventado. La fuente backend ordena por creación
  descendente. No se ocultan estados cerrados. IDs repetidos se muestran una sola vez.
- Se rechazan resultados de otro comprador/negocio o rol inesperado en lugar de filtrarlos
  silenciosamente. Lecturas autorizadas no chocan con el lock de una mutación en curso.
- El recibo ya no depende exclusivamente de lastOrder: recupera el pedido por GET.
- Esto identifica defectos verificables del cliente; **no prueba la causa completa del
  incidente físico**, cuya respuesta autenticada no estuvo disponible.

Si la creación más reciente confirmada no aparece en página1, se conserva el resultado
real de esa consulta, se ofrece seguimiento directo del pedido confirmado y se genera
`[orders-http]`, versión orders-v2, con hora, etapa, página/tamaño, conteos y
missingConfirmed. El alcance es **solo la página solicitada**: no afirma ausencia global
ni inserta una compra ficticia. No reconstruye un POST antiguo que no fue registrado.
Errores añaden status/código/correlación permitidos, nunca cuerpo/token/datos personales.

## Reglas que permanecen

- Único AuthContext/AuthSession; JWT nunca llega a pantallas ni al contenido del QR.
- Compra directa de **un producto**, quantity1..50, notes opcional≤250. Body solo
  productId/quantity/notes; precio/total/reserva son autoridad del servidor.
- Cash/MXN: pago en efectivo al recibir; no cobro electrónico ni comprobante de pago simulado.
- UUIDv4 criptográfico Idempotency-Key por preparación, conservado en memoria para ese
  intento. Se aceptan201/200 documentados. No se usa el ID del pedido como clave.
- POST ambiguo queda bloqueado, sin reintento automático, aunque se abra el historial.
  Una coincidencia por nombre/hora no reconcilia el intento. Sin orderId confirmado
  se requiere verificación autorizada del backend; no existe lookup público de intención
  documentado. Logout/reinicio no acreditan ausencia y los controles actuales de intención
  son de memoria, no un journal persistente entre procesos.
- Estados: Pending→Accepted|Rejected; Accepted→InPreparation; InPreparation→Ready.
  Comprador solo cancela Pending. Delivered no está permitido por PATCH: exige entrega QR.
  Tras una acción se valida su respuesta y un GET del mismo pedido/propietario/estado/versión.
- Cancelación/cambio/confirmación inciertos requieren lectura antes de otra intención.
  El escaneo anterior, incluso incierto, se descarta y no se reenvía. Solo se conservan
  sus hashes SHA256 en memoria de sesión para impedir reutilización local.

## QR: temporal, explícito y de un solo uso

- Solo comprador del pedido y estado Ready. En confirmación inicial se explica que estará
  disponible cuando esté listo; el marco visual de Figma no dibuja un QR inventado.
- El QR contiene **exclusivamente** el token opaco base64url43 emitido por backend.
  Nunca contiene orderId, JSON local, una URL ni el JWT de sesión.
- El backend documenta TTL predeterminado15min; la app usa siempre expiresAt recibido,
  no una expiración local inventada. Otra emisión invalida la anterior.
- No hay emisión automática al entrar, refrescar ni por polling. Una pulsación explícita
  solicita el código; límite cliente3 intentos/5min por pedido y al menos30seg entre ellos.
- La credencial se guarda únicamente en el componente de vista, sin almacenamiento ni
  logs. Se elimina al salir, cambiar cuenta/pedido, pasar a background, vencer, cerrarse el
  pedido o quedar desactualizada la consulta. Para recuperarla puede ser necesaria otra
  emisión explícita: no existe GET de token en claro ni se reconstruye desde el detalle.
- Detalle/seguimiento hacen una lectura inicial y hasta8 adicionales cada15seg mientras
  están enfocados/foreground. No hay WebSocket ni polling infinito. Una lectura mayor de
  30seg deja de autorizar mostrar/escanear el código; usar Actualizar para revalidar.
- Entre dispositivos no se promete actualización instantánea: enfocar/actualizar o esas
  lecturas acotadas consultan la autoridad backend. Una credencial consumida ya no es
  válida en backend aunque otro dispositivo aún no haya recibido la nueva lectura.

## Prueba real con Expo Go Android

Usar dos cuentas autorizadas distintas y preferentemente dos teléfonos. No publicar
credenciales ni capturas del QR; esa imagen es una credencial temporal.

1. Instalar el árbol con su lock (`npm ci` en un clon nuevo), iniciar `npx expo start -c`
   y abrir el QR de Metro en Expo Go. Dependencias SDK58: expo-camera58.0.14 y
   expo-crypto58.0.8. No activar fuente de catálogo mock ni demostración Media.
2. Vendedor: usar un alimento real propio, activo y con stock suficiente. Registrar la
   referencia del alimento para identificarlo entre las cuentas; no crear datos por scripts.
3. Comprador: catálogo → alimento → cantidad disponible → Agregar al pedido → notas
   opcionales → Continuar → Confirmar pedido **una vez**. Revisar nombre, cantidad,
   precio estimado y efectivo; esperar respuesta.
4. En Pedido generado comprobar referencia amigable, alimento/cantidad, importe final,
   efectivo, fecha y estado. La referencia #UG-… deriva del ID real; no es otro ID oficial.
   Ver seguimiento y Mis pedidos navegan sin otro POST.
5. Abrir Mis pedidos, actualizar por gesto y regresar desde otra pantalla. La compra debe
   recuperarse por GET y aparecer en la página reciente. Probar Página siguiente/anterior
   si hay más de20 pedidos; volver desde otro flujo debe empezar en página1.
6. Si la compra confirmada no aparece, no repetir Confirmar. Consultar su seguimiento y
   entregar a backend solo el diagnóstico sanitizado, hora y contexto autorizado de cuenta.
   Backend debe contrastar comprador/orden creada y consulta; ausencia en una página no
   prueba inexistencia. Si el POST fue incierto sin ID, verificar primero con su equipo.
7. Vendedor: Perfil → módulo vendedor/Mi negocio → **Pedidos recibidos** → Actualizar.
   Revisar el alimento/cantidad/total/fecha/notas del nuevo pedido. Abrir Revisar pedido.
8. Pulsar **Aceptar pedido**, después **Comenzar preparación**, después **Marcar listo
   para recoger**, esperando cada confirmación/GET. Rechazar es una alternativa terminal
   desde Pendiente, no un paso del recorrido de entrega.
9. Comprador: actualizar seguimiento o esperar una lectura acotada. Debe mostrar Listo
   para recoger. Pulsar **Mostrar código de entrega** una sola vez; presentar ese QR.
10. Vendedor: abrir ese pedido listo → **Escanear QR de entrega** → permitir cámara.
    Escanear el QR del comprador, comprobar el pedido y pulsar **Confirmar entrega**.
    El teléfono envía {token} al endpoint del pedido seleccionado. Solo después de la
    respuesta validada y GET Delivered se muestra **¡Pedido entregado con éxito!**.
11. Comprador: actualizar/reabrir seguimiento. Debe indicar Entregado y retirar el QR.
    Vendedor: regresar a Pedidos recibidos y actualizar; debe recuperarse Entregado.
12. Variantes conscientes con pedidos autorizados adicionales: cancelar mientras Pendiente;
    comprobar que no se permite después de Aceptado; denegar cámara; QR incorrecto,
    vencido o anterior reemplazado. No consumir credenciales ajenas para probar IDOR.
    Una prueba de rechazo/cancelación cierra ese pedido y no continúa la entrega.

Si falla cámara, la UI permite revisar permiso/abrir ajustes. Si falla la confirmación,
usar Actualizar pedido. Si sigue listo y se decide otra intención, el comprador debe
emitir **otro código** y el vendedor escanearlo nuevamente. Si ya está Entregado, no
volver a confirmar. Nunca restaurar localmente Delivered ni repetir la lectura anterior.

## Verificación pendiente de mantenedor

Verificación local final: TypeScript sin errores; Jest **868/868** en63suites;
lint0errores/21advertencias existentes restantes; Expo Doctor20/20; diff check sin
errores. Bundle Android HTTP200,13,296,432bytes, perfil del manifiesto Hermes y
React Compiler; Metro propio detenido. La maqueta histórica ya no dibuja QR desde
JSON local y queda identificada como demostración.

Los tests son sintéticos, no evidencia de un pedido físico nuevo. Registrar resultado
de dos cuentas/dispositivos, correspondencia de ambas bandejas, cámara nativa, expiración,
entrega y fidelidad visual. No faltan endpoints documentados para el recorrido ordinario;
persistencia/listado inconsistentes de un intento concreto o conciliación de creación
sin ID requieren evidencia del backend. No se modificó AWS ni se hizo commit/push.
