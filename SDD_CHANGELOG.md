# UTTT-Go Móvil — SDD Change Log

## Información del proyecto

- **Proyecto**: UTTT-Go Móvil
- **Plataforma**: Android
- **Framework**: React Native + Expo
- **Lenguaje**: TypeScript
- **Navegación**: Expo Router
- **Estado actual**: Etapa006 P0/P1/P2 y registro P3 en pruebas;11 fotos pendientes; etapa005 continúa en pruebas; catálogo/pedidos mock
- **Backend**: /health HTTPS/TLS verificado desde PC; contratos login/identidad/perfil implementados, recorrido real OTP/login/restauración pendiente de Expo Go
- **Fuente principal de UI**: Figma

---

# Historial de cambios

## Etapa005 — Registro→Login seguro y auditoría de preparación Play
- Beta true en desarrollo/internal explícita ahora redirige directamente a Login tras200/202 con correo efímero/acuse pendiente y contraseña vacía; false conserva OTP original. No auto-login, bypass de Confirm email/Active ni eliminación de servicios. Cuentas nuevas pendientes siguen rechazadas por AWS: enlace/SSO aprobado es bloqueo contractual, no se inventa endpoint.
- Validación nombre Unicode2–100/NFC/espacios y controles, email string254/local64/dominio exacto, password sin transformación con recomendación12 (política real pendiente) y techo cliente4096. Servicio valida tipos/listas blancas.429 tiene mensaje genérico, controles de consultas/rate-limit/enumeración son responsabilidad backend no auditada.
- Reparadas pruebas Beta de timeout/doble envío, eliminado skip anterior sin debilitar el caso; se usa evento no bloqueante para resolver fetch diferido de RNTL14. app.config tiene defaults name/slug tipados y producción bloquea overlay/almacenamiento externo; flagproductionfalse sigue intacto.
- Checks405/405/28suites,0skipped; tsc0errores, lint0errores/30warnings previos, Doctor20/20 y diffcheck limpio. npm audit28 (27moderados/1bajo), omitdev21; sin actualizaciones automáticas incompatibles. No hallazgos altos/críticos de npm en esta revisión, no significa producción aprobada.
- Auditoría y mensaje backend en specs005/security-play-readiness.md: targetRN36 provisional vs exigencia Play36 consultada, AAB/firma/privacidad/Data safety/eliminación/cuenta de revisión/mocks pendientes. Rotación coordinada del secreto expuesto documentada sin valor. No release/build/push.
- Usuario autoriza commit local del trabajo auth005 relacionado acumulado, incluido OTP/contratos/restauración/Beta seguro y documentación; .env y artefactos excluidos. Prueba física no realizada,005 EN PRUEBAS y publicación bloqueada.

## Etapa005 — contratos definitivos e integración técnica de autenticación (2026-11-13)
- Backend reporta SMTP Gmail y Confirm sign up con Token; no se declara recepción verificada en Expo Go. /auth/me y /users/me confirmados permiten completar validadores separados, id MongoDB coherente y autorización Buyer/Active; phone/avatarUrl string|null se preservan.
- Login ahora valida ambos /me y su coherencia con el DTO de login antes de guardar JWT y autenticar. Restauración valida identidad/perfil desde SecureStore;401 limpia y errores temporales no borran token ni montan datos privados. AuthContext único y storage original conservados; revisiones de perfil/generación bloquean respuestas tardías y401 obsoletos.
- OTP no autentica: Continuar al login transporta solo correo en memoria efímera, sin URL/password. Login prellenado solicita contraseña; prueba Router real con login previo comprueba que no reutiliza contraseña ni autoinicia sesión. AWS ejecuta lazy sync, Expo no modifica MongoDB ni inventa activación/refresh.
- Perfil comprador usa datos validados, nullable avatar y mismo layout; se elimina refresco por remonte que causaría bucle de validación. Sin cambios de catálogo/categorías/imágenes/carrito/QR/pedidos, navegación o SDD006;97 archivos protegidos intactos.
- Checks:337/337pruebas/26suites, tsc0errores, lint0errores/30warnings, Doctor20/20, diffcheck limpio. SDK/config local3/3 sin red y bundleAndroidHTTP200/2469módulos/12253ms. Conservadas suites anteriores, adaptadas expectativas del bloqueo /me ya resuelto; sin regresiones pendientes.
- Guía manual completa en SDD005 sección11 distingue restauración con JWT de reinicio tras logout. Etapa005 EN PRUEBAS hasta validación física del usuario; no operaciones reales automáticas, claves/tokens en logs, commits ni pushes.

## Etapa005 — comprobación de clave pública local sin operaciones de correo
- Expo development carga .env con URL correcta y publishable presente/formato válido; AWSHTTPS intacto, sin overrides heredados ni .env.local. Solo resultados booleanos, sin imprimir/copiar claves o tokens. No se modificó .env.
- Nuevo test de inicialización: SDK real initialize/dispose con entorno efectivo local, cero intentos de red/cero logging; pantalla real sin bloqueo de configuración con contexto sintético. Entrada directa sin registro y cooldown siguen activos. No acciones reales de registro/verifyOtp/resend/login.
- Opt-in local3/3; suite estándar293/293/24suites, tsc0errores, lint0errores/30warnings, Doctor20/20. BundleAndroidHTTP200/2469módulos/17845ms; clave insertada comprobada solo por booleano en memoria, sin imprimir/guardar manualmente bundle. Metro detenido.
-127 archivos productivos/configuración/006 mantienen huella bd6623e723e247dbcb8af31980b0ce7c77e48156. Solo tests/SDD; lógica y contratos validados conservados. Configuración local no equivale a aceptación remota, entrega SMTP, login real o restauración; esos pendientes siguen abiertos en005 EN PRUEBAS. Sin commits/pushes.

