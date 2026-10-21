# Stack review — Taquería Aldo

Reviewed: 21 October 2026. Status: **Astro + React + R3F approved by the creator**.
Implementation is starting with the static HTML foundation and frozen-model browser milestone.
The handoff remains authoritative; this decision changes its suggested web
framework while preserving the approved model, routes and interactions. The user's
accepted loading and startup requirements are recorded in the
[development plan](DEVELOPMENT_PLAN.md#accepted-loading-and-performance-decisions).

## Recommendation

Use **Astro with TypeScript for the static portfolio, React for the interactive
homepage controls, and Three.js through React Three Fiber/Drei for the scene**.
Retain GSAP for coordinated camera/object transitions when those features land.

This is a project-specific judgment: the brief describes content pages and one
interactive entrance, with no current requirement for accounts, a database or
request-time application logic. Astro's static output and explicit hydration fit
that boundary directly. Astro renders unhydrated components to HTML/CSS and its
official React integration supports interactive React components.
[Static output](https://docs.astro.build/en/reference/configuration-reference/#output),
[islands](https://docs.astro.build/en/concepts/islands/),
[React integration](https://docs.astro.build/en/guides/integrations-guide/react/).

The current Next.js proposal is technically sound. Astro is my preferred fit for
the present scope, not a measured performance winner. The homepage still downloads
React and Three.js, and the model's draw calls and materials still need profiling.

The agreed startup target is approximately **2–3 seconds to a usable scene**, with
real navigation available immediately and full-resolution media/audio deferred until
interaction. A lightweight loading animation/status is the primary presentation;
fallback artwork is optional. Measure this target on a production build under named
device/network/cache conditions before adding optional effects. No stack choice
alone guarantees the target; retain or simplify the React/R3F boundary based on
observed startup cost rather than assumed speed differences.

## Alternatives considered

| Option                                           | Fit for this project                                         | Main tradeoff                                                                                              | Assessment                                               |
| ------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Astro + React + R3F                              | Static portfolio pages with an isolated interactive homepage | Two component formats and an explicit boundary for shared theme state                                      | Recommended for the stated scope                         |
| Next.js App Router + static export + R3F         | Complete HTML routes and one React application model         | Must stay within export restrictions; request-time features and default image optimization are unavailable | Strong alternative if an all-React codebase is preferred |
| React Router framework mode + prerendering + R3F | Static HTML routes with React throughout                     | Must enumerate project paths and explicitly configure prerendering, deployment and media handling          | Viable, with no decisive advantage for this brief        |

Next.js supports `output: 'export'`, build-time HTML and static hosting. Project
slugs need `generateStaticParams()`; server actions, request cookies and default
image optimization cannot be used in that mode. Theme persistence must work in
the browser, and caching/response headers belong to the host configuration.
[Next.js static export](https://nextjs.org/docs/app/guides/static-exports).

React Router supports prerendering with `ssr: false` for deployment without a
runtime application server. Plain SPA mode alone is insufficient for this brief's
requirement that project content be readable without JavaScript.
[React Router prerendering](https://reactrouter.com/how-to/pre-rendering).

## Approved Astro boundaries

- `src/pages/` owns the homepage, work index, project routes, about, contact and 404.
  `src/layouts/` owns the shared document shell, metadata and navigation.
- Portfolio cards and case studies render as static HTML. Generate project paths
  from real typed content with `getStaticPaths()`; adding content requires a rebuild.
  No project content means an honest empty index and no invented detail pages.
  [Astro static routing](https://docs.astro.build/en/guides/routing/#static-ssg-mode).
- Keep the heading, loading status and direct work link outside the WebGL boundary.
  A small React component can prerender the optional HTML controls, then dynamically import
  the Canvas after mounting. Browser-only scene code must never run during the build.
- Keep the scene, viewers, audio controls and their React context within one React
  component tree. Do not attempt to share context across separately hydrated islands.
  [Astro shared-state constraints](https://docs.astro.build/en/recipes/sharing-state-islands/).
- Use a small shared browser theme module for CSS variables, validated localStorage
  persistence and synchronization with the React controls. Other pages need no
  hydrated React application merely to restore a theme.
- Select hydration timing deliberately. `client:idle` can defer a prerenderable
  wrapper; `client:only="react"` skips HTML rendering and starts loading immediately.
  They are different mechanisms. Bound deferral to protect the 2–3 second startup
  target. Replace the loader only after the actual first scene frame and responsive
  controls, rather than tying its removal to component hydration. Any optional
  fallback artwork must not obscure that loading state.
  [Astro hydration directives](https://docs.astro.build/en/reference/directives-reference/#client-directives).
- Begin with normal page navigation and persistent theme storage. Returning to the
  scene may remount it; seamless cross-route scene/audio persistence is outside the
  current requirement. Do not add a client router just for that possibility.

## Keep the rest of the stack small

- Use strict TypeScript and npm with a lockfile. With Astro, include `astro check`
  in the typecheck command so `.astro` templates are checked too.
  [Astro TypeScript checking](https://docs.astro.build/en/guides/typescript/).
- Use Astro scoped CSS for Astro components, CSS modules for React components and
  CSS custom properties for shared design tokens. No additional styling framework
  or state library is needed initially.
- Retain R3F/Drei. Keep all scene JSX inside React components. Check peer dependencies
  together: the documented pairing is React 19 with Fiber 9, or React 18 with Fiber 8.
  Select exact compatible versions during scaffolding.
  [R3F installation](https://r3f.docs.pmnd.rs/getting-started/installation).
- Retain GSAP for camera moves and bottle timelines, with cleanup. Keep trompo
  rotation and Polaroid damping in `useFrame`. Use CSS for simple interface fades.
  [GSAP cleanup](<https://gsap.com/docs/v3/GSAP/gsap.context()/>).
- Use Prettier, ESLint, Vitest and Playwright. Introduce no CMS, backend, analytics,
  physics engine or postprocessing package without a concrete requirement.
- Preserve the frozen GLB and `public/media/` contract. Astro copies public files
  unchanged, so public originals are not automatically optimized. Prepare responsive
  derivatives deliberately and fetch full-resolution viewers only after interaction.
  [Astro image handling](https://docs.astro.build/en/guides/images/#src-vs-public).

## Local prerequisite and first checkpoint

The local tools currently report **Node v22.11.0** and **npm 8.1.2**. Current Astro
documentation requires **Node v22.22.0 or higher**, with odd-numbered versions
unsupported. Resolve the supported Node/npm toolchain before installing current
Astro; do not silently pin an old framework to avoid this prerequisite.
[Astro prerequisites](https://docs.astro.build/en/install-and-setup/#prerequisites).

The development plan and framework-specific coding conventions now use Astro.
Phase 0 proves: a static build, an HTML route
served from its output, GLB contract validation, and working quality-check scripts.
Before full scene implementation, verify the real GLB loads through the chosen
client boundary. That integration and actual bundle/FPS measurements are untested.

The review itself changed no packages, global settings, system tools or model assets.
Implementation status and measured results are maintained in the development plan.
