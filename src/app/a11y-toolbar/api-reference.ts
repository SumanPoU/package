export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export const TOOLBAR_PROPS: PropRow[] = [
  {
    name: "storageKey",
    type: "string",
    default: '"itzsa-a11y"',
    description:
      "localStorage key for preferences. Locale is stored at {storageKey}:locale when uncontrolled.",
  },
  {
    name: "defaultOpen",
    type: "boolean",
    default: "false",
    description: "Uncontrolled initial open state of the panel.",
  },
  {
    name: "open",
    type: "boolean",
    description: "Controlled open state. Pair with onOpenChange.",
  },
  {
    name: "onOpenChange",
    type: "(open: boolean) => void",
    description: "Called when the panel should open or close.",
  },
  {
    name: "features",
    type: "Partial<Record<FeatureId, boolean>>",
    default: "all on",
    description:
      "Set a feature id to false to hide that control from the panel.",
  },
  {
    name: "hotkey",
    type: "{ altKey?, ctrlKey?, metaKey?, shiftKey?, key } | null",
    default: "{ altKey: true, key: 'a' }",
    description:
      "Panel toggle shortcut. Synced into the shortcuts registry when shortcuts is omitted. Pass null to disable the panel binding.",
  },
  {
    name: "shortcuts",
    type: "A11yShortcutDef[] | false",
    default: "DEFAULT_A11Y_SHORTCUTS",
    description:
      "Full keyboard map (panel + features). false = panel hotkey only. Use mergeA11yShortcuts to override by id. Scalable — add bindings without forking UI.",
  },
  {
    name: "onChange",
    type: "(prefs: A11yPreferences) => void",
    description: "Fires after preference updates (also used for host sync).",
  },
  {
    name: "launcherLabel",
    type: "string",
    default: "locale message",
    description:
      "Accessible name for the floating launcher. Defaults to the active locale’s launcherLabel.",
  },
  {
    name: "className",
    type: "string",
    description: "Extra class on the toolbar root.",
  },
  {
    name: "style",
    type: "CSSProperties",
    description:
      "Inline styles merged onto the toolbar root (after theme vars).",
  },
  {
    name: "accentColor",
    type: "string",
    description: "Deprecated. Prefer theme.accent / theme.launcher.",
  },
];

export const PLACEMENT_PROPS: PropRow[] = [
  {
    name: "position",
    type: "A11yToolbarPosition",
    default: '"bottom-right"',
    description:
      "Launcher placement: bottom-right | bottom-left | top-right | top-left | bottom-center | top-center | middle-left | middle-right.",
  },
  {
    name: "panelAlign",
    type: '"auto" | "left" | "right" | "center"',
    default: '"auto"',
    description:
      "Horizontal panel edge, independent of the launcher. auto follows the icon; left / right / center override.",
  },
  {
    name: "offset",
    type: "string",
    default: '"1.25rem"',
    description: "Gap from the viewport edge (CSS length).",
  },
  {
    name: "launcherSize",
    type: "string",
    default: '"3.5rem"',
    description: "Floating launcher button size.",
  },
  {
    name: "panelMaxHeight",
    type: "string",
    default: "min(40rem, 100dvh - 6rem)",
    description: 'Panel max height, e.g. "32rem" or "70dvh".',
  },
  {
    name: "panelHeight",
    type: "string",
    default: "auto",
    description:
      "Fixed panel height. Still capped by panelMaxHeight; body scrolls inside.",
  },
];

export const THEME_PROPS: PropRow[] = [
  {
    name: "accent",
    type: "string",
    default: '"#1d9e75"',
    description: "Primary accent — icons, steps, pressed borders.",
  },
  {
    name: "header",
    type: "string",
    default: '"#15805f"',
    description:
      "Header background. Default is darker than brand accent so white text clears ~4.9:1.",
  },
  {
    name: "headerForeground",
    type: "string",
    default: '"#ffffff"',
    description:
      "Header title + icon button color. Do not pair white with #1d9e75 (~3.4:1).",
  },
  {
    name: "icon",
    type: "string",
    default: "accent",
    description: "Card / panel icon + step fill.",
  },
  {
    name: "focusRing",
    type: "string",
    default: '"#0b3d34"',
    description:
      "Focus ring for launcher, cards, header controls (non-text ≥3:1 intent).",
  },
  {
    name: "background / card / foreground / muted",
    type: "string",
    description: "Panel shell, feature cards, body text, secondary labels.",
  },
  {
    name: "border / shadow / radius / zIndex",
    type: "string | number",
    description: "Chrome geometry and stacking.",
  },
  {
    name: "fontFamily",
    type: "string",
    description:
      "Force one font stack for all locales. Prefer fontFamilyByLocale when en/ne differ.",
  },
  {
    name: "fontFamilyByLocale",
    type: "Record<string, string>",
    description:
      "Per-locale fonts. Defaults: en → Outfit, ne → Poppins (+ Devanagari fallbacks).",
  },
  {
    name: "launcher / launcherForeground / launcherRing / launcherRadius",
    type: "string",
    description: "Floating launcher fill, glyph, ring, and corner radius.",
  },
  {
    name: "cursor",
    type: "string",
    description:
      'Bigger-cursor CSS value, e.g. url("…") 2 2. Synced onto <html> so it applies page-wide when the preference is on.',
  },
  {
    name: "guideHeight",
    type: "string",
    description: 'Reading-guide band height (e.g. "48px").',
  },
  {
    name: "style (prop)",
    type: "CSSProperties",
    description:
      "Pass any --itzsa-a11y-* custom property via CSS_VAR helpers, or set the same vars on :root in host CSS.",
  },
];

