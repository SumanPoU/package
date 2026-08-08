import type { Block } from '../../types';
import { getInheritStyle, resolveProps } from '../../utils';

export function CodeElement({ block, lang }: { block: Block; lang: string }) {
  const resolved = resolveProps(block, lang);
  const st = getInheritStyle(block.style);
  const code = resolved.code ?? '';
  const language = resolved.language?.trim() || 'plaintext';

  if (!code.trim()) {
    return (
      <div
        style={st}
        className="box-border w-full max-w-full min-w-0 rounded border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs text-gray-400"
      >
        Add code in the content panel
      </div>
    );
  }

  return (
    <pre
      style={st}
      className="box-border m-0 w-full max-w-full min-w-0 overflow-x-auto rounded-lg border border-gray-200 bg-gray-950 p-4 text-left"
      data-language={language}
    >
      <code className="block w-max max-w-none whitespace-pre font-mono text-xs leading-relaxed text-gray-100">
        {code}
      </code>
    </pre>
  );
}
