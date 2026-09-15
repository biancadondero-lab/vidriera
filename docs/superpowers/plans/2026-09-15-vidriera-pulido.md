# Vidriera — pulido de estructura, jerarquía y orden visual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix five concrete quality problems Bianca identified from real screenshots — a disorganized flat nav, a universal light-box image treatment that ruins photos, one off-palette image, a nearly-invisible world map, and an undesigned comparator — without adding any new functionality.

**Architecture:** A small pure helper distinguishes logo images from photos; the shared image component branches on it; the vidriera filter gets stronger; one content file's image is swapped; the nav gets restructured into two grouped rows; the globe's map rendering switches from filtered-photo to masked-color and gains a legend; the comparator gets real visual design on its existing markup/logic.

**Tech Stack:** Astro 7, Tailwind CSS v4. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-15-vidriera-pulido-design.md`

## Global Constraints

- No new colors — every fix uses existing `--color-*` tokens.
- No changes to the *math* of any interaction logic already built and verified (the globe's drag/rotation calculations, the comparator's select/render logic, the scroll-reveal mechanism) — this round is visual/structural. The one narrow exception is Task 5's Step 2a, which adds two lines wiring the globe's already-computed rotation offset to a second CSS property (`mask-position`) so the new masked map actually rotates — the computation itself doesn't change, only what it's applied to.
- No new content research — the one image swap (Task 3) uses an already-sourced, already-verified URL, not something to research fresh.
- Every visual change must still work under `prefers-reduced-motion` and keep existing keyboard/focus behavior intact (don't regress the accessibility fixes from the previous round).

---

### Task 1: `esLogo` helper

**Files:**
- Create: `src/lib/imagenes.ts`
- Test: `src/lib/imagenes.test.ts`

**Interfaces:**
- Produces: `esLogo(url?: string): boolean` — consumed by Task 2 (`ArticuloImagen.astro`).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/imagenes.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { esLogo } from './imagenes';

describe('esLogo', () => {
  it('sin url devuelve false', () => {
    expect(esLogo(undefined)).toBe(false);
  });

  it('una url .svg es logo', () => {
    expect(esLogo('https://upload.wikimedia.org/wikipedia/commons/x/xx/Logo.svg')).toBe(true);
  });

  it('una url .svg con mayúsculas también es logo', () => {
    expect(esLogo('https://example.com/logo.SVG')).toBe(true);
  });

  it('una url .svg con query string sigue siendo logo', () => {
    expect(esLogo('https://example.com/logo.svg?width=200')).toBe(true);
  });

  it('una url .jpg no es logo', () => {
    expect(esLogo('https://images.unsplash.com/photo-123.jpg')).toBe(false);
  });

  it('una url de Unsplash sin extensión no es logo', () => {
    expect(esLogo('https://images.unsplash.com/photo-1683117927786-f146451082fb')).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/imagenes.test.ts`
Expected: FAIL — `esLogo` is not a function.

- [ ] **Step 3: Implement**

Create `src/lib/imagenes.ts`:

```typescript
export function esLogo(url?: string): boolean {
  if (!url) return false;
  const sinQuery = url.split('?')[0].toLowerCase();
  return sinQuery.endsWith('.svg');
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/imagenes.test.ts`
Expected: PASS, all 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/imagenes.ts src/lib/imagenes.test.ts
git commit -m "Add esLogo helper to distinguish logo images from photos"
```

---

### Task 2: Split photo/logo treatment in `ArticuloImagen`, strengthen `VidrieraVitrina` filter

**Files:**
- Modify: `src/components/ArticuloImagen.astro`
- Modify: `src/components/VidrieraVitrina.astro`

**Interfaces:**
- Consumes: `esLogo` from Task 1.

**Context:** `ArticuloImagen.astro` currently puts every image (photo or logo) inside a full-bleed light "marfil" box with `object-contain`. That's correct for logos (which need a light backing for contrast) but wrong for photos (which should fill the frame). `VidrieraVitrina.astro` already does full-bleed `object-cover` correctly for its images — it doesn't need the photo/logo split, just a stronger desaturation filter so no future image's original color leaks through only partially neutralized (this is what happened with the blue email-marketing photo, fixed in Task 3, but the filter itself should also be more robust going forward).

- [ ] **Step 1: Rewrite ArticuloImagen.astro**

```astro
---
import { esLogo } from '../lib/imagenes';

