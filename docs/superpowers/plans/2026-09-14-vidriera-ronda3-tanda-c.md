# Vidriera — ronda 3, tanda C Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a draggable 3D-look world globe showing all 32 articles by country (shape-differentiated by category), and a side-by-side campaign comparator — both as new full-bleed pages, both using the site's scroll-reveal "vidriera tilt" visual language (extracted into a reusable mechanism).

**Architecture:** A country lookup table + schema field, a reusable scroll-reveal component (replacing the ArticleCard-only version with a generic one), two new self-contained interactive components (globe, comparator) each with their own client script, two new pages, and a content retrofit adding a country to all 32 articles.

**Tech Stack:** Astro 7 (Content Layer API), Tailwind CSS v4, vanilla client-side JS (Pointer Events, IntersectionObserver) — no WebGL/three.js, no external libraries.

**Spec:** `docs/superpowers/specs/2026-09-14-vidriera-ronda3-tanda-c-design.md`

## Global Constraints

- No WebGL/three.js or any external JS library.
- No new colors — only existing `--color-*` tokens; category differentiation on the globe is by **shape**, never by color.
- `pais` is a new optional schema field (backward-compatible); retrofit all 32 existing articles so none are missing from the globe.
- Any scroll-linked or idle-loop animation (the globe's auto-rotate, the reveal effect) must be skipped under `prefers-reduced-motion: reduce` — drag-to-rotate itself stays available (it's user-initiated, not ambient).
- Learn from the tanda B and ArticleCard fixes: **any CSS rule that combines a class added to `<html>` by JS (like `.con-js`) with a class rendered by a *different* component must live in `global.css`, never in that other component's own scoped `<style>` block** — Astro appends that component's `data-astro-cid` to every selector part, and `<html>` never carries it.
- No changes to `src/lib/contenido.ts`, `src/lib/fechas.ts`, `src/lib/bento.ts`, `src/pages/categoria/[categoria].astro`, or `src/pages/articulo/[id].astro`.

---

### Task 1: Country lookup table

**Files:**
- Create: `src/lib/paises.ts`
- Test: `src/lib/paises.test.ts`

**Interfaces:**
- Produces: `PAISES: Record<string, { nombre: string; lat: number; lon: number }>` and `nombrePais(slug: string): string`, both consumed by Task 4 (globe) and Task 7 (content retrofit, to know which slugs already exist).

- [ ] **Step 1: Write the failing test**

Create `src/lib/paises.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { PAISES, nombrePais } from './paises';

describe('PAISES', () => {
  it('cada país tiene nombre y coordenadas dentro de rango válido', () => {
    Object.values(PAISES).forEach((pais) => {
      expect(pais.nombre.length).toBeGreaterThan(0);
      expect(pais.lat).toBeGreaterThanOrEqual(-90);
      expect(pais.lat).toBeLessThanOrEqual(90);
      expect(pais.lon).toBeGreaterThanOrEqual(-180);
      expect(pais.lon).toBeLessThanOrEqual(180);
    });
  });
});

describe('nombrePais', () => {
  it('devuelve el nombre para un slug conocido', () => {
    expect(nombrePais('estados-unidos')).toBe('Estados Unidos');
  });

  it('devuelve el slug tal cual si no lo encuentra', () => {
    expect(nombrePais('nunca-existio')).toBe('nunca-existio');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/paises.test.ts`
Expected: FAIL — `src/lib/paises.ts` doesn't exist yet.

- [ ] **Step 3: Implement**

Create `src/lib/paises.ts`:

```typescript
export const PAISES: Record<string, { nombre: string; lat: number; lon: number }> = {
  'estados-unidos': { nombre: 'Estados Unidos', lat: 39.8, lon: -98.6 },
  alemania: { nombre: 'Alemania', lat: 51.2, lon: 10.4 },
  suecia: { nombre: 'Suecia', lat: 62.0, lon: 15.0 },
  india: { nombre: 'India', lat: 20.6, lon: 79.0 },
  sudafrica: { nombre: 'Sudáfrica', lat: -30.6, lon: 22.9 },
  'reino-unido': { nombre: 'Reino Unido', lat: 54.0, lon: -2.0 },
  argentina: { nombre: 'Argentina', lat: -38.4, lon: -63.6 },
  francia: { nombre: 'Francia', lat: 46.6, lon: 2.2 },
  canada: { nombre: 'Canadá', lat: 56.1, lon: -106.3 },
  australia: { nombre: 'Australia', lat: -25.3, lon: 133.8 },
  brasil: { nombre: 'Brasil', lat: -14.2, lon: -51.9 },
  estonia: { nombre: 'Estonia', lat: 58.6, lon: 25.0 },
};

export function nombrePais(slug: string): string {
  return PAISES[slug]?.nombre ?? slug;
}
```

