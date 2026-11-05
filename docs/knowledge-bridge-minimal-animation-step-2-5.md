# Knowledge Bridge — Step 2.5: Minimal, Elegant Graph Animation

## Objective

Refine the existing knowledge graph animation to feel calmer, more deliberate, and more sophisticated.

The current animation has too many elements moving and changing simultaneously. This makes the graph feel busy and reduces the clarity of the storytelling.

We want the restraint and precision of a bespoke editorial visualization, inspired by Andrew Trousdale's portfolio.

**This is an animation refinement, NOT a redesign.**

## 1. Preserve the ALDO identity

Keep exactly as established:

- Existing fonts and typography
- Warm cream background
- Black text and restrained magenta accent
- Editorial layout and spacing
- Existing graph styling and general composition
- Hero content and contribution table
- Current performance optimizations

Do not introduce gradients, glowing effects, new colors, decorative particles, or additional UI components.

## 2. Reduce simultaneous movement

Inspect the current GSAP timeline and identify overlapping visual animations.

Refine it so each meaningful change has a clear beginning and end.

The graph should follow this rhythm:

**Reveal → Settle → Focus → Respond**

### Reveal

- Introduce new relationships progressively.
- Reveal a few meaningful nodes at a time.
- Prefer subtle opacity and short positional transitions.
- Avoid nodes flying in from different directions.
- Do not animate every connection individually.

### Settle

- Once nodes reach their intended positions, they should remain mostly stationary.
- Remove unnecessary continuous drifting, pulsing, and floating.
- Allow the visitor to understand the network before another change begins.

### Focus

- Fade secondary connections into the background.
- Keep important relationships clearly visible.
- Avoid moving the entire graph unnecessarily.
- Use contrast and opacity rather than dramatic repositioning.

### Respond

- Highlight one selected relationship in magenta.
- Animate the human correction and backend response in a controlled sequence.
- Do not show multiple competing magenta pathways.
- Once the correction completes, return the graph to a calm resting state.

## 3. Simplify the WebSocket animation

Keep the technical story intact.

The sequence should be:

1. An incorrect relationship is identified.
2. A human corrects it.
3. One outbound edit request travels toward the backend.
4. One WebSocket update returns.
5. The corrected relationship becomes visible.

Avoid giant loops, multiple simultaneous arrows, and decorative signal effects.

The backend interaction should be understandable without a lengthy explanation.

This is an illustrative demonstration, not a claim that every user edit uses WebSockets.

## 4. Refine GSAP timing

Inspect the existing timeline before changing it.

- Avoid animating too many SVG elements simultaneously.
- Use coordinated, restrained transitions.
- Add short visual settling periods between major states.
- Keep scroll progress reversible.
- Avoid exaggerated easing and overshoot.
- Keep important text synchronized with the corresponding visual state.

Do not introduce artificial pauses that trap the user's scrolling.

Do not add extra pinned sections or increase the overall scroll distance merely to slow the animation.

## 5. Reduce visual noise

Preserve the knowledge graph's meaningful structure.

However:

- Lower the contrast of decorative edges.
- Avoid excessive overlapping curves.
- Keep important node labels legible.
- Do not animate background connections unnecessarily.
- Reserve magenta for meaningful interaction states.
- Make the final resting graph attractive even when animation is paused.

Do not arbitrarily remove important relationships or change the graph data.

## 6. Mobile behavior

Apply the same restrained motion language to mobile.

- Reveal fewer decorative elements simultaneously.
- Keep essential relationships visible.
- Avoid long pinned interactions.
- Preserve natural touch scrolling.
- Do not reintroduce fixed 100vh hero sizing.
- Respect prefers-reduced-motion.

## 7. Scope restrictions

Do not:

- Redesign the page.
- Rebuild the graph architecture.
- Change the hero layout.
- Implement the seamless hero-to-graph expansion yet.
- Modify checkpoint version control.
- Add dependencies.
- Add new animation effects.
- Undo the previous performance work.

## 8. Acceptance criteria

The result should feel noticeably calmer.

Verify that:

1. No unnecessary continuous motion remains.
2. Each graph stage has a clear visual focus.
3. Nodes settle naturally instead of constantly moving.
4. Pink highlights communicate specific human actions.
5. The WebSocket sequence is easy to follow.
6. Forward and reverse scrolling work.
7. Animation remains smooth on desktop and mobile.
8. The visual identity is unchanged.
9. No hero content disappears prematurely.

Test the interaction in a real browser where available.

## Deliverables

- Explain which animations were removed, reduced, or retimed.
- List the files changed.
- Report performance or interaction regressions, if any.
- Confirm what was tested and what remains unverified.

**STOP after this refinement. Do not implement Step 3 yet.**
