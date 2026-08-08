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

export function BlogCardContentFields({
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
      <ImageUploader
        label="Thumbnail (shared)"
        value={block.props.thumbnail ?? ''}
        onChange={(val) => onChangeShared('thumbnail', val)}
      />
      <div className="space-y-1.5">
        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
          Image aspect ratio (shared)
        </Label>
        <select
          value={block.props.imageAspectRatio || '16:9'}
          onChange={(e) => onChangeShared('imageAspectRatio', e.target.value)}
          className="w-full h-8 text-sm border-gray-200 rounded-md focus:ring-primary focus:border-primary"
        >
          <option value="16:9">16:9</option>
          <option value="4:3">4:3</option>
          <option value="1:1">1:1</option>
        </select>
      </div>

      {langTabs}
      <div className="space-y-1.5">
        <div className="flex items-center">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Category</Label>
          <LangCoverage block={block} propKey="category" />
        </div>
        <Input
          value={getVal('category', editingLang)}
          onChange={(e) => updateProp('category', e.target.value, editingLang)}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Title</Label>
          <LangCoverage block={block} propKey="title" />
        </div>
        <Input
          value={getVal('title', editingLang)}
          onChange={(e) => updateProp('title', e.target.value, editingLang)}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Excerpt</Label>
          <LangCoverage block={block} propKey="excerpt" />
        </div>
        <Textarea
          value={getVal('excerpt', editingLang)}
          onChange={(e) => updateProp('excerpt', e.target.value, editingLang)}
          rows={3}
          className="text-sm resize-none"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Author</Label>
          <LangCoverage block={block} propKey="authorName" />
        </div>
        <Input
          value={getVal('authorName', editingLang)}
          onChange={(e) => updateProp('authorName', e.target.value, editingLang)}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
            Read more label
          </Label>
          <LangCoverage block={block} propKey="readMoreLabel" />
        </div>
        <Input
          value={getVal('readMoreLabel', editingLang)}
          onChange={(e) => updateProp('readMoreLabel', e.target.value, editingLang)}
          className="h-8 text-sm"
        />
      </div>

      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
            Publish date (shared)
          </Label>
          <Input
            type="date"
            value={block.props.publishDate ?? ''}
            onChange={(e) => onChangeShared('publishDate', e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
            Post URL (shared)
          </Label>
          <Input
            value={block.props.postUrl ?? ''}
            onChange={(e) => onChangeShared('postUrl', e.target.value)}
            placeholder="https://..."
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
            Link target (shared)
          </Label>
          <select
            value={block.props.linkTarget || '_self'}
            onChange={(e) => onChangeShared('linkTarget', e.target.value)}
            className="w-full h-8 text-sm border-gray-200 rounded-md focus:ring-primary focus:border-primary"
          >
            <option value="_self">Same tab</option>
            <option value="_blank">New tab</option>
          </select>
        </div>
      </div>
    </div>
  );
}