Note for Task 7 (content retrofit): if an article's most sensible country isn't in this table yet, add a new row with its real approximate centroid latitude/longitude rather than forcing it into the closest existing entry — this table is meant to grow.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/paises.test.ts`
Expected: PASS, both tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/paises.ts src/lib/paises.test.ts
git commit -m "Add country lookup table for the world globe"
```

---

### Task 2: Schema field `pais`

**Files:**
- Modify: `src/content.config.ts`

**Interfaces:**
- Produces: `pais?: string` on every article's data — consumed by Task 4 (globe) and populated by Tasks 7-8 (content retrofit).

- [ ] **Step 1: Add the field**

In `src/content.config.ts`, inside the `schema: z.object({ ... })` block, after the existing `antesDespues: z.object({...}).optional(),` line, add:

```typescript
    pais: z.string().optional(),
```

- [ ] **Step 2: Verify the build still succeeds**

Run: `npm run build`
Expected: completes without errors, same 39 pages as before.

- [ ] **Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "Add optional pais schema field"
```

---

### Task 3: Reusable scroll-reveal component

**Files:**
- Create: `src/components/RevelarAlScroll.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: a `<RevelarAlScroll />` component (renders no visible markup — just a script) that any page can include once, plus a `.revelable` class any element can opt into — consumed by Task 5 (globe page) and Task 7... (comparator page, actually Task numbering below: consumed by Task 5 and Task 6's pages).

**Context:** `src/components/ArticleCard.astro` already has this exact mechanism (IntersectionObserver + `.con-js`/`.revelada` classes), but hardcoded to the `.tarjeta` selector and duplicated inline. This task extracts an equivalent, generically-named version so other pages can reuse it without duplicating the JS. **Do not modify `ArticleCard.astro` or its existing `.con-js .tarjeta` rules in `global.css`** — they keep working exactly as they do today; this task only adds new, separate rules alongside them.

- [ ] **Step 1: Create the component**

```astro
---
---
<script>
  document.documentElement.classList.add('con-js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revelada');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    document.querySelectorAll('.revelable').forEach((el) => observer.observe(el));
  }
</script>
```

- [ ] **Step 2: Add the generic CSS rules**

In `src/styles/global.css`, after the existing `.con-js .tarjeta` / reduced-motion block (leave those untouched), add:

```css
.con-js .revelable {
  opacity: 0;
  transform: perspective(900px) rotateY(-6deg) translateY(16px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.con-js .revelable.revelada {
  opacity: 1;
  transform: perspective(900px) rotateY(0deg) translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .con-js .revelable {
    opacity: 1;
    transform: none;
  }
}
```

This mirrors the reasoning in the Global Constraints section: these rules reference `.con-js` (added to `<html>` by JS, outside any component's render tree) combined with `.revelable` (rendered by whatever page/component uses it) — they must live in `global.css`, unscoped, exactly like the working `.con-js .tarjeta` rules already there.

- [ ] **Step 3: Verify**

`RevelarAlScroll` isn't used anywhere yet. Run `npm run build` and confirm it completes without errors (confirms no syntax errors; nothing renders differently yet).

- [ ] **Step 4: Commit**

```bash
git add src/components/RevelarAlScroll.astro src/styles/global.css
git commit -m "Extract a reusable scroll-reveal mechanism (.revelable) alongside the existing card one"
```

---

### Task 4: `GlobeMundial.astro` component

**Files:**
- Create: `src/components/GlobeMundial.astro`

**Interfaces:**
- Consumes: `PAISES` from Task 1; `Articulo` type from `src/lib/articles.ts`.
- Produces: `<GlobeMundial articulos={Articulo[]} />` — consumed by Task 5 (the new map page).

**Context:** Articles without a resolvable `pais` are silently skipped (defensive — shouldn't happen once Tasks 7-8 retrofit all 32, but the component must not crash if one is missing).

- [ ] **Step 1: Create the component**

```astro
---
import type { Articulo } from '../lib/articles';
import { PAISES } from '../lib/paises';

interface Props {
  articulos: Articulo[];
}

const { articulos } = Astro.props;

const FORMA_POR_CATEGORIA: Record<string, string> = {
  'campanas-actuales': 'forma-circulo',
  'campanas-historicas': 'forma-diamante',
  'tendencias-y-datos': 'forma-cuadrado',
  'redes-y-viralidad': 'forma-triangulo',
  'marketing-digital': 'forma-anillo',
};

const puntos = articulos
  .filter((a) => a.pais && PAISES[a.pais])
  .map((articulo) => {
    const pais = PAISES[articulo.pais as string];
    const xPercent = ((pais.lon + 180) / 360) * 100;
    const yPercent = ((90 - pais.lat) / 180) * 100;
    return {
      articulo,
      xPercent,
      yPercent,
      forma: FORMA_POR_CATEGORIA[articulo.categoria] ?? 'forma-circulo',
    };
  });
---
<div id="globo-mundial" class="globo-mundial revelable">
  <div class="globo-esfera">
    <div class="globo-mapa"></div>
    <div class="globo-sombra"></div>
    {puntos.map((p) => (
      <a
        href={`/articulo/${p.articulo.id}`}
        class={`globo-punto ${p.forma}`}
        style={`left: ${p.xPercent}%; top: ${p.yPercent}%;`}
        data-x={p.xPercent}
        aria-label={p.articulo.titulo}
        title={p.articulo.titulo}
      ></a>
    ))}
  </div>
  <p class="globo-hint">Arrastrá para girar</p>
</div>

<script>
  const contenedor = document.getElementById('globo-mundial');

  if (contenedor) {
    const esfera = contenedor.querySelector('.globo-esfera') as HTMLElement;
    const mapa = contenedor.querySelector('.globo-mapa') as HTMLElement;
    const puntos = Array.from(contenedor.querySelectorAll('.globo-punto')) as HTMLElement[];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let offsetPx = 0;
    let arrastrando = false;
    let ultimoX = 0;
    let inactivoDesde = Date.now();

    function anchoDeVuelta(): number {
      return esfera.getBoundingClientRect().height * 2;
    }

    function actualizarPosiciones() {
      const ancho = anchoDeVuelta();
      mapa.style.backgroundPositionX = `${offsetPx}px`;
      puntos.forEach((punto) => {
        const baseX = parseFloat(punto.dataset.x || '0');
        let px = (baseX / 100) * ancho + offsetPx;
        px = ((px % ancho) + ancho) % ancho;
        const leftPercent = (px / ancho) * 100;
        punto.style.left = `${leftPercent}%`;
        const distanciaAlBorde = Math.min(leftPercent, 100 - leftPercent);
        punto.style.opacity = distanciaAlBorde < 8 ? String(Math.max(0.15, distanciaAlBorde / 8)) : '1';
      });
    }

    esfera.addEventListener('pointerdown', (e) => {
      arrastrando = true;
      ultimoX = e.clientX;
      esfera.setPointerCapture(e.pointerId);
    });

    esfera.addEventListener('pointermove', (e) => {
      if (!arrastrando) return;
      const deltaX = e.clientX - ultimoX;
      ultimoX = e.clientX;
      offsetPx += deltaX;
      inactivoDesde = Date.now();
      actualizarPosiciones();
    });

    const terminarArrastre = () => {
      arrastrando = false;
      inactivoDesde = Date.now();
    };
    esfera.addEventListener('pointerup', terminarArrastre);
    esfera.addEventListener('pointercancel', terminarArrastre);

    actualizarPosiciones();

    if (!reduceMotion) {
      function auto() {
        if (!arrastrando && Date.now() - inactivoDesde > 1500) {
          offsetPx += 0.3;
          actualizarPosiciones();
        }
        requestAnimationFrame(auto);
      }
      requestAnimationFrame(auto);
    }
  }
</script>

<style>
  .globo-mundial {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .globo-esfera {
    position: relative;
    width: min(70vw, 420px);
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    overflow: hidden;
    cursor: grab;
    touch-action: pan-y;
    box-shadow:
      0 0 60px color-mix(in srgb, var(--color-acento) 15%, transparent),
      inset 0 0 40px rgba(0, 0, 0, 0.5);
    background: var(--color-tarjeta);
  }

  .globo-esfera:active {
    cursor: grabbing;
  }

  .globo-mapa {
    position: absolute;
    inset: 0;
    background-image: url('https://upload.wikimedia.org/wikipedia/commons/c/c0/Equirectangular_projection_world_map_without_borders.svg');
    background-repeat: repeat-x;
    background-size: auto 100%;
    filter: grayscale(1) sepia(0.6) saturate(2) brightness(0.9);
    opacity: 0.85;
  }

  .globo-sombra {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, transparent 40%, color-mix(in srgb, var(--color-fondo) 70%, transparent) 100%);
    pointer-events: none;
  }

  .globo-punto {
    position: absolute;
    width: 9px;
    height: 9px;
    margin: -4.5px;
    background: var(--color-acento);
    border-radius: 50%;
    box-shadow: 0 0 8px color-mix(in srgb, var(--color-acento) 70%, transparent);
    transition: transform 0.15s ease, opacity 0.15s ease;
  }

  .globo-punto:hover,
  .globo-punto:focus-visible {
    transform: scale(1.6);
  }

  .forma-diamante {
    border-radius: 2px;
    transform: rotate(45deg);
  }

  .forma-cuadrado {
    border-radius: 2px;
  }

  .forma-triangulo {
    background: transparent;
    box-shadow: none;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 9px solid var(--color-acento);
    filter: drop-shadow(0 0 6px color-mix(in srgb, var(--color-acento) 70%, transparent));
  }

  .forma-anillo {
    background: transparent;
    border: 2px solid var(--color-acento);
  }

  .globo-hint {
    font-family: var(--font-texto);
    font-size: 0.75rem;
    color: color-mix(in srgb, var(--color-marfil) 50%, transparent);
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
</style>
```

- [ ] **Step 2: Verify**

No automated test (interactive/presentational). `npm run build` must complete without errors (component isn't wired into any page yet).

- [ ] **Step 3: Commit**

```bash
git add src/components/GlobeMundial.astro
git commit -m "Add GlobeMundial draggable globe component"
```

---

### Task 5: World map page

**Files:**
- Create: `src/pages/mapa-mundial.astro`
- Modify: `src/components/Header.astro`

**Interfaces:**
- Consumes: `GlobeMundial` from Task 4; `RevelarAlScroll` from Task 3; `obtenerArticulosPublicados` from `src/lib/contenido.ts`; the `full-bleed` slot from `src/layouts/BaseLayout.astro` (already exists from ronda 3 tanda B).

- [ ] **Step 1: Create the page**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import GlobeMundial from '../components/GlobeMundial.astro';
import RevelarAlScroll from '../components/RevelarAlScroll.astro';
import { obtenerArticulosPublicados } from '../lib/contenido';

const publicados = await obtenerArticulosPublicados();
---
<BaseLayout
  titulo="Mapa mundial"
  descripcion="Todas las notas de Vidriera ubicadas por país, en un globo que se gira arrastrando."
>
  <Fragment slot="full-bleed">
    <RevelarAlScroll />
    <section class="bg-fondo">
      <div class="mx-auto max-w-6xl px-4 py-16">
        <h1 class="mb-2 font-display text-3xl font-bold sm:text-4xl">Mapa mundial</h1>
        <p class="mb-10 max-w-2xl text-sm text-marfil/60">
          Las {publicados.length} notas del sitio, ubicadas por país. La forma de cada punto indica la categoría.
        </p>
        <GlobeMundial articulos={publicados} />
      </div>
    </section>
  </Fragment>
</BaseLayout>
```

- [ ] **Step 2: Add the nav link**

In `src/components/Header.astro`, inside `<nav>`, after the "Línea de tiempo" link added in ronda 3 tanda B, add:

```astro
<a href="/mapa-mundial" class="enlace-nav relative font-semibold text-acento transition-colors hover:text-marfil">
  Mapa mundial
</a>
```

- [ ] **Step 3: Verify**

Start the dev server. Curl `/mapa-mundial` and confirm 200. Grep its HTML for `globo-mundial` and `revelable`. Confirm exactly one `<h1`. Run `npm run build` and confirm it completes without errors — expect 40 pages (39 + this new page). Note: at this point in the plan, no article has a `pais` field yet (Tasks 7-8 haven't run), so the globe will render with zero points — that's expected and fine for this task's verification; just confirm the globe container and hint text render, and no build error. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/mapa-mundial.astro src/components/Header.astro
git commit -m "Add world map page with nav link"
```

---

### Task 6: `ComparadorCampanas.astro` component + page

**Files:**
- Create: `src/components/ComparadorCampanas.astro`
- Create: `src/pages/comparador.astro`
- Modify: `src/components/Header.astro`

**Interfaces:**
- Consumes: `RevelarAlScroll` from Task 3; `obtenerArticulosPublicados` from `src/lib/contenido.ts`; the `full-bleed` slot.

- [ ] **Step 1: Create the component**

```astro
---
import type { Articulo } from '../lib/articles';
import { nombreCategoria } from '../lib/categorias';
import { formatearFecha } from '../lib/fechas';

interface Props {
  articulos: Articulo[];
}

const { articulos } = Astro.props;

const datos = articulos.map((a) => ({
  id: a.id,
  titulo: a.titulo,
  categoria: nombreCategoria(a.categoria),
  resumen: a.resumen,
  citaDestacada: a.citaDestacada ?? null,
  fecha: formatearFecha(a.fecha),
}));
---
<div class="comparador revelable">
  <div class="comparador-selectores">
    <select id="selector-a" class="comparador-select">
      <option value="">Elegí la primera nota…</option>
      {articulos.map((a) => <option value={a.id}>{a.titulo}</option>)}
    </select>
    <span class="comparador-vs">vs</span>
    <select id="selector-b" class="comparador-select">
      <option value="">Elegí la segunda nota…</option>
      {articulos.map((a) => <option value={a.id}>{a.titulo}</option>)}
    </select>
  </div>
  <div class="comparador-paneles">
    <div id="panel-a" class="comparador-panel"><p class="comparador-vacio">Elegí una nota para comparar</p></div>
    <div id="panel-b" class="comparador-panel"><p class="comparador-vacio">Elegí una nota para comparar</p></div>
  </div>
</div>

<script define:vars={{ datos }}>
  const selectorA = document.getElementById('selector-a');
  const selectorB = document.getElementById('selector-b');
  const panelA = document.getElementById('panel-a');
  const panelB = document.getElementById('panel-b');

  function renderPanel(panel, id) {
    const articulo = datos.find((a) => a.id === id);
    if (!articulo) {
      panel.innerHTML = '<p class="comparador-vacio">Elegí una nota para comparar</p>';
      return;
    }
    panel.innerHTML = `
      <span class="comparador-categoria">${articulo.categoria}</span>
      <h3 class="comparador-titulo">${articulo.titulo}</h3>
      <time class="comparador-fecha">${articulo.fecha}</time>
      <p class="comparador-resumen">${articulo.resumen}</p>
      ${articulo.citaDestacada ? `<blockquote class="comparador-cita">${articulo.citaDestacada}</blockquote>` : ''}
      <a class="comparador-link" href="/articulo/${articulo.id}">Ver nota completa →</a>
    `;
  }

  selectorA.addEventListener('change', () => renderPanel(panelA, selectorA.value));
  selectorB.addEventListener('change', () => renderPanel(panelB, selectorB.value));
</script>

<style>
  .comparador-selectores {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .comparador-select {
    flex: 1;
    min-width: 200px;
    background: var(--color-tarjeta);
    color: var(--color-marfil);
    border: 1px solid var(--color-borde);
    border-radius: 8px;
    padding: 10px 14px;
    font-family: var(--font-texto);
  }

  .comparador-vs {
    font-family: var(--font-display);
    color: var(--color-acento);
    font-weight: bold;
  }

  .comparador-paneles {
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .comparador-paneles {
      grid-template-columns: 1fr 1fr;
    }
  }

  .comparador-panel {
    border: 1px solid var(--color-borde);
    border-radius: 12px;
    background: var(--color-tarjeta);
    padding: 24px;
    min-height: 200px;
  }

  .comparador-vacio {
    color: color-mix(in srgb, var(--color-marfil) 50%, transparent);
    font-size: 0.9rem;
  }

  .comparador-categoria {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-acento);
  }

  .comparador-titulo {
    font-family: var(--font-display);
    font-size: 1.25rem;
    margin: 8px 0 4px;
  }

  .comparador-fecha {
    font-size: 0.75rem;
    color: color-mix(in srgb, var(--color-marfil) 50%, transparent);
  }

  .comparador-resumen {
    margin-top: 12px;
    font-size: 0.9rem;
    color: color-mix(in srgb, var(--color-marfil) 70%, transparent);
  }

  .comparador-cita {
    margin: 16px 0 0;
    padding-left: 12px;
    border-left: 2px solid var(--color-acento);
    font-family: var(--font-display);
    font-style: italic;
    color: var(--color-acento);
  }

  .comparador-link {
    display: inline-block;
    margin-top: 16px;
    font-size: 0.85rem;
    color: var(--color-acento);
  }
</style>
```

- [ ] **Step 2: Create the page**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import ComparadorCampanas from '../components/ComparadorCampanas.astro';
import RevelarAlScroll from '../components/RevelarAlScroll.astro';
import { obtenerArticulosPublicados } from '../lib/contenido';

const publicados = await obtenerArticulosPublicados();
---
<BaseLayout titulo="Comparador de campañas" descripcion="Elegí dos notas de Vidriera y compará lado a lado.">
  <Fragment slot="full-bleed">
    <RevelarAlScroll />
    <section class="bg-fondo">
      <div class="mx-auto max-w-6xl px-4 py-16">
        <h1 class="mb-2 font-display text-3xl font-bold sm:text-4xl">Comparador de campañas</h1>
        <p class="mb-10 max-w-2xl text-sm text-marfil/60">Elegí dos notas cualquiera del sitio y compará lado a lado.</p>
        <ComparadorCampanas articulos={publicados} />
      </div>
    </section>
  </Fragment>
</BaseLayout>
```

- [ ] **Step 3: Add the nav link**

In `src/components/Header.astro`, inside `<nav>`, after the "Mapa mundial" link added in Task 5, add:

```astro
<a href="/comparador" class="enlace-nav relative font-semibold text-acento transition-colors hover:text-marfil">
  Comparador
</a>
```

- [ ] **Step 4: Verify**

Start the dev server. Curl `/comparador` and confirm 200. Confirm exactly one `<h1`. In the rendered HTML, confirm both `<select>` elements list all published articles as `<option>`s. Run `npm run build` and confirm it completes without errors — expect 41 pages (40 + this new page). Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add src/components/ComparadorCampanas.astro src/pages/comparador.astro src/components/Header.astro
git commit -m "Add campaign comparator page with nav link"
```

---

### Task 7: Retrofit `pais` — Campañas actuales + Campañas históricas (16 articles)

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

**Interfaces:** None — content-only, uses the `pais` field from Task 2 and the `PAISES` table from Task 1.

**Context:** Add one line to each file's frontmatter: `pais: "<slug>"`, where `<slug>` is a key in `src/lib/paises.ts`'s `PAISES` table. For each article, pick the country of the brand/campaign's origin (e.g. Volkswagen → `alemania`, Nike → `estados-unidos`). If the right country isn't in the table yet, add a new row to `src/lib/paises.ts` with its real approximate centroid latitude/longitude (don't force an inaccurate match to an existing entry).

**Worked example** — `volkswagen-think-small.md`:

```yaml
pais: "alemania"
```

- [ ] **Step 1: Read each of the 16 files, assign a country, add the field (adding new PAISES rows if needed)**

- [ ] **Step 2: Verify**

Run `npm run build` and confirm it completes without errors, same 41 pages. If you added any new rows to `src/lib/paises.ts`, run `npx vitest run src/lib/paises.test.ts` too and confirm it still passes (the lat/lon-range test will catch an out-of-range typo).

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/ src/lib/paises.ts
git commit -m "Add pais to Campañas actuales and Campañas históricas articles"
```

---

### Task 8: Retrofit `pais` — Marketing digital + Redes y viralidad + Tendencias y datos (16 articles)

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

**Interfaces:** None — content-only, same field and process as Task 7.

**Context:** Same process as Task 7. For data/trend articles without one obvious country (e.g. a global stat), use the country of the cited report's publisher (e.g. a HubSpot report → `estados-unidos`). For `whatsapp-business-ventas-latinoamerica.md`, which covers a whole region rather than one country, pick the single country that article's body emphasizes most (its largest cited market) rather than leaving it unmapped.

- [ ] **Step 1: Read each of the 16 files, assign a country, add the field (adding new PAISES rows if needed)**

- [ ] **Step 2: Verify**

Run `npm run build` and confirm it completes without errors, same 41 pages. Re-run `npx vitest run src/lib/paises.test.ts` if you added rows.

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/ src/lib/paises.ts
git commit -m "Add pais to Marketing digital, Redes y viralidad, and Tendencias y datos articles"
```

---

### Task 9: Final visual verification pass

**Files:** None modified — this is a verification-only task.

- [ ] **Step 1: Data completeness**

Run `grep -L "^pais:" src/content/articulos/*.md` — expect NO output (every one of the 32 files must now have a `pais:` line). If any file is missing it, that's a real gap from Tasks 7-8 — flag it, don't silently skip.

- [ ] **Step 2: Globe rendering**

Start the dev server, curl `/mapa-mundial`, and confirm the number of `globo-punto` elements in the rendered HTML equals the number of published articles with a resolvable `pais` (should be 32, matching Step 1). Read `GlobeMundial.astro` and `src/lib/paises.ts` together and manually verify 2-3 specific articles' computed `left`/`top` percentages land in a sane part of the map for their assigned country (e.g. an `estados-unidos` article should land roughly in the map's left-third, not the far right).

**Astro CSS-scoping check (this is the exact bug class that broke Tasks in ronda 3 tanda B and the ArticleCard reveal):** after `npm run build`, grep `dist/mapa-mundial/index.html` and its bundled CSS for the `.globo-punto` element's actual rendered classes, and separately confirm the `.forma-*` shape rules (diamante, cuadrado, triangulo, anillo) are NOT prefixed with a `data-astro-cid` that doesn't match the element they're meant to style. Since `GlobeMundial.astro` defines both the markup and the `.forma-*` styles itself (not split across components like the earlier bug), this should be fine — but confirm it directly rather than assuming.

- [ ] **Step 3: Comparator**

Curl `/comparador`, confirm both `<select>` elements are present with 32 `<option>`s each (33 including the empty placeholder).

- [ ] **Step 4: Reduced-motion pass**

Read `GlobeMundial.astro`'s script and confirm the auto-rotate `requestAnimationFrame` loop is gated behind `if (!reduceMotion)` and never starts when reduced motion is on — but that dragging (pointerdown/pointermove) still works regardless (it's user-initiated, not ambient, per the Global Constraints). Read `RevelarAlScroll.astro` and confirm it matches the same pattern already verified for `ArticleCard.astro` (listener never attaches under reduced motion).

- [ ] **Step 5: Mobile pass**

Read `.globo-esfera`'s `width: min(70vw, 420px)` rule and confirm it can't overflow a ~400px viewport (70vw of 400px = 280px, well under). Confirm `.comparador-selectores` wraps (`flex-wrap: wrap`) and `.comparador-paneles` stacks to one column below 768px.

- [ ] **Step 6: Full build + tests**

Run `npm run build` (expect 41 pages, no errors) and `npx vitest run` (expect 15 tests: 13 existing + 2 new from Task 1's `paises.test.ts`).

- [ ] **Step 7: Report**

No commit for this task — write findings to the report file for the reviewer and final review.
