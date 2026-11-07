# Plan 003 — Flujo del Comprador

## Información General
- **Spec**: 003-comprador
- **Versión**: 1.0
- **Fecha**: 2025-11-05
- **Estado**: EN DESARROLLO (Pendiente verificación final contra Figma UI-012)

---

## 1. Objetivo

Implementar el flujo principal del comprador con catálogo de productos, categorías, búsqueda, detalle de producto, carrito single-vendor, flujo de pedido completo, seguimiento, calificaciones, notificaciones y perfil, replicando fielmente los diseños de Figma (UI-006 a UI-025).

---

## 2. Alcance del Plan

### Entregables (16 Pantallas - UI-006 a UI-025)

| ID Figma | Pantalla | Archivo | Ruta | Estado |
|----------|----------|---------|------|--------|
| UI-006 | Inicio comprador | `buyer/index.tsx` | `/buyer` | COMPLETADO |
| UI-007 | Buscar | `buyer/search.tsx` | `/buyer/search` | COMPLETADO |
| UI-008 | Filtros | `buyer/filters.tsx` | `/buyer/filters` | COMPLETADO |
| UI-010 | Disponible ahora | `buyer/available-now.tsx` | `/buyer/available-now` | COMPLETADO |
| UI-012 | Categoría | `buyer/category.tsx` | `/buyer/category` | COMPLETADO* |
| UI-013 | Detalle alimento | `buyer/food/[id].tsx` | `/buyer/food/:id` | COMPLETADO |
| UI-015 | Datos del pedido | `buyer/order-data.tsx` | `/buyer/order-data` | COMPLETADO |
| UI-016 | Confirmar pedido | `buyer/confirm-order.tsx` | `/buyer/confirm-order` | COMPLETADO |
| UI-017 | Pedido generado | `buyer/order-created.tsx` | `/buyer/order-created` | COMPLETADO |
| UI-019 | Mis pedidos | `buyer/orders.tsx` | `/buyer/orders` | COMPLETADO |
| UI-020 | Detalle seguimiento | `buyer/order-tracking.tsx` | `/buyer/order-tracking` | COMPLETADO |
| UI-021 | Calificar pedido | `buyer/rate-order.tsx` | `/buyer/rate-order` | COMPLETADO |
| UI-022 | Confirmación cancelación | `buyer/cancel-order.tsx` | `/buyer/cancel-order` | COMPLETADO |
| UI-024 | Notificaciones | `buyer/notifications.tsx` | `/buyer/notifications` | COMPLETADO |
| UI-025 | Mi perfil | `buyer/profile.tsx` | `/buyer/profile` | COMPLETADO |

> *UI-012 Categoría: **Pendiente verificación final contra Figma UI-012 Categoría.png**

### Funcionalidades Core
- Home: header saludo + avatar, search bar, categorías horizontal scroll, grid 2 cols alimentos
- Categoría: horizontal scroll snap con imágenes, overlay, icono, nombre + count
- Disponible ahora: grid 2 cols con imágenes, gradiente, badge favorito, precio, rating, agregar
- Buscar: input + filtrado tiempo real
- Filtros: disponibilidad, precio, tiempo + aplicar/limpiar
- Detalle alimento: imagen, info, stock, cantidad, agregar al carrito
- Carrito single-vendor (regla de negocio)
- Flujo pedido: Datos → Confirmar → Generado → Rastrear/Volver
- Mis pedidos: lista + badges estado + tap → tracking
- Seguimiento: timeline 4 pasos + detalle vendedor/pago
- Calificar: 5 estrellas + comentario
- Cancelar: motivos radio + confirmar
- Notificaciones: lista + iconos tipo + dot leído/no leído
- Perfil: avatar, datos, settings, logout rojo
- Carrito single-vendor (regla: un vendedor por pedido)
- Navegación push/pop correcta, historial mantenido
- Scroll Home con `nestedScrollEnabled`
- Navegación dinámica `/buyer/food/:id` + `useLocalSearchParams`

### Pendiente Crítico
- **Verificar categorías contra Figma UI-012 real** (nombres, orden, imágenes)
- **Imágenes de categorías desde Figma** (no placeholders Unsplash)
- **Verificar orden y nombres exactos** en Figma UI-012 Categoría.png

---

## 2. Fases de Implementación

### Fase 1: Estructura Base y Navegación (Día 1)
| Tarea | Archivo | Estado |
|-------|---------|--------|
| Crear buyer/_layout.tsx (Stack) | `buyer/_layout.tsx` | COMPLETADO |
| Actualizar root _layout.tsx con buyer routes | `_layout.tsx` | COMPLETADO |
| Actualizar routes.ts con buyer routes | `routes.ts` | COMPLETADO |
| Crear buyer/index.tsx (Home base) | `buyer/index.tsx` | COMPLETADO |

