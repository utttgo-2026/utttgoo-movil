# Specification 005 — AWS-API-INTEGRATION

## Información General
- **ID**: 005-aws-api-integration
- **Nombre**: AWS-API-INTEGRATION
- **Versión**: 1.5
- **Fecha**: 2026-11-11
- **Estado**: EN PRUEBAS — login, identidad/perfil, restauración y OTP→login integrados y probados automáticamente. SMTP Gmail y plantilla Token reportados por backend; recorrido físico pendiente de validación del usuario, no COMPLETADA.

## 1. Objetivo
Conectar progresivamente el cliente Expo SDK 58 con la API AWS usando fetch, TypeScript estricto y el único AuthContext existente. Conservar UI Figma, navegación y mocks del comprador.

## 2. Requisitos y aceptación
| ID | Requisito | Criterio de aceptación |
|----|-----------|------------------------|
| AWS-001 | URL en .env y lectura estática centralizada | Sin IP en servicios, sin fallback silencioso; error de configuración ante URL inválida |
| AWS-002 | GET /health público | Registrar status, headers, JSON y entorno; no inferir éxito móvil desde curl |
| AWS-003 | Cliente GET/POST/PATCH JSON | Preservar status/headers; soportar 200/201/202 y errores HTTP, timeout y red |
| AWS-004 | Protección de transporte | Solo /health público por HTTP; ninguna contraseña/JWT debe llegar a fetch sobre HTTP |
| AWS-005 | Servicios tipados de todos los endpoints acordados | Solicitudes conocidas exactas; respuestas desconocidas como unknown, sin DTO inventado |
| AWS-006 | JWT con SecureStore | No contraseñas; lectura/escritura/eliminación verificadas mediante tests; no fallback AsyncStorage |
| AWS-007 | Única sesión en AuthContext | Sin usuario ficticio/signInAs; restauración validada remotamente antes de autenticar; logout invalida operaciones pendientes |
| AWS-008 | Correo institucional | Dominio exacto @uttt.edu.mx; rechazar dominios parecidos, subdominios y formato incorrecto |
| AWS-009 | PATCH con listas blancas | Solo displayName/phone o businessName/description/pickupPoint; rechazar null, extras y tipos incorrectos |
| AWS-010 | Errores centralizados | 400/401/403/404/422/500 diferenciados; no deducir correo no verificado de todo 401 |
| AWS-011 | Respuesta de registro no autentica | 200 (OpenAPI actual) o202 (compatibilidad anterior) no prueban persistencia, verificación ni sesión; no OTP local ni relación Supabase/AWS inventada |
| AWS-012 | Migración no destructiva | No leer, reusar ni borrar automáticamente @uttgo:users; conservar datos hasta estrategia explícita validada |
| AWS-013 | Pantallas existentes | Adaptar manejadores/estados de auth y perfil; conservar componentes y catálogo/carrito/pedidos/QR |
| AWS-014 | Evidencia de calidad | tsc, lint, Jest y Doctor ejecutados; distinguir tests con mocks y AWS/Expo Go real |
| AWS-015 | Diagnóstico seguro de registro | Solo desarrollo: etapas formulario/despacho/fetch/respuesta/fallo, origen público/código HTTP y clasificación fija; nunca cuerpo, correo, nombre, contraseña, token, headers ni error crudo |

## 3. Endpoints acordados
| Método | Ruta | Auth | Solicitud / status esperado |
|--------|------|------|-----------------------------|
| GET | /health | Público | 200; contrato observado: status y checks mongodb/redis |
| POST | /api/v1/auth/register | Público, HTTPS | email, password, displayName;200 documentado en OpenAPI2026-11-12,202 conservado como compatibilidad anterior |
| POST | /api/v1/auth/login | Público, HTTPS | email, password;200 con accessToken/expiresIn/tokenType y user.id/roles/accountStatus confirmados por backend |
| GET | /api/v1/auth/me | Bearer |200: id/email/displayName/roles/accountStatus; identidad Buyer/Active validada |
| GET/PATCH | /api/v1/users/me | Bearer |GET200: id/displayName/email/phone/ avatarUrl/roles; phone y avatarUrl string o null. PATCH solo displayName/phone existente |
| POST | /api/v1/sellers/activation-requests | Bearer | businessName, description, pickupPoint; 201 o 200 |
| GET/PATCH | /api/v1/sellers/me | Bearer | PATCH solo businessName, description, pickupPoint; 200 |
| GET | /api/v1/sellers/{sellerId} | Público | 200; en esta etapa también requiere HTTPS |
| GET | /api/v1/admin/users | Bearer/admin | page, pageSize; 200; sin filtros inventados |

