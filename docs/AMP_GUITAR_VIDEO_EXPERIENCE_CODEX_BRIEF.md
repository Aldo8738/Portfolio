# Taquería Aldo — Guitar Amp → Cinematic Video Experience

**Implementation brief for Codex**

**Scope:** Upgrade the existing guitar amplifier interaction on the 3D homepage.

**Reference:** The four-panel mock supplied in this conversation: (01) explore the stand, (02) camera approaches the amplifier, (03) a video of Aldo playing guitar appears integrated beside the stand, and (04) a closer composition with minimal playback controls and an obvious return action.

> **Design objective:** Clicking the guitar amp should feel like discovering a personal moment hidden in the taquería—not like opening a generic video modal. The stand remains part of the composition. The video is the reveal, not a replacement for the homepage.

## 0. Before making changes

1. **Inspect the existing repo and implementation.** Identify the homepage scene/camera system (Three.js / React Three Fiber, if used), current amp hit target, click handlers, GSAP timelines, sound manager, navigation, loading strategy, styling conventions, and breakpoints. Follow the project's existing architecture; do not scaffold a competing app or introduce a different animation framework.
2. Find the actual guitar video, any original guitar-audio asset, and a suitable poster frame. **Do not invent an asset path or assume a video is present.** If the video isn't committed, implement the interface with a configurable media entry and document the exact asset requirements, while keeping the site functional without it.
3. Preserve existing interactions: Work/monitor, photos, drawings, navigation, theme, homepage camera controls, and the rest of the stand must continue to work.
4. Check how the global sound toggle currently behaves. The video should **replace the amp's audio-only experience**, not play on top of the existing guitar audio.
5. Use the provided mock as an **art-direction reference**, not a pixel-perfect screenshot to reproduce. Adapt it to the real camera, actual stand, the real video, viewport ratio, and performance budget.

## 1. Experience at a glance

**Initial:** The nighttime taquería fills the scene; the amp is visible in front of the stand. A restrained affordance invites interaction (e.g. `Play a little something ↗` or a short handwritten-style `Click the amp`). Avoid permanent animated arrows, oversized labels, or multiple competing hints.

**Click amp:** Temporarily lock scene drag/camera interactions, highlight the amp **once**, and smoothly move/pan the camera into a warmer, closer composition. Preserve the physical relationship between the stand, amp, cactus, and monitor.

**Reveal:** A portrait-ish video panel showing Aldo playing guitar emerges _spatially from the area around the amplifier_. The panel may scale from a near-amp anchor and ease into position, with a soft warm edge and subtle shadow. It should look like a personal memory/performance revealed in the scene—not like an opaque app window.

**Play:** Video begins as part of this user-triggered interaction, with its **own synchronized audio**, subject to browser playback rules and the user's explicit mute preference. The stand stays visible beside/behind it. Show only necessary video controls.

**Exit:** Close button and Escape return to the original camera framing. Fade/scale the panel back toward the amp, stop/pause the video, restore the previous ambient audio state and scene controls, and clear all transient interaction styling. Reopening should work repeatedly.

### Storyboard to implement

| Moment              | Camera / scene                                            | Video / interface                                                | Audio                                                             |
| ------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| `01 / Explore`      | Full stand, amp readable as a target                      | No video mounted in view; understated interaction cue            | Existing site setting                                             |
| `02 / Approach`     | Smooth push-in and slight lateral move toward amp         | Amp receives a short warm pulse; video begins revealing near amp | Resolve playback on the user gesture; no duplicate guitar track   |
| `03 / Performance`  | Compose stand on one side, performance panel on the other | Video is large enough to see the guitar/hands; minimal chrome    | Video's soundtrack only; existing background source ducked/paused |
| `04 / Focus / Exit` | Optional subtle final camera framing                      | Accessible close, pause/play, seek, time, mute                   | Playback responds to controls; exiting restores prior state       |

**Do not** hardcode these steps as separate routes or full-screen page replacements. Treat this as a reversible stateful interaction on the home scene.

## 2. Visual art direction

Follow the actual taquería's established art direction:

- Cinematic dusk/night background, deep navy shadows, amber stall lighting, restrained magenta highlights.
- The panel's video frame should have a **soft warm-magenta/amber atmospheric edge**, not an intense neon rectangle. Use lightweight CSS gradients/shadows over expensive real-time blur or postprocessing.
- Prefer **one well-composed video panel** with a very subtle border, rounded corners matching the existing UI language, and a low-key dark control strip. No stacked fake windows, glass UI cards, large headers, or floating particles everywhere.
- Use the real footage and its natural colors. Basic CSS grading is acceptable if needed, but don't make the guitar performance artificially look like it was filmed inside the 3D stand.
- Keep a recognizable portion of the **stand and amp present** throughout the interaction. The video should never fully erase the setting on desktop.
- Keep text minimal. An optional tiny label such as `A LITTLE GUITAR SESSION` is enough; avoid a new About section, lengthy captions, or tutorial copy.
- Frame the guitarist's face **and hands/instrument** intentionally. Test the true source aspect ratio. Never crop out the guitar merely to force a pretty panel shape.
- The video panel can overlap the 3D scene visually but must sit **below the main navigation** and above noninteractive scenery.

**Suggested desktop composition:** video panel slightly left of center, stand shifted toward the right, with the amp still visible lower in the composition. Adapt dynamically; don't force the same pixel positions for all aspect ratios.

## 3. Motion choreography (GSAP)

Build **one coordinated, reversible timeline**. Prefer the current camera animation utilities and GSAP integration. Timings below are guidelines, not rigid requirements:

| Phase           | Approximate overlap / duration         | Intent                                                                          |
| --------------- | -------------------------------------- | ------------------------------------------------------------------------------- |
| Amp feedback    | 0–200 ms                               | Acknowledge the click immediately; short lamp/emissive emphasis (only if cheap) |
| Camera approach | ~650–950 ms                            | Smooth, cinematic dolly/pan/easing; no aggressive rotations or motion sickness  |
| Panel entrance  | Begins during camera move; ~500–800 ms | Scale/fade/translate from the amp's vicinity into the composed video position   |
| Control reveal  | Last ~150–250 ms                       | Controls fade in once the panel is legible                                      |
| Exit            | ~500–800 ms                            | Reverse gracefully back to the exact saved home camera pose                     |

**Important choreography principles:**

- Avoid an awkward sequence of **zoom, wait, then pop in a modal**. Camera and panel should overlap in time so they feel like one action.
- Do not physically enlarge the video as a Three.js textured plane unless repo profiling demonstrates a compelling reason. Default to a **real HTML `<video>` layer** composited over the canvas, which is easier to decode, control, access, and optimize.
- Make the HTML video panel feel anchored to the amp by computing/using an amp-to-viewport origin during the entrance. If the project already has world-to-screen projection utilities, reuse them. After entrance, position the panel using responsive CSS layout, not per-frame DOM updates.
- Animate `transform` and `opacity` where possible. Avoid animating layout geometry per frame or expensive large-region `backdrop-filter` blur.
- Use nuanced easing such as `power2.inOut` / `power3.out`, not bouncy/exaggerated spring motion.
- Save the starting camera pose and target before transitioning; restore exactly on close, even if the user exits early.
- Use a single source of truth to prevent concurrent timelines, accidental double clicks, and race conditions.
- On fast repeat interactions, kill/reverse/settle the running timeline deliberately; never allow two camera tweens to fight.
- Freeze or temporarily suspend manual orbit/drag while the interaction is active, then restore the exact prior enabled state.
- Avoid unrelated GSAP gimmicks. The **camera–panel spatial transition** is the signature moment.

## 4. Playback & sound — critical

The previous amp interaction played guitar audio alone. **Once this new experience is active, the video is the authoritative source for the guitar performance's picture and sound.**

1. **Never play the original standalone guitar track and video audio together.** Replace or disable the old amp-audio handler when entering video mode.
2. Consider the global sound system. Desired behavior:
   - If the global sound is **off only by default**, the user clicking the amplifier is an intentional request to experience the performance. Attempt playback with sound; keep the displayed sound state coherent.
   - If the user **explicitly chose mute** earlier in this session, respect that choice: open the video muted with an obvious, accessible `Unmute` control.
   - Preserve the previous ambient sound/mute state and restore it on exit rather than inadvertently changing the rest of the site.
