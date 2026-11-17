# Memoria — UTTT-Go Móvil

## Publicación en rama V1.2 autorizada
Usuario solicita subir todos los cambios acumulados a V1.2 y confirma en pregunta explícita que verificó físicamente el hotfixrunSeller enExpoGo tras recargacompleta, sin laexcepción. Se cumple la condición manual para crear el commit de esta entrega; resto del recorrido comercial/Figma permanece ENPRUEBAS y no se amplía esa evidencia a flujos no reportados. Rama creada desdeHRDCORE con sus2commits locales previos y el workingtree acumulado; solo fuente/tests/SDD, sin .env/credenciales/temporales. CIactual filtra push a main/HRDCORE y PR contra esasramas: un push exclusivo aV1.2 no disparaCI automáticamente.

## Hotfix físico reportado runSeller / AuthContext176
- Expresión identificada en la posición reportada: session.sellerSubmissionState(). Se llamaba también desde catch, de modo que su ausencia en la instancia rechazaba otra vez la promesa y tapaba el errororiginal. El método existe en clase/factory actuales; no es un import ausente demostrado ni un cambio del endpoint. Antes del fix, el test con instancia sin método produjo exactamente TypeError:session.sellerSubmissionState is not a function.
- useState(createAuthSession) conserva instancia entre renders; prueba reproduce retención de un objeto viejo aunque factory cambie y recuperación al remount. FastRefresh es mecanismo compatible con esa retención; no se afirma haber inspeccionado memoria remota del teléfono ni saber el errorHTTP original que quedó oculto.
- Corrección acotada: contrato obligatorio runtime en Context y SellerSubmissionState tipado en coordinador; validar antes de operar y antes de adoptarUser. Catchaislado para metadata, HTTPoriginal/401 preservados, cancelación porrevision y resultadoincierto si falló integridad después de intentar alta. Falta de método nunca es éxito ni se oculta con optional chaining. No se cambian prototipos ni se reemplaza coordinador en caliente: reloadcompleto crea instanciaactual y restauraJWT por flujoexistente.
-640/640tests/40suites (+15), tsc0, lint0errores/27warnings, Doctor20/20,diffchecklimpio. Tests de método ausente/getterque lanza/metadata inválida/errororiginal/logout/restauración y factoryreal a través de Context con GETBearer simulado; reintentoUI alcanzaMis productos. BundleAndroid200/14,066,037bytes, Metrodetenido. No cambios de APIproductos/catálogo, pantallasFigma ni solicitudesmutantesAWS. CorrecciónENPRUEBAS hasta nueva confirmación física delusuario; sincommit/push.

## Recuperación por bloques — vendedor real y matriz actual Figma
- B1ejecutado sobre módulos existentes: SellerEntry compartido en rutas negocio/activación/editores; GETautomático al foco, solo404SELLER_PROFILE_NOT_FOUND tipado como missing, coalescing de consulta completa/identidad por generación. Otros errores no habilitan alta. Formularioextraído sin cambiar campos businessName/description/pickupPoint; storeName/phone no se envían.
- POSTseller acepta200 publicado/201 previamente confirmado con parserActive; marca recibido antes deGETperfil y rolesrevalidados con mismoJWT. Si falla verificación, conservaralta recibida y bloquearreenvío. Contextrole y GETActive gobiernan acceso, no roles del negocio como autoridad. Logout/querynuevo descarta resultadosobsoletos. Supabase/SecureStore/contratosauth y animaciones sin cambios de comportamiento.
- ProductResponseahora completo conmetadata/nulabilidad obligatoria y números/cadenas de formato explícito normalizadas con rangosseguros. ProductPage solo total, sin totalCount; response no incluye imageUrl segúnOpenAPI/GETreal, fotografía se resuelve como placeholderlocal. Compra respeta isAvailable/status/stock. Catálogo al foco conserva selección/input y datos públicos de la misma consulta durante recarga; ruta de otrosfiltros no muestra resultadosanteriores. created_desc rechazado antes deHTTP y opción deshabilitada; incompatibilidad400 registrada.
- EvidenciaGETpública actual categorías3/productos1/total1; OpenAPIproductoscompleto y camposaltavigentes. Sin POST/PATCH AWS automático ni evidencia de persistencia por esta iteración.
- Auditoríaestática nueva de22PNGsoriginales frente a fuentesAWS actuales en matriz006 existente (sin duplicarla). Recuperación B3acotada: efectivo visual UI015/016 sin campoauthoritativo nuevo, marcoQR UI017 sin payload/scanner ni generación de QRconID/JSONlocal, avisosAWS ya no muestran fixtures como eventos reales. Alertasmock solo devexplícito.
- CheckpointB1:622tests/40suites, tsc0, lint0errores/30warnings, Doctor20/20 y diffcheck. FinalB3acotado/hardening:625/625/40suites, tsc0, lint0errores/27warnings, Doctor20/20,diffchecklimpio,bundleAndroid200/14,063,236bytes, Metrodetenido. No pruebaExpoGo ni commit/push; etapasENPRUEBAS. Unidades siguientes:3.1GETmine/detail (schemasdisponibles),3.2dashboard/tabsSeller y autorizacióncola,3.3acciones/QRseguro concontratosfaltantes. No confundir tareas de integración pendientes con bloqueo de todo el backend.

