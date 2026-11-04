# Knowledge Bridge — Codex V3: Art Direction + Mobile-First Interaction Redesign

> **Use this as a targeted revision of the existing Knowledge Bridge page. Do not rebuild the site or add more written content.**
>
> **Primary objective:** transform the current technically correct but visually ordinary case study into a distinctive, polished, accessible **interactive editorial experience**—on both desktop and mobile.
>
> **Important:** the current page already has the right site identity, navigation, hero, metric, and Contribution / Focus & Technologies strip. **Preserve these.** Redesign the _main graph experience_ and the _model history interaction_. These are the only places that should carry major creative weight.

## 0. Inspect before editing

1. Open the current Knowledge Bridge page/components, their CSS, the current graph SVG, and the checkpoint component. Check how the page is built (Astro/React/etc.), which GSAP plugins are installed, and how responsive styles and route cleanup work. **Do not assume filenames or component structure.**
2. Inspect existing project `/work` styles and design tokens. Preserve shared headers, footers, sauce/theme switching, links, accessibility, and the behavior of other project pages.
3. Inspect existing screenshots/reference assets in the repo. Use the **current V2 desktop screenshot as a record of what is _not_ working visually**: four visible headings stacked beside a faint rectangular graph, plus a second similar tree for checkpoints. Do not merely tweak these two diagrams.
4. Check whether the ScrollTrigger choreography actually works in a live browser. **A screenshot cannot prove animation is missing or working.** Verify behavior rather than inferring.
5. Determine whether the original Focus screenshots or thesis PDF are available at valid paths in the repository before adding any link or image; never invent assets or destinations.
6. Make the implementation in the current codebase. Do not stop at a design proposal, and do not leave placeholder/mocked controls that appear functional but do nothing.

## 1. Non-negotiable identity and scope

### Preserve

- Warm cream/off-white canvas; near-black oversized editorial typography; quiet gray body text; fine divider lines; tracked monospace eyebrow labels; a **single sparing magenta accent**.
- Existing `ALDO.` header, `Back to Selected work`, bottom navigation, footer, and theme support.
- Hero hierarchy: `Knowledge Bridge.` / `Making AI-generated knowledge human-friendly.` / accurate 81.5% performance number.
- The **two-column Contribution / Focus & Technologies strip** directly under the hero. Desktop columns, mobile stacked rows with dividers. Use existing tokens, type, and spacing.
- Short, factual copy, original-project attribution, verified benchmarks, and labeling of interpretive illustrations.

### Replace / improve

- **Do not reuse the current collection of uniform rectangular flowchart boxes as the entire creative direction.** It reads like documentation. The graph should feel like editorial data art: clearer hierarchy, contrasting node roles, elegant connections, intentional composition, and a single meaningful magenta action.
- **Do not display all four story headlines simultaneously** alongside a tiny graphic. On desktop, the active copy should be the dominant annotation for the corresponding visual moment.
- **Do not create another copy of the same tree** for checkpoint history. Use a distinct focused relationship-diff tool with a time-travel timeline.
- Do not add dark-tech gradients, glassmorphism, neon, heavy 3D, particle clouds, novelty cursors, audio, or large new sections.
- Do not increase total narrative copy to compensate for weak visuals.

### The design goal

A recruiter should understand the story in **30–45 seconds**: _complex AI-generated graphs → adaptive rendering + backend-driven WebSocket updates → humans can correct the graph → model history → measured performance improvement._

The visitor should remember **one visually striking, scroll-controlled graph transformation** and **one small hands-on version-control interaction**.

---

## 2. Final page structure (keep it concise)

1. **Hero:** keep current wording/layout, metric, and Contribution / Technologies strip. Tighten excessive whitespace if present.
2. **Figure 01 — The living graph:** one coherent GSAP visual story with four beats, with obvious **WebSocket return updates**.
3. **Figure 02 — Model history:** an interactive before/after relationship-diff and version timeline, visually distinct from Figure 01.
4. **Result / footer:** preserve two verified benchmark metrics, small methodology note, original-project attribution, and project navigation. Optional real-source preview or thesis link only if asset/URL is verified.

No new thesis summary, no standalone list of four features, no duplicated “Starting with a proof of concept” section.

---

## 3. Figure 01 — New art direction: a living knowledge canvas

**Creative thesis:** _Pink represents the human contribution within machine-generated knowledge._ Every magenta highlight must indicate selection, correction, focused viewport, active data flow, or an actual result—not random decoration.

### Graph art direction (do this before tuning motion)

