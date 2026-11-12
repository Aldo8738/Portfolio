# Los Trading Hermanos — Research Desk
## Codex implementation brief · Approved direction

**Status:** Approved six-beat storyboard and visual direction. Implement the portfolio case-study page, building the six **static states first** and animating only after they are visually correct. Do not redesign the concept.  
**Project:** ALDO portfolio → Work → Trading Agent / Los Trading Hermanos.  
**Principle:** **One focal point at a time.** *Text → Visual → Text → Visual → Text → Visual.*  
**Visual payoff:** A **large white Investment Assessment document**, surrounded by the original five research artifacts.

> The reference mocks are art direction, **not production assets and not reliable financial data**. Their sample numbers, dates, layouts, and captions sometimes disagree. Rebuild the scene in semantic HTML/CSS/SVG using the **single canonical illustrative fixture** below; never paste a mock image as the finished interface.

---

## 0. Inspect before changing anything

1. Read the repository, existing portfolio routes and project-page components, ALDO design tokens, fonts, spacing, animations, responsive patterns, and Knowledge Bridge implementation. **Follow the codebase's actual stack**; do not replatform or introduce another animation framework. Reuse Astro/React/TypeScript/GSAP only where already present or appropriate.
2. Identify the actual Trading Agent route and preserve the site's existing shell: ALDO logo, navigation, back-to-selected-work link, footer, sauce/theme switching where relevant, route transitions, and accessibility affordances.
3. Inspect any available Trading Agent implementation, content, and product output schema. **Only claim integrations, agent mechanics, and personal technical ownership that can be verified.** If the separate agent repository is unavailable, implement the approved storytelling with the clearly labeled **illustrative fixture** and conservative engineering copy. Do not block page design on missing information.
4. Inspect the six reference images in [`references/`](references/). Their approximate visual character matters; their generated financial facts do not.
5. Avoid modifying Knowledge Bridge or the global design system merely to solve issues on this page.

### Reference image map

| Beat | Reference | What to borrow |
|---|---|---|
| 01 · Introduce | `references/01-introduce.png` | Centered oversized typography; very faint documents behind |
| 02 · Sources | `references/02-sources.png` | Full-width physical-paper desk, five distinct information formats |
| 03 · Explain | `references/03-explain.png` | Single message, generous whitespace, almost invisible desk |
| 04 · Selected Evidence | `references/04-evidence.png` | Documents remain legible; selective pink highlighting |
| 05 · Introduce synthesis | `references/05-introduce-synthesis.png` | Very quiet centered statement; barely perceptible artifacts |
| 06 · Assessment | `references/06-assessment.png` | **Large white result document** with source artifacts receding around it |

**Crucial correction to reference mocks:** They were generated independently, so specific document placements and numbers vary. The implementation must **correct** this: one master desk arrangement, same five document identities, same canonical content at every beat, and only controlled transform/opacity changes.

---

## 1. Complete page architecture (only 3 top-level sections)

### Section 01 — Project hero

Use the **same editorial hero grammar as Knowledge Bridge**, not a dark fintech hero:

