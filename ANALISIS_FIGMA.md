# Análisis Figma — correspondencias verificadas

## Fuente y alcance de revisión
Carpeta real: `../UTTT-Go/` desde MovilGo. Inventario comprobado: **63 PNG**, no66. Diagnóstico006 revisó visualmente26 capturas de auth/comprador/perfil/invitado. Las otras37 se clasifican por nombres; no afirmar inspección visual integral. No existen assets individuales de comida/hero ni archivo Figma editable en esa carpeta.

## Inventario por flujo
| Flujo | Cantidad | Referencias |
|-------|----------|-------------|
| Autenticación | 6 | UI-001 Splash, UI-002 Bienvenida, UI-003 Iniciar sesión, UI-004 Registro, UI-005 Recuperar contraseña, Verificación del correo institucional |
| Comprador/compartidas | 17 | UI-006/007/008/010/012/013/014/015/016/017/019/020/021/022/024/025 y UI-026 |
| Vendedor/variantes | 18 | UI-025 Mi perfil-1; UI-027/028/029/030/035/036/037; cinco UI-038; dos UI-039; dos Detalle de pedido en curso; Revisión de pedido pendiente con chat |
| Administración | 5 | UI-041/042/043/044, Administración · Reporte semanal |
| Chats | 6 | Mis chats comprador/vendedor; chat con comprador activo/cerrado; chat con vendedor activo/cerrado |
| Estados generales | 9 | Algo salió mal, Alimento agotado, Carga, Desayunos fuera de horario, Sin conexión, Sin notificaciones, Sin pedidos, Sin resultados, Vendedor inactivo |
| Invitado | 2 | Demo01 Explorar como invitado, Demo02 Ofertas de vendedores |

## Correspondencias visuales verificadas de comprador
- UI-006: header de marca/saludo, grid Disponible ahora, tabs Inicio/Buscar/Pedidos/Avisos/Perfil. No se observa el carrusel completo añadido por el código anterior.
- UI-007: búsqueda, recientes, chips **Tortas, Comida corrida, Postres, Bebidas, Snacks, Vegano**; selector aquí, no repetido en detalle de categoría.
- UI-008: filtros por disponibilidad/categoría/precio/calificación y campus.
- UI-010: grid de disponibles con precio/disponibilidad y ordenamiento.
- UI-012: categoría **Tortas seleccionada**, banner, filtros/orden y lista de productos. No es un selector general de categorías.
- UI-013: detalle con fotografía, vendedor, cantidad y compra. UI-014: perfil público del vendedor visto desde comprador.
- UI-015: datos del pedido con referencia/observaciones y cantidad; UI-016: confirmar/modificar; UI-017: generado/QR/seguir/volver.
- UI-019: pedidos actuales/anteriores; UI-020: seguimiento con flecha; UI-021: calificar; UI-022: confirmación de cancelación como overlay.
- UI-024: avisos/notificaciones y tabs. UI-025 Mi perfil: comprador. UI-025 Mi perfil-1: vendedor (Panel/Alimentos/Pedidos/Perfil), no duplicado de comprador.
- UI-026: formulario de edición compartido, no exclusivamente vendedor.
- Demo01/02: recorrido invitado de explorar y comparar ofertas, distinto del acceso directo al catálogo implementado.

## Autenticación y discrepancias intencionales
UI-003 muestra flecha de regreso. UI-004 tiene nombre/email/password/confirmación. Las capturas muestran un flujo de token institucional y dominio antiguo; **no son contrato backend**. Mantener @uttt.edu.mx, bloqueo HTTPS y ausencia de OTP simulado según005.

## Recursos y diseño
No afirmar familia tipográfica o HEX exactos extraídos de PNG. Conservar Poppins/paleta de Constitución hasta revisión P2. Los PNG son referencias, no fondos de pantalla runtime. `src/assets/images/welcome-hero.png` coincide con UI-002 completa (verificado por hash); exportar hero individual en P3. Fotos individuales ausentes; no modificar originales.

Detalle de comparación/correcciones: `specs/006-figma-ui-navigation-fixes/figma-matrix.md`. La verificación física actual sigue pendiente.
