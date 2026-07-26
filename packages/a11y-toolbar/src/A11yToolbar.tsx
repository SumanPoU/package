"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  clearA11yPreferences,
  flushApplyA11yPreferences,
  scheduleApplyA11yPreferences,
} from "./apply";
import { CSS_VAR } from "./css-vars";
import { A11yPanelErrorBoundary } from "./ErrorBoundary";
import { useFocusTrap, useHotkey, useIdSafe } from "./hooks";
import {
  type A11yLocaleDictionaries,
  type A11yMessagesPartial,
  formatAnnounceStep,
  formatAnnounceToggle,
  formatLevelFallback,
  getStoredLocale,
  listAvailableLocales,
  localeStorageKey,
  resolveLocaleFont,
  resolveLocaleName,
  resolveMessages,
  setStoredLocale,
} from "./i18n";
import { IconClose, IconLauncher, IconReset, resolveIcon } from "./icons";
import {
  cycleStep,
  isPreferencesEqual,
  resetPreferences,
  toggleFeature,
} from "./preferences";
import { ReadingGuide } from "./ReadingGuide";
import {
  getFeatureDef,
  getSectionsWithFeatures,
  isSteppedFeature,
  isToggleFeature,
} from "./registry";
import {
  clearStoredPreferences,
  getStoredPreferences,
  migrate,
  setStoredPreferences,
} from "./storage";
import { ToolCard } from "./ToolCard";
import type {
  A11yFeatureFlags,
  A11yHotkey,
  A11yPanelAlign,
  A11yPreferences,
  A11yResolvedPanelAlign,
  A11yToolbarPosition,
  A11yToolbarTheme,
  FeatureId,
  SteppedFeatureId,
  ToggleFeatureId,
} from "./types";
import {
  A11Y_TOOLBAR_ATTR,
  DEFAULT_A11Y_THEME,
  DEFAULT_HOTKEY,
  DEFAULT_STORAGE_KEY,
} from "./types";

export type A11yToolbarProps = {
  storageKey?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  features?: A11yFeatureFlags;
  hotkey?: A11yHotkey;
  onChange?: (prefs: A11yPreferences) => void;
  className?: string;
  style?: CSSProperties;
  /**
   * Override launcher accessible name.
   * Defaults to the active locale’s `launcherLabel` message.
   */
  launcherLabel?: string;
  position?: A11yToolbarPosition;
  panelAlign?: A11yPanelAlign;
  offset?: string;
  launcherSize?: string;
  /**
   * Panel max height (e.g. `"32rem"`, `"70dvh"`).
   * Default `min(40rem, calc(100dvh - 6rem))`.
   */
  panelMaxHeight?: string;
  /**
   * Fixed panel height (e.g. `"28rem"`). When set, the panel uses this height
   * and still respects `panelMaxHeight` as a ceiling.
   */
  panelHeight?: string;
  /** @deprecated Prefer `theme.accent` / `theme.launcher`. */
  accentColor?: string;
  theme?: A11yToolbarTheme;
  /**
   * Controlled locale — sync with Zustand / Redux / next-intl / app i18n.
   * When set, the host owns persistence (toolbar will not write `:locale` storage).
   */
  locale?: string;
  /** Uncontrolled initial locale. Default `"en"`. */
  defaultLocale?: string;
  /** Called when the user picks a language (and whenever locale should update). */
  onLocaleChange?: (locale: string) => void;
  /** Deep-partial overrides merged last (on top of active locale). */
  messages?: A11yMessagesPartial;
  /** Extra dictionaries; missing keys fall back to English. */
  locales?: A11yLocaleDictionaries;
  /** Codes in the switcher. Default: `en` + keys of `locales`. */
  availableLocales?: string[];
};

function isEnabled(
  flags: A11yFeatureFlags | undefined,
  id: FeatureId,
): boolean {
  return flags?.[id] !== false;
}

