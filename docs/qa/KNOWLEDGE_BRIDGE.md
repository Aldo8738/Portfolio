# Knowledge Bridge V4 implementation review

This is the historical V4 review. The later [continuous-scroll implementation](KNOWLEDGE_BRIDGE_CONTINUOUS.md)
supersedes its gaming example and Flip reparenting; earlier screenshots remain evidence
of that revision, not the current page.

Implemented from the [final V4 brief](../knowledge-bridge-codex-final-implementation-v4.md)
and [approved reference](../knowledge-bridge-approved-reference.png). The creator's
subsequent instruction enlarges the graph and removes the visible Figure 01
illustration caption; this intentionally supersedes that caption requirement in
V4. Its accessible SVG description still identifies the artwork as illustrative.
The separate model-history recreation disclosure remains visible.

The existing typeface, hero copy, single 81.5% hero counter, information strip,
shared navigation, themes, footer and four-part page anatomy are preserved.
Other project pages and the frozen taquería/GLB are unchanged by this revision.

## One network, not four diagrams

`knowledge-graph.ts` holds semantic IDs, core desktop/mobile positions, relationships
and the shared Skyrim / Sports / RPG correction. Its 64 quiet peripheral points
and curved links are deterministic arithmetic evaluated once, not a force simulation.
Seven primary labels carry the hierarchy; peripheral detail adds the organic
scientific-illustration character of the reference. No glow, blur or new typeface.

`KnowledgeGraph.astro` renders exactly one living-graph SVG. On wide screens that
same DOM instance begins in the hero's right column. The metric occupies a separate
clear zone below it. GSAP Flip moves the existing host into Figure 01 before the
pin, then back to the hero when reversing above the entry threshold. Reserved
slots prevent layout collapse; the graph is not cloned. Short/tablet layouts begin
with the network at the figure entrance. No reference bitmap is loaded by the page.

The larger editorial column is about 71% of the story composition. A tighter
viewBox uses its space for the network, gently widening only for the communication
paths. The SVG stays within its reserved canvas and never runs behind hero text,
metrics, navigation or the contribution strip.

The creator clarified that the open desktop right column should be used even
without pinning. Desktop geometry now depends on available width rather than
whether animation can pin: reduced-motion and short desktop windows retain the
wide network instead of the compact phone composition. Their canvas also uses
the available column width and viewport height rather than the phone height cap.
Normal-flow captions remain visible in these unpinned layouts.

## Scroll choreography and mobile

Wide screens (1100px+, height at least 650px) have one main scrubbed, reversible
ScrollTrigger timeline, with 210vh of additional scroll. Safe tablets (768–1099px,
height at least 850px) use one column and 180vh. Short landscape uses no GSAP pin.

The same graph opens into peripheral complexity, draws/moves a viewport and softens
distant detail, then follows a causal selection/edit/backend/update sequence.
USER EDIT / API goes from UI to backend; WEBSOCKET / GRAPH UPDATE returns from
backend to UI. The original Sports relation remains until the response arrives,
then fades as the RPG edge draws. Finally the graph calms and the actual fixed
8.47s to 1.57s comparison reveals. No interpolated timing values are presented as
new measurements, and no full-retraining simulation or network request is implied.

On phones the existing SVG changes to a compact 400×360 composition from the same
model. It then repositions the same Skyrim, Sports and RPG groups into the simpler
communication layout, returning them afterward. There are no separate mobile SVGs
or manual slide controls. One short unpinned timeline follows four normal-flow
captions. A bounded, compact CSS-sticky canvas accompanies those captions; it is
not a full-screen pin, creates no pin spacer and adds no artificial scroll distance.
The complete story is tested below 250vh even at 320×568. A height-aware reading
anchor and short-phone canvas cap keep sampled active headlines clear of the art.

Meaningful mobile labels render at least 12 CSS px in the smallest viewport. Text
remains normal HTML. Inactive pinned captions are visually softened with opacity,
not removed from assistive technology. Reduced motion disables pinning, transfers,
packets and large transforms; the one static corrected graph and all four captions
remain readable. No-JS uses the same authored graph and final research figures.

## Continuous model history

Figure 02 is a crisp focused relationship, not a second constellation. Its semantic
entity and classifications come from the living graph model. `history-state.ts`
returns the exact edge curve and moving endpoint for any clamped progress value.
The native labeled range input directly interpolates between Sports (0) and RPG (1).
Intermediate geometry is visibly labeled an illustrative transition, never a saved
checkpoint. The version buttons and Restore action animate the same progress over
320ms, or change instantly with reduced motion. They also update the range value.

The SVG description, moving endpoint, curve, caption, version selection and native
aria-valuetext stay synchronized. Live announcements occur on committed range
changes or completed version selection, not on each pointer movement. The input's
44px touch area, keyboard Home/End/arrows, actual mouse drag and Chromium touch
protocol drag are verified. Both endpoint states and an intermediate curve differ.

## Results, lifecycle and files

