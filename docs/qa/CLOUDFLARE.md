# Cloudflare static deployment — 29 October 2026

## Failure and fix

The supplied Workers Builds log shows that the initial `npm run build` succeeds.
The deploy command then invokes Wrangler without repository configuration. Its
framework auto-configuration installs a Cloudflare adapter, enables Images/KV
bindings and runs another build. That adapter's prerenderer fails on Contact's
source-filesystem access: `readAll '/public/images/contact/linkedin-in-black.png'`.
The source file is present; the failure is the prerender execution environment.

`wrangler.jsonc` now explicitly targets the existing `portfolio` Worker and uploads
`dist` as static assets. It preserves Astro's no-trailing-slash URLs and uses the
generated custom 404 page. There is no application Worker entry point, adapter,
session store or Images binding. This follows Cloudflare's
[static-site routing](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/)
and [HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/).

`ContactSymbols.astro` now imports each official/local icon with Vite's `?inline`
asset query, using relative source imports. No `node:fs`, `node:path`, current
working directory or source-file lookup remains in the rendered component. The
generated HTML still embeds all six light/dark assets as data URLs, with no added
icon requests. The artwork and approved destinations remain unchanged.

Wrangler 4.155.0 is pinned as a development dependency, matching the CLI version in
the supplied log. The lockfile is committed. `.wrangler/` is ignored. The ordinary
Astro `dev` and `preview` commands retain their existing behavior.
Generated `.wrangler/` state is excluded from Git, formatting, lint and TypeScript
checks, just like the existing build/cache directories.

## Build settings

Keep the existing Cloudflare Workers Builds configuration:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Worker name: `portfolio`
- Repository root: the directory containing `package.json` and `wrangler.jsonc`

The deploy command resolves the pinned local CLI and uses the already-built
assets. No Wrangler custom build command is configured, so deployment does not
rebuild or modify Astro configuration. For a manual deployment, `npm run deploy`
builds first and then invokes Wrangler. `npm run deploy:check` validates an existing
build without publishing. Node 24 and npm 11.19.1 remain the project toolchain.

## Verification

- `npm run build` emits ten static pages; `/contact` prerenders successfully.
- Wrangler dry run reads the generated assets and exits successfully without
  framework auto-configuration, extra builds or application bindings.
- A fresh local Wrangler server returns 200 for `/`, `/contact`, `/work`,
  `/work/knowledge-bridge`, `/cv` and `/about`.
- Unknown project routes return 404; `/contact/` redirects to `/contact` with 307.
- GLB delivery returns 200 with `model/gltf-binary`; all 2,609,612 bytes match the
  frozen source checksum.
- All 13 Contact Chromium checks pass after bundling changes, including icon
  decoding, no-JavaScript content, keyboard navigation, themes and network checks.
- All 65 unit tests pass. Formatting, typecheck and lint pass.

The existing large-scene-chunk build warning remains. Public deployment was not
run manually; the next repository push can trigger the user's configured Workers
Builds pipeline. Cloudflare account/build status must confirm that remote release.