## Etapa006 — movimiento discreto y accesible
- Revisados Constitution/AGENTS/memoria/006/layouts y PNG UI006. Se conserva BottomTabBar de Expo Router58 y sus cinco pestañas, mismos glyphsoutline/paleta/Poppins/subrayado22×2 e historial. Wrapper visual con contexto de progreso por tab; no confiar en argumento focused de renderIcon porque el SDK dibuja variantestrue/false. Selección220ms easingcubic, icono1.08/−2.5dp y color interpolado nativo (RN0.88 lo admite); indicador usa ancho real/insets/RTL. Altura mínima64dp+inset, espacio de labels según fuente/ancho sin capfontScale.
- RNAnimated nativo basta; Reanimated4.7.1/worklets0.13 ya instalados se conservan. Transform/opacity/color sin layoutanimado, loops, callbacks de navegación al terminar ni bloqueo de interacción. Hooks cancelan/retargetean valores al cambiar rápido; no se animan todas las filas ni se cambia key/offset del grid.
- AccessibilityInfo/useSyncExternalStore comparte una suscripciónReduceMotion, inicialconservadora, consultaobsoleta descartada, cambios en vivo y cleanup. Bajo reducción no lift/escala; cambios instantáneos y nuevosStacks none. Stack nativo horizontal salvo filtrovertical como card, sin mover rutas ni tocarback/guards. Gesto nativo ya en curso corresponde al SO.
- Botones/tarjetas responden a press solo en contenido, manteniendo hitbox/callback; errores/formularios y estados de catálogo/confirmación con fade140ms a nivel región/mensaje. Texto y datos desaparecen inmediatamente al retirarse, sin snapshots privados para fadeout ni éxito backend fingido.
-593/593tests/38suites (+31), tsc0, ESLint0errores/30warnings previos, Doctor20/20, diffchecklimpio; bundleAndroid200/14,050,485bytes con movimiento y servicios existentes, Metrodetenido.72protegidos idénticos al workingtree inicialSHA25643509f3a316af4339a08da50d41e4987a3670d00de375b973fc88089f0a2b484. GuíaExpoGo006 preparada; no evidencia física/FPS ni nuevo commit por condiciónmanualAGENTS, sinpush.

## P0 PR #24 — actualización vigente
- PRbackend24 fusionado según usuario, contratos status Active/Paused, notes≤250 e imageUrlomitido/null resueltos. OpenAPIHTTPS verificado sinmutaciones; Fase05 conserva uploadS3 pendiente. Diagnóstico422IMAGE_NOT_AVAILABLE solo proyecciónconstante sin datos personales ni secretos, desarrollo consola y últimoevento seguro enmemoria.
- Se mantienen servicios y únicoAuthContext. Disponibilidad usa capabilityprivada con SellerActive/ownership/lock/generación, respuesta200correlacionada. Owner de IDs reales verificados se conserva por sesión para reactivar Paused aunque catálogo público lo oculte; se limpia con login/restore/logout. Backend sigue autoridad. No listado privado ni endpoint inventado.
- Notes en preparación existente, editable en Datos y readonly en Confirmar; límiteUTF16 compatible.NET sin truncar. Request únicamenteproductId/quantity/notes. No carrito multiitem, importescliente ni limpieza por error.
- Despliegue observado difiere en páginas(total) y respuestaorden(orderId/buyerUserId/total+metadata). Lectura de ambas versiones documentadas con validación y normalización al modelo interno, sin aliasesguess ni respuesta híbrida. HealthHealthy,categorías3, productosvacíos; búsquedacategoríaprecioGET200,4sortsconfirmadosGET400. Omisión de sort inicial permitecatálogo; no retry ni enum alternativo ocultando400.
- Prueba física del circuito comercial siguependiente; AGENTScondiciona commitlocal a ExpoGo ademásdechecks aunque usuario solicitócommit. No se afirma persistencia real de productos/pedidos por schema/fixtures.

> Registro de decisiones arquitectónicas, de diseño, de navegación, de datos mock y de alcance del proyecto UTTT-Go Móvil.

## Continuación007/003 — productos y pedido AWS
- DTOproducto confirmado desbloquea creación y edición inicial precio/stock; ProductPage usa totalCount, separado de categorías total. Estados/sort exactos del contrato. Disponibilidad de escritura sigue bloqueada por discrepancia status/availability.
- No adaptar AWS a FoodItem con rating/tiempo/vendedor ficticios. UI usa ProductResponse, componentes/tema/rutas actuales y fotografíaHTTPS o neutro. Listado paginado de hasta20 por pantalla, sin listas virtualizadas anidadas. IDs propios de productos solo tras respuestaAWS/consulta ownership, sin supuesto listado privado.
- Capacidades comerciales en sesión/Context existentes; revalidar /me y SellerActive, comprobar ownership y descartar respuestas tardías. Memoria comercial por sesión, sin nuevo almacenamiento ni autoridad de autenticación. Bloqueos POST cliente no sustituyen idempotencia backend.
- Contratoorders de un solo producto justifica preparación independiente del carrito mock multiitem; no generar varias órdenes ni enviar notas/fee. Éxito solo tras201 validado e identidad/cantidad/total coherentes. Flujo conserva las rutas order-data/confirm-order/order-created; sin contrato de consulta no se presenta historial/seguimiento/QR ficticio.
- Manual físico y fidelidad visual siguen pendientes; no se ejecutaron mutaciones reales automáticamente. La regla de commit requiere Expo Go antes de crear el commit local.

---

## 1. Decisiones Arquitectónicas

| Fecha | Decisión | Justificación | Impacto |
|-------|----------|---------------|---------|
| 2025-11-05 | Expo Router (file-based routing) | Navegación nativa Expo, typed routes, simple | Navegación tipada, discovery automático |
| 2025-11-05 | React Context API (no Redux/Zustand) | Simpleza, cero dependencias extra, suficiente para mock | Estado global simple, cero boilerplate |
| 2025-11-05 | StyleSheet + Theme system (no styled-components) | Performance RN nativo, cero runtime, compatible Expo Go | Bundle ligero, compatibilidad Expo Go |
| 2025-11-05 | AsyncStorage solo para usuarios | Persistencia simple, sin backend, compatible Expo Go | Usuarios registrados sobreviven reinicios |
| 2025-11-05 | Single-vendor cart (regla de negocio) | Requisito de negocio: una compra = un vendedor | Arquitectura cart simple, sin merge complejo |
| 2025-11-05 | Expo Router typedRoutes | Type safety en navegación, autocompletado | Menos bugs navegación, DX mejorado |
| 2025-11-05 | React Compiler habilitado | Optimización automática React 19 | Performance automática |

---

## 2. Decisiones de Navegación