## Etapa005 — URL Supabase real y contrato login confirmado (sin commit/push)
- Reutilizados cliente/pantalla OTP/reenvío. URL pública del proyecto configurada en .env y ejemplo; campo de clave local conservado y aún vacío en la comprobación, sin imprimir valores. AWSHTTPS sin cambios ni nuevas dependencias.
- sessionContract implementa parser runtime del DTO accessToken/expiresIn/tokenType/user.id/roles/accountStatus confirmado por el equipo. Rechaza token inválido, duración no positiva/entera, tipo distinto de Bearer, identidad incompleta, rol no acordado y estado no Active antes de guardar JWT.
- Login usa identidad mínima recibida y conserva AuthContext/SecureStore; no inventa nombre ni campos de perfil. AWS realiza lazy sync a Active durante login; Expo no escribe MongoDB ni llama endpoints nuevos. OTP Supabase no crea sesión AWS.
- /auth/me y /users/me siguen sin esquemas confirmados: capacidades separadas null, restauración/perfil fail-closed antes de llamadas, sin borrar token por falta de contrato. Logout local probado; no declarar restauración real terminada desde fixtures.
- Checks: **290/290pruebas,23suites**,69focalizadas/4suites; tsc0errores, lint0errores/30warnings, Doctor20/20, diffcheck limpio; bundleAndroidHTTP200/2469módulos/16011ms.81 archivos protegidos intactos.
- Pendientes: clave publishable local, SMTP, prueba física OTP/login/lazy sync y JSON /me para restauración/perfil. No registros ni envíos reales en pruebas, commits/pushes o cambios006. Evidencia y manual en sección9 de SDD005.

## Etapa005 — implementación Supabase OTP autorizada (sin commit/push)
- Contrato confirmado por el equipo: AWS es el único registro, crea identidad Supabase+perfil MongoDB Buyer/PendingEmailVerification vinculado al sub; Expo verifica email OTP y reenvía signup. Backend exige confirmación y Active antes de login, cuyo JSON/JWT real sigue pendiente.
- Añadidos supabase-js2.119.0 y react-native-url-polyfill4.0.0,10 paquetes en total; sin otras versiones alteradas. .env/.env.example incluyen URL/publishable key públicas vacías hasta entrega del proyecto usado por AWS; AWSHTTPS intacto.
- Fachada verify/resend con cliente efímero: persistSessionfalse/autoRefreshfalse/detectSessionInUrlfalse/debugfalse, initialize y dispose. Sesión devuelta descartada, sin signOut ni escrituras nativas/AWS, no signUp/signInWithOtp.
- Correo reciente solo en memoria tras registro aceptado; no parámetro URL. Pantalla existente habilita OTP6dígitos, verificar, feedback/loading accesible, guardas de concurrencia y reenvío por deadline60s con429/Retry-After. OTP y tokens no se loguean ni persisten. Confirmación no activa MongoDB ni crea sesión; botón explícito al login.
- Verificación: **244pruebas/21suites**, tsc0errores, lint0errores/30warnings previos, Doctor20/20; Metro Android HTTP200/2469módulos/16335ms. Huella77 archivos protegidos intacta. Etapa006, AuthContext, SecureStore y contrato JWT sin cambios.
- Pendientes separados: valores públicos, SMTP/entorno autorizado y entrega real, mecanismo backend de transición a Active, JSON JWT y prueba física OTP en ExpoGo. Manual actualizado en SDD005; no afirmar entrega SMTP ni cierre de autenticación por mocks.

## Etapa005 — corrección puntual HTTPS/registro (2026-11-12, sin commit/push)
- .env local ya contenía https://3.129.142.54.nip.io al iniciar; sin .env.local/variantes ni override heredado. Ejemplo actualizado y Expo development/production/test confirmados con el mismo origen; config.ts mantiene acceso estático único sin fallbackHTTP. Bundle completo de src/app contiene el origenHTTPS y no la IPHTTP antigua.
- Health HTTPS200 Healthy (MongoDB/Redis Healthy), TLSv1.3 autorizado, certificado Let's Encrypt YE1/CN-SAN coincidente, válido hasta2027-02-10UTC, sin desactivar validación. HEAD/OPTIONS registro405 AllowPOST, GET auth/me/users/me401 anónimos, sin Location. No POST automático ni cuentas reales. POST sin downgrade requiere confirmación manual/backend.
- OpenAPI confirma email/password/displayName y respuesta200 sin esquema; se admite200 junto al202 anterior sin autenticar, persistirJWT ni afirmar correo verificado/altaMongoDB. servers HTTP en OpenAPI se documenta como inconsistencia backend, no se consume como origen runtime.
- [aws-register] solo __DEV__: formulario/despacho/iniciofetch/respuesta/status/fallo clasificado. Proyección de campos permitidos, sin datos personales, contraseñas, cuerpos, headers, tokens ni error crudo. Mismo formulario, navegación, guardas HTTPS, AuthContext y SecureStore.
- Tests focalizados80/80,6suites; total193/193,17suites; tsc0errores, lint0errores/30warnings existentes, Doctor20/20. Metro Android root explícito src/app HTTP200/2414módulos/15887ms, proceso detenido; no prueba física.
- SDD005 y procedimiento manual con cuenta institucional autorizada/backend en `specs/005-aws-api-integration/https-registration-verification.md`. Etapa005 EN PRUEBAS; faltan persistencia MongoDB, semántica de respuesta, errores/límites y contratos de verificación/JWT/roles/perfil. Etapa006 y dependencias intactas.

