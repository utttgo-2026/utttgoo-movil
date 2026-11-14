# Plan 005 — AWS-API-INTEGRATION

## Información General
- **Spec**: 005-aws-api-integration
- **Versión**: 1.0
- **Fecha**: 2026-11-11
- **Estado**: EN PRUEBAS — implementación técnica verificada localmente, cierre funcional pendiente.

## 1. Arquitectura
Mantener Context API, Expo Router, componentes y modelo de presentación User. Incorporar módulos pequeños en src/services/api, tipos de transporte en src/types/api.ts y validaciones conocidas en src/utils/apiValidation.ts. mockApi conserva su responsabilidad actual.

## 2. Fases de Implementación
1. Spec → este plan → tareas, antes de código.
2. .env ignorado y .env.example con origen público HTTPS confirmado en la continuación (inicialmente vacío). config.ts usa process.env.EXPO_PUBLIC_API_BASE_URL estático; validar origen HTTP/HTTPS sin credenciales, query, fragmento ni path adicional.
3. httpClient: fetch inyectable para tests, timeout AbortController, métodos limitados, JSON unknown, status/headers conservados y ApiError central. Únicamente GET /health sin token/body sobre HTTP; demás llamadas HTTPS. Sin reintento de mutaciones ni tokens en URL/logs. El backend HTTPS debe evitar redirects de downgrade; redirect:error se solicitará pero su soporte real en RN debe verificarse.
4. Servicios health/auth/users/sellers/admin: status esperado por endpoint, rutas exactas, listas blancas y parámetros conocidos; no mapear DTO no documentados.
5. Instalar expo-secure-store mediante expo install (SDK 58). sessionStorage guarda solo JWT, con errores explícitos y sin fallback inseguro.
6. AuthContext único: estados de restauración, anónimo, bloqueado y autenticado. Adaptadores de respuesta deliberadamente bloqueados hasta contrato; servicios login/register disponibles, login falla cerrado antes de enviar si no hay contrato. Registro 202 no crea sesión. Validar token con auth/me; perfil con users/me. Logout invalida operaciones y elimina token. Serializar mutaciones del storage para evitar restauraciones/escrituras tardías.
7. Pantallas existentes: validación institucional, error visible, loading; navegación exitosa solo al resultado correcto. Verificación/recuperación sin éxito ficticio. Perfil consume el mismo contexto, sin formulario nuevo inventado. Habilitar la acción ya diseñada de explorar como invitado para conservar acceso al catálogo sin sesión ficticia. Diagnóstico manual /health dentro de la tarjeta informativa de login exclusivamente con __DEV__, sin pantalla nueva ni cambio de tema.
8. Pruebas unitarias y verificaciones. Diagnóstico /health real por separado; probar Expo Go solo si dispositivo accesible. Habilitar Jest como job de CI/gate al existir tests; usar Node 24 compatible con engines de Expo 58 (el workflow anterior usa Node 20).
9. Tareas con evidencia, Constitución/AGENTS si cambia alcance, memoria y changelog.

## 3. Estrategia de migración de AsyncStorage
No leer, migrar ni borrar @uttgo:users automáticamente. Es un registro local legacy, no una sesión AWS. La implementación nueva no guardará contraseñas y nunca usará esos registros como autoridad. Una limpieza futura requiere inspección local sin exponer datos, autorización, eliminación dirigida de esa clave y prueba de que el resto del storage permanece. No ejecutar clear(). Mantener la dependencia para datos ajenos al alcance.

## 4. Contratos incompletos
Los servicios retornan ApiResponse<unknown>, salvo health validado a partir de respuesta observada. No usar casts a User ni suponer accessToken/data/roles. Un módulo de adaptadores bloqueado documentará exactamente dónde implementar el decodificador una vez recibido OpenAPI. No exponer setters de token en Context ni signInAs.

