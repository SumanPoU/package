# AGENTS.md

This repo is a **multi-package component library monorepo**, published to npm. Each component family (table, editor, etc.) lives in its own package under `packages/`. Read this file fully before creating, editing, or publishing any package.

## Project shape

- Root is a workspace (pnpm/npm/yarn workspaces). Every publishable unit lives under `packages/<name>`.
- `apps/docs` (if present) is a Next.js app used only for local development/preview of components — it is NEVER published to npm.
- Shared types/utils used by more than one package go in `packages/core` (`@itzsa/core`), and other packages depend on it via the workspace protocol (`"@itzsa/core": "workspace:*"`), not a relative import across package boundaries.

## Rules for creating a new package

When asked to scaffold a new package (e.g. "create the table package"):

1. Create `packages/<name>/` with:
   - `src/index.ts(x)` — the public entry point. Only export what's meant to be public API.
   - `package.json` — name it `@itzsa/<name>` (scope is `@itzsa`), set `"main"`, `"module"`, `"types"`, and `"exports"` fields, mark `"sideEffects": false`.
   - `tsconfig.json` — extend the root `tsconfig.base.json`, do not duplicate compiler options.
   - `README.md` — install command, minimal usage example, props/API table.
2. Do not add a `next.config.js` or Next.js-specific config inside `packages/*` — packages must be framework-agnostic (usable outside Next.js) unless explicitly scoped otherwise.
3. Never hardcode a version number in a new package's `package.json` beyond `0.0.0` — versioning is handled by the release step (see below).
4. Before writing component code, check `.agents/skills/building-components/SKILL.md` and its `references/` folder (composition, styling, accessibility, as-child pattern, data-attributes, design-tokens) — these are the house conventions for how components in this repo are structured. Do not invent a different pattern.

## Next.js notice

This repo pins a Next.js version with breaking changes vs. what you may know from training data. Before touching any file under `apps/docs` or writing Next.js-specific code, read `node_modules/next/dist/docs/` for the current APIs/conventions. Do not assume App Router/Pages Router behavior matches older training knowledge without checking.

## Publishing to npm

- Packages are versioned and published independently (not lockstep) unless told otherwise.
- Never run `npm publish` directly without confirming the target package, version bump type (patch/minor/major), and that `build` has been run and passes.
- Always run typecheck + build for a package before it is marked ready to publish.
- `README.md` inside each package is what npm displays — keep it accurate and in sync with the actual public API in `src/index.ts(x)`.

## Commit conventions

Use conventional commits (`feat:`, `fix:`, `chore:`, `docs:`) — commit scope should match the package touched where relevant, e.g. `feat(table): add sortable columns`.

## When given a command

The user will give scaffolding commands package-by-package (e.g. "create the table package", "now the editor package"). Apply the rules above consistently across every package created this way — don't let structure drift between packages.