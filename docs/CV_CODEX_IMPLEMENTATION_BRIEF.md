# Taquería Aldo — CV / Experience implementation brief for Codex

> **Scope:** Implement the **CV** section/page only, in the existing portfolio. Preserve the 3D taquería, monitor-to-Work entrance, Selected Work experience, About, Contact, navigation, and project detail pages.
>
> **Do not start by scaffolding.** Inspect the actual repository, routing, shared layout, tokens, existing GSAP setup, and the Selected Work implementation first. This brief is a design and implementation specification; adapt its suggested component names and types to the codebase rather than introducing parallel systems.
>
> **Design relationship:** This is the natural companion to `SELECTED_WORK_CODEX_BRIEF.md`. **Work = connections and exploration. CV = chronology and clarity.** Both use the same refined editorial visual system.

## 1. Creative direction — “The road so far.”

The CV is not another project constellation, portfolio card grid, or interactive résumé gimmick. It is a **carefully typeset, data-driven career timeline**, with a subtle visual connection to Work.

### Visual identity

- Match the site's established **warm off-white/cream canvas**, almost-black typography, thin gray dividers, a **very restrained magenta accent**, and occasional muted blue/gray linework.
- Keep the original mock's editorial confidence: **strong typographic hierarchy, disciplined alignment, generous negative space**.
- The page should feel _quiet, mature, and extremely easy to scan_, especially after the more exploratory Work experience.
- Main visual motif: a **single thin vertical timeline** with precise circular markers. Current role gets the only stronger magenta highlight; older stops use neutral dots.
- Do not add fictional photos, corporate 3D objects, decorative logos, generic floating dashboard cards, neon lines, or meaningless mini-graphs.
- Use **one tasteful GSAP concept**: Work's curved connection paths resolve into CV's straight timeline during navigation, **only where technically viable**. All other animations are restrained.

### The essential screen

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ALDO.                         Work   CV   About   Contact   Back to stand│
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  02 / EXPERIENCE                         Download CV ↗                   │
│  The road                                                                │
│  so far.                                                                 │
│  From editorial tools                                                     │
│  to AI agents.                                                            │
│                                                                          │
│                    2025—NOW   ●── SAP                                   │
│                                 Software Engineer                        │
│                                 AI-agent creation, testing & debugging    │
│                                 Angular · TypeScript · D3 …              │
│                               │                                          │
│                    2023—2024  ●── koppla                                │
│                                 Frontend Engineer                        │
│                                 Analytics and scheduling                 │
│                               │                                          │
│                    2022—2023  ●── Axel Springer                         │
│                                 Frontend Developer                       │
│                               │                                          │
│                    2020—2024  ●── TU Berlin                              │
│                                 B.Sc. Computer Engineering               │
│                                                                          │
│  ──────────────────────────────────────────────────────────────────────  │
│  TECHNICAL TOOLBOX                                                       │
│  Frontend           Backend           AI & Data         Testing & Design  │
│  ...                ...               ...              ...              │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

This is a **structural** wireframe. Do not try to fit everything above the fold or rigidly copy its column widths.

## 2. Content hierarchy and copy

### Top navigation

Use the existing site header and active state. Do not create a duplicate header for CV.

- `ALDO.`
- `Work` | **`CV`** (active) | `About` | `Contact`
- `Back to stand ↗` if already part of the shared content layout

### Introduction

- **Eyebrow:** `02 / EXPERIENCE`
- **Headline:** `The road so far.` (period in the shared accent color)
- **Subheading:** `From editorial tools to AI agents.`
- **Primary utility action:** `Download CV ↗` (use a **verified** actual downloadable asset; see download section)

Keep the introduction brief. Do not repeat the About text or pitch all projects here.

### Experience — newest first

**SAP**

- Role: **Software Engineer**
- Location: Berlin
- Date: **Mar 2025 — Present**
- Short line: `Building tools to create, test, and debug AI agents in Joule Studio.`
- Optional expanded detail: Leading improvements to the agent testing experience, especially execution-trace visualization, trace filtering, tool-error detection, and debugging UX; collaborating across product/design/engineering; frontend primarily Angular/TypeScript and backend contributions with Node.js/Express.
- Verified associated technologies: `Angular`, `TypeScript`, `D3`, `Node.js`, `Express`, `Jest`, `Playwright`.
- Current role is visibly emphasized with a _small_ magenta timeline marker; no large colored card or animated badge required.

