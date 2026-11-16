# Specification007 — Vendedor y productos

Estado: EN PRUEBAS, alcance parcial. Continúa la infraestructura005; no existe spec vendedor previa (004 es CI/CD,006 UI comprador). No duplicar servicios, AuthContext o catálogo. Fuente visual UI027/028/030/035/036 inspeccionada y UI037 disponible como referencia. No afirmar que productos/publicación o autorización están completos.

## Contratos y límites de evidencia
Rutas confirmadas por usuario y servicio005: POST /api/v1/sellers/activation-requests (businessName,description,pickupPoint), GET/PATCH /api/v1/sellers/me, GET /api/v1/sellers/{sellerId}. Histórico OpenAPI200 activación y compatibilidad201 existente. Consulta actual GET OpenAPI HTTPS falló ECONNRESET, sin bypassTLS. No respuesta autenticada real observada ni JSON/enum/roles vendedor entregados. No inferir aprobación de POST200/201 ni ausencia de solicitud de un404.

## Requisitos
- Perfil autenticado ofrece Quiero vender; rutas seller bajo guarda existente. Invitados no consultan ni mandan datos privados. JWT solo en coordinador actual, no accesible a pantallas.
- Solicitud exacta validada (nombre2–100, descripción10–1000, punto2–200; límites frontend a alinear con backend), sin phone/roles/sellerId extras. Exclusión mutua de mutaciones en sesión; respuesta tardía tras logout no se aplica. No retries automáticos; una aceptación impide reenviar en esa sesión, fallo de red ambiguo exige consultar antes de otro intento.
- Resultado real HTTP, error fijo sanitizado y aceptación no aprobación. GETme puede ejecutarse y mostrar código; cuerpo unknown no se imprime ni interpreta como perfil/permiso. Contrato faltante explícito. Edición Mi negocio deshabilitada hasta DTO/enum/ownership verificados. Servicio PATCH existente conservado, sin llamadas automáticas.
- Roles005 actualmente solo Buyer confirmados; no ampliar Seller/Admin por adivinación. Ningún estado local concede permiso ni cambia la identidad. Tras autorización backend debe entregar DTOs ampliados de login/authme/usersme para refresco seguro; hasta entonces failclosed.
- Mis productos sin datos inventados ni falsa lista vacía de servidor. Formulario/preview efímeros no publican ni guardan en catálogo. Nombre/description/precio en centavos/categoría/imágenes/disponibilidad validados localmente; categorías reales vacías hasta contrato. Controles publicar/editar/retirar/upload deshabilitados. No producto real sin autorización y endpoint.
- Figma se conserva con componentes/tema existentes; diferencias contractuales: teléfono/imagen negocio sin soporte permanecen no editables, UI028 de activado nunca se muestra por aceptar solicitud. Sin tabs vendedor nuevos para módulos no implementados.
- Comprador conserva21 mocks, categorías/medios, rutas006 y auth005. Ningún producto draft aparece en comprador. Integración real bloqueada hasta API/identificadores persistentes/publicación/ownership.
- Solo tests simulados; tsc/lint/Jest/Doctor/diffcheck y commit local autorizado si seguro, no push/build ni altas reales automáticas.
