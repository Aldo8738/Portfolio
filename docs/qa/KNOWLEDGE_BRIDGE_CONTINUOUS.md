# Knowledge Bridge continuous-scroll review

Implemented from the [continuous-scroll plan](../knowledge-bridge-continuous-scroll-implementation-plan.md),
the creator's subsequent inspiration image and instruction to fade the desktop
hero in place. This supersedes the [V4 composition](KNOWLEDGE_BRIDGE.md).
The existing font stack, theme tokens, navigation, footer, contribution and technology
row, benchmark claims and other project pages are preserved. No dependencies added.

The later [Phase 1 hero-animation polish](KNOWLEDGE_BRIDGE_HERO_PHASE_1.md)
delays and shortens the hero-copy exit within this same timeline. It preserves
the composition, graph structure, history controls and responsive layout below.
The subsequent [short-viewport reading fix](KNOWLEDGE_BRIDGE_HERO_RESPONSIVE.md)
measures the bottom of the metadata before starting entry, allowing natural reading
on short screens while retaining the large-screen composition.
The subsequent [Phase 1.5 performance pass](KNOWLEDGE_BRIDGE_PERFORMANCE_PHASE_1_5.md)
caches refreshed layout geometry and batches placement writes on GSAP's ticker;
it preserves the composition, reading boundary and scrub timing.
The later [Step 2.5 animation refinement](KNOWLEDGE_BRIDGE_MINIMAL_ANIMATION_STEP_2_5.md)
groups relationship reveals, settles mobile nodes and sequences a single compact
request/response channel while retaining that performance work.

## Audit and visual direction

The existing implementation already had one living SVG, deterministic geometry,
GSAP, reduced-motion cleanup and a functional native history slider. It used a
gaming example, a full hero constellation and timed Flip reparenting. Those were
the parts to replace; the static Astro route, HTML content and history controller
were retained. [Desktop baseline](knowledge-bridge/continuous/baseline-desktop.png)
and [phone baseline](knowledge-bridge/continuous/baseline-mobile.png) were captured
before changes.

The hero now contains only Paris, France and their restrained curve. Label outlines,
a passive four-step outline, the magenta title period and the metric beneath the
introduction follow the supplied visual reference using existing design tokens.
The graph expands into nine authored primary nodes and 24 local secondary points.
Seven primary labels and eight secondary points are visible in the compact phone
layout. There is no random force simulation or whole-canvas decorative line mesh.

Desktop hero, focus and corrected states and phone hero/focus states were captured
and inspected as paused compositions. This caught premature mobile entry and faint
labels. Labels now retain readable text contrast; background connections soften.
The main graph continues to occupy about 71% of the desktop story composition.

## Continuity and scroll

`KnowledgeGraph.astro` renders one living graph. Its host stays inside the same
`.kb-scene-layer`, outside the pinned element, for its entire lifetime. No cloning,
DOM reparenting or Flip transfer occurs. The hero and story reserve layout targets.
The fixed scene interpolates between their viewport rectangles while GSAP animates
the same Paris/France node transforms, their attached curve and the viewBox. Other
branches emerge around those anchors. Reverse scrolling restores the same elements.

Hero copy and metadata first remain opaque in natural document flow until the last
metadata line reaches the viewport margin. Desktop scroll compensation then holds
copy, metric and outline at their current viewport positions while opacity fades.
The hero clears before story text arrives. Metadata fades only after being presented,
including in unpinned layouts. Its HTML and first-view composition remain intact.

There is one bounded entry timeline and one main story timeline, both scrubbed at
0.2 seconds. Only the main stage pins: 180vh additional distance on wide desktops
(1100px+, at least 650px tall), or 150vh on safe tablets (768–1099px, 850px+ tall).
The main pin releases into model history. Intermediate refresh and reverse scrolling
use the current scroll position. Fonts and responsive changes refresh target geometry.
GSAP suppresses animation-update callbacks when restoring progress during refresh.
The refresh callbacks therefore explicitly synchronize the entry marker and active
explanation from the restored timelines. Browser scroll restoration remains native.

The four main states are distinct:

1. The expanded graph shows surrounding relationships and local secondary branches.
2. Hairline focus corners isolate Paris/France. Context edges soften and prioritized
   updates arrive progressively, while meaningful labels remain readable.
