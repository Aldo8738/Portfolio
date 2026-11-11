# Contextual floating labels

The stand remains the primary visual. Four quiet HTML annotations replace the
detached object controls and bottom Work link. The frozen GLB, materials, lights,
environment, camera fitting, entrance and transitions are unchanged.

## Implementation

- [`scene-annotations.ts`](../../../src/lib/scene-annotations.ts) defines the four
  target names, short screen-space connector offsets, hit-area bounds and
  collision/safe-viewport rules. Invisible children are created in
  [`scene-annotation-anchors.ts`](../../../src/lib/scene-annotation-anchors.ts),
  keeping Three.js inside the existing lazy Canvas boundary. Missing targets throw an
  explicit error; the existing full GLB contract and checksum remain authoritative.
- [`SceneAnnotationTracking.tsx`](../../../src/components/experience/SceneAnnotationTracking.tsx)
  projects those children using the active camera on the existing R3F clock. It
  updates CSS transforms and visibility directly, without per-frame React state.
  It runs after camera controls so a completed tween and its labels share the
  same frame. The first valid projection appears only after the loader and
  entrance settle.
- [`SceneAnnotations.tsx`](../../../src/components/experience/SceneAnnotations.tsx)
  and its CSS module provide one set of semantic controls, dots, fine connectors,
  focus outlines, restrained hover feedback and reduced-motion overrides. Work
  remains a real `/work` link; ordinary activation invokes `enterPortfolio`, the
  same transition as the CRT. Modified link clicks retain native browser behavior.
- `Experience.tsx`, `ExperienceCanvas.tsx` and `scene-types.ts` connect the shared
  photo picker, notebook camera and guitar video actions. Photo selection still
  offers Lucha, Paris and Canal. Existing mesh clicks remain available.
- `annotation-focus.ts` and the guitar close handler queue focus until projected
  controls become visible after a return. Direct mesh interaction on a compact
  screen returns focus to Explore; an open compact menu preserves its opener.
- `CameraControls.tsx` reports user camera movement and resets without changing
  bounds or poses. `Experience.module.css` quiets Reset at rest and fades the
  onboarding hint after interaction. `index.astro` removes the duplicate bottom
  Work CTA; salsa, sound and header navigation retain their positions and behavior.
- `globals.css` suppresses annotations during the existing portfolio flight.

## Anchor map

| Label    | Contracted mesh             | Placement                                                              |
| -------- | --------------------------- | ---------------------------------------------------------------------- |
| Work     | `HIT_WORK_CRT_SCREEN`       | Screen bounds' outer-right edge, with a small bezel clearance          |
| Photos   | `HIT_PHOTOS_POLAROID_2`     | Center of the outer-right photograph; follows its existing parent sway |
| Drawings | `HIT_DRAWINGS_SKETCHBOOK_0` | Center of the left sketchbook page on the counter                      |
| Guitar   | `HIT_MUSIC_AMP`             | Center of the amplifier face at the platform's lower-left              |

Each runtime child is named `ANNOTATION_WORK`, `ANNOTATION_PHOTOS`,
`ANNOTATION_DRAWINGS` or `ANNOTATION_GUITAR`. Centers are converted into the actual
target's local space. The model has an amplifier rather than a separate guitar;
no replacement geometry or guessed page coordinates are introduced. All original
named targets and pivots are preserved.

## Responsive visibility and accessibility

Above 1024px, the default view offers all four labels when they fit. Safe bounds
reserve 116px above and 156px below, with 20px side clearance. Collision checks
prioritize Work, Photos, Drawings and Guitar in that order. Hidden actions remain
available through Explore. At 1024px and below, Explore opens the same controls
as a compact list with 44px or larger targets. Passive overlay space never captures
canvas gestures. Native buttons, links and the photo disclosure support keyboard
activation; Escape closes disclosures and the compact list.

