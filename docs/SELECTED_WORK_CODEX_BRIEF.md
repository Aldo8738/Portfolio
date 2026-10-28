# Taquería Aldo — Selected Work: implementation brief for Codex

> **Scope:** Build the **Selected Work** experience only. Keep the existing 3D taquería, global navigation, CV, About, and Contact intact. This is an implementation handoff, not permission to redesign the whole portfolio.
>
> **Start by inspecting the repository.** Identify the actual framework, routes, current taquería-to-content transition, design tokens, animation setup, and component conventions. The portfolio has previously been planned around Astro + TypeScript, React islands, Three.js/React Three Fiber, and GSAP, but **the repository is the source of truth**. Adapt the paths and code below rather than blindly scaffolding a second system.

## 1. Creative direction

### The concept: _Connected Worlds_

Replace the conventional project-card grid with a **minimal, interactive, knowledge-graph-inspired exhibition of projects**.

- The Work page starts with an editorial, spatial overview containing four **project labels/nodes** placed asymmetrically in a generous cream-colored canvas.
- Very thin, sparse paths hint at meaningful connections between projects. They are **not** a fully connected network and do not need a central “ALDO” node.
- Selecting a project brings it into focus: its title and concise copy appear beside an **art-directed, project-specific visualization**.
- Scrolling can progress naturally through the four project-focused views. The graphic language evolves from knowledge relationships → research flows → sensor connections → circuit traces.
- The visitor can enter a dedicated project detail page for the complete case study.
- The mood is **Swiss/editorial information design, architectural diagrams, restrained warmth** — **not** “futuristic AI dashboard,” sci-fi neon, glowing orbs, glassmorphism, or a gamified graph editor.

**Central principle:** _Keep the composition quiet. Let GSAP supply the moment of discovery, not visual clutter._

### Why this fits the portfolio

The taquería is the playful, cinematic introduction. Work becomes a cleaner, more mature exhibition that rewards exploration. It should feel like a coherent continuation of the original mock: warm off-white/cream, near-black typography, fine rules, tiny pink accent, muted cool grays/blues, and generous whitespace.

Avoid trying to bring the taco stand's props or 3D scene into every section. No new Three.js scene is necessary for Work.

## 2. Non-negotiable design constraints

