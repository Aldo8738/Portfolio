# In-scene photo browsing

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
