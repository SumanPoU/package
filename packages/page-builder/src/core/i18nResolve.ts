import type {
  Block,
  FlatKeyWarning,
  I18nPropsMap,
  LocaleConfig,
  LocaleDefinition,
  NormalizeI18nResult,
} from "./types";

const FLAT_KEY_RE = /^(.*)_(.+)$/;

export const createDefaultLocaleConfig = (): LocaleConfig => ({
  locales: [
    {
      code: "en",
      label: "English",
      dir: "ltr",
      flatSuffixes: ["en", "eng"],
    },
    {
      code: "ne",
      label: "नेपाली",
      dir: "ltr",
      flatSuffixes: ["ne", "np"],
    },
  ],
  defaultLocale: "en",
  fallbackLocale: "en",
  localeStorage: "nested",
});

const assertLocaleConfig = (config: LocaleConfig): void => {
  if (!config.locales.length) {
    throw new Error("LocaleConfig: locales must be non-empty");
  }
  const codes = new Set(config.locales.map((l) => l.code));
  if (!codes.has(config.defaultLocale)) {
    throw new Error(
      `LocaleConfig: defaultLocale "${config.defaultLocale}" is not in locales`,
    );
  }
  if (!codes.has(config.fallbackLocale)) {
    throw new Error(
      `LocaleConfig: fallbackLocale "${config.fallbackLocale}" is not in locales`,
    );
  }
  for (const locale of config.locales) {
    if (!locale.flatSuffixes.length) {
      throw new Error(
        `LocaleConfig: locale "${locale.code}" needs at least one flatSuffix`,
      );
    }
  }
};

type SuffixHit = {
  locale: LocaleDefinition;
  suffix: string;
  /** Index of suffix inside locale.flatSuffixes (0 = canonical write). */
  suffixIndex: number;
};

/**
 * Longest-suffix match across host-configured flatSuffixes (ADR-10).
 * e.g. `_eng` before `_en` so `desc_eng` → en, not leftover `_g`.
 */
const matchFlatSuffix = (
  suffix: string,
  locales: LocaleDefinition[],
): SuffixHit | undefined => {
  const candidates: SuffixHit[] = [];
  for (const locale of locales) {
    for (let i = 0; i < locale.flatSuffixes.length; i += 1) {
      const s = locale.flatSuffixes[i]!;
      if (s === suffix) {
        candidates.push({ locale, suffix: s, suffixIndex: i });
      }
    }
  }
  if (!candidates.length) return undefined;
  // Longest suffix string wins; ties broken by first-listed suffix preference later at collision.
  candidates.sort((a, b) => b.suffix.length - a.suffix.length);
  return candidates[0];
};

const cloneI18n = (map: I18nPropsMap | undefined): I18nPropsMap => {
  if (!map) return {};
  return Object.fromEntries(
    Object.entries(map).map(([locale, slice]) => [locale, { ...slice }]),
  );
};

const setI18nValue = (
  map: I18nPropsMap,
  locale: string,
  logicalKey: string,
  value: unknown,
): void => {
  if (!map[locale]) map[locale] = {};
  map[locale]![logicalKey] = value;
};

/**
 * Normalize flat host keys + nested `i18nProps` into the canonical nested shape.
 * Nested values always win over flat keys for the same locale+logicalKey.
 */
