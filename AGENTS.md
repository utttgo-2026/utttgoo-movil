# AGENTS.md — Instrucciones para Agentes/Desarrolladores

> Guía operativa para trabajar sobre el repositorio UTTT-Go Móvil.

---

## 1. Qué es UTTT-Go Móvil

Aplicación móvil de la plataforma **UTTT-Go** (Universidad Tecnológica de Tula-Tepeji), una app para compra/venta de alimentos dentro de la comunidad universitaria.

- **Plataforma**: Android (Expo Go)
- **Stack**: React Native + Expo (SDK 58+) + TypeScript + Expo Router
- **UI Reference**: Figma (carpeta `../UTTT-Go/`,63 PNG inventariados)
- **Estado**: Etapa005 EN PRUEBAS, auth bloqueada por HTTPS/contratos; etapa006 P0/P1 implementados, Expo Go pendiente. Catálogo/pedidos mock.
- **Objetivo**: Prototipo funcional para presentación académica

---

## 2. Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| Framework | React Native + Expo (SDK 58+) |
| Lenguaje | TypeScript (strict mode) |
| Navegación | Expo Router (file-based, typedRoutes) |
| Estado | React Context API (AuthContext, CartContext) |
| Estilos | StyleSheet + Theme system |
| Tipografía | Poppins (@expo-google-fonts/poppins) |
| Iconos | @expo/vector-icons (Ionicons) |
| Almacenamiento | expo-secure-store (JWT); AsyncStorage legacy conservado, sin autoridad de sesión |
| Ejecución | Expo Go (Android) |

---

## 3. Arquitectura

```
src/
├── app/                    # Pantallas (Expo Router file-based routing)
│   ├── _layout.tsx         # Root Stack + providers
│   ├── index.tsx           # Splash (UI-001)
│   ├── (auth)/             # Route group: autenticación
│   └── buyer/              # Flujo comprador (16 pantallas)
├── components/ui/          # 14 componentes reutilizables
├── context/                # AuthContext, CartContext
├── data/mock/              # Datos simulados tipados
├── theme/                  # Colores, espaciado, tipografía, sombras
├── types/                  # Modelos TypeScript compartidos
├── hooks/                  | useResponsive, useAuth, useCart
├── navigation/             | Rutas tipadas
├── services/               | mockApi (delay)
├── utils/                  | format (currency, dates)
```

---

## 4. Flujo de Trabajo SDD (Obligatorio)

```text
Figma
  ↓
ANALISIS_FIGMA.md          (Inventario visual)
  ↓
CONSTITUTION.md            (Principios)
  ↓
SPECIFICATION (specs/)     (Qué y por qué)
  ↓
PLAN (plans/)              (Cómo)
  ↓
TASKS (tasks/)             (Tareas granulares, estado real)
  ↓
IMPLEMENTACIÓN             (Código siguiendo spec + plan)
  ↓
TEST / VERIFICACIÓN        (tsc, expo start, Expo Go)
  ↓
MEMORIA / CHANGELOG        (Decisiones, historial)
  ↓
SIGUIENTE ITERACIÓN
```

### Regla de Oro
**Figma manda**. Si Figma dice X, el código hace X. No "mejoras" sin validar contra Figma.

---

## 5. Estructura de Carpetas Clave

| Carpeta | Propósito |
|---------|-----------|
| `src/app` | Pantallas (Expo Router file-based routing) |
| `src/app/(auth)` | Pantallas auth (route group) |
| `src/app/buyer` | Flujo comprador (16 pantallas) |
| `src/components/ui` | 14 componentes base |
| `src/context` | AuthContext, CartContext |
| `src/data/mock` | Datos simulados tipados |
| `src/theme` | Colores, espaciado, tipografía, sombras |
| `src/types` | Modelos TypeScript compartidos |
| `src/hooks` | Hooks personalizados |
| `src/navigation` | Rutas tipadas |
| `src/services` | mockApi (delay) |
| `src/utils` | Formateo, helpers |

---

## 5. Dónde Están las Cosas Importantes

| Qué | Dónde |
|-----|-------|
| Constitution | `CONSTITUTION.md` |
| Specifications | `specs/001-inicializacion/`, `002-autenticacion/`, `003-comprador/` |
| Plans | `plans/001-inicializacion-plan.md`, etc. |
| Tasks | `tasks/001-inicializacion-tasks.md`, etc. |
| Constitution | `CONSTITUTION.md` |
| Memory | `memoria.md` |
| Changelog | `SDD_CHANGELOG.md` |
| Análisis Figma | `ANALISIS_FIGMA.md` |
| Mapa Navegación | `MAPA_NAVEGACION.md` |
| README | `README.md` |
| Configuración | `app.json`, `package.json`, `tsconfig.json` |
| Código fuente | `src/` |
| Assets | `src/assets/images/`, `UTTT-Go/` (originales Figma) |

---

## 5. Dónde Están las Cosas Importantes (Continuación)

