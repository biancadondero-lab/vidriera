# Vidriera — ronda 3, tanda A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four optional, per-category content blocks (pull-quote, stat strip, virality gauge, before/after comparison) to the article page, and populate them into the existing 32 published articles by extracting content already written in each article's body — no new research needed.

**Architecture:** Four small presentational components, one schema addition (all fields optional, backward compatible), one wiring task in the article page template, then five content-retrofit tasks that read each target article's already-published body and extract the new field values.

**Tech Stack:** Astro 7 (Content Layer API), Tailwind CSS v4.

**Spec:** `docs/superpowers/specs/2026-09-14-vidriera-ronda3-tanda-a-design.md`

## Global Constraints

- All 5 new frontmatter fields are optional (`.optional()` in the Zod schema) — every one of the 32 existing articles must remain valid without them, and none of the 32 articles' `estado` or body text changes as part of this plan.
- Dark theme tokens in `src/styles/global.css` are final — no new colors, only `--color-acento` / `--color-marfil` / `--color-borde` / `--color-tarjeta` already in use.
- No new content is researched — every value added to an existing article's frontmatter must come from text already present in that same article's body (it was already fact-checked when originally written).
- No changes to `src/lib/articles.ts`, `src/lib/contenido.ts`, `src/lib/fechas.ts`, `src/lib/bento.ts`, `ArticleCard.astro`, or `ArticuloDestacado.astro` — this plan only touches the article detail page and its new sub-components.

---

### Task 1: Schema fields

**Files:**
- Modify: `src/content.config.ts`

**Interfaces:**
- Produces: 5 new optional fields on the `articulos` collection schema, consumed by Tasks 4-9.

- [ ] **Step 1: Add the fields**

In `src/content.config.ts`, inside the `schema: z.object({ ... })` block, after the existing `imagen: z.string().optional(),` line, add:

```typescript
    citaDestacada: z.string().optional(),
    enNumeros: z.array(z.object({ etiqueta: z.string(), valor: z.string() })).optional(),
    nivelViral: z.number().min(0).max(100).optional(),
    viralidadEtiqueta: z.string().optional(),
    antesDespues: z.object({ antes: z.string(), despues: z.string() }).optional(),
```

- [ ] **Step 2: Verify the build still succeeds**

Run: `npm run build`
Expected: completes without errors, same page count as before (38 pages — 32 articles + 5 categories + home). This confirms the schema change is backward-compatible with all 32 existing articles that don't yet have these fields.

- [ ] **Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "Add optional schema fields for pull-quote, stats, virality gauge, and before/after blocks"
```

---

### Task 2: CitaDestacada and EnNumeros components

**Files:**
- Create: `src/components/CitaDestacada.astro`
- Create: `src/components/EnNumeros.astro`

**Interfaces:**
- Produces: `<CitaDestacada texto={string} />` and `<EnNumeros items={{etiqueta: string; valor: string}[]} />`, both consumed by Task 4.

- [ ] **Step 1: Create CitaDestacada.astro**

```astro
---
interface Props {
  texto: string;
}

const { texto } = Astro.props;
---
<blockquote class="cita-destacada my-8 border-l-2 border-acento pl-6">
  <p class="font-display text-2xl font-semibold leading-snug text-acento sm:text-3xl">
    {texto}
  </p>
</blockquote>
```

- [ ] **Step 2: Create EnNumeros.astro**

```astro
---
interface Item {
  etiqueta: string;
  valor: string;
}

interface Props {
  items: Item[];
}

const { items } = Astro.props;
---
<div class="en-numeros my-8 flex flex-wrap gap-6 border-y border-borde py-6">
  {items.map((item) => (
    <div class="min-w-[120px] flex-1">
      <p class="font-display text-3xl font-bold text-acento">{item.valor}</p>
      <p class="mt-1 text-xs uppercase tracking-wide text-marfil/50">{item.etiqueta}</p>
    </div>
  ))}
