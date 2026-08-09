# @itzsa/captcha

Company-standard React captcha with **two trust models** on one API:

| Trust model | Generate | Verify | Use when |
|-------------|----------|--------|----------|
| **Client** (default) | In the browser | Local match (`verifyCaptcha` / `verifyMathAnswer`) | Soft UX friction |
| **Server** | Your API stores the answer | `POST /verify` + optional Turnstile | Login / checkout / signup |

> Client mode is **not** a security boundary alone. Sensitive actions must use the server trust model.

## Install

```bash
pnpm add @itzsa/captcha
```

## Client — generate + verify in the browser

```tsx
import { MathCaptcha } from "@itzsa/captcha";

// No serverChallenge → local generateMathChallenge + verifyMathAnswer
<MathCaptcha
  difficulty="medium"
  layout="inline"
  onVerified={setOk}
/>
```

Text / slider work the same way (`Captcha`, `SliderCaptcha`).

## Server — trusted challenge (company standard)

```tsx
<MathCaptcha
  layout="inline"
  serverChallenge={{ prompt, token }} // from POST /api/captcha/challenge
  onRequestChallenge={loadChallenge}
  verify={async ({ value, challengeId }) => {
    const res = await fetch("/api/captcha/verify", {
      method: "POST",
      body: JSON.stringify({ token: challengeId, answer: value /* … */ }),
    });
    return res.ok;
  }}
  onVerified={setOk}
/>
```

Headless helpers (shared by both models): `generateMathChallenge`, `verifyMathAnswer`, `generateCaptcha`, `verifyCaptcha`.

## Key props (`Captcha`)

| Prop | Default | Description |
|------|---------|-------------|
| `length` / `chars` | `6` | Character count (3–16) |
| `charsetMode` | `"both"` | `"both"` \| `"letters"` \| `"numbers"` |
| `excludeAmbiguous` | `true` | Drop 0/O/1/l/I |
| `maxAttempts` | `5` | Lock after N failures |
| `verify` | — | Optional host check after local match (client) or sole check (server) |
| `error` / `loading` | — | Controlled host error / loading |
| `onError` / `onLock` | — | Structured failures / lock |

## MathCaptcha

| Prop | Default | Description |
|------|---------|-------------|
| `difficulty` | `"easy"` | `"easy"` \| `"medium"` \| `"hard"` \| `"bodmas"` |
| `layout` | `"stack"` | `"stack"` or `"inline"` |
| `autoRefreshOnInvalid` | `true` | New problem after a wrong answer |
| `serverChallenge` | — | `{ prompt, token }` — enables **server** trust model |
| `onRequestChallenge` | — | Host fetches next challenge on refresh |

## SliderCaptcha

| Prop | Default | Description |
|------|---------|-------------|
| `targetMin` / `targetMax` | `90` / `100` | Success zone (%) |
| `maxAttempts` | `5` | Lock after N failed releases |
| `verify` | — | Optional async check after a successful slide |

## Imperative API (`ref`)

`refresh()`, `reset()`, `unlock()`, `getValue()`, `getChallengeId()`, `validate()`, `getStatus()`, `getAttempts()`.
`MathCaptcha` also exposes `getChallenge()` (`null` in server mode).

## Docs

https://itzsa.acharya-suman.com.np/captcha

## License

[MIT](../../LICENSE) — Copyright (c) 2026 Suman Acharya.

## Contributing & bugs

- [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [Report a bug](https://github.com/SumanPoU/package/issues/new?template=bug_report.yml)
- [SECURITY.md](../../SECURITY.md) for vulnerabilities (private only)

