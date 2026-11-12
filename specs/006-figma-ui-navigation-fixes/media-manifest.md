# Manifiesto de medios — P3 / Etapa006

Preparación y consulta de fuentes: **2026-11-12**. Estado **EN PRUEBAS**. Registro canónico: `src/data/catalog/foodMedia.ts`; consumidores mediante `FoodImage`. Hay **21 ids cubiertos:10 con foto y11 con marcador neutro pendiente**, no21 fotos terminadas.

## Procedencia y permisos
- Las ocho alternativas Pexels tienen página individual y autor identificados abajo. [Licencia Pexels](https://www.pexels.com/license/) consultada: uso en apps y modificaciones permitidos; no implica respaldo del fotógrafo ni que sean fotos del vendedor. Son ilustraciones del catálogo mock, no evidencia de ingredientes/porciones reales.
- Las cuatro imágenes Figma son **recortes temporales de capturas del proyecto**, no exports fotográficos individuales. Autor y licencia externa **no informados**; no se inventa una licencia libre. Pendiente obtener exports individuales y su procedencia. Originales en `../UTTT-Go/` intactos.
- No se incorporaron archivos Commons cuyo autor/licencia o correspondencia con el alimento no pudieron comprobarse. Sopes de Pexels sin pollo confirmado tampoco se usaron para Sopes de Pollo.
- Ningún consumidor descarga fotos externas al ejecutar la app. Las21 URLs viejas de `FoodItem.image` y el diccionario por nombre de FoodCard fueron retirados como fuentes paralelas.

## Inventario por producto (21)
Todos los archivos están en `src/assets/images/foods/`. T=`<id>-thumb.jpg`, D=`<id>-detail.jpg`. Dimensiones y bytes exactos; hashes y URLs de descarga en `media-assets.generated.json`. P=Pexels License; F=recorte de referencia del proyecto, autor/licencia externa pendientes; N=sin imagen, sin licencia aplicable.

| id / alimento | Fuente / autor | Permiso | T px / D px | T bytes / D bytes | Estado / limitación |
|---|---|---|---|---|---|
| food-1 Chilaquiles con Huevo | [37074229](https://www.pexels.com/photo/37074229/) / Iván Hernández-Cuevas | P | 315×420 /720×960 | 57546 /214820 | Alternativa, chilaquiles con huevo |
| food-2 Hotcakes con Fruta | [376464](https://www.pexels.com/photo/376464/) / Ash Craig | P | 420×256 /960×586 | 27627 /97966 | Alternativa con fruta, no foto del vendedor |
| food-3 Huevos Rancheros | [31823016](https://www.pexels.com/photo/31823016/) / Allan González | P | 280×420 /640×960 | 29770 /106135 | Alternativa |
| food-4 Avena con Frutos Rojos | [4725753](https://www.pexels.com/photo/4725753/) / Polina Tankilevitch | P | 280×420 /640×960 | 15408 /57480 | Alternativa con frutas, no receta exacta |
| food-5 Torta de Milanesa | UI-013 Detalle alimento.png / no informado | F | 358×230 /358×230 | 28601 /28601 | Temporal, resolución limitada |
| food-5b Enchiladas Verdes | UI-037 Editar alimento.png / no informado | F | 358×150 /358×150 | 19755 /19755 | Temporal, resolución limitada |
| food-5c Mole Poblano con Pollo | [27603300](https://www.pexels.com/photo/27603300/) / Snappr | P | 420×280 /960×640 | 44549 /174379 | Alternativa de mole, no porción real |
| food-5d Caldo de Res | Pendiente de foto apropiada y procedencia | N | — | 0 | Marcador neutro |
| food-6 Quesadillas de Hongos | Pendiente de variante hongos | N | — | 0 | Marcador neutro, nunca pizza |
| food-7 Tacos de Canasta | Pendiente de variante de canasta | N | — | 0 | Marcador neutro |
| food-7b Sopes de Pollo | Pendiente de variante pollo | N | — | 0 | Marcador neutro |
| food-7c Gorditas de Chicharrón | Pendiente de variante chicharrón | N | — | 0 | Marcador neutro |
| food-8 Agua de Horchata | [5946635](https://www.pexels.com/photo/5946635/) / Charlotte May | P | 280×420 /640×960 | 23403 /78999 | Página identifica horchata con anís; ilustrativa |
| food-8b Agua de Jamaica | [17429050](https://www.pexels.com/photo/17429050/) / Jonathan Reynaga | P | 280×420 /640×960 | 17928 /64473 | Alternativa de jamaica; foco vertical65% |
| food-8c Licuado de Plátano | [18142614](https://www.pexels.com/photo/18142614/) / Denys Gromov | P | 420×280 /960×640 | 13525 /57927 | Alternativa |
| food-9 Flan de Coco | Pendiente de variante coco | N | — | 0 | Marcador neutro |
| food-9b Gelatina de Mosaico | Pendiente de foto apropiada | N | — | 0 | Marcador neutro |
| food-9c Arroz con Leche | Pendiente de foto y licencia verificadas | N | — | 0 | Marcador neutro |
| food-10 Elote en Vaso | Pendiente de variante en vaso | N | — | 0 | Marcador neutro |
| food-10b Papas con Chile y Limón | Pendiente de variante chile/limón | N | — | 0 | Marcador neutro |
| food-10c Chicharrones con Salsa | Pendiente de variante cerdo/salsa | N | — | 0 | Marcador neutro |

## Recursos de página y recortes
Coordenadas `[x,y,ancho,alto]`, en píxeles de la captura390×844:
- Torta UI-013: `[16,100,358,230]`.
- Enchiladas UI-037: `[16,100,358,150]`.
- `welcome-artwork-detail.jpg`: UI-002, `[16,56,358,280]`, **358×280,42631 bytes**. Solo artwork promocional; excluye status bar, titular inferior y botones de pantalla. Conserva el texto y teléfono ilustrados de la pieza Figma, no los presenta como controles interactivos. Titular, descripción, beneficios y tres acciones son componentes nativos accesibles independientes. El archivo antiguo `welcome-hero.png` (pantalla completa) ya no se consume.
- `tortas-banner-detail.jpg`: UI-012, `[16,100,358,120]`, **358×120,20363 bytes**. Solo categoría Tortas, nunca banner de otras categorías; etiquetas pequeñas pertenecen al artwork de referencia.

## Transformaciones y carga
- Script: `node scripts/prepare-catalog-media.cjs` con `jimp-compact` ya instalado por Expo; no dependencia nueva. Descarga explícita solo en preparación, no runtime. Requiere las referencias originales para regenerar recortes.
- JPEG calidad82, resize proporcional: lado mayor máximo420 miniatura/960 detalle; **sin ampliar artificialmente los recortes Figma**. Dos resoluciones mantienen la misma foto, no variantes de comida. Los dos recortes pequeños tienen T/D de igual resolución por su límite original.
- **22 archivos,1241641 bytes (≈1,24 MB decimal/1,18 MiB)**, incluidos hero/banner y ambas resoluciones. No incluye el viejo archivo no referenciado; no es medición del APK ni memoria GPU.
- `expo-image`: `contentFit="cover"`, foco50%/50% salvo Jamaica50%/65%, proporción1.6 tarjeta/detalle y1 miniatura. Hero1.27, banner3. Marco reservado y cache local; sin transición de la foto anterior.
- Error de carga o id desconocido: fondo neutro e icono de imagen, etiqueta accesible de imagen no disponible; nunca imagen de otro alimento. `recyclingKey` más identidad React por id/foto/variante restablecen el error al cambiar producto/resolución.

## Evidencia y pendientes
- Jest verifica cobertura21 ids, assets por hash/tamaño, fallback y reciclado, y la fuente canónica en tarjeta/categoría/detalle/datos/confirmación. No verifica el decodificador ni rendimiento de un dispositivo.
- Inspección de capturas y recursos preparados; sin capturas actuales de Expo Go para comparar. Falta validación física de calidad/foco y escalas, los11 alimentos sin foto y los exports individuales Figma.
