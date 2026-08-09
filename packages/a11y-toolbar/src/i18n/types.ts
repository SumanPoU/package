import type { A11ySectionId } from "../registry";
import type { FeatureId, SteppedFeatureId } from "../types";

/**
 * Complete UI copy for one locale.
 * Numerals in announcements stay Arabic (0–9) in all locales — intentional v1.
 * `dir` / RTL metadata is a known v2 gap (Nepali/Hindi are LTR).
 */
export type A11yMessages = {
  /** BCP 47-ish code used for `lang` on the panel (e.g. `"en"`, `"ne"`). */
  locale: string;
  /** Native name shown in the language switcher (e.g. `"English"`, `"नेपाली"`). */
  localeName: string;
  panelTitle: string;
  launcherLabel: string;
  closeOverlay: string;
  resetAll: string;
  close: string;
  language: string;
  /** Live-region when the user changes language (spoken in the *new* locale). */
  languageChanged: string;
  resetAnnouncement: string;
  panelError: string;
  on: string;
  off: string;
  levelFallback: string;
  /** Read Aloud panel controls. */
  readAloudPause: string;
  readAloudResume: string;
  readAloudStop: string;
  readAloudRate: string;
  readAloudUnsupported: string;
  /** Shown when SpeechSynthesis exists but no voice matches the active locale. */
  readAloudNoVoice: string;
  /**
   * Stepped announce template.
   * Tokens: `{title}`, `{name}`, `{current}`, `{total}` — `{current}`/`{total}` are Arabic digits.
   */
  announceStep: string;
  sections: Record<A11ySectionId, string>;
  features: Record<FeatureId, { title: string; description: string }>;
  levels: Record<SteppedFeatureId, string[]>;
};

/** Deep-partial host overrides / extra locale dictionaries. */
export type A11yMessagesPartial = {
  locale?: string;
  localeName?: string;
  panelTitle?: string;
  launcherLabel?: string;
  closeOverlay?: string;
  resetAll?: string;
  close?: string;
  language?: string;
  languageChanged?: string;
  resetAnnouncement?: string;
  panelError?: string;
  on?: string;
  off?: string;
  levelFallback?: string;
  readAloudPause?: string;
  readAloudResume?: string;
  readAloudStop?: string;
  readAloudRate?: string;
  readAloudUnsupported?: string;
  readAloudNoVoice?: string;
  announceStep?: string;
  sections?: Partial<Record<A11ySectionId, string>>;
  features?: Partial<
    Record<FeatureId, { title?: string; description?: string }>
  >;
  levels?: Partial<Record<SteppedFeatureId, string[]>>;
};

/** Host-supplied locale map. Missing keys fall back to English. */
export type A11yLocaleDictionaries = Record<string, A11yMessagesPartial>;