PATCH: validar campos y tipos conocidos; los límites/regex no documentados son un bloqueo para afirmar validación funcional completa. No enviar null ni extras. No usar filtros admin desconocidos.

## 5. Verificación y aceptación
- npx tsc --noEmit
- npm run lint
- npm run test:ci
- npx expo-doctor
- GET /health: status, headers, JSON, duración y origen de prueba.
- Expo Go: iniciar Metro y verificar disponibilidad de dispositivo; si no lo hay, registrar pendiente, no éxito.
- Tests: HTTP inseguro no llama fetch, 200/201/202, errores HTTP/no JSON, timeout/red, Bearer, correo, PATCH y sesión segura/logout incluyendo carreras.

## 6. Bloqueos de cierre
HTTPS, contratos JSON/errores/roles, límites de campos, relación Supabase-AWS y prueba en Expo Go. Mantener EN DESARROLLO/EN PRUEBAS hasta evidencia; infraestructura implementada no equivale a login real verificado.

## 7. Preparación de publicación HRDCORE — 2026-11-12
El usuario solicita commit/push a HRDCORE y autoriza expresamente corregir el bloqueo de Doctor actualizando solo el parche Expo58.0.24→58.0.25 y su lockfile. Conservar el resto de dependencias directas y la implementación005/006; verificar tsc/lint/tests/Doctor y documentar resultados antes de publicar. No confundir esta autorización con cierre funcional de autenticación ni validación física P2/P3. Referencia de37 archivos protegidos fuera del ajuste:34da1bb65f37b94cb59fa367ee96e0c589d34744.

## 8. Corrección puntual HTTPS/registro — 2026-11-12
1. Inspeccionar dotenv y precedencia real de Expo sin volcar variables ajenas. .env ya contiene https://3.129.142.54.nip.io; confirmar ausencia de .env.local/variantes y overrides heredados. Sin fallback en config.ts. Actualizar .env.example con el origen confirmado.
2. GET /health y OpenAPI HTTPS con validación TLS predeterminada; HEAD/OPTIONS registro y GET /me anónimos sin redirects ni POST. Registrar certificado, status y alcance limitado de la comprobación. OpenAPI servers HTTP es inconsistencia del backend, nunca fuente de URL runtime.
3. Conservar POST /api/v1/auth/register y cuerpo exacto email/password/displayName, validación @uttt.edu.mx, guardas HTTPS y redirect:error. Aceptar200 documentado y202 compatible, ambos sin JWT/setUser/verificación de correo. AuthContext/SecureStore/contrato de sesión intactos.
4. Diagnóstico __DEV__ con proyección de campos permitidos: formulario→despacho→inicio fetch HTTPS→status/fallo. No registrar inputs, confirmación de contraseña, respuesta, headers, tokens o errores crudos; sin nuevos controles ni cambios de navegación/diseño006.
5. Tests de configuración/transporte/servicios/coordinador y formulario con datos sintéticos/fetch simulado. Luego tsc/lint/Jest/Doctor y bundle si procede; protocolo manual con cuenta institucional autorizada y observación backend MongoDB. No commit/push en esta continuación.

## 9. Implementación OTP confirmada por backend
1. Instalar supabase-js y polyfill URL compatible RN, reutilizando SDK58/componentes/SecureStore; registrar versiones y diff del lock. No actualizar otras dependencias directas. Huella77 archivos protegidos antes de comenzar: d2b637eb2c7d3aebd9777e18126d08a14d7c5d65.
2. Configuración Supabase estática separada de AWS: URL HTTPS y publishable key públicas vacías hasta entrega del equipo. Rechazar claves secretas/service_role; no inventar valores.
3. Fachada reutilizable restringida a verifyOtp/resend, instancias SDK efímeras sin persistencia/auto-refresh/URL sessions; proyectar solo resultado de confirmación, sin exponer tokens ni conectar SDK al AuthContext. No signOut remoto para desechar la sesión de confirmación.
4. Contexto efímero de registro exitoso en memoria, externo a AuthContext y URLs; caducidad local30min (no es expiración del OTP del proveedor). Correo se establece solo tras POST AWS aceptado. Id de flujo impide aplicar respuestas tardías a otro registro; lock compartido evita verificar/reenviar simultáneamente.
5. Pantalla existente: mismo Screen/Surface/input/estilos P2; OTP editable, CTA verificar, feedback accesible y continuación al login solo tras confirmación. Cooldown por deadline en memoria sobrevive remontaje/segundo plano, no reinicia por cada render. No cambios en006/root/tabs/rutas.
6. Pruebas de errores/códigos/configuración/cooldown/concurrencia/flujo caducado, no duplicación de registro y conservación de sesión AWS. Verificaciones finales y SDD con bloqueos SMTP/configuración/Active/JWT/ExpoGo separados.