| Qué | Dónde |
|-----|-------|
| Pantallas Auth | `src/app/(auth)/` |
| Pantallas Buyer | `src/app/buyer/` |
| Componentes UI | `src/components/ui/` |
| Contexto | `src/context/` |
| Datos Mock | `src/data/mock/` |
| Tema | `src/theme/` |
| Tipos | `src/types/` |
| Hooks | `src/hooks/` |
| Navegación | `src/navigation/` |
| Servicios | `src/services/` |
| Utilidades | `src/utils/` |
| Specs | `specs/` |
| Plans | `plans/` |
| Tasks | `tasks/` |
| Docs | `docs/` |

---

## 6. Reglas de Implementación (Inmutables)

### Figma es la Fuente Principal
- **No inventes diseños**. Si Figma dice X, el código hace X.
- **No sustituyas recursos Figma** por genéricos/emojis si existe el original.
- **Verifica contra Figma** antes de marcar COMPLETADO.

### Navegación
- **Navegación (006)**: push para avanzar, back para regresar; replace de fallback solo sin historial o cierre explícito. Nunca login como fallback genérico.
- **Rutas dinámicas**: Segmentos `[id]` + `useLocalSearchParams`.
- **Ownership (006)**: root/buyer/tabs/grupos solo declaran pantallas de su nivel, sin duplicar hijos en root.
- **No Stack.Screen redundantes**: Expo Router descubre rutas automáticamente.

### VirtualizedList / FlatList
- **Nunca anidar FlatList en ScrollView** misma orientación.
- **Fix**: `Screen` con `nestedScrollEnabled={true}` + `scroll` prop solo cuando necesario.

### TypeScript
- **Strict mode siempre**. `npx tsc --noEmit` = 0 errors obligatorio.
- **Sin `any` innecesario**. Tipado estricto en props, state, hooks.

### Datos Mock
- **Coherentes con Figma**: Categorías, productos, precios, imágenes según Figma.
- **Single-vendor cart**: Un vendedor por compra (regla de negocio).
- **Persistencia**: JWT en SecureStore; no usar registros legacy AsyncStorage para autenticar, no borrarlos automáticamente.

### Recursos Gráficos
- **Figma primero**: Si existe en Figma, úsalo. Carpeta origen: `UTTT-Go/`.
- **No modificar originales**: Copiar a `src/assets/images/` para uso runtime.
- **Placeholders documentados**: Si no existe en Figma, Unsplash temporal + documentado.

---

## 6. Qué NO Debe Modificarse Sin Revisar SDD

| Archivo/Carpeta | Por Qué |
|-----------------|---------|
| `CONSTITUTION.md` | Principios base del proyecto |
| `specs/*/spec.md` | Definen qué se construye |
| `plans/*.md` | Definen cómo se implementa |
| `tasks/*.md` | Estado real del trabajo |
| `CONSTITUTION.md` | Principios inmutables |
| `src/theme/*` | Sistema de diseño global |
| `src/types/models.ts` | Contratos de datos globales |
| `src/navigation/routes.ts` | Contrato de navegación |
| `src/context/*` | Estado global compartido |
| `src/data/mock/*.ts` | Datos de prueba coherentes |

**Regla**: Si tocas estos archivos, actualiza SDD correspondiente en el mismo commit (local).

---

## 7. Comandos de Verificación (Obligatorios)

```powershell
# TypeScript check (obligatorio antes de cualquier commit)
npx tsc --noEmit

# Expo Doctor (compatibilidad)
npx expo-doctor

# Inicio desarrollo (cache limpio)
npx expo start -c

# Android directo
npx expo start --android

# Lint
npx expo lint

# Tests
npm run test
npm run test:ci
```

**Regla**: No commit sin `npx tsc --noEmit` = 0 errors + prueba manual en Expo Go.

---

## 8. Flujo de Trabajo Diario

1. **Leer**: `tasks/XXX-tasks.md` → ver qué está pendiente
2. **Leer**: `specs/XXX/spec.md` → entender qué se construye
3. **Leer**: `plans/XXX-plan.md` → entender cómo implementar
4. **Implementar**: Código siguiendo Constitution + Spec + Plan
5. **Verificar**: `npx tsc --noEmit` + `npx expo start -c` + Expo Go
6. **Actualizar**: `tasks/XXX-tasks.md` (marcar completado)
7. **Actualizar**: `SDD_CHANGELOG.md` (registrar cambio)
8. **Actualizar**: `memoria.md` (si decisión arquitectónica)
9. **Commit local** (sin push hasta autorización)

---

## 9. Recursos Figma

| Carpeta | Contenido |
|---------|-----------|
| `../UTTT-Go/` | 63 PNG inventariados (originales, no modificar) |
| `src/assets/images/` | Copias para uso runtime |
| `ANALISIS_FIGMA.md` | Inventario real63 PNG y alcance de inspección visual |
| `MAPA_NAVEGACION.md` | Flujos de navegación por rol |

