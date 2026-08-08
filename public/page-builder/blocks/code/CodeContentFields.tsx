import { useEffect, useState } from 'react';

import Editor from '@monaco-editor/react';
import { Label } from '@/components/ui/label';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import { cn } from '@/lib/utils';

import type { OnChangeI18n, OnChangeShared } from '../../core/types';
import type { Block } from '../../types';

const CODE_LANGUAGES = [
  { value: 'plaintext', label: 'Plain text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
] as const;

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

export function CodeContentFields({
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

  const language = block.props.language || 'plaintext';
  const editorLanguage = language === 'plaintext' ? 'plaintext' : language;

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
        <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Language</Label>
        <select
          value={language}
          onChange={(e) => onChangeShared('language', e.target.value)}
          className="w-full rounded border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-700 outline-none focus:border-gray-400"
        >
          {CODE_LANGUAGES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center">
          <Label className="text-[11px] text-gray-400 uppercase tracking-wide">Code</Label>
          <LangCoverage block={block} propKey="code" />
        </div>
        <div className="border border-gray-700 rounded overflow-hidden mt-1">
          <Editor
            height="220px"
            language={editorLanguage}
            theme="vs-dark"
            value={getVal('code', editingLang)}
            onChange={(val) => updateProp('code', val || '', editingLang)}
            options={{
              minimap: { enabled: false },
              tabSize: 2,
              fontSize: 12,
              padding: { top: 8, bottom: 8 },
              wordWrap: 'on',
            }}
          />
        </div>
      </div>
    </div>
  );
}