### Fase 2: Home y Categorías (Día 1-2)
| Tarea | Archivo | Estado |
|-------|---------|--------|
| Home: header, search bar, categorías horizontal | `buyer/index.tsx` | COMPLETADO |
| Home: grid 2 cols "Disponible ahora" | `buyer/index.tsx` | COMPLETADO |
| Categorías: horizontal scroll snap | `buyer/category.tsx` | COMPLETADO* |
| Categorías: tarjetas con imagen + overlay + icono | `buyer/category.tsx` | COMPLETADO* |
| Categorías: snap scroll + deceleración | `buyer/category.tsx` | COMPLETADO* |
| **PENDIENTE**: Verificar categorías contra Figma UI-012 | `category.tsx` | PENDIENTE |

### Fase 3: Disponible Ahora y Buscar (Día 2)
| Tarea | Archivo | Estado |
|-------|---------|--------|
| Disponible ahora: grid 2 cols + imágenes | `available-now.tsx` | COMPLETADO |
| Disponible ahora: gradiente overlay + badges | `available-now.tsx` | COMPLETADO |
| Buscar: input + filtrado tiempo real | `search.tsx` | COMPLETADO |
| Filtros: disponibilidad, precio, tiempo | `filters.tsx` | COMPLETADO |

### Fase 4: Detalle y Flujo Pedido (Día 3)
| Tarea | Archivo | Estado |
|-------|---------|--------|
| Detalle alimento: imagen, info, stock, cantidad | `food/[id].tsx` | COMPLETADO |
| Detalle: selector cantidad + precio total | `food/[id].tsx` | COMPLETADO |
| Datos pedido: resumen, método pago | `order-data.tsx` | COMPLETADO |
| Confirmar: resumen, vendedor, entrega, notas | `confirm-order.tsx` | COMPLETADO |
| Generado: éxito, código, rastrear/volver | `order-created.tsx` | COMPLETADO |

### Fase 5: Pedidos, Seguimiento, Perfil (Día 4)
| Tarea | Archivo | Estado |
|-------|---------|--------|
| Mis pedidos: lista + badges estado | `orders.tsx` | COMPLETADO |
| Seguimiento: timeline 4 pasos | `order-tracking.tsx` | COMPLETADO |
| Calificar: 5 estrellas + comentario | `rate-order.tsx` | COMPLETADO |
| Cancelar: motivos radio + confirmar | `cancel-order.tsx` | COMPLETADO |
| Notificaciones: lista + iconos + dot | `notifications.tsx` | COMPLETADO |
| Perfil: avatar, datos, settings, logout | `profile.tsx` | COMPLETADO |

### Fase 5: Correcciones y Optimizaciones (Día 5)
| Corrección | Archivo | Estado |
|------------|---------|--------|
| Rutas extráneas Expo Router | `_layout.tsx` | COMPLETADO |
| VirtualizedList anidado | `Screen.tsx` (+nestedScrollEnabled) | COMPLETADO |
| Navegación food: query → segmento dinámico | `food/[id].tsx`, `index.tsx` | COMPLETADO |
| Navegación back: replace → push | `login.tsx`, `verify-email.tsx` | COMPLETADO |
| Scroll Home: nestedScrollEnabled + scroll prop | `Screen.tsx`, `index.tsx` | COMPLETADO |
| Scroll category/available-now: quitar scroll prop | `category.tsx`, `available-now.tsx` | COMPLETADO |
| useLocalSearchParams en food/[id] | `food/[id].tsx` | COMPLETADO |

### Fase 6: Datos Mock y Categorías (Día 5-6)
| Tarea | Archivo | Estado |
|-------|---------|--------|
| Categorías mock (6 categorías) | `categories.ts` | COMPLETADO* |
| Alimentos mock (21 items, 6 cats) | `foods.ts` | COMPLETADO* |
| Orders mock (4 pedidos) | `orders.ts` | COMPLETADO |
| Notifications mock (4) | `notifications.ts` | COMPLETADO |
| **PENDIENTE**: Verificar categorías contra Figma UI-012 | `categories.ts` | PENDIENTE |
| **PENDIENTE**: Imágenes categorías desde Figma | `category.tsx` | PENDIENTE |

### Fase 7: Correcciones Técnicas (Día 6-7)
| Corrección | Archivo | Estado |
|------------|---------|--------|
| Rutas extráneas buyer | `_layout.tsx` | COMPLETADO |
| VirtualizedList anidado | `Screen.tsx` + `category.tsx` + `available-now.tsx` | COMPLETADO |
| Navegación food: query → dinámico | `food/[id].tsx` | COMPLETADO |
| useLocalSearchParams | `food/[id].tsx` | COMPLETADO |
| Screen: nestedScrollEnabled | `Screen.tsx` | COMPLETADO |
| Home: scroll prop | `index.tsx` | COMPLETADO |

### Fase 8: Verificación y Cierre (Día 7)
| Validación | Comando | Estado |
|------------|---------|--------|
| TypeScript check | `npx tsc --noEmit` | COMPLETADO |
| Expo Doctor | `npx expo-doctor` | COMPLETADO |
| Expo Start (cache limpio) | `npx expo start -c` | COMPLETADO |
| Flujo completo manual | Expo Go | EN DESARROLLO |
| **PENDIENTE**: Verificar categorías vs Figma UI-012 | Manual | PENDIENTE |

