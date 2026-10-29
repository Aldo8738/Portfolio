# Taquería Aldo development plan

Planning baseline: 21 October 2026. The authoritative specification remains
[`TAQUERIA_ALDO_CODEX_HANDOFF.md`](../TAQUERIA_ALDO_CODEX_HANDOFF.md); this document
turns it into delivery checkpoints. Follow [coding conventions](CODING_CONVENTIONS.md)
when implementing each phase.
Astro + React + R3F is approved. The static HTML foundation, verification tooling
and first live model are implemented. See the [scene baseline](qa/BASELINE.md) for
actual browser observations and remaining verification limits.

The later [Selected Work brief](SELECTED_WORK_CODEX_BRIEF.md) supplies four project
descriptions and replaces the Work empty state with a static editorial exhibition.
It does not authorize changes to the taquería, About, Contact or CV. See the
[Selected Work implementation notes](qa/SELECTED_WORK.md) for the content model,
illustration limits, route integration and verification. Earlier empty-content
checkpoints below are historical; that increment emitted nine static pages.

The subsequent [CV brief](CV_CODEX_IMPLEMENTATION_BRIEF.md) adds the static `/cv`
career timeline and its typed skill catalog. Employment and overlapping education
remain distinct. The shared header's existing CV link is enabled; normal document
navigation and restrained timeline entrances are used instead of a new routing
layer. Download is omitted pending an approved public résumé asset. See the
[CV implementation review](qa/CV.md). The current build emits ten static pages.

The creator's [visual direction](design/DIRECTION.md), based on
[mock.png](design/mock.png), replaces the initial boxed scene: the stand opens
full screen beneath overlay navigation. Portfolio routes use a light editorial
layout with bold sans-serif type and magenta accents. Preserve the frozen model;
illustrative projects in the mock are not supplied case-study content.
The [fullscreen checkpoint](qa/FULLSCREEN.md) records the implemented layout,
screenshots and current browser measurements.
The creator's later [cinematic stand task](design/TACO-STAND.md) applies to the 3D
scene only. Preserve the HTML/UI and frozen model; review before/after captures
before accepting visual changes. See the [cinematic review](qa/cinematic/REVIEW.md).

The [About brief](ABOUT_PAGE_CODEX_IMPLEMENTATION_BRIEF.md) replaces the biography
placeholder with approved static copy, a responsive editorial grid and optional
GSAP entrance/ending motion. Native document navigation remains in use; no special
CV transition or scene dependency is added. See the [About review](qa/ABOUT.md).

## Accepted loading and performance decisions

The [Contact brief](CONTACT_PAGE_CODEX_IMPLEMENTATION_BRIEF.md) is implemented as a
static editorial `/contact` page with optional GSAP motion and a typed contact
configuration. The later [Contact refinement](CONTACT_PAGE_REFINEMENT_CODEX_BRIEF.md)
adds three editorial link rows. The subsequent [icon refinement](CONTACT_ICONS_REFINEMENT_CODEX_BRIEF.md)
replaces its abstract SVG with official social marks and a custom envelope. The
creator's latest correction removes the rows and scattered decoration, using one
aligned icon-and-label link group beside the headline and description. All three
destinations, including explicit public-email approval, were supplied by the creator
on 29 October 2026. See the [Contact review](qa/CONTACT.md).

These user clarifications supersede the handoff's poster-first loading requirement:

- Use the creator's supplied rotating ASCII taco as the loading presentation,
  replacing the original CSS bars. Inline its Canvas 2D renderer before React;
  remove it after the first usable scene frame or failure. It adds no dependency
  or separate renderer request. The creator's latest direction makes this a
  full-screen black loading dialog covering the entire homepage. Put it first
  in the body with a smaller centered taco, a locally rendered ASCII progress bar
  and a visible loading caption. Release
  it on readiness/failure after a 400 ms minimum from the first taco draw;
  keyboard skip and Escape can dismiss it immediately. A poster remains optional.
  The bar follows the GLB loader's measured byte progress, capped at 99% until
  textures and the first usable scene frame are ready. It stays at zero while
  preparing JavaScript or when a download total is unavailable; it never advances
  on a timer. The caption distinguishes download progress from scene preparation.
  The loader uses Google Fonts Fira Code for its caption, progress bar and canvas
  glyphs. It draws immediately with a monospace fallback and redraws when the font
  loads, including with reduced motion. Font failure never blocks scene handoff.
