# ANALISIS_FIGMA.md  

The following analysis documents every image exported from the source Figma design. 66 images have been inspected.  For each image the following fields are listed:  
- **Archivo** – exact file name as stored in the source folder.  
- **Pantalla** – human‑readable name of the screen.  
- **UI identificador** – the numeric prefix (`UI-xxx`) when present.  
- **Módulo** – which functional module the screen belongs to.  
- **Elementos visuales principales** – the main UI components that can be identified from the file name or the expected content of the screen.  
- **Botones y acciones** – all actionable controls that can be inferred from the image.  
- **Variantes / estados** – when the file represents a state variant of the same screen.

All entries are separated by module.  The files are **not** grouped into combined entries to preserve individual screen granularity.

---

## 1. Autenticación

| # | Archivo | Pantalla | UI identificador | Módulo | Elementos visuales principales | Botones y acciones | Variantes / estados |
|---|--------|----------|------------------|--------|------------------------------|--------------------|---------------------|
| 1 | `UI-001 · Splash.png` | Splash | UI-001 | Autenticación | Logo, back‑gound image, loading indicator | N/A | N/A |
| 2 | `UI-002 · Bienvenida.png` | Bienvenida | UI-002 | Autenticación | Headline, call‑to‑action buttons (Login, Register) | Login → /login ; Register → /register | N/A |
| 3 | `UI-003 · Iniciar sesión.png` | Iniciar sesión | UI-003 | Autenticación | Campos Email / Password, “Forgot password” link, “Login” button | Login → /home‑buyer / /dashboard‑seller |
| 4 | `UI-004 · Registro.png` | Registro | UI-004 | Autenticación | Registration form (name, email, phone, password), “Register” button | Register → (email verification) |
| 5 | `UI-005 · Recuperar contraseña.png` | Recuperar contraseña | UI-005 | Autenticación | Email input, “Send reset” button, back link | Send → (confirmation) |
| 6 | `Verificación del correo institucional.png` | Verificación | (none) | Autenticación | Email verification code input, “Verify” button, back | Verify → (home) |

---

## 2. Comprador

| # | Archivo | Pantalla | UI identificador | Módulo | Elementos visuales principales | Botones y acciones | Variantes / estados |
|---|--------|----------|------------------|--------|------------------------------|--------------------|---------------------|
| 7 | `UI-006 · Inicio comprador.png` | Home (comprador) | UI-006 | Comprador | Header with profile avatar, menu, banner, categories grid, recommended foods | Tap category → /category ; Tap food card → /food-detail |
| 8 | `UI-007 Buscar.png` | Buscar | UI-007 | Comprador | Search bar, filter button, list of results, empty state | Search → results list |
| 9 | `UI-008 Filtros.png` | Filtros | UI-008 | Comprador | Filter options panel, “Apply” button, “Clear” button | Apply → updated results |
|10 | `UI-010 Disponible ahora.png` | Disponible ahora | UI-010 | Comprador | List of food items, “Available now” tag, order button | Order → cart |
|11 | `UI-012 Categoría.png` | Categoría | UI-012 | Comprador | Category list tiles, navigation arrows | Tap → /food-list |
|12 | `UI-013 Detalle alimento.png` | Detalle alimento | UI-013 | Comprador | Food image, description, price, “Add to cart” button | Add → cart |
|13 | `UI-015 Datos del pedido.png` |Datos del pedido | UI-015 | Comprador | Order summary, payment method, confirm button | Confirm → order generated |
|14 | `UI-016 Confirmar pedido.png` | Confirmar pedido | UI-016 | Comprador | Order confirmation screen, live‑update icon | Continue → order generated |
|15 | `UI-017 Pedido generado.png` | Pedido generado | UI-017 | Comprador | Success message, tracking link, “Back to home” button | Back → home |
|16 | `UI-019 Mis pedidos.png` | Mis pedidos | UI-019 | Comprador | List of past orders, filter tabs, empty state | Tap order → /order-detail |
|17 | `UI-020 Detalle seguimiento de pedido.png` | Detalle seguimiento de pedido | UI-020 | Comprador | Order status timeline, delivery estimate | N/A |
|18 | `UI-021 Calificar pedido.png` | Calificar pedido | UI-021 | Comprador | Rating stars, comment field, submit button | Submit rating |
|19 | `UI-022 Confirmación de cancelación.png` | Confirmación de cancelación | UI-022 | Comprador | Cancelation confirmation message, back link | Back → orders |
|20 | `UI-024 Notificaciones.png` | Notificaciones | UI-024 | Comprador | List of notifications, empty state | N/A |
|21 | `UI-025 Mi perfil.png` | Mi perfil | UI-025 | Comprador | User info, edit button, avatar | Edit → /profile-edit |
|22 | `UI-025 Mi perfil-1.png` | Mi perfil (detalle) | UI-025 | Comprador | Same as above but maybe edited view | N/A |

---

## 3. Vendedor

