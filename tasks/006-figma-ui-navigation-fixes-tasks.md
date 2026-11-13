# Tasks 006 — Figma UI / Navigation Fixes

## Información General
- **Spec**: 006-figma-ui-navigation-fixes
- **Fecha**: 2026-11-11
- **Estado**: EN PRUEBAS — P0/P1/P2 y registro P3 implementados;11 fotos y prueba física P2/P3 pendientes. Parche de Doctor corregido con autorización posterior para publicar.
- **Última verificación**: 2026-11-12 (reloj local -06:00).

## SDD
- [x] Registrar estado Git y huella de28 archivos protegidos de005.
- [x] Crear spec, matriz, plan y tareas antes de código.
- [x] Corregir inventario/mapa y aclaraciones autorizadas de Constitución/AGENTS.

## P0
- [x] NAV-01 rutas dinámicas tipadas desde listados (router real en memoria).
- [x] NAV-02 ownership root/buyer/tabs/private sin rutas redundantes; URLs conservadas.
- [x] NAV-03 flechas/fallback; listener Android probado con eventos simulados, gestos nativos conservados sin afirmar validación física.
- [x] Diagnósticos sanitizados, not-found y error boundary con prueba de recuperación.
- [x] Cinco tabs y guardas personales sin modificar AuthContext; hijos privados no montados en anonymous/blocked/restoring.

## P1
- [x] Seis categorías Figma,21 alimentos/ids y clasificación conservadora (8 no clasificados, visibles en general).
- [x] Selector Buscar; UI-012 seleccionada y parámetros conservados; filtros UI-008 tienen selector conforme a su captura.
- [x] Una FlatList vertical/viewport acotado, incluidos pedidos/avisos; prueba estructural de ancestros y scroll simulado hasta último producto.
- [x] Encabezado estable de búsqueda (misma instancia de input al cambiar query), vacíos reales y consulta conservada al regresar.

## Verificación
- [x] Añadir43 tests de rutas/acceso/categorías/búsqueda/listas/Android simulado y diagnósticos.
- [x] npx tsc --noEmit → 0 errores.
- [x] npm run lint → 0 errores,34 warnings (antes69; remanentes en módulos fuera de limpieza autorizada).
- [x] npm run test:ci → **147/147 aprobadas,12 suites** (104 anteriores intactas +43 nuevas).
- [x] npx expo-doctor →20/20.
- [x] git diff --check → sin errores de whitespace; avisos LF/CRLF habituales Windows.
- [x] Comparar huella protegida:28 archivos intactos, `3636d1036ef997841f8dedd076a5dbd7e3bb35af`; memoria/changelog actualizados.
- [x] Metro con caché limpia y bundle Android: HTTP200,2406 módulos (no dispositivo).
- [ ] Expo Go: navegación/regreso/Android/gesto/scroll.
- [ ] Reproducir regreso inesperado a login/cierre y atribuir causa con logs.

## Diferidos
P2/P3 autorizados para implementar en esta continuación; P4 negocio de pedidos/QR/cancelación/reseñas sigue diferido. No COMPLETADO con solo Jest; autenticación real bloqueada por005.

## Evidencia física aportada por el usuario — P0/P1
Fuente: reporte de prueba física en Expo Go, no Jest. Fecha exacta de ejecución, modelo, SO y versión Expo Go **pendientes**. Reportado durante esta continuación; sin capturas/logs adjuntos.

| Caso | Resultado |
|------|-----------|
| Inicio como invitado | PASS |
| Categorías sin duplicaciones | PENDIENTE |
| Regreso correcto sin volver inesperadamente a login durante el recorrido probado | PASS, alcance limitado a ese recorrido |
| Búsqueda y teclado | PASS |
| Categoría Vegano | PASS |
| Filtros de bebidas | PASS |
| Scroll del catálogo | PASS |
| Pestañas privadas | PASS |

**7 PASS y1 PENDIENTE.** No equivale a todos los dispositivos, todos los gestos/deep links ni a cierre definitivo del síntoma. Etapa006 sigue EN PRUEBAS.

