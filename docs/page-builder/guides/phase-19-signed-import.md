# Phase 19 — signed dynamic import (GATED)

**Status: GATED / not shipped.** Do not implement or rely on this path in v1 / v1.x product code.

## Intent (future only)

If white-label SaaS later needs per-customer **executable** `render` without rebuilding the host:

- Host-controlled URL only
- Subresource integrity / signature check before load
- `import(url)` of a vetted bundle
- Same iframe isolation for any script the bundle injects

## Hard forbid (now and forever for unsigned paths)

| Forbidden | Use instead |
| --- | --- |
| `eval` / `new Function` of remote source | Never |
| Unsigned remote script as `render` | Model A bundled register · Model B JSON specs |
| “Trusted partner” skip of sandbox | Same sandbox + composers for everyone |

ADR-12 / §24.3: signed dynamic `import()` is **Phase 19 only**, marked not v1. Phases 1–18 do not unblock this.

## Until then

- Model A: bundle `BlockDefinition.render` with the host/plugin
- Model B: JSON field specs + primitive template trees
- Document capability needs in `capabilities`; never invent an eval escape hatch

## Related

[register-custom-block](./register-custom-block.md) · [dynamic-block-data-binding](./dynamic-block-data-binding.md) · [security](../concepts/security.md)
