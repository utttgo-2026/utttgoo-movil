# HTTPS y preparación de registro real — Etapa005

**Registro inicial:**2026-11-12, desde PC Windows/Node25.4/curl Schannel. **Estado vigente: EN PRUEBAS**, resultados actuales en sección11. No se han realizado pruebas físicas ni altas reales automáticas por el agente. La integración autorizada actualiza el coordinador y el único AuthContext; conserva diseño, navegación006, almacenamiento seguro, restricciones HTTPS y dependencias. Sin commits/pushes en estas continuaciones.

Este documento conserva evidencia por fase: **la sección11 contiene el estado vigente tras recibir /auth/me y /users/me**, incluida restauración y guía física. La sección10 registra la comprobación local de configuración. Los bloqueos anteriores corresponden a esas revisiones; ya no falta el contrato /me. En la fase OTP se agregaron dependencias; después no hubo nuevas instalaciones.

## 1. URL efectiva y precedencia
| Fuente | Antes de esta corrección | Después |
|---|---|---|
| .env local (ignorado por Git) | https://3.129.142.54.nip.io | Mismo valor correcto, no necesitó edición |
| .env.local / .env.development* / .env.production* / .env.test* | No encontrados | No creados |
| Variable heredada EXPO_PUBLIC_API_BASE_URL del proceso | Ausente | Ausente en verificaciones |
| .env.example | Valor vacío | https://3.129.142.54.nip.io |
| Expo dotenv: development/production/test | Comprobados durante corrección | Mismo origen HTTPS en los tres modos |

`src/services/api/config.ts` sigue siendo el único acceso runtime estático a `process.env.EXPO_PUBLIC_API_BASE_URL`. No hay IP HTTP de fallback ni configuración de API en eas.json/app.json que la reemplace. La URL de `servers` de OpenAPI no se consume para configurar la app. En una sesión distinta, variables del proceso y archivos locales/modo pueden tener precedencia: revisar antes de arrancar Metro; no afirmar que un bundle antiguo del teléfono ya cambió.

El mensaje reportado corresponde al guarda de HTTP existente. En esta sesión **no se reprodujo con la configuración efectiva HTTPS**; no se puede atribuir el valor de un bundle anterior del celular sin evidencia. Reiniciar Metro con caché limpia es parte de la prueba manual.

## 2. Conectividad y certificado observados
Consultas no mutantes, sin credenciales, contraseñas, JWT ni redirects seguidos:

| Consulta HTTPS | Resultado | Location / Allow |
|---|---|---|
| GET /health | **200**, JSON Healthy | Sin Location |
| GET /openapi/v1.json | Documento OpenAPI3.1.1 disponible | Fuente del contrato, no auth funcional |
| HEAD /api/v1/auth/register | **405** | Sin Location; Allow:POST |
| OPTIONS /api/v1/auth/register | **405** | Sin Location; Allow:POST |
| GET /api/v1/auth/me anónimo | **401** | Sin Location |
| GET /api/v1/users/me anónimo | **401** | Sin Location |

Health: `{"status":"Healthy","checks":{"mongodb":"Healthy","redis":"Healthy"}}`. Headers observados: Server nginx, Content-Type application/json;charset=utf-8, Date Thu,12Nov2026 23:34:53GMT; nosniff/SAMEORIGIN/strict-origin-when-cross-origin. Healthy describe los checks del backend, **no prueba inserción de usuarios en MongoDB**.

TLS validado con almacenes predeterminados de Node y curl/Schannel, sin `-k`, sin desactivar revocación o confianza ni cambiar seguridad nativa:
- Node `rejectUnauthorized:true`, `socket.authorized:true`, **TLSv1.3**.
- CN y SAN DNS: `3.129.142.54.nip.io`; hostname coincide.
- Emisor: **Let's Encrypt / YE1**.
- Vigencia UTC: **2026-11-12 15:11:44 → 2027-02-10 15:11:43**.
- SHA256: `65:73:5B:C6:AF:1A:A3:62:C9:65:97:40:EE:3E:6B:E0:FF:63:A0:EC:33:DE:F4:5E:ED:BC:1C:72:83:EE:7E:45`.

No se observó redirección en los métodos/rutas consultados. **El POST real no se ejecutó**: su política de redirects debe confirmarse con el backend y observarse en la prueba manual. `redirect:'error'` se conserva; su aplicación nativa en Expo Go sigue pendiente de prueba. No afirmar que un chequeo de HEAD/GET garantiza todos los métodos del servidor.

## 3. Contrato de registro verificado
OpenAPI actual declara `POST /api/v1/auth/register`, JSON `RegisterRequest`, con propiedades:
```json
{ "email": "<correo institucional autorizado>", "password": "<introducida solo por el titular>", "displayName": "<nombre>" }
```
Los placeholders no son credenciales ni un request enviado. OpenAPI tipa las tres propiedades como string/null, sin required, longitudes, política de contraseña ni esquema de respuesta. La app mantiene campos no vacíos y dominio exacto `@uttt.edu.mx`; normaliza correo/nombre, **no altera la contraseña**. No se envían fullName, confirmPassword, rol ni propiedades adicionales.

La respuesta publicada es **200 OK**, sin esquema. El cliente antes exigía solo202; ahora admite **200 y202**, preservando202 como compatibilidad del acuerdo anterior, no como respuesta observada del servidor. Ambos dejan el resultado `unknown` y **no guardan JWT, no autentican ni prueban que haya correo enviado/verificado o usuario persistido**. Login sigue cerrado por `sessionContract=null` hasta tener contrato de JWT/identidad/perfil verificado.

**Inconsistencia backend:** `servers[0].url` publica `http://3.129.142.54.nip.io/` pese al acceso HTTPS válido. Corregir OpenAPI/configuración del reverse proxy con el backend; confirmar esquema externo y comportamiento por método. El cliente no sigue esa URL HTTP ni elimina sus guardas.

## 4. Diagnóstico seguro (solo __DEV__)
Consola de desarrollo de React Native/Expo, filtro **[aws-register]**. No se añade interfaz nueva.

