# @itzsa/editor

Company-standard TipTap rich text editor with Unicode/Preeti Nepali input, language lock, and hardened HTML/URL sanitization.

## Install

```bash
pnpm add @itzsa/editor @itzsa/nepali-input
```

## Setup (Tailwind v4)

```css
@source "../node_modules/@itzsa/editor";
@import "@itzsa/editor/styles.css";
```

## Usage

```tsx
"use client";

import { useRef, useState } from "react";
import {
  RichTextEditor,
  type RichTextEditorHandle,
} from "@itzsa/editor";
import "@itzsa/editor/styles.css";

export function Example() {
  const ref = useRef<RichTextEditorHandle>(null);
  const [html, setHtml] = useState("<p>Hello</p>");

  return (
    <RichTextEditor
      ref={ref}
      value={html}
      onChange={setHtml}
      nepali="unicode"
      maxLength={5000}
      onUpload={async (file) => {
        // upload to your CDN, return https URL
        return "https://cdn.example.com/" + file.name;
      }}
      toolbar={{ video: false }}
    />
  );
}
```

## Security

- All HTML ingress (`value`, paste, HTML mode) is sanitized (tag/attr allowlist).
- Links and media URLs reject `javascript:`, `data:` (unless `allowBase64`), and protocol-relative `//`.
- CSS lengths (`width`, `font-size`) must match `12px` / `50%` / `1.5rem` patterns.
- Video inserts use a schema node (`setVideo`) — never HTML string templates.
- Prefer `onUpload` over `allowBase64` for production.

Still sanitize again when rendering stored HTML with `dangerouslySetInnerHTML`.

## Key props

| Prop | Description |
| --- | --- |
| `value` / `onChange` | Controlled HTML |
| `ref` | `getHTML`, `getJSON`, `setContent`, `clear`, `focus`, … |
| `nepali` | `"unicode"` \| `"preeti"` \| `false` (English lock) |
| `readOnly` / `disabled` | Selectable vs fully disabled |
| `maxLength` | Character limit |
| `onUpload` | `(file) => Promise<httpsUrl>` |
| `allowBase64` | Opt-in data URLs for images (off by default) |
| `toolbar` | Feature flags |
| `locale` | Label overrides |
| `classNames` | `root`, `toolbar`, `content`, `statusBar` |

## Theming

Override CSS variables on `.itzsa-editor` (see `styles.css`). Dark mode follows `.dark` ancestors.
