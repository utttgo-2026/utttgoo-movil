# Specification 006 — Figma UI / Navigation Fixes

## Auditoría actual de recuperación por bloques
Matriz006 actualizada con22capturas originales frente a código actualAWS, separada delhistorial. Sin renders nuevos de dispositivo. Recuperaciónvisual3acotada: efectivo UI015/016, marcoQR UI017bloqueado y avisos honestos sinAPI; no recrear desde memoria, generar credenciales ni afirmar recuperados history/dashboard/tabsSeller. El Bloque1 conserva animaciones, input/queries y revalida catálogo al foco. Nuevos tests y checkpoints porbloque antes de continuar; verfigma-matrix.md.

## Continuación — movimiento discreto (autorizada)
Mantener Figma UI006 (cinco tabs/outline/paleta/Poppins/subrayado rojo22×2), ownership de rutas e historial006. Dependencias actuales incluyen RNAnimated/Reanimated4.7.1/worklets0.13.0/gesture-handler; usar Animated nativo de RN, sin instalaciones ni reemplazar Tabs/BottomTabBar de Expo Router58.0.31. Contratos, callbacks y estado005/007/carrito quedan protegidos.
- MOTION-01: selección220ms easing suave sin rebote, icono escala1→1.08 y translateY0→−2.5dp, color por interpolación nativa (RN0.88 admitecolor en native driver), indicador22×2 se desplaza al tab activo. Mismo glyphoutline, sin superponer glyphs que bajen contraste al hacercrossfade. Texto no se escala. Cancelar/retargetear animaciones rápidas desde posición actual, sin colas ni navegación al terminar animación.
- MOTION-02: ancho real/insets/RTL para indicador, labels debajo del icono en cinco columnas, altura accesible existente y texto multilinea. 320/360/390/430dp y fontScale1/1.3/1.6/2; SafeArea a cargo del BottomTabBar existente.
- MOTION-03: Stack nativo horizontal para detalle/categoría/checkout/auth/vendedor/productos y reversa nativa; filtros entrada vertical discreta como card, sin nuevo modal ni cambios de deep links/guards. Tabs fade120ms, sin desmontar pantallas ni reiniciar scroll. No animación de pantalla completa adicional.
- MOTION-04: feedback press de botones/tarjetas con transform/opacity y área táctil estable; transición de estado de carga/contenido/vacío a nivel de región, no animar cada tarjeta al renderizar FlatList. Mensajes y errores pueden aparecer suavemente; retirada de datos/errores y logout siguen inmediatos, sin retener snapshots privados para fadeout. Preparación confirmada usa la pantalla/revisión existente, sin confirmación ficticia de backend.
- MOTION-05: Reduce Motion del sistema, actualización en vivo y estado inicial conservador sin movimiento hasta conocer preferencia. Cancelar microanimaciones en curso al activarlo; no escala/elevación y nuevas transiciones sin movimiento bajo reducción. Un gestoStack nativo ya iniciado sigue bajo autoridad del SO, no resetear navegador para cancelarlo. Accesibilidad/selected/labels/eventos de tabs, teclado/longpress y áreas táctiles nativas conservados.
- MOTION-06: objetivo60FPS requiere medición física, no se acredita conJest/bundle. Native driver para transform/opacity, sin layout animado/infinite loops ni bloqueo de acciones durante transiciones. Tests rápidos/activo/back/invitado/privados/logout/reduceMotion, checks obligatorios y guíaExpoGo. EstadoENPRUEBAS hasta evidencia; commit solicitado `feat(ui): add smooth tab and screen transitions` condicionado por regla manualAGENTS.

## Información General
- **ID**: 006-figma-ui-navigation-fixes
- **Fecha**: 2026-11-11
- **Versión**: 1.2
- **Estado**: EN PRUEBAS — P0/P1/P2/P3 y movimiento implementados;11 fotografías y validación física pendientes. Guía actual: motion-expo-go.md.

## Objetivo y alcance
Corregir NAV-01/02/03, navegación pública del comprador, categorías y SCR-01. Conservar SDK58, dependencias, AuthContext, SecureStore, AWS y 21 alimentos mock con sus identificadores. Etapa005 continúa EN PRUEBAS.

P2 (responsividad) y P3 (medios) autorizados en esta continuación; P4 lógica de pedidos/QR/cancelaciones/reseñas sigue fuera de alcance. En pantallas privadas solo presentación y medios, sin reglas de negocio.

