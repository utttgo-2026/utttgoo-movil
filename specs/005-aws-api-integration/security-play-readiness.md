# Registro→Login seguro y preparación Google Play

Estado: **EN PRUEBAS / NO LISTO PARA PUBLICAR**. Revisión local de la etapa005; no prueba física nueva, build, subida, merge o push. La fecha del entorno es2026-11-13; las fuentes públicas deben comprobarse nuevamente al enviar a Play. Este documento complementa spec/plan/tasks005, no inicia otra metodología.

## Flujo implementado y reversión
- Se reutiliza el único POST HTTPS `/api/v1/auth/register` con email/password/displayName del formulario. Solo200/202 y JSON compatible se aceptan. Ni la navegación ni un200 prueban persistencia en Supabase/MongoDB.
- `EXPO_PUBLIC_BETA_REGISTRATION_ONLY=true` en desarrollo/Beta interna ahora conduce **directamente al login**. Mismo flag, nuevo comportamiento solicitado: el acuse ya no es una parada obligatoria. Login muestra Registro recibido/cuenta posiblemente pendiente, correo prellenado y contraseña vacía. El hint vive5min en memoria, sin URL ni storage; no marca verified, no es una sesión y conserva el contexto OTP opcional.
- `false` o bandera ausente restaura registro→OTP original. Detener/reiniciar Metro con `npx expo start -c`; en una build cambia el bundle/recompila por el proceso aprobado. No borrar cuentas ni modificar Supabase para revertir UI.
- La variante release requiere perfil EAS `beta-registration`, marcador interno y application id `.beta`. Producción fuerza false y no tiene marcador. La bandera afecta recorrido/diagnósticos, **nunca autorización**. El mecanismo de titularidad sin OTP aún no aprobado impide habilitar este flujo en una publicación pública como autenticación completa.
- Login siempre necesita contraseña manual, respuesta AWS válida y ambos `/auth/me` y `/users/me` coherentes antes de guardar JWT/autenticar. No claims locales como prueba criptográfica, no JWT ficticio y ningún token Supabase se reutiliza como AWS. AWS verifica firmas/estado/autorización en cada endpoint protegido; Expo valida DTOs y usa al servidor como autoridad.
- No hay reintento automático tras red/timeout; doble pulsación no envía otro POST y después de aceptación la referencia received bloquea otro envío desde esa instancia. Esto no es idempotencia global: remonte/dispositivo/reintento manual requiere controles backend.

## Política de validación frontend
Las validaciones existen en formulario (feedback al escribir, sin impedir escritura) y frontera del servicio (antes de fetch). Se proyecta el cuerpo conocido, nunca HTML/WebView/eval. Mensajes del backend no se renderizan como HTML ni se vuelcan crudos.

| Campo | Regla aplicada | Contrato/límite pendiente |
|---|---|---|
| Nombre |string, NFC, espacios normalizados,2–100 puntos de código; input bruto≤400 UTF16, sin controles/formato; lista Unicode letras/marcas/espacios/apóstrofos/puntos/guiones |Es política local documentada, alinear con AWS; no inferir todos los nombres del mundo cubiertos |
| Email |string≤254, parte local≤64, sintaxis/dominio exacto@uttt.edu.mx, trim/lowercase, sin controles |Coincide normalización existente; titularidad no se demuestra por formato |
| Password |string no vacío ni solo espacios, techo local4096UTF16; sin trim, normalización, coerción o restricción de símbolos |OpenAPI no publica mínimo/máximo/complejidad. Recomendación≥12 visible, no se impone como regla Supabase inventada. Backend debe confirmar política y máximo efectivo (incluidos límites del hash) |
| Confirmación |Debe coincidir exactamente; nunca se envía |No persistir para auto-login |
| JSON |objeto y lista de campos permitidos; operadores/arrays/números donde se esperan strings rechazados |AWS debe volver a validar esquema y rechazar mass assignment |

