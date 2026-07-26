/**
 * Default chrome font stacks by locale.
 * Hosts can override via `theme.fontFamily` (all locales) or
 * `theme.fontFamilyByLocale` (per locale).
 */
export const DEFAULT_LOCALE_FONTS = {
  en: 'var(--font-outfit), "Outfit", system-ui, -apple-system, "Segoe UI", sans-serif',
  ne: 'var(--font-poppins), "Poppins", "Noto Sans Devanagari", "Noto Sans", system-ui, sans-serif',
} as const;

export type A11yLocaleFontMap = Record<string, string>;

/**
 * Pick the toolbar font for the active locale.
 * Priority: `fontFamily` (global) → `fontFamilyByLocale[locale]` → built-in → English default.
 */
export function resolveLocaleFont(
  locale: string,
  options?: {
    fontFamily?: string;
    fontFamilyByLocale?: A11yLocaleFontMap;
  },
): string {
  if (options?.fontFamily) return options.fontFamily;
  const fromMap = options?.fontFamilyByLocale?.[locale];
  if (fromMap) return fromMap;
  if (locale in DEFAULT_LOCALE_FONTS) {
    return DEFAULT_LOCALE_FONTS[locale as keyof typeof DEFAULT_LOCALE_FONTS];
  }
  return DEFAULT_LOCALE_FONTS.en;
}