| # | Archivo | Pantalla | UI identificador | Módulo | Elementos visuales principales | Botones y acciones | Variantes / estados |
|---|--------|----------|------------------|--------|------------------------------|--------------------|---------------------|
|23 | `UI-026 Editar perfil.png` | Editar perfil | UI-026 | Vendedor | Form fields (name, bio, categories), save button | Save → profile view |
|24 | `UI-027 Activar perfil vendedor.png` | Activar perfil vendedor | UI-027 | Vendedor | Activation prompt, confirm button | Activate → confirmation |
|25 | `UI-028 Confirmación perfil vendedor.png` | Confirmación perfil vendedor | UI-028 | Vendedor | Activated message, back button | Back → dashboard |
|26 | `UI-029 Dashboard vendedor.png` | Dashboard vendedor | UI-029 | Vendedor | Stats widgets, list of pending orders, actions | Process order → /order-detail |
|27 | `UI-030 Editar perfil vendedor.png` | Editar perfil vendedor | UI-030 | Vendedor | Same as edit profile (possibly duplicate) | N/A |
|28 | `UI-035 Mis alimentos.png` | Mis alimentos | UI-035 | Vendedor | List of foods, add button, edit icon | Add food → /add-food |
|29 | `UI-036 Agregar alimento.png` | Agregar alimento | UI-036 | Vendedor | Form to add a new food item, image upload, submit button | Submit → food list |
|30 | `UI-037 Editar alimento.png` | Editar alimento | UI-037 | Vendedor | Form pre‑filled with food data, save button | Save → food list |
|31 | `UI-038 Pedidos recibidos.png` | Pedidos recibidos | UI-038 | Vendedor | List of orders with status badges, actions per order | Tap → /order-detail |
|32 | `UI-038 Pedidos recibidos · Cerrados.png` | Pedidos recibidos – cerrados | UI-038 | Vendedor | Same list filtered to closed orders |
|33 | `UI-038 Pedidos recibidos · En curso.png` | Pedidos recibidos – en curso | UI-038 | Vendedor | Same list filtered to in‑progress orders |
|34 | `UI-038 Pedidos recibidos · Entregados.png` | Pedidos recibidos – entregados | UI-038 | Vendedor | Same list filtered to delivered orders |
|35 | `UI-038 · Pedido entregado.png` | Pedido entregado (detail) | UI-038 | Vendedor | Order delivered confirmation screen, back button | Back → order list |
|36 | `UI-039 Detalle pedido recibido.png` | Detalle pedido recibido | UI-039 | Vendedor | Order detail view for a received order, status timeline |
|37 | `UI-039 Detalle pedido recibido-1.png` | Detalle pedido recibido v2 | UI-039 | Vendedor | Possibly variant with extra details |
|38 | `Adventure? Wait actual file: UI-042 Administrar categorías.png` | Administrar categorías | UI-042 | Administrador | Category list, add/delete actions |
|39 | `UI-043 Administrar usuarios y vendedores.png` | Administrar usuarios y vendedores | UI-043 | Administrador | User list, role toggles, edit/delete |
|40 | `UI-044 Moderación de reseñas.png` | Moderación de reseñas | UI-044 | Administrador | Review list, approve/reject buttons |

---

## 4. Pedidos

| # | Archivo | Pantalla | UI identificador | Módulo | Elementos visuales principales | Botones y acciones | Variantes / estados |
|---|--------|----------|------------------|--------|------------------------------|--------------------|---------------------|
|41 | `05_Estado – Algo salió mal.png` | Estado - Algo salió mal | (none) | Estados Generales | Error icon, message, retry button | Retry → refresh |
|42 | `05_Estado – Alimento agotado.png` | Estado - Alimento agotado | (none) | Estados Generales | Out‑of‑stock icon, message, back button | Back → food list |
|43 | `05_Estado – Carga.png` | Estado - Carga | (none) | Estados Generales | Spinner, loading text | N/A |
|44 | `05_Estado – Desayunos fuera de horario.png` | Estado - Desayunos fuera de horario | (none) | Estados Generales | Time icon, message, suggestion |
|45 | `05_Estado – Sin conexión.png` | Estado - Sin conexión | (none) | Estados Generales | Wifi icon, message, retry | Retry |
|46 | `05_Estado – Sin notificaciones.png` | Estado - Sin notificaciones | (none) | Estados Generales | Bell icon, message | N/A |
|47 | `05_Estado – Sin pedidos.png` | Estado - Sin pedidos | (none) | Estados Generales | Empty basket icon, message | N/A |
|48 | `05_Estado – Sin resultados.png` | Estado - Sin resultados | (none) | Estados Generales | Search icon, message, retry | Retry |
|49 | `05_Estado – Vendedor inactivo.png` | Estado - Vendedor inactivo | (none) | Estados Generales | Avatar icon, message, activation prompt |
|50 | `Administración · Reporte semanal.png` | Reporte semanal | (none) | Administrador | Report charts, metrics |

---

## 5. Chat

