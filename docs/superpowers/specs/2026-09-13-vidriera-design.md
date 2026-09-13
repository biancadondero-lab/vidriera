# Vidriera — diseño del sitio de noticias de marketing

## Objetivo

Sitio de noticias sobre marketing (campañas, tendencias, datos del sector)
que sirve dos propósitos a la vez:

1. **Portfolio personal** de Bianca (estudiante de Marketing) — debe verse
   profesional y prolijo, algo que pueda mostrar con orgullo.
2. **Sitio real y vivo**, con contenido nuevo agregado regularmente.

Bianca no programa y no redacta contenido. Su rol es: definir temas de
interés, revisar borradores generados por Claude, y aprobar publicación.

## Alcance de contenido

- **Idioma:** español.
- **Cobertura:** mezcla de campañas/marcas locales y regionales
  (Argentina/LatAm) y grandes campañas globales, traducidas/adaptadas.
- **Categorías (todas activas desde el arranque):**
  1. Campañas históricas/icónicas
  2. Campañas actuales / novedades — **foco principal**
  3. Redes sociales y viralidad
  4. Tendencias y datos del sector — **foco secundario**
  5. Marketing digital y publicidad

## Arquitectura técnica

- **Framework:** Astro (generador de sitios estáticos), sin backend ni
  base de datos.
- **Contenido:** Astro Content Collections. Cada artículo es un archivo
  Markdown en `src/content/articulos/`, con frontmatter:
  - `titulo`, `categoria`, `fecha`, `resumen`, `fuente` (link/nombre del
    origen de la noticia), `estado` (`borrador` | `publicado`).
- **Páginas generadas:**
  - Home: últimos artículos publicados, con foco visual en "Campañas
    actuales" y "Tendencias y datos".
  - Una página por categoría (listado filtrado).
  - Una página por artículo individual.
  - Solo se muestran públicamente los artículos con `estado: publicado`.
- **Hosting:** a definir más adelante (GitHub Pages / Netlify / Vercel
  son candidatos). No bloquea el desarrollo local.

## Diseño visual

- Estilo: mezcla de **editorial moderno** y **minimalista elegante** —
  tipografía prolija y protagonista, mucho espacio en blanco, paleta
  neutra con un color de acento fuerte, tarjetas de artículo con imagen
  destacada. Se prioriza que se vea premium/profesional por sobre lo
  colorido o juguetón.
- Responsive: debe verse bien también en celular.
- Nombre del sitio: **Vidriera**.

## Flujo de generación y aprobación de contenido

1. Un agente programado (vía skill `schedule` de Claude Code) corre
   periódicamente (2-3 veces por semana) y busca novedades de marketing
   relevantes a las 5 categorías, priorizando campañas actuales y
   datos/tendencias.
2. Por cada novedad relevante, Claude redacta un artículo en español
   (inspirado en la fuente, no traducción literal) y lo guarda como
   archivo Markdown con `estado: borrador`.
3. Bianca nunca redacta. Puede pedir "mostrame los pendientes" en
   cualquier momento y Claude resume los borradores existentes.
4. Bianca aprueba (Claude cambia `estado` a `publicado`) o descarta/pide
   ajustes por artículo. Nada se publica sin aprobación explícita.
5. Tras aprobar, se hace build del sitio y (una vez definido el hosting)
   deploy.

## Fuera de alcance (por ahora)

- Comentarios de usuarios, búsqueda avanzada, newsletter, autenticación.
- CMS visual con panel de administración (se evaluó y se descartó por
  complejidad innecesaria frente al flujo de aprobación por chat).
- Traducción automática literal de fuentes (se prefiere redacción
  propia inspirada en la noticia original).
