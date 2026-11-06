# Knowledge Bridge — Step 3A reading rhythm and hero cohesion

Historical intermediate experiment, superseded by the
[Step 3B Chapter 1 preview](KNOWLEDGE_BRIDGE_FOCUSED_CHAPTER_1_STEP_3B.md).
The 480vh pacing described below is no longer active. The coordinated hero/table
exit and label-clearance fixes remain. This document records the experiment,
not final validation of the current implementation.

Developed from the [Step 3A brief](../knowledge-bridge-reading-rhythm-step-3a.md)
and the creator's subsequent correction: the contribution/technology table belongs
to the hero and must leave with the other hero content. That correction supersedes
the brief's optional natural table exit. The existing graph entry is retained;
this step does not implement a new seamless expansion.

## Hero cause and correction

The previous intro timeline independently faded `.kb-facts` during progress 0–0.15.
The metric, description, subtitle and heading then exited at separate later times.
Although a measured boundary let short-screen visitors first reach the metadata,
the table still disappeared before the rest of the hero and looked disconnected.

The table, introduction, heading, metric and hero outline now share one opacity
tween, from entry progress 0.18 to 0.38. The existing reading boundary still waits
for the last metadata line to reach the viewport margin. Everything remains opaque
until then; the hero clears well before the next section takes focus. Desktop
scroll compensation includes the table too. Refresh measurements subtract that
compensation so resizing or reverse scrolling cannot move the reading boundary.

The hero remains content-driven with automatic height. No fixed viewport hero,
independent table fade or prolonged partially transparent title is introduced.

## Scroll distance and reading

Desktop retains the existing bounded story pin and two-column composition. Its
added story scroll changes from **180vh to 480vh**, split into four equal 120vh
regions. At the requested sizes, the added distances are:

| Viewport   |  Previous |   Current |
| ---------- | --------: | --------: |
| 1440 × 900 |   1620 px |   4320 px |
| 1366 × 768 | 1382.4 px | 3686.4 px |
| 1280 × 720 |   1296 px |   3456 px |

ScrollTrigger rounds some boundaries to CSS pixels. These distances exclude the
hero and the story stage's own height. Safe portrait tablets use 240vh instead of
150vh. Short wide screens remain unpinned, with natural 120svh explanation regions
and locally sticky copy. Phones keep native scrolling, no GSAP pin and compact
content-sized explanation regions rather than the long desktop sequence.

The existing authored action order is mapped once, during timeline construction,
into each stage's first 25%. The remaining 75% has no graph geometry, opacity,
packet or label changes. The quiet progress hairline continues to track scrolling.
There are still only the entry and story timelines; no new animation loop is added.

Stage boundaries are now 0%, 25%, 50% and 75%. Active text follows ScrollTrigger's
scroll position directly, before the graph's existing 0.2-second scrub catches up.
Explanation text no longer fades or translates into view. On desktop one complete
explanation remains dominant throughout its region. Natural layouts use a measured
reading anchor, with mobile text positioned below the compact sticky figure.

## Graph polish

- Primary nodes and semantic relationships retain their authored positions.
- Secondary dots and connections keep 45% emphasis during focus, rather than 16%;
  quiet final context returns to 60%. Important labels retain full text contrast.
- The extra mobile fade on whole node groups is removed, keeping secondary labels
  readable and avoiding additional background motion.
- BACKEND moves to its own open area: desktop `(520, 410)`, phone `(165, 250)`.
  Its compact channel and API/WebSocket annotations move with it, clearing Landmarks
  and the landmark labels. One request and one response still appear in order.
- The corrected relationship receives magenta only when the correction arrives.
  Before that it remains dark neutral. The backend rests in neutral ink during the
  conversation reading interval and clears during the result transition.

Fonts, palette, graph data, hero content, history interaction, page navigation and
other project pages are unchanged. The cached geometry, quick setters, sampled
scroll position, refresh behavior and cleanup from Phase 1.5 are retained.

## Files and verification

Production changes are confined to the Knowledge Bridge case-study component,
graph markup/layout/motion, story state, controller and scoped stylesheet.
Unit tests cover equal stage boundaries and ordered transition compression.
Browser tests cover the coordinated hero/table exit, viewport-aware reading,
stationary graph intervals, caption visibility and backend/label separation.
The profiling harness uses the same refreshed reading anchor as the controller.

Partial experiment captures are retained in `knowledge-bridge/reading-step-3a/`.
Current validation belongs to the Step 3B review.
Physical mobile hardware, Safari and compositor-level 60 FPS remain unverified.
