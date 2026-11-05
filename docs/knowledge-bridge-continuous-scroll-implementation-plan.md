# Knowledge Bridge — Continuous Graph Experience

## Codex implementation plan · November 2026

**Task type:** Refine the existing `/work/knowledge-bridge` page, not a site redesign.

**North star:** A minimalist hero containing a single relationship evolves **without a cut** into the same living graph. The hero copy recedes, the graph expands, and one contextual explanation at a time appears on the left. Visitors see the problem, understand the performance architecture, observe a human correction and backend response, and can rewind the resulting graph state.

> **Non-negotiable:** Preserve the established ALDO identity. Reuse the **actual existing font files and typography classes, color tokens, magenta accent, cream background, navigation, footer, responsive conventions, spacing rhythm, and contribution/technology table**. Do not approximate the font from a generated mock. Do not re-skin other portfolio pages.

## 0. First inspect the existing implementation

Before editing, identify:

- Existing Astro/React page structure, route, component hierarchy, style tokens, global layout, mobile navigation, and current GSAP/ScrollTrigger setup.
- Existing graph data and its renderer. Identify whether there are duplicated hero, scroll, and checkpoint graph implementations.
- Existing accessible controls, `prefers-reduced-motion` handling, theme variants, and installed dependencies.
- Current layout and animation behavior at desktop and mobile widths, with screenshots or recordings.

**Output of this phase:** a short note in the PR/summary identifying files to change and what will be preserved. Make targeted edits; do not refactor unrelated components.

## 1. Content and layout: keep it concise

Maintain four major sections only:

1. **Hero**: `Knowledge Bridge.` / `Making AI-generated knowledge human-friendly.` / a short, truthful one- or two-sentence contribution / `81.5% reduction in graph finish time` / the existing **CONTRIBUTION** and **FOCUS & TECHNOLOGIES** two-column metadata row.
2. **Living graph**: one animated visual and one active explanation, scroll-driven on desktop.
3. **Model history**: a compact, functional, touch-friendly saved-state comparison using the same relationship data.
4. **Engineering results**: prominent `8.47s → 1.57s`, contextual `81.5% reduction in graph finish time`, and secondary `72.4% shorter page load time` with exact test qualifiers and a link to the thesis if available. Keep project navigation/footer.

Do not add a separate conventional text-heavy problem/approach section, slideshow buttons, long technology explanations, gratuitous charts, or additional case-study sections.

**Scientific accuracy:** The world-knowledge example is an **illustrative portfolio recreation**, NOT the thesis benchmark dataset or the original Focus UI. Preserve the measured benchmark context: 8.47 s → 1.57 s is graph finish time for the 100-item Reddit test. The 72.4% claim refers to page load time in a different 600-item Reddit test, not user task completion. WebSockets are used for prioritized backend-to-frontend graph updates; label outbound correction as a user edit/API request instead of asserting that all user edits use WebSockets.

## 2. Lock the visual direction before animating

**Visual language:** scientific editorial / generative drawing, not SaaS dashboard. Warm cream, strong black text, exact ALDO typeface, hairline gray network connections, almost no shadows, and magenta only for the current human correction or a meaningful interaction state. No neon glow, pink gradients, floating feature cards, decorative UI chrome, or random line crossings.

**Desktop hero composition:**

- Left: current large title, subtitle, concise description.
- Right: a **small, calm two-node composition** — `Paris` and `France`, with one restrained neutral connection. Do **not** fill the hero with a full constellation. Put the result metric in its own clear space, never atop graph lines.
- Keep the contribution/technology row beneath the hero.
- Graph drawing is a narrative illustration, not a fake live backend.

**Living graph composition:** deliberately place ~8–12 named primary nodes and a restrained number of fine secondary nodes. Example subjects: `Europe`, `France`, `Germany`, `Paris`, `Berlin`, `Eiffel Tower`, `Brandenburg Gate`, `Cities`, `Landmarks`. Use readable, general-purpose labels. Keep a stable coherent spatial relationship; do not generate a random force simulation on every reload. Keep edge endpoints attached to nodes, avoid crossing labels, and remove decorative clutter.

**Responsive graph:** mobile uses the same semantic node/edge model and active relationship but a separately authored compact layout, not a scaled-down screenshot of the desktop graph.

### Visual approval gate

Before adding detailed motion, verify **three still states** at desktop (hero, expanded/focused graph, corrected graph) and **two mobile states** (hero, focused graph). Each must look strong and understandable with animations disabled. If not, refine geometry before proceeding.

## 3. Architecture: one persistent living graph

Create a typed graph model (nodes, relationships, label priority, variants) that is shared by hero, scrollytelling, and checkpoint data. Prefer a lightweight SVG or Canvas renderer; WebGL only if the desired rendering cannot be accomplished smoothly otherwise.

