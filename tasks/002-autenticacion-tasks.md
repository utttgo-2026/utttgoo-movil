# Tasks 002 — Autenticación

## Información General
- **Spec**: 002-autenticacion
- **Versión**: 1.0
- **Estado**: COMPLETADO

---

## Tareas

### Fase 1: Splash y Bienvenida
- [x] Splash: logo, tagline, auto-nav 2.5s (`src/app/index.tsx`)
- [x] Bienvenida: hero image + 3 features + 3 CTAs (`(auth)/welcome.tsx`)
- [x] Copia UI-002 → assets/welcome-hero.png (`assets/images/welcome-hero.png`)
- [x] ImageBackground en Bienvenida (`welcome.tsx`)

### Fase 2: Login y Registro
- [x] Login: header, campos, validaciones, demo login (`(auth)/login.tsx`)
- [x] Registro: 4 campos, validaciones, términos (`(auth)/register.tsx`)
- [x] AuthContext: login, register, logout, persistencia (`AuthContext.tsx`)
- [x] Usuarios demo (3 roles) (`users.ts`)
- [x] AsyncStorage persistencia (`AuthContext.tsx`)

### Fase 3: Recuperar y Verificación
- [x] Recuperar contraseña (`(auth)/forgot-password.tsx`)
- [x] Verificación correo (`(auth)/verify-email.tsx`)
- [x] Navegación auth routes (`_layout.tsx`)

### Fase 4: Correcciones Post-Implementación
- [x] Expo Router: eliminar Stack.Screen auth redundantes (`_layout.tsx`)
- [x] Imagen welcome-hero: ruta relativa + ImageBackground (`welcome.tsx`)
- [x] Navegación back: replace → push (login/verify) (`login.tsx`, `verify-email.tsx`)
- [x] Logout: replace correcto (`profile.tsx`)
- [x] Rutas relativas para imágenes (`welcome.tsx`, `index.tsx`)

### Fase 5: Verificación y Cierre
- [x] TypeScript check: `npx tsc --noEmit` → 0 errores
- [x] Expo Doctor: `npx expo-doctor`
- [x] Expo Start (cache limpio): `npx expo start -c`
- [x] Expo Go Android: `npx expo start --android`
- [x] Flujo completo manual verificado en Expo Go

---

## Flujo de Prueba Manual Verificado
1. Splash → Bienvenida (auto 2.5s)
2. Bienvenida → Login → Buyer Home
3. Bienvenida → Registro → Verificación → Buyer Home
4. Login → Recuperar → Verificación → Buyer Home
5. Login demo (3 roles) + registro nuevo → persistencia
6. Buyer Home → Perfil → Logout → Welcome (stack reset)
7. Back navigation: Buyer Home → Login → Welcome (no salta)

---

## Estado General
**EN IMPLEMENTACION** — extension OTP Supabase

## Fase 6: OTP Supabase y activación lazy

- [x] Instalar y configurar cliente Supabase público.
- [x] Registro Backend -> pantalla OTP sin autenticar.
- [x] `verifyOtp` oficial con `type: 'signup'`.
- [x] Reenvío oficial con cooldown y bloqueo de envíos simultáneos.
- [x] Login Backend inmediato conservando password únicamente en memoria.
- [x] Decoders separados para `auth/me` y `users/me`.
- [x] Mapeo explícito de roles y rechazo de roles desconocidos.
- [x] Pruebas OTP, restore 401, SecureStore y password no persistido.
- [ ] Confirmar respuesta real de login antes de activar `decodeLogin` (BLOCKED_BY_BACKEND_LOGIN_RESPONSE_CONTRACT).

## Prueba E2E manual pendiente

1. Abrir app y completar Splash -> Demo 1 -> Demo 2.
2. Crear cuenta con un correo `@uttt.edu.mx` autorizado.
3. Confirmar registro Backend y recibir OTP de seis dígitos por SMTP de Supabase.
4. Introducir OTP, verificar y observar el login Backend inmediato.
5. Confirmar JWT en SecureStore, `/auth/me` con `Active`, `/users/me` y entrada al catálogo.

No crear cuentas masivamente ni automatizar el envío de OTP reales.
