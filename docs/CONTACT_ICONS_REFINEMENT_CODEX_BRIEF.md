# Contact Page — Social Icon Refinement for Codex

## Objective

Refine the **existing Contact page**, not rebuild it. Use the supplied current Contact screenshot and the existing Selected Work page as visual references. Replace the abstract three-path “Open Channels” drawing in the Contact hero with **three recognizable contact marks** (LinkedIn, email, Instagram), presented as minimal editorial line-art-inspired compositions.

The result must feel like it belongs to the same high-quality, cream/black/magenta portfolio as Selected Work and CV. The design should be elegant and immediately understandable, not a flashy social media dashboard. Optimize for excellent art direction and usability; Awwwards is an aspiration, not a guarantee.

## First: inspect the existing implementation

Before editing, locate and understand:

- Contact route/component, shared navigation, footer, salsa theme system and typography tokens.
- Existing Contact CTAs and link configuration; whether valid URLs/email have already been supplied.
- The abstract three-line SVG and any GSAP timeline tied to it.
- Any icon library, existing official brand SVG assets, and shared hover / focus utilities.

Make small, isolated changes. Preserve the current headline, section number, copy, shared navigation, footer, and overall visual hierarchy. Do **not** disrupt the 3D taquería or transitions elsewhere.

## Desired composition

**Header / left side** (unchanged in spirit):

- `04 / CONTACT`
- Oversized black `Have something in mind?` with the existing pink punctuation.

**Hero / right side:**

- Remove the current abstract branching-lines graphic entirely.
- Introduce **three large, restrained icon compositions** for LinkedIn, Email, Instagram. They should be recognizably the contact options, not generic abstract marks.
- Use shared visual framing: delicate borders, balanced alignment, subtle neutral backgrounds only if needed, plenty of negative space. No oversized filled cards, glow, neon, gradients, or distracting textures.
- Keep the one-sentence intro beneath or adjacent to the icons, aligned to the existing editorial grid.
- On narrow screens, stack or row-wrap without making the icons tiny.

**Contact links below** (retain and improve):

- Three full-width editorial rows, in this order: `01 / LinkedIn`, `02 / Email`, `03 / Instagram`.
- Each row has a short subtitle and an outbound/up-right arrow (for email, link uses `mailto:`). Keep rows spacious but avoid unnecessary blank space.
- The icon compositions should correspond visually to the three rows. Do not duplicate brand icons within the rows unless that tests better in the current layout.
- Preserve `Thanks for stopping by.` and the shared footer, including the salsa selector.

## Important: brand asset and trademark handling

- **LinkedIn:** use an official authorized `[in]` icon / asset in its permitted form and colors. Do **not** hand-trace, morph, stretch, or redraw the brand logo into a novel outline.
- **Instagram:** use an official permitted icon/glyph in an approved monochrome treatment when allowed. Do **not** create a modified Instagram trademark.
- **Email:** use a custom thin-stroke envelope SVG or a suitable existing outline icon; it is not a trademarked platform logo.
- Achieve visual cohesion via **container, size, placement, spacing, line framing, and interaction**, not by altering logos themselves.
- Confirm current published brand guidelines before choosing any transformed/recolored assets; if a proposed variant is not clearly allowed, keep the official mark unchanged. Do not rely on a visual approximation of a proprietary logo.
- SVG assets should be locally served only when usage is allowed; avoid adding a heavy icon dependency solely for this page. Preserve accessible labels and sensible contrast.

## Suggested interaction (GSAP; progressive enhancement)

### On entrance

- Stagger the three framed symbols into view using small `y` offsets (about 8–16px) and opacity, over roughly 0.45–0.7 seconds, following the existing heading entrance.
- Keep all content visible without JS; GSAP should enhance, never gate rendering.

### Hover / keyboard focus

