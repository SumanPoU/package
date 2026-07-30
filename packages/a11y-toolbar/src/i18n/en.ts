import type { A11yMessages } from "./types";

/** Built-in English dictionary — default + merge base for every locale. */
export const EN_MESSAGES: A11yMessages = {
  locale: "en",
  localeName: "English",
  panelTitle: "Accessibility Tools",
  launcherLabel: "Accessibility tools",
  closeOverlay: "Close accessibility tools",
  resetAll: "Reset all settings",
  close: "Close",
  language: "Language",
  languageChanged: "Language changed",
  resetAnnouncement: "Preferences reset",
  panelError:
    "Something went wrong loading this control. Try closing and reopening the panel.",
  on: "on",
  off: "off",
  levelFallback: "Level {n}",
  readAloudPause: "Pause",
  readAloudResume: "Resume",
  readAloudStop: "Stop",
  readAloudRate: "Speech rate",
  readAloudUnsupported: "Text-to-speech is not available in this browser.",
  announceStep: "{title}: {name} ({current} of {total})",
  sections: {
    display: "Display",
    "motion-assist": "Motion & assist",
  },
  features: {
    textSize: {
      title: "Text Size",
      description: "Adjust reading size",
    },
    textSpacing: {
      title: "Text Spacing",
      description: "Letter and word spacing",
    },
    lineHeight: {
      title: "Line Height",
      description: "Space between lines",
    },
    fontSelection: {
      title: "Font Selection",
      description: "Switch typeface style",
    },
    textAlign: {
      title: "Text Align",
      description: "Left, center, or right",
    },
    dyslexiaFriendly: {
      title: "Dyslexia Friendly",
      description: "Max spacing for reading",
    },
    highContrast: {
      title: "High Contrast",
      description: "Stronger text contrast",
    },
    colorFilter: {
      title: "Color Filter",
      description: "Grayscale, hue, or sepia",
    },
    saturation: {
      title: "Saturation",
      description: "Reduce or remove color",
    },
    hideImages: {
      title: "Hide Images",
      description: "Hide photos and media",
    },
    highlightLinks: {
      title: "Highlight Links",
      description: "Emphasize clickable links",
    },
    pauseAnimations: {
      title: "Pause Animations",
      description: "Stop motion and transitions",
    },
    biggerCursor: {
      title: "Bigger Cursor",
      description: "Enlarge the pointer",
    },
    readingGuide: {
      title: "Reading Guide",
      description: "Follow-along reading band",
    },
    readAloud: {
      title: "Read Aloud",
      description: "Click text to hear it spoken",
    },
  },
  levels: {
    textSize: ["Default", "Medium", "Large", "Extra large"],
    highContrast: ["Off", "Soft", "Maximum"],
    textAlign: ["Left", "Center", "Right"],
    colorFilter: ["Off", "Grayscale", "Hue shift", "Sepia"],
    textSpacing: ["Default", "Relaxed", "Maximum"],
    lineHeight: ["Default", "Relaxed", "Maximum"],
    fontSelection: ["Default", "System UI", "Serif"],
    saturation: ["Full", "Reduced", "None"],
  },
};