HTML/JS en nombre se rechaza por su gramática, no por una lista negra de palabras. Contraseñas con `<`, comillas, números, Unicode o símbolos son datos legítimos y se conservan. NoSQL `{ "$ne": null }`/`{ "$gt": "" }` en campos string se rechaza por tipo; esto **no prueba que las consultas de AWS sean seguras**. Casos malformados/peligrosos solo en mocks; ningún ataque al host público.

## Errores y diagnósticos
- `[aws-register]` solo dev/Beta interna explícita: formulario, validación fallida, despacho, origenHTTPS, inicio fetch, status y clasificación fija de error. No email/password/OTP/JWT/headers/cuerpos; timestamp para correlación. Nada de claves en logs ni snapshots.
-401/403: mensajes genéricos, no aseguran que el correo no esté verificado;422 validación genérica;429 pide esperar;5xx/red/timeout no indican éxito. No hay Retry-After de registro/login implementado ni rate-limit local que sustituya al servidor: **pendiente backend/contrato**.
- Restauración401 limpia token según política, fallos temporales conservan JWT sin montar usuario protegido. Sin refresh supuesto. TTL real/expiración y revocación se validan en AWS; expiresIn del login se valida, no renueva sesiones por sí solo.
- No credenciales persistidas fuera del JWT AWS en SecureStore; AsyncStorage legacy no es autoridad de sesión y no se borra globalmente.

## Contrato real revisado y bloqueo de titularidad
Se consultó nuevamente por GET HTTPS `/openapi/v1.json` sin credenciales. Publica register/login/me, registro200 sin schema de respuesta, y **servers aún HTTP**: inconsistencia backend pendiente, el móvil no adopta ese origen. El contrato ampliado /me y lazy sync procede del equipo, no del OpenAPI incompleto.

No se encontró en documentación recibida/publicada una verificación por enlace o SSO institucional aprobada. No se deduce de esa ausencia que ninguna exista internamente. **Bloqueo:** cuentas nuevas PendingEmailVerification siguen rechazadas en login hasta confirmación. Solo cuentas previamente verificadas/autorizadas pueden probar acceso Beta; no marcar Active manualmente en Expo ni aprobar titularidad basándose en el texto del email.

### Mensaje técnico para backend
> El móvil ya soporta registro→login sin auto-login. AWS debe mantener pendiente la cuenta hasta prueba de titularidad. Necesitamos confirmar/definir un flujo de enlace de confirmación o SSO institucional: iniciador, emisor/proyecto, URL/callback permitidos, expiración/uso único, correlación/PKCE o nonce según flujo, errores y sincronización del sub con MongoDB. No emitiremos JWT ni solicitaremos Active desde Expo. Publicad el contrato exacto y las respuestas de cuenta pendiente/no autorizada sin enumeración. No basta desactivar Confirm email. Para Beta proporcionad cuentas de prueba ya verificadas y autorizadas. También faltan política de contraseñas y límites, errores/rate-limit y eliminación de cuenta. Corregid servers HTTP en OpenAPI sin downgrade de solicitudes protegidas.

## Requisitos y pruebas del backend (no inspeccionado)
No hay repositorio AWS ni panel Supabase/MongoDB disponible. **No se afirma que estén implementados**:
- DTOs estrictos y límite de bytes/longitudes en gateway y aplicación, tipos escalares, campos permitidos y política de contraseña acordada. Rechazar roles/accountStatus/id extras y objetos con operadores como valores de email/password/nombre.
- MongoDB: filtros construidos por el servidor con valores tipados, sin concatenar JSON/operadores arbitrarios, `$where`/eval o consultas del cliente. Si hay SQL, parámetros, nunca concatenación. Pruebas de operadores anidados/prototype pollution/arrays y errores sanitizados.
- Redis/gateway: rate limiting por origen y cuenta con política que evite bloquear víctimas,429/Retry-After, límites de OTP/login/register, observabilidad sin cuerpos, protección ante enumeración por mensajes/status/tiempo (sin necesidad de respuestas falsas de sesión).
- Unicidad del email normalizado y sub del proveedor, idempotencia y recuperación de altas parciales Supabase/MongoDB. Verificar que repetir solicitudes no crea dobles perfiles.
- Firma JWT con algoritmo permitido, issuer/audience/exp/nbf y autorización server-side, revocación/sesiones, verificación confiable email_confirmed_at y Active; rechazo uniforme de cuentas no autorizadas.
- Rotación **coordinada por el administrador** del secreto JWT previamente compartido fuera de su entorno protegido, evaluación de tokens afectados/invalidación y actualización de verificadores. Su valor no se incorpora ni se necesita en Expo. Publishable key es configuración pública, no reemplaza ese secreto.
- Eliminación autenticada/solicitud con prueba de titularidad y limpieza coordinada Supabase/MongoDB/Redis, retención declarada y recurso web. No endpoints inventados desde el móvil.

