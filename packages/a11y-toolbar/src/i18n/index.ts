export { EN_MESSAGES } from "./en";
export {
  type A11yLocaleFontMap,
  DEFAULT_LOCALE_FONTS,
  resolveLocaleFont,
} from "./fonts";
export {
  collectFallbackPaths,
  deepMergeMessages,
  formatAnnounceStep,
  formatAnnounceToggle,
  formatLevelFallback,
  isMessagesPartial,
  listAvailableLocales,
  resolveLocaleName,
  resolveMessages,
  warnIncompleteLocale,
} from "./merge";
export { NE_MESSAGES, NE_MESSAGES_DEMO } from "./ne";
export {
  clearStoredLocale,
  getStoredLocale,
  localeStorageKey,
  setStoredLocale,
} from "./storage";
export type {
  A11yLocaleDictionaries,
  A11yMessages,
  A11yMessagesPartial,
} from "./types";