1. **Not a card grid.** Do not build four bordered feature cards on a dashboard.
2. **Not an actual graph editor.** No draggable canvas, free-form pan, forced zoom gestures, or complicated graph navigation. The graph is a curated visual metaphor, not a productivity UI.
3. **No central logo orb.** The ALDO wordmark stays in the header, not as the graph's root node.
4. **Do not overpopulate the screen.** Initially show just the project labels, a few discrete points, and a handful of near-invisible curves.
5. **No fake screenshots.** The preview graphics are deliberately **interpretive illustrations** of each real project, not claims about the UI of the apps. Don't create fictional financial results, fake company recommendations, or inaccurate technical architecture.
6. **Short copy at this level.** Hooks and a real highlight; full stories live on `/work/[slug]` (or the repo's existing route convention).
7. **Keep direct navigation usable.** Every project must be selectable by mouse, touch, and keyboard. CV, About, Contact remain ordinary accessible navigation links.
8. **Prefer SVG, DOM, CSS and GSAP** over WebGL for this page. Minimize JavaScript and runtime rendering cost.
9. **Respect reduced motion.** The full experience must remain navigable and understandable when all animation is disabled.
10. **Preserve current functionality.** Do not break the taquería, existing page transition, back-to-stand action, audio toggle, or mobile layout.

## 3. Information architecture / user journey

### A. Enter Work

- Primary entry: the retro monitor's **Explore my work** action in the 3D taquería.
- If the current implementation already has a convincing monitor-to-page transition, **preserve and adapt it**. Do not replace it unnecessarily.
- On arrival, show the editorial Work header and the constellation overview. A subtle few-hundred-millisecond settling animation is sufficient. Never delay rendering the content for animation.
- Support direct navigation to `/work` without making users watch the taquería transition.

### B. Overview state

**Top navigation:** `ALDO.` | `Work` (active) | `CV` | `About` | `Contact` | `Back to stand ↗` (match existing IA and styling).

**Headline:** `Selected work.`

**Subheadline:** `Different problems. Same curiosity.`

Four labeled points distributed asymmetrically, with generous negative space:

- `01 / HUMAN–AI` — **Knowledge Bridge**
- `02 / AGENTIC AI` — **Trading Agent**
- `03 / HARDWARE` — **Herby**
- `04 / SYSTEMS` — **Custom CPU & OS**

Use thin charcoal/gray hairlines and a restrained number of connection dots. **Connections must communicate real thematic relationships**, e.g. Knowledge Bridge ↔ Trading Agent (human–AI/agent systems) and Herby ↔ Custom CPU & OS (hardware/low-level systems); avoid arbitrary spiderwebs. A subtle third bridge can reference automation/systems thinking if it reads clearly. For accessibility, the project titles are genuine links or buttons, not labels painted into canvas/SVG with no interaction semantics.

### C. Project focus state

On hover/focus of a project:

- Selected label becomes slightly stronger; pink accent appears sparingly.
- Related lines become visible and unrelated labels soften **without becoming unreadable**.
- Show one short hint if useful, e.g. `Explore project ↗`.

On click/tap/Enter:

- Animate the selected spatial label into a **focused editorial project view**: text on one side and project visualization on the other.
- Provide a clear `View project ↗` link that opens its dedicated page.
- Allow users to move to next/previous project via scrolling and/or explicit controls; never trap scroll.
- Provide a way back to the constellation overview (or allow Back / a clearly labeled overview action).
- Keep browser history/navigation and direct routes coherent.

### D. Sequential exploration

The page should still be understandable as a vertically scrollable site. Visitors can browse four project-focused sections naturally. If using ScrollTrigger, animate only when sections are near view; don't impose long forced pinning. One meaningful inter-project morph or continuity effect is more valuable than four elaborate animations.

### E. Project detail pages

Clicking **View project** navigates to a real, accessible case-study URL. These pages can be built incrementally; for this phase, reuse the shared project data to render at least an accurate hero, brief overview, key facts and a back-to-Work control. **No broken links, fake metrics, filler lorem ipsum, or invented case-study details.** Do not spend this phase designing elaborate detail pages.

## 4. Visual direction per project

These are **concept visualizations**, not literal reproductions of app UIs. Favor beautiful composition, restrained animation, and accurate underlying ideas.

### 01 — Knowledge Bridge: relationships + progressive rendering

**Thumbnail / overview:** precise, sparse hierarchy with delicate gray curved connections, small blue nodes and one pink selected node.

**Focused visualization:** a stylized hierarchical knowledge structure **inspired by the real thesis screenshots**: linked _entity cards_ with tags/relationships and different levels of detail across zoom scales. Do **not** replace it with an unrelated generic radial bubble network.

**Motion narrative:**

1. An initially broad tree hints at graph complexity.
2. The viewport advances toward one branch; a limited set of entity cards becomes readable while distant detail fades or disappears.
3. One entity tag/relationship can change to demonstrate a human correction.

This mirrors the real work: refactoring a broken proof of concept, redesigning the UX, adding WebSocket-based progressive transmission, backend graph pagination/prioritization, and custom viewport/zoom-dependent lazy rendering on the frontend. Human corrections to AI-generated tags and relationships were sent back for backend learning.

**Highlight:** `81% less loading time · 72% faster task completion`.

Do not label the project as having invented an entire BERT graph generation system: that work predated the user's contribution.

### 02 — Trading Agent: context-aware research

**Thumbnail / overview:** a calm information-flow motif — a few inputs feeding a single research analysis, with muted blue and one magenta highlight.

**Focused visualization:** abstract but intelligible input-to-insight flow:

- Inputs: `News`, `Forums`, `Company data`, `Portfolio context`.
- Processing: `Research agent` (LangGraph-driven workflows, without pretending to show an exact internal node topology).
- Outputs: `Investment thesis`, `Pros & cons`, `Risk profile`.

A small elegant research result may appear; **not** a huge fictional market dashboard. No invented prices, returns, tickers or confident profit claims.

Actual product capabilities, for later case study content: daily research typically surfaces 1–3 opportunities when warranted; evaluates company fundamentals, positives, negatives and risks; tracks holdings/trades, values, geographic/sector/currency diversification; offers Discovery/watchlist of followed companies; and supports a contextual real-time LLM chat, including company-specific quick questions. Co-built with a colleague in less than a month using AI extensively in ideation, UX, implementation, testing and review.

**Highlight:** `Co-built in under a month`.

### 03 — Herby: physical feedback loops

**Thumbnail / overview:** a quiet botanical silhouette and a simple sensor line.

**Focused visualization:** a carefully art-directed hydroponic tray (2D/2.5D illustration is enough) with a few restrained sensor indicators and lines explaining measurement → decision → actuator. Keep all readings non-numeric or explicitly illustrative unless verified; avoid made-up sensor logs.

**Highlight:** `Automated hydroponics on a €100 budget`.

The user led software development and sensor setup/integration as part of a university team project.

### 04 — Custom CPU & OS: from hardware to software

**Thumbnail / overview:** a sparse grid of circuit traces or a simple CPU silhouette.

**Focused visualization:** minimalist exploded or layered processor/circuit illustration; paths transition into a very restrained assembly/boot motif. If showing code, keep it clearly illustrative rather than implying it is original project source.

**Highlight:** `One architecture. Two semesters. Hardware to OS.`

Actual project: CPU hardware defined in VHDL in one semester, an operating system implemented in C/Assembly the next, with documentation/register-manual debugging challenges. The architecture was inspired by hardware comparable to the Raspberry Pi 2B, but avoid claiming the team designed the Raspberry Pi 2B itself.

## 5. Content architecture — data first, not hardcoded JSX

Store the project content in **one canonical typed collection**. Adding a fifth project should require a new object and optionally a new visual implementation — **not** editing multiple navigation lists, card layouts, and bespoke route conditionals.

Use the repository's existing content layer if one exists (Astro content collections, JSON, TS modules, CMS, etc.). Otherwise prefer **TypeScript objects** to raw JSON because they give compile-time checks and allow visual component registries separately. Keep data **serializable**: no React elements, functions or GSAP timelines inside project definitions.

### Suggested type model (illustrative; adjust to actual stack)

```ts
// src/data/projects.ts (or existing content collection)
export type VisualizationKind =
  | 'knowledge-hierarchy'
  | 'research-flow'
  | 'hydroponic-system'
  | 'cpu-architecture';

export interface Project {
  id: string; // immutable stable ID / slug
  order: number; // explicit display ordering
  title: string;
  eyebrow: string; // e.g. "HUMAN–AI"
  year: string; // visible metadata, not a Date object
  hook: string; // short attention-grabbing line
  summary: string; // 1–2 sentences max for focused Work view
  highlight?: string; // only confirmed figures or facts
  tags: string[]; // keep out of overview; sparse in focus
  visualization: {
    kind: VisualizationKind;
    accent: 'pink' | 'blue' | 'neutral'; // semantic design-token key
  };
  caseStudy: {
    path: string; // canonical detail route
    intro: string; // accurate minimal page introduction
    role?: string;
    technologies?: string[];
  };
}

export const projects: Project[] = [
  {
    id: 'knowledge-bridge',
    order: 1,
    title: 'Knowledge Bridge',
    eyebrow: 'HUMAN–AI',
    year: '2024',
    hook: 'Making AI-generated knowledge human-friendly.',
    summary:
      'A real-time workspace for exploring, editing, and collaborating with AI on knowledge graphs.',
    highlight: '81% less loading time · 72% faster task completion',
    tags: ['React', 'TypeScript', 'WebSockets', 'Python', 'FastAPI'],
    visualization: { kind: 'knowledge-hierarchy', accent: 'pink' },
    caseStudy: {
      path: '/work/knowledge-bridge',
      intro:
        'I joined an early knowledge-graph proof of concept and redesigned its architecture, performance, UX, and human–AI interactions.',
      role: 'Full-stack development, UX, performance, human–AI interaction',
      technologies: ['React', 'TypeScript', 'Python', 'FastAPI', 'WebSockets'],
    },
  },
  {
    id: 'trading-agent',
    order: 2,
    title: 'Trading Agent',
    eyebrow: 'AGENTIC AI',
    year: '2026',
    hook: 'Less market noise. More relevant opportunities.',
    summary:
      'A context-aware investment research app combining market intelligence, portfolio analytics, discovery, and AI conversations.',
    highlight: 'Co-built in under a month',
    tags: ['LangGraph', 'Python', 'AI'],
    visualization: { kind: 'research-flow', accent: 'blue' },
    caseStudy: {
      path: '/work/trading-agent',
      intro:
        "Together with a colleague, I co-built a research application that evaluates potential opportunities in the context of a user's portfolio.",
      role: 'Product ideation, UX, implementation; co-built with a colleague',
      technologies: ['Python', 'LangGraph'],
    },
  },
  {
    id: 'herby',
    order: 3,
    title: 'Herby',
    eyebrow: 'HARDWARE · IOT',
    year: '2023',
    hook: 'A smarter garden on a €100 budget.',
    summary:
      'An automated hydroponics system built under tight hardware constraints.',
    highlight: '€100 project budget',
    tags: ['IoT', 'Embedded systems', 'Automation'],
    visualization: { kind: 'hydroponic-system', accent: 'neutral' },
    caseStudy: {
      path: '/work/herby',
      intro:
        'For a university team project, I led software development and sensor setup for a budget-constrained automated hydroponics system.',
      role: 'Software development lead, sensor integration',
    },
  },
  {
    id: 'custom-cpu-os',
    order: 4,
    title: 'Custom CPU & OS',
    eyebrow: 'SYSTEMS · LOW-LEVEL',
    year: '2023',
    hook: 'Building software from the hardware up.',
    summary:
      'Two semesters spanning a VHDL-defined processor architecture and a low-level operating system.',
    highlight: 'VHDL → C & Assembly',
    tags: ['VHDL', 'C', 'Assembly'],
    visualization: { kind: 'cpu-architecture', accent: 'neutral' },
    caseStudy: {
      path: '/work/custom-cpu-os',
      intro:
        'Our university team modeled a processor architecture in VHDL, then built an operating system for it using C and Assembly.',
      role: 'University team project; individual responsibilities not yet specified',
      technologies: ['VHDL', 'C', 'Assembly'],
    },
  },
];

// Optional helpers; never assume that array position *is* the ID.
export const orderedProjects = [...projects].sort((a, b) => a.order - b.order);
export const projectById = new Map(
  projects.map((project) => [project.id, project]),
);
```

**Data quality notes:** Keep copy in content objects, not scattered in JSX. Respect the exact user-contributed facts above. Do not invent measures, dates, employers, user roles, or returns. When more detailed project material becomes available, expand `caseStudy` with typed optional sections or a content collection rather than inflating the overview record with long strings.

### Relationships / overview geometry

Keep the optional relationship definition **separate** from project data; an edge means a thematic connection, not a navigation hierarchy:

```ts
export type ProjectLink = {
  source: string; // valid project ID
  target: string; // valid project ID
  theme: string; // e.g. "human–AI systems"
};

export const projectLinks: ProjectLink[] = [
  { source: 'knowledge-bridge', target: 'trading-agent', theme: 'AI systems' },
  { source: 'herby', target: 'custom-cpu-os', theme: 'hardware & systems' },
];
```

Use a small responsive **layout configuration** for each node's _visual position_ (percentage positions or an SVG viewBox coordinate), keyed by `project.id`, rather than embedding positions into the content or computing a force-directed layout. Keep hit areas large despite tiny graphical points. Provide a simpler, non-overlapping layout at tablet and mobile breakpoints.

### Visualization registry

Implement visualizations as isolated, swappable components keyed by `visualization.kind`:

```ts
// Example React mapping; preserve actual repo conventions.
const visualizations = {
  'knowledge-hierarchy': KnowledgeHierarchyVisual,
  'research-flow': ResearchFlowVisual,
  'hydroponic-system': HydroponicSystemVisual,
  'cpu-architecture': CpuArchitectureVisual,
} as const;
```

Each visual should accept a minimal API such as `{ active, reducedMotion, progress? }`. Use shared tokens for typography, strokes and spacing but allow each project its own visual grammar. Only instantiate/mount expensive visuals when needed; avoid animating all four continuously in the background.

## 6. Suggested component boundaries

_Names and paths are illustrative, not requirements to override the existing project._

```text
src/
  data/
    projects.ts                 # canonical typed content
    projectLinks.ts             # meaningful edges / optional layout config
  components/work/
    WorkExperience.*            # composition and focus state
    WorkHeader.*                # editorial heading (or reuse site header)
    ProjectConstellation.*      # overview, labels, sparse connections
    ProjectFocus.*              # shared focused text/content shell
    ProjectVisual.*             # visualization registry wrapper
    visuals/
      KnowledgeHierarchyVisual.*
      ResearchFlowVisual.*
      HydroponicSystemVisual.*
      CpuArchitectureVisual.*
    work.css                    # reuse existing tokens where possible
  pages/work/
    index.*                     # overview + focus experience
    [slug].*                    # content-driven detail route / existing equivalent
```

Recommended separation:

- **Project data** = copy, ordering, routes, verified facts.
- **Graph geometry** = authored/responsive coordinates and decorative relationships.
- **UI state** = current focused project ID, overview vs focus, accessible navigation.
- **Animation** = GSAP timeline/effects and cleanup, isolated from data.
- **Project visual** = scalable SVG/DOM composition for the chosen project.

This separation is what makes the system extensible.

## 7. GSAP / interaction specification

### Motion vocabulary

- **Overview reveal:** heading and 4 labels gently appear; a few paths draw in. No large dramatic fly-in.
- **Hover/focus:** selected project increases contrast, connected paths emerge, nearby node responds by just a few pixels (or not at all). Avoid whole-network agitation.
- **Overview → focus:** move toward / recompose the chosen project; project graphic assembles progressively; short text reveal. Prefer transitions based on transform/opacity, with SVG paths as secondary accents.
- **Between projects:** use one recurring visual thread: the selected lines resolve into the next project's flow/sensor/circuit visual. Achieve via crossfade, line path morph _if straightforward_, or coordinated SVG elements. **No requirement to license paid GSAP plugins or simulate actual topology.**
- **Focus → detail route:** a clean visual handoff, with a plain navigation fallback.

GSAP details:

1. Reuse the site's existing GSAP initialization and routing conventions; do not load GSAP in global layout if not necessary.
2. Scope selectors; use `gsap.context()` or the framework-equivalent cleanup strategy. Revert on unmount/navigation.
3. If using `ScrollTrigger`, refresh only when layout changes; clean up associated triggers and media-query timelines.
4. Use `gsap.matchMedia()` or equivalent breakpoint handling. Don't animate mobile as though it's a wide desktop canvas.
5. Reduce motion: skip authored morphs and use immediate visibility/state transitions for `prefers-reduced-motion: reduce`.
6. Animate mostly `transform` and `opacity`; SVG stroke dash/path only for a small bounded number of paths. Avoid layout thrashing, gigantic blur/glow filters, full-screen video, perpetual RAF loops, and costly SVG filters.
7. Don't intercept scroll indefinitely, lock focus, or require drag/hover to expose core content.
8. If transitioning from Three.js, pause/unmount or minimize the 3D scene's render work once the Work page owns the viewport, following the repo's existing lifecycle.
9. No animation should obscure or delay a semantic content-first initial render.

Do not optimize for “most effects.” Optimize for **intentional, fast, reversible transitions**.

## 8. Responsive & accessibility requirements

### Desktop

- Large negative-space overview with intentionally asymmetric node placement.
- Focus layout: concise project editorial content (~30–40% width) and strong visualization (~60–70%).
- Fine lines and small decorative nodes are okay; **interactive targets must still be comfortably sized**.

### Mobile / small screens

- Do **not** compress the constellation into unreadable micro-nodes or require pinch zoom.
- Show a simple ordered project index/stack with short labels and lightweight visual previews, preserving the editorial style.
- Focus visual appears above or below short copy in a natural reading order.
- Use touch-friendly explicit actions; no hover-only information; skip complicated morph/pin behavior.

### Accessibility

- Use actual links/buttons, semantic headings, meaningful focus outlines, and accessible project names.
- Decorative lines/visuals should not be announced as navigation (e.g. `aria-hidden` where appropriate).
- Keep descriptions and numbers as HTML text; do not rely on SVG text for essential project copy.
- Respect reduced-motion and keyboard navigation.
- Ensure enough contrast on cream background; pink is an accent, not the sole means of conveying selection.
- Provide a sensible reading order independent of spatial placement.

## 9. Execution plan for Codex

### Step 0 — Inspect before changing

- Locate the current Work page (if present), router and shared nav, visual tokens/fonts, GSAP usage, the monitor-to-Work transition, and existing project content.
- Summarize what can be reused and any relevant performance/accessibility constraints.
- Do not alter unrelated pages or add new styling frameworks.

### Step 1 — Build content infrastructure

- Introduce the typed project collection, reusable lookups, stable route IDs, and the minimal relationship/position config.
- Verify that all four items display from data, not scattered hard-coded markup.

### Step 2 — Build static editorial experience

- Implement Work heading, responsive sparse constellation/project index, and reusable focus shell **without motion first**.
- Implement or wire the four visualization modules with visually meaningful static states.
- Ensure every `View project` link resolves to an actual detail page or existing route.

### Step 3 — Add motion

- Layer on only the overview reveal, hover/focus emphasis, focus transition, and one modest continuity transition between adjacent focused projects.
- Add ScrollTrigger only if it improves clarity. Test rapid scrolling, navigation away/back, browser back, and reduced motion.

### Step 4 — Validate and polish

- Verify desktop/tablet/mobile composition and typography against original mock direction.
- Check the technical content isn't misleading and no illustration pretends to be an actual application screenshot.
- Remove anything that reads as generic AI neon art or overly busy infographic.
- Test build, typecheck, relevant lint/tests, navigation, keyboard access, reduced-motion, and (if available) Lighthouse/Web Vitals. Record before/after performance if measurable; don't fabricate scores.

## 10. Definition of done / acceptance checklist

- [ ] Work feels like a curated editorial **exhibition**, not a card grid.
- [ ] The first screen has **substantial negative space** and only a few purposeful connections.
- [ ] All four projects come from **one typed, extensible data source**.
- [ ] A new fifth project can be added without duplicating content or branching on magic array indexes.
- [ ] Every project has its own visual grammar but shares one cohesive typography/color/linework system.
- [ ] Knowledge Bridge's art is genuinely inspired by hierarchical entity-card visualization, not just generic circles.
- [ ] Trading Agent's artwork communicates **context-aware research** rather than fictional investment returns.
- [ ] Herby and CPU/OS are appropriately concise and don't compete visually with the two featured projects.
- [ ] Selection, project links, and return/navigation all work without animation, keyboard/mouse/touch.
- [ ] Existing taquería, CRT entry, back-to-stand behavior, and site navigation keep working.
- [ ] Motion feels intentional, is cleaned up correctly, and is disabled/simplified for reduced motion.
- [ ] Mobile isn't a scaled-down graph; it is a usable alternative layout.
- [ ] Build/typecheck/tests succeed or blockers are reported accurately.

## 11. Strong negative guidance — do **not** build

- Four big rounded cards in a 2×2 grid.
- A glowing central ALDO node with all projects orbiting it.
- A physics-driven graph where labels drift around and users must drag to find work.
- Large generated fintech dashboard screenshots or arbitrary stock recommendations.
- Overlapping neon threads, gradients, glow bloom, glass panels, ornamental doodles and over-dense annotations.
- Multiple seconds of forced scroll-jacking or repeated giant pinned animations.
- Overlong technical descriptions in the overview.
- A new implementation of the taquería, CV, About, Contact, or the entire site shell.

## 12. Deliverables / Codex response expectations

1. Implement the Selected Work experience in the existing codebase in the smallest sensible sequence.
2. List **which files were created/changed** and how the component/data/visualization architecture is organized.
3. Explain how to add a new project (one new data entry, optional new visualization kind/component, verified detail route).
4. State any temporary art direction compromises honestly, especially if there is no source asset for Herby or the CPU.
5. Report actual validations run and their outcomes. **Do not claim an Awwwards-level result solely because GSAP is present.**

**Final art-direction reminder:** The taquería is cinematic and playful. The Work page should feel like the _intelligent, restrained counterpart_: almost like a beautiful technical drawing until it comes alive through interaction.
