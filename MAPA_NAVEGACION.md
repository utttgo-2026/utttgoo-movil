# MAPA_NAVEGACION.md  

## Ventas flujo general

**Autenticación**  
```
Splash
 └→ Bienvenida
     ├→ Iniciar sesión
     │    ├→ (validasi) → Home comprador (UI-006)  
     │    └→ Registrar → Registro (UI-004)  
     └→ Registro → (email verificación)  
```

### Buyer Flow
```
UI-006 (Home) → 
  • Buscar → UI-007 (Buscar)
  • Categoría → UI-012 (Categoría)
  • Disponible ahora → UI-010 (Disponibles)
  • Detalle alimento → UI-013 (Detalle alimento)
  • Agregar a carrito → (Cart - se utilizara pantalla no presente)
  • Confirmar pedido → UI-016 (Confirmar pedido)
  • Inicio de pedido generado → UI-017 (Pedido generado)
  • Mis pedidos → UI-019 (Mis pedidos)
      • Detalle de pedido → UI-020 (Detalle seguimiento)
      • Calificar pedido → UI-021 (Calificar pedido)
  • Notificaciones → UI-024 (Notificaciones)
  • Mi perfil → UI-025 (Mi perfil)
      • Edición → UI-026 (Editar perfil)
  • Logout → volver a Bienvenida
```

### Seller Flow
```
UI-029 (Dashboard) →
  • Mis alimentos → UI-035
      • Agregar → UI-036
      • Editar → UI-037
  • Pedidos recibidos → UI-038 (lista)  
      • Cerrados → UI-038 (Filtro) 
      • En curso → UI-038 (Filtro) 
      • Entregados → UI-038 (Filtro) 
      • Seleccionar → UI-039 (Detalle)
  • Pedidos enviados? (no presente)
  • Perfil → UI-014 (Perfil del vendedor)
  • Activación → UI-027 → UI-028
  • Out Safari: Logout
```

### Admin Flow
```
UI-041 (Dashboard Admin) →
  • Administrar categorías → UI-042
  • Administrar users → UI-043
   • Moderar reseñas → UI-044
```

### Chat Flow
```
Chat General → Salvar el módulo de chat.  
  • Obtener listas de chats:  
      • Mis chats comprador (UI-019)
      • Mis chats vendedor (UI-020?) not present – Listing UI-020 maybe held where chat list is
  • Abrir chat con comprador → UI-014/Chat con comprador – Activa
  • Abrir chat con vendedor → Chat con vendedor – Activa
  • Mensañeria -> Chat con comprador – Cerrado
```

### Estados genéricos  
Los archivos 05_Estado* son usados como pantallas de fallback para los estados negativos y se enlazan desde los puntos cuando la condición se cumple.  

## Observaciones
1. Se separan los flujos por rol.  
2. UX se mantiene con Expo Router, con rutas establecidas a las UIs enumeradas.  
3. Los flujos de chat y estado se deberán integrar con la lógica de navegación en la implementación futura.
