# Plan 005 — AWS-API-INTEGRATION

## Información General
- **Spec**: 005-aws-api-integration
- **Versión**: 1.0
- **Fecha**: 2026-11-11
- **Estado**: EN PRUEBAS — implementación técnica verificada localmente, cierre funcional pendiente.

## 1. Arquitectura
Mantener Context API, Expo Router, componentes y modelo de presentación User. Incorporar módulos pequeños en src/services/api, tipos de transporte en src/types/api.ts y validaciones conocidas en src/utils/apiValidation.ts. mockApi conserva su responsabilidad actual.

## 2. Fases de Implementación
1. Spec → este plan → tareas, antes de código.
2. .env ignorado y .env.example sin IP duplicada. config.ts usa process.env.EXPO_PUBLIC_API_BASE_URL estático; validar origen HTTP/HTTPS sin credenciales, query, fragmento ni path adicional.
3. httpClient: fetch inyectable para tests, timeout AbortController, métodos limitados, JSON unknown, status/headers conservados y ApiError central. Únicamente GET /health sin token/body sobre HTTP; demás llamadas HTTPS. Sin reintento de mutaciones ni tokens en URL/logs. El backend HTTPS debe evitar redirects de downgrade; redirect:error se solicitará pero su soporte real en RN debe verificarse.
4. Servicios health/auth/users/sellers/admin: status esperado por endpoint, rutas exactas, listas blancas y parámetros conocidos; no mapear DTO no documentados.
5. Instalar expo-secure-store mediante expo install (SDK 58). sessionStorage guarda solo JWT, con errores explícitos y sin fallback inseguro.
6. AuthContext único: estados de restauración, anónimo, bloqueado y autenticado. Adaptadores de respuesta deliberadamente bloqueados hasta contrato; servicios login/register disponibles, login falla cerrado antes de enviar si no hay contrato. Registro 202 no crea sesión. Validar token con auth/me; perfil con users/me. Logout invalida operaciones y elimina token. Serializar mutaciones del storage para evitar restauraciones/escrituras tardías.
7. Pantallas existentes: validación institucional, error visible, loading; navegación exitosa solo al resultado correcto. Verificación/recuperación sin éxito ficticio. Perfil consume el mismo contexto, sin formulario nuevo inventado. Habilitar la acción ya diseñada de explorar como invitado para conservar acceso al catálogo sin sesión ficticia. Diagnóstico manual /health dentro de la tarjeta informativa de login exclusivamente con __DEV__, sin pantalla nueva ni cambio de tema.
8. Pruebas unitarias y verificaciones. Diagnóstico /health real por separado; probar Expo Go solo si dispositivo accesible. Habilitar Jest como job de CI/gate al existir tests; usar Node 24 compatible con engines de Expo 58 (el workflow anterior usa Node 20).
9. Tareas con evidencia, Constitución/AGENTS si cambia alcance, memoria y changelog.

## 3. Estrategia de migración de AsyncStorage
No leer, migrar ni borrar @uttgo:users automáticamente. Es un registro local legacy, no una sesión AWS. La implementación nueva no guardará contraseñas y nunca usará esos registros como autoridad. Una limpieza futura requiere inspección local sin exponer datos, autorización, eliminación dirigida de esa clave y prueba de que el resto del storage permanece. No ejecutar clear(). Mantener la dependencia para datos ajenos al alcance.

## 4. Contratos incompletos
Los servicios retornan ApiResponse<unknown>, salvo health validado a partir de respuesta observada. No usar casts a User ni suponer accessToken/data/roles. Un módulo de adaptadores bloqueado documentará exactamente dónde implementar el decodificador una vez recibido OpenAPI. No exponer setters de token en Context ni signInAs.

PATCH: validar campos y tipos conocidos; los límites/regex no documentados son un bloqueo para afirmar validación funcional completa. No enviar null ni extras. No usar filtros admin desconocidos.

## 5. Verificación y aceptación
- npx tsc --noEmit
- npm run lint
- npm run test:ci
- npx expo-doctor
- GET /health: status, headers, JSON, duración y origen de prueba.
- Expo Go: iniciar Metro y verificar disponibilidad de dispositivo; si no lo hay, registrar pendiente, no éxito.
- Tests: HTTP inseguro no llama fetch, 200/201/202, errores HTTP/no JSON, timeout/red, Bearer, correo, PATCH y sesión segura/logout incluyendo carreras.

## 6. Bloqueos de cierre
HTTPS, contratos JSON/errores/roles, límites de campos, relación Supabase-AWS y prueba en Expo Go. Mantener EN DESARROLLO/EN PRUEBAS hasta evidencia; infraestructura implementada no equivale a login real verificado.

## 7. Preparación de publicación HRDCORE — 2026-11-12
El usuario solicita commit/push a HRDCORE y autoriza expresamente corregir el bloqueo de Doctor actualizando solo el parche Expo58.0.24→58.0.25 y su lockfile. Conservar el resto de dependencias directas y la implementación005/006; verificar tsc/lint/tests/Doctor y documentar resultados antes de publicar. No confundir esta autorización con cierre funcional de autenticación ni validación física P2/P3. Referencia de37 archivos protegidos fuera del ajuste:34da1bb65f37b94cb59fa367ee96e0c589d34744.
