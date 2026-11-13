# Specification 006 — Figma UI / Navigation Fixes

## Información General
- **ID**: 006-figma-ui-navigation-fixes
- **Fecha**: 2026-11-11
- **Versión**: 1.1
- **Estado**: EN PRUEBAS — P0/P1/P2 y registro P3 implementados;11 fotografías pendientes, validación física P2/P3 pendiente.

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
