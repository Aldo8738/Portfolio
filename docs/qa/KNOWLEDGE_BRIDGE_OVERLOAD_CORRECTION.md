# Knowledge Bridge overload layout correction

Corrects the overload composition against the creator's
[dense network reference](../The%20Living%20Knowledge%20Graph.png).
Supersedes the [earlier composition refinement](KNOWLEDGE_BRIDGE_COMPOSITION_REFINEMENT.md).

## Final connection cleanup

The creator retained the polished base and requested only a small connection
cleanup. Three central bridges receive shorter routing or adjusted curvature,
separating a cramped junction and a near-parallel crossing. Three existing
right-side bridges now attach inward through Germany, Berlin's context and an
inner Architecture junction. The middle bridge attaches at a branch junction
rather than its terminal point, avoiding a narrow loop at the far-right edge.

No nodes, labels, counts, major coordinates, framing or motion are changed.
The requested primary / secondary / tertiary label tiers already match exactly
and are preserved. The graph remains monochrome except for the Querétaro and
Berlin dots. All six adjusted bridges are desktop-only; mobile stays unchanged.

Production captures at 1920x1080, 1440x900, 1366x768 and 390x844 were inspected
again. Counts remain 267 nodes / 444 connections on desktop and 72 / 77 on mobile.
The rendered overload and focused bounds match the prior polished base, with no
page overflow or browser page errors. Formatting, lint and the production build
pass; the existing scene-bundle warning remains. Automated tests and a new
performance profile remain deferred.

- [1920x1080 cleanup](knowledge-bridge/overload-correction/finish/overload-1920.png)
- [1440x900 cleanup](knowledge-bridge/overload-correction/finish/overload-1440.png)
- [1366x768 cleanup](knowledge-bridge/overload-correction/finish/overload-1366.png)
- [390x844 cleanup](knowledge-bridge/overload-correction/finish/overload-390.png)
- [Cleanup measurements](knowledge-bridge/overload-correction/finish/bounds.json)

## Final polish on the accepted base

The creator accepted the corrected composition and requested one restrained polish
pass. The layout, major node coordinates, framing, calm motion and focused state
remain unchanged. The sections below this update describe the accepted base.

- Each of the six European core neighborhoods gains three small intermediary
  points: 102 core supporting nodes become 120, an increase of 17.6%. Eighteen
  short cross-links join the new local branches into the surrounding mesh.
- Eight further cross-links integrate outer neighborhoods and reconnect loose
  endpoints. Four existing unlabeled endpoints move inward by 15–50 graph units.
  None of the twelve labeled concepts move. New detail stays in the middle band
  rather than extending the graph's perimeter.
- Desktop totals are now 267 visible nodes and 444 connections. Mobile retains
  its reduced 72-node / 77-connection composition.
- Overload labels now have explicit semantic tiers: Europe, France, Germany and
  Paris are primary; Landmarks, Cities, North America and Mexico are secondary;
  Eiffel Tower, Brandenburg Gate, Querétaro and Berlin are tertiary. All remain
  dark neutral text. Only the existing Querétaro and Berlin dots use magenta.
- Shared labels return to their original computed font size and weight during
  desktop focus. Mobile and reduced-motion overload states use the same tier
  tokens, while retaining the existing clean-state typography.

Formatting, ESLint and the production build pass; Astro / TypeScript reports zero
errors, warnings or hints. The existing separate scene-bundle warning remains.
Production screenshots were captured and visually inspected again at all four
required sizes. Desktop bounds remain exactly the same: 87.1% viewport width and
60.5–67.3% viewport height. Mobile width is 86.7%, with all twelve labels readable.
No horizontal page overflow or browser page errors were observed. Clean-state
bounds match the accepted base at all four sizes. Automated tests remain deferred;
no test files were changed or run, and no new performance profile was collected.

- [Final 1920x1080](knowledge-bridge/overload-correction/polish/overload-1920.png)
- [Final 1440x900](knowledge-bridge/overload-correction/polish/overload-1440.png)
- [Final 1366x768](knowledge-bridge/overload-correction/polish/overload-1366.png)
- [Final 390x844](knowledge-bridge/overload-correction/polish/overload-390.png)
- [Final measurements](knowledge-bridge/overload-correction/polish/bounds.json)

## Cause and layout ownership

