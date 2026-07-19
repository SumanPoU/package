"use client";

import * as React from "react";
import {
  CheckIcon,
  ClipboardCopyIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
} from "lucide-react";
import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";

import { cn } from "./lib/utils";
import { useDataTableLocale } from "./locale-text";
import { toolbarSelectTriggerClass } from "./toolbar-control";
import {
  buildCsv,
  copyTextToClipboard,
  downloadTextFile,
} from "./export-utils";

export type ExportMenuProps = {
  getCsv: () => { headers: string[]; matrix: unknown[][] };
  filename?: string;
  radiusClass?: string;
  className?: string;
  popoverOffset?: number;
  onExported?: (format: "csv" | "clipboard") => void;
};

export function ExportMenu({
  getCsv,
  filename = "table-export.csv",
  radiusClass = "rounded-xs",
  className,
  popoverOffset = 8,
  onExported,
}: ExportMenuProps) {
  const locale = useDataTableLocale();
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(popoverOffset),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const exportCsv = () => {
    const { headers, matrix } = getCsv();
    const csv = buildCsv(headers, matrix);
    downloadTextFile(csv, filename);
    onExported?.("csv");
    setOpen(false);
  };

  const copyCsv = async () => {
    const { headers, matrix } = getCsv();
    const csv = buildCsv(headers, matrix);
    const ok = await copyTextToClipboard(csv);
    if (ok) {
      setCopied(true);
      onExported?.("clipboard");
      window.setTimeout(() => setCopied(false), 1500);
    }
    setOpen(false);
  };

  const itemClass = cn(
    "flex w-full items-center gap-2 px-2.5 py-2 text-left text-xs outline-none hover:bg-muted",
    radiusClass,
  );

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        aria-expanded={open}
        data-slot="data-table-export-trigger"
        className={cn(
          toolbarSelectTriggerClass,
          "min-w-[6.25rem]",
          radiusClass,
          className,
        )}
        {...getReferenceProps()}
      >
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <DownloadIcon className="size-3 opacity-70" />
          <span className="truncate">{locale.exportLabel}</span>
        </span>
      </button>

      {open ? (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            data-slot="data-table-export-menu"
            className={cn(
              "z-50 min-w-44 border border-input bg-popover p-1 text-popover-foreground shadow-md",
              radiusClass,
            )}
            {...getFloatingProps()}
          >
            <button type="button" role="menuitem" className={itemClass} onClick={exportCsv}>
              <FileSpreadsheetIcon className="size-3.5" />
              {locale.exportDownloadCsv}
            </button>
            <button type="button" role="menuitem" className={itemClass} onClick={() => void copyCsv()}>
              {copied ? (
                <CheckIcon className="size-3.5 text-emerald-600" />
              ) : (
                <ClipboardCopyIcon className="size-3.5" />
              )}
              {copied ? locale.exportCopied : locale.exportCopyCsv}
            </button>
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}
