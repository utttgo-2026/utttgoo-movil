# Matriz Figma — Etapa 006

## Auditoría vigente tras checkpoint Bloque 1
Comparación nueva de **22 PNG originales** contra el código actual (fuenteAWS), no contra las maquetas históricas. Sin capturas de ejecución de ExpoGo: auditoría estática de diseño/capacidades, no fidelidad pixel-perfect ni prueba física. Checkpoint622tests aprobado antes de esta auditoría. Las secciones inferiores conservan el historial anterior.

Referencias abiertas: UI015,016,017,019,020,021,022,024; UI025Mi perfil-1,029,030,035,036,037; UI038Pedidos recibidos, En curso, Cerrados y Pedido entregado; UI039 yUI039-1; Detalle en curso vendedor En preparación yListo. Otras variantesEntregados/chat/estados no se declaran inspeccionadas en esta revisión.

| Referencia / contenido observado | Implementación actual y pérdida localizada | Interacción local legítima / recuperación | Dependencia real |
|---|---|---|---|
| UI015 Datos: miniatura, cantidad−/+, referencia campus, observaciones, resumen, efectivo, vendedor | `AwsOrderReview`: producto único/importeestimado/notas250; cantidad se edita en detalle, falta stepper en esta pantalla y tarjeta referencia/vendedor. B3acotado recupera panel efectivo | Cambiar cantidad/notas antes dePOST y volver a editar no exige endpoint adicional, pero validar stock y preservar preparación. No cliente multiitem | POSTorders solo productId/quantity/notes; referencia no es campo request. PickupPoint previo al pedido exige perfil público vendedor conDTO; no inventarlo |
| UI016 Confirmar: tarjetasproducto/entrega/notas/efectivo, servicio0, CTAconfirmar yModificar | Revisión simple/notes yPOSTreal, no comisionescliente; B3acotado recupera panel efectivo | Modificar pedido mediante back preservando preparación es local. No recuperar el cargo10 de la maqueta antigua: Figma muestra0 y backend calcula total | ResponseOrder despliega pickupPoint/paymentMethod/productName, hoy normalizador descarta metadata; completar lectura en3.1 |
| UI017 Generado: check, ID, total/referencia/estimado, tarjetaQR, Seguir yVolver | `AwsOrderReceipt`: IDpersistente/total/fecha solo del último201 válido; sin QR ni seguir. B3acotado recupera marcoQR bloqueado | Marco y explicación de credencialpendiente son locales; no codificar orderId/JSONmock como QRseguro | PayloadQR firmado/TTL/emisión/validación no publicados. Tiempoestimado no está en DTO. Seguimiento necesita GETdetail integrado |
| UI019 Mis pedidos: pedidoactual y anteriores, badges, Ver seguimiento | FuenteAWS muestra `AwsOrdersPending`; maquetaFlatList solo modoMockdev | Layout/lista/paginación/enlaces porID pueden recuperarse con API existente; no inventar códigos#UG ni agrupar por estados supuestos | GETorders/mine yOrderList/OrderSummary ya publicados (total), pendiente integración, NO bloqueado por falta de endpoint |
| UI020 Seguimiento: estadoactual, timelinePendiente/Aceptado/Preparación/Listo/Entregado, horas, resumen/chat yreglaCancelar | FuenteAWS muestra pendiente; maqueta usa primerpedido mock, no se activa productivamente | Mostrar estado literal/fechas entregadas es lectura legítima; no fabricar etapas completadas ni horas | GETorders/{id}/OrderResponse publicado. Enum/transiciones e historial de eventos no publicados; DTO solo created/updated/delivered/completed |
| UI021 Calificar: pedidoentregado, estrellas/comentario/chips, una reseña | FuenteAWS pendiente; formulario mock no persistente | Selección/validación local de borrador puede prepararse, nunca anunciar publicada | No endpoint reseña ni reglas ownership/única reseña publicados |
| UI022 Cancelar: confirmaciónterminal, Sí/No y reglaPending | FuenteAWS pendiente; maqueta navega sin mutación | Abrir/cerrar confirmación es local; No mantiene contexto | No endpoint cancelación/transición/409version publicado; no cancelar localmente |
| UI024 Avisos: Hoy/Anteriores, pedidoestado/reseña/menú, marcarleídos | Hallazgo: `notifications.tsx` usa mockNotifications incluso enAWS autenticado. B3acotado retira esa apariencia productiva y conserva maqueta solo devexplícito | Agrupación/filtros puramente visuales son locales; no inferir eventos ni persistencia de leídos | No endpoints notificaciones/lectura/markread publicados |
| UI029 Dashboard: switchRecibirpedidos, métricas12/$846/4.8, cola, modo comprador, cuatro tabs | `/seller` es Mi negocio/onboarding corregido, no dashboard. No hay panel/cola/métricas ni tabs vendedor | Shell de dashboard y links/modocomprador pueden hacerse sinlogout y sin datosinventados; requiere plan de ownership de rutas | Métricas/horario/recepción global no publicados. No usar estado de producto para simular disponibilidad del negocio |
| UI030 Mi negocio: foto, nombre/descripción/ubicación/teléfono/Guardar | Lectura GETActive real, campos no editables; altausa businessName/description/pickupPoint. Phone/storeName no contratados | Edición local de campos confirmados puede prepararse | PATCHsellers/me existe pero schemaJsonElement/respuesta sinDTO; teléfono ymedia sincontrato |
| UI035 Mis alimentos: lista miniaturas/precio/vendedor, Agregar, tabAlimentos | Lista IDscreados/consultados de sesión +consultaIDpropio; precio/stock/status reales, no lista privada completa | Navegar alta/editar y conservarIDs es legítimo | GETpúblico no equivale listado propio; no filtro sellerId/lista privada confirmado, Paused puede ocultarse tras reinicio |
| UI036 Agregar: bloqueAgregar foto, nombre/descripción/precio/stock−/+, agotado/publicar | AltaAWS real categoría/ingredientes/stockinput ypreviewlocal; foto omitida | Stepperstock y presentación de validación se pueden recuperar sin endpoints nuevos. Agotado stock0 yPaused no son la misma operación | POSTproducts201 completo y categoríasGET confirmados; fotos S3Fase05. No enviar URLmock |
| UI037 Editar: foto/nombre/descripción/precio/error/agotado/Guardar ypapelera | Editorprecio/stock integrado enMis alimentos, Pausar/Reactivar aparte; no pantalla completa niDELETE | Validación/campos según whitelist previamente confirmada se pueden ampliar en siguiente unidad. No confundir borrar conpausar | PATCHproductoJsonElement con whitelistdehandoff; DELETE/media no publicados |
| UI038 Pendientes/En curso/Cerrados: filtroscontadores, revisar/listo/entregados, emptyreal | No rutas ni listado depedidos vendedor actuales | Chips/lista/empty pueden reutilizarse, contadores solo de respuesta real | GETmine publica role:string pero no confirma alcanceSeller ni enumrol; confirmar autorización/ownership antes de colaSeller |
| UI039 pendiente: comprador, productos/referencia/notas/total yAceptar/Rechazar | No pantalla vendedor de detalle | Layoutlectura con respuesta real es recuperable tras confirmar accesoSeller | Aceptar/Rechazar y reserva de stock no tienen endpoints publicados |
| En preparación/Listo, UI039-1Entregado yUI038Pedido entregado | No pantallas/transiciones/scanner reales | Resumen/estado literal y éxito solo tras respuesta válida; presentación preparada no confirmaentrega | No endpoints preparar/listo/entrega/QR. DTOGET no permite inventar estados y timestamps de acciones |
| UI025Mi perfil-1 y navegaciónvendedor | Captura tiene Panel/Alimentos/Pedidos/Perfil, perfil/verificada/editar/privacidad/ayuda/logout. App conserva perfil comprador y linkQuiero vender; seller usaStacksinTabs | Navegación porrol/modo y shell deperfil son legítimas manteniendoContext único, back y logout | PerfilAWS existente sí disponible; edición/ayuda/privacidad requieren alcance; no duplicarAuthContext ni sesiónSeller |

