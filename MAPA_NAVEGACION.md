# Mapa de navegación — UTTT-Go

**Registro y correo (005):** Bienvenida o Login → Crear cuenta. El acuse de registro sustituye Crear cuenta por Verificar correo en estándar y Beta. Si sales antes de verificar, Login ofrece retomar el registro reciente al escribir el correo coincidente. Tras «¡Correo verificado!», «Iniciar sesión» cierra el OTP y entrega el correo a Login con contraseña vacía; solo el éxito de Login lleva a Inicio.

## Cierre de compra y entrega (006, validación física pendiente)

- Compra en curso: Producto → Datos del pedido → Confirmar. Modificar vuelve a Datos sin apilar otra copia. Tras POST validado la pila comprador vuelve a las tabs en Mis pedidos y abre el comprobante encima. Atrás desde ahí vuelve a Mis pedidos; «Ver mi pedido» sustituye el comprobante por seguimiento. «Mis pedidos» e «Ir al inicio» cierran las pantallas del pedido. Resultado incierto permanece en confirmación y ofrece revisión sin reenvío.
- Seguimiento: detalle recuperado por GET, QR únicamente aquí y sin rutas adicionales al solicitarlo. Entregado retira el QR y ofrece Mis pedidos/Inicio. No cambia el Back de consultas sin finalizar ni se intercepta BackHandler.
- Vendedor: Perfil/Mi negocio → Pedidos recibidos → Detalle. Cambios y escáner dentro del detalle; Delivered confirmado retira el escáner y ofrece regresar a Pedidos recibidos o Mi negocio. Reabrir consulta nuevamente.
- Publicación: «Ver mis alimentos» desde éxito cierra el formulario. Logout confirmado vuelve a Bienvenida mediante `dismissTo`; login/OTP conservan su navegación SDD. No se cambian layouts, anchors, duración nativa de animaciones ni contratos.

## Pedidos reales (003/007, en pruebas)

Catálogo → `/buyer/order-data` → `/buyer/confirm-order` →
`/buyer/order-created?id=…` → `/buyer/order-tracking?orderId=…` o `/buyer/orders`.
Cancelar desde Pendiente usa `/buyer/cancel-order?orderId=…`.
Perfil (Seller) o Mi negocio → `/seller/orders` → `/seller/order-detail?orderId=…`.
El escáner de entrega está integrado en el detalle propio cuando está Listo; el QR real
se solicita en seguimiento/recibo solo después de Ready. Sin credenciales en rutas,
sin crear pedidos por navegar y sin Stack.Screen redundantes. Ver guía
`docs/PEDIDOS_REALES_EXPO_GO.md`; las exclusiones históricas006 de vendedor no describen
esta continuación007. Calificación/avisos permanecen fuera de este cierre de pedidos.

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
