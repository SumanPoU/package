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
| Block registration | No `eval` / `new Function`; signed remote load only via Phase 19 + SRI |
| Save | Host **re-validates** CSS/JS shape server-side |

## Capabilities (who may author risk)

| Flag | Default when unset | Gates |
| --- | --- | --- |
| `allowCustomCss` | allow | Advanced + global CSS |
| `allowCustomJs` | allow | Advanced + global JS (prefer off in production) |
| `allowRegisterTenantBlocks` | allow | Model A `source: tenant` |
| `allowRegisterPluginBlocks` | allow | Model A `source: plugin` |
| `allowDynamicBlockDefs` | allow | Model B JSON specs |
| `allowDataBinding` | allow | Repeater / DataSource; inert without it |
| `allowSignedBlockImport` | **deny** | Phase 19 `registerSignedBlock` (must be explicitly `true`) |

UI may hide controls; **host must re-check on save**.

### Production helper

```ts
import { createProductionCapabilities } from "@itzsa/page-builder";

capabilities={createProductionCapabilities()}
// allowCustomJs: false, allowRegisterPluginBlocks: false,
// allowSignedBlockImport: false, CSS/binding/tenant still on
```

## Related

[sandbox-policy](../api/sandbox-policy.md) · [author-css](./author-css.md) · [phase-19-signed-import](../guides/phase-19-signed-import.md) · [host-callbacks](../api/host-callbacks.md)
