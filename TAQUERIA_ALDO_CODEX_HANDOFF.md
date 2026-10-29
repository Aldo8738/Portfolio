# Taquería Aldo — Codex Implementation Handover

**Status:** Build-ready specification · **Date:** 21 October 2026  
**Project:** Personal creative/developer portfolio presented as an interactive, stylized 3D Mexican taco stand  
**Design baseline:** **Frozen Blender v3.12.9** — do not redesign the geometry  
**Recommended production asset:** `public/models/taqueria_aldo_v3_12_9_selectively_merged.glb`

**Selected Work update:** The creator's later [Selected Work brief](docs/SELECTED_WORK_CODEX_BRIEF.md)
provides the four approved project descriptions and the Work exhibition direction.
It supersedes the empty-project assumptions for `/work` and `/work/[slug]` only.
See [implementation and QA notes](docs/qa/SELECTED_WORK.md); preserve the existing stand and navigation.

**CV update:** The creator's [CV implementation brief](docs/CV_CODEX_IMPLEMENTATION_BRIEF.md)
supplies the approved chronology and skills for `/cv`. It uses the existing shared
navigation and static site shell, with the résumé download omitted until a verified
public asset is supplied. See the [CV implementation review](docs/qa/CV.md).

> **Instruction to Codex:** Treat this as an implementation brief. Inspect the existing repository first, then execute the plan in sensible, testable phases. Do not stop at a decorative mockup. Deliver a working, responsive, accessible **HTML portfolio** behind the interactive 3D entrance. Where personal content or media is missing, implement clearly marked placeholders and a typed content configuration; never fabricate projects, photographs, social profiles, guitar audio, or personal biography. Preserve the approved 3D design.

**Contact update:** The [Contact implementation brief](docs/CONTACT_PAGE_CODEX_IMPLEMENTATION_BRIEF.md)
defines the quiet editorial `/contact` page. Its [implementation review](docs/qa/CONTACT.md)
records responsive checks and the pending verified LinkedIn URL. Contact methods
live in `src/content/contact.ts`; public email requires explicit approval.

---

**About update:** The [About implementation brief](docs/ABOUT_PAGE_CODEX_IMPLEMENTATION_BRIEF.md)
supplies the approved biography for `/about`. It replaces the placeholder with
static editorial text and optional, scoped GSAP reveals. See the
[About implementation review](docs/qa/ABOUT.md); editable copy lives in `src/content/about.ts`.

## 1. Project vision and success criteria

**The concept:** Visitors arrive at *Taquería Aldo*, a cinematic nighttime 3D taco stand that doubles as the navigation system for Aldo's personal portfolio. The experience should feel handcrafted, playful, warm, Mexican-inspired, and unmistakably personal—not like a generic 3D product demo. The stand is the welcome experience; **the work itself is a real, fast, readable HTML website**.

**Visual foundation (already modeled; keep it):** midnight navy environment, magenta/pink striped/scalloped awning, navy-and-cream `TAQUERÍA ALDO` sign with blue stars, warm pendant lamps, rotating al-pastor trompo, detailed counter (mango drink, molcajete/guacamole, sauce bottles), blue refrigerator, vintage CRT monitor, sketchbook containing the creator's drawings, three hanging Polaroids, electric guitar amp/pedal, plants/cactus, stools, dark stone paving, warm/cool cinematic light contrast. **Do not add objects or silently change colors/layout/proportions.**

**Creative priorities:**
1. An excellent and fast first impression even before WebGL is ready.
2. Immediately understandable navigation to actual work/projects.
3. Tangible, delightful interactions tied to existing physical objects.
4. High visual fidelity to the frozen GLB/render, restrained motion, performance on midrange mobile.
5. Accessibility, reduced-motion support, graceful non-WebGL fallback, indexable real portfolio content.

**Definition of done:** A user can open the homepage, see a meaningful preview quickly, explore the 3D scene, click the CRT to enter HTML work pages, squeeze any of three salsa bottles to switch themes, open drawings from the sketchbook, sway/open each Polaroid, play/pause a user-supplied guitar recording from the amp, and observe the trompo slowly rotating. Each interaction must also have a touch- and keyboard-accessible alternative. The app builds cleanly and can be deployed.

---

## 2. Existing assets: authoritative contract

### 2.1 Use these files

