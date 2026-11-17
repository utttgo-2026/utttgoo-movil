# Constitution — UTTT-Go Móvil

> Documento base que establece los principios arquitectónicos, de diseño, datos, calidad y metodología SDD del proyecto móvil UTTT-Go.

---

## 1. Arquitectura

### Stack Tecnológico
- **Framework**: React Native con Expo (SDK 58+)
- **Lenguaje**: TypeScript (strict mode)
- **Navegación**: Expo Router (file-based routing, typed routes)
- **Estado**: React Context API (AuthContext, CartContext)
- **Estilos**: StyleSheet + Theme system (colores, tipografía, espaciado, sombras, radios)
- **Tipografía**: Poppins (via @expo-google-fonts/poppins)
- **Iconos**: @expo/vector-icons (Ionicons)
- **Sesión**: expo-secure-store para JWT; AsyncStorage legacy se conserva sin autoridad de autenticación (Etapa 005).
- **Ejecución**: Expo Go (Android) — sin development builds

### Patrones Arquitectónicos
- **File-based routing**: Expo Router (src/app)
- **Componentes reutilizables**: src/components/ui (14 componentes base)
- **Context API**: Estado global (AuthContext, CartContext)
- **Servicios mock**: src/services/mockApi.ts (simulación de latencia)
- **Tipos compartidos**: src/types/models.ts (FoodItem, Order, User, etc.)
- **Tema centralizado**: src/theme (colores, espaciado, tipografía, sombras, radios)
- **Hooks personalizados**: src/hooks (useResponsive, useAuth, useCart)
- **Navegación tipada**: src/navigation/routes.ts
- **Datos mock**: src/data/mock (users, categories, foods, orders, notifications)

### Separación de Responsabilidades
| Capa | Responsabilidad | Ubicación |
|------|-----------------|-----------|
| UI | Pantallas, componentes, estilos | src/app, src/components/ui |
| Estado | AuthContext, CartContext | src/context |
| Navegación | Rutas, navegación tipada | src/app, src/navigation |
| Datos | Mock data, tipos | src/data/mock, src/types |
| Tema | Colores, espaciado, tipografía | src/theme |
| Utilidades | Formateo, helpers | src/utils |
| Hooks | Lógica reutilizable | src/hooks |

---

## 2. Diseño

### Principios de Diseño
1. **Figma como fuente única de verdad**: Todas las decisiones visuales se basan en los diseños de Figma exportados en `UTTT-Go/`.
2. **Fidelidad visual**: Replicar pantallas originales — colores, tipografías, tamaños, espaciados, alineaciones, bordes, sombras, radios, iconos, imágenes, distribución.
3. **Recursos originales**: Usar recursos exportados de Figma (imágenes, iconos) cuando existan. No sustituir por versiones genéricas, emojis o placeholders si existe el recurso original.
3. **Componentes reales**: Reconstruir cada interfaz con componentes nativos de React Native (View, Text, Pressable, FlatList, Image, etc.). No usar capturas completas como fondos.
4. **Responsive**: Adaptación a diferentes anchos de pantalla usando `useWindowDimensions` y utilidades de escalado (`moderateScale`, `verticalScale`, `wp`, `hp`).
4. **Safe Areas**: Respeto de áreas seguras (notches, barras de sistema) via `react-native-safe-area-context`.

### Recursos Gráficos
- **Carpeta origen**: `../UTTT-Go/` (63 PNG inventariados; correspondencias verificadas en Etapa006)
- **Carpeta destino**: `src/assets/images/` (recursos copiados para uso en runtime)
- **Naming**: Mantener nombres descriptivos basados en ID Figma (ej: `welcome-hero.png` de UI-002)
- **No modificar originales**: Nunca modificar ni eliminar archivos en `UTTT-Go/`.

### Tipografía
- **Familia**: Poppins (400, 500, 600, 700) via `@expo-google-fonts/poppins`
- **Escalas**: `fontSize` (xxs..hero), `lineHeight` correspondientes
- **Pesos**: regular, medium, semibold, bold

### Colores (Palette Oficial)
| Token | Hex | Uso |
|-------|-----|-----|
| `primary` | `#D2030F` | Botones primarios, acentos, marca |
| `primaryDark` | `#A8020C` | Estados pressed |
| `primarySoft` | `#FFF0F0` | Fondos sutiles, badges |
| `text` | `#251E1A` | Texto principal |
| `textMuted` | `#766B64` | Texto secundario |
| `textSubtle` | `#928E8C` | Texto terciario |
| `background` | `#FFFFFF` | Fondo principal |
| `surface` | `#FFFFFF` | Tarjetas, superficies |
| `surfaceMuted` | `#F5F5F5` | Fondos secundarios |
| `border` | `#E6E0DC` | Bordes, divisores |
| `success` | `#008522` | Estados éxito |
| `warning` | `#C77700` | Advertencias |
| `danger` | `#D2030F` | Errores, acciones destructivas |
| `info` | `#2F6F7E` | Informativo |

---

## 3. Datos

