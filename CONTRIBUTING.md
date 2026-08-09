# Contributing

Thanks for helping improve **itzsa** — the `@itzsa/*` component library monorepo.

## Ways to contribute

| Kind | Where |
| --- | --- |
| Bug report | [Open a bug report](https://github.com/SumanPoU/package/issues/new?template=bug_report.yml) |
| Feature / docs idea | [GitHub Issues](https://github.com/SumanPoU/package/issues) (describe the use case) |
| Security | **Do not** file a public issue — see [SECURITY.md](./SECURITY.md) |
| Pull request | Fork → branch → PR against `main` |

## Development setup

```bash
pnpm install
pnpm dev
```

Docs site: [http://localhost:3000](http://localhost:3000).

Publishable packages live under `packages/<name>/`. Shared docs for the page builder: `docs/page-builder/` and live route `/page-builder`.

### Useful scripts

| Script | Purpose |
| --- | --- |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format |
| `pnpm typecheck:packages` | Typecheck publishable packages |
| `pnpm test:packages` | Package unit tests |
| `pnpm --filter @itzsa/<name> build` | Build one package |
| `pnpm commit` | Commitizen conventional commit |

## Pull request guidelines

1. **Scope** — one concern per PR (prefer conventional commit scopes like `feat(page-builder): …`).
2. **Lint** — `pnpm lint` / Biome must pass on touched files.
3. **Tests** — for package logic, add or update the smallest check that fails if the change breaks (`packages/*/test`).
4. **Docs** — if you change public API or behavior, update the matching topic under `docs/` and/or the live `src/app/<package>/` docs page in the same PR (see `AGENTS.md` / architecture topic-doc rule for page-builder).
5. **No secrets** — never commit `.env`, keys, or credentials.

### Conventional commits

Husky + commitlint enforce:

`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

```bash
pnpm commit
```

## Package notes

- Packages are framework-agnostic unless explicitly scoped otherwise (no Next.js inside `packages/*`).
- New packages: follow `AGENTS.md` and `.agents/skills/building-components/SKILL.md`.
- Never publish to npm without an explicit version bump decision and a passing build.

## Code of conduct (short)

Be respectful. Assume good intent. Focus feedback on the code and the problem. Harassment or spam will be closed / blocked.

## Questions

- Docs: [https://itzsa.acharya-suman.com.np/](https://itzsa.acharya-suman.com.np/)
- Author: [Suman Acharya](https://sumanacharya186.com.np/) · [GitHub](https://github.com/SumanPoU)
