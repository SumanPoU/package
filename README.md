# itzsa

Component library monorepo — docs, demos, and npm packages under `packages/`.

## Live docs

**https://itzsa.acharya-suman.com.np/**

| Package | Docs | npm |
| --- | --- | --- |
| `@itzsa/table` | [/table](https://itzsa.acharya-suman.com.np/table) | [npm](https://www.npmjs.com/package/@itzsa/table) |
| `@itzsa/nepali-input` | [/nepali-input](https://itzsa.acharya-suman.com.np/nepali-input) | [npm](https://www.npmjs.com/package/@itzsa/nepali-input) |
| `@itzsa/nepali-datepicker` | [/nepali-datepicker](https://itzsa.acharya-suman.com.np/nepali-datepicker) | [npm](https://www.npmjs.com/package/@itzsa/nepali-datepicker) |
| `@itzsa/nepal-geo` | [/nepal-geo](https://itzsa.acharya-suman.com.np/nepal-geo) | [npm](https://www.npmjs.com/package/@itzsa/nepal-geo) |
| `@itzsa/nepal-geo-data` | [/nepal-geo](https://itzsa.acharya-suman.com.np/nepal-geo) | [npm](https://www.npmjs.com/package/@itzsa/nepal-geo-data) |
| `@itzsa/editor` | [/editor](https://itzsa.acharya-suman.com.np/editor) | [npm](https://www.npmjs.com/package/@itzsa/editor) |
| Registry | [/registry](https://itzsa.acharya-suman.com.np/registry) | — |

## Local development

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Packages

```bash
pnpm add @itzsa/table
pnpm add @itzsa/nepali-input
pnpm add @itzsa/nepali-datepicker
pnpm add @itzsa/nepal-geo
pnpm add @itzsa/nepal-geo-data
pnpm add @itzsa/editor @itzsa/nepali-input
```

## Commits (Husky + Commitizen)

Conventional commits are enforced via **Husky** + **commitlint**. Use Commitizen for guided messages:

```bash
pnpm commit
# or: git cz
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

## SEO

The docs site ships advanced SEO: `metadataBase`, Open Graph / Twitter cards, `sitemap.xml`, `robots.txt`, JSON-LD (WebSite, Organization, SoftwareApplication), and per-package canonical URLs.

## Build

```bash
pnpm run build:packages
pnpm run build
```

## Author

[Suman Acharya](https://sumanacharya186.com.np/) · [GitHub](https://github.com/sumanpou)