interface Props {
  imagen?: string;
  alt: string;
  eager?: boolean;
}

const { imagen, alt, eager = false } = Astro.props;
const logo = esLogo(imagen);
---
{imagen && !logo && (
  <div class="aspect-[16/9] w-full overflow-hidden">
    <img
      src={imagen}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      class="imagen-articulo h-full w-full object-cover"
    />
  </div>
)}
{imagen && logo && (
  <div class="imagen-insignia-fondo aspect-[16/9] w-full overflow-hidden flex items-center justify-center">
    <div class="imagen-insignia flex items-center justify-center rounded-lg bg-marfil px-5 py-4">
      <img
        src={imagen}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        class="imagen-articulo max-h-14 max-w-[160px] object-contain"
      />
    </div>
  </div>
)}
{!imagen && (
  <div class="grafico-abstracto aspect-[16/9] w-full"></div>
)}

<style>
  .grafico-abstracto {
    background:
      radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--color-acento) 35%, transparent), transparent 60%),
      radial-gradient(circle at 85% 80%, color-mix(in srgb, var(--color-acento) 20%, transparent), transparent 55%),
      var(--color-fondo);
  }

  .imagen-insignia-fondo {
    background: var(--color-tarjeta);
  }

  .imagen-insignia {
    box-shadow: 0 10px 24px color-mix(in srgb, var(--color-fondo) 55%, transparent);
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

- [ ] **Step 2: Strengthen VidrieraVitrina's filter**

In `src/components/VidrieraVitrina.astro`, find the rule (inside the `<style>` block):

```css
.vitrina-imagen img,
.vitrina-imagen .grafico-abstracto {
  filter: grayscale(0.5) sepia(0.25) contrast(1.05);
}
```

Change `grayscale(0.5)` to `grayscale(1)` and `sepia(0.25)` to `sepia(0.3)`:

```css
.vitrina-imagen img,
.vitrina-imagen .grafico-abstracto {
  filter: grayscale(1) sepia(0.3) contrast(1.05);
}
```

Do not change anything else in this file — its `object-cover` treatment is already correct.

- [ ] **Step 3: Verify**

No automated test (presentational). Start the dev server, curl the home page and confirm 200. Run `npm run build` and confirm it completes without errors, same page count as before (should still be 41 pages — this task doesn't add/remove pages). Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/ArticuloImagen.astro src/components/VidrieraVitrina.astro
git commit -m "Split photo/logo image treatment, strengthen vidriera desaturation filter"
```

---

### Task 3: Replace the off-palette email-marketing image

**Files:**
- Modify: `src/content/articulos/automatizacion-email-marketing-resultados.md`

**Interfaces:** None — content-only, single-line frontmatter change.

- [ ] **Step 1: Replace the imagen field**

In `src/content/articulos/automatizacion-email-marketing-resultados.md`, find the line:

```yaml
imagen: "https://images.unsplash.com/photo-1683117927786-f146451082fb"
```

Replace it with (already sourced and verified — `curl -sI` returns 200):

```yaml
imagen: "https://images.unsplash.com/photo-1709281847802-9aef10b6d4bf?w=1200&q=80&auto=format&fit=crop"
```

- [ ] **Step 2: Verify**

Run `npm run build` and confirm it completes without errors, same 41 pages.

- [ ] **Step 3: Commit**

```bash
git add src/content/articulos/automatizacion-email-marketing-resultados.md
git commit -m "Replace off-palette blue icon with a neutral-toned desk photo"
```

---

### Task 4: Restructure the nav into two grouped rows

**Files:**
- Modify: `src/components/Header.astro`

**Interfaces:** None — self-contained.

- [ ] **Step 1: Replace the nav markup**

In `src/components/Header.astro`, replace:

```astro
    <nav class="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
      {CATEGORIAS.map((c) => (
        <a href={`/categoria/${c.slug}`} class="enlace-nav relative hover:text-acento transition-colors">
          {c.nombre}
        </a>
      ))}
      <a href="/linea-de-tiempo" class="enlace-nav relative font-semibold text-acento transition-colors hover:text-marfil">
        Línea de tiempo
      </a>
      <a href="/mapa-mundial" class="enlace-nav relative font-semibold text-acento transition-colors hover:text-marfil">
        Mapa mundial
      </a>
      <a href="/comparador" class="enlace-nav relative font-semibold text-acento transition-colors hover:text-marfil">
        Comparador
      </a>
    </nav>
```

with:

```astro
    <nav class="flex flex-col gap-3 text-sm font-medium">
      <div class="flex flex-wrap gap-x-5 gap-y-2">
        {CATEGORIAS.map((c) => (
          <a href={`/categoria/${c.slug}`} class="enlace-nav relative hover:text-acento transition-colors">
            {c.nombre}
          </a>
        ))}
      </div>
      <div class="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-borde pt-3">
        <span class="text-xs font-semibold uppercase tracking-wide text-marfil/40">Explorar</span>
        <a href="/linea-de-tiempo" class="enlace-nav relative font-semibold text-acento transition-colors hover:text-marfil">
          Línea de tiempo
        </a>
        <a href="/mapa-mundial" class="enlace-nav relative font-semibold text-acento transition-colors hover:text-marfil">
          Mapa mundial
        </a>
        <a href="/comparador" class="enlace-nav relative font-semibold text-acento transition-colors hover:text-marfil">
          Comparador
        </a>
      </div>
    </nav>
```

Leave the `<style>` block (the `.enlace-nav::after` underline rule) untouched — it still applies to every link inside `.enlace-nav`, in either row.

- [ ] **Step 2: Verify**

Start the dev server, curl the home page, confirm 200 and confirm the HTML contains the "Explorar" label. Run `npm run build`, confirm no errors, same 41 pages. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "Split nav into content categories and an Explorar tools group"
```

---

### Task 5: Globe — masked map, stronger sphere shading, shape legend

**Files:**
- Modify: `src/components/GlobeMundial.astro`

**Interfaces:**
- Consumes: `nombreCategoria`, `CategoriaSlug` from `src/lib/categorias.ts` (new import for the legend).

**Context:** The drag/rotation/auto-rotate math in the `<script>` block was fixed and verified in the previous round — do not change any of that math. You WILL touch the script, but only to add mask-position sync (Step 2a below); every other line stays exactly as-is.

- [ ] **Step 1: Add the legend markup**

In `src/components/GlobeMundial.astro`, add the import at the top of the frontmatter (after the existing `import { PAISES } from '../lib/paises';` line):

```typescript
import { nombreCategoria, type CategoriaSlug } from '../lib/categorias';
```

Then change the closing of the template — replace:

```astro
  </div>
  <p class="globo-hint">Arrastrá para girar</p>
</div>
```

with:

```astro
  </div>
  <p class="globo-hint">Arrastrá para girar</p>
  <div class="globo-leyenda" role="list">
    {Object.entries(FORMA_POR_CATEGORIA).map(([slug, forma]) => (
      <span class="globo-leyenda-item" role="listitem">
        <span class={`globo-leyenda-forma ${forma}`} aria-hidden="true"></span>
        {nombreCategoria(slug as CategoriaSlug)}
      </span>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Replace the map rendering with a mask instead of a filtered image**

Replace the `.globo-mapa` rule:

```css
  .globo-mapa {
    position: absolute;
    inset: 0;
    background-image: url('https://upload.wikimedia.org/wikipedia/commons/c/c0/Equirectangular_projection_world_map_without_borders.svg');
    background-repeat: repeat-x;
    background-size: auto 100%;
    filter: grayscale(1) sepia(0.6) saturate(2) brightness(0.9);
    opacity: 0.85;
  }
```

with:

```css
  .globo-mapa {
    position: absolute;
    inset: 0;
    background: linear-gradient(160deg, color-mix(in srgb, var(--color-acento) 85%, var(--color-marfil)), var(--color-acento));
    -webkit-mask-image: url('https://upload.wikimedia.org/wikipedia/commons/c/c0/Equirectangular_projection_world_map_without_borders.svg');
    mask-image: url('https://upload.wikimedia.org/wikipedia/commons/c/c0/Equirectangular_projection_world_map_without_borders.svg');
    -webkit-mask-repeat: repeat-x;
    mask-repeat: repeat-x;
    -webkit-mask-size: auto 100%;
    mask-size: auto 100%;
    opacity: 0.92;
  }
```

This renders the continents filled with a solid gold gradient (masked by the SVG's shape), with the ocean fully transparent showing the dark sphere behind — much higher contrast than filtering the source image's own colors.

**Step 2a — critical, do not skip:** `mask-position` is a separate CSS property from `background-position` — setting one does NOT move the other. The script currently drives rotation by writing `mapa.style.backgroundPositionX`, but `.globo-mapa` no longer has a `background-image` to position (it's now a plain gradient fill), so that line no longer moves anything visible. In `GlobeMundial.astro`'s `<script>` block, find this line inside `actualizarPosiciones()`:

```typescript
      mapa.style.backgroundPositionX = `${offsetPx}px`;
```

and change it to also (not instead) set the mask position:

```typescript
      mapa.style.backgroundPositionX = `${offsetPx}px`;
      mapa.style.maskPosition = `${offsetPx}px 0`;
      (mapa.style as any).webkitMaskPosition = `${offsetPx}px 0`;
```

This is the only line to change in the script. The drag math, the clamp/modulo logic, the auto-rotate loop, and the reduced-motion gating are untouched — you're only wiring the existing computed `offsetPx` value to a second CSS property so the mask (which now carries the visible map) actually rotates along with the markers. During verification (Step 5 below), specifically confirm the map visibly shifts when `offsetPx` changes, not just that the build succeeds.

- [ ] **Step 3: Strengthen the sphere shading**

Replace the `.globo-sombra` rule:

```css
  .globo-sombra {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, transparent 40%, color-mix(in srgb, var(--color-fondo) 70%, transparent) 100%);
    pointer-events: none;
  }
```

with:

```css
  .globo-sombra {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background:
      radial-gradient(circle at 30% 26%, color-mix(in srgb, var(--color-marfil) 14%, transparent), transparent 32%),
      radial-gradient(circle at 50% 50%, transparent 48%, color-mix(in srgb, var(--color-fondo) 88%, transparent) 100%);
    pointer-events: none;
  }
```

And add a thin edge ring to `.globo-esfera`'s `box-shadow` — change:

```css
    box-shadow:
      0 0 60px color-mix(in srgb, var(--color-acento) 15%, transparent),
      inset 0 0 40px color-mix(in srgb, var(--color-fondo) 95%, transparent);
```

to:

```css
    box-shadow:
      0 0 60px color-mix(in srgb, var(--color-acento) 15%, transparent),
      inset 0 0 40px color-mix(in srgb, var(--color-fondo) 95%, transparent),
      0 0 0 1px color-mix(in srgb, var(--color-acento) 25%, transparent);
```

- [ ] **Step 4: Add the legend styles**

Add to the end of the `<style>` block:

```css
  .globo-leyenda {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    margin-top: 4px;
  }

  .globo-leyenda-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-texto);
    font-size: 0.72rem;
    color: color-mix(in srgb, var(--color-marfil) 60%, transparent);
  }

  .globo-leyenda-forma {
    width: 8px;
    height: 8px;
    background: var(--color-acento);
    border-radius: 50%;
    flex: none;
  }
