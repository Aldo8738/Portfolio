# Contact Page — Codex Implementation Brief

**Project:** Aldo Juárez portfolio / Taquería Aldo  
**Scope:** Contact page / section only  
**Design status:** Approved direction for Work, CV, and About is the source of truth  
**Implementation goal:** A memorable, exceptionally clear ending to the portfolio, not another interactive showcase.

---

## 1. Context and creative intent

The overall portfolio experience has a deliberate progression:

1. **Taquería entrance:** cinematic, expressive, interactive 3D world.
2. **Selected Work:** minimalist editorial canvas with sparse connected visualizations and GSAP transitions.
3. **CV:** structured career timeline and a restrained graph-to-timeline transition.
4. **About:** simple personal introduction, largely typography and whitespace; **do not reuse the taquería's props, photo gallery, or illustrations**.
5. **Contact:** a calm, confident closing page that makes it effortless to reach Aldo.

The contact page should feel like the _final punctuation mark_, not a new visual concept. Build on existing typography, color tokens, navigation, motion conventions, routing, and responsive patterns. The page must be effective with **zero animation** and elevated—but not dependent on—subtle GSAP choreography.

**Core principle:** one memorable line, one unambiguous primary action, no visual clutter.

### Visual identity to preserve

- Warm cream/off-white background (reuse existing token; no new arbitrary shade).
- Bold black headline; small magenta/pink period or tiny punctuation accent.
- Dark, understated body copy; fine hairline dividers and quiet metadata.
- Generous whitespace and asymmetric, editorial placement.
- Precise microtypography, clear interactive states, minimal decoration.
- No glowing nodes, neon webs, floating dashboards, 3D props, large decorative icons, excessive hand-drawn arrows, or pointless animated graphs.

---

## 2. Content — recommended copy

Use the following as initial content; keep every string in a small content/config object, not scattered across components.