Visibility uses clip-space bounds and a conservative camera-to-anchor front cone.
It intentionally hides labels on rear/oblique views instead of casting rays through
every mesh. **Limit:** this is not exact opaque-mesh occlusion; a foreground object
can cover an anchor at some front-facing angles. Add targeted occlusion only if
those angles become a practical problem. No occlusion-ray budget, new render pass,
animation package or dependency is introduced.

Labels hide during loading, entrance/reset animation, photo/notebook close-ups,
guitar playback, portfolio transitions and scene failure. Hidden controls are
removed from keyboard interaction. Reduced motion removes decorative transitions
and arrow movement while preserving direct camera projection and all actions.

## Visual evidence

Same default hero camera and reduced-motion setting, Chromium on Windows:

| View                | Before                       | After                      |
| ------------------- | ---------------------------- | -------------------------- |
| Desktop, 1440 × 900 | [Before](before-desktop.png) | [After](after-desktop.png) |
| Mobile, 390 × 844   | [Before](before-mobile.png)  | [After](after-mobile.png)  |

Additional evidence: [1280 × 720](after-laptop.png). The diagnostic overlay is
enabled in these captures and is absent on ordinary visits.
The [mobile Explore list](mobile-explore.png), [Noir](noir-laptop.png) and
[Synthwave](synthwave-laptop.png) were also inspected.

## Verification

- Final `npm run format:check`, `npm run typecheck`, `npm run lint` and
  `npm run validate:asset` pass. The frozen asset retains its verified checksum,
  2,609,612-byte size, 218 nodes, 175 meshes, 61 materials and 13 embedded images.
- `npm run build`: passes, emits ten static pages, and includes an Astro check of
  152 files with zero errors, warnings or hints. Vite retains its existing warning
  about chunks larger than 500 kB.
- `npm run test -- --reporter=dot`: 77 unit tests pass across 19 files, including
  anchor parenting/motion, missing targets, safe bounds and collision priority.
- The broad browser run covers 55 scenarios across annotations, drawings, photos,
  guitar, sound effects, navigation, camera/environment, film and monitor entry.
  It recorded 49 passes and six failures. The subsequent focused run passes all
  11 checks, including all six failures and all compact viewports. This verifies
  55 distinct scenarios across the two runs; the full 55-test batch was not repeated
  after the final spacing and frame-order changes.
- The failures exposed one projection ordering bug, an ambiguous loader/scene
  canvas selector, screenshot expectations that included the intentionally faded
  hint, and two motion timing assumptions under software WebGL. Projection now runs
  after camera controls. Exact scene restoration screenshots mask the
  onboarding/reset utility; the hint's interaction state has a separate assertion. The
  interruption test holds the entrance clock, and the guitar repeat test allows
  15 seconds for camera settling under software rendering. Runtime animation
  durations remain unchanged.
- Browser coverage includes 1440 × 900 and 1280 × 720 desktop views; compact
  390 × 844, 844 × 390 and 768 × 1024 views; 44px targets; Enter, Space, Escape and
  focus restoration; orbit, zoom, resize and reset; rear-view suppression and
  discovery; full/reduced motion; loading and WebGL failure; lazy media; sound;
  ordinary fallback links; and browser Back.
  Modified-key navigation retains native link behavior by implementation; a real
  new-tab interaction was not separately automated.
- [Before metrics](before.json) and [after metrics](after.json) record Chromium on
  Windows using ANGLE/SwiftShader, low quality, DPR 1 and reduced motion. Both
  desktop and mobile retain 341 draw calls, 136,206 triangles and 17 textures.
  Every recorded target has exactly zero normalized projection drift at the same
  viewport. All three after captures record no page errors. Concurrent machine
  load affected startup timing, so these captures are not an FPS or startup
  performance comparison.

Physical-device, Safari and screen-reader validation remain manual. Exact mesh
occlusion and representative hardware FPS remain unverified. No original drawing
assets were supplied or changed, and the existing `src/lib/theme.ts` working-tree
edit was preserved.
