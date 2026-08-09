# Phase 19 — signed dynamic import

**Status: shipped (opt-in).** Default **deny**. Hosts must set `allowSignedBlockImport: true` and pass an origin allow-list.

White-label SaaS can load per-customer **executable** `render` without rebuilding the host — only via a vetted ESM module.

## Flow

```text
1. capability allowSignedBlockImport === true  (else throw)
2. URL is https + origin ∈ allowedImportOrigins
3. fetch(url) → bytes
4. verify SRI integrity (sha256|sha384|sha512-<base64>)
5. blob URL + import(blob) of verified bytes only
6. export `definition` or `default` → registerBlock (namespaced)
```

Never `eval` / `new Function`. Integrity failure aborts **before** `import()`.

## Host usage

```ts
import {
  createRegistry,
  registerPrimitives,
  registerSignedBlock,
} from "@itzsa/page-builder";

const registry = createRegistry();
registerPrimitives(registry);

await registerSignedBlock(
  registry,
  {
    url: "https://cdn.example.com/blocks/tenant-callout.js",
    integrity: "sha384-…", // from your release pipeline
    expectedType: "tenant:callout",
  },
  {
    capabilities: { allowSignedBlockImport: true },
    allowedImportOrigins: ["https://cdn.example.com"],
  },
);
```

### Remote module shape

```ts
// Built ESM on your CDN (peer: react). Do not inline secrets.
export const definition = {
  type: "tenant:callout",
  label: "Callout",
  source: "tenant",
  // … propsSchema, render, ContentFields
};
```

`source: "core"` from a remote module is rejected.

## Hard forbid

| Forbidden | Use instead |
| --- | --- |
| `eval` / `new Function` of remote source | Never |
| Unsigned remote script | Model A bundle · Model B JSON · or this API **with** SRI |
| Empty / missing `allowedImportOrigins` | Explicit CDN origins |
| Skipping capability | Explicit `allowSignedBlockImport: true` |

## Isolation

Author JS / canvas isolation is unchanged (§22). Remote block `render` runs in the same React tree as Model A — prefer `canvasMode: "iframe"` so page scripts stay sandboxed.

## Related

[register-custom-block](./register-custom-block.md) · [dynamic-block-data-binding](./dynamic-block-data-binding.md) · [security](../concepts/security.md)
