# Taquería Aldo — Subtle Cinematic Film Treatment

**Implementation brief for Codex**\
**Scope:** The interactive Three.js / React Three Fiber taquería scene only\
**Goal:** A light 35mm-film feel — **not** VHS, glitch, retro-game, or a full-screen filter.

**Latest creator direction:** Enable the film treatment only in Noir. This
supersedes the all-theme behavior below; Original and Synthwave have no grain
or vignette.

## 1. Creative direction

The existing scene already has its own strong aesthetic: a miniature Mexican taquería glowing warmly against a quiet, blue-hour Berlin skyline. Keep that aesthetic. Add only enough film texture to make the scene feel slightly more tactile, atmospheric, and photographed.

Think **a miniature movie set captured on film**, not a digital simulation of damaged old footage.

The approved visual reference is the recent film-treatment mock, **but use a much more restrained effect than its strongest grain, warm bloom, or vignette**. The real 3D taquería and its existing lighting remain the source of truth.

**Order of attention:** illuminated taquería → personal details / objects → distant fog and skyline → subtle film texture that the viewer feels rather than notices.

## 2. Strict scope and placement

- Apply the treatment **only over the rendered 3D scene** (its `<canvas>` and background), not over the document or navigation.
- Do **not** apply film grain, tint, blur, vignette, or contrast reduction to the header, logo, navigation, gallery controls, paper **Back to stand** sign, project links, captions, progress UI, or accessibility controls.
- Do **not** apply it to the light Work, CV, About, Contact, or project pages.
- It may remain behind the suspended Polaroids if those are part of the WebGL canvas; do not obscure photo details or make those physical photo textures look dirty. Prefer a lighter effect while gallery mode is active if the photos lose clarity.
- The ASCII taco loader remains unchanged.
- Keep all current camera framing, geometry, lights, themes, sound behavior, and interactive flows.

**Recommended stacking:**

```text
hero scene container
  ├─ Three.js canvas
  ├─ film-treatment overlay(s)   ← pointer-events: none
  └─ HTML user interface         ← always crisp, above overlays
```

If the existing DOM structure differs, adapt to it instead of rebuilding the scene.

## 3. Effect specification

### A. Very subtle static film grain — primary effect

- Create **one tiny, pre-generated seamless noise tile** (prefer a compressed WebP or PNG, e.g. 128×128 or 256×256). It should be grayscale, fine-grained, non-directional, and neutral in color.
- Tile it with `background-repeat: repeat` over the scene container using a single absolutely positioned HTML element or pseudo-element.
- Start around **3%–5% effective visibility**, then tune visually; the image should not look gritty at normal viewing distance.
- Grain should be easiest to notice in midtones and darker regions, while the taquería’s labels, photographs, and lit details remain legible.
- **Keep grain static** in v1. Do not update the image every frame or add random flicker.
- If the texture appears patterned or tiled, improve the small asset rather than adding animated noise.

Avoid procedural per-frame noise, canvas readbacks, fragment-shader passes, SVG turbulence filters, large textures, or hundreds of DOM particles.

### B. Extremely mild vignette — optional, secondary

- Use a **single CSS radial gradient overlay**, with transparent center and a soft darkening limited mostly to the outer corners.
- Aim for a **barely noticeable** vignette, not a black circular frame or obvious spotlight.
- Never darken the taquería sign, the lower platform, or important background silhouettes aggressively.
- Reduce or disable it on narrow screens if it squeezes the already limited composition.

### C. Color grading — minimal, optional

- Preserve the existing indigo/blue-hour background, warm amber interior and pink awning.
- If the image benefits from it, adjust **existing scene lighting/material values very slightly**: warm highlights, cool shadows. Prefer tuning existing lights and backgrounds over adding post-processing.
- **Do not** apply aggressive `filter: sepia()`, high saturation, contrast crushing, or a screen-wide orange tint.
- No hue shifts to the Polaroid images, brand elements, or UI.

### Explicitly out of scope

- Chromatic aberration / RGB splitting
- VHS tracking, scanlines, scratches, dust storms, light leaks
- Heavy blur, excessive bloom, film burn transitions
- Animated grain or flicker
- Post-processing pipelines (`EffectComposer`, custom fullscreen WebGL passes) solely for this effect

## 4. Lightweight implementation guidance

First inspect the actual Astro/React/Three.js implementation and identify the wrapper around the scene canvas and the HTML interface layers. Reuse existing theme CSS variables if available.

Suggested _illustrative_ structure (not a mandate to rewrite components):

```jsx
<div className="taqueria-scene-shell">
  <SceneCanvas />
  <div className="taqueria-film" aria-hidden="true">
    <div className="taqueria-film__grain" />
    <div className="taqueria-film__vignette" />
  </div>
  <HeroOverlayControls />
</div>
```

