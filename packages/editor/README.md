# @itzsa/editor

Company-standard TipTap rich text editor with Unicode/Preeti Nepali input, language lock, hardened sanitization, and **host-owned media uploads** (no base64).

## Install

```bash
pnpm add @itzsa/editor @itzsa/nepali-input
```

```css
@source "../node_modules/@itzsa/editor";
@import "@itzsa/editor/styles.css";
```

## Media uploads (required for files)

Device uploads never convert to base64. You provide `onUpload` (or `settings.media.onUpload`); it must return a durable `https://` URL from your CDN/API.

```tsx
"use client";

import { RichTextEditor, type EditorUploadHandler } from "@itzsa/editor";
import "@itzsa/editor/styles.css";

const onUpload: EditorUploadHandler = async (file, { signal, onProgress, kind }) => {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
    signal,
  });
  if (!res.ok) throw new Error("Upload failed");

  const { url } = (await res.json()) as { url: string };
  onProgress({ ratio: 1 });
  return url; // https://cdn.example.com/...
};

export function Example() {
  return (
    <RichTextEditor
      onUpload={onUpload}
      settings={{
        media: {
          maxImageBytes: 5 * 1024 * 1024,
          maxVideoBytes: 50 * 1024 * 1024,
        },
        maxLength: 20_000,
        nepali: "unicode",
      }}
    />
  );
}
```

Without `onUpload`, users can still paste an https URL (unless `allowUrlInsert: false`).

## Scalable `settings`

```ts
settings={{
  nepali: "unicode",
  maxLength: 5000,
  compact: true,
  showStatusBar: true,
  allowHtmlMode: true,
  sanitize: true,
  toolbar: { video: false, html: false },
  media: {
    onUpload,
    maxImageBytes: 5_000_000,
    maxVideoBytes: 50_000_000,
    acceptImage: ["image/png", "image/jpeg", "image/webp"],
    allowUrlInsert: true,
  },
  locale: { placeholder: "लेख्नुहोस्…" },
}}
```

Flat props (`onUpload`, `maxLength`, `nepali`, …) still work and merge with `settings`.

## Security

- No base64 image inserts; data URLs are rejected on ingress
- HTML / paste / link / CSS length sanitization
- Schema-safe video node

## Ref API

`getHTML`, `getJSON`, `getText`, `setContent`, `clear`, `focus`, `blur`, `isEmpty`, `getEditor`
