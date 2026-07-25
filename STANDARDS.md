# STANDARDS.md

House conventions for publishable packages in this monorepo (`@itzsa/*`).
Derived from patterns already used by `table`, `nepal-pay`, and `a11y-toolbar`.
If this file and `AGENTS.md` diverge, follow `AGENTS.md` for agent behavior and
keep this file as the package-author checklist.

---

## 1. Package directory layout

Canonical example: `packages/a11y-toolbar/`.

```
packages/<name>/
  src/
    index.ts(x)       # Public client entry (React OK)
    headless.ts       # Optional: server-safe / non-React entry
    types.ts
    …domain modules…
    styles.css        # If the package ships CSS
  test/
  scripts/            # Build helpers only
  package.json
  tsconfig.json       # extends ../../tsconfig.base.json
  tsup.config.ts
  README.md
  IMPLEMENTATION.md   # Engineering notes (optional but preferred)
```

Rules:

- Export only intentional public API from `src/index.ts(x)`.
- Framework-agnostic core stays free of React when a `./headless` entry exists.
- No Next.js-specific code inside `packages/*`.
- Shared cross-package utils go in `packages/core` via `workspace:*`.

---

## 2. CSS custom property naming

**Convention:** `--itzsa-{package}-{token}`

Examples:

| Package | Token | Variable |
| --- | --- | --- |
| a11y-toolbar | letter spacing | `--itzsa-a11y-letter-spacing` |
| a11y-toolbar | toolbar accent | `--itzsa-a11y-toolbar-accent` |

Do **not** use short generic prefixes (`--a11y-*`, `--table-*`) that collide with
host sites or other libraries.

---

## 3. Design tokens (shared reference)

When a package ships chrome UI, prefer this scale unless product design
requires otherwise:

| Token | Value | Notes |
| --- | --- | --- |
| Space unit | `8px` | Gaps/padding in multiples of 8 |
| Radius | `14px` | Controls, cards, launcher chrome |
| Accent (default) | `#1d9e75` | itzsa brand — icons/header |
| Header foreground | `#04342c` | ≥4.5:1 on brand accent |
| Card surface | `#f7f6f4` | Warm off-white (not pure `#fff`) |
| Muted text | `#4b4b4b` | Must clear 4.5:1 on card surface |
| Focus ring | `#0b3d34` | Non-text ≥3:1 on card **and** accent header |

Icon chrome (outline sets): **24×24** viewBox, **1.75** stroke, round caps/joins,
`currentColor` only.

---

## 4. Accessibility gate (every interactive package)

Before public release, confirm:

- [ ] Full keyboard operation (no mouse-only paths for primary actions)
- [ ] Visible focus that meets non-text contrast (≥3:1)
- [ ] Correct roles / `aria-*` (APG patterns for dialog, toggle, toolbar, etc.)
- [ ] Live regions used for async status when UI state isn’t obvious
- [ ] Documented screen-reader spot-check (VoiceOver or NVDA) for dialog/toolbar patterns
- [ ] Prefer reduced motion honored (`prefers-reduced-motion` and any in-product pause control)

Presentation overlays are **not** a WCAG compliance substitute — base UI still
needs semantics, keyboard support, and contrast.

---

## 5. README template

1. One-line purpose  
2. Install command  
3. Quick start (minimal working snippet)  
4. Props / API table  
5. Disclaimer-if-applicable (e.g. presentation aids ≠ compliance)  
6. Link to `IMPLEMENTATION.md` / `BEHAVIOR.md` for deep notes  

Keep `README.md` in sync with the public exports in `src/index.ts(x)`.

---

## 6. Conventional commits

Use Conventional Commits with a package scope when relevant:

- `feat(a11y-toolbar): …`
- `fix(nepal-pay): …`
- `docs(table): …`
- `chore: …` (repo-wide)

---

## 7. Publish gate

- New packages start at **`version: "0.0.0"`**.
- Never publish without explicit confirmation of: package name, bump type
  (patch / minor / major), and a passing `typecheck` + `test` + `build`.
- Do not run `npm publish` / `pnpm publish` unless the user asked for that release.