| File | Role |
| --- | --- |
| `public/models/taqueria_aldo_v3_12_9_selectively_merged.glb` | **Preferred** website asset: selectively joined static meshes, prepared interaction groups/pivots. |
| `public/models/taqueria_aldo_v3_12_9_optimized_backup.glb` | Safe, unmerged fallback for visual/regression comparison; do **not** serve both to every visitor. |
| `public/media/drawings/*.webp` | Full-resolution artwork **to be supplied**; load only when viewer opens. |
| `public/images/pictures/*.{jpg,png}` | Supplied original photos; load only when viewer opens. |
| `public/media/music/original/h6.mp3` | Supplied amp recording; load/play only after a user gesture. |
| `public/media/sound effects/grilling-meat.mp3` | Supplied looping background audio; sound toggle enables it, amp playback temporarily replaces it. |
| `public/media/sound effects/cartoon-splat.mp3` | Supplied sauce-press sound; respects Sound off and loads on interaction. |
| `public/media/sound effects/soft-whoosh.mp3` | Supplied animated-camera sound; respects Sound off and stops on completion/interruption. |
| `public/images/taqueria-poster.webp` | Approved lightweight static first-paint image **to be prepared** from final v3.12.9 viewpoint; never block first paint on 3D. |

> The packaged handoff bundle includes both GLBs. Original photos are supplied in `public/images/pictures/`, and the amp recording is supplied as `public/media/music/original/h6.mp3`; original drawings remain pending. The GLB already contains **low-resolution** preview images for the sketchbook and Polaroids, and a CRT texture. **Do not duplicate full-size media inside the GLB.**

### 2.2 Verified GLB measurements

| Metric | Selectively merged final |
| --- | ---: |
| Byte size | **2,609,612 bytes** (~2.61 MB decimal) |
| Meshes | **175** (down from 776) |
| Triangles | **70,293** |
| Material definitions | **61** |
| Embedded images | **13**, including sign, CRT, photo/drawing previews, PBR maps |
| GLB scene nodes | **218** |
| Scene root | `TAQUERIA_ALDO` |
| Dimensions, approximately | 6.749 m wide × 3.990 m high × 4.125 m deep |
| World bounds (glTF coordinates) | X `[-3.214, 3.535]`, Y `[0.000, 3.990]`, Z `[-2.050, 2.075]` |
| GLB extensions | `KHR_mesh_quantization`, `KHR_materials_transmission`, `KHR_materials_clearcoat` |
| Animation clips in source | None required; implement runtime interactions in Three.js |

**Coordinate system:** Blender exported to glTF **Y-up**. The stand's customer-facing/front direction is **positive Z**. The trompo rotates around **Y**, not Z, after glTF import. Root transforms and object pivots must be preserved. The merged GLB has **no embedded camera**; implement a responsive scene camera.

**Transport:** The current GLB is directly loadable with Three.js `GLTFLoader` / Drei `useGLTF`. It is **not** a Meshopt/Draco-compressed GLB requiring a special decoder. The parent GLB includes quantized attributes; use a current compatible Three.js version. A `.glb.br` must only be served as the original `.glb` HTTP resource with appropriate `Content-Encoding: br` and `Content-Type: model/gltf-binary` headers; do not try to load `.br` by URL as if it were a GLB. Note: the merged GLB has **worse Brotli transfer size** than the unmerged version despite lower raw size. Browser benchmark both if network speed is the constraint.

### 2.3 Exact scene hierarchy / animation targets

```text
TAQUERIA_ALDO
├── STATIC_ENVIRONMENT                 # merged static decorative parts
├── TROMPO_ROTATING                    # pivot: rotate continuously around glTF Y
├── SALSA_BOTTLES
│   ├── SALSA_RED_PIVOT                 # theme index 0
│   ├── SALSA_GREEN_PIVOT               # theme index 1
│   └── SALSA_ORANGE_PIVOT              # theme index 2
├── CRT_INTERACTION
│   └── HIT_WORK_CRT_SCREEN            # clickable target; other CRT parts grouped here
├── SKETCHBOOK_INTERACTION
│   ├── HIT_DRAWINGS_SKETCHBOOK_0       # left artwork
│   └── HIT_DRAWINGS_SKETCHBOOK_1       # right artwork
├── POLAROIDS
│   ├── POLAROID_0_SWING_PIVOT
│   │   └── HIT_PHOTOS_POLAROID_0      # image key 'lucha'
│   ├── POLAROID_1_SWING_PIVOT
│   │   └── HIT_PHOTOS_POLAROID_1      # image key 'paris'
│   └── POLAROID_2_SWING_PIVOT
│       └── HIT_PHOTOS_POLAROID_2      # image key 'canal'
└── AMP_INTERACTION
    ├── AMP_BODY                        # includes HIT_MUSIC_AMP
    └── AMP_PEDAL                       # includes HIT_MUSIC_PEDAL
```

Each photo pivot also contains its photo print, border, string and clip. Each salsa pivot has body, nozzle and neck-ring child meshes, such as `SALSA_bottle_0`, `SALSA_bottle_nozzle_0`, and `SALSA_bottle_neck_ring_0`. Do not merge these animated groups into `STATIC_ENVIRONMENT`.

**Import contract checks:**