/** Expand `panelAlign` (+ launcher `position`) into a CSS class token. */
export function resolvePanelAlign(
  position: A11yToolbarPosition,
  panelAlign: A11yPanelAlign = "auto",
): A11yResolvedPanelAlign {
  if (panelAlign !== "auto") return panelAlign;
  switch (position) {
    case "bottom-left":
    case "top-left":
      return "left";
    case "bottom-right":
    case "top-right":
      return "right";
    case "bottom-center":
    case "top-center":
      return "center";
    case "middle-left":
      return "beside-left";
    case "middle-right":
      return "beside-right";
  }
}

const PANEL_GAP = "0.75rem";
const EDGE_LEFT = "max(var(--itzsa-a11y-offset), env(safe-area-inset-left))";
const EDGE_RIGHT = "max(var(--itzsa-a11y-offset), env(safe-area-inset-right))";
const EDGE_TOP = "max(var(--itzsa-a11y-offset), env(safe-area-inset-top))";
const EDGE_BOTTOM =
  "max(var(--itzsa-a11y-offset), env(safe-area-inset-bottom))";

/** Inline insets for the panel — driven by props. */
export function resolvePanelStyle(
  position: A11yToolbarPosition,
  panelAlign: A11yPanelAlign = "auto",
): CSSProperties {
  const align = resolvePanelAlign(position, panelAlign);

  const vertical: CSSProperties = position.startsWith("bottom")
    ? {
        top: "auto",
        bottom: `calc(var(--itzsa-a11y-launcher-size) + ${PANEL_GAP} + ${EDGE_BOTTOM})`,
        marginBlock: 0,
        height: "auto",
      }
    : position.startsWith("top")
      ? {
          bottom: "auto",
          top: `calc(var(--itzsa-a11y-launcher-size) + ${PANEL_GAP} + ${EDGE_TOP})`,
          marginBlock: 0,
          height: "auto",
        }
      : {
          top: 0,
          bottom: 0,
          marginBlock: "auto",
          height: "fit-content",
        };

  const horizontal: CSSProperties =
    align === "left"
      ? { left: EDGE_LEFT, right: "auto", marginInline: 0 }
      : align === "right"
        ? { right: EDGE_RIGHT, left: "auto", marginInline: 0 }
        : align === "center"
          ? { left: 0, right: 0, marginInline: "auto" }
          : align === "beside-left"
            ? {
                left: `calc(${EDGE_LEFT} + var(--itzsa-a11y-launcher-size) + ${PANEL_GAP})`,
                right: "auto",
                marginInline: 0,
              }
            : {
                right: `calc(${EDGE_RIGHT} + var(--itzsa-a11y-launcher-size) + ${PANEL_GAP})`,
                left: "auto",
                marginInline: 0,
              };

  return { ...vertical, ...horizontal };
}

function resolveThemeStyle(
  theme: A11yToolbarTheme | undefined,
  accentColor: string | undefined,
  offset: string | undefined,
  launcherSize: string | undefined,
  locale: string,
  panelMaxHeight?: string,
  panelHeight?: string,
): CSSProperties {
  const accent = theme?.accent ?? accentColor ?? DEFAULT_A11Y_THEME.accent;
  const header = theme?.header ?? accentColor ?? accent;
  const headerFg =
    theme?.headerForeground ?? DEFAULT_A11Y_THEME.headerForeground;
  const icon = theme?.icon ?? accent;
  const focus = theme?.focusRing ?? DEFAULT_A11Y_THEME.focusRing;
  const font = resolveLocaleFont(locale, {
    fontFamily: theme?.fontFamily,
    fontFamilyByLocale: theme?.fontFamilyByLocale,
  });
  const launcher = theme?.launcher ?? accent;
  const launcherFg =
    theme?.launcherForeground ?? DEFAULT_A11Y_THEME.launcherForeground;
  const launcherRing = theme?.launcherRing ?? DEFAULT_A11Y_THEME.launcherRing;

  return {
    [CSS_VAR.toolbarAccent]: accent,
    [CSS_VAR.toolbarHeader]: header,
    [CSS_VAR.toolbarHeaderFg]: headerFg,
    [CSS_VAR.toolbarIcon]: icon,
    [CSS_VAR.toolbarFocus]: focus,
    [CSS_VAR.toolbarFont]: font,
    [CSS_VAR.launcherBg]: launcher,
    [CSS_VAR.launcherFg]: launcherFg,
    [CSS_VAR.launcherRing]: launcherRing,
    ...(offset ? { [CSS_VAR.offset]: offset } : null),
    ...(launcherSize ? { [CSS_VAR.launcherSize]: launcherSize } : null),
    ...(panelMaxHeight ? { [CSS_VAR.panelMaxHeight]: panelMaxHeight } : null),
    ...(panelHeight ? { [CSS_VAR.panelHeight]: panelHeight } : null),
    fontFamily: font,
  } as CSSProperties;
}

