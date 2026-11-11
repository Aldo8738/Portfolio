# Knowledge Bridge — Step 6: Human + AI Storytelling

**Codex implementation handoff**  
**Scope:** Chapter 03 only — *A two-way conversation.*  
**Status:** Chapters 01 and 02, including the hero and overload-to-focus animation, are approved and must not be redesigned.

## Objective

Build Chapter 03 of the Knowledge Bridge case study to demonstrate a core engineering capability: **people can review and refine AI-generated relationships, and the system processes those changes and updates the knowledge graph.**

The chapter must be understandable to a recruiter within seconds. Use the established Apple-inspired narrative rhythm—**one focal point at a time**—without copying Apple's visual branding:

**Read → Observe → Correct → Respond → Settle**

This is a focused product/engineering story, not an opportunity to add decorative animation.

## 1. Approved material: do not modify

The following are already approved:

- The typography-led Knowledge Bridge hero and its content-driven layout.
- The hero metric and contribution/technology metadata.
- Chapter 01's dense graph, including its composition, labels, and subtle Querétaro/Berlin magenta markers.
- Chapter 02's focused graph, dense-to-focused transition, visual hierarchy, and scroll timing.
- Existing figure-label treatment, GSAP performance work, and established responsive behavior.

Chapter 03 should begin **after** the focused graph has settled. Do not restructure or re-time the earlier chapters.

## 2. Scene A — Introduce collaboration (text only)

Present a centered editorial statement:

**Eyebrow:** `03 / HUMAN + AI`  
**Headline:** `A two-way conversation.`  
**Supporting line:** `AI proposes connections. People can refine them.`

Behavior:

- Allow the previous graph to recede before the new heading takes visual priority.
- Use the established warm off-white background, bold black type, mono metadata, and generous but deliberate spacing.
- Keep the text fully readable during a stable scroll interval.
- No graph motion behind legible copy; no word-by-word effects or competing decoration.
- Avoid adding a lengthy explanation at this point.

## 3. Scene B — Show one editable relationship

After the heading has been read, fade the text out and bring a **small, focused subset of the existing graph** into prominence.

- Show exactly one relationship that needs a human correction.
- Keep its source and destination clear and labeled.
- Subdue surrounding nodes and edges without erasing useful context.
- Keep all unaffected graph nodes stable.

A possible conceptual example is correcting an erroneous **Paris → Germany** relationship to **Paris → France**, *only if* that example makes sense for the project's data model and interaction semantics.

**First inspect the actual code and project behavior.** Prefer an authentic example if the repository contains one. Do not manufacture contradictory graph edges or imply that the underlying application performs an operation it does not support.

## 4. Scene C — Make the human correction legible

The user should understand the action immediately:

1. The incorrect edge becomes the focus.
2. A human edit is clearly indicated with the existing magenta accent.
3. The incorrect relationship is removed or replaced.
4. The corrected relationship is drawn/revealed and remains visible.

Motion direction:

- Animate the **edge and relevant labels**, not the entire network.
- Prefer a subtle endpoint change, connection redraw, or direct before/after morph.
- Avoid a fake animated mouse cursor, huge swooshes, bounce, particle trails, or multiple edits.
- Give each state enough time to be understood before the next event.

If a visible human-input affordance is necessary, keep it minimal and make it truthful to the real app's edit workflow. Do not add decorative controls that appear interactive but are not functional.

## 5. Scene D — Show backend processing and graph response

Demonstrate the engineering path with **one outbound action and one clear update**:

**Human edit → Backend processes change → Graph reflects update**

- Use a restrained processing signal or compact backend indicator, not a second complex network.
- The corrected relationship should settle as the observable outcome.
- Ensure backend labels and signal graphics do not collide with node labels.
- Do not animate multiple WebSocket loops, arrows, or simultaneous graph changes.

### Technical truthfulness gate

Before implementing, inspect the actual frontend-to-backend communication flow in the repository. Verify whether edits use HTTP, WebSockets, or another transport, and what WebSockets are actually used for (for example, streamed processing updates).

- Do **not** imply the edit request itself is sent over WebSockets if it is not.
- Distinguish edit submission, backend processing, and any streamed UI updates accurately.
- If this case-study illustration is conceptual rather than wired to a live backend, make its states deterministic and representative of the real architecture.
- Do not add fabricated technical claims to visible copy.

## 6. Scene E — Let the corrected graph settle

After the response:

- Leave the corrected edge visible.
- Restore a quiet, readable supporting graph state.
- Remove temporary signal effects and redundant highlights.
- Keep labels crisp and important relationships traceable.
- Hold a substantial stable viewing interval before transitioning toward Chapter 04.

The final scene must look intentional **when animation is completely paused**.

## 7. Attention and pacing

The design principle is **one idea per moment**.

| Scene | Primary focus | Background behavior |
|---|---|---|
| A — Read | Centered explanation | Graph quiet/hidden |
| B — Observe | One editable relationship | Other nodes subdued and still |
| C — Correct | One human edit | No competing activity |
| D — Respond | Backend processing and update | Only necessary signal motion |
| E — Settle | Corrected relationship | Stable readable graph |

Use the existing GSAP and ScrollTrigger implementation. Allow **longer stable reading and viewing intervals**, with relatively brief motion segments. Do not slow or hijack wheel/trackpad input, force scroll snapping, or introduce long blank stretches.

The transitions must reverse cleanly: reverse scrolling should restore the original relationship, messaging, and prior graph state without flashing or timeline conflicts.

## 8. Graph continuity and implementation

- Reuse node IDs, relationship definitions, SVG elements, and cached geometry from Chapter 02 wherever practical.
- Use a focused subgraph of the approved network, not a disconnected illustration.
- Keep node positions stable through the correction.
- Define deterministic **before**, **processing**, and **after** visual states.
- Avoid remounting the graph to switch states.
- Prevent competing GSAP timelines from changing the same properties.
- Do not run force-layout simulation on scroll.
- Avoid React state updates on every animation frame when direct GSAP/property animation is sufficient.
- Clean up ScrollTriggers and animation contexts correctly.

The visual should remain light and smooth on mid-range hardware.

## 9. Visual system

Preserve the ALDO identity:

- Warm cream / off-white background.
- Bold black editorial headings.
- Monospaced section labels.
- Thin, elegant, curved graph connections.
- Dark nodes and readable neutral labels.
- **Magenta used only for the human correction and meaningful active state.**
- Well-controlled negative space and a polished static composition.

Do **not** introduce WebGL, Three.js, physics, neon, glows, particles, glassmorphism, terminal mockups, noisy UI cards, artificial sound, or new animation libraries.

## 10. Mobile, short viewports, and accessibility

On mobile, use the same narrative sequence in a **natural vertical flow**; do not copy a long pinned desktop experience directly.

- Never hide copy before it can enter and remain readable in the viewport.
- Keep the source node, target node, and corrected edge visually legible.
- Avoid horizontal overflow, label cropping, and sticky elements covering content.
- Do not rely on hover to convey the correction.
- If interactive controls are introduced, they must work with touch and keyboard input.
- Respect `prefers-reduced-motion`: show a meaningful, readable before/after representation without requiring scrubbing through an animation.
- Do not reintroduce a fixed `100vh` hero.

Test at minimum: **1440×900, 1366×768, 1280×720, 390×844, and 375×667**.

## 11. Acceptance criteria

- [ ] Chapter 03 opens with the centered `A two-way conversation.` message.
- [ ] Reading and graph animation do not compete for attention.
- [ ] Exactly one relationship is corrected, with a clear before/after difference.
- [ ] The magenta accent identifies a meaningful human action.
- [ ] Backend processing and UI update are easy to understand and technically accurate.
- [ ] The rest of the graph stays mostly stationary.
- [ ] The corrected edge settles into a clean, readable final state.
- [ ] Forward and reverse scroll progression work without jumps, flashes, or unexpected resets.
- [ ] Desktop, mobile, short-viewport, and reduced-motion modes are usable.
- [ ] No significant performance regressions occur.
- [ ] Chapters 01 and 02, the hero, and existing metrics remain unchanged.

## 12. Implementation workflow and deliverables

1. Inspect the current graph code, GSAP timelines, and actual edit/communication architecture.
2. Identify an authentic correction example, or document why the proposed example is technically representative.
3. Implement Scenes A–E using the smallest maintainable extension to existing code.
4. Verify visual clarity in the **initial, editing, processing, and corrected** states.
5. Test forward/reverse scrolling, mobile, short viewports, and reduced-motion behavior.
6. Run the build and relevant checks.
7. Report changed files, animation/state architecture, verified transport semantics, tests performed, and known limitations.

### Hard scope limit

Do not modify Chapter 04, the results/benchmark section, version-history/checkpoint demonstration, unrelated portfolio pages, or any approved earlier scenes.

**STOP after Chapter 03. Present the implementation for review before continuing.**