```ts
const requiredNodes = [
  'TAQUERIA_ALDO', 'TROMPO_ROTATING',
  'SALSA_RED_PIVOT', 'SALSA_GREEN_PIVOT', 'SALSA_ORANGE_PIVOT',
  'HIT_WORK_CRT_SCREEN',
  'HIT_DRAWINGS_SKETCHBOOK_0', 'HIT_DRAWINGS_SKETCHBOOK_1',
  'POLAROID_0_SWING_PIVOT', 'POLAROID_1_SWING_PIVOT', 'POLAROID_2_SWING_PIVOT',
  'HIT_PHOTOS_POLAROID_0', 'HIT_PHOTOS_POLAROID_1', 'HIT_PHOTOS_POLAROID_2',
  'PHOTOS_PRINT_lucha', 'PHOTOS_PRINT_paris', 'PHOTOS_PRINT_canal',
  'HIT_MUSIC_AMP', 'HIT_MUSIC_PEDAL',
] as const;
```

On loading, assert these names exist. If a name is missing, surface a clear development error; don't silently replace interactions with approximate positions. glTF extras are exposed via `object.userData` in Three.js (for example `interaction: 'work'`, `'drawings'`, `'photos'`, `'music'`, or `'theme'`). They complement—but do not replace—the node-name contract. Parent nodes are sometimes `Object3D`, not Mesh.

**Polaroid metadata:** photo keys are `lucha`, `paris`, `canal` and titles are `Lucha`, `Paris`, `Canal`. These are existing media identifiers, **not confirmed user-written captions**. Expose accessible descriptions via a configurable content file. Use the low-res embedded images as the default and upgrade on demand when originals become available.

---

## 3. Suggested web architecture

### 3.1 Stack (use existing project setup if suitable)

- **Next.js App Router + React + TypeScript**, for fast indexable HTML project pages and server-rendered content. If this repository already has a healthy Vite/React setup, prefer integrating rather than rewriting everything; ensure route pre-rendering/SEO in that case.
- **React Three Fiber** (`@react-three/fiber`) + **Drei** (`@react-three/drei` / `useGLTF`, camera helpers).
- **GSAP** for coordinated camera moves, squeeze/hover feedback, route transitions. Use `useFrame` for continuous per-frame trompo spin and damped string movement. Avoid React state updates each frame.
- Scoped CSS modules or Tailwind for HTML UI; use **CSS variables** for theme tokens. Avoid giant UI/animation packages without a purpose.
- A small typed app state layer (React context or Zustand if necessary): selected theme, current viewer, audio state, WebGL readiness, reduced-motion/quality mode, and navigation transition.
- Optional `@react-three/postprocessing` **only if benchmarked**, for very subtle bloom; add no expensive post-processing by default.
- Playwright for end-to-end flows, unit tests for state/asset contracts, Lighthouse/Web Vitals for performance.

### 3.2 Primary routes

| Route | Purpose | Critical behavior |
| --- | --- | --- |
| `/` | 3D taquería landing + meaningful HTML fallback/navigation | Show static poster immediately, then progressively reveal the interactive model. |
| `/work` | **Actual HTML portfolio index** | Real semantic project cards, responsive grid, links, images, filters only if useful. |
| `/work/[slug]` | **Actual HTML project detail** | Case-study template with overview, responsibilities, process, visuals, outcomes, external links. |
| `/about` | Short, human introduction | Accessible content and clear navigation. |
| `/contact` | Reach-out links / contact method | Working links; use placeholders until actual details supplied. |

Do **not** build the HTML project pages as unreadable text baked into the CRT texture, or use 3D as the only way to reach `/work`. Use real links and semantic HTML. The CRT is the special entrance; persistent accessible HTML navigation is a non-negotiable fallback.

### 3.3 Suggested repository layout

```text
app/
  page.tsx                    # SSR landing shell and intro/links
  layout.tsx                  # global metadata, theme plumbing
  work/page.tsx               # HTML work listing
  work/[slug]/page.tsx        # project case-study template
  about/page.tsx
  contact/page.tsx
components/
  experience/
    ExperienceCanvas.tsx      # client-only WebGL boundary
    TaqueriaModel.tsx         # GLB load, named nodes, hit targets
    HeroCamera.tsx            # intro, focus transitions, responsiveness
    LightingRig.tsx          # Three.js lighting (no Blender light dependence)
    TrompoAnimation.tsx
    SalsaThemes.tsx
    PolaroidInteractions.tsx
    SketchbookInteraction.tsx
    CrtWorkInteraction.tsx
    AmpAudioInteraction.tsx
    ExperienceUI.tsx          # tooltips, keyboard/touch controls, status
  portfolio/
    ProjectCard.tsx
    ProjectDetail.tsx
    SiteNav.tsx
  ui/
    MediaDialog.tsx
    LoadingPoster.tsx
    AudioControls.tsx
content/
  portfolio.ts               # replaceable typed content and image paths
  media.ts                   # drawing/photo filenames and alt text
  site.ts                    # social/contact links, labels
lib/
  glb-contract.ts            # exact name constants and validators
  theme.ts
  quality.ts
  analytics.ts               # optional, respect privacy
styles/
  globals.css
public/
  models/
    taqueria_aldo_v3_12_9_selectively_merged.glb
    taqueria_aldo_v3_12_9_optimized_backup.glb
  images/taqueria-poster.webp
  media/drawings/
  media/photos/
  media/audio/
tests/
  asset-contract.test.*
  navigation.spec.*
  interactions.spec.*
```

