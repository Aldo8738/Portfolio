# Knowledge Bridge — FINAL Codex Implementation Brief (V4)

**Task:** Implement the **approved Knowledge Bridge visual direction** in the **existing portfolio codebase**, not another redesign. Preserve the portfolio's established identity, create one elegant living-graph scroll experience, connect it to a meaningful model-history interaction, and ensure the entire experience is excellent on mobile.

**Visual reference:** `knowledge-bridge-approved-reference.png` (attach the image alongside this file when asking Codex to work). This is an **art-direction target**, **not a pixel-perfect specification**: correct its areas of clutter and do not reproduce decorative glow. Favor the actual site's design tokens and typography over the mock if they differ.

**Non-negotiable:** Implement in code. Do not return only plans, static mockups, a carousel of four slides, or four separate SVG diagrams. The requested GSAP choreography must be tested in a real browser before claiming it is complete.

---

## 0. Before writing code: audit the existing implementation

1. Locate the current Knowledge Bridge page, graph visualization, checkpoint interaction, site-wide design tokens, `ALDO.` navigation, footer, sauce/theme variants, and shared styles. **Do not assume file names or framework architecture.**
2. Determine which elements already work and preserve them. Reuse existing React/Astro/TypeScript conventions and installed GSAP integration, where available.
3. Inspect the actual typography, spacing, colors, and breakpoint conventions of the current `/work` pages, including the current Knowledge Bridge hero. **Do not introduce a new typeface.**
4. Check existing behavior on desktop and mobile, including whether ScrollTrigger is currently present, initialized, scoped, and cleaned up. Fix any broken implementation instead of layering new components over it.
5. Confirm that benchmark content matches the thesis values listed below. Check existing PDF/thesis links or original screenshots before reusing them; do not invent links.
6. Keep this change scoped to Knowledge Bridge and truly shared fixes (e.g. skip-link accessibility). Do not redesign the entire portfolio or break theme switching.

## 1. Locked brand identity — do not change

- The existing **bold sans-serif display font**, weight, letter shapes, heading style, mono uppercase micro-labels, and body typography.
- Existing warm cream/off-white background, near-black primary text, neutral gray support copy, fine structural rules, and restrained magenta accent.
- `ALDO.` mark; header navigation; back-to-work and back-to-stand controls; shared footer; sauce/theme variants; existing hover/focus semantics.
- Oversized, left-aligned `Knowledge Bridge.` hero title and its concise explanatory text.
- The **small two-column `CONTRIBUTION` / `FOCUS & TECHNOLOGIES` information strip** with subtle horizontal dividers below the hero (stack on mobile).
- Project tone: editorial, intelligent, slightly playful but not futuristic SaaS or gamified dashboard.

**Absolutely avoid:** serif font swaps, generic glass/white cards, soft shadow UI everywhere, neon gradients, big pink clouds/glows, heavy 3D, gratuitous particles, novelty cursors, audio, forced scroll snapping, or more written sections.

**Art-direction principle:** _A scientific research illustration with the craft of an editorial artwork, brought to life through precise interaction._ Pink denotes **an intentional human action, selected correction, or update**, not ambient AI decoration.

## 2. Final page anatomy — concise, four moments

1. **Hero + contribution strip** — what it is, your role, 81.5% measured result.
2. **Figure 01: The Living Graph** — the **one** large scroll-driven graph expressing overload → focus → human edit / backend response → result.
3. **Figure 02: Model History** — a visually distinct, interactive relationship diff/time-scrub **continuing from the same graph data**.
4. **Result / navigation** — strong `8.47s → 1.57s` statement, small secondary `72.4%` metric, methodology note, and existing project navigation.

Do not add feature-card grids, long paragraphs about ML theory, repeated graph illustrations, or a separate full-screen WebSocket dashboard. Aim for **~150–220 words of visible case-study copy**, excluding nav, labels, and tech stack.

## 3. HERO — preserve, adjust only composition

**Copy:**