</div>
```

- [ ] **Step 3: Verify**

No automated test (presentational Astro components, per project convention). Run `npm run build` and confirm it still completes without errors (these components aren't wired into any page yet, so this just confirms no syntax errors).

- [ ] **Step 4: Commit**

```bash
git add src/components/CitaDestacada.astro src/components/EnNumeros.astro
git commit -m "Add CitaDestacada and EnNumeros presentational components"
```

---

### Task 3: TermometroViralidad and AntesDespues components

**Files:**
- Create: `src/components/TermometroViralidad.astro`
- Create: `src/components/AntesDespues.astro`

**Interfaces:**
- Produces: `<TermometroViralidad nivel={number} etiqueta={string} />` and `<AntesDespues antes={string} despues={string} />`, both consumed by Task 4.

- [ ] **Step 1: Create TermometroViralidad.astro**

```astro
---
interface Props {
  nivel: number;
  etiqueta: string;
}

const { nivel, etiqueta } = Astro.props;
const nivelClamp = Math.max(0, Math.min(100, nivel));
---
<div class="termometro my-4 flex flex-wrap items-center gap-3">
  <span class="text-xs font-semibold uppercase tracking-wide text-marfil/50">Viralidad</span>
  <div class="h-1.5 w-full max-w-[180px] flex-1 overflow-hidden rounded-full bg-borde">
    <div class="h-full rounded-full bg-acento" style={`width: ${nivelClamp}%`}></div>
  </div>
  <span class="text-xs text-marfil/70">{etiqueta}</span>
</div>
```

- [ ] **Step 2: Create AntesDespues.astro**

```astro
---
interface Props {
  antes: string;
  despues: string;
}

const { antes, despues } = Astro.props;
---
<div class="antes-despues my-10 grid gap-4 sm:grid-cols-2">
  <div class="rounded-xl border border-borde bg-tarjeta p-5">
    <span class="text-xs font-semibold uppercase tracking-wide text-marfil/50">Antes</span>
    <p class="mt-2 text-sm leading-relaxed text-marfil/80">{antes}</p>
  </div>
  <div class="rounded-xl border border-acento bg-tarjeta p-5">
    <span class="text-xs font-semibold uppercase tracking-wide text-acento">Después</span>
    <p class="mt-2 text-sm leading-relaxed text-marfil/80">{despues}</p>
  </div>
</div>
```

- [ ] **Step 3: Verify**

Run `npm run build` and confirm it still completes without errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/TermometroViralidad.astro src/components/AntesDespues.astro
git commit -m "Add TermometroViralidad and AntesDespues presentational components"
```

---

### Task 4: Wire the four blocks into the article page

**Files:**
- Modify: `src/pages/articulo/[id].astro`

**Interfaces:**
- Consumes: all four components from Tasks 2-3, and the five schema fields from Task 1.

- [ ] **Step 1: Add the imports**

At the top of `src/pages/articulo/[id].astro`, after the existing `import { formatearFecha } from '../../lib/fechas';` line, add:

```typescript
import CitaDestacada from '../../components/CitaDestacada.astro';
import EnNumeros from '../../components/EnNumeros.astro';
import TermometroViralidad from '../../components/TermometroViralidad.astro';
import AntesDespues from '../../components/AntesDespues.astro';
```

- [ ] **Step 2: Render the blocks in order**

Replace the `<article>` block's contents — from the opening `<article class="max-w-2xl mx-auto">` through the closing `</article>` — with:

