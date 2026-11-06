# Constitution — UTTT-Go Móvil

> Documento base que establece los principios arquitectónicos, de diseño, datos, calidad y metodología SDD del proyecto móvil UTTT-Go.

---

## 1. Arquitectura

### Stack Tecnológico
- **Framework**: React Native con Expo (SDK 58+)
- **Lenguaje**: TypeScript (strict mode)
- **Navegación**: Expo Router (file-based routing, typed routes)
- **Estado**: React Context API (AuthContext, CartContext)
- **Estilos**: StyleSheet + Theme system (colores, tipografía, espaciado, sombras, radios)
- **Tipografía**: Poppins (via @expo-google-fonts/poppins)
- **Iconos**: @expo/vector-icons (Ionicons)
- **Almacenamiento local**: @react-native-async-storage/async-storage
- **Ejecución**: Expo Go (Android) — sin development builds

### Patrones Arquitectónicos
- **File-based routing**: Expo Router (src/app)
- **Componentes reutilizables**: src/components/ui (14 componentes base)
- **Context API**: Estado global (AuthContext, CartContext)
- **Servicios mock**: src/services/mockApi.ts (simulación de latencia)
- **Tipos compartidos**: src/types/models.ts (FoodItem, Order, User, etc.)
- **Tema centralizado**: src/theme (colores, espaciado, tipografía, sombras, radios)
- **Hooks personalizados**: src/hooks (useResponsive, useAuth, useCart)
- **Navegación tipada**: src/navigation/routes.ts
- **Datos mock**: src/data/mock (users, categories, foods, orders, notifications)

### Separación de Responsabilidades
| Capa | Responsabilidad | Ubicación |
|------|-----------------|-----------|
| UI | Pantallas, componentes, estilos | src/app, src/components/ui |
| Estado | AuthContext, CartContext | src/context |
| Navegación | Rutas, navegación tipada | src/app, src/navigation |
| Datos | Mock data, tipos | src/data/mock, src/types |
| Tema | Colores, espaciado, tipografía | src/theme |
| Utilidades | Formateo, helpers | src/utils |
| Hooks | Lógica reutilizable | src/hooks |

---

## 2. Diseño

### Principios de Diseño
1. **Figma como fuente única de verdad**: Todas las decisiones visuales se basan en los diseños de Figma exportados en `UTTT-Go/`.
2. **Fidelidad visual**: Replicar pantallas originales — colores, tipografías, tamaños, espaciados, alineaciones, bordes, sombras, radios, iconos, imágenes, distribución.
3. **Recursos originales**: Usar recursos exportados de Figma (imágenes, iconos) cuando existan. No sustituir por versiones genéricas, emojis o placeholders si existe el recurso original.
3. **Componentes reales**: Reconstruir cada interfaz con componentes nativos de React Native (View, Text, Pressable, FlatList, Image, etc.). No usar capturas completas como fondos.
4. **Responsive**: Adaptación a diferentes anchos de pantalla usando `useWindowDimensions` y utilidades de escalado (`moderateScale`, `verticalScale`, `wp`, `hp`).
4. **Safe Areas**: Respeto de áreas seguras (notches, barras de sistema) via `react-native-safe-area-context`.

### Recursos Gráficos
- **Carpeta origen**: `UTTT-Go/` (66 imágenes exportadas de Figma)
- **Carpeta destino**: `src/assets/images/` (recursos copiados para uso en runtime)
- **Naming**: Mantener nombres descriptivos basados en ID Figma (ej: `welcome-hero.png` de UI-002)
- **No modificar originales**: Nunca modificar ni eliminar archivos en `UTTT-Go/`.

### Tipografía
- **Familia**: Poppins (400, 500, 600, 700) via `@expo-google-fonts/poppins`
- **Escalas**: `fontSize` (xxs..hero), `lineHeight` correspondientes
- **Pesos**: regular, medium, semibold, bold

