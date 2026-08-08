import { useEffect, useState } from 'react';
import * as LucideIcons from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import { cn } from '@/lib/utils';

import {
  LIST_TYPE_OPTIONS,
  appendListItem,
  parseListItems,
  serializeListItems,
} from '../../constants/listTypes';
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

export function ListContentFields({
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

  const itemsString = getVal('items', editingLang);
  const items = parseListItems(itemsString);

  const handleItemChange = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index] = val;
    updateProp('items', serializeListItems(newItems), editingLang);
  };
  const handleAddItem = () => {
    updateProp('items', appendListItem(itemsString), editingLang);
  };
  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    updateProp('items', serializeListItems(newItems), editingLang);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">
          List Type <span className="ml-1 text-gray-300 normal-case font-normal">(shared)</span>
        </Label>
        <select
          value={block.props.listType || 'unordered'}
          onChange={(e) => onChangeShared('listType', e.target.value)}
          className="w-full h-8 text-sm border border-gray-200 rounded px-2"
        >
          {LIST_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {langTabs}
      <div className="flex items-center">
        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">List Items</Label>
        <LangCoverage block={block} propKey="items" />
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <Input
              value={item}
              onChange={(e) => handleItemChange(i, e.target.value)}
              className="h-8 text-sm"
              placeholder={`Item ${i + 1}`}
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(i)}
              className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              <LucideIcons.Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleAddItem}
        className="w-full flex items-center justify-center gap-1 py-1.5 border border-dashed border-gray-300 rounded text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
      >
        <LucideIcons.Plus className="w-3 h-3" /> Add List
      </button>
    </div>
  );
}