## 10. URL Supabase y contrato de login recibidos
1. Reutilizar SDK/pantalla OTP/servicios. Modificar solo URL pública en .env y ejemplo, conservando el campo publishable local sin leer/imprimir su valor. No nuevas dependencias. Huella81 archivos protegidos antes de esta continuación: b49d9050ef82167766813a3fff187582e58ad980.
2. Implementar parser runtime de login en sessionContract.ts según contrato recibido; proyectar exclusivamente propiedades conocidas, sin JWT secret ni generación/decodificación local del JWT. expiresIn se valida como duración positiva, no se inventa refresh.
3. Extender el contrato del coordinador con identidad opcional desde login y capacidades /me anulables. En producción, login usa el User mínimo del DTO confirmado; las pruebas de contratos /me sintéticos siguen identificadas como fixtures. Validar antes de escribir token y conservar guardas de generaciones/logout.
4. No suponer /auth/me=/users/me=login. Restaurar/perfil fallan cerrado con contract_unavailable antes de esas llamadas si no hay decodificadores confirmados; token no se borra por este bloqueo. AuthContext/SecureStore/006 intactos.
5. Tests de campos inválidos, Buyer/Active, fallo de escritura, HTTP, carreras de logout, restauración bloqueada y no mezcla Supabase/AWS, usando fetch/SecureStore simulados. Ejecutar todos los checks solicitados y actualizar pendientes reales; no POST/reenvíos reales, commits ni pushes.

## 11. Comprobación local de configuración pública aportada
1. Solo tests/documentación: lógica de auth, SDK, pantalla y contratos no cambian. Huella inicial127 archivos productivos/configuración/006, excluidos tests: bd6623e723e247dbcb8af31980b0ce7c77e48156.
2. Cargar entorno con @expo/env en modo development y reportar exclusivamente booleanos de presencia/formato/orígenes esperados. No volcar .env, claves, tokens ni respuestas crudas. Confirmar ausencia de overrides heredados y .env.local.
3. Test opt-in con el entorno efectivo: crear SDK real con las opciones aisladas existentes, initialize/dispose; interceptar todo fetch y exigir cero intentos de red. Probar pantalla sin pulsar acciones: registro sintético solo en memoria de Jest permite comprobar que no hay bloqueo de configuración, y ausencia de contexto conserva su guarda.
4. Verificar Metro con caché limpia y URLs/clave pública insertadas en bundle mediante comparaciones booleanas en memoria, sin imprimir/guardar el bundle. No ejecutar métodos de registro, verifyOtp, resend o login reales.
5. Registrar resultados y distinguir configuración local inicializada de aceptación remota de la clave/entrega SMTP. Conservar pendientes login físico, recepción OTP, lazy sync y contratos /me para restauración/perfil; sin commits/pushes.