### Estado Actual: Mock Local
- **Fuente**: `src/data/mock/` (archivos TypeScript)
- **Tipado**: `src/types/models.ts` (FoodItem, Order, User, Category, etc.)
- **Persistencia**: JWT en SecureStore; registros legacy AsyncStorage conservados, no leídos ni borrados automáticamente para autenticar.
- **Backend**: Etapa 005 en desarrollo: /health público verificado desde desarrollo; auth/perfiles bloqueados por HTTPS y contratos JSON.

### Separación Datos/UI
- **Mock data**: `src/data/mock/*.ts` (arrays tipados, funciones de búsqueda)
- **Componentes**: Consumen datos via imports directos o Context
- **Servicios**: `src/services/mockApi.ts` (simulación de latencia `delay()`)

### Categorías (Regla Crítica)
- **Fuente**: Figma UI-012 Categoría.png (verificar contra imagen real)
- **No inventar**: Usar exactamente las categorías que aparecen en Figma
- **Imágenes**: Usar recursos exportados de Figma cuando existan; si no, placeholder Unsplash como temporal
- **Iconos**: Usar recursos de Figma si existen; Ionicons como fallback
- **Funcionalidad**: Filtrado real por `categoryId` en mock data

### Productos Mock (Regla)
- Contadores reales y estado vacío sin productos compatibles; no inventar 3 items por categoría (autorización Etapa006).
- Campos obligatorios: id, sellerId, categoryId, name, description, price, image, rating, reviewCount, prepTimeMinutes, stock, availability, tags, isFavorite
- Distribución equilibrada entre categorías reales de Figma
- Precios, descripciones, tags coherentes con temática universitaria (UTTT)

---

## 4. Calidad

### TypeScript
- **Strict mode**: Activado (`tsconfig.json` extends `expo/tsconfig.base`)
- **Tipado estricto**: Sin `any` innecesario, tipado estricto en props, state, hooks
- **Validación**: `npx tsc --noEmit` obligatorio antes de cualquier commit

### Validaciones de Código
- **Lint**: `npx expo lint` (configuración Expo)
- **TypeScript**: `npx tsc --noEmit` (zero errors obligatorio)
- **Expo Doctor**: `npx expo-doctor` para compatibilidad Expo Go

### Navegación
- **Expo Router**: Typed routes (`experiments.typedRoutes: true`)
- **Navegación (006)**: push para avanzar, back para regresar; replace de fallback solo sin historial o cierre explícito documentado. Nunca login como fallback genérico.
- **Rutas dinámicas**: Segmentos `[id]` + `useLocalSearchParams`
- **Ownership (006)**: un propietario por pantalla; root/buyer/tabs/grupos declaran hijos de su nivel, sin duplicarlos en root.

### VirtualizedList / FlatList
- **Nunca anidar FlatList en ScrollView** con misma orientación
- **Solución**: `Screen` con `nestedScrollEnabled={true}` + `scroll` prop solo cuando sea necesario
- **FlatList horizontal**: Dentro de View (no ScrollView)
- **FlatList vertical (grid)**: `numColumns={2}` dentro de Screen sin scroll padre

### Funcionalidad Real
- **No pantallas estáticas**: Botones, formularios, listas, filtros deben funcionar
- **Datos mock**: Simular latencia (`delay`), respuestas realistas
- **Persistencia**: sesión real en SecureStore, validada remotamente; sin usuarios ficticios ni contraseñas persistidas.
- **Carrito**: Single-vendor (un vendedor por pedido, regla de negocio)

---

## 5. Metodología SDD (Specification-Driven Development)

### Flujo Obligatorio
```text
Figma
  ↓
ANALISIS_FIGMA.md          (Inventario visual)
  ↓
CONSTITUTION.md            (Principios)
  ↓
SPECIFICATION (specs/)     (Qué se construye y por qué)
  ↓
PLAN (plans/)              (Cómo se implementa)
  ↓
TASKS / AGENDA (tasks/)    (Tareas granulares, estado real)
  ↓
IMPLEMENTACIÓN             (Código siguiendo spec + plan)
  ↓
TEST / VERIFICACIÓN        (tsc, expo start, Expo Go)
  ↓
MEMORIA / CHANGELOG        (Decisiones, historial)
  ↓
SIGUIENTE ITERACIÓN
```

### Documentos SDD Obligatorios
| Nivel | Carpeta | Contenido |
|-------|---------|-----------|
| Constitution | Raíz | `CONSTITUTION.md` (este archivo) |
| Specifications | `specs/XXX-nombre/` | `spec.md`, `plan.md`, `tasks.md` |
| Plans | `plans/` | Planes maestros por etapa |
| Tasks | `tasks/` | Agendas por etapa |
| Memory | Raíz | `memoria.md` (decisiones) |
| Changelog | Raíz | `SDD_CHANGELOG.md` (historial) |
| Agents | Raíz | `AGENTS.md` (instrucciones para agentes) |
| README | Raíz | `README.md` (documentación usuario) |

