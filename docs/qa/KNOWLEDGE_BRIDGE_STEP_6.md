# Knowledge Bridge Step 6: Human + AI

Implements the [Chapter 03 brief](../knowledge-bridge-step-6-human-ai-chapter.md).
The hero, dense/focused geometry, overload accents, metrics and checkpoint demo
are unchanged. Chapter 04's presentation and animation durations are retained;
its start moves later to allow Chapter 03 to breathe.

## Truthfulness and source evidence

This checkout contains the static portfolio and explanatory SVG, not the original
research frontend/backend. There is no original edit handler, HTTP endpoint or
WebSocket client here to inspect or verify. No live backend connection is added.

The [V3 brief, technical ground truth](../knowledge-bridge-codex-art-direction-mobile-v3.md)
records thesis sections 5.1-5.2: prioritized backend-to-frontend graph batches and
real-time updates use WebSockets. It explicitly requires `USER EDIT / API` for the
outbound edit unless original implementation evidence establishes its transport.
The [V4 brief](../knowledge-bridge-codex-final-implementation-v4.md) repeats that
contract. The illustration follows those supplied semantics without claiming
HTTP, WebSocket edit submission, model retraining or a live research backend.

The existing `knowledgeCorrection` definition already models Paris linked to
Germany before a human correction to France. This is an illustrative geographical
relationship, not a recorded product session or research dataset. It is reused
without moving the nodes or adding another graph. Visible copy identifies the
sequence as an illustrative recreation disconnected from the original backend.

## Presentation and ownership

The existing graph timeline contains one Chapter 03 child timeline. Its local
labels are `read`, `observe`, `correct`, `processing`, `respond` and `settled`.
It owns the relationship, temporary annotations and signals. Geometry is authored
once by `graph-layout.ts`; nodes remain stationary throughout the edit.

| Local range | Presentation                                                              |
| ----------- | ------------------------------------------------------------------------- |
| 0-8         | Graph recedes; centered Human + AI statement enters                       |
| 8-24        | Stable reading: AI proposes connections. People can refine them.          |
| 24-32       | Copy exits; the same graph returns with one proposed incorrect edge       |
| 32-48       | Stable inspection of Paris linked to Germany                              |
| 48-56       | Magenta human correction; incorrect edge recedes                          |
| 56-62       | Compact backend appears; one outbound USER EDIT / API signal              |
| 62-70       | Backend processing; no concurrent return signal                           |
| 70-74       | One backend-to-frontend WEBSOCKET / GRAPH UPDATE signal                   |
| 74-84       | Paris to France edge draws, temporary signals disappear, context restores |
| 84-100      | Stable corrected graph                                                    |

Forward and reverse motion seek the same nested timeline. The earlier chapter
controller uses absolute master time so extending Chapter 03 does not stretch
Chapters 01-02. The host remains the existing fixed SVG with cached dock geometry.
No simulations, React frame state, new controls, network requests or dependencies
are introduced. Existing matchMedia/context and ticker cleanup remain in use.

On pinned desktop the original master range before Chapter 03 remains 480vh,
including the approved initial 400vh sequence. Chapter 03 now gets 320vh instead
of 96vh. Chapter 04 keeps its original 64vh. Total pin travel is 864vh. The
pre-initialization CSS reserves that same travel for native scroll restoration.

Mobile and short viewports keep Chapter 03 text in normal flow, followed by a
240svh dock. Only the graph is held within that dock. The cached scroll mapping
advances the same chapter timeline after reading, then hands the graph to the
existing Chapter 04 dock. The compact mobile backend sits between the relevant
nodes, with separate annotation positions and no node movement. Reduced motion
uses a 65svh dock and a static before/edit/response/after explanation; that
explanation is also available without JavaScript and to assistive technology.

## Files

- `src/content/knowledge-bridge.ts`: approved Chapter 03 copy and static explanation.
- `KnowledgeBridgeCaseStudy.astro`: separate reading copy, natural-flow graph dock
  and illustration note; Chapter 04 markup retains its existing content.
- `KnowledgeGraph.astro`: existing proposal annotation separated from the backend
  layer; human correction and compact processing annotations.
- `graph-layout.ts`: Chapter 03 annotation and mobile backend geometry only.
- `graph-motion.ts`: nested Chapter 03 sequence and master-time mapping.
- `knowledge-bridge.ts`: absolute desktop time and cached natural-flow progression.
- `knowledge-bridge.css`: Chapter 03 presentation, accessible fallback and pin reserve.
- Root handoff and development plan: links to the Step 6 brief and these notes.