- **Scale:** on desktop the visual should own roughly **60–70% of the composition width**, with real visual weight; not a 250px diagram floating in wide whitespace.
- **Shape language:** combine **two or three levels** of hierarchy instead of identical cards everywhere:
  - One large, typographic central idea (`Gaming discussions` or `Knowledge graph`).
  - 3 broad category/cluster labels (`Shooter`, `RPG`, `Sports`) connected by graceful, slightly curved edges.
  - Smaller individual content nodes (`Rainbow Six`, `Skyrim`, `FIFA`, optional short contextual items) that can appear/fade as the viewport changes.
- **Motion-ready geometry:** use a deterministic SVG layout, not a heavyweight real-time force simulation. Slight asymmetry and thoughtful spacing should make it feel designed rather than an org chart. Use readable line contrast (avoid the current washed-out gray-on-cream look).
- **Node hierarchy:** category nodes are bold/clear; detail nodes are quieter; selected/current relation is magenta. Different node sizes/weights communicate structure before animation starts.
- **Connections:** curves should be intentional and traceable. The main human correction must be legible at a glance.
- **Small annotations:** subtle mono labels such as `VISIBLE REGION`, `UI / EDIT`, `BACKEND`, `WEBSOCKET / UPDATE`, with lines or leader marks. No wall of illegible tiny labels.
- **No fake real-world screenshot:** figure caption: `Interpretive illustration · not a product screenshot`.

### Desktop choreography: **one continuous ScrollTrigger timeline**

Use a **single pinned scene**, with scroll as the input. The graph remains in the same visual space and changes continuously. Target about **180–240vh of additional scroll**, tuning to avoid a scroll prison. Use stage labels in the code and make every intermediate state visually sensible. Reverse scrolling must rewind the visual.

**Beat 1 — Complexity (0–25%)**

- Headline: **`Everything, all at once.`**
- One line: `The original prototype rendered too much graph detail at once.`
- Start with the high-level structure and bring detail nodes/edges into view. They begin to crowd the canvas; **do not deliberately lag or block scrolling**.
- The composition should remain legible rather than turning into a random ball of spaghetti.

**Beat 2 — Adaptive rendering (25–50%)**

- Headline: **`Render what matters.`**
- One line: `Viewport-aware rendering keeps relevant detail in focus.`
- A fine magenta viewport/focus region appears. Higher-level structure stays visible while out-of-focus _detail_ nodes fade back.
- Move the focus region subtly and reveal nearby item nodes **progressively**. Show a few priority updates arriving from backend. This is about _where computation and rendering effort go_, not deleting the rest of the graph.

**Beat 3 — Human ↔ AI (50–80%)** — **the signature moment**

- Headline: **`A two-way conversation.`**
- One line: `Human edits reach the backend; prioritized updates return through WebSockets.`
- A highlighted relation (e.g. `Skyrim → Sports`, an illustrative misclassification) is corrected to `Skyrim → RPG`.
- **Show a specific causal sequence, not decorative pulses:**
  1. A selection/edit in the UI focuses the erroneous relation.
  2. `USER EDIT / API` travels **interface → backend** (do **not** label this path WebSocket unless the code actually confirms it).
  3. Backend reacts visibly but briefly (no false claim of instant full model retraining).
  4. `WEBSOCKET / GRAPH UPDATE` travels **backend → interface** using a restrained packet/path animation.
  5. The old edge fades and a new edge draws; affected node shifts or label updates; final corrected state persists.
- Keep the route/labels legible in a paused scrub frame. Viewer should be able to tell which direction each message travels.

**Beat 4 — Performance outcome (80–100%)**

- Headline: **`Less waiting. More exploring.`**
- One line: `81.5% shorter graph finish time in the 100-item Reddit test.`
- Graph resolves into a simpler balanced arrangement; `8.47s → 1.57s` is revealed in large type.
- End pin cleanly so the user naturally reaches Figure 02.

### Desktop layout behavior

- At wide widths, use a concise text column and a dominant SVG. **Only one beat's heading/body should be visually active**; do not leave all four headings stacked and rely on tiny pink labels to imply progress.
- The text is accessible in HTML; transitions should not make the essential message unavailable to keyboard/screen-reader users. If visually overlapping stage copies, keep accessible content semantics logical and avoid duplicate spoken content.
- Do not make the graph float near the bottom of a huge empty section. It should visually connect the text and its state change.
- No 01/02/03/04 step buttons. A subtle progress rule and mono `01 / 04` indicator are fine if they are **scroll-driven, not click slides**.

