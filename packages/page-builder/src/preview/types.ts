export type PreviewSession = {
  id: string;
  page: unknown;
  activeLocale: string;
  createdAt: number;
  /** Opaque metadata — never put full page JSON in the URL. */
  meta?: Record<string, unknown>;
};

export type PreviewStoreKind = "sessionStorage" | "indexedDB" | "memory";

export const PREVIEW_STORAGE_PREFIX = "pb-preview:";
export const PREVIEW_DB_NAME = "itzsa-page-builder-preview";
export const PREVIEW_STORE_NAME = "sessions";
