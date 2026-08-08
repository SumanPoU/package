import type { Metadata } from '@/validations/common';
import type { Block } from '../types';

const PREVIEW_KEY_PREFIX = 'pb-preview:';

/** In-memory hold so React Strict Mode remounts still work after sessionStorage flush. */
const memoryCache = new Map<string, PreviewPayload>();

export type PreviewPayload = {
  blocks: Block[];
  metadata: Metadata | null;
  title: string;
  description: string;
};

/** Removes only temporary page-builder preview keys — never other session data. */
export function flushPreviewPayloads(exceptKey?: string): void {
  const keysToRemove: string[] = [];

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key || !key.startsWith(PREVIEW_KEY_PREFIX)) continue;
    if (exceptKey && key === exceptKey) continue;
    keysToRemove.push(key);
  }

  for (const key of keysToRemove) {
    sessionStorage.removeItem(key);
  }
}

export function clearPreviewPayload(key: string | undefined): void {
  if (!key || !key.startsWith(PREVIEW_KEY_PREFIX)) return;
  sessionStorage.removeItem(key);
}

export function storePreviewPayload(slug: string, payload: PreviewPayload): string {
  const key = `${PREVIEW_KEY_PREFIX}${slug}:${Date.now()}`;
  flushPreviewPayloads();
  memoryCache.clear();
  sessionStorage.setItem(key, JSON.stringify(payload));
  return key;
}

export function loadPreviewPayload(key: string | undefined): PreviewPayload | null {
  if (!key || !key.startsWith(PREVIEW_KEY_PREFIX)) return null;

  const cached = memoryCache.get(key);
  if (cached) return cached;

  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;

    const { blocks, metadata, title, description } = parsed as Record<string, unknown>;
    if (!Array.isArray(blocks)) return null;

    const payload: PreviewPayload = {
      blocks: blocks as Block[],
      metadata: (metadata as Metadata | null) ?? null,
      title: typeof title === 'string' ? title : 'Untitled page',
      description: typeof description === 'string' ? description : '',
    };

    // Keep in memory for this tab session; flush storage so refresh / leftover keys don't linger.
    memoryCache.set(key, payload);
    sessionStorage.removeItem(key);
    return payload;
  } catch {
    return null;
  }
}
