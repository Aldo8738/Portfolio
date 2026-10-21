# Instructions for Codex — Taquería Aldo

Read `TAQUERIA_ALDO_CODEX_HANDOFF.md` before implementation. It is the authoritative plan, UX specification, asset contract and phased acceptance checklist.

Also read and follow [docs/CODING_CONVENTIONS.md](docs/CODING_CONVENTIONS.md) before writing code. Use [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) for implementation phases and acceptance gates. Keep these documents and their links current when decisions or paths change.

- Audit the existing codebase and preserve working choices; do not replace a functioning stack without reason.
- Never redesign the frozen v3.12.9 GLB. Use `public/models/taqueria_aldo_v3_12_9_selectively_merged.glb` as the production source.
- Keep all named interaction pivots and raycast targets; add GLB name-contract assertions.
- Keep HTML project pages real, semantic, responsive and accessible even if WebGL fails. The CRT routes to `/work`.
- Make themes, drawings, photos and amplifier interactions optional progressive enhancements that never block content.
- Load full-resolution drawing/photo files and guitar audio only after interaction. Do not invent user content or external links.
- Work in testable phases and run format/typecheck/lint/build/tests after changes. Report precise status and blockers.
- Keep changes focused, enforce strict TypeScript, and separate page content, UI, and 3D interaction logic according to the coding conventions.
- Keep portfolio pages compatible with static generation; do not introduce a runtime server dependency without a concrete requirement.
- Set up automated formatting, linting, typechecking and test scripts in Phase 0. Do not claim checks passed before the tooling exists or if they were not run.

## Codex defaults for this project

- Read and apply [Ponytail rules](docs/agent-rules/ponytail.md) at the start of each session. Use **full** mode by default unless the user requests another level or disables it. This project uses the instruction-only integration; no plugin commands or hooks are installed.
- Apply Ponytail within the handoff and coding conventions: solve the complete task with the simplest readable change, preserve validation and accessibility, and report checks and remaining limits accurately.
- Read and apply [Caveman rules](docs/agent-rules/caveman.md) at the start of each session. Use the standard **caveman** reply style by default unless the user changes or disables it. Keep technical details exact and write persisted code, comments and documentation in normal language.
- Ponytail governs implementation choices; Caveman governs chat brevity. Neither overrides the handoff, coding conventions, required progress updates, clear questions or accurate validation reports. This integration adds project instructions only; no global settings, CLI, proxy or hooks are changed.
