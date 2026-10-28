# Amp guitar video experience

Implements the [creator's brief](../AMP_GUITAR_VIDEO_EXPERIENCE_CODEX_BRIEF.md).
The amp and pedal now open the actual guitar performance rather than the separate
`h6.mp3` recording. A keyboard/touch Guitar button offers the same action, including
a fallback when the 3D scene fails. Main navigation and View work remain available.

## Media preparation

- Playback: `public/media/video/guitar.mp4`, 11,829,782 bytes, 720×1280 at 30 fps,
  H.264/AAC, about 71 seconds, MP4 metadata before media data for progressive playback.
- Poster: `public/media/video/guitar-poster.jpg`, 38,382 bytes, extracted at two
  seconds from the supplied footage. Neither the face nor guitar/hands are cropped.
- Original: `assets/reference/media/guitar-original.mp4`, 93,609,475 bytes,
  1080×1920 H.264/AAC. It is preserved locally, ignored by Git and outside the public
  build. The supplied public filename now holds the optimized rendition.
- The media entry is `guitarVideo` in `src/content/media.ts`. No captions were
  supplied; none are fabricated. Existing legacy audio is retained as an asset but
  has no player or runtime amp playback path.

A portable FFmpeg binary was downloaded to ignored `.tools/` for this preparation,
without adding a package dependency. Reproduce the encoding with:

```powershell
.\.tools\ffmpeg.exe -i assets/reference/media/guitar-original.mp4 -vf scale=720:1280 -r 30 -c:v libx264 -preset fast -crf 26 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart public/media/video/guitar.mp4
```

## Choreography and ownership

`GuitarVideoExperience.tsx` owns one reversible GSAP timeline and the lifecycle:
idle, opening, open, closing. `CameraControls.tsx` appends its camera movement and
short owned-material amp highlight to that same timeline. The panel scales/fades
from the projected amp location while the camera approaches over 0.85 seconds.
The panel reveal lasts 0.75 seconds; reverse playback closes in about 0.65 seconds.
Reduced motion retains the camera pose and uses a short fade. Camera position,
quaternion, orbit target/limits, damping and enabled state are saved and restored,
including close during approach. Original materials return and the highlight clone
is disposed. No video texture, extra light, renderer or postprocessing is added.

`guitar-camera.ts` fits a front composition with the stand offset beside the panel
on desktop. Motion reuses the existing spherical camera sampler so an orbited view
does not take a straight shortcut through the stand. Portrait layouts center the full 9:16 footage above the stand; short
screens can scroll the panel while Close stays pinned. The panel stays beneath the
site navigation. Resize adapts CSS without updating DOM layout every frame; closing
restores the saved world-space pose, and Reset view can refit it to a new aspect.

Scene clicks and orbit are locked during the experience. Once open, the existing
Canvas switches to demand rendering and secondary scene motion pauses. The GLB
stays mounted. Closing resumes the previous scene and controls without a reload.

## Playback, accessibility and sound

The real video element is mounted without a source, poster or eager preload. Source
and poster are assigned only on interaction, and `play()` is called in the trusted
amp/button click before animation. Loading, rejected playback and decode/network
errors show text and a working Play/Retry action. Native controls provide pause,
seek, time, volume and fullscreen; `playsInline` avoids forcing mobile fullscreen.
Each opening starts at zero. Close pauses immediately and unloads after the exit.

`AmpAudio.tsx` keeps the existing global sound button and ambient/effect players.
It pauses them during video mode and removes the former separate amp audio player.
Default-off permits an intentional audible amp click; an explicit mute in the
session opens video muted with Unmute available. Native mute/volume changes and the
global sound toggle stay synchronized. Exit restores prior ambience unless the user
has muted or the page is hidden. Tab hiding pauses video without auto-resuming its
audio. Navigation, history, context failure and unmount stop/unload the performance.

Focus moves to the native video controls and returns to the Guitar trigger after
Close/Escape. This is an in-scene region, not a modal focus trap, so navigation stays
reachable. Loading/errors use a restrained status message rather than time updates.

## Validation

Changed files for this increment:

- Player and styling: `src/components/experience/GuitarVideoExperience.tsx` and
  `GuitarVideoExperience.module.css`.
- Scene wiring and responsive controls: `Experience.tsx`, `ExperienceCanvas.tsx`,
  `Experience.module.css` and `scene-types.ts` in the same directory.
- Camera composition/restore: `CameraControls.tsx` and `src/lib/guitar-camera.ts`.
- Sound preferences and exclusive playback: `AmpAudio.tsx`; source/poster manifest
  in `src/content/media.ts`.
- Asset contract: `src/lib/glb-contract.ts`; local source archival in `.gitignore`;
  optimized MP4 and poster in `public/media/video/`.
- Verification: `tests/guitar-video.test.ts`, `tests/e2e/amp.spec.ts`,
  `tests/e2e/guitar-video.spec.ts` and the motion-preference wait in
  `tests/e2e/audio-effects.spec.ts`. Handoff, development plan, this review and
  `docs/qa/guitar/` captures record the current behavior.

Formatting, strict typechecking, lint, static build, frozen-asset validation and
all 61 unit tests pass. Nineteen Chromium/SwiftShader browser regressions pass,
covering the optimized asset/MP4 layout, lazy requests, actual playback,
ambience/mute restoration, interrupted/repeated opening, autoplay rejection, failed
media retry, stalled buffering, native controls, touch/rotation, hidden tabs,
navigation, photo/drawing interactions, monitor replay and browser Back.
The final safe camera sampler and zero-resting-intensity pulse also pass focused
reruns of exact camera return and repeated normal-motion entry.

Initial page requests include neither video, its poster nor audio. The repeated
opening check retains one WebGL canvas. With the performance open, Chromium's
software renderer records zero WebGL `drawElements` calls during a 250 ms sample
after settling. This measures the paused scene loop, not video decoding FPS or a
physical-device frame-rate guarantee. Startup JS/CPU cost versus the previous
commit has not been isolated in a controlled benchmark. The build retains its
existing warning about chunks larger than 500 kB.

Reviewed [desktop](guitar/desktop.png) and [mobile](guitar/mobile.png) captures show
the real footage, full portrait framing, visible stand context and reachable
navigation/Close controls. The actual source video is used in browser playback,
seek, mute and error/retry checks; it is not replaced with a fixture.

Safari/iOS hardware, screen-reader operation and physical-device FPS remain manual
checks. No physical-device performance or autoplay guarantee is claimed.