- Eyebrow: `01 / HUMAN–AI · 2024 · TU BERLIN`
- Heading: `Knowledge Bridge.`
- Subheading: `Making AI-generated knowledge human-friendly.`
- Supporting text: `I helped turn an early knowledge-graph research prototype into a faster, more responsive interface for human–AI collaboration.`
- Metric: `81.5%` / `reduction in graph finish time` / `8.47s → 1.57s · 100-item Reddit graph`

**Layout:**

- Desktop: strong editorial left text block. Let a portion of the large, muted knowledge network extend visually into the right-side hero area **as the beginning of the same visual system used below**, not a separate random constellation.
- Make the **metric legible on a clear background**: no lines crossing its characters. Position it in an unobstructed zone or create a deliberate generous negative-space zone behind it. Avoid two competing pink focal points.
- Do not let network art obscure nav, headings, descriptions, links, or the contribution strip.
- Mobile: text and metric stack in normal document flow. The network appears as a compact, meaningful composition below the introduction or at the entrance to Figure 01. No text/graph overlap.
- Below hero, preserve two columns:
  - `CONTRIBUTION` — `Full-stack development, UX, performance, human–AI interaction`
  - `FOCUS & TECHNOLOGIES` — `React · TypeScript · React Flow · WebSockets · Python · FastAPI`

## 4. FIGURE 01 — one living graph, one GSAP timeline

### 4.1 Static art direction (must look beautiful when paused)

Rebuild the current simplified tree illustration into an **organic, intentional network** close to the approved reference image. It must feel visually confident even with JavaScript disabled.

- One focal concept, `Gaming discussions`, surrounded by category anchors `Shooter`, `RPG`, `Sports`, and example items `Rainbow Six`, `Skyrim`, `FIFA` (plus quiet contextual branches such as `Quests`, `Modding` if useful).
- Compose a deliberately asymmetric branching network, not a centered corporate org chart or mechanically random particle cloud.
- Fine curved links, varying node scale/opacity, many subtle peripheral points, **a small number of highly legible anchor labels**. Use thoughtful negative space.
- Clear hierarchy: primary anchor(s) in near-black, secondary branches graphite, peripheral branches quiet gray, and **one magenta corrected relationship** in the appropriate stage.
- On desktop, the network should occupy the majority of the section's visual width (~60–70%); not float tiny next to four stacked paragraphs. The annotations occupy the other ~30–40%.
- Favor a deterministic SVG or lightweight Canvas rendering and **precomputed node positions**. Do not default to running a heavy force simulation every frame. Only introduce WebGL if there is a demonstrated technical need.
- Give connecting lines adequate contrast. Avoid indistinguishable hairlines at normal laptop resolution.
- No tooltip cards covering the graph, no default React Flow boxes, no glass panel containing the network, and no pink glow effects.
- Caption: `Interpretive illustration · not a product screenshot`.

### 4.2 One coherent visual identity throughout the scroll

The approved mock visually connects the hero and main graph. **Implement that continuity**, either with a shared visual layer that changes layout as it enters the figure, or with a deliberate morph/transition between graph compositions. Do not render two prominent independent network instances in adjacent sections that look like repeated stock art.

Use **shared graph state and a single art direction**. Technically separate DOM layers are acceptable if required for responsive layout or accessibility, but the experience must **look and behave as one evolving graph**.

### 4.3 Desktop GSAP ScrollTrigger (the primary animation)

Implement **one scrubbed pinned timeline** in Figure 01. Scroll position drives visual progress, **not click-to-advance buttons**. Suggested additional scroll distance **~180–260vh**, adjusted for real viewport height and pacing. Reverse scrolling must rewind everything predictably.

Use four _beats_ on the same graph; a single active headline/description sits in the editorial column. Do **not** stack all four full headings in view at once. A thin mono progress indicator is acceptable.

**Beat 1 — Overload (0–25%)**

- Active heading: `Everything, all at once.`
- Line: `The original prototype rendered too much graph detail at once.`
- The graph opens from its broad structure into a larger volume of peripheral connections. Viewers should understand its complexity. Do not simulate actual UI lag.

**Beat 2 — Focus (25–50%)**

