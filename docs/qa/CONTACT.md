# Contact implementation and review

Refined 29 October 2026 from the [Contact refinement brief](../CONTACT_PAGE_REFINEMENT_CODEX_BRIEF.md),
which supersedes the layout and missing-contact state of the [original brief](../CONTACT_PAGE_CODEX_IMPLEMENTATION_BRIEF.md).
The later [Contact icon brief](../CONTACT_ICONS_REFINEMENT_CODEX_BRIEF.md) replaces only
the abstract artwork and its motion. The creator's latest explicit correction
unifies the hero and contact methods into a single composition, superseding the
earlier rows and scattered decoration. The Astro route, shared navigation, theme
tokens, typography and static output remain in use.

## Approved destinations and content

The creator supplied the LinkedIn profile, Instagram profile and public email in
this implementation session, explicitly approving email publication. All three
are enabled in `src/content/contact.ts`, the single source for labels, microcopy,
order, destinations and external-link behavior. LinkedIn receives the supplied
Unicode profile slug and an explicit HTTPS scheme. Browsers serialize that slug
with normal URL percent encoding. No account or email was inferred from a CV.

`getContactMethods` filters unapproved, disabled or invalid entries, then sorts
without changing source data. Existing HTTPS host/profile and mailto validation
remain; external behavior must agree with method type. Social icon links open in a new
tab with `noopener noreferrer` and an accessible notice. Email is an ordinary,
unobfuscated mailto link. There is no form, backend endpoint or tracking.

The earlier public placeholder sentence is removed. Disabled/invalid records
render no fake or inert CTA. Future releases must keep all three approved methods
valid and enabled; the content test checks that all three are publishable.

## Composition and official artwork

`ContactPage.astro` contains one balanced two-column composition: the large
headline and left-aligned description on the left, three equally spaced icon links
on the right. `ContactSymbols.astro` maps the enabled contact data into the only
three contact anchors. Each anchor includes a large icon and its visible name.
The old horizontal list, all associated dividers and `ContactLinkRow.astro` are
removed, rather than hidden. No scattered positioning or duplicate links remain.

At 1440 px the marks are approximately twice their earlier decorative size. The
heading and pink question mark remain unchanged; the description sits directly
beneath the heading. Below 1000 px the headline and contact group stack. Narrow
screens retain clear labels and full-group touch targets; enlarged text can reflow
the methods. The small closing line leads directly to the existing footer and
salsa selector, without another content section.

The same typed contact records supply labels, destinations and official icon
variants. Vite inline imports embed artwork before prerendering, without source
filesystem reads, image network requests or runtime server requirements. Black
and white theme variants keep their native proportions and remain unfiltered.
See the [Cloudflare deployment fix](CLOUDFLARE.md).

Both social marks were downloaded directly from official brand packs on 29 October
2026 and extracted without altering their bytes:

- [LinkedIn in-logo guidelines](https://brand.linkedin.com/in-logo) permit the
  approved black variation in a lineup linking to the member's profile.
  [Official download page](https://brand.linkedin.com/downloads), archive `in-logo.zip`,
  member `in-logo/InBug-Black.png`: `public/images/contact/linkedin-in-black.png`.
  SHA-256: `b80ab65537aad1b5013da98fe82d1c36c1bb4ca896fe7829a880cc5f307693ca`.
- [Instagram brand resources](https://www.meta.com/brand/resources/instagram/instagram-brand/),
  official `IG_brand_asset_pack_2023.zip`, member
  `01 Static Glyph/03 Black Glyph/Instagram_Glyph_Black.svg`:
  `public/images/contact/instagram-glyph-black.svg`.
  SHA-256: `a036f8197b3856b02d1e236e08dd1b50a4ed68cb148686beb274eabf29794d51`.
- The same official packs provide the unchanged white variants for Synthwave:
  `in-logo/InBug-White.png` ? `public/images/contact/linkedin-in-white.png`,
  SHA-256 `ed22a5ab46c171e3449708ff34923de7298da00ac204c7f85444db05bf888791`;
  `01 Static Glyph/02 White Glyph/Instagram_Glyph_White.svg` ?
  `public/images/contact/instagram-glyph-white.svg`,
  SHA-256 `3347813e9e8f082cdf48495818bd370ccff94b687efb8aa1c8a7b36cfcfb8291`.
- `public/images/contact/mail-outline.svg` and `mail-outline-white.svg` are original
  thin-stroke envelopes, with no platform trademark or third-party dependency.

Official artwork keeps its native proportions and approved colors, without CSS
filters, tracing or morphing. Original and Noir use the black files; Synthwave uses
the official white files on the page's own background. Clear space surrounds each
mark. No remote icon service or new dependency is used.

## Motion and lifecycle

`contact-page.ts` retains the scoped GSAP controller and duplicate-mount guard.
The icon links enter with a 550 ms reveal, 12 px vertical offset and 60 ms stagger,
following the existing heading entrance. The supporting copy and closing line
settle briefly; no row sequence remains.

Hover or keyboard focus reveals a fine accent underline and shifts the artwork
wrapper up 4 px with a uniform 1.035 scale over 220 ms. Official logo paths are
never redrawn, stretched, recolored or morphed. Focus keeps the shared outline.
Interaction completes an unfinished entrance immediately. Reduced motion skips
entrance and hover transforms; media-query changes revert inline styles. Route
cleanup, browser-cache restoration and hidden-tab pausing remain supported.

## Verification

- `npm run format:check`, `npm run typecheck`, `npm run lint`: passed. Astro
  reports zero errors, warnings or hints. The supplied refinement brief received
  formatting-only normalization.
- `npm test`: 65 unit tests passed, including approved-method completeness,
  sorting, disabled/missing destinations, malformed URLs, external behavior and
  official-asset checksums.
- `npm run build`: ten static pages; the existing large-chunk warning remains.
- `npm run test:e2e -- tests/e2e/contact.spec.ts tests/e2e/about.spec.ts tests/e2e/cv.spec.ts tests/e2e/navigation.spec.ts`:
  34 Chromium tests passed, including 13 Contact checks. The new composition check
  confirms no row markup, exactly three contact links, aligned label baselines,
  left-aligned support text, larger marks and a compact desktop document.
- Screenshots and overflow checks cover 320, 375, 768, 1024, 1440 and 1920 px,
  also with 200% text sizing and explicit mark-overlap checks. Desktop, narrow-screen, focus and Synthwave captures
  were visually reviewed. Original, Noir and Synthwave remain usable.
- Verified all three icon-link destinations, labels, new-tab notices, pointer/focus
  icon-link interaction, reset to idle, keyboard focus, motion changes, history,
  blocked scripts and JavaScript-disabled content. Social clicks open the approved
  URLs in intercepted tabs, without third-party network dependence.
- No page errors in the interaction/history flows; Contact loads no scene, GLB,
  video, audio or Google Fonts resources. The full WebGL browser suite was not rerun.

Unit tests and Playwright ran outside the sandbox because Windows process
restrictions prevent their normal subprocess launches inside it.

## Release checks and limits

- Preserve owner approval when editing public destinations in `src/content/contact.ts`.
- Run formatting, typecheck, lint, unit tests, build and the Contact browser suite.
- Verify real social profiles and the default email app manually before release;
  deterministic browser tests intercept social navigation rather than calling third parties.
- Physical-device, screen-reader and non-Chromium review remain manual.
- No full WebGL suite or performance benchmark is needed for these isolated HTML changes;
  no device FPS or Lighthouse score is claimed.

## Local visual proof

The production preview was opened in Chromium and visually inspected. Source and
rendered markup contain no old channel paths, horizontal contact rows or duplicate
contact links. The desktop 1440 ? 900 capture now shows the complete composition
and footer, compared with the previous 1467 px-tall document at the same width. These
captures show the actual unified local build, not a design mockup:

- [Desktop, 1440 px](contact-artwork/desktop-unified.png)
- [Mobile, 320 px](contact-artwork/mobile-unified.png)
- [Synthwave](contact-artwork/synthwave-unified.png)

This checkout has not been pushed or deployed by the artwork-correction task.