| Fecha | Decisión | Justificación | Archivos Afectados |
|-------|----------|---------------|-------------------|
| 2025-11-05 | `router.push` en login/verify-email (no `replace`) | Mantener historial: back va a login, no salta a welcome | `login.tsx`, `verify-email.tsx` |
| 2025-11-05 | `router.replace('/welcome')` en logout | Resetear stack completamente al cerrar sesión | `profile.tsx` |
| 2025-11-05 | Eliminar `Stack.Screen` redundantes | Expo Router descubre rutas automáticamente (typedRoutes) | `src/app/_layout.tsx` |
| 2025-11-05 | Rutas dinámicas `/buyer/food/:id` + `useLocalSearchParams` | Type safety, URLs limpias, SEO-friendly | `food/[id].tsx`, `index.tsx` |
| 2025-11-05 | `router.push` para navegación auth (no replace) | Historial coherente: back navega correctamente | `login.tsx`, `verify-email.tsx`, `welcome.tsx` |

---

## 3. Decisiones de UI / Diseño

| Fecha | Decisión | Justificación | Archivos Afectados |
|-------|----------|---------------|-------------------|
| 2025-11-05 | Figma como única fuente de verdad | Fidelidad visual obligatoria para presentación académica | Todas las pantallas |
| 2025-11-05 | Poppins como tipografía única | Consistencia visual, disponible en Google Fonts | `theme/typography.ts`, `useFonts` |
| 2025-11-05 | Paleta de colores extraída de Figma | Consistencia visual exacta | `theme/colors.ts` |
| 2025-11-05 | `ImageBackground` para hero images | Overlay de texto sobre imagen (UI-002) | `welcome.tsx`, `category.tsx`, `available-now.tsx` |
| 2025-11-05 | `nestedScrollEnabled` en ScrollView | Permite FlatList horizontal + vertical anidados en Home | `Screen.tsx`, `index.tsx` |
| 2025-11-05 | `moderateScale`, `verticalScale`, `wp`, `hp` | Diseño responsivo real para múltiples anchos | `theme/spacing.ts`, `hooks/useResponsive.ts` |
| 2025-11-05 | Ionicons como fallback de iconos Figma | Figma no exportó SVGs individuales | Todos los componentes |
| 2025-11-05 | Placeholder Unsplash para imágenes categorías/alimentos | Figma no exportó recursos individuales | `category.tsx`, `available-now.tsx`, `index.tsx` |

---

## 4. Decisiones de Datos Mock

| Fecha | Decisión | Justificación | Archivos Afectados |
|-------|----------|---------------|-------------------|
| 2025-11-05 | 6 categorías temáticas universitarias | Coherencia con temática UTTT (Desayunos, Comida corrida, Antojitos, Bebidas, Postres, Snacks) | `categories.ts` |
| 2025-11-05 | 21 alimentos distribuidos 4/4/4/3/3/3 | Distribución equilibrada para demostrar filtrado | `foods.ts` |
| 2025-11-05 | 3 usuarios demo (comprador, vendedor, admin) | Login rápido para demo académica | `users.ts` |
| 2025-11-05 | Passwords demo "12345678" | Simplicidad para demo, no seguridad real | `users.ts`, `AuthContext.tsx` |
| 2025-11-05 | 4 pedidos con estados variados | Demostrar timeline seguimiento | `orders.ts` |
| 2025-11-05 | 4 notificaciones (order/chat/system) | Demostrar tipos notificación | `notifications.ts` |
| 2025-11-05 | Categorías con itemCount real | UI muestra contadores reales | `categories.ts` |
| 2025-11-05 | Imagen Bebidas: icono `wine-outline` | Más apropiado que `cafe-outline` duplicado | `categories.ts` |
| 2025-11-05 | Alimentos con tags coherentes por categoría | Filtrado y búsqueda realistas | `foods.ts` |

---

## 5. Decisiones Relacionadas con Figma

| Fecha | Decisión | Justificación | Estado |
|-------|----------|---------------|--------|
| 2025-11-05 | Categorías basadas en propuesta temática (no Figma verificado) | UI-012 Categoría.png no verificado aún | **PENDIENTE VERIFICAR** |
| 2025-11-05 | Imágenes categorías/alimentos: placeholders Unsplash | Figma no exportó recursos individuales | PLACEHOLDER |
| 2025-11-05 | Iconos categorías: Ionicons fallback | Figma no exportó SVGs individuales | FALLBACK |
| 2025-11-05 | Nombres categorías: propuesta temática | Pendiente confirmar contra UI-012.png | **PENDIENTE VERIFICAR** |

---

## 6. Decisiones de Alcance

| Fecha | Decisión | Justificación |
|-------|----------|---------------|
| 2025-11-05 | Backend pendiente (solo mock) | Enfoque en UI/UX para demo académica |
| 2025-11-05 | Solo Android (Expo Go) | Requisito académico: demo en Android |
| 2025-11-05 | No tests automatizados | Tiempo limitado, validación manual Expo Go |
| 2025-11-05 | CI/CD con GitHub Actions + EAS | CI: TypeScript, Lint, Expo Doctor | CD Preview: Android via EAS |
| 2025-11-05 | Single-vendor cart | Regla de negocio explícita |
| 2025-11-05 | Sin pagos reales | Mock only, demo académica |
| 2025-11-05 | Sin notificaciones push reales | Mock only |
| 2025-11-05 | Sin chat real | Etapa 6 (pendiente) |

---

## 7. Decisiones Técnicas Post-Implementación (Correcciones)

| Fecha | Problema | Solución | Archivos |
|-------|----------|----------|----------|
| 2025-11-05 | Expo Router "Too many screens" | Eliminar Stack.Screen redundantes auth/buyer | `_layout.tsx` |
| 2025-11-06 | CI/CD Pipeline con GitHub Actions + EAS | CI: TypeScript, Lint, Expo Doctor | CD Preview: Android via EAS | `.github/workflows/ci.yml`, `.github/workflows/build-android.yml`, `eas.json` |
| 2025-11-05 | Imagen no resuelve `@/assets/...` | Rutas relativas `../../assets/...` | `welcome.tsx`, `index.tsx` |
| 2025-11-05 | Back navigation salta a Welcome | `router.replace` → `router.push` en login/verify | `login.tsx`, `verify-email.tsx` |
| 2025-11-05 | Imagen no carga (Image vs ImageBackground) | `ImageBackground` para hero con overlay | `welcome.tsx` |
| 2025-11-05 | VirtualizedList anidado warning | `nestedScrollEnabled` + quitar `scroll` en FlatList screens | `Screen.tsx`, `category.tsx`, `available-now.tsx` |
| 2025-11-05 | Navegación food: query params → dinámico | `/buyer/food/:id` + `useLocalSearchParams` | `food/[id].tsx`, `index.tsx` |
| 2025-11-05 | Scroll Home no funcionaba | `nestedScrollEnabled` + `scroll` prop en Home | `Screen.tsx`, `index.tsx` |
| 2025-11-05 | Categoría scroll + FlatList horizontal | Quitar `scroll` prop, usar FlatList horizontal | `category.tsx` |
| 2025-11-05 | Disponible ahora: FlatList en ScrollView | Quitar `scroll` prop en Screen | `available-now.tsx` |

