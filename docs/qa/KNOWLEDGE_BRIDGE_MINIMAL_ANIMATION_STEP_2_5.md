# Knowledge Bridge — Step 2.5 minimal animation

Implemented from the creator's [Step 2.5 brief](../knowledge-bridge-minimal-animation-step-2-5.md).
This is a refinement of the existing graph story. Typography, theme tokens, hero
layout, contribution row, graph data and checkpoint history are preserved.
The existing hero entry is retained as implemented; no new expansion or Step 3
behavior is introduced.

## Audit and changes

The timeline previously revealed all secondary branches together, brightened near
detail while drawing the focus frame and starting streaming, then changed the
mobile node arrangement twice. Outbound and return paths stayed visible together
after their packets finished. Mobile channels wrapped around almost the full
canvas, and the backend outline added another magenta signal.

The main story now follows reveal, settle, focus and respond within the same
100-unit timeline and existing scroll distance:

- Relationships reveal in three small opacity groups at units 1–5, 7–11 and
  13–17. Europe/Germany appear first, Cities/Berlin next, then the landmarks.
  Connections reveal with their relevant group instead of drawing individually.
  Node reveals use inner groups; the existing hero entry retains separate outer
  wrappers, avoiding competing opacity writes during mobile entry and reversal.
- Local decorative detail appears quietly at 18–21, then settles before focus at 25. Its base contrast and maximum opacity are lower; important label styles are
  unchanged. The extra near-detail brightening animation is removed.
- Secondary connections recede at 25–29. Focus corners appear at 29–33, followed
  by the existing single prioritized update. That channel clears at 43–45.
- The incorrect relationship appears at 53–55 in neutral ink. The human selection
  ring follows at 56–58. The old relationship clears before the request starts.
- One edit request travels at 61–65. Its channel clears by 67. One WebSocket update
  returns at 69–73; its channel clears by 75. Both directions reuse the same compact
  curve in opposite directions, with the existing labels shown one at a time.
- The corrected relationship appears at 75–78. Backend annotation clears by 80,
  context returns quietly, and the existing measured result appears at 82–88.

The backend pulse and redundant channel-drawing animations are removed. Nodes no
longer rearrange for the mobile response and then return. They retain their
authored base coordinates throughout the main story; mobile context softens using
opacity. Essential nodes and labels remain present. The final graph rests with one
magenta corrected relationship, without request loops or lingering arrows.

Settling windows belong to scroll progress. There are no timers, input interception,
additional pins, repeated animation loops or increased scroll distances. The same
four caption boundaries, restrained easing and 0.2-second scrub remain reversible.

## Scope and files

- `graph-motion.ts`: grouped reveals, settling intervals, ordered channels and
  removal of mobile repositioning, backend pulse and redundant emphasis.
- `KnowledgeGraph.astro`: presentation-only reveal groups, compact mobile channel
  defaults, shared annotation position and removal of the pulse rectangle.
- `graph-layout.ts`: compact forward/reverse channels and their label coordinates.
- `knowledge-bridge.css`: quieter peripheral marks and neutral incorrect edge;
  removal of the unused backend pulse styling.
- `tests/e2e/knowledge-bridge.spec.ts`: updated channel timing and stationary mobile
  expectations; new forward/reverse checks for reveal order, stationary geometry,
  mutually exclusive channels and correction after the response.
- This review, the saved brief and the current continuous-scroll review.

All production files above are under `src/components/work/knowledge-bridge/`.
No graph node or relationship data, hero content, history controller, global page
styles or dependencies change. The Phase 1.5 controller remains intact: refreshed
geometry, cached scroll samples, batched writes and callback cleanup are retained.
Reduced motion still uses the existing static presentation and natural reading.
The SVG description continues to identify the example as an illustrative reconstruction.

## Verification

Build/typecheck, ESLint, all 71 unit tests and the frozen GLB contract pass.
The new browser check passes across both directions at desktop and phone sizes.
It verifies staged reveals, stationary main-story geometry, mutually exclusive
channels and packets, a clear interval between directions, and correction after
the response. Reveal-order samples inspect node groups independently of the
connections that deliberately fade during focus. Settling is sampled between
boundaries to avoid mistaking integer scroll-pixel rounding for animation overlap.

