# Vidriera — ronda 3, tanda A (identidad visual por tipo de nota)

## Objetivo

El shell del sitio (tema oscuro, destacado grande, grid tipo revista) ya
no se siente aburrido, pero todas las notas se ven idénticas por dentro
sin importar el tipo de contenido. Esta tanda suma cuatro bloques
opcionales que le dan personalidad propia a cada categoría, reutilizando
datos y frases que ya están escritos en los artículos existentes — no
hace falta investigar contenido nuevo.

Fuera de alcance de esta tanda (quedan para la tanda B): línea de
tiempo histórica interactiva, comparador de campañas.

## Los cuatro bloques

Cada uno es un campo opcional nuevo en el frontmatter de un artículo.
Un artículo sin ese campo no muestra el bloque — no rompe nada de lo
que ya existe.

### 1. Cita o dato destacado

Campo `citaDestacada: string`. Se muestra como un bloque grande, en la
tipografía serif de display y color de acento, entre la fecha y el
cuerpo del artículo — el tratamiento "pull quote" de una revista.

**Alcance**: los 32 artículos existentes, cada uno con su frase o cifra
más fuerte extraída de su propio texto (ya escrito, no requiere
investigación nueva).

### 2. "En números"

Campo `enNumeros: { etiqueta: string; valor: string }[]` (2-3
elementos). Se muestra como una tira de fichas con el valor en grande
(dorado, tipografía serif) y la etiqueta debajo, entre la fecha/cita y
el cuerpo del artículo.

**Alcance**: los 7 artículos de "Tendencias y datos" (`video-corto-mejor-roi`,
`adopcion-ia-generativa-marketing`, `adopcion-video-corto-plataformas`,
`auge-micro-influencers`, `crecimiento-retail-media`,
`escepticismo-greenwashing-consumidores`,
`fin-cookies-terceros-first-party-data`).

### 3. Termómetro de viralidad

Campos `nivelViral: number` (0-100) y `viralidadEtiqueta: string`
(ej. "Viral extremo"). Se muestra como una barra horizontal con el
puntaje y la etiqueta, cerca de la fecha.

**Alcance**: los 5 artículos de "Redes y viralidad" (`ice-bucket-challenge`,
`bereal-marcas-autenticidad`, `grimace-shake-mcdonalds-meme`,
`oreo-dunk-in-the-dark-meme-jacking`, `stanley-cup-fenomeno-tiktok`).

### 4. Antes / después

Campo `antesDespues: { antes: string; despues: string }`. Se muestra
como dos columnas comparativas al final del artículo, antes de la
línea de fuente.

**Alcance**: `marlboro-man` y `old-spice-smell-like-a-man` — las dos
historias de rebranding más claras del contenido actual.

## Orden en la página de artículo

1. Categoría
2. Título (h1)
3. Fecha
4. Termómetro de viralidad (si existe)
5. Cita/dato destacado (si existe)
6. "En números" (si existe)
7. Cuerpo del artículo (Markdown renderizado, sin cambios)
8. Antes/después (si existe)
9. Fuente

En la práctica ningún artículo combina más de dos de estos bloques a
la vez (las categorías no se superponen), así que no hay riesgo de que
una nota quede sobrecargada.

## Alcance técnico

- `src/content.config.ts`: agregar los 5 campos opcionales al schema
  (`citaDestacada`, `enNumeros`, `nivelViral`, `viralidadEtiqueta`,
  `antesDespues`), todos opcionales — compatibles con los artículos
  que no los tengan.
- Cuatro componentes nuevos en `src/components/`: `CitaDestacada.astro`,
  `EnNumeros.astro`, `TermometroViralidad.astro`, `AntesDespues.astro`.
- `src/pages/articulo/[id].astro`: renderizar los cuatro bloques de
  forma condicional, en el orden de la sección anterior.
- Todos los valores de los campos nuevos se completan retroactivamente
  en los archivos indicados arriba, extrayendo el contenido de cada
  artículo ya escrito — no se reescribe el cuerpo de ningún artículo.
- Sin cambios al pipeline de aprobación (`estado`), ni a los
  componentes de la home/categoría (`ArticleCard.astro`,
  `ArticuloDestacado.astro`), ni a la paleta de colores.
- Sin tests nuevos de lógica (no hay lógica pura nueva, solo
  componentes presentacionales); verificación visual en el navegador.

## Fuera de alcance (confirmado con Bianca)

- Línea de tiempo histórica interactiva (tanda B).
- Comparador de campañas (tanda B).
- Glosario de términos de marketing (descartado para esta ronda).
