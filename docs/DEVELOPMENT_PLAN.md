# Taquería Aldo development plan

Planning baseline: 21 October 2026. The authoritative specification remains
[`TAQUERIA_ALDO_CODEX_HANDOFF.md`](../TAQUERIA_ALDO_CODEX_HANDOFF.md); this document
turns it into delivery checkpoints. Follow [coding conventions](CODING_CONVENTIONS.md)
when implementing each phase.
Astro + React + R3F is approved. The static HTML foundation, verification tooling
and first live model are implemented. See the [scene baseline](qa/BASELINE.md) for
actual browser observations and remaining verification limits.

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

## Accepted loading and performance decisions

These user clarifications supersede the handoff's poster-first loading requirement:

- Use the creator's supplied rotating ASCII taco as the loading presentation,
  replacing the original CSS bars. Inline its Canvas 2D renderer before React;
  remove it after the first usable scene frame or failure. It adds no dependency
  or separate renderer request. The creator's latest direction makes this a
  full-screen black loading dialog covering the entire homepage. Put it first in
  the body with a smaller centered taco and an indeterminate loading bar. Release
  it on readiness/failure after a two-second minimum from the first taco draw;
  keyboard skip and Escape can dismiss it immediately. A poster remains optional.
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
- Keep content in typed `src/content/site.ts`, `portfolio.ts` and `media.ts` files.
  Model absent media explicitly instead of constructing URLs to nonexistent files.
- Use one shared action/state layer for HTML controls and 3D targets. Work navigation,
  theme selection and media viewers must remain usable independently of the Canvas.
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
   red → Original, green → Noir, orange → Vintage. Prevent a theme flash on reload.
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
2. **CRT:** improve `Work ↗` legibility, add a short camera approach and route to
   `/work`. Include an independent navigation deadline so animation cannot stall it;
   reduced motion navigates immediately. Verify Back navigation.
3. **Shared media viewer and sketchbook:** implement a semantic dialog with Escape,
   focus containment/restoration, scroll locking and drawing selection. Use embedded
   previews when originals are absent; request supplied originals only on opening.
   Small extracted preview derivatives may support HTML controls before WebGL loads,
   without modifying the GLB or introducing full-resolution initial downloads.
4. **Polaroids:** reuse the viewer with correct photo mapping and next/previous
   controls. Add damped pivot sway with bounded delta/angle and a click/drag threshold;
   keep the rail fixed and preserve touch scrolling.
5. **Amp:** add an explicit unavailable state now; implement gesture-gated audio
   loading and play/pause for a future configured recording. Handle failed playback,
   cleanup and visible state. Test the controller with a test-only audio fixture.

Exit gate for each increment: both HTML and 3D controls work; keyboard/touch and
reduced motion work; cleanup is verified; unopened originals/audio cause no requests.
Actual recording playback and original-image fidelity remain pending supplied assets.

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
- Guitar recording, accurate title and intended credits/permissions.
- Typography/microcopy preferences and eventual hosting/domain/privacy choices.

These inputs do not block scaffolding, HTML templates or interaction infrastructure.
They do block claiming a complete, content-ready public portfolio. The recommended
first implementation scope is Phases 0–1, followed by a review of the HTML shell and
then Phase 2 visual integration.