## Preparación de publicación HRDCORE — Expo58.0.25 (2026-11-12)
- Usuario autoriza commit/push de los cambios acumulados005/006 y, tras detectar bloqueo real de CI, el parche adicional Expo58.0.24→58.0.25. Solo cambia ese rango y la entrada Expo del lockfile; otras dependencias directas/transitivas intactas respecto al estado P2/P3.
- Verificación repetida: tsc0errores, lint0errores/30warnings,178pruebas/15suites y **Doctor20/20**. Bundle Android HTTP200/1402módulos/12564ms, sin teléfono. Se resuelve el19/20 registrado en la sección histórica P2/P3, no los bloqueos funcionales005 ni las fotos/pruebas físicas006.
-37 archivos protegidos fuera del parche y SDD mantienen huella34da1bb65f37b94cb59fa367ee96e0c589d34744. .env y artefactos locales excluidos. HRDCORE sin divergencia al preparar; CI remoto anterior success. Resultado de la nueva publicación se comprobará en GitHub Actions.

## Etapa006 — continuación P2/P3 (2026-11-12)

**Estado: EN PRUEBAS**, P4 diferido. Evidencia física del usuario:7 PASS/1 PENDIENTE de P0/P1, limitada al recorrido reportado; modelo/SO/Expo Go/fecha exacta pendientes. Sin prueba física nueva de P2/P3.

### Cambios
- Layout reactivo mediante useWindowDimensions, matriz320/360/390/430×fontScale1/1.3/1.6/2, grid1/2 columnas por filas estables dentro de una FlatList. Query/input/lista conservados, offset restaurado al reflujo. Tarjetas flexibles, textos escalables y controles por rol, botón loading con geometría reservada. Headers/formularios/tabs/SafeArea actualizados; Poppins y paleta conservados.
- Registro canónico foodMedia para21 ids y FoodImage con expo-image instalado: misma identidad por producto en tarjeta, categoría, detalle, datos/confirmación del pedido. Fallback neutro en error/pendiente y reinicio de carga al cambiar id/resolución. Retirados diccionario por nombre, fallback de hotcakes como Torta y21 URLs legacy del mock. Ningún otro campo comercial cambia en P3.
- **10 productos con foto**:8 alternativas Pexels con autor/página/licencia y2 recortes Figma temporales. **11 productos con foto pendiente**, representados por marcador neutro. Hero/banderola de Tortas recortados de las referencias; no pantalla completa como hero. Titular/beneficios/acciones de bienvenida son componentes nativos, iconos Ionicons en lugar de emojis.
-22 JPEG locales,1241641bytes (≈1,24MB), ambos tamaños y hero/banner incluidos. Script reproducible con jimp-compact ya disponible, originales intactos. Manifiesto de21 ids y JSON de dimensiones/pesos/hashes; recortes con resolución limitada y autor/licencia externa no informados.

### Verificación
| Check | Resultado |
|---|---|
| Checkpoint P2 anterior a P3 | tsc0, lint0errores/30warnings,167/167 en14suites |
| npx tsc --noEmit final | 0 errores |
| npm run lint final | 0 errores,30 warnings remanentes |
| npm run test:ci final | **178 aprobadas,15 suites** (147 anteriores+20 P2+11 P3) |
| npx expo-doctor final | **19/20**: recomienda expo~58.0.25, instalado58.0.24 conservado |
| Bundle Android Metro -c | HTTP200,1402 módulos,13543ms; sin dispositivo |
| git diff --check | Sin errores de whitespace |
| Huella protegida41 archivos | e110daf4583f61239b177a0f3d373ee8b0058d6e, intacta |

Pendientes:11 fotos apropiadas, exports individuales Figma/procedencia, revisión separada del parche recomendado por Doctor y comparación física con escalas/teclado/foco/offset. Recorridos y evidencia en tareas006; no declarar fidelidad completa ni cierre del síntoma de regreso inesperado. Sin cambios AWS/AuthContext/SecureStore/CartContext/rutas/dependencias; no commits/pushes.

## Etapa006 — Figma UI / Navigation Fixes — P0/P1 (2026-11-12)

**Estado: EN PRUEBAS.** Solo alcance P0/P1 autorizado; detener antes de P2/P3/P4.

### Cambios
- Spec, matriz Figma, plan y tareas006 creados antes de implementar. ANALISIS_FIGMA y MAPA_NAVEGACION corregidos con inventario63 PNG y correspondencias verificadas. Constitución/AGENTS aclaran ownership/back/fallback/contadores reales.
- Rutas reales food/[id] tipadas desde listados, sin as any en pantallas. Root/buyer/grupos sin duplicación de hijos; anchor público SDK58.
- Cinco tabs con identidad Figma: Inicio/Buscar/Pedidos/Avisos/Perfil. Archivos reorganizados en (tabs) y (private), conservando URLs. Guardas no montan datos personales de invitado ni crean sesión ficticia; no se modifica AuthContext.
- Flechas restauradas en login/seguimiento/calificación/cancelación; back con historial y fallback seguro sin historial. Gesto nativo conservado, Android con delegación/fallback probado en simulación.
- Diagnóstico sanitizado [navigation], +not-found y ErrorBoundary. Cierre/login inesperado sigue pendiente de reproducción y evidencia física; no se atribuye a AuthContext ni se declara resuelto.
- Seis categorías Figma con mapeo explícito por ids;21 productos conservados. Conteos1/3/3/3/3/0 y8 alimentos sin categoría compatible, aún visibles en general. Solo categoryId normalizado; datos originales restantes intactos.
- Selector en Buscar, categoría seleccionada en UI-012, estado vacío real y parámetros preservados al abrir detalle/regresar. Filtros locales vuelven por dismissTo al origen permitido. Sin carrusel duplicado en Inicio; chips wrap de UI-007.
- Una FlatList vertical por listado, viewport acotado, separación de columnas y encabezado estable. Pedidos/avisos sin ScrollView exterior; sin usar nestedScrollEnabled como solución superficial.

