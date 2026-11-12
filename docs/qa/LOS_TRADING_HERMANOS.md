# Los Trading Hermanos — implementation notes

## Engineering conclusion refinement

Only the closing engineering section changes in this pass. Its headline is 25%
smaller, and its vertical padding is reduced. One short introduction replaces the
two prose paragraphs. A semantic HTML workflow with small SVG arrows shows
Research inputs → Python / LangGraph → Investment assessment. Its middle stage
names evidence extraction and synthesis, confirmed in the available local
`backend/app/agents/discovery_graph.py`; output categories match the documented
thesis, counterarguments, and portfolio fit. This is a high-level workflow, not
an invented agent architecture or a claim to enumerate every graph node.

A separate contribution row prominently names Product ideation, UX, and
Implementation, with explicit shared authorship and the established under-a-month
initial build. These roles and delivery claims come from the existing approved
portfolio history; no sole ownership of backend stages is implied. Editable copy
remains in `src/content/trading-research.ts`.

The diagram and contribution row stack naturally on mobile. Theme tokens, thin
dividers, monospaced indices, and existing typography are reused without new
dependencies, graphics assets, or animation. The hero, six-beat desk, assessment,
and previous/next navigation are unchanged. Tests and visual inspection remain
intentionally skipped; final visual acceptance remains with the creator.

## Beat 06 — final detail clearance

The existing final paper targets now derive vertical clearance from untransformed
layout boxes. Market Data starts below the white assessment's bottom edge, making
its heading and part of the chart visible. The upper papers stay at least 24px
below the editorial section label, preserving its alignment with previous beats.
Targets recalculate on the existing ScrollTrigger refresh, without scroll-frame
layout reads or new choreography. The pinned stage clips background continuations
at its edges without adding a scrolling container; natural-flow layouts are
unaffected. The white sheet has a very restrained shadow directed down and right,
with its borders, typography, and content unchanged. Tests and visual inspection
remain intentionally skipped; final visual clearance awaits creator review.

## Beat 06 — final composition continuity

The same five mounted source papers now finish farther outward in the existing
assessment transition: top papers rise, lower papers move down, and all recede to
84% scale at 50% opacity. The white sheet retains its approved size, typography,
content, opaque surface, and foreground layer. An isolated stage keeps these
layers local. No duplicated source illustrations, new animation steps, changed
beat timing, or connectors are introduced. Narrow/short viewports and reduced
motion keep the existing natural-flow assessment without background crowding.

Assessment references are nonbreaking and joined to the preceding word with a
nonbreaking space. The risk citation is shortened to [O1], retaining its opinion
classification and source title for assistive technology. The header now says
ILLUSTRATIVE instead of HUMAN REVIEW, describing this fictional case without
implying that the displayed assessment was reviewed. All values and six source
references are unchanged. Tests and visual inspection remain intentionally
skipped; viewport fit and background balance await creator review.

## Beat 06 — concise assessment

The final sheet now has four content areas: title, a one-sentence thesis, four
short evidence bullets, and a combined risks/portfolio area. The latter uses two
columns on desktop and stacks on mobile. The subtitle, synthesis qualifier,
additional risk paragraph, and repeated visible provenance labels are removed.
Source IDs remain visible; opinion remains explicitly labeled, and supporting
provenance is retained for assistive technology. The illustrative-case footer is
preserved in shortened form.

The source case and its figures are unchanged. The news entry gains a short
assessment summary without changing its source headline or Beat 04 selection.
Other evidence bullets continue to use the original canonical entries. The exact
requested thesis and concise portfolio wording live in the existing data module.
The white sheet, display title size, editorial rules, and animation are retained.
Moderately tighter padding and section spacing reduce height while body copy is
slightly larger. The fit at standard desktop sizes awaits creator visual review;
tests and visual inspection remain intentionally skipped.

## Beat 04 — complete evidence selection

The creator's later evidence refinement expands the original four selected items
to six: N1, O1, F1, F2, M1, and P1. All five artifacts now contribute a selected
finding. Market News marks only “strong quarter” using an inline background with
cloned box decoration so responsive line breaks follow the phrase. Market Data
marks only the six-month return value and accents the final chart point. The
rest of the chart, metrics, news headline, and all document positions are retained.
The common marker tint is softened from 24% to 20% of the active theme accent.

