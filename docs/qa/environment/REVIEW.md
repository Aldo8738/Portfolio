# Camera-aware Berlin environment

22 October 2026. The creator requested that the Berlin background move with the
camera, with stars above and the floor below. This replaces the fixed HTML image
from the [earlier checkpoint](../berlin/REVIEW.md).

## Behavior and implementation

An inward-facing sky dome uses a surrounding
[2048 × 1024 SVG panorama](../../../public/images/berlin-panorama.svg), expanded
from the earlier artwork. Rooflines continue around the horizon; the TV Tower
and crescent occupy the front sector. Sparse stars fill the upper hemisphere.
The distant city sits low in the haze, while the existing rain-darkened concrete
remains real scene geometry underneath the stand.
The crescent is drawn analytically in the sky shader so its edge remains smooth
without increasing the panorama texture resolution.

The sky shader uses the camera's rotation but removes its translation. Orbiting
and tilting reveal different directions; zooming does not bring distant scenery
closer. The dome draws behind everything without writing depth, receiving light,
casting shadows or intercepting clicks. It does not affect model camera fitting.
There is no screen overlay, CSS background tracking, new animation loop or
per-frame React state. The existing Canvas theme filter affects the whole scene.

The panorama uses the existing loader cache. Owned sky geometry and material are
disposed by R3F; the cached texture remains loader-owned. Readiness waits for
the panorama inside the existing Suspense boundary. Content routes and WebGL
failure fallback still work independently of the scenery.

## Visual review

| View              | Before: fixed image          | After: sky dome            |
| ----------------- | ---------------------------- | -------------------------- |
| Desktop, standard | [Before](before-desktop.png) | [After](after-desktop.png) |
| Mobile, automatic | [Before](before-mobile.png)  | [After](after-mobile.png)  |

Additional camera views: [horizontal orbit](orbit.png), [rear view](rear.png),
[low camera / more sky](sky.png), [high camera / floor](floor.png).

Baseline images are the reviewed captures from local commit `93aa6a5`.
After captures use the production preview, Chromium 156, ANGLE SwiftShader,
DPR 1 and reduced motion. Desktop is 1280 × 720 and mobile is 390 × 844.
See [after observations](after.json).
Final desktop, mobile, rear, sky and floor captures were inspected against the
fixed-background baseline before accepting this checkpoint.

## Checks and limits

A browser regression test observes the actual sky shader's uploaded view matrix:
horizontal and vertical camera input change it, and Reset restores it. The full
scene suite also checks pointer drag, scroll zoom, CRT input, loader handoff,
reduced motion and fallback navigation.

Formatting, lint, typecheck, production build, all 21 unit tests, all 24
production browser tests and the frozen GLB contract check passed. The build
retains the existing large-chunk warning.

This adds one draw call, one texture and 2,208 triangles. First-frame counts are
343 calls and 17 textures on both profiles, including the existing shadow bake.
The SVG is about 32 KB before transport compression; rasterization produces an
RGBA texture of about 8 MiB before mipmaps. There is no environment-map conversion,
reflection capture or postprocessing pass.

The city is a distant panorama, with no translation parallax or 3D building
geometry. Hardware FPS and cold-network startup remain unmeasured.
