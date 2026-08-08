# Locales (content i18n)

Content locale is a first-class editor concern (ADR-10 / §19). Host configures the locale list; the engine never hardcodes `en`/`ne` as the only codes.

## Host config

```ts
import { createDefaultLocaleConfig, type LocaleConfig } from "@itzsa/page-builder";

const locales: LocaleConfig = {
  locales: [
    { code: "en", label: "English", dir: "ltr", flatSuffixes: ["en", "eng"] },
    { code: "ne", label: "नेपाली", dir: "ltr", flatSuffixes: ["ne", "np"] },
    // host may add hi, zh, … without an engine release
  ],
  defaultLocale: "en",
  fallbackLocale: "en",
  localeStorage: "nested", // or "flat" on save
  strictFlatKeys: false,
};
```

## Canonical shape

Everything downstream of `i18nResolve` consumes:

```ts
i18nProps: {
  en: { title: "Hello", desc: "…" },
  ne: { title: "नमस्ते", desc: "…" },
}
```

## Accepted inputs

| Strategy | Example | Notes |
| --- | --- | --- |
| Nested | `i18nProps.en.desc` | Default / preferred |
| Flat suffixes | `desc_en`, `desc_ne`, `desp_eng`, `desp_np` | Mapped via `flatSuffixes` |
| Shared | `props.url` | Declared in `sharedProps` |

## Pipeline

1. **`normalizeI18n`** — flat → nested; nested wins on conflict; collisions prefer the first-listed suffix and emit warnings.
2. **`resolveProps(block, activeLocale, config)`** — merge shared props + active slice; missing keys use `fallbackLocale`; **empty string ≠ missing**.
3. **`serializeI18n`** — persist nested or flat (canonical write suffix = `flatSuffixes[0]`).

Never branch `if (lang === 'ne')` inside a block `render`.

## Limits

- Flat suffix matching uses `/^(.*)_(.+)$/` (last `_` segment). Suffixes must not themselves contain `_`.
- Logical-key renames (`desp` → `desc`) are a host migration concern — the engine does not guess historical field names forever.
- Inspector should mount only the active locale’s inputs (Phase 4); all locales stay in data.