```astro
  <article class="max-w-2xl mx-auto">
    <span class="inline-block text-xs font-semibold uppercase tracking-wide text-acento mb-3">
      {nombreCategoria(entrada.data.categoria)}
    </span>
    <h1 class="font-display text-3xl font-bold leading-tight mb-3">{entrada.data.titulo}</h1>
    <time datetime={entrada.data.fecha.toISOString()} class="block text-sm text-marfil/50 mb-8">{fechaFormateada}</time>
    {entrada.data.nivelViral !== undefined && entrada.data.viralidadEtiqueta && (
      <TermometroViralidad nivel={entrada.data.nivelViral} etiqueta={entrada.data.viralidadEtiqueta} />
    )}
    {entrada.data.citaDestacada && (
      <CitaDestacada texto={entrada.data.citaDestacada} />
    )}
    {entrada.data.enNumeros && entrada.data.enNumeros.length > 0 && (
      <EnNumeros items={entrada.data.enNumeros} />
    )}
    <div class="contenido">
      <Content />
    </div>
    {entrada.data.antesDespues && (
      <AntesDespues antes={entrada.data.antesDespues.antes} despues={entrada.data.antesDespues.despues} />
    )}
    {entrada.data.fuente && (
      <p class="mt-10 text-sm text-marfil/50">Fuente: {entrada.data.fuente}</p>
    )}
  </article>
```

Leave the `<style>` block at the end of the file untouched.

- [ ] **Step 3: Verify**

Run the dev server, curl an existing published article (e.g. `/articulo/nike-just-do-it`) to confirm 200 and that it renders exactly as before (no new blocks show — `nike-just-do-it.md` has none of the 5 new fields yet, populated in later tasks). Run `npm run build` and confirm it still completes without errors, same 38 pages. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/articulo/\[id\].astro
git commit -m "Wire pull-quote, stats, virality gauge, and before/after blocks into article page"
```

---

### Task 5: Retrofit citaDestacada — Campañas actuales + Campañas históricas (16 articles)

**Files:**
- Modify: `src/content/articulos/barbie-marketing-campana-2023.md`
- Modify: `src/content/articulos/cadbury-shah-rukh-khan-ia.md`
- Modify: `src/content/articulos/duolingo-buho-redes-sociales.md`
- Modify: `src/content/articulos/heinz-fraude-del-ketchup.md`
- Modify: `src/content/articulos/liquid-death-marketing-punk.md`
- Modify: `src/content/articulos/que-hermosura-la-agrimensura.md`
- Modify: `src/content/articulos/spotify-wrapped-marketing-anual.md`
- Modify: `src/content/articulos/absolut-vodka-botella.md`
- Modify: `src/content/articulos/apple-1984-macintosh.md`
- Modify: `src/content/articulos/coca-cola-comparte-una-coca.md`
- Modify: `src/content/articulos/de-beers-diamond-is-forever.md`
- Modify: `src/content/articulos/dove-real-beauty.md`
- Modify: `src/content/articulos/marlboro-man.md`
- Modify: `src/content/articulos/nike-just-do-it.md`
- Modify: `src/content/articulos/old-spice-smell-like-a-man.md`
- Modify: `src/content/articulos/volkswagen-think-small.md`

**Interfaces:** None — content-only, uses the `citaDestacada` field from Task 1's schema.

**Context:** Add one line to each file's frontmatter: `citaDestacada: "..."`. The value must be a single striking sentence or statistic that is **already present in that same article's body text** (verbatim, or lightly trimmed to stand alone — never invented, never reworded to change its meaning). Target length: under ~200 characters, so it reads well as a large pull-quote. Pick the line a reader would remember — a surprising number, a vivid claim, or the article's central turn.

**Worked example** — for `nike-just-do-it.md`, whose body includes the line `"Just Do It" no vendía zapatillas, vendía una actitud`, a good value is:

```yaml
citaDestacada: "\"Just Do It\" no vendía zapatillas, vendía una actitud."
```

- [ ] **Step 1: Read each of the 16 files, choose one line per article, add the field**

For each file, open it, read the full body, pick the single best line per the criteria above, and add `citaDestacada: "..."` to its frontmatter block (anywhere among the existing fields — order doesn't matter to the schema). Escape any internal double quotes in the YAML value with `\"`.

- [ ] **Step 2: Verify**

