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

## Checklist

- [ ] Namespaced if non-core (`tenant:` / `plugin:`)
- [ ] Duplicate `type` would throw (don’t silent-override)
- [ ] No `eval` — `render` is bundled
- [ ] A11y smoke on `render` + inspector controls
- [ ] Unknown-type pages still get `FallbackBlock`

## Related

[registerBlock](../api/registerBlock.md) · [register-custom-block](./register-custom-block.md) · [composition](../concepts/composition.md)