## Continuación P2/P3 — tareas
- [x] Registrar evidencia física exacta y restricciones de alcance.
- [x] Ampliar spec/plan antes de código y registrar línea base protegida41 archivos.
- [x] P2 componentes compartidos, layout reactivo y controles accesibles.
- [x] P2 grid1/2 columnas con filas estables; mismo input/lista y offset restaurado, params conservados.
- [x] P2 pantallas prioritarias y presentación privada sin cambiar callbacks/reglas.
- [x] Checkpoint P2 ANTES de P3: tsc0errores, lint0errores/30warnings,167 tests/14suites aprobados (147 anteriores+20 nuevos).
- [x] P3 manifiesto para21 ids:10 fotos y11 fallbacks explícitos (no21 fotos completadas).
- [x] P3 assets locales optimizados, registro foodMedia y FoodImage;22 archivos/1241641bytes incluidos hero/banner.
- [x] P3 integrar tarjetas, categoría, detalle, datos/confirmación del pedido y hero independiente.
- [x] Ejecutar verificaciones finales y comparar huella protegida41 archivos (resultados abajo).
- [ ] Obtener fotos adecuadas de los11 productos pendientes y exports individuales Figma, ver media-manifest.md.
- [x] Revisar por separado recomendación Expo58.0.25: usuario autoriza y se aplica en preparación de publicación; Doctor final20/20, ver tareas005. Las verificaciones P2/P3 anteriores sobre58.0.24 permanecen como evidencia histórica.
- [ ] Revalidación física de P2/P3 y caso pendiente de categorías; modelo/versión pendientes.

Checkpoint P2: se corrigieron un gap duplicado y uso de absoluteFillObject retirado en tipos RN0.88. El nuevo test de grid usa un hook de dimensiones controlado, sin falsear el layout nativo. Al agrupar filas, el render inicial se acota a24 filas para el catálogo local21 y se conserva el test anterior del último producto; no se introduce getItemLayout con alturas inventadas. No regresiones automatizadas pendientes al comenzar P3. No evidencia física nueva.

## Evidencia y alcance real
- Inicio y Buscar se movieron a `src/app/buyer/(tabs)/`; Pedidos/Avisos/Perfil también. Las seis hojas del flujo de pedido pasan a `(private)/`. Los grupos no alteran URLs; no se eliminaron las pantallas ni su negocio, solo se organizaron y protegieron.
- Cambios en pedido/QR/cancelación/reseña limitados a movimiento de ruta, casts de navegación/flechas/fallback/guarda. Sus bugs de estado/identidad, comisiones, QR y acciones siguen diferidos a P4. CartContext y mockOrders no cambiaron.
- P0/P1 normalizaron categoryId sobre21 productos; P3 retiró solamente los campos image legacy y los resolvió por id. Resto de campos/ids/stock/precios intactos, sin reclasificar. Conteos: Tortas1, Comida corrida3, Postres3, Bebidas3, Snacks3, Vegano0;8 no clasificados. No hay nueva séptima categoría visible. Disponible general contiene20 por un producto agotado.
- Inicio deja de presentar carrusel y buscador duplicados; Buscar es el selector UI-007. Chips hacen wrap (como captura) en lugar de inventar otro scroll horizontal. Category muestra solo la categoría recibida; inválida/ausente muestra salida a Buscar sin exponer todo el catálogo.
- Parametrización: query, categoryId, availability, maxPrice y sort; sin tokens ni datos de sesión. dismissTo aplica filtros al origen permitido. No hay cambios de endpoints.
- P2/P3 implementados según continuación, con11 fotos y validación física pendientes. Banner UI-012 solo en Tortas y hero UI-002 son recortes temporales. UI-008 implementa selección local conocida, no calificación/campus/slider avanzados. No afirmar fidelidad visual completa ni todas las funciones de Figma terminadas.
- Pruebas nuevas: helpers de regreso/rutas, logs sanitizados, listener Android, mapeo sin dietas inventadas, guardas sin montar hijos, cinco tabs, entradas privadas directas, detalle/regreso, estabilidad de input, vacío Vegano, filtros persistentes, scroll simulado final, ausencia de ScrollView exterior en pedidos/avisos con sesión solo fixture. No son autenticación AWS ni gesto nativo físico.
- Durante verificación se corrigieron incompatibilidades de los tests con RNTL14/SafeArea mock default y tipo de evento BackHandler RN0.88; no se cambiaron versiones ni la API de sesión.
- Bundle solicitado a Metro local tras `start -c --offline --port8091`, CI únicamente en proceso hijo; **Android Bundled11637ms,2406 módulos, HTTP200,12520466 caracteres**. Proceso detenido al terminar; sin teléfono ni nuevas peticiones AWS.
- Diagnóstico desarrollo `[navigation]`: route_view, back, android_back, fallback, history_exhausted, route_not_found, execution_error. Queries/ids concretos/errores crudos no se registran. history_exhausted en raíz indica posible salida normal al sistema, no prueba de crash. El síntoma reportado no se declara solucionado.

