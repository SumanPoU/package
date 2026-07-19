# itzsa component registry

shadcn-compatible registry for copy-paste installs of itzsa components.
**npm remains the primary distribution** (`pnpm add @itzsa/table`). This registry
is an additional layer: `pnpm dlx shadcn@latest add <url>`.

## Commands

```bash
# from monorepo root
pnpm run build:registry

# or
pnpm --filter registry run registry:build
```

This:

1. Syncs sources from `packages/table/src` (and `packages/editor/src` when present)
2. Regenerates `registry.json`
3. Runs `shadcn build` → `apps/registry/public/r/*.json`
4. Copies JSON into the docs site `public/r/` (served at `/r/[name].json`)

## Install (consumers)

```bash
pnpm dlx shadcn@latest add http://localhost:3000/r/data-table.json
# production:
pnpm dlx shadcn@latest add https://<your-docs-domain>/r/data-table.json
```

Or add a namespace to the consumer `components.json` (after deploy):

```json
{
  "registries": {
    "@itzsa": "https://<your-docs-domain>/r/{name}.json"
  }
}
```

```bash
pnpm dlx shadcn@latest add @itzsa/data-table
```

## Sync / drift

Do **not** hand-edit `registry/itzsa/**`. Those files are overwritten by
`scripts/sync-from-packages.mjs`. Fix bugs in `packages/table` (or editor) and re-sync.

### Workspace-only imports

If a package imports `@itzsa/core` (or other workspace packages), the sync script
prints a **REGISTRY NOTE**. Those need a registry-friendly flatten before the
item is safe for standalone copy-paste. `@itzsa/table` currently has none.

### Editor

`packages/editor` is not in the monorepo yet — the registry ships a stub and a
REGISTRY NOTE until that package exists.

## Official namespace (manual, later)

Once this registry is deployed and verified end-to-end, a maintainer may submit
the `itzsa` namespace to the [shadcn registry index](https://ui.shadcn.com/docs/registry/registry-index)
so users can run `shadcn add @itzsa/data-table` by name. **Do not submit
automatically** — that is a deliberate maintainer step.