| Evento | Qué demuestra |
|---|---|
| form_submit | Se pulsó Crear mi cuenta |
| form_dispatch | Pasaron validaciones básicas del formulario y se llama al contexto; dominio/transporte se validan después |
| request_start | El cliente llega a invocar fetch, con origin HTTPS/método/ruta fijos; no es prueba por sí sola de llegada a AWS |
| response | Status HTTP devuelto por fetch, incluso si falla la validación posterior de JSON/status |
| failure | Código fijo: validation/insecure_transport/configuration/http/network/timeout/etc.; nunca error crudo |
| form_result | El contexto acepta o rechaza la operación; accepted no significa sesión ni persistencia |

Cada evento incluye timestamp UTC para correlación con el backend. Solo request_start incorpora origen público y esquema; solo response incorpora código HTTP. Nunca correo/nombre/password/confirmación, body, respuesta, headers, tokens o mensajes de error arbitrarios. En producción no se imprime nada. Las pruebas revisan tanto sanitización como ausencia de logging en producción.

Ejemplo ilustrativo sanitizado, no evidencia de un POST real:
```text
[aws-register] { event: request_start, method: POST, path: /api/v1/auth/register, origin: https://3.129.142.54.nip.io, scheme: https:, timestamp: <UTC> }
[aws-register] { event: response, method: POST, path: /api/v1/auth/register, status: <código real>, timestamp: <UTC> }
```

Solo form_submit: revisar campos/confirmación. form_dispatch seguido de validation: revisar dominio/valores. insecure_transport: revisar la URL realmente cargada. request_start y network/timeout sin response: no hay código HTTP observable; correlacionar red/TLS y logs backend. Un timeout no prueba que la mutación no ocurrió: **confirmar con backend antes de repetir el registro**. No atribuir todo401 a correo no verificado.

## 5. Procedimiento manual inicial HTTPS (anterior a OTP)
Actualización: la confirmación OTP ya está implementada; consultar el procedimiento y bloqueos vigentes de la sección8. La evidencia HTTP/TLS anterior permanece histórica, sin afirmar entrega de correo.
1. Acordar con backend el entorno autorizado, **una cuenta institucional propia/autorizada** y si ya existe. El desarrollador identifica la base/colección reales y la forma de comprobar el alta; no asumir nombre de colección ni estructura MongoDB. No compartir contraseñas, JWT ni dumps de usuarios en logs/capturas.
2. En la raíz, comprobar `.env` con el origen indicado. Detener el Metro anterior y revisar que la variable del shell no apunte a HTTP. En PowerShell, si existe un override antiguo, retirarlo únicamente de esa sesión con `Remove-Item Env:EXPO_PUBLIC_API_BASE_URL`. No modificar el transporte para sortear errores.
3. Usar Node24 LTS recomendado y ejecutar **`npx expo start -c`**. Abrir el proyecto por QR en Expo Go compatible con SDK58; PC/teléfono con conectividad adecuada. Registrar modelo, Android, versión Expo Go y hora de prueba.
4. En Login, **Comprobar conexión** debe mostrar HTTP200 y los estados realmente devueltos por /health. Si el teléfono falla pero PC funciona, registrar diagnóstico de red/TLS del dispositivo; no instalar bypasses ni desactivar verificación.
5. Abrir el formulario existente Crear cuenta. Introducir manualmente nombre, correo autorizado `@uttt.edu.mx`, contraseña definida por el titular y confirmación. Pulsar una vez **Crear mi cuenta**, observar loading y eventos [aws-register] sin datos del usuario. Esta es la única fase donde se autoriza enviar la cuenta real, por acción manual del titular.
6. Verificar request_start con `https://3.129.142.54.nip.io`, response con el código real y resultado del formulario. El backend debe correlacionar hora/ruta/status sin loguear cuerpos, confirmar que **POST no redirige a HTTP**, y comprobar el documento correspondiente en la base/colección reales. No registrar en la app respuestas completas potencialmente sensibles.
7. Backend confirma si se insertó/actualizó un usuario, estado inicial de verificación, relación con el proveedor de identidad y duplicados. Anotar resultado sanitizado, no afirmar alta MongoDB solo porque hubo200/202 o navegación a Verificar correo. El nombre de esa pantalla no es comprobación de correo enviado.
8. El equipo confirmó posteriormente Supabase OTP y reenvío signup. Los controles antes pendientes ya usan el proveedor; todavía requieren configuración pública y SMTP. No habilitar un flujo de enlace paralelo ni crear usuarios en Expo.
9. Confirmar que no se inició sesión automáticamente ni se guardó un JWT por registrar. Login funcional continúa pendiente del contrato de sesión. Ante error/timeout, coordinar inspección backend antes de reintentar; no repetir altas automáticamente.

## 6. Información pendiente del backend
- Semántica exacta de200/202, cuerpo de éxito y errores, códigos de correo duplicado/validaciones/límites y política de contraseña.
- Evidencia de alta en la base y colección reales de MongoDB; orden/atomicidad entre MongoDB y proveedor de identidad, y estado inicial del usuario.
- Confirmación de ausencia de downgrade/redirect en POST y corrección de servers HTTP en OpenAPI.
- Proveedor/flujo confirmado posteriormente: Supabase OTP email y resend signup; pendientes URL/publishable key del mismo proyecto AWS, SMTP y sincronización Active. No callbacks/webhooks/endpoints de activación supuestos.
- Esquemas de login/JWT, auth/me y users/me, identidad/roles y tratamiento de correo no verificado. No habilitar adaptadores con nombres de campos supuestos.
- Prueba en Expo Go de TLS, red, registro, persistencia y verificación. Sin esta evidencia005 permanece EN PRUEBAS.

## 7. Verificaciones automatizadas ejecutadas
| Comprobación | Resultado |
|---|---|
| Configuración/transporte/servicios/registro/diagnósticos focalizados | **80/80,6 suites**, fetch/storage simulados |
| TypeScript | **0 errores** (se corrigió tipo del global __DEV__ en test) |
| Lint | **0 errores,30 warnings existentes** |
| Jest completo (`npm run test:ci`) | **193/193,17 suites**,178 previas+15 nuevos casos |
| Expo Doctor | **20/20**, dependencias sin cambios |
| Metro Android con root explícito src/app, caché limpia | **HTTP200,2414módulos,15887ms,11685754caracteres** |
| Contenido del bundle de app | HTTPS confirmado presente, IP HTTP antigua ausente, formulario y [aws-register] presentes |

