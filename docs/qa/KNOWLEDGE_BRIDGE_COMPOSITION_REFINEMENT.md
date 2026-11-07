# Knowledge Bridge graph composition refinement

Refines the [Step 4 graph](KNOWLEDGE_BRIDGE_STEP_4.md) without changing the approved
hero, focused composition, scroll controller, pin distances, later timeline or
checkpoint behavior.

## Composition findings and changes

Baseline geometry already reached 86-96% of desktop canvas width. Its faint outer
perimeter contributed little visual weight, while sparse polygonal chains and
long low branches made the useful network feel smaller than those bounds.
The refinement strengthens the network body without enlarging its labels.

- Canada, Arts and Architecture hubs move slightly farther apart horizontally.
  The lower Places hub rises by 60 graph units, consolidating its neighborhood into
  the broad horizontal composition. Core node coordinates and all mobile node
  positions remain unchanged.
- Fourteen authored desktop connections join nearby neighborhoods and fill gaps
  between existing supporting nodes. The graph retains 97 identities and 12 labels.
  Mobile retains its simplified 57-node composition and existing label routing.
- Degree-two supporting junctions share a bounded tangent through both incident
  curves. Handles are limited to 30% of the shorter incident edge, with directional
  checks preventing backward handles. Authored branch bends remain at forks.
  One nearly parallel bridge is redirected to a neighboring junction to remove
  a narrow pinched loop. Both coordinate layouts cache their paths on first use.
- The initial desktop viewBox changes from `-450 -80 1700 900` to
  `-500 -60 1800 880`. This frames the wider, shallower network with safe margins;
  it does not alter the final `0 0 900 600` focused viewport. Mobile framing is unchanged.

## Hierarchy and styling

Primary overload dots increase from 3.6 to 4.2 graph units. Unlabeled secondary hubs
use radius 3; secondary support points use 2.7; peripheral points use 1.5. Neutral
secondary fill increases from 58% to 68% text contrast, peripheral fill from 34%
to 40%. Secondary edges use 50% neutral contrast at one graph unit, peripheral
edges 33% at 0.85 units. The three outer geographical labels use dark neutral text.

All font-size rules remain unchanged. Querétaro and Berlin retain radius-three
magenta dots, with no magenta paths. The primary dots still settle at the approved
4.5-unit radius in the focused state. Dense-only elements disappear through the
existing opacity timeline; all focused-state styles and geometry remain unchanged.

## Actual settled bounds

Measured in Chromium on Windows at chapter progress 45% (settled overload) and
84% (settled focus). Bounds are the union of rendered SVG edge, dot and label
rectangles, excluding hidden or effectively transparent elements. Canvas width
is the actual SVG host width. Scene height is the visible viewport/pinned stage
height; on mobile it is the natural-scroll viewport. Stroke antialias fringes are
not included in these geometry bounds.

| Viewport | Overload bounds (CSS px) | Canvas width | Visible scene height |
| -------- | ------------------------ | ------------ | -------------------- |
| 1440x900 | 1279.8 x 554.7px         | 94.1%        | 61.6%                |
| 1366x768 | 1170.3 x 507.3px         | 91.0%        | 66.1%                |
| 1280x720 | 1077.9 x 467.2px         | 89.8%        | 64.9%                |
| 390x844  | 336.3 x 468.3px          | 93.9%        | 55.5%                |
| 375x667  | 299.1 x 416.7px          | 87.2%        | 62.5%                |

[Full before bounds](knowledge-bridge/composition/before-bounds.json) and
[full after bounds](knowledge-bridge/composition/after-bounds.json) include positions,
canvas rectangles, viewBoxes and both settled states. All five focused-state
rectangles match the baseline within 0.01 CSS pixels. Protected source hashes also
match for the hero, navigation, scroll controller, clean data and later timeline.

## Captures

- [Desktop before](knowledge-bridge/composition/desktop-before.png)
- [Desktop after](knowledge-bridge/composition/desktop-after.png)
- [Short desktop after](knowledge-bridge/composition/short-desktop-after.png)
- [Mobile after](knowledge-bridge/composition/mobile-after.png)
- [Settled desktop focus](knowledge-bridge/composition/desktop-focused.png)
- [Settled mobile focus](knowledge-bridge/composition/mobile-focused.png)

Both settled states were visually inspected. No extra scroll distance, layout
physics, renderer, animation library or continuously moving element is added.

## Files and verification

Changed application files are `src/content/knowledge-graph.ts`,
`KnowledgeGraph.astro`, `graph-motion.ts` (initial dot radius only), and
`knowledge-bridge.css` (overload hierarchy only). Unit tests add a shared-tangent
contract; chapter browser tests assert actual desktop coverage, settled holds,
label margins and continuous geometry. Existing resize, theme, reduced-motion,
reverse-scroll and history regressions remain in use.

Formatting, lint, all 75 unit tests, frozen GLB checksum/name validation and the
production build pass. Astro/TypeScript checking reports zero errors, warnings or
hints; the existing separate scene-bundle size warning remains.

All 14 Chromium browser checks pass: six chapter cases cover the five specified
viewport sizes and desktop/phone reduced motion; eight existing regressions cover
later channels, checkpoints, resize, themes, small phones and JavaScript-disabled
HTML. Tests verify full label visibility, measured desktop coverage, stable markup
in both settled intervals, unchanged node/edge geometry and reverse scrolling.

Physical-device, Safari and GPU timing were not remeasured. The earlier Step 4
performance limits still apply; this refinement makes no new frame-rate claim.
Curve geometry is cached once per coordinate layout and never recalculated on
scroll frames.