The ending emphasizes 8.47s to 1.57s, with 81.5% as a normal-size finish-time label.
The smaller secondary result remains 72.4% (4.82s to 1.33s, 600-item Reddit).
The method note identifies controlled Chrome comparisons averaging ten graph
creations per dataset condition. These are retrospective supplied thesis figures,
not live portfolio benchmarks. No genuine thesis PDF or Focus screenshot exists
at a verified project path, so neither optional link/image is invented.

Scoped GSAP contexts own the timeline and Flip transfers. Media changes revert
motion and restore mobile/static geometry; pagehide/Astro cleanup disposes event
listeners, history tweens, hero animation and triggers. BFCache pageshow remounts
through the guarded initializer. Font readiness refreshes trigger positions. No
new dependency, framework island, WebGL, post-processing or perpetual RAF loop.
GSAP Flip is part of the already-installed GSAP dependency.

Changed files:

- `src/content/knowledge-graph.ts`: shared organic geometry, mobile coordinates and
  before/after relationship semantics.
- `KnowledgeGraph.astro`, `graph-layout.ts`, `graph-motion.ts`: one SVG, responsive
  geometry, staged animation and native packet sampling.
- `knowledge-bridge.ts`: shared-host transfer, breakpoint behavior and cleanup.
- `CheckpointDemo.astro`, `history-state.ts`, `history-controller.ts`: native range,
  pure interpolation and synchronized local history controls.
- `KnowledgeBridgeCaseStudy.astro`, `knowledge-bridge.css`: larger graph, hero docking,
  removed caption, focused history layout and stronger typographic results.
- `src/content/knowledge-bridge.ts`: exact V4 copy and concise methodology.
- Removed V3 `MobileGraph.astro` and `mobile-motion.ts`; no duplicate figure instances.
- Knowledge Bridge unit/browser tests and linked handoff/development/QA documents.

## Verification

All **21 Chromium browser tests** pass across Knowledge Bridge, existing case
studies and the Work exhibition, including the enlarged layout and removed caption.
After the desktop-column correction, all eight Knowledge Bridge browser tests
pass again, including new 1920×900 reduced-motion and 1920×600 unpinned checks.
Formatting, ESLint, strict build/typecheck, all **70 unit tests** and the frozen GLB
checksum/name contract pass. Active mobile-heading bounds are explicitly checked
so the compact canvas does not cover the sampled stage title.
The final production build emits ten static pages with zero Astro errors, warnings
or hints. The existing deferred site/scene Vite chunk-size warning remains.

The browser matrix includes 320×568, 375×812, 390×844, 430×932, 768×1024,
768×700, 844×390 landscape, 1280×800, 1440×900 and 1920×1080. Checks cover DOM
identity across hero/story transfer, all four actual SVG states, forward/reverse
scrubbing, causal packets and edge replacement, mid-story reload, continuous
slider geometry, touch/mouse/keyboard, reduced motion, theme switching, skip-link
focus, navigation/revisit cleanup, benchmark correctness and no horizontal overflow.

Physical-device performance and screen-reader speech output were not tested.
Automated Chromium evidence does not establish field-performance guarantees.
Previous V1–V3 captures remain historical; V4 evidence is stored separately.

Reviewed V4 evidence:

- [Hero, 1440px](knowledge-bridge/v4/hero-1440.png),
  [broad network](knowledge-bridge/v4/desktop-1440-beat-1.png),
  [focus](knowledge-bridge/v4/desktop-1440-beat-2.png),
  [human edit and response](knowledge-bridge/v4/desktop-1440-beat-3.png),
  [resolved result](knowledge-bridge/v4/desktop-1440-beat-4.png).
- [Mobile hero](knowledge-bridge/v4/mobile-hero.png),
  [mobile graph](knowledge-bridge/v4/mobile-390-beat-1.png),
  [mobile focus](knowledge-bridge/v4/mobile-390-beat-2.png),
  [mobile communication](knowledge-bridge/v4/mobile-390-beat-3.png),
  [mobile resolution](knowledge-bridge/v4/mobile-390-beat-4.png),
  [mobile results](knowledge-bridge/v4/mobile-results.png),
  [320px communication](knowledge-bridge/v4/mobile-320-beat-3.png).
- History: [original](knowledge-bridge/v4/history-1440-0.png),
  [intermediate](knowledge-bridge/v4/history-1440-middle.png),
  [correction](knowledge-bridge/v4/history-1440-1.png),
  [mobile original](knowledge-bridge/v4/history-390-0.png),
  [mobile intermediate](knowledge-bridge/v4/history-390-middle.png),
  [mobile correction](knowledge-bridge/v4/history-390-1.png).
- [Tablet](knowledge-bridge/v4/responsive-768-1024.png),
  [short landscape](knowledge-bridge/v4/responsive-844-390.png),
  [no-JS mobile](knowledge-bridge/v4/no-js-mobile.png).
- Desktop column correction: [reduced motion](knowledge-bridge/v4/desktop-unpinned-reduced.png)
  and [short desktop window](knowledge-bridge/v4/desktop-unpinned-short.png).
