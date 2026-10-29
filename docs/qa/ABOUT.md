# About implementation and review

Implemented 29 October 2026 from the [About brief](../ABOUT_PAGE_CODEX_IMPLEMENTATION_BRIEF.md).

## Content and structure

`src/content/about.ts` contains the exact approved title, eyebrow and six paragraphs,
plus metadata. The unused biography placeholder in `site.ts` was removed.
`src/pages/about.astro` composes the existing `SiteLayout` and static
`src/components/about/AboutPage.astro`. The layout retains the single main landmark,
shared header, active navigation, footer, theme picker, skip link and focus styles.
The page uses the existing title convention, `About · Taquería Aldo`.

The desktop composition pairs a large left heading with a right prose column capped
at 54ch. Below 800 px it becomes a single column. Setup paragraphs follow a generous
pause; the final sentence is larger than body text and smaller than the H1. Only
the heading period uses the accent token. Cream, charcoal, system sans-serif,
hairlines and gutters all come from the existing site. Themes remain available.
An ordinary Contact link continues the reading journey.

## Optional motion

`about-page.ts` uses existing GSAP core and CSSPlugin, without hydration or new
dependencies. The intro takes 450 ms with 50 ms staggers, 8 px translation and
opacity from 0.7 to 1. The ending runs once when 15% intersects the viewport:
setup paragraphs settle first, then a 200 ms pause precedes the 450 ms payoff.
Text is visible before intersection and remains selectable throughout.

GSAP matchMedia scopes animations and reverts inline styles on preference changes
or pagehide. The observer disconnects after the first reveal and on cleanup.
Switching to reduced motion reveals everything immediately; switching back does
not replay previously seen text. Browser history restoration retains static,
readable content after cleanup. A fresh document visit can animate once again.
No ScrollTrigger, pinned sections, character splitting, new images or Three.js
imports are needed. Native navigation does not support a shared CV transition,
so the optional handoff is omitted.

## Verification

- `npm run format:check`, `npm run typecheck` and `npm run lint`: passed;
  Astro reports zero errors, warnings or hints.
- `npm test`: 64 tests passed, including the frozen GLB contract.
- `npm run validate:asset`: passed; the production model remains 2,609,612 bytes
  with 218 nodes and 175 meshes.
- `npm run build`: ten static pages; the existing large-chunk warning remains.
- `npm run test:e2e -- tests/e2e/about.spec.ts tests/e2e/contact.spec.ts tests/e2e/cv.spec.ts tests/e2e/navigation.spec.ts`:
  28 Chromium tests passed, including eight new About checks.
- About screenshots captured at 320, 390, 768, 1024 and 1440 px. Desktop, tablet
  and narrow-screen composition visually reviewed. All sizes also pass 200% text
  sizing without horizontal overflow.
- Verified exact paragraph order, one H1/main, active navigation, metadata,
  keyboard focus and onward link, direct entry, Work/CV navigation, Back/Forward,
  reload, repeated scrolling, theme persistence and motion preference changes.
- JavaScript disabled and blocked enhancement scripts retain readable text.
  Content routes load no model, scene, video, audio or Google Fonts resources;
  the history/motion flow reports no page errors.

The Contact history test now names Main navigation explicitly because About also
has a labeled onward navigation landmark. Unit tests and Chromium required
execution outside the sandbox because of Windows process restrictions.
Physical-device, screen-reader and non-Chromium review remain manual. The full
WebGL browser suite and performance benchmarks were not rerun for this HTML change.
