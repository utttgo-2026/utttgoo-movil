# Specification 005 — AWS-API-INTEGRATION

## Información General
- **ID**: 005-aws-api-integration
- **Nombre**: AWS-API-INTEGRATION
- **Versión**: 1.0
- **Fecha**: 2026-11-11
- **Estado**: EN PRUEBAS — infraestructura implementada; autenticación real bloqueada por HTTPS y contratos, Expo Go pendiente.

## 1. Objetivo
Conectar progresivamente el cliente Expo SDK 58 con la API AWS usando fetch, TypeScript estricto y el único AuthContext existente. Conservar UI Figma, navegación y mocks del comprador.

## 2. Requisitos y aceptación
| ID | Requisito | Criterio de aceptación |
|----|-----------|------------------------|
| AWS-001 | URL en .env y lectura estática centralizada | Sin IP en servicios, sin fallback silencioso; error de configuración ante URL inválida |
| AWS-002 | GET /health público | Registrar status, headers, JSON y entorno; no inferir éxito móvil desde curl |
| AWS-003 | Cliente GET/POST/PATCH JSON | Preservar status/headers; soportar 200/201/202 y errores HTTP, timeout y red |
| AWS-004 | Protección de transporte | Solo /health público por HTTP; ninguna contraseña/JWT debe llegar a fetch sobre HTTP |
| AWS-005 | Servicios tipados de todos los endpoints acordados | Solicitudes conocidas exactas; respuestas desconocidas como unknown, sin DTO inventado |
| AWS-006 | JWT con SecureStore | No contraseñas; lectura/escritura/eliminación verificadas mediante tests; no fallback AsyncStorage |
| AWS-007 | Única sesión en AuthContext | Sin usuario ficticio/signInAs; restauración validada remotamente antes de autenticar; logout invalida operaciones pendientes |
| AWS-008 | Correo institucional | Dominio exacto @uttt.edu.mx; rechazar dominios parecidos, subdominios y formato incorrecto |
| AWS-009 | PATCH con listas blancas | Solo displayName/phone o businessName/description/pickupPoint; rechazar null, extras y tipos incorrectos |
| AWS-010 | Errores centralizados | 400/401/403/404/422/500 diferenciados; no deducir correo no verificado de todo 401 |
| AWS-011 | Registro aceptado no autentica | 202 implica pendiente de verificación; no OTP local ni relación Supabase/AWS inventada |
| AWS-012 | Migración no destructiva | No leer, reusar ni borrar automáticamente @uttgo:users; conservar datos hasta estrategia explícita validada |
| AWS-013 | Pantallas existentes | Adaptar manejadores/estados de auth y perfil; conservar componentes y catálogo/carrito/pedidos/QR |
| AWS-014 | Evidencia de calidad | tsc, lint, Jest y Doctor ejecutados; distinguir tests con mocks y AWS/Expo Go real |

## 3. Endpoints acordados
| Método | Ruta | Auth | Solicitud / status esperado |
|--------|------|------|-----------------------------|
| GET | /health | Público | 200; contrato observado: status y checks mongodb/redis |
| POST | /api/v1/auth/register | Público, HTTPS | email, password, displayName; 202 |
| POST | /api/v1/auth/login | Público, HTTPS | email, password; 200, JWT sin estructura documentada |
| GET | /api/v1/auth/me | Bearer | 200 |
| GET/PATCH | /api/v1/users/me | Bearer | PATCH solo displayName, phone; 200 |
| POST | /api/v1/sellers/activation-requests | Bearer | businessName, description, pickupPoint; 201 o 200 |
| GET/PATCH | /api/v1/sellers/me | Bearer | PATCH solo businessName, description, pickupPoint; 200 |
| GET | /api/v1/sellers/{sellerId} | Público | 200; en esta etapa también requiere HTTPS |
| GET | /api/v1/admin/users | Bearer/admin | page, pageSize; 200; sin filtros inventados |

## 4. Dependencias y bloqueos
- HTTPS y certificado válidos: no enviar credenciales ni JWT mientras la URL configurada sea HTTP.
- Falta JSON real/OpenAPI: login (ubicación del JWT), identidad/roles, perfiles, vendedores, paginación y errores. No activar adaptadores de sesión sin contrato verificado.
- Supabase: falta flujo de verificación, callbacks, reenvío y relación con AWS; el backend no genera OTP.
- Faltan límites de longitud, formato de phone y política de contraseña. Validación local estructural solamente; no afirmar validación completa de formatos/límites.
- Falta contrato de recuperación y refresh; no implementar endpoints supuestos.
- Expo Go físico: no marcar integración COMPLETADA hasta prueba manual y flujos HTTPS reales.

## 5. Estrategia de pruebas
Jest existente, fetch y SecureStore simulados: URL, métodos, cuerpos, Bearer, bloqueos antes de fetch, respuestas/status, JSON inválido, errores/red/timeout, listas blancas, sesión, carreras de logout y persistencia. Fixtures únicamente sintéticos, nunca ejemplos atribuidos al backend.

Verificación real separada: GET público /health sin credenciales desde desarrollo y, si existe dispositivo, Expo Go. Registrar restricciones nativas sin desactivar ATS/cleartext globalmente. No probar login real por HTTP.

## 6. Fuera de alcance
Productos/categorías/imágenes reales, rediseño UI, carrito/pedidos/QR, pantallas vendedor/admin, producción en tiendas y nuevo framework SDD.

## Referencias
CONSTITUTION.md, AGENTS.md, plans/005-aws-api-integration-plan.md, tasks/005-aws-api-integration-tasks.md.