Codex may simplify this if the repository is small, but keep **asset interaction logic separate from page content**.

---

## 4. Core interaction specifications

### 4.1 Continuous al-pastor trompo rotation

- Node: `TROMPO_ROTATING`.
- **Always rotating while the interactive scene is visible**, smooth and subtle; proposed **13 seconds/revolution**.
- Rotate **Y in glTF**, e.g. `pivot.rotation.y += delta * (Math.PI * 2 / 13)` in `useFrame`.
- Keep the grill, heating elements, countertop and stationary base fixed. Do not rotate the whole kitchen.
- Use delta-time independent of frame rate, preserve the original pivot position, pause when scene/document isn't visible, and stop/limit motion for `prefers-reduced-motion` users.
- No physics or baked Blender animation required.

### 4.2 Three sauce bottles: theme selection through squeezing

**Later creator direction:** The [animated salsa review](docs/qa/SALSA_INTERACTION.md)
supersedes the amplitude and wipe suggestions below: use 7% compression, small
nozzle droplets and a thin counter ripple, without moving the camera. Existing
Original/Noir/Synthwave definitions remain authoritative in the implementation.

- Root nodes: `SALSA_RED_PIVOT`, `SALSA_GREEN_PIVOT`, `SALSA_ORANGE_PIVOT`; individually selectable.
- **Proposed configurable mapping** (discussed in the design): **Red → Original (colorful)**, **Green → Noir (black-and-white)**, **Orange → Vintage (warm/sepia)**. Make it a single typed configuration map so it can be changed without geometry edits.
- Desktop hover: small tilt, subtle emphasis, short label. Touch: first tap can select directly; do not require hover.
- Click/tap/Enter: bottle squashes (Y ~0.75, X/Z ~1.10–1.20) over ~120 ms, rebounds over ~300–450 ms using GSAP. Because pivots originate near bottle bottoms, keep bottles anchored to the counter. Guard rapid repeated clicks and restore exact initial transform.
- Optional **lightweight** sauce wipe/splash (CSS/SVG or small shader, **not thousands of particles**) bridges into the selected theme; should complete in under ~0.9 sec and allow reduced-motion immediate switch.
- Theme affects both **3D** and **HTML UI**. Start with lightweight Canvas color grading/CSS filter and CSS custom properties. Avoid loading 3 GLBs or separate texture sets. Noir should be truly monochrome; Vintage warm and muted, but UI retains readable contrast.
- Persist theme across routes (localStorage or equivalent) without a jarring flash. Supply labeled accessible HTML controls, not only tiny 3D hotspots.
- Show nonintrusive initial hint **“Choose your salsa”**; do not repeatedly nag returning visitors.

### 4.3 CRT monitor → the real HTML work website

- Raycast `HIT_WORK_CRT_SCREEN` (or `CRT_INTERACTION` if appropriate).
- The current baked screen content appears **faint/washed out** from the hero distance. Improve **in Three.js** by adjusting just the screen's material/contrast or adding a lightweight sharp `Work ↗` screen face. Do not overexpose it with bloom. Ensure `Work ↗` is obvious from the main hero camera. Preserve CRT geometry.
- Clicking the CRT animates a **short, smooth camera approach** toward the screen (GSAP ~0.7–1.0 sec) and navigates to `/work`, which is a **real HTML page**. Prefer prefetching route code/data on hover or after idle; do not make navigation depend on animation completion in a way that can stall.
- Add an always-available HTML `View work` link to `/work` for mobile, reduced-motion, keyboard and WebGL-fallback users.
- Project detail pages need substantive structure; if real projects aren't provided, show honest explicit draft placeholders, not invented claims or outcomes. Provide a clear return path to the scene.

### 4.4 Sketchbook → drawing close-ups

**Later creator direction:** The [notebook camera review](docs/qa/NOTEBOOK_CAMERA.md)
records the in-scene close-up of both embedded drawings. This increment moves the
camera and retains the authored textures; the full-resolution viewer below remains
pending original drawing assets.

