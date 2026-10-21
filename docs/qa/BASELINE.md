# First live scene checkpoint

Measured 21 October 2026 against the local Astro production preview. This is a
functional/visual baseline, not a physical-device performance certification.

## Environment and observations

- Windows 10 browser environment, Chromium 156.0.8078.4 through Playwright 1.64.1.
- ANGLE SwiftShader software WebGL renderer. Both the explicit software profile
  and a separate default-renderer capability probe reported SwiftShader.
- Local loopback HTTP, no bandwidth or CPU throttling. Fresh test browser contexts;
  OS and shader caches may be warm. Reduced motion was enabled for stable captures.
- Ready timing starts at navigation and ends after a rendered frame. It includes
  scripts, GLB loading and setup. These are single observations, not averages or
  field percentile results.

| Viewport                   | Observed ready time | Renderer calls | Rendered triangles | DPR |
| -------------------------- | ------------------: | -------------: | -----------------: | --: |
| Desktop, 1280 × 720        |            2,681 ms |            358 |            141,802 |   1 |
| Narrow viewport, 390 × 844 |            1,517 ms |            185 |             71,513 |   1 |

An earlier desktop observation with continuous motion was 4,585 ms. Variability
and software rendering prevent claiming that the 2–3 second goal is generally met.
FPS, physical-phone behavior, throttled network timings and Core Web Vitals remain
unmeasured.

The standard profile keeps physical transmission. The narrow-screen profile uses
an owned translucent material clone for glass, avoiding the full-scene refraction
pass. Frozen model bytes and source materials remain unchanged. No shadows, bloom,
HDRI download or physics engine are enabled at this checkpoint.

## Verification

- Frozen checksum and all 16 required names pass; duplicate, parent and metadata
  failures are exercised in unit tests.
- Seven unit tests pass, including camera-bound coverage at three aspect ratios.
- Nine browser tests pass, covering renderer capability, JavaScript-disabled HTML,
  404s, themes, mobile layout, one model request, the real CRT raycast, model failure,
  narrow-screen quality and unsupported WebGL. Some tests cover multiple scenarios.
- Formatting, ESLint, Astro typechecking and production build pass. The bundler
  reports a deferred 3D chunk of approximately 990 KB minified before transport
  compression. The warning is retained; hosting compression and startup profiling
  remain work for the performance phase.
- The shared user-facing browser surface is unavailable in this session. Verification
  used automated Chromium tests and inspection of their screenshots.

## Visual evidence and remaining work

- [Desktop scene](scene-desktop.png)
- [Narrow-screen scene](scene-mobile.png)

The camera fits the frozen model bounds, front at +Z. Sign, rail, Polaroids,
counter, sketchbook and amp remain in frame. The CRT uses a localized unlit screen
material for readability. No approved Blender reference was supplied, so exact
visual fidelity is not signed off.

Bottle/Polaroid/sketchbook interactions, media viewers and amp controls belong to
the next phase. Real projects and original media are missing. No deployment or
remote push has occurred.
