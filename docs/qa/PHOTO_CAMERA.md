# In-scene photo browsing

## Gallery navigation polish — 2 November 2026

The [creator's brief](../GALLERY_NAVIGATION_POLISH_CODEX_BRIEF.md) replaces the generic
controls with 112 × 44px outlined PREV/NEXT capsules and a 208 × 44px paper exit
label. The paper uses a subtly irregular CSS shape and low-opacity gradients;
there are no new images, geometry, dependencies or rendering loops. The gallery
counter uses the current content index and `photos.length` (three supplied photos,
not the mock's illustrative four). Existing status announcements remain in place.

`photo-controls-layout.ts` projects the selected full frame and its neighbors into
the final photo camera. Side placement requires room for each capsule and 8px gaps;
otherwise controls use a compact footer row. This calculation runs only when the
selection or viewport changes. During camera motion the footer row remains usable
for rapid retargeting. Photo framing reserves header/footer space, including in
short landscape views. It keeps the existing front approach, 0.65-second slides,
Back/Escape return, keyboard controls, focus restoration and embedded textures.
The hero camera remains as adjusted in the [entrance review](entrance/REVIEW.md).

Original uses warm ivory and cream, Noir uses neutral ink/paper colors, and
Synthwave uses a darker violet backing with stronger borders. Only the counter
slash uses the current accent token. Hover shifts the arrow 3px or paper 2px;
reduced motion disables these transitions. Focus outlines remain outside the
paper's clipped pseudo-element so they stay visible.

The fixed GLB has tighter gaps than the mock. Capsules sit beside the active
frame only when both gaps fit; tighter desktop views use the same compact row as
portrait screens. Short landscape uses one line for PREV, exit and NEXT, with the
counter above, to keep more vertical space for the photograph.

Reviewed Chromium/SwiftShader captures, with reduced motion:

- [Side capsules at 2560 × 1920](gallery-navigation/original-2560.png).
- [Compact desktop at 1440 × 1080](gallery-navigation/original-1440.png).
- [Original portrait at 390 × 844](gallery-navigation/original-390.png).
- [Original landscape at 844 × 390](gallery-navigation/original-844.png).
- [Lucha landscape clearance](gallery-navigation/lucha-landscape.png).
- [Noir portrait](gallery-navigation/noir-390.png) and
  [Synthwave portrait](gallery-navigation/synthwave-390.png).

Validation: `format:check`, `typecheck`, `lint`, `validate:asset`, `test` and the
production build pass. All 67 unit tests pass. Nine gallery browser tests pass;
the three responsive/theme checks were rerun after the final capsule sizing and
also pass. They cover both side and row layouts, four viewport sizes per theme,
counter updates/wrapping, keyboard focus, Arrow keys, Escape/focus return, no
original-image downloads, rapid retargeting, direct neighbor clicks, responsive
refitting and the WebGL-failure photo links. The production build emits ten
static pages and retains its existing large-chunk warning.

Implementation files: `PhotoControls.tsx` and `PhotoControls.module.css` own the
HTML/CSS; `photo-controls-layout.ts` handles projected spacing; `photo-camera.ts`
and `CameraControls.tsx` reserve responsive control space. `Experience.tsx`,
`ExperienceCanvas.tsx` and `scene-types.ts` pass the layout snapshot. Unit and
browser coverage lives in `photo-controls-layout.test.ts`, `photo-camera.test.ts`
and `e2e/photos.spec.ts`. This review, the saved brief and development plan document
the decision. No dependency or frozen-model file changed.

Physical-device FPS, safe-area behavior on actual phones and screen-reader review
remain unmeasured. No comparative GPU benchmark was run; the implementation adds
no rendering loop, postprocessing pass, WebGL geometry or media download. The
separate development-only loading warning noted in the entrance review remains
outside this change.

The creator's latest direction replaces the photo dialog with camera close-ups.
`PhotoControls.tsx` supplies left/right arrows and Back to stand. Keyboard arrows
work within the controls; Escape closes photo mode and restores the opener's
focus. There is no modal, focus trap, scroll lock, image overlay or runtime
replacement of the embedded photograph textures. No original photo request is
made during 3D photo browsing. Without a working scene, the existing HTML photo
links open their original image files normally.

Visible Polaroids also remain raycast targets during photo mode: clicking another
photo slides directly to it, while clicking the current photo leaves it focused.
Other stand interactions remain disabled until photo mode closes. Salsa splats
are triggered by theme selection only. The [animated salsa interaction](SALSA_INTERACTION.md)
now selects at counter impact and does not move the camera.

The first approach still aligns outside the stand before moving inward. Subsequent
photos use a 0.65-second straight slide; returning reverses the safe approach.
Framing reserves room for controls and survives viewport resizing. Stable close-ups
pause scene motion and use demand rendering; reduced motion applies poses instantly.

## Interrupted-slide fix — 29 October 2026

Canvas presses during a slide previously re-enabled OrbitControls, whose start
handler canceled the camera tween and cleared photo mode. Separately, an unfinished
first approach had no recorded focused photo, so retargeting could select another
full stand-to-photo approach instead of a direct slide.

`CameraControls.tsx` now disables free orbit whenever the existing `photoId` is set;
the scene clock and photo raycasts remain active during camera movement. It records
the selected photo when focus is requested, including pending approaches and slides.
Only the first entry uses the full approach; retargeting interpolates from the
current camera pose. Back to stand and Escape retain their explicit return path.

The browser regression holds the clock mid-slide, presses the canvas and checks
that photo mode persists. Before the fix, that assertion failed because the photo
ID disappeared. It also retargets during both a slide and the first approach,
advances 800 ms and verifies the new photo has settled on the 650 ms slide path.
The regression first failed on the original code when a canvas press removed the
photo ID; it passes with this fix. All six photo browser tests pass. Two notebook
checks and the scene orientation/reset check also pass. The deterministic regression
was rerun with clock fast-forwarding to avoid rendering unnecessary intermediate
software-GPU frames. Formatting, lint, typecheck, production build and all 65 unit
tests pass. The existing large-chunk warning remains; physical-device review was
not performed.

`PhotoLighting.tsx` adds one soft, warm spot with intensity 2.5, no shadow map,
and a target derived from the selected `PHOTOS_PRINT_*` mesh. It remains present
at intensity zero outside photo mode to preserve the hero's appearance and avoid
light-count shader changes on each visit. The three named print meshes and their
pivot parents are now included in the GLB contract. The frozen GLB bytes, geometry,
UVs, materials and embedded photo textures are unchanged.

Original photo checkpoint (historical), validated in Windows Chromium/SwiftShader:

- Lint and Astro typechecking pass, with no errors, warnings or hints.
- Production build passes with nine static pages and the existing chunk-size warning.
- 47 unit tests and 11 targeted browser tests pass.
- Browser checks cover both 640px and 390px photo browsing, camera slides, wrapping,
  resize, rapid changes, keyboard controls, focus restoration, no original image
  requests, no dialog, WebGL failure, audio effects and CRT navigation/replay/Back.
- Frozen-model checksum and asset name/parent validation pass.
- Formatting passes for changed files. The repository-wide check flagged the
  unrelated `docs/CV_CODEX_IMPLEMENTATION_BRIEF.md`, which was left untouched.

Reviewed captures: [Lucha at 640px](photos/lucha-640.png),
[Canal at 640px](photos/canal-640.png), and [Paris at 390px](photos/paris-390.png).
Physical-device brightness, GPU performance and assistive-technology behavior
remain unmeasured; software-renderer functional checks do not establish them.
