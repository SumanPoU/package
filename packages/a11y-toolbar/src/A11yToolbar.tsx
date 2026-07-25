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
import { applyA11yPreferences, clearA11yPreferences } from "./apply";
import { FEATURE_SECTIONS, STEP_COUNT } from "./defaults";
import { useFocusTrap, useHotkey, useIdSafe } from "./hooks";
import { IconAccessibility, IconClose, IconReset } from "./icons";
import {
  cycleStep,
  isPreferencesEqual,
  resetPreferences,
  toggleFeature,
} from "./preferences";
import { ReadingGuide } from "./ReadingGuide";
import { isSteppedFeature, isToggleFeature } from "./registry";
import {
  clearStoredPreferences,
  getStoredPreferences,
  normalizePreferences,
  setStoredPreferences,
} from "./storage";
import { ToolCard } from "./ToolCard";
import type {
  A11yFeatureFlags,
  A11yHotkey,
  A11yPreferences,
  A11yToolbarPosition,
  FeatureId,
  SteppedFeatureId,
  ToggleFeatureId,
} from "./types";
import {
  A11Y_TOOLBAR_ATTR,
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
  /** Corner placement (default bottom-right). */
  position?: A11yToolbarPosition;
  /** Brand accent for header (launcher uses the ISA mark colors). */
  accentColor?: string;
};

function isEnabled(
  flags: A11yFeatureFlags | undefined,
  id: FeatureId,
): boolean {
  return flags?.[id] !== false;
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
  accentColor,
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
    applyA11yPreferences(prefs);
    setStoredPreferences(prefs, storageKey);
    onChange?.(prefs);
  }, [prefs, storageKey, onChange]);

  // Keep open tabs in sync when preferences change elsewhere.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      const next =
        event.newValue == null
          ? resetPreferences()
          : normalizePreferences(
              (() => {
                try {
                  return JSON.parse(event.newValue) as unknown;
                } catch {
                  return null;
                }
              })(),
            );
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

  const sections = useMemo(() => {
    return FEATURE_SECTIONS.map((section) => ({
      ...section,
      features: section.features.filter((id) => isEnabled(features, id)),
    })).filter((s) => s.features.length > 0);
  }, [features]);

  const active = hasActiveA11yPreferences(prefs);

  const update = useCallback((next: A11yPreferences, message: string) => {
    setPrefs(next);
    setAnnouncement(message);
  }, []);

  const onStep = (id: SteppedFeatureId) => {
    const next = cycleStep(prefs, id);
    update(next, announceStep(id, next[id] as number));
  };

  const onToggle = (id: ToggleFeatureId) => {
    const next = toggleFeature(prefs, id);
    update(next, announceToggle(id, next[id]));
  };

  const onActivate = (id: FeatureId) => {
    if (isSteppedFeature(id)) onStep(id);
    else if (isToggleFeature(id)) onToggle(id);
  };

  const onReset = () => {
    const next = resetPreferences();
    clearStoredPreferences(storageKey);
    clearA11yPreferences();
    applyA11yPreferences(next);
    update(next, ANNOUNCE_RESET);
  };

  const rootStyle: CSSProperties = {
    ...style,
    ...(accentColor
      ? ({
          ["--a11y-toolbar-header" as string]: accentColor,
          ["--a11y-toolbar-accent" as string]: accentColor,
        } as CSSProperties)
      : null),
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
        <IconAccessibility />
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

            <div className="itzsa-a11y-body">
              {sections.map((section) => (
                <section
                  key={section.id}
                  className="itzsa-a11y-section"
                  aria-labelledby={`${panelId}-${section.id}`}
                >
                  <h3
                    id={`${panelId}-${section.id}`}
                    className="itzsa-a11y-section-title"
                  >
                    {section.title}
                  </h3>
                  <div className="itzsa-a11y-grid">
                    {section.features.map((id) =>
                      isSteppedFeature(id) ? (
                        <ToolCard
                          key={id}
                          feature={id}
                          kind="step"
                          value={prefs[id] as number}
                          steps={STEP_COUNT[id]}
                          onActivate={() => onActivate(id)}
                        />
                      ) : (
                        <ToolCard
                          key={id}
                          feature={id}
                          kind="toggle"
                          value={prefs[id] ? 1 : 0}
                          pressed={Boolean(prefs[id])}
                          onActivate={() => onActivate(id)}
                        />
                      ),
                    )}
                  </div>
                </section>
              ))}
            </div>

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
