# Taquería Aldo — Diegetic Interaction System

**Implementation brief for Codex**  
**Status:** Approved design direction — supersedes the previous floating-label/leader-line proposal  
**Scope:** The existing interactive taquería homepage hero only  
**Objective:** Make the taquería's physical objects the navigation, with restrained contextual UI that appears only when useful.

---

## 1. Creative direction

The 3D taquería already looks cinematic and has strong personality. **Do not remodel it, change the lighting, revise the camera composition, replace its assets, or redesign the portfolio's typography and navigation.** This is an **interaction-layer refinement**, not a new homepage design.

We tried permanent text links, object-anchored annotations, long leader lines, and bold editorial callouts. They made the model look like a 3D configurator or a wireframe overlaid on a beautiful scene. **Remove that system.**

### New principle

> **The objects are the interface.** Their physical responses communicate interactivity. Tiny, context-aware labels clarify the destination only on hover, focus, or selection. At rest, the hero is almost entirely the cinematic taquería.

Aim for **80% of the feedback from the 3D objects / 20% from contextual interface**. The experience should feel like an interactive miniature set, **not** a videogame HUD or a collection of neon buttons.

### Non-negotiables

- **Preserve:** current stand, shaders, meshes, lights, environment, backdrop, atmosphere, camera framing, salsa/theme switcher, header navigation, sound toggle, existing interactions and transition destinations.
- **Remove:** the permanent floating `Work`, `Photos`, `Drawings`, and `Guitar` annotations and their leader lines; do not repurpose them as permanent bright pills.
- **Avoid:** full-object neon outlines, constant glow/pulsing everywhere, aggressive bounce/spring motion, oversized typography over the 3D scene, added libraries without a compelling need, an extra loading stage.
- **Maintain:** easy discovery, fast loading, keyboard support, reduced-motion support, and fully usable mobile navigation.

---

## 2. Inspect the existing application first

Before editing, locate and understand:

1. The existing Astro/React/Three.js/R3F components **as actually implemented** (do not assume paths or architecture).
2. The actual mesh/group representing the **monitor, hanging photos, sketchbook/drawings area, and amplifier/pedal**.
3. Current handlers/routes/GSAP camera transitions for **Work, Photos, Drawings, Guitar**. Reuse them; **do not create fake pages or placeholder actions**.
4. Pointer raycasting and `OrbitControls`/camera drag/zoom interaction: what currently wins when clicking and dragging objects?
5. How existing scene animations, loading states, salsa/theme changes, sound and responsive layout behave.
6. Existing design tokens/fonts/motion utilities; use them rather than inventing an independent UI style.

**First deliverable in your implementation notes:** A short mapping of the real component/mesh references and click handlers to the four interactive targets, plus any limits preventing an exact animation. Make the smallest viable changes, not a broad refactor.

---

## 3. Interaction states

Implement one consistent interaction model, but give each object its **own physically appropriate reaction**.

| State                      | Scene behavior                                                                                                                     | Contextual text                                                                      | Purpose                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| **Default / resting**      | Model looks essentially unchanged. A few tiny cues may be visible only where necessary; no continuous pulsing on all four objects. | **No permanent callout labels or lines.** Existing text on physical objects remains. | Preserve the cinematic first impression.              |
| **Hover / keyboard focus** | Target reacts physically, with subtle local illumination or motion. Other objects stay quiet.                                      | A **small, brand-font, object-anchored** label appears **only if needed**.           | Confirm this is interactive and name the destination. |
| **Selected / pressed**     | Brief tactile acknowledgement, then hand off to the **existing action / camera transition**.                                       | Label can reinforce the selected action briefly; no additional interstitial.         | Make activation feel deliberate.                      |
| **Camera orbit / zoom**    | Interactive cues and labels remain attached to their scene objects and follow their depth/position.                                | Fade or hide when offscreen, occluded, or obstructing core content.                  | Avoid screen-space sticker behavior.                  |

Do not play overlapping hover reveals during a drag. If the pointer moves across objects while orbiting the camera, suppress accidental hover/click activation until the drag ends.

### Interaction timing guidance (not rigid specs)

- Hover reveal: ~180–250ms.
- Object reaction: ~200–400ms, smooth ease-out; no elastic/bouncy motion.
- Hover-out: return to rest in ~200–350ms.
- If a one-time introductory cue is used, start **after the existing entrance transition** and keep it extremely subtle; **no autoplay loop**.
- Honor `prefers-reduced-motion`: eliminate decorative motions; retain clear static focus/hover feedback and all functionality.

---

## 4. Object-by-object behavior

### A. Monitor → **Work**

**Default:** Its existing screen already identifies `Work`, so **do not add a separate Work label**. Keep the monitor's existing position, mesh appearance and visual content.

**Hover/focus:**

