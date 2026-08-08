import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectLanguage } from '@/store/slice/languageSlice';
import { generatePreviewHTML, loadPreviewPayload } from './utils';

// Side-effect: populate the block registry used by generatePreviewHTML.
import './blocks';

export default function PagePreview({ slug, previewKey }: { slug: string; previewKey?: string }) {
  const currentLang = useSelector(selectLanguage);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Loads into memory and immediately flushes the temporary `pb-preview:*`
  // sessionStorage key (other session keys / backend cache are untouched).
  // A full page refresh shows empty until Preview is opened again from the editor.
  const payload = useMemo(() => loadPreviewPayload(previewKey), [previewKey]);

  const html = useMemo(() => {
    if (!payload) return '';
    return generatePreviewHTML(
      payload.blocks,
      payload.title || slug || 'Untitled page',
      payload.description,
      currentLang,
      payload.metadata ?? undefined,
    );
  }, [payload, slug, currentLang]);

  useEffect(() => {
    if (!html) {
      setBlobUrl(null);
      return;
    }

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [html]);

  if (!payload) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-sm text-gray-400">No preview data provided.</p>
      </div>
    );
  }

  if (!blobUrl) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-sm text-gray-400">Loading preview…</p>
      </div>
    );
  }

  return (
    <iframe
      title={payload.title || slug || 'Page preview'}
      src={blobUrl}
      className="h-screen w-full border-0"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
  );
}
