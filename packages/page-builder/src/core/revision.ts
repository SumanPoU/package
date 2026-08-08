import type { Block } from "./types";

export type RevisionMatch =
  | { ok: true }
  | {
      ok: false;
      conflict: true;
      expectedRevision: string | undefined;
      currentRevision: string | undefined;
    };

/**
 * ADR-16 helper — compare in-memory page revision to the revision the host
 * expects for this save. Engine does not invent revisions.
 */
export const assertRevisionMatch = (
  page: { revision?: string },
  expectedRevision: string | undefined,
): RevisionMatch => {
  const current = page.revision;
  if (expectedRevision === undefined && current === undefined) {
    return { ok: true };
  }
  if (current === expectedRevision) {
    return { ok: true };
  }
  return {
    ok: false,
    conflict: true,
    expectedRevision,
    currentRevision: current,
  };
};

export type SaveConflictResult = {
  conflict: true;
  current: Block | PageLike | unknown;
};

type PageLike = { revision?: string; id?: string };
