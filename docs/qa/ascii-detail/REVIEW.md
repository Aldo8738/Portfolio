# Lighter ASCII taco

22 October 2026. The creator approved reducing loader detail while retaining a
recognizable taco. This changes the app renderer in `src/lib/ascii-taco.js`.

## Work reduction

Reduce sampling density across the shell, rim, hinge, meat and filling. Preserve
the open folded-shell geometry, silhouette, toasted colors and all garnish types.
Increase the minimum character cell width from 3 to 4 CSS pixels and cap canvas
pixel ratio at 1.5 instead of 2. Keep the displayed size, rotation speed, 24 Hz
paint cap, two-second minimum, bar and readiness handling.

| Work per draw                                 |  Before |   After |
| --------------------------------------------- | ------: | ------: |
| Projected model points                        |  58,915 |  30,174 |
| Desktop character cells, 360 × 270 CSS pixels |   8,760 |   4,950 |
| Mobile character cells, 312 × 234 CSS pixels  |   6,552 |   3,744 |
| Mobile backing pixels at device DPR 2         | 292,032 | 164,268 |

This removes 49% of point transformations, about 43% of character-grid slots and
44% of high-DPR backing pixels. A cell is an upper bound on glyph calls; empty
cells do not draw characters. The user-supplied source reference folder and the
frozen stand GLB are unchanged.

## Visual review

All pairs below were captured and inspected before accepting the reduced detail.
The shell remains rounded and folded, with green, red and white filling visible
along the rim and inside the end view. Characters are coarser, as intended; there
are no large new holes or missing shell sides.

| View               | Before                               | After                              |
| ------------------ | ------------------------------------ | ---------------------------------- |
| Desktop broad side | [Before](before-desktop-front.png)   | [After](after-desktop-front.png)   |
| Desktop quarter    | [Before](before-desktop-quarter.png) | [After](after-desktop-quarter.png) |
| Desktop open end   | [Before](before-desktop-end.png)     | [After](after-desktop-end.png)     |
| Mobile broad side  | [Before](before-mobile-front.png)    | [After](after-mobile-front.png)    |
| Mobile quarter     | [Before](before-mobile-quarter.png)  | [After](after-mobile-quarter.png)  |
| Mobile open end    | [Before](before-mobile-end.png)      | [After](after-mobile-end.png)      |

These are isolated captures of the actual app renderer at fixed angles 0, -0.68
and pi/2 radians, on a black comparison page with the same canvas size and bar
layout. They isolate the renderer from scene setup and network loading. They are
not captures of a full application load. Desktop viewport: 1280 × 720, DPR 1;
mobile viewport: 390 × 844, DPR 2. The baseline uses commit `c6dac3e`.

## Timing and limits

[Before observations](before.json) and [after observations](after.json) use
Chromium 156.0.8078.4 on Windows. Each draw sample calls the real `setAngle()` over
48 evenly spaced angles, repeated three times, without WebGL or network activity.
Desktop batch means changed from 10.5–11.3 ms to 8.2–10.7 ms per draw. Mobile batch
means changed from 9.8–14.1 ms to 3.9–4.9 ms per draw. These measure synchronous
Canvas command submission and can include browser backpressure. They are not
presentation FPS, physical-mobile measurements or a guarantee that every startup
stall is gone. Scene parsing and first shader setup can still contend for time.

The existing production loader browser tests verify inline drawing, rotation,
reduced motion, pause/resume, the minimum hold, readiness handoff, keyboard skip,
Canvas 2D failure and covered-WebGL suspension.

All seven affected production browser tests pass, using SwiftShader for the
WebGL handoff cases. Formatting, typecheck, lint, all 19 unit tests, production
build and frozen asset validation pass. The existing deferred-chunk size warning
remains. Unrelated camera/content browser cases and the dev/build cache regression
were not rerun for this renderer-only change.
