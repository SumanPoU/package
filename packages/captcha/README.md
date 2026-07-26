# @itzsa/captcha

Company-standard canvas captcha for React — length, charset mode, attempt
limits, ambiguous-char exclusion, structured API errors, and optional async
`verify`. Installable from npm or the **itzsa** shadcn registry
(`components/itzsa/captcha`, nested `components/ui`).

> **Not a security boundary alone.** Use `verify` / your API for sensitive flows.

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
  const [apiError, setApiError] = useState<string | null>(null);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setApiError(null);
        if (!captchaRef.current?.validate()) return;
        try {
          await submitForm();
        } catch {
          setApiError("Server rejected the captcha.");
          captchaRef.current.refresh();
        }
      }}
    >
      <Captcha
        ref={captchaRef}
        length={6}
        charsetMode="both"
        maxAttempts={5}
        error={apiError}
        verify={async ({ value, challengeId }) => {
          const res = await fetch("/api/captcha/verify", {
            method: "POST",
            body: JSON.stringify({ value, challengeId }),
          });
          if (!res.ok) throw new Error("verify_failed");
          return true;
        }}
        onError={(err) => console.warn(err.code, err.message)}
        onVerified={setOk}
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

## Key props

| Prop | Default | Description |
|------|---------|-------------|
| `length` / `chars` | `6` | Character count (3–16) |
| `charsetMode` | `"both"` | `"both"` \| `"letters"` \| `"numbers"` |
| `excludeAmbiguous` | `true` | Drop 0/O/1/l/I |
| `maxAttempts` | `5` | Lock after N failures |
| `verify` | — | Async/server check — `false` or throw = bad API |
| `error` | — | Controlled host/API error string |
| `loading` | — | Controlled host loading |
| `onError` | — | Structured `CaptchaError` (`invalid`, `network`, `timeout`, `max_attempts`, …) |
| `onLock` | — | Fired when locked |
| `autoRefreshOnInvalid` / `autoRefreshOnError` | `false` | Auto-new challenge |

## Imperative API (`ref`)

`refresh()`, `reset()`, `unlock()`, `getValue()`, `getChallengeId()`, `validate()`, `getStatus()`, `getAttempts()`.

## Docs

https://itzsa.acharya-suman.com.np/captcha

## License

MIT
