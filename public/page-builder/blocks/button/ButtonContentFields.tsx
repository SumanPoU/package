import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import { cn } from '@/lib/utils';

import type { OnChangeI18n, OnChangeShared } from '../../core/types';
import type { Block } from '../../types';

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

export function ButtonContentFields({
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
    <div className="space-y-4">
      <div className="space-y-1.5">
        {langTabs}
        <div className="flex items-center">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Text</Label>
          <LangCoverage block={block} propKey="text" />
        </div>
        <Input
          value={getVal('text', editingLang)}
          onChange={(e) => updateProp('text', e.target.value, editingLang)}
          placeholder={`Text in ${SUPPORTED_LANGUAGES.find((l) => l.code === editingLang)?.label ?? editingLang}…`}
          className="h-8 text-sm"
        />
      </div>
      <div className="space-y-1.5 pt-2 border-t border-gray-100">
        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
          Link URL (shared)
        </Label>
        <Input
          value={block.props.href ?? ''}
          onChange={(e) => onChangeShared('href', e.target.value)}
          placeholder="https://..."
          className="h-8 text-sm"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="new-tab-toggle"
          checked={block.props.target === '_blank'}
          onChange={(e) => onChangeShared('target', e.target.checked ? '_blank' : '_self')}
          className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="new-tab-toggle" className="text-[11px] text-gray-500 cursor-pointer">
          Open in new tab
        </Label>
      </div>
    </div>
  );
}
