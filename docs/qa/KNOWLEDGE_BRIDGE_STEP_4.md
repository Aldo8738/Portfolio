# Knowledge Bridge - Step 4: overload to focus

Implements the creator's Step 4 direction for the first graph chapter only.
The approved hero, navigation, contribution row, metric, later request/response
animation and checkpoint controls remain unchanged. This supersedes the topology
and Chapter 01 pacing in the [earlier review](KNOWLEDGE_BRIDGE_GRAPH_STORYTELLING.md).

The subsequent [composition refinement](KNOWLEDGE_BRIDGE_COMPOSITION_REFINEMENT.md)
strengthens the overloaded graph's visual weight, smooths neighboring curves and
records actual settled desktop/mobile bounds. Its approved focused composition
and scroll architecture remain the same.

## Findings and topology

The previous eight outer hubs reused the same seven direct leaf offsets. They
formed identical radial stars with few connections between neighborhoods.
The new graph retains 97 node identities and shows 12 labels on desktop. Mobile
uses 57 visible identities and the same 12 labels, with fewer contextual edges.

- Nine existing core nodes and three labeled geographical anchors form the primary
  hierarchy. Small dark dots retain the approved restrained scale.
- Supporting junctions use medium neutral contrast. Each neighborhood has its own
  authored silhouette, parent structure and number of branches.
- Peripheral points are smaller and lighter. Twenty-five bridges join the outer
  neighborhoods, existing core detail and semantic hubs. Cycles, chains and shared
  junctions replace the repeated spokes.
- North America, Mexico and Querétaro retain their parent relationships. Europe,
  France, Germany, Paris, Berlin, Cities and both landmarks keep their existing
  coordinates and paths. Only Querétaro and Berlin receive small magenta dots.
  No overload path uses magenta.

All positions are deterministic. Connections resolve stable endpoint IDs and use
precomputed cubic paths with restrained signed curvature. No runtime layout solver,
force simulation, dependency, WebGL renderer or per-frame path generation is added.
Mobile North America and Mexico labels are offset above their supporting points;
North America is inset to keep its full label inside the SVG viewport.

## Focus and pacing

One chapter timeline retains the existing reading/reveal handoff:

| Phase                                 | Chapter progress | Desktop scroll distance |
| ------------------------------------- | ---------------- | ----------------------- |
| Read                                  | 0-24%            | 0.96 viewport heights   |
| Text/graph handoff                    | 24-30%           | 0.24 viewport heights   |
| Inspect overload                      | 30-60%           | 1.20 viewport heights   |
| Focus                                 | 60-74%           | 0.56 viewport heights   |
| Inspect clean graph                   | 74-88%           | 0.56 viewport heights   |
| Move the settled graph into Chapter 2 | 88-100%          | 0.48 viewport heights   |

The chapter still occupies four desktop viewport heights within the existing 6.4
viewport story. The camera reframe begins first; outer context recedes from 62%
to 74%; relevant relationships gain contrast from 66% to 74%. The network then
holds without pulses, drifting nodes or moving connections. Forward and reverse
scrolling use the same geometry and timeline. No wheel events are intercepted.

The existing SVG viewBox provides the reframe and preserves the exact approved
clean viewport on each layout. Node transforms and path geometry never change
between dense and focused states. The SVG and its host retain the same parents.
Placement uses cached rectangles and ticker-batched writes, with measurements
refreshed on resize. No additional ScrollTrigger is created.

Phones retain natural scrolling. The chapter dock decreases from 200svh to 185svh,
removing trailing space while retaining the 1.5-viewport graph timeline. The focus
itself uses only 0.21 viewport heights. Reduced motion presents separate still
compositions with an instantaneous change; small primary dots also apply in its
overload state. JavaScript-disabled HTML retains the clean graph and chapter copy.

## Changed files

- `src/content/knowledge-graph.ts`: authored neighborhoods, hierarchy, semantic
  endpoint resolution and curved bridges.
- `KnowledgeGraph.astro`: one SVG with stable paths, node identities and tier classes.
- `graph-layout.ts`: responsive geometry cached during layout setup/refresh.
- `graph-motion.ts`: shorter coordinated focus, peripheral fade and contrast emphasis.
- `knowledge-bridge.ts`: phase labels and reduced-motion still-state marker.
- `knowledge-bridge.css`: graph hierarchy and shorter natural-scroll chapter dock.
- `tests/knowledge-bridge.test.ts`: graph connectivity, node count, label count,
  degree variation, endpoint contracts and responsive bounds.