Proceso Metro detenido al terminar. Bundle es compilación, no render en un teléfono. No se enviaron POST reales, credenciales ni cuentas de prueba a AWS durante estas comprobaciones. curl/Node solo consultas no mutantes. No CI remoto nuevo porque no se hizo push.

## 8. Implementación Supabase OTP — contrato confirmado y evidencia vigente

### Responsabilidades y flujo
El usuario comunica confirmación del equipo backend: AWS crea identidad Supabase con email/password y un perfil MongoDB vinculado al sub, con rol Buyer y estado PendingEmailVerification. Supabase envía Confirm sign up. Expo verifica con `verifyOtp({email,token,type:'email'})` y reenvía con `resend({type:'signup',email})`. Login exige confirmación Supabase y perfil Active, y AWS entrega el token de la app. Esta es la arquitectura autorizada, no una inferencia del SDK ni una observación de MongoDB realizada por el agente.

```text
POST HTTPS AWS /api/v1/auth/register (única alta)
  → contexto de confirmación efímero en memoria
  → Supabase verifyOtp / resend (no signUp/signInWithOtp)
  → correo confirmado por respuesta válida del proveedor
  → botón explícito Continuar al login
  → AWS debe garantizar Active y emitir su token según contrato aún pendiente
```

Reporte físico del usuario previo a esta implementación: registro HTTPS alcanza la pantalla de verificación, pero no llega correo/código. Sin status concreto, logs backend, prueba MongoDB ni datos del dispositivo aportados. No equivale a prueba física del OTP implementado ni entrega SMTP.

### Configuración y dependencias
- Instaladas versiones exactas `@supabase/supabase-js@2.119.0` y `react-native-url-polyfill@4.0.0`. Reutilizados componentes UI, Expo SDK58 y almacenamiento AWS. npm añadió10 paquetes (2 directos+8 transitivos); el lock solo añade entradas, sin actualizar otras versiones existentes. Node24 LTS recomendado y utilizado por CI; Node25.4 local mantiene los warnings engines previos de Expo/Metro.
- `.env` local y `.env.example` incluyen **vacíos**, hasta recibirlos, `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. No hay valores inventados. AWS permanece `https://3.129.142.54.nip.io`.
- `src/services/supabase/config.ts`: accesos estáticos Expo, URL HTTPS de origen sin path/credenciales/query y clave moderna `sb_publishable_...`. No se admiten `sb_secret_`, service_role ni JWT legacy en este campo. Ninguna credencial SMTP pertenece a Expo.
- Deben corresponder al mismo proyecto que usa AWS; el cliente no puede confirmar esa correspondencia sin los valores/evidencia del equipo. Una configuración ausente muestra explicación accesible y bloquea acciones, sin requests.

### Aislamiento de la sesión
`verificationClient` es una fachada reutilizable restringida a verify/resend. Cada operación utiliza una instancia SDK efímera con `persistSession:false`, `autoRefreshToken:false`, `detectSessionInUrl:false`, `debug:false`, sin storage nativo ni observadores conectados a AuthContext.

En la versión instalada, persistSessionfalse todavía conserva internamente la sesión en memoria. Por eso se espera initialize, se ejecuta la operación y se dispone el cliente con `auth.dispose()` para cerrar listeners/trabajo de fondo y liberar sus referencias. La fachada solo retorna void: no expone User/Session, access_token ni refresh_token. **No se llama signOut**, ni siquiera local, para evitar efectos remotos de revocación. No se escribe/borra/lee la clave AWS de SecureStore desde este flujo. El objeto efímero y su sesión quedan sujetos a recolección de memoria, sin prometer borrado físico inmediato de strings JavaScript.

Verify solo confirma con un User de respuesta que tenga id, email coincidente y email_confirmed_at válido; no acepta HTTP200 sin confirmación ni un usuario de otro correo. Esto no demuestra que MongoDB ya esté Active. No hay auto-login, importación del JWT Supabase a AWS, polling supuesto ni webhook/endpoint de activación inventado. sessionContract continúa null.

### Correo reciente y operaciones
- `PendingRegistrationStore`: solo memoria, inicializado por el coordinador después de aceptar el POST AWS. Guarda correo institucional normalizado/id de flujo/deadlines/verified/busy, **nunca contraseña/OTP/JWT**. No es otro AuthContext ni autoridad de acceso.
- Se retiró el correo de los parámetros de navegación a verify-email. La pantalla ignora correos en URL, y una entrada directa/reinicio sin contexto tiene acciones deshabilitadas.
- Contexto local válido30min; esta ventana de privacidad **no es la caducidad del OTP Supabase**. Se reemplaza por el siguiente registro aceptado y se elimina al continuar al login o al detectar caducidad.
- Id de flujo y lock compartido impiden aplicar respuestas antiguas a otro registro y excluyen verify/resend simultáneos incluso al remontar. Registro también tiene guardia síncrona contra doble pulsación.
- OTP de seis dígitos, admite ceros iniciales, autocomplete one-time-code, indicador loading/busy y errores/success accesibles. Se mantiene el esqueleto Figma existente (header/título/correo/token/CTA/reenvío), Poppins y layout P2; sin cambios006/globales. No comparación de OTP local ni códigos simulados en runtime.
- Reenvío espera60s desde aceptación del registro y tras cada intento (incluida respuesta perdida), con deadline en memoria que no se reinicia al remontar. Es un mínimo visual local, no una cuota Supabase afirmada.429 y códigos de límite respetan Retry-After en segundos/fecha cuando está disponible, o al menos60s; el backend sigue siendo autoridad del límite. Una limitación del proveedor bloquea ambas acciones hasta el deadline. No reintentos automáticos.
- Timeout15s con AbortController. Fallos de red, códigos inválidos/expirados, límite y respuesta incompleta producen mensajes fijos, sin cuerpo/error crudo. Supabase puede clasificar un código incorrecto y uno vencido como otp_expired: el mensaje indica "expiró o ya no es válido", sin inventar una distinción que el proveedor no entrega.
- Reenvío exitoso significa **solicitud aceptada por Supabase**, no correo entregado. Ningún OTP, token o dato de usuario se añade a los diagnósticos existentes.

