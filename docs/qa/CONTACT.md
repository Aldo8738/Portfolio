# Contact implementation and review

Implemented 28 October 2026 from the [Contact brief](../CONTACT_PAGE_CODEX_IMPLEMENTATION_BRIEF.md).
The existing Astro route, typography, theme tokens, navigation and static output remain in use.

## Content and approval

Edit all Contact copy and methods in `src/content/contact.ts`. Shared identity remains
in `src/content/site.ts`; the unused email/social fields were removed so contact
details have one source. Each method needs its verified `href` and `enabled: true`.
Enabling records the creator's publication approval; URL validation checks syntax
and destination, not ownership or whether a remote profile exists.

No verified LinkedIn or Instagram URL exists in the repository. All methods have
`href: null` and `enabled: false`; the page displays a quiet, truthful unavailable
message instead of a dead action. **Launch blocker: Aldo must supply a verified
public LinkedIn profile.** Email remains disabled until explicit publication
approval. No private résumé details, inferred accounts, forms or tracking were added.

The first enabled, valid method marked primary gets the dominant text-link style;
otherwise the first enabled method does. Adding a method uses the same data-driven
list. Social links open in a new tab with an accessible notice and
`noopener noreferrer`; email uses an ordinary `mailto:` anchor.

## Layout and motion

`src/components/contact/ContactPage.astro` renders semantic static content.
`contact-page.ts` adds a 400 ms GSAP entrance with 50 ms staggers, 8 px movement
and partial opacity. Content is never hidden by default or made unclickable.
GSAP matchMedia scopes and reverts animation on reduced-motion changes and
page exit; browser history restoration remounts it. CSS handles link hover/focus.
Reduced motion has no entrance animation or timed hover transition.

`src/pages/contact.astro` composes metadata and a restrained footer with copyright,
Mexico → Berlin, the existing theme picker and Back to stand. `SiteLayout.astro`
adds an optional footer slot; all other routes keep their existing footer.
The copyright year is generated at build time, consistent with static hosting.
No canonical is invented because no approved production origin is configured.

The intentional departure from a visible primary CTA follows the brief's missing-link
guardrail. About still has its existing placeholder; this task does not redesign it.
No connecting graph or decorative line was needed. No new dependency or scene asset
is loaded by Contact.

## Verification

- `npm run typecheck`: zero errors, warnings or hints.
- `npm run lint`: passed.
- `npm test`: 64 tests passed, including filtering, primary selection and disabled data.
- `npm run build`: ten static pages; existing large-chunk warning remains.
- Production Chromium checks: 20 passed across Contact, CV and shared navigation.
- Contact checked at 320, 390, 768 and 1440 px, with 200% text sizing and reduced motion.
- JavaScript disabled and blocked enhancement scripts retain readable content.
- Keyboard focus/Back to stand, active navigation, browser back/forward, motion changes
  and persisted themes pass. Contact makes no GLB, scene, video, audio or font requests.
- Screenshots generated under `test-results/` by `tests/e2e/contact.spec.ts`;
  desktop and narrow-screen composition visually reviewed.

Unit tests and Playwright required execution outside the sandbox after `spawn EPERM`.
Physical-device, screen-reader and non-Chromium review remain manual.
Real social destination and mail-client checks are pending approved contact data.
The full WebGL browser suite was not rerun; affected HTML navigation/CV flows were.