**koppla**

- Role: **Frontend Engineer · Working Student** (visual display may shorten to `Frontend Engineer`, but do not alter the factual employment status in expanded details or downloaded CV)
- Location: Berlin
- Date: **Jun 2023 — Aug 2024**
- Short line: `Building analytics, scheduling, and data-heavy interfaces for construction management.`
- Optional expanded detail: Data-visualization dashboard, scheduling workflows, reusable components, testing/QA improvements, GraphQL integration.
- Verified technologies: `Vue`, `TypeScript`, `Tailwind`, `GraphQL`, `Playwright`, `Figma`.

**Axel Springer National Media and Tech**

- Display name: **Axel Springer**
- Role: **Frontend Developer · Working Student** (same rule about keeping the complete title in data)
- Location: Berlin
- Date: **Mar 2022 — Feb 2023**
- Short line: `Improving editorial workflows and internal content management tools.`
- Optional expanded detail: React component implementation/refactoring, editorial UX improvements, frontend testing and QA.
- Verified technologies: `React`, `TypeScript`, `MUI`, `GraphQL`, `Jest`, `Playwright`, `Figma`.

### Education

**Technische Universität Berlin** / display **TU Berlin**

- **B.Sc. Computer Engineering**
- **Oct 2020 — Aug 2024**
- Thesis: `Knowledge Bridge: An Interface for Real-Time Human–AI Collaboration on Knowledge Graphs`
- Thesis grade: **1.0**
- Link to the **Knowledge Bridge** project case study only if the actual internal route exists.

**Important timeline detail:** Education overlaps employment. Do not imply TU Berlin started only after Axel Springer or that these events happened sequentially without overlap. A chronological set of milestones can include TU Berlin as a visually distinct **Education** entry, or the education section can follow the experience timeline separately. Prefer the latter if it makes the dates clearer or keeps the page more elegant.

### Technical toolbox

A compact editorial set of categories below Experience/Education. **No skill bars, percentages, or ungrounded seniority claims.**

Suggested groups (drawn from the supplied CV and recent project discussions):

- **Frontend:** TypeScript, JavaScript, Angular, React, Vue, Tailwind, SCSS, D3 (D3 may also belong in AI/Data & Visualization)
- **Backend & APIs:** Node.js, Express, Python, FastAPI, GraphQL, REST, PostgreSQL
- **AI & Data:** AI-agent testing, LangGraph, LangChain, execution tracing, knowledge graphs, data visualization
- **Quality & Design:** Playwright, Jest, React Testing Library, Figma
- **Systems (optional):** C, Assembly, VHDL — supported by the university projects, distinct from the main frontend specialization

Keep these as strings, not rendered hard-coded fragments; remove duplication if the layout is too dense. Skills can be cross-referenced from experience records using stable IDs.

### Languages (quiet footer row or inline detail)

- Spanish — Native
- English — C1 / Fluent
- German — C1 / DSH-2

### Certifications (optional; not required in initial fold)

If space and IA warrant it, offer a minimal expandable `Certifications` subsection **after** the main CV. Do not put all certificates in the main timeline. Source-backed entries include:

- Agentic AI Engineering with LangChain & LangGraph — Udemy (2026)
- Angular/NGRX — Pluralsight (2025)
- GitHub Actions — Udemy (2024)
- Generative AI in Software Testing — Udemy (2024)
- UI / UX Design Specialization — California Institute of the Arts / Coursera (2022)
- GraphQL Developer — Associate — Apollo GraphQL (2022)

Additional certifications exist in the source CV; if displaying a _complete_ list, preserve those as well instead of representing the above as exhaustive.

### No duplicate case studies

- **Work** contains personal/university projects, their visualizations, and separate case-study pages.
- **CV** contains professional roles, degree, skills, languages, and optionally certifications.
- Do not turn SAP/koppla/Axel Springer into new `Selected Work` project nodes.
- Linking the TU Berlin thesis to its Work case study is appropriate because it is one factual relationship, not redundant content.