## 4. Dependencias y bloqueos
- HTTPS/TLS verificados desde PC2026-11-12 en https://3.129.142.54.nip.io; validación Android pendiente. No enviar credenciales ni JWT mientras la URL configurada sea HTTP. OpenAPI publica servers HTTP: no usarlo como configuración ni seguir redirects.
- Contratos de login, /auth/me y /users/me confirmados por el equipo. Mantener DTOs distintos y comprobar coherencia id MongoDB/email/roles; identidad Active a cargo de /auth/me, campos editables de /users/me. Solo Buyer está confirmado, sin permisos derivados de roles desconocidos.
- Contrato OTP confirmado por el equipo: AWS crea identidad Supabase y perfil MongoDB vinculado al sub, Buyer/PendingEmailVerification. SMTP Gmail configurado y plantilla Confirm sign up con Token reportados por backend; recepción real y transición lazy Active todavía sin validación física.
- Faltan límites de longitud, formato de phone y política de contraseña. Validación local estructural solamente; no afirmar validación completa de formatos/límites.
- Falta contrato de recuperación y refresh; no implementar endpoints supuestos.
- Expo Go físico: no marcar integración COMPLETADA hasta prueba manual y flujos HTTPS reales.

## 5. Estrategia de pruebas
Jest existente, fetch y SecureStore simulados: URL, métodos, cuerpos, Bearer, bloqueos antes de fetch, respuestas/status, JSON inválido, errores/red/timeout, listas blancas, sesión, carreras de logout y persistencia. Fixtures únicamente sintéticos, nunca ejemplos atribuidos al backend.

Verificación real separada: GET público /health sin credenciales desde desarrollo y, si existe dispositivo, Expo Go. Registrar restricciones nativas sin desactivar ATS/cleartext globalmente. No probar login real por HTTP.

Continuación HTTPS: no POST reales ni cuentas creadas por verificaciones automáticas. Consultar HEAD/OPTIONS de registro y GET /me sin credenciales, sin seguir redirecciones, para diagnóstico no mutante. Esto no demuestra el comportamiento de POST; el backend debe confirmar ausencia de downgrade en ese método y evidenciar persistencia MongoDB durante la prueba manual autorizada. No inferir creación de usuario desde Healthy.

## 6. Fuera de alcance
Productos/categorías/imágenes reales, rediseño UI, carrito/pedidos/QR, pantallas vendedor/admin, producción en tiendas y nuevo framework SDD.

## 7. Confirmación OTP autorizada
- Expo usa exclusivamente verifyOtp({email,token,type:'email'}) y resend({type:'signup',email}); nunca signUp/signInWithOtp ni otro registro.
- Correo normalizado del último registro AWS aceptado, en memoria efímera; no confiar en parámetros de URL ni persistir contraseña/OTP. Entrada directa/reinicio sin contexto no permite verificar/reenviar.
- Código de seis dígitos, exclusión mutua de operaciones, loading accesible, errores sanitizados y cooldown visual de reenvío (mínimo60s; respetar429/Retry-After). Confirmación obtenida del proveedor, nunca comparación local.
- Cliente de confirmación sin persistencia, auto-refresh ni detección de sesión en URL. Ningún token Supabase llega a AuthContext/SecureStore AWS; descartar cualquier sesión devuelta sin hacer logout remoto.
- Verificado en Supabase no implica MongoDB Active ni sesión AWS. Continuación explícita al login existente; backend confirma sincronización lazy durante login. No webhook/endpoint de activación supuesto. sessionContract habilita solo las capacidades respaldadas por el contrato recibido.
- Tests con proveedor/fetch simulados; envío real bloqueado hasta URL/key públicas correctas, SMTP y entorno autorizado. Etapa006 intacta, sin commits/pushes.

## 8. Configuración real y login confirmado
- URL pública Supabase: https://tabhbylbhewtehvirexn.supabase.co. Clave publishable se aporta solo en .env local; si está ausente, OTP/reenvío no se ejecutan. AWS permanece HTTPS sin cambios.
- Validar todas las propiedades del login antes de almacenar accessToken; rechazar tokens vacíos/con espacios/controles, expiresIn inválido, tokenType distinto de Bearer, id ausente, roles no confirmados y estado distinto de Active. No usar secretos para firmar/validar JWT en Expo ni confiar en claims decodificados localmente.
- Login confirmado contiene identidad mínima; permite crear el User de presentación con id/Buyer, correo normalizado introducido por el usuario y nombre vacío (no recibido). No inventar nombre, perfil ni rol por defecto. Solo Buyer está confirmado; otros roles/combinaciones requieren contrato.
- La identidad del login proviene de su respuesta HTTPS validada. Restauración/perfil necesitan sus propios contratos remotos: si faltan, no montar sesión desde JWT/perfil supuesto ni eliminar automáticamente el token guardado. Logout local conserva su comportamiento seguro.
- La transición PendingEmailVerification→Active la realiza AWS durante login tras comprobar Supabase, nunca Expo. Configuración pública local verificada; SMTP, login real y pruebas físicas siguen pendientes. Ninguna autenticación se declara terminada.

