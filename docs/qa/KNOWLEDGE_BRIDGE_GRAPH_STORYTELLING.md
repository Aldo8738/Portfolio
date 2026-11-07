# Knowledge Bridge graph storytelling revision

Implements the [Graph Storytelling handoff](../knowledge-bridge-graph-storytelling-codex-handoff.md).
This replaces the earlier hero graph and Chapter 01 preview in the
[continuous-scroll review](KNOWLEDGE_BRIDGE_CONTINUOUS.md). Later story artwork,
backend channels, checkpoint interaction, portfolio identity and frozen GLB remain unchanged.

The later [Step 4 graph review](KNOWLEDGE_BRIDGE_STEP_4.md) supersedes the overload
topology and focus pacing below. The hero and keyboard-accessibility refinements
remain approved and unchanged.

## Title scale, metric and skip-link refinement

Before changing the title, the current desktop composition was compared with a
smaller title and then with a raised metric using temporary browser-only styles.
The selected desktop title uses `clamp(3.2rem, 8.8vw, 7.875rem)`, approximately
7.4% smaller at the checked desktop widths. Its explicit two-line break remains;
the existing mobile font size is preserved. A desktop-only `-0.08em` top margin
on the metric value raises its visible numerals roughly 7-8px to align optically
with the supporting text. The column and metadata layout remain unchanged.

The reported visible skip link did not reproduce on a fresh production-page load.
Its previous hiding used a transform and revealed on any `:focus`. The shared
rule now places it offscreen and clips it to a pixel by default, restoring its
size and top-left position only on `:focus-visible`. This retains its accessible
name and keyboard reachability without relying on a transform. Its high stacking
order remains; at entry, its focused position sits above the project heading.
`SiteLayout.astro` makes the existing main destination programmatically focusable
so activating the link transfers focus into content and hides the link again.

`navigation.spec.ts` checks fresh-load hiding, keyboard reveal, no heading overlap,
activation/focus transfer, and pointer-modality hiding on Knowledge Bridge, Work
and About at desktop and phone widths. Chapter 01 and later animations are unchanged.

Title comparison captures: [previous scale](knowledge-bridge/storytelling/title-scale-before.png)
and [smaller scale](knowledge-bridge/storytelling/title-scale-smaller.png). These
compare the title alone before changing metric alignment.

Validation: formatting, lint, all 73 unit tests and production build/typecheck
pass. Astro reports zero errors, warnings or hints; Vite retains its existing
scene-bundle size warning. All 20 affected Chromium browser tests pass, including
five hero/chapter viewport checks and shared keyboard navigation. The focused
skip-link captures show its separation from the heading on
[desktop](knowledge-bridge/storytelling/skip-focused-desktop.png) and
[phone](knowledge-bridge/storytelling/skip-focused-mobile.png). Screen-reader and
physical-device checks were not performed.

## Subsequent hero composition refinement

The creator's later hero direction replaces the narrow left-column composition.
The title now spans the full header at `clamp(3.2rem, 9.5vw, 8.5rem)` with no
character-width cap. The creator subsequently requested an explicit line break:
Knowledge on the first line, Bridge and its magenta period on the second.
The value proposition and supporting paragraph sit beside
the existing metric and benchmark, separated by a subtle vertical rule. The
metadata remains a full-width row beneath both columns. Below 768px the columns
stack and the divider becomes horizontal. The title stays on two lines; no fixed
hero height, new content, visual asset or dependency is introduced.

Only the Chapter 01 text-to-graph handoff is tightened: pinned text fades from
24% to 28% of the existing chapter timeline, while the graph reveals from 26%
to 30%. Their brief crossfade keeps combined opacity at least 0.5 rather than
passing through a fully empty frame. Reading time before the fade, graph geometry,
inspection holds, focus timing, later chapters and scroll distance are preserved.
In natural-scroll layouts, only the chapter introduction's bottom spacing reduces
from 18svh to 6svh. Reduced-motion and JavaScript-disabled content remain static.

Changed application files: `KnowledgeBridgeCaseStudy.astro`, `knowledge-bridge.css`
and `graph-motion.ts`. `tests/e2e/knowledge-bridge-chapter.spec.ts` now verifies
two-line titles across desktop and mobile, column alignment/stacking, metadata width and position,
and sampled forward/reverse crossfade opacity in addition to the existing graph
continuity checks. The hero screenshots below are refreshed for this composition.

Refinement verification: production build and Astro typecheck pass with zero
errors, warnings or hints; the existing Vite scene-bundle size warning remains.
Repository formatting, lint, all 73 unit tests and frozen GLB validation pass.
All 13 affected Chromium browser tests pass, including the five required viewport
sizes (1440x900, 1366x768, 1280x720, 390x844 and 375x667), reverse scrolling,
reduced motion, resize, later-story channels, checkpoints and JavaScript-disabled
HTML. Desktop and phone hero screenshots were visually inspected and saved.
The subsequent two-line title correction passes all five chapter browser tests,
formatting, lint, 73 unit tests, and production build/typecheck. Both hero captures
were refreshed. Physical-device testing and a new performance profile were not run.

