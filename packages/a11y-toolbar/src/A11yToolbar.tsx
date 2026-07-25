"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ANNOUNCE_RESET, announceStep, announceToggle } from "./announce";
import {
  clearA11yPreferences,
  flushApplyA11yPreferences,
  scheduleApplyA11yPreferences,
} from "./apply";
import { CSS_VAR } from "./css-vars";
import { A11yPanelErrorBoundary } from "./ErrorBoundary";
import { useFocusTrap, useHotkey, useIdSafe } from "./hooks";
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
  A11yPreferences,
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
  launcherLabel?: string;
  /**
   * Screen placement for the floating launcher (+ panel nearby).
   * Corners, edge centers, or middle sides.
   */
  position?: A11yToolbarPosition;
  /** Distance from viewport edge (e.g. `1.25rem`, `20px`). */
  offset?: string;
  /** Launcher button size (e.g. `3.5rem`, `56px`). */
  launcherSize?: string;
  /**
   * @deprecated Prefer `theme.accent` / `theme.launcher`.
   */
  accentColor?: string;
  /** Dynamic chrome + launcher colors (accent, header, launcher, font, focus). */
  theme?: A11yToolbarTheme;
};

function isEnabled(
  flags: A11yFeatureFlags | undefined,
  id: FeatureId,
): boolean {
  return flags?.[id] !== false;
}

function resolveThemeStyle(
  theme: A11yToolbarTheme | undefined,
  accentColor: string | undefined,
  offset: string | undefined,
  launcherSize: string | undefined,
): CSSProperties {
  const accent = theme?.accent ?? accentColor ?? DEFAULT_A11Y_THEME.accent;
  const header = theme?.header ?? accentColor ?? accent;
  const headerFg =
    theme?.headerForeground ?? DEFAULT_A11Y_THEME.headerForeground;
  const icon = theme?.icon ?? accent;
  const focus = theme?.focusRing ?? DEFAULT_A11Y_THEME.focusRing;
  const font = theme?.fontFamily ?? DEFAULT_A11Y_THEME.fontFamily;
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
    fontFamily: font,
  } as CSSProperties;
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
  launcherLabel = "Accessibility tools",
  position = "bottom-right",
  offset,
  launcherSize,
  accentColor,
  theme,
}: A11yToolbarProps) {
  const titleId = useIdSafe("a11y-title");
  const panelId = titleId.replace("a11y-title", "a11y-panel");
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      onOpenChange?.(next);
      if (openProp === undefined) setUncontrolledOpen(next);
    },
    [onOpenChange, openProp],
  );

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
      if (event.key !== storageKey) return;
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
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey]);

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
    if (isSteppedFeature(id)) {
      const next = cycleStep(prefs, id);
      update(next, announceStep(id, next[id] as number));
    } else if (isToggleFeature(id)) {
      const next = toggleFeature(prefs, id);
      update(next, announceToggle(id, next[id]));
    }
  };

  const onReset = () => {
    const next = resetPreferences();
    clearStoredPreferences(storageKey);
    clearA11yPreferences();
    scheduleApplyA11yPreferences(next, {}, 0);
    flushApplyA11yPreferences();
    update(next, ANNOUNCE_RESET);
  };

  const rootStyle: CSSProperties = {
    ...resolveThemeStyle(theme, accentColor, offset, launcherSize),
    ...style,
  };

  return (
    <div
      className={["itzsa-a11y-root", `itzsa-a11y-pos-${position}`, className]
        .filter(Boolean)
        .join(" ")}
      style={rootStyle}
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
            aria-label="Close accessibility tools"
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
          >
            <div className="itzsa-a11y-header">
              <h2 id={titleId} className="itzsa-a11y-title">
                Accessibility Tools
              </h2>
              <div className="itzsa-a11y-header-actions">
                <button
                  type="button"
                  className="itzsa-a11y-icon-btn"
                  aria-label="Reset all settings"
                  title="Reset all settings"
                  onClick={onReset}
                >
                  <IconReset />
                </button>
                <button
                  type="button"
                  className="itzsa-a11y-icon-btn"
                  aria-label="Close"
                  title="Close"
                  onClick={() => setOpen(false)}
                >
                  <IconClose />
                </button>
              </div>
            </div>

            <A11yPanelErrorBoundary>
              <div className="itzsa-a11y-body">
                {sections.map((section) => {
                  const SectionIcon = resolveIcon(section.iconId);
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
                        {section.title}
                      </h3>
                      <div className="itzsa-a11y-grid">
                        {section.features.map((feature) => {
                          const id = feature.id;
                          if (feature.kind === "stepped") {
                            return (
                              <ToolCard
                                key={id}
                                feature={feature}
                                value={prefs[id as SteppedFeatureId] as number}
                                onActivate={() => onActivate(id)}
                              />
                            );
                          }
                          return (
                            <ToolCard
                              key={id}
                              feature={feature}
                              value={prefs[id as ToggleFeatureId] ? 1 : 0}
                              pressed={Boolean(prefs[id as ToggleFeatureId])}
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