- Interaction targets: `HIT_DRAWINGS_SKETCHBOOK_0`, `HIT_DRAWINGS_SKETCHBOOK_1`; parent: `SKETCHBOOK_INTERACTION`.
- From the 3D scene, click either page or the sketchbook to smoothly zoom/focus and open a responsive viewer showing the actual drawing(s). Could use a short camera approach followed by a semantic HTML dialog/lightbox; do **not** bake the high-res images into the GLB.
- The two already-embedded preview textures are the initial page content. On click, fetch the corresponding full-resolution image **only then**, preferably WebP/AVIF with `<img srcset>`/appropriate sizes. Show the embedded preview while loading and fade to higher definition. Cache repeat visits.
- Viewer supports Close, Escape, focus trap/return, touch scrolling/zoom as appropriate and alt text/captions from `content/media.ts`.
- If high-res files have not been supplied, show available low-resolution preview without broken-image UI and mark the content replacement clearly in code.

### 4.5 Three hanging Polaroids → gentle string physics + zoom

- Pivots: `POLAROID_0_SWING_PIVOT`, `POLAROID_1_SWING_PIVOT`, `POLAROID_2_SWING_PIVOT`; hit meshes `HIT_PHOTOS_POLAROID_0/1/2`.
- When pointer moves near/over a photo, introduce a **small damped angular impulse**, then allow a spring-like settle around its existing hanging pivot. The original photo, clip and string should move together, while **the black horizontal photo rail stays fixed**. Aim for ~5–9° routine sway; cap the maximum angle to avoid clipping.
- Use mathematical spring/damping in `useFrame`; no full rigid-body simulation needed. Interaction should remain stable at 30 or 60 FPS.
- Distinguish **click vs drag** with a movement threshold (e.g. 6 px). The creator's latest direction uses an in-scene camera close-up with left/right arrows and Back to stand, replacing the photo lightbox.
- Image identifiers: `lucha`, `paris`, `canal`. Keep the existing embedded photo textures. Do not overlay or substitute the original JPEG/PNG files in the WebGL close-up. Add a restrained non-shadow-casting Three.js fill light while viewing photos so the prints are easier to see.
- Respect reduced motion. Provide previous/next arrows, keyboard access, accessible photo descriptions and Escape/Back to stand. Adjacent pictures use a short camera slide; entry and return stay outside the stand. HTML photo links remain ordinary image links if the scene is unavailable.

### 4.6 Amplifier → the creator's guitar cover

**Later creator direction:** The [guitar video brief](docs/AMP_GUITAR_VIDEO_EXPERIENCE_CODEX_BRIEF.md)
and [implementation review](docs/qa/GUITAR_VIDEO.md) supersede the audio-only action
below. Use the supplied, optimized `public/media/video/guitar.mp4` with a native
HTML video layer and synchronized camera/panel choreography. The separate guitar
recording must never play alongside the video.

- Interactive targets: `HIT_MUSIC_AMP`, optionally `HIT_MUSIC_PEDAL`; group `AMP_INTERACTION`.
- Click/tap/Enter toggles **play/pause** of a **user-provided recording of Aldo playing a guitar cover**. **No autoplay.** The audio file is not embedded in the GLB; source file/path must be supplied.
- Use HTMLAudioElement or Web Audio API only as necessary; preload **none/metadata**, instantiate/load on first interaction. Use compressed audio (MP3/AAC/Opus depending on browser compatibility); don't use background streaming before interaction.
- Provide visible player state: Play/Pause, track title, simple progress/volume/mute if helpful. A small amp/pedal vibration or LED response can accompany playback, but don't attach heavy realtime audio visualization to every frame.
- Pause on navigation if UX calls for it, handle user gesture/autoplay restrictions and absence of audio gracefully; show a clear “Guitar track coming soon” state until media is supplied.
- Do not invent a song title, source recording or assert copyright clearance. Confirm permissions before public release.

---

## 5. Camera, scene presentation and rendering

### 5.1 Hero composition

- Recreate the frozen Blender **front three-quarter nighttime composition** with the sign, trompo, CRT, notebook, Polaroids and amp all legible. The pink awning has already been shortened in v3.12.9—**do not deepen or raise it again**.
- Build a responsive camera from the model's bounds; don't assume Blender's preview camera is included. Front is **+Z**. Keep sign in-frame, avoid cropping interactive objects on narrow screens. On desktop use slight three-quarter angle and very subtle GSAP opening drift; on mobile prefer a more frontal/reframed view or alternate safe crop.
- Keep camera movement restrained (small drift or gentle parallax). No high-amplitude auto-orbit that makes clicking objects difficult or causes nausea. When a modal opens, pause unrelated motion.
- Add a simple HTML heading/introduction and discoverable `View work` CTA on top of/next to the scene. Make the portfolio purpose clear within seconds.

### 5.2 Lighting authored for Three.js, not baked Blender lamps

- The **lamp geometry remains in the GLB**, but scene illumination is authored in Three.js. Start with 1 ambient/hemisphere fill, 1 warm key, 1 cool rim/fill, and tightly budgeted shadow casting (ideally one shadow-casting source). CRT and grill can receive restrained emissive treatment.
- Match the approved cinematic midnight look. Avoid overly white lights that wash out the textured sign or `Work ↗` CRT screen. The transparent mango bottle uses glTF transmission and may need material tuning in Three.js; visually verify it on mobile.
- Add subtle bloom only after baseline performance is confirmed; use resolution/downsample and a low threshold/strength. No blanket environment-map download unless its visual benefit is clear.
- Themes should recolor without forcing relight/rebuild of the entire scene.

