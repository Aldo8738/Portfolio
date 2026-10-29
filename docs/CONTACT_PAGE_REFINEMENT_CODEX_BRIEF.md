# Taquería Aldo — Contact page refinement

**Audience:** Codex, implementing in the existing portfolio repository  
**Goal:** Upgrade the existing Contact page to the same quality of art direction, typography, interaction, and polish as Work and CV, while adding three functioning contact calls to action: LinkedIn, email, and Instagram.

## 0. Start with the existing project

Before changing code, inspect the current Contact page, its shared header/footer, theme selector (“Choose your salsa”), navigation, route/transition setup, typography and design tokens, and existing GSAP patterns. Reuse the components and conventions already in the repo. Do **not** scaffold a new site or introduce a parallel design system. Do not modify the taquería experience, Work graph, CV timeline, or shared navigation beyond what is necessary for consistency.

The supplied screenshot of the current Contact page is the starting point. Its strengths are the warm cream background, oversized black typography, editorial simplicity, small uppercase page index, pink punctuation, and consistent top navigation. Preserve these.

## 1. Diagnosis — what needs fixing

- The giant headline works, but the supporting text floats in an ambiguous location.
- The page has no actionable contact destination. The sentence “Public contact details will appear here once confirmed.” makes the page feel unfinished and **must not appear in production**.
- Much of the available space is empty without a compositional purpose. Create hierarchy rather than filling that space with decoration.
- The page footer competes with an underdeveloped content area. Give the main content a clear conclusion before the footer.
- Contact should feel like the **final editorial chapter** of the site, not a collection of generic rounded cards or a contact-form template.

## 2. Art direction

**Concept:** “A clear invitation to connect.” A typographic statement, a single bespoke contact emblem, and three beautifully composed editorial link rows.

- Use the existing warm off-white/cream background and shared type system.
- Black is the dominant typographic color; muted grey for supporting text; hot pink only as a precise accent (question mark, focus/hover rule, current nav item).
- Fine, quiet horizontal separators between the three actions.
- No photographs, taco-stand props, generic stock contact icons, giant glowing nodes, glassmorphism, neon glows, floating contact cards, icon clouds, or unnecessary gradients. One distinctive custom vector emblem is permitted, as specified below.
- No separate full-screen 3D content or large animation dependency.
- Use generous whitespace and intentional asymmetry rather than centering everything.

### Signature artwork: the Contact emblem (required visual refinement)

The current screenshot's giant headline occupies the left while the right feels visually empty. Introduce **one bespoke abstract symbol**, with the art-direction quality of the Work project's visual systems. **Do not add a second logo or replace the ALDO wordmark.** This is a section-specific visual, not a brand mark.

**Concept: “Open channels.”** Create a sparse, carefully drawn vector motif made from **three fine routed strokes** that converge into one small, restrained point/open shape. The three paths conceptually represent LinkedIn, email, and Instagram. Think Swiss information design / precision typography, _not_ a literal network of labeled nodes, a neon neural network, an envelope, or a giant @ glyph. It should be intriguing as abstract graphic design even when its meaning isn't explained.

- Composition: 1 large but airy artwork at right of the headline, roughly 260–410px wide at typical desktop widths. Use generous negative space around it and no card container.
- Rendering: a simple inline SVG with elegant geometry, consistent stroke weight, and a few meaningful endpoints; colors from existing tokens: charcoal, quiet gray, one pink highlight. Never introduce a new gradient-heavy palette. No shadows/glows.
- Interaction: when LinkedIn, Email, or Instagram CTA receives hover or keyboard focus, _its corresponding path_ gently draws/brightens; the other paths stay visible but subdued. On focus loss, return to idle. The actual CTAs remain conventional links; artwork is not a navigation trap.
- Entrance: draw the three paths sequentially after the headline has revealed, once, quickly. The completed static artwork must be equally compelling and visible without JS.
- Motion: use lightweight SVG path dash offset or subtle opacity only; no motion on every pointer move. Honor reduced motion; cleanup animations on unmount.
- Responsive: on mobile, place a compact cropped emblem near the headline or omit it if it competes with readable content. Never reduce CTA prominence.
- Accessibility: treat artwork as decorative (`aria-hidden="true"` / unfocusable). Do not convey essential information only through color or animation.
- If the art looks like a conventional diagram or generic icon, iterate on curves, spacing, and proportion before adding effects. Aim for a memorable **editorial mark**, not complex functionality.

### Desktop composition

At larger desktop widths, use two coordinated visual bands:

**Hero band**

