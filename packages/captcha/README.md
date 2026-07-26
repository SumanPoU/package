# @itzsa/captcha

Canvas captcha for React — configurable length, theme, noise, messages, and
verification callbacks. Also installable from the **itzsa** shadcn registry
into `components/itzsa/captcha` (nested UI under `components/ui`).

> **Not a security boundary.** This is client-side friction against casual bots.
> Pair with server-side checks for anything sensitive.

## Install (npm)

```bash
pnpm add @itzsa/captcha
```

```tsx
import { useRef, useState } from "react";
import { Captcha, type CaptchaHandle } from "@itzsa/captcha";

export function SignupForm() {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [ok, setOk] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!captchaRef.current?.validate()) return;
        // submit…
      }}
    >
      <Captcha
        ref={captchaRef}
        length={6}
        theme="system"
        noise={0.7}
        caseSensitive
        onVerified={setOk}
        messages={{
          placeholder: "Enter captcha",
          validHint: "Looks good",
        }}
      />
      <button type="submit" disabled={!ok}>
        Continue
      </button>
    </form>
  );
}
```

## Install (registry)

```bash
pnpm dlx shadcn@latest add https://itzsa.acharya-suman.com.np/r/captcha.json
```

Copies source to `components/itzsa/captcha/…` including `components/ui/input.tsx`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `length` / `chars` | `number` | `6` | Number of captcha characters (3–16) |
| `charsetMode` | `"both" \| "letters" \| "numbers"` | `"both"` | Letters+digits, letters only, or digits only |
| `caseSensitive` | `boolean` | `true` | Exact case match (ignored for `numbers`) |
| `requireDigit` / `requireUpper` / `requireLower` | `number` | mode defaults | Guaranteed character classes |
| `charset` | `string` | from mode | Override character pool |
| `width` / `height` | `number` | `210` / `62` | Canvas size |
| `theme` | `"light" \| "dark" \| "system"` | `"system"` | Canvas colors |
| `noise` | `number` | `0.7` | Interference 0–1 |
| `onVerified` | `(valid: boolean) => void` | — | Fires when length is complete |
| `onChange` / `onStatusChange` / `onRefresh` | callbacks | — | Input / status / refresh |
| `value` / `defaultValue` | `string` | — | Controlled / uncontrolled input |
| `messages` | `CaptchaMessages` | English defaults | Labels & hints |
| `showRefresh` / `showCounter` / `showStatus` | `boolean` | `true` | Chrome toggles |
| `className` / `canvasClassName` / `inputClassName` / `refreshClassName` | `string` | — | Styling hooks |
| `inputProps` | `input` props | — | Forwarded to the text field |
| `disabled` / `autoFocus` / `id` / `name` | — | — | Form helpers |

## Imperative API (`ref`)

`refresh()`, `reset()`, `getValue()`, `validate()`, `getStatus()`.

## Docs

https://itzsa.acharya-suman.com.np/captcha

## License

MIT