### Decisiones de recuperación después del checkpoint
- Estado final de esta entrega: Bloque1implementado y verificado, auditoríaestática22PNG realizada, B3acotado implementado y verificado con625/625tests/40suites, tsc0errores, ESLint0errores/27warnings existentes, Doctor20/20 y diffchecklimpio. No nueva evidenciafísica. La tabla incluye el resultado de esas recuperaciones pequeñas, no declara completas laspantallas.
- Bloque3acotado a **efectivo visual**, **tarjetaQR visual bloqueada sin payload** y **avisosAWS sin fixtures presentados como reales**. No se implementa en esta entrega historia/detalle/colaSeller/dashboardcompleto; no confundirlos con backendbloqueado en su totalidad.
- Próxima unidad3.1: GETmine paginado +GETdetail porID con JWT interno, validación completa/ownership/cancelación de sesión, estados leídos literalmente y navegación UI019→UI020, preservando metadatareal. Sus endpoints yschemas están disponibles; no requieren otro diagnóstico para empezar.
- Unidad3.2: shell/tabsvendedor UI029/035/038/025-1 y acceso a productos; métricas/recibirpedidos sin datos ficticios. ColaSeller requiere confirmar significado de role y alcance/autorizaciónGETmine.
- Unidad3.3: acciones aceptar/rechazar/preparar/listo/cancelar/reseñar/entregar y QRseguro después de contratos; no realizar simulaciones de persistencia. Fotos Fase05.
- Ninguna captura con dosproductos autoriza transformar POSTsimple en pedidos múltiples. No fabricar tiemposestimados, nombres, IDs, reseñas, ventas, alertas o credencialesQR para llenar Figma.

---
## Historial de matrices anteriores (no describe el estado AWS actual)

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
