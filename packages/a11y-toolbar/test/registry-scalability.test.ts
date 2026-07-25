import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyA11yPreferences,
  cancelScheduledApplyA11yPreferences,
  flushApplyA11yPreferences,
  scheduleApplyA11yPreferences,
} from "../src/apply";
import { CSS_VAR } from "../src/css-vars";
import { DEFAULT_PREFERENCES } from "../src/defaults";
import { FEATURE_ICONS } from "../src/icons";
import { resetPreferences } from "../src/preferences";
import {
  A11Y_FEATURE_REGISTRY,
  getFeatureDef,
  isSteppedFeature,
} from "../src/registry";
import { migrate, normalizePreferences } from "../src/storage";
import { PREFERENCES_SCHEMA_VERSION } from "../src/types";

describe("A11Y_FEATURE_REGISTRY completeness", () => {
  it("every feature has title, description, iconId, apply, ariaAnnounce", () => {
    for (const feature of A11Y_FEATURE_REGISTRY) {
      expect(feature.labels.title.length).toBeGreaterThan(0);
      expect(feature.labels.description.length).toBeGreaterThan(0);
      expect(feature.iconId).toBeTruthy();
      expect(typeof feature.apply).toBe("function");
      expect(typeof feature.ariaAnnounce).toBe("function");
      if (feature.kind === "stepped") {
        expect(feature.levels).toBeGreaterThan(1);
        expect(feature.ariaAnnounce(0)).toMatch(/1 of/);
      } else {
        expect(feature.ariaAnnounce(true)).toMatch(/: on$/);
        expect(feature.ariaAnnounce(false)).toMatch(/: off$/);
      }
    }
  });

  it("every FeatureId has an icon map entry", () => {
    for (const feature of A11Y_FEATURE_REGISTRY) {
      expect(FEATURE_ICONS[feature.id]).toBeTypeOf("function");
    }
  });

  it("getFeatureDef round-trips registry ids", () => {
    for (const feature of A11Y_FEATURE_REGISTRY) {
      expect(getFeatureDef(feature.id)?.id).toBe(feature.id);
      if (feature.kind === "stepped") {
        expect(isSteppedFeature(feature.id)).toBe(true);
      }
    }
  });
});

describe("migrate()", () => {
  it("wraps legacy unversioned prefs as schemaVersion 1", () => {
    const doc = migrate({ textSize: 2, hideImages: true });
    expect(doc.schemaVersion).toBe(PREFERENCES_SCHEMA_VERSION);
    expect(doc.values.textSize).toBe(2);
    expect(doc.values.hideImages).toBe(true);
  });

  it("passes through versioned documents", () => {
    const doc = migrate({
      schemaVersion: 1,
      values: { ...DEFAULT_PREFERENCES, readingGuide: true },
    });
    expect(doc.schemaVersion).toBe(1);
    expect(doc.values.readingGuide).toBe(true);
  });

  it("falls back to defaults for corrupt input", () => {
    expect(migrate(null).values).toEqual(DEFAULT_PREFERENCES);
    expect(migrate("nope").values).toEqual(DEFAULT_PREFERENCES);
    expect(migrate({ schemaVersion: 1, values: "bad" }).values).toEqual(
      DEFAULT_PREFERENCES,
    );
  });

  it("normalizePreferences still works on bare values", () => {
    expect(normalizePreferences({ textSize: 99 }).textSize).toBe(3);
  });
});

describe("scheduleApplyA11yPreferences debounce", () => {
  let attrs: Map<string, string>;
  let props: Map<string, string>;

  beforeEach(() => {
    vi.useFakeTimers();
    cancelScheduledApplyA11yPreferences();
    attrs = new Map();
    props = new Map();
    const root = {
      setAttribute: (k: string, v: string) => {
        attrs.set(k, v);
      },
      getAttribute: (k: string) => attrs.get(k) ?? null,
      removeAttribute: (k: string) => {
        attrs.delete(k);
      },
      style: {
        setProperty: (k: string, v: string) => {
          props.set(k, v);
        },
        getPropertyValue: (k: string) => props.get(k) ?? "",
        removeProperty: (k: string) => {
          props.delete(k);
        },
      },
    };
    vi.stubGlobal("document", {
      documentElement: root,
    });
    vi.stubGlobal("CSS", {
      supports: () => true,
    });
  });

  afterEach(() => {
    cancelScheduledApplyA11yPreferences();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("defers DOM writes until trailing edge (~50ms)", () => {
    scheduleApplyA11yPreferences({ ...resetPreferences(), textSize: 2 });
    expect(attrs.get("data-a11y-text-size")).toBeUndefined();
    vi.advanceTimersByTime(49);
    expect(attrs.get("data-a11y-text-size")).toBeUndefined();
    vi.advanceTimersByTime(1);
    expect(attrs.get("data-a11y-text-size")).toBe("2");
    expect(props.get(CSS_VAR.fontScale)).toBe("1.25");
  });

  it("coalesces rapid schedules into one write", () => {
    scheduleApplyA11yPreferences({ ...resetPreferences(), textSize: 1 });
    scheduleApplyA11yPreferences({ ...resetPreferences(), textSize: 2 });
    scheduleApplyA11yPreferences({ ...resetPreferences(), textSize: 3 });
    vi.advanceTimersByTime(50);
    expect(attrs.get("data-a11y-text-size")).toBe("3");
  });

  it("flushApplyA11yPreferences writes immediately", () => {
    scheduleApplyA11yPreferences({ ...resetPreferences(), textSize: 1 });
    flushApplyA11yPreferences();
    expect(attrs.get("data-a11y-text-size")).toBe("1");
  });

  it("applyA11yPreferences remains synchronous", () => {
    applyA11yPreferences({ ...resetPreferences(), highContrast: 2 });
    expect(attrs.get("data-a11y-contrast")).toBe("2");
  });
});
