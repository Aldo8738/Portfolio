# Knowledge Bridge — Phase 1 hero animation polish

Scope: exit timing within the existing entry timeline only. Typography, colors,
spacing, layout, graph model, graph geometry, history controls and other pages are
unchanged. No additional animation library, trigger, observer or animation loop.

The later [short-viewport reading fix](KNOWLEDGE_BRIDGE_HERO_RESPONSIVE.md) changes
when this entry timeline begins. The opacity intervals below now follow a measured
reading phase rather than an assumed page-load or graph-entry offset.

## Root cause

The entire hero copy group faded from 5% to 45% of the entry transition, while
surrounding graph branches only began appearing at 65%. Because desktop copy stays
at its initial viewport position, that broad early fade left visibly dim text in
place, then cleared it well before the graph's expansion completed.

## Smallest focused change

The same scrubbed GSAP timeline now holds each group fully opaque until its exit.
Lower supporting text clears first to avoid crossing the arriving story content:

| Hero element                       | Exit interval, fraction of entry scroll |
| ---------------------------------- | --------------------------------------- |
| Metric and scroll hint             | 12–26%                                  |
| Description                        | 24–38%                                  |
| Subtitle                           | 34–48%                                  |
| Headline, eyebrow and step outline | 46–60%                                  |

Each exit lasts 14% of the existing entry range instead of the old shared 40%.
The existing smooth easing and 0.2-second scroll scrub are retained. The headline
stays fully readable through early scrolling and clears near the expanding network's
arrival. The original Paris/France graph remains visible throughout. Reverse scroll
restores the same opacity values and positions.

Cleanup now explicitly clears the child opacity styles as well as the existing
parent styles, so responsive and reduced-motion changes cannot leave faded copy.
Reduced motion still presents the authored static content and instant history selection.
The initial layout and mobile layout are untouched; no ambient motion was needed.

## Files changed for Phase 1

- `src/components/work/knowledge-bridge/graph-motion.ts`: named exit thresholds,
  staggered opacity tweens and child-style cleanup.
- `tests/e2e/knowledge-bridge.spec.ts`: early readability, short fade, reverse entry,
  visible persistent anchors and reduced-motion restoration checks.
- `docs/qa/KNOWLEDGE_BRIDGE_CONTINUOUS.md`: link to this focused follow-up.
- This review and its linked Phase 1 captures.

## Validation

Phase 1 is complete. Build/typecheck passes with zero Astro diagnostics and ten
static pages. ESLint, formatting, all 71 unit tests and the frozen GLB contract pass.
All ten Knowledge Bridge Chromium cases pass across the suite and targeted rerun.
The first run passed nine cases; an existing reduced-desktop assertion measured
before its native scroll handler updated geometry. It now polls that observed
geometry and passes, with no production layout change.

Checks cover initial opacity, an opaque headline at 20% and 40%, the short exit,
reverse restoration, unchanged node/parent identity and attached edges, visible
Paris/France anchors, intermediate refresh, mobile/landscape/tablet layouts, no
overflow, history mouse/touch/keyboard input, themes, cleanup, reduced motion and
no-JavaScript fallback. Reduced motion explicitly restores all hero copy to full opacity.

Reviewed captures:

- [Initial desktop](knowledge-bridge/hero-phase-1/still-1440-hero.png) and
  [initial mobile](knowledge-bridge/hero-phase-1/still-390-hero.png).
- [20%: early reading](knowledge-bridge/hero-phase-1/hero-entry-20.png),
  [40%: held headline](knowledge-bridge/hero-phase-1/hero-entry-40.png),
  [50%: short exit](knowledge-bridge/hero-phase-1/hero-entry-50.png),
  [70%: graph handoff](knowledge-bridge/hero-phase-1/hero-entry-70.png).

No later phase was implemented.

Physical devices, Safari/WebKit and screen-reader speech output are not tested.
The existing deferred site/scene bundle-size warning is outside this change.
