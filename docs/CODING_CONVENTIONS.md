# Coding conventions — Taquería Aldo

Read this before implementing or reviewing code. These conventions supplement
the authoritative [handoff](../TAQUERIA_ALDO_CODEX_HANDOFF.md) and apply throughout
the repository. The [development plan](DEVELOPMENT_PLAN.md) defines delivery gates.

## Structure and responsibilities

- Keep route files in `src/pages/` focused on composition, route parameters and metadata.
  Use `src/layouts/` for the Astro document shell, and reusable rendering in
  `src/components/portfolio/` and `src/components/ui/`.
- Keep WebGL rendering and object interactions in `src/components/experience/`.
  Portfolio content and navigation must work without importing that feature.
- Store editable project, site and media data in typed `src/content/` modules.
  Mesh handlers must not contain biographies, project descriptions or media URLs.
- Put reusable domain logic and contracts in focused `src/lib/` modules. Separate
  browser-only code from modules used during static generation. Avoid broad barrel
  exports that pull client or Three.js code into content routes.
- Start with simple functions, components and React context. Extract an abstraction
  when it removes real duplication or isolates a meaningful responsibility.
  Avoid generic managers, service layers or state libraries without a current need.
- Keep changes within the active phase. Preserve working choices and unrelated work.

## Names and readability

- Use `PascalCase.tsx` or `PascalCase.astro` for reusable components and PascalCase
  for component/type names. Astro route filenames follow their URL paths, such as
  `index.astro` and `work/[slug].astro`.
- Use `useCamelCase.ts` for custom hooks, `kebab-case.ts` for other code modules and
  `ComponentName.module.css` for component styles. Follow existing local conventions
  when extending a file or established feature.
- Use camelCase for functions/variables and descriptive names for actions, states
  and booleans, such as `selectTheme`, `activePhotoId` and `isSceneReady`.
- Prefer named exports; use default exports where the framework requires them.
- Keep functions and components focused. Extract complex interaction/state logic
  when it makes the flow easier to understand; avoid arbitrary file-size limits.
- Use early returns to reduce nesting. Comments explain constraints or reasons,
  especially asset-coordinate rules, rather than narrating obvious code.
- Name animation durations, thresholds and quality settings in a feature's typed
  configuration instead of repeating unexplained numbers across handlers.

## TypeScript and state

- Enable strict TypeScript checks. Do not use `any`, `@ts-ignore` or unchecked
  non-null assertions to bypass missing contracts. Validate unknown values at the
  boundary and narrow them before use. Isolate and explain unavoidable exceptions.
- Define explicit types for content, component props and shared state. Use literal
  unions/discriminated unions for finite states; avoid combinations of booleans
  that permit impossible loading, dialog or audio states.
- Derive values from existing state instead of duplicating them. Share domain actions
  between HTML controls and 3D handlers so they cannot diverge.
- Validate route slugs and configured media at their boundaries. Unknown project
  slugs return a 404; absent optional media gets an intentional unavailable state.
- Handle promises and errors explicitly. Show recoverable user-facing states and
  useful development diagnostics; do not silently swallow exceptions.

## React and static HTML boundaries

- Prefer statically generated content routes. Introduce runtime server dependencies
  only for a concrete feature and document that deployment decision.
- Keep Astro hydration boundaries narrow. Access `window`, storage and WebGL only
  in browser-safe code; maintain consistent initial markup during hydration. Keep
  scene JSX and its React context inside one React tree; dynamically import the
  Canvas after mounting. React directives such as `'use client'` do not define
  Astro hydration boundaries.
- Use effects to synchronize external systems, not to calculate ordinary render data.
  Clean up event listeners, timers, animation timelines and media subscriptions.
- Use stable keys from content identifiers. Preserve immutable content/state data.
- Keep routing functional if optional animations fail or are interrupted. Heavy
  dependencies and WebGL assets load only in the features that need them.

## Styling and accessible interaction

- Use scoped Astro styles or CSS modules for React components, and shared CSS custom properties for theme,
  color, spacing and typography tokens. Avoid scattered inline colors and duplicate
  theme definitions; reserve inline styles for values driven by runtime state.
- Use semantic HTML, links for navigation and buttons for actions. Give every 3D
  action a labeled HTML equivalent, visible focus and usable touch targets.
- Make layouts responsive without fixed desktop assumptions. Keep content readable
  in every theme and reserve media dimensions to prevent layout shifts.
- Honor reduced motion in CSS and JavaScript. Dialogs must handle Escape, focus
  containment/restoration and scroll locking. Never autoplay audio.

## 3D, media and resource lifecycle

- Never edit or regenerate the frozen production GLB as an implementation shortcut.
  Centralize required node names and validate them at load time. Preserve original
  transforms so animations can restore exact state after repeat interactions.
- Mutate animation refs in `useFrame`; never call React state setters every frame.
  Use bounded delta-time updates and pause motion when hidden/offscreen or required
  by the handoff. Kill previous timelines before starting conflicting ones.
- Distinguish owned resources from shared loader-cached resources. Dispose only
  resources the component owns; do not invalidate cached geometry/materials used
  elsewhere. Clean up any cloned materials and object URLs.
- Keep full-resolution originals and guitar audio out of initial imports, preloads
  and eager network requests. Request them only after the relevant interaction.
- Keep missing personal content explicit. Never invent projects, captions, social
  links, recordings or outcomes. Test fixtures stay out of production content.

## Dependencies, checks and completion

- Use npm and commit its lockfile once scaffolding exists. Add a dependency only
  when it solves a concrete need; verify compatibility and explain its purpose.
- In Phase 0, configure Prettier, ESLint and strict TypeScript, with scripts named
  `format:check`, `typecheck`, `lint`, `test`, `test:e2e` and `build`. Include
  `astro check` in typechecking. Let formatters
  enforce whitespace rather than maintaining competing manual formatting rules.
- Test behavior and important contracts: GLB nodes, theme actions, route failures,
  dialog focus, reduced motion, lazy network requests and WebGL failure recovery.
  Unit-test deterministic logic; use browser tests for real navigation and interaction.
  Avoid tests that only repeat implementation details or unnecessary snapshot churn.
- Keep tests deterministic and independent of third-party services. Use test-only
  fixtures for absent content; document physical-device/manual checks separately.
- After code changes, run formatting, typechecking, lint, relevant tests and build.
  Run affected browser flows for interaction changes. Fix failures before calling a
  phase complete; report unavailable tooling or checks as pending, never passed.
- For documentation-only changes, verify paths, links and consistency; application
  checks are unnecessary unless the documentation change also affects executable code.
- Leave no unexplained lint suppressions, debug logs or commented-out implementations.
  Mark necessary content TODOs with the specific missing input and expected location.
- Update affected docs when architecture, commands, asset paths or behavior changes.
  Report what changed, what was verified and any remaining blockers. Record measured
  performance with device/browser/settings; never substitute estimates for results.
