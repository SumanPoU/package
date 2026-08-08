import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NepaliInput, NepaliTextarea } from '@/components/ui/nepali-input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toSlug } from '../utils';
import { PageSettingsDialogProps } from '@/types/website/pages';
import { Switch } from '@/components/ui/switch';

export function PageSettingsDialog({
  open,
  onOpenChange,
  pageName,
  pageNameNp,
  onPageNameChange,
  onPageNameNpChange,
  metadata,
  status,
  onMetadataChange,
  onStatusChange,
  errors = {},
}: PageSettingsDialogProps) {
  const inputClass =
    'h-8 text-[12px] rounded-none placeholder:text-muted-foreground/40 placeholder:text-[11px]';
  const labelClass = 'text-[11px] text-gray-400 uppercase tracking-wide mb-1';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader className="border-b border-border pb-2">
          <DialogTitle className="text-sm">Page settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1 max-h-[70vh] overflow-y-auto pr-1">
          {/* Page name */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Page name
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className={labelClass}>Page name (EN)</Label>
                <Input
                  value={pageName}
                  onChange={(e) => onPageNameChange(e.target.value)}
                  placeholder="e.g. Annual Report"
                  className={inputClass}
                />
                <p className="text-[11px] text-gray-400">Slug: /{toSlug(pageName)}</p>
              </div>
              <div className="space-y-1">
                <Label className={labelClass}>Page name (NP)</Label>
                <NepaliInput
                  value={pageNameNp}
                  onChange={(e: any) => onPageNameNpChange(e.target.value)}
                  placeholder="e.g. वार्षिक प्रतिवेदन"
                  className={`w-full ${inputClass}`}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Status
            </h3>
            <div className="flex items-center h-10 px-2.5 border border-input bg-transparent">
              <Switch checked={status} onCheckedChange={onStatusChange} />
              <span className="ml-2 text-sm text-muted-foreground">
                {status ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* SEO Metadata */}
          <div className="space-y-2 pt-2 border-t border-border">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">
              SEO Metadata
            </h3>
            <p className="text-[11px] text-muted-foreground mb-1.5">
              Configure the search engine optimization fields for this page.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className={labelClass}>SEO Title</Label>
                <Input
                  value={metadata.seo_title ?? ''}
                  onChange={(e) => onMetadataChange('seo_title', e.target.value)}
                  placeholder="e.g. Best Annual Reports in Nepal"
                  className={inputClass}
                />
                {errors.seo_title && <p className="text-[11px] text-red-500">{errors.seo_title}</p>}
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>SEO Title (NP)</Label>
                <NepaliInput
                  value={metadata.seo_title_np ?? ''}
                  onChange={(e: any) => onMetadataChange('seo_title_np', e.target.value)}
                  placeholder="e.g. वार्षिक प्रतिवेदन"
                  className={`w-full ${inputClass}`}
                />
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>Keywords</Label>
                <Input
                  value={metadata.keywords ?? ''}
                  onChange={(e) => onMetadataChange('keywords', e.target.value)}
                  placeholder="e.g. report, annual, financial"
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>Keywords (NP)</Label>
                <NepaliInput
                  value={metadata.keywords_np ?? ''}
                  onChange={(e: any) => onMetadataChange('keywords_np', e.target.value)}
                  placeholder="e.g. वार्षिक, प्रतिवेदन"
                  className={`w-full ${inputClass}`}
                />
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>Canonical URL</Label>
                <Input
                  type="url"
                  value={metadata.url ?? ''}
                  onChange={(e) => onMetadataChange('url', e.target.value)}
                  placeholder="e.g. https://example.com/reports"
                  className={inputClass}
                />
                {errors.url && <p className="text-[11px] text-red-500">{errors.url}</p>}
              </div>

              <div className="space-y-1">
                <Label className={labelClass}>SEO Image URL</Label>
                <Input
                  type="url"
                  value={metadata.image ?? ''}
                  onChange={(e) => onMetadataChange('image', e.target.value)}
                  placeholder="e.g. https://example.com/image.jpg"
                  className={inputClass}
                />
                {errors.image && <p className="text-[11px] text-red-500">{errors.image}</p>}
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <Label className={labelClass}>SEO Description</Label>
              <Textarea
                value={metadata.seo_description ?? ''}
                onChange={(e) => onMetadataChange('seo_description', e.target.value)}
                placeholder="A brief description for search engines..."
                className="min-h-[60px] text-[13px] rounded-none placeholder:text-muted-foreground/40"
              />
            </div>

            <div className="space-y-1 pt-1">
              <Label className={labelClass}>SEO Description (NP)</Label>
              <NepaliTextarea
                value={metadata.seo_description_np ?? ''}
                onChange={(e: any) => onMetadataChange('seo_description_np', e.target.value)}
                placeholder="संक्षिप्त विवरण…"
                className="min-h-[60px] text-[13px] rounded-none placeholder:text-muted-foreground/40"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border mt-1">
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
