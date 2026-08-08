# `registerBlock`

Register a `BlockDefinition` into the live registry with namespace / collision / capability guards (§24 Model A). Prefer this over raw `registry.register`.

```ts
import {
  createRegistry,
  registerPrimitives,
  registerBlock,
  type BlockDefinition,
} from "@itzsa/page-builder";
```

## Signature

```ts
registerBlock(
  registry: BlockRegistry,
  definition: BlockDefinition,
  capabilities?: RegistrationCapabilities,
): void
```

## Rules

| Rule | Detail |
| --- | --- |
| Namespace | Non-core types must be `tenant:…` or `plugin:vendor.block` |
| Collision | Duplicate `type` → **loud error** (no silent override) |
| No eval | `render` ships in the host/plugin bundle |
| Capabilities | `allowRegisterTenantBlocks` / `allowRegisterPluginBlocks` |
| Unknown at render | `FallbackBlock` — tree-preserving placeholder |

## Lifecycle

1. `createRegistry()` → `registerPrimitives(registry)`
2. Host/plugin `registerBlock(registry, def, capabilities)`
3. Live `.refine()` accepts instances of the new `type`
4. Plugin removed → existing pages must not crash (fallback)

## Related

[register-custom-block](../guides/register-custom-block.md) · [registry](../concepts/registry.md) · [field-types](./field-types.md)