Suggested baseline CSS — adjust selectors/z-index to the existing scene implementation:

```css
.taqueria-scene-shell {
  position: relative;
  isolation: isolate;
}

.taqueria-film {
  position: absolute;
  inset: 0;
  z-index: 1; /* canvas below, HTML controls above */
  pointer-events: none;
  overflow: hidden;
}

.taqueria-film__grain,
.taqueria-film__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.taqueria-film__grain {
  background: url('/textures/film-grain-tile.webp') repeat;
  background-size: 192px 192px; /* tune only after seeing the real texture */
  opacity: 0.04;
}

.taqueria-film__vignette {
  background: radial-gradient(
    ellipse at 50% 46%,
    transparent 52%,
    rgba(4, 9, 20, 0.035) 78%,
    rgba(4, 9, 20, 0.12) 100%
  );
}

/* Keep the existing overlay controls above the scene treatment. */
.taqueria-scene-ui {
  position: relative;
  z-index: 2;
}

@media (max-width: 640px) {
  .taqueria-film__grain {
    opacity: 0.025;
  }
  .taqueria-film__vignette {
    opacity: 0.5;
  }
}
```

**Important:** CSS `opacity` applies to the entire texture including any transparent areas. The perceived intensity depends on how the tile is authored. The values above are starting points, **not universal visual targets**. Tune them in the browser against the actual scene. If the tile is fully opaque neutral gray, a 4% overlay can wash out colors; a texture with neutral transparent noise is preferable. Also avoid heavy CSS `mix-blend-mode` unless profiling confirms it is fine on target devices.

Add one explicit CSS variable or class to disable the effect easily for visual A/B testing, e.g. `.taqueria-film--off { display: none; }`. Avoid a permanent new settings panel unless one already exists.

## 5. Theme behavior

Keep **Original, Noir, and Synthwave** distinct:

- **Original:** very fine neutral grain and nearly invisible vignette. This is the primary art-directed version.
- **Noir:** optional slightly more visible monochrome grain, but preserve black-and-white contrast and do not tint it brown.
- **Synthwave:** same restrained grain with minimal/no extra tint; let its existing magenta/cyan lights supply the color. Avoid amplifying neon or adding glow.

Implement with lightweight existing theme state/CSS classes, not separate rendering pipelines or duplicate texture downloads.

## 6. Performance budget and behavior

- The filter must **not increase initial JS bundle size materially** or require a new runtime dependency.
- One tiny static noise image, shared between themes; target a few KB where practical.
- Do not trigger React state updates or GSAP timelines for film grain.
- Do not animate `background-position`, opacity noise, or flicker every frame.
- No extra WebGL render pass, camera changes, lights, geometries, or shadows.
- `pointer-events: none` on every film overlay so dragging/scrolling/clicking the model stays unaffected.
- Avoid CSS `backdrop-filter: blur(...)`, broad `filter` chains, or expensive blend modes.
- Respect `prefers-reduced-motion`; the treatment is static anyway.
- On resource-constrained mobile devices, it is acceptable to reduce or completely disable the grain/vignette if the browser shows a measurable rendering regression.

A tiny texture is not automatically free: test raster/compositing cost on real mobile devices or device emulation rather than claiming zero performance impact.

## 7. Visual QA / approval criteria

Compare **before vs. after** at the same camera position, lighting, theme, resolution and browser zoom:

1. **Default hero**: scene still reads as a crisp, warmly illuminated miniature. Grain is nearly invisible at a glance.
2. **Close-up of the stand**: text on the sign, menu screen and small props remains sharp.
3. **Polaroid gallery**: faces and photographs are not washed out or obscured; overlay controls are crystal clear.
4. **Berlin skyline and fog**: texture creates subtle atmosphere without adding noisy bands to smooth gradients.
5. **Original / Noir / Synthwave**: effect looks intentional in each theme.
6. **Mobile**: no distracting dark corners, text remains legible, touch gestures unaffected.
7. **Navigation to Work/CV**: treatment disappears entirely outside the 3D scene.
8. **Accessibility**: overlays ignored by screen readers and never intercept interactions.
9. **Performance**: compare initial transfer size, hero frame rate and interaction responsiveness before/after; no meaningful regression.

If a normal visitor immediately says **“there's a film-grain filter”**, the effect is probably too strong. The desired reaction is **“this feels more cinematic”**.

## 8. Delivery requirements

Implement a **minimal, reversible enhancement**. After making the changes, report:

- Files modified/created
- Size of the new texture asset
- How the effect is scoped to WebGL scene only
- Grain/vignette values per theme
- Any measured performance difference (or state clearly if not measured)
- How to toggle the treatment off for comparison

**Final principle:** Taquería Aldo is already visually distinctive. This should be the last 3–5% of atmosphere, **not a new aesthetic**.
