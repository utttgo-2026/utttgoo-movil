# UTTT-GO Móvil

Aplicación móvil del proyecto **UTTT-Go**, una plataforma orientada a facilitar la compra y venta de alimentos dentro de la comunidad de la Universidad Tecnológica de Tula-Tepeji (UTTT).

## Estado actualizado — AWS-API-INTEGRATION (Etapa 005)

La infraestructura de API y sesión segura está implementada y en validación. La autenticación simulada descrita más abajo corresponde al historial anterior: ya no se usa para iniciar sesión. Login real permanece bloqueado por HTTPS y el contrato JSON de identidad/JWT; el registro 202 no inicia sesión. Catálogo y pedidos continúan con mocks. Acceso al catálogo mediante **Seguir explorando** sin crear usuario ficticio.

- `.env` local (ignorado por Git): `EXPO_PUBLIC_API_BASE_URL` con el origen proporcionado por backend. `.env.example` documenta la variable sin repetir la IP. Al clonar, copiar el ejemplo y completar el origen; recargar Expo Go tras cambiarlo.
- Solo `GET /health` público permite HTTP. No introducir credenciales reales mientras falte HTTPS.
- En desarrollo: Login → **Comprobar conexión** consulta el health desde el dispositivo sin token. Ver tareas 005 para evidencia y bloqueos.
- JWT preparado en SecureStore; datos legacy `@uttgo:users` conservados sin leerlos para autenticar ni borrarlos automáticamente.
- Ver [spec](specs/005-aws-api-integration/spec.md), [plan](plans/005-aws-api-integration-plan.md) y [tareas/evidencia](tasks/005-aws-api-integration-tasks.md).
- Entorno recomendado: Node 24 LTS; CI añade Jest al gate. La ejecución local actual con Node 25 produjo advertencias de engines.

## 1. Descripción del proyecto

UTTT-Go Móvil es el cliente móvil de la plataforma UTTT-Go. Su propósito es ofrecer una interfaz para que estudiantes, docentes y vendedores puedan interactuar con los servicios de la plataforma desde dispositivos Android.

La aplicación se está desarrollando tomando como referencia los diseños de interfaz elaborados en Figma.

## 2. Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| React Native | Desarrollo de interfaces móviles |
| Expo | Entorno de desarrollo y ejecución |
| TypeScript | Tipado estático |
| Expo Router | Navegación entre pantallas |
| React Context API | Administración de estados compartidos |
| Expo Go | Pruebas en dispositivos Android |
| Poppins | Tipografía de la interfaz |

## 3. Arquitectura del proyecto

El proyecto utiliza una estructura modular para separar las pantallas, componentes, navegación, estilos y servicios.

```text
MovilGo/
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── (auth)/
│   │   │   ├── welcome.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   └── verify-email.tsx
│   │   └── buyer/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       ├── search.tsx
│   │   │   ├── filters.tsx
│   │   │   ├── available-now.tsx
│   │   │   ├── category.tsx
│   │       ├── food/
│   │       │   └── [id].tsx
│   │       ├── order-data.tsx
│   │       ├── confirm-order.tsx
│   │       ├── order-created.tsx
│   │       ├── orders.tsx
│   │       ├── order-tracking.tsx
│   │       ├── rate-order.tsx
│   │       ├── cancel-order.tsx
│   │       ├── notifications.tsx
│   │       └── profile.tsx
│   ├── components/
│   │   └── ui/
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── data/
│   │   └── mock/
│   ├── navigation/
│   ├── services/
│   ├── theme/
│   ├── types/
│   └── utils/
├── specs/
│   ├── 001-inicializacion/
│   ├── 002-autenticacion/
│   └── 003-comprador/
├── plans/
│   ├── 001-inicializacion-plan.md
│   ├── 002-autenticacion-plan.md
│   └── 003-comprador-plan.md
├── tasks/
│   ├── 001-inicializacion-tasks.md
│   ├── 002-autenticacion-tasks.md
│   └── 003-comprador-tasks.md
├── docs/
├── app.json
├── package.json
├── tsconfig.json
├── CONSTITUTION.md
├── AGENTS.md
├── memoria.md
├── SDD_CHANGELOG.md
├── ANALISIS_FIGMA.md
├── MAPA_NAVEGACION.md
├── AUDITORIA_UTTT_GO.md
└── README.md
```