- Build introduction and real navigation as initial HTML beneath the loader. With reduced motion,
  show a still taco and status. Failed loading must resolve to useful HTML, not an endless loader.
- Aim for a usable 3D scene within approximately **2–3 seconds** from navigation start;
  earlier is better. Ready means the stand is rendered and its configured controls
  and hit targets respond, not merely that the GLB download has finished.
- This target covers the homepage shell, scene code, embedded previews and production
  GLB. Full-resolution viewer media and guitar audio still load only after interaction.
- Show genuine download progress only when measurable, then a setup status during
  parsing/compilation. Use an indeterminate bar rather than fabricated percentages;
  fill it only on actual readiness. The creator explicitly requests a two-second
  minimum loading presentation; add no further artificial delay.
- Verify the target on a production build with cold and warm caches, documented
  network conditions and named desktop/mobile hardware. Record download, parse/setup
  and ready timings separately. Initial software-renderer observations are recorded
  in the scene baseline; the target is not a
  guarantee for every connection or device, and is separate from LCP and steady FPS.
- Measure the actual scene early in Phase 2, before adding effects. Prioritize the
  scene fetch without blocking first HTML paint; bound any idle delay. If startup
  misses the target, identify the bottleneck before adding animation libraries or
  effects. Framework/renderer changes require evidence and must preserve the asset
  and accessibility contracts.

## Repository findings

- Present: Astro application in `src/`, package manifest and lockfile, check scripts,
  unit/browser tests, handoff, agent rules and the asset report.
- The production GLB remains in `public/models/`; the unchanged backup is now in
  `assets/reference/`, outside the served site. Extracted embedded JPEG previews are
  in `public/media/previews/` and are not full-resolution originals.