### Estado separado de implementación y bloqueos
| Área | Estado real |
|---|---|
| Cliente, configuración validada, pantalla OTP y reenvío | Implementados |
| Contrato email/type:'email' y signup resend, errores, límites, aislamiento AWS | Probados automáticamente con mocks y SDK real+fetch simulado |
| URL y publishable key del proyecto utilizado por AWS | **Pendientes; variables vacías** |
| SMTP y entrega real Confirm sign up | **Pendientes de backend y entorno autorizado** |
| Transición MongoDB PendingEmailVerification→Active | **Mecanismo pendiente de confirmación; responsabilidad backend** |
| JWT/login AWS y decodificadores sessionContract | **JSON real pendiente; contrato null** |
| OTP/reenvío/accesibilidad/foco físico en Expo Go | **Pendientes** |

### Preparación backend y prueba manual
1. Backend entrega solo URL del proyecto y publishable key públicas, confirma proyecto compartido con AWS y configura SMTP autorizado. Verificar la plantilla **Confirm sign up**: para este flujo debe mostrar el OTP, por ejemplo `<p>Tu código de confirmación es: {{ .Token }}</p>`. No basta una plantilla que solo contiene ConfirmationURL. La expiración y límites reales se consultan en el proyecto, no se asumen desde el temporizador visual.
2. Backend confirma una cuenta institucional autorizada, ausencia/política de duplicados y supervisión de Supabase Auth/MongoDB. No usar service_role, secret keys ni credenciales SMTP en el móvil.
3. Completar las dos variables en `.env`, sin alterar AWS; detener Metro anterior y ejecutar `npx expo start -c` con Node24 recomendado. Abrir Expo Go SDK58 compatible y registrar modelo/Android/ExpoGo/hora. Sin configuración, comprobar que los botones estén bloqueados con explicación.
4. Registrar **una sola vez** mediante AWS con la cuenta autorizada. Comprobar identidad Supabase y perfil MongoDB Buyer/PendingEmailVerification con backend; no deducir persistencia de la navegación.
5. Mantener la app y el proceso JS abiertos: el contexto es efímero y se pierde al recargar/reiniciar. Si se pierde, no repetir altas a ciegas; coordinar la recuperación con backend. Introducir los seis dígitos del correo real y pulsar Verificar código. Probar rechazo con código incorrecto y expirado según el entorno; no copiar códigos ni tokens en reportes.
6. Al confirmar, la pantalla informa confirmación **Supabase**, no Active ni sesión AWS. Backend comprueba email_confirmed_at y garantiza que solo el perfil ligado al sub correcto pase a Active mediante el mecanismo que defina; esta app no lo inventa.
7. Para reenvío, usar un flujo todavía pendiente, esperar el contador y pulsar Reenviar token una vez. Revisar entrega real del código y que no aparezcan nuevas altas AWS/MongoDB. Comprobar límites, cambio app/segundo plano y remontaje. La espera visual no garantiza entrega ni reemplaza controles del proveedor.
8. Continuar al login por botón explícito. Actualmente login funcional permanece bloqueado por sessionContract null; comprobar que no se haya creado sesión ni reemplazado un JWT AWS existente por uno Supabase. No afirmar acceso real hasta completar contrato JWT y Active.
9. Revisar en dispositivo fuente grande, lector de pantalla, teclado y foco, textos completos y botones disabled/busy. Ante error de red, no generar solicitudes repetidas automáticamente. Registrar solo resultados sanitizados, nunca email/códigos/tokens.

### Verificaciones de esta implementación
- **244/244 pruebas,21 suites**,193 anteriores+51 casos nuevos. Incluye SDK instalado con fetch simulado (serialización verify/resend, errores, Retry-After, sesión descartada, timeout) y pruebas de pantalla con AuthContext real anónimo/autenticado y proveedor simulado. No emails ni cuentas reales.
- `npx tsc --noEmit`:0errores. `npm run lint`:0errores/30warnings previos, ninguno nuevo. `npx expo-doctor`:20/20.
- Metro Android root explícito src/app, caché limpia: **HTTP200,2469módulos,16335ms,12728425caracteres**, pantalla/SDK presentes y AWSHTTPS conservado sin antigua IPHTTP. Puerto8097 y proceso terminado. No render físico.
- Huella de77 archivos protegidos: **d2b637eb2c7d3aebd9777e18126d08a14d7c5d65**, igual al inicio (006/componentes/tema/rutas/contextos/SecureStore/configAWS/sessionContract/app.json). Dependencias existentes conservadas; solo adición de SDK/polyfill y transitivas.
- Se corrigieron incompatibilidad de tipo genérico createClient en el helper y dependencias del hook antes de los resultados finales. No modificar contratos para hacer pasar mocks.
- Sin commits/pushes. Etapa005 **EN PRUEBAS** hasta configuración/SMTP/Active/JWT/ExpoGo, diferenciados en la tabla anterior.

## 9. URL Supabase real y contrato de login AWS confirmado

