# Tasks 005 — AWS-API-INTEGRATION

## Información General
- **Spec**: 005-aws-api-integration
- **Versión**: 1.0
- **Fecha**: 2026-11-11
- **Estado**: EN PRUEBAS — infraestructura implementada; integración real de auth NO completada.

Las casillas registran implementación o evidencia técnica puntual; no sustituyen el cierre funcional con HTTPS, contrato verificado y Expo Go exigido por Constitución.

## Tareas
### Fase 1: SDD
- [x] Especificación de requisitos, aceptación, estrategia de pruebas y bloqueos.
- [x] Plan técnico y migración no destructiva de AsyncStorage.
- [x] Tareas creadas antes de implementar código.

### Fase 2: Configuración y transporte
- [x] .env, .env.example y exclusión Git; lectura estática centralizada.
- [x] Cliente GET/POST/PATCH, JSON, Bearer, timeout y errores.
- [x] Bloqueo previo a fetch para todo HTTP excepto health público (tests).
- [x] Servicios de los endpoints acordados; respuestas desconocidas sin contratos inventados.
- [x] Validación institucional y listas blancas PATCH (estructural; faltan límites/formatos backend).

### Fase 3: Sesión y pantallas
- [x] SecureStore 58.0.3 instalado con expo install, solo JWT, errores y logout (tests con módulo simulado).
- [x] AuthContext único sin fallback ficticio; restauración preparada con validación remota y protección frente a carreras.
- [x] Adaptar login/registro/perfil y retirar simulación de verificación/recuperación sin rediseño. Exploración como invitado sin sesión ficticia.
- [x] Conservar datos legacy sin leerlos/borrarlos para autenticar (test de Context).
- [ ] Implementar decodificadores de JWT/identidad/perfil con JSON real; sessionContract permanece null.
- [ ] Validar sesión real y almacenamiento nativo en dispositivo.

### Fase 4: Verificación
- [x] Tests unitarios Jest de transporte, servicios, Context y sesión: 7 suites, 104 tests aprobados.
- [x] npx tsc --noEmit → 0 errores.
- [x] npm run lint → 0 errores, 69 advertencias en módulos existentes fuera de los archivos de código adaptados.
- [x] npm run test:ci → 7 suites, 104 tests aprobados (fetch/SecureStore simulados, no AWS).
- [x] Ejecutar npx expo-doctor → inicialmente 19/20; después de los diez parches autorizados, **20/20**.
- [x] Revisión posterior con `npx expo install --check`: confirma los mismos 10 parches SDK58; propuesta entregada, dependencias sin modificar en esta revisión.
- [x] Aprobar y aplicar los 10 ajustes de parche propuestos; repetir compatibilidad, tsc, lint, Jest y Doctor (ver evidencia posterior).
- [x] Resolver desalineación de versiones Expo y obtener Doctor 20/20; check aprobado sin exclusiones.
- [x] GET /health real desde desarrollo con evidencia.
- [x] Arranque Metro con caché limpia y .env cargado; prueba acotada de 25 segundos, offline, puerto 8091.
- [x] CI: habilitar Jest y gate, Node 24; YAML validado localmente.
- [ ] Ejecutar CI remoto después de autorización de push (ningún push realizado).
- [ ] /health desde Expo Go en dispositivo.

### Fase 5: Memoria y cierre
- [x] Actualizar Constitución/AGENTS por cambio de alcance.
- [x] Actualizar memoria.md y SDD_CHANGELOG.md con resultados reales; README advierte cambio respecto al historial mock.
- [ ] Verificación completa HTTPS + contratos + Expo Go antes de COMPLETADO.

## Bloqueos
HTTPS, contrato de login/JWT y User/roles, DTO de perfiles/vendedores/admin, error envelope, límites de campos, flujo Supabase/recuperación/refresh. La integración no está completada aunque pasen tests con mocks.

## Evidencia — 2026-11-11 (hora local; headers de servidor en UTC)

### AWS público desde desarrollo, sin credenciales
- GET /health en el origen configurado: **HTTP/1.1 200 OK**, `Server: nginx`, `Content-Type: application/json; charset=utf-8`, `Transfer-Encoding: chunked`, `Connection: keep-alive`, `Vary: Accept-Encoding`.
- Header `Date: Thu, 12 Nov 2026 02:30:41 GMT`; duración 0.376 segundos; IP remota coincide con .env.
- JSON observado: `{"status":"Healthy","checks":{"mongodb":"Healthy","redis":"Healthy"}}`.
- HTTPS al mismo host: curl error 7, sin respuesta HTTP, conexión a 443 no establecida (~2.62s). No se llegó a verificar certificado; no atribuir a Security Group/nginx sin acceso a AWS.
- No probaron login, registro ni endpoints autenticados reales. Solo health público y prueba HTTPS de health.