### Pantallas Clave Figma (Etapa 3 - Comprador)
| ID | Nombre | Archivo |
|----|--------|---------|
| UI-006 | Inicio comprador | `buyer/index.tsx` |
| UI-007 | Buscar | `buyer/search.tsx` |
| UI-008 | Filtros | `buyer/filters.tsx` |
| UI-010 | Disponible ahora | `buyer/available-now.tsx` |
| UI-012 | Categoría | `buyer/category.tsx` |
| UI-013 | Detalle alimento | `buyer/food/[id].tsx` |
| UI-015 | Datos del pedido | `buyer/order-data.tsx` |
| UI-016 | Confirmar pedido | `buyer/confirm-order.tsx` |
| UI-017 | Pedido generado | `buyer/order-created.tsx` |
| UI-019 | Mis pedidos | `buyer/orders.tsx` |
| UI-020 | Detalle seguimiento | `buyer/order-tracking.tsx` |
| UI-021 | Calificar pedido | `buyer/rate-order.tsx` |
| UI-022 | Confirmación cancelación | `buyer/cancel-order.tsx` |
| UI-024 | Notificaciones | `buyer/notifications.tsx` |
| UI-025 | Mi perfil | `buyer/profile.tsx` |

---

## 10. Qué NO Hacer

- ❌ No push a GitHub sin autorización explícita
- ❌ No commit sin `npx tsc --noEmit` = 0 errors
- ❌ No push sin prueba manual en Expo Go
- ❌ No modificar `UTTT-Go/` (originales Figma)
- ❌ No inventar categorías/diseños sin validar Figma
- ❌ No usar emojis como sustitutos de iconos Figma
- ❌ No anidar FlatList en ScrollView misma orientación
- ❌ No `router.replace` en login/verify-email (usa `push`)
- ❌ No marcar COMPLETADO sin tsc limpio + Expo Go verificado
- ❌ No duplicar documentación SDD (un solo changelog, un solo AGENTS.md)
- ❌ No inventar datos mock incoherentes con Figma/temática UTTT

---

## 12. Reglas CI/CD (Obligatorias)

### CI (Integración Continua)
- **Obligatorio antes de merge**: CI debe pasar en GitHub Actions
- **Jobs obligatorios**: TypeScript, Lint, Expo Doctor
- **Tests**: Cuando existan, deben pasar en CI
- **Pipeline**: `.github/workflows/ci.yml` (TypeScript, Lint, Expo Doctor)
- **Triggers**: PR/push a `main` y `HRDCORE`

### AWS-API-INTEGRATION (Etapa 005)
- SDD: `specs/005-aws-api-integration/spec.md`, `plans/005-aws-api-integration-plan.md`, `tasks/005-aws-api-integration-tasks.md`.
- Mantener único AuthContext y respuestas sin contrato como unknown; no implementar adaptadores de login/User/roles con nombres supuestos.
- Leer URL únicamente en `src/services/api/config.ts`, acceso estático EXPO_PUBLIC_API_BASE_URL; .env ignorado.
- Solo GET /health sin credenciales admite HTTP. No enviar contraseñas/JWT por HTTP ni cambiar seguridad nativa global.
- SecureStore para JWT, sin contraseñas/logs de tokens ni fallback de autenticación demo/AsyncStorage.
- No leer/reutilizar/borrar automáticamente @uttgo:users; una limpieza futura necesita estrategia validada y eliminación dirigida.
- Sin OTP local ni endpoints Supabase/refresh/recuperación supuestos. Registro 202 no crea sesión.
- CI ejecuta tests y gate con Node 24; ejecutar también `npm run test:ci` local. No confundir fixtures unitarios con JSON real.
- Login real sigue bloqueado hasta HTTPS, contrato verificado y Expo Go. Diagnóstico /health en login solo en desarrollo (__DEV__).

### CD (Despliegue Continuo)
- **Fase 1 (Actual)**: Preview builds Android via EAS
  - Workflow: `.github/workflows/build-android.yml`
  - Trigger: `workflow_dispatch` + opcional `push` a `HRDCORE`
  - Profile: `preview` (APK interna)
  - Requiere: `EXPO_TOKEN` en GitHub Secrets, proyecto vinculado a EAS
- **Fase 2 (Futuro)**: Production builds + `eas submit`
  - Requiere credenciales Google Play / App Store
  - NO implementar sin autorización explícita

### Reglas de Seguridad
- ❌ NO commit sin `npx tsc --noEmit` = 0 errors + `npm run lint` limpio
- ❌ NO push sin CI passing en GitHub Actions
- ❌ NO secrets en código (`EXPO_TOKEN`, credenciales) → usar GitHub Secrets
- ❌ NO `router.replace` en login/verify-email (usa `push`)
- ❌ NO builds de producción sin autorización explícita
- ❌ NO publicar en tiendas sin autorización explícita

### Workflow Daily
1. `npx tsc --noEmit` + `npm run lint` local antes de commit
2. `npx expo start -c` para probar en Expo Go
3. Push → CI corre en GitHub Actions
4. Merge solo si CI pasa
5. Para build preview: `workflow_dispatch` → `build-android.yml`

---