### Configuración efectiva sin exponer claves
- AWS se conserva en `https://3.129.142.54.nip.io`.
- `.env` y `.env.example` ahora fijan `EXPO_PUBLIC_SUPABASE_URL=https://tabhbylbhewtehvirexn.supabase.co`.
- Se conservó el campo local `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; en esta verificación estaba **vacío**. El usuario lo completará con la clave publishable del mismo proyecto que utiliza AWS. No se leyó ni imprimió su valor: solo presencia/formato booleanos.
- `src/services/supabase/config.ts` ya lee ambas variables mediante accesos estáticos `process.env`. No hubo reconstrucción del cliente, OTP, reenvío o pantalla, ni nuevas dependencias. Sin clave válida las acciones permanecen bloqueadas con explicación accesible.
- No se incorporaron secretos de firma, service_role ni credenciales SMTP. La gestión de claves de servidor corresponde al administrador backend y queda fuera de Expo.

### Contrato recibido y validación antes de guardar
El equipo confirma el DTO de éxito de `POST /api/v1/auth/login`:
- `accessToken`: string Bearer no vacío, sin espacios ni caracteres de control.
- `expiresIn`: entero positivo seguro, sin coerción de string/float/cero/negativos.
- `tokenType`: exactamente `Bearer`.
- `user.id`: identificador MongoDB string no vacío, conservado sin convertirlo en sub Supabase.
- `user.roles`: `["Buyer"]`, única combinación actualmente confirmada para este flujo.
- `user.accountStatus`: exactamente `Active`.

`decodeAwsLoginResponse` en sessionContract.ts valida runtime sobre unknown y proyecta solo esas propiedades, ignorando extras. Cualquier campo inválido impide escritura del token y activación de AuthContext. Otros roles/combinaciones no reciben una prioridad supuesta: requieren ampliar el contrato antes de soportarlos. No se decodifican claims para autenticar ni se valida/firma JWT con secretos en el cliente. expiresIn se valida como metadata; no se añade refresh ni se inventa su contrato.

La respuesta de login ya contiene identidad mínima confirmada y es suficiente para crear sesión en esta ejecución tras guardar correctamente accessToken. El User de presentación se construye con id MongoDB/rol buyer y **correo normalizado introducido en el login**, no un email afirmado como recibido del backend. `fullName` queda vacío porque el DTO no lo proporciona; no se inventan nombre, perfil o campos remotos. Los datos adicionales necesitan sus propios contratos.

El coordinador existente conserva HTTPS, dominio institucional, cancelación por generación/logout y SecureStore (`uttgo.aws.jwt`, solo el token). La variante de login de producción usa el User del DTO confirmado; no exige llamadas adicionales con esquemas desconocidos. Los contratos sintéticos de /me en pruebas anteriores continúan marcados como fixtures, no evidencia de respuestas reales.

### Sincronización lazy y separación Supabase/AWS
La verificación OTP continúa siendo exclusivamente `verifyOtp({email,token,type:'email'})`; reenvío `resend({type:'signup',email})`, sin signUp/signInWithOtp en Expo. La sesión Supabase se desecha en la fachada efímera y nunca sustituye la clave/token AWS.

El equipo confirma que **AWS comprueba la confirmación de Supabase durante el primer login y cambia MongoDB de PendingEmailVerification a Active antes de devolver éxito**. Expo no consulta/escribe MongoDB, no envía un booleano de activación ni llama un endpoint/webhook supuesto. El parser exige Active en la respuesta. Este contrato no es evidencia de que la transición haya sido probada en producción; SMTP y prueba autorizada siguen pendientes.

### Restauración y perfil: bloqueo explícito restante
OpenAPI se volvió a consultar y aún carece de esquemas de respuesta para `/api/v1/auth/me` y `/api/v1/users/me`. El formato del login **no se extrapola** a esas rutas.

`sessionContract` ya no es null: incluye decodificadores de login, mientras `decodeIdentity`/`decodeProfile` siguen null. `requireProfileContract` bloquea restauración/perfil antes de llamadas /me o PATCH si no están confirmados. Con JWT guardado, un nuevo proceso no inventa usuario/rol/estado desde memoria o claims: AuthContext queda blocked con mensaje que permite iniciar sesión nuevamente. El token no se elimina por falta de contrato. Sin token se restaura como anonymous. Logout borra la clave local AWS y no usa endpoints remotos no acordados.

**Pendiente del backend:** JSON real de /auth/me y /users/me, campos de nombre/email/perfil y su vínculo con user.id/roles/accountStatus. Se necesita para completar restauración y perfil; no bloquear la implementación del login confirmado ni declarar esos módulos terminados por pruebas con fixtures.

### Estado actual
| Área | Estado |
|---|---|
| URL pública Supabase | Configurada con el origen proporcionado |
| Clave pública local | Pendiente de colocación por usuario; vacía en la comprobación |
| verifyOtp, resend y pantalla | Implementados previamente, reutilizados; regresión automática aprobada |
| SMTP/recepción de correo | No configurado según equipo; sin pruebas reales de envío/recepción |
| Login AWS Buyer/Active | Parser/coordinador/SecureStore/AuthContext probados con respuestas simuladas |
| Sincronización lazy Active | Contrato confirmado, ejecución física/backend aún pendiente |
| Restauración/perfil reales | Bloqueados hasta contratos /me; no se inventan DTOs |
| Logout local | Implementado y probado con SecureStore simulado |
| Autenticación integral | EN PRUEBAS; no finalizada |

### Pruebas y evidencia
- `npx tsc --noEmit`: **0errores**.
- `npm run lint`: **0errores,30warnings previos**.
- `npm run test:ci`: **290/290,23suites** (244 anteriores+46 casos nuevos). Incluye configuración Supabase, OTP/reenvío/errores/red/límites previos, validación del login, escritura segura, fallos nativos, HTTP/correo, restauración fail-closed y carreras de logout.
- Focalizadas contrato/login/coordinador/storage: **69/69,4suites**. Éxito de restauración con /me solo se prueba mediante los contratos sintéticos anteriores; no atribuirlo al backend real.
- `npx expo-doctor`: **20/20**.
- `git diff --check`: sin errores de whitespace.
- Metro Android root explícito src/app, caché limpia: **HTTP200,2469módulos,16011ms,12731273caracteres**; AWSHTTPS, URL Supabase y parser presentes, IPHTTP antigua ausente. Puerto8098 y proceso detenido, sin dispositivo.
- Huella81 archivos protegidos **b49d9050ef82167766813a3fff187582e58ad980** preservada:006, AuthContext/SecureStore, modelos, componentes, tema, navegación, dependencias y configuración AWS. No cambios de UI.
- Ningún POST real, cuenta, envío/reenvío SMTP ni credencial real en pruebas. No commits/pushes ni CI remoto nuevo.

### Procedimiento vigente Expo Go
1. Completar solo la clave publishable local del proyecto Supabase confirmado. Conservar las dos URLs indicadas. Sin clave, comprobar el mensaje de configuración incompleta; no intentar sortearlo con claves de servidor.
2. Antes de una prueba real, backend debe configurar SMTP y la plantilla Confirm sign up para mostrar `{{ .Token }}`, confirmar correo institucional autorizado, duplicados y límites. Con SMTP pendiente no se afirma recepción ni se hacen registros/reenvíos masivos.
3. Ejecutar `npx expo start -c` (Node24 LTS recomendado), abrir Expo Go compatible, registrar versión/dispositivo. No recargar el proceso JS entre registro y OTP: el contexto de confirmación es efímero.
4. En entorno autorizado, registrar una vez mediante AWS, introducir el OTP real y verificar. Probar reenvío después del contador sin repetir registro. No incluir OTP/tokens ni datos personales en capturas/logs de diagnóstico.
5. Continuar al login existente e introducir manualmente correo/contraseña. AWS debe comprobar confirmación, sincronizar Active y entregar el DTO acordado. Comprobar en backend la vinculación correcta; un HTTP200 no sustituye esa evidencia administrativa.
6. Confirmar que solo el token AWS se guarda y que sesión/rol se activan tras la validación y escritura segura. Nombre/perfil no están completos en este DTO; no usar datos demo como reemplazo.
7. Probar logout: elimina sesión local y token. Al reiniciar con un JWT previo, por ahora se espera el bloqueo explícito de restauración por falta de /me, sin pérdida automática del JWT; el usuario puede iniciar sesión de nuevo. Esta limitación se retira solo tras recibir e implementar esos contratos.

## 10. Clave pública local cargada: inicialización y pantalla comprobadas sin envíos

### Alcance y resultados
El usuario incorporó la publishable key a su .env local. No se editó ese archivo ni se mostró/copió su valor. Se cargó el entorno mediante `@expo/env` en **development**, como Expo Go, y se verificó:

| Comprobación | Resultado sanitizado |
|---|---|
| URL Supabase presente y coincidente con el origen confirmado | true |
| Publishable key presente | true |
| Formato sb_publishable_ válido | true |
| AWS conserva su origen HTTPS | true |
| Variables Supabase heredadas antes de dotenv | Ausentes |
| .env.local / variantes locales encontradas | Ninguna; solo .env y .env.example |
| Dotenv e inserción de EXPO_PUBLIC en cliente | Habilitados |

No se registraron valores, longitudes, fingerprints ni fragmentos de la clave. La clave permanece exclusivamente en el .env local; el ejemplo mantiene su campo vacío. El bundle de cliente contiene configuración EXPO_PUBLIC por diseño: se verificó su inserción mediante comparación booleana en memoria, sin imprimir ni guardar manualmente su contenido.

### Inicialización real del SDK, sin acceso al servidor
Se añadió `src/services/supabase/__tests__/initialization.test.tsx`. Normalmente usa configuración sintética en CI; una ejecución local opt-in recibió en memoria los valores ya cargados por Expo. Se creó el SDK real con las opciones aisladas existentes, se ejecutó initialize y luego dispose. Se interceptó todo fetch y se exigió **cero intentos de red**, además de cero llamadas a console. No se invocaron registro, verifyOtp, resend, login ni logout reales.

El parser existente y el SDK pudieron inicializar y liberar recursos. Esto comprueba **configuración e inicialización locales**, no que Supabase haya aceptado remotamente la clave o que SMTP funcione. No hubo JWT recibido, sesiones nuevas ni escritura SecureStore.

El runner carga dotenv en development y ejecuta Jest en test con `UTTGO_VERIFY_LOCAL_CONFIG=1`; los valores pasan por el entorno del proceso hijo, nunca por argumentos literales. El primer intento de la prueba de pantalla conservaba NODE_ENV=development y agotó el timeout de Jest; se corrigió únicamente el modo del runner, conservando los valores cargados. No se aumentó el timeout ni cambió código productivo para hacerlo pasar.

### Pantalla y guardas
Con esa configuración se renderizó la pantalla real y se comprobó, **sin pulsar acciones**, lo siguiente:
- Con un contexto de registro sintético, creado solo en la memoria aislada de Jest: no aparece configuración incompleta, el campo OTP es editable y Verificar código está habilitado.
- Reenviar permanece deshabilitado durante su cooldown inicial; tras simular60s queda habilitado. No se ejecuta un reenvío.
- Entrada directa sin contexto: no aparece error de configuración, pero permanece la guarda "No hay un registro reciente disponible". Esto no es un fallo de la clave ni debe eludirse con parámetros de URL.

No se creó una cuenta AWS/Supabase ni se estableció un contexto ficticio en la aplicación real. No existe todavía evidencia física nueva de Expo Go. La prueba de controles no constituye recepción/verificación real de un OTP.

### Calidad y preservación de implementación
| Check | Resultado |
|---|---|
| Opt-in con configuración efectiva local | **3/3 pruebas**, SDK real y pantalla, cero intentos de red |
| npx tsc --noEmit | **0errores** |
| npm run lint | **0errores,30warnings previos** |
| npm run test:ci | **293/293,24suites**;290 previas+3 casos nuevos, usando fixtures en la ejecución estándar |
| npx expo-doctor | **20/20** |
| Metro Android, caché limpia y root src/app | **HTTP200,2469módulos,17845ms** |
| Bundle: URLs correctas, clave pública insertada y pantalla presente | true; comparaciones booleanas, sin valores ni contenido impreso |
| Bundle: antigua IPHTTP | Ausente |

Metro usó puerto8099 y se detuvo al terminar. Solo solicitudes de compilación a localhost; no llamadas de autenticación a AWS/Supabase. **127 archivos productivos/configuración/006 mantienen huella bd6623e723e247dbcb8af31980b0ce7c77e48156**; no cambian lógica, contratos validados, AuthContext, SecureStore, pantalla, dependencias ni navegación. Esta intervención añade un archivo de pruebas y actualiza SDD/memoria/changelog; conserva trabajo previo sin commit.

### Qué comprobar ahora desde Expo Go
1. Detener Metro anterior y ejecutar `npx expo start -c` para cargar los valores nuevos. No mostrar .env ni claves en capturas/logs. Abrir con Expo Go compatible y registrar versión/modelo sin datos personales.
2. Confirmar arranque sin error de configuración Supabase. Si existe todavía un contexto reciente válido, la verificación ya no debe bloquearse por configuración y el OTP debe ser editable; respetar loading/cooldown si están activos.
3. Recargar/reiniciar el proceso JS pierde el contexto efímero: abrir verify-email directamente mostrará la guarda de registro reciente y botones bloqueados. **Es esperado**, no prueba de configuración incompleta. No crear otro registro ni añadir correo a la URL para sortearlo. La disponibilidad con contexto se comprobó automáticamente sin crear usuarios.
4. Mientras SMTP siga pendiente, no pulsar verificar/reenvío ni generar registros para intentar recibir correos. No probar login real como si ya se hubiese completado la confirmación. La aceptación remota de la clave y el flujo real se comprobarán después en el entorno autorizado.
5. Mantener pendientes y separados: entrega/recepción OTP y reenvío SMTP; login real con lazy sync de Active y token AWS; restauración/perfil reales hasta recibir JSON de /auth/me y /users/me. Los contratos de login ya implementados no se modifican por esta comprobación.

**Estado005: EN PRUEBAS.** Configuración local e inicialización completadas; autenticación integral no terminada. Sin commits/pushes y sin claves/tokens publicados.

## 11. Contratos definitivos e integración técnica final — 2026-11-13

### Fuente de verdad y alcance real de la evidencia
El compañero backend, según reporte del usuario, confirmó SMTP de Supabase configurado con Gmail y plantilla **Confirm sign up** con `{{ .Token }}` para OTP de seis dígitos. **No se ha comprobado recepción real desde Expo Go por el agente.** No se solicitaron, copiaron ni incorporaron credenciales SMTP o claves de servidor.

También se recibieron los JSON definitivos de /api/v1/auth/me y /api/v1/users/me. Se habilitaron sus validadores existentes sin volver a registrar usuarios ni duplicar servicios. No hay bloqueo de schema para los contratos Buyer proporcionados; la etapa sigue EN PRUEBAS hasta el recorrido manual del usuario.

### DTOs y separación de responsabilidades
Tipos en `src/types/api.ts`, validadores en `src/services/api/sessionContract.ts`:
- **AuthMeResponse**: id, email y displayName string; roles validados; accountStatus Active. Es la fuente de identidad/autorización. MongoDB id se conserva exactamente, no se obtiene del sub o claims del JWT Supabase.
- **UserProfileResponse**: id, displayName y email string; roles validados; phone y avatarUrl **string|null**, presentes según contrato. Null permanece null en el User; no teléfono, foto o nombre ficticios.
- Solo Buyer está confirmado para esta iteración; se rechazan roles desconocidos/combinaciones no acordadas, no se inventa prioridad ni permisos. Campo extra accountStatus en un perfil editable no concede autorización: se usa el validado en identidad.
- Se comprueba id/email/rol coherente entre login, identidad y perfil. Login de otra cuenta, perfil de otro id/email o una identidad no Active bloquean la sesión y no se guardan como usuario válido.
- User.phone/avatar admiten null y accountStatus retiene Active validado. Perfil comprador utiliza displayName/email/avatar del perfil verificado; null avatar se representa por ausencia de uri en el componente existente, sin sustituirlo por una foto genérica. El teléfono no añade un campo visual nuevo al diseño.

### Login, restauración, errores y carreras
```text
Login explícito con email/password
  → POST HTTPS /api/v1/auth/login (AWS ejecuta lazy sync)
  → validar accessToken/expiresIn/Bearer/id/Buyer/Active
  → GET /api/v1/auth/me con Bearer AWS y validar identidad
  → GET /api/v1/users/me con Bearer AWS y validar perfil/coherencia
  → guardar solo accessToken en SecureStore
  → AuthContext authenticated con datos verificados