```

The existing `.forma-diamante`, `.forma-cuadrado`, `.forma-triangulo`, `.forma-anillo` rules already in this file apply their own fixed sizing/shape on top of any element carrying those classes, so reusing them directly on `.globo-leyenda-forma` (as done in the template above) renders the same shapes as the real map markers, just at legend scale — no new shape CSS needed.

- [ ] **Step 5: Verify**

Start the dev server, curl `/mapa-mundial`, confirm 200 and confirm `globo-leyenda-item` appears 5 times (once per category) in the HTML. Run `npm run build`, confirm no errors, same 41 pages. Check: after the build, grep the compiled CSS for `mask-image` and confirm the property survived Astro's CSS scoping (should carry the same `data-astro-cid` as `.globo-mapa` itself, same pattern already verified correct for this file's other scoped rules).

**Also confirm the Step 2a script change actually works, not just that it compiles**: read the bundled/compiled script (or the source `<script>` block) and confirm both `mapa.style.maskPosition` and `mapa.style.webkitMaskPosition` are set inside `actualizarPosiciones()` alongside the existing `backgroundPositionX` line, all three driven by the same `offsetPx` value. This is the one change in this task with real risk of silently doing nothing (wrong CSS property name, wrong casing, etc.) — trace it carefully rather than assuming it's correct because the build didn't error (a typo in a `style.foo` JS property assignment is never a build error, it just silently does nothing at runtime). Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/components/GlobeMundial.astro
git commit -m "Render the globe's continents via mask instead of filtered image, strengthen sphere shading, add a shape legend"
```

