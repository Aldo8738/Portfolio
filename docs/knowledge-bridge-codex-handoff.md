# Codex implementation handoff — Knowledge Bridge project page

## Mission

Turn the existing **Knowledge Bridge** project detail page into a short, memorable, technically credible case study using **one GSAP-driven graph sequence** and **one small checkpoint interaction**.

The visitor should quickly understand:

1. **The problem:** the existing research prototype struggled to render and explore growing knowledge graphs.
2. **My engineering contribution:** adaptive/viewport-aware rendering, prioritized real-time graph delivery, architectural refactoring, and model checkpoints.
3. **The human–AI concept:** humans can correct graph information; the backend processes those changes and returns updated graph data.
4. **The proof:** a measured reduction in graph finish time from **8.47 s to 1.57 s** in one controlled test.

**This is a focused upgrade to an existing website, not a redesign.** Keep the finished project page concise enough that a recruiter can grasp it quickly. Animation must clarify the engineering, not become a spectacle.

---

## 0. Inspect the current repository before touching code

- Find the current `/work` listing and Knowledge Bridge detail route. Reuse their existing routing, layout, typography, spacing, design tokens, header, footer, and navigation.
- Identify current `Figure 01` graph illustration and reuse/refine its **visual language** (thin lines, outlined rectangular nodes, subtle labels, pink human-reviewed relationship). Replace its implementation if needed for animation, but **do not replace its identity**.
- Check whether GSAP and `ScrollTrigger` are already installed and how motion is handled elsewhere. Integrate through the existing framework (Astro/React/etc. as actually present), not a new application architecture.
- Check existing breakpoints, accessibility patterns, reduced-motion handling, and whether the original Focus screenshots/thesis PDF are already in the repository.
- Keep all other projects and global navigation visually and functionally unchanged. No opportunistic refactors.

### Non-negotiable visual identity

Match the actual website, especially the supplied mobile screenshots:

- Warm off-white/cream background; near-black oversized bold headings.
- Quiet gray descriptions, generous whitespace, thin dividing lines.
- Small tracked/monospaced editorial labels: `01 / HUMAN–AI`, `FIGURE 01`, etc.
- Pink/magenta accent used sparingly for selected nodes, a relationship update, and the key metric. **Prefer existing CSS variables**; do not hardcode a competing palette.
- Flat, precise 2D vector illustrations. **No dark AI dashboard, glassmorphism, neon particles, gradient backgrounds, 3D graph, or generic AI imagery.**
- Honor the site's current hover, link underline, button, and motion conventions.
- The portfolio/taquería has its own identity; this project page should remain a restrained, editorial continuation of the existing `/work` design.

---

## 1. Final page experience and exact content

Use **four sections only**. Aim for around **150–220 visible words**, excluding technology names, labels, and small chart/metric annotations. Do not turn the thesis into another 68-page narrative.

### Section A — Hero / orientation

**Eyebrow:** `01 / HUMAN–AI · 2024 · TU BERLIN`

**H1:** `Knowledge Bridge.`

**Subheading:** `Making AI-generated knowledge human-friendly.`

**Supporting copy:**

> I helped turn an early knowledge-graph research prototype into a faster, more responsive interface for human–AI collaboration.

**Hero metric:**

- Big: `81.5%`
- Label: `reduction in graph finish time`
- Supporting evidence: `8.47s → 1.57s · 100-item Reddit graph`

A small `SCROLL TO EXPLORE` affordance can appear if consistent with existing design. Do not add a new full-screen intro, delay, or transition. Keep hero short enough that the start of the graph can be discovered promptly.

**Note:** The improvement is **finish time**, not “task completion.” See evidence section below.

### Section B — Figure 01: a single scroll-controlled graph story

**Figure label:** `FIGURE 01 / AN INTERACTIVE EXPLANATION`

Reuse a refined version of the existing white/cream knowledge-graph illustration. Make it the **main visual centerpiece**. It stays visually coherent as its state changes across four beats, driven by one scrubbed GSAP timeline.

