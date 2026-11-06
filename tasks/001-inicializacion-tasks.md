# Tasks 001 — Inicialización

## Información General
- **Spec**: 001-inicializacion
- **Versión**: 1.0
- **Estado**: COMPLETADO

---

## Tareas

### Fase 1: Proyecto Base
- [x] Crear proyecto Expo con template TypeScript
- [x] Configurar package.json (nombre, scripts, dependencias)
- [x] Configurar app.json (nombre, scheme, Android package, plugins)
- [x] Configurar tsconfig.json (strict mode, paths)
- [x] Configurar .gitignore

### Fase 2: Expo Router y Navegación
- [x] Configurar Expo Router en app.json (plugins)
- [x] Crear _layout.tsx raíz con Stack
- [x] Configurar typedRoutes en app.json (experiments)
- [x] Crear index.tsx scaffold

### Fase 3: Tema y Estilos
- [x] Definir palette de colores (src/theme/colors.ts)
- [x] Definir espaciado, radios, layout (src/theme/spacing.ts)
- [x] Definir tipografía Poppins (src/theme/typography.ts)
- [x] Definir sombras (src/theme/shadows.ts)
- [x] Exportar tema unificado (src/theme/index.ts)

### Fase 4: Componentes UI Base (14)
- [x] AppText (src/components/ui/AppText.tsx)
- [x] AppButton (src/components/ui/AppButton.tsx)
- [x] AppInput (src/components/ui/AppInput.tsx)
- [x] Screen (src/components/ui/Screen.tsx)
- [x] Surface (src/components/ui/Surface.tsx)
- [x] Avatar (src/components/ui/Avatar.tsx)
- [x] Badge (src/components/ui/Badge.tsx)
- [x] Divider (src/components/ui/Divider.tsx)
- [x] EmptyState (src/components/ui/EmptyState.tsx)
- [x] LoadingState (src/components/ui/LoadingState.tsx)
- [x] SectionHeader (src/components/ui/SectionHeader.tsx)
- [x] AppHeader (src/components/ui/AppHeader.tsx)
- [x] BrandLogo (src/components/ui/BrandLogo.tsx)
- [x] Divider (src/components/ui/Divider.tsx)
- [x] Barrel export (src/components/ui/index.ts)

### Fase 5: Tipos, Contexto, Datos, Servicios
- [x] Tipos base: FoodItem, Order, User, FoodCategory, etc. (src/types/models.ts)
- [x] AuthContext con AsyncStorage (src/context/AuthContext.tsx)
- [x] CartContext (single-vendor) (src/context/CartContext.tsx)
- [x] Tipos compartidos (src/types/models.ts)
- [x] Datos mock users (src/data/mock/users.ts)
- [x] Datos mock categories (src/data/mock/categories.ts)
- [x] Mock API (delay) (src/services/mockApi.ts)
- [x] Navegación routes (src/navigation/routes.ts)
- [x] Utilidades formato (src/utils/format.ts)
- [x] Hooks base (use-color-scheme, use-theme)

### Fase 6: Configuración Expo y Scripts
- [x] app.json (nombre, scheme, plugins, android)
- [x] package.json (scripts, deps)
- [x] tsconfig.json (strict, paths)
- [x] expo-env.d.ts
- [x] .gitignore

### Fase 7: Verificación y Cierre
- [x] TypeScript check: `npx tsc --noEmit` → 0 errores
- [x] Expo Doctor: `npx expo-doctor`
- [x] Expo Start: `npx expo start -c`
- [x] Expo Go Android: `npx expo start --android`

---

## Estado General
**COMPLETADO** — 2025-11-05