# Vidriera — ronda 2 (contenido, imágenes reales, más impacto visual) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a hero block, real images (via URL), more expressive typography, subtle new motion, and 25 new long-form articles (as `borrador`, weighted toward Bianca's favorite categories), without touching the existing publish-gate or pure-logic modules beyond one small addition.

**Architecture:** Five small visual/technical tasks (pure hero-selection logic, a shared image-or-fallback component, typography/accent pass, hero component wired into the home page, nav hover animation), followed by five content-batch tasks (one per category) that research and write real articles as `borrador`. A final wrap-up step (done by the coordinator, not a subagent) hands Bianca a summary list for bulk approval.

**Tech Stack:** Astro 7 (Content Layer API), Tailwind CSS v4, Vitest.

**Spec:** `docs/superpowers/specs/2026-09-14-vidriera-ronda2-design.md`

## Global Constraints

- Dark theme tokens in `src/styles/global.css` (`--color-fondo`, `--color-marfil`, `--color-acento`, `--color-borde`, `--color-tarjeta`) are final — no new colors.
- All animations must keep working under the existing global `prefers-reduced-motion` rule in `global.css` — never add a component-local override of it.
- `estado: borrador` is required on every new article. Nothing flips to `publicado` as part of this plan — that happens after Bianca reviews the summary list (see "After All Tasks" below).
- No changes to `src/content.config.ts` (schema already supports `imagen` as optional string), `src/lib/contenido.ts`, or `src/lib/fechas.ts`.
- New article Markdown files go in `src/content/articulos/`, one file per article, filenames as URL-friendly kebab-case slugs (matches existing seeds, e.g. `nike-just-do-it.md`) — this becomes the article's permanent `id`/URL.
- Images referenced by external URL only (`imagen: "https://..."` in frontmatter) — never download/commit image files.

---

### Task 1: Hero-selection pure function

**Files:**
- Modify: `src/lib/articles.ts`
- Test: `src/lib/articles.test.ts`

**Interfaces:**
- Consumes: existing `Articulo` type from `src/lib/articles.ts`.
- Produces: `separarDestacadoPrincipal(articulos: Articulo[]): { destacado: Articulo | null; resto: Articulo[] }` — Task 4 (index.astro) calls this on the already-published-and-sorted list to split off the hero article from the rest of the grid.

- [ ] **Step 1: Write the failing tests**

Add to `src/lib/articles.test.ts` (after the existing `describe('obtenerPublicadosOrdenados', ...)` block):

```typescript
describe('separarDestacadoPrincipal', () => {
  it('devuelve destacado null y resto vacío para lista vacía', () => {
    expect(separarDestacadoPrincipal([])).toEqual({ destacado: null, resto: [] });
  });

  it('con un solo artículo, ese es el destacado y el resto queda vacío', () => {
    const unico = crearArticulo({ id: 'unico' });
    expect(separarDestacadoPrincipal([unico])).toEqual({ destacado: unico, resto: [] });
  });

  it('con varios, el primero es el destacado y el resto mantiene el orden', () => {
    const articulos = [
      crearArticulo({ id: 'primero' }),
      crearArticulo({ id: 'segundo' }),
      crearArticulo({ id: 'tercero' }),
    ];
    const resultado = separarDestacadoPrincipal(articulos);
    expect(resultado.destacado?.id).toBe('primero');
    expect(resultado.resto.map((a) => a.id)).toEqual(['segundo', 'tercero']);
  });
});
```