### Verificación ejecutada
| Check | Resultado |
|-------|-----------|
| npx tsc --noEmit | 0 errores |
| npm run lint | 0 errores,34 advertencias remanentes (antes69) |
| npm run test:ci | **147 aprobadas,0 fallidas,12 suites**;104 previas+43 nuevas |
| npx expo-doctor | **20/20** |
| git diff --check | Sin errores de whitespace |
| Bundle Android por Metro | HTTP200,2406 módulos,11637ms; no dispositivo |
| Protección de alcance | Huella28 archivos AWS/contextos/dependencias/SDD005 intacta |

### Pendientes
Expo Go físico: flecha/Android/gesto, scroll final, teclado, deep links y privacidad. HTTPS/contratos siguen bloqueando sesión real de005. Responsividad integral, fotos y negocio de pedidos/QR/cancelar/reseñar permanecen diferidos. No nuevas dependencias, endpoints, commits ni pushes.

Detalles de recorridos, archivos y limitaciones en `tasks/006-figma-ui-navigation-fixes-tasks.md`.

---

## Etapa 005 — AWS-API-INTEGRATION (2026-11-11)

### Continuidad — diez parches autorizados aplicados y verificados
- Registro de git status y snapshots ANTES de instalar para conservar los cambios previos. Comparación contra estado inicial: únicamente package.json, package-lock.json y tasks005/memoria/changelog cambian en esta intervención; huella de los otros130 archivos preservada.
- Actualizadas dependencias directas: @expo/ui58.0.27→58.0.28; expo58.0.23→58.0.24; expo-constants58.0.15→58.0.16; expo-font58.0.11→58.0.12; expo-linking58.0.16→58.0.17; expo-router58.0.30→58.0.31; expo-splash-screen58.0.13→58.0.14; expo-status-bar58.0.4→58.0.5; expo-symbols58.0.4→58.0.5; expo-web-browser58.0.7→58.0.8.
- SDK58, React19.3.0, RN0.88.1, SecureStore y todas las otras dependencias directas conservadas. Lock sincronizado; npm resuelve41 cambios de versión transitivos y elimina getenv ya no referenciado (no dependencia directa). Cambios internos documentados en tareas005; sin overrides ni actualización mayor de Expo/RN.
- Retiradas dos adiciones incidentales de plugins realizadas por Expo CLI: app.json vuelve exactamente a su contenido previo, preservando los cambios anteriores de SecureStore.
- Verificaciones: expo install --check al día; **Expo Doctor20/20**; tsc0errores; ESLint0errores/69warningsprevios; test:ci **104aprobadas/0fallidas,7suites**; pruebas focalizadas **48aprobadas/0fallidas,2suites** (incluidas en104); git diff --check sin errores. npm ls confirma versiones objetivo.
- Metro arrancó con caché limpia/.env, ventana acotada offline25s y proceso detenido. Aún no hay prueba física ni resultados nuevos de AWS en esta intervención. Node25.4 local emite warnings engines; recomendar Node24LTS. Ningún servicio, restricción HTTPS, AuthContext o pantalla modificado respecto al inicio de esta actualización.
- Etapa005 continúa EN PRUEBAS: dependencias resueltas; HTTPS, contratos JSON y Expo Go pendientes. Sin commits/pushes.

### Continuidad — revisión de parches y preparación de prueba manual
- Ejecutado `npx expo install --check`: confirma diez desajustes de parches SDK58 ya reportados por Doctor. Ajustes recomendados documentados en tareas005; pendientes de aprobación, sin modificación de dependencias en esta revisión.
- Revisados hook useApiHealth y botón de diagnóstico, guardas HTTP, contrato bloqueado y ruta de invitado. Prueba física de Expo Go aún pendiente de evidencia del usuario.
- Reejecutadas suites existentes de cliente HTTP y coordinador: 48 tests/2 suites aprobadas, con mocks. No se reconstruyeron servicios ni se habilitó autenticación real.
- Precisado orden de validación para prueba manual: login valida correo antes de HTTPS; registro bloquea por HTTPS antes de validar dominio en el coordinador. Metro no registra automáticamente las peticiones; ausencia de logs no demuestra ausencia de tráfico.

### Alcance implementado (EN PRUEBAS, no cierre de integración real)
- Spec, plan y tareas siguiendo la estructura SDD existente, antes de código.
- .env local ignorado y .env.example; origen centralizado con acceso estático Expo.
- Cliente fetch GET/POST/PATCH, JSON, Bearer, timeout, errores HTTP/red/configuración/respuesta. Solo health público puede usar HTTP; contraseñas/JWT bloqueados antes de fetch.
- Servicios health/auth/users/sellers/admin con rutas/cuerpos/status acordados, parámetros admin conocidos y listas blancas PATCH. Respuestas sin contrato como unknown; sin adaptar User/JWT con campos supuestos.
- SecureStore 58.0.3 y plugin. Coordinador del único AuthContext con storage serializado, restauración preparada y logout/cancelación de respuestas tardías; sin fallback demo, sin contraseñas persistidas.
- Adaptadores de sesión bloqueados (`sessionContract = null`) hasta JSON real. Registro 202 no autentica; verificación/recuperación ya no simulan OTP/enlace exitoso.
- Login/registro/perfil adaptados conservando componentes y estilos; diagnóstico /health solo __DEV__, exploración invitado sin usuario ficticio. Mocks comprador, carrito, pedidos, filtros y QR conservados.
- AsyncStorage legacy conservado sin lecturas de autenticación ni limpieza automática; estrategia no destructiva en plan/memoria.
- Jest existente corregido para transformaciones Expo ESM y tipos TS6. CI habilita tests en gate y Node24. Constitución, AGENTS y README alineados con etapa005.