### Entorno y checks
- .env excluido: `git check-ignore -v .env` confirma regla `.gitignore:34:.env`. IP solo en .env; ejemplo sin valor para evitar duplicarla.
- Node local 25.4.0: advertencias EBADENGINE (Expo/Metro requieren ramas 22/24/26 compatibles). CI ahora Node 24; no se ejecutó GitHub Actions.
- Primer intento de tests descubrió configuración heredada de transformIgnorePatterns incompatible con ESM de Expo; resuelto usando el preset jest-expo sin sobrescribir sus transformaciones. Tipos Jest/Node/React explícitos para TypeScript 6.
- Resultado final de Jest: **104/104 tests, 7/7 suites**. Cobertura de líneas `src/services/api`: 100%; cobertura global 34.85%, pues las pantallas históricas no tienen pruebas de este alcance. No equivale a verificación nativa ni de contratos reales.
- Doctor: faltan parches de `@expo/ui`, `expo`, `expo-constants`, `expo-font`, `expo-linking`, `expo-router`, `expo-splash-screen`, `expo-status-bar`, `expo-symbols`, `expo-web-browser`. SecureStore sí coincide con SDK 58. No se aplicó actualización masiva ajena al alcance.
- Metro mostró `.env` cargado, React Compiler, raíz `src/app` y `Waiting on http://localhost:8091`. Proceso de comprobación detenido al finalizar ventana; no prueba de render/bundle completo.
- `adb devices` no pudo ejecutarse porque adb no está instalado/en PATH. No existe evidencia de dispositivo Expo Go accesible; verificación móvil pendiente.

## Prueba manual pendiente en Expo Go
1. Usar Node 24 LTS recomendado, ejecutar `npx expo start -c`, abrir proyecto en Expo Go Android y esperar splash/bienvenida.
2. Ir a Login, tocar **Comprobar conexión** (solo __DEV__). Registrar HTTP/estado MongoDB/Redis o mensaje de red; no ingresar credenciales reales. El diagnóstico llama healthService sin token.
3. Con datos ficticios @uttt.edu.mx, confirmar que login/registro se bloquean por HTTPS y no crean sesión. Login valida el dominio antes del transporte: con @utt.edu.mx debe rechazar el correo. Registro verifica HTTPS antes de validar correo en el coordinador: con la configuración HTTP actual debe mostrar primero bloqueo HTTPS, incluso para dominio incorrecto. La validación institucional del servicio de registro está cubierta por revisión de código/tests; no confundir el orden de mensajes con una petición enviada.
4. Verificar **Seguir explorando**: catálogo mock accesible sin autenticar. Perfil debe mostrar Invitado, no usuario demo. No se reescribe el carrito/pedido/QR.
5. Verificación/recuperación deben indicar contrato pendiente, sin afirmar que se envió o validó un OTP/enlace.
6. Cuando backend entregue HTTPS y contratos: implementar decodificadores runtime, probar login de usuario verificado/no verificado, 202 sin sesión, validación de roles, perfil, restauración, logout y errores de SecureStore en dispositivo.
7. Si Expo Go bloquea HTTP, registrar plataforma/versión/log nativo; no desactivar globalmente ATS/cleartext. El éxito desde PC no garantiza acceso desde dispositivo.

## Revisión de continuidad — propuesta de dependencias (sin instalación)

> Registro histórico de la revisión previa. La autorización e instalación posterior se documentan al final de este archivo.

Se ejecutó `npx expo install --check` en el estado actual de la etapa. Expo cargó .env y reportó `Found outdated dependencies`; esto confirma desalineación de compatibilidad, no un fallo de conexión a AWS.

| Paquete | Instalado | Recomendado por Expo |
|---------|-----------|----------------------|
| @expo/ui | 58.0.27 | ~58.0.28 |
| expo | 58.0.23 | ~58.0.24 |
| expo-constants | 58.0.15 | ~58.0.16 |
| expo-font | 58.0.11 | ~58.0.12 |
| expo-linking | 58.0.16 | ~58.0.17 |
| expo-router | 58.0.30 | ~58.0.31 |
| expo-splash-screen | 58.0.13 | ~58.0.14 |
| expo-status-bar | 58.0.4 | ~58.0.5 |
| expo-symbols | 58.0.4 | ~58.0.5 |
| expo-web-browser | 58.0.7 | ~58.0.8 |

