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

- `/`, `/work`, `/about`, `/contact` and `/404` are real HTML pages.
- `src/pages/work/[slug].astro` generates a page for each supplied project in
  `src/content/portfolio.ts`. Empty content produces no fake project pages.
- `src/content/site.ts` and `src/content/media.ts` hold optional personal details,
  descriptions and full-resolution media paths. Replace explicit missing values.
- The production model URL is
  `/models/taqueria_aldo_v3_12_9_selectively_merged.glb`.
- `public/media/previews/` contains only original embedded JPEG previews, extracted
  unchanged using `node scripts/extract-previews.mjs`. Do not treat them as originals.
- A CSS loading animation is the primary loading presentation. Navigation remains
  usable while the scene initializes or if WebGL fails. No poster is required.
- The live model loads once in a deferred homepage chunk. The CRT links to `/work`,
  and the trompo rotates independently. Reduced motion and visibility pause motion.
  Append `?debug=1` locally to see the initial renderer diagnostics.
  Left-drag or arrow keys explore the stand; scroll or plus/minus zoom. Home or
  Reset view restores the composition. Reduced motion disables camera inertia and
  the short entrance without disabling exploration.

The lower-cost profile is automatic on narrow screens and detected software
renderers. Use `?quality=low` to request it, or `?quality=standard` for controlled
visual comparisons. The standard profile uses three practical lights and filtered
shadows; the cheaper mode uses one practical light and single-sample shadows.
Both use cached 1024-pixel shadow maps and lightweight bottle glass.

For reproducible visual QA, serve a production preview on port 4322 and run
`npm run capture:scene -- <label>`. `CAPTURE_BENCHMARK=1` adds a short render-loop
sample; `CAPTURE_HERO=1` captures the refined default camera instead of the original
comparison camera, and `CAPTURE_LOW=1` requests the lower-cost desktop profile.
The `after` label asserts matching baseline framing. See the
[before/after comparison](docs/qa/cinematic/comparison.html) and
[review](docs/qa/cinematic/REVIEW.md) for measurements and their limits.

Do not add full-resolution media or guitar audio to startup preloads. Do not replace
the model or bake personal content into 3D textures.

## Development decisions

See the [development plan](docs/DEVELOPMENT_PLAN.md), approved
[stack review](docs/STACK_REVIEW.md) and [coding conventions](docs/CODING_CONVENTIONS.md).
Startup aims for approximately 2–3 seconds to a usable scene. Device/network/cache
conditions must accompany any measured result. No public deployment has been set up.
