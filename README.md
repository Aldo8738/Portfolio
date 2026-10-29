# Taquería Aldo

A static Astro portfolio with a progressively loaded React Three Fiber entrance.
The approved v3.12.9 model is frozen. Read [AGENTS.md](AGENTS.md) before changing code.

## Requirements

- Node 24 LTS, at least 24.16.0, and npm 11 or newer.
- `npm ci` installs the versions recorded in `package-lock.json`.
- This checkout also has an ignored, checksum-verified portable Node 24.22.1 under
  `.tools/`. On Windows, use it for the current PowerShell session with:

  ```powershell
  $env:Path = (Resolve-Path '.tools/node-v24.22.1-win-x64').Path + ';' + $env:Path
  ```

The portable download is local setup, not a tracked dependency. Other contributors
can install a supported Node 24 release normally. No environment secrets are needed.

## Commands

```sh
npm run dev                  # http://127.0.0.1:4321
npm run validate:asset       # Frozen checksum and node contract
npm run format:check
npm run typecheck
npm run lint
npm test
npm run build               # Static site in dist/
npm run preview             # Serve the production build locally
npm run test:e2e            # Playwright against the production preview
npm run test:e2e:dev        # Verify dev hydration survives a concurrent build
```

Install Chromium once with `npx playwright install chromium` before browser tests.
This checkout's browser binaries are in `.cache/ms-playwright`; when using those
on Windows, set `$env:PLAYWRIGHT_BROWSERS_PATH = (Resolve-Path '.cache/ms-playwright').Path`
before running tests. Both toolchain caches are ignored by Git.

Vite dependency caches are separated by mode under `node_modules/.vite/` so a
production build cannot replace the React runtime used by a running dev server.
The development browser check builds the site while port 4321 is running, then
reloads and verifies the real scene hydrates without browser errors.

For an environment without hardware WebGL, set `$env:PLAYWRIGHT_SOFTWARE_WEBGL = '1'`
before browser tests. This opts into SwiftShader for functional checks; its timings
are not device performance claims. See the [scene baseline](docs/qa/BASELINE.md).

## Content and assets

- `src/content/contact.ts` holds Contact copy and the creator-approved LinkedIn,
  email and Instagram destinations. The [Contact refinement brief](docs/CONTACT_PAGE_REFINEMENT_CODEX_BRIEF.md)
  provides the initial editorial direction; the [icon refinement](docs/CONTACT_ICONS_REFINEMENT_CODEX_BRIEF.md)
  supplies official social marks and a custom envelope. The latest Contact direction
  uses one aligned group of large icon links alongside the headline, with no repeated rows.
  See the [Contact review](docs/qa/CONTACT.md) for asset sources and checks.

- `/`, `/work`, `/cv`, `/about`, `/contact` and `/404` are real HTML pages.
- `src/content/cv.ts` supplies the CV chronology and skill catalog. The existing
  navigation links to `/cv`; no download is shown until an approved public résumé
  file is configured. See [CV implementation and review](docs/qa/CV.md).
- `src/pages/work/[slug].astro` generates a page for each supplied project in
  `src/content/portfolio.ts`. Four creator-described projects now have real static
  detail pages. The [Selected Work brief](docs/SELECTED_WORK_CODEX_BRIEF.md) defines
  the exhibition; [implementation and QA notes](docs/qa/SELECTED_WORK.md) explain its
  content, visual registry, routing, and how to add a project.
- `src/content/site.ts` and `src/content/media.ts` hold optional personal details,
  descriptions and full-resolution media paths. Replace explicit missing values.
- The production model URL is
  `/models/taqueria_aldo_v3_12_9_selectively_merged.glb`.
- `public/media/previews/` contains only original embedded JPEG previews, extracted
  unchanged using `node scripts/extract-previews.mjs`. Do not treat them as originals.
- The supplied rotating ASCII taco is inlined first in the homepage body, before
  React loads. A full-screen black dialog covers the whole site until the first
  usable scene frame or failure, with a two-second minimum from the taco's first
  draw. The smaller centered taco has an indeterminate loading bar beneath it;
  the bar completes only when the scene is ready. Animation resources are released
  when the dialog closes.
  It uses Canvas 2D without extra network requests. Reduced motion shows a still
  taco; hidden tabs pause it. Tab exposes a skip-to-work link; Escape dismisses it.
  Without JavaScript, the dialog stays hidden and HTML navigation works normally.
  The source reference is preserved in `ascii-taco-loader-v6/`.
  The app copy uses about 30,000 points, a coarser character grid and a 1.5 DPR cap
  to reduce loader work. See the [detail comparison](docs/qa/ascii-detail/REVIEW.md).