- Brighten the screen **slightly**, as a local emissive/material or screen-text effect, without casting an exaggerated neon halo over the whole scene.
- Animate only a tiny element **within the CRT screen** (e.g. `↗` advances a few pixels, a brief scanline/text flicker). Avoid flashing rapidly.
- Optionally make a small indicator LED respond, if one exists.
- Change cursor appropriately, while preserving orbit/drag outside the target.

**Activate:** Trigger **the exact current Work action / camera transition**, not a new page or duplicated route. Keyboard activation works equivalently.

**Priority:** This is the clearest interaction; use it as the implementation reference for the other three.

### B. Hanging Polaroids → **Photos**

**Default:** Hang naturally without a bright outline or permanent external `Photos` label.

**Hover/focus:**

- Target photo tilts or rotates forward **slightly** around its actual hanging point (not around an arbitrary world-space center). Approx. 3–6° maximum, subject to the asset constraints.
- A gentle, local material highlight/glint is acceptable. **Do not outline the entire photo with strong neon pink.**
- When necessary, reveal `Photos ↗` **on the lower Polaroid border** if legible; otherwise use a tiny world-anchored micro-label immediately beside the photo.
- Other hanging photos should stay stable. Do not introduce unrealistic swinging chains.

**Activate:** Call the existing Photos experience.

### C. Sketchbook / paper → **Drawings**

**Default:** Retain the paper/book on the counter and its existing look.

**Hover/focus:**

- If the mesh hierarchy allows it, lift a page corner or very slightly open/tilt a page. Keep movement modest and physically plausible.
- If the model is a single non-rigged mesh, **do not remodel it just for this interaction**. Instead use a subtle surface highlight and tiny page-local reveal.
- Reveal a small `Drawings ↗` mark that appears printed on/near the page, or tightly anchored to it. Avoid large overlays across the tile trim or countertop.

**Activate:** Call the current Drawings experience.

### D. Amp / pink pedal → **Guitar**

**Default:** Amp and pedal stay as modeled. No separate Guitar callout hovering over the floor.

**Hover/focus:**

- Prefer the **pedal LED** or a small existing amp indicator as the affordance; brighten locally, with a soft pink/warm response.
- Optionally rotate/press the pedal switch **very slightly** if geometrically feasible. Avoid moving/shaking the whole amplifier.
- If a text hint is necessary, reveal `Guitar ↗` in a tiny world-anchored label near the amp/pedal, **not** a large pill on the ground.
- Don't autoplay audio or trigger guitar sound just because the pointer hovers over it.

**Activate:** Preserve the current Guitar behavior, including existing sound permissions and activation rules.

### Important consistency rule

**Not every object must use the same label shape.** Consistency comes from the interaction rhythm, subtlety, brand typography, and visual restraint—not from four identical UI pills. If the monitor communicates Work clearly on its screen, it needs **zero** external labels.

---

## 5. Hotspot visibility and discoverability

### Default desktop scene

- Start with the **cleanest possible** version of the current composition.
- If usability testing shows people overlook objects, show **at most a very small, non-looping affordance** at the relevant physical location (monitor glow/LED, photo catchlight, book glint, amp LED). Do not introduce four equally bright pulsing nodes by default.
- Make the **interactive 3D object or an invisible semantic hit target** clickable; visitors should not need to hit a 3px dot.
- Keep the existing short **drag / zoom instruction** as onboarding, then fade or quiet it after actual exploration. Do not imply objects are clickable only through a hidden cursor effect.
- Keep the **top navigation `Work`** as an immediate, obvious route into projects.

### Small but useful reveal labels

If an object needs a label:

- Use the **existing brand typeface and palette**; prefer restrained mixed-case or small typography to oversized all-caps editorial headings.
- Keep it closely attached to the target object's position, tilt/depth and motion.
- **No leader lines.** No detached floating annotations, oversized arrows, chat bubbles, glass cards or heavy neon borders.
- A minimal transparent-background label is preferred. If a small dark plate is required for legibility, it should be unobtrusive and used only during interaction.
- Render labels only while hovering/focusing/selected, and make their enter/exit transitions quiet.

---

## 6. Implementation architecture

**Use the simplest robust implementation consistent with the current app.** Both of these are acceptable:

1. **True in-scene text/details:** emissive screen texture, existing material labels, decal/texture on a Polaroid or sketchbook page.
2. **World-anchored HTML micro-labels:** text projected from a `THREE.Object3D` or attached using the scene's established `drei/Html` setup. This is **not** a failure of the 3D direction—what matters is that they track 3D transforms and appear only contextually. HTML may be preferable for sharp typography and accessibility.

Do **not** insist on new `TextGeometry` or texture generation if existing DOM rendering can achieve the same result with less cost.

### Suggested logical pieces (adapt to actual code)