Run `npm run build` and confirm it completes without errors (Zod will reject malformed YAML/frontmatter immediately, so a clean build confirms all 16 are syntactically valid). Spot-check 2-3 of the rendered pages (dev server, curl) to confirm the quote appears and reads sensibly in context.

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/
git commit -m "Add citaDestacada to Campañas actuales and Campañas históricas articles"
```

---

### Task 6: Retrofit citaDestacada — Marketing digital + Redes y viralidad + Tendencias y datos (16 articles)

**Files:**
- Modify: `src/content/articulos/ai-overviews-google-impacto-seo.md`
- Modify: `src/content/articulos/auge-video-corto.md`
- Modify: `src/content/articulos/automatizacion-email-marketing-resultados.md`
- Modify: `src/content/articulos/whatsapp-business-ventas-latinoamerica.md`
- Modify: `src/content/articulos/bereal-marcas-autenticidad.md`
- Modify: `src/content/articulos/grimace-shake-mcdonalds-meme.md`
- Modify: `src/content/articulos/ice-bucket-challenge.md`
- Modify: `src/content/articulos/oreo-dunk-in-the-dark-meme-jacking.md`
- Modify: `src/content/articulos/stanley-cup-fenomeno-tiktok.md`
- Modify: `src/content/articulos/adopcion-ia-generativa-marketing.md`
- Modify: `src/content/articulos/adopcion-video-corto-plataformas.md`
- Modify: `src/content/articulos/auge-micro-influencers.md`
- Modify: `src/content/articulos/crecimiento-retail-media.md`
- Modify: `src/content/articulos/escepticismo-greenwashing-consumidores.md`
- Modify: `src/content/articulos/fin-cookies-terceros-first-party-data.md`
- Modify: `src/content/articulos/video-corto-mejor-roi.md`

**Interfaces:** None — content-only, same field and criteria as Task 5.

**Context:** Identical process to Task 5 — read each file's body, add one `citaDestacada: "..."` line extracted verbatim (or lightly trimmed) from that article's own text. See Task 5's worked example for the exact pattern.

- [ ] **Step 1: Read each of the 16 files, choose one line per article, add the field**

- [ ] **Step 2: Verify**

Run `npm run build` and confirm it completes without errors (38 pages, no page count change). Spot-check 2-3 rendered pages.

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/
git commit -m "Add citaDestacada to Marketing digital, Redes y viralidad, and Tendencias y datos articles"
```

---

### Task 7: Retrofit "en números" — Tendencias y datos (7 articles)

**Files:**
- Modify: `src/content/articulos/video-corto-mejor-roi.md`
- Modify: `src/content/articulos/adopcion-ia-generativa-marketing.md`
- Modify: `src/content/articulos/adopcion-video-corto-plataformas.md`
- Modify: `src/content/articulos/auge-micro-influencers.md`
- Modify: `src/content/articulos/crecimiento-retail-media.md`
- Modify: `src/content/articulos/escepticismo-greenwashing-consumidores.md`
- Modify: `src/content/articulos/fin-cookies-terceros-first-party-data.md`

**Interfaces:** None — content-only, uses the `enNumeros` field from Task 1's schema.

**Context:** Add an `enNumeros` array of 2-3 items to each file's frontmatter, using figures **already cited in that article's own body text** (never invented, never sourced elsewhere). Each item's `valor` is the number exactly as written in the body (with its own unit/symbol: `"80%"`, `"16x"`, `"$70.000M"`), and `etiqueta` is a short 2-5 word description of what it measures.

**Worked example** — for `adopcion-ia-generativa-marketing.md`, whose body cites "el 80% de los profesionales de marketing ya usa inteligencia artificial para crear contenido" and "el 75% la aplica a producción de imágenes o video":

```yaml
enNumeros:
  - etiqueta: "Usa IA para crear contenido"
    valor: "80%"
  - etiqueta: "Usa IA para imágenes o video"
    valor: "75%"
```

