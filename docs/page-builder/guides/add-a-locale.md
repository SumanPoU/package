# Guide: add a locale

Locales are host-configured — no engine release to add `hi`, `zh`, etc. (ADR-10 / §19).

## Steps

1. Extend `LocaleConfig.locales` with `{ code, label, dir, flatSuffixes? }`.
2. Keep `defaultLocale` / `fallbackLocale` valid codes in that list.
3. Pass the same `localeConfig` into `PageBuilder` and `RenderPage`.
4. Switch `activeLocale` — canvas + inspector resolve via `i18nResolve` together.
5. If host CMS uses flat columns (`title_en`), map suffixes in `flatSuffixes` (host-defined).

```ts
const locales: LocaleConfig = {
  locales: [
    { code: "en", label: "English", dir: "ltr", flatSuffixes: ["en"] },
    { code: "ne", label: "नेपाली", dir: "ltr", flatSuffixes: ["ne", "np"] },
    { code: "hi", label: "हिन्दी", dir: "ltr", flatSuffixes: ["hi"] },
  ],
  defaultLocale: "en",
  fallbackLocale: "en",
  localeStorage: "nested",
};
```

## Rules

- Honor `dir` / `lang` on the page document (a11y)
- Missing locale value → fallback locale, not crash
- Never hardcode `switch (lang)` in block `render`

## Related

[locales](../concepts/locales.md) · [inspector-fields](../editor/inspector-fields.md)