### Verificación ejecutada
| Check | Resultado |
|-------|-----------|
| npx tsc --noEmit | 0 errores |
| npm run lint | 0 errores, 69 advertencias en archivos existentes fuera del código adaptado |
| npm run test:ci | 7 suites / 104 tests aprobados, fetch/SecureStore simulados |
| npx expo-doctor | 19/20; 10 dependencias existentes requieren parches SDK58 |
| GET /health real desde PC | 200 OK, JSON API/MongoDB/Redis Healthy, ~0.376s |
| HTTPS /health | Conexión a 443 no establecida, curl error 7; sin respuesta HTTP |
| Metro cache limpio | Inicia y carga .env; ventana acotada offline sin dispositivo/render completo |
| Expo Go físico | Pendiente; adb no disponible |
| CI YAML | Validado localmente; GitHub Actions no ejecutado |

### Bloqueos y seguimiento
HTTPS/certificado, contrato JWT/identidad/roles/perfiles/errores/paginación, límites/formato de campos, flujo Supabase-AWS y prueba móvil. Doctor no está aprobado; Node local25.4 fuera de engines recomendados, usar Node24. Solo health se probó contra AWS; tests unitarios no prueban backend. Ningún commit/push realizado.

Archivos/evidencia detallados en `tasks/005-aws-api-integration-tasks.md`. Datos de red fechados localmente 2026-11-11; header servidor UTC 2026-11-12.

---

## Etapa 1 — Inicialización del proyecto

### Objetivo

Configurar la base del proyecto Expo con TypeScript, Expo Router, tema y componentes base.

### Cambios realizados

- Creación del proyecto Expo con template TypeScript
- Configuración de Expo Router con typedRoutes
- Configuración de TypeScript strict mode
- Estructura de carpetas: src/app, src/components, src/context, src/data, src/theme, src/types, src/hooks, src/navigation, src/services, src/utils
- Configuración del tema (colores, tipografía Poppins, espaciado, sombras, radios)
- Componentes base reutilizables: AppText, AppButton, AppInput, Screen, Surface, Avatar, Badge, Divider, EmptyState, LoadingState, SectionHeader, AppHeader, BrandLogo
- Configuración de app.json (nombre UTTT-Go, scheme uttgo, Android package mx.edu.utt.uttgo)
- Configuración de plugins: expo-router, expo-splash-screen, expo-font
- Scripts: start, android, ios, web, typecheck, doctor

### Archivos involucrados

