import type { LocaleConfig, LocaleDefinition } from "./types";

const EN: LocaleDefinition = {
  code: "en",
  label: "English",
  dir: "ltr",
  flatSuffixes: ["en", "eng"],
};

const NE: LocaleDefinition = {
  code: "ne",
  label: "नेपाली",
  dir: "ltr",
  flatSuffixes: ["ne", "np"],
};

/** Build a LocaleConfig from an explicit locale list (scalable). */
export const createLocaleConfig = (
  locales: LocaleDefinition[],
  opts?: {
    defaultLocale?: string;
    fallbackLocale?: string;
    localeStorage?: LocaleConfig["localeStorage"];
  },
): LocaleConfig => {
  if (!locales.length) {
    throw new Error("createLocaleConfig: locales must be non-empty");
  }
  const defaultLocale = opts?.defaultLocale ?? locales[0]!.code;
  const fallbackLocale = opts?.fallbackLocale ?? defaultLocale;
  return {
    locales,
    defaultLocale,
    fallbackLocale,
    localeStorage: opts?.localeStorage ?? "nested",
  };
};

export const createEnglishOnlyLocaleConfig = (): LocaleConfig =>
  createLocaleConfig([EN], { defaultLocale: "en", fallbackLocale: "en" });

export const createNepaliOnlyLocaleConfig = (): LocaleConfig =>
  createLocaleConfig([NE], { defaultLocale: "ne", fallbackLocale: "ne" });

export { EN as ENGLISH_LOCALE, NE as NEPALI_LOCALE };
