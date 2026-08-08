import {
  PREVIEW_DB_NAME,
  PREVIEW_STORAGE_PREFIX,
  PREVIEW_STORE_NAME,
  type PreviewSession,
  type PreviewStoreKind,
} from "./types";

export type CreatePreviewSessionInput = {
  page: unknown;
  activeLocale: string;
  meta?: Record<string, unknown>;
  store?: PreviewStoreKind;
  /** Optional id; otherwise a short opaque token is minted. */
  id?: string;
};

const memoryStore = new Map<string, PreviewSession>();

const mintId = (): string => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  }
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
};

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

/**
 * Persist a preview session keyed by opaque id.
 * URL must only carry the id — never serialized page JSON.
 */
export const createPreviewSession = async (
  input: CreatePreviewSessionInput,
): Promise<PreviewSession> => {
  const session: PreviewSession = {
    id: input.id ?? mintId(),
    page: input.page,
    activeLocale: input.activeLocale,
    createdAt: Date.now(),
    meta: input.meta,
  };

  const store = input.store ?? "sessionStorage";

  if (store === "memory") {
    memoryStore.set(session.id, session);
    return session;
  }

  if (store === "sessionStorage") {
    if (typeof sessionStorage === "undefined") {
      memoryStore.set(session.id, session);
      return session;
    }
    sessionStorage.setItem(
      `${PREVIEW_STORAGE_PREFIX}${session.id}`,
      JSON.stringify(session),
    );
    return session;
  }

  // indexedDB
  if (typeof indexedDB === "undefined") {
    memoryStore.set(session.id, session);
    return session;
  }
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PREVIEW_STORE_NAME, "readwrite");
    tx.objectStore(PREVIEW_STORE_NAME).put(session);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return session;
};

/** Build a preview URL that only embeds the opaque session id. */
export const buildPreviewUrl = (
  basePath: string,
  sessionId: string,
  paramName = "preview",
): string => {
  const url = new URL(
    basePath,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  url.searchParams.set(paramName, sessionId);
  return `${url.pathname}${url.search}${url.hash}`;
};

export const __memoryPreviewStore = memoryStore;
