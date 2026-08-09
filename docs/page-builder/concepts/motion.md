# Motion effects (entrance + hover)

Elementor-style **Motion Effects** on any block via `block.motion`. Canvas, Preview, and Open Page share the same React `render` and the same composed CSS/runtime (ADR-01 / render parity).

## Authoring (inspector)

Create editor → select a block → **Advanced → Motion Effects**:

| Control | Values |
| --- | --- |
| Entrance | `none`, `fadeIn`, `fadeInUp`, `fadeInDown`, `fadeInLeft`, `fadeInRight`, `zoomIn`, `slideInLeft`, `slideInRight` |
| Trigger | `scroll` (IntersectionObserver, default) · `load` (on mount) |
| Duration / Delay | milliseconds (defaults `600` / `0`) |
| Hover | `none`, `grow`, `shrink`, `float` |

Omit `motion`, or set entrance/hover to `none` — the engine adds **no** decorative animation CSS for that block.

## Data model

```ts
import type { BlockMotion } from "@itzsa/page-builder";

block.motion = {
  entrance: "fadeInUp",
  trigger: "scroll",
  durationMs: 600,
  delayMs: 0,
  hover: "grow",
} satisfies BlockMotion;
```

Persists on `Page` JSON with the rest of the block. Schema-validated (`motion` object is optional + strict).

## How it runs

1. **`blockRootAttrs`** emits `data-pb-motion`, `data-pb-motion-trigger`, and/or `data-pb-hover` when active.
2. **`composePageCss`** prepends shared keyframes **only if** any block on the page uses motion; per-block `--pb-motion-duration` / `--pb-motion-delay` vars are composed into `.b-{id}`.
3. **Entrance runtime**
   - Preview / Open Page / iframe canvas: `composePageJs` appends a small IntersectionObserver script (no `eval`).
   - Embedded editor canvas: `initPbMotion(root)` (author JS is not otherwise injected into the editor parent).
4. **Hover** is CSS-only (`:hover` transforms).
5. **`prefers-reduced-motion: reduce`** skips entrance hiding / animation (content stays visible).

## Programmatic helpers

```ts
import {
  getBlockMotion,
  normalizeMotion,
  initPbMotion,
  pageUsesMotion,
  composePageCss,
  composePageJs,
} from "@itzsa/page-builder";

normalizeMotion({ entrance: "none" }); // → undefined (clears idle motion)
pageUsesMotion(page.blocks);           // whether MOTION_CSS should compose
```

## Limits

| Case | Behavior |
| --- | --- |
| No motion on page | No motion stylesheet / runtime injected |
| React re-render after play | Played ids remembered (`__pbMotionPlayed`) — no re-hide |
| Custom author CSS | May target `[data-pb-motion="fadeInUp"]` if needed; prefer inspector presets |

## Related

[author-css](./author-css.md) · [composition](./composition.md) · [render-parity](./render-parity.md) · [inspector-fields](../editor/inspector-fields.md) · [motion-effects guide](../guides/motion-effects.md)
