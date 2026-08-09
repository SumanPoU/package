import type { FeatureId, SteppedFeatureId } from "../types";
import { EN_MESSAGES } from "./en";
import type {
  A11yLocaleDictionaries,
  A11yMessages,
  A11yMessagesPartial,
} from "./types";

const FEATURE_IDS = Object.keys(EN_MESSAGES.features) as FeatureId[];
const STEPPED_IDS = Object.keys(EN_MESSAGES.levels) as SteppedFeatureId[];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Deep-merge partial onto base (arrays replace, objects recurse). */
export function deepMergeMessages(
  base: A11yMessages,
  partial?: A11yMessagesPartial | null,
): A11yMessages {
  if (!partial)
    return {
      ...base,
      features: { ...base.features },
      levels: { ...base.levels },
      sections: { ...base.sections },
    };

  const next: A11yMessages = {
    ...base,
    ...pickDefined(partial, [
      "locale",
      "localeName",
      "panelTitle",
      "launcherLabel",
      "closeOverlay",
      "resetAll",
      "close",
      "language",
      "languageChanged",
      "resetAnnouncement",
      "panelError",
      "on",
      "off",
      "levelFallback",
      "readAloudPause",
      "readAloudResume",
      "readAloudStop",
      "readAloudRate",
      "readAloudUnsupported",
      "readAloudNoVoice",
      "announceStep",
    ]),
    sections: { ...base.sections },
    features: { ...base.features },
    levels: { ...base.levels },
  };

  if (partial.sections) {
    for (const key of Object.keys(base.sections) as Array<
      keyof A11yMessages["sections"]
    >) {
      const value = partial.sections[key];
      if (value !== undefined) next.sections[key] = value;
    }
  }

  if (partial.features) {
    for (const id of FEATURE_IDS) {
      const patch = partial.features[id];
      if (!patch) continue;
      next.features[id] = {
        title: patch.title ?? base.features[id].title,
        description: patch.description ?? base.features[id].description,
      };
    }
  }

  if (partial.levels) {
    for (const id of STEPPED_IDS) {
      const patch = partial.levels[id];
      if (!patch) continue;
      next.levels[id] = [...patch];
    }
  }

  return next;
}

function pickDefined<T extends object, K extends keyof T>(
  source: Partial<T>,
  keys: K[],
): Partial<Pick<T, K>> {
  const out: Partial<Pick<T, K>> = {};
  for (const key of keys) {
    if (source[key] !== undefined) out[key] = source[key];
  }
  return out;
}

/**
 * Paths that still equal English after merge (host left them untranslated).
 * Used for development warnings only.
 */
export function collectFallbackPaths(
  resolved: A11yMessages,
  base: A11yMessages = EN_MESSAGES,
  localeCode: string,
): string[] {
  if (localeCode === "en" || resolved.locale === "en") return [];
  const paths: string[] = [];

  const scalarKeys: Array<keyof A11yMessages> = [
    "localeName",
    "panelTitle",
    "launcherLabel",
    "closeOverlay",
    "resetAll",
    "close",
    "language",
    "languageChanged",
    "resetAnnouncement",
    "panelError",
    "on",
    "off",
    "levelFallback",
    "announceStep",
  ];
  for (const key of scalarKeys) {
    if (resolved[key] === base[key]) paths.push(key);
  }
  for (const id of Object.keys(base.sections) as Array<
    keyof A11yMessages["sections"]
  >) {
    if (resolved.sections[id] === base.sections[id]) {
      paths.push(`sections.${id}`);
    }
  }
  for (const id of FEATURE_IDS) {
    if (resolved.features[id].title === base.features[id].title) {
      paths.push(`features.${id}.title`);
    }
    if (resolved.features[id].description === base.features[id].description) {
      paths.push(`features.${id}.description`);
    }
  }
  for (const id of STEPPED_IDS) {
    const a = resolved.levels[id];
    const b = base.levels[id];
    if (a.length === b.length && a.every((v, i) => v === b[i])) {
      paths.push(`levels.${id}`);
    }
  }
  return paths;
}

export function warnIncompleteLocale(
  localeCode: string,
  paths: string[],
): void {
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return;
  }
  if (paths.length === 0) return;
  console.warn(
    `[@itzsa/a11y-toolbar] locale "${localeCode}" falls back to English for ${paths.length} key(s):`,
    paths.slice(0, 20),
    paths.length > 20 ? `…+${paths.length - 20} more` : "",
  );
}

export function listAvailableLocales(
  locales?: A11yLocaleDictionaries,
  availableLocales?: string[],
): string[] {
  if (availableLocales && availableLocales.length > 0) {
    return unique(["en", ...availableLocales]);
  }
  return unique(["en", ...Object.keys(locales ?? {})]);
}

function unique(codes: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const code of codes) {
    const c = code.trim();
    if (!c || seen.has(c)) continue;
    seen.add(c);
    out.push(c);
  }
  return out;
}

export type ResolveMessagesOptions = {
  locale: string;
  locales?: A11yLocaleDictionaries;
  messages?: A11yMessagesPartial;
  /** When true (default in toolbar), warn in non-production if keys fall back. */
  warnFallbacks?: boolean;
};

/**
 * Resolution: `en` → `locales[locale]` → `messages` prop.
 * Always returns a complete `A11yMessages` object.
 */
export function resolveMessages(options: ResolveMessagesOptions): A11yMessages {
  const { locale, locales, messages, warnFallbacks = false } = options;
  const hostLocale = locales?.[locale];
  const merged = deepMergeMessages(
    deepMergeMessages(EN_MESSAGES, {
      ...hostLocale,
      locale: hostLocale?.locale ?? locale,
    }),
    messages,
  );

  // Ensure `lang` matches the active code even if host omitted `locale` field.
  merged.locale = messages?.locale ?? hostLocale?.locale ?? locale;

  if (warnFallbacks && locale !== "en") {
    warnIncompleteLocale(
      locale,
      collectFallbackPaths(merged, EN_MESSAGES, locale),
    );
  }

  return merged;
}

/** Locale display name for the switcher option. */
export function resolveLocaleName(
  code: string,
  locales?: A11yLocaleDictionaries,
): string {
  if (code === "en") return EN_MESSAGES.localeName;
  return locales?.[code]?.localeName ?? code;
}

export function formatAnnounceStep(
  messages: A11yMessages,
  title: string,
  name: string,
  current: number,
  total: number,
): string {
  // Arabic numerals for all locales (v1 decision — not Devanagari digits).
  return messages.announceStep
    .split("{title}")
    .join(title)
    .split("{name}")
    .join(name)
    .split("{current}")
    .join(String(current))
    .split("{total}")
    .join(String(total));
}

export function formatLevelFallback(messages: A11yMessages, n: number): string {
  return messages.levelFallback.split("{n}").join(String(n));
}

export function formatAnnounceToggle(
  messages: A11yMessages,
  title: string,
  on: boolean,
): string {
  return `${title}: ${on ? messages.on : messages.off}`;
}

/** Type guard for host payloads (tests / migrate helpers). */
export function isMessagesPartial(
  value: unknown,
): value is A11yMessagesPartial {
  return isPlainObject(value);
}
