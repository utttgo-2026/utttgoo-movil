# Plan 002 — Autenticación

## Información General
- **Spec**: 002-autenticacion
- **Versión**: 1.0
- **Fecha**: 2025-11-05
- **Estado**: EN IMPLEMENTACION — extension OTP Supabase

---

## 1. Objetivo

Implementar el flujo completo de autenticación local con persistencia, incluyendo 6 pantallas (Splash, Bienvenida, Login, Registro, Recuperar contraseña, Verificación correo) replicando fielmente los diseños de Figma (UI-001 a UI-005 + Verificación).

---

## 2. Alcance del Plan

### Entregables (6 Pantallas)
| ID Figma | Pantalla | Archivo | Ruta |
|----------|----------|---------|------|
| UI-001 | Splash | `src/app/index.tsx` | `/` |
| UI-002 | Bienvenida | `src/app/(auth)/welcome.tsx` | `/welcome` |
| UI-003 | Iniciar sesión | `src/app/(auth)/login.tsx` | `/login` |
| UI-004 | Registro | `src/app/(auth)/register.tsx` | `/register` |
| UI-005 | Recuperar contraseña | `src/app/(auth)/forgot-password.tsx` | `/forgot-password` |
| — | Verificación correo | `src/app/(auth)/verify-email.tsx` | `/verify-email` |

### Funcionalidades Core
- Splash con auto-navegación 2.5s
- Bienvenida con hero image + 3 CTAs
- Login con validaciones + usuarios demo + persistencia
- Registro con validaciones + términos
- Recuperar contraseña (simulado)
- Verificación correo (token 6 dígitos simulado)
- Persistencia AsyncStorage (usuarios registrados sobreviven reinicios)
- Usuarios demo (3 roles, pass 12345678)
- Logout → Welcome (stack reset)

### Correcciones Post-Implementación
- Expo Router: eliminar Stack.Screen redundantes
- Imagen welcome-hero: ruta relativa + ImageBackground
- Navegación back: replace → push (login/verify-email)
- Logout: replace correcto

---

## 2. Fases de Implementación

### Fase 1: Splash y Bienvenida (Día 1)
| Tarea | Archivo | Estado |
|-------|---------|--------|
| Splash: logo, tagline, auto-nav 2.5s | `src/app/index.tsx` | COMPLETADO |
| Bienvenida: hero image + 3 features + 3 CTAs | `(auth)/welcome.tsx` | COMPLETADO |
| Copia UI-002 → assets/welcome-hero.png | `assets/images/welcome-hero.png` | COMPLETADO |
| ImageBackground en Bienvenida | `welcome.tsx` | COMPLETADO |

### Fase 2: Login y Registro (Día 2)
| Tarea | Archivo | Estado |
|-------|---------|--------|
| Login: header, campos, validaciones, demo login | `(auth)/login.tsx` | COMPLETADO |
| Registro: 4 campos, validaciones, términos | `(auth)/register.tsx` | COMPLETADO |
| AuthContext: login, register, logout, persistencia | `AuthContext.tsx` | COMPLETADO |
| Usuarios demo (3 roles) | `users.ts` | COMPLETADO |
| AsyncStorage persistencia | `AuthContext.tsx` | COMPLETADO |

### Fase 3: Recuperar y Verificación (Día 2-3)
| Tarea | Archivo | Estado |
|-------|---------|--------|
| Recuperar contraseña | `(auth)/forgot-password.tsx` | COMPLETADO |
| Verificación correo | `(auth)/verify-email.tsx` | COMPLETADO |
| Navegación auth routes | `_layout.tsx` | COMPLETADO |

### Fase 4: Correcciones Post-Implementación (Día 3)
| Corrección | Archivo | Estado |
|------------|---------|--------|
| Expo Router: eliminar Stack.Screen auth redundantes | `_layout.tsx` | COMPLETADO |
| Imagen welcome-hero: ruta relativa + ImageBackground | `welcome.tsx` | COMPLETADO |
| Navegación back: replace → push (login/verify) | `login.tsx`, `verify-email.tsx` | COMPLETADO |
| Logout: replace correcto | `profile.tsx` | COMPLETADO |
| Rutas relativas para imágenes | `welcome.tsx`, `index.tsx` | COMPLETADO |