## 4. Metodología SDD

El proyecto sigue una metodología **Specification-Driven Development (SDD)**:

```
Figma
  ↓
ANALISIS_FIGMA.md          (Inventario visual)
  ↓
CONSTITUTION.md            (Principios)
  ↓
SPECIFICATION (specs/)     (Qué y por qué)
  ↓
PLAN (plans/)              (Cómo)
  ↓
TASKS (tasks/)             (Tareas granulares, estado real)
  ↓
IMPLEMENTACIÓN             (Código siguiendo spec + plan)
  ↓
TEST / VERIFICACIÓN        (tsc, expo start, Expo Go)
  ↓
MEMORIA / CHANGELOG        (Decisiones, historial)
  ↓
SIGUIENTE ITERACIÓN
```

### Documentación SDD
| Documento | Ubicación | Descripción |
|-----------|-----------|-------------|
| Constitution | `CONSTITUTION.md` | Principios arquitectónicos, diseño, datos, calidad, SDD |
| Specifications | `specs/001-inicializacion/`, `002-autenticacion/`, `003-comprador/` | Qué se construye y por qué |
| Plans | `plans/` | Cómo se implementa cada etapa |
| Tasks | `tasks/` | Tareas granulares con estado real |
| Memory | `memoria.md` | Decisiones arquitectónicas, UI, datos, navegación |
| Changelog | `SDD_CHANGELOG.md` | Historial de cambios por etapa |

---

## 4. Avance del desarrollo

### Etapa 1. Configuración y estructura inicial ✅ COMPLETADA

Configuración del entorno de desarrollo con Expo, React Native y TypeScript.

Actividades realizadas:
- Configuración de Expo Router con typedRoutes
- Configuración de TypeScript strict mode
- Estructura de carpetas modular
- Creación del tema visual y sistema de espaciados
- Creación de 14 componentes reutilizables
- Definición de modelos de datos
- Preparación de rutas para comprador, vendedor y administrador
- Creación de contextos para autenticación y carrito
- Preparación de datos simulados para las pruebas

### Etapa 2. Autenticación ✅ COMPLETADA

Implementación del flujo de autenticación y onboarding con Backend autorizado.

Pantallas implementadas:
- **UI-001**: Splash
- **UI-002**: Bienvenida
- **UI-003**: Iniciar sesión
- **UI-004**: Registro
- **UI-005**: Recuperar contraseña
- **Verificación del correo institucional**

Funcionalidades:
- Splash con auto-navegación a Bienvenida tras 2.5s
- Login/Registro con validaciones y contratos autorizados
- Persistencia segura de sesión mediante SecureStore
- Recuperación de contraseña simulada
- Confirmación de correo mediante enlace enviado por Supabase
- Logout con reset de stack
- Navegación back correcta (push vs replace)

**Correcciones aplicadas:**
- Expo Router: eliminación de Stack.Screen redundantes
- Imagen welcome-hero: ruta relativa + ImageBackground
- Navegación back: replace → push en login/verify-email
- Logout con reset de stack correcto

### Etapa 3. Flujo del Comprador ✅ COMPLETADO* (Pendiente verificación Figma)

16 pantallas implementadas (UI-006 a UI-025):

| ID Figma | Pantalla | Archivo | Estado |
|----------|----------|---------|--------|
| UI-006 | Inicio comprador | `buyer/index.tsx` | ✅ |
| UI-007 | Buscar | `buyer/search.tsx` | ✅ |
| UI-008 | Filtros | `buyer/filters.tsx` | ✅ |
| UI-010 | Disponible ahora | `buyer/available-now.tsx` | ✅ |
| UI-012 | Categoría | `buyer/category.tsx` | ✅* |
| UI-013 | Detalle alimento | `buyer/food/[id].tsx` | ✅ |
| UI-015 | Datos del pedido | `buyer/order-data.tsx` | ✅ |
| UI-016 | Confirmar pedido | `buyer/confirm-order.tsx` | ✅ |
| UI-017 | Pedido generado | `buyer/order-created.tsx` | ✅ |
| UI-019 | Mis pedidos | `buyer/orders.tsx` | ✅ |
| UI-020 | Detalle seguimiento | `buyer/order-tracking.tsx` | ✅ |
| UI-021 | Calificar pedido | `buyer/rate-order.tsx` | ✅ |
| UI-022 | Confirmación cancelación | `buyer/cancel-order.tsx` | ✅ |
| UI-024 | Notificaciones | `buyer/notifications.tsx` | ✅ |
| UI-025 | Mi perfil | `buyer/profile.tsx` | ✅ |