- [ ] **Step 1: Read each of the 7 files, choose 2-3 figures per article, add the field**

YAML syntax note: this is a nested array of objects in frontmatter — indent exactly as in the worked example (2 spaces before `- etiqueta`, aligned `valor` below it).

- [ ] **Step 2: Verify**

Run `npm run build` and confirm it completes without errors. Spot-check 2-3 rendered pages (dev server, curl) to confirm the stat tiles appear correctly.

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/
git commit -m "Add enNumeros stat tiles to Tendencias y datos articles"
```

---

### Task 8: Retrofit virality gauge — Redes y viralidad (5 articles)

**Files:**
- Modify: `src/content/articulos/ice-bucket-challenge.md`
- Modify: `src/content/articulos/bereal-marcas-autenticidad.md`
- Modify: `src/content/articulos/grimace-shake-mcdonalds-meme.md`
- Modify: `src/content/articulos/oreo-dunk-in-the-dark-meme-jacking.md`
- Modify: `src/content/articulos/stanley-cup-fenomeno-tiktok.md`

**Interfaces:** None — content-only, uses `nivelViral`/`viralidadEtiqueta` from Task 1's schema.

**Context:** Add `nivelViral: <number 0-100>` and `viralidadEtiqueta: "..."` to each file's frontmatter. This is an editorial rating (Bianca's own words: "un indicador visual con tu propia calificación"), not a cited statistic — base it on the reach/impact actually described in that article's body (view counts, revenue impact, duration of the trend, media coverage described), using this scale:

- 60-75 → `viralidadEtiqueta: "Impacto moderado"`
- 76-90 → `viralidadEtiqueta: "Viral alto"`
- 91-100 → `viralidadEtiqueta: "Viral extremo"`

These are a reasonable starting estimate, not a precise measurement — Bianca can adjust any of them later if she disagrees.

**Worked example** — `stanley-cup-fenomeno-tiktok.md`'s body describes revenue growing from $73M to $750M and viral videos with tens of millions of views, sustained over roughly a year: a strong, sustained case →

```yaml
nivelViral: 88
viralidadEtiqueta: "Viral alto"
```

- [ ] **Step 1: Read each of the 5 files, assign a score and label per the scale, add both fields**

- [ ] **Step 2: Verify**

Run `npm run build` and confirm it completes without errors. Spot-check 2-3 rendered pages to confirm the gauge bar renders at a sensible width for its score.

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/
git commit -m "Add virality gauge ratings to Redes y viralidad articles"
```

---

### Task 9: Retrofit antes/después — Marlboro Man and Old Spice (2 articles)

**Files:**
- Modify: `src/content/articulos/marlboro-man.md`
- Modify: `src/content/articulos/old-spice-smell-like-a-man.md`

**Interfaces:** None — content-only, uses the `antesDespues` field from Task 1's schema.

**Context:** Add an `antesDespues` object to each file's frontmatter, with `antes` and `despues` describing the brand's state before and after the campaign — both drawn from that article's own already-written body text (never invented).

**Worked example** — for `marlboro-man.md` (body describes the brand's pre-rebrand association with women/filtered "mild" cigarettes, and its post-rebrand dominance):

```yaml
antesDespues:
  antes: "Marlboro era una marca de cigarrillos con filtro asociada al público femenino, con ventas menores."
  despues: "Se convirtió, de la mano del vaquero, en la marca de cigarrillos más vendida del mundo."
```

- [ ] **Step 1: Read both files, write the antes/despues pair for each, add the field**

- [ ] **Step 2: Verify**

Run `npm run build` and confirm it completes without errors. Check both rendered pages (dev server, curl) to confirm the two-column block appears after the article body.

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/marlboro-man.md src/content/articulos/old-spice-smell-like-a-man.md
git commit -m "Add antes/después comparison to Marlboro Man and Old Spice articles"
```
