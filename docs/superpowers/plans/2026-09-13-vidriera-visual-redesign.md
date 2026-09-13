# Vidriera Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin Vidriera to a dark, minimalist-editorial theme with a single muted-gold accent, add a brand icon, restructure the home and category pages into an animated magazine-style ("bento") grid, and give article cards an abstract graphic placeholder with entrance/hover animation — all validated visually with the user via brainstorming mockups before this plan was written.

**Architecture:** Purely presentational change. No content model, schema, or approval-pipeline code changes. Work proceeds bottom-up: re-skin the shared design tokens and every file that references them first (Task 1), then layer new structural pieces on top (brand icon, card redesign, bento grid on home and category pages), finishing with a verification pass.

**Tech Stack:** Astro 7, Tailwind CSS v4 (`@theme` tokens), Vitest.

**Spec:** `docs/superpowers/specs/2026-09-13-vidriera-visual-redesign-design.md` (this round's design). The original site spec is `docs/superpowers/specs/2026-09-13-vidriera-design.md`.

## Global Constraints

- Full-site dark theme replaces the current light theme — no light/dark toggle.
- Exactly one accent color (muted gold) across the whole site — no per-category colors, no neon/glow effects.
- All animations (entrance, hover) must respect `prefers-reduced-motion` — a single global CSS rule handles this for every animation added in this plan.
- No new articles, no real campaign photos this round — abstract CSS gradients stand in for images.
- No changes to `src/lib/articles.ts`, `src/lib/contenido.ts`, `src/lib/fechas.ts`, `src/lib/categorias.ts`, or `src/content.config.ts` — this round is visual only.
- Must still work at phone width (~400px) — grid layouts collapse to a single column below the `sm:` breakpoint.

---

### Task 1: Dark theme tokens + re-skin every existing consumer

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/components/ArticleCard.astro`
- Modify: `src/pages/articulo/[id].astro`

**Interfaces:**
- Produces: theme tokens `--color-fondo` (background), `--color-marfil` (main text), `--color-acento` (accent, unchanged name/role from before), `--color-borde` (border/divider), `--color-tarjeta` (card surface) — consumed by every later task's markup via Tailwind utility classes `bg-fondo`, `text-marfil`, `text-acento`, `border-borde`, `bg-tarjeta` (and opacity variants like `text-marfil/70`).
- This task intentionally makes NO structural/layout changes anywhere — only token values and the class names that reference them. The site must look identical in layout to before, just re-colored, when this task is done.

- [ ] **Step 1: Rewrite the design tokens**

Replace the full contents of `src/styles/global.css`:

```css
@import "tailwindcss";

@theme {
  --color-fondo: #0f1115;
  --color-marfil: #ededed;
  --color-acento: #c9a24b;
  --color-borde: #23262d;
  --color-tarjeta: #171a20;
  --font-display: "Playfair Display", serif;
  --font-texto: "Inter", sans-serif;
}

body {
  background-color: var(--color-fondo);
  color: var(--color-marfil);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 2: Re-skin BaseLayout**

In `src/layouts/BaseLayout.astro`, find the `<body>` tag's class attribute:

```astro
<body class="font-texto text-tinta bg-papel min-h-screen flex flex-col">
```

Replace with:

```astro
<body class="font-texto text-marfil bg-fondo min-h-screen flex flex-col">
```

(`font-texto` is the font-family utility — unrelated to the color rename, leave it as-is.)

- [ ] **Step 3: Re-skin Header**

In `src/components/Header.astro`, find:

```astro
<header class="border-b border-linea">
```

Replace with:

```astro
<header class="border-b border-borde">
```

No other changes to this file in this task (the brand icon is added in Task 2).

- [ ] **Step 4: Re-skin Footer**

In `src/components/Footer.astro`, find:

```astro
<footer class="border-t border-linea mt-16">
  <div class="max-w-5xl mx-auto px-4 py-8 text-sm text-tinta/60">
```

Replace with:

```astro
<footer class="border-t border-borde mt-16">
  <div class="max-w-5xl mx-auto px-4 py-8 text-sm text-marfil/60">
```

- [ ] **Step 5: Re-skin ArticleCard's color classes (structure unchanged)**

In `src/components/ArticleCard.astro`, only rename color classes — keep the exact same markup structure as it is today:

- `border-b border-linea` → `border-b border-borde`
- `text-tinta/70` → `text-marfil/70`
- `text-tinta/50` → `text-marfil/50`

The full file's `<a>` root, its category label, title, resumen paragraph, and `<time>` element all stay exactly where they are — only those three class strings change.

- [ ] **Step 6: Re-skin the article detail page's color classes**

In `src/pages/articulo/[id].astro`, rename both occurrences of `text-tinta/50` to `text-marfil/50` (the `<time>` element and the "Fuente: ..." paragraph). The scoped `<style>` block's `var(--color-acento)` reference needs no change (that token name didn't change). Do not touch anything else in this file.

- [ ] **Step 7: Verify the rename is complete and the build succeeds**

Run: `npm run build`
Expected: succeeds, same 13 pages generated as before.

Run: `grep -rn "text-tinta\|bg-papel\|border-linea" src/`
Expected: no output (every old class name reference has been renamed).

- [ ] **Step 8: Verify visually**

Run: `npm run dev`, open the local URL. Confirm: dark background, light text, gold category labels/accents, everything else laid out exactly as before (no structural change yet — that's expected, later tasks add it). Stop the server after checking.

- [ ] **Step 9: Commit**

```bash
git add src/styles/global.css src/layouts/BaseLayout.astro src/components/Header.astro src/components/Footer.astro src/components/ArticleCard.astro src/pages/articulo/[id].astro
git commit -m "Re-skin to dark theme with muted-gold accent"
```

---

### Task 2: Brand icon in the header

**Files:**
- Modify: `src/components/Header.astro`

**Interfaces:**
- No new exports; purely visual addition to an existing component.

- [ ] **Step 1: Add the icon next to the wordmark**

In `src/components/Header.astro`, replace the site-name link:

```astro
<a href="/" class="font-display text-3xl font-bold tracking-tight">Vidriera</a>
```

with:

```astro
<a href="/" class="flex items-center gap-2 font-display text-3xl font-bold tracking-tight">
  <span class="text-acento" aria-hidden="true">
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" rx="1.5" fill="currentColor" opacity="0.4" />
      <rect x="12" y="1" width="9" height="9" rx="1.5" fill="currentColor" />
      <rect x="1" y="12" width="9" height="9" rx="1.5" fill="currentColor" />
      <rect x="12" y="12" width="9" height="9" rx="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  </span>
  Vidriera
</a>
```

This is a simple 4-pane "vitrina" icon in the accent color (`currentColor` inherits from the wrapping `text-acento` span), sitting beside the wordmark — the wordmark itself stays a single color, it is never split into two colors.

- [ ] **Step 2: Verify**

Run: `npm run build`, then `grep -A2 'viewBox="0 0 22 22"' dist/index.html` to confirm the SVG markup made it into the generated home page.

Run: `npm run dev`, open the local URL, confirm the gold icon renders immediately to the left of "Vidriera" in the header, vertically aligned with the text. Stop the server after checking.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "Add brand icon next to the wordmark"
```

---

### Task 3: Redesign ArticleCard — dark surface, abstract graphic, animation

**Files:**
- Modify: `src/components/ArticleCard.astro`

**Interfaces:**
- Consumes: `Articulo`, `nombreCategoria`, `formatearFecha` — same as before, unchanged.
- Produces: `ArticleCard.astro` still takes `Props = { articulo: Articulo }` — its root element gains an `h-full` class so it can be dropped into a sized grid cell by a wrapping container (Tasks 4-5 rely on this).

- [ ] **Step 1: Replace the full file**

Replace the full contents of `src/components/ArticleCard.astro`:

```astro
---
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
  class="tarjeta group flex h-full flex-col overflow-hidden rounded-xl border border-borde bg-tarjeta transition-transform duration-300 hover:-translate-y-1 hover:border-acento"
>
  <div class="grafico-abstracto aspect-[16/9] w-full"></div>
  <div class="flex flex-1 flex-col p-4">
    <span class="mb-2 inline-block text-xs font-semibold uppercase tracking-wide text-acento">
      {nombreCategoria(articulo.categoria)}
    </span>
    <h3 class="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-acento">
      {articulo.titulo}
    </h3>
    <p class="mt-2 text-sm text-marfil/70">{articulo.resumen}</p>
    <time datetime={articulo.fecha.toISOString()} class="mt-auto block pt-3 text-xs text-marfil/50">{fechaFormateada}</time>
  </div>
</a>

<style>
  .tarjeta {
    opacity: 0;
    transform: translateY(16px);
    animation: entrada 0.6s ease-out forwards;
  }

  .grafico-abstracto {
    background:
      radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-acento) 35%, transparent), transparent 60%),
      radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--color-acento) 20%, transparent), transparent 55%),
      var(--color-fondo);
  }

  @keyframes entrada {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
```

Note what changed from the previous version: the card is now a self-contained bordered box (`rounded-xl border ... bg-tarjeta`) instead of a plain bottom-divider row, it has a gradient graphic block above the text, it lifts and its border turns gold on hover, and it fades/rises in on load. The reduced-motion override from Task 1's `global.css` automatically neutralizes the `entrada` animation for users who have that OS preference set — no extra code needed here.

- [ ] **Step 2: Verify**

Run: `npm run build` — confirm it still succeeds.

Run: `npm run dev`, open the local URL. Confirm: each card is now a distinct bordered dark box with a gradient block on top, fades/rises in when the page loads, and lifts with a gold border on hover. Stop the server after checking.

- [ ] **Step 3: Commit**

```bash
git add src/components/ArticleCard.astro
git commit -m "Redesign ArticleCard: dark surface, abstract graphic, entrance animation"
```

---

### Task 4: Bento grid helper + home page restructure

**Files:**
- Create: `src/lib/bento.ts`
- Create: `src/lib/bento.test.ts`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `claseBento(indice: number): string` — a pure function mapping a zero-based position to Tailwind grid-span classes. Consumed by this task's `index.astro` and by Task 5's category page.
- Consumes: `obtenerArticulosPublicados` (`src/lib/contenido.ts`), `filtrarPorCategoria` (`src/lib/articles.ts`), `ArticleCard` (Task 3), `BaseLayout` (existing).

- [ ] **Step 1: Write the failing test**

Create `src/lib/bento.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { claseBento } from './bento';

describe('claseBento', () => {
  it('el primer artículo ocupa el bloque grande', () => {
    expect(claseBento(0)).toBe('sm:col-span-2 sm:row-span-2');
  });

  it('el segundo y tercer artículo ocupan bloques medianos', () => {
    expect(claseBento(1)).toBe('sm:row-span-2');
    expect(claseBento(2)).toBe('sm:row-span-2');
  });

  it('el resto ocupa bloques chicos sin clases extra', () => {
    expect(claseBento(3)).toBe('');
    expect(claseBento(10)).toBe('');
  });
});
```

- [ ] **Step 2: Run it, confirm it fails**

Run: `npx vitest run src/lib/bento.test.ts`
Expected: FAIL — `./bento` module not found.

- [ ] **Step 3: Implement**

Create `src/lib/bento.ts`:

```ts
export function claseBento(indice: number): string {
  if (indice === 0) return 'sm:col-span-2 sm:row-span-2';
  if (indice === 1 || indice === 2) return 'sm:row-span-2';
  return '';
}
```

- [ ] **Step 4: Run it, confirm it passes**

Run: `npx vitest run src/lib/bento.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Restructure the home page into one bento grid**

Replace the full contents of `src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ArticleCard from '../components/ArticleCard.astro';
import { obtenerArticulosPublicados } from '../lib/contenido';
import { filtrarPorCategoria } from '../lib/articles';
import { claseBento } from '../lib/bento';

const publicados = await obtenerArticulosPublicados();
const destacadosActuales = filtrarPorCategoria(publicados, 'campanas-actuales').slice(0, 3);
const destacadosDatos = filtrarPorCategoria(publicados, 'tendencias-y-datos').slice(0, 3);
const idsDestacados = new Set([...destacadosActuales, ...destacadosDatos].map((a) => a.id));
const resto = publicados.filter((a) => !idsDestacados.has(a.id));
const ordenados = [...destacadosActuales, ...destacadosDatos, ...resto];
---
<BaseLayout titulo="Inicio">
  <h1 class="sr-only">Vidriera — noticias y campañas de marketing</h1>
  {ordenados.length > 0 ? (
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:auto-rows-[180px]">
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

This replaces the old three stacked sections (featured actuales / featured datos / "Todos los artículos") with a single ordered grid: featured articles first (actuales, then datos), then the rest — matching the bento mockup the user approved, where one big block and a few medium blocks sit among the smaller ones regardless of which category they came from. Each card still shows its own category label (from `ArticleCard`), so the categorization is still visible per-card even without section headings.

On mobile (`grid-cols-1`, no `sm:` prefix applied), every card stacks full-width in natural document order with no forced row height — the bento sizing only kicks in at the `sm:` breakpoint and up.

- [ ] **Step 6: Verify**

Run: `npm run build` — confirm it still succeeds and generates the home page.

Run: `npm run dev`, open the local URL. Confirm: the home page now shows one grid with a large block for the first featured article, two medium blocks for the next two, and the remaining articles in a regular grid — not three separate stacked lists. Check it also looks correct at a narrow (~400px) browser width (single column, no forced heights). Stop the server after checking.

- [ ] **Step 7: Commit**

```bash
git add src/lib/bento.ts src/lib/bento.test.ts src/pages/index.astro
git commit -m "Add bento grid helper and restructure home page into a magazine-style grid"
```

---

### Task 5: Category page hero band + bento grid

**Files:**
- Modify: `src/pages/categoria/[categoria].astro`

**Interfaces:**
- Consumes: `claseBento` (Task 4), `obtenerArticulosPublicados`, `filtrarPorCategoria`, `CATEGORIAS`, `nombreCategoria`, `CategoriaSlug`, `ArticleCard`, `BaseLayout` — all pre-existing.

- [ ] **Step 1: Replace the full file**

Replace the full contents of `src/pages/categoria/[categoria].astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ArticleCard from '../../components/ArticleCard.astro';
import { obtenerArticulosPublicados } from '../../lib/contenido';
import { filtrarPorCategoria } from '../../lib/articles';
import { claseBento } from '../../lib/bento';
import { CATEGORIAS, nombreCategoria, type CategoriaSlug } from '../../lib/categorias';

export async function getStaticPaths() {
  return CATEGORIAS.map((c) => ({ params: { categoria: c.slug } }));
}

const { categoria } = Astro.params as { categoria: CategoriaSlug };
const publicados = await obtenerArticulosPublicados();
const deLaCategoria = filtrarPorCategoria(publicados, categoria);
---
<BaseLayout titulo={nombreCategoria(categoria)}>
  <div class="banda-categoria relative mb-10 overflow-hidden rounded-xl border border-borde px-6 py-10 sm:px-10 sm:py-14">
    <span class="relative block text-xs font-semibold uppercase tracking-wide text-acento">Categoría</span>
    <h1 class="relative font-display text-3xl font-bold sm:text-4xl">{nombreCategoria(categoria)}</h1>
  </div>
  {deLaCategoria.length === 0 ? (
    <p class="text-marfil/60">Todavía no hay artículos publicados en esta categoría.</p>
  ) : (
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:auto-rows-[180px]">
      {deLaCategoria.map((articulo, indice) => (
        <div class={claseBento(indice)}>
          <ArticleCard articulo={articulo} />
        </div>
      ))}
    </div>
  )}
</BaseLayout>

<style>
  .banda-categoria {
    background:
      radial-gradient(420px 220px at 15% 20%, color-mix(in srgb, var(--color-acento) 22%, transparent), transparent 60%),
      radial-gradient(360px 200px at 90% 90%, color-mix(in srgb, var(--color-acento) 14%, transparent), transparent 60%),
      var(--color-tarjeta);
  }
</style>
```

- [ ] **Step 2: Verify**

Run: `npm run build` — confirm it still generates all 5 category pages.

Run: `npm run dev`, visit each of the 5 category links in the header. Confirm: every category page now shows a bordered band at the top with a subtle gold-tinted gradient and the category name, followed by the same bento grid treatment as the home page below it (or the empty-state message, for any category with zero articles). Check at ~400px width too. Stop the server after checking.

- [ ] **Step 3: Commit**

```bash
git add src/pages/categoria/
git commit -m "Add category hero band and apply bento grid to category pages"
```

---

### Task 6: Full verification pass

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: succeeds, same 13 pages as before this redesign (7 articles + 5 categories + home).

- [ ] **Step 2: Full test suite**

Run: `npm test`
Expected: PASS, 9 tests total (4 from `articles.test.ts`, 2 from `fechas.test.ts`, 3 new from `bento.test.ts`).

- [ ] **Step 3: Confirm no leftover old token names anywhere**

Run: `grep -rn "text-tinta\|bg-papel\|border-linea" src/`
Expected: no output.

- [ ] **Step 4: Visual pass, desktop and mobile width**

Run: `npm run dev`. Visit the home page, all 5 category pages, and at least 2 article pages. Confirm at both a normal desktop width and a narrow (~400px) width: dark theme throughout, gold accent consistent everywhere (no other colors), brand icon visible in the header, bento grid layout on home/category pages with visible entrance animation and hover lift on cards, category hero band visible on category pages, no horizontal scrolling at 400px. Stop the server after checking.

- [ ] **Step 5: Confirm the reduced-motion rule is in place**

Run: `grep -A5 "prefers-reduced-motion" src/styles/global.css`
Expected: shows the media query added in Task 1, confirming every animation added in this plan (the card's `entrada` keyframe, the hover `transition`) is automatically neutralized for users with that OS preference — no per-component logic needed since the rule targets `*`.
