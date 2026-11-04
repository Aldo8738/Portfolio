# Knowledge Bridge — Codex revision brief (V2)

## Objective

**Fix the current Knowledge Bridge detail page, rather than replacing the site's design.** The present implementation is visually close to the portfolio identity, but it missed the central interaction brief: it rendered the graph narrative as four clickable slides instead of a real GSAP scrollytelling sequence. Its model-history demonstration is generic and underwhelming, WebSockets are almost invisible in the story, and the previous two-column Contribution / Focus & Technologies table was removed.

**The core outcome:** A recruiter should understand the engineering in ~30 seconds, while an interested visitor can explore one exceptional scroll interaction and one small, meaningful checkpoint demo. Keep the overall page short.

### First, inspect what exists

- Inspect the actual page route, React/Astro components, CSS variables, GSAP installation, routing, navigation, breakpoints, and current Figure 01 SVG.
- Refactor the current implementation where possible. **Preserve the hero, type scale, cream background, pink accent, thin rules, navigation, and footer.** Do not start a redesign or restyle the entire portfolio.
- Identify any numbered step buttons controlling the Figure 01 narrative; these must **not** remain the primary desktop interaction.
- Inspect the project for duplicated older content below the case study. Do not leave the outdated “Starting with a proof of concept” / explanatory blocks appended after the new experience.
- Use existing GSAP/ScrollTrigger dependencies; if ScrollTrigger is missing, add the minimal necessary dependency and lazy-load or scope it to the project route.

---

## 1. Preserve what's working; fix what's not

### Keep

- Hero layout, including `Knowledge Bridge.` and the prominent magenta `81.5%` performance number.
- The site’s existing editorial design: large near-black heading, smaller sans body, tracked monospaced overlines, cream ground, generous but controlled negative space, fine dividing lines, and pink **only** for meaningful emphasis.
- Existing header, back links, work/project navigation, and footer.
- The original Figure 01’s **visual vocabulary**: fine graph edges, outlined rectangular nodes, small supporting text, one selected magenta relationship.
- The factual, attributed phrasing that this was an **existing research proof of concept you improved**.

### Fix

1. **There is no real scroll animation.** Replace four slide buttons with ONE GSAP ScrollTrigger-controlled story (see §2). The sequence must be driven by real scroll position, not by clicked step indices.
2. **The graph is too washed out and small.** Increase line/node contrast and visual scale (within existing colors), reduce empty plot area, and make the interesting graph region the focal point. Do not make it dark or neon.
3. **No obvious WebSocket contribution.** Make backend streaming and the two-way _application feedback loop_ legible visually and in copy (see §2, beat C and §5 for factual nuance).
4. **Checkpoint feature is visually uninteresting.** Replace four generic `Sources / Relations / Topics / Entity` boxes with a convincing graph snapshot comparison using gaming-themed nodes and an actual changed relationship (see §3).
5. **Contribution/stack table was removed.** Restore the attractive two-column strip from the older layout: `CONTRIBUTION` on the left, `FOCUS & TECHNOLOGIES` on the right. Match its typography, spacing, divider styling; put it immediately after the hero and before the animated figure (see §4).
6. **The page has excess empty space.** Adjust vertical rhythm; keep breathing room, but avoid vast blank regions around the small SVG and checkpoint demo.

Do not invent new sections, add unrelated animations, or change the global site identity.

---

## 2. Main experience — real GSAP scrollytelling (not a slideshow)

### Required interaction model

- Desktop: **one pinned story** with a single GSAP timeline and `ScrollTrigger` (`pin`, `scrub`, an appropriate `end` distance) that continuously animates **the same SVG graph** through four beats. Scrubbing backward must rewind naturally.
- The text block sits on the left, visual graph to the right on roomy viewports; neither should feel like a PowerPoint slide. Headline/body text should update as part of the scroll timeline, while graph edges/nodes move, change, or reveal detail throughout each phase.
- **Remove the four numbered step buttons** from desktop. They are the problem. A small, noninteractive chapter/progress indicator is acceptable (e.g. a thin pink progress line and `01 / 04`), but it must update from scroll position and never act as slide navigation.
- Do not simulate poor performance by dropping frames or blocking interactions; communicate overload through density and layering.
- The graph should be schematic but grounded in the thesis’s video-game Reddit example. Use node labels such as `Gaming discussions`, `Shooter`, `RPG`, `Sports`, `Rainbow Six`, `Skyrim`, `FIFA` where helpful, rather than vague placeholder concepts. These are **illustrative data labels**, not a claim that the SVG is a real recording.
- Keep the SVG legible: visible strokes, relatively generous card sizes, 10–20 useful nodes at most, no illegible microtext, no huge tangle of hairlines.