---

## 8. Lecciones Aprendidas

1. **Expo Router typedRoutes requiere descubrimiento automático**: No declarar `Stack.Screen` para rutas que existen en el filesystem.
2. **`nestedScrollEnabled` es crítico en iOS/Android**: Permite FlatList dentro de ScrollView sin warnings.
3. **`useLocalSearchParams` es obligatorio para rutas dinámicas**: Type safety y acceso a params.
3. **Rutas relativas para `require()`**: Metro no resuelve alias `@/` en runtime.
4. **`ImageBackground` para overlays**: `Image` no acepta children en RN.
4. **`router.push` vs `replace`**: `push` mantiene historial, `replace` lo reemplaza (solo para logout/reset).
5. **Verificar Figma ANTES de implementar**: Categorías implementadas sin verificar UI-012 real.
6. **Mock data debe ser realista y distribuido**: 3+ items por categoría para demostrar filtrado.

---

## 9. Próximas Decisiones Pendientes

| Tema | Decisión Pendiente | Responsable |
|-------|-------------------|-------------|
| Categorías reales | Confirmar 6 categorías exactas contra UI-012.png | Equipo |
| Recursos Figma categorías | Extraer 6 imágenes individuales de UI-012 | Diseño |
| Recursos Figma alimentos | Extraer 21 imágenes individuales | Diseño |
| Iconos categorías SVG | Exportar 6 iconos de Figma | Diseño |
| Etapas 4-7 | Planificar implementación vendedor/admin/chat | Equipo |

---

## 10. AWS-API-INTEGRATION — 2026-11-11

### Decisiones de integración
- Conservar arquitectura original y único AuthContext. Reemplazar autenticación demo/AsyncStorage por coordinador de sesión AWS; ningún error activa un usuario ficticio. `role` es null sin identidad, no buyer supuesto.
- fetch nativo es suficiente; no Axios. Configuración del origen en .env ignorado, acceso estático solo en api/config.ts. .env.example documenta variable vacía; IP no repetida en servicios/docs.
- Solo GET /health público permite HTTP. Login, registro, JWT, perfil y servicios restantes requieren HTTPS antes de llamar fetch. No cambios nativos globales; redirect:error solicitado, pero su soporte en RN requiere validación física y endpoints backend sin downgrade.
- Tipos de solicitudes según información del equipo; respuestas desconocidas como unknown. sessionContract permanece null deliberadamente: no sabemos dónde está el JWT ni cómo mapear User/roles; login no transmite credenciales hasta confirmar contrato y HTTPS.
- Registro 202 no autentica. Se retira OTP/envío local simulado de verificación y recuperación; relación Supabase-AWS pendiente, sin SDK/endpoints inventados.
- expo-secure-store 58.0.3 instalado con expo install y plugin agregado. Solo JWT, acceso device-only sin biometría obligatoria en Expo Go; errores explícitos sin fallback. Operaciones de storage serializadas y generaciones de sesión evitan resurrección tras logout. Validar auth/me y users/me antes de autenticar; red/timeout no borran automáticamente tokens, 401 de validación sí los invalida.
- @uttgo:users no se lee/reusa/borra automáticamente. La limpieza futura requiere autorización, inspección local sin exponer datos, eliminación dirigida y verificación de otras claves; nunca AsyncStorage.clear(). No se migran contraseñas ni se interpretan usuarios locales como AWS.
- Mantener UI/componentes Figma. Diagnóstico de health dentro de login solo __DEV__. Acción existente Seguir explorando habilitada sin crear sesión; perfil para invitado. Edición visual de perfil bloqueada, servicio PATCH preparado sin inventar formulario.
- PATCH valida listas blancas/null/tipos/texto; faltan límites exactos y formato phone para completar validación funcional. Sin filtros admin adicionales.
- Jest reutilizado; corregir override de transformIgnorePatterns heredado que impedía ESM Expo y añadir tipos explícitos TS6. Tests nunca llaman AWS ni almacenan credenciales reales. CI agrega job/gate tests y Node 24 compatible con SDK58; no ejecución remota aún.

### Evidencia y límites
- GET /health desde desarrollo: 200 JSON reportando API/MongoDB/Redis Healthy (0.376s). HTTPS en el mismo host no conecta a 443 (curl 7), causa AWS exacta no determinada.
- tsc 0 errores; lint 0 errores/69 warnings de archivos existentes fuera de esta integración; Jest 104 tests/7 suites aprobados.
- Doctor 19/20: 10 paquetes existentes requieren parches SDK58. No se oculta fallo ni actualiza masivamente dependencias. Node local25.4 emite advertencias engines; recomendar Node24.
- Metro inicia con caché limpia, .env cargado y espera conexión; prueba acotada/offline sin render ni dispositivo. adb no disponible; Expo Go físico pendiente.
- Cierre bloqueado por HTTPS, JSON real/JWT/roles/errores, límites de campos, contrato Supabase/recuperación y prueba móvil. Estado EN PRUEBAS, no login real completado.

## 11. Alineación controlada de parches SDK58 — 2026-11-11

