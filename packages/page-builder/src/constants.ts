/** Current Page JSON schema version for load → migrate → parse. */
export const PAGE_SCHEMA_VERSION = 1 as const;

/** Core primitive type ids reserved for engine blocks (must match registerPrimitives). */
export const CORE_PRIMITIVE_TYPES = [
  "box",
  "container",
  "flex",
  "grid",
  "heading",
  "text",
  "list",
  "badge",
  "icon",
  "icon-list",
  "image",
  "gallery",
  "carousel",
  "video",
  "audio",
  "button",
  "divider",
  "spacer",
  "code",
  "quote",
  "alert",
  "tabs",
  "accordion",
  "toggle",
  "social-icons",
  "anchor",
  "read-more",
  "repeater",
  "map",
  "embed",
  "html",
] as const;

export type CorePrimitiveType = (typeof CORE_PRIMITIVE_TYPES)[number];
