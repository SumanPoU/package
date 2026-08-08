# Guide: custom CSS / JS

Author code always passes through composers — never raw-injected (ADR-06 / §6–7 / §22).

## CSS

1. Gate with `capabilities.allowCustomCss !== false`.
2. Authors edit `Block.customCss` (Advanced) and/or `Page.globalCss`.
3. Engine: `parseAuthorCss` → `composeBlockCss` / `composePageCss` → inject with CSP nonce.
4. Per-block rules are scoped to `[data-block-id="…"]`.
5. Host re-parses on `onSave` / `onPublish` with the same reject rules.

## JS

1. Gate with `capabilities.allowCustomJs` (often **off** for low-trust tenants).
2. Shape-validate `CustomScript` (`enabled`, `runAt`, …); isolation is the control.
3. Runs only in canvas iframe / Open Page — never editor parent.
4. Network default-deny; pass `allowedConnectOrigins` into sandbox CSP if needed.
5. Audit via `onCustomCodeChanged` when wired.

## Do not

- Add `'unsafe-inline'` to skip nonces
- Put `allow-same-origin` on the canvas sandbox
- Treat client composers as the authority (server re-validate)

## Related

[author-css](../concepts/author-css.md) · [sandbox-policy](../api/sandbox-policy.md) · [security](../concepts/security.md)
