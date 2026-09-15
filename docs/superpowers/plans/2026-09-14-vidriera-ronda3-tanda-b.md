# Vidriera — ronda 3, tanda B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page's single-article hero with a full-bleed, 3-piece "vidriera" (glass showcase) entrance with a one-time scroll-out effect, and add a new full-bleed historical-timeline page — both using a shared "vitrina" component with a CSS-only 3D glass look and a grain/duotone image treatment.

**Architecture:** Two small pure functions, one shared presentational component (the vitrina), two consumers of it (the home entrance and the new timeline page), a small layout change to allow full-bleed sections, and a nav link. All 3D is CSS transforms — no WebGL/three.js dependency.

**Tech Stack:** Astro 7 (Content Layer API), Tailwind CSS v4, vanilla client-side JS (no framework/library) for the scroll effect.

**Spec:** `docs/superpowers/specs/2026-09-14-vidriera-ronda3-tanda-b-design.md`

## Global Constraints

- No WebGL/three.js or any external JS library — the 3D look is CSS `perspective`/`rotateY`/`scale` only, per the spec's explicit technical decision.
- No new colors — only existing tokens (`--color-fondo`, `--color-marfil`, `--color-acento`, `--color-borde`, `--color-tarjeta`).
- No schema changes (`src/content.config.ts` untouched) — the vitrina uses only fields that already exist (`imagen`, `titulo`, `categoria`, `fecha`).
- Any scroll-linked animation must be skipped entirely when `prefers-reduced-motion: reduce` is set (checked via `window.matchMedia` in JS, since this isn't a CSS `animation`/`transition` the existing global rule can catch).
- No changes to `src/lib/contenido.ts`, `src/lib/fechas.ts`, `src/lib/bento.ts`, `ArticleCard.astro`, category pages, or individual article pages — this round only touches the home page and adds one new page.

---

### Task 1: Pure logic — `separarPrimeros` and `ordenarPorFechaAsc`

**Files:**
- Modify: `src/lib/articles.ts`
- Test: `src/lib/articles.test.ts`

**Interfaces:**
- Produces: `separarPrimeros(articulos: Articulo[], cantidad: number): { primeros: Articulo[]; resto: Articulo[] }` — consumed by Task 4 (index.astro, splitting off the 3 entrance articles from the rest of the grid).
- Produces: `ordenarPorFechaAsc(articulos: Articulo[]): Articulo[]` — consumed by Task 5 (the timeline page, oldest-first order).

- [ ] **Step 1: Write the failing tests**

Add to `src/lib/articles.test.ts` (after the existing `describe('separarDestacadoPrincipal', ...)` block), and add `separarPrimeros, ordenarPorFechaAsc` to the existing import:

```typescript
describe('separarPrimeros', () => {
  it('con lista vacía devuelve ambos arrays vacíos', () => {
    expect(separarPrimeros([], 3)).toEqual({ primeros: [], resto: [] });
  });

  it('con cantidad mayor a la lista, todo queda en primeros', () => {
    const articulos = [crearArticulo({ id: 'a' }), crearArticulo({ id: 'b' })];
    expect(separarPrimeros(articulos, 5)).toEqual({ primeros: articulos, resto: [] });
  });

  it('separa los primeros N manteniendo el orden, y el resto queda con el resto', () => {
    const articulos = [
      crearArticulo({ id: 'a' }),
      crearArticulo({ id: 'b' }),
      crearArticulo({ id: 'c' }),
      crearArticulo({ id: 'd' }),
    ];
    const resultado = separarPrimeros(articulos, 2);
    expect(resultado.primeros.map((a) => a.id)).toEqual(['a', 'b']);
    expect(resultado.resto.map((a) => a.id)).toEqual(['c', 'd']);
  });
});

describe('ordenarPorFechaAsc', () => {
  it('ordena del más viejo al más nuevo', () => {
    const articulos = [
      crearArticulo({ id: 'nuevo', fecha: new Date('2026-06-01') }),
      crearArticulo({ id: 'viejo', fecha: new Date('2026-01-01') }),
    ];
    expect(ordenarPorFechaAsc(articulos).map((a) => a.id)).toEqual(['viejo', 'nuevo']);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/articles.test.ts`
Expected: FAIL — `separarPrimeros`/`ordenarPorFechaAsc` are not functions.

- [ ] **Step 3: Implement**

Add to `src/lib/articles.ts` (after `separarDestacadoPrincipal`):

```typescript
export function separarPrimeros(
  articulos: Articulo[],
  cantidad: number,
): { primeros: Articulo[]; resto: Articulo[] } {
  return { primeros: articulos.slice(0, cantidad), resto: articulos.slice(cantidad) };
}

export function ordenarPorFechaAsc(articulos: Articulo[]): Articulo[] {
  return [...articulos].sort((a, b) => a.fecha.valueOf() - b.fecha.valueOf());
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/articles.test.ts`
Expected: PASS, all tests including the 4 new ones.

- [ ] **Step 5: Commit**

```bash
git add src/lib/articles.ts src/lib/articles.test.ts
git commit -m "Add separarPrimeros and ordenarPorFechaAsc for the vidriera entrance and timeline"
```

---

### Task 2: `VidrieraVitrina.astro` shared component

**Files:**
- Create: `src/components/VidrieraVitrina.astro`

**Interfaces:**
- Produces: `<VidrieraVitrina articulo={Articulo} activa={boolean} mostrarAnio={boolean} />` — consumed by Task 3 (home entrance, 3 instances, first one `activa`) and Task 5 (timeline page, one per historical article, all with `mostrarAnio`).

**Context:** This is the single "glass vitrina" object — a card with a CSS 3D tilt, a grain/duotone-treated image (or the existing abstract-gradient fallback when there's no image), category label, and title. It links to the article like `ArticleCard` does.

- [ ] **Step 1: Create the component**

```astro
---
import { nombreCategoria } from '../lib/categorias';
import type { Articulo } from '../lib/articles';

interface Props {
  articulo: Articulo;
  activa?: boolean;
  mostrarAnio?: boolean;
}

const { articulo, activa = false, mostrarAnio = false } = Astro.props;
const anio = articulo.fecha.getUTCFullYear();
---
<a
  href={`/articulo/${articulo.id}`}
  class={`vitrina group block flex-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento ${activa ? 'vitrina-activa' : ''}`}
>
  {mostrarAnio && (
    <div class="mb-2 font-display text-sm font-semibold text-acento">{anio}</div>
  )}
  <div class="vitrina-vidrio relative overflow-hidden rounded-lg border border-borde">
    <div class="vitrina-imagen absolute inset-0">
      {articulo.imagen ? (
        <img src={articulo.imagen} alt={articulo.titulo} loading="lazy" class="h-full w-full object-cover" />
      ) : (
        <div class="grafico-abstracto h-full w-full"></div>
      )}
    </div>
    <div class="vitrina-veta absolute inset-0"></div>
    <div class="relative flex h-full flex-col justify-end p-4">
      <span class="mb-1 text-xs font-semibold uppercase tracking-wide text-acento">
        {nombreCategoria(articulo.categoria)}
      </span>
      <h3 class="font-display text-lg font-semibold leading-snug text-marfil transition-colors group-hover:text-acento">
        {articulo.titulo}
      </h3>
    </div>
  </div>
</a>

<style>
  .vitrina-vidrio {
    height: 220px;
    background: var(--color-tarjeta);
    border-color: color-mix(in srgb, var(--color-acento) 30%, var(--color-borde));
    transform: perspective(1200px) rotateY(-9deg);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
    transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
  }

  .vitrina-activa .vitrina-vidrio {
    transform: perspective(1200px) rotateY(0deg) scale(1.03);
    border-color: var(--color-acento);
    box-shadow:
      0 0 32px color-mix(in srgb, var(--color-acento) 35%, transparent),
      0 20px 40px rgba(0, 0, 0, 0.5);
  }

  .vitrina:hover .vitrina-vidrio {
    transform: perspective(1200px) rotateY(0deg) scale(1.02);
  }

  .vitrina-imagen img,
  .vitrina-imagen .grafico-abstracto {
    filter: grayscale(0.5) sepia(0.25) contrast(1.05);
  }

  .vitrina-veta {
    background:
      repeating-linear-gradient(
        115deg,
        transparent 0,
        transparent 2px,
        color-mix(in srgb, var(--color-acento) 8%, transparent) 2px,
        color-mix(in srgb, var(--color-acento) 8%, transparent) 3px
      ),
      linear-gradient(to top, var(--color-fondo) 5%, transparent 60%);
  }

  .grafico-abstracto {
    background:
      radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-acento) 35%, transparent), transparent 60%),
      radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--color-acento) 20%, transparent), transparent 55%),
      var(--color-fondo);
  }

  @media (prefers-reduced-motion: reduce) {
    .vitrina-vidrio {
      transition: none;
    }
  }
</style>
```

- [ ] **Step 2: Verify**

No automated test (presentational component, per project convention — this component isn't used anywhere yet, so there's nothing to render; just confirm `npm run build` still completes without errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/VidrieraVitrina.astro
git commit -m "Add VidrieraVitrina shared glass-showcase component"
```

---

### Task 3: `VidrieraEntrada.astro` (home showcase + scroll effect)

**Files:**
- Create: `src/components/VidrieraEntrada.astro`

**Interfaces:**
- Consumes: `VidrieraVitrina` from Task 2.
- Produces: `<VidrieraEntrada articulos={Articulo[]} />` (expects up to 3 articles) — consumed by Task 4 (index.astro).

- [ ] **Step 1: Create the component**

```astro
---
import VidrieraVitrina from './VidrieraVitrina.astro';
import type { Articulo } from '../lib/articles';

interface Props {
  articulos: Articulo[];
}

const { articulos } = Astro.props;
---
<section id="vidriera-entrada" class="vidriera-entrada bg-fondo">
  <div class="mx-auto max-w-6xl px-4 py-16">
    <p class="mb-4 text-xs font-semibold uppercase tracking-wide text-acento">En vidriera ahora</p>
    <div class="vitrina-fila flex gap-6 overflow-x-auto pb-4">
      {articulos.map((articulo, indice) => (
        <VidrieraVitrina articulo={articulo} activa={indice === 0} />
      ))}
    </div>
  </div>
</section>

<script>
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seccion = document.getElementById('vidriera-entrada');

  if (seccion && !reduceMotion) {
    let ticking = false;

    const actualizar = () => {
      const rect = seccion.getBoundingClientRect();
      const alto = rect.height || 1;
      const progreso = Math.min(1, Math.max(0, -rect.top / alto));
      const escala = 1 - progreso * 0.18;
      const opacidad = 1 - progreso * 0.85;
      seccion.style.transform = `scale(${escala})`;
      seccion.style.opacity = String(opacidad);
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(actualizar);
          ticking = true;
        }
      },
      { passive: true },
    );

    actualizar();
  }
</script>

<style>
  .vidriera-entrada {
    transform-origin: top center;
    will-change: transform, opacity;
  }

  .vitrina-fila {
    scroll-snap-type: x proximity;
  }

  .vitrina-fila > * {
    width: 280px;
    scroll-snap-align: start;
  }

  @media (max-width: 640px) {
    .vitrina-fila > * {
      width: 240px;
    }
  }
</style>
```

- [ ] **Step 2: Verify**

No automated test. Run `npm run build` and confirm it completes without errors (not wired into any page yet, so this just confirms no syntax errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/VidrieraEntrada.astro
git commit -m "Add VidrieraEntrada home showcase with scroll-out effect"
```

---

### Task 4: Full-bleed layout slot + wire into home page

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`
- Delete: `src/components/ArticuloDestacado.astro`

**Interfaces:**
- Consumes: `separarPrimeros` from Task 1; `VidrieraEntrada` from Task 3.
- Produces: a named `full-bleed` slot in `BaseLayout`, usable by any future page — consumed here and by Task 5's timeline page.

- [ ] **Step 1: Add the full-bleed slot to BaseLayout**

In `src/layouts/BaseLayout.astro`, change:
```astro
  <body class="font-texto text-marfil bg-fondo min-h-screen flex flex-col">
    <Header />
    <main class="flex-1 w-full max-w-5xl mx-auto px-4 py-10">
      <slot />
    </main>
    <Footer />
  </body>
```
to:
```astro
  <body class="font-texto text-marfil bg-fondo min-h-screen flex flex-col">
    <Header />
    <slot name="full-bleed" />
    <main class="flex-1 w-full max-w-5xl mx-auto px-4 py-10">
      <slot />
    </main>
    <Footer />
  </body>
```
Pages that don't provide a `full-bleed` slot render nothing extra there — no visible change for them.

- [ ] **Step 2: Replace the contents of index.astro**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ArticleCard from '../components/ArticleCard.astro';
import VidrieraEntrada from '../components/VidrieraEntrada.astro';
import { obtenerArticulosPublicados } from '../lib/contenido';
import { filtrarPorCategoria, separarPrimeros } from '../lib/articles';
import { claseBento, CLASES_GRID_BENTO } from '../lib/bento';

const publicados = await obtenerArticulosPublicados();
const { primeros: entrada, resto } = separarPrimeros(publicados, 3);
const destacadosActuales = filtrarPorCategoria(resto, 'campanas-actuales').slice(0, 3);
const destacadosDatos = filtrarPorCategoria(resto, 'tendencias-y-datos').slice(0, 3);
const idsDestacados = new Set([...destacadosActuales, ...destacadosDatos].map((a) => a.id));
const restoGrid = resto.filter((a) => !idsDestacados.has(a.id));
const ordenados = [...destacadosActuales, ...destacadosDatos, ...restoGrid];
---
<BaseLayout titulo="Inicio">
  {entrada.length > 0 && (
    <Fragment slot="full-bleed">
      <VidrieraEntrada articulos={entrada} />
    </Fragment>
  )}
  <h1 class="sr-only">Vidriera — noticias y campañas de marketing</h1>
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

Note: `Fragment` is an Astro global — no import needed. The page's `<h1>` moves back to being a real (if visually hidden) `<h1>` since `VidrieraVitrina` only uses `<h3>` for its titles (peer items, not competing for the page's single top heading).

- [ ] **Step 3: Delete the now-unused ArticuloDestacado component**

Delete `src/components/ArticuloDestacado.astro` — confirm first with `grep -rn "ArticuloDestacado" src/` that index.astro was its only usage before deleting.

- [ ] **Step 4: Verify**

Start the dev server. Curl the home page (`/`) and confirm 200. Grep its HTML for `vidriera-entrada` and `vitrina-activa` to confirm the showcase renders with the first article marked active. Confirm there's exactly one `<h1` on the page. Run `npm run build` and confirm it completes without errors (still 38 pages — this task doesn't add or remove any article/category page). Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/layouts/BaseLayout.astro src/pages/index.astro
git rm src/components/ArticuloDestacado.astro
git commit -m "Replace home hero with the vidriera entrance showcase"
```

---

### Task 5: Historical timeline page

**Files:**
- Create: `src/pages/linea-de-tiempo.astro`

**Interfaces:**
- Consumes: `ordenarPorFechaAsc`, `filtrarPorCategoria` from Task 1/existing `src/lib/articles.ts`; `obtenerArticulosPublicados` from `src/lib/contenido.ts`; `VidrieraVitrina` from Task 2; the `full-bleed` slot from Task 4.

- [ ] **Step 1: Create the page**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import VidrieraVitrina from '../components/VidrieraVitrina.astro';
import { obtenerArticulosPublicados } from '../lib/contenido';
import { filtrarPorCategoria, ordenarPorFechaAsc } from '../lib/articles';

const publicados = await obtenerArticulosPublicados();
const historicas = ordenarPorFechaAsc(filtrarPorCategoria(publicados, 'campanas-historicas'));
---
<BaseLayout
  titulo="Línea de tiempo"
  descripcion="Un recorrido cronológico por las campañas de marketing más históricas."
>
  <Fragment slot="full-bleed">
    <section class="bg-fondo">
      <div class="mx-auto max-w-6xl px-4 py-16">
        <p class="mb-4 text-xs font-semibold uppercase tracking-wide text-acento">Recorrido cronológico</p>
        <h1 class="mb-8 font-display text-3xl font-bold sm:text-4xl">Línea de tiempo histórica</h1>
        {historicas.length > 0 ? (
          <div class="vitrina-fila flex gap-6 overflow-x-auto pb-4">
            {historicas.map((articulo) => (
              <VidrieraVitrina articulo={articulo} mostrarAnio={true} />
            ))}
          </div>
        ) : (
          <p class="text-marfil/60">Todavía no hay campañas históricas publicadas.</p>
        )}
      </div>
    </section>
  </Fragment>
</BaseLayout>

<style>
  .vitrina-fila {
    scroll-snap-type: x proximity;
  }

  .vitrina-fila > * {
    width: 280px;
    scroll-snap-align: start;
  }

  @media (max-width: 640px) {
    .vitrina-fila > * {
      width: 240px;
    }
  }
</style>
```

- [ ] **Step 2: Verify**

Start the dev server. Curl `/linea-de-tiempo` and confirm 200. Grep its HTML for `mostrarAnio` behavior — check that year labels (4-digit numbers) appear once per historical article. Confirm exactly one `<h1` on the page. Run `npm run build` and confirm it completes with 39 pages now (38 + this new page). Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/pages/linea-de-tiempo.astro
git commit -m "Add historical timeline page"
```

---

### Task 6: Nav link to the timeline page

**Files:**
- Modify: `src/components/Header.astro`

**Interfaces:** None — self-contained.

- [ ] **Step 1: Add the link**

In `src/components/Header.astro`, inside the `<nav>` block, after the `{CATEGORIAS.map(...)}` loop closes, add:

```astro
<a href="/linea-de-tiempo" class="enlace-nav relative font-semibold text-acento transition-colors hover:text-marfil">
  Línea de tiempo
</a>
```

(Note: this reuses the existing `enlace-nav` class and its hover-underline `::after` styling already defined in this file's `<style>` block — no new CSS needed. It's styled in the accent color by default, rather than starting in `text-marfil` like the category links, to signal it's a distinct destination rather than another category.)

- [ ] **Step 2: Verify**

Start the dev server, curl the home page, confirm the link appears in the nav HTML with the correct `href`. Confirm clicking through works by curling `/linea-de-tiempo` directly (already covered in Task 5, just confirm the nav entry point exists). Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "Add nav link to the historical timeline page"
```

---

### Task 7: Final visual verification pass

**Files:** None modified — this is a verification-only task.

- [ ] **Step 1: Desktop pass**

Start the dev server. Open (or curl + reason about) the home page and `/linea-de-tiempo` at desktop width. Confirm: the vidriera entrance/timeline rail render full-bleed (no visible side gutters matching the rest of the site's `max-w-5xl` constraint), the active/first vitrina is visually emphasized (straight-on, gold border), the others show the tilted perspective, and images (where present) show the grain/duotone treatment without becoming illegible.

- [ ] **Step 2: Mobile pass**

Resize devtools (or reason from the `@media (max-width: 640px)` rules already in place) to ~400px width. Confirm the vitrina row scrolls horizontally without breaking page layout, and vitrinas shrink to the 240px mobile width.

- [ ] **Step 3: Reduced-motion pass**

Enable `prefers-reduced-motion: reduce` in devtools. Reload the home page and scroll — confirm the vidriera entrance section does NOT scale/fade (the JS should skip attaching its scroll listener entirely, per Task 3's `reduceMotion` check).

- [ ] **Step 4: Full build**

Run `npm run build` one more time and confirm 39 pages, no errors. Run `npx vitest run` and confirm all tests (16 total: 12 existing + 4 new from Task 1) pass. Stop the dev server if still running.

- [ ] **Step 5: Report**

No commit for this task (nothing changed) — write findings (pass/fail per check, any visual issue spotted) to the report file so the reviewer and final review have a record.