- Heading: `Render what matters.`
- Line: `Viewport-aware rendering keeps relevant detail in focus.`
- High-level context remains; unnecessary _detail_ nodes soften as a focused region becomes clear. Nearby relevant nodes are introduced progressively, communicating adaptive rendering and prioritized data delivery.
- Do not depict the rest of the knowledge graph being permanently deleted.

**Beat 3 — Human ↔ AI (50–80%) — signature moment**

- Heading: `A two-way conversation.`
- Line: `People correct the graph. Prioritized updates return through WebSockets.`
- Illustrative case: `Skyrim` was linked to `Sports`; the user corrects the relationship to `RPG`.
- Animate a causal, readable sequence:
  1. A human selects the `Skyrim → Sports` relation; magenta appears **at the interaction point**.
  2. Show a restrained moving signal or leader line labeled **`USER EDIT / API`** traveling **UI → Backend**.
  3. The backend briefly acknowledges the update; no claims of full retraining happening instantly.
  4. A second signal labeled **`WEBSOCKET / GRAPH UPDATE`** moves **Backend → UI**.
  5. The old relationship fades, the new `Skyrim → RPG` edge draws, and the affected node settles into its corrected structure. Keep the resulting graph readable.
- **Technical accuracy:** the thesis explicitly documents WebSocket-driven backend-to-frontend streaming. It does not establish that _every_ frontend user edit traveled over a WebSocket. Do not invent that transport; label the outgoing correction as `USER EDIT / API` unless existing source code proves otherwise.

**Beat 4 — Result (80–100%)**

- Heading: `Less waiting. More exploring.`
- Line: `81.5% shorter graph finish time in the 100-item Reddit test.`
- Let the graph calm into a clean, resolved structure and reveal `8.47s → 1.57s` with restrained typographic animation. The final state should flow into Figure 02 naturally.

**Behavioral requirements:**

- The visual changes _continuously_ as scroll moves, including backward; no hard slideshow cuts.
- The graph does not jump or recenter unexpectedly between stages.
- Keep the active copy visible and well timed, but never render essential explanatory copy only inside SVG.
- Light pointer responsiveness on desktop is optional **only if** it does not harm readability, performance, hover interactions, or reduced-motion settings. No constant undamped physics.
- The UI should remain usable if GSAP fails to load: meaningful static graph plus text.

## 5. FIGURE 02 — Model History as a meaningful interaction

**The current issue:** a tiny `Skyrim → Sports` versus `Skyrim → RPG` graphic looks like an afterthought. It must feel like a refined, genuinely usable tool, but **not** repeat the entire constellation.

**Copy:**

- Eyebrow: `02 / MODEL VERSION CONTROL`
- Heading: `Every change has a history.`
- Subheading: `Save a state, correct a relationship, and return to an earlier version.`

**Visual design:**

- Use a **focused crop of the same world**, but rendered as a crisp, minimal relationship comparison. Keep it distinct from the flowing network: more precise, more like a technical annotation or a before/after proof.
- Primary visual: one prominent focal relationship whose endpoint **morphs from `Sports` to `RPG`**. The selected edge is pink; inactive context is graphite. Visually emphasize the exact changed relationship rather than a hundred tiny background dots.
- Adjacent or underneath: a **well-composed two-checkpoint timeline** (`01 Original` / `02 Human correction`) with version markers and a concise changed-state annotation `Skyrim: Sports → RPG`.
- Include a **true continuous scrub control** (native accessible range input is recommended; style it to match the design) that interpolates the edge and connected node position across history states. A draggable before/after wipe is acceptable only if it communicates a genuine structural change.
- Explicit version buttons/timeline stops may supplement the slider to provide precise keyboard and touch selection. **No redundant or inert Undo/Redo controls.**
- Optional `Restore original` action must genuinely switch displayed state and change the slider/version selection. It should not imply changes are being persisted to the original research backend.
- Motion: restrained (~250–450 ms for discrete version selection; direct smooth interpolation while scrubbing). No dramatic glows, springs, or UI fireworks.
- Caption: `Illustrative recreation · not connected to the original research backend`.

**Behavioral details:**

