"use client";

import * as React from "react";

export type DataTableEditMode = "cell" | "row";

export type DataTableEditType =
  | "text"
  | "number"
  | "select"
  | "boolean"
  | "textarea";

export type DataTableEditingCell = {
  id: string;
  field: string;
};

export type DataTableCellParams<T> = {
  id: string;
  field: string;
  row: T;
  value: unknown;
};

export type DataTableEditStopParams<T> = DataTableCellParams<T> & {
  reason: "enter" | "blur" | "escape" | "tab" | "rowSave" | "rowCancel";
};

export type UseTableEditingOptions<T> = {
  editMode?: DataTableEditMode;
  getRowId: (row: T, index: number) => string;
  processRowUpdate?: (newRow: T, oldRow: T) => T | Promise<T>;
  onProcessRowUpdateError?: (error: unknown) => void;
  onCellEditStart?: (params: DataTableCellParams<T>) => void;
  onCellEditStop?: (params: DataTableEditStopParams<T>) => void;
  isCellEditable?: (params: DataTableCellParams<T>) => boolean;
};

export type UseTableEditingReturn<T> = {
  editMode: DataTableEditMode;
  editingCell: DataTableEditingCell | null;
  editingRowId: string | null;
  draft: Record<string, unknown>;
  isEditingCell: (id: string, field: string) => boolean;
  isEditingRow: (id: string) => boolean;
  getDisplayRow: (row: T, id: string) => T;
  startCellEdit: (params: DataTableCellParams<T>) => void;
  startRowEdit: (params: DataTableCellParams<T>) => void;
  setDraftValue: (field: string, value: unknown) => void;
  cancelEdit: (reason?: DataTableEditStopParams<T>["reason"]) => void;
  commitCellEdit: (
    reason?: DataTableEditStopParams<T>["reason"],
  ) => Promise<boolean>;
  commitRowEdit: () => Promise<boolean>;
  /** Merged rows after successful updates (id → row). */
  rowOverrides: Record<string, T>;
};

function setFieldValue<T>(row: T, field: string, value: unknown): T {
  if (row === null || typeof row !== "object") return row;
  return { ...(row as object), [field]: value } as T;
}

export function useTableEditing<T>({
  editMode = "cell",
  getRowId,
  processRowUpdate,
  onProcessRowUpdateError,
  onCellEditStart,
  onCellEditStop,
  isCellEditable,
}: UseTableEditingOptions<T>): UseTableEditingReturn<T> {
  const [editingCell, setEditingCell] =
    React.useState<DataTableEditingCell | null>(null);
  const [editingRowId, setEditingRowId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<Record<string, unknown>>({});
  const [rowOverrides, setRowOverrides] = React.useState<Record<string, T>>({});
  const baselineRef = React.useRef<T | null>(null);

  const getDisplayRow = React.useCallback(
    (row: T, id: string) => rowOverrides[id] ?? row,
    [rowOverrides],
  );

  const isEditingCell = React.useCallback(
    (id: string, field: string) =>
      editMode === "cell"
        ? editingCell?.id === id && editingCell.field === field
        : editingRowId === id,
    [editMode, editingCell, editingRowId],
  );

  const isEditingRow = React.useCallback(
    (id: string) => editingRowId === id,
    [editingRowId],
  );

  const startCellEdit = React.useCallback(
    (params: DataTableCellParams<T>) => {
      if (isCellEditable && !isCellEditable(params)) return;
      baselineRef.current = params.row;
      setEditingRowId(null);
      setEditingCell({ id: params.id, field: params.field });
      setDraft({ [params.field]: params.value ?? "" });
      onCellEditStart?.(params);
    },
    [isCellEditable, onCellEditStart],
  );

  const startRowEdit = React.useCallback(
    (params: DataTableCellParams<T>) => {
      if (isCellEditable && !isCellEditable(params)) return;
      baselineRef.current = params.row;
      setEditingCell(null);
      setEditingRowId(params.id);
      setDraft({});
      onCellEditStart?.(params);
    },
    [isCellEditable, onCellEditStart],
  );

  const setDraftValue = React.useCallback((field: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const cancelEdit = React.useCallback(
    (reason: DataTableEditStopParams<T>["reason"] = "escape") => {
      const baseline = baselineRef.current;
      if (baseline && (editingCell || editingRowId)) {
        const id = editingCell?.id ?? editingRowId!;
        const field = editingCell?.field ?? "";
        onCellEditStop?.({
          id,
          field,
          row: baseline,
          value: field ? draft[field] : undefined,
          reason,
        });
      }
      setEditingCell(null);
      setEditingRowId(null);
      setDraft({});
      baselineRef.current = null;
    },
    [draft, editingCell, editingRowId, onCellEditStop],
  );

  const applyUpdate = React.useCallback(
    async (oldRow: T, nextRow: T, stop: DataTableEditStopParams<T>) => {
      try {
        const resolved = processRowUpdate
          ? await processRowUpdate(nextRow, oldRow)
          : nextRow;
        const id = stop.id;
        setRowOverrides((prev) => ({ ...prev, [id]: resolved }));
        onCellEditStop?.(stop);
        setEditingCell(null);
        setEditingRowId(null);
        setDraft({});
        baselineRef.current = null;
        return true;
      } catch (error) {
        onProcessRowUpdateError?.(error);
        return false;
      }
    },
    [onCellEditStop, onProcessRowUpdateError, processRowUpdate],
  );

  const commitCellEdit = React.useCallback(
    async (reason: DataTableEditStopParams<T>["reason"] = "enter") => {
      if (!editingCell || !baselineRef.current) return false;
      if (reason === "escape") {
        cancelEdit("escape");
        return false;
      }
      const oldRow = baselineRef.current;
      const value = draft[editingCell.field];
      const nextRow = setFieldValue(oldRow, editingCell.field, value);
      return applyUpdate(oldRow, nextRow, {
        id: editingCell.id,
        field: editingCell.field,
        row: nextRow,
        value,
        reason,
      });
    },
    [applyUpdate, cancelEdit, draft, editingCell],
  );

  const commitRowEdit = React.useCallback(async () => {
    if (!editingRowId || !baselineRef.current) return false;
    const oldRow = baselineRef.current;
    let nextRow = oldRow;
    for (const [field, value] of Object.entries(draft)) {
      nextRow = setFieldValue(nextRow, field, value);
    }
    return applyUpdate(oldRow, nextRow, {
      id: editingRowId,
      field: "",
      row: nextRow,
      value: undefined,
      reason: "rowSave",
    });
  }, [applyUpdate, draft, editingRowId]);

  // Silence unused getRowId for now — kept for API symmetry / future focus nav.
  void getRowId;

  return {
    editMode,
    editingCell,
    editingRowId,
    draft,
    isEditingCell,
    isEditingRow,
    getDisplayRow,
    startCellEdit,
    startRowEdit,
    setDraftValue,
    cancelEdit,
    commitCellEdit,
    commitRowEdit,
    rowOverrides,
  };
}
