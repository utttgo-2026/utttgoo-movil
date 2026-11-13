# Matriz Figma — Etapa 006

Fuente: `../UTTT-Go/`. 63 PNG accesibles; el inventario anterior de66 no coincide. Referencias auth/comprador revisadas visualmente en diagnóstico, restantes inventariadas por nombre, no auditoría visual integral.

| Captura | Correspondencia verificada | Diferencia inicial / intervención P0/P1 |
|---------|----------------------------|-----------------------------------------|
| UI-001 | Splash | Conservar; no demuestra causa de cierre |
| UI-002 | Bienvenida | Hero es pantalla completa: diferido P3; conservar acceso invitado |
| UI-003 | Login con flecha | Flecha oculta: restaurar sin cambiar auth |
| UI-004/005/Verificación institucional | Registro/recuperación/verificación | Bloqueos005 intencionales, sin OTP ficticio |
| UI-006 | Grid y navegación inferior | Retirar carrusel añadido; cinco destinos |
| UI-007 | Búsqueda y categorías | Selector Figma, encabezado estable, ruta dinámica |
| UI-008 | Filtros | Selección local y conservación de parámetros, sin lógica comercial nueva |
| UI-010 | Grid disponible | Filtrado, ruta dinámica, viewport acotado |
| UI-012 | Tortas: banner/listado/filtros/orden | Sustituir segundo selector por categoría seleccionada y vacío válido |
| UI-013 | Detalle con flecha | Ruta id/fallback; fotos diferidas |
| UI-014 | Perfil vendedor público | Falta pantalla; fuera P0/P1 |
| UI-015/016/017 | Pedido/confirmación/QR | Solo organización y guardas; lógica P4 intacta |
| UI-019 | Tab pedidos y lista | Guarda y FlatList única |
| UI-020/021/022 | Seguimiento/calificar/cancelar | Flechas/fallback/guardas; estado de pedidos diferido |
| UI-024 | Tab avisos | Guarda y FlatList única |
| UI-025 | Perfil comprador | Tab y presentación anónima sin datos personales |
| UI-025 Mi perfil-1 | Variante vendedor | Panel/Alimentos/Pedidos/Perfil, no duplicado comprador |
| UI-026 | Edición compartida | Pantalla ausente, fuera P0/P1 |
| Demo01/02 | Invitado explorar/comparar | No implementar pasos adicionales en esta fase |

## Recursos y límites
Continuación P2/P3: las63 referencias han sido inspeccionadas en el conjunto del diagnóstico (26 base +37 complementarias). Se conservan los módulos ausentes como referencias, no como alcance funcional nuevo. Figma diferencia CTA52 aproximado, acciones compactas y chips; headers alineados a izquierda. Proporciones orientativas: foto grid/detalle1.6, miniatura1, banner3, hero1.27; medidas de PNG, no propiedades editables verificadas.

Se registra evidencia física parcial P0/P1:7PASS/1pendiente del usuario (ver tasks006). No existen aún resultados físicos P2/P3. La auditoría ampliada de medios encontró12 URLs404 entre20 URLs únicas de21 productos y varias fotos semánticamente incorrectas; no reducir el arreglo a resizeMode.

HEAD404 observados en diagnóstico: fotos de Huevos Rancheros, Mole, Arroz con leche y Papas con Chile/Limón. Conservadas en P0/P1 y retiradas como autoridad paralela en P3. welcome-hero coincidía por hash con UI-002 completa: su consumo se reemplazó por el recorte del artwork exclusivamente. No existen capturas actuales del dispositivo; comparación estática, no prueba física.

## Resultado P2/P3 — 2026-11-12
Layout reactivo320/360/390/430 y fontScale1/1.3/1.6/2 verificado por cálculos unitarios, no capturas nativas. Grid1/2 columnas con filas estables, Poppins/paleta conservados, texto nativo escalable y controles con alturas mínimas. Inicio/Buscar/Disponible comparten grid; Categoría usa miniaturas, Detalle foto1.6; Datos/Confirmar pedido comparten identidad por id sin modificar reglas. UI-002 usa artwork independiente y acciones/textos nativos; beneficios con Ionicons en lugar de emojis. UI-012 incorpora banner únicamente en Tortas.

UI-013 y UI-037 proporcionan recortes temporales de Torta/Enchiladas; UI-002 y UI-012 piezas hero/banner. Resolución limitada y procedencia externa no informada. Ocho alternativas Pexels y11 marcadores neutros documentados en media-manifest.md; no afirmar21 fotos resueltas ni fidelidad completa. Faltan comparación física y exports individuales originales.