**Eyebrow:** `04 / CONTACT` (or the correct index based on the actual site's established numbering).

**Primary headline:**

> Have something in mind?

The final question mark or an adjacent small period may carry the established magenta accent. Choose one punctuation treatment consistently with the rest of the website.

**Short description:**

> I'm always happy to talk about interesting ideas, software, design, or a project worth building.

**Primary action (default):**

> Connect on LinkedIn ↗

**Optional secondary action if Aldo explicitly approves publishing a public email:**

> Send an email ↗

**Optional tertiary link if Aldo supplies and approves a public Instagram account:**

> Instagram ↗

**Small closing signature:**

> Thanks for stopping by.

**Footer:**

> © {current year} Aldo Juárez · Mexico → Berlin

Include a low-emphasis **Back to stand ↗** link so visitors have a natural path back to the 3D experience. It must not compete with the main contact CTA.

Don't add availability claims such as "Open for freelance work" or "Currently hiring" unless Aldo confirms them. Don't force a taco pun into the contact copy.

---

## 3. Recommended layout

### Desktop

- Follow the exact site-wide top navigation: `Work · CV · About · Contact`, plus existing home/back-to-stand behavior.
- Use a spacious, responsive editorial layout centered vertically _when viewport space allows_, with a max-width content container matching Work/CV.
- Small section eyebrow above a very large, carefully line-broken headline.
- A restrained 1–2 line description beneath or to the right on wider screens.
- One **prominent text link** for the primary CTA. Prefer bold type, magenta underline/accent, or a finely drawn arrow—not a large generic filled button unless the existing visual system uses one.
- Other approved contact methods appear underneath as quiet text links, separated by generous spacing.
- Thin footer rule, copyright, city journey, and Back to stand link near the bottom.
- A faint architectural/directional line may connect the header region to the primary CTA **only if it improves composition**. Do not turn Contact into another graph.

### Mobile

- Single-column, natural document flow; no fixed-height hero that causes clipped content.
- Headline wraps intentionally; links have touch targets at least ~44×44 CSS px.
- No hover-only affordances. Focus states must be visible.
- Footer remains legible; no overflow or overlapping fixed navigation.

### Content hierarchy

1. Headline — emotional invitation.
2. One-sentence explanation — context.
3. LinkedIn — primary action by default.
4. Email (if enabled), Instagram (if enabled) — secondary options.
5. Signature and back-to-stand — closure.

**Do not create contact cards, a socials grid, a form, a chatbot, animated icons orbiting a node, or duplicate the About biography.**

---

## 4. Email and privacy decision — important

A public professional email address is generally acceptable for a portfolio and is often the easiest way for recruiters or collaborators to contact you. **It is not risk-free:** public addresses can be scraped and receive spam, phishing, or unwanted messages. There is no reliable technique to make an email publicly clickable while keeping it secret.

**Default recommended behavior:** show LinkedIn as the primary method and **do not publish the email until Aldo explicitly opts in**. Instagram is optional and should be shown only if it is a profile Aldo intends to make publicly accessible.

If Aldo chooses email later:

- Prefer a dedicated professional alias/forwarding address (for example, a custom-domain alias) over a private inbox if practical.
- Render a standard `mailto:` link; optionally add a simple **Copy email** control, but only when an address is configured and after the normal link already works.
- If a copy control exists, show an accessible "Copied" confirmation on success and an honest error fallback if copying fails.
- Do not show phone number, home address, private accounts, or any details discovered from résumé files unless specifically approved for public display.
- Do not implement fake privacy via base64, string splitting, client-only environment variables, CSS encoding, etc. These do **not** keep addresses secret in shipped browser code.
- Do not add a contact form or a third-party messaging service unless separately requested; forms introduce storage, spam prevention, privacy, maintenance, and security considerations.
- Do not fetch any contact-related third-party SDKs on initial load.

### Important guardrail

**Never infer a social profile URL from the person's name.** No invented LinkedIn or Instagram links. Inspect the existing repo for an already-configured and verified profile; otherwise leave the corresponding href unset and clearly document what Aldo needs to provide before launch. **Do not ship a visible dead CTA, `href="#"`, or an untested placeholder URL.**

---

## 5. Extensible, typed content/config model

Use a small typed TypeScript structure compatible with the existing stack. The following is an illustrative interface, **not a mandatory directory structure**.

```ts
export type ContactMethod = {
  id: 'linkedin' | 'email' | 'instagram';
  label: string;
  href: string | null;
  enabled: boolean;
  primary?: boolean;
  external?: boolean;
};

export type ContactPageContent = {
  eyebrow: string;
  headline: string;
  description: string;
  closing: string;
  methods: ContactMethod[];
};

export const contactContent: ContactPageContent = {
  eyebrow: '04 / CONTACT',
  headline: 'Have something in mind?',
  description:
    "I'm always happy to talk about interesting ideas, software, design, or a project worth building.",
  closing: 'Thanks for stopping by.',
  methods: [
    {
      id: 'linkedin',
      label: 'Connect on LinkedIn',
      href: null, // Fill with Aldo's verified public URL before enabling.
      enabled: false,
      primary: true,
      external: true,
    },
    {
      id: 'email',
      label: 'Send an email',
      href: null, // Fill with mailto:address ONLY if Aldo approves publication.
      enabled: false,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      href: null, // Fill with verified public URL ONLY if approved.
      enabled: false,
      external: true,
    },
  ],
};
```

Implementation expectations:

- When adding a method, use a single data entry, not additional JSX or hardcoded styling branches.
- Only render methods with `enabled === true` and a valid, verified `href`.
- Prefer an existing site-wide content registry and link configuration if available; don't create duplicate global data.
- If no verified contact link exists, show a graceful, truthful non-interactive placeholder and **flag the missing link as a launch blocker**. Do not fabricate a way to contact Aldo.
- Choose the **first enabled method marked primary** as the visually dominant action; fall back to the first enabled method if necessary.
- Keep content separate from animations, view components, and styling.
- Standard anchors should work without JavaScript. For `target="_blank"`, use `rel="noopener noreferrer"` and indicate external destinations accessibly if appropriate.
- Keep any automatic tracking off by default; avoid publishing the contact address in analytics event payloads.

Suggested files **only if they fit the current project**:

```text
src/
  data/
    contact.ts
  components/contact/
    ContactSection.*
    ContactLinks.*
  pages/
    contact.*
```

Do not force this structure on a repo that already has an established feature layout.

---

## 6. GSAP experience: understated, purposeful

### Preferred entrance sequence

1. Navigating from About or elsewhere keeps the existing shared header and layout stable.
2. A fine line/point inherited from the site's editorial motifs moves subtly toward the contact area, **if an existing shared element can be reused simply**.
3. Eyebrow appears, followed by the headline with a short line/word reveal.
4. Description and CTA fade/translate in with a small stagger.
5. The accent underline or tiny magenta punctuation settles into place.

**Total impression:** elegant and quick. No prolonged intro or scroll-jacking. An interaction should be usable immediately; don't gate clicking behind animation completion.

### Hover / focus

- Underline/arrow shifts subtly for enabled links (e.g., ~4–8px arrow movement).
- Keyboard focus triggers an equivalent clear visual state, not animation-only feedback.
- Use GSAP only when it adds something beyond CSS. Simple hover transitions can remain CSS.

### Returning to the taquería

- Reuse the existing route/navigation transition and scene lifecycle where available.
- Do **not** load a second Three.js instance or clone the stand to support Contact.
- Avoid persistent Contact-only animation loops.

### Motion engineering

- Use `gsap.context()` or equivalent cleanup scoped to the actual component, with proper teardown on route changes.
- Animate `transform` and `opacity` where possible; avoid layout thrashing and expensive blur/backdrop filters.
- Respect `prefers-reduced-motion`; no entrance motion and no essential information hidden behind transitions for those users.
- Site must remain fully readable, navigable, and clickable if GSAP fails to load.

---

## 7. Responsive, accessible, and performance requirements

- Semantic `<main>`, `<h1>`, landmarks, and ordinary anchors; accessible names match visible labels.
- Keep only one primary heading; preserve logical reading and keyboard order.
- Contrast must meet WCAG AA for normal text and interactive controls.
- Visible keyboard focus; no interaction that requires a mouse.
- Support common viewport widths, long text, zoomed browser text, and reduced motion.
- Respect route changes, browser back/forward history, and correct active navigation state.
- No unnecessary media, hero background videos, heavy SVG particle systems, external icon packages, or font downloads if existing assets suffice.
- No unnecessary tracking scripts, cookie-dependent behavior, or third-party embeds.
- Metadata: appropriate title/description/canonical behavior using the existing site's SEO infrastructure.
- Verify contact links are correct on desktop and mobile; validate `mailto:` behavior where supported.
- Render legal/privacy links only if required by applicable needs and already approved, rather than inventing legal copy.

---

## 8. Implementation plan for Codex

### Phase 0 — Inspect, don't assume

- Inspect current routes, navigation, Work/CV/About components, theme tokens, GSAP utilities, and mobile behavior.
- Locate the real verified social links already used in the site, if any.
- Determine whether Contact is a route, anchor section, overlay, or a hybrid **based on the existing architecture**.
- Preserve the selected Work and CV interaction systems; no broad refactor.

### Phase 1 — Static editorial page

- Implement typed data/config and a polished, fully responsive static Contact page.
- Make link rendering conditional on approved, configured methods.
- Match the established typography, whitespace, dividers, and magenta accent.
- Ensure navigation and Back to stand work properly.

### Phase 2 — Motion polish

- Add restrained entrance and link interactions using existing GSAP patterns.
- Include route-transition cleanup, reduced-motion handling, and graceful non-JS styling.
- Avoid extra effects if the static composition already feels complete.

### Phase 3 — QA and review

- Check desktop, tablet, mobile, keyboard, reduced motion, and browser back navigation.
- Confirm no guessed links, exposed personal details, dead buttons, or console warnings.
- Run existing project tests, lint, typecheck, and production build if available.
- Review with a focus on cohesion, load performance, and the clarity of the primary CTA.

---

## 9. Acceptance criteria

- [ ] Looks unmistakably like the same portfolio as Work/CV/About.
- [ ] Features one powerful headline and one clearly dominant contact action.
- [ ] No reused taco props, galleries, decorative networks, or oversized social cards.
- [ ] LinkedIn is the default primary contact **once its verified URL is configured**.
- [ ] Email is **off by default** and is published only after explicit approval.
- [ ] Instagram is optional; no invented URLs or private profile assumptions.
- [ ] All contact methods and copy are editable from a single typed content/config source.
- [ ] No dead links, `#` placeholders, fake forms, or unapproved public personal data.
- [ ] Works with keyboard, touch, reduced motion, and no GSAP.
- [ ] Animations are subtle, cleaned up correctly, and avoid compromising startup performance.
- [ ] Existing taquería/Work/CV/About functionality remains intact.
- [ ] Appropriate responsive and build checks pass.

---

## 10. What to report back after implementation

Codex should summarize:

1. Files created/modified and why.
2. Where Aldo can edit the copy and contact methods.
3. Which URLs were verified and which still require Aldo's input.
4. Whether public email is enabled (**expect `false` until approval**).
5. Motion behavior, reduced-motion behavior, and checks/tests performed.
6. Any deliberate deviations from this brief to fit the existing codebase.

**End goal:** Contact is the portfolio's quiet, confident closing scene. It must be unusually polished without becoming more complicated than the act of reaching out.
