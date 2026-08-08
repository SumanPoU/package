/** Current Page JSON schema version for load → migrate → parse. */
export const PAGE_SCHEMA_VERSION = 1 as const;

/** Core primitive type ids reserved for engine blocks (Phase 2+). */
export const CORE_PRIMITIVE_TYPES = [
  "box",
  "container",
  "flex",
  "grid",
  "heading",
  "text",
  "image",
  "button",
  "divider",
  "spacer",
  "repeater",
] as const;

export type CorePrimitiveType = (typeof CORE_PRIMITIVE_TYPES)[number];