---

## 4. Mobile is a first-class design, not a compressed desktop scene

### Mobile design principle

**Same story and editorial identity, different choreography.** No essential content should be hidden. Preserve the four concepts, but simplify geometry and duration. Avoid turning a 6-column SVG into illegible 6px nodes.

### Breakpoint strategy (adapt to current design tokens)

- **Wide desktop (about 1100px+):** pinned two-column scroll narrative; graph ~60–70% width.
- **Small desktop / tablet (about 768–1099px):** reduce diagram density and text width; pin only if content and viewport height are safe. Prefer a shorter scroll; don't cause header overlap.
- **Mobile (up to ~767px):** **do not pin an immersive multi-viewport section**. Use four short **natural-scroll beats**, each with one headline, one sentence, and a curated visual state of the _same graph system_. Animate each as it enters the viewport with a short, reversible `ScrollTrigger` reveal or small transforms (not click-to-advance slides). This is editorial scrollytelling, not a slideshow.
- **Short landscape viewport:** disable pin regardless of width when available height is inadequate.

### Exact mobile storyboard

1. **Overload:** a compact, wide graph showing more detail than necessary, with clear category labels.
2. **Focus:** a mobile-cropped region of the same composition with active details emphasized and others faded; keep root/context visible.
3. **Two-way flow:** a distinct diagram layout for this beat: **visible UI edit → backend → WebSocket return → corrected link**, not a miniature version of the entire desktop graph. It should remain understandable at 320px width.
4. **Result:** `8.47s → 1.57s` with the context line visible, then release into checkpoint demo.

Do not force a fixed-height scrolling viewport and do not hide the graph behind a carousel. The visitor must reach the entire story through ordinary touch scrolling.

### Concrete mobile visual and interaction rules

- Check at **320×568**, **375×812**, **390×844**, **430×932**, **768×1024**, plus **1440×900** on desktop; also check 390×844 in landscape if feasible.
- **Zero horizontal overflow** in document and graph, including when labels appear, animated nodes move, or timeline controls are focused.
- Make meaningful diagram labels **at least ~12px CSS-equivalent when displayed**; don't just use a desktop `viewBox` with tiny text scaled down. Mobile can change SVG coordinates, hide redundant decorative nodes, and wrap labels, but must retain the same meaning.
- Keep body copy comfortably readable (use existing mobile body type scale, ideally 15–16px+). Allow heading wrapping naturally with no clipping.
- Checkpoint tap targets **≥44×44 CSS px**, with adequate spacing, visible focus, and no hover-only interaction.
- No scroll hijacking, snap-trapping, body scroll locks, or controls that rely on precise dragging.
- Use normal-flow sizing; don't rely on `100vh` for critical content (mobile browser chrome changes available viewport).
- Reduced-motion: no pin, no packets moving, and no essential text hidden by animations. Show representative static states and full descriptions.
- Touch and keyboard users must have equally usable checkpoint controls; no fake hover tooltips.

### Do not sacrifice performance to create the demonstration

- Prefer **SVG** with a limited number of groups, precomputed geometry, and `transform`/`opacity` animation.
- Avoid heavy physics, continuous RAF loops, blur filters, giant shadows, or expensive path morphing unless performance is validated.
- Use GSAP only on the page where needed; scope timeline and kill/revert it on route change / component unmount. Use `gsap.matchMedia()` or equivalent for breakpoint-specific choreography.
- Lazy-load any noncritical evidence images; do not delay the textual hero or first paint for animation setup.

---

## 5. Figure 02 — Replace the repetitive checkpoint tree with a relationship time machine

**Do not build a second full knowledge graph that looks like Figure 01.** Figure 02 is a focused _product-like microinteraction_ about a **single relationship changing across saved versions**.

### Copy

- Eyebrow: `02 / MODEL VERSION CONTROL`
- Headline: **`Every change has a history.`**
- Description: `Save a state, correct a relationship, and return to an earlier version.`

### Visual structure

**Desktop:** main relationship canvas + slim version rail/timeline (roughly 70/30 split). **Mobile:** one focused canvas followed by a horizontal or stacked, **thumb-friendly** two-version selector. Never place a 25%-width sidebar next to a squeezed graph on mobile.

**Illustrative graph scenario:** `Skyrim` is connected to `Sports` in `Checkpoint 01`; in `Checkpoint 02`, `Skyrim` is corrected to `RPG`. Keep `RPG`, `Sports`, and `Skyrim` clearly visible. There may be faint context nodes, but do not draw an entire duplicate tree. Versions are **illustrative**, not claimed to be actual archived experimental checkpoints.