- Prepare the first stand frame behind the loader, then use demand rendering until
  the dialog closes. Covered WebGL animation must not compete with the ASCII taco
  during the minimum hold. See the [handoff check](docs/qa/handoff/REVIEW.md).
- The live model loads once in a deferred homepage chunk. The CRT links to `/work`,
  and the trompo rotates independently. Reduced motion and visibility pause motion.
  Append `?debug=1` locally to see the initial renderer diagnostics.
  Left-drag or arrow keys explore the stand; scroll or plus/minus zoom. Home or
  Reset view restores the composition. Reduced motion disables camera inertia and
  the entrance without disabling exploration.

After the taco loader closes, a 2.8-second GSAP camera orbit reveals the stand
from the rear, rises gently, then descends into the exact Reset view. Camera input
interrupts it immediately; Reset/Home restore the front without replaying it.
Hidden tabs pause the motion. The tween uses GSAP core inside the deferred scene
chunk and advances from the existing Three.js frame loop. See the
[entrance review and screenshots](docs/qa/entrance/REVIEW.md).

The lower-cost profile is automatic on narrow screens and detected software
renderers. Use `?quality=low` to request it, or `?quality=standard` for controlled
visual comparisons. The standard profile uses three practical lights and filtered
shadows; the cheaper mode uses one practical light and single-sample shadows.
Both use cached 1024-pixel shadow maps and lightweight bottle glass.

The cooking area has a procedural heater flame, rising smoke from the trompo and
griddle, soft haze drifting through the opening and low mist around the platform.
Rain-darkened concrete picks up broken warm and cool highlights around its base.
Interior pendants are dimmed
so a warm fire light dominates
the cooking area, within the same point-light budget. Effects pause behind the
loader, when hidden/offscreen and with reduced motion. See the
[cooking effects review](docs/qa/cooking/REVIEW.md).

A surrounding Berlin night panorama follows camera rotation: TV Tower, distant
rooftops and a crescent near the horizon, sparse stars above and concrete below.
It adds one sky-dome draw call and one 2048 × 1024 texture, without a separate
animation loop. See the [camera-aware background comparison](docs/qa/environment/REVIEW.md).

For reproducible visual QA, serve a production preview on port 4322 and run
`npm run capture:scene -- <label>`. `CAPTURE_BENCHMARK=1` adds a short render-loop
sample; `CAPTURE_HERO=1` captures the refined default camera instead of the original
comparison camera, and `CAPTURE_LOW=1` requests the lower-cost desktop profile.
The `after` label asserts matching baseline framing. See the
[before/after comparison](docs/qa/cinematic/comparison.html) and
[review](docs/qa/cinematic/REVIEW.md) for measurements and their limits.

Do not add full-resolution media or guitar audio to startup preloads. Do not replace
the model or bake personal content into 3D textures.

About copy lives in `src/content/about.ts`. The static `/about` page uses the shared
shell, with optional GSAP reveals and an immediate reduced-motion fallback. See
the [About brief](docs/ABOUT_PAGE_CODEX_IMPLEMENTATION_BRIEF.md) and
[implementation review](docs/qa/ABOUT.md).

## Development decisions

See the [development plan](docs/DEVELOPMENT_PLAN.md), approved
[stack review](docs/STACK_REVIEW.md) and [coding conventions](docs/CODING_CONVENTIONS.md).
Startup aims for approximately 2–3 seconds to a usable scene. Device/network/cache
conditions must accompany any measured result. Public deployment verification is
pending. Cloudflare Workers Builds reads `packageManager` in `package.json` to
select npm 11.19.1 before dependency installation; `.node-version` selects Node 24.
The `engines` field validates compatibility but does not select the npm version.

Cloudflare Workers Builds uses `npm run build` and `npx wrangler deploy` with the
tracked `wrangler.jsonc` static-assets configuration. Wrangler is pinned locally;
do not add an Astro server adapter for this static portfolio. Run `npm run deploy:check`
after building for a non-publishing deployment check. See the
[Cloudflare failure analysis and verification](docs/qa/CLOUDFLARE.md).
