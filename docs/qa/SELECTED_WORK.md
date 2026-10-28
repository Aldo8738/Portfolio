# Selected Work implementation

Implemented from the [creator's brief](../SELECTED_WORK_CODEX_BRIEF.md), using the
existing Astro static site, TypeScript content modules, shared tokens and GSAP.
The stand, model, audio actions, global navigation, CV configuration, About and
Contact are preserved. No package or server dependency was added.

## Content and routes

[`src/content/portfolio.ts`](../../src/content/portfolio.ts) is the canonical
serializable collection. It holds order, slugs, concise copy, supplied highlights,
technologies, visualization kind, and accurate minimal case-study sections.
Knowledge Bridge, Trading Agent, Herby and Custom CPU & OS generate four real
detail routes. Together with the existing pages, the build emits nine static pages.
Unrecognized project slugs still return the site's real 404.

The brief's proposed years were part of an illustrative data model; dates are
omitted until confirmed. No company names, financial returns, external project
links, original-source code, or individual CPU/OS responsibilities were invented.
The Knowledge Bridge narrative explicitly distinguishes the existing generation
system from the creator's refactoring, UX and progressive-rendering contribution.

## Composition and motion

`src/components/work/WorkExperience.astro` composes the static exhibition.
The creator's follow-up removes the constellation/index and its footnote. The
heading leads directly into the four project sections in normal document flow.
The unused constellation source is retained as historical implementation material;
it is not rendered or loaded by the Work route.

`ProjectFocus.astro` supplies the shared editorial text, highlights and detail links.
Overview return links were removed at the creator's request. Previous/next project
navigation appears only at the bottom of the individual case-study pages and
links directly to adjacent project routes.
`ProjectVisual.astro` maps typed visual
kinds to the four isolated SVG modules in `visuals/`. No new WebGL scene, images,
animation loop, forced scrolling or paid plugin is used.

`work-experience.ts` provides an expressive reveal. An IntersectionObserver
activates a bounded GSAP diagram sequence every
time a section enters the viewport, from either scroll direction. There is no
first-visit guard; reduced motion bypasses the animation. Hierarchical entity
cards advance from a broad structure to a reviewed relationship; research inputs,
sensor lines and circuit traces share a small path-drawing vocabulary. There are no
continuously animated visuals. GSAP contexts, observers and listeners are cleaned
up on departure, CRT replay, browser Back and media-query changes. Reduced motion
keeps the static illustrations and all navigation immediately usable.

The creator's motion tuning adds a 56px title lift with slight rotation and scale
settling, staggered copy, and a separate rising diagram reveal. Easing decelerates
into the final layout, with no looping or scroll locking.

The direct `/work` page initializes its controller through an Astro script.
CRT entry fetches the same static page, loads its styles before the existing
transition, and explicitly initializes the controller after activation. Returning
to the stand disposes it. Work hash history is handled inside the exhibition
instead of reloading the scene. The imported page's skip link targets `work-main`
so the retained, hidden homepage's `main` ID cannot capture it.

## Adding a project

1. Add one `Project` object to `src/content/portfolio.ts` with a stable slug, order,
   verified copy, case-study sections and an existing visualization kind.
2. A new visual grammar needs one SVG component, a kind in `VisualizationKind`,
   and an entry in `ProjectVisual.astro` (plus an optional small `ProjectGlyph`).
3. Add thematic edges only when meaningful. Authored positions are optional: a
   fifth project automatically receives a regular overview layout. Navigation,
   focused sections, previous/next links and the static detail URL all derive
   from the collection without another list or route conditional.

## Art direction limits

No actual thesis screenshots or original Herby/CPU images were present in the
repository. All four graphics are explicitly labeled interpretive illustrations.
Knowledge Bridge follows the supplied description of hierarchical entity cards,
zoom-dependent detail and human corrections; it does not claim to reproduce an
unseen screenshot. The research diagram expresses inputs and outputs without
claiming an exact LangGraph topology. Herby has no numeric readings. The CPU plates
show conceptual hardware/instruction/OS layers rather than an exact circuit design
or original assembly source. Replace these modules if verified source artwork
becomes available; project copy and navigation need no structural change.

## Verification

Completed on Windows with the checkout's Node 24.22.1 toolchain and production
Chromium/SwiftShader, without network throttling:

- `npm run format:check`: passed.
- `npm run lint`: passed.
- `npm run typecheck` / the final build's `astro check`: zero errors, warnings or hints.
- `npm test`: 46 tests across 11 files passed.
- `npm run build`: passed; nine static pages. The existing large-3D-chunk warning remains.
- `npm run validate:asset`: frozen checksum, names and hierarchy passed unchanged.
- `npm run test:e2e -- tests/e2e/work.spec.ts tests/e2e/navigation.spec.ts tests/e2e/portfolio-transition.spec.ts tests/e2e/amp.spec.ts tests/e2e/audio-effects.spec.ts`:
  all 19 tests passed in the final run, including the existing sound behavior.

Raw output sizes in this build: `/work` HTML 21,979 bytes, the dedicated Work CSS
8,738 bytes, and the Work controller chunk 5,002 bytes. These are uncompressed
artifact sizes, not complete page-transfer totals; shared GSAP, site styles and
navigation code are additional. No comparable before-performance capture was
recorded, so no performance improvement is claimed. Direct Work navigation was
checked to make no GLB or scene-module request.

Production Chromium screenshots are captured by `tests/e2e/work.spec.ts` at 320,
390, 768 and 1440px, with reduced motion for reproducible composition. Browser
coverage includes JavaScript-disabled exhibition/detail routes, keyboard selection,
history, live reduced-motion changes, mobile overflow, theme persistence, CRT
activation/replay/Back, and no GLB or scene-module requests on direct Work entry.
`tests/work-content.test.ts` checks identity/order, supplied highlights, valid
relationships and automatic layout of a fifth project.

Physical-device testing, assistive-technology testing, Lighthouse and field Web
Vitals remain unmeasured. Local functional Chromium checks do not establish device
FPS, field performance or creator approval of the concept artwork.

Reviewed captures: [desktop overview](selected-work/overview-desktop.png),
[Knowledge Bridge](selected-work/knowledge-bridge-desktop.png),
[Trading Agent](selected-work/trading-agent-desktop.png),
[Herby](selected-work/herby-desktop.png),
[CPU/OS](selected-work/cpu-desktop.png),
[mobile overview](selected-work/overview-mobile.png), and
[mobile project view](selected-work/knowledge-bridge-mobile.png).
The screenshots were inspected after the final build; CPU labels were moved
outside overlapping layers before acceptance.

## File inventory

Created:

- `src/content/project-links.ts`: thematic edges and responsive overview positions.
- `src/components/work/WorkExperience.astro`: exhibition composition and lifecycle entry.
- `src/components/work/ProjectConstellation.astro`: semantic spatial/index navigation.
- `src/components/work/ProjectFocus.astro`: shared project sections and sequence links.
- `src/components/work/ProjectVisual.astro`: visualization registry and figure caption.
- `src/components/work/ProjectGlyph.astro`: compact mobile preview marks.
- `src/components/work/work-experience.ts`: scoped selection, history and motion controller.
- `src/components/work/work.css`: exhibition and case-study styles using existing tokens.
- `src/components/work/visuals/KnowledgeHierarchyVisual.astro`.
- `src/components/work/visuals/ResearchFlowVisual.astro`.
- `src/components/work/visuals/HydroponicSystemVisual.astro`.
- `src/components/work/visuals/CpuArchitectureVisual.astro`.
- `tests/work-content.test.ts` and `tests/e2e/work.spec.ts`.
- This review and `docs/qa/selected-work/*.png`.

Changed:

- `src/content/portfolio.ts`: one canonical collection of supplied project facts.
- `src/pages/work/index.astro` and `src/pages/work/[slug].astro`: static exhibition/details.
- `src/components/experience/portfolio-transition.ts`: stylesheet loading, explicit
  controller initialization, skip-link target and lifecycle cleanup.
- `src/components/experience/usePortfolioTransition.tsx`: exhibition reveal bounds,
  controller disposal and Work fragment-history handling.
- `tests/content.test.ts`, `tests/e2e/navigation.spec.ts`, and
  `tests/e2e/portfolio-transition.spec.ts`: actual content and integration coverage.
- `README.md`, `docs/DEVELOPMENT_PLAN.md`, and `TAQUERIA_ALDO_CODEX_HANDOFF.md`:
  current content status and links. The supplied brief was formatted without
  changing its requirements.