**Critical:** Avoid separate hero and scroll graph components crossfading. Implement **one persistent graph instance** (e.g., a scene layer with layout targets, or GSAP Flip/coordinate interpolation) that changes its geometry and reveals new nodes as the scroll progresses. Avoid DOM reparenting during a pinned scroll that causes hydration issues. Preserve node IDs/edge IDs across phases and animate positions, opacity, stroke weight, and path geometry deliberately.

Use deterministic coordinates. Centralize all scene stages/config values so desktop and mobile produce the same story. Dispose of ScrollTriggers, animation contexts, and observers on unmount. Avoid triggering expensive React rerenders each scroll frame; GSAP should animate stable scene elements or imperative renderer properties.

## 4. GSAP choreography (desktop)

Implement one scrollytelling sequence with `ScrollTrigger` (`scrub` and carefully scoped pinning) and an explicit entry-to-exit timeline. It must work both forward and backward, including page refresh at an intermediate scroll position.

| Timeline                | Visual behavior                                                                                                                                                                                                                                                                                                 | Active explanatory copy                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **A. Hero (entry)**     | A small Paris–France relation is on the right. Hero copy, 81.5% metric, and metadata are fully legible.                                                                                                                                                                                                         | Hero text only.                                                                                                         |
| **B. Transition**       | As scroll begins, hero title/subtitle/metric softly fade or travel upward; **the same graph persists** and expands toward the center/right, retaining recognizable Paris/France anchors while other general-knowledge nodes emerge.                                                                             | No awkward duplicate text during crossover.                                                                             |
| **C. Overload**         | Network becomes visibly dense with secondary relationships; deliberate layout, not tangled spaghetti.                                                                                                                                                                                                           | **Everything, all at once.** Large graphs were expensive to load and hard to explore.                                   |
| **D. Focus**            | Unimportant nodes/edges fade to light gray. A compact visible region/focus cue (prefer hairline corners over a big pink debug rectangle) isolates relevant structure. Show nodes arriving progressively.                                                                                                        | **Render what matters.** Viewport-aware rendering and prioritized streaming keep the interface responsive.              |
| **E. Human ↔ AI**       | Highlight the **illustrative incorrect** proposed `Paris → Germany` relationship; a human correction changes it to `Paris → France`. Animate the outbound user edit toward an unobtrusive backend indicator, then a **returning WebSocket graph update**. Only after the return does the corrected edge settle. | **A two-way conversation.** Humans refine relationships; the backend processes feedback and streams updated graph data. |
| **F. Result / release** | The corrected graph resolves into a calmer composition; `8.47s → 1.57s` appears with no misleading number roulette. The pinned scene releases naturally into model history.                                                                                                                                     | **Less waiting. More exploring.** 81.5% shorter graph finish time in the 100-item Reddit benchmark.                     |

**Active copy:** only ONE current heading/paragraph is prominently visible alongside the graph at a time. Do not stack four equally prominent headlines. Keep the left explanation ~25–32% width, the graph ~68–75%, with a balanced focal point. Desktop scroll duration should feel concise rather than an endless cinematic hold; tune to real viewport dimensions and test reverse scrolling.

**Optional tiny direct interaction:** selecting a major node can show a concise contextual label in-place, but it must not interrupt scroll story or require hover. Do not add feature bloat.

## 5. Model history: a tactile continuation, not another graph slideshow

Continue visually from the corrected edge rather than introduce a second full constellation. Use a clean, magnified `Paris → Germany` / `Paris → France` relationship with a horizontal **semantic range control** for `v01 · Original` and `v02 · Human correction`.

- Dragging or keyboard-operating the slider morphs the edge between the incorrect and corrected destinations; the prior edge recedes while the corrected edge draws in. The midpoint shows an obvious transitional state.
- The version labels, selected state, summary text, and highlighted relationship stay synchronized.
- Offer a functioning `Restore original` action and the ability to return to `v02`. No decorative buttons.
- Explicitly label this as an **illustrative local reconstruction**, not connected to the research backend.
- No fake network activity or claim of live AI inference; animations are a representation of the original product behavior.
- Keep it compact on desktop and mobile: relationship graphic, control, two large touch-friendly state labels, one concise state description.

## 6. Mobile-specific design (not a shrunk desktop)

- **Target widths:** 320, 360, 375/390, 430 px, plus 768, 1024, 1440 and a wide desktop.
- Reuse the site's established mobile header/navigation pattern. Never squeeze all desktop nav links into a single narrow row.
- Hero: stacked copy, one modest graph motif, metric and contribution/technology metadata in logical order. No graph overlapping text.
- The hero graph transforms into a mobile-composed graph with fewer visible secondary nodes. Keep primary labels readable; do not place text over crossing edges.
- Prefer natural page scrolling with short, scroll-linked reveal transitions **without long pinning or scroll traps**. Ensure graph and current explanation remain spatially associated. No four long consecutive text blocks detached from the visual.
- Model history: large touch targets (≥44 CSS px), usable range slider, direct taps on each version, visible focus rings, keyboard support, and no hover-only feature.
- No horizontal overflow. Respect safe areas, orientation changes, dynamic address bars, and font resizing.
- `prefers-reduced-motion`: no pinning, no scrub, no mandatory motion. Present a readable static graph, step explanation, and functioning checkpoint control.