## 12. Contratos definitivos /me y cierre técnico de autenticación
1. Registrar SMTP Gmail/Token como reporte del backend, no prueba física. Configuración solo por booleanos e inicialización SDK sin red. Base protegida97 archivos (fuera de perfil comprador autorizado): c65a49324aa5c17d44a1b11490ab7e1365b3d9fb.
2. Añadir DTOs AuthMe/UserProfile en tipos API y parsers runtime en sessionContract existente; normalizar correo institucional, validar Buyer/Active, preservar phone/avatarUrl null. No confundir MongoDB id/sub Supabase ni ampliar permisos no confirmados.
3. Login valida /auth/me y /users/me y coherencia con DTO de login antes de almacenar JWT/autenticar. Restauración reutiliza el mismo coordinador y servicios; sin contraseña persistida/refresh nuevo. /me inválido no monta información privada.
4. Revisiones de perfil y generaciones de sesión rechazan respuestas obsoletas, incluidos401 tardíos. AuthContext oculta usuario mientras valida y en error, preserva token en errores temporales. Evitar bucle de refresco del perfil al remontar guardas: hidratar desde login/restauración, no refrescar por cada cambio de isAuthenticated.
5. Extender estado efímero existente con handoff de correo verificado al login (5min locales, sin contraseña/URL). Leer sin consumir durante render para StrictMode y limpiar al montar login/logout; mismo push/back y rutas006.
6. Solo binding de datos en perfil existente y adaptación null→ausencia de uri en Avatar, sin alterar estilos. La edición de perfil no obtiene una pantalla nueva en este alcance.
7. Mantener tests existentes, actualizar expectativas que describían bloqueo /me ya resuelto y añadir contratos/null/coherencia/races/OTP→login/perfil/guardas. Ejecutar comandos pedidos y preparar guía física que distinga reinicio con sesión de reinicio tras logout. Sin operaciones reales automáticas ni commits/pushes.

## 13. Experimento Beta de solo registro
1. Mantener trabajo previo y congelar125 archivos fuera de los cambios del formulario/diagnósticos/config Beta:96e67cb8a3b02bec0e711aea5b337a818e973eed. No modificar API/auth/session/OTP ni006.
2. Config de bandera pública estática con doble identificación para release: perfil EAS beta-registration (distribution internal), app id mx.edu.utt.uttgo.beta y extra.internalBetaRegistration=true generados por app.config.ts. Defaults normales/producción no marcan Beta; web/ExpoGo release no son builds internas. Reutilizar expo-constants/Platform instalados, sin dependencias nuevas.
3. .env local true para la prueba Expo Go, ejemplo false y production EAS false. No imprimir ni copiar clave Supabase. No ejecutar builds automáticamente.
4. Acuse como estado del formulario actual, no pantalla/ruta nueva: recibido/no verificado/no sesión/no evidencia DB. Conservar opción manual a verify-email y navegación pública existente. Exploración invitada cierra una sesión previa solo si es necesario, usando logout existente y sin forzar navegación si falla.
5. Reutilizar pipeline y diagnósticos, habilitados también en Beta interna explícita. Agregar evento local de validación sin valores. Mantener guardia síncrona contra duplicados y acuse terminal, sin retry tras timeout.
6. Tests de gates dev/internal/production, app config,200/202 Beta/normal, errores/red/timeout, duplicación y guardas invitadas. Actualizar manual de backend (Supabase+Mongo+vínculo+Pending) y reversión; nunca marcar persistencia confirmada sin evidencia del equipo.

## 14. Registro→login / DevSecOps / Play
Reutilizar el hint en memoria para un acuse pending (no verified), dirigir Beta al login sin contraseña; mantener OTP por banderafalse y acceso opcional existente. Validar nombre/correo/tipos/longitudes en UI y authService, sin recortar contraseña ni inventar política Supabase. Errores429 genéricos y límites backend documentados. Reparar test omitido de duplicación usando eventos no bloqueantes: RNTL14 espera promesas retornadas por handlers, no aumentar timeout ni eliminar pruebas. Auditar npm y valores Android nativos/Play sin generar builds; revisar diff completo y secretos antes de commit local autorizado del trabajo005 acumulado. Mantener pruebas físicas/backend pendientes.