Todos son cambios de parche 58.0.x recomendados por la herramienta de compatibilidad. Propuesta: alinear únicamente estos diez mediante expo install, manteniendo SDK58 y verificando regresiones de navegación, splash, fuentes y arranque. React 19.3.0, React Native 0.88.1 y SecureStore 58.0.3 no requieren ajuste según este check. La recomendación no equivale a actualización aplicada o verificada en móvil. Pendiente aprobación antes de modificar package.json/package-lock.json.

### Verificaciones efectivamente realizadas en esta revisión
- Inspección de useApiHealth, botón de login, AppButton, healthService, transporte, coordinador y contrato de sesión. El hook solo consulta al pulsar, limpia resultado anterior, maneja loading/error y evita setState de resultados al desmontar. AppButton se deshabilita durante loading; diagnóstico solo __DEV__. No se implementó de nuevo ningún servicio.
- `npm test -- --runTestsByPath src/services/api/__tests__/httpClient.test.ts src/services/__tests__/authSession.test.ts`: **48/48 tests, 2/2 suites aprobadas**. Incluye bloqueo HTTP antes de fetch y ausencia de llamadas autenticadas al bloquear login/registro/restauración. Pruebas con mocks, no captura de tráfico de celular.
- `sessionContract` sigue null y los guardas HTTPS se mantienen. Ninguna autenticación real habilitada.
- Seguir explorando continúa navegando directamente a /buyer sin crear sesión (inspección estática). Funcionamiento visual/catálogo en dispositivo pendiente del reporte del usuario.
- No se reejecutaron tsc/lint/Doctor completos en esta revisión sin cambios de código/dependencias. Sus resultados de la fase anterior se conservan como evidencia histórica.
- No hay aún resultados nuevos de Expo Go aportados por el usuario; las casillas móviles permanecen pendientes.

### Observaciones para la prueba guiada
- Metro: esperar carga de .env/exportación de EXPO_PUBLIC_API_BASE_URL, servidor listo y bundle Android al abrir el proyecto. Registrar errores de resolución de módulos, excepción de ejecución o incompatibilidad con Expo Go si aparecen.
- No hay console.log de peticiones en este código: Metro no tiene por qué imprimir GET /health o el resultado del botón. La ausencia de logs no prueba ausencia de tráfico. Para esa comprobación adicional usar inspector de red disponible o logs del backend, sin publicar credenciales/tokens.
- Celular: botón Comprobar conexión con indicador de carga, después HTTP 200 y los estados realmente devueltos, o mensaje de timeout/red/respuesta inválida. Mostrar Healthy solo si vino del servidor. Un error de red genérico no identifica por sí solo si la causa es AWS o política nativa.
- Recopilar versión de Expo Go/Android, resultado del botón o captura, logs relevantes de Metro, mensajes de login/registro con datos ficticios y resultado de Seguir explorando. Documentar cada resultado reportado como evidencia del usuario, separado de inspección estática/Jest.

## Actualización controlada de los 10 parches — aplicación y verificación

### Estado registrado ANTES de modificar dependencias
- Usuario autoriza únicamente los diez parches recomendados por Expo; conservar SDK58, React19.3.0, React Native0.88.1 y toda la implementación AWS existente.
- `git status --short --branch`: rama HRDCORE, con cambios previos sin commit. Había 18 archivos tracked modificados: `.github/workflows/ci.yml`, `.gitignore`, `AGENTS.md`, `CONSTITUTION.md`, `README.md`, `SDD_CHANGELOG.md`, `app.json`, `memoria.md`, `package-lock.json`, `package.json`, cinco pantallas auth, `src/app/buyer/profile.tsx`, `src/context/AuthContext.tsx` y `tsconfig.json`.
- Ya existían sin seguimiento `.env.example`, spec/plan/tasks005, tipos/validación API, hook health, servicios AWS/sesión y siete archivos de tests. Estos son trabajo de la fase anterior, no archivos creados por el ajuste de dependencias.
- Diff inicial de package.json: SecureStore58.0.3, maxWorkers2, alias Jest y eliminación del override transformIgnorePatterns. Diff inicial de lock: SecureStore añadido. Conservar todos estos cambios.
- Se conservaron snapshots de package/lock como objetos Git sin commit, staging ni cambio de rama: package.json `18984db7ba552a9b6f125106154734db58b52345`; package-lock.json `1eb75342eef03d26bfd6175ab6bc3234de56b2fc`. Se pueden inspeccionar con `git show <hash>`.
- Huella agregada de los otros 130 archivos tracked/untracked no ignorados: `72ae82bb8ced387c9d94ec1affd812d71f50bdc9`. Se excluyen únicamente package.json, package-lock.json y los tres documentos SDD autorizados para esta revisión. Se contrastará al finalizar para detectar cambios fuera de alcance.
- Node local confirmado: v25.4.0. Mantener registro de warnings engines; Node24 LTS recomendado, sin cambiar el entorno global automáticamente.