- `progress=0`: relation points to Sports, caption reads `Original`.
- `progress=1`: relation points to RPG, caption reads `Human correction`.
- `0 < progress < 1`: the edge and node positions interpolate meaningfully; a percent/progress indication may appear, but **do not misrepresent these intermediate visual frames as real saved model checkpoints**.
- Provide accessible labels, keyboard arrows, visible focus, and touch-friendly drag area (≥44px high). Announce selected checkpoint when the snap or version button completes, not on every pixel of drag.
- Mobile: graph above timeline and controls; no side-by-side microscopic diagrams.

## 6. RESULT — a strong, restrained ending

- Keep exact section title: `Designed for people. Engineered for speed.`
- Main statement has substantial visual presence: **`8.47s → 1.57s`** / `81.5% reduction in graph finish time`.
- Secondary result is smaller but clearly visible: **`72.4% shorter page load time`** (`4.82s → 1.33s`, 600-item Reddit graph).
- Include concise methodology label: `Controlled Chrome comparisons · mean of 10 graph creations per dataset condition`.
- Leave the existing next-project, all-work, thesis link (if genuinely available), and footer conventions intact.
- Do not repeat the giant 81.5% in three places, use animated counting as a gimmick, or add a large chart for the sake of adding data.

## 7. Mobile — equally good, not a scaled-down desktop

**Mobile requirements are acceptance gates, not optional refinements.**

### Layout

- Preserve native typography and hero layout; stack title, intro, metric, and Contribution/Technologies information in normal flow with comfortable spacing.
- Do not cover text with network lines and do not render labels at 6px through indiscriminate SVG scaling.
- Build a **mobile-specific graph composition** using the same data and style: fewer peripheral nodes, stronger key labels, and a tighter focused crop. Maintain meaningful network context.
- Avoid a sticky/full-screen pinned 250vh sequence on mobile: let users scroll normally through compact stages of the same story. Sections may animate on entry, but do not become tap-to-advance slides or consume multiple screen heights needlessly.
- The **two-way communication** stage on mobile must still show `USER EDIT / API` going toward the backend and `WEBSOCKET UPDATE` returning; use simplified geometry if needed.
- Version control shows one clear relationship at a time, with thumb-friendly slider and checkpoint stops below it.
- Keep results readable without odd line breaks or horizontal overflow.

### Test viewports

- Phones: **320×568, 375×812, 390×844, 430×932**.
- Tablet: **768×1024**.
- Desktop: **1280×800, 1440×900, 1920×1080**.
- Short-height laptop/landscape: avoid unusable pinning and header collisions.
- In all states: **no horizontal page overflow, clipped major text, overlap with navigation, invisible buttons, or giant empty scroll gaps**.

### Accessibility and motion

- Touch targets **at least 44×44 CSS px** for discrete controls; slider has a comfortable touch area.
- Keyboard works on slider/version stops; a visible focus style is mandatory.
- `prefers-reduced-motion`: disable pin, large transforms, animated signal packets, and hover physics. Show meaningful static steps and allow instant checkpoint changes.
- Honor high-level user scrolling; no full-page wheel hijacking, scroll lock, forced snaps, or autoplay that prevents reading.
- Preserve the accessible skip link and make it **visually hidden until focused**, not permanently overlapping the hero.

## 8. Implementation notes (pragmatic, not prescriptive)

- Prefer SVG for a moderate, deterministic set of graph nodes/edges; use Canvas if SVG element count actually creates a measured bottleneck. Never introduce Three.js/WebGL solely because “Awwwards.”
- Keep graph data and node coordinates in a small serializable model (IDs, labels, clusters, base positions, focused states, before/after relationship). Avoid separately hardcoding each of four figures.
- Provide a stage-progress function that maps scroll progress to visible geometry/opacities. Structure code so the mobile narrative and version control reuse the same underlying graph semantics.
- GSAP: register `ScrollTrigger`, use a scoped `gsap.context()` and `gsap.matchMedia()` (or equivalent), set up after client hydration where appropriate, run `ScrollTrigger.refresh()` after layout changes, and **revert/kill all triggers/tweens/listeners on unmount or route navigation**.
- Prefer animating transforms and opacity; keep path geometry manageable. For path drawing, use existing installed helpers or lightweight stroke-dash animation; do not add multiple large libraries.
- Keep only a small number of SVG elements interactive; use HTML controls/text for accessibility. SVG visuals can be `aria-hidden` where full equivalent semantics are available.
- Avoid perpetual RAF loops and expensive CSS filters. Lazy-load any noncritical reference image and do not block hero text rendering.
- Preserve existing global theme handling: the graph and interaction contrast must remain readable in Original, Noir, and Synthwave themes without changing those themes' identity.

