import { useCallback, useState } from "react";

import type { Page } from "../../core/types";

export type UseBlockHistoryOptions = {
  page: Page;
  onChange: (page: Page) => void;
  capacity?: number;
};

export type UseBlockHistoryResult = {
  push: (next: Page) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (page: Page) => void;
};

/**
 * Undo/redo stack for page mutations. Host still owns the live `page` via onChange.
 */
export const useBlockHistory = ({
  page,
  onChange,
  capacity = 100,
}: UseBlockHistoryOptions): UseBlockHistoryResult => {
  const [past, setPast] = useState<Page[]>([]);
  const [future, setFuture] = useState<Page[]>([]);

  const push = useCallback(
    (next: Page) => {
      setPast((p) => {
        const stacked = [...p, page];
        return stacked.length > capacity
          ? stacked.slice(stacked.length - capacity)
          : stacked;
      });
      setFuture([]);
      onChange(next);
    },
    [capacity, onChange, page],
  );

  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      const previous = p[p.length - 1]!;
      setFuture((f) => [page, ...f]);
      onChange(previous);
      return p.slice(0, -1);
    });
  }, [onChange, page]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0]!;
      setPast((p) => [...p, page]);
      onChange(next);
      return f.slice(1);
    });
  }, [onChange, page]);

  const reset = useCallback(
    (next: Page) => {
      setPast([]);
      setFuture([]);
      onChange(next);
    },
    [onChange],
  );

  return {
    push,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    reset,
  };
};
