# Knowledge Bridge — Step 5: Apple-Inspired Scroll Storytelling

## Objective

Refine the transition between the existing **01 / Overload** and **02 / Render what matters** chapters.

The goal is a premium, Apple-inspired editorial storytelling experience in which visitors focus on **one thing at a time**.

The current dense graph is approved. The hero is also approved.

**Do not redesign either of them.**

This task is about narrative structure, visual transitions, scroll pacing, and synchronization.

---

## 1. Approved storytelling sequence

Implement the following five scenes in this exact order.

### Scene A — Introduce the problem

**01 / OVERLOAD**

# Everything, all at once.

Large knowledge graphs were overwhelming to explore.

Presentation:

- Large, centered editorial typography.
- Generous negative space.
- Warm off-white background.
- The graph must not compete with the headline.
- No word-by-word animations.
- Give visitors enough scroll distance to read comfortably.

**The text is the only focal point.**

### Scene B — Experience the problem

The introductory text fades away. The approved dense network becomes the main visual.

Requirements:

- Preserve the existing dense graph composition.
- Keep the full-width, interconnected network.
- Keep subtle magenta dots on **Querétaro** and **Berlin**.
- Use a brief, restrained entrance.
- Avoid animating every node and connection independently.
- Allow the graph to settle completely.
- Keep the graph visible and stationary for a generous viewing interval.

The visitor should experience the complexity rather than immediately being shown the solution.

**Do not begin simplifying the graph yet.**

### Scene C — Introduce the solution

After the visitor has explored the complex graph, introduce:

**02 / FOCUS**

# Render what matters.

Prioritized streaming and viewport-aware rendering make complex knowledge graphs faster and easier to explore.

Presentation:

- The complex graph smoothly recedes from view.
- The solution text becomes centered and dominant.
- Avoid displaying a prominent moving graph behind readable text.
- The text must remain fully readable for a generous scroll interval.
- The graph must not transform during this reading phase.
- Prefer fading the graph almost completely out rather than leaving a distracting network behind the headline.
- Keep the graph scene mounted so its state can be preserved for the next transition.

### Scene D — Demonstrate the solution

The solution text fades away. The existing dense graph returns to prominence and gradually transforms into the approved focused graph.

Sequence:

1. Restore the dense graph in its original geometry.
2. Gently reframe toward the relevant region.
3. Fade peripheral nodes and relationships.
4. Increase emphasis on the relevant connections.
5. Reposition and scale persistent nodes as needed.
6. Resolve into the existing clean, focused network.

The effect should feel like selecting a useful region from a larger knowledge graph.

**It must look like the same graph being focused, not two SVGs being swapped.**

Keep the animation restrained, precise, and reversible.

### Scene E — Let the result breathe

The focused graph has reached its final state.

- Stop all unnecessary motion.
- Keep important labels readable.
- Maintain the clean composition.
- Provide a substantial stable viewing interval.
- Do not immediately launch the next chapter.

The visitor should have enough time to understand what changed.

Only after this should the experience proceed toward **03 / Human + AI**.

**Do not implement Chapter 03 as part of this task.**

---

## 2. Attention hierarchy

At any moment, only one element should dominate.

| Scene | Primary focus | Graph behavior |
|---|---|---|
| A — Problem | Centered text | Hidden or visually subdued |
| B — Overload | Dense graph | Fully visible, mostly still |
| C — Solution | Centered text | Recedes almost completely |
| D — Transformation | Graph | Brief, controlled focus animation |
| E — Clarity | Focused graph | Fully visible, still |

**Never require visitors to read explanatory text while the graph is actively transforming.**

Avoid prolonged overlap between large text and graph elements.

---

## 3. Scroll pacing

The previous experience progressed too quickly, preventing visitors from reading the text or inspecting the graph.

This needs to feel noticeably slower and more deliberate.

### Recommended rhythm

- Long reading interval for the problem statement.
- Short transition into the complex graph.
- Long viewing interval for the complex graph.
- Short transition into the solution statement.
- Long reading interval for the solution statement.
- Controlled graph-focus animation.
- Long viewing interval for the resolved graph.

A useful initial desktop target is approximately **350–500vh of total scroll travel** across the complete sequence, including stable viewing intervals.

This is an initial range for experimentation, **not a hard-coded requirement**. Tune according to the actual section layout, reading length, and viewport size.

Important:

- More scroll distance should create more opportunity to read and inspect.
- It should **not** create more movement.
- Do not slow wheel or touch input artificially.
- Do not introduce scroll snapping or scroll hijacking.
- Avoid long blank screens.
- Do not force users to wait for timed animations to finish.
- Most of the scroll journey should show stable, understandable content.

---

## 4. GSAP implementation

Inspect the existing GSAP ScrollTrigger architecture before changing it.

Prefer one coordinated scene progression over multiple unrelated timelines that compete for control.

### Recommended architecture

Define five logical presentation states:

- `problem`
- `overload`
- `solution`
- `focusing`
- `focused`

Use a coordinated GSAP timeline or clearly scoped ScrollTriggers to move between them.

Use explicit animation ranges for:

- Text visibility.
- Graph visibility.
- Camera/graph transforms.
- Primary and peripheral node emphasis.

Avoid multiple timelines independently controlling the same properties.

### Visual continuity

The approved dense graph must remain the source for the focus transition.

