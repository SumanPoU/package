"use client";

import { useCallback, useState } from "react";

export type UseTableSelectionOptions = {
  /** Controlled selected row ids. When provided, the hook becomes controlled. */
  selectedIds?: string[];
  /** Default selection for uncontrolled usage. */
  defaultSelectedIds?: string[];
  /** Called whenever selection changes. */
  onSelectionChange?: (selectedIds: string[]) => void;
};

export type UseTableSelectionReturn = {
  selectedIds: string[];
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clear: () => void;
  isAllSelected: (ids: string[]) => boolean;
  isSomeSelected: (ids: string[]) => boolean;
};

/**
 * Controllable row-selection state for DataTable.
 * Supports both controlled (`selectedIds`) and uncontrolled (`defaultSelectedIds`) modes.
 */
export function useTableSelection(
  options: UseTableSelectionOptions = {},
): UseTableSelectionReturn {
  const {
    selectedIds: controlledSelectedIds,
    defaultSelectedIds = [],
    onSelectionChange,
  } = options;

  const [uncontrolledSelectedIds, setUncontrolledSelectedIds] =
    useState<string[]>(defaultSelectedIds);

  const isControlled = controlledSelectedIds !== undefined;
  const selectedIds = isControlled
    ? controlledSelectedIds
    : uncontrolledSelectedIds;

  const setSelectedIds = useCallback(
    (next: string[] | ((prev: string[]) => string[])) => {
      const resolved =
        typeof next === "function" ? next(selectedIds) : next;
      if (!isControlled) {
        setUncontrolledSelectedIds(resolved);
      }
      onSelectionChange?.(resolved);
    },
    [isControlled, onSelectionChange, selectedIds],
  );

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds],
  );

  const toggle = useCallback(
    (id: string) => {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
      );
    },
    [setSelectedIds],
  );

  const selectAll = useCallback(
    (ids: string[]) => {
      setSelectedIds(ids);
    },
    [setSelectedIds],
  );

  const clear = useCallback(() => {
    setSelectedIds([]);
  }, [setSelectedIds]);

  const isAllSelected = useCallback(
    (ids: string[]) =>
      ids.length > 0 && ids.every((id) => selectedIds.includes(id)),
    [selectedIds],
  );

  const isSomeSelected = useCallback(
    (ids: string[]) =>
      ids.some((id) => selectedIds.includes(id)) && !isAllSelected(ids),
    [isAllSelected, selectedIds],
  );

  return {
    selectedIds,
    isSelected,
    toggle,
    selectAll,
    clear,
    isAllSelected,
    isSomeSelected,
  };
}