### Colores (Palette Oficial)
| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#D2030F` | Botones primarios, acentos, marca |
| `primaryDark` | `#A8020C` | Estados pressed |
| `primarySoft` | `#FFF0F0` | Fondos sutiles, badges |
| `text` | `#251E1A` | Texto principal |
| `textMuted` | `#766B64` | Texto secundario |
| `textSubtle` | `#928E8C` | Texto terciario |
| `background` | `#FFFFFF` | Fondo principal |
| `surface` | `#FFFFFF` | Tarjetas, superficies |
| `surfaceMuted` | `#F5F5F5` | Fondos secundarios |
| `border` | `#E6E0DC` | Bordes, divisores |
| `success` | `#008522` | Estados éxito |
| `warning` | `#C77700` | Advertencias |
| `danger` | `#D2030F` | Errores, acciones destructivas |
| `info` | `#2F6F7E` | Informativo |

---

## 3. Datos

### Estado Actual: Mock Local
- **Fuente**: `src/data/mock/` (archivos TypeScript)
- **Tipado**: `src/types/models.ts` (FoodItem, Order, User, Category, etc.)
- **Persistencia**: AsyncStorage solo para usuarios registrados (AuthContext)
- **Backend**: NO conectado — pendiente de integración futura

### Separación Datos/UI
- **Mock data**: `src/data/mock/*.ts` (arrays tipados, funciones de búsqueda)
- **Componentes**: Consumen datos via imports directos o Context
- **Servicios**: `src/services/mockApi.ts` (simulación de latencia `delay()`)

### Categorías (Regla Crítica)
- **Fuente**: Figma UI-012 Categoría.png (verificar contra imagen real)
- **No inventar**: Usar exactamente las categorías que aparecen en Figma
- **Imágenes**: Usar recursos exportados de Figma cuando existan; si no, placeholder Unsplash como temporal
- **Iconos**: Usar recursos de Figma si existen; Ionicons como fallback
- **Funcionalidad**: Filtrado real por `categoryId` en mock data

### Productos Mock (Regla)
- Mínimo por categoría: 3 items para demostrar filtrado
- Campos obligatorios: id, sellerId, categoryId, name, description, price, image, rating, reviewCount, prepTimeMinutes, stock, availability, tags, isFavorite
- Distribución equilibrada entre categorías reales de Figma
- Precios, descripciones, tags coherentes con temática universitaria (UTTT)

---

## 4. Calidad

### TypeScript
- **Strict mode**: Activado (`tsconfig.json` extends `expo/tsconfig.base`)
- **Tipado estricto**: Sin `any` innecesario, tipado estricto en props, state, hooks
- **Validación**: `npx tsc --noEmit` obligatorio antes de cualquier commit

### Validaciones de Código
- **Lint**: `npx expo lint` (configuración Expo)
- **TypeScript**: `npx tsc --noEmit` (zero errors obligatorio)
- **Expo Doctor**: `npx expo-doctor` para compatibilidad Expo Go

### Navegación
- **Expo Router**: Typed routes (`experiments.typedRoutes: true`)
- **Back navigation**: `router.push` (no `replace`) para mantener historial, excepto logout
- **Rutas dinámicas**: Segmentos `[id]` + `useLocalSearchParams`
- **Stack único**: Root layout con todos los screens declarados

### VirtualizedList / FlatList
- **Nunca anidar FlatList en ScrollView** con misma orientación
- **Solución**: `Screen` con `nestedScrollEnabled={true}` + `scroll` prop solo cuando sea necesario
- **FlatList horizontal**: Dentro de View (no ScrollView)
- **FlatList vertical (grid)**: `numColumns={2}` dentro de Screen sin scroll padre

### Funcionalidad Real
- **No pantallas estáticas**: Botones, formularios, listas, filtros deben funcionar
- **Datos mock**: Simular latencia (`delay`), respuestas realistas
- **Persistencia**: AsyncStorage para usuarios registrados (AuthContext)
- **Carrito**: Single-vendor (un vendedor por pedido, regla de negocio)

---

## 5. Metodología SDD (Specification-Driven Development)