The existing evidence-opacity tween now drives a shared CSS variable for markers
and endpoint color at the same timeline position and duration. No new animated
sequence is added. A discrete reset after the evidence exit confines these marks
to Beat 04; reverse scrubbing restores the same state. Mobile, no-JS, and reduced
motion use the same variable on the existing highlighted evidence copies.
Beat 02 retains neutral source papers and the original layout and content.

Canonical figures and provenance are unchanged. N1 and M1 already appear in the
assessment's supporting evidence with NEWS and MARKET DATA classifications;
opinion remains OPINION, financial measurements FACT, and portfolio context
CONTEXT. No assessment content or source references were added or replaced.
Tests and visual inspection remain intentionally skipped for creator review.

## Final Sources art direction

The approved grid, relative positions, sizing rules, hero, Introduction, and GSAP
timeline remain unchanged. Market News now uses a small publication label above
the dominant serif article headline. Discussion adds decorative vote chevrons and
unverified-view metadata without inventing votes, usernames, or timestamps. The
fundamentals table is preserved. Portfolio retains the position-weight ring,
with its allocation band in plain text instead of a separate outer arc. Small
paper-tone and shadow differences continue the physical-document treatment.

The creator's later request for a price-history-style SVG supersedes the earlier
range-only graphic. `researchCase.priceHistory` is an authored illustrative path,
not retrieved market history. Its start is derived from the canonical six-month
return and sample price; its endpoint remains 124.36 and return remains +14.2%.
The visible caption explicitly says “Illustrative path · Not historical prices.”
The original 52-week range remains visible beneath it; volume and [M1] remain in
the existing metrics row. Intermediate illustrative values are not represented as
verified observations. No live requests, extra assets, dependencies, or animation
were added. Vote chevrons are noninteractive and hidden from assistive technology;
the chart includes an explicit accessible summary.

These shared artifact details carry forward without separate refinement of later
beats. Source highlights remain off in Beat 02. Tests and visual inspection remain
intentionally skipped; static visual approval remains with the creator.

## Sources composition refinement

The Sources desk is more compact through reduced paper padding, header/list/table
spacing, and inter-document gaps. Body typography is preserved; the composition
is not scaled down. The target is approximately 15–20% less composition height,
with complete visibility at 1366×768 awaiting the creator's visual review.

Market Data now presents sample price and range once, in the labeled SVG, followed
by one two-column metrics row for six-month return [M1] and average volume. All
canonical values remain visible. Paper surfaces gain slight theme-aware warm,
neutral, and cool variations; shadows and existing small rotations distinguish
the artifacts without changing their canonical positions.

The hero, Introduction, case data, assessment, and animation module are unchanged.
Refined source artifacts continue to be shared with later states; no separate
Evidence or Assessment changes are introduced. Existing media conditions keep
pinning at widths ≥1100px and heights ≥760px with full motion. Shorter/narrower
viewports and reduced motion remain in natural flow; mobile retains its vertical
stack. No nested scrolling, clipping, scaling, new assets, or animations were added.
Tests and visual inspection remain intentionally skipped.

## Visual refinement pass 01

This pass targets the hero, Introduction, and Sources only. The hero title is
slightly smaller, with stronger separation between the primary statement and
supporting description; its contribution/technology strip is unchanged. The
Introduction now renders the approved copy on two explicit lines at a smaller
display size than the hero.

The shared source artifacts now use a newspaper masthead and clipping treatment,
explicit Opinion A/B comment hierarchy, a semantic financial table with aligned
values, a labeled SVG price-range plot, and a portfolio allocation ring with a
separate target-band arc. Both visualizations derive from the canonical fixture;
no historical prices or new research figures were invented. Financial entries
derive prose and table values from the same structured values, preserving all
assessment citations. Paper grain uses a faint static CSS gradient, with modest
rotations and shadows; no new assets, fonts, dependencies, or animations are used.

Source IDs, the four evidence hooks, the six-beat timeline, and the assessment
document remain unchanged. The refined artifacts are reused in later states,
but Beats 04 and 06 receive no separate refinement in this pass. Source highlights
remain off in Beat 02. Lint and changed-feature formatting passed; the build
includes Astro typechecking. Tests and visual inspection remain intentionally
skipped. Static composition and responsive visual acceptance await creator review
before any later-beat refinement.

The [approved brief](../LOS_TRADING_HERMANOS_CODEX.md) is implemented at
`/work/trading-agent`, using the existing static Astro shell and GSAP stack.
The work index, Knowledge Bridge, global tokens, and frozen GLB are unchanged.

## Content and provenance