3. An explicitly proposed incorrect Paris–Germany edge replaces the neutral hero
   relation. USER EDIT / API travels out to the backend. A separate WEBSOCKET / GRAPH
   UPDATE returns; only after that return does the Paris–France correction settle.
4. Context calms and the fixed measured 8.47s to 1.57s result appears. No synthetic
   countdown, network requests or live-inference claims are introduced.

Viewport positioning runs only on scroll, scrub updates, resize and refresh. Full-motion
placement reuses cached dock geometry and ScrollTrigger's cached scroll sample;
pending writes flush once on the existing ticker and cancel on cleanup. There
is no independent perpetual RAF loop, physics engine, extra geometry or post-processing.
Contexts, triggers and event subscriptions clean up on navigation, pagehide and
responsive/reduced-motion changes; persisted pageshow remounts through the existing guard.

## Mobile, accessibility and history

Phones use the same nodes and relationships with a separately authored 400×360 layout.
The same Paris, Germany and France nodes retain their authored positions throughout
the main story. Context softens while one compact API channel appears, clears and
returns as a WebSocket update. Only after the response does the correction settle;
background branches then return quietly. There is no separate mobile rearrangement.
Natural scroll associates four HTML captions with a short sticky canvas. There is
no mobile GSAP pin, pin spacer or added scroll distance. A height-aware
reading anchor keeps sampled active headings clear of the graph at short sizes.
The ordinary mobile header and safe-area behavior are unchanged.

Reduced motion uses no entry/story animation, scrub or pin. It displays the calm
hero relationship, then a static corrected graph when the hero has left the viewport.
All explanations stay readable and history selection is immediate. Without JavaScript,
the single authored corrected graph stays in the story; the hero retains its HTML copy,
metric and metadata. All four explanations, results and project navigation remain real
HTML, with unavailable interactive history controls hidden.

The focused history SVG uses the same Paris/Germany/France relationship data, not a
second constellation. Native range input continuously moves its one edge and endpoint.
Version buttons, restored state, caption, aria-valuetext and live feedback stay in sync.
Intermediate positions explicitly describe an interpolation, not another saved state.
The existing local-reconstruction disclosure remains visible. Targets remain at least
44 CSS px and all interactions work without hover.

The geographic example is illustrative, not the thesis dataset or original Focus UI.
The research values remain graph finish time, 8.47s to 1.57s, 100-item Reddit test,
81.5% reduction; and page load time, 4.82s to 1.33s, 600-item Reddit test, 72.4% shorter.
The controlled Chrome / mean-of-ten qualifier remains. No verified thesis asset was
found in the repository, so no thesis URL or screenshot was invented.

## Exact implementation files

- `src/content/knowledge-graph.ts`: shared world-knowledge model, hero and responsive
  coordinates, deterministic local branches and relationship paths.
- `src/content/knowledge-bridge.ts`: concise explanatory copy and saved-state labels.
- `src/components/work/knowledge-bridge/KnowledgeBridgeCaseStudy.astro`: reference-inspired
  hero, metric placement and permanent scene-layer parent.
- `src/components/work/knowledge-bridge/KnowledgeGraph.astro`: one accessible graph,
  hairline focus cue, proposed-edge label and small hero label outlines.
- `src/components/work/knowledge-bridge/graph-layout.ts`: attached paths and responsive
  node, focus, API, backend and WebSocket geometry.
- `src/components/work/knowledge-bridge/graph-motion.ts`: reversible entry and causal
  story choreography, shared motion thresholds and cleanup presentation reset.
- `src/components/work/knowledge-bridge/knowledge-bridge.ts`: stable scene placement,
  stationary hero fade, responsive pinning and reduced-motion/static lifecycle.
- `src/components/work/knowledge-bridge/knowledge-bridge.css`: scoped reference composition,
  graph hierarchy, contrast, passive outline and responsive spacing.
- `src/components/work/knowledge-bridge/CheckpointDemo.astro`: shared semantic history
  labels and v01/v02 controls; existing range/controller interpolation retained.
- `tests/knowledge-bridge.test.ts`: shared semantics, graph references, interpolation
  and benchmark contracts.