## 3. Interaction design — precise rather than showy

### A. Work → CV: graph-to-timeline handoff

If Work and CV share a persistent layout/route transition layer:

1. User activates `CV` in the existing header.
2. The selected Work graph's **few fine paths** gently straighten and converge toward a vertical axis.
3. Four to five small points align along that axis; the scene settles into the CV timeline.
4. Career labels and dates appear with a short, staggered text reveal.
5. Focus moves/lands where normal browser navigation semantics expect it; the new page heading is available immediately.

**Critical feasibility rule:** First inspect whether the current Astro/React/router setup supports a reliable transition across routes. **Do not** build a second global routing framework, persistent WebGL canvas, elaborate transition manager, or duplicate both pages solely to force a perfect path morph. A short, reversible shared overlay/visual motif is enough. If there is no persistent layer, use a clean exit/enter sequence and explicitly document this simplification.

For direct visit, refresh, browser Back/Forward, reduced motion, or slow hardware: **CV must render correctly without any Work graph existing.** No transition prerequisite.

### B. Timeline scrolling

- Use a 1px/very thin neutral line between chronological stops.
- As each section enters view, its dot can become more distinct, and the line can draw a little farther downward.
- Prefer short fade/translate transitions or slight line draw, not a dramatic scroll-pinned sequence.
- The current role's magenta dot can remain subtly accented even before animation.
- All text is present in the DOM immediately: never tie actual content availability to scroll animation.

### C. Related skills on hover/focus

- Hover or keyboard focus on **SAP** subtly highlights its associated skills below; koppla and Axel Springer highlight theirs.
- Implement via shared skill IDs, not text matching or brittle DOM queries.
- Inactive skills remain legible; don't hide the entire toolbox or change its order.
- On touch, tapping/focusing an experience may emphasize its skills, but the core details must be visible without interaction.
- A skill click/highlight is **not** a route or a claim of expertise level; decorative connections are optional and must remain sparse.
- This feature is lower priority than getting the editorial timeline correct.

### D. Resume download

- Prefer an already-present, valid downloadable CV asset in the repository. If the repository has no public PDF/download asset, **do not invent a URL or ship a broken button**.
- The supplied source is `CV 2026.docx`, which can inform site copy. Ask the developer to add/verify a user-approved PDF later or implement the action only when a valid URL is provided. If a DOCX is intentionally offered, label it accurately.
- Do not expose phone numbers or personal email in visible CV markup just because they are in the source résumé; those can remain on the actual downloadable résumé or designated Contact surface if intended.

## 4. Extensible, typed content architecture

Use TypeScript content objects instead of scattering company text and technologies across JSX/ASTRO markup. **Reuse project and design data from the Work implementation only where sensible.** Don't import unrelated Work graph state into the CV timeline.

The following is a **suggested model**, not a mandatory file layout. Choose one canonical place for each piece of data.

```ts
export type SkillCategory =
  'frontend' | 'backend' | 'ai-data' | 'quality-design' | 'systems';

export interface Skill {
  id: string; // stable machine-readable ID
  label: string; // display label
  category: SkillCategory;
  order: number;
}

export type CareerKind = 'employment' | 'education';

export interface CareerEntry {
  id: string;
  kind: CareerKind;
  order: number; // explicit display order; no array-index keys
  organization: string; // official organization name
  displayName: string; // compact editorial label
  role: string; // accurate full title
  start: string; // YYYY-MM
  end: string | null; // null means current, not a guessed future date
  location?: string;
  summary: string; // one-line visible teaser
  details?: string[]; // optional expanded content
  skillIds: string[]; // references Skill.id, validated
  current?: boolean;
  relatedProjectId?: string; // e.g. the existing Knowledge Bridge project ID
  highlight?: string; // only verified claims
}

export interface CvContent {
  eyebrow: string;
  headline: string;
  intro: string;
  downloadUrl?: string; // only if checked against a real asset
  experience: CareerEntry[];
  education: CareerEntry[];
  languages: { label: string; level: string }[];
  certifications?: { title: string; issuer: string; year: number }[];
}
```

