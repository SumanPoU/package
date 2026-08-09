# Guide: custom CSS / JS

Author code always passes through composers — never raw-injected (ADR-06 / §22).

## CSS

1. Gate with `capabilities.allowCustomCss !== false` (production helper keeps this `true`).
2. Authors edit `Block.customCss` (Advanced) and/or `Page.globalCss`.
3. Engine: `parseAuthorCss` → `composeBlockCss` / `composePageCss` → inject with CSP nonce.
4. Per-block rules are scoped to `[data-block-id="…"]`.
5. Host re-parses on `onSave` / `onPublish` with the same reject rules (`validateAuthorCode`).

### Limits

| Limit | Behavior |
| --- | --- |
| `@import` | Rejected |
| Disallowed remote `url()` | Rejected / allow-listed per §22 |
| Malformed CSS | Parse errors — do not inject |

## JS

1. Gate with `capabilities.allowCustomJs` — **`createProductionCapabilities()` sets false**.
2. Shape-validate `CustomScript` (`enabled`, `runAt`, …); isolation is the control.
3. Runs only in canvas iframe / Open Page — never editor parent.
4. Network default-deny; pass `allowedConnectOrigins` into sandbox CSP if needed.

## Do not

- Add `'unsafe-inline'` to skip nonces
- Put `allow-same-origin` on the canvas sandbox
- Treat client composers as the authority (server re-validate)

## Related

[author-css](../concepts/author-css.md) · [sandbox-policy](../api/sandbox-policy.md) · [security](../concepts/security.md)