- Preserve stable node IDs.
- Preserve shared relationships.
- Keep persistent nodes recognizable.
- Precompute target node positions.
- Animate between deterministic geometries.
- Avoid running force simulations during scrolling.
- Avoid graph remounting that resets animation state.

### Reverse scrolling

Every stage must reverse correctly:

- Focused graph → focus transformation reverses → solution text.
- Solution text → dense graph.
- Dense graph → problem text.

There must be no visible resets, jumps, flashes, or inconsistent labels.

---

## 5. Preserve the approved graph design

### Dense graph

Do **not** change:

- Existing overall silhouette and scale.
- Central density.
- Peripheral micro-clusters.
- Primary node positions.
- Current label hierarchy.
- Querétaro and Berlin magenta accents.
- Existing neutral palette.

The current dense graph is the approved visual reference.

### Focused graph

Preserve the existing minimal graph composition.

Important relationships include:

- Europe.
- France.
- Germany.
- Paris.
- Berlin.
- Cities.
- Landmarks.
- Eiffel Tower.
- Brandenburg Gate.

The focused graph should have fewer prominent nodes and connections, with a clear hierarchy.

Do not invent an entirely new layout unless required to fix a continuity issue.

### Technical accuracy

The focus animation is a **visual explanation** of viewport-aware rendering and prioritized streaming.

It should not suggest that the underlying data is permanently deleted.

Peripheral information visually recedes; the system prioritizes what is relevant.

---

## 6. Mobile behavior

Do not force the full desktop pinned sequence onto mobile.

Use a simplified, natural vertical experience:

1. Problem text.
2. Responsive dense graph.
3. Solution text.
4. Short focus animation.
5. Focused graph.

Requirements:

- No content hidden before it can be read.
- No excessive sticky or pinned sections.
- No horizontal overflow.
- Keep important graph labels legible.
- Reduce graph density where needed for visual clarity and performance.
- Support touch scrolling.
- Respect `prefers-reduced-motion`.

The approved hero remains content-driven.

**Do not introduce fixed `100vh` hero sizing.**

---

## 7. Performance requirements

The dense network contains many SVG nodes and connections. Preserve all previous performance optimizations.

- Cache graph geometry.
- Avoid React re-renders on every scroll frame.
- Animate only properties that need to change.
- Prefer transforms and opacity where practical.
- Avoid expensive filters or continuous simulations.
- Manage ScrollTrigger cleanup and refresh correctly.
- Ensure viewport resizing does not break the timeline.

Target smooth desktop animation without sacrificing mobile responsiveness.

Measure where possible; do not claim FPS improvements without profiling.

---

## 8. Visual quality requirements

Maintain the existing ALDO identity:

- Warm cream background.
- Bold black editorial typography.
- Restrained magenta accents.
- Minimal monospaced chapter metadata.
- Strong negative space.
- Carefully controlled motion.

Do not add:

- WebGL or Three.js.
- Particle systems.
- Glowing nodes.
- Blur-heavy transitions.
- Glassmorphism.
- Decorative backgrounds.
- New UI controls.
- Unnecessary sound effects.

Visual quality should come from composition, typography, rhythm, and precision.

---

## 9. Acceptance criteria

The implementation is complete when:

1. The problem statement appears before the dense graph.
2. Visitors can read the problem without graph distractions.
3. The dense graph is displayed at its approved scale and composition.
4. The dense graph remains still for a substantial viewing interval.
5. **Render what matters** appears only **after** the dense graph experience.
6. The graph is visually subdued while the solution text is being read.
7. The solution text disappears before the focus animation begins.
8. The dense graph smoothly transforms into the existing clean graph.
9. Shared nodes remain visually continuous.
10. The focused graph remains still long enough to inspect.
11. There are no prolonged blank screens or premature fades.
12. Reverse scrolling restores every state correctly.
13. Short desktop screens remain readable.
14. Mobile scrolling remains natural.
15. Reduced-motion users can access all content.
16. No significant performance regressions are introduced.

### Required testing

Test at minimum:

- 1920 × 1080.
- 1440 × 900.
- 1366 × 768.
- 1280 × 720.
- 390 × 844.
- 375 × 667.

Check the complete scene sequence in a real browser, not just isolated screenshots.

---

## 10. Workflow

1. Inspect the current graph and ScrollTrigger implementation.
2. Identify which existing transitions can be reused.
3. Establish the five scene states.
4. Fix the text/graph ordering.
5. Implement stable reading and viewing intervals.
6. Implement the continuous dense-to-focused transformation.
7. Verify reverse scrolling.
8. Test responsive layouts and reduced motion.
9. Run build and relevant validation checks.
10. Report files changed, scroll ranges, performance observations, and known limitations.

### Scope restrictions

Do not modify:

- Approved hero.
- Navigation.
- Contribution/technologies section.
- Benchmark values.
- Static dense graph styling.
- Existing clean graph styling beyond necessary transition fixes.
- Chapter 03 interactions.
- Version-history demo.
- Other portfolio pages.

**STOP after completing the Chapter 01 → Chapter 02 storytelling transition.**

We will review the motion before implementing the Human + AI chapter.

---

## Key design principle

When the dense graph disappears for **“Render what matters,”** do not simplify it in the background.

**Let the visitor read first. Then let the graph return and undergo the transformation.**

The sequence is:

**Problem text → Complex graph → Solution text → Graph focuses → Clean graph settles.**