- Autorizados por el usuario únicamente diez cambios directos: @expo/ui58.0.27→58.0.28, expo58.0.23→58.0.24, expo-constants58.0.15→58.0.16, expo-font58.0.11→58.0.12, expo-linking58.0.16→58.0.17, expo-router58.0.30→58.0.31, expo-splash-screen58.0.13→58.0.14, expo-status-bar58.0.4→58.0.5, expo-symbols58.0.4→58.0.5 y expo-web-browser58.0.7→58.0.8. Aplicados con expo install y rangos ~58.0.x; React19.3.0, RN0.88.1 y SecureStore58.0.3 conservados.
- Se guardó estado inicial de Git, snapshots de manifest/lock como objetos sin commit y huella de los otros130 archivos; revisión final confirma que solo manifest/lock y tres documentos SDD difieren del inicio de esta intervención. No confundir cambios previos de etapa005 con el ajuste de dependencias.
- Mantener el grafo transitivo requerido por versiones Expo aprobadas: lock actualiza41 entradas transitivas y retira getenv, que ya no es referenciado. Algunas internas pasan a58.1.0 (core/autolinking/server) o0.5.0 (modules-cli) por requisitos del paquete, sin cambio de SDK ni versiones React/RN. No usar overrides para forzar internas antiguas. No se eliminó ninguna dependencia directa.
- Expo CLI agregó dos plugins incidentalmente; se retiraron esas adiciones para restablecer app.json inicial, sin tocar el plugin SecureStore ya existente.
- Resultados: compatibilidad al día, Doctor20/20, tsc0errores, lint0errores/69warningsprevios, Jest104/104 en7suites y comprobación focalizada48/48 en2suites (incluidas en las104). Metro arranca con caché limpia/.env; prueba acotada sin teléfono.
- Permanecen advertencias engines por Node25.4 local: recomendar Node24LTS compatible. Sin actualización de Node global, auditoría automática correctiva ni cambios de código de la aplicación. Auth y validación física continúan pendientes; etapa005 EN PRUEBAS.

## 12. Etapa006 — P0/P1 implementados (verificación2026-11-12)

- SDD antes del código: spec/matriz/plan/tasks006. Inventario real63 PNG; corregidas correspondencias UI-007(selector), UI-012(categoría seleccionada), UI-025(comprador)/-1(vendedor), UI-014(vendedor público) y UI-026(edición compartida). No afirmar auditoría visual de las63 ni fidelidad completa sin capturas de ejecución.
- Expo Router: root deja de declarar hijos buyer; buyer posee (tabs), detalles/listados y grupo (private). Los cinco tabs y seis pantallas de pedido se reubican en grupos sin cambiar URLs. Usar anchor público (tabs), API recomendada en SDK58, sin reemplazos indiscriminados.
- Contrato de rutas tipado food/[id] desde Inicio/Buscar/Categoría/Disponible. AppHeader muestra flechas secundarias y usa back o fallback público exclusivamente sin historial. Listener Android delega regreso nativo si existe historial; raíz agotada no se confunde automáticamente con crash. Gesto físico pendiente.
- Diagnóstico __DEV__ sanitizado: navegación, retroceso, historial agotado, ruta desconocida y error de ejecución; sin query/ids reales/error.message. +not-found y ErrorBoundary dan salida al catálogo/reintento. No se atribuye ni da por resuelto el regreso inesperado a login sin reproducción del usuario.
- RequireSession consume el único AuthContext; anonymous/blocked/restoring no montan hijos privados. No hay usuario demo, guardas no envían credenciales ni cambian cliente AWS. Perfil invitado no muestra datos personales. Flujo físico autenticado bloqueado por005.
- Categorías Figma: Tortas1, Comida corrida3, Postres3, Bebidas3, Snacks3, Vegano0. Ocho desayunos/antojitos conservados como no clasificados técnicos y visibles en Todo/Buscar/Disponible. No inventar productos ni dieta vegana, no confundir clasificación antigua del source con export normalizado. Solo categoryId cambia en los21 alimentos; ids/precios/fotos/stock permanecen.
- Inicio sin carrusel añadido; selector en Buscar con chips wrap verificados, UI-012 sin selección duplicada. Filtros/orden/query/categoría en params tipados; dismissTo al origen cierra filtros. Encabezado de búsqueda de tipo estable; no recrear el componente por pulsación.
- Screen usa flex:1 para viewport y flexGrow:1 para contenido scrollable. FlatList única para cada listado; pedidos/avisos ya no se anidan en ScrollView. Sin nestedScrollEnabled como parche. Insets inferiores en tabs a cargo de tab bar.
- P2/P3/P4 expresamente detenidos: tamaños generales/fotos/hero/banner/recientes/filtros avanzados y negocio de pedidos/QR/cancelar/reseñar pendientes. Solo cambios de navegación/guardas/flechas/scroll en las pantallas privadas; CartContext y datos de pedidos intactos.
- Pruebas:147/147 en12suites (104previas+43nuevas), tsc0errores, lint0errores/34warnings, Doctor20/20, diffcheck sin errores. Router real en memoria valida tabs/selección/privacidad/deep links/detalle/back; listener Android y scroll se simulan, no equivalen a teléfono. RNTL14 usa queries públicas/RenderRouterResult, mock SafeArea requiere default y BackHandler0.88 tiene evento tipado; ajustes de tests sin dependencias nuevas.
- Metro compila bundle Android HTTP200,2406 módulos,11637ms; no dispositivo. Huella protegida de28 archivos idéntica:3636d1036ef997841f8dedd076a5dbd7e3bb35af (AWS/AuthContext/SecureStore/CartContext/dependencias/SDD005 sin cambios). Estado EN PRUEBAS, no COMPLETADO.

## 13. Etapa006 — P2/P3 y límites de evidencia (2026-11-12)

