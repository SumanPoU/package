import { assertRevisionMatch, type Page } from "@itzsa/page-builder";

const draftKey = (pageId: string) => `pb-draft:v1:${pageId}`;

export type DraftSaveResult =
  | { ok: true; page: Page }
  | {
      ok: false;
      conflict: true;
      current: Page;
      expectedRevision: string | undefined;
      currentRevision: string | undefined;
    }
  | { ok: false; error: string };

const readStore = (pageId: string): Page | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(draftKey(pageId));
    if (!raw) return null;
    return JSON.parse(raw) as Page;
  } catch {
    return null;
  }
};

const writeStore = (page: Page): void => {
  sessionStorage.setItem(draftKey(page.id), JSON.stringify(page));
};

export const loadDraftPage = (pageId: string): Page | null => readStore(pageId);

/**
 * ADR-16 host save — compare expectedRevision to stored draft, then persist.
 * Host assigns the next revision on success (engine never invents revisions).
 */
export const saveDraftPage = (
  page: Page,
  opts: { expectedRevision?: string; overwrite?: boolean } = {},
): DraftSaveResult => {
  if (typeof window === "undefined") {
    return { ok: false, error: "Save requires a browser environment." };
  }

  const stored = readStore(page.id);
  const expected = opts.expectedRevision ?? page.revision;

  if (stored && !opts.overwrite) {
    const match = assertRevisionMatch(stored, expected);
    if (!match.ok) {
      return {
        ok: false,
        conflict: true,
        current: stored,
        expectedRevision: match.expectedRevision,
        currentRevision: match.currentRevision,
      };
    }
  }

  const nextRevision = String(
    Number(
      (opts.overwrite ? stored?.revision : expected) ?? page.revision ?? "0",
    ) + 1,
  );
  const next: Page = { ...page, revision: nextRevision };
  try {
    writeStore(next);
    return { ok: true, page: next };
  } catch {
    return {
      ok: false,
      error: "Could not write draft (storage full or blocked).",
    };
  }
};
