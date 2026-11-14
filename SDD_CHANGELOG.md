# UTTT-Go Móvil — SDD Change Log

## Información del proyecto

- **Proyecto**: UTTT-Go Móvil
- **Plataforma**: Android
- **Framework**: React Native + Expo
- **Lenguaje**: TypeScript
- **Navegación**: Expo Router
- **Estado actual**: Etapa006 P0/P1/P2 y registro P3 en pruebas;11 fotos pendientes; etapa005 continúa en pruebas; catálogo/pedidos mock
- **Backend**: /health verificado desde desarrollo; autenticación real bloqueada por HTTPS y contratos
- **Fuente principal de UI**: Figma

---

# Historial de cambios

## OTP Supabase y activación lazy (2026-11-13)

### Cambios

- Registro móvil mediante `POST /api/v1/auth/register` y pantalla OTP con `verifyOtp`/`resend` oficiales de Supabase.
- OTP válido dispara inmediatamente el login Backend; la contraseña solo vive en memoria y el JWT se guarda únicamente en SecureStore.
- Decodificación runtime separada para `/api/v1/auth/me` y `/api/v1/users/me`, con roles `Buyer`/`Seller`/`Admin` validados explícitamente.
- Variables públicas `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; nunca se incluyen secretos SMTP o `service_role`.

### Bloqueos y evidencia

- OpenAPI actual publica registro `200` y no define el cuerpo de respuesta de login; el cliente acepta explícitamente `200/202` en registro.
- `decodeLogin` permanece cerrado con `BLOCKED_BY_BACKEND_LOGIN_RESPONSE_CONTRACT`; no se adivina `token`, `jwt` ni `accessToken`.
- Validación local: TypeScript 0 errores, lint 0 errores, 205 pruebas, coverage 95.01% statements y export Android exitoso.

## Fase 005 - Demo invitado, onboarding y preparación Play Store

### Estado

**EN DESARROLLO**. Se creó una fase SDD específica antes de implementar.

### Cambios

- Demo invitado 1/2 y 2/2 con datos separados en `src/data/demo`.
- Welcome conectado al demo y Splash con identidad UTTT-GO.
- Login y Registro conectados al `ApiClient` autorizado.
- JWT almacenado con `expo-secure-store`; no se guardan contraseñas locales.
- Verificación de correo adaptada al enlace real de Supabase, sin token ficticio.
- Nombre, icono, adaptive icon, splash y workflows Android actualizados.
- Pruebas específicas del demo y respuesta `202 Accepted` de registro.
- Pruebas de contrato para Welcome, Demo 1, Demo 2 y ausencia de redirect por sesión.
- Flujo inicial corregido: Splash navega directamente a Demo 1; Welcome queda fuera del arranque.
- Expo actualizado a `~58.0.25` para satisfacer la validación de dependencias de Expo Doctor.
- Backend HTTPS verificado el 2026-11-12: base `https://3.129.142.54.nip.io`, health `200`, OpenAPI accesible y TLS válido.
- `EXPO_PUBLIC_API_BASE_URL` documenta la base HTTPS sin `/openapi/v1.json`; Backend Smoke usa HTTPS con validación TLS estricta.
- Deuda documentada: `CartProvider` se conserva por dependencia de pantallas buyer antiguas.
- Launcher simplificado sin texto para icono normal, adaptive icon y monochrome icon.
- Validación local repetida en `eas-google-play`: TypeScript limpio, 16 tests, coverage sobre umbrales,
  Expo Doctor 20/20 y export Android exitoso. Expo Router generó chunks independientes para Welcome,
  Demo 1, Demo 2, Login y Registro en el export web de verificación.
- Preview Android finalizado correctamente con EAS usando el commit `54ee2e9`; Build ID
  `a79cfe03-5d21-4a04-aa5f-e7d192cd9afe`, APK interna y package `mx.edu.utt.uttgo`.

### Bloqueos

`BLOCKED_BY_BACKEND_EMAIL_RESEND`, `BLOCKED_BY_EAS_AUTH`,
`NON_BLOCKING_EAS_WARNING` y `EXPECTED_SIDELOAD_WARNING` quedan sujetos a validación.

## Fase 004 - Preparación CI/CD, DevSecOps y contrato API

### Estado

**EN DESARROLLO**. Se actualizó la fase vigente sin crear una segunda estructura SDD.

### Cambios

- Node 22.13.1 unificado mediante `.nvmrc`, `engines` y workflows.
- Scripts reales de tests, coverage e integración.
- Pruebas deterministas para correo institucional, utilidades y `ApiError`.
- Configuración API por entorno y cliente centralizado aislado de los mocks.
- CI con quality, Expo Doctor y trazabilidad SDD.
- CodeQL, Dependency Review, npm audit, Dependabot y Gitleaks.
- Workflows manuales para Preview EAS, release AAB y smoke test Backend.
- Documentación de entornos, branch protection, evidencias y bloqueos externos.

### Bloqueos

`BLOCKED_BY_EXPO_LINK`, `BLOCKED_BY_EXPO_TOKEN`, `BLOCKED_BY_FIRST_EAS_BUILD`, `PENDING_LANDING_URL_DOCUMENTATION` y `MANUAL_GOOGLE_PLAY_UPLOAD`.
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

---

## Sincronización `HRDCORE` → `eas-google-play` (2026-11-13)

- Se integraron los cambios funcionales de `HRDCORE` (`91799ca`) mediante merge no fast-forward iniciado sobre la rama de publicación.
- Se conservaron CI/CD, DevSecOps, acciones fijadas por SHA, Node 22.13.1, Expo SDK 58, EAS, iconos, splash y origen HTTPS de producción.
- Se incorporaron catálogo responsivo, grupos de navegación, guardas privadas, servicios API tipados, coordinación de sesión con SecureStore y pruebas nuevas.
- El registro conserva `POST /api/v1/auth/register` con respuesta 202 y el flujo de verificación por enlace; no se incorporó OTP/PIN.
- El contrato de identidad del backend permanece bloqueado hasta confirmación, por lo que el login real no se declara operativo.
- Validación de integración: `npm test` 195/195, `npm run test:coverage` 195/195 con 97.57% statements, TypeScript 0 errores, Expo Doctor 20/20 y export Android exitoso.
- Lint termina con 0 errores y 31 warnings preexistentes en pantallas buyer/UI.
- El OpenAPI HTTPS respondió 200 y confirma `auth/login`, `auth/me`, `users/me` y `register`, pero publica `register` como 200 y un `servers.url` HTTP; esto queda como `BLOCKED_BY_BACKEND_CONTRACT` frente al contrato esperado 202/HTTPS.
- El OpenAPI no declara endpoints OTP, Supabase ni resend; `HRDCORE` tampoco contiene SDK/configuración Supabase ni implementación `verifyOtp`. Estado: `BLOCKED_BY_BACKEND_SUPABASE_OTP`.
- CartContext permanece como deuda histórica no activada por el alcance de compra directa.
