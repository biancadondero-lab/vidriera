# Vidriera — ronda 3, tanda B (entrada 3D, línea de tiempo histórica)

## Objetivo

El sitio ya se ve profesional pero, según Bianca, "no dice nada" — sobre
todo por los márgenes negros vacíos a los costados y por no tener ningún
momento realmente llamativo desde que entrás. Esta tanda suma una
identidad visual "vidriera" (vidrio, profundidad, luz dorada) como
puerta de entrada del sitio y como página dedicada a las campañas
históricas, sin tocar el resto del sitio (categorías, notas
individuales), que se queda con el lenguaje minimalista que ya
funciona.

Todas las decisiones de este documento fueron validadas visualmente con
Bianca usando mockups interactivos (companion visual de brainstorming)
antes de escribirse acá: probamos tres direcciones para el timeline
(vitrina 3D navegable, textura editorial, objeto 3D central), eligió
una mezcla de las primeras dos, después pidió extender esa misma
identidad a la entrada del sitio, y por último sumó un efecto de
transición al scrollear. Un glitch temático para "Redes y viralidad" se
propuso y se descartó explícitamente.

## Decisión técnica: 3D con CSS, no WebGL/three.js

Bianca pidió "3D" inspirándose en three.js y un editor de escenas 3D.
La decisión de esta ronda es lograr el mismo lenguaje visual (vidrio,
profundidad, perspectiva, luz) con **transformaciones 3D de CSS**
(`perspective`, `rotateX/Y`, sombras en capas) en vez de una escena
WebGL real. Es una elección deliberada, no un atajo:

- Los mockups que Bianca aprobó están hechos enteramente con esta
  técnica — el resultado visual es el que ya vio y le gustó.
- Carga instantánea y funciona en cualquier celular, sin librerías
  externas ni riesgo de que un motor 3D se cuelgue en un dispositivo
  viejo — crítico para un sitio que se muestra como portfolio
  profesional.
- Es mucho más fácil de mantener a futuro sin un equipo de desarrollo
  detrás.

Si más adelante Bianca quiere una escena WebGL real (objetos que se
puedan rotar libremente con el mouse, geometría 3D real), es un upgrade
posible para una ronda futura — no lo bloquea esta decisión.

## Vidriera de entrada (home)

Reemplaza el bloque destacado único actual (`ArticuloDestacado`) por
una **vidriera de tres piezas**: los 3 artículos publicados más
recientes (cualquier categoría), cada uno como una "vitrina" de vidrio
con profundidad 3D — la del medio queda al frente y bien iluminada en
dorado, las de los costados quedan en perspectiva, más tenues, como
mirar una hilera de vidrieras en una calle.

- **Full-bleed**: esta sección usa todo el ancho de la pantalla, sin
  los márgenes negros vacíos del resto del sitio.
- Cada vitrina muestra: categoría, título, y la imagen del artículo
  (o el gráfico abstracto de respaldo si no tiene) con el tratamiento
  de grano/duotono dorado descripto abajo.
- Debajo, sigue el grid bento de siempre (sin cambios), excluyendo los
  3 artículos que ya aparecieron en la vidriera.

## Efecto de scroll

Al bajar desde la vidriera de entrada hacia el grid, las tres vitrinas
grandes no desaparecen de golpe: se achican y se desvanecen
gradualmente a medida que salen de la pantalla, dando la sensación de
que "se acomodan" hacia el grid en vez de cortar seco. Es un efecto
puntual (una sola vez, al entrar a la página), no scroll-jacking de
toda la página. Con `prefers-reduced-motion` activado, el efecto se
desactiva por completo: la sección se ve estática, sin animación
ligada al scroll.

## Tratamiento de imagen "grano y dorado"

Técnica inspirada en effect.app (grano, duotono), lograda con CSS puro
sobre la imagen real del artículo (o el gráfico abstracto si no tiene
imagen): una superposición de textura sutil (líneas diagonales finas,
muy tenues) más un filtro de color que empuja la imagen hacia
blanco/negro con un tinte dorado, en vez de mostrarla a color pleno.
Se usa únicamente dentro de las vitrinas (entrada del home y línea de
tiempo) — las tarjetas del grid bento y las notas individuales
conservan su tratamiento de imagen actual sin cambios.

## Línea de tiempo histórica (página nueva)

Nueva página, accesible desde la navegación, con las campañas de
"Campañas históricas" (hoy 9 artículos) ordenadas cronológicamente por
fecha (la más vieja primero — al revés que el resto del sitio, que
siempre muestra lo más nuevo primero) y presentadas como una fila
horizontal de vitrinas navegable (scroll horizontal), cada una con su
año destacado arriba, usando el mismo componente de vitrina que la
entrada del home. Full-bleed, igual que la entrada del home.

## Fuera de alcance (confirmado con Bianca)

- Efecto glitch temático en "Redes y viralidad" — se mostró como
  opción y se descartó explícitamente a favor del efecto de scroll.
- Escena WebGL real (three.js) — decisión técnica de esta ronda, ver
  arriba; posible ronda futura.
- Cualquier cambio a categorías, notas individuales, o al pipeline de
  aprobación de contenido — esta ronda es puramente de home + una
  página nueva.

## Alcance técnico

- `src/lib/articles.ts`: dos funciones puras nuevas —
  `separarPrimeros(articulos, cantidad)` (generaliza
  `separarDestacadoPrincipal` a N elementos, usada para los 3 de la
  vidriera de entrada) y `ordenarPorFechaAsc(articulos)` (orden
  cronológico ascendente, usada solo en la línea de tiempo).
- `src/components/VidrieraVitrina.astro`: componente compartido de una
  sola "vitrina" (vidrio 3D, imagen con grano/dorado, categoría,
  título, año opcional) — lo usan tanto la entrada del home como la
  línea de tiempo.
- `src/components/VidrieraEntrada.astro`: la vidriera de 3 piezas del
  home, con el efecto de scroll (JS del lado del cliente, sin
  librerías externas, respeta `prefers-reduced-motion`).
- `src/pages/index.astro`: usa `VidrieraEntrada` en vez de
  `ArticuloDestacado`.
- `src/components/ArticuloDestacado.astro`: se elimina (reemplazado,
  sin otros usos en el sitio).
- `src/layouts/BaseLayout.astro`: suma un slot opcional para contenido
  full-bleed antes del `<main>` centrado — no cambia nada para las
  páginas que no lo usen.
- `src/pages/linea-de-tiempo.astro`: página nueva.
- `src/components/Header.astro`: suma el link de navegación a la línea
  de tiempo.
- Sin cambios al pipeline de aprobación (`estado`), a
  `src/lib/contenido.ts`, `src/lib/fechas.ts`, `src/lib/bento.ts`, ni
  a `ArticleCard.astro`.
- Verificación visual en navegador (desktop y ~400px), incluyendo
  probar el sitio con `prefers-reduced-motion` activado.