Also add `separarDestacadoPrincipal` to the existing import block at the top of the test file.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/articles.test.ts`
Expected: FAIL — `separarDestacadoPrincipal is not a function` (or import error).

- [ ] **Step 3: Implement**

Add to `src/lib/articles.ts` (after `obtenerPublicadosOrdenados`):

```typescript
export function separarDestacadoPrincipal(
  articulos: Articulo[],
): { destacado: Articulo | null; resto: Articulo[] } {
  if (articulos.length === 0) return { destacado: null, resto: [] };
  const [destacado, ...resto] = articulos;
  return { destacado, resto };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/articles.test.ts`
Expected: PASS, all tests including the 3 new ones.

- [ ] **Step 5: Commit**

```bash
git add src/lib/articles.ts src/lib/articles.test.ts
git commit -m "Add separarDestacadoPrincipal for the home page hero block"
```

---

### Task 2: Shared image-or-fallback component

**Files:**
- Create: `src/components/ArticuloImagen.astro`
- Modify: `src/components/ArticleCard.astro`

**Interfaces:**
- Consumes: nothing new.
- Produces: `<ArticuloImagen imagen={string | undefined} alt={string} />` — Task 4's hero component also uses this.

**Context:** Today `ArticleCard.astro` always renders a `.grafico-abstracto` gradient div. This task extracts that into a reusable component that renders a real `<img>` (with a fade-in) when `imagen` is present, falling back to the same gradient when it isn't — so cards without a sourced image never look broken.

- [ ] **Step 1: Create the component**

Write `src/components/ArticuloImagen.astro`:

```astro
---
interface Props {
  imagen?: string;
  alt: string;
}

const { imagen, alt } = Astro.props;
---
{imagen ? (
  <img
    src={imagen}
    alt={alt}
    loading="lazy"
    class="imagen-articulo aspect-[16/9] w-full object-cover"
  />
) : (
  <div class="grafico-abstracto aspect-[16/9] w-full"></div>
)}

<style>
  .grafico-abstracto {
    background:
      radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-acento) 35%, transparent), transparent 60%),
      radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--color-acento) 20%, transparent), transparent 55%),
      var(--color-fondo);
  }

  .imagen-articulo {
    opacity: 0;
    animation: aparicion 0.5s ease-out forwards;
  }

  @keyframes aparicion {
    to {
      opacity: 1;
    }
  }
</style>
```

- [ ] **Step 2: Wire it into ArticleCard**

In `src/components/ArticleCard.astro`:

1. Add to the frontmatter imports: `import ArticuloImagen from './ArticuloImagen.astro';`
2. Replace line 17 (`<div class="grafico-abstracto aspect-[16/9] w-full"></div>`) with:
   ```astro
   <ArticuloImagen imagen={articulo.imagen} alt={articulo.titulo} />
   ```
3. In the `<style>` block, remove the now-unused `.grafico-abstracto` rule (it lives in `ArticuloImagen.astro` now). Keep `.tarjeta` and its `@keyframes entrada`.

- [ ] **Step 3: Verify visually**

Run the dev server (`npm run dev`), open the home page. Existing seed articles have no `imagen` field yet, so every card should render exactly as before (abstract gradient) — this task changes nothing visible until Task 6-10 add real `imagen` values. Confirm no console errors and no layout shift.

- [ ] **Step 4: Commit**

```bash
git add src/components/ArticuloImagen.astro src/components/ArticleCard.astro
git commit -m "Extract image-or-abstract-fallback into ArticuloImagen component"
```

---

### Task 3: Typography and accent detail pass

**Files:**
- Modify: `src/components/ArticleCard.astro`
- Modify: `src/pages/categoria/[categoria].astro`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new for later tasks — Task 4's hero component defines its own (larger) scale directly, matching the sizes introduced here by eye.

**Context:** Bianca asked for "más carácter" in titles and some extra gold accent detail. Keep it inside the existing token palette — bigger sizes and a small decorative rule, no new colors.

- [ ] **Step 1: Bump card title size and add an accent divider**

In `src/components/ArticleCard.astro`, change the `<h2>` line from:
```astro
<h2 class="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-acento">
```
to:
```astro
<h2 class="font-display text-xl font-semibold leading-snug transition-colors group-hover:text-acento sm:text-2xl">
```

Change the category `<span>` line from:
```astro
<span class="mb-2 inline-block text-xs font-semibold uppercase tracking-wide text-acento">
```
to:
```astro
<span class="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-acento before:h-px before:w-4 before:bg-acento">
```

(The `before:` pseudo-element draws a short gold rule before the category label — no new color, reuses `bg-acento`.)

- [ ] **Step 2: Bump the category-band title on category pages**

In `src/pages/categoria/[categoria].astro`, change:
```astro
<h1 class="relative font-display text-3xl font-bold sm:text-4xl">{nombreCategoria(categoria)}</h1>
```
to:
```astro
<h1 class="relative font-display text-4xl font-bold sm:text-5xl">{nombreCategoria(categoria)}</h1>
```

- [ ] **Step 3: Verify visually**

Run the dev server, check the home page and one category page at desktop width and at ~400px. Titles should read noticeably larger without wrapping awkwardly or breaking card height; the small gold rule should appear before each category label.

- [ ] **Step 4: Commit**

```bash
git add src/components/ArticleCard.astro src/pages/categoria/\[categoria\].astro
git commit -m "Increase title sizes and add accent divider before category labels"
```

---

### Task 4: Hero component + wire into home page

**Files:**
- Create: `src/components/ArticuloDestacado.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `separarDestacadoPrincipal` from `src/lib/articles.ts` (Task 1); `ArticuloImagen` from `src/components/ArticuloImagen.astro` (Task 2).
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Create the hero component**

