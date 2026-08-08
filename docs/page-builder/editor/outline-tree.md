# Outline tree

Left sidebar **OutlineTree** mirrors `Page.blocks` nesting (layers). Product requirement (§10.4) — not optional chrome.

## Contract

| Behavior | Detail |
| --- | --- |
| Structure | Expand/collapse containers; same tree as canvas |
| Select | Click selects `selectedId` — stays in sync with canvas |
| Reorder | Optional drag-reorder uses same `blockTree` ops as canvas DnD |
| Labels | `BlockDefinition.label` + optional content preview (first heading text, …) |
| Hidden blocks | Conditionally invisible / author-hidden blocks **still appear**, dimmed (§23) — hide ≠ delete |
| Repeater | Shows repeater + **template** children — not N expanded clones as persistent nodes |

## Invariants

- Selection chrome remains parent overlays only
- Mutating outline ops go through history (`useBlockHistory`)
- No `switch (block.type)` — containers via `isContainer` / registry

## Failure modes

| Issue | Rule |
| --- | --- |
| Outline out of sync | Same `selectedId` source of truth as canvas |
| Expanded clones in outline | Never persist expansion; outline edits the template |

## Related

[clipboard](./clipboard.md) · [drag-and-drop](./drag-and-drop.md) · [visibility](../concepts/visibility.md)