## 9. Verificación local sin operaciones de autenticación
- Expo development carga URL y clave publishable locales, comprobadas solo con booleanos de presencia/formato y coincidencia de origen. No imprimir/copiar claves o tokens en documentación, código o logs.
- Inicialización/disposición del SDK real sin peticiones demuestra configuración local utilizable, no aceptación de la clave por el servidor ni entrega SMTP.
- La pantalla no presenta error de configuración con esos valores: OTP editable/verificación habilitada si existe contexto reciente. Entrada directa sin contexto y cooldown de reenvío siguen siendo guardas válidas; no desactivarlas para probar.
- La comprobación automática utiliza contexto sintético solo en memoria de Jest, sin crear usuarios ni pulsar operaciones. Mantener pendientes recepción OTP, login/lazy sync reales y restauración hasta confirmar /me.

## 10. Identidad/perfil definitivos y restauración autorizada
- AuthMe: id/email/displayName strings, roles validados, accountStatus Active. UsersMe: id/displayName/email strings, phone y avatarUrl string|null, roles validados. Preservar null; sin teléfono, foto, nombre o permisos ficticios.
- Validar identidad y perfil durante login y restauración antes de montar datos privados; comprobar que login/auth-me/users-me corresponden al mismo id/email/rol. El User conserva autorización de identidad, no la recibe de campos editables del perfil.
- SecureStore conserva solo JWT AWS. Sin token→anonymous;401 definitivo→limpieza según política; red/timeout/403/5xx/respuesta inválida→sin usuario protegido y sin borrado automático del JWT. Sin refresh supuesto.
- Proteger restauración/login/perfil contra logout y respuestas tardías, y hacer prevalecer la solicitud de perfil más reciente.
- OTP válido prepara un correo de login efímero en memoria, nunca contraseña/token ni parámetros de URL; botón explícito al login existente con correo prellenado y contraseña vacía. No auto-login por Supabase.
- Perfil comprador utiliza datos validados de /users/me, conservando diseño y navegación006. No modificar catálogo, carrito, pedidos, QR o recursos.
- SMTP operativo es reporte de backend, no observación Expo Go. Implementación y tests no permiten marcar005 COMPLETADA sin recorrido manual autorizado.

Verificación técnica2026-11-13:337/337pruebas/26suites, tsc0errores, lint0errores/30warnings previos, Doctor20/20 y diffcheck limpio. No se ejecutaron registros, correos ni logins reales automáticos. Manual y evidencia vigente en sección11 de https-registration-verification.md.

## 11. Beta temporal de solo registro
- Motivo: usuario reporta que no recibe OTP y reenvío no funciona; comprobar persistencia del alta AWS sin obligar a OTP inmediatamente. No cambiar Confirm email, PendingEmailVerification, login/Active, JWT, SecureStore o autorización.
- Bandera exacta EXPO_PUBLIC_BETA_REGISTRATION_ONLY=true; permitida en desarrollo o build nativa interna explícita beta-registration, con marcador y application id Beta. Producción sin identificación Beta siempre deshabilitada aunque la bandera sea true.
- Único POST AWS/body actual, sin signUp Expo. Solo tras200/202 aceptado: estado local Registro recibido, cuenta pendiente, persistencia sin confirmar, acceso opcional OTP y exploración invitada. No nuevas rutas ni sesión automática.
- Error/timeout no muestra éxito; no retry automático, doble pulsación ni nuevo submit desde el acuse. Diagnósticos sanitizados, sin datos personales/secretos/cuerpos.
- Flujo normal intacto cuando false/ausente. Reversión por bandera y caché/bundle nuevo, sin borrar cuentas ni reconstruir OTP. Contexto de OTP sigue efímero, no se persisten contraseñas.
- Evidencia de identidad Supabase/perfil MongoDB solo la confirma backend. Beta no equivale a autenticación terminada y no permite cuentas sin verificar en rutas privadas. Sin operaciones reales automáticas, commits/pushes o cambios006.

## 12. Registro→login seguro y preparación Play (solicitud posterior)
La bandera Beta ahora dirige directamente a login con acuse pendiente y correo efímero, sin auto-login. False conserva OTP. Ninguna navegación equivale a confirmar correo o Active. Backend debe aprobar un mecanismo de titularidad sin pantalla OTP (enlace o SSO) antes de producción; no existe contrato publicado para ello.
Validación local: nombre Unicode2–100 caracteres, letras/marcas/espacios/apóstrofos/guiones/punto, NFC y espacios normalizados, controles rechazados; correo string máximo254/local64 y dominio exacto; contraseña sin transformación, mínimo backend aún no publicado (recomendación12, no regla inventada), techo local4096 caracteres para solicitudes. Estos límites son política del cliente a alinear con AWS, no evidencia de protección de consultas backend.
Se autoriza commit local del conjunto auth005 seguro acumulado y su configuración/tests/SDD; no push/build/release. Excepción explícita para ese commit técnico con prueba física pendiente, sin marcar005 COMPLETADA. No incluir .env ni trabajo006 ajeno. Auditoría Play y requisitos backend documentados, sin endpoints de borrado/SSO inventados.

## Referencias
CONSTITUTION.md, AGENTS.md, plans/005-aws-api-integration-plan.md, tasks/005-aws-api-integration-tasks.md.
