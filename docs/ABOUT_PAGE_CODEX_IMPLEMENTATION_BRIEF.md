# Taquería Aldo — About Page / Codex Implementation Brief

> **Scope:** Implement or refine the **About** page/section only, within the existing portfolio.
>
> **Design priority:** Awwwards-caliber art direction through typography, spacing, compositional discipline, and precise interaction — **not** through more visual effects.
>
> **Start by inspecting the repository.** Do not scaffold a new app or replace established systems. Review the current route/component structure, shared typography and color tokens, Work/CV/Contact layouts, navigation, page transitions, GSAP setup, and taquería scene integration. Reuse them wherever sensible.
>
> **Relationship to existing briefs:** This is the About companion to `SELECTED_WORK_CODEX_BRIEF.md`, `CV_CODEX_IMPLEMENTATION_BRIEF.md`, and `CONTACT_PAGE_CODEX_IMPLEMENTATION_BRIEF.md`. Those files are references if present in the repo; **the actual repository is the source of truth**.

---

## 1. Creative thesis — “A little about me.”

The About page is the **human pause** between the technical rigor of Work/CV and the invitation of Contact.

The website already has a richly detailed 3D taquería filled with personal objects and personality. **Do not repeat those props or build another scene.** No photo albums, sketches, dogs, guitars, Polaroids, coffee cups, taco icons, animated ingredients, or gallery. The taquería does that storytelling already.

Instead, let the **copy itself** deliver character, with a subtle, self-aware ending that references the experience the visitor has just had.

### Emotional experience

- **Work:** creative, curious, exploratory; sparse graph/connected-world visuals.
- **CV:** precise, structured, credible; editorial career timeline.
- **About:** open, personal, approachable; **almost purely typography and whitespace**.
- **Contact:** direct, inviting, conclusive.

**Design principle:** This page should feel as carefully art-directed as the visual-heavy sections, even though it uses far fewer elements. It must look exceptional while completely static.

### Non-negotiables

1. Preserve the existing visual identity and routing/navigation.
2. Keep the About page minimal — **no cards, galleries, decorative illustrations, new visual systems, or repeated taquería objects**.
3. Use the **approved copy** below, not generic developer-bio rewrites or extra jokes.
4. Let GSAP enhance the narrative **only once**, with restrained comedic timing for the ending.
5. Ensure full readability and usability without GSAP, hover, JavaScript animation, or an incoming transition.
6. Do not sacrifice navigation speed, accessibility, or perceived performance for a fancy reveal.

---

## 2. Approved content — use this copy

Treat the following as the canonical first version. Preserve the voice, paragraph breaks, and ending. Don't add “powered by coffee,” a sushi gag, career summary, skill list, self-promotion, or extra puns.