### Required interactive behavior

- Initial view may show `Checkpoint 02 / Corrected` with the changed edge pink.
- Two clear selectable history items: `01 · Original` and `02 · Human correction`.
- Selecting 01 animates the **edge connection back to Sports**, changes the active version, and updates a concise state description. Selecting 02 restores the **edge to RPG**. This must be a real graph difference, not merely text highlight.
- Prefer **a horizontal timeline/filmstrip of two snapshots** and one prominent `Restore original` / `Restore correction` control; if you retain Undo/Redo, make them function, with clear disabled states. Do not stack redundant controls.
- Include a small diff annotation (`Relationship changed: Sports → RPG`) and use `aria-live="polite"` for state announcements.
- Use short, tactile transitions (~250–450ms). For reduced motion, switch instantly.
- Include `Illustrative recreation · not connected to the original research backend`.
- Have a **meaningful visual before/after difference** even when JavaScript is off (e.g. static corrected state plus caption).

### Make it feel designed

- One visually confident main canvas, not tiny boxes spread over a large blank area.
- Timeline items should look like saved states: number, title, perhaps an understated relative version indicator. **Do not invent actual timestamps or authors** for this recreated scenario.
- Magenta is assigned to the corrected edge and selected version only; all other connections are calm graphite.
- Show the _idea of reversibility_ clearly enough that recruiters grasp it without operating the control.

---

## 6. Preserve the original small two-column information strip

Keep this **between hero and Figure 01**, with the thin top/bottom rules, monospaced category labels and normal-size text as shown in the earlier screenshot.

| CONTRIBUTION                                                  | FOCUS & TECHNOLOGIES                                            |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| Full-stack development, UX, performance, human–AI interaction | React · TypeScript · React Flow · WebSockets · Python · FastAPI |

- At mobile widths, stack into two rows, each with clear label and content; don't compress into two unreadable columns.
- Do not repeat this entire strip at the bottom.
- If a `Skip to content` link is visibly sitting over the story in screenshots, fix the **focus-only skip-link styling**, not the accessibility feature itself. It should appear when keyboard-focused and stay otherwise visually hidden.

---

## 7. Factual accuracy — derived from the original bachelor thesis

- This was an **existing collaborative research prototype**. Describe your work as improving/refactoring rendering, streaming, interface usability, and checkpoint management. Do not claim sole authorship of the full graph-generation models or the image models.
- Thesis §5.1–5.2: WebSockets were integrated for **backend-to-frontend** prioritized batches of graph nodes/edges and real-time updates. User edits are part of a two-way _application-level_ feedback loop; **do not claim all edits use WebSockets** without confirming implementation details. On the illustration label the outgoing correction `USER EDIT / API` and the return `WEBSOCKET UPDATE`.
- Thesis §5.3: model checkpoints support saving, restoring and undo/redo; the version selector is a **local interpretive demonstration**, not the original running backend.
- Thesis Tables 6.1–6.4: **100 Reddit items:** finish time **8.47s → 1.57s = 81.5% reduction**. **600 Reddit items:** page load time **4.82s → 1.33s = 72.4% reduction**. The tables report averages of **10 graph creations per condition** in controlled Chrome tests.
- Never say `72% faster task completion`, `81% faster user task completion`, or imply that benchmark values are current live-site measurements.

### Keep ending concise

- `Designed for people. Engineered for speed.`
- `81.5% shorter graph finish time` / `72.4% shorter page load time` with small dataset-specific labels.
- One compact benchmark-methodology footnote.
- Project navigation `All selected work` / `Next: Trading Agent` and verified thesis link if available.

---

## 8. Engineering implementation guidance

- **Framework:** integrate with whatever is already installed; do not add a new rendering framework. Reuse CSS tokens and native typography.
- **Structure:** separate figure's **data/state definition** from geometry and GSAP choreography. Suggested responsibilities (filenames are illustrative, not mandatory):
  - `KnowledgeBridgeStory`: semantic story + responsive layout.
  - `KnowledgeGraphArtwork`: reusable node/edge SVG geometry and phase-specific styling.
  - `useKnowledgeBridgeScroll`: scoped GSAP timeline with teardown and breakpoint variants.
  - `CheckpointTimeMachine`: local controlled state + meaningful edge transition and keyboard/touch behavior.