Component paths above are relative to `src/components/work/knowledge-bridge/`.

## Verification

No tests were added or run. No browser, screenshot or visual inspection was
performed, as explicitly requested. Forward/reverse behavior, viewport resizing,
all requested screen sizes, clipping/overlap, restored scroll and physical-device
performance remain unverified. Deterministic timeline ownership and authored
layout do not substitute for those checks. No FPS or performance improvements
are claimed. Changed-file formatting, ESLint and `git diff --check` pass. The production
build includes Astro / TypeScript checking with zero errors, warnings or hints
and emits ten static pages. The existing large JavaScript chunk warning remains.

## Ending label and metric alignment

The creator confirmed the final chapter order: Hero, 01 Overload, 02 Focus,
03 Human + AI, 04 Engineering / Impact. The existing ending now reads
`04 / THE ENGINEERING`. The two result columns align on their first numeric
baseline and use consistent numeric line height; their sizes, wording and values
remain unchanged. No other labels, sections or timing are changed in this pass.
Tests and visual inspection remain omitted at the creator's request.

## Final structure: remove the standalone version-history section

The creator subsequently removed `02 / MODEL VERSION CONTROL`, including the
Every change has a history heading, description and checkpoint demo. The page no
longer imports the demo or mounts its history controller. Chapter 03 now leads
directly into the existing Engineering / Impact ending. Hero, Chapters 01-03,
metrics and story timing are unchanged. The earlier notes about preserving the
checkpoint demo describe the initial Step 6 scope and are superseded here.

The creator also removed the redundant `04 / 04` story copy, including Less
waiting. More exploring. and its 81.5% benchmark sentence. Its empty layout dock
remains as the existing scroll/graph-placement anchor, preserving the graph and
ending transition. The separate `04 / THE ENGINEERING` section and metrics remain.

## Simplified correction ending

The creator subsequently removed every backend/signal step after the human
correction. The incorrect relationship now recedes at local time 54-56; Paris
reconnects to France at 56-62 while supporting context restores alongside it.
The fixed graph then holds through time 100. No outbound edit packet, processing
indicator or WebSocket return is animated. The static explanation and SVG
accessible description reflect the simplified sequence. Existing chapter scroll
travel, earlier scenes and the Engineering ending remain unchanged. This update
supersedes the processing/response ranges and visible transport explanation above.

After the reconnection finishes, the creator-requested `AI LEARNS` label appears
in the same style and location as `HUMAN CORRECTION`. It enters at local time
62-64, holds over the fixed graph, and exits at 96-100 before the ending. It uses
the existing timeline and reverses with it. Reduced motion shows the label at the
Chapter 03 graph dock; the static explanation includes the same message. This is
illustrative feedback wording, not a new claim of live model retraining.

The creator removed the repeated `8.47s -> 1.57s` metric beneath the story graph.
Its markup, reveal tween and dedicated styling are removed. The final
`04 / THE ENGINEERING` comparison remains unchanged. The hero keeps its 81.5%
headline metric and dataset caption, but omits the duplicated timing comparison
so `8.47s -> 1.57s` appears only in the final Engineering section.

## Direct Focus to Human + AI transition

The creator removed the remaining legacy Chapter 02 viewport/priority sequence
and rightward movement. Chapter 02 now contains only the approved dense-to-simple
transformation and its existing stable focused hold. The graph stays in the
centered focus dock; Chapter 03's text follows immediately through the existing
fade. No viewport frame, priority packet, extra dimming or peripheral-detail
reappearance is animated afterward.

The old right-side story figure, empty copy dock and final handoff are removed.
Natural scrolling uses only the dense, focus and Human + AI docks; the graph then
leaves with its chapter rather than moving into another destination. The figure
metadata remains above the centered graph, and the illustration note sits below
it during Chapter 03. Node geometry, dense-to-focused motion, Human Correction,
reconnection and AI LEARNS sequence remain unchanged.

Pinned travel is now 720vh: the existing initial 400vh followed directly by the
existing 320vh Human + AI chapter. Both the 80vh legacy viewport sequence and the
64vh obsolete final graph tail are gone. The CSS restoration reserve matches
720vh. The Engineering section follows in normal flow. This supersedes earlier
864vh timing and retained-right-side-dock notes in this document.

No tests or visual inspection were performed, as requested. Forward/reverse
scrolling, resizing and device performance still require the creator's review.