- Left, approx. 55–60%: eyebrow `04 / CONTACT` and oversized, carefully wrapped headline `Have something in mind?` (pink question mark).
- Right, approx. 40–45%: the custom Contact emblem, balanced at the visual center of the headline; short supporting copy beneath or adjacent, without centering it awkwardly in the viewport.

**Action band beneath**

- Three full-width editorial link rows separated by fine horizontal rules, using a 3-column rhythm (index / title and subtitle / arrow).
- Keep the rows aligned with the page grid. Their size and visual confidence should rival the headline; they should not become tiny footnotes under the emblem.
- A small thank-you line can finish this band before the shared footer.

The page should now have a clear visual sequence: **statement → signature mark → ways to connect → footer**. Avoid a large unused vertical void between these elements.

**Small screens:** Stack headline, optional emblem, description, and CTA rows in reading order. Use natural document scrolling, no layout that relies on hover, no text overflow, and no sticky/pinned sequence. Keep the footer below the content.

### Suggested copy

Headline:

> Have something in mind?

Support:

> An interesting idea, a collaboration, or just a conversation? I'd love to hear from you.

CTA rows (each opens an actual destination):

| #   | Label     | Microcopy                      | Action                                   |
| --- | --------- | ------------------------------ | ---------------------------------------- |
| 01  | LinkedIn  | For professional connections   | External profile URL                     |
| 02  | Email     | For ideas worth sharing        | `mailto:` to the approved public address |
| 03  | Instagram | For the less professional side | External profile URL                     |

Closing microcopy, low priority, above footer (or aligned at the end of the content):

> Thanks for stopping by.

Copy can be refined to fit the existing voice, but **do not add filler, slogans, or multiple jokes**. Contact should be direct and warm.

## 3. Data-driven contacts

Implement the contact methods as a small typed data collection, not three individually hardcoded UI structures. The existing codebase's data/typing conventions take precedence over this illustrative shape:

```ts
export type ContactMethod = {
  id: 'linkedin' | 'email' | 'instagram';
  order: number;
  label: string;
  description: string;
  href: string;
  external: boolean;
  ariaLabel: string;
};

// This is a structural example, NOT valid production contact data.
export const contactMethods: ContactMethod[] = [
  {
    id: 'linkedin',
    order: 1,
    label: 'LinkedIn',
    description: 'For professional connections',
    href: '', // OWNER MUST CONFIGURE THE REAL PROFILE URL
    external: true,
    ariaLabel: 'Visit my LinkedIn profile',
  },
  {
    id: 'email',
    order: 2,
    label: 'Email',
    description: 'For ideas worth sharing',
    href: '', // OWNER MUST APPROVE A PUBLIC EMAIL, then use mailto:...
    external: false,
    ariaLabel: 'Send me an email',
  },
  {
    id: 'instagram',
    order: 3,
    label: 'Instagram',
    description: 'For the less professional side',
    href: '', // OWNER MUST CONFIGURE THE REAL PROFILE URL
    external: true,
    ariaLabel: 'Visit my Instagram profile',
  },
];
```

**Critical:** The user wants all three CTAs. Do not guess or fabricate LinkedIn/Instagram usernames, and do not silently publish the personal email found in their CV. Ask for, or clearly flag, the exact three destinations as deployment blockers. Ideally use a purpose-made address such as `hello@aldojuarez.com` **only if the owner has actually created and confirmed it**. Do not put an unverified address on the live page. If integrating before details are provided, use clear local development configuration plus a documented release checklist; never ship blank/inert links or a public placeholder sentence.

Keep each method's text, destination, external/internal behavior, and order defined in data. If one is temporarily disabled, make that state explicit in development rather than showing a fake clickable CTA in production.

## 4. Interactions (GSAP, with restraint)

Contact is the calmest section. No animation should delay interaction or make a simple email link harder to use.

**Entrance (once, or on navigation from another page):**

1. Eyebrow and headline reveal gently (opacity + small vertical movement, short stagger).
2. The three-stroke emblem draws into place, subtly and once; body copy settles in.
3. Three contact rows reveal with a brief stagger.
4. Total duration should feel crisp and be interruptible; no forced multi-second cinematic sequence.

**Hover / keyboard focus on a row:**

- Thin separator/accent line gains pink emphasis.
- Text or arrow translates at most a few pixels; no strong scaling or glows.
- Arrow goes slightly up-right and returns cleanly.
- Other rows remain legible; don't dim them dramatically.
- Focus-visible state must match the visual quality of hover and remain clearly accessible.

**Exit:** Prefer the site's existing navigation transition; do not build a separate elaborate transition solely for Contact.

