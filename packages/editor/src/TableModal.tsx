import { useState, useEffect, useRef, type FC } from "react";
import { X, Table } from "lucide-react";

import type { EditorLocaleText } from "./locale";

interface TableModalProps {
  onClose: () => void;
  onInsert: (rows: number, cols: number) => void;
  locale: EditorLocaleText;
}

export const TableModal: FC<TableModalProps> = ({
  onClose,
  onInsert,
  locale,
}) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hovered, setHovered] = useState<{ r: number; c: number } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const GRID = 8;

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="itzsa-editor-modal-backdrop fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={locale.tableTitle}
        className="itzsa-editor-modal w-full max-w-[360px] overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-[var(--editor-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--editor-surface)] text-[var(--editor-muted)]">
              <Table size={15} />
            </div>
            <span className="text-sm font-semibold">{locale.tableTitle}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-lg text-[var(--editor-muted)] hover:bg-[var(--editor-surface)]"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--editor-muted)]">
              {hovered ? `${hovered.r} × ${hovered.c}` : `${rows} × ${cols}`}
            </p>
            <div
              className="inline-grid gap-1"
              style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)` }}
              role="grid"
              aria-label="Table size"
            >
              {Array.from({ length: GRID * GRID }, (_, i) => {
                const r = Math.floor(i / GRID) + 1;
                const c = (i % GRID) + 1;
                const active = hovered
                  ? r <= hovered.r && c <= hovered.c
                  : r <= rows && c <= cols;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`size-5 rounded-sm border transition-colors ${
                      active
                        ? "border-[var(--editor-accent)] bg-[var(--editor-accent)]"
                        : "border-[var(--editor-border)] bg-[var(--editor-surface)] hover:border-[var(--editor-muted)]"
                    }`}
                    onMouseEnter={() => setHovered({ r, c })}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => {
                      setRows(r);
                      setCols(c);
                    }}
                    aria-label={`${r} by ${c}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-[var(--editor-muted)] uppercase">
                {locale.tableRows}
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={rows}
                onChange={(e) =>
                  setRows(Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))
                }
                className="h-9 w-full rounded-lg border border-[var(--editor-border)] bg-[var(--editor-surface)] px-3 text-sm outline-none focus:border-[var(--editor-accent)]"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-[var(--editor-muted)] uppercase">
                {locale.tableCols}
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={cols}
                onChange={(e) =>
                  setCols(Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))
                }
                className="h-9 w-full rounded-lg border border-[var(--editor-border)] bg-[var(--editor-surface)] px-3 text-sm outline-none focus:border-[var(--editor-accent)]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--editor-border)] bg-[var(--editor-surface)] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="itzsa-editor-btn h-8 rounded-lg px-4 text-sm"
          >
            {locale.cancel}
          </button>
          <button
            type="button"
            onClick={() => {
              onInsert(rows, cols);
              onClose();
            }}
            className="itzsa-editor-btn-primary h-8 rounded-lg px-4 text-sm"
          >
            {locale.tableInsert}
          </button>
        </div>
      </div>
    </div>
  );
};