Write `src/components/ArticuloDestacado.astro`:

```astro
---
import ArticuloImagen from './ArticuloImagen.astro';
import { nombreCategoria } from '../lib/categorias';
import { formatearFecha } from '../lib/fechas';
import type { Articulo } from '../lib/articles';

interface Props {
  articulo: Articulo;
}

const { articulo } = Astro.props;
const fechaFormateada = formatearFecha(articulo.fecha);
---
<a
  href={`/articulo/${articulo.id}`}
  class="destacado group mb-8 grid overflow-hidden rounded-xl border border-borde bg-tarjeta transition duration-300 hover:border-acento focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento sm:grid-cols-2"
>
  <ArticuloImagen imagen={articulo.imagen} alt={articulo.titulo} />
  <div class="flex flex-col justify-center p-6 sm:p-10">
    <span class="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-acento before:h-px before:w-4 before:bg-acento">
      {nombreCategoria(articulo.categoria)}
    </span>
    <h1 class="font-display text-3xl font-bold leading-tight transition-colors group-hover:text-acento sm:text-4xl">
      {articulo.titulo}
    </h1>
    <p class="mt-4 text-base text-marfil/70">{articulo.resumen}</p>
    <time datetime={articulo.fecha.toISOString()} class="mt-6 block text-xs text-marfil/50">{fechaFormateada}</time>
  </div>
</a>

<style>
  .destacado {
    opacity: 0;
    transform: translateY(16px);
    animation: entrada 0.6s ease-out forwards;
  }

  @keyframes entrada {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
```

- [ ] **Step 2: Wire it into the home page**

Replace the full contents of `src/pages/index.astro` with:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ArticleCard from '../components/ArticleCard.astro';
import ArticuloDestacado from '../components/ArticuloDestacado.astro';
import { obtenerArticulosPublicados } from '../lib/contenido';
import { filtrarPorCategoria, separarDestacadoPrincipal } from '../lib/articles';
import { claseBento, CLASES_GRID_BENTO } from '../lib/bento';

const publicados = await obtenerArticulosPublicados();
const { destacado, resto } = separarDestacadoPrincipal(publicados);
const destacadosActuales = filtrarPorCategoria(resto, 'campanas-actuales').slice(0, 3);
const destacadosDatos = filtrarPorCategoria(resto, 'tendencias-y-datos').slice(0, 3);
const idsDestacados = new Set([...destacadosActuales, ...destacadosDatos].map((a) => a.id));
const restoGrid = resto.filter((a) => !idsDestacados.has(a.id));
const ordenados = [...destacadosActuales, ...destacadosDatos, ...restoGrid];
---
<BaseLayout titulo="Inicio">
  <h1 class="sr-only">Vidriera — noticias y campañas de marketing</h1>
  {destacado && <ArticuloDestacado articulo={destacado} />}
  {ordenados.length > 0 ? (
    <div class={CLASES_GRID_BENTO}>
      {ordenados.map((articulo, indice) => (
        <div class={claseBento(indice)}>
          <ArticleCard articulo={articulo} />
        </div>
      ))}
    </div>
  ) : (
    <p class="text-marfil/60">Todavía no hay artículos publicados.</p>
  )}
</BaseLayout>
```

Note: the page's visible `<h1>` moved into `ArticuloDestacado` (the hero title) — the `sr-only` `<h1>` here becomes redundant with a visible on-page `<h1>` and must change to an `<h2>` to keep exactly one `<h1>` per page. Use:
```astro
<h2 class="sr-only">Vidriera — noticias y campañas de marketing</h2>
```
(Only relevant when `destacado` is non-null, i.e. always in practice once Task 6+ publish content — but keep the `sr-only` element unconditional and typed as `<h2>` regardless, since when there's no destacado there's no other `<h1>` on the page either and an `<h2>` alone is harmless.)

- [ ] **Step 3: Verify visually**

Run the dev server. Home page should show a large two-column hero block (image left, title/summary right on desktop; stacked on mobile ~400px) above the existing bento grid, using the most recent published article. Tab to the hero link and confirm the focus outline appears. Toggle `prefers-reduced-motion` in devtools and confirm the hero appears without the slide/fade.

- [ ] **Step 4: Commit**

```bash
git add src/components/ArticuloDestacado.astro src/pages/index.astro
git commit -m "Add hero block to home page"
```

---

### Task 5: Nav category hover animation

**Files:**
- Modify: `src/components/Header.astro`

**Interfaces:** None — self-contained visual change.

- [ ] **Step 1: Add an animated underline to category links**

In `src/components/Header.astro`, change the category link line from:
```astro
<a href={`/categoria/${c.slug}`} class="hover:text-acento transition-colors">
```
to:
```astro
<a href={`/categoria/${c.slug}`} class="enlace-nav relative hover:text-acento transition-colors">
```

Add a `<style>` block at the end of the file (after the closing `</header>` tag):

```astro
<style>
  .enlace-nav::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 1px;
    background: var(--color-acento);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s ease-out;
  }

  .enlace-nav:hover::after {
    transform: scaleX(1);
  }