> *UI-012 Categoría: **Pendiente verificación final contra Figma UI-012 Categoría.png**

**Funcionalidades implementadas:**
- Home: header saludo + avatar, búsqueda, categorías horizontal scroll, grid 2 cols alimentos
- Categorías: carrusel horizontal con snap, tarjetas imagen + overlay + icono
- Disponible ahora: grid 2 cols con imágenes, gradiente, badge favorito, precio, rating
- Búsqueda: filtrado tiempo real por nombre
- Filtros: disponibilidad, precio, tiempo
- Detalle alimento: imagen, info, stock, cantidad, agregar al carrito
- Carrito single-vendor (regla: un vendedor por compra)
- Flujo pedido completo: Datos → Confirmar → Generado → Rastrear/Volver
- Mis pedidos con badges estado + tap → tracking
- Seguimiento: timeline 4 pasos + detalle vendedor/pago
- Calificar: 5 estrellas + comentario
- Cancelar: motivos radio + confirmar
- Notificaciones: lista + iconos tipo + dot leído/no leído
- Perfil: avatar, datos, settings, logout rojo
- Carrito single-vendor (regla: un vendedor por compra)
- Navegación push/pop correcta, historial mantenido
- Scroll Home con `nestedScrollEnabled`
- Navegación dinámica `/buyer/food/:id` + `useLocalSearchParams`

**Datos Mock Coherentes:**
- **6 categorías**: Desayunos(4), Comida corrida(4), Antojitos(4), Bebidas(3), Postres(3), Snacks(3) = 21 alimentos
- **21 alimentos** con nombres, descripciones, precios, imágenes, ratings, stock, disponibilidad, tags
- **4 pedidos** con estados variados, códigos UTTT-XXXX, items, totales
- **4 notificaciones** con tipos order/chat/system
- **3 usuarios demo**: comprador, vendedor, admin (pass: 12345678)

**Correcciones aplicadas:**
- Expo Router: eliminación de Stack.Screen redundantes
- VirtualizedList anidado: `nestedScrollEnabled` + `scroll` prop correcto
- Navegación dinámica `/buyer/food/:id` + `useLocalSearchParams`
- Navegación back: `replace` → `push` en login/verify-email
- Scroll Home: `nestedScrollEnabled` + `scroll` prop
- VirtualizedList anidado resuelto (`nestedScrollEnabled` + quitar `scroll` en FlatList screens)

> *Pendiente: Verificar categorías contra Figma UI-012 real y reemplazar placeholders por recursos Figma

### Etapas Pendientes
| Etapa | Pantallas | Estado |
|-------|-----------|--------|
| 4. Vendedor | UI-029, 035-039, 014, 027, 028 | ⏳ PENDIENTE |
| 5. Administrador | UI-041, 042, 043, 044 | ⏳ PENDIENTE |
| 6. Chat/Estados | Chat, 10 estados | ⏳ PENDIENTE |
| 7. Revisión visual | Comparación Figma | ⏳ PENDIENTE |

---

## 5. Datos y servicios

Actualmente el catálogo comprador conserva datos simulados (*mock*) para facilitar el desarrollo y las pruebas de interfaz. El demo invitado usa una fuente separada en `src/data/demo/`.

Login y registro usan el `ApiClient` cuando existe configuración de API. El demo invitado no requiere Backend.

La confirmación de correo se realiza mediante el enlace enviado por Supabase; no existe token ni endpoint de verificación en la app.

---

## 6. Ejecución del proyecto

### Requisitos
- Node.js
- npm
- Git
- Expo Go instalado en un dispositivo Android

### Instalación

Clonar el repositorio:
```bash
git clone https://github.com/utttgo-2026/utttgoo-movil.git
```

Entrar a la carpeta:
```bash
cd utttgoo-movil
```

Instalar dependencias:
```bash
npm install
```

Iniciar el entorno de desarrollo:
```bash
npx expo start
```

Escanear el código QR desde Expo Go para abrir la aplicación en Android.

### Verificación de TypeScript
```bash
npx tsc --noEmit
```

---

## 7. Próximas etapas