### Four scroll beats — one continuous scene

#### Beat A (0–25%) — Overload

**Heading:** `Everything, all at once.`  
**Copy:** `The original prototype rendered too much graph detail at once, slowing exploration.`

- Start with a small hierarchy of legible nodes.
- Additional detailed nodes and edges fill in progressively with scroll, suggesting a system handling excessive detail.
- The base hierarchy remains visible. No abrupt state swap.

#### Beat B (25–50%) — Adaptive rendering

**Heading:** `Render what matters.`  
**Copy:** `Viewport-aware rendering keeps relevant detail in focus instead of drawing everything.`

- Introduce a restrained pink viewport frame/highlight.
- Fade detailed out-of-view nodes into low-opacity structure; keep the higher-level branches visible (this reflects the thesis’s different treatment of cluster nodes and item nodes).
- Move the view region a little; nearby detailed nodes appear progressively. This must genuinely animate with scrub.

#### Beat C (50–80%) — Human–AI feedback + WebSockets

**Heading:** `A two-way conversation.`  
**Copy:** `People correct the graph. The backend processes their edits and streams prioritized updates through WebSockets.`

- A selected entity/relationship is emphasized in magenta.
- Animate a correction from the **user/graph interface toward a small `BACKEND` label**. Label this leg `USER EDIT / API` or `CORRECTION`, not `WebSocket` unless the codebase confirms edits specifically used WebSockets.
- The backend receives/processes it (a simple state change, not fake multi-second training).
- Animate small restrained packet marks from **BACKEND → GRAPH** and explicitly label the return channel `WEBSOCKET UPDATES` or `WEBSOCKET STREAM`.
- An edge is visibly reassigned or a label is updated; highlight changed nodes/edges briefly, then settle. This is the key human–AI moment, not just animated decorative dots.
- Make the directional relationship comprehensible even in a paused scroll position. No scrolling text ticker.

#### Beat D (80–100%) — Evidence

**Heading:** `Less waiting. More exploring.`  
**Copy:** `81.5% shorter graph finish time in the 100-item Reddit test.`

- The graph becomes tidy; animate the relevant performance numbers once through the scrub timeline: `8.47s → 1.57s`.
- The pin ends cleanly and reveals the checkpoint section. No blank scroll prison or sudden jump.

### GSAP engineering requirements

- Install/register `ScrollTrigger` correctly on the client, **and actually attach a timeline to the SVG DOM**. A library being present in `package.json` is not proof that the animation works.
- Use `gsap.context()` / framework-appropriate cleanup to revert the timeline and triggers on unmount and Astro/SPA navigation. If using `useGSAP`, ensure proper scoping and cleanup.
- Use a single `timeline` with meaningful named phases, SVG groups, strokes, transforms, opacity/clip transitions, and state-related labels; avoid React state updates on every scroll tick.
- Sync a small scroll progress marker and on-screen text to the active beat, but keep continuous transforms between beats.
- Make the pin stable when users scroll up and down, refresh midway, resize the browser, or navigate away and back. Avoid sticky header overlap.
- On mobile: **no long pin**. Show the same four ideas as compact natural-scroll beats that animate as each comes into view, or a much shorter unpinned ScrollTrigger timeline. Do **not** fall back to four manual slideshow buttons. The text and visualization must not overflow horizontally.
- Reduced motion: no pin or lengthy scrub, show a representative static graph and four readable concise captions.
- If JavaScript fails, essential content remains readable as HTML.

### Visual layout target

