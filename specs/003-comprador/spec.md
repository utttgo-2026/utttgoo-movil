# Specification 003 — Flujo del Comprador

## Información General
- **ID**: 003-comprador
- **Nombre**: Flujo del Comprador (Catálogo, Categorías, Productos, Pedidos, Perfil)
- **Versión**: 1.0
- **Fecha**: 2025-11-05
- **Estado**: EN DESARROLLO (Pendiente verificación final contra Figma)

---

## 1. Objetivo

Implementar el flujo principal del comprador con catálogo de productos, categorías, búsqueda, detalle de producto, carrito single-vendor, flujo de pedido completo, seguimiento, calificaciones, notificaciones y perfil, replicando fielmente los diseños de Figma (UI-006 a UI-025).

---

## 2. Alcance

### Incluido (16 Pantallas - UI-006 a UI-025)

| ID Figma | Pantalla | Archivo | Ruta Expo Router | Estado |
|----------|----------|---------|------------------|--------|
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

> *UI-012 Categoría: **Pendiente verificación final contra Figma UI-012 Categoría.png para confirmar nombres exactos de categorías y recursos visuales.**

### Funcionalidades Implementadas

| Funcionalidad | Descripción | Estado |
|---------------|-------------|--------|
| **Home (UI-006)** | Header saludo + avatar, barra búsqueda, categorías horizontal scroll (imagen + icono + count), grid 2 cols "Disponible ahora" con imágenes, gradiente overlay, badge favorito, precio, rating, botón agregar | COMPLETADO |
| **Categorías (UI-012)** | Carrusel horizontal con snap, tarjetas 156×200px con imagen real, overlay gradiente, icono Ionicons, nombre + count, snap scroll + deceleración | COMPLETADO* |
| **Disponible ahora (UI-010)** | Grid 2 columnas responsive, imágenes reales, gradiente overlay, badge favorito, precio, tiempo, rating, botón "Agregar" | COMPLETADO |
| **Buscar (UI-007)** | Input con icono, filtrado en tiempo real por nombre, resultados en lista con badge rating | COMPLETADO |
| **Filtros (UI-008)** | Disponibilidad, rango precio, tiempo preparación, botones Limpiar/Aplicar | COMPLETADO |
| **Detalle alimento (UI-013)** | Imagen, nombre, vendedor, tags, descripción, stock, selector cantidad, precio total, botón "Agregar al pedido" | COMPLETADO |
| **Flujo pedido** | Datos del pedido → Confirmar pedido → Pedido generado → Rastrear/Volver | COMPLETADO |
| **Mis pedidos (UI-019)** | Lista con badges estado (Pendiente/Preparando/Listo/Entregado/Cancelado), código, items, total, fecha | COMPLETADO |
| **Seguimiento (UI-020)** | Timeline 4 pasos (Pendiente → En preparación → Listo → Entregado), detalle vendedor/pago/total | COMPLETADO |
| **Calificar (UI-021)** | 5 estrellas interactivas, comentario opcional, envío | COMPLETADO |
| **Cancelar (UI-022)** | Motivos radio buttons, confirmar | COMPLETADO |
| **Notificaciones (UI-024)** | Lista con icono por tipo (pedido/chat/sistema), dot no leído, timestamp | COMPLETADO |
| **Perfil (UI-025)** | Avatar, nombre, email, matrícula, settings (tarjeta, dirección, notificaciones, ayuda), logout rojo | COMPLETADO |
| **Carrito single-vendor** | Un solo vendedor por pedido (regla de negocio) | COMPLETADO |
| **Navegación** | Push/pop correcto, historial mantenido, back navigation funcional | COMPLETADO |
| **Scroll Home** | `nestedScrollEnabled` en ScrollView para FlatLists anidados | COMPLETADO |
| **Navegación dinámica** | `/buyer/food/:id` con `useLocalSearchParams` | COMPLETADO |

> *UI-012 Categoría: **Pendiente verificación final contra Figma UI-012 Categoría.png para confirmar nombres exactos de categorías y recursos visuales.**