</style>
```

- [ ] **Step 2: Verify visually**

Run the dev server, hover each category link in the header — a thin gold underline should grow from left to right. Confirm it's instant (no animation) with `prefers-reduced-motion` enabled in devtools.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "Add animated underline to category nav links on hover"
```

---

### Task 6: Content batch — Campañas actuales (6 articles)

**Files:**
- Create 6 files in `src/content/articulos/`

**Interfaces:** None — pure content, matches the schema in `src/content.config.ts` (`titulo`, `categoria`, `fecha`, `resumen`, `fuente`, `estado`, `imagen`, all fields already supported, no schema change).

**Context:** Follow the exact structure of the existing seed `src/content/articulos/nike-just-do-it.md` (frontmatter block, then 2-4 paragraphs of body text below it). Every file: `categoria: campanas-actuales`, `estado: borrador` (never `publicado`), a real `fecha` matching when the campaign/news actually happened, a `resumen` of 1-2 sentences, and `fuente` naming the agency/brand/publication. Research each via WebSearch — verify facts and any statistic against at least one real source before writing it, the way the reviewer will check.

**Topics (research each, write ~3-4 paragraphs per article, in Spanish):**

1. **Duolingo y su búho en redes sociales** — la estrategia de marketing "unhinged"/absurda de Duolingo en TikTok e Instagram (2023-2024), cómo un personaje de marca se volvió viral por comportarse de forma inesperada, y qué gira dio para el crecimiento de la app.
2. **El marketing de la película Barbie (2023)** — la campaña de Mattel/Warner Bros. previa al estreno: colaboraciones de marca cruzadas, el generador de selfies "Barbie Selfie Generator", activaciones físicas, y el impacto en taquilla y en la marca Barbie.
3. **Spotify Wrapped como fenómeno de marketing anual** — cómo Spotify convirtió un resumen de datos personales de escucha en una campaña viral que los propios usuarios comparten cada diciembre, y por qué se volvió un caso de estudio de marketing basado en datos.
4. **Cadbury y los anuncios personalizados con IA (India, 2022-2023)** — la campaña de Ogilvy India "Not Just A Cadbury Ad", que generó miles de avisos personalizados con IA para pequeños comercios locales usando la voz del actor Shah Rukh Khan.
5. **Liquid Death y el marketing de agua enlatada** — cómo una marca de agua construyó una identidad de marca "punk"/heavy metal alrededor de un producto genérico, y qué resultados comerciales y de redes tuvo.
6. **Heinz y el "fraude del ketchup"** — la campaña de Heinz que acusó en broma a otras marcas de vender "ketchup falso" (no-Heinz) en restaurantes, jugando con el reconocimiento de marca.

Each file needs a real, working `imagen` URL:
- Prefer an official brand/campaign logo hosted on Wikimedia Commons (search via WebSearch for `<marca> logo site:commons.wikimedia.org`, then use the direct file URL — Commons file pages link to the actual image file under "Original file" / a URL ending in the image extension, not the wiki page itself).
- If no suitable Commons file exists, use a relevant photo from a free stock source (Unsplash/Pexels) via its direct image URL.
- **Verify the URL actually resolves before using it**: `curl -sI "<url>" | head -1` should show `200`.

- [ ] **Step 1: Research and write all 6 articles**

For each topic, create `src/content/articulos/<slug>.md` (kebab-case slug from the topic, e.g. `duolingo-buho-redes-sociales.md`) with frontmatter matching this shape:

```markdown
---
titulo: "..."
categoria: campanas-actuales
fecha: YYYY-MM-DD
resumen: "..."
fuente: "..."
estado: borrador
imagen: "https://..."
---

(3-4 paragraphs of body text, in Spanish, factually accurate per your research)
```

- [ ] **Step 2: Verify locally**

Run `npm run dev`, confirm each new article's page renders at `/articulo/<slug>` without errors (they won't appear on the home/category grids yet since `estado: borrador` is filtered out — that's expected).

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/
git commit -m "Add 6 draft articles for Campañas actuales"
```

---

### Task 7: Content batch — Tendencias y datos (6 articles)

**Files:**
- Create 6 files in `src/content/articulos/`

**Interfaces:** Same as Task 6.

**Context:** Same process as Task 6 — research via WebSearch, verify stats against real sources (this category burned the project once before with an uncorrected statistic, so cite the specific report/survey by name in `fuente` and in the body text, not just "estudios muestran"). `categoria: tendencias-y-datos`, `estado: borrador`.

**Topics (research each, write ~3-4 paragraphs per article, in Spanish):**

1. **El auge del video corto como formato dominante** — ya cubierto en parte por el artículo existente `video-corto-mejor-roi.md`; este debe tomar un ángulo distinto: adopción por plataforma (TikTok, Reels, Shorts) y tiempo de consumo diario, con datos de un reporte real (ej. Statista, eMarketer, Sprout Social) distinto al ya citado en el artículo existente.
2. **La adopción de IA generativa en equipos de marketing** — porcentaje de marketers que ya usan herramientas de IA generativa para contenido/creatividad, según una encuesta real reciente (ej. HubSpot, Salesforce State of Marketing, o similar).
3. **El crecimiento del retail media** — cómo Amazon Ads y otras plataformas de e-commerce se volvieron un canal publicitario propio, con cifras de inversión publicitaria real (ej. eMarketer/IAB).
4. **El fin de las cookies de terceros y los datos propios (first-party data)** — impacto en la industria publicitaria digital y cómo las marcas están migrando su estrategia de segmentación.
5. **Marketing de influencers: de macro a micro-influencers** — datos reales de ROI/engagement comparado entre creadores grandes y de nicho, citando un reporte real (ej. Influencer Marketing Hub).
6. **Marketing sostenible y el escepticismo del consumidor ("greenwashing")** — datos reales de encuestas sobre cuánto confían los consumidores en las afirmaciones ambientales de las marcas.

Each file needs a real `imagen` URL following the same sourcing/verification rule as Task 6 (Wikimedia Commons when a specific brand/platform logo fits, otherwise a relevant free stock photo — verify with `curl -sI`).

- [ ] **Step 1: Research and write all 6 articles**

Same frontmatter shape and file-naming convention as Task 6, `categoria: tendencias-y-datos`.

- [ ] **Step 2: Verify locally**

Same as Task 6, Step 2.

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/
git commit -m "Add 6 draft articles for Tendencias y datos"
```

---

### Task 8: Content batch — Campañas históricas (6 articles)

**Files:**
- Create 6 files in `src/content/articulos/`

**Interfaces:** Same as Task 6.

**Context:** Same process as Task 6. `categoria: campanas-historicas`, `estado: borrador`. Avoid duplicating the existing seeds (`nike-just-do-it.md`, `coca-cola-comparte-una-coca.md`, `dove-real-beauty.md`, `ice-bucket-challenge.md`).

**Topics (research each, write ~3-4 paragraphs per article, in Spanish):**

1. **Volkswagen "Think Small" (1959, DDB)** — la campaña que revolucionó la publicidad gráfica vendiendo las desventajas del Escarabajo con honestidad y humor, considerada pionera de la "revolución creativa" publicitaria.
2. **Absolut Vodka y la campaña de la botella (años 80-2000)** — cómo cientos de anuncios distintos con la silueta de la botella como protagonista construyeron una de las identidades visuales más reconocibles del marketing.
3. **Apple "1984"** — el comercial dirigido por Ridley Scott emitido en el Super Bowl para lanzar la Macintosh, y por qué se lo considera uno de los anuncios más influyentes de la historia.
4. **De Beers y "A Diamond is Forever"** — cómo esta campaña de mediados del siglo XX creó la asociación cultural entre diamantes y compromiso matrimonial que persiste hasta hoy.
5. **Marlboro Man** — el rediseño de imagen de Marlboro de cigarrillo "femenino" a marca asociada a la masculinidad del vaquero, y su impacto en las ventas y en la publicidad de tabaco.
6. **Old Spice "The Man Your Man Could Smell Like" (2010)** — la campaña de Wieden+Kennedy que revitalizó una marca percibida como anticuada mediante humor viral y respuestas en video personalizadas en redes.

