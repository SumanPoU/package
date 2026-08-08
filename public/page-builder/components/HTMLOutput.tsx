import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { generatePreviewHTML } from '../utils';
import { Check } from 'lucide-react';
import Editor from '@monaco-editor/react';

export function HTMLOutput({
  langConfig,
  codeOpen,
  setCodeOpen,
  blocks,
  pageName,
  pageDescription,
  currentLang,
  metadata,
  handleCopyCode,
  codeCopied,
}: {
  langConfig: any;
  codeOpen: boolean;
  setCodeOpen: (open: boolean) => void;
  blocks: any;
  pageName: string;
  pageDescription: string;
  currentLang: string;
  metadata: any;
  handleCopyCode: () => void;
  codeCopied: boolean;
}) {
  return (
    <Dialog open={codeOpen} onOpenChange={setCodeOpen}>
      <DialogContent className="!max-w-7xl !w-full h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="flex-row items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0">
          <div className="flex items-center gap-2">
            <DialogTitle className="text-sm font-medium text-gray-700">HTML output</DialogTitle>
            {langConfig && (
              <span className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                {langConfig.flag && (
                  <img
                    src={langConfig.flag}
                    alt={langConfig.label}
                    className="h-3 w-4 object-cover rounded-[1px]"
                  />
                )}
                {langConfig.label}
              </span>
            )}
          </div>
          <button
            onClick={handleCopyCode}
            className="mr-8 flex items-center gap-1.5 rounded border border-gray-200 px-2.5 py-1 text-[11px] text-gray-500 hover:bg-gray-50 hover:text-gray-800"
          >
            {codeCopied ? (
              <>
                <Check className="h-3 w-3 text-green-500" /> Copied
              </>
            ) : (
              'Copy'
            )}
          </button>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="html"
            value={generatePreviewHTML(blocks, pageName, pageDescription, currentLang, metadata)}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'off',
              theme: 'vs',
              renderLineHighlight: 'none',
              folding: true,
              automaticLayout: true,
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
