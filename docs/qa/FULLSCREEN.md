# Fullscreen design checkpoint

Reviewed 21 October 2026 against the creator's [mock](../design/mock.png) and
[visual direction](../design/DIRECTION.md). This replaces the initial boxed
homepage presentation documented in [BASELINE.md](BASELINE.md).

The homepage now opens with a viewport-sized scene, compact identity/navigation
and bottom controls. Its large visible introduction and footer are removed.
The responsive camera keeps the complete frozen stand in view. The original
portfolio theme now uses warm white, bold sans-serif type and magenta accents;
Noir and Vintage continue to persist across routes.

## Verification and evidence

- [Desktop homepage, 1280 × 720](fullscreen-desktop.png)
- [Portrait homepage, 390 × 844](fullscreen-mobile.png)
- [Work page with the current honest empty state](work-layout.png)
- Eight unit tests and ten Chromium browser tests pass. Checks cover the frozen
  asset contract, camera fitting, exact fullscreen Canvas dimensions, the real
  CRT raycast, one GLB request, no eager originals/audio, fallback navigation,
  no-JavaScript content, theme persistence, 404s and content-page overflow.
- A keyboard-operated theme menu and nonoverlapping navigation are checked at
  320 × 740 and 844 × 390. Physical touch and screen-reader testing remain pending.
- Formatting, ESLint, Astro typechecking and the production build pass. The existing
  deferred 3D bundle size warning remains. No dependency or frozen asset changed.
- The user's development server on port 4321 returned HTTP 200 with the new
  immersive layout. Automated checks used production preview on port 4322;
  Playwright stopped that preview after testing.

## Startup observations

Production preview over loopback, Chromium 156.0.8078.4, Windows 10 user agent,
ANGLE SwiftShader software renderer, DPR 1 and reduced motion. No network/CPU
throttling; fresh browser contexts with potentially warm OS/shader caches.
These are individual observations, not averages or physical-device measurements.

| Viewport            |    Ready | GLB download | Model parsed by | Renderer calls | Rendered triangles |
| ------------------- | -------: | -----------: | --------------: | -------------: | -----------------: |
| Desktop, 1280 × 720 | 3,790 ms |     1,150 ms |        2,391 ms |            358 |            141,802 |
| Portrait, 390 × 844 | 1,692 ms |        83 ms |          926 ms |            185 |             71,513 |

Ready and parsed timestamps are measured from navigation; the download column is
the resource duration. The desktop observation misses the 2–3 second target.
Earlier observations varied, so the target is not generally verified. Physical
GPU/mobile FPS, throttled startup and Core Web Vitals remain unmeasured. This
layout change adds no render pass, postprocessing effect or additional download.

The mock is illustrative rather than a replacement GLB. Lighting fidelity, the
CRT approach animation and the remaining object interactions are still pending.
Real projects, a CV and original media must be supplied before their links or
content appear. No deployment or remote push occurred.