---

## 6. Performance architecture — highest priority

**Existing model is already lightweight in download size, but render count remains meaningful.** Its 175 meshes / 61 materials may still produce many draw calls. Do not make claims about FPS before measuring on real devices.

1. **Fast first paint:** SSR/prerender real HTML shell and a lightweight **poster image**. Display real navigation immediately even if WebGL is delayed or unavailable. Poster should be from the approved v3.12.9 camera; generate it once as a build asset, not at runtime.
2. **Deferred 3D hydration:** Client-only/dynamic import of the React Three Fiber experience. Begin fetching the GLB soon enough for responsiveness, but do not block the LCP poster or the HTML route. Reveal Canvas only after model compilation/first meaningful frame to avoid a blank jump. A graceful fade is sufficient.
3. **Lazy secondary content:** Full-res photos, drawings, project gallery images and guitar audio must not be fetched on the initial scene load. Use route-level splitting and fetch-on-open, with optional cautious prefetch on hover/idle.
4. **No duplicate 3D assets:** Load **one** GLB, **one** scene and switch visual themes through lightweight state/material/filter changes. Do not load the backup model in production.
5. **Mobile quality profiles:** cap DPR (~1–1.5 depending on device), simplify shadows/bloom, limit expensive transmission/postprocessing, avoid expensive transparency stacking. Detect WebGL failure gracefully. Do not blanket-disable interactive content on mobile.
6. **Animation discipline:** trompo and damped Polaroids update in `useFrame` with delta-time; no React setState in render loop. Pause/reduce updates when document hidden or scene out of view; obey reduced-motion. Kill GSAP timelines and media listeners on component cleanup.
7. **Texture handling:** 13 textures already embedded. Don't indiscriminately upscale/reencode the previews or sign; validate texture fidelity first. If applying KTX2/Basis, measure total transfer **and** startup cost rather than assuming it's always faster.
8. **Compression and caching:** Use correct GLB MIME, long-lived immutable caching for versioned asset URLs. Consider HTTP Brotli only after validating hosting headers and transfer benchmarks. Compression alone will not fix GPU draw calls.
9. **Diagnostics:** in development, track model-load time, time-to-first-3D-frame, renderer `info.render.calls`, triangle count, draw calls, texture count, asset network requests and FPS at steady camera. Compare merged vs backup GLB on mobile and desktop.

### Performance targets (aspirational, verify with field/lab data)

| Check | Desired target / expectation |
| --- | --- |
| LCP | ≤ 2.5 s at 75th percentile under Core Web Vitals measurement conditions |
| INP | ≤ 200 ms at 75th percentile |
| CLS | ≤ 0.10 at 75th percentile |
| Poster / CTA | Visible before 3D scene compilation completes |
| Desktop motion | Near 60 FPS on typical modern desktop; no obvious jank |
| Midrange mobile | Smooth, stable ≥ 30 FPS where WebGL supported; degrade expensive effects first |
| Initial 3D file | ~2.61 MB current merged GLB, no additional high-res artworks/audio fetched |
| Work-page navigation | Always functional even if 3D can't initialize |

The full HTML work site is more important than perfect 3D metrics. Prefer functioning navigation, contrast and stable interaction over costly effects.

---

## 7. Accessibility, motion and UX rules

- Every 3D-only action needs an **accessible HTML equivalent** (links/buttons for Work, theme, Drawings, Photos, Music), with proper aria-label/pressed/expanded where appropriate. Use real buttons, not div click handlers.
- Screen readers must discover portfolio content and routes independently of the Canvas. Add semantic `h1`, landmarks, alt text for project media and user-supplied photos.
- HTML lightboxes/dialogs require focus trapping, Esc, focus restoration and scroll locking; do not swallow all page keyboard input.
- Show helpful compact tooltips/hints on first visit, but avoid five simultaneous instructional labels. Touch targets ≥ ~44 CSS px, visual focus and clear cursor feedback.
- `prefers-reduced-motion`: skip entry fly-in, limit/stop trompo, disable sway/squish splash, use instant focus/navigation and dialog transitions. Reduced motion should not disable the actual functionality.
- Sound **never auto-plays**. Always show whether the amp is playing. Video/audio alternatives/captions if content warrants it.
- Preserve theme contrast in HTML; Noir and Vintage treatments must not make the actual case-study pages hard to read.
- Handle disabled WebGL, model download failure, slow network, missing media and mobile touch gracefully without showing an empty homepage.

---

## 8. Content and design tokens (configuration, not invention)

Set up editable typed data instead of hardcoding personal details into mesh handlers:

```ts
export const siteContent = {
  brand: 'Taquería Aldo',
  tagline: 'Portfolio — replace with the creator’s preferred introduction',
  workCta: 'View work',
  projects: [] as Project[], // populate from real project information
  socialLinks: [] as SocialLink[],
  guitarTrack: null as null | {
    src: string; title: string; artist?: string;
  },
};

export const themes = {
  red:    { id: 'original', label: 'Original' },
  green:  { id: 'noir', label: 'Noir' },
  orange: { id: 'vintage', label: 'Vintage' },
} as const;
```

Color direction from the approved model: **midnight navy, deep cobalt, saturated magenta, warm cream/amber, bright green accents**. These are a starting point, not a mandate to paint over the GLB materials. Use responsive editorial typography with distinctive but legible headings for the **HTML portfolio**, restrained motion and ample breathing room. User-supplied project images/designs should be treated as the primary visual content of project pages.

The HTML portfolio should contain at minimum: projects overview cards; individual case studies with title, summary, role, problem/context, process, outcome, selected imagery and links (when actual data is available); about; contact; accessible navigation; footer. Do not fill placeholders with misleading fake case studies.

---

## 9. Implementation phases and acceptance criteria

Codex should tackle these phases sequentially, committing/checkpointing working code after each. **Do not try to land every effect in one untested change.** If source content/media is missing, create the interface and placeholder schema, clearly annotate TODOs and keep moving.

### Phase 0 — Repository audit and asset validation

**Tasks:** inspect package manager, current framework, directory structure and existing content. Keep existing healthy choices. Copy merged GLB into `public/models/`, and keep backup outside public served path if preferred. Add node-contract validator and test that required names resolve. Document local dev/run/build commands. Confirm no assets have accidentally been imported as huge base64 JS strings.

**Pass when:** app starts, GLB parses successfully, all required pivots/hit targets exist, and the target routes are enumerated.

### Phase 1 — Fast HTML portfolio foundation

**Tasks:** implement SEO-ready `/work`, `/work/[slug]`, `/about`, `/contact`, shared navigation, typed content, responsive layout, theme tokens, poster-based homepage and direct `View work` link. Use honest placeholder content where real projects are missing.

**Pass when:** site remains useful with JavaScript/WebGL disabled, HTML routes work, layout adapts to mobile and page titles/metadata are correct.

### Phase 2 — 3D hero, visual match and graceful loading

**Tasks:** lazy Canvas, load merged GLB once, responsive camera, lighting rig, matched night palette, subtle intro, sharpen CRT `Work ↗`, and smooth poster-to-canvas handoff. Instrument load/performance. Implement ambient continuous trompo rotation.

**Pass when:** the stand looks close to approved Blender reference, trompo turns independently, first paint is not blocked, no missing materials/images, no console errors.

### Phase 3 — Physical object interactions

**Tasks:** salsa squeeze → themes, CRT → camera push and `/work` navigation, sketchbook → lazy high-res viewer, Polaroid spring sway/click-to-zoom, amp audio controller. Include tooltips, pointer and keyboard/touch fallbacks, focus management and cleanup.

**Pass when:** every interaction works independently; playing sound is gated by a click; dialogs close correctly; theme persists across HTML routes; hit detection remains reliable with small camera movement.

### Phase 4 — Performance + mobile polish

**Tasks:** dynamic quality profiles, limit DPR/shadows, optional small bloom, image/audio lazy loading, asset caching, WebGL fallback, reduced motion, meaningful hover/touch affordances. Benchmark 175-mesh merged GLB against backup only in development. Profile renderer draw calls and actual mobile FPS.

**Pass when:** no unnecessary network requests for media before opening, no obvious mobile stutters, Lighthouse/Core Web Vitals measurements recorded, routes work without WebGL.

### Phase 5 — Content, QA and deployment

**Tasks:** replace project/media placeholders with creator-supplied assets, add image alt text and audio attribution if needed, metadata/OG images, keyboard/Escape and touch tests, deployment configuration for GLB MIME and caching, launch checklist, README and environment/setup docs.

**Pass when:** production build succeeds; responsive/e2e tests pass; content is real, accessible and legally usable; deployed website can navigate from CRT to actual HTML work pages and all fallbacks function.

---

## 10. QA scenarios Codex must manually and automatically verify