## Auditoría Google Play (sin build/release)
| Área | Hallazgo y pendiente |
|---|---|
| Identidad |NombreUTTT-Go, package normal `mx.edu.utt.uttgo`; Beta `.beta`. Confirmar propiedad/disponibilidad del applicationId antes del primer envío; después no cambiar arbitrariamente |
| SDK Android |RN instalado define min24/target36/compile37 en `react-native/gradle/libs.versions.toml`. Fuente Google consultada exige API36 para nuevas apps/updates desde31ago2026. **No es medición del AAB final**: confirmar merged manifest/target real en build autorizada y política vigente al publicar |
| Permisos |Introspección producción previa incluía INTERNET,VIBRATE,SYSTEM_ALERT_WINDOW y lectura/escritura externa. Se bloquean estos últimos3 solo en perfilproduction; introspección muestra `tools:node=remove`. Conservar INTERNET, revisar necesidad de VIBRATE. Auditar manifest final y SDKs; no declarar permisos mínimos del binario sin compilar |
| AAB |eas.production usa app-bundle; preview es APK, no publicarlo como AAB. No se generó artefacto. Falta build interna autorizada, versionCode/autoIncrement y pruebas Android |
| EAS/firma |Introspección no indica projectId enlazado; firma/keystore/Play App Signing/upload key no verificados. Workflow preview actual es scaffolding y usa Node20; CI usa24, alinear workflow cuando se autorice. No configurar secretos/firma ni disparar builds ahora |
| Producción |Flag Beta false y marcadorfalse comprobados; URLsHTTPS. No publicar bundle dev, no dejar el proyecto `.beta` como aplicación pública ni confiar en variables como controles de autorización |
| Icono/splash |Rutas y plugin existentes; pendiente revisar render en dispositivos/AAB, tamaños/adaptive/monochrome, capturas/feature graphic y derechos de recursos |
| Privacidad |Formulario tiene texto Términos/Aviso, pero no política pública enlazada/completa verificada. Bloqueo: URLHTTPS pública, responsable/contacto, finalidades, proveedores AWS/Supabase/Gmail, retención/borrado, ubicación y transferencias según uso real |
| Data safety |Pendiente completar en Play Console según tráfico real: nombre/email/credenciales/identificadores/perfil/contacto opcional, datos de actividad/pedidos cuando se implementen, SDKs. No marcar "no recolecta" por usar TLS. Publishable URL/key estarán en bundle por diseño; ningún secreto de servidor debe estarlo |
| Eliminación |No hay ruta app ni recurso web de eliminación implementados/confirmados. Requisito Play para apps con alta de cuentas, aun con invitado. Bloqueo hasta contrato y mecanismo real; no botón falso |
| Acceso revisión |Proporcionar a Play instrucciones/cuenta autorizada verificada sin exponer credenciales en repositorio; clasificaciones de contenido, audiencia, declaración ads, soporte y verificación de desarrollador pendientes |
| Funciones mock |Catálogo/categorías/pedidos/QR/reseñas y algunos botones son prototipo; no se sustituyen en esta tarea. Auditar funcionalidad mínima/listing honesto y evitar presentar compras mock como reales. No listo para tienda |
| Secretos/bundle |.env ignorado, revisión de archivos a commit con detectores y comparación local sin imprimir valores; scanner no acredita ausencia absoluta en toda la historia/infra. Antes de release inspeccionar binario/bundle/config y credenciales del entorno de build |