Example data (full details are above, fill in using verified source only):

```ts
// Suggested: src/data/cv.ts (or existing content collection convention)
export const skills: Skill[] = [
  { id: 'typescript', label: 'TypeScript', category: 'frontend', order: 1 },
  { id: 'angular', label: 'Angular', category: 'frontend', order: 2 },
  { id: 'react', label: 'React', category: 'frontend', order: 3 },
  { id: 'vue', label: 'Vue', category: 'frontend', order: 4 },
  { id: 'node', label: 'Node.js', category: 'backend', order: 1 },
  { id: 'express', label: 'Express', category: 'backend', order: 2 },
  { id: 'graphql', label: 'GraphQL', category: 'backend', order: 3 },
  { id: 'd3', label: 'D3', category: 'ai-data', order: 1 },
  { id: 'langgraph', label: 'LangGraph', category: 'ai-data', order: 2 },
  {
    id: 'playwright',
    label: 'Playwright',
    category: 'quality-design',
    order: 1,
  },
  { id: 'jest', label: 'Jest', category: 'quality-design', order: 2 },
  { id: 'figma', label: 'Figma', category: 'quality-design', order: 3 },
  { id: 'vhdl', label: 'VHDL', category: 'systems', order: 1 },
  // Continue with the other verified skills needed by the final toolbox.
];

export const cv: CvContent = {
  eyebrow: '02 / EXPERIENCE',
  headline: 'The road so far.',
  intro: 'From editorial tools to AI agents.',
  experience: [
    {
      id: 'sap',
      kind: 'employment',
      order: 1,
      organization: 'SAP',
      displayName: 'SAP',
      role: 'Software Engineer',
      location: 'Berlin',
      start: '2025-03',
      end: null,
      current: true,
      summary:
        'Building tools to create, test, and debug AI agents in Joule Studio.',
      details: [
        'Improving agent testing and debugging workflows, including trace visualization and error detection.',
        'Developing primarily with Angular and TypeScript, with Node.js and Express contributions.',
      ],
      skillIds: [
        'angular',
        'typescript',
        'd3',
        'node',
        'express',
        'jest',
        'playwright',
      ],
    },
    {
      id: 'koppla',
      kind: 'employment',
      order: 2,
      organization: 'Koppla GmbH',
      displayName: 'koppla',
      role: 'Frontend Engineer · Working Student',
      location: 'Berlin',
      start: '2023-06',
      end: '2024-08',
      summary:
        'Building analytics, scheduling, and data-heavy interfaces for construction management.',
      details: [
        'Developed dashboards, scheduling workflows, and reusable UI components.',
      ],
      skillIds: ['vue', 'typescript', 'graphql', 'playwright', 'figma'],
    },
    {
      id: 'axel-springer',
      kind: 'employment',
      order: 3,
      organization: 'Axel Springer National Media and Tech',
      displayName: 'Axel Springer',
      role: 'Frontend Developer · Working Student',
      location: 'Berlin',
      start: '2022-03',
      end: '2023-02',
      summary:
        'Improving editorial workflows and internal content management tools.',
      details: [
        'Built and refactored React components and improved editorial UX.',
      ],
      skillIds: [
        'react',
        'typescript',
        'graphql',
        'jest',
        'playwright',
        'figma',
      ],
    },
  ],
  education: [
    {
      id: 'tu-berlin',
      kind: 'education',
      order: 1,
      organization: 'Technische Universität Berlin',
      displayName: 'TU Berlin',
      role: 'B.Sc. Computer Engineering',
      location: 'Berlin',
      start: '2020-10',
      end: '2024-08',
      summary:
        "Bachelor's thesis on real-time human–AI collaboration with knowledge graphs.",
      highlight: 'Thesis grade: 1.0',
      skillIds: [],
      relatedProjectId: 'knowledge-bridge',
    },
  ],
  languages: [
    { label: 'Spanish', level: 'Native' },
    { label: 'English', level: 'C1 · Fluent' },
    { label: 'German', level: 'C1 · DSH-2' },
  ],
};
```

**Data safeguards:**