- Eyebrow: `02 / AGENTIC AI · LOS TRADING HERMANOS` (adjust project numbering to existing site convention).
- Display title: `Trading Agent.` (or the existing approved project title; preserve ALDO's magenta dot).
- Short statement: **`Less market noise. More relevant research.`**
- One paragraph maximum: `A context-aware AI investment research agent combining company data, market developments, investor discussions, and portfolio context to support more informed decisions.`
- Contributions and technology: `Co-built an initial research agent in under a month` and `Python · LangGraph` **only to the extent already supported by existing project content**. Do not imply sole ownership.
- No invented numerical performance metric; no autonomous trade execution claim.

Keep this hero tight. It should immediately tell a recruiter what the project is without obliging them to finish the scroll experience.

### Section 02 — Research Desk (the signature section)

Six beats, **one persistent Research Desk scene**. The hierarchy is intentionally uneven:

| Beat | Priority | Focus | Approved copy / content |
|---|---|---|---|
| **01 — Introduce** | Medium | Centered text | `One question. Many signals.` / `Financial data, news, opinions, and portfolio context.` |
| **02 — Sources** | High | Full-width five-document desk | Only a small label such as `02 / THE SOURCES`. **No large competing headline.** |
| **03 — Explain** | Medium | Centered text | `Find the evidence.` / `Relevant facts emerge. Conflicting views remain.` |
| **04 — Selected Evidence** | High | Same desk, selected marks | Only `04 / SELECTED EVIDENCE`. Four traceable highlights, documents remain still during the viewing interval. |
| **05 — Introduce synthesis** | Medium | Centered text | `A clearer perspective.` / `Research brought together into one assessment.` |
| **06 — Investment Assessment** | **Highest** | Large central white document | Only an unobtrusive `06 / INVESTMENT ASSESSMENT` label. White assessment is fully legible, documents remain around it. |

Text beats and visual beats must **never demand equal attention simultaneously**. During text, the paper artifacts remain mounted but near-invisible. During visuals, remove the giant headline entirely; leave only a small editorial section label.

### Section 03 — Behind the Intelligence

Compact, one screen or less if feasible. Focus on **your engineering contribution** rather than another cinematic diagram:

- Headline, e.g. `Built to connect the context.` (provisional; can match verified implementation better).
- A very short explanation of the real agent workflow; inspect code first.
- A concise contribution statement, grounded in the repo/current project content. The presently safe wording is: `Co-built a Python/LangGraph investment research agent in under a month.`
- Only show detailed nodes such as retrieval, tools, orchestration, memory, or structured output if confirmed by code. If unknown, do **not** produce a fabricated architecture chart or pretend a specific data source is integrated.
- Link to demo/site/repository **only if an actual destination exists**. Reuse the existing external-link styles.

The engineering narrative should **also influence Beat 04 and Beat 06**, not live exclusively here: the selected evidence and cited output are the visible explanation of the system's value. Do not suggest that the model algorithmically verified a source merely because it highlighted it in the mock.

---

## 2. Canonical research case (illustrative, single source of truth)

The real agent's research output has not been supplied. **Use the following as one explicitly fictional design fixture** until a real run is available. Make replacing it with actual case data easy. The example should be labeled, e.g. `ILLUSTRATIVE RESEARCH CASE · NOT LIVE MARKET DATA`, in the desk corner and/or assessment footer (visible, tasteful, not buried in an aria-only label).

**Fictional company:** ACME (`ACME` is a placeholder, not a verified ticker).  
**Research question:** `Do improving fundamentals justify further research into ACME, considering valuation concerns and existing portfolio exposure?`

### The same five artifacts, everywhere

| Stable ID | Fixed home position | Document | Canonical content | Provenance |
|---|---|---|---|---|
| `news` | Upper-left | **Market News** | `Company reports a strong quarter, citing higher revenue and improved margins.` | Illustrative news report; secondary reporting, not direct verification |
| `discussion` | Upper-right | **Investor Discussion** | Opinion A: `Execution looks encouraging.` Opinion B: `Valuation may be getting stretched.` | **Investor opinions**, not verified facts |
| `fundamentals` | Lower-left | **Company Fundamentals** | `Revenue: +12.4% YoY` · `Operating margin: 18.7% (+3.1 percentage points)` · `Net income: +15.9% YoY` | Illustrative financial measurements; primary-style data |
| `market` | Lower-center | **Market Data** | `6-month return: +14.2%` · `Sample price: 124.36` · `52-week range: 89.10–132.40` · `Average volume: 4.2M` | Illustrative market observations, **not** prediction or intrinsic-value proof |
| `portfolio` | Lower-right | **Portfolio Context** | `Position weight: 16%` · `Sector: Technology` · `Illustrative allocation band: 10–20%` | Illustrative private portfolio context |

**Do not repeat the prior mock errors** (14.2% as both market performance and portfolio weight, changing figures, inconsistent dates, invented new product launches). Avoid a fabricated FT article date, invented Reddit username/vote counts, and publisher-specific sourcing unless it is demonstrably true. Use generic `MARKET NEWS` and `INVESTOR DISCUSSION` identities by default. Use familiar editorial visual cues without implying paid subscriptions or official third-party integrations.

### Exactly four meaningful magenta selections in Beat 04

1. **`F1` — FACT / FUNDAMENTALS:** `Revenue +12.4% YoY`.
2. **`F2` — FACT / FUNDAMENTALS:** `Operating margin 18.7% (+3.1 pp)`.
3. **`O1` — OPINION / DISCUSSION:** `Valuation may be getting stretched.` The `OPINION` label remains explicit and visible.
4. **`P1` — CONTEXT / PORTFOLIO:** `Position weight 16%; allocation band 10–20%.`

The Market News card and Market Data chart should still contribute context, without requiring every source to glow. The four selections are the emphasized discoveries, not an assertion that other sources were discarded.

### One central white Investment Assessment in Beat 06

Maintain the **approved output structure**; if inspection of the actual product reveals a different exact structure, adapt this while keeping the same conceptual categories. Proposed default:

- **THESIS:** `ACME's illustrative results indicate improving operations worth investigating further; valuation and position sizing remain important uncertainties.` This is synthesis/inference, **not established financial fact**.
- **SUPPORTING EVIDENCE:** `Revenue +12.4% YoY [F1]`; `Operating margin 18.7% (+3.1 pp) [F2]`; supporting context `Market news reports a strong quarter [N1]` and `6-month market return +14.2% [M1]`. Do not describe market return as evidence of future returns.
- **RISKS & COUNTERPOINTS:** `Investor discussion questions valuation [O1 — Opinion]`; `A strong recent share-price move does not resolve valuation risk`; other genuine risks only if documented.
- **PORTFOLIO IMPLICATION:** `Illustrative position weight is 16%, inside a 10–20% illustrative band [P1]; concentration and risk tolerance still need review.` Do not turn this into a personalized buy/sell recommendation.

Evidence chips / IDs should match the source artifact IDs. **Facts and investor opinions must not receive identical provenance labels.** Place optional tiny source references along the assessment's margins or inside its rows, never as conspicuous lines crossing the document.

The fixture should be maintained in **one typed data module** and rendered into **all three desk states** and the assessment. Never duplicate hardcoded numbers across components. See the bundled `research-case.fixture.json` as the content seed.

---

## 3. Master composition — one physical desk, three visual states

### Stage and art direction

- Cream / warm off-white background from ALDO's real design tokens; black display typography; gray-blue annotation text; restrained vibrant magenta used **only** for the brand accent and selected source evidence.
- Preserve current ALDO typefaces. Do not fetch new fonts just for this project. Oversized heavy sans-serif for text beats, monospace for editorial indices, serif **only inside the fictional newspaper artifact** if useful.
- Five distinct **HTML/SVG/CSS papers**, not a giant flattened screenshot. Desktop uses a common paper layout coordinate system / CSS grid + anchored transforms.
- Enough negative space for the documents to read at regular desktop widths. Textures, fold lines, subtle edge shading, and realistic depth are fine, but no scrapbook clutter; reduce torn edges, paper clips, oblique rotations, and drop-shadow strength compared with the loosest mocks.
- No dark fintech dashboards, glowing neural networks, neon line webs, WebGL scene, or automatic stock ticker animation.
- Preserve the same physical identities and consistent approximate positions across A/B/C. Stable DOM nodes and IDs are required.

### State A / Sources (Beat 02)

- Documents arranged in the fixed five-position grid, with intentionally varied scale and typography.
- Modest rotations and overlaps can suggest fragmented research; **all five remain legible**.
- Nearly monochrome. Minimal pink—do not pre-highlight the evidence that will appear in B.
- No large central agent box, no assessment obscuring sources, no headline in the desk composition.
- Viewing interval is genuinely quiet.

### State B / Evidence (Beat 04)

- Same five physical documents, same text and numerical values. Minor translation/scale changes allowed only to increase readability.
- Exactly four selected fact/opinion/context marks appear at **their actual source locations**; use tinted highlight shapes behind words or bars, not arbitrary lines floating over the card.
- Highlighting should be semantically deliberate: `FACT`, `OPINION`, `PORTFOLIO CONTEXT` metadata stays visible.
- Do not dominate the middle with a black box. If any central organizing hint is present, keep it subtle.
- The final state must remain still, with enough time to inspect each highlighted item.

### State C / Assessment (Beat 06)

- The **white assessment document is the single largest and clearest element on the page**; center it and use a restrained magenta rule or corner mark.
- Same five sources remain around it. They can translate outward, scale down slightly, become lower contrast, or tuck behind its edges while maintaining identity.
- Assessment is never obscured by strings, data points, decorative icons, or connectors.
- Keep thesis, evidence, risks/counterpoints, portfolio implication distinct and readable. Source tags connect each claim to the original cards.
- Visually hold this final moment **longer than the other states**. Make it a satisfying, legible payoff.

**Fidelity check:** A viewer should be able to identify the Market News, Investor Discussion, Fundamentals, Market Data, and Portfolio Context artifacts in all three frames, without learning a new layout.

---

## 4. Six-beat desktop storytelling and GSAP behavior

**Implement in two passes:**

**Pass A — Static:** Build all six authored states first. Create a development-only preview mode that can jump to `intro`, `sources`, `explain`, `evidence`, `synthesis`, `assessment` without scrolling. Capture reference-sized screenshots and check composition before writing animation logic. Keep this preview outside the production UI.

**Pass B — Motion:** Only after the static states look excellent, use GSAP/ScrollTrigger for **one continuous scroll-controlled composition**. Use the site's existing animation stack. One dominant pinned scene is preferred on spacious desktop viewports; avoid nested pins and pinned elements that overlap navigation.

### Choreography — specify *intent*, not gimmicks

| Transition | Intent | Behavior |
|---|---|---|
| 01 → 02 | Give the sources the screen | Centered intro exits; same mounted papers become fully legible and occupy the visual field. The documents settle into the canonical positions. |
| 02 → 03 | Return to one idea | Papers subdue substantially but do not remount or turn into new images; centered text `Find the evidence.` becomes the focus. |
| 03 → 04 | Show discovery | Text leaves; same papers regain visibility; 4 **actual** evidence marks become magenta. Do not draw unnecessary network connectors. |
| 04 → 05 | Create anticipation | Highlights and paper documents become quiet. Centered `A clearer perspective.` appears without simultaneous competing output. |
| 05 → 06 | Deliver the result | Text leaves; the five papers gently recede outward/scale down; the **large white assessment sheet emerges** in the center. Source IDs and the four selected findings remain traceable. |

### Pacing rules

- **Do not** repeat the previous proposed 1.4-viewport animation. This is six storytelling beats, with **short transitions and generous still holds**.
- Prioritize visual viewing intervals over text intervals. The final assessment is the longest, strongest hold; Source and Evidence are also substantially longer than the three typography moments.
- Tune scroll distances by browser-testing readability at 1440×900 and 1920×1080 rather than locking arbitrary values from this document. A good starting priority weighting is: `intro 9% · sources 22% · explain 9% · evidence 23% · synthesis 9% · assessment 28%`, with transition time counted inside each segment. Adjust when testing.
- On entering each text beat, the research desk is nearly invisible (e.g. opacity around 0.03–0.1 based on actual legibility), but **remains the same DOM**.
- No autoplay between beats, no forced snapping, no scroll hijacking, no invisible reading-time traps, and no effect that demands waiting for the page to advance.
- Scrubbing should work forward and backward with no jumps, snapping, empty-frame flashes, teleportation, or source-value changes.
- Only animate transform and opacity where feasible; highlighted spans may use lightweight mask/clip or opacity transitions. Avoid animated CSS blur and large filter effects.
- For the assessment, animate its transform/opacity, not dozens of independently moving paragraphs; keep the text crisp.

### Implementation guidance (not copy-paste architecture)

- Build a single stable `ResearchDesk` scene with separately addressable source nodes and the assessment node. Content is derived from the shared fixture.
- Model the six authored states as layout/visual presets, or maintain a GSAP timeline with explicit beat labels and hold sections. **Do not render six unrelated full-screen copies of the documents.**
- Pin a stable container and animate descendants, **not the pinned element itself**.
- Scope GSAP selectors to the component root; use cleanup (`gsap.context()` / React cleanup and `gsap.matchMedia()` as appropriate). Make it safe for navigating away/back through Astro ClientRouter or whichever routing system is present.
- Calculate dimensions after fonts and scene layout stabilize; refresh ScrollTrigger on genuine layout changes, not on every scroll event.
- Derive responsive motion from the same semantic markup, never from six large raster image layers.
- Use `will-change` sparingly and remove it when no longer necessary; avoid permanently compositing dozens of elements.

Official references: [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/), [Astro ClientRouter lifecycle](https://docs.astro.build/en/guides/view-transitions/) (only if Astro navigation is actually enabled).

---

## 5. Responsive behavior — design it, don't shrink it

### Desktop ≥ ~1024px (exact breakpoint based on repo)

- Scroll experience can use one pin with the six beat timeline.
- Five-source physical desk may be two rows with news upper-left, discussion upper-right, fundamentals lower-left, market chart lower-center, portfolio context lower-right.
- White assessment takes center stage in final state, with reduced surrounding papers still identifiable.

### Tablet / narrow laptop

- Verify every card remains readable; simplify overlap and rotations, allow tighter typography, and consider shortening or disabling the pin when viewport height is limited.
- A 1024px-wide viewport with 600px height should not crop the assessment or make the header unusable.

### Mobile ≤ ~767px

- **No long desktop pinning sequence.** Use six naturally stacked, readable chapters, retaining the same alternating text/visual rhythm.
- The five sources should reflow into a tidy vertical or compact 2-column order with readable text, not a desktop desk scaled to 390px.
- Repeat or reposition source papers as necessary in normal-flow mobile layout, but keep content and identity consistent. The final assessment becomes a wide single-column white document with useful margins, source tags, and a clear reading order.
- Optional short entrance transitions are fine but **not required**; avoid scroll locking, sideways overflow, and tiny charts.
- Design explicitly for a 390×844 phone; also test 320–360px widths.

### Reduced motion / JS unavailable

- For `prefers-reduced-motion: reduce`, remove pinning and scrub transforms. Render accessible semantic content in natural document flow, with intro → sources → evidence → assessment and the text explanations intact.
- If JavaScript does not execute, the page must still communicate the project and assessment (static HTML, appropriate CSS defaults). **Never initialize core content as permanently hidden.**
- Avoid making users scroll a long empty pinned area under reduced motion.

---

## 6. Content, source integrity and accessibility

- Separate **financial measurements** (`FACT`), **observed price movement** (`MARKET DATA`), **secondary news reporting** (`NEWS`), **investor commentary** (`OPINION`), **private portfolio context** (`CONTEXT`), and **the agent's synthesis** (`ASSESSMENT`). These are *not interchangeable*.
- Magenta means `selected for consideration`, **not verified truth or confidence**. Never call an investor quote a fact. Risks and counterpoints must remain visible.
- A citation chip points to the correct selected source item; it must have a keyboard-accessible textual equivalent. Any clickable chip must actually work, e.g. focus/highlight its source or scroll to the source in mobile flow. If interactive linking adds too much scope, use noninteractive source IDs but do not style them as buttons.
- News publisher logos, Reddit identity, quotes, paywalled headlines, percentages, and timestamps should not imply actual partner integrations. **Generic source treatments by default**; use real branding only after verifying actual provenance and usage rights.
- The four marked evidence items must be from the same dataset shown in the source documents; no visually impressive fabricated transitions.
- Use real HTML heading order and paragraphs; card content should be selectable text, not embedded in a PNG or hidden in SVG paths. Give charts an accessible summary.
- Avoid using only color to distinguish opinion vs. fact: use text labels and/or icons as a secondary channel. Ensure readable contrast on cream and within magenta highlights.
- Respect focus order and tab navigation; do not steal scroll or focus during scrubbed transitions.
- Keep copy short; don't explain things that the visuals can demonstrate.

---

## 7. Performance and code quality

- Do not load a heavy 3D engine, remote video, or six giant mock images to deliver this page. The screenshots are only design references.
- Prefer DOM/CSS/SVG for papers, mini-charts, source markers, and assessment; compress any real decorative raster asset and lazy-load below the fold.
- Reuse existing code splitting and page bundling. Load any animation code only where it is needed; make sure the hero is meaningful before animation loads.
- Avoid per-scroll React state changes that re-render the whole desk. Animate DOM nodes with GSAP after render; keep chart and content data immutable.
- No large animated shadows, backdrop filters, continuous floating loops, gratuitous particle fields, giant CSS blurs, or redundant timeline instances.
- Prevent content shifting and double pins after navigation. Handle resize, orientation change, theme change (if applicable), and browser back/forward.
- Keep all components small, typed, and maintainable. Suggested logical pieces (adapt to repository): `TradingAgentPage`, `ResearchDesk`, `SourceArtifact`, `EvidenceHighlight`, `AssessmentDocument`, `ResearchDeskTimeline`, `ResearchCaseData`.
- Write targeted tests or at least testable pure data mappings for evidence IDs → assessment source references. Make invalid references detectable.

---

## 8. Acceptance criteria — do not call it done until these pass

### Visual consistency

- [ ] Hero looks native to ALDO/Knowledge Bridge, not like a standalone fintech template.
- [ ] Text beats 01, 03, 05 are centered and visually quiet; the documents are barely perceptible.
- [ ] Beats 02 and 04 are **full-width desk compositions with no competing large headline**.
- [ ] Same five identifiable document artifacts, same content, same canonical coordinates/relative positions across 02, 04, 06 (only gentle repositioning at 06).
- [ ] Exactly four semantically meaningful magenta selections in 04, with opinion clearly labeled.
- [ ] Large **white** Investment Assessment is the strongest visual element in 06, not obscured by connectors or copy.
- [ ] Decorative styling is restrained: thin rules, soft shadows, careful paper detail, lots of cream negative space.

### Trustworthiness

- [ ] All case numbers and terms match `research-case.fixture.json` everywhere and are marked illustrative.
- [ ] Assessment references resolve to real document entries and distinguish facts from opinions.
- [ ] No fake proven integrations, live market claims, fabricated user/financial performance, personal engineering ownership, or autonomous buy/sell execution claim.
- [ ] Engineering copy accurately reflects verified code/contribution; list any unverified claims that were intentionally omitted.

### Interaction / accessibility

- [ ] No flashing transitions or teleporting papers when scrolling in either direction.
- [ ] Reading/viewing intervals are noticeable; Beat 06 has the strongest/longest hold.
- [ ] Normal scroll continues past the section into the engineering section; scroll works with mouse, trackpad and touch.
- [ ] 390×844 mobile is natural-flow, legible, and has no desktop-length pin or horizontal overflow.
- [ ] Reduced motion and no-JS experiences show meaningful readable content without a blank scene.
- [ ] Keyboard navigation, source IDs, contrast, focus, and chart summaries are accessible.

### Technical

- [ ] Lint/typecheck/build pass using the project's normal commands.
- [ ] Verify direct URL load, browser back/forward, returning to this route after a navigation, and resize/orientation.
- [ ] No GSAP/ScrollTrigger leaks or duplicated pins after route navigation.
- [ ] Profile the actual page: no avoidable layout shift, excessive image transfer, severe scroll jank, or runaway animation CPU usage.
- [ ] Capture **six desktop screenshots** (one per beat) plus mobile views of Sources and Assessment, and compare visually to the references.

---

## 9. Execution order and deliverables

1. **Audit** repo conventions and verify existing Trading Agent/source and output information. Report what is known versus illustrative.
2. **Data foundation:** create a typed canonical research case; build source/reference validation and provenance labels.
3. **Static milestone:** implement hero + one master Research Desk + engineering section; expose six development-only static states and capture screenshots. Refine until visuals are excellent *before* adding motion.
4. **Scroll choreography:** implement the approved six beats using a continuous scene and readable holds. Do not introduce new visual concepts or effects.
5. **Mobile/accessibility/performance:** natural flow mobile, reduced motion, no-JS fallback, cleanup, performance tuning.
6. **Final report:** list changed files, architectural choices, exact claims verified from the repo, any illustrative placeholders, before/after screenshot paths, results of lint/build/test, and remaining blockers. If browser/screenshot tooling is unavailable, say so instead of declaring visual acceptance.

### Explicit non-goals

- No redesigned ALDO global navigation, work index, Knowledge Bridge page, or typography system.
- No extra product feature carousel, dark trading terminal, heavy 3D, or generic AI agent hologram.
- No additional major pinned sections after the Research Desk.
- No inventing a real company analysis or misrepresenting the fictional fixture as actual research.
- No new concept ideation: **this storyboard is approved**. Execute and polish it.

**North star:** *Knowledge Bridge visually navigates a knowledge network. Los Trading Hermanos visually transforms disparate financial materials into a traceable investment assessment.* Same ALDO polish, different signature interaction.
