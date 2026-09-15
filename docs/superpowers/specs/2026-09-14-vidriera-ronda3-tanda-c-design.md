# Vidriera — ronda 3, tanda C (globo mundial, comparador de campañas)

## Objetivo

El sitio ya tiene identidad visual fuerte (vidrieras 3D, entrada, timeline,
revelado al scrollear) pero sigue organizado únicamente como
categoría → artículo. Esta tanda suma dos formas nuevas de recorrer el
mismo contenido: un **globo mundial interactivo** con las 32 notas
ubicadas por país, y un **comparador de campañas** lado a lado.

Todas las decisiones visuales de esta tanda fueron validadas con Bianca
usando mockups interactivos antes de escribirse acá: se probaron tres
estilos de mapa (constelación, continentes de puntos, contorno), eligió
la constelación pero pidió que fuera un **globo 3D real** que se gira
arrastrando, cubriendo **todas** las notas del sitio (no solo las
históricas), con los continentes claramente reconocibles, y con la
misma animación de entrada al scrollear que ya tiene el resto del
sitio. El comparador de campañas se aprobó por descripción, sin mockup.

## Globo mundial interactivo

### Qué se ve

Una esfera oscura con la silueta de los continentes (textura real de
mapa, tratada en el mismo grano/dorado que las vitrinas — no un mapa de
Google genérico) que gira al arrastrarla con el mouse o el dedo. Cada
una de las 32 notas aparece como un punto dorado brillante en su país,
con la **forma** del punto indicando la categoría (círculo, diamante,
etc. — sin colores nuevos, ver Alcance técnico). Tocar/cliquear un
punto lleva directo a esa nota.

### Cómo se ubica cada nota

Se suma un campo nuevo por artículo: el país al que corresponde esa
campaña o noticia. Para casos claros (una campaña de una marca) es el
país de origen de la marca/campaña; para notas de tendencias/datos sin
un país obvio, se usa el país de la fuente citada (ej. un reporte de
HubSpot → Estados Unidos). Se retrofittea a los 32 artículos existentes
— ninguno queda sin país, así el globo siempre muestra el sitio
completo.

### Full-bleed y animación de entrada

Página nueva, accesible desde la navegación, full-bleed (igual que la
entrada del home y el timeline). El bloque del globo entra con la misma
animación de "vidriera que se endereza" al scrollear que ya tienen las
tarjetas del grid.

## Comparador de campañas

Página nueva con dos selectores — elegís dos artículos cualesquiera del
sitio y se muestran lado a lado: imagen, categoría, título, resumen,
cita destacada (si tiene), fecha. Sin necesidad de elegir de antemano
qué se puede comparar — cualquier combinación de los 32 artículos es
válida. Selección y comparación ocurren en el cliente (sin recargar
página); los datos de los 32 artículos se pasan una sola vez al cargar
la página.

## Alcance técnico

- **Sin WebGL/three.js**, consistente con la decisión técnica ya
  tomada en la ronda anterior. El globo se logra con una imagen de
  mapa equirectangular (silueta de continentes, sin fronteras
  políticas, fuente: Wikimedia Commons, licencia CC-BY-SA) usada como
  textura de fondo dentro de un contenedor circular, con
  `background-position-x` desplazado por JS al arrastrar (técnica
  clásica de "globo giratorio" sin geometría 3D real) más un degradé
  radial encima para dar sensación de esfera (sombra en los bordes,
  brillo arriba a la izquierda). Los puntos de cada nota se reposicionan
  en cada frame de arrastre según su longitud relativa a la rotación
  actual, con opacidad reducida cerca de los bordes (simula que "da la
  vuelta" al otro lado del globo).
- La imagen del mapa se trata con el mismo filtro grano/dorado que ya
  usan las vitrinas (`grayscale` + `sepia`), no a color real — así se
  ve del sitio, no un mapa genérico.
- **Diferenciación por forma, no color**: los puntos usan 2-3 formas
  simples (círculo, diamante, cuadrado) repartidas por categoría — cero
  colores nuevos, todo en el dorado de acento existente.
- Nuevo campo opcional `pais: string` en el schema (clave hacia una
  tabla de países), retrofitteado a los 32 artículos existentes.
- Nueva tabla `src/lib/paises.ts` con nombre + latitud/longitud
  aproximada de cada país usado — no hace falta geocodificación real,
  alcanza con una tabla chica de los ~15-20 países que efectivamente
  aparecen.
- El mecanismo de "revelado al scrollear" (hoy solo en las tarjetas del
  grid) se extrae a una clase reutilizable para que el globo y el
  comparador también puedan usarlo, sin duplicar la lógica.
- Sin cambios al pipeline de aprobación (`estado`), a
  `src/lib/contenido.ts`, `src/lib/fechas.ts`, `src/lib/bento.ts`, ni a
  las páginas de categoría/artículo individuales.

## Fuera de alcance (confirmado con Bianca)

- Geocodificación real por artículo (se usa país, no coordenadas
  exactas de cada campaña).
- Un motor 3D real (WebGL/three.js) — el globo es una simulación con
  CSS + JS, no una esfera 3D geométrica real.
- Filtros o búsqueda avanzada en el comparador — cualquier combinación
  de los 32 artículos ya es válida sin restricciones.