- Autorización de continuación registrada antes del código en spec/matriz/plan/tasks006. Usuario reportó7 PASS/1 PENDIENTE físico en P0/P1; sin modelo/versión/fecha exacta, no se extrapola a todos los recorridos ni se cierra el síntoma de login inesperado.
- P2 usa dimensiones reactivas nativas, cálculos puros de columnas y alturas por rol. Se agrupan filas1/2 dentro de una FlatList con identidad estable, en lugar de cambiar numColumns/key y desmontar lista/input; se restaura offset mediante scrollToOffset. Cálculos de16 combinaciones de ancho/fontScale y tests de identidad no son renders físicos. Poppins/paleta y font scaling nativo conservados.
- P3 centraliza fuentes en foodMedia por food.id, no nombres. FoodImage comparte foto entre resoluciones y consumidores; marco reservado, cover/foco, recyclingKey y remount por identidad de producto/foto/resolución para reiniciar errores. Pendiente/error produce icono neutro, nunca otra comida. Tipos globales FoodItem intactos; se retiró solamente image legacy del mock, conservando datos comerciales/categorías de P1.
-10 productos tienen foto:8 alternativas Pexels y2 recortes temporales de Figma.11 siguen pendientes.22 archivos JPEG incluyen tamaños/hero/banner y pesan1241641bytes; preparación con jimp-compact existente, sin nueva dependencia. Originales no modificados. Manifiesto y hashes en specs006; permisos externos de capturas Figma no se inventan, exports individuales pendientes.
- Bienvenida usa solo la pieza promocional recortada de UI-002; titular, descripción, beneficios e iniciar/registrar/explorar son componentes nativos reales. El artwork conserva su teléfono/texto ilustrados como en Figma, no controles de pantalla falsos. Banner UI-012 solo en Tortas. Calidad limitada de recortes explícita.
- Verificaciones: checkpoint P2=167tests/14suites antes de P3; final=178/178,15suites, tsc0errores, lint0errores/30warnings, diffcheck limpio; bundle Android HTTP200/1402módulos/13543ms con proceso terminado, sin teléfono. Doctor **19/20** por recomendación nueva de Expo58.0.25; instalado58.0.24 permanece intacto. No ocultar este resultado con el20/20 histórico.
- Huella protegida41 archivos idéntica `e110daf4583f61239b177a0f3d373ee8b0058d6e`: AWS/contextos/rutas/clasificación/dependencias/SDD005 conservados. No pruebas de AWS ni sesión real nuevas; privados solo presentación/medios. P4 diferido. Etapa006 EN PRUEBAS hasta evidencia física,11 fotos y pendientes documentados; no commits/pushes.

## 14. Publicación autorizada y parche adicional Expo (2026-11-12)
- Usuario solicita subir el trabajo acumulado005/006 a HRDCORE; confirma explícitamente actualizar solo Expo58.0.24→58.0.25 y lock para que Doctor vuelva a pasar. Mantener SDK58 y las otras dependencias, sin modificación del negocio P4 ni contratos AWS.
- Diff contra snapshots confirma solo versión/rango/resolved/integrity de Expo; sin cambios transitivos adicionales. Huella37 archivos protegidos excluyendo manifest/lock/SDD005:34da1bb65f37b94cb59fa367ee96e0c589d34744 intacta.
- Checks repetidos:178tests/15suites, tsc0errores, lint0errores/30warnings, Doctor20/20; Metro Android HTTP200/1402módulos/12564ms. No convertir esta verificación en prueba física ni cierre de005/006. CI anterior remoto success; CI del nuevo commit se comprobará tras publicar.

## 15. Etapa005 — HTTPS verificable y registro sin sesión implícita (2026-11-12)
- Se inspeccionó .env antes de editar: ya usaba https://3.129.142.54.nip.io, sin .env.local/variantes ni override de shell. No afirmar que se cambió una IPHTTP que no estaba en el archivo de esta sesión. .env.example ahora incluye el origen confirmado; config.ts sigue como única lectura estática runtime. Expo tres modos y bundle src/app confirman HTTPS sin IPHTTP antigua; bundle previo del teléfono aún necesita reinicio y prueba física.
- HealthHTTPS200 y TLS válido desde PC con Node/curl sin bypass: Let's Encrypt YE1, CN/SAN coincidente, TLSv1.3, validez hasta2027-02-10UTC. HEAD/OPTIONSregistro405 y GET/me401 sin Location; POST real no probado. No extrapolar esos métodos a toda la configuración de redirects del backend. OpenAPI anuncia serversHTTP: corregir con backend, no usarlo para configurar la app.
- El contrato actual RegisterRequest confirma email/password/displayName, respuesta200 sin esquema. Se acepta200/202 conservando ambos como transporte, sin JWT/setUser ni inferir MongoDB, envío/verificación de correo o flujo Supabase. Login mantiene sessionContractnull. Cuerpo, dominio institucional y seguridadHTTP intactos.
- Diagnósticos __DEV__ [aws-register] proyectan solo etapas/método/ruta/origen/status/clasificación fija y timestampUTC. Capturan inicio real de fetch y status antes de parsear la respuesta; no logging de entradas/headers/cuerpos/error crudo. Formulario y callbacks de navegación sin cambios funcionales.
- Pruebas completas193/193/17suites y focalizadas80/80/6suites con fetch/storage simulados; tsc0errores, lint0errores/30warnings, Doctor20/20. Bundle real root src/app HTTP200/2414módulos/15887ms y origen validado. No cuentas ni contraseñas reales, no ExpoGo físico ni commits/pushes. Procedimiento de registro manual y evidencia en SDD005, etapa006 intacta.

## 16. Etapa005 — OTP Supabase con autoridad AWS conservada
- El equipo confirma AWS como único creador de identidad Supabase+perfil MongoDB Buyer/PendingEmailVerification. Expo solo verifyOtp email y resend signup. No doble registro ni signInWithOtp; no contraseña nueva fuera de la operación AWS.
- Se instala SDK2.119.0/polyfillURL4.0.0 sin otras actualizaciones. Cliente reutilizable como fachada, instanciación SDK por operación, persistencia/refresh/URL detection/debug desactivados. Como persistSessionfalse aún guarda sesión en memoria interna del SDK, se espera initialize y se hace dispose para liberar recursos/referencias sin logout remoto; no retorna tokens ni llama al storage AWS.
- Estado de confirmación efímero separado de AuthContext: correo del registro aceptado, nunca de URL, ventana local30min independiente de expiración Supabase, id contra respuestas tardías y lock compartido. Cooldown local60s con deadlines y Retry-After; no cuota de proyecto inventada ni retries automáticos. OTP en estado de pantalla, se limpia tras intento/confirmación y no se persiste.
- Pantalla auth conserva estructura/componentes/tema del Figma existente, incorpora acciones reales OTP/reenvío/continuarlogin y accesibilidad. Mapeo de errores por códigos fijos, otp_expired no se presenta como una distinción perfecta entre inválido y vencido. No sesión AWS ni Active inferidos.
- Verificación244/244/21suites,193anteriores+51nuevos; tsc0errores, lint0errores/30warnings previos, Doctor20/20 y bundle Android HTTP200/2469módulos/16335ms.77 archivos protegidos con huella d2b637eb2c7d3aebd9777e18126d08a14d7c5d65 intacta; 006/AuthContext/SecureStore/sessionContract no modificados.
- Variables públicas Supabase aún vacías, SMTP y entorno autorizado pendientes. No prueba real de envío/OTP/ExpoGo ni de MongoDB Active. Backend debe definir transición Active y entregar JSON de login; no webhook/endpoints/claims inventados. SDD005 actualizado, sin commits/pushes.

