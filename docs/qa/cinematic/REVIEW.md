# Cinematic stand review

22 October 2026. The local visual comparison is accepted for this implementation
checkpoint. Hardware performance approval remains open; this is not release signoff.
Direction: [TACO-STAND.md](../../design/TACO-STAND.md) and
[vibe-reference.jpeg](../../design/vibe-reference.jpeg).

## Visual evidence and decision

Open the [before/after slider](comparison.html), or compare the matching-camera
[before](before/desktop.png) and [after](after/desktop.png) directly. Final default
framing: [desktop](hero-final/desktop.png), [mobile](hero-final/mobile.png).
Automatic software-renderer desktop profile: [low-final](low-final/desktop.png).

These are actual production-browser screenshots. The comparison pair uses the
same 1280 × 720 viewport, reduced motion and original camera. The capture script
asserts that every named target's projected position matches the baseline within
1e-7. Default-camera images are separate so camera changes cannot masquerade as
lighting improvements. The diagnostics block appears only with `?debug=1`.

The accepted result has localized warm counter/trompo illumination, deeper
recesses, grounded stools and equipment, cool separation and a larger three-quarter
composition. The pink awning, complete sign, CRT and platform remain readable.
Portrait framing preserves the complete stand and target access rather than
cropping it to fill the screen. It takes the reference's warm/cool direction
without adding its architecture, steam or photographic depth of field.

The low-cost profile has harder shadow edges than standard: a deliberate quality
compromise. The result adds depth without postprocessing, but real-device frame
rates still need validation.

## Pass A: audit and baseline

The original renderer used ACES filmic tone mapping (Three.js value 4), exposure 1,
sRGB output and no shadows or reflection environment. Its hemisphere intensity
1.7, warm key 3.2, cool directional fill 2.4 and one warm point light 12 produced
bright, relatively uniform illumination. Missing cast/contact shading and broad
fill flattened the counter, equipment and trim.

The GLB includes emissive pendant filaments, a CRT glow, pink edge emission and
amplifier logo. It has no imported restaurant light rig or baked-light maps.
Bulb centers are (-1.22, 2.545, 0.44), (-0.18, 2.545, 0.44) and
(0.96, 2.545, 0.44), in world coordinates. The baseline camera uses 38° vertical
FOV, approximately 21° azimuth and 7° elevation on desktop.

## Passes B–C: lighting and materials

The final rig replaces the original lights with:

- Warm-neutral directional key at (-3.5, 7, 5), `#ffe3bf`, intensity 2.
- Weak hemisphere fill, `#9dbbd0` / `#2a171e`, intensity 0.4.
- Cool rear directional rim at (3, 4, -4), `#6aadc8`, intensity 1.8.
- Unshadowed practical lights at the actual bulbs, offset by (0, -0.06, 0.02),
  `#ffd09a`, distance 4.5, decay 2. Standard uses three, intensities 6/8/5;
  mobile/low uses the center only, intensity 13.

Only the key casts shadows. Its cached 1024 × 1024 map uses PCF filtering on
standard and single-sample BasicShadowMap on mobile/low. Orthographic bounds are
±5.2, near/far 3/15, bias -0.0008 and normal bias 0.02. The map is baked on initial
setup and refreshed on quality/context changes, rather than every orbit frame.
Trompo descendants, transparent bottle layers and emissive bulbs do not cast into
this static cache. The trompo still receives shadows and rotates normally.
Source mesh flags are restored during cleanup.

Runtime overrides use owned, shared-per-source material clones. Cleanup restores
original assignments and disposes only owned materials. Source colors, textures,
geometry and hierarchy stay intact.

| Exact source material                     | Runtime change                                |
| ----------------------------------------- | --------------------------------------------- |
| `05 · cool brushed stainless.009`         | Roughness 0.29 → 0.38; metalness 0.78 → 0.55  |
| `07 · honey brass trim.009`               | Roughness 0.28 → 0.36; metalness 0.70 → 0.55  |
| `08 · hammered copper.009`                | Metalness 0.57 → 0.40; roughness remains 0.30 |
| `01 · midnight navy enamel.009`           | Roughness 0.42 → 0.38; metalness 0.30 → 0.22  |
| `WORK \| glossy cobalt monitor bezel.008` | Roughness 0.27 → 0.32                         |
| `28 · pendant amber filament.009`         | Emissive intensity 1 → 0.65                   |

The frozen asset's two transmissive bottle materials use alpha transparency to
remove a second whole-scene refraction pass. Transmission becomes 0 and depth
writing is disabled; clear glass `18b · clear bottle glass.006` uses opacity 0.28
and mango liquid uses 0.9. Maps/base colors are retained. This simplification now
applies on desktop too. The CRT retains its existing unlit, non-tone-mapped
textured material so lighting cannot obscure “Work ↗”.

ACES, exposure 1 and sRGB output are explicit. There is no retained reflection
environment, bloom, SSAO, fog, particles, depth of field or extra rendering package.

## Passes D–E: camera and rejected alternatives

Desktop framing moves to approximately 29° azimuth / 10° elevation. The fit uses
transformed mesh bounds and perspective constraints to center projected extents,
instead of centering an oversized world box. This enlarges the miniature while
keeping the full sign/platform visible. Narrow screens use a near-front view.
`?compare=1` restores the original camera for reproducible comparisons.

