# Specification 002 — Autenticación

## Información General
- **ID**: 002-autenticacion
- **Nombre**: Flujo de Autenticación
- **Versión**: 1.0
- **Fecha**: 2025-11-05
- **Estado**: EN IMPLEMENTACION — OTP Supabase y login lazy Backend

---

## 1. Objetivo

Implementar el flujo completo de autenticación local con persistencia, incluyendo Splash, Bienvenida, Login, Registro, Recuperación de contraseña y Verificación de correo institucional, siguiendo fielmente los diseños de Figma (UI-001 a UI-005 + Verificación).

---

## 2. Alcance

### Incluido (6 Pantallas)
| ID Figma | Pantalla | Archivo | Estado |
|----------|----------|---------|--------|
| UI-001 | Splash | `src/app/index.tsx` | COMPLETADO |
| UI-002 | Bienvenida | `src/app/(auth)/welcome.tsx` | COMPLETADO |
| UI-003 | Iniciar sesión | `src/app/(auth)/login.tsx` | COMPLETADO |
| UI-004 | Registro | `src/app/(auth)/register.tsx` | COMPLETADO |
| UI-005 | Recuperar contraseña | `src/app/(auth)/forgot-password.tsx` | COMPLETADO |
| — | Verificación correo | `src/app/(auth)/verify-email.tsx` | COMPLETADO |

### Funcionalidades
- **Splash**: Logo UTTT-GO, tagline "Del campus a tus manos", auto-navegación a Demo 1 tras 2.5s
- **Bienvenida**: Hero image (UI-002), headline, 3 feature cards, botones Iniciar sesión/Crear cuenta/Seguir explorando
- **Login**: Header "Acceso UTTT", campos email/contraseña, "¿Olvidaste contraseña?", botón primario, info box acceso institucional, link a registro
- **Registro**: Header "Crear cuenta", campos nombre/email/contraseña/confirmar, botón primario, texto términos
- **Recuperar contraseña**: Icono llave, título, descripción, campo email, botón "Enviar enlace", link volver a login
- **Verificación correo**: Campo email (read-only), campo token, botón "Verificar y continuar", reenviar token
- **Persistencia**: AsyncStorage para usuarios registrados (sobreviven reinicios)
- **Usuarios demo**: 3 cuentas predefinidas (comprador, vendedor, admin) con credenciales 12345678
- **Logout**: Redirige a Welcome reseteando stack (`router.replace('/welcome')`)

### Correcciones Realizadas (Post-Implementación)
- **Flujo inicial**: Splash navega directamente a Demo 1; Welcome permanece disponible, pero fuera del arranque.
- **Expo Router rutas extráneas**: Eliminadas declaraciones `Stack.Screen` redundantes para rutas de auth; Expo Router descubre automáticamente desde sistema de archivos
- **Resolución de imágenes**: Cambio de `require('@/assets/...')` a rutas relativas `require('../../assets/...')` para compatibilidad con Metro
- **Navegación back**: `router.replace` → `router.push` en login/verify-email para mantener historial (back va a login, no a welcome)
- **Logout**: `router.replace('/welcome')` correcto para resetear stack
- **Imagen welcome-hero**: Copia de UI-002 Bienvenida.png → `src/assets/images/welcome-hero.png`, usada via `ImageBackground`

### No Incluido
- Autenticación real con backend
- JWT, tokens, refresh tokens
- Biometría, 2FA
- Social login (Google, Apple)

---

## 3. Requisitos Funcionales

| ID | Requisito | Pantalla | Estado |
|----|-----------|----------|--------|
| REQ-AUTH-001 | Splash muestra logo + tagline + auto-nav 2.5s | UI-001 | COMPLETADO |
| REQ-AUTH-002 | Bienvenida: hero image + 3 features + 3 CTAs | UI-002 | COMPLETADO |
| REQ-AUTH-003 | Login: email/password + validaciones + forgot link | UI-003 | COMPLETADO |
| REQ-AUTH-004 | Login: acceso demo (3 roles) + persistencia | UI-003 | COMPLETADO |
| REQ-AUTH-005 | Registro: 4 campos + validaciones + términos | UI-004 | COMPLETADO |
| REQ-AUTH-006 | Recuperar: email + envío simulado + back a login | UI-005 | COMPLETADO |
| REQ-AUTH-007 | Verificación: email read-only + token 6 dígitos | Verificación | COMPLETADO |
| REQ-AUTH-008 | Persistencia AsyncStorage (usuarios registrados) | AuthContext | COMPLETADO |
| REQ-AUTH-009 | Usuarios demo (3 roles, pass 12345678) | AuthContext | COMPLETADO |
| REQ-AUTH-010 | Logout → replace('/welcome') reset stack | Profile/Auth | COMPLETADO |
| REQ-AUTH-011 | Navegación back correcta (push no replace) | Login/Verify | COMPLETADO |
| REQ-AUTH-012 | Rutas Expo Router sin warnings extraneous | _layout.tsx | COMPLETADO |
| REQ-AUTH-013 | Imagen welcome-hero desde Figma (ImageBackground) | UI-002 | COMPLETADO |

---

## 4. Pantallas y IDs Figma