### Ejecución y verificaciones posteriores
- [x] Instalar los diez parches aprobados mediante expo install, sin cambiar otras dependencias directas.
- [x] Comparar package/lock contra snapshots iniciales y verificar huella de archivos fuera del alcance.
- [x] Ejecutar todos los checks solicitados y repetir las 48 pruebas de seguridad/sesión.
- [x] Registrar resultados reales y mantener pruebas físicas Expo Go pendientes.

### Versiones aplicadas (2026-11-11)
| Dependencia directa | Antes | Después instalado | Rango en package.json |
|---------------------|-------|-------------------|-----------------------|
| @expo/ui | 58.0.27 | 58.0.28 | ~58.0.28 |
| expo | 58.0.23 | 58.0.24 | ~58.0.24 |
| expo-constants | 58.0.15 | 58.0.16 | ~58.0.16 |
| expo-font | 58.0.11 | 58.0.12 | ~58.0.12 |
| expo-linking | 58.0.16 | 58.0.17 | ~58.0.17 |
| expo-router | 58.0.30 | 58.0.31 | ~58.0.31 |
| expo-splash-screen | 58.0.13 | 58.0.14 | ~58.0.14 |
| expo-status-bar | 58.0.4 | 58.0.5 | ~58.0.5 |
| expo-symbols | 58.0.4 | 58.0.5 | ~58.0.5 |
| expo-web-browser | 58.0.7 | 58.0.8 | ~58.0.8 |

Comando ejecutado:
```powershell
npx expo install "expo@~58.0.24" "@expo/ui@~58.0.28" "expo-constants@~58.0.16" "expo-font@~58.0.12" "expo-linking@~58.0.17" "expo-router@~58.0.31" "expo-splash-screen@~58.0.14" "expo-status-bar@~58.0.5" "expo-symbols@~58.0.5" "expo-web-browser@~58.0.8"
```

### Control de alcance y lockfile
- Comparación contra snapshot: package.json cambia **exactamente las diez entradas aprobadas**. Todas las otras propiedades (scripts, Jest, devDependencies, SecureStore y demás dependencias) se preservan. npm ls confirma React19.3.0, React Native0.88.1 y SecureStore58.0.3.
- package-lock.json sincronizado con package.json y las versiones instaladas; la comparación del grafo verifica que ninguna otra dependencia directa cambió de versión instalada y ninguna dependencia directa se eliminó.
- El lockfile contiene además **41 entradas transitivas con cambio de versión y una retirada transitiva (`getenv@2.0.0`)**. npm dejó de necesitar getenv porque las nuevas herramientas Expo ya no lo declaran. No es una eliminación de dependencias de la aplicación ni se ejecutó uninstall.
- Entre los cambios transitivos están @expo/config58.0.11→58.0.12, @expo/config-plugins58.0.12→58.0.13, @expo/metro-config58.0.21→58.0.22 y babel-preset-expo58.0.24→58.0.25. Expo58.0.24 requiere expo-modules-core/autolinking58.1.0 y expo-modules-cli0.5.0; Router58.0.31 requiere expo-server58.1.0. Estos cambios internos proceden del grafo publicado de los diez paquetes aprobados y no cambian SDK58 ni React Native. No se forzaron overrides incompatibles para mantener transitivas obsoletas.
- Expo CLI añadió incidentalmente plugins expo-status-bar/expo-web-browser a app.json. Se retiraron únicamente esas dos adiciones para restablecer el contenido inicial aprobado; SecureStore y los plugins anteriores permanecen. app.json conserva su huella inicial.
- Huella final de los 130 archivos fuera de los cinco archivos autorizados: **72ae82bb8ced387c9d94ec1affd812d71f50bdc9**, idéntica al inicio. AWS, restricciones HTTPS, AuthContext, pantallas, categorías, navegación, scroll y pruebas no recibieron cambios.
- Snapshots posteriores para auditoría sin commit: package.json `bc29d4ea7563c5059c9e41f03aa18cecd81e00b6`; package-lock.json `f836dc3bd8b3ee7b5370c3dc73518d42911c348f`. Comparar con `git diff <snapshot-inicial> <snapshot-posterior>`.

