# Berlin night background

22 October 2026. The creator requested the Berlin background in
[fog-and-background.png](../../design/fog-and-background.png). This extends the
original environment brief; the production GLB, camera and lighting are unchanged.

## Implementation

The hand-authored [SVG](../../../public/images/berlin-night.svg) uses a navy sky,
soft layered rooflines, a TV Tower silhouette with red antenna lights, distant
domes, a few warm windows, sparse stars and a warm crescent moon. A muted rose
horizon and cool mist blend the city into the existing ground fog and concrete.
The skyline is stylized artwork, rather than a geographically exact panorama.

The SVG is a decorative image behind the transparent Canvas. It cannot intercept
pointer events, has empty alt text, adds no focus target, and shares the scene's
theme filter. Its dimensions are reserved inside the existing full-screen stage.
Portrait screens crop toward the TV Tower and lift the artwork slightly to keep
its observation deck visible beside the stand. The moon falls outside that crop.

The image adds one small static request, no dependency, WebGL texture, draw call,
per-frame JavaScript or extra scene rendering. SVG blur/glow filters are static.
The background remains fixed while the stand camera orbits; this is distant
scenery, without 3D parallax.

## Visual comparison

| View              | Before                       | After                      |
| ----------------- | ---------------------------- | -------------------------- |
| Desktop, standard | [Before](before-desktop.png) | [After](after-desktop.png) |
| Mobile, automatic | [Before](before-mobile.png)  | [After](after-mobile.png)  |

Captures use the production preview, Chromium 156, ANGLE SwiftShader software
WebGL, DPR 1 and reduced motion for a stable comparison. Desktop is 1280 × 720;
mobile is 390 × 844. The baseline is local commit `cc27f39`.
See [before observations](before.json) and [after observations](after.json).
Both final after screenshots were inspected against the baseline and reference.
The first-frame WebGL counts remain 342 draw calls and 16 textures on both
profiles, including the existing cached shadow bake. Triangle counts are also
unchanged: 134,060 on standard and 134,052 on mobile.

## Verification

The browser fallback test checks image decoding and non-interception at narrow
portrait and short landscape sizes. Existing browser flows cover camera drag,
scroll zoom, CRT navigation, themes, reduced motion and WebGL failure.

Formatting, lint, typecheck, production build, all 21 unit tests and the frozen
GLB contract check passed. The build retains the existing large-chunk warning.
All 23 production browser tests passed, including the extended background check.

Physical-device FPS and cold-network startup remain unmeasured. Software WebGL
captures verify appearance and behavior, rather than hardware performance.