## Implementation

- `KnowledgeBridgeCaseStudy.astro` removes the hero graph and outline, places the
  contribution table inside its content-sized header, and labels Chapter 01 as
  `01 / OVERLOAD`. The header has no scroll hold or fade.
- `knowledge-graph.ts` adds eight authored outer anchors and 56 local secondary
  branches to the existing nine-node, 24-point graph. North America, Mexico and
  Querétaro form a contextual branch; Querétaro and Berlin alone receive small
  magenta dots during overload. These are illustrative geography, not research data.
- `KnowledgeGraph.astro` renders these additions inside the original SVG.
  `graph-layout.ts` computes each responsive path once per layout refresh. Core
  nodes and edges retain their DOM identities and coordinates throughout Chapter 01.
- `graph-motion.ts` narrows the SVG viewBox while outer context recedes. No node
  flight, force simulation, path drawing or new dependency is introduced for this chapter.
- `knowledge-bridge.ts` retains cached layout rectangles and ticker-batched writes.
  Graph placement never reads layout on full-motion scroll frames. Its host keeps
  the same parent. Refreshes recompute responsive geometry; teardown removes
  listeners and GSAP work.

## Pacing and responsive behavior

Desktop story scroll distance increases from 3.6 to 6.4 viewport heights. Chapter 01
uses the first 62.5% (four viewport heights). The original handoff faded text
through 32% and revealed the graph through 40%; the subsequent refinement above
shortens only that handoff. Overload still holds through 60%; focus
runs from 60% to 78%; the cleaned graph holds through 88% before moving into the
existing later-story dock. Forward and reverse scrolling use the same timeline.

Phones and short viewports retain native document scrolling without pins. Chapter
text has its own reading space; a two-viewport chapter dock supports a shorter
1.5-viewport graph timeline. Reduced motion uses still overload and clean
compositions in normal flow with an instantaneous change between them. No-JavaScript
visitors retain all chapter text, the clean SVG and the saved relationship example.

## Review captures

- [Desktop hero](knowledge-bridge/storytelling/desktop-hero.png)
- [Phone hero](knowledge-bridge/storytelling/mobile-hero.png)
- [Desktop overload](knowledge-bridge/storytelling/desktop-overload.png)
- [Desktop clean graph](knowledge-bridge/storytelling/desktop-clean.png)
- [Phone overload](knowledge-bridge/storytelling/mobile-overload.png)
- [Phone clean graph](knowledge-bridge/storytelling/mobile-clean.png)

These production Chromium captures were visually inspected. The phone composition
retains all nine core labels during Chapter 01; secondary density is reduced to
fit its width. The geometry remains shared with later chapters.

## Original graph revision verification

Verified on Windows with the repository's portable Node 24.22.1 toolchain:

- `npm run lint`: pass. Repository formatting passed before an unrelated
  `docs/taqueria-cinematic-film-filter-codex.md` appeared during the final run.
  The final repository-wide `npm run format:check` flags that new file, which is
  left unchanged. Formatting checks for this revision's changed files pass.
- `npm run typecheck`: pass. Final `npm run build` also reports zero Astro errors,
  warnings or hints and emits ten static pages. Vite retains its existing large
  chunk warning for the separately loaded scene bundle.
- `npm test`: 73 tests pass across 18 files.
- `npm run validate:asset`: frozen GLB checksum and name contract pass.
- `npm run test:e2e -- tests/e2e/knowledge-bridge-chapter.spec.ts tests/e2e/knowledge-bridge.spec.ts`:
  13 Chromium tests pass against the production build. Chapter tests cover
  1440x900, 1366x768, 1280x720, 390x844 and 375x667, forward/reverse scrolling,
  stable overload and clean holds, unchanged DOM identities and core geometry,
  complete label visibility, hero facts and page width. Existing regressions cover
  smaller phones, tablets, short landscapes, later channels, slider input, themes,
  reduced-motion changes, resize, teardown/revisits and JavaScript-disabled HTML.

Superseded hero-expansion tests were replaced by `knowledge-bridge-chapter.spec.ts`;
the existing later-story and checkpoint tests remain. `knowledge-bridge.test.ts`
checks deterministic outer branches and graph bounds. The opt-in performance
profiler now watches the chapter dock instead of the removed hero dock.
Browser and unit runners required execution outside the sandbox because their
child processes initially failed with `spawn EPERM`.

No full-site browser sweep or new CPU/GPU performance profile was run. Chromium
viewport emulation is not physical-device validation. Creator approval and real
mobile performance remain manual review gates. Stop here for Chapter 01 review;
no subsequent chapter redesign is included.