- Scale the main SVG up versus the current implementation. It should be visually dominant, not tiny pale diagram boxes floating inside empty space.
- Improve contrast with the existing dark-gray/cream palette (not bright colors). Magenta only on active viewport, selected relationship, backend packet flow, and metric reveal.
- Keep a small figure caption: `Interpretive illustration · not a product screenshot`.

---

## 3. Rebuild the checkpoint demo — make version control tangible

The current four-box generic graph does **not** demonstrate model history. Build one small visual demo that a visitor immediately understands.

### User-facing content

**Overline:** `02 / MODEL VERSION CONTROL`  
**Heading:** `Every change has a history.`  
**Description:** `Save a state, correct a relationship, and return to an earlier version.`

### Suggested richer design

- A compact but properly designed **two-part figure**:
  - **Main canvas (approximately 75%):** a clean, legible mini knowledge graph with actual meaningful labels, e.g. `Gaming`, `RPG`, `Sports`, `Shooter`, `Skyrim`, `FIFA`, `Rainbow Six`.
  - **History rail (approximately 25%):** two saved snapshot rows with small timestamps or version identifiers, e.g. `Checkpoint 01 · Original` and `Checkpoint 02 · Human correction`. A tiny `Saved state` indicator can appear. On mobile stack history below the visualization.
- In version 1, show a **clearly incorrect relationship**: e.g. `Skyrim` connected to `Sports`.
- In version 2, show the correction: the old edge fades/strikes out and the new edge visibly connects `Skyrim` to `RPG` in pink. Maintain stable positions for all other nodes so the change is obvious. This is a deliberately simplified illustrative example, not a transcript of real test data.
- The selected snapshot row, changed edge, and descriptive status **must update together**. Animations should be short (~250–450 ms), with instant changes for reduced motion.
- An optional narrow `Changed: Skyrim → RPG` diff note or one-line status is useful. Do not turn this into a dashboard.
- The visitor clicks snapshot rows or meaningful `Undo` / `Redo` controls; these **really restore different states**. Buttons must not merely change a title while the graph stays essentially the same.
- If you include Undo / Redo, both must work forwards/backwards repeatedly and expose correct disabled states.
- Use keyboard-operable controls, visible focus, and `aria-live` status text.
- Label `Illustrative recreation · not connected to the original research backend` to avoid misrepresentation.

**Important separation:** Figure 01 is scroll-driven. This checkpoint demo is a **legitimate click interaction** because the user is deliberately exploring saved model states. Do not confuse the two controls.

### Optional real evidence

If the existing repo has the real Focus screenshot with the checkpoint sidebar, add it as a small inset or `Original Focus interface` link/caption beneath the demo. Do not make a fake screenshot and do not let old UI dominate the page.

---

## 4. Restore the small contribution/technology table from the prior page

The supplied reference screenshot shows a two-column, editorial strip bounded by subtle horizontal rules. **Bring that layout back**, not a tiny muted tech line at the bottom.

Place it **after the hero and before Figure 01**:

| CONTRIBUTION                                                  | FOCUS & TECHNOLOGIES                                            |
| ------------------------------------------------------------- | --------------------------------------------------------------- |
| Full-stack development, UX, performance, human–AI interaction | React · TypeScript · React Flow · WebSockets · Python · FastAPI |

**Styling:** left/right columns with equal or slightly asymmetric width, fine top/bottom borders, small monospaced headings, normal-size content, compact vertical padding. On mobile stack columns while retaining the editorial divider treatment.

Remove duplicated `My contribution` and stack lines from the end of the page if they repeat this table. Avoid creating a new long section for these facts.

---

## 5. Accuracy and copy: WebSockets are essential, but be precise

The thesis describes:

- A backend-driven, real-time graph system that sends **prioritized batches** of graph nodes/edges to the frontend over WebSockets.
- A human–AI feedback loop: users can correct nodes/relationships, backend logic incorporates updates, and the interface reflects the changed graph.
- REST-style resources/endpoints for some user operations, including checkpoint management. The thesis does **not** establish that _every user correction itself_ was sent over a WebSocket.
- Viewport/position-aware rendering, different visibility/detail for clusters and items, and model checkpoint management.

Therefore use accurate phrasing such as:

> `Human edits flow to the backend, while prioritized graph updates stream back over WebSockets.`

