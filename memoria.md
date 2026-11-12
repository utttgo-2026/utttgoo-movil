# Memoria — UTTT-Go Móvil

> Registro de decisiones arquitectónicas, de diseño, de navegación, de datos mock y de alcance del proyecto UTTT-Go Móvil.

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

**Última actualización**: 2026-11-12
**Versión**: 1.4
**Autor**: Equipo UTTT-Go Móvil
