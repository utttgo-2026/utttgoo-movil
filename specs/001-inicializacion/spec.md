# Specification 001 — Inicialización del Proyecto

## Información General
- **ID**: 001-inicializacion
- **Nombre**: Inicialización del Proyecto UTTT-Go Móvil
- **Versión**: 1.0
- **Fecha**: 2025-11-05
- **Estado**: COMPLETADO

---

## 1. Objetivo

Configurar la base técnica del proyecto móvil UTTT-Go con Expo, React Native, TypeScript, Expo Router, sistema de tema, componentes base, modelos de datos, contextos, servicios mock y configuración inicial de Expo.

---

## 2. Alcance

### Incluido
- Creación del proyecto Expo con template TypeScript
- Configuración de Expo Router (typedRoutes, file-based routing)
- Configuración de TypeScript strict mode
- Estructura de carpetas modular (src/app, src/components, src/context, src/data, src/theme, src/types, src/hooks, src/navigation, src/services, src/utils)
- Configuración del tema visual (colores, tipografía Poppins, espaciado, sombras, radios)
- Componentes base reutilizables (14 componentes UI)
- Configuración de app.json (nombre, scheme, Android package, plugins)
- Configuración de plugins: expo-router, expo-splash-screen, expo-font
- Scripts: start, android, ios, web, typecheck, doctor
- Tipos base: FoodItem, Order, User, FoodCategory, etc.
- Contextos base: AuthContext, CartContext
- Servicios mock base (delay)
- Datos mock iniciales (users, categories)
- Hooks base (useColorScheme, useTheme)

### No Incluido
- Pantallas de autenticación (Etapa 2)
- Pantallas de comprador (Etapa 3)
- Pantallas de vendedor/administrador (Etapas 4-5)
- Backend real, base de datos, API
- Tests automatizados
- CI/CD

---

## 3. Requisitos Funcionales

| ID | Requisito | Estado |
|----|-----------|--------|
| REQ-001 | Proyecto Expo creado con template TypeScript | COMPLETADO |
| REQ-002 | Expo Router configurado con typedRoutes | COMPLETADO |
| REQ-003 | TypeScript strict mode activado | COMPLETADO |
| REQ-004 | Estructura de carpetas modular creada | COMPLETADO |
| REQ-005 | Tema visual configurado (colores, tipografía, espaciado) | COMPLETADO |
| REQ-006 | 14 componentes UI base creados | COMPLETADO |
| REQ-007 | app.json configurado (nombre, scheme, plugins) | COMPLETADO |
| REQ-008 | TypeScript strict mode activado | COMPLETADO |
| REQ-009 | Tipos base definidos (FoodItem, Order, User, etc.) | COMPLETADO |
| REQ-010 | Contextos base (AuthContext, CartContext) | COMPLETADO |
| REQ-011 | Servicios mock base (delay) | COMPLETADO |
| REQ-012 | Datos mock iniciales (users, categories) | COMPLETADO |
| REQ-013 | Hooks base (useColorScheme, useTheme) | COMPLETADO |
| REQ-014 | Configuración app.json (nombre, scheme, plugins) | COMPLETADO |
| REQ-015 | Scripts package.json (start, android, typecheck, doctor) | COMPLETADO |

---

## 4. Requisitos No Funcionales

| ID | Requisito | Estado |
|----|-----------|--------|
| NFR-001 | TypeScript strict mode sin errores | COMPLETADO |
| NFR-002 | Expo Router typedRoutes habilitado | COMPLETADO |
| NFR-003 | Compatibilidad Expo Go (sin native modules) | COMPLETADO |
| NFR-004 | Estructura modular escalable | COMPLETADO |
| NFR-005 | Tipado estricto en toda la base | COMPLETADO |

---

## 5. Archivos Involucrados

### Configuración
- `package.json`, `app.json`, `tsconfig.json`, `.gitignore`

### Tema
- `src/theme/colors.ts`, `spacing.ts`, `typography.ts`, `shadows.ts`, `index.ts`

### Componentes UI (14)
- `src/components/ui/AppText.tsx`, `AppButton.tsx`, `AppInput.tsx`, `Screen.tsx`, `Surface.tsx`
- `Avatar.tsx`, `Badge.tsx`, `Divider.tsx`, `EmptyState.tsx`, `LoadingState.tsx`
- `SectionHeader.tsx`, `AppHeader.tsx`, `BrandLogo.tsx`, `index.ts`

### Contexto
- `src/context/AuthContext.tsx`, `CartContext.tsx`

### Tipos
- `src/types/models.ts`

### Datos Mock Iniciales
- `src/data/mock/users.ts`, `categories.ts`, `index.ts`

### Servicios
- `src/services/mockApi.ts`

### Navegación
- `src/navigation/routes.ts`

### Hooks
- `src/hooks/use-color-scheme.ts`, `use-theme.ts`, `use-color-scheme.web.ts`

### Configuración Expo
- `app.json`, `package.json`, `tsconfig.json`, `expo-env.d.ts`

### App Layout Inicial
- `src/app/_layout.tsx`, `src/app/index.tsx` (scaffold inicial)

---

## 6. Criterios de Finalización

- [x] `npx tsc --noEmit` → 0 errores
- [x] `npx expo start` levanta sin errores
- [x] Estructura de carpetas creada y verificada
- [x] Componentes UI renderizan sin errores
- [x] Tema aplicado consistentemente
- [x] `npx expo-doctor` sin warnings críticos

---

## 7. Estado

**COMPLETADO** — 2025-11-05

---

## 8. Referencias

- `ANALISIS_FIGMA.md` (inventario 66 pantallas)
- `MAPA_NAVEGACION.md` (flujos de navegación)
- `SDD_CHANGELOG.md` (historial de cambios)