- `tests/e2e/knowledge-bridge.spec.ts`: one atomic visible-label sample prevents
  stale locator indices while scroll-driven visibility changes. Readability
  assertions and the existing timeout remain unchanged.
- `tests/e2e/knowledge-bridge-chapter.spec.ts`: stable dense/clean holds, persistent
  geometry, label visibility, reverse scroll and reduced-motion states.

## Validation and limits

Formatting, ESLint, strict Astro/TypeScript checking, production build and frozen
GLB checksum/name validation pass. Astro reports zero errors, warnings or hints;
Vite retains its existing separate scene-bundle size warning. All 74 unit tests
pass across 18 files.

All 14 functional browser checks pass: six chapter tests and eight existing story,
resize/theme, no-JavaScript and checkpoint regressions. Required viewport sizes
1440x900, 1366x768, 1280x720, 390x844 and 375x667 are covered, along with smaller
phones, tablets and short landscapes. Dense and focused markup stays identical
during each inspection hold, including on reverse scroll; every node transform
and edge path is checked for continuity. Reduced motion is checked on desktop
and phone. An intermittent visible-label locator-index timeout was resolved by
sampling label visibility and font size atomically, with assertions unchanged.

Three additional profiling scenarios pass and are recorded below. The chapter
and story test files can be run with `npm run test:e2e -- tests/e2e/knowledge-bridge-chapter.spec.ts tests/e2e/knowledge-bridge.spec.ts`.

The approved hero and protected interaction files match session-start hashes.
The later human-AI timeline also matches the prior committed implementation after
normalizing line endings. Physical-device and assistive-technology manual review
remain outside the available Chromium lab environment. Performance sign-off is
limited by the mixed tail timings described below; no blanket no-regression
claim is made.

## Review captures

- [Desktop overload](knowledge-bridge/step4/desktop-overload.png)
- [Desktop focus transition](knowledge-bridge/step4/desktop-focus.png)
- [Desktop clean graph](knowledge-bridge/step4/desktop-clean.png)
- [Phone overload](knowledge-bridge/step4/mobile-overload.png)
- [Phone clean graph](knowledge-bridge/step4/mobile-clean.png)
- [Reduced-motion phone overload](knowledge-bridge/step4/reduced-mobile-overload.png)

Captures were visually inspected. Additional outer-to-core bridges near Germany/Berlin
are omitted in the mobile composition, and its two long landmark branches curve around the label area.
Core geography and its clean composition remain shared across all states.

## Paired scroll profile

Windows, Chromium 156.0.8078.4, local production preview, three runs per condition.
The existing profiler samples native wheel sweeps lasting 1.8 seconds per segment,
forward and reverse. Desktop uses 1440x900; short desktop uses 1280x600. The mobile
proxy uses 390x844 with 4x CPU throttling. These are rendering proxies, not physical
mobile/touch or field measurements. The natural-scroll mobile range is shorter
by design after removing trailing chapter space.

Each timing cell is the median of three run summaries for the forward story sweep:
median frame interval / 95th-percentile frame interval, in milliseconds. This is
not a pooled percentile.

| Profile       | Before median / p95 (ms) | After median / p95 (ms) | Dock reads before / after |
| ------------- | ------------------------ | ----------------------- | ------------------------- |
| desktop       | 16.7 / 33.4              | 16.7 / 49.9             | 0 / 0                     |
| short-desktop | 16.7 / 16.8              | 16.7 / 33.2             | 0 / 0                     |
| mobile-cpu4   | 233.4 / 983.3            | 16.7 / 66.6             | 0 / 0                     |

The desktop median cadence is unchanged, but some desktop tail samples are higher.
The CPU-throttled mobile baseline was extremely variable; the large apparent
improvement cannot be confidently attributed to this change alone. The short
focus still animates an SVG viewBox and retains some forced SVG layout/paint work.
No new scroll-frame docking reads were observed. These measurements do not prove
absence of a performance regression on hardware; real-device performance sign-off
remains a review limit.

[Per-run measurements](knowledge-bridge/step4/scroll-profile.json) preserve the
sample counts, forward/reverse results, layout/paint costs and long tasks. Raw
Chrome traces remain in the ignored `.cache/knowledge-bridge-profile/` folders.
To reproduce, set `KB_PROFILE_LABEL` and run
`npm run test:e2e -- tests/e2e/knowledge-bridge-performance.spec.ts`.