- Git is initialized locally on `main`, with `origin` set to
  [Aldo8738/Portfolio](https://github.com/Aldo8738/Portfolio). The remote was verified
  empty on 21 October 2026. Implementation checkpoints are local; no push is authorized yet.
  Root ignore rules exclude generated output and local environment values; Git
  attributes preserve GLB bytes across platforms.
- The system Node/npm are unchanged. A checksum-verified, ignored portable Node
  24.22.1/npm 11.19.1 toolchain in `.tools/` runs this checkout. Dependencies install
  successfully with the approved stack; see the lockfile and README commands.
- The merged production GLB has a valid glTF 2 header, 2,609,612 bytes, 218 nodes,
  175 meshes, 61 materials and 13 embedded images. Its SHA-256 matches the report:
  `09e950db19887e86094b5feb98df50badee1b21a5171afeba0d230cbdf61bad9`.
- All 16 required node names exist exactly once; interaction metadata is present.
  No external buffer/image URIs or animation clips were found. This is a structural
  inspection. Browser integration is verified separately in the scene baseline;
  physical-device performance remains unverified.
- The backup has 776 meshes and lacks the root and animation pivots required by the
  merged model contract. Use it for development visual/performance comparisons;
  it is not a drop-in runtime fallback. Runtime failures fall back to HTML with
  optional static artwork.
- No approved poster, external media, project content, biography or contact links
  are present. `README_START_HERE.txt` is not on disk despite the IDE tab reference.

## Approved implementation decisions

The creator approved **Astro + React + R3F** after the [stack review](STACK_REVIEW.md).
This supersedes the handoff's suggested Next.js framework. Use Astro static output,
the official React integration, strict TypeScript, npm and the committed lockfile.

- Generate portfolio routes as static HTML at build time where possible, so the
  portfolio does not require a running application server. Isolate React Three
  Fiber/Drei in a lazy client boundary on the landing page. Keep Three.js out of
  ordinary content routes. Verify the built static pages during scaffolding;
  introduce runtime server features only if a concrete requirement needs them.
- Use scoped Astro CSS, React CSS modules and shared CSS variables for tokens.
  Keep scene/viewer state in one React tree; share theme actions through a small
  browser module. Introduce no additional state library without need.
- GSAP 3.15.0 core now drives the initial camera reveal through the existing
  `useFrame` clock. After the loader closes, rotate from the rear, rise gently and
  descend to Reset view over 2.8 seconds. Keep camera input interruptible and skip
  the reveal for reduced motion. See the [entrance review](qa/entrance/REVIEW.md).
  The latest hero direction ends at a centered, directly front-facing miniature:
  `heroCamera` in `src/lib/camera.ts` sets desktop width to 33%, narrow-screen width
  to 80% (smoothly interpolated with aspect), height allowance to 60%, and elevation
  to `0.18`. Full model framing uses mesh corners without changing geometry.
  The entrance retains the previous rear framing and pulls out to the new hero
  over 2.8 seconds. Reset uses the same fitted destination, easing along the
  shortest orbit over 0.9 seconds. Both use the existing interruptible GSAP tween
  advanced by `useFrame`, pause with scene activity and skip motion when requested.
  Close views remain reachable by zoom. Resize refits immediately to avoid clipping.
  Screenshot matching, landmark/sign separation and physical-device composition
  remain subject to creator inspection; reference screenshots were not attached.
  Defer bloom and other postprocessing until measurements justify them.
- Prepare the stand's first frame behind the ASCII loader, then keep WebGL on
  demand until actual loader dismissal. Start continuous rendering, the trompo
  and the entrance only after reveal. See the [handoff check](qa/handoff/REVIEW.md).
- The creator authorized runtime fire behind the trompo and light smoke from the
  griddle/trompo, plus dimmer interior lamps to favor the fire's warm light. This
  extends the original visual brief without editing the frozen GLB. Keep the
  existing light/shadow budget and pause effects with scene activity and reduced
  motion. See the [cooking effects review](qa/cooking/REVIEW.md).
  Later direction adds low warm/cool fog wrapping the platform, lower exterior
  fill and a wet ground surface with rough warm/cool reflection pools, following
  `docs/design/fog-and-background.png`. Preserve the frozen stand and avoid a
  second scene render on every frame for reflections.
  The creator later requested native Three.js distance fog: `SceneRendering`
  attaches blue-hour `FogExp2` with color `#14243b` and density `0.035`, reduced
  roughly 46% from `0.065` after the creator requested a clearer foreground.
  The creator reverted the moonlight experiment: hemisphere fill is restored to
  `0.28`, warm `#ffe3bf` key to `1.35`, and cool rim to `0.9`.
  Cooking-mode pendants stay `3/2.6`,
  and fire intensity `5` (standard) or `6.5` (compact), reaching four units.
  The existing light and shadow count stays unchanged. Native fog uses a fixed
  blue-hour tint; it does not simulate volumetric light scattering.
  A later lamp-brightness adjustment doubles the standard-profile pendant lights
  and raises the bulbs' runtime emissive intensity from `0.65` to `2` on all
  profiles. The compact profile keeps its existing fire-only point-light budget.
  The thin cobalt/brass counter-tile overlays (`COUNTER_TILES_MERGED_MAT_13`
  and `_11`) neither cast nor receive shadows: their reversed normals otherwise
  let shadow normal bias offset samples into the cream backing. Their authored
  colors and direct lighting remain intact; no frozen GLB geometry is edited.
  This scoped shadow fix awaits creator visual inspection.
  Runtime stand material clones disable fog so the model, CRT and warm lamps
  stay crisp. The panorama's city band is dimmed and its contrast softened toward
  a dark blue haze; its sky and the frozen SVG source remain unchanged.
  A faint continuous amber contribution near the base is drawn in the existing
  wet-ground shader. No extra render pass or animation loop is added. Validation
  and visual inspection for this change are left to the creator at their request.
  The final clarification requests continuous haze rather than visible mist
  patches. Atmospheric billboards are removed, leaving only cooking smoke from
  the trompo and stove. Native distance fog covers the custom wet-ground shader
  across the floor area while the stand is exempt. It adds no geometry or render pass. Creator
  inspection and validation remain pending at their request.
  Following the fog relocation, pendant point-light intensities and bulb emission
  are reduced by 20%. Cooking-mode pendants now use `2.4/2.08`, standard pendants
  without cooking use `4.8/6.4/4`, and the compact fallback uses `10.4`.
  Bulb emissive intensity is `1.6`; visual approval remains with the creator.
- The creator also approved the Berlin night background from the same reference.
  The later request makes it follow camera rotation: use a surrounding panorama
  with the TV Tower, distant rooftops and a crescent near the horizon, sparse
  stars above and concrete below. Keep it outside raycasting, camera fitting and
  lighting calculations. Use the existing render loop and scene theme filter.
  See the [camera-aware background review](qa/environment/REVIEW.md).
- Keep content in typed `src/content/site.ts`, `portfolio.ts` and `media.ts` files.
  Model absent media explicitly instead of constructing URLs to nonexistent files.
- Use one shared action/state layer for HTML controls and 3D targets. Work navigation,
  theme selection and media viewers must remain usable independently of the Canvas.
  Hovering monitor, photo, amplifier, salsa or sketchbook meshes uses a pointer
  cursor through their named interaction ancestors. Decorative meshes retain grab;
  dragging retains grabbing. Hover feedback does not enable pending interactions.
- Load only the frozen selectively merged GLB in production. Preserve geometry,
  materials and transforms except the limited runtime adjustments allowed by the brief.
- Use focused unit/asset-contract tests and Playwright for browser behavior.

## Delivery sequence

### Phase 0 — Scaffold and reproducible asset checks

1. Create the app scaffold, strict TypeScript configuration and shared route shell.
2. Define scripts for development, formatting, typechecking, linting, tests and build;
   document them in a README. Use Git checkpoints for completed, verified phases.
3. Add a repeatable GLB validator and runtime name-contract assertion. Test required
   names, uniqueness, critical parent relationships and interaction metadata.
4. Record the frozen asset checksum. Keep the backup outside the production served
   directory, updating its development reference accordingly.

Exit gate: the app starts; format/typecheck/lint/build/tests pass; the production
asset contract passes; all planned routes and missing inputs are documented.

### Phase 1 — Useful HTML portfolio before WebGL

1. Build `/`, `/work`, `/work/[slug]`, `/about` and `/contact`, shared navigation,
   footer, metadata and a responsive case-study template.
2. Define project/media schemas with real optional fields, including role, context,
   process, outcomes, imagery and supplied external links.
3. With no supplied projects, show an honest work-index empty state. Exercise the
   detail template using test fixtures; do not publish invented case studies.
   Unknown slugs return a proper 404.
4. Implement accessible HTML controls and persistent theme tokens:
   red → Original, green → Noir, orange → Synthwave. Prevent a theme flash on reload.
   Synthwave replaces Vintage following the creator's mock: deep indigo surfaces,
   magenta horizon haze, cyan rim light and pink/cyan wet-ground pools, retaining
   warm lamps and fire. Runtime shaders reuse the existing panorama and ground;
   no model changes, new lights or render passes are added. Stored `vintage`
   selections resolve to `synthwave`, including before first paint.
   The creator's follow-up adds Synthwave-only runtime material colors: plum enamel,
   magenta awning and pink emissive trim/sign accents with a purple CRT bezel.
   Existing maps and geometry remain intact; food, photos, drawings, salsa colors,
   CRT content and warm bulbs retain their authored appearance. Theme switching
   updates the existing clones in place and restores baseline color, emission and
   roughness when leaving Synthwave. Clones survive theme changes; disposal occurs
   only when the scene lifecycle ends. This avoids
   GPU program and texture churn during repeated sauce selections.
   The later [animated salsa interaction](qa/SALSA_INTERACTION.md) replaces the
   sauce camera close-up with a direct 1.06?1.17 second squeeze, nozzle droplets
   and counter ripple. Existing HTML theme controls use the same request action;
   content routes and unavailable scenes still select immediately.
5. Reserve a full-viewport homepage scene area with compact identity and direct `View work`
   link. Add the lightweight loading animation/status and an intentional failure
   state. Include fallback artwork only if available; never request a missing image.

Exit gate: content navigation works with JavaScript disabled; mobile layout,
keyboard navigation, visible focus, contrast, titles and unknown-route behavior
are verified. Loading status honors reduced motion; missing optional artwork does
not block this phase.

### Phase 2 — Frozen 3D scene and progressive loading

1. Load the production GLB once behind a client error boundary and loading state.
   Retain useful HTML on WebGL failure, model failure or context loss. Replace the
   loading status with a clear fallback if the scene cannot initialize.
2. Build desktop/mobile cameras from model bounds, with +Z as the front. Match the
   approved nighttime view using a small lighting rig and budgeted shadows.
   Support creator-requested left-button drag exploration and scroll-wheel zoom,
   with arrow keys, plus/minus and a reset action. Bound camera distance and elevation
   above the floor; suppress object clicks after dragging.
   Reduced motion removes camera inertia while keeping direct exploration usable.
3. Verify sign, transmission material, embedded images and CRT readability. Apply
   narrowly scoped runtime material adjustments where needed; preserve the model.
4. Reveal the Canvas after a meaningful rendered frame and responsive controls.
   Remove the loader without an artificial delay. Capture the composition for
   visual review; a separate poster is optional fallback artwork.
5. Rotate only `TROMPO_ROTATING` around Y at roughly 13 seconds/revolution. Suspend
   animation when hidden/offscreen or a viewer is open; obey reduced motion.
6. Instrument model load, first 3D frame, scene readiness, renderer calls, triangles
   and textures. Record the first startup benchmark against the 2–3 second target
   before adding optional effects.

Exit gate: visual desktop/mobile review passes, all contract assertions pass,
fallback navigation survives blocked WebGL/GLB, and initial measurements are recorded.
Use the supplied mock for composition and interface review. Its illustrative model
does not replace the frozen GLB; exact Blender-material fidelity remains unverified.

### Phase 3 — Interactions in separate tested increments

1. **Themes:** wire bottle squeeze/restore to the shared theme action. Guard rapid
   taps, clean up timelines and verify persistence and contrast on every route.
   Bottle clicks/taps now resolve their named ancestor pivot through the shared
   theme map and call the same persistent action as the HTML controls. Red selects
   Original, green Noir, and orange Synthwave. Camera drags are excluded by the
   existing six-pixel gesture threshold. The creator's animated salsa direction
   replaces the sauce camera close-up: clicks immediately lean and squeeze the
   selected bottle, release four small droplets and commit the theme at counter
   impact. A thin ripple and faint wash motivate 450 ms material/light/UI easing.
   The full GSAP sequence lasts approximately 1.06?1.17 seconds, then restores exact
   authored transforms. The newest choice cancels older timelines; hidden scenes,
   photo mode and motion-preference changes finish pending selection and reset
   effects. Existing HTML controls share the request action, with immediate fallback
   on content routes or unavailable WebGL. Reduced motion skips the choreography.
   Body/nozzle names and hierarchy are asserted alongside the original pivots.
   See the [salsa review](qa/SALSA_INTERACTION.md) for controls, tuning, captures,
   resource ownership, tests and physical-device limits.
2. **CRT:** retain the aligned monitor approach and route to real static `/work`
   content. The creator's latest [tile transition](qa/MONITOR_TRANSITION.md)
   replaces Matrix rain and glyphs with cream/navy diamond ribbons, terracotta and
   magenta fragments, a rotating mosaic tunnel and a square pixel mask over HTML.
   `portfolioTiming` and `tileVisuals` in `portfolio-transition.ts` control the
   0.5-second activation/approach, 0.9-second flight, 0.4-second decomposition and
   0.7-second reconstruction. One procedural shader is shared by the existing CRT
   surface and an expanding quad anchored to its projected corners, in one renderer.
   Large diamonds remain intact through flight and subdivide progressively during
   decomposition. A sparser screen grid appears only at its end, then clears across
   measured intro, navigation and content bounds within 65% of reconstruction.
   Selective warm rims and ceramic bevel shading add depth without new passes.
   The static destination is prepared before animation; GSAP coordinates the pixel
   mask, typography and navigation. Reduced motion uses a short stationary dissolve.
   Repeated clicks coalesce. Back restores materials, camera, visibility and clear
   state. Debug replay is available through `/?debug=1`. Physical-device performance
   and creator approval of visual continuity remain manual acceptance gates.
   The monitor handoff skips Work's standalone entrance animation because the
   reconstruction already revealed that content. Initially visible projects stay
   visible; subsequent scroll reveals and ordinary app-bar entry retain their
   existing animations. See the Work entrance regression in the transition review.
3. **Shared media viewer and sketchbook:** implement a semantic dialog with Escape,
   focus containment/restoration, scroll locking and drawing selection. Use embedded
   previews when originals are absent; request supplied originals only on opening.
   Small extracted preview derivatives may support HTML controls before WebGL loads,
   without modifying the GLB or introducing full-resolution initial downloads.
   The creator's later notebook request adds an in-scene camera close-up of both
   drawings instead of introducing a dialog in this increment. Click either page
   or use the Drawings button; the camera approaches from above/front in 1.2 seconds.
   Portrait/landscape resizing preserves the close-up, reduced motion is immediate,
   and Reset view/Home returns to the stand. Embedded previews remain unchanged;
   original drawings and any future high-resolution viewer remain pending.
   See the [notebook camera review](qa/NOTEBOOK_CAMERA.md).
4. **Polaroids:** use in-scene close-ups with correct photo mapping and next/previous
   arrows. Add damped pivot sway with bounded delta/angle and a click/drag threshold;
   keep the rail fixed and preserve touch scrolling.
   Pointer-driven sway is now implemented separately in `usePhotoSway.ts` with
   spring integration in `src/lib/photo-sway.ts`. Pointer movement within 110 CSS
   pixels of a photo applies a bounded impulse; each authored pivot rotates around
   local Z, carrying its string, clip and print together. Sway caps at 8 degrees,
   uses bounded substeps and settles at the original rotation. The existing scene
   clock updates only three moving pivots, with no new draw calls or dependencies.
   Input is passive; hidden/offscreen/unrevealed scenes pause, reduced motion
   restores the rest pose, and cleanup restores transforms and removes listeners.
   Photo viewing now uses the existing interruptible focus tween, framing the
   selected surface using its world bounds and camera FOV.
   Photo approaches now return toward the front resting view, align outside the
   stand at the selected print's height, then move straight inward over 1.6 seconds.
   Photo framing uses the authored +Z front rather than the print edge's vertex normal.
   Reduced motion still applies the final pose immediately.
   The creator's later clarification removes the photo modal and original-image
   substitution. The embedded photo textures remain untouched. `PhotoControls.tsx`
   supplies previous/next arrows and Back to stand directly over the Canvas, with
   keyboard arrows, Escape, focus return and no focus trap or scroll lock. Adjacent
   photos slide across the front in 0.65 seconds instead of retreating to the hero;
   Back to stand reverses the safe front approach. Responsive reframing preserves
   the selected print. Stable close-ups pause scene motion and use demand rendering.
   `PhotoLighting.tsx` adds a warm, soft, non-shadow-casting spot with intensity 2.5,
   following the selected print. It stays at zero intensity outside photo mode to
   preserve the hero lighting and avoid rebuilding light shader variants on visits.
   No full-resolution photo request is made by 3D browsing. HTML links use the
   supplied originals when WebGL is unavailable. Named print meshes are included in
   the asset contract alongside the original pivots and hit targets. Sketchbook
   viewer integration and creator visual approval remain pending.
   See the [photo camera review](qa/PHOTO_CAMERA.md) for checks, captures and limits.
5. **Amp:** the creator's [guitar video brief](AMP_GUITAR_VIDEO_EXPERIENCE_CODEX_BRIEF.md)
   replaces the audio-only amp action with the supplied performance video. Amp/pedal
   clicks and the Guitar button synchronously attempt native video playback while
   one GSAP timeline composes the camera and reveals a DOM panel from the amp's
   projected location. Controls lock during the reversible transition; the scene
   stays mounted and uses demand rendering once open. Close/Escape restores the
   saved camera and controls, including interrupted approaches. Reduced motion
   retains the camera pose with a short fade. Main navigation remains accessible.
   The optimized `public/media/video/guitar.mp4` is 11.8 MB, H.264/AAC, fast-start,
   720x1280. Its 94 MB source is archived outside public and ignored by Git. The real
   poster and video source are assigned only on interaction. Native controls and
   Play/Retry fallback cover seek, volume, buffering, rejection and media errors.
   Video audio is authoritative; the separate `h6.mp3` player is removed. Explicit
   mute is respected, ambience/effects pause while video is active, global/native
   sound state stays synchronized, and close restores prior ambience where allowed.
   Hidden tabs pause without automatic audible resume; navigation/unmount stops and
   unloads playback. Existing salsa/camera effects still respect the sound toggle
   outside video mode. See the [guitar video review](qa/GUITAR_VIDEO.md) for assets,
   lifecycle, timing, captures, measurements and manual Safari/device limits.

Exit gate for each increment: both HTML and 3D controls work; keyboard/touch and
reduced motion work; cleanup is verified; unopened originals/audio cause no requests.
Original drawing fidelity remains pending supplied assets.

### Phase 4 — Measured performance and device polish

1. Cap DPR and budget shadows/transmission for mobile. Measure before adding effects.
2. Test portrait/landscape, slow network, reduced motion, hidden tabs, route changes,
   failed downloads and WebGL loss. Verify no layout shift or control obstruction.
3. Record cold/warm network requests, startup JS, load timings, draw calls and steady
   FPS on named hardware/browser/quality settings. Recheck the 2–3 second scene-ready
   target with all interactions enabled and documented network conditions. Compare
   the backup through a development-only harness; its missing pivots prevent
   interaction parity testing.
4. Run Lighthouse and record lab results. Treat LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.10
   as targets; do not claim field percentile compliance from local tests.
5. Configure versioned GLB MIME/cache headers for the selected host. Test Brotli only
   if useful and supported. Never load a `.br` URL as a GLB.

Exit gate: results and remaining device limitations are documented; no unnecessary
initial media requests; all content routes remain usable if the scene fails.
Real mobile FPS validation requires access to a representative physical device.

### Phase 5 — Real content and release readiness

1. Populate supplied projects, biography, contact links, drawings, photos and audio.
   Validate links, accessible descriptions, image sizing and recording credits.
2. Finish page metadata, social previews and deployment configuration. Prepare
   approved fallback artwork if included in the final presentation.
3. Run the full acceptance suite and manual keyboard, screen-reader and touch review.
4. Produce setup/deployment documentation and an explicit remaining-issues list.

Exit gate: real content is present; all required checks pass; production navigation,
media loading and fallbacks are verified. Prepare a concrete release for review;
deployment and domain setup depend on the chosen host and access.

## Verification at each implementation checkpoint

Run formatting checks, TypeScript checks, lint, relevant tests and a production build.
The script names are `format:check`, `typecheck`, `lint`, `test`, `test:e2e`,
`validate:asset` and `build`. Expand browser checks as features land.
Record commands, results, changed files, visual evidence, measurements and blockers.
Do not label unavailable device/content checks as passed.

### HTML foundation checkpoint

- The production build emits five static pages; no project detail page is emitted
  until real projects are provided. The detail template exists, but content-filled
  case-study visual review remains pending.
- Asset checksum/name/hierarchy validation and four unit tests pass. Astro checks
  report zero errors/warnings/hints; ESLint passes.
- Four Chromium browser tests pass: JavaScript-disabled navigation, true 404s,
  persisted themes without model requests on content routes and mobile page width.
- The homepage scene is still a loading placeholder at this checkpoint. First-scene
  timings, GPU performance and visual fidelity are not yet measured.

### First live scene checkpoint

- The frozen GLB renders in Chromium with responsive camera fitting, authored lights,
  readable CRT texture, independent trompo rotation and lifecycle/error handling.
- The loader hands off after a rendered frame. Missing WebGL, model failure and a
  startup timeout retain useful navigation. No JavaScript means no model download.
- Seven unit tests and nine browser tests pass. The actual CRT raycast opens `/work`;
  the GLB is requested once, and no originals/audio are requested on entry.
- Software-renderer observations: 2,681 ms desktop and 1,517 ms narrow-screen readiness.
  Glass simplification reduces narrow-screen draw calls from 358 to 185. These are
  local, unthrottled single runs with reduced motion, not mobile-device guarantees.
- Screenshots and remaining size/performance/fidelity concerns are recorded in
  [qa/BASELINE.md](qa/BASELINE.md). Phase 3 object interactions are next.

### Cinematic stand and camera checkpoint

- The creator's stand direction is implemented with a warm key/practical-light
  rig, cached grounding shadows, scoped material adjustments and a tighter
  responsive camera. Left-drag, wheel zoom, keyboard exploration and reset work.
- Matching-camera before/after screenshots and final desktop/mobile views were
  inspected. The frozen model checksum and interaction targets are preserved.
- Sixteen unit tests and thirteen browser tests pass. All quality-check scripts
  pass; hardware FPS and consistent 2–3 second startup remain unverified.
- Steady desktop draw calls fall from 358 to 185, while shadows add sampling and
  startup cost. Software-renderer FPS regresses in the recorded comparison. See
  the [cinematic review](qa/cinematic/REVIEW.md) for raw evidence and limitations.
  Phase 3 object interactions and real content remain outstanding.

## Inputs to gather alongside development

- Approved v3.12.9 visual reference or feedback on a generated camera proposal;
  a poster for fallback artwork is optional.
- Real project information and imagery; preferred biography and contact/social links.
- Original left/right drawings and `lucha`, `paris`, `canal` photographs, with descriptions.
- Accurate title and intended credits/permissions for the supplied `h6.mp3` recording.
- Typography/microcopy preferences and eventual hosting/domain/privacy choices.

These inputs do not block scaffolding, HTML templates or interaction infrastructure.
They do block claiming a complete, content-ready public portfolio. The recommended
first implementation scope is Phases 0–1, followed by a review of the HTML shell and
then Phase 2 visual integration.
