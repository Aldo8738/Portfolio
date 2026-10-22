# ASCII loader handoff

22 October 2026. The creator clarified that the ASCII animation stuttered when
the loading bar filled; the revealed stand itself looked fine.

## Cause and change

The scene's continuous WebGL loop started while the opaque loader still covered
it. Once the first usable frame filled the bar, the stand kept rendering behind
the dialog during its two-second minimum hold. This competed with the ASCII
renderer for browser time.

Prepare the scene using R3F demand rendering, then stay on demand until the loader
actually closes. Gate trompo rotation on the same reveal state. Dismissal resumes
the existing continuous frame loop and GSAP entrance. Initial setup invalidations
still render as needed; there is no new wait or timer. This uses R3F's documented
[on-demand rendering](https://r3f.docs.pmnd.rs/advanced/scaling-performance#on-demand-rendering).

The taco renderer, bar behavior, two-second minimum, camera path, scene quality,
materials and frozen model are unchanged.

## Before and after

Both screenshots were captured from production builds and inspected. The compact
taco, black screen and complete bar remain correctly positioned; different taco
angles reflect the running animation. Still images verify appearance, while the
draw samples and browser regression verify the scheduling change.

| Sample | Screenshot           | Duration | Covered WebGL draws | Animation callbacks |
| ------ | -------------------- | -------- | ------------------- | ------------------- |
| Before | [Before](before.png) | 2,270 ms | 2,590               | 14                  |
| After  | [After](after.png)   | 2,007 ms | 0                   | 50                  |

Raw observations: [before](before.json), [after](after.json). Chromium
156.0.8078.4, Windows, ANGLE SwiftShader software WebGL, 1280 × 720, DPR 1,
normal motion, local production preview. The baseline uses commit `0a3db9f`;
the after sample uses this fix. These are single controlled samples, not a
physical-device FPS benchmark.

For each sample, hold the first `taqueria:scene-settled` event in a capture
listener, set the test bar to complete, wait for scene status `ready` and allow
250 ms for final setup. Then count actual `WebGL2RenderingContext.drawElements`
and `drawArrays` calls over approximately two seconds using a temporary
requestAnimationFrame sampler. Holding the event extends the prepared-but-covered
state so both builds can be compared consistently. No production instrumentation
was added. Animation callbacks are browser scheduling observations, not GPU
presentation FPS; the key result is removal of covered WebGL draws.

## Regression coverage

`tests/e2e/loader.spec.ts` holds the same settled event, verifies that the ASCII
canvas changes while WebGL draw counts remain stable after setup, dismisses the
loader with Escape and verifies that WebGL draws resume. The remaining loader
tests cover the normal two-second hold, still/reduced motion, failures, skip,
hidden tabs and cleanup. Camera tests cover the normal dismissal-to-orbit path.

The full production run passed 20 cases, with two software-browser timeouts: the
new covered-rendering test reached its check after the loader watchdog had closed
the dialog, and the existing blocked-model test exceeded its overall deadline.
The new test now uses a smaller 640 × 480 viewport and stops continuous rendering
in cleanup, matching the existing normal-motion test pattern. Both affected cases
passed on an isolated rerun. All 22 production cases therefore have passing
results, rather than a single uninterrupted green run.

Formatting, Astro typechecking, ESLint, all 19 unit tests, the production build,
the frozen GLB contract and the dev/build hydration regression pass. The existing
deferred-chunk size warning remains; this change adds no dependency.

Physical GPU smoothness and cold-network startup still need device measurements.