Each file needs a real `imagen` URL (Wikimedia Commons preferred for historical brand logos/ads — many are in the public domain or freely licensed — otherwise free stock, same verification rule as Task 6).

- [ ] **Step 1: Research and write all 6 articles**

Same frontmatter shape and file-naming convention as Task 6, `categoria: campanas-historicas`.

- [ ] **Step 2: Verify locally**

Same as Task 6, Step 2.

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/
git commit -m "Add 6 draft articles for Campañas históricas"
```

---

### Task 9: Content batch — Redes y viralidad (4 articles)

**Files:**
- Create 4 files in `src/content/articulos/`

**Interfaces:** Same as Task 6.

**Context:** Same process as Task 6. `categoria: redes-y-viralidad`, `estado: borrador`. Avoid duplicating the existing seed `auge-video-corto.md`.

**Topics (research each, write ~3-4 paragraphs per article, in Spanish):**

1. **El "Grimace Shake" de McDonald's (2023)** — cómo un batido morado de edición limitada se volvió un meme viral en TikTok (incluyendo videos falsos de gente "intoxicada" por tomarlo) y cómo McDonald's aprovechó la ola sin desmentirla agresivamente.
2. **El fenómeno del vaso Stanley Cup (2023-2024)** — cómo un vaso térmico se volvió un producto viral en TikTok, con filas de madrugada en tiendas y un mercado de reventa, y qué hizo la marca Stanley para sostener la ola.
3. **Marcas haciendo "meme-jacking" en tiempo real** — la práctica de marcas respondiendo a memes/tendencias virales del momento en sus redes (ej. cuentas de marca conocidas por su humor ácido en Twitter/X), con al menos un caso concreto documentado.
4. **BeReal y el marketing de marcas en apps "anti-Instagram"** — cómo surgió la app BeReal (fotos espontáneas, sin edición) y cómo algunas marcas intentaron sumarse a esa estética de autenticidad.

Each file needs a real `imagen` URL, same sourcing/verification rule as Task 6.

- [ ] **Step 1: Research and write all 4 articles**

Same frontmatter shape and file-naming convention as Task 6, `categoria: redes-y-viralidad`.

- [ ] **Step 2: Verify locally**

Same as Task 6, Step 2.

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/
git commit -m "Add 4 draft articles for Redes y viralidad"
```

---

### Task 10: Content batch — Marketing digital (3 articles)

**Files:**
- Create 3 files in `src/content/articulos/`

**Interfaces:** Same as Task 6.

**Context:** Same process as Task 6. `categoria: marketing-digital`, `estado: borrador`.

**Topics (research each, write ~3-4 paragraphs per article, in Spanish):**

1. **El impacto de los resúmenes de IA de Google (AI Overviews/SGE) en el tráfico web y el SEO** — cómo las respuestas generadas por IA directamente en los resultados de búsqueda están cambiando la estrategia de contenido y el tráfico orgánico de sitios y marcas.
2. **WhatsApp Business como canal de ventas en América Latina** — el crecimiento del comercio conversacional (catálogos, chatbots, ventas directas por WhatsApp) como canal de marketing digital en la región.
3. **La automatización en email marketing** — cómo las herramientas de automatización (secuencias, segmentación, personalización) cambiaron el rendimiento del email como canal, con datos reales de una fuente confiable (ej. Mailchimp, HubSpot).

Each file needs a real `imagen` URL, same sourcing/verification rule as Task 6.

- [ ] **Step 1: Research and write all 3 articles**

Same frontmatter shape and file-naming convention as Task 6, `categoria: marketing-digital`.

- [ ] **Step 2: Verify locally**

Same as Task 6, Step 2.

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/
git commit -m "Add 3 draft articles for Marketing digital"
```

---

## After All Tasks

Once Tasks 1-10 are complete and the final whole-branch review passes, the coordinator (not a subagent) compiles a plain-language summary list — one line per new article: título, categoría, y de qué trata — and presents it to Bianca for bulk review. Only after she approves (in full or with exclusions/fixes) do the approved articles' `estado` change from `borrador` to `publicado`, each as a small direct edit (no subagent needed for a one-line frontmatter flip per file), followed by a deploy.
