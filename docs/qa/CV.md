# CV implementation and review

The [CV brief](../CV_CODEX_IMPLEMENTATION_BRIEF.md) is implemented at `/cv` using
the existing static Astro site, shared layout, theme tokens, system typography
and GSAP. There is no new framework, client router, dependency or WebGL scene.
The CV link is enabled through the existing `siteContent.cvUrl` navigation field.

## Content and composition

[`src/content/cv.ts`](../../src/content/cv.ts) owns all CV copy, career dates,
full role titles, skill IDs/categories, language levels and the download setting.
It supplies SAP (Mar 2025–Present), koppla (Jun 2023–Aug 2024), Axel Springer
(Mar 2022–Feb 2023), and TU Berlin (Oct 2020–Aug 2024). Both past employment
titles retain Working Student status in visible HTML. The degree sits in a
separate Education section, explicitly described as study alongside professional
work; the layout does not imply it followed the jobs sequentially.

`CareerEntry.astro` renders every entry inside the reusable `CareerTimeline.astro`
ordered list. Dates use real month-only `<time datetime>` values, formatted in
English with a UTC timezone to avoid month shifts. A discriminated union and
build-time validation keep current flags/dates consistent, reject reversed dates,
duplicate IDs/orders, and dangling skill/project references. The education link
resolves through the canonical Work lookup and route helper.

`SkillsToolbox.astro` groups 29 source-backed skills by stable ID. Native role
details disclosures provide keyboard and touch focus for highlighting related
skills. Hover, focus and touch use the IDs, not visible-label matching. Inactive
skills remain readable and never move or disappear. The toolbox claims no skill
percentages, ratings or seniority levels. The page ends with the three supplied
language levels.

The timeline uses neutral hairlines and small markers; the current SAP marker
gets the stronger magenta accent. The main headline's accent period, cream canvas,
typography and rules follow Work. A minimal shared-header wrapping change fixes
horizontal overflow with text enlarged to 200%; normal header content, links and
styling are preserved.

## Motion and Work-to-CV handoff

Work-to-CV navigation remains an ordinary document navigation. This site has no
persistent cross-route Astro router: its existing persistent transition is the
special CRT-to-Work entrance. A graph morph would require introducing or extending
a routing layer solely for decoration, contrary to the brief's feasibility rule.
The approximation is a clean CV entrance: short heading/text settles and a small
straight-timeline progression as entries enter view. No Work graph module or
Three.js code is imported into CV.

`cv-page.ts` scopes GSAP to the page and uses one IntersectionObserver. All text
exists and remains readable before JavaScript and outside the viewport. There is
no pinned scrolling, content gate, persistent animation loop or physics. Contexts,
observers, media-query and pointer/focus listeners are disposed on page departure
and restored on browser Back/forward cache return. Reduced motion restores static,
fully visible states immediately.

## Download and source limits

No PDF or DOCX résumé asset exists in the repository. The source document named
`CV 2026.docx` is mentioned in the brief but was not present. Site copy comes from
the creator-provided implementation brief; no private résumé file was inferred.
`cv.download` is `null`, so no broken, disabled or mislabeled download button ships.
No phone number or personal email was added to CV markup.

Certifications are deliberately empty until the complete verified source list is
available. The optional native disclosure can render verified records later; no
excerpt is presented as an exhaustive certification history.

## Extending the page

- Add an employer/degree record to `cv.experience`/`cv.education` with a unique
  stable ID/order, accurate month dates, full role title and known skill IDs.
  The timeline and disclosures derive from records; no new component is needed.
  `end: null` requires `current: true`; a past role uses a real end month.
- Add a skill record to `skills`, then reference its ID from career entries.
  Categories and display order drive the toolbox without another navigation list.
- Add verified certifications to the canonical list once the full source is
  supplied. The existing disclosure renders records without one-off markup.
- To enable download, add a user-approved public file, verify its actual URL and
  contents, then set `cv.download` with that URL and the correct `PDF` or `DOCX`
  format. `siteContent.cvUrl` remains the page route, not the download target.

## Validation

Final checks on Windows using Node 24.22.1 and production Chromium/SwiftShader:

- Formatting, lint and Astro typechecking pass with zero diagnostics.
- 51 unit tests across 12 files pass.
- Production build passes with ten static pages. The existing large 3D chunk
  warning remains; no claim is made that the entire site has no build warnings.
- All 30 targeted browser tests pass, covering CV direct loads and refresh,
  JavaScript-disabled content/disclosures, actual thesis navigation, keyboard and
  touch skill emphasis, browser history, live reduced motion, themes, 200% text,
  320/390/768/1440px layouts, and existing Work/CRT/photo/audio flows.
- Direct Work/CV navigation requests no GLB or scene module. The frozen-model
  checksum and node/parent contract still pass.

Raw CV output sizes in this build: HTML 10,710 bytes, dedicated CSS 5,475 bytes,
and the CV script 2,723 bytes. These are uncompressed artifact sizes, not total
wire transfers; shared GSAP and global site assets are additional. A before/after
performance comparison, Lighthouse, field Web Vitals, physical devices and real
assistive technology were not measured. Semantic order and keyboard behavior were
checked, without claiming a manual screen-reader audit.

Reviewed captures: [desktop](cv/cv-1440.png), [tablet](cv/cv-768.png),
[mobile](cv/cv-390.png), [small mobile](cv/cv-320.png), and
[enlarged text](cv/cv-enlarged-text.png).

## Files

Added:

- `src/content/cv.ts`: canonical typed CV and skill catalog, formatting and validation.
- `src/pages/cv.astro`: static route, metadata and existing site layout.
- `src/components/cv/CvPage.astro`: page composition and browser-cache lifecycle.
- `src/components/cv/CareerTimeline.astro`: shared ordered timeline.
- `src/components/cv/CareerEntry.astro`: dates, full titles, details and thesis link.
- `src/components/cv/SkillsToolbox.astro`: catalog-driven groups.
- `src/components/cv/cv.css`: scoped CV presentation using shared tokens.
- `src/components/cv/cv-page.ts`: bounded motion and skill-ID highlighting.
- `tests/cv-content.test.ts`, `tests/e2e/cv.spec.ts`, this review and its captures.

Modified:

- `src/content/site.ts`: enables the existing CV navigation link at `/cv`.
- `src/styles/globals.css`: shared header/nav wrap when enlarged text needs space.
- `README.md`, `docs/DEVELOPMENT_PLAN.md`, `TAQUERIA_ALDO_CODEX_HANDOFF.md`: current
  routes and decisions. The supplied CV brief was formatted without changing its
  requirements.

The stand/model, Selected Work composition, project detail content, About, Contact,
photo and audio implementations were not rewritten for CV.
