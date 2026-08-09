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
import { useA11yShortcuts, useFocusTrap, useIdSafe } from "./hooks";
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
  adjustStep,
  cycleStep,
  isPreferencesEqual,
  resetPreferences,
  toggleFeature,
} from "./preferences";
import { ReadAloudControls, ReadAloudListener } from "./ReadAloud";
import { ReadingGuide } from "./ReadingGuide";
import {
  getFeatureDef,
  getSectionsWithFeatures,
  isSteppedFeature,
  isToggleFeature,
} from "./registry";
import type { A11yShortcutDef } from "./shortcuts";
import { resolveA11yShortcuts } from "./shortcuts";
import { clampSpeechRate, isSpeechSynthesisSupported } from "./speech";
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
  /**
   * Toggle the panel (default Alt+A). Pass `null` to disable.
   * Prefer `shortcuts` for the full shortcut map; `hotkey` still overrides
   * the built-in `togglePanel` binding when `shortcuts` is omitted.
   */
  hotkey?: A11yHotkey;
  /**
   * Keyboard shortcuts for panel + features.
   * - omit → defaults (`DEFAULT_A11Y_SHORTCUTS`, with `hotkey` applied)
   * - `false` → only `hotkey` panel toggle (if set)
   * - array → full custom list (scalable — add bindings without forking UI)
   */
  shortcuts?: readonly A11yShortcutDef[] | false;
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
   * Default `none` (full stretch between safe edges / launcher).
   */
  panelMaxHeight?: string;
  /**
   * Optional fixed height. When unset, the panel stretches edge-to-edge
   * (launcher floats on top — no gap reserved above/below the icon).
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

  // Full viewport stretch — do not leave a gap above/below the launcher icon.
  // Do not set inline `height` — that would override `--itzsa-a11y-panel-height`.
  const vertical: CSSProperties = {
    top: EDGE_TOP,
    bottom: EDGE_BOTTOM,
    marginBlock: 0,
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
    ...(theme?.background ? { [CSS_VAR.toolbarBg]: theme.background } : null),
    ...(theme?.card ? { [CSS_VAR.toolbarCard]: theme.card } : null),
    ...(theme?.foreground ? { [CSS_VAR.toolbarFg]: theme.foreground } : null),
    ...(theme?.muted ? { [CSS_VAR.toolbarMuted]: theme.muted } : null),
    ...(theme?.border ? { [CSS_VAR.toolbarBorder]: theme.border } : null),
    ...(theme?.shadow ? { [CSS_VAR.toolbarShadow]: theme.shadow } : null),
    ...(theme?.radius ? { [CSS_VAR.toolbarRadius]: theme.radius } : null),
    ...(theme?.zIndex != null
      ? { [CSS_VAR.toolbarZ]: String(theme.zIndex) }
      : null),
    ...(theme?.launcherRadius
      ? { [CSS_VAR.launcherRadius]: theme.launcherRadius }
      : null),
    ...(theme?.cursor ? { [CSS_VAR.cursor]: theme.cursor } : null),
    ...(theme?.guideHeight
      ? { [CSS_VAR.guideHeight]: theme.guideHeight }
      : null),
    ...(offset ? { [CSS_VAR.offset]: offset } : null),
    ...(launcherSize ? { [CSS_VAR.launcherSize]: launcherSize } : null),
    ...(panelMaxHeight ? { [CSS_VAR.panelMaxHeight]: panelMaxHeight } : null),
    ...(panelHeight ? { [CSS_VAR.panelHeight]: panelHeight } : null),
    fontFamily: font,
  } as CSSProperties;
}

function resolveDefaultLocale(
  defaultLocale: string,
  available: string[],
): string {
  if (available.includes(defaultLocale)) return defaultLocale;
  return available[0] ?? "en";
}

export function A11yToolbar({
  storageKey = DEFAULT_STORAGE_KEY,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  features,
  hotkey = DEFAULT_HOTKEY,
  shortcuts: shortcutsProp,
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
    (next: boolean | ((prev: boolean) => boolean)) => {
      const resolved = typeof next === "function" ? next(open) : next;
      onOpenChange?.(resolved);
      if (openProp === undefined) setUncontrolledOpen(resolved);
    },
    [onOpenChange, openProp, open],
  );

  // SSR + first client paint must match — never read localStorage in useState.
  const [uncontrolledLocale, setUncontrolledLocale] = useState(() =>
    resolveDefaultLocale(defaultLocale, available),
  );
  const [prefs, setPrefs] = useState<A11yPreferences>(() => resetPreferences());
  const [storageReady, setStorageReady] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const storedPrefs = getStoredPreferences(storageKey);
    setPrefs((prev) =>
      isPreferencesEqual(prev, storedPrefs) ? prev : storedPrefs,
    );
    if (localeProp === undefined) {
      const storedLocale = getStoredLocale(storageKey);
      if (storedLocale && available.includes(storedLocale)) {
        setUncontrolledLocale(storedLocale);
      }
    }
    setStorageReady(true);
  }, [storageKey, available, localeProp]);

  // Keep uncontrolled locale valid if availableLocales shrink.
  useEffect(() => {
    if (localeProp !== undefined) return;
    if (!available.includes(uncontrolledLocale)) {
      const fallback = resolveDefaultLocale(defaultLocale, available);
      setUncontrolledLocale(fallback);
      if (storageReady) setStoredLocale(fallback, storageKey);
    }
  }, [
    available,
    defaultLocale,
    localeProp,
    storageKey,
    uncontrolledLocale,
    storageReady,
  ]);

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

  useEffect(() => {
    if (!storageReady) return;
    scheduleApplyA11yPreferences(prefs);
    setStoredPreferences(prefs, storageKey);
    onChange?.(prefs);
  }, [prefs, storageKey, onChange, storageReady]);

  // Effect tokens (cursor / guide) must live on <html> so page-wide CSS sees them.
  useEffect(() => {
    const root = document.documentElement;
    const applied: string[] = [];
    if (theme?.cursor) {
      root.style.setProperty(CSS_VAR.cursor, theme.cursor);
      applied.push(CSS_VAR.cursor);
    }
    if (theme?.guideHeight) {
      root.style.setProperty(CSS_VAR.guideHeight, theme.guideHeight);
      applied.push(CSS_VAR.guideHeight);
    }
    return () => {
      for (const prop of applied) root.style.removeProperty(prop);
    };
  }, [theme?.cursor, theme?.guideHeight]);

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

  const shortcutBindings = useMemo(
    () =>
      resolveA11yShortcuts({
        shortcuts: shortcutsProp,
        hotkey,
      }),
    [shortcutsProp, hotkey],
  );

  const update = useCallback((next: A11yPreferences, message: string) => {
    setPrefs(next);
    setAnnouncement(message);
  }, []);

  const onActivate = useCallback(
    (id: FeatureId) => {
      const def = getFeatureDef(id);
      if (!def) return;
      if (!isEnabled(features, id)) return;
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
    },
    [features, prefs, t, update],
  );

  const onReset = useCallback(() => {
    const next = resetPreferences();
    clearStoredPreferences(storageKey);
    clearA11yPreferences();
    scheduleApplyA11yPreferences(next, {}, 0);
    flushApplyA11yPreferences();
    update(next, t.resetAnnouncement);
  }, [storageKey, t.resetAnnouncement, update]);

  useA11yShortcuts(
    shortcutBindings,
    (index) => {
      const binding = shortcutBindings[index];
      if (!binding) return;
      const { action } = binding;
      if (action.type === "togglePanel") {
        setOpen((prev) => !prev);
        return;
      }
      if (action.type === "reset") {
        onReset();
        return;
      }
      if (action.type === "feature") {
        const { feature, mode } = action;
        if (!isEnabled(features, feature)) return;
        const title = t.features[feature].title;
        if (mode === "inc" || mode === "dec") {
          if (!isSteppedFeature(feature)) return;
          const next = adjustStep(prefs, feature, mode === "inc" ? 1 : -1);
          if (next === prefs) return;
          const level = next[feature] as number;
          const levels = t.levels[feature];
          const name = levels[level] ?? formatLevelFallback(t, level + 1);
          update(
            next,
            formatAnnounceStep(t, title, name, level + 1, levels.length),
          );
          return;
        }
        if (mode === "toggle") {
          if (!isToggleFeature(feature)) return;
          const next = toggleFeature(prefs, feature);
          update(next, formatAnnounceToggle(t, title, next[feature]));
          return;
        }
        // cycle
        onActivate(feature);
      }
    },
    true,
  );

  const sections = useMemo(
    () => getSectionsWithFeatures((id) => isEnabled(features, id)),
    [features],
  );

  const active = hasActiveA11yPreferences(prefs);

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
      <ReadAloudListener
        active={prefs.readAloud}
        rate={prefs.speechRate}
        lang={activeLocaleCode}
      />

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
                {prefs.readAloud && isEnabled(features, "readAloud") ? (
                  <ReadAloudControls
                    rate={prefs.speechRate}
                    lang={activeLocaleCode}
                    onRateChange={(next) => {
                      const speechRate = clampSpeechRate(next);
                      update(
                        { ...prefs, speechRate },
                        `${t.readAloudRate}: ${speechRate.toFixed(1)}×`,
                      );
                    }}
                    labels={{
                      pause: t.readAloudPause,
                      resume: t.readAloudResume,
                      stop: t.readAloudStop,
                      rate: t.readAloudRate,
                      unsupported: t.readAloudUnsupported,
                      noVoice: t.readAloudNoVoice,
                    }}
                    supported={isSpeechSynthesisSupported()}
                  />
                ) : null}
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
