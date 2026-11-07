# Knowledge Bridge graph storytelling revision

Implements the [Graph Storytelling handoff](../knowledge-bridge-graph-storytelling-codex-handoff.md).
This replaces the earlier hero graph and Chapter 01 preview in the
[continuous-scroll review](KNOWLEDGE_BRIDGE_CONTINUOUS.md). Later story artwork,
backend channels, checkpoint interaction, portfolio identity and frozen GLB remain unchanged.

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
uses the first 62.5% (four viewport heights): text holds through 24%, fades alone
through 32%, then the graph reveals through 40%. Overload holds through 60%; focus
runs from 60% to 78%; the cleaned graph holds through 88% before moving into the
existing later-story dock. Forward and reverse scrolling use the same timeline.

Phones and short viewports retain native document scrolling without pins. Chapter
text has its own reading space; a two-viewport chapter dock supports a shorter
1.5-viewport graph timeline. Reduced motion uses still overload and clean
compositions in normal flow with an instantaneous change between them. No-JavaScript
visitors retain all chapter text, the clean SVG and the saved relationship example.

## Review captures

- [Desktop hero](knowledge-bridge/storytelling/desktop-hero.png)
- [Desktop overload](knowledge-bridge/storytelling/desktop-overload.png)
- [Desktop clean graph](knowledge-bridge/storytelling/desktop-clean.png)
- [Phone overload](knowledge-bridge/storytelling/mobile-overload.png)
- [Phone clean graph](knowledge-bridge/storytelling/mobile-clean.png)

These production Chromium captures were visually inspected. The phone composition
retains all nine core labels during Chapter 01; secondary density is reduced to
fit its width. The geometry remains shared with later chapters.

## Verification

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