- `interactiveTargets`: IDs, object refs, existing actions, optional accessible label names.
- `useSceneTargetInteractions` or equivalent: one source of truth for `idle | hovered | focused | selected`, plus interaction gating during camera drag, entrance and navigation transitions.
- Reusable event wiring: `onPointerOver`, `onPointerOut`, `onClick`, keyboard/focus equivalents where appropriate; avoid conflicting meshes responding for the same action.
- Per-object animation controllers: small material/transform changes with cleanup/restore on hover exit, theme change, unmount and navigation.
- Optional `WorldMicroLabel`: one lightweight world-anchored label component with consistent typography, viewport checks and focus semantics.

### Geometry, raycasting, and camera movement

- Attach interaction transforms/markers to the correct **parent object** so they inherit expected motion, including during orbit and zoom.
- Preserve original local transforms/material values and restore on hover-out. Prevent cumulative transform drift.
- Avoid modifying shared Three.js materials unless clones or per-instance values are intentionally managed.
- Use hit areas larger than tiny visible indicators, ideally reusing actual object meshes or inexpensive invisible proxy meshes.
- If using hidden hit proxy geometry, ensure it is visually transparent and does not affect shadows, render, postprocessing or raycasting outside its target.
- Distinguish click/tap from orbit drag using the app's existing controller events or a pointer-movement threshold. A camera drag must **not** navigate.
- For projected labels, prevent temporary `(0,0)` flashes and hide labels correctly when targets are behind the camera or outside the viewport. Use conservative occlusion handling; do not add expensive per-frame raycasts across all scene meshes without profiling.
- Do not rebuild label React trees on every render frame when a CSS transform or a scene-managed anchor is sufficient.

### Animation and performance safeguards

- Prefer existing GSAP/Three.js animation machinery; do not add physics or a new animation package.
- Use material/transform animation, not large full-scene postprocessing flashes.
- No continuous hover-pulse loops, per-object timers or unnecessary allocations in `useFrame`.
- Stop/cleanup animations when offscreen, when the scene changes, or when the component unmounts.
- Test cold-load, mobile GPU behavior, and camera orbit FPS against the current build. **No noticeable load-time or interaction-performance regression.**

---

## 7. Global homepage UI: keep it separate

The objects replace the old scattered object-navigation layer, **not** the global site controls.

**Keep unchanged unless a small polish is necessary:**

- Top-left name + subtitle.
- Top-right `Work`, `CV`, `About`, `Contact` navigation.
- Bottom-left `01 / EXPLORE` and `Choose salsa` theme functionality.
- Bottom-right sound toggle and its existing preference semantics.
- Current camera, drag/zoom bounds and reset behavior.

**Polish only if already in scope:**

- Fade the initial `Drag or use arrow keys · Scroll/pinch to zoom` hint after the user has explored; do not hide essential input guidance before first interaction.
- Show or emphasize `Reset view` once the camera leaves its default position; keep it accessible to keyboard/touch users.
- Remove any redundant bottom `Guitar`, `Drawings`, `Photos`, `View work` links **only after** all four scene interactions and responsive fallbacks work.
- Do not turn global controls into floating 3D labels.

---

## 8. Mobile, touch, keyboard and accessibility

**Mobile is a product requirement, not a desktop shrink-down.** A pure hover approach is not acceptable.

### Mobile/touch behavior

- Scene should remain visually clean and navigable by drag/pinch.
- A first tap on an object can reveal its highlight/label; a second tap activates. Make the tap state visually clear and dismiss it when tapping away, **but avoid a frustrating two-tap requirement if an accessible direct action is clearer**.
- Provide a small, tasteful **`Explore` actions fallback** exposing Work, Photos, Drawings, Guitar with real tappable items (especially for small screens or devices where object targeting is difficult). Don't hide all navigation behind hard-to-guess dots.
- Minimum functional touch target around **44 × 44 CSS px** for UI controls, with unobtrusive visual footprint.
- Avoid dragging the camera when the intent is to activate a target, and avoid accidental activation after a drag.

### Keyboard/screen reader

- All four destinations/actions must have **semantic accessible controls** with names; a raw `mesh` pointer handler alone isn't sufficient.
- Ensure `Tab` reaches Work, Photos, Drawings, Guitar in a sensible order, either via companion semantic controls or a clearly labeled accessible exploration menu.
- Focus shows the same contextual response as hover and never relies on color alone.
- `Enter` / `Space` should work for button actions; links should preserve normal link semantics and open-in-new-tab behavior where appropriate.
- Respect reduced motion and provide a no-WebGL/failed-WebGL path to primary destinations, using existing site fallback conventions.

---

## 9. Implement in reviewable phases

**Phase 1 — Audit + remove obsolete overlay**

