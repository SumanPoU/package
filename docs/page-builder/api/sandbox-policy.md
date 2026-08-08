# Sandbox policy

`sandboxPolicy.ts` is the **single source of truth** for canvas iframe `sandbox` + CSP template (§22). Changing it requires an architecture amendment + regression test.

## Sandbox attribute

```text
allow-scripts allow-forms
```

**Never** `allow-same-origin`. **Never** `allow-top-navigation` / `allow-popups` unless a future ADR adds them. Open Page embedded in an iframe must use the **same** string.

```ts
import {
  CANVAS_SANDBOX,
  getCanvasSandboxAttribute,
  buildCspTemplate,
  createCanvasCsp,
  fillCspNonce,
} from "@itzsa/page-builder";
```

## CSP floor

| Directive | Policy |
| --- | --- |
| `script-src` / `style-src` | `'self' 'nonce-<n>'` — no `'unsafe-inline'` |
| `connect-src` | Default `'none'`; host `allowedConnectOrigins` only |
| `img-src` / `font-src` | `'self' data:` (+ optional host allow-lists) |
| `frame-src` / `object-src` / `base-uri` | Deny by default |

Nonce is minted **per canvas rebuild / Open Page request**; composers emit matching `nonce=` on tags. Host reflects the same nonce into CSP.

## Options

```ts
type SandboxPolicyOptions = {
  allowedConnectOrigins?: string[];
  allowedImgOrigins?: string[];
  allowedFontOrigins?: string[];
};
```

No wildcard `*` for `connect-src` in production.

## Related

[security](../concepts/security.md) · [author-css](../concepts/author-css.md) · [custom-css-js](../guides/custom-css-js.md)
