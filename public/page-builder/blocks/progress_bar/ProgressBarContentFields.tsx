import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import { cn } from '@/lib/utils';

import type { Block } from '../../types';
import type { OnChangeI18n, OnChangeShared } from '../../core/types';

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

export function ProgressBarContentFields({
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
      <div className="space-y-1.5">
        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
          Percentage <span className="ml-1 text-gray-300 normal-case font-normal">(shared)</span>
        </Label>
        <Input
          type="number"
          value={block.props.percentage ?? ''}
          onChange={(e) => onChangeShared('percentage', e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      {langTabs}
      <div className="space-y-1.5">
        <div className="flex items-center">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Label</Label>
          <LangCoverage block={block} propKey="label" />
        </div>
        <Input
          value={getVal('label', editingLang)}
          onChange={(e) => updateProp('label', e.target.value, editingLang)}
          className="h-8 text-sm"
        />
      </div>
    </div>
  );
}