After the first rendered frame, a 700 ms eased entrance moves from 3.5% wider to
the fitted view. It never gates readiness; pointer/keyboard input cancels it.
Reduced motion disables entrance and damping. Left-drag, scroll, arrow keys,
plus/minus, Home and Reset view remain available. Reset updates camera matrices
synchronously so the next CRT click uses the restored view. A drag that returns
to its start cannot accidentally activate the CRT.

Iterations were captured and inspected before proceeding:

- [Initial lighting](lighting/desktop.png): rejected stippling; corrected shadow
  bounds/bias in [lighting-clean](lighting-clean/desktop.png).
- [Global reflections](materials/desktop.png): rejected washed-out highlights.
  [Reduced intensity](materials-balanced/desktop.png) looked calmer but remained
  expensive in software rendering (observed 0.6–1.1 loop FPS).
- [Targeted reflections](reflection-targeted/desktop.png): still about 1.0 loop
  FPS; the environment and its render target were removed entirely.
- [First hero camera](hero/desktop.png): rejected wasted screen area. The final
  perspective fit restores prominence without moving model parts.
- [512-pixel Basic shadows](low-budget/desktop.png): rejected obvious jaggies;
  the final lower-cost profile uses a 1024-pixel map with Basic filtering.

Draft captures remain as an audit trail. Use `after`, `hero-final` and `low-final`
for the retained implementation.

## Pass F: measurements and regression disclosure

All observations use a production build on loopback HTTP, Chromium 156 / ANGLE
SwiftShader software WebGL, DPR 1, no CPU/network throttling and fresh contexts
with potentially warm OS/shader caches. Screenshots use reduced motion. Benchmark
contexts use normal motion, skip three frames plus one second, then sample roughly
four seconds. “Loop FPS” measures browser rendering cadence, not GPU presentation
timing, physical-phone FPS or a field percentile.

| Matching original camera         | Before desktop | After desktop | Before mobile | After mobile |
| -------------------------------- | -------------: | ------------: | ------------: | -----------: |
| Viewport                         |     1280 × 720 |    1280 × 720 |     390 × 844 |    390 × 844 |
| Ready, ms                        |          3,925 |         2,925 |         1,970 |        1,839 |
| Model parsed, ms from navigation |          2,034 |         1,750 |           850 |          644 |
| GLB download, ms                 |             69 |            87 |           107 |           89 |
| First-frame draw calls           |            358 |           339 |           185 |          339 |
| Steady draw calls                |            358 |           185 |           185 |          185 |
| Steady rendered triangles        |        141,802 |        71,513 |        71,513 |       71,513 |
| Renderer texture count           |             15 |            16 |            14 |           16 |
| Loop FPS                         |            3.1 |           2.0 |           5.3 |          4.8 |
| Loop frame p95, ms               |          2,311 |         1,247 |           343 |          425 |

Raw evidence: [before](before/measurements.json), [after](after/measurements.json).
The first final frame includes a one-time shadow bake (339 calls / 134,024
rendered triangles); later frames use 185 / 71,513. These counts include rendering
passes and are not source geometry counts. Glass simplification reduces desktop
steady calls by about 48% and rendered triangles by about 50%. Shadows add texture
memory, startup bake work and per-fragment sampling: fewer calls do not prove
faster frames. The final software-loop samples regress against baseline; p95 is
also noisy. No real GPU timing or memory-byte measurement is available here.

With the refined camera, [standard desktop readiness](hero-final/measurements.json)
was 3,704 ms and mobile 2,527 ms. The [lower-cost run](low-final/measurements.json)
was 2,453 ms on desktop, 3.0 loop FPS / 919 ms p95; its mobile run was 1,671 ms,
4.7 loop FPS / 417 ms p95. Earlier runs varied substantially. The 2–3 second target
is therefore not consistently met or validated on representative hardware/networks.

Low-cost caps DPR at 1 and uses one practical light; standard caps it at 1.5 and
uses three. Narrow screens, coarse pointers (including phone landscape) and
detected software renderers select the cheaper profile. Explicit `?quality=low`
and `?quality=standard` overrides support comparisons.

## Verification and remaining work

- `npm run format:check`, `typecheck`, `lint`, `build`, `test` and `validate:asset`
  pass. Astro reports zero errors/warnings/hints; the build retains the existing
  deferred chunk-size warning. There are 16 passing unit tests.
- `npm run test:e2e`: all 13 Chromium browser tests pass. Coverage includes real
  CRT raycasts, one model request, no original-media/audio requests at startup,
  normal-motion entrance interruption/reset, drag/zoom/keyboard/reset, touch CRT
  access in portrait/landscape, blocked GLB, missing WebGL, no-JS routes,
  theme persistence and responsive HTML navigation.
- Desktop, portrait, matching-camera and low-cost screenshots were inspected.
  Source GLB remains 2,609,612 bytes, 175 meshes, 218 nodes, 61 materials and
  70,293 triangles. SHA256:
  `09e950db19887e86094b5feb98df50badee1b21a5171afeba0d230cbdf61bad9`.
- Physical desktop/mobile FPS, GPU timings, DPR above 1, throttled cold/warm
  network runs, screen-reader review and Core Web Vitals remain unverified.
  Hardware testing must decide whether shadows need further reduction.
- Cached shadows suit the static stand. Future animated bottles/props need an
  explicit cache refresh/exclusion decision.
- Working interactions are CRT navigation, HTML themes, camera exploration,
  loading/fallbacks and trompo rotation. Bottle themes, drawing/photo viewers and
  amplifier audio remain Phase 3 work; their named nodes are preserved. Real
  project/media content and public deployment remain outside this checkpoint.
