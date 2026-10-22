# CODEX TASK — Taquería Aldo: Cinematic 3D Art Direction

## Objective

Transform the existing Taquería Aldo homepage scene from a nicely rendered 3D model into a **cinematic, premium, atmospheric, interactive diorama**.

The visual reference is high-end miniature product photography combined with warm nighttime restaurant photography.

The scene should feel handcrafted, tactile, warm, slightly magical and visually memorable — suitable for an ambitious Awwwards portfolio.

**Important:** This task is exclusively about the visual quality of the 3D stand. Do not redesign the website UI, navigation, typography, project pages or interaction mechanics.

The approved **v3.12.9 selectively merged GLB is frozen**. Do not change its geometry, object placement, materials in the source asset, or interaction hierarchy. Runtime lighting, material adjustments, shadows and camera controls are allowed.

## 1. First, audit the current rendering

Before making changes:

- Inspect the current React Three Fiber scene, camera, renderer, environment and lighting.
- Identify the current ambient, directional, spot and point lights.
- Inspect tone mapping, exposure, color space, shadow settings and material properties.
- Check whether the GLB already contains emissive or baked lighting information.
- Check the active camera position, field of view and target.
- Capture a baseline desktop screenshot and gather current FPS, draw-call and triangle measurements where available.

Identify what is responsible for the current relatively flat appearance.

Do not blindly stack more lights on top of the existing setup.

## 2. Cinematic lighting — highest priority

The scene should look like a small, beautifully illuminated taquería photographed at night.

### Main lighting

Establish a controlled lighting hierarchy:

**Soft key light**

- A large, soft, warm-neutral light coming from the upper front-left.
- Reveal the pink awning, cream surfaces, sign and countertop.
- Produce attractive highlights without washing out textures.
- Avoid harsh, uniformly bright illumination.

**Cool fill light**

- A much weaker blue-toned fill from the opposite side.
- Preserve details in the shadows.
- Complement the dark navy background.
- Create natural color contrast with the warm interior.

**Subtle rim light**

- Add a restrained back or side light to define the silhouette.
- Separate the refrigerator, awning, upper sign, cactus and Polaroids from the background.
- Avoid strong artificial outlines.

### Practical restaurant lighting

The existing hanging lamps should feel like real sources of light.

- Position small warm lights near the actual lamp bulbs.
- Create localized warm illumination on the trompo, grill, counter and surrounding objects.
- Make the lamps visibly luminous, but do not turn them into large blown-out white shapes.
- Ensure nearby objects respond visibly to the warm lighting.
- Use slightly different brightness levels if this improves depth.

The effect should be cozy and inviting, not excessively yellow or orange.

Keep the pink awning vivid, the cream sign readable and the blue refrigerator rich in color.

### Important technical notes

Use an efficient Three.js lighting setup.

Realistic light falloff matters, but expensive shadow-casting point lights are not necessary everywhere.

Prefer one carefully configured primary shadow source, with additional lights used selectively.

Avoid adding expensive postprocessing just to compensate for poor basic lighting.

## 3. Depth, contact shadows and ambient occlusion

This is one of the most important improvements.

Currently, some surfaces feel too uniformly lit.

Improve visual grounding around:

- The stools and pavement.
- The amplifier and guitar pedal.
- Objects resting on the counter.
- The trompo and kitchen equipment.
- The refrigerator and adjacent stand.
- The hanging decorations and awning.
- Recessed areas beneath the counter and roof.

Use a combination of appropriate real-time shadows, material response and restrained contact shading.

Choose ambient occlusion or contact-shadow techniques based on measured visual improvement and GPU cost.

Shadows should have soft edges and natural falloff.

**Avoid:**

- Heavy black halos around objects.
- Muddy dark corners.
- Excessively strong ambient occlusion.
- Fake shadows that visibly float above the ground.
- Expensive shadow rendering from every lamp.

The stand should feel like a physical miniature with weight and believable depth.

## 4. Improve material rendering without redesigning anything

The model is approved. Its colors, shapes, textures and proportions must stay recognizable.

Inspect runtime material response and improve only where necessary.

### Pink awning

- Preserve its bright saturated pink.
- Reveal subtle geometry and surface highlights.
- Keep the roof folds clearly defined.
- Avoid plastic-looking reflections or overexposure.

### Cream sign and gold trim

- Keep the textured TAQUERÍA ALDO lettering perfectly readable.
- Give the gold frame controlled, believable highlights.
- Ensure the sign has enough separation from the dark roof behind it.

### Metal countertop

- Make the counter read as metal through subtle highlights.
- Keep reflections soft and controlled.
- Avoid mirror-like reflections that distract from the details.

### Refrigerator and CRT

- Preserve the deep blue finish.
- Add enough highlights to reveal their rounded shapes.
- The CRT screen must remain readable and clickable.
- Do not allow reflections or bloom to obscure "Work ↗".

### Food, plants and decorative objects

- Preserve the rich handcrafted appearance.
- Make food and plant shapes readable through lighting.
- Do not replace materials with generic glossy shaders.

If you make runtime material adjustments, scope them to exact named materials or objects and document the overrides.

Do not modify or overwrite the original GLB.

## 5. Camera composition and framing

The stand must be the clear visual centerpiece.

Use the current screenshot as the baseline, but refine the camera to better reveal the model's depth.

Priorities:

1. The TAQUERÍA ALDO sign must be fully legible.
2. The pink awning should remain visually dominant without hiding the trompo.
3. The rotating trompo must be immediately recognizable.
4. The CRT must remain prominent as the main invitation to explore Work.
5. The salsa bottles, amplifier and Polaroids should all be discoverable.
6. The entire platform should fit within the desktop viewport without awkward cropping.

Favor a polished three-quarter perspective rather than a completely flat frontal view.

Make subtle adjustments to the camera's position, target, field of view and framing. Do not move individual model parts to solve camera problems.

Account for the existing header and lower navigation overlays.

On narrower screens, use responsive camera framing rather than blindly scaling the canvas. Preserve meaningful access to the interactive objects.

### Cinematic entrance

Once the final static camera composition looks excellent, add a restrained cinematic entrance:

- Start slightly wider or at a subtly different camera position.
- Move smoothly into the final hero composition.
- Use gentle easing and controlled timing.
- Avoid dramatic rotations or large camera movements.
- Do not delay access to the actual portfolio.
- Respect `prefers-reduced-motion`.

The final composition should already look excellent when completely stationary.

## 6. Atmosphere and restrained finishing effects

Aim for visual polish, not a collection of effects.

Explore these only after lighting and shadows are working:

**Subtle bloom**

- Primarily for warm lamp highlights.
- Very restrained.
- Must not blur the sign, screen, illustrations or decorative details.

**Color grading and exposure**

- Preserve a rich navy background.
- Maintain deep but readable shadows.
- Keep the scene warm without turning everything orange.
- Preserve strong pink/blue/cream color separation.
- Use a consistent output color space and tone mapping strategy.

**Subtle ambient motion**

- Keep the trompo rotating continuously at its existing slow speed.
- Other movement should be minimal and intentional.
- Avoid unnecessary floating, shaking or exaggerated idle animation.

Do not introduce fog, excessive particles, heavy depth of field, chromatic aberration, lens distortion or strong vignette by default.

Only retain an effect when it provides a clear improvement and passes performance checks.

## 7. Performance requirements

Visual quality must not come at the expense of an unusable website.

The merged GLB has approximately 175 mesh objects and 70k triangles. Preserve this optimized asset.

Requirements:

- Reuse materials and geometries wherever possible.
- Avoid accidental geometry or material cloning.
- Do not create new lights, textures or GPU resources on every React render.
- Clean up effects and animation timelines correctly.
- Optimize shadow map sizes and update behavior.
- Cap device pixel ratio appropriately.
- Implement a lower-cost visual-quality mode for weaker devices.
- Respect reduced-motion preferences.
- Ensure the scene remains functional when some effects are disabled.
- Keep the existing loading poster/fallback behavior intact.

Do not assume that a particular lighting or postprocessing technique is fast. Measure before and after.

Record desktop and mobile performance results, including FPS, draw calls and important GPU/rendering costs where measurable.

## 8. Preserve all existing interactions

Do not break:

- Continuously rotating trompo.
- Three individually clickable salsa bottles and their theme changes.
- Clickable CRT navigation.
- Clickable sketchbook and drawing viewer.
- Three independently interactive hanging Polaroids.
- Guitar amplifier and audio interaction.
- Existing orbit/drag behavior, if enabled.
- Model loading, cleanup and mobile functionality.

Keep all GLB animation pivots and named interaction targets intact.

Do not modify their intended behavior as part of this visual-polish task.

## 9. Implementation order

Work in the following sequence.

**Pass A — Audit and baseline**
Inspect the renderer and scene, record metrics, capture reference screenshots.

**Pass B — Lighting and shadows**
Implement the key/fill/rim lighting hierarchy, believable practical lamp lighting, and soft grounding shadows.

**Pass C — Material quality**
Tune runtime material response and renderer settings, protecting all original colors and textured details.

**Pass D — Camera**
Refine the default composition, responsive framing and subtle entrance.

**Pass E — Finishing effects**
Only add restrained bloom or grading if comparison screenshots show a meaningful improvement.

**Pass F — Performance and QA**
Measure performance, compare screenshots, verify click targets and test smaller screens.

After each pass, take screenshots and assess the visual result before continuing. Iterate where necessary rather than implementing everything blindly.

## 10. Acceptance criteria

The task is complete when:

- The stand looks significantly more cinematic and dimensional than the current version.
- Warm practical lamps visibly illuminate nearby surfaces.
- The pink awning, gold trim, cream sign, metal counter and blue refrigerator have convincing visual depth.
- Objects feel grounded through believable soft shadows.
- The sign and CRT remain legible.
- The camera composition clearly showcases the full taquería.
- The result remains attractive without postprocessing.
- There is no unwanted clipping, blown-out lighting, excessive darkness or obvious shadow artifacting.
- All existing interactive objects and behavior still work.
- No frozen model geometry or interaction pivots were changed.
- Performance has been measured, with any regressions disclosed.
- Reduced-motion and lower-quality modes remain usable.

## Deliverables

1. Implement the improvements directly in the current Astro/React Three Fiber project.
2. Keep changes organized in reusable lighting, renderer, camera and quality components or configuration.
3. Provide before/after desktop screenshots at the same viewport and camera framing.
4. Provide at least one mobile screenshot.
5. Report the most significant changes and their visual rationale.
6. Report baseline versus final performance measurements.
7. Identify any remaining limitations clearly.

**Creative direction:** The result should feel like a tiny, beautifully crafted Mexican restaurant captured by a professional product photographer at night — warm, tactile, colorful, cinematic and full of personality.

**Primary objective: make the Taquería itself visually exceptional before spending time on additional website UI or interactions.**
