# ASCII taco loading screen

22 October 2026. Implemented from the creator's
[v6 source package](../../../ascii-taco-loader-v6/ascii-taco-loader/README.md).
The latest instruction supersedes the earlier navigation-over-loader presentation:
the initial view is entirely black, with only the rotating taco visible.

## Before and after

- [Before, desktop](before-desktop.png): three CSS bars and loading text, with
  the website header/navigation visible.
- [After, desktop](after-desktop.png): the supplied taco on black, 1280 × 720.
- [After, mobile](after-mobile.png): the same presentation at 390 × 844.

These are real browser captures. The before image uses the dev server; the final
images use a production preview. Final captures hold the GLB request to inspect
the loading screen and use reduced motion for a stable angle. That deliberate
test hold is absent from application code. The final desktop/mobile captures were
visually inspected against the supplied standalone demo before accepting this
checkpoint. The header, stand and lower controls are fully covered.

## Integration

`AsciiTacoLoader.astro` renders through the layout's first body slot. Its Canvas 2D
renderer is embedded inline, before React hydration, with no image/font/renderer
request or new dependency. The original package is preserved; the application
copy in `src/lib/ascii-taco.js` has formatting changes only.

A native full-screen dialog places the black screen above the whole page and
keeps focus within it. The screen-reader status receives initial focus; Tab reveals
“Skip loading and view work”, and Escape dismisses the animation. Without
JavaScript, the dialog stays hidden and normal HTML navigation works.

The existing scene-ready callback still waits for an actual rendered frame. React
then emits `taqueria:scene-settled`; ready or failed status immediately closes and
removes the dialog. There is no minimum loading duration or extra exit delay.
Canvas 2D failure falls back to the existing text status. An independent 20-second
watchdog also releases the dialog if hydration cannot finish.

The supplied renderer caps rotation at 24 redraws/second. Hidden tabs pause it;
reduced motion displays a still taco, including when the preference changes during
loading. On exit, RAF, ResizeObserver, media/visibility/event listeners and the
watchdog are released, and the canvas backing store is reduced to 1 × 1. Original
media/audio loading and the frozen GLB remain unchanged.

## Measurements and limits

[Raw observations](measurements.json) use Chromium 156, Windows, loopback HTTP,
DPR 1 and ANGLE SwiftShader software rendering. The isolated setup sample blocks
external JS so React/Three.js cannot compete with the inline renderer. Each
condition has three fresh-context samples, with potentially warm system/font
caches. Timings measure renderer construction through its synchronous first draw,
not the time a physical display presents a frame.

| Condition                             | Median setup | Observed samples         |
| ------------------------------------- | -----------: | ------------------------ |
| Desktop 1280 × 720, normal CPU        |      63.1 ms | 1,157.1 / 63.1 / 53.9 ms |
| Mobile viewport 390 × 844, normal CPU |      50.7 ms | 57.5 / 50.7 / 48.2 ms    |
| Mobile viewport, 4× CPU throttle      |     302.9 ms | 302.9 / 330.8 / 246.2 ms |

The first desktop sample is a substantial cold outlier and is retained rather
than discarded. Its cause is not established. The inline renderer plus lifecycle
script adds 15,193 uncompressed bytes to homepage HTML. This animation still costs
main-thread work; these medians are not a startup guarantee.

Separate, normal-motion full-site observations reached scene-ready in 1,887 ms
(desktop low profile) and 2,662 ms (mobile profile), with no uncaught browser errors.
These are single unthrottled software-renderer runs, not physical-device performance
approval. Representative cold-device/network startup and hardware FPS remain open.

## Verification

- Formatting, Astro typecheck, lint, production build, 16 unit tests and frozen
  asset validation pass. The existing deferred chunk-size build warning remains.
- All 18 production browser tests pass, including pre-React drawing, full-screen
  modal sizing, Escape/keyboard skip, rotation, hidden-tab pause, motion preference
  changes, real-scene handoff at both sizes, missing Canvas 2D, no JavaScript,
  blocked GLB and missing WebGL.
- The dev/build regression test also passes: a production build while the dev
  server runs does not break React hydration.

The model, camera, materials and scene interaction behavior are preserved. This
checkpoint changes the loading presentation; outstanding portfolio content and
Phase 3 interaction work remain as recorded in the development plan.
