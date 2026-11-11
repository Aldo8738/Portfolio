# Knowledge Bridge Step 5

Implements the [scroll-storytelling brief](../knowledge-bridge-step-5-scroll-storytelling.md)
for Chapters 01-02. The approved hero, contribution strip, graph geometry and
palette, benchmark values, later chapter interactions and history demo are retained.

## Ownership and pacing

`KnowledgeBridgeCaseStudy.astro` places the solution text between the dense and
focused graph docks. `graph-motion.ts` owns chapter text visibility and SVG
presentation. `knowledge-bridge.ts` places the existing fixed SVG host using cached
layout bounds. The SVG, persistent node IDs and shared relationships never remount.
No new dependencies, simulations, controls or scroll interception are introduced.

Desktop pinning requires at least 1100px width and 650px height. The complete
existing story uses 640vh of scroll travel; Chapters 01-02 occupy its first 400vh.
Within those chapters, normalized ranges are:

| Range     | Presentation                                               |
| --------- | ---------------------------------------------------------- |
| 0-0.18    | Problem text, stationary and fully readable                |
| 0.18-0.24 | Brief text exit and dense graph entrance                   |
| 0.24-0.42 | Dense graph, stationary at the approved scale              |
| 0.42-0.48 | Dense graph recedes; solution text enters                  |
| 0.48-0.64 | Solution text, fully readable; dense geometry unchanged    |
| 0.64-0.72 | Solution text exits, then the original dense graph returns |
| 0.72-0.84 | Existing deterministic focus transition                    |
| 0.84-1    | Focused graph, stationary                                  |

The chapter follows the same scrubbed playhead as host placement. Reversing scroll
seeks the same timeline; reading phases do not advance geometry. After the final
hold, the existing later story resumes and the graph moves to its existing dock.

Narrow or short viewports use natural vertical flow: problem, dense dock, solution,
focus dock. The focus demonstration starts when its dock reaches the viewport top,
after the solution copy leaves view. Its scroll range is 45vh, followed by a stable
viewing interval inside the 150svh dock. Only the short graph demonstration holds
its position; neither chapter text nor the entire mobile sequence is pinned.
Reduced motion uses natural flow and instantaneous dense/focused states in 65svh
docks. Static HTML retains all chapter copy if enhancement is unavailable.

## Validation

No tests were added or run, as requested. Browser and visual inspection are left
to the creator, including forward/reverse scrolling, all six requested viewport
sizes, resizing, reduced motion and restored scroll positions. No new performance
profile was collected; smoothness and FPS improvements are not claimed.

Changed-file formatting and ESLint pass. The production build includes Astro /
TypeScript checking: zero errors, warnings or hints, and ten static pages emitted.
The existing large JavaScript chunk warning remains. Repository-wide
`format:check` reports five files outside this implementation: the supplied Step 5
brief and four existing overload-correction `bounds.json` captures. Those files
were left unchanged. `git diff --check` passes.

## Chapter 02 final visual polish

The persistent heading now reads `The living graph / Knowledge Bridge`; its
markup and typography are unchanged. Focused label targets use three tiers:
Paris and France use full text contrast and weight 650; Europe, Germany, Berlin,
Cities and Landmarks use 90% text contrast and weight 550; Eiffel Tower and
Brandenburg Gate use 78% text contrast and weight 450. Font sizes, protective
background strokes and all graph geometry remain unchanged.

The existing peripheral-detail fade now resolves to zero instead of leaving
35% opacity decoration around the focused network. The following timeline starts
from that same zero endpoint to preserve continuity; its later targets and timing
are unchanged. Overload styles and both magenta accents remain unchanged. No new
animation, dependency, timing change or Chapter 03 work is included.

No tests or visual checks were added or run for this polish pass, following the
creator's standing request. Responsive label overlap, clipping and forward/reverse
visual review remain with the creator; no performance claims are made.

Polish-pass checks: changed-file formatting, ESLint, Astro / TypeScript checking
and the production build pass. The build emits ten static pages and retains the
existing large-chunk warning. No scroll timing or geometry values changed.