## 17. Etapa005 — login confirmado y capacidades de restauración separadas
- URL Supabase https://tabhbylbhewtehvirexn.supabase.co configurada, AWSHTTPS intacto. Clave publishable a cargo del usuario en .env; se verificó únicamente presencia/formato booleanos (vacía), sin copiar valores ni introducir claves de servidor. SDK/pantalla OTP existentes reutilizados y dependencias sin cambios.
- Contrato del login aportado por equipo habilita parser de accessToken/expiresIn/Bearer y user.id/Buyer/Active. Se valida todo antes de guardar solo token en SecureStore. No firma/verificación por secretos en Expo, no claims locales como autoridad. expiresIn validado; no refresh inventado.
- User de presentación mínimo: id MongoDB y Buyer desde la respuesta, correo normalizado del formulario, fullName vacío porque no está en el DTO. Sin nombres ni perfiles demo. Otros roles/combinaciones necesitan confirmación explícita.
- La identidad validada del login permite iniciar sesión sin suponer esquemas extra. Restauración/perfil requieren decodificadores /auth/me y /users/me independientes: OpenAPI no los describe; permanecen null y fallan cerrado sin eliminar token por ese motivo. AuthContext/SecureStore conservados. No persistir un perfil supuesto para eludir ese bloqueo.
- Sincronización lazy: AWS comprueba Supabase y pasa el perfil vinculado a Active durante login. Expo solo exige Active en el DTO, no modifica MongoDB ni usa JWT Supabase como token AWS. SMTP/prueba real siguen pendientes.
- Verificaciones290/290/23suites,69focalizadas/4suites, tsc0errores, lint0errores/30warnings, Doctor20/20, diffcheck limpio; MetroAndroidHTTP200/2469módulos/16011ms.81 protegidos mantienen huella b49d9050ef82167766813a3fff187582e58ad980. Sin cambios006, nuevas dependencias ni commits/pushes. Manual y limitaciones vigentes en SDD005 sección9.

## 18. Etapa005 — configuración local cargada, sin prueba de correo
- El usuario aportó la publishable key al .env. Se verificaron únicamente booleanos: URL esperada, clave presente/formato válido, AWSHTTPS conservado y sin overrides heredados/locales. No se leyó como contenido ni imprimió/copió el valor de la clave; .env permanece sin edición por el agente.
- Test opt-in recibe en memoria el entorno cargado por @expo/env development y ejecuta Jest en test. SDK real con opciones existentes inicializa/dispose, con todo fetch bloqueado y cero intentos/cero logging. El primer runner con NODE_ENVdevelopment agotó timeout de pantalla; se corrigió el modo de Jest, no implementación ni timeout.
- Pantalla con contexto sintético exclusivo de tests muestra OTP editable/verificar habilitado, sin aviso de configuración. Sin contexto conserva su guarda; reenvío respeta cooldown sin pulsarse. No cuenta ficticia en runtime, token nuevo, correo enviado ni prueba física. Una inicialización sin red no acredita validez remota de la clave.
-293/293pruebas/24suites, más ejecución opt-in3/3, tsc0errores, lint0errores/30warnings, Doctor20/20 y bundleAndroidHTTP200/2469módulos/17845ms con variables insertadas comprobadas por booleanos.127 archivos productivos/configuración/006 mantienen huella bd6623e723e247dbcb8af31980b0ce7c77e48156. No cambios de lógica/contratos, dependencias, AuthContext o SecureStore.
- Siguen pendientes SMTP/entrega física, login real/lazy sync y contratos /auth/me y /users/me para restauración/perfil. No afirmar autenticación terminada. SDD005 sección10 contiene manual seguro ExpoGo; sin commits/pushes.

## 19. Etapa005 — identidad/perfil definitivos y restauración (2026-11-13)
- Contratos /auth/me y /users/me recibidos del compañero backend, junto con reporte SMTP Gmail/plantilla Token. Lo segundo es evidencia declarada, no recepción real observada desde Expo Go. Nuevos DTOs/parsers validan Buyer/Active y coherencia MongoDB id/email entre respuestas; roles desconocidos no otorgan permisos. Null de phone/avatar se conserva, autorización viene de identidad y datos editables del perfil.
- Coordinador existente ahora valida ambos /me para login y restauración antes de montar User/guardar el JWT de login. Se preservan SecureStore/HTTPS y el único AuthContext. Generaciones de sesión más revisión de perfil impiden respuestas viejas/401 tardíos; validaciones en curso o fallidas ocultan datos protegidos.401 definitivo limpia token, errores temporales no lo borran. Sin refresh supuesto.
- Perfil se hidrata desde el coordinador, sin refrescar por montaje que provocaría bucle al pasar por restoring. Solo cambios de binding nullable y texto de edición pendiente; estilos y rutas006 intactos. No datos ficticios ni cambios a negocio/compras.
- Handoff OTP→login amplía el store efímero existente con correo verificado de5min; no URL/password ni sesión Supabase en AWS. Lectura no destructiva durante render y limpieza al montar soportan StrictMode; logout/nuevo registro limpian hint. Router real comprueba login anterior→registro fixture→OTP fixture→login nuevo con correo correcto y contraseña vacía. Lazy sync sigue exclusivamente en backend.
-337/337pruebas/26suites (293previas+44nuevas),122focalizadas/6suites, Router1/1, configuración SDK real local3/3 sin red; tsc0errores, lint0errores/30warnings, Doctor20/20, diffcheck limpio y MetroAndroidHTTP200/2469módulos/12253ms. Base97 protegidos c65a49324aa5c17d44a1b11490ab7e1365b3d9fb preservada. Pruebas antiguas de bloqueo /me adaptadas al contrato recibido, sin eliminar suites.
- No operaciones reales de cuentas/correos/login, ni claves/tokens impresos. Recorrido físico/manual pendiente; no marcar005 COMPLETADA. Sección11 SDD contiene guía Registro→OTP→Login/lazy Active→Perfil→restauración con sesión→Logout→reinicio invitado. Sin nuevas dependencias, commits o pushes.

