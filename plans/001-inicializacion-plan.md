# Plan 001 — Inicialización del Proyecto

## Información General
- **Spec**: 001-inicializacion
- **Versión**: 1.0
- **Fecha**: 2025-11-05
- **Estado**: COMPLETADO

---

## 1. Objetivo

Configurar la base técnica del proyecto móvil UTTT-Go con Expo, React Native, TypeScript, Expo Router, sistema de tema, componentes base, modelos de datos, contextos, servicios mock y configuración inicial de Expo.

---

## 2. Alcance del Plan

### Entregables
1. Proyecto Expo inicializado con template TypeScript
2. Expo Router configurado (typedRoutes, file-based routing)
3. TypeScript strict mode configurado
4. Estructura de carpetas modular
5. Sistema de tema (colores, tipografía, espaciado, sombras, radios)
6. 14 componentes UI base reutilizables
7. Configuración app.json (nombre, scheme, Android package, plugins)
8. Contextos base (AuthContext, CartContext)
8. Tipos base (FoodItem, Order, User, FoodCategory, etc.)
9. Servicios mock base (delay)
9. Datos mock iniciales (users, categories)
10. Hooks base (useColorScheme, useTheme)
10. Configuración app.json, package.json, tsconfig.json
11. Scripts de desarrollo (start, android, typecheck, doctor)

---

## 2. Fases de Implementación

### Fase 1: Proyecto Base (Día 1)
| Tarea | Archivos | Estado |
|-------|----------|--------|
| Crear proyecto Expo con template TypeScript | `npx create-expo-app@latest` | COMPLETADO |
| Configurar package.json (nombre, scripts, deps) | `package.json` | COMPLETADO |
| Configurar app.json (nombre, scheme, plugins) | `app.json` | COMPLETADO |
| Configurar tsconfig.json (strict, paths) | `tsconfig.json` | COMPLETADO |
| Configurar .gitignore | `.gitignore` | COMPLETADO |

### Fase 2: Expo Router y Navegación (Día 1)
| Tarea | Archivos | Estado |
|-------|----------|--------|
| Configurar Expo Router en app.json | `app.json` (plugins) | COMPLETADO |
| Crear _layout.tsx raíz con Stack | `src/app/_layout.tsx` | COMPLETADO |
| Configurar typedRoutes en app.json | `app.json` (experiments) | COMPLETADO |
| Crear index.tsx scaffold | `src/app/index.tsx` | COMPLETADO |

### Fase 3: Tema y Estilos (Día 2)
| Tarea | Archivos | Estado |
|-------|----------|--------|
| Definir palette de colores | `src/theme/colors.ts` | COMPLETADO |
| Definir espaciado, radios, layout | `src/theme/spacing.ts` | COMPLETADO |
| Definir tipografía (Poppins) | `src/theme/typography.ts` | COMPLETADO |
| Definir sombras | `src/theme/shadows.ts` | COMPLETADO |
| Exportar tema unificado | `src/theme/index.ts` | COMPLETADO |

### Fase 4: Componentes UI Base (Día 2-3)
| Componente | Archivo | Estado |
|------------|---------|--------|
| AppText | `src/components/ui/AppText.tsx` | COMPLETADO |
| AppButton | `src/components/ui/AppButton.tsx` | COMPLETADO |
| AppInput | `src/components/ui/AppInput.tsx` | COMPLETADO |
| Screen | `src/components/ui/Screen.tsx` | COMPLETADO |
| Surface | `src/components/ui/Surface.tsx` | COMPLETADO |
| Avatar | `src/components/ui/Avatar.tsx` | COMPLETADO |
| Badge | `src/components/ui/Badge.tsx` | COMPLETADO |
| Divider | `src/components/ui/Divider.tsx` | COMPLETADO |
| EmptyState | `src/components/ui/EmptyState.tsx` | COMPLETADO |
| LoadingState | `src/components/ui/LoadingState.tsx` | COMPLETADO |
| SectionHeader | `src/components/ui/SectionHeader.tsx` | COMPLETADO |
| AppHeader | `src/components/ui/AppHeader.tsx` | COMPLETADO |
| BrandLogo | `src/components/ui/BrandLogo.tsx` | COMPLETADO |
| Barrel export | `src/components/ui/index.ts` | COMPLETADO |

### Fase 5: Tipos, Contexto, Datos, Servicios (Día 3)
| Entidad | Archivo | Estado |
|---------|---------|--------|
| Tipos base (FoodItem, Order, User, etc.) | `src/types/models.ts` | COMPLETADO |
| AuthContext (con AsyncStorage) | `src/context/AuthContext.tsx` | COMPLETADO |
| CartContext (single-vendor) | `src/context/CartContext.tsx` | COMPLETADO |
| Tipos compartidos | `src/types/models.ts` | COMPLETADO |
| Datos mock users | `src/data/mock/users.ts` | COMPLETADO |
| Datos mock categories | `src/data/mock/categories.ts` | COMPLETADO |
| Mock API (delay) | `src/services/mockApi.ts` | COMPLETADO |
| Navegación routes | `src/navigation/routes.ts` | COMPLETADO |
| Utilidades formato | `src/utils/format.ts` | COMPLETADO |
| Hooks base | `src/hooks/use-color-scheme.ts`, `use-theme.ts` | COMPLETADO |

### Fase 6: Configuración Expo y Scripts (Día 3)
| Tarea | Archivo | Estado |
|-------|---------|--------|
| app.json (nombre, scheme, plugins, android) | `app.json` | COMPLETADO |
| package.json (scripts, deps) | `package.json` | COMPLETADO |
| tsconfig.json (strict, paths) | `tsconfig.json` | COMPLETADO |
| expo-env.d.ts | `expo-env.d.ts` | COMPLETADO |
| .gitignore | `.gitignore` | COMPLETADO |

### Fase 7: Verificación y Cierre (Día 4)
| Validación | Comando | Estado |
|------------|---------|--------|
| TypeScript check | `npx tsc --noEmit` | COMPLETADO |
| Expo Doctor | `npx expo-doctor` | COMPLETADO |
| Expo Start | `npx expo start -c` | COMPLETADO |
| Expo Go Android | `npx expo start --android` | COMPLETADO |

---

## 3. Dependencias Instaladas

### Runtime
- `expo@~58.0.23`, `expo-router@~58.0.30`, `react@19.3.0`, `react-native@0.88.1`
- `@expo/vector-icons@^15.1.1`, `@expo-google-fonts/poppins@^0.4.1`
- `expo-font`, `expo-splash-screen`, `expo-router`, `expo-status-bar`
- `@react-native-async-storage/async-storage@^1.24.0`
- `react-native-gesture-handler`, `react-native-reanimated`
- `react-native-safe-area-context`, `react-native-screens`
- `expo-image`, `expo-linking`, `expo-constants`, `expo-status-bar`

### Desarrollo
- `typescript@~6.0.3`, `@types/react@~19.3.0`
- `expo-doctor`, `expo-lint`

---

## 4. Validaciones de Cierre

| Validación | Comando | Resultado Esperado |
|------------|---------|-------------------|
| TypeScript | `npx tsc --noEmit` | 0 errores |
| Expo Doctor | `npx expo-doctor` | Sin warnings críticos |
| Expo Start | `npx expo start -c` | Levanta sin errores |
| Expo Go Android | `npx expo start --android` | Abre en dispositivo |

---

## 5. Estado

**COMPLETADO** — 2025-11-05

---

## 6. Referencias

- `specs/001-inicializacion/spec.md`
- `CONSTITUTION.md`
- `SDD_CHANGELOG.md` (Etapa 1)