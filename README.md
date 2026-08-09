# itzsa

Component library monorepo — docs, demos, and npm packages under `packages/`.

## Live docs

**https://itzsa.acharya-suman.com.np/**

| Package | Docs | npm |
| --- | --- | --- |
| `@itzsa/table` | [/table](https://itzsa.acharya-suman.com.np/table) | [npm](https://www.npmjs.com/package/@itzsa/table) |
| `@itzsa/editor` | [/editor](https://itzsa.acharya-suman.com.np/editor) | [npm](https://www.npmjs.com/package/@itzsa/editor) |
| `@itzsa/page-builder` | [/page-builder](https://itzsa.acharya-suman.com.np/page-builder) | [npm](https://www.npmjs.com/package/@itzsa/page-builder) |
| `@itzsa/nepali-input` | [/nepali-input](https://itzsa.acharya-suman.com.np/nepali-input) | [npm](https://www.npmjs.com/package/@itzsa/nepali-input) |
| `@itzsa/nepali-datepicker` | [/nepali-datepicker](https://itzsa.acharya-suman.com.np/nepali-datepicker) | [npm](https://www.npmjs.com/package/@itzsa/nepali-datepicker) |
| `@itzsa/bs-date` | [/bs-date](https://itzsa.acharya-suman.com.np/bs-date) | [npm](https://www.npmjs.com/package/@itzsa/bs-date) |
| `@itzsa/nepal-geo` | [/nepal-geo](https://itzsa.acharya-suman.com.np/nepal-geo) | [npm](https://www.npmjs.com/package/@itzsa/nepal-geo) |
| `@itzsa/nepal-geo-data` | [/nepal-geo](https://itzsa.acharya-suman.com.np/nepal-geo) | [npm](https://www.npmjs.com/package/@itzsa/nepal-geo-data) |
| `@itzsa/nrb-forex` | [/nrb-forex](https://itzsa.acharya-suman.com.np/nrb-forex) | [npm](https://www.npmjs.com/package/@itzsa/nrb-forex) |
| `@itzsa/nepal-pay` | [/nepal-pay](https://itzsa.acharya-suman.com.np/nepal-pay) | [npm](https://www.npmjs.com/package/@itzsa/nepal-pay) |
| `@itzsa/captcha` | [/captcha](https://itzsa.acharya-suman.com.np/captcha) | [npm](https://www.npmjs.com/package/@itzsa/captcha) |
| `@itzsa/a11y-toolbar` | [/a11y-toolbar](https://itzsa.acharya-suman.com.np/a11y-toolbar) | [npm](https://www.npmjs.com/package/@itzsa/a11y-toolbar) |
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
pnpm add @itzsa/editor
pnpm add @itzsa/page-builder
pnpm add @itzsa/nepali-input
pnpm add @itzsa/nepali-datepicker
pnpm add @itzsa/bs-date
pnpm add @itzsa/nepal-geo
pnpm add @itzsa/nepal-geo-data
pnpm add @itzsa/nrb-forex
pnpm add @itzsa/nepal-pay
pnpm add @itzsa/captcha
pnpm add @itzsa/a11y-toolbar
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

[Suman Acharya](https://sumanacharya186.com.np/) · [GitHub](https://github.com/SumanPoU)

## License

[MIT](./LICENSE) — Copyright (c) 2026 Suman Acharya.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, PR rules, and conventional commits.

## Report a bug

- **Bugs:** [Open a bug report](https://github.com/SumanPoU/package/issues/new?template=bug_report.yml)
- **Security:** [SECURITY.md](./SECURITY.md) (private advisory — do not file a public issue)
- **All issues:** [github.com/SumanPoU/package/issues](https://github.com/SumanPoU/package/issues)