## Requisitos y aceptación
| ID | Requisito | Aceptación |
|----|-----------|------------|
| NAV-01 | Detalle dinámico real | Inicio/Buscar/Categoría/Disponible envían id a food/[id], sin casts any |
| NAV-02 | Propietario único | Root posee auth/buyer; buyer posee tabs/detalles/grupo privado; sin hijos redundantes |
| NAV-03 | Regreso seguro | Back al origen con historial; fallback público si no existe; Android/gestos pendientes de dispositivo |
| NAV-04 | Cinco tabs | Inicio, Buscar, Pedidos, Avisos, Perfil; invitado no monta datos personales ni crea sesión |
| NAV-05 | Diagnóstico | Ruta/retroceso/fallback/ruta desconocida/error solo en desarrollo, sin query/credenciales; no afirmar resuelto cierre no reproducido |
| CAT-01 | Selector UI-007 | Categorías en Buscar; UI-012 solo lista la categoría recibida |
| CAT-02 | Mapeo conservador | Sin alimentos inventados ni etiquetas dietarias supuestas; contadores reales, incluso cero |
| CAT-03 | Selección persistente | categoryId/búsqueda/disponibilidad/orden conservados; categoría inválida no muestra todos los alimentos |
| SCR-01 | Una lista vertical | Sin FlatList en ScrollView vertical; viewport flex:1, encabezado estable y último elemento accesible |
| REG-01 | Sin regresión005 | 104 tests originales conservados; HTTPS/AuthContext/SecureStore/dependencias intactos |

## Taxonomía y datos
UI-007: Tortas, Comida corrida, Postres, Bebidas, Snacks, Vegano. IDs técnicos cat-1..cat-6 con mapeo explícito por food.id.

Torta de Milanesa→Tortas; Enchiladas/Mole/Caldo→Comida corrida; Flan/Gelatina/Arroz con leche→Postres; tres bebidas→Bebidas; Elote/Papas/Chicharrones→Snacks. Ningún producto acredita etiqueta vegana. Los cuatro desayunos y cuatro antojitos restantes no se fuerzan a categorías distintas: permanecen en Todo/Buscar/Disponible con estado técnico unclassified, no una séptima categoría visual. No modificar precios, stock ni otros campos comerciales. Las imágenes, conservadas durante P0/P1, tienen autorización de sustitución exclusivamente en P3 (ver abajo).

## Acceso
Catálogo, búsqueda, categoría, disponible y detalle públicos. Pedidos, avisos personales y checkout/seguimiento/calificación/cancelación privados. Perfil tiene vista de invitado sin datos personales. Guardas consumen el contexto existente; sin sesión demo. Pruebas físicas autenticadas siguen bloqueadas por005.

## P2/P3 — requisitos aprobados
| ID | Requisito / aceptación |
|----|------------------------|
| RESP-01 | Dimensiones reactivas, Flexbox y SafeArea sin padding duplicado; probar320/360/390/430 y fontScale1/1.3/1.6/2 sin desactivar accesibilidad |
| RESP-02 | Controles por rol, texto multilinea e interlineado coherente; loading no cambia geometría del botón |
| RESP-03 | Tarjetas de altura flexible y columnas1/2 según espacio/texto; conservar query/filtros, navegación y offset al cambiar layout |
| RESP-04 | Header, formularios, tabs y pantallas prioritarias comparados con PNG; Poppins/paleta conservados |
| MEDIA-01 | Registro canónico por food.id para21 productos; una identidad fotográfica en todos los consumidores, fallback neutro sin otra comida |
| MEDIA-02 | Assets locales optimizados y manifiesto de autor/origen/licencia/recorte/peso; si falta recurso apropiado usar pendiente explícito |
| MEDIA-03 | Bienvenida con componentes accesibles y hero independiente, nunca captura completa con botones incrustados |
| REG-02 | Checkpoint P2 obligatorio antes de P3; conservar147 tests y reglas P0/P1/005; regresiones confirmadas se corrigen primero |

La autorización P3 permite cambiar únicamente los recursos de imagen del mock, sin tocar sus21 ids, nombres, precios, stock, categorías y demás campos comerciales. Recortes de PNG identificados como temporales y de resolución limitada, no exports originales de alta calidad.

## Cierre
tsc, lint, Jest, Doctor, diff check y pruebas de rutas/acceso/categorías/listas. No COMPLETADO hasta Expo Go. El regreso inesperado a login/cierre sigue pendiente de reproducción y logs.

## Dependencia de integración007 P0
Las categorías persistentes ahora proceden de AWS y no se fuerzan a los6ids/nombres mock. Fuente mock/composición visual006 se conserva exclusivamente bajo configuración explícita de desarrollo; producción usaAWS sinfallback. Mismas rutas y componentes temáticos, estados carga/error/vacío/contrato incompleto para no mostrar FoodItem/medios ficticios mientras falte DTOproducto. No cambios de tabs/back/fallback/globalresponsiveness; pruebas de recorridos previos declaran fuente fixture expresamente. Media y publicación real siguen pendientes, no se presenta catálogo vacío como fidelidad visual concluida.
# PR27 — pedidos y QR en curso

Las pantallas comerciales solo deben mostrar pedidos validados por AWS y el QR únicamente un token recibido del backend, vigente y restringido al comprador de un pedido Ready. Las acciones se habilitarán únicamente al integrar roles y transiciones comprobadas.
# Cierre de recorridos comerciales (UI-017/020/038)

Tras éxito confirmado, cerrar el checkout en el stack comprador antes de abrir el recibo. Atrás desde el recibo vuelve a Mis pedidos; seguimiento y cierre de entrega reutilizan rutas existentes. Mantener gestos, enlaces profundos y guardas; QR solo en seguimiento con lectura vigente. Pruebas del router real en memoria y medición de consultas; validación visual y Back físico pendientes.
