# Drag and drop

```text
Hit-test inside iframe → canvasBridge → useDragAndDrop → blockTree → history → RenderPage
Overlays (ghost, drop line) drawn in PARENT only
```

## Contract

| Rule | Detail |
| --- | --- |
| Chrome | Ghost / drop line = parent overlays — never page DOM |
| Acceptance | Use `canAcceptChild` / registry — **no** `switch (type)` in DnD |
| Palette | Inserts primitive, **preset tree**, or registered custom types (§24) |
| Outline | Same `blockTree` move ops when outline reorder is enabled |
| History | Every drop is undoable |

## Payload kinds

- Block move (existing tree node)
- Palette primitive (`kind: "block"`)
- Preset (`kind: "preset"` → `create()` expands to nested primitives)

## Failure modes

| Case | Behavior |
| --- | --- |
| Invalid drop target | Reject; no partial insert |
| Bridge spoof | Typed envelope + source check (§22.5) — DnD only, never privileged I/O |

## Related

[outline-tree](./outline-tree.md) · [clipboard](./clipboard.md) · [composition](../concepts/composition.md)
