import type { A11yMessages } from "./types";

/** Complete Nepali (ne) dictionary — no English fallbacks. */
export const NE_MESSAGES: A11yMessages = {
  locale: "ne",
  localeName: "नेपाली",
  panelTitle: "पहुँच उपकरणहरू",
  launcherLabel: "पहुँच उपकरणहरू",
  closeOverlay: "पहुँच उपकरणहरू बन्द गर्नुहोस्",
  resetAll: "सबै सेटिङ रिसेट गर्नुहोस्",
  close: "बन्द गर्नुहोस्",
  language: "भाषा",
  languageChanged: "भाषा परिवर्तन भयो",
  resetAnnouncement: "प्राथमिकताहरू रिसेट भए",
  panelError: "यो नियन्त्रण लोड गर्दा समस्या आयो। प्यानल बन्द गरेर फेरि खोल्नुहोस्।",
  on: "चालु",
  off: "बन्द",
  levelFallback: "स्तर {n}",
  announceStep: "{title}: {name} ({current} मध्ये {total})",
  sections: {
    display: "प्रदर्शन",
    "motion-assist": "गति र सहयोग",
  },
  features: {
    textSize: {
      title: "अक्षर आकार",
      description: "पढ्ने आकार मिलाउनुहोस्",
    },
    textSpacing: {
      title: "अक्षर दूरी",
      description: "अक्षर र शब्द बीचको दूरी",
    },
    lineHeight: {
      title: "लाइन उचाइ",
      description: "लाइन बीचको खाली ठाउँ",
    },
    fontSelection: {
      title: "फन्ट चयन",
      description: "अक्षर शैली परिवर्तन गर्नुहोस्",
    },
    textAlign: {
      title: "पाठ अलाइन",
      description: "बायाँ, केन्द्र वा दायाँ",
    },
    dyslexiaFriendly: {
      title: "डिस्लेक्सिया मैत्री",
      description: "पढाइका लागि अधिकतम दूरी",
    },
    highContrast: {
      title: "उच्च कन्ट्रास्ट",
      description: "बलियो पाठ कन्ट्रास्ट",
    },
    colorFilter: {
      title: "रङ फिल्टर",
      description: "ग्रेस्केल, ह्यू वा सेपिया",
    },
    saturation: {
      title: "स्याचुरेसन",
      description: "रङ घटाउनुहोस् वा हटाउनुहोस्",
    },
    hideImages: {
      title: "तस्बिर लुकाउनुहोस्",
      description: "फोटो र मिडिया लुकाउनुहोस्",
    },
    highlightLinks: {
      title: "लिङ्क हाइलाइट",
      description: "क्लिक गर्न मिल्ने लिङ्क जोड दिनुहोस्",
    },
    pauseAnimations: {
      title: "एनिमेसन रोक्नुहोस्",
      description: "गति र ट्रान्जिसन रोक्नुहोस्",
    },
    biggerCursor: {
      title: "ठूलो कर्सर",
      description: "पोइन्टर ठूलो बनाउनुहोस्",
    },
    readingGuide: {
      title: "रिडिङ गाइड",
      description: "पढाइसँगै जाने ब्यान्ड",
    },
  },
  levels: {
    textSize: ["डिफल्ट", "मध्यम", "ठूलो", "धेरै ठूलो"],
    highContrast: ["बन्द", "नरम", "अधिकतम"],
    textAlign: ["बायाँ", "केन्द्र", "दायाँ"],
    colorFilter: ["बन्द", "ग्रेस्केल", "ह्यू शिफ्ट", "सेपिया"],
    textSpacing: ["डिफल्ट", "आरामदायी", "अधिकतम"],
    lineHeight: ["डिफल्ट", "आरामदायी", "अधिकतम"],
    fontSelection: ["डिफल्ट", "सिस्टम UI", "सेरिफ"],
    saturation: ["पूर्ण", "घटेको", "कुनै होइन"],
  },
};

/**
 * @deprecated Use `NE_MESSAGES` — kept as an alias for existing imports.
 */
export const NE_MESSAGES_DEMO: A11yMessages = NE_MESSAGES;