- Map existing object meshes, route handlers, animations and drag controls.
- Identify the overlay responsible for the old leader lines and floating text.
- Remove obsolete visuals only in a controlled change; ensure no routes become inaccessible.
- Confirm screenshot of the resting scene remains close to the **original clean taquería**.

**Phase 2 — Build and validate Work first**

- Make the monitor itself the hit target.
- Add subtle local screen response and existing click action.
- Test mouse, keyboard, drag-vs-click, reduced motion and theme changes.
- Treat this as the interaction-quality benchmark before extending to all objects.

**Phase 3 — Photos, Drawings, Guitar**

- Add each object's individual physical hover/focus reaction.
- Use in-world text where naturally available; add micro-labels only where clarity requires them.
- Validate hover-out resets transforms and material state exactly, even after camera movement.

**Phase 4 — Contextual labels + responsive fallback**

- Implement minimal world-anchored micro-labels where needed.
- Implement mobile/touch behavior and an explicit, elegant fallback action list.
- Ensure labels do not collide with the name, top navigation, bottom utilities or each other.

**Phase 5 — Final polish + QA**

- Tune reaction strength, easing, interactive hit regions and audio behavior.
- Verify camera transitions, both salsa themes, page navigation, reduced motion, desktop and mobile.
- Run the existing typecheck/lint/build/test workflows; fix regressions from the change.
- Provide a short summary with modified files, key technical decisions, and any remaining limitations.

**Do not do a large unrelated refactor.** Land changes incrementally with easy-to-review diffs.

---

## 10. Acceptance criteria (definition of done)

### Visual

- [ ] Default screenshot has **no permanent floating labels or white leader lines**.
- [ ] Taquería model, styling, lighting, color, framing and background match the current approved look.
- [ ] No intrusive pink outlines, oversized pills, blinking nodes or excessive bloom.
- [ ] The monitor clearly represents Work **inside the screen itself**.
- [ ] Hover responses are physically plausible, subtle and purposeful.
- [ ] Optional labels look like part of the environment, not a 2D wireframe overlay.
- [ ] Default and hovered states feel polished at the actual intended desktop camera framing.

### Interaction

- [ ] Work, Photos, Drawings and Guitar each trigger their **existing functional behavior**.
- [ ] Pointer hover/focus works; feedback resets cleanly when exiting.
- [ ] Camera drag/zoom never inadvertently activates an object.
- [ ] Object activation never unintentionally drags/orbits the camera.
- [ ] Objects, highlights and labels remain aligned during orbit and zoom.
- [ ] Changing salsa/theme does not break or strand animation state.
- [ ] No audio starts without the interaction intended by the original sound behavior.

### Usability and performance

- [ ] Mobile users can reliably discover and open all four actions.
- [ ] Keyboard and assistive-tech users have a semantic path to every action.
- [ ] Reduced-motion setting is respected.
- [ ] Existing loading/entrance sequence and nav remain intact.
- [ ] No meaningful increase in load time, dropped frames, visual flicker or GPU memory usage.
- [ ] Production build and available checks pass.

---

## 11. Visual QA scenarios to test

1. **Desktop, initial load:** clean, cinematic hero; no callout clutter.
2. **Monitor hover:** subtle screen response; Work stays integrated within monitor.
3. **Photos hover:** one photo responds; no nearby labels cross the stand.
4. **Drawings hover:** book/page response; counter and tile geometry stay intact.
5. **Amp/pedal hover:** small LED response; no heavy glowing amp outline.
6. **Orbit and zoom:** target interactions remain correctly attached; labels never lag, flicker or jump to the corner.
7. **Fast hover between targets:** no stuck glow or cumulative object movement.
8. **Camera drag beginning on a target:** rotates without accidental click-through.
9. **Small laptop and narrow mobile:** all actions reachable, no controls overlap.
10. **Keyboard-only / reduced motion / both salsa modes:** same functional accessibility; no regressions.

---

## 12. What NOT to build

- No more permanent `/ 01 WORK ↗`-style editorial callouts in open screen space.
- No long leader lines or technical-diagram annotations.
- No giant floating UI cards or permanent glassmorphism panels.
- No forced fully 3D text meshes where sharp accessible HTML would be better.
- No all-objects-pulse-at-once introduction and no perpetual hotspot heartbeat.
- No aggressive camera shake, bouncy objects, or theme-wide neon glow on hover.
- No changes to portfolio sections outside the taquería unless needed to preserve an existing route or accessibility fallback.

### Final product test

> When I first arrive, I see a carefully lit miniature taquería—not four buttons. When I explore, the monitor, photos, sketchbook, and amp subtly come to life and unmistakably take me to their destinations. The design feels handcrafted, cinematic and coherent with the rest of the portfolio. It is discoverable and accessible without turning into a game HUD.