### Flujo Obligatorio
```text
Figma
  ↓
ANALISIS_FIGMA.md          (Inventario visual)
  ↓
CONSTITUTION.md            (Principios)
  ↓
SPECIFICATION (specs/)     (Qué se construye y por qué)
  ↓
PLAN (plans/)              (Cómo se implementa)
  ↓
TASKS / AGENDA (tasks/)    (Tareas granulares, estado real)
  ↓
IMPLEMENTACIÓN             (Código siguiendo spec + plan)
  ↓
TEST / VERIFICACIÓN        (tsc, expo start, Expo Go)
  ↓
MEMORIA / CHANGELOG        (Decisiones, historial)
  ↓
SIGUIENTE ITERACIÓN
```

### Documentos SDD Obligatorios
| Nivel | Carpeta | Contenido |
|-------|---------|-----------|
| Constitution | Raíz | `CONSTITUTION.md` (este archivo) |
| Specifications | `specs/XXX-nombre/` | `spec.md`, `plan.md`, `tasks.md` |
| Plans | `plans/` | Planes maestros por etapa |
| Tasks | `tasks/` | Agendas por etapa |
| Memory | Raíz | `memoria.md` (decisiones) |
| Changelog | Raíz | `SDD_CHANGELOG.md` (historial) |
| Agents | Raíz | `AGENTS.md` (instrucciones para agentes) |
| README | Raíz | `README.md` (documentación usuario) |

### Estados de Tareas (Obligatorios)
| Estado | Significado |
|--------|-------------|
| `COMPLETADO` | Implementado, verificado, tsc OK, probado en Expo Go |
| `EN DESARROLLO` | En curso, código escrito, pendiente verificación |
| `EN PRUEBAS` | Código completo, en verificación manual/Expo Go |
| `PENDIENTE` | No iniciado, dependencias resueltas |
| `NO IMPLEMENTADO` | Fuera de alcance actual |

**Regla**: No marcar `COMPLETADO` sin `npx tsc --noEmit` limpio + prueba en Expo Go.

---

## 5. Alcance Actual

### En Desarrollo (Etapa 3 - Comprador)
- ✅ 16 pantallas implementadas (UI-006 a UI-025)
- ✅ Navegación, filtrado, carrito, pedidos, perfil
- ✅ Mock data coherente (21 alimentos, 6 categorías)
- ⚠️ **Pendiente**: Verificar categorías contra Figma UI-012 real
- ⚠️ **Pendiente**: Imágenes de categorías desde Figma (no placeholders)

### Próximas Etapas (Fuera de Alcance Actual)
| Etapa | Pantallas | Estado |
|-------|-----------|--------|
| 4. Vendedor | UI-029, 035-039, 014, 027, 028 | PENDIENTE |
| 5. Administrador | UI-041, 042, 043, 044 | PENDIENTE |
| 6. Chat/Estados | Chat, 10 estados | PENDIENTE |
| 7. Revisión visual | Comparación Figma | PENDIENTE |

### Fuera de Alcance (No Implementar Ahora)
- Backend real (MongoDB, Supabase, API)
- Pagos reales, notificaciones push, chat real
- Funcionalidades administrativas
- CI/CD, tests automatizados (unit/integration)

---

## 6. Reglas de Oro (Inmutables)

1. **Figma manda**: Si Figma dice X, el código hace X. No "mejoras" sin validar.
2. **No commits sin tsc limpio**: `npx tsc --noEmit` = 0 errors.
3. **No push sin revisión local**: Verificar en Expo Go antes de push.
3. **Documentación = Código**: Si el código cambia, la docs cambia. Si la docs dice X, el código hace X.
4. **Mock ≠ Inventado**: Datos mock deben ser realistas, coherentes con Figma y la temática UTTT.
5. **Single-vendor cart**: Una compra = un vendedor. Sin excepciones.
6. **Recursos Figma primero**: Si existe en Figma, úsalo. Si no, placeholder documentado.
5. **SDD vivo**: Documentation = Código. Si el código cambia, la docs cambia en el mismo commit (local).
6. **No push sin autorización**: Solo cambios locales hasta revisión explícita.

---

**Versión**: 1.0
**Fecha**: 2025-11-05
**Autor**: Equipo UTTT-Go Móvil
**Basado en**: Análisis Figma (66 pantallas), SDD_CHANGELOG.md, ANALISIS_FIGMA.md, MAPA_NAVEGACION.md