# Memoria — UTTT-Go Móvil

## Decisión CI/CD vigente

La fase `004-ci-cd` concentra la preparación de calidad, seguridad y release. Node se fija en 22.13.1. La URL API se obtiene de entorno; no se hardcodea el Backend HTTP ni se debilita la seguridad Android para Production. El cliente API interpreta el contrato `ApiError` centralmente, pero las pantallas continúan usando mocks hasta que exista contrato funcional aprobado.

## Fase 005: demo y onboarding

El demo invitado vive en `src/data/demo` y no utiliza el cliente API. Login y registro
usan únicamente los contratos autorizados; el JWT se guarda en `expo-secure-store`.
La pantalla de confirmación explica el enlace de Supabase y no presenta token, OTP ni
reenvío simulado. El icono y splash usan assets UTTT-GO rojos; Production sigue bloqueada
por `BLOCKED_BY_BACKEND_HTTPS` mientras el Backend no exponga HTTPS.

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

**Última actualización**: 2025-11-05
**Versión**: 1.0
**Autor**: Equipo UTTT-Go Móvil
