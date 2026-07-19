# @itzsa/nepali-input

React **Input** and **Textarea** that transliterate Latin keystrokes to Nepali
Devanagari using **Unicode** or **Preeti** layouts — drop-in replacements for
native fields.

## Install

```bash
pnpm add @itzsa/nepali-input
```

### Styles (optional)

```css
@import "@itzsa/nepali-input/styles.css";
```

Load a Devanagari font (recommended: [Noto Sans Devanagari](https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari)) and optionally set:

```css
:root {
  --itzsa-nepali-font: "Noto Sans Devanagari", sans-serif;
}
```

Components use shadcn-style tokens (`border-input`, `ring`, etc.). Pair with your
existing Tailwind / shadcn theme.

## Usage

```tsx
"use client";

import { useState } from "react";
import { NepaliInput, NepaliTextarea } from "@itzsa/nepali-input";
import "@itzsa/nepali-input/styles.css";

export function Form() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  return (
    <>
      <NepaliInput
        mode="unicode"
        placeholder="नाम"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <NepaliTextarea
        mode="preeti"
        placeholder="विवरण"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
    </>
  );
}
```

### Uncontrolled

```tsx
<NepaliInput mode="unicode" defaultValue="" name="fullName" />
```

### Disable transliteration temporarily

```tsx
<NepaliInput mode="unicode" enabled={isNepaliOn} />
```

### Pure helpers (no React)

```ts
import { toNepali, mapChar } from "@itzsa/nepali-input";

toNepali("namaste", "unicode");
mapChar("k", "preeti");
```

## Props

Shared:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `"unicode" \| "preeti"` | `"unicode"` | Keyboard layout |
| `enabled` | `boolean` | `true` | Toggle transliteration |
| `className` | `string` | — | Merged with base styles |
| `…rest` | native input/textarea props | — | Fully forwarded |

Defaults set for Nepali UX: `lang="ne"`, `spellCheck={false}`, input `autoComplete="off"`.

## Robustness

- **Caret**: restored after mapping so multi-glyph Preeti keys don’t jump the cursor to the end
- **Passthrough**: existing Devanagari / non-ASCII is never re-mapped
- **Refs**: `forwardRef` + merged refs (callback and object refs)
- **Controlled & uncontrolled**: both supported
- **Paste**: goes through the same change path
- **Maps**: length-checked at module load (95 entries for ASCII 32–126)

## Docs

Open **`http://localhost:3000/nepali-input`** for installation, live examples
(Unicode / Preeti), props API, and styling notes.

## License

MIT
