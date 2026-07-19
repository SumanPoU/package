export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export const GEO_SELECT_PROPS: PropRow[] = [
  {
    name: "level",
    type: '"province" | "district" | "local" | "ward"',
    description: "Which administrative level to list.",
  },
  {
    name: "value",
    type: "number | null",
    default: "null",
    description: "Selected entity id. For wards, use encodeWardId(localId, n).",
  },
  {
    name: "onChange",
    type: "(id: number | null) => void",
    description: "Called when the selection changes or is cleared.",
  },
  {
    name: "provinceId",
    type: "number | null | undefined",
    description:
      "Scope districts. null = wait for parent; omit/undefined = list all.",
  },
  {
    name: "districtId",
    type: "number | null | undefined",
    description:
      "Scope local levels. null = wait for parent; omit = list all.",
  },
  {
    name: "localId",
    type: "number | null | undefined",
    description: "Scope wards. null = wait for local; required for ward level.",
  },
  {
    name: "typeKeys",
    type: "LocalLevelTypeKey[]",
    description:
      "Filter locals: metropolitan | sub_metropolitan | municipality | rural_municipality.",
  },
  {
    name: "label",
    type: "string",
    description: "Visible field label above the trigger.",
  },
  {
    name: "locale",
    type: '"en" | "ne"',
    default: '"en"',
    description: "English (Outfit) or Nepali (Devanagari) labels.",
  },
  {
    name: "placeholder",
    type: "string",
    description: "Trigger placeholder when nothing is selected.",
  },
  {
    name: "vars",
    type: "NepalGeoVars",
    description: "CSS variable overrides (accent, border, radius, font, …).",
  },
  {
    name: "classNames",
    type: "NepalGeoClassNames",
    description: "Slot class names: root, trigger, label, popover, option, …",
  },
  {
    name: "clearable",
    type: "boolean",
    default: "true",
    description: "Show Clear in the popover when a value is set.",
  },
  {
    name: "showLocalType",
    type: "boolean",
    default: "true",
    description: "Show local-level type as option meta (local level only).",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Disable the control (also when waiting on a parent).",
  },
];

export const LOCATION_SELECT_PROPS: PropRow[] = [
  {
    name: "value",
    type: "NepalLocationValue",
    description:
      "{ provinceId?, districtId?, localId?, wardId?, wardNumber? }",
  },
  {
    name: "defaultValue",
    type: "NepalLocationValue",
    description: "Uncontrolled initial value.",
  },
  {
    name: "onChange",
    type: "(value: NepalLocationValue) => void",
    description: "Fires on any step change; clearing a parent clears children.",
  },
  {
    name: "levels",
    type: 'GeoLevel[]',
    default: '["province","district","local","ward"]',
    description: "Which steps to show, in order.",
  },
  {
    name: "typeKeys",
    type: "LocalLevelTypeKey[]",
    description: "Filter the local-level step by type keys.",
  },
  {
    name: "labels",
    type: "Partial<Record<GeoLevel, string>>",
    description: "Override the label above each field.",
  },
  {
    name: "placeholders",
    type: "Partial<Record<GeoLevel, string>>",
    description: "Per-level placeholder strings.",
  },
  {
    name: "locale",
    type: '"en" | "ne"',
    default: '"en"',
    description: "Locale for all cascade fields.",
  },
  {
    name: "orientation",
    type: '"vertical" | "horizontal"',
    default: '"vertical"',
    description: "Stack fields or row layout from ~720px up.",
  },
  {
    name: "vars / classNames",
    type: "NepalGeoVars / NepalGeoClassNames",
    description: "Shared styling applied to each field in the cascade.",
  },
  {
    name: "clearable / disabled / showLocalType",
    type: "boolean",
    description: "Forwarded to each NepalGeoSelect in the cascade.",
  },
];

export const DATA_HELPER_ROWS: PropRow[] = [
  {
    name: "getProvinces / getDistricts / getLocalLevels",
    type: "() => readonly T[]",
    description: "List entities; districts/locals accept an optional parent id.",
  },
  {
    name: "getLocalLevels(id, { typeKeys })",
    type: "filter",
    description: "Filter by metropolitan, municipality, rural, etc.",
  },
  {
    name: "getMetropolitanCities",
    type: "() => LocalLevel[]",
    description: "Locals with type key metropolitan.",
  },
  {
    name: "getSubMetropolitanCities",
    type: "() => LocalLevel[]",
    description: "Locals with type key sub_metropolitan.",
  },
  {
    name: "getMunicipalities / getRuralMunicipalities",
    type: "() => LocalLevel[]",
    description: "Urban municipality and rural municipality helpers.",
  },
  {
    name: "getWards(localId)",
    type: "() => Ward[]",
    description: "Expand ward count into Ward 1…N for a local level.",
  },
  {
    name: "encodeWardId / decodeWardId",
    type: "number helpers",
    description: "Unique ward id = localId * 1000 + wardNumber.",
  },
  {
    name: "resolveLocalHierarchy",
    type: "(localId, wardNumber?) => …",
    description: "Province + district + local + type (+ optional ward).",
  },
];