export const normalizeI18n = (
  input: {
    props?: Record<string, unknown>;
    i18nProps?: I18nPropsMap;
  },
  config: LocaleConfig,
): NormalizeI18nResult => {
  assertLocaleConfig(config);

  const props: Record<string, unknown> = { ...(input.props ?? {}) };
  const i18nProps = cloneI18n(input.i18nProps);

  // Track first-claimed flat assignments for collision rule (prefer suffix index 0).
  type Claim = {
    key: string;
    suffixIndex: number;
    value: unknown;
  };
  const claims = new Map<string, Claim>(); // `${locale}\0${logicalKey}` → claim
  const warnings: FlatKeyWarning[] = [];

  const propKeys = Object.keys(props);
  for (const key of propKeys) {
    const match = FLAT_KEY_RE.exec(key);
    if (!match) continue;

    const logicalKey = match[1]!;
    const suffix = match[2]!;
    const hit = matchFlatSuffix(suffix, config.locales);

    if (!hit) {
      if (config.strictFlatKeys) {
        throw new Error(
          `normalizeI18n: unknown flat suffix "_${suffix}" on key "${key}"`,
        );
      }
      continue;
    }

    const claimKey = `${hit.locale.code}\0${logicalKey}`;
    const value = props[key];
    delete props[key];

    // Nested always wins — drop flat entirely for this slot.
    if (i18nProps[hit.locale.code]?.[logicalKey] !== undefined) {
      continue;
    }

    const existing = claims.get(claimKey);
    if (!existing) {
      claims.set(claimKey, {
        key,
        suffixIndex: hit.suffixIndex,
        value,
      });
      continue;
    }

    // Collision: prefer the suffix listed FIRST in that locale's flatSuffixes.
    if (hit.suffixIndex < existing.suffixIndex) {
      warnings.push({
        locale: hit.locale.code,
        logicalKey,
        keptKey: key,
        droppedKey: existing.key,
      });
      claims.set(claimKey, {
        key,
        suffixIndex: hit.suffixIndex,
        value,
      });
    } else {
      warnings.push({
        locale: hit.locale.code,
        logicalKey,
        keptKey: existing.key,
        droppedKey: key,
      });
    }
  }

  for (const [claimKey, claim] of claims) {
    const [locale, logicalKey] = claimKey.split("\0") as [string, string];
    setI18nValue(i18nProps, locale, logicalKey, claim.value);
  }

  return { props, i18nProps, warnings };
};

/**
 * Normalize a whole block (mutates nothing — returns a new block shell).
 */
export const normalizeBlockI18n = (
  block: Block,
  config: LocaleConfig,
): { block: Block; warnings: FlatKeyWarning[] } => {
  const { props, i18nProps, warnings } = normalizeI18n(
    { props: block.props, i18nProps: block.i18nProps },
    config,
  );
  return {
    block: {
      ...block,
      props,
      i18nProps:
        Object.keys(i18nProps).length > 0 ? i18nProps : block.i18nProps,
    },
    warnings,
  };
};

const isMissing = (value: unknown): boolean => value === undefined;

/**
 * Resolve shared props + active-locale i18n slice for render/inspector.
 * Missing locale values fall back to `fallbackLocale`. Empty string is kept.
 */
export const resolveProps = (
  block: Block,
  activeLocale: string,
  config: LocaleConfig,
): Record<string, unknown> => {
  assertLocaleConfig(config);

  const { props, i18nProps } = normalizeI18n(
    { props: block.props, i18nProps: block.i18nProps },
    config,
  );

  const active = i18nProps[activeLocale] ?? {};
  const fallback = i18nProps[config.fallbackLocale] ?? {};
  const logicalKeys = new Set([
    ...Object.keys(active),
    ...Object.keys(fallback),
  ]);

  const resolved: Record<string, unknown> = { ...props };
  for (const key of logicalKeys) {
    if (!isMissing(active[key])) {
      resolved[key] = active[key];
      continue;
    }
    if (!isMissing(fallback[key])) {
      resolved[key] = fallback[key];
    }
  }
  return resolved;
};

/**
 * Serialize canonical `i18nProps` for host persistence (`nested` | `flat`).
 * Flat write path uses only the first (canonical) suffix per locale (ADR-10 §5).
 */
export const serializeI18n = (
  i18nProps: I18nPropsMap,
  config: LocaleConfig,
): {
  props: Record<string, unknown>;
  i18nProps?: I18nPropsMap;
} => {
  assertLocaleConfig(config);

  if (config.localeStorage === "nested") {
    return { props: {}, i18nProps: cloneI18n(i18nProps) };
  }

  const props: Record<string, unknown> = {};
  for (const locale of config.locales) {
    const slice = i18nProps[locale.code];
    if (!slice) continue;
    const suffix = locale.flatSuffixes[0]!;
    for (const [logicalKey, value] of Object.entries(slice)) {
      props[`${logicalKey}_${suffix}`] = value;
    }
  }
  return { props };
};

export const getLocaleDefinition = (
  config: LocaleConfig,
  code: string,
): LocaleDefinition | undefined =>
  config.locales.find((locale) => locale.code === code);

export const getActiveLocaleDir = (
  config: LocaleConfig,
  activeLocale: string,
): LocaleDefinition["dir"] =>
  getLocaleDefinition(config, activeLocale)?.dir ??
  getLocaleDefinition(config, config.fallbackLocale)?.dir ??
  "ltr";