- package.json, app.json, tsconfig.json
- src/theme/colors.ts, spacing.ts, typography.ts, shadows.ts, index.ts
- src/components/ui/*.tsx (14 componentes)
- src/app/_layout.tsx, src/app/index.tsx (scaffold inicial)
- src/context/AuthContext.tsx, CartContext.tsx
- src/data/mock/users.ts, categories.ts, index.ts
- src/types/models.ts
- src/utils/format.ts
- src/services/mockApi.ts
- src/navigation/routes.ts
- src/hooks/use-color-scheme.ts, use-theme.ts, use-color-scheme.web.ts

### Estado

**COMPLETADO**

---

## Etapa 2 — Autenticación

### Objetivo

Implementar el flujo completo de autenticación local con persistencia.

### Pantallas (IDs Figma)

- **UI-001** — Splash
- **UI-002** — Bienvenida
- **UI-003** — Iniciar sesión
- **UI-004** — Registro
- **UI-005** — Recuperar contraseña
- **Verificación del correo institucional** — Verificación

### Funcionalidades

- **Splash**: Logo UTTT-GO, tagline "Del campus a tus manos", auto-navegación a Bienvenida tras 2.5s
- **Bienvenida**: Hero image, headline, 3 feature cards, botones Iniciar sesión/Crear cuenta/Seguir explorando
- **Login**: Header "Acceso UTTT", campos email/contraseña, "¿Olvidaste contraseña?", botón primario, info box acceso institucional, link a registro
- **Registro**: Header "Crear cuenta", campos nombre/email/contraseña/confirmar, botón primario, texto términos
- **Recuperar contraseña**: Icono llave, título, descripción, campo email, botón "Enviar enlace", link volver a login
- **Verificación correo**: Campo email (read-only), campo token, botón "Verificar y continuar", reenviar token
- **Persistencia**: AsyncStorage para usuarios registrados (sobreviven reinicios)
- **Usuarios demo**: 3 cuentas predefinidas (comprador, vendedor, admin) con credenciales 12345678
- **Logout**: Redirige a Welcome reseteando stack

### Correcciones realizadas

- **Expo Router rutas extráneas**: Eliminadas declaraciones `Stack.Screen` redundantes para rutas de auth; Expo Router descubre automáticamente desde sistema de archivos
- **Resolución de imágenes**: Cambio de `require('@/assets/...')` a rutas relativas `require('../../assets/...')` para compatibilidad con Metro
- **Navegación back**: `router.replace` → `router.push` en login/verify-email para mantener historial (back va a login, no a welcome)
- **Logout**: `router.replace('/welcome')` correcto para resetear stack

### Archivos involucrados

- `src/app/(auth)/welcome.tsx` (UI-002)
- `src/app/(auth)/login.tsx` (UI-003)
- `src/app/(auth)/register.tsx` (UI-004)
- `src/app/(auth)/forgot-password.tsx` (UI-005)
- `src/app/(auth)/verify-email.tsx` (Verificación)
- `src/app/index.tsx` (UI-001 Splash)
- `src/app/_layout.tsx` (Stack config)
- `src/context/AuthContext.tsx` (persistencia AsyncStorage)
- `src/data/mock/users.ts` (usuarios demo)
- `src/assets/images/welcome-hero.png` (copia de UI-002)

### Estado

**COMPLETADO**

---

## Etapa 3 — Comprador

### Objetivo

Implementar el flujo principal del comprador con catálogo, categorías, búsqueda, carrito, pedidos y perfil.

### Pantallas (IDs Figma)

| ID Figma | Archivo | Pantalla |
|----------|---------|----------|
| UI-006 | `buyer/index.tsx` | Inicio comprador (Home) |
| UI-007 | `buyer/search.tsx` | Buscar |
| UI-008 | `buyer/filters.tsx` | Filtros |
| UI-010 | `buyer/available-now.tsx` | Disponible ahora |
| UI-012 | `buyer/category.tsx` | Categoría |
| UI-013 | `buyer/food/[id].tsx` | Detalle alimento |
| UI-015 | `buyer/order-data.tsx` | Datos del pedido |
| UI-016 | `buyer/confirm-order.tsx` | Confirmar pedido |
| UI-017 | `buyer/order-created.tsx` | Pedido generado |
| UI-019 | `buyer/orders.tsx` | Mis pedidos |
| UI-020 | `buyer/order-tracking.tsx` | Detalle seguimiento |
| UI-021 | `buyer/rate-order.tsx` | Calificar pedido |
| UI-022 | `buyer/cancel-order.tsx` | Confirmación cancelación |
| UI-024 | `buyer/notifications.tsx` | Notificaciones |
| UI-025 | `buyer/profile.tsx` | Mi perfil |

### Funcionalidades implementadas

- **Home (UI-006)**: Header con saludo + avatar, barra de búsqueda, categorías horizontal scroll (imágenes reales + icono + count), grid 2 cols "Disponible ahora" con imágenes, gradiente overlay, badge favorito, precio, rating, botón agregar
- **Categorías (UI-012)**: Carrusel horizontal con snap, tarjetas con imagen real Unsplash, overlay gradiente, icono Ionicons, nombre + count, snap scroll + deceleración
- **Disponible ahora (UI-010)**: Grid 2 columnas, imágenes reales, gradiente overlay, badge favorito, precio, tiempo, rating, botón "Agregar"
- **Buscar (UI-007)**: Input con icono, filtrado en tiempo real por nombre, resultados en lista con badge rating
- **Filtros (UI-008)**: Disponibilidad, rango precio, tiempo preparación, botones Limpiar/Aplicar
- **Detalle alimento (UI-013)**: Imagen, nombre, vendedor, tags, descripción, stock, selector cantidad, precio total, botón "Agregar al pedido"
- **Flujo pedido**: Datos del pedido → Confirmar pedido → Pedido generado → Rastrear/Volver
- **Mis pedidos (UI-019)**: Lista con badges estado (Pendiente/Preparando/Listo/Entregado/Cancelado), código, items, total, fecha
- **Seguimiento (UI-020)**: Timeline 4 pasos (Pendiente → En preparación → Listo → Entregado), detalle vendedor/pago/total
- **Calificar (UI-021)**: 5 estrellas interactivas, comentario opcional, envío
- **Cancelar (UI-022)**: Motivos radio buttons, confirmar
- **Notificaciones (UI-024)**: Lista con icono por tipo (pedido/chat/sistema), dot no leído, timestamp
- **Perfil (UI-025)**: Avatar, nombre, email, matrícula, settings (tarjeta, dirección, notificaciones, ayuda), logout rojo
- **Carrito single-vendor**: Un solo vendedor por pedido (regla de negocio)
- **Navegación**: Push/pop correcto, historial mantenido, back navigation funcional
- **Scroll Home**: `nestedScrollEnabled` en ScrollView para FlatLists anidados
- **Navegación dinámica**: `/buyer/food/:id` con `useLocalSearchParams`

### Datos Mock

**Categorías (6)**: Desayunos, Comida corrida, Antojitos, Bebidas, Postres, Snacks — cada una con icono Ionicons, color, itemCount

**Alimentos (8)**: Torta de Milanesa, Enchiladas Verdes, Chilaquiles con Huevo, Quesadillas de Hongos, Agua de Horchata, Flan de Coco (agotado), Elote en Vaso, Tacos de Canasta — cada uno con precio, descripción, imagen Unsplash, rating, stock, disponibilidad, tags

**Pedidos (4)**: Estados variados (entregado, preparando, pendiente, cancelado), códigos UTTT-XXXX, items, totales, vendedor, método pago

**Notificaciones (4)**: Tipos order/chat/system, read/unread, timestamps

**Usuarios demo**: 3 roles (comprador, vendedor, admin) con emails UTT, passwords 12345678

### Categorías actuales (mock)

| ID | Nombre | Icono | Color | Items |
|----|--------|-------|-------|-------|
| cat-1 | Desayunos | cafe-outline | #FFF7E7 | 8 |
| cat-2 | Comida corrida | restaurant-outline | #FFF0F0 | 12 |
| cat-3 | Antojitos | fast-food-outline | #ECF8EF | 10 |
| cat-4 | Bebidas | cafe-outline | #EDF5F7 | 6 |
| cat-5 | Postres | ice-cream-outline | #FFF0F0 | 5 |
| cat-6 | Snacks | nutrition-outline | #ECF8EF | 7 |

**Nota**: Las categorías actuales son una propuesta basada en temática universitaria. **PENDIENTE**: Verificar contra Figma UI-012 Categoría.png para confirmar nombres exactos.

### Funcionalidad de filtrado por categoría

- Home: Al tocar categoría → setSelectedCategory + push a `/buyer/category?categoryId=`
- Categoría screen: Horizontal scroll, tap → push a `/buyer/available-now?categoryId=&categoryName=`
- Disponible ahora: Filtra `mockFoods` por `categoryId` y `availability === 'available'`
- Home: Filtra `featuredFoods` por `selectedCategory` si hay selección

### Correcciones realizadas en Etapa 3

- **Rutas extráneas Expo Router**: Eliminadas declaraciones `Stack.Screen` redundantes para rutas buyer
- **VirtualizedList anidado**: Quitado `scroll` prop en `available-now`, `category`; agregado `nestedScrollEnabled` en `Screen` + `scroll` en Home
- **Navegación food**: Query params `?foodId=` → segmento dinámico `/buyer/food/:id` + `useLocalSearchParams`
- **Navegación back**: `router.replace` → `router.push` en login/verify-email
- **Scroll Home**: `scroll` prop en Home + `nestedScrollEnabled` en Screen
- **Diseño Categoría**: Rediseño completo con tarjetas imagen + overlay + icono, horizontal scroll snap
- **Diseño Disponible ahora**: Grid 2 cols con imágenes reales, gradiente, badges
- **Diseño Home**: Categorías horizontal + grid 2 cols alimentos, imágenes reales

### Archivos involucrados

**Nuevos (17 pantallas buyer)**:
- `src/app/buyer/_layout.tsx`
- `src/app/buyer/index.tsx` (UI-006)
- `src/app/buyer/search.tsx` (UI-007)
- `src/app/buyer/filters.tsx` (UI-008)
- `src/app/buyer/available-now.tsx` (UI-010)
- `src/app/buyer/category.tsx` (UI-012)
- `src/app/buyer/food/[id].tsx` (UI-013)
- `src/app/buyer/order-data.tsx` (UI-015)
- `src/app/buyer/confirm-order.tsx` (UI-016)
- `src/app/buyer/order-created.tsx` (UI-017)
- `src/app/buyer/orders.tsx` (UI-019)
- `src/app/buyer/order-tracking.tsx` (UI-020)
- `src/app/buyer/rate-order.tsx` (UI-021)
- `src/app/buyer/cancel-order.tsx` (UI-022)
- `src/app/buyer/notifications.tsx` (UI-024)
- `src/app/buyer/profile.tsx` (UI-025)

**Nuevos datos mock**:
- `src/data/mock/foods.ts` (8 alimentos)
- `src/data/mock/orders.ts` (4 pedidos)
- `src/data/mock/notifications.ts` (4 notificaciones)
- `src/data/mock/index.ts` (exports)

**Modificados**:
- `src/app/_layout.tsx` (rutas buyer)
- `src/app/(auth)/login.tsx` (redirect → /buyer)
- `src/app/(auth)/verify-email.tsx` (redirect → /buyer)
- `src/context/AuthContext.tsx` (AsyncStorage persistence)
- `src/types/models.ts` (sellerName, password opcional)
- `src/data/mock/categories.ts` (6 categorías)
- `src/data/mock/foods.ts` (8 alimentos)
- `src/data/mock/orders.ts` (4 pedidos)
- `src/data/mock/notifications.ts` (4 notificaciones)
- `src/data/mock/index.ts` (exports)
- `src/navigation/routes.ts` (rutas buyer)
- `src/components/ui/Screen.tsx` (nestedScrollEnabled)
- `src/theme/spacing.ts` (utilidades responsivas)
- `src/theme/index.ts` (exports responsivos)
- `src/hooks/useResponsive.ts` (nuevo hook)

**Nuevos hooks**:
- `src/hooks/useResponsive.ts` (useWindowDimensions, moderateScale, verticalScale, horizontalScale, wp, hp, responsiveFontSize)
- `src/hooks/index.ts`

### Estado

**COMPLETADO** (pendiente verificación final de categorías contra Figma)

---

## Estado general del proyecto

| Etapa | Estado | Comentarios |
|-------|--------|-------------|
| 1. Configuración base | ✅ COMPLETADO | Expo + TS + Router + Tema + Componentes |
| 2. Autenticación | ✅ COMPLETADO | 6 pantallas, persistencia, navegación correcta |
| 3. Comprador | ✅ COMPLETADO* | 17 pantallas, mock data, navegación, scroll, responsivo |
| 4. Vendedor | ⏳ PENDIENTE | - |
| 5. Administrador | ⏳ PENDIENTE | - |
| 6. Chat/Estados | ⏳ PENDIENTE | - |
| 7. Revisión visual | ⏳ PENDIENTE | - |

*Etapa 3 marcada como completada con la observación de que las categorías deben verificarse contra Figma UI-012.

---

### Próximos pasos (Etapa 4)

- Flujo Vendedor: Dashboard (UI-029), Mis alimentos (UI-035), Agregar (UI-036), Editar (UI-037), Pedidos recibidos (UI-038), Detalle pedido (UI-039), Perfil vendedor (UI-014), Activación (UI-027/028)

---

### Comandos de verificación

```powershell
cd "C:\Users\kevin\OneDrive\Documentos\10IDSM-G1\EDEL MEZA\UtttGO-Movil\MovilGo"
npx tsc --noEmit          # TypeScript check
npx expo start -c         # Iniciar con cache limpio
npx expo start --android  # Android directo
```

### Corrección de datos mock y categorías (2025-01)

**Commit**: `pending` — "Mock data: categorías coherentes y 21 alimentos distribuidos"

**Cambios**:
- Categorías actualizadas a 6 categorías temáticas universitarias: Desayunos, Comida corrida, Antojitos, Bebidas, Postres, Snacks
- Items actualizados con counts reales: Desayunos(4), Comida corrida(4), Antojitos(4), Bebidas(3), Postres(3), Snacks(3) = 21 alimentos total
- Alimentos redistribuidos por categoría con nombres, descripciones, precios y tags coherentes
- Icono de Bebidas cambiado a 'wine-outline' (más apropiado)
- Featured foods actualizado para usar disponibilidad real

**Archivos modificados**:
- `src/data/mock/categories.ts`
- `src/data/mock/foods.ts`

### Corrección de VirtualizedList + CI/CD Pipeline + QR Code + Efectivo (2025-11-06)

**Commit**: `a00c8d2` → `cf1b88b` → `f3bbe3e` → `01a77b1` → `ffb0961` → `c8ff59c`

**Cambios**:
- **VirtualizedList anidado corregido**: Reestructuración `BuyerHomeScreen` con `FlatList` único + `ListHeaderComponent` (eliminado `ScrollView` anidado)
- **Navegación back corregida**: `router.replace` → `router.push` en login/verify-email (mantiene historial)
- **CI Pipeline** (`.github/workflows/ci.yml`): TypeScript, Lint, Expo Doctor + Summary gate
- **CD Preview Build** (`.github/workflows/build-android.yml`): Android preview via EAS (`workflow_dispatch` + push HRDCORE)
- **EAS Config** (`eas.json`): Perfiles development/preview/production
- **Package.json**: Scripts test (jest, test:watch, test:ci), dependencias test (jest, jest-expo, react-test-renderer, @testing-library/react-native, @testing-library/jest-native, react-native-qrcode-svg, react-native-svg)
- **EAS Config** (`eas.json`): Perfiles development/preview/production
- **App Config**: `app.json` corregido (removido `newArchEnabled`, `edgeToEdgeEnabled`)
- **Dependencias**: `@react-native-async-storage/async-storage@2.2.0`, `jest@30.5.0`, `@types/jest@30.0.0`, `jest-expo@58`, `react-test-renderer@19.3.0`, `@testing-library/react-native@14.1.0`, `@testing-library/jest-native@5.4.3`, `react-native-qrcode-svg@6.3.54`, `react-native-svg@15.16.0`
- **Método de pago**: EFECTIVO en `order-data.tsx`, `confirm-order.tsx`, `order-created.tsx`
- **QR Code real**: Generación dinámica con `react-native-qrcode-svg` en `order-created.tsx`
- **Modelo Order**: `paymentMethod: 'cash'`, `qrPayload` agregado
- **Mock Orders**: `paymentMethod: 'cash'`, `qrPayload` JSON agregado
- **Correcciones lint/tsc**: Errores de lint resueltos (comillas escapadas, tipos)
- **VirtualizedList fix**: `nestedScrollEnabled` en `Screen` + quitar `scroll` en pantallas con FlatList
- **Navegación food**: Query params → segmento dinámico `/buyer/food/:id` + `useLocalSearchParams`

**Archivos creados/modificados**: 30+ archivos

**Verificaciones**: `npx tsc --noEmit` ✅ 0 errores | `npm run lint` ✅ 0 errores | `npx expo-doctor` ✅ 20/20 checks passed

---

### Corrección de VirtualizedList + CI/CD Pipeline + QR Code + Efectivo (2025-11-06)

**Commit**: `a00c8d2` → `cf1b88b` → `f3bbe3e` → `01a77b1` → `ffb0961` → `c8ff59c`

**Cambios**:
- **VirtualizedList anidado corregido**: Reestructuración `BuyerHomeScreen` con `FlatList` único + `ListHeaderComponent` (eliminado `ScrollView` anidado)
- **Navegación back corregida**: `router.replace` → `router.push` en login/verify-email (mantiene historial)
- **CI Pipeline** (`.github/workflows/ci.yml`): TypeScript, Lint, Expo Doctor + Summary gate
- **CD Preview Build** (`.github/workflows/build-android.yml`): Android preview via EAS (`workflow_dispatch` + push HRDCORE)
- **EAS Config** (`eas.json`): Perfiles development/preview/production
- **Package.json**: Scripts test (jest, test:watch, test:ci), dependencias test (jest, jest-expo, react-test-renderer, @testing-library/react-native, @testing-library/jest-native, react-native-qrcode-svg, react-native-svg)
- **EAS Config** (`eas.json`): Perfiles development/preview/production
- **App Config**: `app.json` corregido (removido `newArchEnabled`, `edgeToEdgeEnabled`)
- **Dependencias**: `@react-native-async-storage/async-storage@2.2.0`, `jest@30.5.0`, `@types/jest@30.0.0`, `jest-expo@58`, `react-test-renderer@19.3.0`, `@testing-library/react-native@14.1.0`, `@testing-library/jest-native@5.4.3`, `react-native-qrcode-svg@6.3.54`, `react-native-svg@15.16.0`
- **Método de pago**: EFECTIVO en `order-data.tsx`, `confirm-order.tsx`, `order-created.tsx`
- **QR Code real**: Generación dinámica con `react-native-qrcode-svg` en `order-created.tsx`
- **Modelo Order**: `paymentMethod: 'cash'`, `qrPayload` agregado
- **Mock Orders**: `paymentMethod: 'cash'`, `qrPayload` JSON agregado
- **Correcciones lint/tsc**: Errores de lint resueltos (comillas escapadas, tipos)
- **VirtualizedList fix**: `nestedScrollEnabled` en `Screen` + quitar `scroll` en pantallas con FlatList
- **Navegación food**: Query params → segmento dinámico `/buyer/food/:id` + `useLocalSearchParams`

**Archivos creados/modificados**: 30+ archivos

**Verificaciones**: `npx tsc --noEmit` ✅ 0 errores | `npm run lint` ✅ 0 errores | `npx expo-doctor` ✅ 20/20 checks passed

---

### Última actualización

**Fecha**: 2025-11-06
**Branch**: `HRDCORE` → `origin/HRDCORE` sincronizado
**Commits**: `a00c8d2` → `cf1b88b` → `f3bbe3e` → `01a77b1` → `ffb0961` → `c8ff59c`
