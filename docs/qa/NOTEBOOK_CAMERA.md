# Notebook camera close-up

Clicking either notebook page, artwork or spine now frames both open drawings.
The existing camera tools include a Drawings button for keyboard and touch access.
Reset view or Home returns to the stand. Reduced motion applies the pose immediately.

`src/lib/notebook-camera.ts` computes a responsive view from the named notebook's
bounds, at 55 degrees above the counter. It fits both pages with padding in portrait
and landscape. `CameraControls.tsx` reuses the existing GSAP transition and safe
front approach, taking 1.2 seconds. Only notebook viewing relaxes the orbit's upper
view angle; return restores normal hero limits. Resizing a settled view refits the
notebook rather than returning to the stand. Camera gestures interrupt transitions
through the existing controls. Photo and CRT camera paths are preserved.

The interaction uses `SKETCHBOOK_INTERACTION` and its authored children. The group
and both page parents are asserted in the GLB contract. No geometry, materials,
textures, rendering passes or dependencies are added. Drawings remain the embedded
previews; original artwork is still pending. No full-resolution drawing or audio is
fetched unless an existing, sound-enabled interaction requests audio.

Changed implementation: `ExperienceCanvas.tsx` routes notebook hits to the shared
camera action; `Experience.tsx` exposes that action as a button; `scene-types.ts`
types it; `Experience.module.css` keeps camera tools within narrow screens.

Validation on Windows Chromium with SwiftShader:

- Formatting, lint, typechecking, asset validation, build and all 57 unit tests pass.
  The build retains the existing warning about chunks larger than 500 kB.
- Seven targeted browser checks pass: desktop/mobile notebook activation, resize,
  keyboard entry and reset, photo selection/return/focus, and orbit/zoom/reset.
  Both notebook cases were rerun with touch enabled; the mobile case uses a real
  touchscreen tap. They also exercise the normal-motion approach after checking
  the immediate reduced-motion pose. No eager originals or audio requests occur.
- Inspected [desktop](notebook/desktop.png) and [mobile](notebook/mobile.png)
  captures: both drawings are visible, with no roof or counter obstruction.

Original-resolution drawing fidelity remains limited to the embedded assets.
Physical mobile GPU/FPS and screen-reader review were not performed.