Fuentes consultadas: [Target API](https://support.google.com/googleplay/android-developer/answer/11926878), [Account deletion](https://support.google.com/googleplay/android-developer/answer/13327111). Las políticas cambian; revisar al envío. No subida ni `.aab` pública con bloqueos de titularidad, privacidad o eliminación.

## Auditoría de dependencias
`npm audit --json`:28 hallazgos (27moderados/1bajo,0altos/0críticos). `npm audit --omit=dev --json`:21 (20moderados/1bajo). Aparecen herramientas Expo fingerprint/minimatch/glob, cadena Jest/babel/test-exclude y deepmerge; omitdev todavía incluye herramientas por el grafo Expo, **no prueba explotación en runtime del APK**. No aplicar `npm audit fix --force`: las propuestas incluyen downgrade mayor Expo52/Jest29 incompatible con el stack58. Mantener lock y planificar actualización compatible/testeada y evaluación de alcance antes de release. Doctor compatible no significa auditoría de seguridad limpia. Node24 LTS recomendado; Node25.4 local fuera de engines de Expo/Metro.

## Prueba manual y evidencia de persistencia
1. Coordinar cuenta institucional autorizada y comprobar si ya existe en ambos sistemas. Mantener backend observando hora UTC, ruta/status sin logging de password/cuerpo/JWT. No reenvíos masivos ni ataques en producción.
2. Flag local true, `npx expo start -c`, abrir Expo Go. Introducir nombre real legítimo, correo propio y contraseña; pulsar Crear cuenta una vez. Debe ir a login con acuse pendiente/correo prellenado y contraseña vacía, nunca entrar automáticamente.
3. Backend confirma **por separado** identidad Supabase Auth, perfil MongoDB, vínculo al sub y PendingEmailVerification; comprobar cantidad y ausencia de duplicados. Anotar sí/no, hora y referencia de prueba sanitizada, no documentos completos/credenciales. En esta intervención **no hay evidencia backend nueva**, no se afirma alta real.
4. Si hubo timeout/5xx/red, no inferir que no se creó ni repetir a ciegas: consultar persistencia primero. Los logs [aws-register] identifican si se llamó fetch y el código recibido; request_start no acredita llegada al servidor.
5. Login de cuenta pendiente debe rechazarse según AWS. Cuenta Beta previamente verificada por backend: introducir contraseña, comprobar login+/me+perfil, restauración sin logout y logout+reinicio invitado. Nunca marcar Active desde Expo.
6. Para flujo normal false y reiniciar Metro: registro→OTP original. Acceso opcional en login conserva OTP del registro reciente; contexto se pierde al reiniciar/30min, no repetir registro para recuperarlo sin consultar backend.

## Commit local y límite de cierre
Usuario autorizó expresamente commit del trabajo auth005 seguro, incluso con bloqueos backend/prueba física abiertos, **sin push**. Se incluyen avances relacionados acumulados desde91799ca:Supabase/OTP, contratos/login/perfil/restauración, Beta/config/tests/SDD y esta auditoría. No cambios006 ajenos, .env, coverage, .expo, secretos ni artefactos. La lista exacta está en el commit y su hash se entrega al finalizar. No equivale a validación Expo Go ni aprobación de release.

Verificación final: **405/405 pruebas,28 suites,0 omitidas**; TypeScript0errores, ESLint0errores/30warnings previos, Doctor20/20, diffcheck limpio. Bundle Android dev con caché limpia/rootsrcapp:HTTP200/2470módulos, URLs/handoff presentes, sin IPHTTP anterior (comparaciones booleanas, no valores de claves). Metro detenido; no teléfono ni build AAB. Revisión de50 archivos preparados: ningún .env/artefacto bloqueado ni patrón de secreto detectado y clave publishable local no incluida. Scanner heurístico+revisión humana de diff, no garantía sobre infraestructura/historial completo.
