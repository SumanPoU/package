# Register a custom block (Model A)

Tenants and plugins add block types **without forking the engine** by registering a bundled `BlockDefinition` before mounting the editor (§24 Model A).

## Rules

| Rule | Detail |
| --- | --- |
| Namespace | Non-core types **must** be `tenant:…` or `plugin:vendor.block` |
| No collision | Cannot register `tenant:heading` (bare id reserved for core) |
| No silent override | Duplicate `type` throws |
| No remote eval | `render` ships in the host/plugin bundle — never `eval` / `new Function` |
| Unknown at render | `FallbackBlock` — tree-preserving placeholder |

## Example

```ts
import {
  createRegistry,
  registerBlock,
  registerPrimitives,
  type BlockDefinition,
} from "@itzsa/page-builder";
import { z } from "zod";

const calloutDefinition: BlockDefinition = {
  type: "tenant:callout",
  label: "Callout",
  category: "basic",
  source: "tenant",
  defaultProps: { tone: "info" },
  defaultI18nProps: { en: { body: "Note" } },
  translatableProps: ["body"],
  sharedProps: ["tone"],
  propsSchema: z
    .object({
      tone: z.enum(["info", "warn"]).optional(),
      body: z.string().optional(),
    })
    .passthrough(),
  render: ({ block, props }) => (
    <aside data-block-id={block.id} data-tone={String(props.tone ?? "info")}>
      {String(props.body ?? "")}
    </aside>
  ),
  ContentFields: ({ block, onChange, locale }) => (
    <textarea
      value={String(block.i18nProps?.[locale]?.body ?? "")}
      onChange={(e) =>
        onChange({
          i18nProps: {
            ...block.i18nProps,
            [locale]: { ...block.i18nProps?.[locale], body: e.target.value },
          },
        })
      }
    />
  ),
};

const registry = createRegistry();
registerPrimitives(registry);
registerBlock(registry, calloutDefinition);

// Optional capability gate
registerBlock(registry, otherPluginDef, {
  allowRegisterPluginBlocks: true,
  allowRegisterTenantBlocks: true,
});
```

## Capabilities

`PageBuilder` / `registerBlock` honor:

- `allowRegisterPluginBlocks` (default allow)
- `allowRegisterTenantBlocks` (default allow)

Set to `false` to reject that `source` at registration time.

## Related

- Live registry refine: `createPageSchema({ registry })`
- Model B (JSON specs, no custom render): Phase 16
- Fallback: `FallbackBlock` when `type` is missing from the registry