| ID Figma | Nombre | Archivo | Ruta Expo Router |
|----------|--------|---------|------------------|
| UI-001 | Splash | `src/app/index.tsx` | `/` |
| UI-002 | Bienvenida | `src/app/(auth)/welcome.tsx` | `/welcome` |
| UI-003 | Iniciar sesión | `src/app/(auth)/login.tsx` | `/login` |
| UI-004 | Registro | `src/app/(auth)/register.tsx` | `/register` |
| UI-005 | Recuperar contraseña | `src/app/(auth)/forgot-password.tsx` | `/forgot-password` |
| — | Verificación correo | `src/app/(auth)/verify-email.tsx` | `/verify-email` |

---

## 5. Navegación

```
Splash (/)
  → auto 2.5s → Demo 1 (/demo-one)
    → "Ya tengo cuenta" → Login (/login)
    → CTA principal → Demo 2 (/demo-two)
      → "Continuar para pedir" → Login (/login)
  Welcome (/welcome) permanece disponible como pantalla de compatibilidad
  Login (/login)
      → éxito → Buyer Home (/buyer)
      → "¿Olvidaste?" → Recuperar (/forgot-password)
        → éxito → Verificación (/verify-email)
          → éxito → Buyer Home (/buyer)
      → "Crear cuenta" → Registro (/register)
        → éxito → Verificación (/verify-email)
          → éxito → Buyer Home (/buyer)
```

### Correcciones de Navegación Aplicadas
- **Login/Verify-email**: `router.replace` → `router.push` para mantener historial (back va a login, no salta a welcome)
- **Logout**: `router.replace('/welcome')` correcto (resetea stack)
- **Stack Screen**: Solo `<Stack.Screen name="index" />` en root; auth routes descubiertos automáticamente por Expo Router

---

## 6. Persistencia (AsyncStorage)

### Clave: `@uttgo:users`
- Almacena array de `User[]` (usuarios registrados vía Registro)
- Login busca primero en demoAccounts, luego en storage
- Registro guarda nuevo usuario en storage + setUser
- Logout limpia `user` state (no borra storage)

### Usuarios Demo (Hardcoded)
| Rol | Email | Password |
|-----|-------|----------|
| comprador | 20230184@utt.edu.mx | 12345678 |
| vendedor | vendedor@utt.edu.mx | 12345678 |
| admin | admin@utt.edu.mx | 12345678 |

---

## 6. Archivos Involucrados

### Pantallas (6)
- `src/app/index.tsx` (UI-001 Splash)
- `src/app/(auth)/welcome.tsx` (UI-002)
- `src/app/(auth)/login.tsx` (UI-003)
- `src/app/(auth)/register.tsx` (UI-004)
- `src/app/(auth)/forgot-password.tsx` (UI-005)
- `src/app/(auth)/verify-email.tsx` (Verificación)

### Contexto & Datos
- `src/context/AuthContext.tsx` (persistencia AsyncStorage)
- `src/data/mock/users.ts` (usuarios demo, findDemoUserByEmail)
- `src/data/mock/index.ts` (exports)

### Navegación & Layout
- `src/app/_layout.tsx` (Stack root + typedRoutes)
- `src/app/(auth)/_layout.tsx` (no existe — rutas descubiertas automáticamente)
- `src/navigation/routes.ts` (constantes de rutas)

### Assets
- `src/assets/images/welcome-hero.png` (copia de UI-002 Bienvenida.png)

---

## 7. Criterios de Finalización

- [x] `npx tsc --noEmit` → 0 errores
- [x] `npx expo start -c` → Expo Go abre sin errores
- [x] Flujo completo: Splash → Bienvenida → Login/Register → Buyer Home
- [x] Back navigation correcta (Login → Welcome, no salta a Splash)
- [x] Registro → Verificación → Buyer Home
- [x] Login demo (3 roles) + registro nuevo usuario → persistencia
- [x] Logout → Welcome (stack reseteado)
- [x] `npx tsc --noEmit` → 0 errores
- [x] Expo Router sin warnings "extraneous" o "Too many screens"
- [x] Imagen welcome-hero cargada desde assets (ImageBackground)

---

## 7. Estado

**COMPLETADO** — 2025-11-05

---

## 8. Referencias

- `ANALISIS_FIGMA.md` (UI-001 a UI-005 + Verificación)
- `MAPA_NAVEGACION.md` (flujos auth)
- `SDD_CHANGELOG.md` (historial correcciones)
- `CONSTITUTION.md` (principios navegación, persistencia)

## 9. Extension OTP Supabase

- Registro canónico: `POST /api/v1/auth/register`; no crea sesión móvil.
- Supabase envía un OTP de seis dígitos mediante la plantilla `Confirm sign up`.
- La aplicación usa `supabase.auth.verifyOtp({ email, token, type: 'signup' })`.
- El reenvío usa `supabase.auth.resend({ type: 'signup', email })`; no existe endpoint Backend OTP.
- Después de verificar OTP, el móvil ejecuta inmediatamente el login Backend para activar de forma lazy la cuenta `PendingEmailVerification -> Active` y obtener el JWT.
- La contraseña permanece solamente en memoria durante Registro -> OTP -> Login y nunca se guarda en SecureStore, AsyncStorage, URL o logs.
- El JWT Backend es el único token persistido, mediante SecureStore.
- `/api/v1/auth/me` y `/api/v1/users/me` se decodifican como contratos separados.