---

## 3. Archivos Creados/Modificados (Etapa 3)

### Layout y Pantallas (17 archivos)
- `src/app/buyer/_layout.tsx` (Stack buyer)
- `src/app/buyer/index.tsx` (UI-006 Home)
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

### Layout y Navegación
- `src/app/buyer/_layout.tsx` (Stack buyer)
- `src/app/_layout.tsx` (Root Stack + buyer routes)
- `src/navigation/routes.ts` (constantes rutas buyer)

### Datos Mock
- `src/data/mock/categories.ts` (6 categorías)
- `src/data/mock/foods.ts` (21 alimentos)
- `src/data/mock/orders.ts` (4 pedidos + helpers)
- `src/data/mock/notifications.ts` (4 notificaciones)
- `src/data/mock/index.ts` (exports)

### Contexto y Servicios
- `src/context/CartContext.tsx` (single-vendor cart)
- `src/services/mockApi.ts` (delay helper)

### Componentes UI Usados
- AppText, AppButton, AppInput, AppHeader, Avatar, Badge, BrandLogo, Screen, Surface, SectionHeader, Divider, EmptyState, LoadingState

### Hooks y Utilidades
- `src/hooks/useResponsive.ts` (useWindowDimensions, moderateScale, etc.)
- `src/utils/format.ts` (formatCurrency, formatDate, orderStatusLabels)
- `src/theme` (colors, spacing, typography, shadows, layout)

---

## 3. Correcciones Críticas Aplicadas

| Problema | Solución | Archivos |
|----------|----------|----------|
| Rutas extráneas Expo Router | Eliminar Stack.Screen buyer redundantes | `_layout.tsx` |
| VirtualizedList anidado | `nestedScrollEnabled` en Screen + quitar scroll en FlatList screens | `Screen.tsx`, `category.tsx`, `available-now.tsx` |
| Navegación food: query params | Segmento dinámico `/buyer/food/:id` + `useLocalSearchParams` | `food/[id].tsx`, `index.tsx` |
| Navegación back: replace → push | `router.push` en login/verify-email | `login.tsx`, `verify-email.tsx` |
| Scroll Home con FlatLists anidados | `nestedScrollEnabled` + `scroll` prop en Home | `Screen.tsx`, `index.tsx` |
| Navegación food dinámica | `useLocalSearchParams` en food/[id] | `food/[id].tsx` |

---

## 4. Pendientes Críticos (Prioridad Alta)

| Tarea | Descripción | Prioridad |
|-------|-------------|-----------|
| Verificar categorías vs Figma UI-012 | Comparar nombres, orden, imágenes, iconos contra imagen real | **ALTA** |
| Imágenes categorías desde Figma | Reemplazar placeholders Unsplash con recursos Figma | **ALTA** |
| Verificar nombres exactos categorías | Confirmar: Desayunos, Comida corrida, Antojitos, Bebidas, Postres, Snacks | **ALTA** |
| Verificar orden categorías | Confirmar orden horizontal en Figma UI-012 | **ALTA** |
| Imágenes alimentos desde Figma | Reemplazar placeholders Unsplash | MEDIA |

---

## 4. Validaciones de Cierre

| Validación | Comando | Estado |
|------------|---------|--------|
| TypeScript check | `npx tsc --noEmit` | COMPLETADO |
| Expo Doctor | `npx expo-doctor` | COMPLETADO |
| Expo Start (cache limpio) | `npx expo start -c` | COMPLETADO |
| Flujo completo manual | Expo Go Android | EN DESARROLLO |
| **PENDIENTE**: Verificar categorías vs Figma UI-012 | Manual | **PENDIENTE** |

### Flujo de Prueba Manual Verificado
1. Login → Buyer Home (scroll funcional)
2. Home → Categorías (horizontal scroll + tap)
3. Categoría → Disponible ahora (filtrado por categoría)
4. Disponible ahora → Detalle alimento (tap)
4. Detalle → Agregar → Datos pedido → Confirmar → Generado
5. Generado → Rastrear → Seguimiento (timeline)
5. Pedido → Calificar (estrellas + comentario)
5. Pedido → Cancelar (motivos + confirmar)
6. Home → Mis pedidos → Tracking → Calificar/Cancelar
6. Home → Notificaciones (dots leídos/no)
6. Home → Perfil → Logout → Welcome (stack reset)
7. Back navigation correcta en todo el flujo
7. Scroll Home con categorías + grid alimentos

---

## 5. Estado

**EN DESARROLLO** — Pendiente verificación final contra Figma UI-012 Categoría.png

---

## 6. Referencias

- `specs/003-comprador/spec.md`
- `CONSTITUTION.md` (categorías, navegación, datos, responsive)
- `SDD_CHANGELOG.md` (historial correcciones)
- `ANALISIS_FIGMA.md` (UI-006 a UI-025)
- `MAPA_NAVEGACION.md` (flujos buyer)
- `ANALISIS_FIGMA.md` (UI-012 Categoría.png - pendiente verificación)