3. **Browser autoplay caveat:** Calling `video.play()` _after awaiting a long GSAP timeline_ may lose user activation, especially on Safari/iOS. Attempt the play promise directly from the amp's trusted click handler (with the media element available), while the visual entrance animates separately. If sound-enabled playback is rejected, show an immediately usable in-panel `Play` button; never leave a black or frozen unexplained frame.
4. Other ambient music, sound effects, or optional homepage audio must be **paused or gracefully ducked** while the guitar video plays. Don't create overlapping soundtracks.
5. `Close` pauses playback; seek position on reopen can default to start (consistent and predictable) unless the site already has a continuation convention. Make that decision explicit in code.
6. Pause when the document becomes hidden. Do not unexpectedly restart audible playback when the tab becomes visible again; require an appropriate user action.
7. Keep global sound buttons, video mute buttons, and displayed labels consistent. No `Sound off` indicator while loud video audio is playing.
8. Keep time display, scrubber, pause/play and volume/mute operational if custom controls are used. Test keyboard use; native controls are an acceptable fallback.

**Preferred playback behavior:** video starts automatically from the **amp click** when permitted; if blocked, it remains beautifully framed with an obvious one-click play affordance. There must never be a second hidden audio playback.

## 5. Recommended component boundaries

Use the existing app conventions, not a wholesale refactor. This is one possible split:

```text
HomeScene / TaqueriaExperience
├── existing 3D scene, camera controller and hotspots
├── AmpHotspot (existing target; forwards interaction intent)
├── GuitarExperienceController
│   ├── manages interaction state + camera timeline
│   ├── coordinates scene interaction locks
│   ├── snapshots/restores sound preferences
│   └── handles interruption/cleanup
└── GuitarVideoOverlay
    ├── accessible <video> (actual user footage)
    ├── close button
    ├── playback controls (native or lightweight custom)
    └── poster / loading / blocked-playback / error states
```

Keep media assets in one configurable manifest rather than scattering hardcoded paths:

```ts
// Example only — match existing project typing and paths.
type GuitarMedia = {
  videoSrc: string; // User's real optimized performance video
  posterSrc?: string; // Actual frame from the source video, if available
  captionsSrc?: string; // Optional caption file when relevant
  fallbackAudioSrc?: string; // Existing audio-only fallback only if video unavailable
};
```

Suggested state machine (names may vary):

```ts
type GuitarExperienceState =
  | 'idle'
  | 'approaching'
  | 'revealing'
  | 'playing'
  | 'paused'
  | 'closing'
  | 'error';
```

State must not be inferred separately by the amp, video UI, and camera. The controller owns the authoritative lifecycle. Ensure proper event/unmount cleanup.

## 6. Performance requirements — nonnegotiable

The homepage already has a 3D scene, so the guitar interaction must **not worsen initial loading** for visitors who never click the amp.

- **Do not eagerly download the video** during initial page load. Use `preload="none"` (or equivalent lazy source assignment) until meaningful user intent. An image/poster may be tiny and lazily loaded if it enhances the interaction.
- Use the existing site asset pipeline/CDN where applicable. Ideally serve a modern **H.264/AAC MP4** that works broadly, with `faststart`/progressive playback; consider a smaller/mobile rendition if there is a real need. No giant original camera file shipped to the browser.
- Preserve native browser video decoding. Prefer DOM `<video>`; avoid decoding video to canvas, frame-by-frame JS, or uploading every frame as a 3D texture.
- Keep the 3D scene mounted if necessary for seamless exit, but consider pausing costly scene interactions/physics/secondary updates behind the video. **Do not tear down/reload the entire GL scene** when opening or closing.
- Avoid unnecessary render-loop work while the overlay is visible; profile before and after.
- Use `requestVideoFrameCallback` only if there is a concrete measured need; do not introduce a custom playback engine.
- Do not add new large dependencies for a simple video player. GSAP already exists for choreography.
- Clean up timelines, event listeners, media state and object URLs on unmount. Avoid memory leaks on repeated openings.
- Show the poster or a tasteful first-frame loading state while media buffers; don't reveal a blank black rectangle or freeze the camera waiting for a network request.
- Avoid animation-driven high-frequency React state updates. Prefer GSAP refs for per-frame transforms.
- Use `playsInline` / `playsinline` for mobile, and verify Safari behavior.

**Required check:** loading the homepage without interacting with the amp should **not fetch the full video**. Opening, closing and reopening several times should remain responsive, without accumulating audio or WebGL render cost.

## 7. Responsiveness & accessibility

### Desktop

- Keep a recognizable stand/amp on screen while the video takes focus.
- Video may be offset left with stand on right as in the reference mock; prevent overlap with navbar and sound controls.
- Support normal 16:9 and ultrawide screens, and shorter laptop heights.

### Mobile / narrow viewports