The fixed SVG host took its width from the chapter dock inside `.kb-page`, whose
maximum width is 1440px. At 1920x1080 the actual rendered graph occupied only
68.0% of viewport width, despite having 221 nodes and 299 visible connections.
Changing its viewBox alone could not fix the parent placement constraint.

An overload-only dock now breaks out to 96vw on large desktop screens. The figure
heading and progress rule retain their existing editorial alignment. Its cached
bounds own the overload host placement; the existing focus interval interpolates
back to the original chapter dock. No scroll distance, hero layout, navigation,
later chapter timeline or checkpoint interaction changes.

## Composition and continuity

- 249 visible desktop nodes and 400 connections, with 12 labels. These counts
  exclude hidden state markers. Supporting identities retain stable endpoints.
- A tighter European mesh adds intermediary nodes, short cross-links and multiple
  paths between Europe, France, Germany, Paris, Berlin and Landmarks.
- Outer neighborhoods use compact forks and micro-clusters instead of long,
  similarly spaced chains. Shared junctions and bridges connect these to the core.
  Lower branches are consolidated into a shallower silhouette.
- Secondary and peripheral dots are more perceptible, while their thin neutral
  edges remain subdued. Desktop overload labels and primary dots have stronger
  hierarchy, returning to their original typography and radii at focus completion.
  Existing background-colored text strokes protect labels from crossing edges.
- Bézier curvature varies by connection. Degree-two tangent sharing now requires
  sufficient alignment with its next edge, avoiding handles that bend sideways.
- Mobile shows 72 dots and 77 connections, with the existing 12 labels and viewport.
  Dense desktop cross-links and most satellite detail remain omitted.

Only Querétaro and Berlin use magenta. Shared core coordinates, core relationship
paths and the final focused viewBox remain unchanged. Added detail is inside the
existing overload-only group and disappears through its existing fade. Geometry
is deterministic and cached per layout; no force simulation, per-frame path
generation, React updates, dependency or continuous decorative animation is added.

## Production browser review

Captured and visually inspected in Chromium on Windows against the production
build, at chapter progress 45% (overload) and 84% (clean). These are screenshots
and geometry observations, not automated test-suite runs.

Rendered bounds include visible dots, paths and labels. Percentages are relative
to the viewport, not the editorial container. Antialias fringes are excluded.

| Viewport  | Before width | After width | After height | Page overflow |
| --------- | ------------ | ----------- | ------------ | ------------- |
| 1920x1080 | 68.0%        | 87.1%       | 67.2%        | None          |
| 1440x900  | 85.6%        | 87.1%       | 60.5%        | None          |
| 1366x768  | 84.4%        | 87.1%       | 67.3%        | None          |
| 390x844   | 86.2%        | 86.2%       | 54.3%        | None          |

All four captures show readable geographical labels within safe margins. The
desktop core is visibly denser than its surrounding clusters. The desktop graph
extends beyond the heading's column at 1920px. Satellite forks remain connected,
with restrained contrast and no new effects. The mobile graph deliberately keeps
less detail. Measured clean-state bounds match the before captures at all four
sizes; no browser page errors were observed during either capture pass.

- [1920x1080 overload](knowledge-bridge/overload-correction/after/overload-1920.png)
- [1440x900 overload](knowledge-bridge/overload-correction/after/overload-1440.png)
- [1366x768 overload](knowledge-bridge/overload-correction/after/overload-1366.png)
- [390x844 overload](knowledge-bridge/overload-correction/after/overload-390.png)
- [1920x1080 before](knowledge-bridge/overload-correction/before/overload-1920.png)
- [1440x900 clean](knowledge-bridge/overload-correction/after/clean-1440.png)
- [Before measurements](knowledge-bridge/overload-correction/before/bounds.json)
- [After measurements](knowledge-bridge/overload-correction/after/bounds.json)

## Checks and remaining limits

Changed-file formatting, ESLint and the production build pass. The build's Astro /
TypeScript check reports zero errors, warnings or hints and emits ten static pages.
The existing separate scene-bundle size warning remains.

The creator's earlier instruction still defers automated tests: no unit or browser
test files were edited or run. The existing unit test's 97-node assertion remains
stale and needs updating when test work is authorized. Screenshot capture required
Chromium execution outside the sandbox after browser startup failed with EPERM.
Physical-device, Safari, screen-reader, reverse-scroll regression and CPU/GPU
profiling were not repeated; no new frame-rate claim is made.