1. Do not use array indices as keys/IDs. Dates are data, not text glued into JSX.
2. Display `Present` based on `end: null` and a validated current flag; don't automatically label past roles current.
3. Validate `skillIds` against the actual skill catalog. The code example is _illustrative_ and deliberately leaves some toolbox skills to fill; avoid dangling IDs.
4. The `knowledge-bridge` project reference must resolve to the real Work project ID/path; import the canonical ID/lookup rather than duplicating slug strings if available.
5. Separate role content from visual animation state. Adding a new employer should mean adding one record, not writing a fifth one-off component.
6. Keep typography, design tokens, and utility styles shared with Work. Don't add a second Tailwind config, a new CSS framework, or a separate global typography system.
7. If certification data is added, keep the full verified source list in the data even if the UI initially shows only selected items.

## 5. Suggested components and responsibilities

```text
src/
  data/
    cv.ts                        # CV content (or site content collection)
    skills.ts                    # skill catalog, stable IDs (if not colocated)
  components/cv/
    CvPage.*                     # layout composition, semantic section structure
    CvIntro.*                    # headline, intro and valid download link
    CareerTimeline.*            # shared timeline shell for experience entries
    CareerEntry.*               # a single reusable company/role row
    EducationSection.*          # education, separate from overlapping jobs
    SkillsToolbox.*             # grouped skill list, optional active-role highlighting
    LanguagesRow.*              # compact language information
    CvTransitionLayer.*         # OPTIONAL; only if existing router supports it
    cv.css                      # scoped presentation; reuse global tokens
  pages/
    cv.*                        # or existing route/page convention
```

Use semantic `<main>`, `<section>`, ordered lists (if appropriate), headings, and actual `<time datetime="...">` values. Decorative lines/dots are hidden from assistive technology. Essential content should be readable without animations or JavaScript where the framework supports it.

## 6. Responsive behavior

### Large screens

- The intro may occupy a narrower left column with the timeline extending to the right, or span across the page before the timeline; choose based on existing content layout.
- Timeline dates align cleanly in a small column; dots form one vertical axis; job details sit to the right.
- The **vertical rhythm is the design**. Don't squeeze four jobs and the entire toolbox into a single viewport.
- Toolbox can use three to five understated columns or a wrapped modular layout with aligned baselines.

### Mobile / tablet

- Headline, utility download action, entries and toolbox stack in natural reading order.
- Date can sit above each organization or beside its marker; no cramped microscopic 3-column timeline.
- Avoid absolute positioning of text, horizontal scrolling, pointer-following motion, or hover-only disclosure.
- Simplify cross-page morph and timeline draw; provide plain page reveal in reduced motion.
- `Download CV` remains reachable and labeled; no broken/stub button.

## 7. Accessibility, animation, and performance

- All career descriptions, dates and skills must be ordinary text in the document, not canvas-only or SVG-only labels.
- Preserve visible keyboard focus on links and interactive experience rows; don't create pointer-only interactions.
- If experience items are not expandable, they don't need to be buttons. If expanded detail is introduced, use accessible controls and expose expanded state.
- Decorative timeline graphics should have `aria-hidden="true"`; communicate sequence via markup and date labels.
- Use color **and** typography/position/focus to communicate selected state. Ensure subdued text meets contrast targets.
- Honor `prefers-reduced-motion`: set final visible states immediately; remove/simplify GSAP transitions.
- Use `gsap.context()`, project-existing GSAP hooks or equivalent; revert triggers, observers, listeners and timelines on unmount/route changes.
- If `ScrollTrigger` is in use, scope it to CV and test route changes, fast scroll, resize, browser back and anchor links.
- Favor `transform` and `opacity`; animate tiny line segments sparingly. No complex real-time physics, no persistent RAF loops, no large blur filters.
- Avoid importing heavy graph/Three.js Work visualizations just to animate the CV. Lazy-load any optional transition logic; direct `/cv` should remain lightweight.
- Do not create fake timeline metrics or report imaginary Lighthouse scores.

## 8. Suggested execution sequence for Codex

### Phase 0 — Audit and plan