---

### Task 6: Comparador — styled select, better empty state

**Files:**
- Modify: `src/components/ComparadorCampanas.astro`

**Interfaces:** None — visual only, the `<script>` block and all element IDs stay exactly as they are.

- [ ] **Step 1: Style the selects with a custom arrow**

Replace the `.comparador-select` rule:

```css
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
```

with:

```css
  .comparador-select {
    flex: 1;
    min-width: 200px;
    background-color: var(--color-tarjeta);
    color: var(--color-marfil);
    border: 1px solid var(--color-borde);
    border-radius: 8px;
    padding: 10px 40px 10px 14px;
    font-family: var(--font-texto);
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23c9a24b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .comparador-select:hover,
  .comparador-select:focus-visible {
    border-color: var(--color-acento);
    outline: none;
  }
```

- [ ] **Step 2: Improve the empty-state panels**

Replace the `.comparador-panel` and `.comparador-vacio` rules:

```css
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
```

with:

```css
  .comparador-panel {
    border: 1px dashed var(--color-borde);
    border-radius: 12px;
    background: var(--color-tarjeta);
    padding: 32px 24px;
    min-height: 240px;
    display: flex;
    flex-direction: column;
    transition: border-color 0.2s ease;
  }

  .comparador-panel:has(.comparador-vacio) {
    align-items: center;
    justify-content: center;
    text-align: center;
    border-style: dashed;
  }

  .comparador-panel:not(:has(.comparador-vacio)) {
    border-style: solid;
    border-color: var(--color-borde);
  }

  .comparador-vacio {
    color: color-mix(in srgb, var(--color-marfil) 45%, transparent);
    font-size: 0.85rem;
    line-height: 1.6;
  }
```