export const WCAG_PRINCIPLES: PropRow[] = [
  {
    name: "Perceivable",
    type: "POUR",
    description:
      "Text size, contrast, color filters, saturation, hide images, highlight links, bigger cursor, reading guide, read aloud — presentation / assist alternatives without removing content.",
  },
  {
    name: "Operable",
    type: "POUR",
    description:
      "Keyboard shortcuts, focus trap, Esc to close, real buttons, pause animations (also respects prefers-reduced-motion).",
  },
  {
    name: "Understandable",
    type: "POUR",
    description:
      "Panel lang={locale} (3.1.2), live-region announcements for level/toggle changes, predictable reset.",
  },
  {
    name: "Robust",
    type: "POUR",
    description:
      "ARIA dialog / toggle patterns (APG), versioned storage schema, FOUC attrs before paint so AT and CSS see the same state.",
  },
];

export const WCAG_CRITERIA: PropRow[] = [
  {
    name: "1.4.3 / 1.4.11 Contrast",
    type: "Level AA",
    description:
      "Default header pair targets ≥4.5:1 text; focus rings target ≥3:1 non-text. Hosts must verify launcher ring on their background.",
  },
  {
    name: "1.4.12 Text spacing",
    type: "Level AA",
    description:
      "Max letter / word / line presets meet WCAG spacing floors (see effect-values.ts).",
  },
  {
    name: "2.1.1 Keyboard",
    type: "Level A",
    description:
      "All controls are buttons; shortcuts skip editable fields; panel closes with Escape.",
  },
  {
    name: "2.2.2 Pause / 2.3.3 Motion",
    type: "Level A / AAA",
    description:
      "Pause Animations kills transitions/animations under the content root; additive with prefers-reduced-motion.",
  },
  {
    name: "2.4.7 Focus Visible",
    type: "Level AA",
    description: "Visible focus ring on launcher, cards, and header controls.",
  },
  {
    name: "3.1.2 Language of Parts",
    type: "Level AA",
    description: "Dialog sets lang to the active locale when i18n is used.",
  },
  {
    name: "4.1.2 Name, Role, Value",
    type: "Level A",
    description:
      "Launcher exposes expanded/controls; toggles use aria-pressed; dialog labelled by title.",
  },
];

export const I18N_PROPS: PropRow[] = [
  {
    name: "locale",
    type: "string",
    description:
      "Controlled locale (sync with Zustand / Redux / next-intl). Host owns persistence when set.",
  },
  {
    name: "defaultLocale",
    type: "string",
    default: '"en"',
    description: "Uncontrolled initial locale.",
  },
  {
    name: "onLocaleChange",
    type: "(locale: string) => void",
    description: "Fires when the user picks a language (and for host sync).",
  },
  {
    name: "messages",
    type: "A11yMessagesPartial",
    description:
      "Deep-partial overrides merged last (on top of the active locale dictionary).",
  },
  {
    name: "locales",
    type: "Record<string, A11yMessagesPartial>",
    description:
      "Extra dictionaries. Built-in en is always available; missing keys fall back to English. Ship NE_MESSAGES for full Nepali.",
  },
  {
    name: "availableLocales",
    type: "string[]",
    default: "en + keys(locales)",
    description:
      "Codes offered in the language switcher. Switcher appears when length > 1.",
  },
];

export const DISPLAY_FEATURES: PropRow[] = [
  {
    name: "textSize",
    type: "stepped (0–3)",
    description:
      "Content zoom (112.5% / 125% / 145%). Uses CSS zoom when supported.",
  },
  {
    name: "textSpacing",
    type: "stepped (0–2)",
    description: "Letter + word spacing. Max meets WCAG 1.4.12 floors.",
  },
  {
    name: "lineHeight",
    type: "stepped (0–2)",
    description: "Line height 1.5 / 1.75 / 2 (all ≥ 1.5).",
  },
  {
    name: "fontSelection",
    type: "stepped (0–2)",
    description: "Default / system UI / readable serif on content.",
  },
  {
    name: "textAlign",
    type: "stepped (0–2)",
    description: "Left / center / right.",
  },
  {
    name: "dyslexiaFriendly",
    type: "toggle",
    description:
      "Spacing-only reading aid (max spacing + line height). No bundled font in v1.",
  },
  {
    name: "highContrast",
    type: "stepped (0–2)",
    description: "Stronger text/UI contrast on content.",
  },
  {
    name: "colorFilter",
    type: "stepped (0–3)",
    description:
      "Grayscale / hue / sepia presentation aids — not clinical CVD tools.",
  },
  {
    name: "saturation",
    type: "stepped (0–2)",
    description: "Full / reduced / none color saturation.",
  },
  {
    name: "hideImages",
    type: "toggle",
    description:
      "Hides photos/media via visibility; keeps labeled icons in controls.",
  },
  {
    name: "highlightLinks",
    type: "toggle",
    description: "Emphasize anchors for low-vision scanning.",
  },
];