| # | Archivo | Pantalla | UI identificador | Módulo | Elementos visuales principales | Botones y acciones | Variantes / estados |
|---|--------|----------|------------------|--------|------------------------------|--------------------|---------------------|
|51 | `Chat con comprador · Activo.png` | Chat con comprador – activo | (none) | Chat | Header with buyer avatar, message list, input field, send button |
|52 | `Chat con comprador · Cerrado.png` | Chat con comprador – cerrado | (none) | Chat | Header, message thread, closed status banner |
|53 | `Chat con vendedor · Chat cerrado.png` | Chat con vendedor – cerrado | (none) | Chat | Header, chat thread, closed banner |
|54 | `Chat con vendedor.png` | Chat con vendedor • activo | (none) | Chat | Same as above, active chat |

---

## 6. Estado General y Otros

| # | Archivo | Pantalla | UI identificador | Módulo | Elementos visuales principales | Botones y acciones | Variantes / estados |
|---|--------|----------|------------------|--------|------------------------------|--------------------|---------------------|
|55 | `Demo 01 · Explorar como invitado.png` | Demo – explorar como invitado | (none) | Autenticación/Comprador | Demo walkthrough, skip button |
|56 | `Demo 02 · Ofertas de vendedores.png` | Demo – ofertas de vendedores | (none) | Vendedor | Demo walkthrough, filter options |
|57 | `Revisión de pedido pendiente (vendedor) · Con chat.png` | Revisión de pedido pendiente (vendedor) – con chat | (none) | Vendedor | Order review, chat icon, approve button |
|58 | `UI-041 Dashboard administrador.png` | Dashboard administrador | UI-041 | Administrador | Admin overview, quick links |
|59 | `UI-042 Administrar categorías.png` | Administrar categorías | UI-042 | Administrador | Category list, add/edit action |
|60 | `UI-043 Administrar usuarios y vendedores.png` | Administrar usuarios y vendedores | UI-043 | Administrador | User list, remove/edit actions |
|61 | `UI-044 Moderación de reseñas.png` | Moderación de reseñas | UI-044 | Administrador | Review list, approve/reject buttons |
|62 | `Verificación del correo institucional.png` | Verificación del correo institucional | (none) | Autenticación | Provisionally duplicated by same name |

---

## Mapas de Recurso

### Recursos gráficos que deben incorporarse en `assets`

All PNG files must be imported as image assets for runtime use. The most frequently referenced assets (logo, icons, screens skeleton images for reference) are:  
- `UI-001 · Splash.png`, `UI-002 · Bienvenida.png`, `UI-003 · Iniciar sesión.png`, `UI-004 · Registro.png`, `UI-005 · Recuperar contraseña.png`, `UI-006 · Inicio comprador.png`, `UI-007 Buscar.png`, `UI-008 Filtros.png`, `UI-010 Disponible ahora.png`, `UI-012 Categoría.png`, `UI-013 Detalle alimento.png`, `UI-014 Perfil del vendedor.png`, `UI-015 Datos del pedido.png`, `UI-016 Confirmar pedido.png`, `UI-017 Pedido generado.png`, `UI-019 Mis pedidos.png`, `UI-020 Detalle seguimiento de pedido.png`, `UI-021 Calificar pedido.png`, `UI-022 Confirmación de cancelación.png`, `UI-024 Notificaciones.png`, `UI-025 Mi perfil.png`, `UI-026 Editar perfil.png`, `UI-027 Activar perfil vendedor.png`, `UI-028 Confirmación perfil vendedor.png`, `UI-029 Dashboard vendedor.png`, `UI-030 Editar perfil vendedor.png`, `UI-035 Mis alimentos.png`, `UI-036 Agregar alimento.png`, `UI-037 Editar alimento.png`, `UI-038 Pedidos recibidos.png`, `UI-039 Detalle pedido recibido.png`, `UI-041 Dashboard administrador.png`, `UI-042 Administrar categorías.png`, `UI-043 Administrar usuarios y vendedores.png`, `UI-044 Moderación de reseñas.png`.  
All 05_Estado images are state placeholders and will be used as reusable status indicators.

### Colores & Tipografías

Direct extraction of RGB/HEX values or font families is not possible with the current tool set; manual inspection of the PNGs is required. The analysis does not contain tentative color values and just notes that the design uses a set of primary dark/white backgrounds with accent blue in buttons and links.  

### Fontography

The font appears to be a sans‑serif typeface, likely Montserrat or a similar regular family, used consistently across headings and body text.  

---

## Resumen de Dudas Pendientes

| Pregunta | Comentario |
|---|---|
| 1. ¿Qué valores de color exactos se usan (HEX/RGB)? | Necesita ver cada PNG y extraer los códigos.
| 2. ¿Cuál es la variante de `UI-025 Mi perfil.png` vs `-1`? | Ambas parecen vistas y edición, comprobar detalles.
| 3. Duplicados de `UI-038 Pedidos recibidos` con y sin barras obliques: ¿se usan en contextos distintos? | Se asume que son filtros; verificar.
| 4. ¿Z‑index/españo de ventanas emergentes en `Revisión de pedido...`? | Falta imagen concreta.  
| 5. ¿Precisa de iconos vectoriales (SVG) en lugar de PNG? | Decide cuándo subir PNGs.

---

**END OF ANALYSIS**