Reinicio con JWT existente
  → SecureStore.read
  → GET auth/me → GET users/me → validar ambos
  → restaurar User/perfil; nunca guardar contraseña ni inventar refresh
```

Sin JWT, restauración termina anonymous y no envía llamadas /me. Con JWT, los datos privados no se montan antes de validar. Un401 definitivo aplica la limpieza local existente; errores de red/timeout/403/5xx o respuesta inválida dejan el contexto sin usuario protegido, **sin eliminar automáticamente el JWT**. No se infiere correo no verificado de cualquier401. Los errores conservan los mensajes sanitizados existentes; un fallo de primer login no informa activación exitosa.

AuthSession conserva generaciones de sesión para restore/login/logout y agrega revisión de perfil para que prevalezca la última consulta. Un401 de perfil obsoleto tras otro login o refresco exitoso no borra la sesión nueva. AuthContext incrementa su revisión en refrescos, oculta los datos durante validación y queda blocked ante fallo. SecureStore conserva su clave/formato/serialización originales. No se modificó la política global HTTPS.

Perfil ya se hidrata durante login/restauración: se retiró el refresco por cada montaje/isAuthenticated que, al ocultar el usuario para validar, produciría un bucle de guardas/consultas. El componente mantiene su layout, estilos, labels y ruta; solo cambian el binding nullable y el aviso de que el formulario de edición todavía no forma parte de este alcance. El servicio PATCH existente mantiene lista blanca y vuelve a validar /me; no permite accountStatus, roles o id editables.

### OTP→login con correo prellenado
La fachada Supabase no cambia: verifyOtp email y resend signup, sin signUp/signInWithOtp de Expo ni sesión Supabase en AWS. Tras confirmar, el botón existente **Continuar al login** prepara en el mismo store efímero un hint de correo verificado de5min, elimina el contexto OTP y hace push a la misma ruta /login.

Login lee ese correo sin consumir durante render (compatible con StrictMode), lo limpia al montar y siempre comienza con contraseña vacía. No hay correo en parámetros de URL ni contraseña/OTP/JWT en el hint. No se ejecuta login automáticamente. Logout/reset y un nuevo registro eliminan el hint. El plazo local no es expiración del código ni garantía de sesión del servidor.

Una prueba de Expo Router real en memoria recorrió login previo con otros valores→registro simulado→OTP simulado→login: el correo final fue el verificado, la contraseña quedó vacía, no hubo parámetros de URL ni llamada automática a login. No se alteraron Stack/tabs/back/fallback/rutas006.

### Comprobaciones ejecutadas
| Check | Resultado real |
|---|---|
| Configuración efectiva Expo | URLs esperadas y clave pública presente/formato válido; solo booleanos |
| SDK real initialize/dispose con configuración local |3/3 casos opt-in aprobados, cero intentos de red |
| Contratos/coordinador/Context/pantalla OTP→login focalizados |122/122 en6suites |
| Router real de autenticación en memoria |1/1, fixture sin llamadas de red |
| npx tsc --noEmit |0errores |
| npm run lint |0errores,30warnings previos |
| npm run test:ci final |**337/337,26suites**;293 previas+44 casos nuevos |
| npx expo-doctor |20/20 |
| git diff --check |Sin errores de whitespace |
| Metro Android con caché limpia y root src/app |**HTTP200,2469módulos,12253ms** |
| Bundle |DTOs/handoff/URLs presentes y clave insertada, todo comprobado solo por booleanos; antigua IPHTTP ausente |

Metro usó puerto8100 y se detuvo. No se imprimió ni guardó manualmente el bundle. Las pruebas SDK, HTTP, SecureStore y perfiles usan datos sintéticos/mocks; no crean cuentas, verificaciones o correos reales. No hubo nuevas dependencias ni cambios de .env. Huella97 archivos protegidos **c65a49324aa5c17d44a1b11490ab7e1365b3d9fb** intacta: catálogo/categorías/imágenes/carrito/QR/pedidos, SDK/seguridad, componentes/tema y navegación/SDD006. El binding del perfil es la excepción autorizada por el usuario y no cambia sus estilos.

Se conservaron todas las suites. Se actualizaron únicamente expectativas antiguas que describían bloqueos /me ahora resueltos: contrato null→validadores, restauración bloqueada→validación de dos endpoints y PATCH antes bloqueado→actualización con revalidación. Casos inválidos/HTTPS/storage/logout se conservan; no regresiones automatizadas pendientes. No se considera verificación física por el hecho de pasar Jest.

### Guía real controlada Expo Go — cuenta institucional autorizada
1. Coordinar con backend una cuenta institucional autorizada y la política de duplicados. Confirmar proyecto, SMTP Gmail/plantilla Token y supervisión de Supabase Auth/MongoDB. No compartir contraseñas, app passwords SMTP, JWT ni OTP en capturas/logs. Registrar modelo/Android/Expo Go y hora.
2. Ejecutar `npx expo start -c` con Node24 LTS recomendado y abrir Expo Go compatible con SDK58. Confirmar inicio y health desde el diagnóstico existente si se necesita. No desactivar TLS ni guardas HTTP.
3. **Registro:** enviar una sola vez email/password/displayName mediante AWS. Backend comprueba identidad Supabase y perfil MongoDB Buyer/PendingEmailVerification ligado al sub correcto; no inferir la inserción solo por navegar a verificación.
4. **Correo:** comprobar recepción efectiva del mensaje de Gmail/Supabase y OTP6dígitos (incluida carpeta spam). Si no llega, detener repeticiones y revisar con backend logs SMTP/Auth/estado de cuenta, sin volcar cuerpos. La afirmación inicial de SMTP configurado no sustituye este paso.
5. **OTP:** mantener vivo el proceso JS, introducir el código y verificar. Probar incorrecto/expirado/reenvío únicamente de forma controlada, respetando cooldown y límites; reenvío no vuelve a registrar. La app debe informar confirmación Supabase sin afirmar todavía Active ni sesión AWS.
6. **Login:** pulsar Continuar al login. Correo correcto prellenado, contraseña vacía; introducirla manualmente. El primer login hace lazy sync en AWS. Si falla, registrar clasificación/status seguro y comprobar con backend; no afirmar que MongoDB se activó ni repetir altas.
7. **Active/perfil:** backend verifica el documento MongoDB correcto pasó a Active. El cliente valida login→auth/me→users/me y solo entonces guarda JWT/autentica. Abrir Perfil y comprobar nombre/correo/avatar reales; phone/avatar nulos no deben convertirse en información ficticia. No esperar un formulario de edición nuevo.
8. **Restauración exitosa:** mientras siga iniciada la sesión, reiniciar/reabrir la app sin logout. Reabrir Perfil por las rutas existentes (si aparece bienvenida, usar Seguir explorando). Debe consultar ambos /me sin pedir contraseña ni usar datos protegidos antes de validar.
9. **Logout:** cerrar sesión, comprobar retorno existente a bienvenida y ausencia de datos personales en pestañas privadas; el catálogo público debe continuar accesible.
10. **Reinicio después de logout:** debe permanecer como invitado. Para probar otra restauración exitosa, iniciar sesión otra vez con la misma cuenta y reiniciar **sin cerrar sesión**. Logout y restauración autenticada no son el mismo escenario.
11. En un entorno de prueba autorizado, comprobar token rechazado y fallo temporal de API manteniendo Expo Go ejecutándose:401 limpia sesión; red/timeout/5xx no borran el JWT ni muestran perfil sin validación. Recuperar conexión y reiniciar/reintentar validación. No imprimir el token para realizar el diagnóstico.

### Estado de cierre
- Implementado y probado automáticamente: configuración, registro existente, OTP/reenvío, correo efímero al login, validadores login/auth-me/users-me, perfil leído, restauración, logout y guardas.
- Reportado por backend: SMTP Gmail/Token y sincronización lazy Active. **Pendiente evidencia del recorrido físico**, recepción real, estados reales Supabase/MongoDB y aceptación de JWT por la API desde Expo Go.
- No bloqueos de schema pendientes para los DTOs Buyer recibidos. Otros roles y pantalla de edición de perfil quedan fuera del alcance confirmado; no se inventan permisos ni UI.
- Etapa005 **EN PRUEBAS**, no COMPLETADA hasta validación del usuario. Sin commits/pushes ni modificaciones a006.