| Scroll phase | Visible title                   | Short supporting line                                                                         | Visual action                                                                                                                                                                                                                                                        |
| ------------ | ------------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–25%        | **Everything, all at once.**    | `Rendering entire graphs at once slowed down exploration.`                                    | Start with a clean hierarchy, then reveal enough additional nodes/edges to suggest overload. Never actually reduce frame rate or block input.                                                                                                                        |
| 25–50%       | **Render what matters.**        | `The interface renders relevant detail while the backend streams prioritized graph updates.`  | Reveal a thin pink viewport boundary; fade nonrelevant _detailed_ nodes to outlines while keeping higher-level structure visible. Translate the focus region slightly and progressively reveal relevant nodes. Show restrained packets/pulses arriving from backend. |
| 50–80%       | **Humans and AI, in the loop.** | `People correct graph information. The system processes their feedback and updates the view.` | Highlight one incorrect relationship, illustrate a correction moving toward a small `BACKEND` label, and then a changed edge/node returning into the diagram. Treat as a conceptual animation, not a literal network trace.                                          |
| 80–100%      | **A measurable difference.**    | `81.5% shorter graph finish time in a controlled test.`                                       | Graph settles into clean composition; visual priority moves to `8.47s → 1.57s`. Release the pin naturally into normal page flow.                                                                                                                                     |

**Implementation constraints for this section:**