export const MOTION_FEATURES: PropRow[] = [
  {
    name: "pauseAnimations",
    type: "toggle",
    description:
      "Stops animation, transition, and scroll-behavior on content. Additive with prefers-reduced-motion.",
  },
  {
    name: "biggerCursor",
    type: "toggle",
    description:
      "32×32 SVG cursor (keyword fallback auto). Applies page-wide immediately — including over the open panel/overlay.",
  },
  {
    name: "readingGuide",
    type: "toggle",
    description: "Horizontal reading band that follows the pointer.",
  },
  {
    name: "readAloud",
    type: "toggle",
    description:
      "Click-to-speak on p/h1–h6/li/blockquote under data-a11y-content. Panel exposes pause/resume/stop + speechRate (0.5–2).",
  },
];

export const BROWSER_API: PropRow[] = [
  {
    name: "mount",
    type: "(options?) => HTMLElement",
    description:
      "Mount the toolbar. Options = A11yToolbar props plus target / contentRoot. React is bundled in the min file.",
  },
  {
    name: "unmount",
    type: "() => void",
    description: "Tear down a previous mount().",
  },
  {
    name: "getA11yFoucScript",
    type: "(storageKey?) => string",
    description: "Inline <head> script string for FOUC prevention.",
  },
  {
    name: "NE_MESSAGES / EN_MESSAGES",
    type: "A11yMessages",
    description:
      "Locale dictionaries for locales: { ne: ItzsaA11yToolbar.NE_MESSAGES }.",
  },
  {
    name: "DEFAULT_A11Y_SHORTCUTS / mergeA11yShortcuts",
    type: "registry helpers",
    description:
      "Same shortcut map as the React API — pass shortcuts: ItzsaA11yToolbar.mergeA11yShortcuts(...) in mount().",
  },
  {
    name: "options.target",
    type: "string | HTMLElement",
    description:
      "Mount node or selector. Default: append a host div to document.body.",
  },
  {
    name: "options.contentRoot",
    type: "true | string | HTMLElement",
    description:
      "Ensure data-a11y-content exists. true → document.body; or pass a selector/element.",
  },
];

export const HEADLESS_API: PropRow[] = [
  {
    name: "getA11yFoucScript",
    type: "(storageKey?) => string",
    description:
      "Inline <head> script: restores prefs + data-a11y-locale before paint. Import from /headless in RSC.",
  },
  {
    name: "applyA11yPreferences",
    type: "(prefs, options?) => void",
    description:
      "Apply attrs + CSS vars to the root (debounced helpers also exported).",
  },
  {
    name: "NE_MESSAGES",
    type: "A11yMessages",
    description:
      "Complete Nepali dictionary for locales={{ ne: NE_MESSAGES }}.",
  },
  {
    name: "resolveMessages",
    type: "(options) => A11yMessages",
    description: "Merge en → locales[active] → messages. Headless-safe.",
  },
  {
    name: "EN_MESSAGES",
    type: "A11yMessages",
    description: "Built-in English dictionary (merge base).",
  },
];

export const BEHAVIOR_ROWS: PropRow[] = [
  {
    name: "Dialog",
    type: "pattern",
    description:
      "role=dialog, aria-modal, labelled title, focus trap, Esc to close, restore focus.",
  },
  {
    name: "Launcher",
    type: "pattern",
    description:
      "aria-haspopup, aria-expanded, aria-controls, accessible name.",
  },
  {
    name: "Cards",
    type: "pattern",
    description:
      "Real <button>s; toggles use aria-pressed; stepped levels announced via aria-live.",
  },
  {
    name: "Language",
    type: "pattern",
    description:
      "Panel sets lang={locale} (WCAG 3.1.2). Switcher has a visually hidden label; change announces in the new locale.",
  },
  {
    name: "Scope",
    type: "architecture",
    description:
      "Effects apply under [data-a11y-content] only. Mount toolbar outside that root.",
  },
  {
    name: "Disclaimer",
    type: "product",
    description:
      "WCAG-grounded chrome — does not make an inaccessible host site WCAG-compliant.",
  },
];
