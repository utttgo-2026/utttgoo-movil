# Plan 006 — Figma UI / Navigation Fixes

## Información General
- **Spec**: 006-figma-ui-navigation-fixes
- **Fecha**: 2026-11-11
- **Estado**: EN PRUEBAS (P0/P1/P2 y registro P3); verificación local 2026-11-12, prueba física P2/P3 pendiente.

## Orden de implementación
1. Spec → matriz → plan → tareas. Actualizar inventario/mapa solo con correspondencias verificadas.
2. Root Stack sin hijos buyer redundantes; Buyer Stack contiene (tabs), detalles/categorías/filtros y (private) para checkout/seguimiento. Grupos conservan URLs. Tabs existentes de Expo Router: Inicio/Buscar/Pedidos/Avisos/Perfil.
3. Helpers Href para food/[id]/category y regreso seguro. Back con historial; replace de fallback exclusivamente sin historial. Android delega navegación nativa con historial, fallback en secundarias sin historial, salida normal solo en raíces. Gestos conservados, validación física pendiente.
4. Diagnóstico sanitizado __DEV__, observador de ruta, +not-found y ErrorBoundary; sin queries ni error.message potencialmente sensible. No inventar causa de cierre.
5. RequireSession no monta contenido privado mientras anónimo/restaurando. Solicitud explícita de login y regreso al catálogo. Perfil anónimo separado. AuthContext/servicios intactos.
6. Mapeo de ids y normalización exclusiva de categoryId; ocho alimentos no clasificados visibles en listado general. No inventar etiqueta Vegano ni modificar otros campos.
7. Home sin carrusel; Search con chips UI-007 y encabezado de tipo estable. Category recibe categoryId y lista alimentos; Available comparte selección. Parseo/selección puros, estado vacío ante parámetros inválidos.
8. Screen separa viewport flex:1 de contenido scrollable flexGrow:1. Una FlatList vertical; eliminar nestedScrollEnabled como parche superficial. Insets inferiores a cargo de tabs, sin provider duplicado.
9. Tests de rutas, regresos, guardas sin montar datos, clasificación y selección, foco de búsqueda y listas. Mantener104 tests; ejecutar checks y comprobar Metro/bundle si entorno permite.
10. Actualizar tareas/memoria/changelog y detener cambios en P0/P1.

## Decisiones verificadas durante implementación
- SDK58 utiliza `unstable_settings.anchor` (se descartó initialRouteName por advertencia de deprecación). Ancla buyer=(tabs), siempre pública.
- Se usó `expo-router/testing-library` y RNTL14 instalados para recorridos reales del router en memoria. Métodos legacy UNSAFE_* no existen en esa versión: pruebas mediante queries públicas y RenderRouterResult tipado, sin cambiar dependencias.
- Las listas de categorías en UI-007 son chips con wrap según captura; no se fuerza otro carrusel horizontal. UI-012 tiene filtros/orden, no un segundo selector. Banner fotográfico y recientes/otros detalles visuales quedan pendientes de fases posteriores, sin inventar recursos.
- Filtros aplican mediante dismissTo a un origen permitido, no push de otro listado; precios máximos inclusivos etiquetados Hasta $60. No se implementa todo el filtro avanzado UI-008 en P1.

## Continuación aprobada P2/P3
1. Registrar reporte físico:7 PASS/1 PENDIENTE, dispositivo/versión/fecha de ejecución no informados. No dar por resuelto definitivamente el regreso a login.
2. Conservar línea base protegida actual de41 archivos: `e110daf4583f61239b177a0f3d373ee8b0058d6e` (AWS/contextos/rutas/datos comerciales sensibles/dependencias/SDD005). Código previo sin commit registrado por git status.
3. P2: hook responsivo con RN useWindowDimensions, cálculos puros y grid sin cambiar identidad de FlatList/input. Preferir filas con1/2 tarjetas dentro de una única FlatList estable para cambiar columnas sin desmontarla; restaurar offset en cambio de ancho/escala y conservar params.
4. Controles y páginas: crecimiento natural, roles tipográficos, botón loading con texto reservado, gutters únicos y SafeArea. No cambiar callbacks de auth/compra/cancelación/QR. No multiplicar fuentes por ancho ni bloquear fontScale.
5. Checkpoint: tsc/lint/test:ci,147 pruebas anteriores + matriz responsiva. No iniciar P3 hasta corregir fallas.
6. P3: inspeccionar exports reales, preferir fotos Figma recortadas temporalmente cuando no hay original individual; alternativas con página y permiso comprobados. Registro por id y FoodImage con expo-image instalado; miniatura/detalle, fallback neutro, source identity compartida. No descargar originales4K al runtime.
7. Script reproducible solo para preparar assets binarios (ediciones de código/docs mediante apply_patch); usar librerías ya instaladas, sin dependencias nuevas. Manifestar dimensiones/peso/origen/autor/licencia/transformación de cada recurso; pendientes explícitos cuando no exista foto adecuada.
8. Verificaciones finales, bundle y actualización SDD; no afirmar validación física de P2/P3 ni implementar P4.

## Riesgos y exclusiones
Mover grupos puede afectar historial: regenerar rutas, nunca editar .expo manualmente. Cambios privados solo de ubicación/guarda/flecha/scroll/presentación/medios, no negocio P4. P2/P3 autorizados según continuación anterior; tipos y servicios protegidos. No prometer gestos/regresos físicos sin teléfono.

## Decisión P3 y limitaciones verificadas
Se implementó foodMedia por21 ids y FoodImage compartido;10 fotos (8 alternativas licenciadas y2 recortes Figma temporales),11 marcadores neutros. No usar fotos de variantes sin confirmar. Hero/banner recortados como piezas independientes, no pantallas completas. Inventario y permisos en media-manifest.md; hashes/dimensiones/pesos en media-assets.generated.json. Script reproducible sin nuevas dependencias. Doctor final detecta recomendación upstream Expo58.0.25 frente a58.0.24 conservado: registrar19/20, sin actualizar dependencias en P3.

## Línea base protegida
Git tiene cambios previos005 sin commit. Huella de28 archivos protegidos (servicios, contextos, configuración/dependencias, SDD005): `3636d1036ef997841f8dedd076a5dbd7e3bb35af`. Comparar al final. Baseline:104 tests, Doctor20/20, tsc0errores, lint69warnings.

## Prueba física
Expo Go: invitado, cinco tabs, privacidad, categoría una vez, detalle/regreso conservando estado, filtros, último producto, flecha/Android/gesto, deep links válidos/inválidos. Logs [navigation] separan salida normal/ruta desconocida/excepción. Sesión real bloqueada por005.
