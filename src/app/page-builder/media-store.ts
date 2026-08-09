/**
 * In-memory media store for the create demo CDN path.
 * ponytail: ceiling = process memory / lost on cold start; upgrade = Blob/S3.
 */
export type StoredMedia = {
  id: string;
  contentType: string;
  bytes: Buffer;
  createdAt: number;
};

const g = globalThis as typeof globalThis & {
  __pbMediaStore?: Map<string, StoredMedia>;
};

const store = (): Map<string, StoredMedia> => {
  if (!g.__pbMediaStore) g.__pbMediaStore = new Map();
  return g.__pbMediaStore;
};

export const putMedia = (
  contentType: string,
  bytes: Buffer,
): StoredMedia => {
  const id = `m_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const row: StoredMedia = {
    id,
    contentType,
    bytes,
    createdAt: Date.now(),
  };
  store().set(id, row);
  return row;
};

export const getMedia = (id: string): StoredMedia | undefined =>
  store().get(id);
