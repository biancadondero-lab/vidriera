# Vidriera — pulido de estructura, jerarquía y orden visual

## Objetivo

Bianca revisó el sitio con capturas reales y encontró que, más allá de
que las funcionalidades andan, varias piezas se sienten "raras y
baratas": el menú desordenado, las imágenes con un marco claro que no
pega con el resto, un color fuera de paleta colado en una nota, un
globo que casi no muestra el mapa, y un comparador sin ningún cuidado
visual. Esta ronda no suma funcionalidades nuevas — corrige estos
problemas concretos para que el sitio se sienta profesional y
prolijo de punta a punta.

## 1. Menú de navegación

Hoy las 5 categorías de contenido y las 3 herramientas (Línea de
tiempo, Mapa mundial, Comparador) están en una sola fila que se
desborda a una segunda línea sin ningún criterio visible. Se separan
en dos grupos:

- Fila 1: las 5 categorías, como siempre.
- Fila 2, con una etiqueta "Explorar" y una línea divisoria arriba:
  Línea de tiempo, Mapa mundial, Comparador.

## 2. Tratamiento de imágenes

El componente que muestra la imagen de cada nota (`ArticuloImagen`)
hoy le pone a **cualquier** imagen — sea foto o logo — el mismo fondo
claro con relleno alrededor. Para una foto real, eso genera un marco
blanco/crema que no tiene sentido y rompe el tema oscuro. Se
diferencia por tipo de imagen:

- **Fotos** (la gran mayoría, 26 de 32 notas): a pantalla completa
  dentro de la tarjeta, sin ningún fondo claro — la imagen llena el
  espacio de punta a punta.
- **Logos** (6 notas: Duolingo, Spotify, y 4 más): se quedan con una
  placa clara, pero chica y centrada — una "insignia" con margen
  alrededor sobre el fondo oscuro de la tarjeta, no un rectángulo
  claro ocupando todo el espacio.

La detección es automática por extensión de archivo (`.svg` = logo,
el resto = foto) — no hace falta marcar nada a mano por nota.

Las vidrieras (`VidrieraVitrina`, usadas en la entrada del home y la
línea de tiempo) ya usan la foto a pantalla completa correctamente;
solo se les sube la intensidad del filtro de blanco y negro (de 50% a
100%, antes de aplicar el tinte dorado) para que ninguna imagen futura
pueda colarse con un color fuera de paleta, como pasó ahora.

## 3. Imagen fuera de paleta

La nota de automatización de email marketing tiene un ícono 3D azul
brillante que, incluso pasado por el filtro, se sigue viendo azul —
choca con el dorado/negro de todo el sitio. Se reemplaza por una foto
de escritorio/laptop en tonos neutros, ya verificada.

## 4. Mapa mundial — más esfera, países más marcados, leyenda

Tres cambios:

- **El mapa en sí casi no se ve** hoy (la combinación de filtros lo
  deja demasiado tenue). Se cambia la técnica: en vez de aplicarle
  filtros de color a la imagen del mapa, se usa como **máscara** —
  los continentes quedan rellenos con el dorado de acento, sólido y
  nítido, y el océano queda transparente mostrando la esfera oscura
  detrás. Los países se identifican mucho mejor.
- **Sensación de esfera**: se refuerza el degradé de sombra (más
  oscuro hacia el borde, un brillo sutil arriba a la izquierda
  simulando una fuente de luz) para que el círculo se lea como un
  objeto con volumen, no como una ventana plana.
- **Leyenda**: hoy nada explica qué significa cada forma de punto.
  Se agrega una fila debajo del globo con las 5 formas y el nombre de
  su categoría correspondiente.

## 5. Comparador de campañas

Rediseño visual sin cambiar el mecanismo (elegís, se muestra):

- Los selectores pierden la flecha nativa del navegador y usan una
  propia, más prolija, acorde al resto del sitio.
- Los paneles vacíos pasan a tener un borde punteado y el texto
  centrado verticalmente, en vez de una caja negra pelada con el
  texto pegado arriba a la izquierda.

## Alcance técnico

- `src/lib/imagenes.ts`: función pura nueva `esLogo(url?: string):
  boolean` (detecta `.svg` por extensión).
- `src/components/ArticuloImagen.astro`: diferencia foto vs. logo
  usando `esLogo`.
- `src/components/VidrieraVitrina.astro`: sube la intensidad del
  filtro de blanco y negro.
- `src/content/articulos/automatizacion-email-marketing-resultados.md`:
  cambia el campo `imagen`.
- `src/components/Header.astro`: reestructura el `<nav>` en dos filas.
- `src/components/GlobeMundial.astro`: mapa por máscara, sombra
  reforzada, leyenda de formas nueva. Sin cambios al script de
  arrastre/rotación (ya corregido y verificado en la ronda anterior).
- `src/components/ComparadorCampanas.astro`: estilo de selector y de
  panel vacío.
- Sin cambios al pipeline de aprobación, al schema, ni a la lógica
  pura de artículos/países ya construida.

## Fuera de alcance

- Contenido nuevo o cambios a artículos más allá de la imagen
  reemplazada.
- Cambios al mecanismo del comparador o del globo (selección, drag,
  rotación) — solo tratamiento visual.