### Fase 5: Verificación y Cierre (Día 4)
| Validación | Comando | Estado |
|------------|---------|--------|
| TypeScript check | `npx tsc --noEmit` | COMPLETADO |
| Expo Doctor | `npx expo-doctor` | COMPLETADO |
| Expo Start (cache limpio) | `npx expo start -c` | COMPLETADO |
| Expo Go Android | `npx expo start --android` | COMPLETADO |
| Flujo completo manual | Expo Go | COMPLETADO |

---

## 3. Archivos Creados/Modificados

### Pantallas Auth (6)
- `src/app/index.tsx` (Splash - UI-001)
- `src/app/(auth)/welcome.tsx` (UI-002)
- `src/app/(auth)/login.tsx` (UI-003)
- `src/app/(auth)/register.tsx` (UI-004)
- `src/app/(auth)/forgot-password.tsx` (UI-005)
- `src/app/(auth)/verify-email.tsx` (Verificación)

### Contexto y Datos
- `src/context/AuthContext.tsx` (persistencia AsyncStorage)
- `src/data/mock/users.ts` (usuarios demo, findDemoUserByEmail)
- `src/data/mock/index.ts` (exports)

### Navegación y Layout
- `src/app/_layout.tsx` (Stack root + typedRoutes)
- `src/navigation/routes.ts` (constantes rutas auth)

### Assets
- `src/assets/images/welcome-hero.png` (copia de UI-002 Bienvenida.png)

---

## 3. Correcciones Críticas Aplicadas

| Problema | Solución | Archivos |
|----------|----------|----------|
| Expo Router "Too many screens" | Eliminar Stack.Screen auth redundantes | `_layout.tsx` |
| Imagen no resuelve (`@/assets/...`) | Rutas relativas `../../assets/...` | `welcome.tsx` |
| Back navigation salta a Welcome | `router.replace` → `router.push` en login/verify | `login.tsx`, `verify-email.tsx` |
| Imagen no carga (Image vs ImageBackground) | `ImageBackground` para hero | `welcome.tsx` |
| Logout no resetea stack | `router.replace('/welcome')` | `profile.tsx` |

---

## 4. Validaciones de Cierre

| Validación | Comando | Resultado |
|------------|---------|-----------|
| TypeScript | `npx tsc --noEmit` | 0 errores |
| Expo Doctor | `npx expo-doctor` | Sin warnings críticos |
| Expo Start | `npx expo start -c` | Levanta sin errores |
| Flujo completo manual | Expo Go | OK |

### Flujo de Prueba Manual Verificado
1. Splash → Bienvenida (auto 2.5s)
2. Bienvenida → Login → Buyer Home
3. Bienvenida → Registro → Verificación → Buyer Home
4. Login → Recuperar → Verificación → Buyer Home
5. Login demo (3 roles) + registro nuevo → persistencia
6. Buyer Home → Perfil → Logout → Welcome (stack reset)
7. Back navigation: Buyer Home → Login → Welcome (no salta)

---

## 4. Estado

**COMPLETADO** — 2025-11-05

---

## 5. Referencias

- `specs/002-autenticacion/spec.md`
- `specs/002-autenticacion/plan.md` (este archivo)
- `CONSTITUTION.md` (navegación, persistencia)
- `SDD_CHANGELOG.md` (historial correcciones)
- `ANALISIS_FIGMA.md` (UI-001 a UI-005 + Verificación)

## 6. Implementación OTP

1. Instalar `@supabase/supabase-js` sin actualizar Expo.
2. Centralizar el cliente Supabase con variables públicas y sesión Supabase no persistente.
3. Mantener el password en memoria dentro de `AuthContext` hasta terminar login Backend.
4. Verificar y reenviar OTP con los tipos oficiales `signup`.
5. Decodificar `/auth/me` y `/users/me` con DTOs separados y mapear roles explícitamente.
6. No habilitar el decoder JWT hasta confirmar el cuerpo real de `/auth/login`.