Desktop and phone paused captures were inspected. The compact channel labels are
readable and only one direction appears at a time:
[desktop request](knowledge-bridge/minimal-step-2-5/1440-0.63.png),
[desktop response](knowledge-bridge/minimal-step-2-5/1440-0.71.png),
[phone request](knowledge-bridge/minimal-step-2-5/390-0.63.png),
[phone response](knowledge-bridge/minimal-step-2-5/390-0.71.png),
[desktop rest](knowledge-bridge/minimal-step-2-5/1440-0.89.png) and
[phone rest](knowledge-bridge/minimal-step-2-5/390-0.89.png).
All 12 Knowledge Bridge Chromium cases pass on the final build: the new sequence
case ran separately, followed by the remaining eleven regression cases. They cover
the six-size reading matrix, forward/reverse motion, pin release, intermediate
reload, tablet and short-screen modes, mobile layout, history mouse/touch/keyboard
input, themes, resize, cleanup, reduced motion and static HTML without JavaScript.
Formatting passes. Build emits ten static pages with zero Astro errors, warnings
or hints, while retaining Vite's existing large-chunk advisory.

## Performance observations

The existing opt-in profiler ran three forward/reverse sweeps at 1440 × 900,
1280 × 600 and 390 × 844 with 4× CPU slowdown for the mobile-size profile.
Chromium 156.0.8078.4, Windows, DPR 1 and native wheel input match the previous
[Phase 1.5 recording conditions](KNOWLEDGE_BRIDGE_PERFORMANCE_PHASE_1_5.md).
That earlier recording is the comparison baseline, rather than an interleaved
benchmark. A second set of three mobile-size sweeps checked the mixed result.

All recordings retain **zero per-scroll dock rectangle reads**. No animation-loop
or geometry-rebuild work was added. Median total metrics for four-segment sweeps:

| Profile             | Layout ms, Phase 1.5 / Step 2.5 | Script ms, Phase 1.5 / Step 2.5 | Long tasks, Phase 1.5 / Step 2.5 | Forward story RAF p95 ms, Phase 1.5 / Step 2.5 |
| ------------------- | ------------------------------: | ------------------------------: | -------------------------------: | ---------------------------------------------: |
| Desktop             |                 271.82 / 284.53 |                 180.81 / 174.44 |                            0 / 0 |                                    33.4 / 33.4 |
| Short desktop       |                 321.26 / 295.07 |                 224.32 / 194.81 |                            0 / 0 |                                    16.8 / 16.7 |
| Mobile size, CPU 4× |               1068.83 / 1008.18 |                 836.40 / 916.69 |                           7 / 11 |                                      50 / 33.4 |

The repeat mobile-size set measured median layout 1028.28 ms, script 785.76 ms,
15 long tasks and forward-story p95 33.4 ms. Mobile entry p95 varied between the
sets (66.7 and 83.3 ms, versus 66.6 ms previously). Thus main-story cadence improved
in these samples, but entry and long-task results remain mixed. The first set's
higher script time did not repeat; higher long-task counts remain an observed
limitation. These measurements do not establish a mobile performance improvement
overall or guarantee absence of a hardware regression.

The [comparison](knowledge-bridge/minimal-step-2-5/performance-comparison.json),
[desktop](knowledge-bridge/minimal-step-2-5/profile-desktop.json),
[short desktop](knowledge-bridge/minimal-step-2-5/profile-short-desktop.json),
[mobile-size](knowledge-bridge/minimal-step-2-5/profile-mobile-cpu4.json) and
[mobile-size repeat](knowledge-bridge/minimal-step-2-5/profile-mobile-cpu4-repeat.json)
summaries preserve individual runs. Raw traces remain locally under the ignored
`.cache/knowledge-bridge-profile/step-2-5/` and `step-2-5-repeat/` directories.
RAF intervals sample headless browser cadence, not compositor FPS. Mobile-size
wheel input with CPU throttling is a rendering proxy, not physical touch scrolling.

Physical mobile devices, Safari and 60 FPS hardware delivery remain unverified.
No Step 3 work is included.
