# Specification 003 — Flujo del Comprador

### Historial al cerrar la compra
Tras POST confirmado, Mis pedidos queda debajo del comprobante y se retiran los pasos de compra. Ver mi pedido sustituye el comprobante por seguimiento. QR solo en seguimiento con estado fresco; el comprobante conserva el acceso y la explicación. Resultado incierto no activa navegación de éxito. Ver SDD006 y MAPA_NAVEGACION.md.

El comprador sigue consultando el detalle autorizado para habilitar el QR únicamente en Ready; no hay emisión automática. La corrección del recorrido vendedor está en SDD007: el GET de verificación de entrega se aplica al detalle sin repetir el POST; el comprador vuelve a consultar y retira el QR al confirmar Delivered. La credencial no entra en las trazas.

## Incidencia de inicio ExpoCrypto — recuperación física reportada

SDK real58 (expo58.0.26), crypto58.0.8, core58.1.0, router58.0.32 y RN0.88.1 alineados, sin duplicados ni incompatibilidad diagnosticada. El import estático de Crypto en AuthSession exige registro nativo al evaluar AuthContext/layout. Usuario reporta Go58.0.6+ y confirma desaparición de ambos errores tras forzar detención y abrir solo el proyecto mediante expo start --go -c. No atribuir automáticamente a #54020 (Go58.0.5) ni a #51198 (release/prebuild antiguo), ni afirmar identificado el desencadenante interno del runtime anterior. Conservar Crypto.randomUUID/SHA256, import estático, autenticación y bloqueos. Sin modificaciones funcionales de sesión/dependencias para ocultarlo. Regresión de bootstrap y guía docs/EXPO_CRYPTO_ANDROID.md; ejecución física de UUID/SHA/login/listados/QR requiere confirmación específica.

## Pedidos y entrega real — implementación vigente en pruebas

OpenAPI HTTPS consultado y fuente backend de referencia 8d48ae9816e95533ca24a93e5b3d9730af7dcb67 (no atesta SHA EC2). Publica POST orders201/200, GET mine/detalle, POST cancel200, PATCH status200, POST delivery-token201/confirmations200 y GET sellers/me/orders200. Schemas PR27 vigentes, totalCount y pageSize1..50; fuente ordena createdAt descendente, sin sort query. Solo Cash/MXN y compra de un producto con quantity1..50, notes≤250. El carrito mock no participa.

Estados oficiales Pending/Accepted/InPreparation/Ready/Delivered/Rejected/CancelledByBuyer. Comprador cancela solo Pending. Vendedor Pending→Accepted|Rejected, Accepted→InPreparation, InPreparation→Ready, PATCH con versión leída; Delivered exclusivamente por confirmación de QR. Releer tras mutaciones y ante incertidumbre, sin repetir automáticamente.

QR backend {orderId,token,expiresAt}, token opaco base64url43, emisión solo comprador propio/Ready; nueva emisión invalida anterior. Mostrar únicamente ese token, nunca orderId ni JSON local; memoria efímera, limpiar al salir/background/cambio de estado, expiración y lecturas acotadas. Vendedor selecciona pedido propio, escanea solo QR y envía {token}; éxito de entrega requiere confirmación validada y GET Delivered. Sin logs/persistencia de credencial ni reuso automático.

Mis pedidos consulta al foco, reinicia página tras compra/foco/refresh, permite paginación y pull-to-refresh, no filtra silenciosamente por rol, valida ownership y deduplica IDs. Reportar de forma sanitizada discrepancia entre creación confirmada y página reciente, sin afirmar ausencia global por una página. Recibo recuperable por GET y seguimiento con timeline oficial, estados en español y referencia derivada amigable (no número oficial inventado). Originales UI015/016/017/019/020/022 y UI038/039 inspeccionados; no hay pantalla de escáner identificada en inventario, reutilizar contenedor/tema del flujo con cámara integrada. No mocks productivos ni pagos electrónicos.

## Bloque3 acotado tras auditoría actual006
Se inspeccionaron originales UI015/016/017/019/020/021/022/024 contra `AwsOrderFlow` y pantallas actuales. Recuperar panel exclusivamenteEfectivo en Datos/Confirmación sin añadir campo request ni afirmar pago confirmado; conservar precios estimados antes dePOST y totalbackend después. Recibo con IDpersistente puede mostrar marco de CódigoQRdeentrega, pero solo placeholder/credencialpendiente: ningún QR real se genera con orderId, JSONlocal o secreto inventado. No scanner/validación/entrega hasta contrato. AvisosAWS no deben presentar mockNotifications como si fueran eventosdelservidor; maqueta solo fuenteMockdev explícita y mensaje honesto sin API. GETmine/detail schemas publicados quedan siguiente unidad3.1, no bloqueados por faltaendpoint; no se declara restaurado historial/seguimiento en este bloque.

## P0 PR #24 — notas y respuesta desplegada
Request pedido simple añade notes opcional (máximo250 unidadesUTF16 para coincidir con .NET; no truncar silenciosamente ni enviar precios/totales). Preparación en sesión conserva notas al volver/errores y las revisa antes de confirmar. Campos permitidos productId/quantity/notes; validar antes de red. Carrito mock no participa ni se vacía por esta operación; preparación se limpia solo tras éxito validado.
OpenAPI GET desplegado publica OrderResponse orderId/buyerUserId/total frente id/buyerId/totalAmount del contrato anterior, con productName/currency/paymentMethod/pickupPoint/fechas/version. Adaptador explícito de lectura valida ambas formas y normaliza al modelo existente, sin inventar valores de negocio; rechaza mezcla incoherente. Estado inicial Pending confirmado, otros estados no inferidos. GETmine/detail tienen schemas publicados pero sus enums/recorrido quedan fuera del P0 de creación, sin historial/seguimiento simulado. PR24 resuelve status/notes/imageUrl; validación física de creación sigue pendiente.

## Continuación AWS: pedido de un producto
Las marcas históricas de maquetas no acreditan integración real. Catálogo/detalle consumen DTO007. POST /api/v1/orders admite exclusivamente {productId,quantity}; 201 devuelve {id,buyerId,sellerId,productId,unitPrice,quantity,totalAmount,status:Pending,createdAt}. Validar IDs/cantidad/importes/fecha e identidad. Preparación en memoria por sesión con un producto; no transformar carrito mock multiitem en varios POST, ni enviar notas, fee o datos de pago no contratados. Conservar preparación ante errores y aceptar éxito solo tras201 válido. Bloquear duplicados y reenvío de resultado ambiguo; invalidar respuestas tardías al salir de sesión. GET /orders/mine existe sin DTO listado/detalle: no simular historial ni seguimiento real. Precio/stock finales son autoridad del backend.

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
# PR27 — contratos de lectura en curso

Implementación en pruebas: POST de un producto valida respuesta completa PR27; GET mine y detalle pasan por la sesión AWS, comprueban identidad compradora y actualizan historial/seguimiento. Sin validación física ni mutaciones reales automatizadas.

La lectura de pedidos debe validar DTO completo, identificador `orderId`, `Cash`/`MXN`, propiedad y paginación `totalCount`. El backend fuente 6932990 lista solo comprador aunque se ha comunicado un listado unificado; OpenAPI no confirma su semántica. Las mutaciones y el QR requieren pruebas y validación física antes de habilitarse.
# Diagnóstico físico de confirmación — en curso

El coordinador distingue intentos confirmados y resultados inciertos posteriores al despacho. El historial es evidencia consultable, pero una coincidencia por producto/fecha sin identificador idempotente no prueba qué POST la creó; no liberar automáticamente el bloqueo ni fabricar reconciliación.
