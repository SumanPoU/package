import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import { cn } from '@/lib/utils';

import type { OnChangeI18n, OnChangeShared } from '../../core/types';
import type { Block } from '../../types';
import { ImageUploader } from '../shared/ImageUploader';

function LangCoverage({ block, propKey }: { block: Block; propKey: string }) {
  const langMap = block.i18nProps[propKey] ?? {};
  const filled = SUPPORTED_LANGUAGES.filter((l) => !!langMap[l.code]?.trim()).length;
  const total = SUPPORTED_LANGUAGES.length;
  if (total <= 1) return null;
  return (
    <span
      className={cn(
        'ml-1 inline-flex items-center rounded px-1 text-[9px] font-medium tabular-nums',
        filled === total
          ? 'bg-green-50 text-green-600'
          : filled > 0
            ? 'bg-amber-50 text-amber-600'
            : 'bg-gray-100 text-gray-400',
      )}
    >
      {filled}/{total}
    </span>
  );
}

export function HeroContentFields({
  block,
  activeLang,
  onChangeShared,
  onChangeI18n,
}: {
  block: Block;
  activeLang: string;
  onChangeShared: OnChangeShared;
  onChangeI18n: OnChangeI18n;
}) {
  const [editingLang, setEditingLang] = useState(activeLang);
  useEffect(() => {
    setEditingLang(activeLang);
  }, [activeLang]);

  const updateProp = (propKey: string, value: string, lang: string) => {
    const existing = block.i18nProps[propKey] ?? {};
    onChangeI18n({ ...block.i18nProps, [propKey]: { ...existing, [lang]: value } });
  };
  const getVal = (propKey: string, lang: string) => block.i18nProps[propKey]?.[lang] ?? '';

  const langTabs =
    SUPPORTED_LANGUAGES.length > 1 ? (
      <div className="flex gap-0.5 mb-3 flex-wrap">
        {SUPPORTED_LANGUAGES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setEditingLang(l.code)}
            className={cn(
              'flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium border transition-colors',
              editingLang === l.code
                ? 'border-gray-400 bg-gray-100 text-gray-900'
                : 'border-gray-200 text-gray-400 hover:bg-gray-50',
            )}
          >
            {l.flag && (
              <img src={l.flag} alt={l.label} className="h-3 w-4 object-cover rounded-[2px]" />
            )}
            {l.code.toUpperCase()}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className="space-y-3">
      {langTabs}
      <div className="space-y-1.5">
        <div className="flex items-center">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Heading</Label>
          <LangCoverage block={block} propKey="heading" />
        </div>
        <Input
          value={getVal('heading', editingLang)}
          onChange={(e) => updateProp('heading', e.target.value, editingLang)}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Subheading</Label>
          <LangCoverage block={block} propKey="subheading" />
        </div>
        <Textarea
          value={getVal('subheading', editingLang)}
          onChange={(e) => updateProp('subheading', e.target.value, editingLang)}
          rows={2}
          className="text-sm resize-none"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">CTA label</Label>
          <LangCoverage block={block} propKey="ctaLabel" />
        </div>
        <Input
          value={getVal('ctaLabel', editingLang)}
          onChange={(e) => updateProp('ctaLabel', e.target.value, editingLang)}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-3 pt-2 border-t border-gray-100">
        <ImageUploader
          label="Background image (shared)"
          value={block.props.backgroundImage ?? ''}
          onChange={(val) => onChangeShared('backgroundImage', val)}
        />
        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
            Background color (shared)
          </Label>
          <Input
            type="color"
            value={block.props.backgroundColor || '#0f172a'}
            onChange={(e) => onChangeShared('backgroundColor', e.target.value)}
            className="h-8 w-full p-1 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
            CTA URL (shared)
          </Label>
          <Input
            value={block.props.ctaUrl ?? ''}
            onChange={(e) => onChangeShared('ctaUrl', e.target.value)}
            placeholder="https://..."
            className="h-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hero-cta-new-tab"
            checked={block.props.ctaTarget === '_blank'}
            onChange={(e) => onChangeShared('ctaTarget', e.target.checked ? '_blank' : '_self')}
            className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="hero-cta-new-tab" className="text-[11px] text-gray-500 cursor-pointer">
            Open CTA in new tab
          </Label>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
            Alignment (shared)
          </Label>
          <select
            value={block.props.alignment || 'center'}
            onChange={(e) => onChangeShared('alignment', e.target.value)}
            className="w-full h-8 text-sm border-gray-200 rounded-md focus:ring-primary focus:border-primary"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
            Overlay opacity (shared)
          </Label>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={block.props.overlayOpacity ?? '0.45'}
            onChange={(e) => onChangeShared('overlayOpacity', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
