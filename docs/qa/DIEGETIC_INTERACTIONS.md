# Diegetic interactions

The approved [brief](../taqueria-diegetic-interactions-codex-plan.md) supersedes permanent floating annotations. The previous annotation review and screenshots are historical.

## Target audit

| Action   | Target                                             | Existing action                        |
| -------- | -------------------------------------------------- | -------------------------------------- |
| Work     | HIT_WORK_CRT_SCREEN / CRT_INTERACTION              | enterPortfolio monitor transition      |
| Photos   | HIT_PHOTOS_POLAROID_0..2 / hanging pivots          | onPhotoRequest; original photo chooser |
| Drawings | HIT_DRAWINGS_SKETCHBOOK_0 / SKETCHBOOK_INTERACTION | cameraActions.focusDrawings            |
| Guitar   | HIT_MUSIC_AMP / AMP_INTERACTION                    | onGuitarOpen; existing guitar video    |

SceneAnnotationTracking reuses world projections for contextual micro-labels, suppresses Work text outside the monitor, and uses owned material clones for restrained local brightness. Existing pointer-driven photo sway remains. The baked CRT artwork has no independent arrow, so screen brightness supplies its response. Book pages have no corner rig; surface highlighting avoids remodeling. Amp feedback uses its existing face rather than moving the amplifier. No audio is triggered by hover.

Explore remains available at every width, preserving semantic controls and keyboard/touch access. Permanent leader lines and dots are removed. Labels appear only for hover/focus. Dragging suppresses feedback. Theme changes, navigation and unmount restore materials and dispose clones. The existing frozen GLB, camera fitting, lighting, themes, routes, lazy media and utility controls are preserved.

## Validation

Validation results are reported with the implementation. Physical-device performance, Safari and screen-reader checks remain manual. Pointer feedback follows the nearest existing R3F surface hit, including side and rear faces. Keyboard discovery remains available through Explore.

## Validation before the angle correction

- Production build emits ten static pages; Astro checks 152 files with zero diagnostics. Existing large-chunk warning remains.
- 77 unit tests pass. Asset checksum/name validation passes; frozen GLB remains unchanged.
- Ten focused browser scenarios pass across the main run and corrected reruns: resting/hover/drag cleanup, entrance visibility, monitor navigation and Back, mobile/tablet actions at three sizes, drawings at two sizes, amp sound/lazy-loading/exact camera restoration, and blocked/recoverable guitar playback.
- The amp comparison now closes its action menu before comparing scene pixels. Entrance readiness is observed during the real animation to avoid a paused-frame scheduling assumption. The full historical browser suite was not rerun for this increment.
- Inspected [resting desktop](diegetic-desktop.png) and [drawing hover](diegetic-hover.png). Compare the [previous floating UI](annotations/after-desktop.png).
- No new dependencies, geometry, lights, media downloads or render passes. Mobile hardware FPS, cold-load performance comparisons, Safari and screen-reader testing remain unverified.

The CRT has no independently rigged arrow, paper has no corner rig, and the amp response uses its face rather than a separately animated LED. Material feedback is static, including reduced motion; existing photo sway supplies physical motion. These limits avoid replacing textures or remodeling frozen geometry.

## Angle correction after creator review

Removed the front-angle visibility restriction. Hover feedback now uses the actual intersected mesh and its local hit point, rather than a fixed front-face anchor. Side and rear surfaces respond whenever the existing scene raycaster hits them. Camera changes recheck an active pointer hit so a cue cannot stay attached to an occluded surface. Monitor-body clicks use the same existing Work transition as its screen.

Fixed drag suppression remaining active after release: the release click stays suppressed, then hover resumes on the next free pointer move. Dark surfaces receive a restrained theme-colored emissive contribution on the temporary material clone. No geometry, lights, camera framing, or dependencies changed.

Browser pointer inspection at four quarter-turns found Photos at all four views, Work at three views, and Guitar at two views; other objects were not necessarily visible at every view. A finer default-view scan found Drawings at (608, 450). A real mouse drag followed by a free pointer move recovered Photos hover. Captures and the coarse sweep observations are in [diegetic-angles](diegetic-angles/). This is sampling, not proof of every possible angle.

Tests were neither edited nor run for this correction, per creator request. Existing test changes in the workspace predate that instruction. Feature approval, physical-device and screen-reader checks remain pending.

## Whole-object feedback correction

Surface hits now resolve to the existing semantic interaction parent through `getInteractiveObject`. Highlighting traverses that group once on selection, covering every child mesh and material slot. Moving between child meshes keeps the same highlight. Clearing feedback restores the exact material references and disposes only owned clones. The amp/pedal use `AMP_INTERACTION`, the complete book uses `SKETCHBOOK_INTERACTION`, the monitor uses `CRT_INTERACTION`, and each photo uses its own swing pivot. Surface-hit positioning and existing click actions remain unchanged. No tests were edited or run for this correction.

## Amplifier material and label refinement

Amplifier hover no longer changes the cabinet, grille, handle, logo or controls. Only the existing pink pedal material receives a restrained pink emissive contribution; its base color and texture remain intact. The frozen model has no separate pedal LED mesh, so this is a pedal cue rather than a fabricated LED or added light.

Guitar text now sits 24 CSS pixels beyond the projected amp-body bounds, on the outer side of the composition. Its position follows the complete body rather than the pointer hit, keeping it steady while moving across amp parts and clear of the inner stools. The reveal fades over 320 ms with a four-pixel rise; reduced motion removes both transitions. The Explore layout is unchanged. Tests remain untouched and unrun pending creator approval.
