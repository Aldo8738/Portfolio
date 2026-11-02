# Taquería Aldo — Gallery Navigation Polish

## Objective

Redesign the existing hanging-Polaroid gallery controls to achieve a more refined, editorial, tactile aesthetic consistent with Taquería Aldo.

**Use the latest approved gallery mock as the visual reference.**

The current navigation uses generic dark rectangular controls. Replace these with:

1. Compact, outlined PREV/NEXT navigation buttons.
2. A subtle paper-style "Back to stand" sign.
3. A small gallery position indicator.

The goal is a thoughtfully art-directed photography experience, not generic UI components.

**Do not redesign the gallery, change the 3D models, or introduce new interactions.**

## 1. Previous / Next arrows

### Visual design

Create minimal, outlined navigation capsules positioned in the negative space beside the active Polaroid.

Specifications:

- Height: approximately 44px
- Width: approximately 112–124px
- Border radius: full pill
- Border: 1px, warm ivory at moderate opacity
- Background: dark navy, subtly translucent
- Typography: small uppercase labels with modest letter spacing
- Icons: thin, clearly visible directional arrows

Visible content:

- Left: `← PREV`
- Right: `NEXT →`

Suggested colors:

- Text: `#F3E5D1`
- Border: `rgba(243,229,209,0.65)`
- Background: `rgba(8,20,35,0.70)`

The arrows must remain clearly discoverable without hover.

### Interaction

On hover:

- Slightly brighten the border.
- Move the arrow 2–3px in its direction.
- Use a smooth 180–220ms transition.

No pink glow, exaggerated scaling, or heavy glass effects.

Maintain accessible hit targets, visible keyboard focus, and the existing gallery navigation behavior.

### Positioning

Place the arrows beside the active photograph, vertically near its center.

They must not overlap the main photograph or collide with adjacent Polaroids.

On mobile, move the navigation into a compact row below the photograph if there is insufficient horizontal space.

## 2. Back to stand — physical paper label

This is the most distinctive part of the redesign.

Replace the existing dark rectangular button with a small paper label inspired by the physical materials already present in the taquería.

### Visual specifications

- Warm cream paper background: approximately `#E8D5B7`
- Dark ink text: `#201B18`
- Label: `← Back to stand`
- Height: approximately 44px
- Width: approximately 190–220px
- Slightly irregular paper edges
- Extremely subtle texture
- Almost imperceptible shadow

The paper should feel carefully crafted, not excessively aged or distressed.

**Important:**

- No pink underline.
- No tape decorations.
- No glow.
- No exaggerated torn edges.
- No thick shadow.
- No extra 3D geometry.

Use a simple CSS shape or lightweight SVG for the paper background, with a real accessible HTML button on top.

The existing website's typography should remain unchanged. A restrained typewriter-style treatment is acceptable for the paper label only.

### Position and behavior

Place the paper label near the bottom center, above the global bottom navigation.

Ensure it does not overlap the existing "View work" CTA.

Clicking it must preserve the existing return-to-stand behavior, including the appropriate camera transition.

On hover, use a restrained brightness or 2px upward movement. Avoid elaborate animations.

## 3. Gallery counter

Add a quiet position indicator below the active Polaroid:

`02 / 04`

- Small, warm ivory typography.
- Slightly spaced numbers.
- Pink slash as the only accent.
- Centered beneath the active photograph.
- Values must come from actual gallery state.

Do not hardcode the number of photos.

The indicator should remain visually secondary.

## 4. Consistency with Taquería Aldo

The complete design should feel like part of the existing portfolio.

Preserve:

- The cinematic Berlin atmosphere.
- The original hanging 3D Polaroids.
- The current photo transitions.
- The existing brand typography.
- The restrained pink accent language.
- The current navigation and camera controls.

All three themes — Original, Noir, and Synthwave — must remain supported, with adjusted contrast where necessary.

Avoid introducing a separate design language.

The intended feeling is:

**An intimate, carefully curated photography exhibition inside the world of Taquería Aldo.**

## 5. Performance requirements

Implement the controls as HTML/CSS overlays, reusing the current gallery event handlers.

Do not add:

- New Blender assets
- Additional Three.js geometry
- Heavy texture downloads
- Extra rendering loops
- Expensive blur or post-processing effects
- New UI libraries

Use lightweight CSS transitions limited primarily to transforms, opacity, and color.

Respect `prefers-reduced-motion`.

## 6. Acceptance criteria

- The controls match the refined editorial direction.
- PREV/NEXT remain immediately recognizable and accessible.
- The paper exit control feels tactile but understated.
- The photographs remain the primary visual focus.
- The gallery counter updates correctly.
- Controls never collide with photographs or existing navigation.
- Mobile navigation is comfortable and legible.
- Keyboard navigation and visible focus work correctly.
- Existing 3D interactions remain unchanged.
- No meaningful performance regression occurs.

## Implementation approach

First inspect the existing gallery components, camera logic, CSS, and theme system.

Make the smallest cohesive change necessary. Reuse existing components and design tokens wherever possible.

**Do not change the complete homepage or introduce unrelated improvements.**

Once implemented, report which files changed and how the new controls behave across desktop, mobile, and all three themes.