## 20. Registro→Login y preparación Play: navegación no es autenticación
- Pedido posterior adapta Beta a login directo con recibo pendiente/correo en memoria y contraseña vacía; conserva OTPfalse y acceso opcional. preparePendingLogin no marca verified ni cambia Active. Contrato actual exige titularidad verificada; backend debe aprobar enlace/SSO sin pantalla OTP antes de flujo público. No auto-login ni claim local para eludirlo.
- Política frontend nueva documentada: nombre Unicode2–100 con normalizaciónNFC/espacios y rechazo de controles, email exacto y límites254/64, password sin transformación/símbolos permitidos, recomendación12 y techo local4096. No afirmar política Supabase ni protección Mongo/SQL desde estos validadores. Backend debe alinear límites, ratelimit/enumeración/idempotencia y rotar secreto de firma expuesto sin compartirlo con móvil.
- Se restituye testskip de doble envío y timeout real del transporte; RNTL14 espera promesas de onPress, por eso el fetch diferido se arranca sin bloquear y se resuelve dentro de act. Sin timeout ampliado, saltos de casos o cambios en timeout productivo para pasar tests.
- Play es auditoría, no publicación. target36 en RN instalado no sustituye manifest final, producción bloquea3 permisos innecesarios y flagBetafalse; faltan privacidad pública/eliminación app+web/Data safety/firma/EAS y desplazar funciones mock antes de listing honesto. npm audit28/omitdev21, sin altos/críticos pero con remediación compatible pendiente; no fixforce.
- Checks405pruebas/28suites sin skipped, tsc0, lint0errores/30warnings, Doctor20/20 y diffcheck limpio. Trabajo005 acumulado relacionado se prepara para commit local explícitamente autorizado sin .env ni artefactos; sin push/merge/release. Excepción de commit técnico con prueba física aún pendiente registrada por instrucción actual, nunca cierre de005.

## 21. Etapa007 — vendedor sin contratos de respuesta supuestos
- Servicios de vendedor005 preexistían, pantallas no. Se abre007, no004 (CI/CD) ni duplicación005/006. Referencias UI027/028/030/035/036 inspeccionadas; UI028 activado no se presenta al aceptar solicitud. Teléfono/imagen negocio sin campo API permanecen no editables.
- Único coordinador/sessionContext extendido solo para solicitud/consulta: JWT privado, statusHTTP proyectado, cuerpo unknown descartado para UI. No otro SecureStore/clientauth. Locks y aceptación/resultadoincierto por sesión evitan doble envío/retries; logout/generación impide aplicar respuesta vieja.401 limpia con política,403 no cambia rol.
- HTTP200/201 no demuestra autorización; GETme sin enum/DTO no fabrica pending/approved/rejected/suspended. Buyer sigue único rol confirmado del contrato005; Seller necesita DTO ampliado y permisos server-side. Edición negocio/CRUD productos se bloquean en vez de inventar schemas/endpoints. ConsultaOpenAPI actual ECONNRESET, sin bypass ni nueva evidencia del servidor.
- Productos preparados solo como UI/preview efímero y validadores locales, no requestDTO AWS: precio2decimales→centavos exactos, imágenes5MB/6000px por metadata (no contenido binario), categorías vacías hastaAPI. No picker/upload/publicación/retirada real ni sustitución del catálogo21mocks; no afirmar publicación conectada.
-449/449tests/31suites,405previos+44nuevos; tsc0errores, lint0errores/30warnings, Doctor20/20, diffcheck limpio y bundleAndroidHTTP200/2477módulos. No prueba física, cuentas/altas reales automáticas, nuevas dependencias ni push/build. Commit local seguro solicitado, autorización no equivale cierre funcional. SDD007 EN PRUEBAS parcial y handoffbackend identifica exactamente lo faltante.

## 22. P0 comercial por contratos completos, sin productos adivinados
- POSTseller201/GETme ActiveDTO recibidos; roles exactosBuyer oBuyer+Seller. Se deja atrás el supuesto de aprobaciónadministrativa en estecontrato. Revalidación /me usaJWTactual, no tokennuevo desde el DTOnegocio. Rol enContext solo desde identidad/perfil confirmados; siJWTviejo no confirmaSeller, usuario debe ir al login explícito.
- Categorías reales paginadas con idsserver y vacío honesto; AWS por defecto en comprador y siempre en vendedor. Mocksolo flagdesarrollo, nunca fallbackdeerror ni fuenteproductiva. Categorías Figma no se convierten en idsAWS; styles/rutas anteriores quedan reutilizables en la maqueta explícita.
- OpenAPI cambió: publica productos/categorías/pedidos, pero responses sin schema y PATCHJsonElement/sortBystring no son contratoscompletos. GETpúblicoscategories/products devolvieron vacío; no extraerDTOdeitems inexistentes. Se preguntó al usuario y autorizó completarvendedor/categorías y prepararcapa producto sin publicar.
- Producto requestexacto preparado con precioMXN/stock0/ingredientes/categoríaAWS sinimagen; Paused único valor conocido. Create/update/pause bloqueados antesdefetch hasta responsedecoder/whitelist. GETvacío es validable, no vacío o detalle exigenDTO y no se renderizancomomock; placeholderneutro sin fotofood-id. No privatelistsellerId ni endpointsinventados, media/pedidospendientes.
-491/491pruebas/33suites, tsc0errores, lint0errores/30warnings, Doctor20/20,diffcheck limpio. Cambios de expectativa históricos200solicitud/contractPending se ajustaron al201Activeconfirmado, no se quitaron suites. Un fallo inicial de efectoReact/importorder y cast de test se corrigió antesdechecksfinales; ninguna regresiónpendiente. Sin operacionesmutantesautomáticas, secretos/logs,nuevasdependencias ni cambiosOTP/loginUI/storage. Commitlocalseguro solicitado; evidenciafísica Crear→Consultar→Mostrar aún bloqueada porDTOfaltantes.

**Última actualización**: 2026-11-13
**Versión**: 1.4
**Autor**: Equipo UTTT-Go Móvil
