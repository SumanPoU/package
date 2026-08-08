# Security (§22)

Isolation is by construction: iframe sandbox + CSS/JS composers + bridge schema + host capabilities. Never hope authors write safe code.

## Surfaces

| Surface | Control |
| --- | --- |
| Canvas iframe | `sandbox="allow-scripts allow-forms"` — **never** `allow-same-origin` |
| Author CSS/JS | Composers only; per-render CSP nonce — no `'unsafe-inline'` |
| Network from author JS | Default-deny (`connect-src 'none'`); host allow-list only |
| Bridge | Typed envelope; `event.source === iframe.contentWindow`; no save/publish via bridge |
| Rich text | `sanitizeRichText` allow-list; strip scripts / event handlers |
| Block registration | No `eval` / `new Function` / unsigned remote render (ADR-12) |
| Save | Host **re-validates** CSS/JS shape server-side |

## Capabilities (who may author risk)

| Flag | Gates |
| --- | --- |
| `allowCustomCss` | Advanced + global CSS |
| `allowCustomJs` | Advanced + global JS (stricter; often off) |
| `allowRegisterPluginBlocks` | Model A plugins |
| `allowDynamicBlockDefs` | Model B JSON specs |
| `allowDataBinding` | Repeater / DataSource; inert without it |

UI may hide controls; **host must re-check on save**.

## Related

[sandbox-policy](../api/sandbox-policy.md) · [author-css](./author-css.md) · [phase-19-signed-import](../guides/phase-19-signed-import.md)