function pickInitialLocale(
  storageKey: string,
  defaultLocale: string,
  available: string[],
): string {
  if (typeof window === "undefined") {
    return available.includes(defaultLocale) ? defaultLocale : "en";
  }
  const stored = getStoredLocale(storageKey);
  if (stored && available.includes(stored)) return stored;
  return available.includes(defaultLocale) ? defaultLocale : "en";
}

export function A11yToolbar({
  storageKey = DEFAULT_STORAGE_KEY,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  features,
  hotkey = DEFAULT_HOTKEY,
  onChange,
  className,
  style,
  launcherLabel: launcherLabelProp,
  position = "bottom-right",
  panelAlign = "auto",
  offset,
  launcherSize,
  panelMaxHeight,
  panelHeight,
  accentColor,
  theme,
  locale: localeProp,
  defaultLocale = "en",
  onLocaleChange,
  messages,
  locales,
  availableLocales,
}: A11yToolbarProps) {
  const titleId = useIdSafe("a11y-title");
  const languageId = useIdSafe("a11y-language");
  const panelId = titleId.replace("a11y-title", "a11y-panel");
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const available = useMemo(
    () => listAvailableLocales(locales, availableLocales),
    [locales, availableLocales],
  );

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      onOpenChange?.(next);
      if (openProp === undefined) setUncontrolledOpen(next);
    },
    [onOpenChange, openProp],
  );

  const [uncontrolledLocale, setUncontrolledLocale] = useState(() =>
    pickInitialLocale(storageKey, defaultLocale, available),
  );

  // Keep uncontrolled locale valid if availableLocales shrink.
  useEffect(() => {
    if (localeProp !== undefined) return;
    if (!available.includes(uncontrolledLocale)) {
      const fallback = available.includes(defaultLocale)
        ? defaultLocale
        : (available[0] ?? "en");
      setUncontrolledLocale(fallback);
      setStoredLocale(fallback, storageKey);
    }
  }, [available, defaultLocale, localeProp, storageKey, uncontrolledLocale]);

  const activeLocaleCode =
    localeProp !== undefined
      ? available.includes(localeProp)
        ? localeProp
        : (available[0] ?? "en")
      : uncontrolledLocale;

  const setLocale = useCallback(
    (next: string) => {
      if (!available.includes(next)) return;
      onLocaleChange?.(next);
      if (localeProp === undefined) {
        setUncontrolledLocale(next);
        setStoredLocale(next, storageKey);
      }
      // Controlled: host updates `locale` from onLocaleChange (Zustand / Redux / etc.).
    },
    [available, localeProp, onLocaleChange, storageKey],
  );

  const t = useMemo(
    () =>
      resolveMessages({
        locale: activeLocaleCode,
        locales,
        messages,
        warnFallbacks: true,
      }),
    [activeLocaleCode, locales, messages],
  );

  // Mirror locale onto <html> for hosts / FOUC attribute parity (WCAG lang is on panel).
  useEffect(() => {
    document.documentElement.setAttribute("data-a11y-locale", activeLocaleCode);
  }, [activeLocaleCode]);

  const [prefs, setPrefs] = useState<A11yPreferences>(() =>
    typeof window === "undefined"
      ? resetPreferences()
      : getStoredPreferences(storageKey),
  );
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    scheduleApplyA11yPreferences(prefs);
    setStoredPreferences(prefs, storageKey);
    onChange?.(prefs);
  }, [prefs, storageKey, onChange]);

  useEffect(() => {
    return () => {
      flushApplyA11yPreferences();
    };
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey) {
        const next =
          event.newValue == null
            ? resetPreferences()
            : migrate(
                (() => {
                  try {
                    return JSON.parse(event.newValue) as unknown;
                  } catch {
                    return null;
                  }
                })(),
              ).values;
        setPrefs((prev) => (isPreferencesEqual(prev, next) ? prev : next));
      }
      if (
        localeProp === undefined &&
        event.key === localeStorageKey(storageKey) &&
        event.newValue
      ) {
        const next = event.newValue.trim();
        if (available.includes(next)) setUncontrolledLocale(next);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey, localeProp, available]);

  useFocusTrap(open, panelRef, () => setOpen(false));

  useHotkey(
    hotkey,
    () => {
      setOpen(!open);
    },
    true,
  );

  const sections = useMemo(
    () => getSectionsWithFeatures((id) => isEnabled(features, id)),
    [features],
  );

  const active = hasActiveA11yPreferences(prefs);

  const update = useCallback((next: A11yPreferences, message: string) => {
    setPrefs(next);
    setAnnouncement(message);
  }, []);

  const onActivate = (id: FeatureId) => {
    const def = getFeatureDef(id);
    if (!def) return;
    const title = t.features[id].title;
    if (isSteppedFeature(id)) {
      const next = cycleStep(prefs, id);
      const level = next[id] as number;
      const levels = t.levels[id];
      const name = levels[level] ?? formatLevelFallback(t, level + 1);
      update(
        next,
        formatAnnounceStep(t, title, name, level + 1, levels.length),
      );
    } else if (isToggleFeature(id)) {
      const next = toggleFeature(prefs, id);
      update(next, formatAnnounceToggle(t, title, next[id]));
    }
  };

  const onReset = () => {
    const next = resetPreferences();
    clearStoredPreferences(storageKey);
    clearA11yPreferences();
    scheduleApplyA11yPreferences(next, {}, 0);
    flushApplyA11yPreferences();
    update(next, t.resetAnnouncement);
  };

  const onLanguageChange = (next: string) => {
    if (next === activeLocaleCode) return;
    setLocale(next);
    // Announce in the *new* locale (resolve immediately for the message).
    const nextMessages = resolveMessages({
      locale: next,
      locales,
      messages,
      warnFallbacks: false,
    });
    setAnnouncement(nextMessages.languageChanged);
  };

  const rootStyle: CSSProperties = {
    ...resolveThemeStyle(
      theme,
      accentColor,
      offset,
      launcherSize,
      activeLocaleCode,
      panelMaxHeight,
      panelHeight,
    ),
    ...style,
  };

  const resolvedPanelAlign = resolvePanelAlign(position, panelAlign);
  const panelStyle = resolvePanelStyle(position, panelAlign);
  const showLanguageSwitcher = available.length > 1;
  const launcherLabel = launcherLabelProp ?? t.launcherLabel;

  return (
    <div
      className={[
        "itzsa-a11y-root",
        `itzsa-a11y-pos-${position}`,
        `itzsa-a11y-panel-align-${resolvedPanelAlign}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={rootStyle}
      data-panel-align={resolvedPanelAlign}
      data-locale={activeLocaleCode}
      {...{ [A11Y_TOOLBAR_ATTR]: "" }}
    >
      <button
        ref={launcherRef}
        type="button"
        className="itzsa-a11y-launcher"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={launcherLabel}
        data-active={active ? "true" : "false"}
        suppressHydrationWarning
        onClick={() => setOpen(!open)}
      >
        <IconLauncher />
        {active ? (
          <span className="itzsa-a11y-launcher-dot" aria-hidden />
        ) : null}
      </button>

      <ReadingGuide active={prefs.readingGuide} />

      {open ? (
        <>
          <button
            type="button"
            className="itzsa-a11y-overlay"
            aria-label={t.closeOverlay}
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="itzsa-a11y-panel"
            style={panelStyle}
            data-panel-align={resolvedPanelAlign}
            lang={t.locale}
          >
            <div className="itzsa-a11y-header">
              <h2 id={titleId} className="itzsa-a11y-title">
                {t.panelTitle}
              </h2>
              <div className="itzsa-a11y-header-actions">
                {showLanguageSwitcher ? (
                  <div className="itzsa-a11y-lang">
                    <label
                      htmlFor={languageId}
                      className="itzsa-a11y-lang-label"
                    >
                      {t.language}
                    </label>
                    <select
                      id={languageId}
                      className="itzsa-a11y-lang-select"
                      value={activeLocaleCode}
                      onChange={(event) => onLanguageChange(event.target.value)}
                    >
                      {available.map((code) => (
                        <option key={code} value={code} lang={code}>
                          {resolveLocaleName(code, locales)}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
                <button
                  type="button"
                  className="itzsa-a11y-icon-btn"
                  aria-label={t.resetAll}
                  title={t.resetAll}
                  onClick={onReset}
                >
                  <IconReset />
                </button>
                <button
                  type="button"
                  className="itzsa-a11y-icon-btn"
                  aria-label={t.close}
                  title={t.close}
                  onClick={() => setOpen(false)}
                >
                  <IconClose />
                </button>
              </div>
            </div>

            <A11yPanelErrorBoundary label={t.panelError}>
              <div className="itzsa-a11y-body">
                {sections.map((section) => {
                  const SectionIcon = resolveIcon(section.iconId);
                  const sectionTitle = t.sections[section.id];
                  return (
                    <section
                      key={section.id}
                      className="itzsa-a11y-section"
                      aria-labelledby={`${panelId}-${section.id}`}
                    >
                      <h3
                        id={`${panelId}-${section.id}`}
                        className="itzsa-a11y-section-title"
                      >
                        <span className="itzsa-a11y-section-icon" aria-hidden>
                          <SectionIcon />
                        </span>
                        {sectionTitle}
                      </h3>
                      <div className="itzsa-a11y-grid">
                        {section.features.map((feature) => {
                          const id = feature.id;
                          const title = t.features[id].title;
                          if (feature.kind === "stepped") {
                            const value = prefs[
                              id as SteppedFeatureId
                            ] as number;
                            const levels = t.levels[id as SteppedFeatureId];
                            const levelName =
                              levels[value] ??
                              formatLevelFallback(t, value + 1);
                            return (
                              <ToolCard
                                key={id}
                                feature={feature}
                                title={title}
                                value={value}
                                levelName={levelName}
                                onLabel={t.on}
                                offLabel={t.off}
                                onActivate={() => onActivate(id)}
                              />
                            );
                          }
                          return (
                            <ToolCard
                              key={id}
                              feature={feature}
                              title={title}
                              value={prefs[id as ToggleFeatureId] ? 1 : 0}
                              pressed={Boolean(prefs[id as ToggleFeatureId])}
                              onLabel={t.on}
                              offLabel={t.off}
                              onActivate={() => onActivate(id)}
                            />
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </A11yPanelErrorBoundary>

            <div className="itzsa-a11y-live" aria-live="polite" aria-atomic>
              {announcement}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export function hasActiveA11yPreferences(prefs: A11yPreferences): boolean {
  return !isPreferencesEqual(prefs, resetPreferences());
}
