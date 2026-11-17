# Mapa de navegación — UTTT-Go

Referencias verificadas: `../UTTT-Go/`. P0/P1 implementados y probados en router en memoria; verificación física pendiente. Etapa005 EN PRUEBAS; no inferir rutas implementadas a partir de capturas de vendedor/admin.

```text
Splash (UI-001) → Bienvenida (UI-002)
  ├─ Login (UI-003) / Registro (UI-004)
  │   └─ Recuperación/Verificación: bloqueadas por contrato005
  └─ Seguir explorando → /buyer (invitado, sin sesión ficticia)

Buyer Stack
  (tabs): Inicio /buyer [UI-006]
          Buscar /buyer/search [UI-007]
          Pedidos /buyer/orders [UI-019] — sesión requerida
          Avisos /buyer/notifications [UI-024] — sesión requerida
          Perfil /buyer/profile [UI-025] — vista invitado o personal
  Buscar → /buyer/category?categoryId= [UI-012] → /buyer/food/[id] [UI-013]
         → /buyer/filters [UI-008] → resultados conservando selección
  Disponible /buyer/available-now [UI-010] → /buyer/food/[id]
  (private): order-data [UI-015] → confirm-order [UI-016] → order-created [UI-017]
             order-tracking [UI-020] → rate-order [UI-021] / cancel-order [UI-022]
```

Los grupos no cambian URLs. Back con historial vuelve al origen; sin historial, fallback público al catálogo/bienvenida. No usar login como alternativa genérica ni crear sesiones ficticias. Raíces sin historial pueden salir normalmente en Android; diferenciar de error de ejecución.

UI-015 representa revisión de carrito/pedido; no hay referencia verificada de otra pantalla independiente de carrito. UI-014 (vendedor público), UI-026 (edición), Demo01/02, vendedor UI-027..039, admin UI-041..044 y chats quedan fuera de006 P0/P1. No inventar enlaces a rutas todavía inexistentes.