- **GSAP:** use `ScrollTrigger`, `gsap.context()` and/or `gsap.matchMedia()` with cleanup. Animate transforms, strokes, opacity, and clearly defined groups. Avoid frequent React re-renders from `onUpdate`; only update accessibility/status when active beat changes if needed.
- **Resizing:** correctly recalc ScrollTrigger positions on breakpoint shifts, late fonts and image sizes. Pin should never cover global navigation or cut off content; avoid pin spacing artifacts.
- **No reliance on continuous JS state for semantics:** headlines, explanations, metrics, and the current corrected relation must be present in semantic HTML or have a robust no-JS presentation.
- **No invented features:** this is a conceptual case-study visualization; avoid building a fake network connection or implying that it connects to the original backend.

---

## 9. Acceptance tests — Codex must run these before reporting success

### Art direction and composition

- [ ] In a desktop screenshot, the main graph is the clear primary visual, not faint flowchart boxes in a huge empty field.
- [ ] Only one headline/paragraph is visually dominant at a time during the pinned narrative; four sections are not stacked beside a static graph.
- [ ] Main graph and checkpoint demo **do not look like duplicated versions of the same tree**.
- [ ] Pink has clear semantic purpose and original cream/black editorial identity is intact.
- [ ] Hero, contribution/technologies strip, results, nav and footer remain faithful to existing site.

### Real desktop GSAP behavior

- [ ] Without clicking controls, normal scrolling smoothly advances the **same** main graph through all four phases.
- [ ] Nodes and connections actually transform/reveal; viewport focusing is visible; backend packets go in the correct directions; relationship actually changes; metric reveal occurs.
- [ ] Scrubbing **backward** reverses graph and copy without glitches. Pin enters/exits without white gaps, overlapping footer or scroll jumps.
- [ ] Browser refreshed in the middle of the pinned sequence and route away/back do not leave stale transforms or duplicate ScrollTriggers.

### Mobile functionality (must verify, not assume)

- [ ] Mobile at **320, 375, 390, 430 CSS px** displays all four story beats in natural scroll; no desktop pin prison.
- [ ] Main graph adapts to **new mobile geometry**, not a tiny desktop `viewBox` scaled down.
- [ ] All text, edge labels, WebSocket explanation, and metric context remain legible; absolutely **no horizontal document overflow** at any beat.
- [ ] Checkpoint versions are operable by touch and keyboard and have **≥44px hit areas**; history is beneath the graph instead of squeezed into a sidebar.
- [ ] `prefers-reduced-motion` shows all essential content without pinning or hidden animation-dependent text.
- [ ] Browser chrome changes, short screens, orientation changes, resize, and theme switching do not break layout.

### Factual and accessibility checks

- [ ] Correction is labeled `USER EDIT / API` unless transport is verified; backend return is labeled `WEBSOCKET UPDATE`.
- [ ] Switching checkpoint versions visibly rewires **Skyrim → Sports** vs **Skyrim → RPG**, with matching caption/status, and can be reversed repeatedly.
- [ ] The `Skip to content` control is focus-visible, **not permanently overlaying the graphic**.
- [ ] Benchmark terms and percentages are exact, dataset-specific, and clearly retrospective.
- [ ] Navigation links and the rest of the portfolio continue to work.

### Visual/browser QA evidence

- [ ] Run the app locally and inspect **actual browser output** (not just static JSX inspection).
- [ ] Capture **desktop** hero + scroll beat 1, beat 2, beat 3 (correction), beat 4, checkpoint version 1 and 2.
- [ ] Capture **mobile** hero, each of the four beats, checkpoint state 1 and 2, and results at **390×844**; spot check **320px wide**.
- [ ] If browser automation is available, run/test scroll-scrub direction and click controls. If not, report specifically what was not tested; **do not claim verified motion without observing it**.
- [ ] Inspect console warnings/errors and report build/type/lint checks actually run.

## 10. Completion report format

When complete, return a short report with:

1. **What changed visually** (graph art direction and checkpoint layout) and **what was preserved**.
2. **Exactly how GSAP works** on desktop vs. mobile; what animates and whether pin is enabled.
3. **How WebSocket direction and human edits are distinguished accurately**.
4. **Proof the checkpoint demo changes a relationship**, not just a label.
5. **Screenshots/tests performed**, viewport sizes, outstanding limitations, and changed files.

**Definition of done:** a recruiter can follow the entire technical story from either desktop scroll or mobile touch, and the page has two genuinely memorable visual interactions rather than merely better-looking documentation.