## 9. Accuracy / attribution (important)

Based on the TU Berlin bachelor thesis, **Knowledge Bridge: An Interface for Real-Time Human-AI Collaboration on Knowledge Graphs** (2024):

- This was a **collaborative pre-existing research system**. Attribute your work to performance engineering, architecture/refactoring, WebSocket streaming, checkpoint/model management, and UX/UI contributions. **Do not claim sole authorship** of the graph-generation or image models.
- WebSockets support prioritized backend-to-frontend nodes/edges and real-time updates. User edits participate in an application-level feedback loop; do **not** state that all edit requests use WebSockets without code verification.
- The checkpoint illustration is a **local explanatory demo**, not a live connection to the historical research backend. The Skyrim misclassification is an illustrative scenario, not a validated recorded experiment.
- **Reddit, 100 items, finish time:** 8.47s to 1.57s = **81.5% reduction**.
- **Reddit, 600 items, page load time:** 4.82s to 1.33s = **72.4% reduction**.
- These are averages of **10 graph creations** per condition in controlled Chrome tests. Neither is a task completion metric. Do not write `72% faster task completion`, `81.5% faster interaction`, or `4.82s → 1.31s`.

## 10. Acceptance criteria — do not call it finished without verification

### Visual identity

- [ ] The original font, existing heading style, warm palette, mono labels, navigation, footer, theme switcher, and Contribution/Technologies strip remain intact.
- [ ] Default view is elegant without animation: deliberately composed network art, readable anchor labels, controlled pink accents, no corporate SaaS cards or glow clouds.
- [ ] Hero metric is readable without network lines behind it.
- [ ] Page keeps varied but cohesive visual rhythm; Figure 02 looks like a purposeful diff tool, not an afterthought.

### Interactions

- [ ] On desktop, **one actual pinned, scrubbed GSAP graph** changes across four beats as the user scrolls down and rewinds scrolling up.
- [ ] These are not four separate diagrams and not four click-driven slide buttons.
- [ ] Outgoing correction and incoming WebSocket update are visually distinct, correctly labeled, and lead to a real graph edge change.
- [ ] Figure 02 slider interpolates between real displayed before/after relationship states; version controls, restore controls, keyboard, and touch work.

### Mobile and quality

- [ ] No mobile scroll trap and no horizontal overflow at all test widths; graph labels remain legible.
- [ ] Reduced-motion experience is complete and meaningful.
- [ ] Theme modes preserve contrast; focus states and accessible descriptions work.
- [ ] Animation cleanup works after navigation in/out of the project page; no duplicate ScrollTriggers, console errors, or broken interaction on revisits.
- [ ] Both benchmark values and all descriptions are factually correct.

### Verification evidence in Codex's final response

Report (briefly):

1. Files and components changed, with a sentence on why each was needed.
2. How the single graph is shared across stages and how the checkpoint interpolation works.
3. What **actual browser tests** you performed: representative desktop and mobile viewports, scroll forward/backward, slider dragging/keyboard, reduced motion, navigation cleanup, and theme switching.
4. Any blockers or untested scenarios **explicitly**, without claiming success where not verified.
5. Screenshots/short screen recordings of the desktop and mobile result if the project/browser tools support them.

---

## Final handoff note for Codex

> **Do not redesign the site.** The existing portfolio has an established creative identity and the approved reference locks the new Knowledge Bridge composition. Your task is to translate it into a real, highly polished, responsive engineering experience. Prioritize the art direction of the living graph, one seamless GSAP scroll interaction, a genuinely scrubbable model-history diff, and exceptional mobile execution. Keep everything concise, performant, accessible, and true to the thesis. Do not finish with a static collection of diagrams and declare that it meets the brief.