- **One** pinned GSAP/ScrollTrigger scene on desktop, **not four separate pinned sections**. Roughly **180–240vh of additional scrolling** is an initial target; tune for readability and avoid a long scroll prison.
- Use the current graph's design vocabulary: slim gray connecting curves, outlined rectangular cards, small gray metadata, and a pink selected relationship. Do **not** use a dark backdrop.
- SVG is preferred for the illustrative graph, with well-named groups (`structure`, `detail`, `viewport`, `correction`, `backend`, `metrics`) so timeline animation is maintainable.
- Give each beat a clear title and one sentence of copy. Transition text cleanly without stacking all four paragraphs on screen.
- Make all animation reversible when scrolling upward. Scrolling should control the sequence with scrubbing, not trigger one-time autoplay cutscenes.
- Keep the graph schematic; no need to render real user data or reproduce the original research UI. Aim for clarity over node count.
- The visual depicts the _concept_. The page should label it near the figure as `Interpretive illustration · not a product screenshot` (already aligned with the existing page's visual honesty).
- Avoid body scroll locks, forced scroll snapping, cursor hijacking, artificial jank, or nonessential decorative motion.

### Section C — Checkpoint mini-demo

**Eyebrow:** `02 / MODEL VERSION CONTROL`

**Heading:** `Every change has a history.`

**One-sentence description:**

> Save model states, revisit earlier versions, and see how the graph changed.

Place a compact interactive graph card in the same editorial style. Two states are enough:

- **Checkpoint 01 / Original:** a small original graph structure.
- **Checkpoint 02 / Updated:** one relationship differs, highlighted in pink.

Provide visible **Undo / Redo** buttons (or two clearly labeled checkpoint selectors if more accessible in the existing UI). Switching versions animates the changed link/subgraph briefly, updates the checkpoint label, and allows repeat use. This is a **real working local interaction** (client-side demo state), not merely a scroll animation.

Important:

- This is an **illustrative recreation** of the original checkpoint idea. Do not suggest it is connected to the live ML backend.
- Respect reduced motion by switching states instantly.
- Keyboard-operable controls with visible focus; disabled state when Undo/Redo cannot proceed.
- No elaborate save modal, timeline explorer, mock API, backend service, or fake training progress.
- Match the site's existing components and colors. The goal is one understandable action in a few seconds.

**Optional supporting caption** (one line max): `The original application supported saved graph states, restoration, checkpoint metadata, and undo/redo.`

### Section D — Results, credibility, exit

**Eyebrow:** `03 / THE ENGINEERING`

**Heading:** `Designed for people. Engineered for speed.`

**Description:**

> I worked on adaptive graph rendering, backend-driven streaming, and model checkpoint management, alongside improvements to the interface and overall architecture.

Use two restrained metric blocks, **not a giant dashboard**:

1. `81.5%` — `shorter graph finish time` — `8.47s → 1.57s · Reddit, 100 items`
2. `72.4%` — `shorter page load time` — `4.82s → 1.33s · Reddit, 600 items`

**Small footnote:** `Before/after measurements in controlled Chrome tests; averages of 10 graph creations per dataset condition. Results vary by scenario.`

Include a compact line for **My contribution** and the project stack:

- `My contribution: performance engineering, real-time data delivery, checkpoint management, UX/UI and architecture improvements.`
- `React · TypeScript · React Flow · Python · FastAPI · WebSockets`

Show **one** authentic original Focus screenshot, preferably the screenshot showing the checkpoint sidebar, as small supporting evidence **if the actual image asset is available**. Label it `Original Focus research interface`. Use a crop or framed inset that respects the existing layout; do not replace the primary diagram with the screenshot. Do not manufacture a screenshot.

Close using the site's **existing** work-navigation pattern:

- `Read thesis` only if a genuine PDF asset or verified URL is available. If no asset exists in the repository, leave this CTA unwired and explain the missing asset in the delivery note; never insert `#` or a fictitious URL.
- `All selected work` returning to the work listing.
- `Next: Trading Agent` preserving existing project sequencing and link behavior.

**No extra conclusion section, testimonial, stack carousel, gallery, animated counters beyond what improves clarity, or lengthy research background.**

---

## 2. Technical accuracy / attribution — must preserve

Source: **Knowledge Bridge: An Interface for Real-Time Human-AI Collaboration on Knowledge Graphs**, Bachelor thesis, TU Berlin, September 2024.

The thesis describes the project as a collaborative research effort built on earlier contributions. State accurately that I **extended and refactored an existing prototype**, not invented the entire knowledge-graph/ML system.

Documented thesis contributions include:

- Real-time rendering and adaptive data streaming with viewport/position-aware node detail and prioritized batches.
- WebSocket support for the backend to stream graph/node/edge updates progressively to the frontend.
- Architectural changes giving the backend control over the information being sent/rendered.
- Graph/model checkpoint management: create, list, retain, restore, change metadata, undo/redo, cloud-storage support.
- UX/UI redesign and improvements to usability.

**Critical nuance about the feedback loop:** The overall application supports two-way human–AI interaction, but the thesis also describes REST-style resources/endpoints for some user operations. The page must **not claim every correction travels to the backend over a WebSocket**. Use copy like “users make corrections, the backend processes them, and live graph updates stream back.” The _interaction_ is bidirectional; the underlying transport paths need not all be WebSocket.

**Do not claim:**

- `72% faster task completion` — no such task timing result appears in the thesis. This wording currently appears on the site and **must be replaced in the `/work` card and project page** wherever found.
- `81% less loading time` without naming the tested metric. The defensible claim is **81.5% reduction in finish time** for the **100-item Reddit** test (8.47 → 1.57 seconds).
- All AI models, clustering algorithms, segmentation/image-editing tools, or the original Brain API were built solely by me.
- Proposed future features (advanced smart undo, automatic intelligent navigation, richer collaboration) were already shipped.
- Formal production-scale or universally applicable performance results. These are **controlled tests**, averaged over 10 graph creations for each dataset condition.

If making any claims not listed above, verify against the thesis or codebase first.

---

## 3. Motion and interaction engineering

### GSAP structure

- Build a single well-scoped timeline tied to `ScrollTrigger` for the Figure 01 sequence.
- Animate SVG layers/element transforms, opacity, strokes, masks/clips, and text transitions; avoid unnecessary layout thrashing.
- Put semantic content and layout in the page; put the animated graph in a small isolated component.
- Split static figure drawing from animation orchestration and checkpoint state; use clearly named functions/components.
- Use the existing framework's lifecycle hooks. Register `ScrollTrigger` once, scope selectors, and **revert/kill timelines and triggers on unmount/navigation**.
- If the app uses Astro or selective hydration, hydrate **only the graph/checkpoint islands that need JS**; avoid hydrating an entire static page just for motion.
- Don't add Three.js, canvas rendering, a physics library, extra CSS framework, or GSAP plugins unnecessarily.
- Avoid loading heavyweight animation modules across the entire site if the route can load them only when needed.

### Responsive behavior

**Desktop/tablet:** One pinned figure with readable accompanying copy and a natural handoff into the checkpoint section. Keep a comfortable layout rather than oversized graph art with tiny text.

**Mobile (very important; screenshots show the current mobile work page):**

- Do **not** use an awkward 240vh pinned scene on a narrow screen.
- Present the same four narrative beats as compact sequential states, either via short natural-scroll reveals or a lightweight non-pinned step progression. Maintain the **same diagram style**.
- Avoid clipped text/labels, oversized diagram canvas, horizontal overflow, minuscule nodes, and sticky elements obstructed by mobile browser chrome.
- Keep the hero metric legible above the fold or soon after the introduction.
- The checkpoint control must be easy to tap and must remain operable without hover.

**Reduced motion / unsupported JS:** The entire story must still make sense. Render a stable final/representative graph, show static text for all key points, and keep checkpoint changes immediate. No essential information may depend solely on motion.

### Performance and accessibility

- No graph animation should create the exact freezing/jank that this project says it solved.
- Aim for fluid animation on average mobile devices; minimize animated DOM nodes, paint-heavy filters, and expensive box shadows.
- Don't eager-load full-resolution screenshot assets above the fold. Use optimized images/lazy loading below the fold and explicit dimensions to avoid layout shifts.
- Keep real HTML text for headings, descriptions, metrics, and links (not text drawn exclusively in SVG).
- Provide semantic heading order, meaningful figure description/alt text, keyboard focus visibility, sufficient contrast, and working tab order.
- Checkpoint selectors/buttons require descriptive accessible labels, status text, and clear active/disabled states.
- Preserve page SEO metadata and existing canonical/project slug.

---

## 4. Suggested implementation sequence

1. **Audit** the existing work list, detail route, CSS tokens, figure, navigation, and GSAP setup. Summarize what is already reusable before large edits.
2. **Correct the performance claims** everywhere in the project card and case study (especially the unsupported task-completion figure).
3. **Update the page composition and exact copy** to four sections; keep it useful and attractive with all JavaScript disabled.
4. **Refine the current SVG figure** to support four meaningful animation states without breaking the current editorial style.
5. **Add the desktop GSAP scrubbed timeline** with reliable setup/teardown and smooth reverse scroll.
6. **Add the mobile, reduced-motion, and no-JS presentations** without a long pin.
7. **Build the checkpoint microinteraction**, fully operable by keyboard/touch.
8. **Add real supporting screenshot/PDF links only where actual assets exist**, and verify exit navigation.
9. **Validate visually and functionally** at multiple viewports. Prefer automated tests and a browser run if the repo supports them.

---

## 5. Definition of done / acceptance criteria

- [ ] Knowledge Bridge looks unmistakably like the existing portfolio: same cream/black/gray/pink editorial design.
- [ ] No new theme or dark dashboard appears within the project page.
- [ ] The complete experience has only **Hero → GSAP Figure 01 → Checkpoint Demo → Results/Exit**.
- [ ] The pinned desktop story clearly demonstrates overload → selective rendering/streaming → user correction and response → measured impact.
- [ ] Scrolling upward reverses the graph sequence cleanly; pin ends without jumps or blank space.
- [ ] Mobile has a concise, usable, **non-pinned** version of the same story.
- [ ] Checkpoint Undo/Redo (or two-state switch) is genuinely interactive, keyboard accessible, and makes a visual difference.
- [ ] Original illustration is labeled as interpretive; actual Focus screenshot (if present) is clearly labeled as the original interface.
- [ ] `81.5%` = finish-time reduction `8.47s → 1.57s` on the 100-item Reddit case; `72.4%` = load-time reduction `4.82s → 1.33s` on the 600-item Reddit case. No unsupported task-completion claim survives anywhere.
- [ ] Personal contributions are accurately separated from the broader existing research system.
- [ ] Links to all work, next project, and thesis (if available) work; no placeholder hrefs.
- [ ] Reduced-motion and keyboard behavior work; all important information remains in accessible HTML.
- [ ] No console errors, hydration warnings, horizontal scrollbars, significant layout shifts, or orphaned ScrollTriggers after route changes.
- [ ] Existing `/work` listing, other project pages, global navigation, and taquería interactions remain unchanged except for the corrected Knowledge Bridge metric/copy.

### Report back when finished

Provide a concise handoff noting: changed files, implemented animation stages and checkpoint behavior, desktop/mobile/reduced-motion differences, test/build results, assets or thesis links still missing, and any deliberate deviations from this brief.

**Design principle:** The animation should _teach the engineering_. A visitor should remember what was made faster, how human feedback shaped the graph, and that the result was measured — all without reading an academic paper.
