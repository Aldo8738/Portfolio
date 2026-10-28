# Animated salsa theme interaction

The creator's animated salsa task supersedes the earlier sauce camera close-up.
Bottle clicks now react immediately without moving the camera or adding controls.
The frozen GLB, other camera transitions, photos, CRT and audio controller are preserved.

## Choreography and controls

- Hover: 180 ms tilt, 2.5% scale and a soft private emissive highlight.
- Click: lean back for 150 ms, compress vertically by 7% and widen by 3.5%.
- At 260 ms: release one main droplet and three tiny droplets from the named nozzle.
  Their deterministic parabolic arcs land just in front of the bottle on the counter.
  The creator's follow-up increases the arc-height factor from 0.22 to 0.5 for a
  noticeably higher shot, retaining the same landing point and sequence timing.
- At 480 ms: flatten a soft splash, expand a thin colored ring and a faint wash.
  Commit the existing theme action here, including persistence and the supplied
  sound effect when sound is enabled. Materials, lights, CSS grayscale and UI colors
  ease toward their existing definitions over 450 ms. Boolean environment shader
  treatments update at impact, when the ripple is strongest.
- By 1,120 ms: hide all effects and restore exact authored bottle transforms.
  Per-theme speed/spring factors yield approximately 1.06–1.17 seconds total.

Click/tap bottles directly. The existing Choose salsa buttons support pointer,
touch, Enter and Space through the same request action. Without an available scene,
HTML theme selection remains immediate. Reduced motion skips the physical effects
and transitions. Sound off retains silence and does not request an effect file.

Newest selection cancels the previous timeline and restores all bottles before
starting. Hiding the scene, opening a photo or enabling reduced motion finishes
pending selection immediately, restores transforms and removes transient effects.
Page exit finishes pending selection and clears transient effects. Unmount also
kills the timelines and disposes owned geometry/materials only.

## Implementation

- `src/lib/salsa-animation.ts`: GSAP choreography, shared procedural geometry,
  original transforms, cancellation and resource ownership. Adjust `salsaTiming`
  and `salsaEffect` here for timings, compression, particle counts and effect sizes.
  Droplet/ripple colors come from the existing authored bottle materials.
- `src/lib/theme.ts`: existing themes plus subtle speed/spring personality and a
  cancelable request action with immediate HTML fallback.
- `src/components/experience/useSalsaInteraction.ts`: scene lifecycle and requests.
- `ExperienceCanvas.tsx`: direct bottle selection/hover, removing only salsa focus UI.
- `useModelMaterials.ts`, `SceneLighting.tsx`, `Experience.module.css`,
  `src/styles/globals.css` and `tokens.css`: interpolation of existing theme values.
- `src/components/ui/ThemePicker.astro`: route keyboard/touch choices through requests.
- `src/lib/glb-contract.ts`: assert named bottle bodies/nozzles and their parents.
- `tests/salsa-animation.test.ts`, `tests/e2e/scene.spec.ts` and
  `tests/e2e/audio-effects.spec.ts`: restoration, cancellation, impact selection,
  reduced motion, direct clicks, keyboard actions, persistence and mute checks.

There are two shared geometries and three shared effect materials. Only three
bottle body materials are cloned for highlights. The seven effect meshes are hidden
at idle; no extra light, renderer, render pass or permanent animation loop is added.
Full-resolution media and guitar audio loading paths are untouched. No dependency
or production asset changes are required.

## Validation

Validated on Windows with portable Node 24.22.1, npm 11.19.1 and Chromium using
Playwright's SwiftShader software renderer:

- `format:check`, `typecheck`, `lint`, `validate:asset`, `test` and `build` pass.
  The unit suite contains 54 passing tests. The production build emits ten static
  pages and retains the warning about chunks larger than 500 kB.
- Thirty distinct targeted browser checks passed across the broad regression run
  and focused reruns. The broad run initially passed 27/29. Both failing tests were
  corrected: the animation test now waits for React to apply motion preferences
  and records intermediate mutations even when batched; the audio test no longer
  tests the removed sauce camera reset. The six affected checks subsequently passed
  on the final build, including direct clicks, normal-motion sequencing, rapid
  keyboard choices, mobile touch, mute and CRT audio. No application camera changes
  were made to satisfy tests.
- The final normal-motion test uses Playwright's clock for deterministic droplet
  and ripple captures. The audio test exercises normal real-time playback.
- Frozen asset bytes, all original interaction nodes and the additional bottle
  body/nozzle hierarchy assertions pass. Initial-load checks retain a single GLB
  request, no eager originals/audio, and useful HTML when WebGL fails.

Inspected [droplets](salsa/salsa-droplets.png), [ripple](salsa/salsa-ripple.png),
[counter detail](salsa/salsa-ripple-detail.png) and
[settled theme](salsa/salsa-settled.png). The effect is deliberately small at the
default hero distance; the counter detail shows the thin orange ring and soft
splash without obscuring the scene. Screenshots verify presentation, not FPS.

Physical mobile GPU/FPS and creator visual approval remain outside these local
software-renderer checks. No hardware performance claim is made.
