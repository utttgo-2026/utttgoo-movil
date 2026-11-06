# Tasks 003 — Flujo del Comprador

## Información General
- **Spec**: 003-comprador
- **Versión**: 1.0
- **Estado**: EN DESARROLLO (Pendiente verificación final vs Figma UI-012)

---

## Tareas

### Fase 1: Estructura Base y Navegación
- [x] Crear buyer/_layout.tsx (Stack) (`buyer/_layout.tsx`)
- [x] Actualizar root _layout.tsx con buyer routes (`_layout.tsx`)
- [x] Actualizar routes.ts con buyer routes (`routes.ts`)
- [x] Crear buyer/index.tsx (Home base) (`buyer/index.tsx`)

### Fase 2: Home y Categorías
- [x] Home: header, search bar, categorías horizontal scroll (`buyer/index.tsx`)
- [x] Home: grid 2 cols "Disponible ahora" (`buyer/index.tsx`)
- [x] Categorías: horizontal scroll snap (`buyer/category.tsx`)
- [x] Categorías: tarjetas con imagen + overlay + icono (`buyer/category.tsx`)
- [x] Categorías: snap scroll + deceleración (`buyer/category.tsx`)
- [ ] **PENDIENTE**: Verificar categorías contra Figma UI-012 real (`category.tsx`)

### Fase 3: Disponible Ahora y Buscar
- [x] Disponible ahora: grid 2 cols + imágenes (`available-now.tsx`)
- [x] Disponible ahora: gradiente overlay + badges (`available-now.tsx`)
- [x] Buscar: input + filtrado tiempo real (`search.tsx`)
- [x] Filtros: disponibilidad, precio, tiempo (`filters.tsx`)

### Fase 4: Detalle y Flujo Pedido
- [x] Detalle alimento: imagen, info, stock, cantidad (`food/[id].tsx`)
- [x] Detalle: selector cantidad + precio total (`food/[id].tsx`)
- [x] Datos pedido: resumen, método pago (`order-data.tsx`)
- [x] Confirmar: resumen, vendedor, entrega, notas (`confirm-order.tsx`)
- [x] Generado: éxito, código, rastrear/volver (`order-created.tsx`)

### Fase 5: Pedidos, Seguimiento, Perfil
- [x] Mis pedidos: lista + badges estado (`orders.tsx`)
- [x] Seguimiento: timeline 4 pasos (`order-tracking.tsx`)
- [x] Calificar: 5 estrellas + comentario (`rate-order.tsx`)
- [x] Cancelar: motivos radio + confirmar (`cancel-order.tsx`)
- [x] Notificaciones: lista + iconos + dot (`notifications.tsx`)
- [x] Perfil: avatar, datos, settings, logout (`profile.tsx`)

### Fase 6: Correcciones y Optimizaciones
- [x] Rutas extráneas Expo Router (`_layout.tsx`)
- [x] VirtualizedList anidado (`Screen.tsx` +nestedScrollEnabled)
- [x] Navegación food: query → segmento dinámico (`food/[id].tsx`)
- [x] Navegación back: replace → push (`login.tsx`, `verify-email.tsx`)
- [x] Scroll Home: nestedScrollEnabled + scroll prop (`Screen.tsx`, `index.tsx`)
- [x] useLocalSearchParams en food/[id] (`food/[id].tsx`)

### Fase 7: Datos Mock y Categorías
- [x] Categorías mock (6 categorías) (`categories.ts`)
- [x] Alimentos mock (21 items, 6 cats) (`foods.ts`)
- [x] Orders mock (4 pedidos) (`orders.ts`)
- [x] Notifications mock (4) (`notifications.ts`)
- [ ] **PENDIENTE**: Verificar categorías contra Figma UI-012 real (`categories.ts`)
- [ ] **PENDIENTE**: Imágenes categorías desde Figma (`category.tsx`)

### Fase 8: Correcciones Técnicas
- [x] Rutas extráneas buyer (`_layout.tsx`)
- [x] VirtualizedList anidado (`Screen.tsx` +nestedScrollEnabled)
- [x] Navegación food: query → segmento dinámico (`food/[id].tsx`)
- [x] Navegación back: replace → push (`login.tsx`, `verify-email.tsx`)
- [x] Scroll Home: nestedScrollEnabled + scroll prop (`Screen.tsx`, `index.tsx`)
- [x] useLocalSearchParams en food/[id] (`food/[id].tsx`)

### Fase 8: Verificación y Cierre
- [x] TypeScript check: `npx tsc --noEmit` → 0 errores
- [x] Expo Doctor: `npx expo-doctor`
- [x] Expo Start (cache limpio): `npx expo start -c`
- [ ] Flujo completo manual: Expo Go Android
- [ ] **PENDIENTE**: Verificar categorías vs Figma UI-012 real

---

## Pendientes Críticos (Prioridad Alta)
- [ ] Verificar categorías vs Figma UI-012 real (nombres, orden, imágenes)
- [ ] Imágenes categorías desde Figma (reemplazar placeholders)
- [ ] Verificar nombres exactos categorías (Desayunos, Comida corrida, Antojitos, Bebidas, Postres, Snacks)
- [ ] Verificar orden categorías (orden horizontal en Figma UI-012)
- [ ] Imágenes alimentos desde Figma (reemplazar placeholders)

---

## Estado General
**EN DESARROLLO** — Pendiente verificación final contra Figma UI-012