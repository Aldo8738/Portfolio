# Stand atmosphere and damp concrete

22 October 2026. The creator requested fire/grill heat behind the trompo, light
smoke from the stove and trompo, then dimmer interior lighting so the fire's warm
light is more prominent. This explicitly extends the original visual brief.
The production GLB is unchanged.
The later request uses [vibe-reference.jpeg](../../design/vibe-reference.jpeg) for
broader atmospheric smoke: warm steam through the interior, cooler wisps at its
edges, rather than only compact puffs directly above the stove.
The final fog target is [fog-and-background.png](../../design/fog-and-background.png):
low mist wraps the platform, with warm spill in front and cooler blue fog at
the sides. The fog implementation follows that composition.

## Implementation

- Place a small procedural flame sheet in front of the existing heater panel,
  behind the rotating meat. Five narrow tongues flicker independently.
- Emit faint, fading smoke from the griddle and upper front side of the trompo.
  A third emitter spreads broad, thin haze across the front of the cooking opening.
  Wisps expand, curl and drift forward/left. Their warm glow falls off with
  distance from the actual fire light's shared world position, blending into a
  cooler edge tint. Higher opacity makes the broad smoke readable in the dimmer
  interior. This approximates fire illumination in the shader, without volumetric
  lighting, shadowed smoke or postprocessing.
  Ground wisps drift slowly around both sides and the front edge of the platform,
  with warm floor-spill color near the cart and cooler blue falloff outside it.
  Twelve camera-facing puffs on low/mobile and sixteen on standard share one
  instanced draw. Their rise/drift and soft edges are calculated in shaders.
- The effects use three draw calls, three small shader materials and no downloaded
  texture, extra renderer, postprocessing pass or dependency. Quads depth-test
  against the model and do not write depth, cast shadows or intercept raycasts.
  [Three.js instanced rendering](https://threejs.org/docs/pages/InstancedMesh).
- Keep animation on the existing `useFrame` loop, with bounded delta and no
  per-frame React state. Pause before loader dismissal, when hidden/offscreen
  and with reduced motion. Reduced motion retains a still heat/smoke impression.
- Update the mounted shader materials' time uniforms through refs. Fiber's
  installed version copies prop uniform wrappers, so mutating only the original
  memoized uniform object does not animate the GPU materials.
- Use the heater's world bounds and trompo bounds for placement. The griddle's
  emitter is measured in frozen asset coordinates because the cooking surfaces
  share merged meshes. Missing source nodes omit the optional effects and retain
  the earlier practical-light fallback.
- R3F owns the effect geometries/materials and disposes them on unmount. Cached
  GLB geometry/materials are not disposed or replaced by this feature.

## Ground surface

The creator clarified that the ground should read as concrete after rain at
night. A static procedural surface uses fine grain, irregular darker damp
patches and restrained, broken warm/cool highlights. The final surface uses a
flat normal, faint grain and softer patch contrast to meet the request for an
almost flat floor. There are no animated water ripples or bump shading.
Reflections are analytic light pools and camera-dependent glints,
not a second rendering of mirrored stand geometry. The floor adds one draw call
and two triangles, with no texture download or per-frame reflection render.

## Light balance

The standard profile now uses two dim pendants (intensities 0.85 and 0.75) and one
warm orange fire light (intensity 4), replacing the earlier three brighter
pendant lights (6, 8, 5). Low/mobile uses one fire light (5.5), replacing its
single bright middle pendant light (13). Lamp geometry remains emissive.

The fire light sits alongside the heater and warms the meat, back wall and
counter. It is a restrained shadowless approximation of the flame's light;
its brightness stays constant while the flame pattern animates. The hemisphere,
key and cool rim remain, with exterior fill reduced to favor the fire and fog:
hemisphere 0.16 (from 0.4), key 1.1 (from 2), and rim 0.75 (from 1.8). The single cached shadow
map remains unchanged. There are still
three practical point lights on standard and one on low/mobile.

## Visual and render evidence

| View                      | Before                       | After                      |
| ------------------------- | ---------------------------- | -------------------------- |
| Desktop, standard profile | [Before](before-desktop.png) | [After](after-desktop.png) |
| Mobile, automatic profile | [Before](before-mobile.png)  | [After](after-mobile.png)  |

The intermediate comparison shows the first dimmed-fire version before the
creator requested broader smoke, stronger fire illumination in the smoke and
lower surrounding fill:
[desktop before haze](before-haze-desktop.png), [desktop with haze](after-desktop.png),
[mobile before haze](before-haze-mobile.png), [mobile with haze](after-mobile.png).

The final captures use a production preview, Chromium 156.0.8078.4 on Windows,
ANGLE SwiftShader software WebGL, DPR 1, and reduced motion for a fixed front
composition. Desktop is 1280 × 720; mobile is 390 × 844. The baseline uses commit
`21843de`. These frames compare the original interior with the requested warmer,
dimmer interior and still effect shapes. They do not prove animation smoothness.

The baseline first frame reports 339 draw calls including the cached shadow bake.
The flame, smoke, fog and damp concrete add three calls and 36 triangles on
standard, or 28 triangles on low/mobile. No additional GPU
textures are needed. See [before observations](before.json)
and [after observations](after.json). Physical-device FPS and cold-network startup
remain unmeasured; software rendering is a functional check.

## Checks

Unit tests cover world-space placement, preservation of model transforms and
graceful omission when optional sources are missing. The new browser test observes
actual WebGL time-uniform uploads to verify reveal gating, animation, hidden-tab
pause/resume and reduced-motion pause, checks the warmed draw-call budget and
collects shader/compiler console errors. Existing scene tests check real CRT
navigation, camera input, mobile framing, failure fallback and deferred media.

The final production browser run passed all 23 tests, including the cooking
shader animation and draw-call checks. Desktop and mobile after screenshots
were inspected against the earlier captures.
Formatting, lint, typecheck, production build, all 21 unit tests and the frozen
GLB contract check passed. The build retains the existing large-chunk warning.
