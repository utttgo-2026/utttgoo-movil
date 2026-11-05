# UTTT-Go Móvil

Aplicación móvil del proyecto **UTTT-Go**, una plataforma orientada a facilitar la compra y venta de alimentos dentro de la comunidad de la Universidad Tecnológica de Tula-Tepeji (UTTT).

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
│   │   └── (auth)/
│   │       ├── welcome.tsx
│   │       ├── login.tsx
│   │       ├── register.tsx
│   │       ├── forgot-password.tsx
│   │       └── verify-email.tsx
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
├── app.json
├── package.json
└── tsconfig.json
```

## 4. Avance del desarrollo

### Etapa 1. Configuración y estructura inicial

Se realizó la configuración del entorno de desarrollo con Expo, React Native y TypeScript.

Actividades realizadas:

- Configuración de Expo Router.
- Configuración de tipografías Poppins.
- Creación del tema visual y sistema de espaciados.
- Creación de componentes reutilizables.
- Definición de modelos de datos.
- Preparación de las rutas para comprador, vendedor y administrador.
- Creación de contextos para autenticación y carrito.
- Preparación de datos simulados para las pruebas.

### Etapa 2. Autenticación

Se inició la implementación de las pantallas de autenticación con base en los diseños de Figma.

Pantallas contempladas:

- UI-001: Splash.
- UI-002: Bienvenida.
- UI-003: Iniciar sesión.
- UI-004: Registro.
- UI-005: Recuperar contraseña.
- Verificación del correo institucional.

Se implementaron formularios y validaciones básicas, así como navegación entre las pantallas y simulación de operaciones mediante datos locales.

**Estado:** implementación inicial realizada. Pendiente corregir y verificar la carga de recursos gráficos y completar las pruebas de navegación en Expo Go.

## 5. Datos y servicios

Actualmente se utilizan datos simulados (*mock*) para facilitar el desarrollo y las pruebas de interfaz.

No existe todavía una conexión funcional con el backend.

La autenticación, el registro y la recuperación de contraseña son simulaciones locales, no procesos de autenticación reales.

## 6. Ejecución del proyecto

### Requisitos

- Node.js.
- npm.
- Git.
- Expo Go instalado en un dispositivo Android.

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

## 7. Próximas etapas

Las siguientes actividades contempladas son:

- Finalizar y verificar el módulo de autenticación.
- Desarrollar el módulo del comprador.
- Desarrollar el módulo del vendedor.
- Desarrollar el módulo del administrador.
- Implementar los módulos de pedidos y chat.
- Integrar los servicios del backend.
- Realizar pruebas funcionales y visuales.
- Preparar la versión de entrega de la aplicación móvil.

## 8. Estado actual

El proyecto se encuentra en una etapa inicial de desarrollo. Ya cuenta con una estructura organizada, configuración del entorno móvil, componentes reutilizables y las primeras pantallas de autenticación.

El desarrollo continuará por etapas, verificando cada módulo antes de comenzar el siguiente.

---

**Proyecto académico:** UTTT-Go  
**Institución:** Universidad Tecnológica de Tula-Tepeji  
**Plataforma:** Aplicación móvil Android  
**Estado:** En desarrollo