1. Inspect actual source: routes, site shell, navigation, motion utilities, current Work structure, global color/typography tokens, content conventions, downloadable CV assets.
2. Identify what can be reused and whether a cross-route graph-to-timeline transition is viable.
3. Briefly report scope and planned files before implementing. **Do not redesign Work**.

### Phase 1 — Typed CV content

1. Add a canonical `cv` dataset and optionally `skills` catalog with stable IDs.
2. Preserve **accurate work/education dates and titles** from the provided 2026 CV.
3. Add development-time validation for referenced skill IDs/project IDs where practical.

### Phase 2 — Static editorial CV page

1. Implement intro, timeline, education, toolbox, languages, and an optional certifications disclosure.
2. Reuse the site's global nav, accent, typography, divider, width and spacing tokens.
3. Make desktop and mobile layouts excellent **before introducing animation**.
4. Make sure the download action exists **only if it has a real target**.

### Phase 3 — GSAP refinement

1. Add short timeline-dot/line progression and subtle text entrance.
2. Add focus/hover → related-skills highlighting only if it improves clarity without clutter.
3. If feasible, add the Work→CV transition with a shared lightweight line motif. Otherwise use a graceful page handoff without forcing complex routing changes.
4. Check reduced-motion, direct-load and back navigation paths.

### Phase 4 — Quality checks

- Build/typecheck/lint/tests available in the repo.
- Inspect desktop, tablet, small mobile and zoomed text.
- Verify all dates/roles/tech and overlap of education with employment.
- Verify keyboard + screen reader order; check that focus and disclosure controls behave correctly.
- Verify navigation between `/work`, `/cv`, About, Contact and stand is still functional.
- Check animations for jank, cleanup, no content flashing, no excessive CLS or repeated triggers.
- Report actual measurements if tested; otherwise say they were not measured.

## 9. Definition of done

- [ ] CV looks like an **editorial career timeline**, not a project grid or dashboard.
- [ ] CV uses the **same visual language** as the Selected Work brief: cream, black, thin gray geometry and restrained magenta.
- [ ] Page headline and concise intro convey the intended direction: `The road so far.` / `From editorial tools to AI agents.`
- [ ] Timeline displays correct SAP, koppla and Axel Springer experience with dates, roles and succinct summaries.
- [ ] TU Berlin degree and dates are accurate and visibly distinct from employer chronology.
- [ ] Toolbox/languages are organized, human-readable and driven by typed data.
- [ ] Skill highlighting works on keyboard and touch if implemented; information isn't gated behind hover.
- [ ] The `Download CV` action is functional and labeled correctly **or omitted pending a verified asset**.
- [ ] Content is fully readable on narrow mobile screens and when motion is disabled.
- [ ] CV works via direct URL, refresh and browser history; no dependency on entering through the Work graph.
- [ ] No changes break the taquería, Work project interactions, About, Contact, or global nav.
- [ ] Extra employers, skills, education or certifications can be added through data records without hand-authoring new timeline components.
- [ ] Codebase's existing build, typecheck and relevant tests run cleanly or blockers are documented.

## 10. Strong negative guidance

**Do not:**

- Turn CV into a second interactive constellation or display every skill as an animated graph node.
- Build floating glass cards, neon ribbons, holograms, large 3D company logos, or a complex scroll-jacked timeline.
- Copy the taquería's objects into the CV page.
- Recreate a Work project case study inside each employer entry.
- Invent professional achievements, job dates, certifications, skill levels, downloadable links or return-on-investment metrics.
- Change the site architecture just to support the visual graph-to-line transition.
- Add scroll animation as a substitute for a well-composed static page.

## 11. Implementation handoff expectations

When finished, Codex should report:

1. **Files added/modified**, and where the canonical CV/skills data lives.
2. How the timeline and optional hover-linked toolbox are composed.
3. Whether the graph-to-timeline transition was implemented, approximated, or deliberately omitted, **and why**.
4. How to add a fifth employer or a new skill in the future.
5. The state of the CV download asset/link.
6. Actual tests/build/type checks run and remaining limitations.

**Final art-direction reminder:** The taquería is the personality. Work is the exploration. **CV is the evidence, presented with confident simplicity.**