### Funcionalidad de Filtrado por Categoría
- **Home**: Al tocar categoría → `setSelectedCategory` + push a `/buyer/category?categoryId=`
- **Categoría screen**: Horizontal scroll, tap → push a `/buyer/available-now?categoryId=&categoryName=`
- **Disponible ahora**: Filtra `mockFoods` por `categoryId` y `availability === 'available'`
- **Home**: Filtra `featuredFoods` por `selectedCategory` si hay selección

### Correcciones Realizadas (Post-Implementación Inicial)
- **Rutas extráneas Expo Router**: Eliminadas declaraciones `Stack.Screen` redundantes para rutas buyer; Expo Router descubre automáticamente
- **VirtualizedList anidado**: Quitado `scroll` prop en `available-now`, `category`; agregado `nestedScrollEnabled` en `Screen` + `scroll` en Home
- **Navegación food**: Query params `?foodId=` → segmento dinámico `/buyer/food/:id` + `useLocalSearchParams`
- **Navegación back**: `router.replace` → `router.push` en login/verify-email
- **Scroll Home**: `scroll` prop en Home + `nestedScrollEnabled` en Screen
- **Diseño Categoría**: Rediseño completo con tarjetas imagen + overlay + icono, horizontal scroll snap
- **Diseño Disponible ahora**: Grid 2 cols con imágenes reales, gradiente, badges
- **Diseño Home**: Categorías horizontal + grid 2 cols alimentos, imágenes reales

### No Incluido (Fase Actual)
- Chat comprador-vendedor (Etapa 6)
- Pagos reales, notificaciones push
- Geolocalización entrega
- Múltiples vendedores en carrito (regla single-vendor)

---

## 3. Requisitos Funcionales

| ID | Requisito | Pantalla | Estado |
|----|-----------|----------|--------|
| REQ-BUY-001 | Home: header saludo + avatar + search bar | UI-006 | COMPLETADO |
| REQ-BUY-002 | Home: categorías horizontal scroll con imágenes | UI-006 | COMPLETADO |
| REQ-BUY-003 | Home: grid 2 cols "Disponible ahora" con imágenes | UI-006 | COMPLETADO |
| REQ-BUY-004 | Home: filtro por categoría (tap → filtrado) | UI-006 | COMPLETADO |
| REQ-BUY-004 | Categoría: horizontal scroll snap + imágenes | UI-012 | COMPLETADO* |
| REQ-BUY-005 | Categoría: tap → navega a Disponible ahora filtrado | UI-012 | COMPLETADO |
| REQ-BUY-006 | Disponible ahora: grid 2 cols responsive + imágenes | UI-010 | COMPLETADO |
| REQ-BUY-007 | Buscar: input + filtrado tiempo real por nombre | UI-007 | COMPLETADO |
| REQ-BUY-008 | Filtros: disponibilidad, precio, tiempo + aplicar | UI-008 | COMPLETADO |
| REQ-BUY-009 | Detalle alimento: imagen, info, stock, cantidad, agregar | UI-013 | COMPLETADO |
| REQ-BUY-010 | Carrito: single-vendor, cantidad, total, agregar | CartContext | COMPLETADO |
| REQ-BUY-011 | Datos pedido: resumen, método pago, servicio fee | UI-015 | COMPLETADO |
| REQ-BUY-012 | Confirmar pedido: resumen, vendedor, entrega, notas | UI-016 | COMPLETADO |
| REQ-BUY-013 | Pedido generado: éxito, código, rastrear/volver | UI-017 | COMPLETADO |
| REQ-BUY-014 | Mis pedidos: lista + badges estado + tap → tracking | UI-019 | COMPLETADO |
| REQ-BUY-015 | Seguimiento: timeline 4 pasos + detalle vendedor | UI-020 | COMPLETADO |
| REQ-BUY-015 | Calificar: 5 estrellas + comentario + enviar | UI-021 | COMPLETADO |
| REQ-BUY-016 | Cancelar: motivos radio + confirmar | UI-022 | COMPLETADO |
| REQ-BUY-016 | Notificaciones: lista + iconos tipo + dot leído | UI-024 | COMPLETADO |
| REQ-BUY-017 | Perfil: avatar, datos, settings, logout rojo | UI-025 | COMPLETADO |
| REQ-BUY-018 | Navegación back correcta en todo el flujo | Todas | COMPLETADO |
| REQ-BUY-019 | Scroll Home con FlatLists anidados | UI-006 | COMPLETADO |
| REQ-BUY-020 | Ruta dinámica food/:id + useLocalSearchParams | UI-013 | COMPLETADO |