`src/content/trading-research.ts` owns the fictional ACME measurements, source
entries, provenance, selected evidence, assessment, beat copy, and engineering
copy. The same entries render into source and evidence chapters and the cited
assessment. Missing or duplicate assessment references fail static generation.
Exactly F1, F2, O1, and P1 receive selection backgrounds; opinion, measurements,
secondary reporting, market observations, and portfolio context retain labels.
Citation IDs are plain text, not nonfunctional buttons.

The referenced `docs/references/` images and `research-case.fixture.json` were
not present. The brief's canonical written dataset supplies the illustrative
case. The market graphic plots the supplied sample price within the supplied
52-week range; it does not invent a historical price series. No mock images,
real publisher branding, account data, or live market requests are used.

Existing portfolio content supports the shared Python/LangGraph build, under a
month, and contributions to ideation, UX, and implementation. Read-only inspection
of the available local `Projects/trade-agent` repository confirmed:

- `backend/app/agents/discovery_graph.py`: quantitative/research branches,
  evidence extraction, evaluation, synthesis, and advisory-only prompts.
- `backend/app/schemas_discovery.py`, `IdeaOut`: thesis, bear case, portfolio fit,
  community note, conclusion, and sources remain distinct output fields.
- `README.md`: the system does not place trades; execution remains with the user.

The portfolio assessment retains the brief's four conceptual categories rather
than pretending to reproduce a real `IdeaOut` response. No real run was supplied.
No precise personal authorship of individual backend mechanisms, investment
performance, production usage figures, publisher integrations, or product URLs
are claimed. Existing project links remain absent until actual URLs are supplied.

## Layout and lifecycle

The route composes `TradingAgentCaseStudy`, `ResearchDesk`, `SourceArtifact`, and
`AssessmentDocument`. The generic `[slug]` route excludes this dedicated page.
Styles and motion are scoped to the Trading Agent feature.

On viewports at least 1100px wide and 760px high with full motion, one stable
stage is pinned and its descendants animate. One five-paper DOM arrangement
persists through all six beats. Short transitions alternate centered copy and
papers; four source-local highlights appear in the evidence beat. The white
assessment enters over gently receding papers. No connectors, snapping, autoplay,
per-scroll React rendering, raster layers, or additional pinned sections are used.
Outgoing text or papers subdue before the next focal element enters, avoiding
competing headline/document crossfades.
The 100-unit timeline uses 9/22/9/23/9/28 beat weights over seven viewport heights;
the assessment has the longest hold. These are starting values awaiting the
creator's readability review, not measured visual acceptance.

Development-only static previews use `?desk=intro`, `sources`, `explain`,
`evidence`, `synthesis`, or `assessment` on a spacious desktop viewport. They seek
the same timeline to a settled authored state without pinning. The query is
ignored in production and adds no production controls.

Mobile, narrow/short viewports, reduced motion, and JavaScript failure keep six
chapters in natural flow. Only this fallback repeats the source papers for the
evidence chapter, deriving both copies from the same fixture with unique IDs.
The assessment remains readable static HTML. Source text stays selectable and
the range diagram includes a textual summary.

GSAP matchMedia reverts styles and pinning on breakpoint/motion changes. Font
readiness precedes setup; ScrollTrigger handles resize/orientation refreshes.
Pagehide cleanup and persisted pageshow remount follow existing full-document
navigation conventions. There is no Astro ClientRouter in the shared layout.

## Validation and remaining acceptance

The creator explicitly requested no tests and no visual inspection. No tests,
screenshots, browser sessions, or performance profiles were added or run.
Nonvisual checks:

- `npm run typecheck`: passed, zero errors/warnings/hints across 159 files.
- `npm run lint`: passed. Focused ESLint also passed after the final motion edit.
- Prettier check of changed supported files: passed. The handoff remains covered
  by the repository's existing Prettier ignore rule.
- `npm run format:check`: fails on seven untouched files: the supplied brief,
  the Step 5 and Step 6 Knowledge Bridge briefs, and the four existing
  `overload-correction/{after,before,finish,polish}/bounds.json` artifacts.
  These were preserved.
- `npm run build`: passed, ten static pages including `/work/trading-agent`.
  Vite reports its existing large-chunk advisory for the site's bundle.

Desktop composition, scroll pacing/reversal, source readability,
320–390px layouts, 1024×600 fallback, keyboard/screen-reader behavior, browser
back/forward, resize, theme presentation, and physical-device performance remain
unverified pending creator review.
