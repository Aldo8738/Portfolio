# Rear-to-front camera entrance

2 November 2026 photo-clearance follow-up: orbit the shared hero direction toward
the photo side by about 13.5 degrees (`azimuth: 0.24`), keeping the low elevation
and closer responsive framing below. This reveals the Lucha print beyond the
sign's right edge without moving the frozen model or any photo pivot.
Inspected production captures: [desktop](../cinematic/photo-clearance/desktop.png)
and [mobile](../cinematic/photo-clearance/mobile.png). All three prints are visible.
The [measurements](../cinematic/photo-clearance/measurements.json) use Chromium,
SwiftShader, reduced motion and DPR 1. Physical-device review remains pending.
An attempted development capture stopped on a React `setState`-during-render
warning involving `LoadingProgress` and `BerlinEnvironment`; the production
captures report no browser errors. That development warning is outside this
camera adjustment.

Photo-clearance validation: all 65 then-current unit tests and the six affected
browser flows pass. One browser-context setup timeout passed on a focused retry;
there was no application assertion failure. Formatting, typecheck, lint, build and
the frozen asset contract pass. Gallery controls were subsequently refined in the
[photo review](../PHOTO_CAMERA.md); the low, closer hero and photo-side orbit remain.

2 November 2026 update: the shared front endpoint is lower and closer, with 45%
desktop width, 94% narrow-screen width and a 70% height allowance. Elevation is
`0.08` (about 4.6 degrees). This supersedes the miniature endpoint below;
the rear starting pose and entrance timing remain unchanged.

Current production captures: [desktop 1280 × 720](../cinematic/lower-hero/desktop.png)
and [mobile 390 × 844](../cinematic/lower-hero/mobile.png). Both were inspected:
the full stand, sign and interaction targets remain visible, with clear space
above for the background and below for the HTML controls. Captures use Chromium,
SwiftShader, reduced motion and DPR 1; they do not validate physical-device FPS.
The [capture measurements](../cinematic/lower-hero/measurements.json) report no
browser errors and all named interaction targets inside the viewport.

Refinement validation: formatting, typecheck, lint, all 65 unit tests, production
build and frozen GLB contract pass. Six affected Chromium tests pass, covering
background orientation/reset, entrance interruption, mobile CRT touch navigation,
desktop CRT navigation, drag/zoom/reset and mobile framing. The build retains its
large-chunk warning. Physical-device composition remains pending creator review.

23 October 2026 update: the endpoint is now a centered, front-facing miniature
hero at 33% desktop width, with responsive framing and a shared smooth Reset.
The original rear framing is retained as the starting pose. See the current
[development plan](../../DEVELOPMENT_PLAN.md) and `heroCamera` configuration.
The images and results below document the earlier close-up endpoint; visual
review of the new endpoint and landmark separation is pending creator inspection.

22 October 2026. The creator requested a rear three-quarter start matching their
image, rotating into the existing Reset view, with a gentle vertical rise and fall.
This replaces the earlier 700 ms wide-to-close movement. Visual frames were
captured and inspected before accepting this implementation checkpoint.

## Visual evidence

| Viewport           | Rear start               | Raised turn                  | Final Reset view           |
| ------------------ | ------------------------ | ---------------------------- | -------------------------- |
| Desktop 1280 × 720 | [Rear](desktop-rear.png) | [Raised](desktop-raised.png) | [Front](desktop-front.png) |
| Mobile 390 × 844   | [Rear](mobile-rear.png)  | [Raised](mobile-raised.png)  | [Front](mobile-front.png)  |

The desktop rear preserves the dark sign back, refrigerator, hanging photo backs,
cactus and complete platform seen in the supplied reference. The middle view
reveals the side from a higher angle; the final frame retains the accepted front
composition. Portrait framing preserves the complete model throughout.

These are actual production-browser frames. For visual QA only, the first settled
event was held and the loader hidden to expose the stationary rear pose. The
middle view was frozen using simulated document visibility; the final view waited
for completion. Sampling uses natural wall time, so the middle screenshots are
representative stages rather than exactly 50% of the path. Details are recorded
in [captures.json](captures.json). No screenshots were edited.

## Behavior and implementation

- Retain the black ASCII taco screen, loading bar and two-second minimum. Render
  the rear pose behind it, then start the reveal after both the first scene frame
  and actual loader dismissal. Early Escape/skip, Canvas 2D failure and a missing
  loader cannot leave the entrance waiting for an event it already missed.
- Turn the camera 180 degrees over 2.8 seconds with GSAP `power2.inOut` easing.
  Raise its orbit gently and descend into the exact fitted hero pose. The peak is
  approximately eight degrees above the final elevation. A precomputed smooth
  distance adjustment keeps geometry inside the frustum throughout the turn.
- Move the camera around the model. Do not rotate the frozen GLB, alter its
  transforms or move the lighting rig. Existing cached shadows remain valid.
- Drag, scroll and keyboard camera input kill the tween and retain direct control.
  Reset/Home kill it and restore the final pose without replay. Resize and a change
  to reduced motion restore the fitted front view; reduced motion skips the orbit.
- Hidden/offscreen states pause the scene clock. Resuming clears the previous
  frame timestamp so hidden time cannot jump the playhead forward.

GSAP 3.15.0 is pinned with its lockfile. Only `gsap/gsap-core` is imported, inside
the existing deferred scene boundary; CSSPlugin, ScrollTrigger and other plugins
are unnecessary here. A paused GSAP object tween advances from R3F's frame loop
using its [playhead controls](https://gsap.com/docs/v3/GSAP/Tween/). There are no
per-frame React state updates, new GPU resources or postprocessing passes. The
path's framing clearance is calculated once, not on every animated frame. Tweens
are killed on interruption, reset, completion and component cleanup.

The canvas exposes `data-camera-entrance` phases (`waiting`, `running`, `complete`,
`interrupted`) for lifecycle checks. Initial normal-motion scene metrics project
targets from the rear frame; they are not live coordinates after the camera moves.
The normal-motion CRT tests therefore record front coordinates independently and
verify navigation after completion/reset. Real hit testing always uses the current
camera, independent of these diagnostics.

## Verification and limits

- Formatting, Astro typecheck, ESLint, production build and frozen GLB validation
  pass. The existing deferred chunk-size build warning remains.
- All 19 unit tests pass. New path tests sample 101 poses at each of three aspect
  ratios, checking full bounds, a raised midpoint, a rear start and exact final pose.
- All 21 production browser tests pass. New coverage checks waiting behind the
  loader, interruption, background pause/resume and real CRT navigation at the
  final pose on desktop/mobile. Existing reduced-motion, camera, loading, failure,
  HTML navigation and lazy-media checks remain passing.
- The dev/build cache regression also passes. The animation remains optional;
  direct HTML Work navigation stays usable during the visible entrance.
- A normal-motion check on the development server also reaches `running` and
  `complete` without uncaught browser errors. The current deferred Canvas chunk
  is 1,066,823 bytes, or 290,709 bytes with local gzip compression; these are
  artifact sizes, not a claim about hosting transfer headers or GSAP-only size.
- Screenshot review verifies composition and progression, not hardware smoothness.
  Captures/tests use Chromium 156 with ANGLE SwiftShader software WebGL at DPR 1.
  Physical desktop/mobile FPS and cold-network startup have not been rebenchmarked.

The usable-frame measurement remains distinct from animation completion. The
visible reveal adds 2.8 seconds after the loader closes, without blocking links or
camera input. It does not promise that the final settled hero appears within the
earlier 2–3 second loading target.
