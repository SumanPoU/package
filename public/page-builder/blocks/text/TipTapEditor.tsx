import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import * as LucideIcons from 'lucide-react';

import { cn } from '@/lib/utils';

export function TipTapEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false })],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm prose-blue focus:outline-none min-h-[100px] px-3 py-2 bg-white',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded">
      <div className="bg-gray-50 border-b border-gray-200 p-1 flex items-center gap-1 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            'p-1.5 rounded',
            editor.isActive('bold')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-600 hover:bg-gray-200',
          )}
        >
          <LucideIcons.Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            'p-1.5 rounded',
            editor.isActive('italic')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-600 hover:bg-gray-200',
          )}
        >
          <LucideIcons.Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            'p-1.5 rounded',
            editor.isActive('underline')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-600 hover:bg-gray-200',
          )}
        >
          <LucideIcons.Underline className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn(
            'p-1.5 rounded',
            editor.isActive('strike')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-600 hover:bg-gray-200',
          )}
        >
          <LucideIcons.Strikethrough className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            'p-1.5 rounded',
            editor.isActive('bulletList')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-600 hover:bg-gray-200',
          )}
        >
          <LucideIcons.List className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            'p-1.5 rounded',
            editor.isActive('orderedList')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-600 hover:bg-gray-200',
          )}
        >
          <LucideIcons.ListOrdered className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <button
          onClick={() => {
            const url = window.prompt('URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={cn(
            'p-1.5 rounded',
            editor.isActive('link')
              ? 'bg-gray-200 text-gray-900'
              : 'text-gray-600 hover:bg-gray-200',
          )}
        >
          <LucideIcons.Link className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => editor.chain().focus().unsetLink().run()}
          className="p-1.5 rounded text-gray-600 hover:bg-gray-200"
          disabled={!editor.isActive('link')}
        >
          <LucideIcons.Unlink className="w-3.5 h-3.5" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
