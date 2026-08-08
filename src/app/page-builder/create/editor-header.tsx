"use client";

import type { Page } from "@itzsa/page-builder";
import { Braces, Check, ExternalLink, Globe, Settings, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { PageCodePanel } from "./code-panel";
import { DeviceSelect, LocaleSelect } from "./inspector-controls";

export type Device = "desktop" | "tablet" | "mobile";

export type EditorHeaderProps = {
  pageName: string;
  pageSlug: string;
  onPageNameChange: (value: string) => void;
  device: Device;
  onDeviceChange: (device: Device) => void;
  activeLocale: string;
  onActiveLocaleChange: (locale: string) => void;
  locales: { code: string; label: string }[];
  page: Page;
  onSettingsOpen: () => void;
  onPreview: () => void;
  onPublish: () => void;
  isPublishing?: boolean;
  savedFlash?: boolean;
};

export function EditorHeader({
  pageName,
  pageSlug,
  onPageNameChange,
  device,
  onDeviceChange,
  activeLocale,
  onActiveLocaleChange,
  locales,
  page,
  onSettingsOpen,
  onPreview,
  onPublish,
  isPublishing = false,
  savedFlash = false,
}: EditorHeaderProps) {
  const [codeOpen, setCodeOpen] = useState(false);

  return (
    <>
      <header className="z-20 flex h-12 shrink-0 items-center justify-between border-b border-gray-200/80 bg-white px-3 shadow-[0_1px_0_rgb(0_0_0/0.02)]">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm"
            aria-hidden
            title="Page builder"
          >
            <Globe className="h-3.5 w-3.5" />
          </div>
          <input
            value={pageName}
            onChange={(e) => onPageNameChange(e.target.value)}
            aria-label="Page name"
            className="h-8 w-40 rounded-md border border-transparent bg-transparent px-2 text-sm font-semibold tracking-tight text-gray-900 outline-none hover:border-gray-200 focus:border-sky-300 focus:bg-white"
          />
          <span className="hidden max-w-[120px] truncate text-[11px] text-gray-400 sm:inline">
            /{pageSlug}
          </span>
          <button
            type="button"
            onClick={onSettingsOpen}
            title="Page settings"
            aria-label="Page settings"
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <DeviceSelect value={device} onChange={onDeviceChange} />
          <LocaleSelect
            value={activeLocale}
            onChange={onActiveLocaleChange}
            locales={locales}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCodeOpen(true)}
            title="View page CSS"
            aria-label="View page CSS"
            className={cn(
              "flex h-7 items-center gap-1 rounded-md border border-gray-200 px-2 text-[11px] font-medium text-gray-600 hover:bg-gray-50",
              codeOpen && "border-sky-300 bg-sky-50 text-sky-700",
            )}
          >
            <Braces className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Code</span>
          </button>
          <button
            type="button"
            onClick={onPreview}
            className="flex h-7 items-center gap-1 rounded-md px-2 text-[12px] text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Preview
          </button>
          <button
            type="button"
            onClick={onPublish}
            disabled={isPublishing}
            className="flex h-8 items-center gap-1 rounded-md bg-gray-900 px-3.5 text-[12px] font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-60"
          >
            {savedFlash ? (
              <>
                <Check className="h-3 w-3" /> Saved
              </>
            ) : isPublishing ? (
              "Publishing…"
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </header>

      {codeOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close code panel"
            className="absolute inset-0 cursor-default"
            onClick={() => setCodeOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Page CSS"
            className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <Braces className="h-4 w-4 text-sky-600" />
                <h2 className="text-sm font-semibold text-gray-900">
                  Page CSS
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCodeOpen(false)}
                aria-label="Close"
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <PageCodePanel page={page} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