### Resultados reales posteriores a la instalación
| Comando / comprobación | Resultado |
|------------------------|-----------|
| npx expo install --check | Dependencies are up to date |
| npx tsc --noEmit | 0 errores, salida exitosa |
| npm run lint | 0 errores, mismas 69 advertencias existentes |
| npm run test:ci | 104 aprobadas, 0 fallidas, 7 suites aprobadas |
| npm test -- --runTestsByPath src/services/api/__tests__/httpClient.test.ts src/services/__tests__/authSession.test.ts | 48 aprobadas, 0 fallidas, 2 suites; son parte de las 104, no tests adicionales |
| npx expo-doctor | **20/20 checks passed. No issues detected!** |
| git diff --check | Sin errores de whitespace; avisos LF→CRLF habituales en Windows |
| npm ls --depth=0 | Diez versiones objetivo instaladas, React/RN intactos, sin dependencias directas inválidas |
| Metro tras actualización | Arrancó con caché limpia, .env cargado, raíz src/app y Waiting on http://localhost:8091 |

La prueba Metro usó `start -c --offline --port 8091` con CI=1 solo en el proceso hijo; ventana de 25 segundos y detención del proceso al concluir. No se dejó CI configurado globalmente ni un servidor ocupando ese puerto. No se compiló/renderizó en teléfono ni se hicieron nuevas peticiones AWS en esta actualización.

### Pendientes y arranque físico
- Node local25.4.0 sigue emitiendo EBADENGINE; recomendar Node24 LTS (>=24.3) antes de probar en Expo Go. No cambiar automáticamente Node global.
- Las 69 advertencias de lint son previas, fuera de este alcance. npm install también reporta 28 avisos de auditoría (1 low/27 moderate); sin npm audit fix ni cambios de seguridad no autorizados.
- Etapa005 permanece EN PRUEBAS. Auth real sigue bloqueada por HTTPS/JSON/Supabase y falta evidencia de Expo Go. El check de dependencias/Doctor ya no es bloqueo.
- El usuario puede ejecutar `npx expo start -c` en la raíz, abrir Expo Go compatible con SDK58 por QR (PC y teléfono en la misma red) y comprobar splash/bienvenida, login→Comprobar conexión, bloqueo HTTPS con datos ficticios, registro y Seguir explorando. Esperar bundle Android en Metro; no afirmar éxito de dispositivo hasta recibir resultado/captura real.
- Enviar versión de Expo Go/Android, resultado del arranque y botón health, cualquier error de Metro y resultado de exploración invitado. Registrar cada reporte por separado; aún no hay validación física de esta actualización.

## Publicación HRDCORE — parche adicional autorizado (2026-11-12)
- Usuario solicita subir los cambios a `utttgo-2026/utttgoo-movil`, rama HRDCORE. Git fetch confirma HEAD y origin/HRDCORE sin divergencia antes del commit.
- Doctor19/20 recomienda Expo58.0.25; el usuario autoriza expresamente actualizar ese parche y lockfile, verificar y después publicar. No actualizar otras dependencias directas ni modificar servicios/contratos.
- Snapshots Git previos sin commit: package.json `bc29d4ea7563c5059c9e41f03aa18cecd81e00b6`, lock `f836dc3bd8b3ee7b5370c3dc73518d42911c348f`. Huella37 archivos protegidos (sin manifest/lock/plan/tasks005): `34da1bb65f37b94cb59fa367ee96e0c589d34744`.
- [x] Aplicar Expo58.0.25 y revisar diferencias del lockfile: solo rango raíz y entrada de Expo (versión/resolved/integrity), ninguna transitiva ni otra dependencia directa modificada respecto al snapshot.
- [x] Repetir verificaciones: tsc0errores, lint0errores/30warnings,178tests/15suites, Doctor20/20, bundle Android HTTP200/1402módulos/12564ms. Sin prueba física nueva.
- [x] Contrastar huella37 archivos:34da1bb65f37b94cb59fa367ee96e0c589d34744 intacta. app.json, AWS, contextos, rutas y clasificación conservados.
- Publicación commit/push autorizada; el resultado de ejecución se comprueba en historial Git y GitHub Actions, no se presume antes de subir. CI remoto de HEAD anterior1e9ee15 figura success.
- .env, coverage y .expo ignorados; .env.example contiene únicamente configuración vacía. No credenciales nuevas en el commit. GitHub CLI portable temporal, sin instalación global ni persistencia de tokens.
