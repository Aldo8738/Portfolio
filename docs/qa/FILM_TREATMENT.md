# Static cinematic film treatment

Implements the [film treatment brief](../taqueria-cinematic-film-filter-codex.md)
as a reversible CSS enhancement, enabled only in Noir per the creator's latest
direction. The frozen GLB, camera, scene lighting, sound,
ASCII loader and content routes are unchanged.

## Implementation and tuning

- `src/components/experience/Experience.tsx` adds one decorative, `aria-hidden`
  element inside the existing canvas wrapper, only when the scene is ready.
- `src/components/experience/Experience.module.css` gives that wrapper stacking
  level zero, below existing HTML controls. The film element and both pseudo-elements
  ignore pointer input. The existing canvas theme filter also covers the neutral
  texture; no filter is added to HTML controls or document content. The overlay
  uses `display: none` outside Noir, so Original and Synthwave stay untreated.
- `public/textures/film-grain-tile.png` is a 128 × 128 grayscale-and-alpha PNG,
  **3,304 bytes**. Independent black/white noise samples have alpha 64/255; there
  is no opaque gray base or directional seam. It repeats at native CSS dimensions.
  This is an authored procedural texture, not a photograph or personal asset.
- No runtime dependency, React animation, new light, shader or WebGL pass is added.
  The static treatment behaves identically with reduced motion.

| Scene state                                  | Grain CSS opacity | Vignette                                                |
| -------------------------------------------- | ----------------- | ------------------------------------------------------- |
| Original and Synthwave, all states           | Disabled          | Disabled                                                |
| Noir, desktop                                | 0.045             | Transparent through 55%; 2% at 80%, 8% at outer corners |
| Noir, width ≤640px                           | 0.025             | Disabled                                                |
| Noir, photo approach and gallery, all widths | 0.0125            | Disabled                                                |

The vignette is an ellipse centered at 50% 46%. Texture alpha multiplies the
listed CSS opacity: maximum per-pixel grain coverage in Noir is approximately
1.13% on desktop, 0.63% on mobile and 0.31% in the gallery.

## A/B comparison

In browser developer tools, add `--film-treatment-opacity: 0` to the element with
`data-scene-status`. Remove it or set it to `1` to restore the effect in Noir. This leaves
the canvas, camera and controls mounted. To disable it in source, remove the
single `data-scene-film` element and its scoped CSS rules.

For matching before/after captures, run:

```sh
npm run build
npm run test:e2e -- tests/e2e/film.spec.ts
```

The tests capture the same reduced-motion camera at 1280 × 720 and 390 × 844 in
all three themes, with the effect off/on. They also capture a photo close-up and
a keyboard-zoomed stand. Captures are written to ignored `test-results/`.
Original and Synthwave must keep the overlay hidden even with the A/B opacity
set to one. The texture must remain unrequested until the first Noir selection;
switching back to Noir restores it without a duplicate texture request.
Assertions cover pointer transparency, decorative semantics, theme/mobile/gallery
strength, shared texture requests, working gallery controls, fallback behavior,
and absence from Work, CV, About, Contact and a project route.

## Verification and limits

For the Noir-only follow-up, formatting, lint, the static build (including Astro
typechecking), all 75 unit tests and the frozen asset contract pass. All three
film browser checks pass in Chromium with SwiftShader, covering desktop/mobile
theme switches and WebGL failure. The broader interaction suites were not rerun
for this CSS restriction.

Visual review in local Chromium with SwiftShader covered matching hero captures
in all themes, desktop/mobile compositions, the gallery and a zoomed stand. The
initial texture was too visible in smooth skies; reducing alpha from 160 to 64
keeps the final noise fine and faint without obscuring the sign or CRT. Mobile
has no dark corner treatment. HTML navigation and gallery controls remain crisp.

At the original implementation checkpoint, `npm run format:check`,
`npm run typecheck`, `npm run lint`, `npm test` (73 tests),
`npm run validate:asset` and `npm run build` pass. Astro reports zero errors,
warnings or hints; Vite retains its large-chunk advisory. The dedicated film
browser checks pass at both viewport sizes, including the WebGL fallback case.
The film, drawings, navigation and photo suites cover 20 browser scenarios. The
combined run passed 19; the mobile drawings case timed out while creating its
browser context, before opening the page. Its isolated retry passed. All 20
scenarios therefore passed, with that setup flake recorded rather than hidden.

Other changed documentation: the handoff and development plan link this review;
the supplied implementation brief was normalized with Prettier. No package or
lockfile change is required.

The texture adds 3,304 bytes of image payload on scene readiness, plus HTTP
overhead, requested only when Noir first displays the overlay and then cached
across theme switches. FPS, GPU compositing cost, cold/warm startup deltas
and physical-device touch performance have not been measured. Emulated mobile
screenshots and software WebGL checks do not establish hardware performance.
