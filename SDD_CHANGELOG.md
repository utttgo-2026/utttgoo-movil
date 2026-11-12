# UTTT-Go Móvil — SDD Change Log

## Información del proyecto

- **Proyecto**: UTTT-Go Móvil
- **Plataforma**: Android
- **Framework**: React Native + Expo
- **Lenguaje**: TypeScript
- **Navegación**: Expo Router
- **Estado actual**: Desarrollo local / Mock
- **Backend**: No conectado actualmente
- **Fuente principal de UI**: Figma

---

# Historial de cambios

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
