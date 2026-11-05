# Knowledge Bridge — Phase 1.5 scroll performance

This pass refines the existing [continuous-scroll implementation](KNOWLEDGE_BRIDGE_CONTINUOUS.md).
It preserves the approved composition, graph topology, reading boundary, mobile
natural flow, history controls and 0.2-second scrub. No Phase 2 work is included.

## Findings

The page uses static Astro markup and imperative GSAP. There are no React renders
on scroll. Graph paths are authored once when responsive timelines are created;
only the existing story geometry and packet positions change during their stages.
The inspected graph CSS has no animated filters or expensive layered shadows.
The entry and story triggers have separate, sequential responsibilities.

The significant avoidable cost was `positionNetwork()`. Native scroll events,
the entry timeline and the story timeline each invoked it. Every invocation read
both layout docks, created `gsap.set()` work for the host and desktop copy, and
rewrote host dimensions even when they had not changed. Chrome traces showed
synchronous Layout events under those rectangle reads, after SVG mutations.

Caching rectangles alone was insufficient: a subsequent profile identified
`window.scrollY` reads after SVG updates as another synchronous layout flush.
This intermediate version reduced script time but did not consistently improve
entry cadence; it was not accepted as the final optimization.

## Focused change

`src/components/work/knowledge-bridge/knowledge-bridge.ts` now measures the hero
and story docks at refresh. It computes their current viewport coordinates from
cached document geometry, ScrollTrigger's cached scroll sample, pin progress and
the existing CSS sticky bounds. Viewport height is measured during refresh too.
Resize and font readiness retain the existing ScrollTrigger refresh behavior.

Scroll and scrub updates queue one placement callback on GSAP's existing ticker.
The callback removes itself when flushed; refresh and abort remove pending work.
Quick setters update transforms, while dimensions and visibility are written only
when changed. Once entry ends, host dimensions stay static. Offscreen placement
writes are skipped. There is no new perpetual animation loop or input interception.

No graph rebuild, geometry reduction, additional animation, library, CSS effect,
blanket GPU promotion or scrub adjustment was needed. Existing packet paths retain
their native sampling and once-per-timeline length calculation. The small residual
forced layouts in those callbacks do not justify replacing that interaction here.
The reduced-motion branch and history controller are unchanged.

## Reproducible comparison

The opt-in `tests/e2e/knowledge-bridge-performance.spec.ts` records Chrome DevTools
Performance metrics, timeline traces with JavaScript stacks, Long Task entries and
RAF intervals. The instrumentation also counts reads of the two layout docks.
It runs three forward/reverse sweeps per viewport against a production build:

- 1440 × 900 desktop, normal CPU.
- 1280 × 600 short desktop, normal CPU and no pin.
- 390 × 844 mobile-size emulation, 4× CPU slowdown, DPR 1.

Each repeat traverses entry, story, reverse story and reverse entry with native
Chrome wheel gestures lasting about 1.8 seconds per segment. Every endpoint is
asserted within 5 CSS pixels. RAF samples cadence; it does not drive scrolling.
The browser was Chromium 156.0.8078.4 on Windows, with one worker. Both builds used
the same conditions, trace instrumentation and input. Baseline temporarily restored
only the original placement function; the optimized controller was then restored.

An earlier native-touch simulation produced no scrolling in this headless browser.
Those samples were discarded. The mobile-size result below measures rendering with
wheel input and CPU throttling; it is not a physical touch-device benchmark.

Values below are medians of three complete four-segment runs. Durations are total
milliseconds within each recorded sweep, not per-frame durations.

| Profile             | Dock reads before / after | Forced layouts before / after | Forced layout ms before / after | Layout ms before / after | Script ms before / after | Long tasks before / after |
| ------------------- | ------------------------: | ----------------------------: | ------------------------------: | -----------------------: | -----------------------: | ------------------------: |
| Desktop             |                  1436 / 0 |                      278 / 13 |                   215.86 / 3.46 |          431.94 / 271.82 |          425.38 / 180.81 |                     0 / 0 |
| Short desktop       |                  2110 / 0 |                      447 / 23 |                  422.56 / 22.57 |          563.81 / 321.26 |          651.28 / 224.32 |                     0 / 0 |
| Mobile size, CPU 4× |                   796 / 0 |                      157 / 12 |                  959.80 / 14.76 |        1510.39 / 1068.83 |         1441.81 / 836.40 |                    22 / 7 |

This removes all per-scroll dock measurements in the recorded windows. Forced
layout time fell about 95–98%, script time about 42–66%, and total layout time
about 29–43%. The timelines still have ordinary browser layout and SVG paint work.

RAF cadence did not improve consistently. Desktop entry p95 stayed 33.4 ms;
short-desktop forward entry changed from 16.8 to 33.3 ms while reverse entry
improved from 33.2 to 16.8 ms. Mobile-size entry stayed about 66.7 ms and main
story p95 stayed 50 ms. These are headless traced RAF intervals, not compositor
FPS. This comparison demonstrates reduced main-thread work and fewer throttled
mobile-size long tasks; it does not establish smooth 60 FPS on hardware.

The [comparison](knowledge-bridge/performance-phase-1-5/comparison.json) and full
per-run summaries are saved alongside this report:
[desktop before](knowledge-bridge/performance-phase-1-5/before-desktop.json),
[desktop after](knowledge-bridge/performance-phase-1-5/after-desktop.json),
[short desktop before](knowledge-bridge/performance-phase-1-5/before-short-desktop.json),
[short desktop after](knowledge-bridge/performance-phase-1-5/after-short-desktop.json),
[mobile size before](knowledge-bridge/performance-phase-1-5/before-mobile-cpu4.json),
[mobile size after](knowledge-bridge/performance-phase-1-5/after-mobile-cpu4.json).
Raw traces remain locally in the ignored `.cache/knowledge-bridge-profile/{before,after}/`
directories. Each `run-N.trace.json` can be opened in Chrome Performance.

To record the current implementation again after building:

```powershell
$env:KB_PROFILE_LABEL = 'after'
npm run test:e2e -- tests/e2e/knowledge-bridge-performance.spec.ts
Remove-Item Env:KB_PROFILE_LABEL
```

The label names an output directory; it does not change implementation. Recording
a baseline requires the corresponding baseline build. Without the environment
variable, the profiling tests skip during ordinary regression runs.

## Validation and limits

The functional suite now compares the real host and story dock rectangles within
1 CSS pixel across desktop stages, pin release, reverse traversal, intermediate
reload, tablet, short landscape, mobile stages and theme changes. Existing checks
cover readable hero content at six viewport sizes and height resizing, the same
persistent SVG, channels and endpoints, history mouse/touch/keyboard input,
reduced motion, cleanup and static HTML without JavaScript.

All 11 Knowledge Bridge Chromium regression cases pass on the final production
build. All 71 unit tests, formatting, ESLint, strict typechecking and the frozen
GLB asset contract pass. The three profiling scenarios each completed three valid
sweeps before and after. Build emits ten static pages with zero Astro errors,
warnings or hints; Vite retains its existing large-chunk advisory.

Browser profiling covers Chromium only. Physical mobile devices, Safari, real GPU
frame delivery and the 60 FPS target remain unverified. No later phase is implemented.
