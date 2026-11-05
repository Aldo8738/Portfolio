# Knowledge Bridge — readable hero on short viewports

This follows the [Phase 1 opacity polish](KNOWLEDGE_BRIDGE_HERO_PHASE_1.md).
The fix changes the entry boundary, not the visual identity, graph model, hero
layout, typography, history interaction or later story sections.

## Root cause

The desktop entry trigger started unconditionally at scroll position zero. On
mobile it started when the graph dock reached 35% of the viewport height. Neither
boundary measured whether the metric and contribution/technology row had been seen.
All copy exits were fractions of that prematurely started timeline. On desktop,
scroll compensation also began at that boundary, so lower content could be held
below the viewport while its opacity decreased.

The hero has an automatic content height, with no fixed hero min-height or hidden
overflow. Its illustration has a reserved responsive height. Only the SVG clips
its own artwork; it does not clip the HTML copy. The later story stage has its
existing bounded pin, but the reading area itself was never pinned. The 0.2-second
scrub smoothed the wrong trigger boundary; changing easing or adding a timeout
would not make below-fold information readable.

## Measured reading phase

The entry start is now a function of actual layout:

```text
max(0, metadata bottom in document − current viewport height + existing hero bottom padding)
```

Until that point, all hero information remains opaque and moves naturally with
the document. Every earlier element can enter the viewport before the final
metadata line reaches the bottom margin. Desktop scroll compensation begins only
after this reading phase. Large screens that already show all information retain
the original zero-offset entry and editorial composition.

The margin comes from the existing computed CSS padding, rather than a new pixel
delay. The end remains the existing story-stage boundary. No spacer, minimum hero
height or additional pin distance was introduced. The function is recalculated on
ScrollTrigger refresh, including the existing resize and font-readiness refreshes.

The same persistent graph and Phase 1 exit intervals remain. Metadata now fades
after the reading boundary in unpinned layouts too, preventing it from crossing the
graph handoff after it has been presented. Phones still use native vertical scroll,
with no entry pin or input interception. Reduced motion keeps static, fully readable
HTML and the existing corrected graph. Native browser scroll restoration is retained.

## Files changed for this task

- `src/components/work/knowledge-bridge/knowledge-bridge.ts`: measured entry start
  using the cached metadata/hero elements and current viewport height.
- `src/components/work/knowledge-bridge/graph-motion.ts`: remove the unused mobile
  viewport threshold and conditional metadata fade; apply that fade after reading.
- `tests/e2e/knowledge-bridge.spec.ts`: reading matrix, reverse traversal, exact
  opacity and natural-flow checks, height resizing, and updated entry sampling.
- `docs/qa/KNOWLEDGE_BRIDGE_CONTINUOUS.md` and `docs/qa/KNOWLEDGE_BRIDGE_HERO_PHASE_1.md`:
  point to the current responsive boundary behavior.
- This review and the linked responsive captures.

## Verification

The dedicated reading test passes at 1440×900, 1366×768, 1280×720, 390×844,
375×667 and 1280×600. For each size it brings every hero field into view, verifies
full effective opacity including ancestors, confirms natural document movement,
then transitions forward and restores content in reverse. It also changes height
from 900 to 600 without navigation and repeats the reading checks after recalculation.
Paris/France remain visible at the sampled handoff, with the same SVG instance.

All eleven Knowledge Bridge Chromium regression cases pass in one full run.
This includes forward/reverse graph motion, intermediate refresh, themes, responsive
layouts, history mouse/touch/keyboard input, reduced motion, cleanup and no-JavaScript
content. All 71 unit tests pass. Build/typecheck emits ten static pages with zero Astro
errors, warnings or hints. Formatting, ESLint and the frozen GLB contract also pass.

No later task or visual redesign was implemented.

Reviewed captures show the end of the reading phase; earlier headings may have
scrolled naturally above the viewport on small screens, with no fading required:

- [1440×900](knowledge-bridge/hero-responsive/reading-1440-900.png)
- [1366×768](knowledge-bridge/hero-responsive/reading-1366-768.png)
- [1280×720](knowledge-bridge/hero-responsive/reading-1280-720.png)
- [390×844](knowledge-bridge/hero-responsive/reading-390-844.png)
- [375×667](knowledge-bridge/hero-responsive/reading-375-667.png)
- [1280×600](knowledge-bridge/hero-responsive/reading-1280-600.png)
- Handoff after reading: [375×667](knowledge-bridge/hero-responsive/transition-375-667.png)
  and [1280×600](knowledge-bridge/hero-responsive/transition-1280-600.png).

Physical devices, Safari/WebKit and screen-reader speech are not tested. The
existing deferred site/scene Vite bundle-size warning is outside this fix.
