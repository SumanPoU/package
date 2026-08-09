# Guide: add a block

Add a **core-style** or host **Model A** block without forking the engine.

## Steps

1. Define `BlockDefinition`: `type`, `label`, `category`, `defaultProps`, `propsSchema`, `render`, `ContentFields`.
2. Declare `translatableProps` / `sharedProps` / `defaultI18nProps` for i18n.
3. Register after primitives:

```ts
const registry = createRegistry();
registerPrimitives(registry);
registerBlock(registry, myDefinition, capabilities);
```

4. Ensure `render` uses semantic HTML and author CSS only (no engine decorative skins).
5. Mount `PageBuilder` / `RenderPage` with the same registry (parity).

## Failure modes

| Failure | Behavior |
| --- | --- |
| Duplicate `type` | Throws — no silent override |
| Non-core without `tenant:` / `plugin:` | Registration guard rejects |
| `allowRegisterTenantBlocks: false` | Tenant registration throws |
| Unknown type at render | `FallbackBlock` — tree preserved |
| Different registry on Open Page | Missing blocks / fallback |

## Checklist

- [ ] Namespaced if non-core (`tenant:` / `plugin:`)
- [ ] No `eval` — `render` is bundled (or Phase 19 signed import)
- [ ] A11y smoke on `render` + inspector controls
- [ ] Capability flags honored on host + server

## Related

[registerBlock](../api/registerBlock.md) · [register-custom-block](./register-custom-block.md) · [composition](../concepts/composition.md) · [accessibility](../concepts/accessibility.md)
