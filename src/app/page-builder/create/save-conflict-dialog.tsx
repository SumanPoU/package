"use client";

type SaveConflictDialogProps = {
  open: boolean;
  expectedRevision: string | undefined;
  currentRevision: string | undefined;
  onReload: () => void;
  onOverwrite: () => void;
  onDismiss: () => void;
};

/** ADR-16 — never silent last-write-wins across tabs. */
export const SaveConflictDialog = ({
  open,
  expectedRevision,
  currentRevision,
  onReload,
  onOverwrite,
  onDismiss,
}: SaveConflictDialogProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Dismiss conflict dialog"
        className="absolute inset-0 cursor-default"
        onClick={onDismiss}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="pb-save-conflict-title"
        aria-describedby="pb-save-conflict-desc"
        className="relative z-10 w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow-2xl"
      >
        <h2
          id="pb-save-conflict-title"
          className="text-sm font-semibold text-foreground"
        >
          Save conflict
        </h2>
        <p
          id="pb-save-conflict-desc"
          className="mt-2 text-[12px] leading-relaxed text-gray-600"
        >
          This page was saved elsewhere (another tab or window). Your editor
          expected revision{" "}
          <code className="rounded bg-gray-100 px-1">
            {expectedRevision ?? "none"}
          </code>
          , but storage has{" "}
          <code className="rounded bg-gray-100 px-1">
            {currentRevision ?? "none"}
          </code>
          .
        </p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-[12px] text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onReload}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-foreground hover:bg-gray-50"
          >
            Reload stored
          </button>
          <button
            type="button"
            onClick={onOverwrite}
            className="rounded-md bg-gray-900 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-gray-800"
          >
            Overwrite
          </button>
        </div>
      </div>
    </div>
  );
};
