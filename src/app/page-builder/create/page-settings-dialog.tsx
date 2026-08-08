"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export type PageMetadata = {
  seo_title?: string;
  seo_title_np?: string;
  keywords?: string;
  keywords_np?: string;
  url?: string;
  image?: string;
  seo_description?: string;
  seo_description_np?: string;
};

export type PageSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageName: string;
  pageNameNp: string;
  pageSlug: string;
  onPageNameChange: (value: string) => void;
  onPageNameNpChange: (value: string) => void;
  status: boolean;
  onStatusChange: (value: boolean) => void;
  metadata: PageMetadata;
  onMetadataChange: (key: keyof PageMetadata, value: string) => void;
};

const inputClass =
  "h-8 w-full rounded-none border border-input bg-transparent px-2.5 text-[12px] outline-none placeholder:text-[11px] placeholder:text-muted-foreground/40 focus:border-gray-400";
const labelClass =
  "mb-1 block text-[11px] tracking-wide text-gray-400 uppercase";

export function PageSettingsDialog({
  open,
  onOpenChange,
  pageName,
  pageNameNp,
  pageSlug,
  onPageNameChange,
  onPageNameNpChange,
  status,
  onStatusChange,
  metadata,
  onMetadataChange,
}: PageSettingsDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 py-10"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close page settings"
        className="absolute inset-0 cursor-default"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pb-page-settings-title"
        className="relative z-10 flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2
            id="pb-page-settings-title"
            className="text-sm font-medium text-gray-900"
          >
            Page settings
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-4">
          <section className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
              Page name
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="pb-name-en">
                  Page name (EN)
                </label>
                <input
                  id="pb-name-en"
                  className={inputClass}
                  value={pageName}
                  onChange={(e) => onPageNameChange(e.target.value)}
                  placeholder="e.g. Annual Report"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Slug: /{pageSlug}
                </p>
              </div>
              <div>
                <label className={labelClass} htmlFor="pb-name-np">
                  Page name (NP)
                </label>
                <input
                  id="pb-name-np"
                  className={inputClass}
                  value={pageNameNp}
                  onChange={(e) => onPageNameNpChange(e.target.value)}
                  placeholder="e.g. वार्षिक प्रतिवेदन"
                />
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-border pt-4">
            <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
              Status
            </h3>
            <div className="flex h-10 items-center border border-input px-2.5">
              <button
                type="button"
                role="switch"
                aria-checked={status}
                aria-label="Active status"
                onClick={() => onStatusChange(!status)}
                className={
                  status
                    ? "relative h-5 w-9 rounded-full bg-blue-600 transition-colors"
                    : "relative h-5 w-9 rounded-full bg-gray-300 transition-colors"
                }
              >
                <span
                  className={
                    status
                      ? "absolute top-0.5 left-[18px] h-4 w-4 rounded-full bg-white transition-all"
                      : "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-all"
                  }
                />
              </button>
              <span className="ml-2 text-sm text-muted-foreground">
                {status ? "Active" : "Inactive"}
              </span>
            </div>
          </section>

          <section className="space-y-2 border-t border-border pt-4">
            <h3 className="text-xs font-semibold tracking-wide text-foreground uppercase">
              SEO Metadata
            </h3>
            <p className="mb-1.5 text-[11px] text-muted-foreground">
              Configure the search engine optimization fields for this page.
            </p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field
                id="seo_title"
                label="SEO Title"
                value={metadata.seo_title ?? ""}
                placeholder="e.g. Best Annual Reports in Nepal"
                onChange={(v) => onMetadataChange("seo_title", v)}
              />
              <Field
                id="seo_title_np"
                label="SEO Title (NP)"
                value={metadata.seo_title_np ?? ""}
                placeholder="e.g. वार्षिक प्रतिवेदन"
                onChange={(v) => onMetadataChange("seo_title_np", v)}
              />
              <Field
                id="keywords"
                label="Keywords"
                value={metadata.keywords ?? ""}
                placeholder="e.g. report, annual, financial"
                onChange={(v) => onMetadataChange("keywords", v)}
              />
              <Field
                id="keywords_np"
                label="Keywords (NP)"
                value={metadata.keywords_np ?? ""}
                placeholder="e.g. वार्षिक, प्रतिवेदन"
                onChange={(v) => onMetadataChange("keywords_np", v)}
              />
              <Field
                id="url"
                label="Canonical URL"
                value={metadata.url ?? ""}
                placeholder="e.g. https://example.com/reports"
                onChange={(v) => onMetadataChange("url", v)}
              />
              <Field
                id="image"
                label="SEO Image URL"
                value={metadata.image ?? ""}
                placeholder="e.g. https://example.com/image.jpg"
                onChange={(v) => onMetadataChange("image", v)}
              />
            </div>

            <div className="pt-1">
              <label className={labelClass} htmlFor="seo_description">
                SEO Description
              </label>
              <textarea
                id="seo_description"
                rows={3}
                className="min-h-[60px] w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-[13px] outline-none placeholder:text-muted-foreground/40 focus:border-gray-400"
                value={metadata.seo_description ?? ""}
                placeholder="A brief description for search engines..."
                onChange={(e) =>
                  onMetadataChange("seo_description", e.target.value)
                }
              />
            </div>
            <div className="pt-1">
              <label className={labelClass} htmlFor="seo_description_np">
                SEO Description (NP)
              </label>
              <textarea
                id="seo_description_np"
                rows={3}
                className="min-h-[60px] w-full rounded-none border border-input bg-transparent px-2.5 py-2 text-[13px] outline-none placeholder:text-muted-foreground/40 focus:border-gray-400"
                value={metadata.seo_description_np ?? ""}
                placeholder="संक्षिप्त विवरण…"
                onChange={(e) =>
                  onMetadataChange("seo_description_np", e.target.value)
                }
              />
            </div>
          </section>
        </div>

        <div className="flex justify-end border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-8 rounded bg-gray-900 px-4 text-[12px] font-medium text-white hover:bg-gray-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={inputClass}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
