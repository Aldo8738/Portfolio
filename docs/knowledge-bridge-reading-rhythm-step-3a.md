# Knowledge Bridge — Step 3A: Reading Rhythm, Hero Cohesion & Graph Polish

## Objective

Refine the Knowledge Bridge case study based on the latest screen recording.

The animation is cleaner than before, but the storytelling progresses too quickly, the contribution/tech table disappears prematurely, and the graph still needs visual refinement.

The new direction is:

**Longer scrolling. Less movement. More time to understand.**

Preserve the established ALDO editorial design and the previous performance improvements.

## 1. Fix the hero exit

Currently, the contribution/tech table fades out much earlier than the rest of the hero.

This feels disconnected and prevents visitors from reading it.

Change the behavior:

- Treat the hero title, description, metric, contribution focus, and technologies as one coherent content section.
- Do not animate the table's opacity independently.
- Prefer allowing the table to scroll naturally out of view.
- If a coordinated hero exit is necessary, only begin it after all hero content has had the opportunity to be seen.
- Keep the graph's transition independent of the table's visibility.
- Do not allow a half-transparent hero title to linger over the next section.

IMPORTANT: The hero remains content-driven, with `height: auto`.

Do not reintroduce fixed `100vh` hero sizing.

## 2. Significantly increase storytelling scroll distance

The current graph narrative advances much too quickly.

The visitor needs enough distance to read each explanation and inspect the corresponding graph state.

The four existing stages are:

1. Everything, all at once.
2. Render what matters.
3. A two-way conversation.
4. Less waiting. More exploring.

On desktop, aim for approximately **110–140 viewport heights percent of scroll distance per stage**, or an equivalent content-driven arrangement that creates a noticeably longer reading experience.

This is an initial tuning range, not a rigid requirement.

The total storytelling sequence should be substantially longer than it is now.

Unlike the earlier motion-simplification prompt, increasing the scroll distance is explicitly approved for this task.

Do not artificially slow wheel or trackpad input.

## 3. Separate visual transitions from reading time

This is the most important change.

Each storytelling stage should have two phases:

### Transition — approximately 20–25%

The graph makes one clear, restrained change.

Examples:

- Revealing the network
- Highlighting a relevant relationship
- Showing the human correction
- Revealing the performance improvement

### Reading — approximately 75–80%

The graph remains still.

The corresponding explanation stays fully readable.

No competing node movement, pulsing, connection drawing, or unnecessary opacity changes should occur.

The visitor should be able to stop scrolling and understand the visual immediately.

These percentages are directional guidelines; tune them to the actual implementation.

## 4. Improve text and graph synchronization

On desktop, prefer:

- A sticky graph visualization on the right, confined to the storytelling section.
- A clear narrative column on the left.
- Each explanation occupying its own generous scroll region.
- The graph changing state when the corresponding explanation becomes active.
- One visually dominant explanation at a time.

Do not hide text before it has entered the readable viewport.

Do not make explanations depend on a precise scroll position to remain visible.

Avoid long stretches of completely empty space.

The text should lead. The graph should respond.

## 5. Refine the graph's visual design

Keep the existing graph concept and nodes.

Improve the composition without introducing new effects.

### Hierarchy

- Make the primary active relationship immediately recognizable.
- Keep secondary nodes visible but quieter.
- Improve contrast of important labels.
- Avoid making inactive nodes and connections so faint that they almost disappear.
- Use consistent node sizes and line weights according to their importance.

### Composition

- Review spacing between nodes and labels.
- Prevent connections from crossing labels where possible.
- Give the BACKEND element its own visual space.
- Fix the crowded area around Landmarks and BACKEND.
- Ensure the network feels intentionally composed, not randomly distributed.
- Maintain sufficient space around the graph.

### Color

- Black or dark neutral for the primary focus.
- Readable neutral gray for secondary information.
- Magenta only for the active interaction or key result.

Do not use magenta for decorative motion.

### Motion

- Remove remaining unnecessary continuous movement.
- Avoid shifting the whole network when highlighting a relationship.
- Prefer changing emphasis over changing node positions.
- Keep transitions short and deliberate.

The graph should look beautiful and understandable when completely static.

## 6. Keep the WebSocket story legible

The backend communication should be a small, precise interaction.

Avoid allowing the magenta signal curve to dominate the entire network.

The visitor should understand:

Human correction → Backend processing → Graph update

Make sure the backend label and the network labels do not collide.

Do not add more animation to explain the sequence.

## 7. Mobile behavior

Do not copy the long desktop pinned sequence directly onto mobile.

On mobile:

- Use natural scrolling.
- Keep each explanation fully readable.
- Position the relevant graph state near its explanation.
- Reduce unnecessary movement.
- Avoid long empty scroll regions.
- Do not pin content in a way that obstructs touch scrolling.

The longer desktop reading rhythm must not become a mobile usability problem.

## 8. Implementation guidance

Inspect the current GSAP and ScrollTrigger architecture first.

Prefer:

- Stable graph geometry
- A single source of truth for the active stage
- Minimal visual updates
- Clear ScrollTrigger boundaries
- Function-based measurements where appropriate
- Proper resize refresh and cleanup

Avoid adding more timelines than necessary.

Preserve the existing performance improvements.

## 9. Acceptance criteria

- The contribution/tech table no longer disappears independently.
- The complete hero remains readable on short screens.
- The storytelling section takes substantially longer to scroll through.
- Every explanation has a meaningful reading interval.
- The graph is mostly stationary while text is being read.
- The active graph state clearly corresponds to the active explanation.
- Labels and connections have improved visual hierarchy.
- BACKEND and Landmarks no longer visually collide.
- Forward and reverse scrolling work correctly.
- Mobile remains natural and accessible.
- No performance regression.

Test at least 1440×900, 1366×768, 1280×720, 390×844, and 375×667.

## Deliverables

Explain:

1. Why the table was disappearing early.
2. How the hero exit was corrected.
3. The old and new storytelling scroll distances.
4. How reading intervals and transitions are separated.
5. Which graph design details were improved.
6. Which files changed and what was tested.

**STOP after this step. Do not implement the seamless graph expansion yet.**