- For the corresponding contact icon/row: increase border contrast or reveal a pink accent line; shift the arrow a few pixels diagonally.
- Optionally subtly highlight the matching icon frame when a row is hovered/focused. No moving or reshaping the underlying social brand artwork.
- Use lightweight properties (`transform`, `opacity`) and avoid complicated timelines. No artificial cursor effects or hover-only information.

### Exit / reduced motion

- Avoid bespoke exit animations for external links; they should respond immediately.
- Honor `prefers-reduced-motion`, disabling staggers and transforms but leaving visible focus styles.
- Clean up all GSAP timelines / contexts on component unmount and theme/route changes.

## Contact data architecture

Use a typed collection so links, labels, captions and assets are configurable without editing JSX. Adapt to the existing project conventions; do not add a new schema framework for this.

```ts
export type ContactMethod = {
  id: 'linkedin' | 'email' | 'instagram';
  label: string;
  description: string;
  href: string | null;
  icon: 'linkedin-official' | 'mail-outline' | 'instagram-official';
  external: boolean;
};

export const contactMethods: ContactMethod[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    description: 'For professional connections',
    href: null, // Set only from a confirmed URL/config
    icon: 'linkedin-official',
    external: true,
  },
  {
    id: 'email',
    label: 'Email',
    description: 'For ideas worth sharing',
    href: null, // Set only after the owner approves the public email address
    icon: 'mail-outline',
    external: false,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    description: 'For the less professional side',
    href: null, // Set only from a confirmed URL/config
    icon: 'instagram-official',
    external: true,
  },
];
```

**Do not invent links, usernames, or email addresses.** If existing confirmed configuration already has them, reuse it. If a method has no confirmed destination, don't render a dead clickable link or a literal `null` placeholder. In development, flag the missing configuration clearly; for production, show only functional links unless the owner has explicitly approved an alternative disabled-state design. The user wants all three CTAs, so report missing destinations for final setup.

Security: use `rel="noopener noreferrer"` when opening external profiles in a new tab; use `mailto:` for email; never add the CV phone number or other private fields as public contact details without approval. Public email addresses can be scraped, so support a dedicated inbox / forwarding alias.

## Visual consistency checklist

- Reuse exact cream background, black typography, magenta accent, grid, navigation, and separator styles of the existing portfolio.
- Symbols feel deliberately curated and legible, not three off-the-shelf giant social buttons.
- Hero headline remains the visual anchor; icon group is secondary but meaningful.
- Contact rows are obvious, clickable, keyboard accessible, and have adequate hit areas.
- No ornamental graph or fluorescent line effects.
- Theme variants (Original / Noir / Synthwave) remain readable and consistent.

## Implementation sequence

1. Inspect current Contact components, assets, brand icon availability, link config, and GSAP patterns.
2. Remove only the abstract `Open Channels` artwork.
3. Implement the three icon compositions as a small reusable component and map the contact data into the rows.
4. Build and review the **static** desktop/mobile layout first; ensure hierarchy is strong without motion.
5. Add restrained GSAP entrance and hover/focus synchronization, guarding reduced motion.
6. Run typecheck, lint, tests, and production build. Verify no regression to the taquería, Work, CV, About, or footer.
7. Test desktop, tablet, mobile, keyboard-only, dark theme(s), links, missing-link behavior, and `prefers-reduced-motion`.

## Acceptance criteria

- The three recognizable contact icons replace the abstract three-path illustration.
- Official social marks remain unaltered and compliant with current brand requirements.
- The page has the same refined editorial identity as Selected Work.
- All three CTA labels appear in the intended order, and any enabled CTA works.
- No fake / placeholder profile addresses are published.
- Interaction feels polished without harming performance or accessibility.
- Existing layout, copy, navigation, salsa themes, and shared footer remain intact.

## Final Codex report

Explain which files changed, which official assets or icon sources were used, whether all 3 destinations are configured, and what checks passed. Flag any outstanding brand-asset approval or link configuration rather than silently substituting guessed values.
