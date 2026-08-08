import { __memoryPreviewStore } from "./createPreviewSession";
import {
  PREVIEW_DB_NAME,
  PREVIEW_STORAGE_PREFIX,
  PREVIEW_STORE_NAME,
  type PreviewSession,
  type PreviewStoreKind,
} from "./types";

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(PREVIEW_DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(PREVIEW_STORE_NAME)) {
        db.createObjectStore(PREVIEW_STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

export type LoadPreviewOptions = {
  store?: PreviewStoreKind;
};

export const loadPreviewSession = async (
  id: string,
  options: LoadPreviewOptions = {},
): Promise<PreviewSession | null> => {
  if (!id) return null;
  const store = options.store ?? "sessionStorage";

  const fromMemory = __memoryPreviewStore.get(id);
  if (store === "memory") return fromMemory ?? null;

  if (store === "sessionStorage" || store === undefined) {
    if (typeof sessionStorage !== "undefined") {
      const raw = sessionStorage.getItem(`${PREVIEW_STORAGE_PREFIX}${id}`);
      if (raw) {
        try {
          return JSON.parse(raw) as PreviewSession;
        } catch {
          return null;
        }
      }
    }
    if (fromMemory) return fromMemory;
  }

  if (store === "indexedDB" || store === "sessionStorage") {
    if (typeof indexedDB === "undefined") return fromMemory ?? null;
    try {
      const db = await openDb();
      const session = await new Promise<PreviewSession | null>(
        (resolve, reject) => {
          const tx = db.transaction(PREVIEW_STORE_NAME, "readonly");
          const req = tx.objectStore(PREVIEW_STORE_NAME).get(id);
          req.onsuccess = () => resolve((req.result as PreviewSession) ?? null);
          req.onerror = () => reject(req.error);
        },
      );
      db.close();
      if (session) return session;
    } catch {
      // fall through
    }
  }

  return fromMemory ?? null;
};

/** Extract opaque preview id from a URL — never expects page JSON in the query. */
export const getPreviewIdFromUrl = (
  url: string | URL,
  paramName = "preview",
): string | null => {
  try {
    const u =
      typeof url === "string"
        ? new URL(
            url,
            typeof window !== "undefined"
              ? window.location.origin
              : "http://localhost",
          )
        : url;
    return u.searchParams.get(paramName);
  } catch {
    return null;
  }
};