### Estados de Tareas (Obligatorios)
| Estado | Significado |
|--------|-------------|
| `COMPLETADO` | Implementado, verificado, tsc OK, probado en Expo Go |
| `EN DESARROLLO` | En curso, código escrito, pendiente verificación |
| `EN PRUEBAS` | Código completo, en verificación manual/Expo Go |
| `PENDIENTE` | No iniciado, dependencias resueltas |
| `NO IMPLEMENTADO` | Fuera de alcance actual |

**Regla**: No marcar `COMPLETADO` sin `npx tsc --noEmit` limpio + prueba en Expo Go.

---

## 5. Alcance Actual

### En Desarrollo (Etapa 3 - Comprador)
- ✅ 16 pantallas implementadas (UI-006 a UI-025)
- ✅ Navegación, filtrado, carrito, pedidos, perfil
- ✅ Mock data coherente (21 alimentos, 6 categorías)
- ⚠️ **Pendiente**: Verificar categorías contra Figma UI-012 real
- ⚠️ **Pendiente**: Imágenes de categorías desde Figma (no placeholders)

### Próximas Etapas (Fuera de Alcance Actual)
| Etapa | Pantallas | Estado |
|-------|-----------|--------|
| 4. Vendedor | UI-029, 035-039, 014, 027, 028 | PENDIENTE |
| 5. Administrador | UI-041, 042, 043, 044 | PENDIENTE |
| 6. Chat/Estados | Chat, 10 estados | PENDIENTE |
| 7. Revisión visual | Comparación Figma | PENDIENTE |

### Fuera de Alcance (No Implementar Ahora)
- Productos/categorías/pedidos reales y flujo Supabase sin contrato (la preparación AWS auth/perfiles se autoriza en Etapa 005)
- Pagos reales, notificaciones push, chat real
- Funcionalidades administrativas
- Publicación de producción (CI y tests unitarios ya disponibles; ver Etapas 004 y 005)

---

## 6. Reglas de Oro (Inmutables)

1. **Figma manda**: Si Figma dice X, el código hace X. No "mejoras" sin validar.
2. **No commits sin tsc limpio**: `npx tsc --noEmit` = 0 errors.
3. **No push sin revisión local**: Verificar en Expo Go antes de push.
3. **Documentación = Código**: Si el código cambia, la docs cambia. Si la docs dice X, el código hace X.
4. **Mock ≠ Inventado**: Datos mock deben ser realistas, coherentes con Figma y la temática UTTT.
5. **Single-vendor cart**: Una compra = un vendedor. Sin excepciones.
6. **Recursos Figma primero**: Si existe en Figma, úsalo. Si no, placeholder documentado.
5. **SDD vivo**: Documentation = Código. Si el código cambia, la docs cambia en el mismo commit (local).
6. **No push sin autorización**: Solo cambios locales hasta revisión explícita.

---

## Etapa 005 — AWS-API-INTEGRATION (2026-11-11)

- Conservar Context API, Expo Router, componentes Figma y mocks de catálogo/carrito/pedidos.
- URL solo en .env, lectura centralizada con `process.env.EXPO_PUBLIC_API_BASE_URL`; nunca secretos en EXPO_PUBLIC_*.
- HTTP permitido únicamente para GET /health público sin datos/credenciales. Login, registro, JWT y demás datos requieren HTTPS; no desactivar ATS/cleartext globalmente.
- Respuestas externas desconocidas se tratan como unknown; adaptadores de sesión bloqueados hasta contrato verificado. Registro 202 no autentica; no inventar OTP ni relación Supabase-AWS.
- Único AuthContext, sin signInAs/fallback demo. Restaurar token no basta para autenticar: validar identidad y perfil remotamente. SecureStore no usa fallback AsyncStorage.
- No guardar contraseñas. Conservar @uttgo:users sin leer/reusar/borrar automáticamente; limpieza dirigida futura requiere estrategia documentada y validada, nunca clear().
- No declarar integración completada sin HTTPS, contratos JSON, tsc y pruebas reales Expo Go; tests con mocks no son evidencia AWS.

## Etapa006 — P0/P1 (2026-11-12)
- Navegación principal verificada: Inicio/Buscar/Pedidos/Avisos/Perfil. Invitado explora público, no monta información personal.
- UI-007 contiene selector; UI-012 es categoría seleccionada. Seis categorías Figma con contadores reales; conservar21 productos y no forzar clasificación o dietas no verificadas.
- Scroll vertical único y viewport acotado; nestedScrollEnabled no soluciona anidamiento inválido.
- Cambios privados solo de navegación/guarda/scroll. AuthContext/AWS/SecureStore/pedidos/QR como negocio permanecen fuera de P0/P1.
- P2/P3/P4 diferidos; no afirmar arreglado un cierre no reproducido ni verificación de dispositivo a partir de Jest/bundle.

**Versión**: 1.2
**Fecha**: 2026-11-12
**Autor**: Equipo UTTT-Go Móvil
**Basado en**: Inventario real63 PNG, SDD_CHANGELOG.md, ANALISIS_FIGMA.md, MAPA_NAVEGACION.md