## Recorridos pendientes en Expo Go
1. `npx expo start -c`, abrir por QR; splash→bienvenida→Seguir explorando. Debe mostrar Invitado y20 disponibles, con cinco tabs.
2. Buscar→Tortas→Torta de Milanesa→flecha: una selección, una tarjeta, conserva categoría al volver; regreso siguiente vuelve a Buscar.
3. Buscar→escribir Torta: input no debe desmontarse/perder foco; detalle y regreso mantienen consulta. Probar teclado y desplazamiento.
4. Buscar→Vegano: estado vacío, sin productos inventados ni otro selector; volver a Buscar.
5. Bebidas→Filtros→precio20→Aplicar: solo Jamaica/Horchata; abrir detalle/regresar conserva filtros. Probar Limpiar y orden.
6. Inicio y Disponible: llegar al último producto por scroll vertical sin bloqueos, duplicaciones ni warnings de listas anidadas.
7. Pedidos/Avisos/Perfil de invitado: solicitud de acceso, nunca datos de Mariana/pedidos. Login solo por botón explícito; regresar vuelve al destino y puede seguir explorando.
8. Acceso privado directo /buyer/order-data: guarda; ruta desconocida: salida pública; alimento inválido: no encontrado con flecha. No crear usuario demo para eludir005.
9. Comparar flecha, Android y gesto. Si reaparece login inesperado/salida, registrar secuencia, tipo de regreso, pantalla y eventos [navigation], además de versión Android/Expo Go. No confundir agotar historial con excepción.
10. Flujo autenticado físico y scroll de datos personales quedan bloqueados por005; las pruebas de esos listados usaron fixtures, no JWT reales.

## Verificación final P2/P3 — 2026-11-12
| Check | Resultado real |
|---|---|
| npx tsc --noEmit | 0 errores |
| npm run lint | 0 errores,30 warnings remanentes, ninguno nuevo por P3 |
| npm run test:ci | **178/178,15 suites**;147 anteriores+20 P2+11 P3 |
| npx expo-doctor | **19/20**, detecta nuevo parche recomendado expo~58.0.25 vs58.0.24 instalado; no corregido en este alcance |
| git diff --check | Sin errores de whitespace; avisos Windows LF/CRLF |
| Metro Android con caché limpia | **HTTP200,1402 módulos,13543ms,6306762 caracteres**; inicio offline puerto8092, proceso detenido al terminar, sin dispositivo |
| Huella protegida41 archivos | **e110daf4583f61239b177a0f3d373ee8b0058d6e**, idéntica al inicio P2/P3 |

Pruebas P3: cobertura de21 ids/fallbacks, integridad de22 archivos por hash/peso, presupuesto<8MB, error de carga, cambio de producto/resolución y fuente común en tarjeta/categoría/detalle/datos/confirmación. Bienvenida mantiene tres acciones nativas accesibles. Mock del decodificador de expo-image y sesión/carrito fixture; no evidencia AWS ni física. Datos comerciales revisados por diff: solo retiro de image en P3, normalización previa de categorías conservada.

### Recorrido adicional P2/P3
1. En Expo Go, comparar bienvenida con UI-002: solo artwork dentro del hero; los tres botones funcionan y la tipografía del sistema aumenta sin recortes.
2. Probar anchos320/360/390/430 disponibles y tamaños de fuente1/1.3/1.6/2; registrar dispositivo/Android/Expo Go y capturas. Los cálculos unitarios no sustituyen esos renders. Buscar conserva teclado/query/filtros/offset al variar layout y regresar del detalle.
3. Torta y Enchiladas: comparar la misma foto entre catálogo/categoría/detalle. Revisar nitidez de los recortes pequeños; no calificarlos como alta resolución.
4. Jamaica/otras bebidas: revisar foco y proporciones. Quesadillas/Caldo y los otros9 pendientes muestran marcador neutro, nunca otro platillo. Recorrer hasta el último producto, alternar detalles y comprobar que ninguna foto anterior permanece.
5. Reiniciar sin red después de cargar el proyecto: los assets son locales; registrar el resultado físico, no inferirlo solo por Jest/Metro.
6. Datos/Confirmar pedido: comparación física con sesión real pendiente de005; pruebas automatizadas de medios usan carrito fixture, no autenticación demo.

No hay nueva evidencia física respecto a los7 PASS/1 PENDIENTE aportados por el usuario. P4 permanece diferido y006 EN PRUEBAS. No commits/pushes ni nuevas dependencias.

## Preparación de publicación autorizada posterior
El usuario solicita subir todos los cambios acumulados005/006 a HRDCORE y autoriza Expo58.0.24→58.0.25 para corregir Doctor. El ajuste cambia únicamente Expo y su entrada del lock, sin otras versiones directas/transitivas. Se repiten tsc0, lint0errores/30warnings,178/178tests/15suites y Doctor20/20. Metro Android HTTP200,1402módulos,12564ms,6307114caracteres; proceso detenido, sin teléfono. Huella37 archivos protegidos fuera del parche intacta, ver tareas005. Los resultados19/20 y huella41 anteriores corresponden al cierre P2/P3 previo al parche, no al estado preparado para publicar.

El commit mantiene EN PRUEBAS,11 fotos y comparación física pendientes. No .env ni artefactos de pruebas; solo fuente/configuración/recursos/documentación previstos. Resultado de push/CI consultable en historial y Actions; no se declara anticipadamente.
