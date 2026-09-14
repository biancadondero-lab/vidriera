# Vidriera — ronda 2 (contenido, imágenes reales y más impacto visual)

## Objetivo

La ronda 1 dejó el sitio con una identidad visual oscura, grid tipo revista
y gráficos abstractos como placeholder de imagen. Bianca la aprobó, pero
sigue sintiendo el sitio "básico": pocas noticias, notas cortas, y sin
imágenes reales. Esta ronda suma contenido real, imágenes reales, y más
impacto visual, sin tocar el modelo de aprobación de contenido ya
existente (ella sigue sin redactar, y sigue aprobando antes de publicar).

## Imágenes

- **Fuente principal**: logos/imágenes oficiales de marca alojados en
  Wikimedia Commons (acceso libre, URLs estables, no requiere subir
  archivos con derechos dudosos al repo).
- **Fuente secundaria**: para artículos de "Tendencias y datos" sin una
  marca puntual asociada, foto de banco gratuito (Unsplash/Pexels)
  relacionada al tema.
- **Respaldo**: si un artículo puntual no consigue una imagen adecuada,
  se queda con el gráfico abstracto actual (`.grafico-abstracto`) en vez
  de dejar un espacio roto o vacío.
- Las imágenes se referencian por URL externa en el campo `imagen` del
  frontmatter (ya existe en el schema, hoy sin uso visual). No se
  descargan ni se guardan copias locales.
- `ArticleCard.astro` y el nuevo bloque destacado (hero) pasan a renderizar
  `<img src={imagen}>` cuando el campo está presente, con `loading="lazy"`
  y un fundido de aparición al cargar (respeta
  `prefers-reduced-motion` igual que las animaciones existentes). Cuando
  `imagen` no está presente, se sigue usando `.grafico-abstracto` como
  hoy.

## Contenido

- **25 artículos nuevos**, sumados a los 7 existentes (total 32),
  distribuidos con foco en las categorías que más le interesan a Bianca:
  - Campañas actuales: 6
  - Tendencias y datos: 6
  - Campañas históricas: 6
  - Redes y viralidad: 4
  - Marketing digital: 3
- Los artículos nuevos son más largos y detallados que las 7 semillas
  actuales (varios párrafos de cuerpo, no solo un resumen corto),
  investigados vía WebSearch e inspirados en noticias reales, igual que
  el contenido existente.
- **Flujo de aprobación en lote**: todos los artículos nuevos se crean
  con `estado: borrador` (igual que siempre — Bianca no escribe, pero
  aprueba antes de publicar). En vez de que ella revise 25 archivos uno
  por uno, se le entrega un listado resumen (título + tema + categoría
  de cada borrador) para que apruebe en bloque o marque cuáles sacar o
  corregir. Recién ahí se cambia `estado` a `publicado` en los
  aprobados.

## Visual — más impacto

- **Bloque destacado (hero)** arriba del todo en el home: imagen grande
  + título grande, para el artículo más relevante del momento. Debajo,
  sigue el grid bento actual con el resto de las noticias.
- **Tipografía con más carácter**: títulos más grandes en el home y en
  las tarjetas, manteniendo la fuente serif de display ya usada; algún
  detalle adicional en el color de acento dorado en puntos clave (por
  ejemplo, la etiqueta de categoría o un separador), sin sumar colores
  nuevos.
- **Movimiento sutil adicional**: fundido de aparición al cargar cada
  imagen real, y una animación leve (subrayado o resalte) al pasar el
  mouse por los enlaces de categoría en la navegación. Se mantiene todo
  lo descartado en la ronda 1: sin spotlight que sigue al cursor, sin
  scroll-reveal, sin transiciones animadas entre páginas.
- **Accesibilidad**: las animaciones nuevas respetan
  `prefers-reduced-motion` igual que las existentes (regla ya global en
  `global.css`, sin necesidad de duplicarla).

## Alcance técnico

- `src/content.config.ts`: sin cambios de schema (`imagen` ya existe
  como campo opcional).
- 25 archivos nuevos en `src/content/articulos/`, `estado: borrador`.
- `src/components/ArticleCard.astro`: renderizar `<img>` real cuando
  `imagen` está presente, con fundido de carga; mantener
  `.grafico-abstracto` como respaldo.
- Nuevo componente `src/components/ArticuloDestacado.astro` (o similar)
  para el bloque hero del home.
- `src/pages/index.astro`: sumar el bloque destacado arriba del grid
  bento existente, eligiendo el artículo más reciente publicado (mismo
  criterio simple que ya usa la selección de destacados actuales, sin
  agregar un campo nuevo de "es hero" al contenido).
- `src/components/Header.astro`: animación leve de hover en los enlaces
  de categoría de la navegación.
- Ajustes de tipografía (tamaños, algún detalle de acento) en
  `global.css` y/o en los componentes de tarjeta/hero — sin cambiar la
  paleta de colores ya definida.
- Sin cambios al pipeline de aprobación (`estado: borrador/publicado`
  sigue siendo el único gate de visibilidad pública), ni a la lógica
  pura ya probada (`articles.ts`, `contenido.ts`, `fechas.ts`,
  `bento.ts`).

## Fuera de alcance (confirmado con Bianca)

- Selector de tema claro/oscuro.
- Efectos ya descartados en ronda 1 (spotlight, scroll-reveal,
  transiciones de página).
- Pipeline automatizado de generación/aprobación periódica de contenido
  (queda para una ronda futura).
- Dominio propio (`vidriera.com`) — queda pendiente, sin fecha.