or

> `A responsive human–AI feedback loop, powered by backend-driven graph updates and WebSocket streaming.`

**Do not claim** “all edits are sent via WebSockets” without inspecting source code. Do not confuse WebSockets (transport) with the underlying learning algorithm.

### Verified metrics

- `81.5% reduction in graph finish time` for **100-item Reddit** graph: **8.47 s → 1.57 s**.
- `72.4% reduction in page load time` for **600-item Reddit** graph: **4.82 s → 1.33 s**.
- Both from before/after controlled Chrome tests; each condition averaged **10 graph creations**.

Never state `72% faster task completion` (not supported by the thesis), and avoid vague `81% faster loading` when the metric is specifically finish time.

### Current page copy to retain or refine

Hero:

- `Knowledge Bridge.`
- `Making AI-generated knowledge human-friendly.`
- `I helped turn an early knowledge-graph research prototype into a faster, more responsive interface for human–AI collaboration.`
- `81.5% reduction in graph finish time · 8.47s → 1.57s · Reddit, 100 items`

Figure 01 copy: use the four precise beats from §2.

Checkpoint: use §3.

Ending:

- `Designed for people. Engineered for speed.`
- Two compact result metrics, with the proper benchmark context and one small footnote.
- Existing `All selected work` and `Next: Trading Agent` links; include `Read thesis` only if the PDF path is verified in the repo.

No additional walls of explanatory text. The animation does the explaining.

---

## 6. Verification — REQUIRED before saying it is finished

### Functional proof of GSAP

- [ ] ScrollTrigger is actually instantiated on the Knowledge Bridge route and attached to the figure.
- [ ] On desktop, scrolling **without clicking anything** advances the graph continuously through four visually distinct beats.
- [ ] SVG nodes/edges/viewport/backend packets visibly move or change, not just text or an active index.
- [ ] The viewport/streaming state and the human-correction/backend-response state can be seen by pausing mid-scroll.
- [ ] Reverse-scrolling returns to earlier visual states. No jumps at beginning/end of the pin.
- [ ] **No numbered slide buttons** remain as the primary Figure 01 controls.
- [ ] The actual WebSocket return channel is visibly labeled `WEBSOCKET UPDATES` (or equivalently clear).

### Checkpoint proof

- [ ] The mini graph has meaningful labels (gaming example), not `Sources / Relations / Topics / Entity` placeholder boxes.
- [ ] Switching snapshot changes a specific graph relationship, the history selection, and the change description.
- [ ] Switching back restores the old relationship; repeatability and keyboard/touch interaction work.
- [ ] The checkpoint UI looks like a small polished engineering artifact, not a wireframe placeholder.

### Design and usability

- [ ] The Contribution / Focus & Technologies two-column strip is restored, matching the screenshot reference.
- [ ] Graph contrast, font size, and scale are substantially more readable than current implementation.
- [ ] The same ALDO editorial identity is preserved; no dark theme, neon UI, 3D scene, or library-heavy rewrite.
- [ ] Desktop (e.g. 1440×900), tablet, and mobile (e.g. 390×844) layouts have been visually inspected.
- [ ] Mobile has a coherent narrative without pinning, slide buttons, clipping, or horizontal scroll.
- [ ] Reduced-motion and keyboard navigation are usable.
- [ ] No duplicated original long-form sections remain after the new case study.
- [ ] Links and page navigation still work, and the rest of the portfolio is unaffected.

### Delivery discipline

Before declaring done, actually **run the site** and inspect the scroll interaction in a browser if your development environment permits it. If browser automation is available, capture and examine screenshots at the start, 25%, 50%, 75%, and end of the pinned ScrollTrigger region. A full-page static screenshot alone cannot verify scroll animation.

When reporting completion, include:

1. The files/components changed.
2. How the ScrollTrigger is configured and which parts of the SVG animate.
3. How the WebSocket feedback loop is depicted and why the transport wording is accurate.
4. How snapshot switching demonstrably changes the graph.
5. Any visual/runtime tests actually performed, with limitations openly stated.

**Do not claim the GSAP requirement is complete if the visitor still needs to click `01 02 03 04` to progress.**