**Eyebrow (small editorial label):** `03 / ABOUT` (adjust the numeric index only if the site's actual page order differs).

**H1:** `A little about me.`

**Body, in this order:**

> ¡Hola! I'm Aldo, a software engineer from Mexico, now based in Berlin.
>
> I'm curious by nature. I love discovering new places, figuring out how things work, and exploring ideas just to see where they lead.
>
> I'm especially drawn to the space between technology and creativity, where a little experimentation can turn something complicated into something surprisingly simple.
>
> I also have a tendency to take small ideas a bit too far.
>
> This website, for example, was supposed to be a simple portfolio.
>
> **Somehow, you ended up at a taquería.**

### Content treatment

- The first three paragraphs are the **introduction**. They should be readable immediately or with a very short, optional entrance reveal.
- “I also have a tendency…” and “This website…” form the **setup**.
- “Somehow, you ended up at a taquería.” is the **payoff**. Give it visual and temporal emphasis through **space and composition**, not extra exclamation points or an animated taco.
- Preserve the accented **¡** and **í** in `¡Hola!` / `taquería` and ensure fonts support them.
- Do **not** put the entire biography inside an animated SVG, canvas, split-letter DOM clone, or image. It must remain genuine selectable, accessible text.

### Small content refinements — only if truly needed

The approved text comes first. Codex should **not** autonomously rewrite it to sound “more Awwwards.” If a line-wrap problem appears, fix typography and layout rather than changing the wording. Mention any proposed copy edit in the implementation report instead of silently applying it.

---

## 3. Visual direction — editorial, warm, confident

### Preserve shared tokens

Use the exact colors, font families, scale, grid, link styles, nav active state, and header/footer conventions currently established by Work/CV/Contact. Do not introduce a new palette or independent About theme.

Target characteristics:

- Warm off-white/cream base.
- Rich near-black headline and body text.
- Very limited magenta/pink: preferably the heading's terminal **period**, or one carefully chosen tiny detail, **not** whole paragraphs.
- Fine neutral dividers or a quiet guide line **only if already part of the shared design language**.
- Typographic hierarchy with strong editorial rhythm, line length, and whitespace.
- No fake paper texture overlay or extra noise unless it is already a shared site treatment.

**Avoid** glowing nodes, dotted orbit diagrams, generic floating 3D shapes, emojis, colorful badges, giant outlined letters, AI-themed patterns, “creative developer” word salad, and decorative squiggles.

### Desktop composition — preferred

Use an **asymmetric two-column editorial layout** only when it suits the actual site grid:

- Left / upper-left: small `03 / ABOUT` eyebrow and oversized `A little about me.` heading.
- Right / center-right: a narrow, beautifully typeset body column with the first three paragraphs.
- Below that body: a distinct, generous pause, then the two-line setup and larger final payoff.
- The page can extend beyond one viewport; **do not force all text above the fold**.
- Align the page with existing shared gutters and header baseline. Prefer slightly off-center composition over mechanically centering everything.
- Target a readable paragraph measure around **48–65 characters** where reasonable; don't stretch prose across the screen.
- Use intentional, responsive `clamp()` sizing and spacing, but tune these to the real project's font metrics and breakpoints.

An alternate layout is acceptable if Work/CV use a shared single-column grid that the two-column format would disrupt. **Visual continuity beats arbitrary layout novelty.**

### Structural sketch (not pixel specs)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ALDO.                           Work   CV   About   Contact   Back to stand │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  03 / ABOUT                                                                 │
│                                                                             │
│  A little                            ¡Hola! I'm Aldo, a software engineer   │
│  about me.                           from Mexico, now based in Berlin.      │
│                                      [more short paragraphs in a narrow    │
│                                       and carefully typeset column]        │
│                                                                             │
│                                                                             │
│                                      I also have a tendency to take small  │
│                                      ideas a bit too far.                  │
│                                                                             │
│                                      This website, for example, was        │
│                                      supposed to be a simple portfolio.    │
│                                                                             │
│                            Somehow, you ended up at a taquería.            │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                           [existing route / Contact onward] │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Intentional final-line emphasis

Treat the last line as a **quiet editorial climax**:

- Slightly larger or heavier than the surrounding body copy, but **smaller than the H1**.
- May break across two lines on small screens naturally.
- Prefer a deliberate margin / whitespace before it, not a giant colored container.
- **One** possible color accent: tiny magenta punctuation (`.`) if that matches the shared heading treatment; otherwise keep the payoff black. Don't color the word “taquería” hot pink just because it is a punchline.
- No bouncing or rotating text. The joke lands because the visitor recognizes the taquería.

---

## 4. GSAP choreography — restraint as a feature

### Primary sequence — direct entry

1. About route content mounts in a readable default state. The H1 and paragraphs have a meaningful static layout before any animation starts.
2. If motion is allowed, optionally reveal the eyebrow/title and intro with a **short opacity + small vertical translate**; use a cohesive, restrained stagger.
3. The setup appears naturally with scroll or as the visitor reaches it, depending on the actual layout.
4. At the ending, **“This website, for example…” settles before “Somehow, you ended up at a taquería.”** The last sentence appears after a very small pause.
5. Once completed, the text stays visible. No looping, blinking, repeated bouncing, or replay every time the user scrolls up and down.

**Suggested feel, not fixed values:**

| Movement        |                  Approx. range | Notes                                   |
| --------------- | -----------------------------: | --------------------------------------- |
| Intro reveal    |                    0.35–0.65 s | subtle, no dramatic travel              |
| Vertical offset |                        8–18 px | transform/opacity only                  |
| Ending pause    |                    0.15–0.35 s | enough for rhythm, not a waiting screen |
| Ease            | gentle `power2.out` equivalent | no bounce/elastic                       |

Adjust to the existing site motion grammar; avoid hard-coded theatrical delays. The ending should be enjoyable but never block the visitor from reading, selecting, scrolling, or navigating.

### Optional CV → About handoff

If the actual navigation architecture already supports cross-route transitions safely:

- The CV timeline's rigid visual line can **ease out / dissolve**, while About's editorial heading appears in the same spatial rhythm.
- This should be **light and brief**, not another full graph morph or a fresh interactive canvas.
- If achieving it would require duplicating the router, persisting a WebGL scene, taking screenshots of pages, or delaying navigation, **do not build it**. A clean fade/cut is better.
- Navigating directly to `/about`, refreshing, browser Back/Forward, and tab switching must work without any prior timeline state.

### Reduced motion and continuity

- Honor `prefers-reduced-motion: reduce`: **display all text immediately**; disable authored transforms/ScrollTrigger sequencing and long transitions.
- Keep content visible without JS. Where GSAP's `from()` styles might leave hidden content on navigation errors, structure CSS and mount logic so it fails visible.
- Use scoped GSAP context / cleanup (`gsap.context()` or the project's established integration) and revert animations on unmount.
- Avoid animations that depend on arbitrary scroll positions or lock scroll; no pinned section is needed.
- Avoid per-character split animations, expensive blur/backdrop-filter, layout-affecting width/height animation, and animations attached to high-frequency `mousemove` events.

---

## 5. Content architecture — editable, not hardcoded everywhere

Keep copy in a **typed data module or a small JSON/content-file equivalent**, following the patterns already established for Work/CV/Contact. The goal is to make future copy changes without editing animations or layout.

Example TypeScript shape (illustrative; adapt to current project conventions):

```ts
// src/content/about.ts (example path only)
export interface AboutContent {
  id: string;
  eyebrow: string;
  title: string;
  introduction: readonly string[];
  setup: readonly string[];
  payoff: string;
}

export const aboutContent: AboutContent = {
  id: 'about',
  eyebrow: '03 / ABOUT',
  title: 'A little about me.',
  introduction: [
    "¡Hola! I'm Aldo, a software engineer from Mexico, now based in Berlin.",
    "I'm curious by nature. I love discovering new places, figuring out how things work, and exploring ideas just to see where they lead.",
    "I'm especially drawn to the space between technology and creativity, where a little experimentation can turn something complicated into something surprisingly simple.",
  ],
  setup: [
    'I also have a tendency to take small ideas a bit too far.',
    'This website, for example, was supposed to be a simple portfolio.',
  ],
  payoff: 'Somehow, you ended up at a taquería.',
};
```

### Component separation

Suggested small boundaries (do not mechanically create files if existing patterns are simpler):

```text
content/about.ts                 # copy only
pages/about.*                    # actual route / semantic page wrapper
components/about/AboutIntro.*    # eyebrow, H1, introduction
components/about/AboutEnding.*   # setup and payoff
styles/about.*                   # only styles not covered by shared tokens
```

If using Astro + React islands, prefer **server/static HTML for the text**, with only the tiniest client-side GSAP enhancement needed. Don't hydrate an entire page or import Three.js just to animate a few paragraphs. If the existing implementation already uses a React page component, integrate cleanly without introducing a parallel approach.

### Semantics

```html
<main id="main-content">
  <section aria-labelledby="about-title">
    <p class="eyebrow">03 / ABOUT</p>
    <h1 id="about-title">A little about me.</h1>
    <!-- Real, selectable <p> elements for each paragraph -->
  </section>
</main>
```

The example shows intent, not a requirement to output this exact markup. Avoid duplicate `<main>` elements if the shared layout already owns `<main>`.

---

## 6. Responsive design — quality at every viewport

### Large desktop

- Strong asymmetric composition with a comfortable, controlled text measure.
- H1 receives meaningful scale without dwarfing the body or pushing the joke out of view unnecessarily.
- The final line is given real space. Avoid excessively tall dead zones that make the page feel unfinished.

### Laptop / tablet

- Narrower grid and reduced gaps. Reflow naturally before the columns become cramped.
- No tiny body text to preserve an arbitrary art-directed arrangement.

### Mobile

- Collapse to a **single column**: eyebrow → heading → introduction → setup → payoff.
- Allow normal document scroll; avoid scroll-jacking and pinned content.
- Keep body comfortable to read (typically at least ~16 CSS px, appropriate line-height), with balanced paragraph spacing.
- Ensure the payoff is visible as normal text even when motion is disabled or scroll-based effects don't fire.
- Don't let the heading overflow the viewport or create horizontal scroll.
- Nav and Back-to-stand link use the existing responsive behavior.

### Accessibility and SEO

- Use **one H1** in the correct heading hierarchy.
- Text remains real text, keyboard-selectable, and readable with assistive tech.
- Maintain WCAG-friendly text contrast for body, labels, and links; do not use pale gray for actual prose.
- Avoid using animation as the only way to communicate the joke.
- Screen readers should hear the content in logical order, without duplicated hidden copies.
- Manage focus properly on route changes using existing site conventions.
- Preserve the browser page title and meta description conventions; suggested title: `About — Aldo Juárez`.

---

## 7. What Awwwards-level quality means _for this page_

**Not:** complex motion, a new illustration for each paragraph, or a graphic motif filling empty space.

**Yes:**

1. **Typography:** intentional font weights, tracking, line breaks, paragraph measure, accents, and optical alignment.
2. **Composition:** enough negative space to create rhythm, without the page feeling sparse by accident.
3. **Timing:** the final line arrives naturally, with a subtle sense of wit.
4. **Continuity:** immediate recognition that About belongs to the same site as Work/CV and the 3D stand.
5. **Performance:** minimal assets, negligible JS added, no expensive effects.
6. **Accessibility:** equally good experience without motion and on a phone.
7. **Authenticity:** no developer clichés, artificial claims, fake photographs, or multiple forced jokes.

Treat the static version as the primary design artifact. The About page should look composed in a screenshot at any realistic viewport. GSAP is finishing polish, not the source of the visual appeal.

---

## 8. Implementation plan for Codex

### Phase 0 — Inspect before editing

- Find About route/section and where content pages share the header, grid, tokens, footer, and transitions.
- Check the actual font files, type scale, responsive breakpoints, current page transition behavior, and GSAP lifecycle patterns.
- Identify existing wording/sections to replace safely; do not remove unrelated site functionality.
- Confirm whether the page already has useful structure and can be refined rather than rewritten.

### Phase 1 — Build the static version

- Put the approved copy into one typed source of truth.
- Reuse the shared editorial layout and navigation.
- Implement the responsive title/intro/setup/payoff composition.
- Verify that direct loading and mobile rendering look polished **with animations disabled**.
- If the layout feels empty, fix spacing, typography, or hierarchy before adding decorative elements.

### Phase 2 — Layer on minimal GSAP

- Add only one controlled entrance/reveal vocabulary matching the shared project.
- Tune the setup → payoff timing, without making the visitor wait or hiding text for long periods.
- If viable, use a light CV → About transition; otherwise no special handoff.
- Scope, revert, and clean up every timeline and ScrollTrigger on navigation/unmount.

### Phase 3 — QA, tune, and report

- Check desktop, tablet, and mobile screenshots at multiple sizes.
- Test direct About URL, navigation from Work/CV, browser Back/Forward, repeated visits, fast scrolling, and content with JS/motion disabled where practical.
- Verify responsive wrapping, no layout shift, accessible links/focus, reduced motion, and no console errors.
- Run relevant project build, typecheck, lint, and tests. Report actual results; do not invent Lighthouse scores or animation performance metrics.
- Review whether every visible element helps the copy. Remove unnecessary embellishment.

---

## 9. Acceptance checklist

- [ ] About page renders through the existing router and shares the existing header/navigation.
- [ ] The exact approved title and six body/setup/payoff paragraphs are present, in order.
- [ ] There are **no repeated taquería props** or unnecessary illustrations/cards/galleries.
- [ ] Shared warm-cream, charcoal, hairline, and restrained magenta design tokens are reused.
- [ ] Visual hierarchy feels editorial; paragraphs have excellent readability and generous, intentional spacing.
- [ ] Final line has a quiet, memorable emphasis and short, optional timing reveal.
- [ ] No looping, scroll-jacking, excessive GSAP, or added Three.js dependency.
- [ ] Mobile is a readable single-column experience without overflow.
- [ ] Reduced-motion users get the whole copy immediately.
- [ ] Direct page entry and browser history work without requiring a preceding CV transition.
- [ ] Semantic text, proper heading order, keyboard navigation, focus states, and contrast are verified.
- [ ] No unnecessary assets added to the initial site bundle; no regression to taquería, Work, CV, or Contact.
- [ ] Build/typecheck/test results are reported accurately.

---

## 10. What to return after implementation

Codex should give a concise implementation report with:

1. What it found in the current repo and what existing components/tokens it reused.
2. Files created/changed and where About copy now lives.
3. Exact behavior of the intro and ending GSAP sequence, including reduced-motion fallback.
4. Desktop/mobile design decisions and any deviations from this brief.
5. Tests/build commands run and real outcomes.
6. Any follow-up polish suggestions, **separated from implemented work**.

**Final creative north star:** The taquería makes visitors smile before they meet Aldo. The About page lets them recognize the person behind it — with one understated callback at the end. Make it feel intentional, not performative.