Las siguientes actividades contempladas son:
- Verificar categorías contra Figma UI-012 real y corregir recursos
- Reemplazar placeholders por recursos Figma (imágenes categorías/alimentos)
- Desarrollar el módulo del vendedor (Etapa 4)
- Desarrollar el módulo del administrador (Etapa 5)
- Implementar los módulos de pedidos y chat (Etapa 6)
- Integrar los servicios del backend
- Realizar pruebas funcionales y visuales exhaustivas
- Preparar la versión de entrega de la aplicación móvil

---

## 8. CI/CD

La fase vigente es `specs/004-ci-cd/`. La preparación actual usa Node.js 22.13.1 y workflows separados para calidad, seguridad, preview, release y smoke test. Production requiere Backend HTTPS, enlace EAS, `EXPO_TOKEN`, primer build exitoso y aprobación humana; no se ejecuta `eas submit` automáticamente.

Variables de entorno: consultar `docs/environments.md` y `.env.example`. No incluir JWT, contraseñas ni tokens en `EXPO_PUBLIC_*`.

### CI (Integración Continua)

Pipeline automatizado con GitHub Actions que se ejecuta en cada Pull Request y push a `main` / `HRDCORE`:

| Job | Comando | Descripción |
|-----|---------|-------------|
| TypeScript | `npx tsc --noEmit` | Verificación de tipos estricta |
| Lint | `npm run lint` | `expo lint` - Reglas ESLint + Expo |
| Expo Doctor | `npx expo-doctor` | Validación configuración Expo |

**Triggers:** PR a `main`/`HRDCORE`, `push` a `main`/`HRDCORE`

### CD (Despliegue Continuo) - Fase 1: Preview

Build Android de prueba mediante Expo Application Services (EAS):

```yaml
# Trigger manual
workflow_dispatch:
  inputs:
    profile:
      type: choice
      options: [preview, development]
      default: preview

# Trigger automático opcional
push:
  branches: [HRDCORE]
```

**Comando:** `eas build --platform android --profile preview --non-interactive`

**Requisitos previos:**
- Proyecto vinculado a Expo Services (`eas build:configure`)
- Secret `EXPO_TOKEN` en GitHub Secrets
- Perfil `preview` en `eas.json` (APK interna)

### Fase 2 - Producción (Pendiente)

| Funcionalidad | Estado |
|---------------|--------|
| Build producción (AAB + IPA) | ⏳ Pendiente |
| `eas submit` automático | ⏳ Pendiente |
| Credenciales Google Play / App Store | ⏳ Pendiente |
| Notificaciones release (Slack/Email) | ⏳ Pendiente |

---

## 9. Estado actual

El proyecto se encuentra en una etapa avanzada de desarrollo. Ya cuenta con:
- Estructura organizada y modular
- Configuración completa del entorno móvil
- Componentes reutilizables y tema visual
- Pantallas de autenticación completas y funcionales
- Flujo completo del comprador (16 pantallas) con navegación, datos mock, carrito, pedidos
- Metodología SDD documentada y aplicada
- Correcciones críticas de navegación, scroll y rutas aplicadas

**Pendiente crítico**: Verificar categorías y recursos contra Figma UI-012 real antes de continuar a Etapa 4.

El desarrollo continuará por etapas, verificando cada módulo antes de comenzar el siguiente.

---

## 9. Documentación SDD

| Documento | Ubicación |
|-----------|-----------|
| Constitution | `CONSTITUTION.md` |
| Specifications | `specs/001-inicializacion/`, `002-autenticacion/`, `003-comprador/` |
| Plans | `plans/` |
| Tasks | `tasks/` |
| Memory | `memoria.md` |
| Changelog | `SDD_CHANGELOG.md` |
| Análisis Figma | `ANALISIS_FIGMA.md` |
| Mapa Navegación | `MAPA_NAVEGACION.md` |
| Auditoría | `AUDITORIA_UTTT_GO.md` |
| Agents | `AGENTS.md` |
| Memory | `memoria.md` |

---

**Proyecto académico**: UTTT-Go  
**Institución**: Universidad Tecnológica de Tula-Tepeji  
**Plataforma**: Aplicación móvil Android  
**Estado**: En desarrollo - Etapa 3 (Comprador) completada*  

*Etapa 3 marcada como completada con observación pendiente de verificación Figma UI-012.