Use transforms/opacity and target only the required elements. Use GSAP context or existing cleanup patterns, kill timelines on unmount, and ensure repeated route visits do not duplicate animations. Respect `prefers-reduced-motion`: all text and links must appear immediately and work normally.

## 5. Link behavior, accessibility, and safety

- External social links: valid, confirmed `https://` URLs, `target="_blank"` and `rel="noopener noreferrer"` if opening a new tab is consistent with the site's current behavior.
- Email: a genuine `mailto:` link. Do not build a backend mail endpoint or expose secrets. `mailto` may open the default email app; this is expected.
- Entire CTA row must be a semantic `<a>` element with a usable accessible name. No button-within-link nesting.
- Maintain visible focus indicators, touch areas of at least 44px, sensible reading order, sufficient contrast, and user-selectable text.
- The heading should be a proper `h1`. Use semantic landmarks where appropriate.
- Avoid a frontend-only “anti-spam trick” that makes the email hard to copy. Publishing a public email entails scraping/spam risk; a separate alias or forwarding address is a good option.

## 6. Footer relationship

The shared footer should remain recognizable: copyright, optional “Choose your salsa” selector, and “Back to stand.” Avoid duplicating contact links in the same viewport unless the existing site already requires them.

- Leave a comfortable separation between the CTA block and footer.
- Keep footer typography appropriately subdued; links should not compete with the three contact actions.
- Do not relocate or break the theme selector just to make the Contact layout fit.
- On narrow screens, let the footer wrap naturally without crowding the CTA rows.

## 7. Architecture & maintenance

Suggested responsibilities (adapt names to existing project structure):

- `contact.data.ts` — labels, descriptions, destination URLs, order and metadata.
- `ContactPage` — semantic structure and page-level layout.
- `ContactLinkRow` — accessible reusable CTA row.
- `ContactEmblem` — single lightweight, decorative SVG; accepts `activeMethod` and responds to CTA hover and keyboard focus. Do not force the page into a large client-side bundle solely to coordinate this.
- Existing shared `SiteHeader` and `SiteFooter` — reused, not cloned.
- Existing GSAP lifecycle utility/hooks — reused for entrance and hover micro-interactions.

Do not add animation libraries beyond existing GSAP or create per-row heavyweight assets. Avoid wrapping the Contact page in unnecessary hydration if current Astro/static rendering can provide the content without it; keep interactivity isolated.

## 8. Responsive / visual QA

Verify at minimum:

- 1440px and 1920px desktop: strong composition; no dead zone; headline and CTAs visually balance.
- 1024px laptop/tablet landscape: headline wraps elegantly; no squashed link labels.
- 768px tablet: layout stacks or adjusts without huge gutters.
- 375px and 320px mobile: no overflow; link rows remain fully tappable, with readable subtitles.
- Keyboard-only navigation: all 3 CTAs and shared navigation are reachable in sensible order.
- Reduced motion: page loads completely visible with no animating entrance.
- Theme changes: original, noir, synthwave all remain legible and consistent with existing design tokens.
- Slow network / no JS where practical: text and links remain accessible.
- All links point to valid approved destinations and work; no dummy anchors, empty strings, or “details coming soon” message in deployed UI.

## 9. Implementation phases

1. **Inspect and document** existing Contact markup, site styles and components, animations, link config, and footer.
2. **Static composition first**. Build the new desktop and mobile layout and three contact rows with real semantic anchors. Review screenshot captures before proceeding.
3. **Connect owner-approved URLs/address**. Treat missing contact destinations as a launch blocker rather than inventing them.
4. **Add restrained GSAP** entrance and hover/focus treatment, plus reduced-motion behavior and cleanup.
5. **Polish and QA** against the Work/CV art direction, theme variants, devices, and interaction states.

## 10. Acceptance criteria

- Contact feels intentionally designed and visually consistent with Work/CV rather than like an unfinished placeholder.
- A distinctive, restrained Contact emblem balances the headline and responds elegantly to the three CTA states without becoming another knowledge graph.
- LinkedIn, Email, and Instagram appear as three **prominent, unmistakable, functioning** editorial CTAs.
- The page is beautiful without motion; GSAP adds polish rather than rescuing a weak composition.
- No fake social handles or unapproved public email address.
- No broken header/footer, theme switcher, navigation, or taquería transitions.
- No unnecessary 3D, images, new libraries, or substantial performance regression.

**Guiding principle:** Make it feel like the final page of a beautifully designed editorial experience: one clear invitation, one memorable visual signature, three effortless ways to respond.
