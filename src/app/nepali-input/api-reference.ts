export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export const INPUT_PROPS: PropRow[] = [
  {
    name: "mode",
    type: "'unicode' | 'preeti'",
    default: "'unicode'",
    description: "Keyboard layout for Latin → Devanagari mapping.",
  },
  {
    name: "enabled",
    type: "boolean",
    default: "true",
    description:
      "When false, behaves like a plain <input> (no transliteration).",
  },
  {
    name: "value / defaultValue",
    type: "string",
    description: "Controlled or uncontrolled value (native).",
  },
  {
    name: "onChange",
    type: "(e) => void",
    description:
      "Fires with e.target.value already mapped to Nepali when enabled.",
  },
  {
    name: "className",
    type: "string",
    description: "Merged with base field styles via tailwind-merge.",
  },
  {
    name: "…rest",
    type: "ComponentProps<'input'>",
    description:
      "All native input props are forwarded. Defaults: lang=ne, spellCheck=false, autoComplete=off.",
  },
];

export const TEXTAREA_PROPS: PropRow[] = [
  {
    name: "mode",
    type: "'unicode' | 'preeti'",
    default: "'unicode'",
    description: "Keyboard layout for Latin → Devanagari mapping.",
  },
  {
    name: "enabled",
    type: "boolean",
    default: "true",
    description: "When false, behaves like a plain <textarea>.",
  },
  {
    name: "value / defaultValue",
    type: "string",
    description: "Controlled or uncontrolled value (native).",
  },
  {
    name: "onChange",
    type: "(e) => void",
    description: "Fires with mapped Nepali value when enabled.",
  },
  {
    name: "className",
    type: "string",
    description: "Merged with base textarea styles.",
  },
  {
    name: "…rest",
    type: "ComponentProps<'textarea'>",
    description: "Native textarea props. Defaults: lang=ne, spellCheck=false.",
  },
];

export const HELPER_API: PropRow[] = [
  {
    name: "toNepali(value, mode?)",
    type: "(string, mode?) => string",
    description:
      "Transliterate a full string. Non-ASCII (existing Devanagari) is preserved.",
  },
  {
    name: "mapChar(ch, mode?)",
    type: "(string, mode?) => string",
    description: "Map a single character.",
  },
  {
    name: "mapCaretIndex(value, caret, mode?)",
    type: "(string, number, mode?) => number",
    description:
      "Caret index after mapping (used internally for cursor stability).",
  },
  {
    name: "unicodeMappings / preetiMappings",
    type: "readonly string[]",
    description: "Frozen lookup tables (index = charCode − 32).",
  },
];
