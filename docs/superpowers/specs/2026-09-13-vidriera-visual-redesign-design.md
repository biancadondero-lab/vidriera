# Vidriera — rediseño visual (ronda 1: diseño y animación)

## Objetivo

El sitio actual (fondo claro, layout de lista simple, sin movimiento) le
resulta "demasiado simple y aburrido" a Bianca. Esta ronda rediseña la
identidad visual completa del sitio — tema, tipografía tratada, layout de
home y de categorías, y micro-interacciones — sin tocar el modelo de
contenido ni el pipeline de aprobación ya construidos.

Explícitamente fuera de alcance de esta ronda (quedan para la próxima):
agregar más artículos, agregar fotos reales de campañas.

Todas las decisiones de este documento fueron validadas visualmente con
Bianca usando mockups interactivos (companion visual de brainstorming)
antes de escribirse acá.

## Dirección visual

- **Tema oscuro** en todo el sitio, reemplazando el tema claro actual.
  Fondo casi negro, texto claro.
- **Un único color de acento**: dorado apagado (tono cálido, sin brillo/glow
  ni saturación tipo neón). Se descartó deliberadamente un acento "neón"
  cian por sentirse poco serio, y se descartó asignar un color distinto
  por categoría por ser menos minimalista — un solo acento en todo el
  sitio es la decisión final.
- **Logo**: un ícono simple de 4 paneles (evocando una vidriera/vitrina)
  en el color de acento, junto al nombre "Vidriera" completo en un solo
  color claro — no se divide la palabra en dos colores.
- **Tipografía**: se mantienen las fuentes ya cargadas (serif de display
  para títulos, sans para texto), sólo cambian los colores que se les
  aplican sobre el nuevo fondo oscuro.

## Layout de home

Pasa de la lista vertical simple actual a un **grid tipo revista
("bento")**: bloques de distinto tamaño (uno grande destacado + varios
más chicos), en vez de una columna de tarjetas todas iguales. Los
artículos destacados por categoría ("actuales" y "tendencias y datos")
ocupan los bloques más grandes; el resto ocupa los bloques más chicos.

Con las 7 semillas actuales el grid no va a estar "lleno" en el sentido
de una revista real — esa densidad llega naturalmente en la ronda 2 con
más artículos. Esta ronda deja la estructura de grid funcionando
correctamente con la cantidad de contenido que hay hoy (incluyendo el
caso de una categoría con un solo artículo).

## Layout de categoría

Cada página de categoría suma una **banda superior** con degradé sutil
en el color de acento (sin texto de otras categorías ni colores
cruzados), seguida de un grid de tarjetas de artículo con el mismo
tratamiento visual que el home.

## Tarjetas e interactividad

- Las tarjetas y bloques aparecen con una **animación de entrada suave**
  al cargar la página (aparecen con un leve desplazamiento/opacidad, no
  de golpe).
- Al pasar el mouse, una tarjeta se **levanta levemente y resalta su
  borde** en el color de acento.
- **Explícitamente descartado**: efecto de brillo que sigue al cursor,
  animaciones de aparición al hacer scroll, y transiciones animadas
  entre páginas. Bianca probó ese nivel y lo sintió "cargado" — se
  queda en el nivel anterior (solo entrada + hover).
- **Accesibilidad**: todas las animaciones deben respetar
  `prefers-reduced-motion` — si el sistema del usuario tiene activada
  esa preferencia, las animaciones de entrada y transición se
  desactivan (las tarjetas aparecen directamente, sin movimiento).

## Imágenes / gráficos

Todavía no hay fotos reales de campañas (llegan en la ronda 2). Para
que el sitio no se sienta vacío, cada tarjeta/bloque muestra un
**gráfico abstracto** (degradé/forma geométrica sutil en el color de
acento sobre el fondo oscuro) en el espacio donde eventualmente irá una
imagen real — mismo tratamiento visual en todo el sitio, sin variar por
categoría (consistente con la decisión de un solo color de acento).

## Alcance técnico

- Reescritura de los tokens de diseño (`src/styles/global.css`): nueva
  paleta oscura + acento dorado, reemplazando la paleta clara actual.
- Nuevo componente de ícono de marca (SVG o CSS) en el header.
- Reestructuración del layout de `index.astro` a grid tipo bento.
- Nuevo componente de banda de categoría en
  `src/pages/categoria/[categoria].astro`.
- Rediseño visual de `ArticleCard.astro` (nuevo tratamiento de tarjeta +
  gráfico abstracto placeholder + animaciones).
- Sin cambios al modelo de contenido, al schema, a la lógica pura de
  `src/lib/articles.ts`/`src/lib/contenido.ts`/`src/lib/fechas.ts`, ni
  al flujo de aprobación de artículos — esta ronda es puramente visual.
- Sin tests nuevos de lógica (no hay lógica nueva); la verificación es
  visual, corriendo el sitio en el navegador (dev server) y revisando
  a ancho de escritorio y de celular (~400px), igual que en la
  construcción original.

## Fuera de alcance (confirmado con Bianca)

- Más artículos / contenido nuevo.
- Fotos reales de campañas.
- Spotlight que sigue al mouse, scroll-reveal, transiciones entre
  páginas.
- Selector de tema claro/oscuro — el sitio pasa a ser oscuro por
  completo, no hay alternancia.