> *UI-012 Categoría: **Pendiente verificación final contra Figma UI-012 Categoría.png**

---

## 4. Pantallas y IDs Figma

| ID Figma | Nombre | Archivo | Ruta Expo Router |
|----------|--------|---------|------------------|
| UI-006 | Inicio comprador | `buyer/index.tsx` | `/buyer` |
| UI-007 | Buscar | `buyer/search.tsx` | `/buyer/search` |
| UI-008 | Filtros | `buyer/filters.tsx` | `/buyer/filters` |
| UI-010 | Disponible ahora | `buyer/available-now.tsx` | `/buyer/available-now` |
| UI-012 | Categoría | `buyer/category.tsx` | `/buyer/category` |
| UI-013 | Detalle alimento | `buyer/food/[id].tsx` | `/buyer/food/:id` |
| UI-015 | Datos del pedido | `buyer/order-data.tsx` | `/buyer/order-data` |
| UI-016 | Confirmar pedido | `buyer/confirm-order.tsx` | `/buyer/confirm-order` |
| UI-017 | Pedido generado | `buyer/order-created.tsx` | `/buyer/order-created` |
| UI-019 | Mis pedidos | `buyer/orders.tsx` | `/buyer/orders` |
| UI-020 | Detalle seguimiento | `buyer/order-tracking.tsx` | `/buyer/order-tracking` |
| UI-021 | Calificar pedido | `buyer/rate-order.tsx` | `/buyer/rate-order` |
| UI-022 | Confirmación cancelación | `buyer/cancel-order.tsx` | `/buyer/cancel-order` |
| UI-024 | Notificaciones | `buyer/notifications.tsx` | `/buyer/notifications` |
| UI-025 | Mi perfil | `buyer/profile.tsx` | `/buyer/profile` |

---

## 4. Navegación (Buyer Stack)

```
/buyer (Home)
  → /buyer/search (Buscar)
  → /buyer/filters (Filtros)
  → /buyer/available-now (Disponible ahora)
  → /buyer/category (Categoría)
    → /buyer/available-now?categoryId= (filtrado)
  → /buyer/food/:id (Detalle alimento)
    → /buyer/order-data (Datos pedido)
      → /buyer/confirm-order (Confirmar)
        → /buyer/order-created (Generado)
          → /buyer/order-tracking (Rastrear)
          → /buyer (Volver)
  → /buyer/orders (Mis pedidos)
    → /buyer/order-tracking (Detalle)
      → /buyer/rate-order (Calificar)
      → /buyer/cancel-order (Cancelar)
  → /buyer/notifications (Notificaciones)
  → /buyer/profile (Perfil)
    → /welcome (Logout)
```

### Navegación por Categoría (Flujo Crítico)
1. **Home**: Tap categoría → `router.push('/buyer/category?categoryId=X')`
2. **Categoría**: Horizontal scroll → Tap tarjeta → `router.push('/buyer/available-now?categoryId=X&categoryName=Y')`
3. **Disponible ahora**: Filtra `mockFoods` por `categoryId` + `availability === 'available'`
3. **Home**: Si `selectedCategory` activo → filtra `featuredFoods` por categoría

---

## 5. Datos Mock (Coherencia con Categorías Reales)

### Categorías (6 - Verificar contra Figma UI-012)
| ID | Nombre | Icono Ionicons | Color | Items |
|----|--------|----------------|-------|-------|
| cat-1 | Desayunos | `cafe-outline` | `#FFF7E7` | 4 |
| cat-2 | Comida corrida | `restaurant-outline` | `#FFF0F0` | 4 |
| cat-3 | Antojitos | `fast-food-outline` | `#ECF8EF` | 4 |
| cat-4 | Bebidas | `wine-outline` | `#EDF5F7` | 3 |
| cat-5 | Postres | `ice-cream-outline` | `#FFF0F0` | 3 |
| cat-6 | Snacks | `nutrition-outline` | `#ECF8EF` | 3 |
| **TOTAL** | **6** | | | **21** |