Then update both placeholder texts in the template (there are 3 occurrences of the string — the two initial `<div>`s and the one inside `renderPanel`'s empty branch in the `<script>` block) from:

```
Elegí una nota para comparar
```

to:

```
Elegí una nota arriba para empezar a comparar
```

- [ ] **Step 3: Verify**

Start the dev server, curl `/comparador`, confirm 200. Run `npm run build`, confirm no errors, same 41 pages. Confirm the two `<select>` elements and the `renderPanel` script logic are otherwise untouched (diff the file mentally against the original — only CSS and the placeholder text string should differ). Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/ComparadorCampanas.astro
git commit -m "Redesign comparator selects and empty-state panels"
```

---

### Task 7: Final visual verification pass

**Files:** None modified — verification-only.

- [ ] **Step 1: Image treatment**

Start the dev server. Curl the home page and grep for `imagen-insignia` (should appear exactly 6 times, matching the 6 SVG-logo articles) and confirm no article that isn't one of the 6 renders inside an `imagen-insignia-fondo` wrapper (spot check 3-4 photo articles' HTML directly).

- [ ] **Step 2: Nav**

Curl the home page, confirm "Explorar" appears exactly once, and confirm the 3 tool links (Línea de tiempo, Mapa mundial, Comparador) and 5 category links are all still present and correctly linked.

- [ ] **Step 3: Globe**

Curl `/mapa-mundial`. After `npm run build`, read `dist/mapa-mundial/index.html`'s bundled CSS and confirm `.globo-mapa` uses `mask-image`/`-webkit-mask-image` (not `filter`+`background-image` with the old grayscale/sepia chain) and that its `data-astro-cid` matches the actual `<div class="globo-mapa">` element's cid. Confirm `globo-leyenda-item` appears 5 times.

- [ ] **Step 4: Comparador**

Curl `/comparador`, confirm the select elements still have `aria-label` (from the previous round — must not have been lost) and confirm the empty-state text updated correctly.

- [ ] **Step 5: Reduced-motion / accessibility spot-check**

Re-read `GlobeMundial.astro`'s `<script>` block and confirm it is byte-identical to before this plan started (this plan's Task 5 explicitly must not touch it) — the reduced-motion gating and the pointer-events/tabindex fix from the previous round must still be intact.

- [ ] **Step 6: Full build + tests**

Run `npm run build` (expect 41 pages, no errors) and `npx vitest run` (expect 22 tests: 16 before this plan + 6 new from `imagenes.test.ts`).

- [ ] **Step 7: Report**

No commit for this task — write findings to the report file.
