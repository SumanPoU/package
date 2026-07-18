"use client";

import * as React from "react";

export type TableFocusCell = {
  rowIndex: number;
  colIndex: number;
};

export type UseTableKeyboardOptions = {
  enabled: boolean;
  rowCount: number;
  colCount: number;
  /** When true, Enter starts edit via callback instead of default. */
  editable?: boolean;
  onStartEdit?: (cell: TableFocusCell) => void;
  /** Skip navigation while an editor is active. */
  isEditing?: boolean;
};

export type UseTableKeyboardReturn = {
  focusedCell: TableFocusCell | null;
  setFocusedCell: React.Dispatch<React.SetStateAction<TableFocusCell | null>>;
  getCellTabIndex: (rowIndex: number, colIndex: number) => number;
  getCellProps: (
    rowIndex: number,
    colIndex: number,
  ) => {
    tabIndex: number;
    "data-focused"?: string;
    onFocus: () => void;
    onKeyDown: (event: React.KeyboardEvent) => void;
  };
};

export function useTableKeyboard({
  enabled,
  rowCount,
  colCount,
  editable = false,
  onStartEdit,
  isEditing = false,
}: UseTableKeyboardOptions): UseTableKeyboardReturn {
  const [focusedCell, setFocusedCell] = React.useState<TableFocusCell | null>(
    null,
  );

  const move = React.useCallback(
    (rowDelta: number, colDelta: number) => {
      setFocusedCell((prev) => {
        const base = prev ?? { rowIndex: 0, colIndex: 0 };
        const nextRow = Math.min(
          Math.max(base.rowIndex + rowDelta, 0),
          Math.max(rowCount - 1, 0),
        );
        const nextCol = Math.min(
          Math.max(base.colIndex + colDelta, 0),
          Math.max(colCount - 1, 0),
        );
        return { rowIndex: nextRow, colIndex: nextCol };
      });
    },
    [colCount, rowCount],
  );

  React.useEffect(() => {
    if (!enabled || !focusedCell) return;
    const selector = `[data-table-cell="${focusedCell.rowIndex}:${focusedCell.colIndex}"]`;
    const node = document.querySelector<HTMLElement>(selector);
    node?.focus({ preventScroll: false });
  }, [enabled, focusedCell]);

  const getCellTabIndex = React.useCallback(
    (rowIndex: number, colIndex: number) => {
      if (!enabled) return -1;
      if (!focusedCell) {
        return rowIndex === 0 && colIndex === 0 ? 0 : -1;
      }
      return focusedCell.rowIndex === rowIndex &&
        focusedCell.colIndex === colIndex
        ? 0
        : -1;
    },
    [enabled, focusedCell],
  );

  const onKeyDownFor = React.useCallback(
    (rowIndex: number, colIndex: number) =>
      (event: React.KeyboardEvent) => {
        if (!enabled || isEditing) return;

        switch (event.key) {
          case "ArrowUp":
            event.preventDefault();
            move(-1, 0);
            break;
          case "ArrowDown":
            event.preventDefault();
            move(1, 0);
            break;
          case "ArrowLeft":
            event.preventDefault();
            move(0, -1);
            break;
          case "ArrowRight":
            event.preventDefault();
            move(0, 1);
            break;
          case "Home":
            event.preventDefault();
            setFocusedCell({
              rowIndex: event.ctrlKey ? 0 : rowIndex,
              colIndex: 0,
            });
            break;
          case "End":
            event.preventDefault();
            setFocusedCell({
              rowIndex: event.ctrlKey ? Math.max(rowCount - 1, 0) : rowIndex,
              colIndex: Math.max(colCount - 1, 0),
            });
            break;
          case "Enter":
            if (editable) {
              event.preventDefault();
              onStartEdit?.({ rowIndex, colIndex });
            }
            break;
          default:
            break;
        }
      },
    [colCount, editable, enabled, isEditing, move, onStartEdit, rowCount],
  );

  const getCellProps = React.useCallback(
    (rowIndex: number, colIndex: number) => {
      const isFocused =
        focusedCell?.rowIndex === rowIndex &&
        focusedCell?.colIndex === colIndex;
      return {
        tabIndex: getCellTabIndex(rowIndex, colIndex),
        ...(isFocused ? { "data-focused": "true" as const } : null),
        onFocus: () => setFocusedCell({ rowIndex, colIndex }),
        onKeyDown: onKeyDownFor(rowIndex, colIndex),
      };
    },
    [focusedCell, getCellTabIndex, onKeyDownFor],
  );

  return {
    focusedCell,
    setFocusedCell,
    getCellTabIndex,
    getCellProps,
  };
}
