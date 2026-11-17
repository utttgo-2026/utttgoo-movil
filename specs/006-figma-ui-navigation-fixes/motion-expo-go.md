# Etapa006 — Guía visual de movimiento en Expo Go

Estado: EN PRUEBAS. Código y verificaciones automáticas terminados; renders físicos, gestos y FPS pendientes. Referencia inspeccionada: `../UTTT-Go/UI-006 · Inicio comprador.png` (outline, paleta, cinco tabs y subrayado rojo). No se modificaron PNG originales.

## Preparación
1. Ejecutar `npx expo start -c` y abrir con Expo Go Android. Registrar modelo, Android, versión Expo Go, ancho lógico, fontScale, tipo de navegación Android y fecha.
2. Fuente normal AWS. Si el catálogo está vacío, comprobar la transición/vacío honesto; para detalle usar un producto real autorizado ya existente. No crear cuentas/productos/pedidos automáticamente para probar efectos. El recorrido comercial manual continúa en el handoff007.
3. Comenzar con la preferencia del sistema de reducir/quitar animaciones desactivada. Luego activarla y repetir sin reiniciar la app. La preferencia desconocida o no disponible se trata conservadoramente como movimiento reducido.

## Recorridos y criterios
| Caso | Qué comprobar | Resultado físico |
|---|---|---|
| Cinco tabs | Inicio→Buscar→Pedidos→Avisos→Perfil→Inicio; cada toque selecciona una sola pestaña, nunca login automático | PENDIENTE |
| Selección | Icono outline escala hasta1.08 y sube2.5dp; color gris→rojo nativo; indicador rojo22×2 se desliza220ms sin rebote; label estable y legible | PENDIENTE |
| Selección rápida | Alternar Inicio/Perfil/Buscar repetidamente antes de220ms; queda activo el último, sin cola/parpadeo ni ruta tardía | PENDIENTE |
| Geometría | Anchos320/360/390/430dp disponibles, fuente1/1.3/1.6/2; cinco columnas visibles, labels pueden envolver, indicador centrado, SafeArea y barra gestual Android despejadas | PENDIENTE |
| Estado de listas | Buscar una palabra, desplazar, abrir detalle y volver; cambiar tab y volver; conservar query, teclado/foco cuando corresponde y offset, sin remount por animación | PENDIENTE |
| Stack | Detalle/categoría/checkout/auth/vendedor/editor avanzan horizontalmente; flecha/Android/gesto regresan coherentemente; filtros entran verticalmente sin nueva ruta/modal | PENDIENTE |
| Pulsación | Botón/tarjeta responde con escala0.98 del contenido, sin reducir el hitbox ni retrasar callback; arrastrar para scroll cancela pulsación; disabled/loading no ejecutan acciones | PENDIENTE |
| Datos y mensajes | Carga→contenido/vacío/error con fade discreto140ms de región, sin animar todas las filas; errores legibles/anunciados; success solo si el flujo existente confirmó la operación | PENDIENTE |
| Reduce Motion | Activar preferencia durante movimiento: microanimaciones se detienen y ajustan al destino; nuevos tabs/Stacks cambian sin animación; icono sin lift/escala; selección y botones siguen funcionando | PENDIENTE |
| Privacidad | Invitado en Pedidos/Avisos/Perfil/checkout/seller conserva guardas; login sigue explícito; logout durante transición elimina datos, no los retiene para fadeout ni resucita sesión | PENDIENTE |
| Deep links | Abrir detalle porID, filtro/categoría y ruta privada directa; mismas URLs y ancla pública al volver, sin auth como fallback genérico | PENDIENTE |
| Rendimiento | Android gama media, scroll y taps rápidos: sin congelamientos. Si está disponible, monitor de rendimiento Expo Go; registrar FPS observados y carga, sin depuración JS remota. Objetivo cercano60FPS no acreditado por Jest | PENDIENTE |

Stack usa transición nativa y gesto del sistema. `animationDuration220` es indicación iOS; Android conserva los tiempos nativos de react-native-screens. La reducción de movimiento de un gesto nativo ya iniciado también depende del SO; no se reinicia el navegador para cancelarlo.

## Implementación y archivos de esta mejora
- Layouts: `src/app/_layout.tsx`, `src/app/buyer/_layout.tsx`, `src/app/buyer/(tabs)/_layout.tsx`, `src/app/buyer/(private)/_layout.tsx`, `src/app/seller/_layout.tsx`.
- Tabs: `src/components/navigation/AnimatedBuyerTabBar.tsx`; decora el `BottomTabBar` público de `expo-router/js-tabs`, preservando sus eventos/links/selección/historial.
- Política/hooks: `src/navigation/motion.ts`, `src/hooks/useMotion.ts`, `src/hooks/useReducedMotion.ts`, ajuste accesible `src/hooks/useResponsive.ts`.
- Controles: `src/components/ui/AppButton.tsx`, `src/components/ui/AppInput.tsx`, `src/components/ui/MotionPressable.tsx`, `src/components/ui/MotionFeedback.tsx`.
- Consumidores visuales: `src/components/catalog/FoodCard.tsx`, `src/components/catalog/AwsCatalog.tsx`, `src/components/catalog/AwsOrderFlow.tsx`, `src/app/seller/products.tsx`.
- Tests: `src/navigation/__tests__/motion.test.tsx`, `src/navigation/__tests__/tabMotionFlow.test.tsx`.
- SDD: spec/plan/tasks006, este manual, `memoria.md` y `SDD_CHANGELOG.md`.

La barra reserva icono nativo28dp, espacio de label según fuente/ancho, padding y slot de indicador; mínimo64dp más inset inferior (antes60). No se reduce ni limita fontScale. La estimación de líneas es conservadora y debe cotejarse con renders reales.

No nuevas dependencias: RNAnimated con native driver para transform/opacity/color (color admitido por RN0.88), sin trabajo JS por frame ni LayoutAnimation. Reanimated/worklets ya instalados se mantienen sin modificación. No snapshots de datos privados ni callbacks de navegación ligados al fin de una animación. Feedback se desmonta inmediatamente cuando su contenido deja de existir; no se conserva texto para fadeout.

## Evidencia técnica
-593/593tests en38suites (562 previos +31 nuevos), TypeScript0errores, ESLint0errores/30warnings previos, ExpoDoctor20/20 y diffcheck limpio.
- BundleAndroid con `expo start -c`, routerRoot=src/app:HTTP200/14,050,485bytes, incluye tabs/movimiento reducido y servicios comerciales; Metro detenido. No render físico ni solicitud AWS nueva por esta tarea.
-72 archivos protegidos (servicios/contextos/datos/tipos/configuración/dependencias/SDD005/007) idénticos al inicio: SHA256 `43509f3a316af4339a08da50d41e4987a3670d00de375b973fc88089f0a2b484`. Incluye trabajo comercial previo sin commit; comparación contra workingtree inicial, no HEAD.
- Tests usan fixtures de sesión/movimiento únicamente en Jest; no se añade autenticación demo ni datos de backend simulados al runtime.

## Git
Commit solicitado: `feat(ui): add smooth tab and screen transitions`. Pendiente de prueba manual Expo Go exigida por AGENTS; no commit ni hash nuevo por esta iteración, no push. Registrar PASS/FAIL con captura o secuencia y repetir checks si se corrige código antes de cerrar006.
