# Monitor-to-portfolio tile transition

The current visual progression is **stand to monitor to diamond ribbons to rotating
mosaic tunnel to square pixels to real portfolio HTML**. It supersedes the previous
Matrix animation; no glyph atlas, rain canvas or extra renderer remains active.
The three creator-supplied mocks guide palette, tile ribbons and pixel decomposition;
the real portfolio content and layout remain unchanged.

## Implementation

- `portfolio-transition.ts` exposes `portfolioTiming` (0.5s activation, 0.9s flight,
  0.4s decomposition, 0.7s reconstruction) and `tileVisuals` (palette, pixel columns,
  fragment subdivision and expansion timing).
- `wormhole-shaders.ts` shares one procedural fragment shader between the existing
  CRT and one clip-space quad. Its corners initially match the physical display's
  projected top-down UV corners. The quad expands while the camera finishes its
  aligned approach, maintaining the same palette and pattern.
- The tunnel uses angular/depth coordinates, alternating ceramic ribbons, fine
  amber grid lines and negative space. Each diamond's subdivisions inherit its
  color before separating into square fragments. Rotation and forward motion ease
  down during decomposition. Diamonds remain intact through the flight, then break
  up at staggered thresholds during decomposition. The flat grid appears only in
  the final 35% of decomposition. Shallow ceramic bevel shading, directional warm
  rims and selective tunnel illumination add depth in the same shader pass.
- The final shader alpha clears across the measured intro, site header and content
  bounds of the prepared static `/work` DOM. Left-to-right sweeps expand from those
  regions, with background areas following afterward; the mask is quantized to the
  pixel grid without random clearing. Bounds update on entry and viewport resize,
  without frame-by-frame DOM reads. Pixels clear in the first 65% of reconstruction,
  leaving the remaining time for the HTML reveal; total timing and camera path stay
  unchanged.
  GSAP reveals the actual heading, header and supporting content within the same
  reconstruction duration. There is no final webpage texture or fake 3D content.
- Once the quad covers the viewport, the stand and environment stop drawing.
  Reconstruction clears the WebGL background and CSS stage background so mask
  holes expose HTML. Back restores every saved visibility flag, material assignment,
  camera pose and renderer clear state. Theme material clones remain reusable.
- Shader materials and the quad persist across replays and dispose on unmount.
  No per-pixel React nodes, frame-driven React state, texture uploads or new
  dependencies are required. Mobile uses 28 pixel columns versus 44 on desktop, with fewer occupied cells.
  Rendering becomes demand-driven after the handoff.

`enterPortfolio(): Promise<void>` coalesces repeated activations. The existing
static route is fetched and parsed before visible animation. Preparation failures
fall back to ordinary `/work` navigation. Reduced motion skips camera/tunnel motion
and uses a 0.45-second stationary dissolve with no text translation. Hidden scenes
and the debug pause stop timeline advancement; active durations use elapsed time.

## Replay and verification

Open `/?debug=1`, click the monitor, then use **Replay monitor transition** on the
revealed page. The existing `taqueria:replay-portfolio` and
`taqueria:pause-portfolio` debug events remain available. Browser Back restores the
stand; Forward loads the ordinary static route. Direct content routes and fallback
HTML navigation work independently of WebGL.

Automated coverage checks projected monitor corners, desktop phase captures,
mobile entry, reduced motion, GPU reveal bounds matching the actual layout, usable
HTML, one canvas, replay and screen restoration
on Back. Browser results use Chromium SwiftShader: functional/visual evidence,
not physical GPU performance evidence. Final physical mobile profiling and creator
approval remain pending. Missing project content remains an explicit empty state.

The DOM import targets the current static Work page. If hydrated widgets are added,
initialize them explicitly before relying on this path.

## Work entrance replay regression

The monitor already reveals the real Work heading and exhibition during its
reconstruction. Previously, activating Work afterwards replayed its normal page
entrance, briefly resetting the heading and visible project content to transparent.
This looked like a second load. A browser regression reproduced the opacity reset.

The monitor now mounts Work with `animateEntrance: false`. The first intersection
notifications retain the content just revealed by the monitor. Later scroll entries
still animate normally. Direct/app-bar navigation retains the default Work entrance.
The transition, route preparation, URL/history and reduced-motion behavior are
unchanged. The regression checks continuous content visibility after handoff, one
Work fetch without a document reload, and project reveals after scrolling away/back.

Validation: the new browser regression failed before the fix and passes afterwards.
All 11 monitor/Work browser checks pass in Chromium/SwiftShader, including normal
and reduced motion, mobile handoff, Back/replay, scrolling, static routes and layout.
All 57 unit tests, formatting, lint, typechecking and the static production build
pass. The build retains its chunk-size warning. Physical-device review was not run.

## Development stylesheet regression

Astro's development response supplies CSS in inline head styles, while production
uses linked stylesheets. The monitor preparation now imports both forms and
deduplicates inline styles on repeat entry. Previously only links were copied,
leaving the development Work page with unstyled project links and filled SVG paths.

`tests/dev/monitor-styles.spec.ts` reproduces that failure and compares the monitor
destination's computed layout with direct `/work` navigation. It also checks the first project heading remains in view, the removed map stays
absent, and repeats entry after browser Back without
duplicating the Work stylesheet. The desktop Chromium screenshot was visually
reviewed after the fix. Physical GPU testing remains pending.