- Do not force the desktop split composition into a tiny screen.
- Use a **prominent portrait-friendly panel** or a clean near-full-screen overlay above the stand, with visible close/playback controls and a small amount of scene context where practical.
- No hover-only essential affordances. Keep controls at touch-friendly sizes and within safe areas.
- Allow the user to exit and return to the 3D stand without getting stuck in browser fullscreen mode.

### Accessibility

- Amp target must be keyboard reachable, discoverable and labeled, e.g. `Play Aldo's guitar video`.
- `Escape` closes. Close button has `aria-label`. Focus moves to the video controls when open and back to amp trigger after close.
- Announce loading and playback errors appropriately without constant noisy live-region changes.
- Use adequate contrast for controls on top of moving video.
- Respect `prefers-reduced-motion`: minimal camera movement, short fade/scale reveal, no parallax, fully functional controls.
- Include captions if there is meaningful speech in the source video; don't fabricate captions for instrumental-only footage.
- Ensure a direct route or regular navigation still works even when the interaction is active.

## 8. States & edge cases

Handle these explicitly:

- First click with slow network: camera can compose, poster appears, buffering indicator is subtle; user can still close.
- Playback blocked: visible Play/Unmute action; not silent failure.
- Video unavailable, missing asset or decode error: graceful message/fallback, optionally the existing **audio-only** performance if configured and desired, plus working Close. Do not crash the scene.
- Double-click amp: ignore/serialize rather than duplicate panel or audio.
- Close during camera approach or buffering: cancel/reverse cleanly; restore controls, camera, audio.
- Open Work/About/Contact navigation mid-performance: pause/close video and clean up before/while navigating, without obstructing navigation.
- Browser back, resize, orientation change, context loss, route unmount: no stuck camera, leaked media, or orphaned overlay.
- Multiple viewports: video never hides its close button or crops the player's hands badly.
- Paused state: video stays composed; screen is not replaced by the homepage.

## 9. Implementation phases — do these in order

### Phase A — Audit and design notes

Locate the existing amp interaction, camera/timeline setup, sound controls, and video. Report the current relevant files and the safest integration points. Identify missing media clearly.

### Phase B — Static composition

Implement the real HTML video layer and accessible close/player controls. Match the reference composition and art direction **before** adding elaborate motion. Test desktop/mobile with actual footage (or a truthful placeholder if no asset is available).

### Phase C — Coordinated animation

Integrate GSAP camera push/pan and amp-anchored video entrance/exit. Verify repeated open/close, interrupted animation, and accurate reset.

### Phase D — Sound + autoplay compatibility

Remove duplicate guitar audio playback. Implement user preference semantics, safe gesture-initiated play, rejection fallback, ambient-source duck/pause, and state restoration.

### Phase E — Performance + QA

Profile first load, video load, scene FPS, and repeated opening on desktop/mobile. Test Safari/iOS and Chromium where available. Fix layout and reduced-motion issues, not by masking them with loading delays.

**Do not** redesign unrelated parts of the portfolio, alter the identity of the taquería, or introduce a new sound framework unless the existing one is demonstrably inadequate.

## 10. Acceptance criteria

- [ ] Amp click now reveals **Aldo's actual guitar performance video**, not just standalone guitar audio.
- [ ] The experience visually connects to the amp and preserves the cinematic stand composition.
- [ ] Camera move + video reveal feel like **one choreographed motion**, without a modal popping in.
- [ ] The main navigation and the Work monitor remain available or safely accessible.
- [ ] The original audio track **never overlaps** with video sound.
- [ ] Global sound and manual mute preferences are handled coherently, with no surprising autoplay.
- [ ] Play/pause, seek, mute/unmute, close, Escape and return-to-amp focus work.
- [ ] Closing restores the camera and scene interaction state exactly; repeated opens work.
- [ ] Initial homepage performance and data usage are essentially unchanged for visitors who never click the amp.
- [ ] Loading, autoplay rejection, video error, mobile, and reduced-motion states are handled.
- [ ] No unnecessary dependencies or new heavy WebGL video textures are introduced.

## 11. What Codex should report back

After implementation, provide:

1. The changed files and a short architectural explanation.
2. The real video/poster asset path used, or the **exact missing input** required.
3. How media loading, user-gesture playback and sound-state restoration work.
4. Responsive and accessibility behaviors implemented.
5. Tests performed, performance observations, remaining risks, and any manual video-compression steps required.

---

### Creative north star

**The guitar amp is a portal to a real person behind the 3D world.** A close camera move, the warm light of the taquería, and a softly integrated guitar video should make the moment feel intimate and surprising. One well-executed transition is better than ten decorative effects.