> **Nota**: Categorías actuales son propuesta basada en temática universitaria. **PENDIENTE**: Verificar contra Figma UI-012 Categoría.png para confirmar nombres exactos, orden y recursos visuales.

### Alimentos (21 items distribuidos en 6 categorías)
Cada alimento tiene: id, sellerId, categoryId, name, description, price, image (Unsplash placeholder), rating, reviewCount, prepTimeMinutes, stock, availability, tags, isFavorite.

### Pedidos (4)
Estados: delivered, preparing, pending, cancelled. Códigos UTTT-XXXX, items, totales, vendedor, método pago.

### Notificaciones (4)
Tipos: order, chat, system. read/unread, timestamps.

---

## 6. Archivos Involucrados

### Layout & Pantallas (17 archivos)
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

### Layout & Navegación
- `src/app/buyer/_layout.tsx` (Stack buyer con 17 screens)
- `src/app/_layout.tsx` (Root Stack + buyer routes)
- `src/navigation/routes.ts` (constantes rutas)

### Datos Mock
- `src/data/mock/categories.ts` (6 categorías)
- `src/data/mock/foods.ts` (21 alimentos)
- `src/data/mock/orders.ts` (4 pedidos + helpers)
- `src/data/mock/notifications.ts` (4 notificaciones)
- `src/data/mock/index.ts` (exports)

### Contexto & Servicios
- `src/context/CartContext.tsx` (single-vendor cart)
- `src/services/mockApi.ts` (delay helper)

### Componentes UI Usados
- AppText, AppButton, AppInput, AppHeader, Avatar, Badge, BrandLogo, Screen, Surface, SectionHeader, Divider, EmptyState, LoadingState

### Hooks & Utilidades
- `src/hooks/useResponsive.ts` (useWindowDimensions, moderateScale, etc.)
- `src/utils/format.ts` (formatCurrency, formatDate, orderStatusLabels)
- `src/theme` (colors, spacing, typography, shadows, layout)

---

## 7. Criterios de Finalización

- [x] `npx tsc --noEmit` → 0 errores
- [x] `npx expo start -c` → Expo Go abre sin errores
- [x] Flujo completo: Home → Categoría → Disponible → Detalle → Pedido → Seguimiento → Calificar
- [x] Filtrado por categoría funcional en Home, Categoría, Disponible ahora
- [x] Búsqueda funcional (filtrado tiempo real)
- [x] Carrito single-vendor funcional (agregar, cantidad, total)
- [x] Flujo pedido completo: Datos → Confirmar → Generado → Rastrear
- [x] Mis pedidos con badges estado + tap → tracking
- [x] Timeline seguimiento 4 pasos + detalle
- [x] Calificación 5 estrellas + comentario
- [x] Cancelar con motivos + confirmar
- [x] Notificaciones con dot leído/no leído
- [x] Perfil con logout → Welcome (stack reset)
- [x] Navegación back correcta en todo el flujo
- [x] Scroll Home con `nestedScrollEnabled` + FlatLists anidados
- [x] Ruta dinámica `/buyer/food/:id` + `useLocalSearchParams`
- [x] `npx tsc --noEmit` → 0 errores
- [x] Expo Router sin warnings extraneous
- [x] VirtualizedList anidado resuelto (`nestedScrollEnabled`)
- [ ] **PENDIENTE**: Verificar categorías contra Figma UI-012 real
- [ ] **PENDIENTE**: Imágenes categorías desde Figma (no placeholders)

---

## 8. Estado

**EN DESARROLLO** — 2025-11-05 (Pendiente verificación final contra Figma UI-012)

---

## 8. Referencias

- `ANALISIS_FIGMA.md` (UI-006 a UI-025)
- `MAPA_NAVEGACION.md` (flujos buyer)
- `SDD_CHANGELOG.md` (historial correcciones)
- `CONSTITUTION.md` (principios navegación, datos, categorías)
- `ANALISIS_FIGMA.md` (inventario UI-012 Categoría.png)