- Desktop first visit: poster/CTA visible immediately, GLB loads exactly once, camera matches approved composition, no texture flicker, trompo turns at a calm rate.
- Click CRT → focus animation (or immediate navigation on reduced motion) → `/work` displays an **HTML** project listing; browser Back works.
- Tap/click red/green/orange bottle repeatedly → squish and restore pivot transform; matching Original/Noir/Vintage state; no overlapping GSAP timelines; keyboard theme buttons work.
- Click/open each sketchbook page → correct left/right drawing, low-res preview followed by high-res asset **only when present/on demand**, close via Esc, return focus.
- Nudge each photo → string/photo sways gently and settles; click each → correct Lucha/Paris/Canal viewer; clicks don't misfire during drag.
- Click amp/pedal without audio source → clear unavailable state, no errors; with provided guitar audio → play/pause works, playback never starts automatically.
- Set system reduced motion → interactions remain accessible but automatic motion and dramatic transitions stop/reduce.
- Mobile portrait and landscape → no clipped essential controls or accidental horizontal scrolling; touch works; low-quality mode has acceptable readability.
- Disable WebGL / block GLB URL → meaningful poster and direct work-navigation remains.
- Test throttled network → neither full-res gallery images nor audio requested on initial page; project routes stay usable before 3D is ready.
- Inspect browser devtools for GLB duplicate requests, renderer draw calls, startup JS and GPU cost; report findings honestly.

---

## 11. Known limitations / open inputs to request from the creator

Do not block implementing the infrastructure on these, but **ask for the real assets before claiming completion**:

1. **Real portfolio projects:** titles, slugs, descriptions, outcomes, imagery, technologies, live URLs and GitHub links as applicable.
2. **Guitar cover recording:** `public/media/music/original/h6.mp3` is supplied; accurate track title and intended credits/permissions remain to be provided.
3. **High-resolution drawings:** final left/right image sources for the close-up viewer.
4. **High-resolution photographs:** supplied originals for `lucha`, `paris`, `canal` now live in `public/images/pictures/`; the GLB retains its embedded previews.
5. **Bio and contact/social links** (do not invent).
6. **Final HTML typography, microcopy, hosting/domain, analytics/privacy preferences**, if not already present in repository.
7. **Approved v3.12.9 render/poster:** needed to match the true final camera/awning for initial page preview.

**Known technical risks:** WebGL material appearance may differ from Blender (especially transparent mango bottle, sign lettering and CRT); photo pivot/drag motion needs visual testing; merging changes texture-side draw calls but does not guarantee overall FPS improvement; glTF transmission may be expensive on older mobile GPUs; SSR HTML and WebGL client hydration require correct boundaries.

---

## 12. Codex execution instruction / first message

> **Start building Taquería Aldo according to `TAQUERIA_ALDO_CODEX_HANDOFF.md`. First audit this repository and its existing stack. Treat `public/models/taqueria_aldo_v3_12_9_selectively_merged.glb` as the approved frozen 3D source; keep the original optimized GLB as a fallback. Implement Phase 0 and Phase 1 first, then Phase 2, maintaining a working build at every checkpoint. Continue with Phases 3–5 unless essential media/content is missing; build safe, explicit placeholders instead of inventing personal material. Verify every GLB node name and interaction, preserve accessibility and performance, run tests/build, and report what works, what is pending, and actual performance numbers. Do not redesign the model.**

### What to report at each phase

- Implemented features and changed files.
- Commands to run the app/tests/build.
- Screenshots or a short visual QA description of desktop/mobile where possible.
- Asset-contract checks and any unexpected missing node/material.
- Actual measured size/load/FPS/draw call data where available (don't guess).
- Missing inputs and the next actionable phase.

---

## Appendix A — Minimal animation code references

These are illustrative examples. Integrate them inside well-typed React Three Fiber components with lifecycle cleanup and handles for missing nodes; don't paste blindly.

```tsx
// The glTF has Y-up coordinates; preserve the pivot's original transform.
const trompo = gltf.scene.getObjectByName('TROMPO_ROTATING');
useFrame((_, delta) => {
  if (!trompo || reduceMotion || !experienceVisible) return;
  trompo.rotation.y += Math.min(delta, 0.05) * (Math.PI * 2 / 13);
});
```

```tsx
// Bottle pivots are anchored near their bottoms. GSAP should be killed on cleanup.
function squeezeBottle(pivot: THREE.Object3D, onSelected: () => void) {
  const initial = pivot.scale.clone();
  return gsap.timeline({ onComplete: onSelected })
    .to(pivot.scale, { x: initial.x * 1.14, y: initial.y * 0.76, z: initial.z * 1.14,
                       duration: 0.12, ease: 'power2.out' })
    .to(pivot.scale, { x: initial.x, y: initial.y, z: initial.z,
                       duration: 0.32, ease: 'back.out(2)' });
}
```

```ts
// glTF extras survive as Three.js userData, and raycast events bubble.
const work = gltf.scene.getObjectByName('HIT_WORK_CRT_SCREEN');
if (!work || work.userData.interaction !== 'work') {
  throw new Error('CRT work target missing or incorrect GLB version');
}
```

## Appendix B — Freeze / change policy

**Freeze v3.12.9 visual composition.** Only change the web application, loading strategy, material overrides needed for fidelity/contrast, event groups and animation. Do not edit the Blender asset or recolor scene elements casually. If a mesh really must change, create an explicit new asset version, compare screenshots and obtain creator approval before replacing the frozen master.
