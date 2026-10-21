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
```

Install Chromium once with `npx playwright install chromium` before browser tests.
This checkout's browser binaries are in `.cache/ms-playwright`; when using those
on Windows, set `$env:PLAYWRIGHT_BROWSERS_PATH = (Resolve-Path '.cache/ms-playwright').Path`
before running tests. Both toolchain caches are ignored by Git.

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

Do not add full-resolution media or guitar audio to startup preloads. Do not replace
the model or bake personal content into 3D textures.

## Development decisions

See the [development plan](docs/DEVELOPMENT_PLAN.md), approved
[stack review](docs/STACK_REVIEW.md) and [coding conventions](docs/CODING_CONVENTIONS.md).
Startup aims for approximately 2–3 seconds to a usable scene. Device/network/cache
conditions must accompany any measured result. No public deployment has been set up.
