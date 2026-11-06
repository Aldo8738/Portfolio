# Knowledge Bridge - Step 3B: focused Chapter 1

## Scope and direction

Only Chapter 1 receives the sequential storytelling pattern. Chapters 2-4 retain
three existing split-screen explanations and their authored graph actions. The
version-control section, content, theme tokens, font stack and other pages are
unchanged. The reference is the focused pacing of
[Apple AirPods Pro](https://www.apple.com/de/airpods-pro/), not its visual identity.

The previous implementation displayed an active explanation beside an evolving
graph. Both demanded attention at once. Chapter 1 now separates reading from
inspection: centered text, a brief handoff, a centered still graph, then an exit
back into the existing Chapter 2 presentation.

## GSAP structure and distance

The existing entry timeline and single desktop story pin remain. No nested pin,
wheel interception, new dependency or independent animation loop was added.
The story timeline allocates its first 62.5% to Chapter 1. On desktop, its total
additional scroll is 360vh, so Chapter 1 occupies **225vh** and chapters 2-4 retain
135vh combined, matching their previous desktop allocation.

Chapter 1 uses these relative intervals:

- 0-36%: fully readable, centered text; graph hidden.
- 36-44%: the whole explanation fades together.
- 44-48%: brief handoff with no competing readable labels.
- 48-56%: one whole-graph reveal.
- 56-94%: still graph; no node, label, path or packet movement.
- 94-100%: short fade through an invisible change from the centered dock to the
  existing right-column dock. Chapter 2 follows in its current composition.

During the hero entry, a cached measurement of Chapter 1's first text block
clears the small graph before that block enters its reading area. This prevents
the hero graph from lingering over the natural mobile explanation.

The graph remains one SVG in its permanent scene layer outside the pinned stage.
Its geometry is prepared by the existing hero entry, then held static during
Chapter 1. Host opacity has one writer in the existing queued placement pass;
separate timelines do not compete over it. Cached rectangles are refreshed on
layout changes. The existing 0.2-second scrub remains.

The longer pin exposed a native history-restoration issue: removing its spacer
on pagehide could clamp the saved scroll position to the shorter document.
JavaScript-enabled, pin-eligible layouts now reserve the same 360svh before setup
and before teardown. The existing case-ready flag transfers this space to the
real spacer. Route-scoped scroll anchoring is disabled so that transfer does not
shift the viewport. No custom scroll storage or restoration timer is introduced.

## Responsive and accessible behavior

Wide screens at least 650px tall and safe portrait tablets use the bounded pin.
Phones and short viewports use natural stacked reading: the full Chapter 1 text
stays in document flow above the graph. It never fades. A short, unpinned reveal
tracks the graph entering view; later captions retain their existing scrolling
presentation. There is no added mobile pin distance.

Reduced motion uses static content without scrub or pin. Without JavaScript,
the explanation precedes the authored graph and the remaining explanations remain
HTML. Existing history controls and native page scrolling are preserved.

The hero remains content-driven. Its metadata table shares the copy's fade and
desktop scroll compensation. The reading boundary still waits until the metadata
has been presented. Earlier Step 3A label-clearance fixes are retained.

## Changed files

Production files under `src/components/work/knowledge-bridge/`:

- `KnowledgeBridgeCaseStudy.astro`: Chapter 1 explanation and centered graph dock.
- `knowledge-bridge.css`: centered desktop scene, natural/static fallback and pin-space reservation. Other project pages do not load this case's stylesheet.
- `graph-motion.ts`: stable reading intervals, one reveal and remapped later actions.
- `knowledge-bridge.ts`: cached placement, one opacity writer, responsive reveal, coordinated hero/table handling and scroll-preserving teardown.
- `story-state.ts`: focused chapter boundaries.
- `KnowledgeGraph.astro` and `graph-layout.ts`: carried-over Step 3A backend clearance.

Tests: `tests/knowledge-bridge.test.ts`, `tests/e2e/knowledge-bridge.spec.ts` and `tests/e2e/knowledge-bridge-performance.spec.ts`. The current continuous-scroll review links here; the Step 3A review is marked as a superseded experiment.

## Validation

- Formatting, ESLint and strict Astro/TypeScript checks pass (143 files, zero errors, warnings or hints).
- All 72 unit tests pass. The frozen GLB node/name contract passes.
- Production build emits ten static pages. Vite retains its existing large-chunk advisory.
- All 13 Knowledge Bridge Chromium regression cases pass, including history input, reduced motion, no JavaScript, refresh, reverse scroll and responsive resize.
- All three profiling scenarios complete three native-wheel sweeps each. The final route-only CSS also passes the focused-chapter and native-reload reruns.
- Build-output checks confirm the other three project pages do not load this case's CSS.

Chapter 1 and hero-reading coverage includes 1440x900, 1366x768, 1280x720, 390x844, 375x667 and 1280x600. Additional regression coverage includes safe tablets, short landscape, 320px phones and 1920px desktops. Each focused desktop graph interval checks unchanged SVG markup and visible important labels. Reverse scroll restores the text; reload checks the saved scroll position within two CSS pixels.

Inspected evidence: [centered text](knowledge-bridge/focused-step-3b/chapter-text-1440.png), [still graph](knowledge-bridge/focused-step-3b/chapter-graph-1440.png), [375x667 natural reading](knowledge-bridge/focused-step-3b/chapter-natural-375-667.png).

### Profiling limits

Chromium 156.0.8078.4 on Windows, device scale factor 1; 1800ms per forward or reverse segment. The mobile-sized scenario uses 4x CPU throttling, not physical touch hardware. All nine recorded sweeps contain **zero graph-dock layout reads**. The existing cached-placement optimization is retained. The final desktop runs recorded zero long tasks; throttled mobile remains a rendering proxy. Frame cadence varied across the runs; they do not establish a 60 FPS result or a performance improvement against an identical baseline build.

| Scenario                  | Story-forward median range | Story-forward p95 range | Long tasks per run |
| ------------------------- | -------------------------: | ----------------------: | -----------------: |
| Desktop 1440x900          |                     16.7ms |             16.7-33.4ms |                  0 |
| Short desktop 1280x600    |                     16.7ms |             16.7-16.8ms |                0-1 |
| Mobile-sized CPU4 390x844 |                     16.7ms |                  33.4ms |               1-10 |

Saved reports: [desktop](knowledge-bridge/focused-step-3b/profile-desktop.json), [short desktop](knowledge-bridge/focused-step-3b/profile-short-desktop.json), [mobile-sized CPU4](knowledge-bridge/focused-step-3b/profile-mobile-cpu4.json). Raw traces remain in ignored `.cache/knowledge-bridge-profile/chapter-one-final/`.

Physical mobile hardware, Safari and compositor-level frame delivery remain unverified. No later chapter receives the new storytelling pattern.
