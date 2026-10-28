# In-scene photo browsing

The creator's latest direction replaces the photo dialog with camera close-ups.
`PhotoControls.tsx` supplies left/right arrows and Back to stand. Keyboard arrows
work within the controls; Escape closes photo mode and restores the opener's
focus. There is no modal, focus trap, scroll lock, image overlay or runtime
replacement of the embedded photograph textures. No original photo request is
made during 3D photo browsing. Without a working scene, the existing HTML photo
links open their original image files normally.

The first approach still aligns outside the stand before moving inward. Subsequent
photos use a 0.65-second straight slide; returning reverses the safe approach.
Framing reserves room for controls and survives viewport resizing. Stable close-ups
pause scene motion and use demand rendering; reduced motion applies poses instantly.

`PhotoLighting.tsx` adds one soft, warm spot with intensity 2.5, no shadow map,
and a target derived from the selected `PHOTOS_PRINT_*` mesh. It remains present
at intensity zero outside photo mode to preserve the hero's appearance and avoid
light-count shader changes on each visit. The three named print meshes and their
pivot parents are now included in the GLB contract. The frozen GLB bytes, geometry,
UVs, materials and embedded photo textures are unchanged.

Validated on the production build in Windows Chromium/SwiftShader:

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
