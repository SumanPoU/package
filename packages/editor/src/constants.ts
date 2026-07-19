export const COLORS: string[] = [
  '#000000',
  '#1e293b',
  '#dc2626',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#ffffff',
  '#374151',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#d1d5db',
  '#fca5a5',
  '#fed7aa',
  '#fde68a',
  '#bbf7d0',
  '#bfdbfe',
  '#ddd6fe',
  '#fbcfe8',
  '#2c5f85',
];

export const HEADING_OPTIONS = [
  { value: 'p', label: 'Paragraph' },
  { value: '1', label: 'Heading 1' },
  { value: '2', label: 'Heading 2' },
  { value: '3', label: 'Heading 3' },
  { value: '4', label: 'Heading 4' },
  { value: '5', label: 'Heading 5' },
  { value: '6', label: 'Heading 6' },
] as const;

// Maps heading level → the font size shown in the font-size dropdown
// These match the sizes in editor.css so the dropdown stays in sync.
export const HEADING_FONT_SIZE_MAP: Record<string, string> = {
  '1': '36px',
  '2': '30px',
  '3': '24px',
  '4': '20px',
  '5': '18px',
  '6': '16px',
  p: '16px',
};

export const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: 'Courier New, monospace' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Trebuchet', value: 'Trebuchet MS, sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Impact', value: 'Impact, sans-serif' },
];

export const FONT_SIZES = [
  '10px',
  '11px',
  '12px',
  '13px',
  '14px',
  '15px',
  '16px',
  '18px',
  '20px',
  '24px',
  '28px',
  '30px',
  '32px',
  '36px',
  '48px',
  '64px',
];

export const INITIAL_CONTENT = `
<h1>Start writing here…</h1>
<p>This is a full-featured rich text editor built with <strong>Tiptap</strong> and <em>React</em>. Select text or use the toolbar to format your content.</p>
<ul>
  <li>Bullet item one</li>
  <li>Bullet item two</li>
</ul>
<ol>
  <li>Numbered item one</li>
  <li>Numbered item two</li>
</ol>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true">Install Tiptap extensions</li>
  <li data-type="taskItem" data-checked="false">Build something great</li>
</ul>
`;