## 7. Performance and accessibility guardrails

- Keep first paint quick. Load hero text as ordinary HTML; do not block it on the visualization or heavy JS.
- Animate transforms, opacity, and efficient SVG/path properties. Use bounded secondary node counts and static or prerendered fallback states. No unbounded physics or continuous animation when offscreen.
- Lazy-load scrollytelling logic where sensible and respect reduced motion and low-capability devices.
- Keep contrast adequate for key labels; pale gray is for background relationships, never for meaningful text.
- Ensure graph meaning is also available via structured accessible text, and checkpoint controls have accessible names and feedback.
- No scroll jumping, reflow loops, ScrollTrigger pin spacer bugs, stuck scroll, or interaction overlays blocking navigation.

## 8. Implementation order and review gates

1. **Audit & baseline** — identify route files/components, take current viewport screenshots, verify data/metric copy; preserve existing branding.
2. **Graph model & still compositions** — create deterministic shared data and desktop/mobile positions. Validate static visual quality at all checkpoints.
3. **Hero → graph continuity** — implement the persistent graph and GSAP Flip/geometry transition. Verify that Paris and France never disappear/crossfade into another duplicate renderer.
4. **Scrollytelling** — implement overload → focus → human edit → backend response → corrected result with one active explanatory panel. Test backward scroll and reload mid-timeline.
5. **Checkpoint tool** — implement real slider state, edge morph, restored state, keyboard/touch behavior.
6. **Responsive & accessibility polish** — implement no-pin mobile experience, reduced motion, navigation, layout, focus treatment.
7. **Visual polish and measurements** — adjust spacing, chart contrast, stage readability, frame rate, layout stability; avoid changing global design tokens.

**Do not claim completion after step 2 or after GSAP has merely been installed.** Show evidence the actual browser interactions run correctly.

## 9. Acceptance checklist — must pass

- [ ] Existing ALDO font, colors, nav, cream background, footer, contribution table, and other pages remain unchanged.
- [ ] Hero is minimalist; no full constellation or graph lines overlapping the metric or copy.
- [ ] The hero's Paris–France relationship physically persists into the main graph; not duplicated as a replacement scene.
- [ ] One active left-side explanation is visible on desktop; it changes in sync with the pinned graph.
- [ ] Overload, focus, correction, WebSocket return, and results are distinguishable even when paused.
- [ ] User-edit/API request and inbound WebSocket update are labeled correctly; the corrected edge changes after the response.
- [ ] The checkpoint range control **really morphs** the relationship and can restore either saved state using mouse, touch, and keyboard.
- [ ] The main graph looks art-directed: intentional silhouette, readable labels, few crossings, restrained meaningful magenta.
- [ ] Mobile has no long pinning, no horizontal overflow, readable copy, graph-coupled explanations, and ≥44px touch controls.
- [ ] Reduced motion is usable and complete; no content hidden behind animation.
- [ ] Benchmark text is correct: `8.47s → 1.57s` graph finish / 100-item Reddit; `72.4%` load time / 600-item Reddit; no “72% faster task completion.”
- [ ] Test real Chrome/Safari or equivalent devices: desktop 1440×900 and 1920×1080; mobile 360×800, 390×844, 430×932; tablet 768×1024. Confirm normal/reverse scroll, direct navigation, refresh mid-scroll, theme variants, and checkpoint state after resize.
- [ ] No console errors, hydration issues, runaway listeners, costly offscreen motion, or large layout shifts.

## 10. Codex delivery format

At completion, report: **(a)** exact files changed, **(b)** short explanation of graph continuity mechanism and ScrollTrigger setup, **(c)** responsive and reduced-motion differences, **(d)** manual/browser tests run and outcome, **(e)** anything unfinished. Include desktop/mobile screenshots and, ideally, a short recording demonstrating hero → graph expansion and checkpoint scrub.

### Copy-ready task instruction

> Follow `knowledge-bridge-continuous-scroll-implementation-plan.md` to refine the existing Knowledge Bridge page. Inspect the existing layout first; preserve the actual ALDO design tokens, font, header/footer, and other pages. Implement **one persistent** graph that evolves from the minimalist Paris–France hero into the living graph, with GSAP scroll-synced active explanations, a technically accurate human correction + backend/WebSocket return, and a functional touch-friendly checkpoint scrub. Treat mobile as a separately designed natural-scroll experience. Do not replace this with multiple SVG illustrations, slideshow buttons, or additional text sections. Validate visually and functionally in a real browser before reporting completion.