- `tests/e2e/knowledge-bridge.spec.ts`: stills, continuous-entry identity/edge checks,
  stationary hero, video/measurements, responsive story and accessible input coverage.
- Handoff, development plan, historical QA notice, this review and the new plan/captures.

## Verification and evidence

Build/typecheck passes: ten static pages, zero Astro errors, warnings or hints.
ESLint and all 71 unit tests pass. The frozen production GLB checksum and node-name
contract pass. Final formatting includes the saved evidence JSON.

All 24 relevant Chromium cases pass across the Knowledge Bridge, case-study and
Work suites, including reruns. The combined run initially passed 23/24: an existing
case-study test missed the short entrance-opacity window after page load. That
unchanged test passed separately on rerun. No other project's implementation was
changed to address this timing-sensitive assertion. After the final branch-entry
refinement, all five affected Knowledge Bridge flows pass again. Final phone/tablet
timing checks also pass. The stricter mid-story refresh assertion now confirms the
matching correction phase after reload at all three desktop widths; the refresh
synchronization and Back/revisit flows pass after that fix.

The matrix covers 320×568, 360×800, 375×812, 390×844, 430×932, 768×1024,
768×700, 1024×1366, 1024×768, 844×390, 1280×800, 1440×900 and 1920×1080,
plus unpinned/reduced desktop cases at 1920×600 and 1920×900. Checks include:

- Stable SVG, node and parent identity through forward/reverse entry; attached
  relationship and context-edge endpoints at intermediate positions.
- Constant desktop hero-title viewport position during its opacity fade.
- All four causal story states, actual moving packets, delayed edge replacement,
  concise pinning, intermediate refresh, desktop composition and normal scroll release.
- No mobile pin spacer or overflow, readable labels and active headings clear of
  the short canvas; the mobile story remains below 250vh at the tested short size.
- Mouse drag, actual touch drag, Home/End/Arrow keys, both versions, restore and
  continuous midpoint history geometry. Selection survives resizing during a scrub.
- Reduced motion, theme switching, focused skip link, pagehide/pageshow cleanup,
  project navigation and revisits, no JavaScript, and 125% root text size.

The saved local desktop recording reports CLS 0, median sampled frame interval
16.7 ms and p95 33.4 ms over a bounded 60-frame scroll. Its load/entry observer
also recorded long tasks of 321 ms and 62 ms. Recording overhead and this Windows
host are included; these are diagnostic observations, not device performance claims.

Reviewed evidence:

- [Desktop hero](knowledge-bridge/continuous/still-1440-hero.png),
  [1280px hero](knowledge-bridge/continuous/hero-1280.png),
  [wide hero](knowledge-bridge/continuous/hero-1920.png),
  [entry midpoint](knowledge-bridge/continuous/entry-midpoint.png).
- [Expanded graph](knowledge-bridge/continuous/desktop-1440-beat-1.png),
  [focus](knowledge-bridge/continuous/still-1440-focus.png),
  [correction and backend return](knowledge-bridge/continuous/desktop-1440-beat-3.png),
  [settled result](knowledge-bridge/continuous/still-1440-corrected.png).
- [Phone hero](knowledge-bridge/continuous/still-390-hero.png),
  [phone focus](knowledge-bridge/continuous/still-390-focus.png),
  [320px communication](knowledge-bridge/continuous/mobile-320-beat-3.png),
  [phone result](knowledge-bridge/continuous/still-390-corrected.png),
  [tablet](knowledge-bridge/continuous/responsive-768-1024.png),
  [no-JS fallback](knowledge-bridge/continuous/no-js-mobile.png).
- History [original](knowledge-bridge/continuous/history-1440-0.png),
  [midpoint](knowledge-bridge/continuous/history-1440-middle.png),
  [corrected](knowledge-bridge/continuous/history-1440-1.png),
  [touch midpoint](knowledge-bridge/continuous/history-390-middle.png).
- [Recorded entry, story and history](knowledge-bridge/continuous/continuous-scroll.webm)
  and [browser measurements](knowledge-bridge/continuous/browser-measurements.json).

Physical hardware, Safari/WebKit and screen-reader speech output are not tested.
Chromium measurements are local observations, not field-performance guarantees.
The existing deferred site/scene bundle-size warning remains outside this page's scope.
