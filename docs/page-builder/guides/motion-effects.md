# Guide: Motion Effects

Add Elementor-like entrance and hover animations without a second render path.

## Steps

1. Open the create editor (`/page-builder/create` in this monorepo).
2. Select any block.
3. Open the **Advanced** tab → **Motion Effects**.
4. Pick an **Entrance** (e.g. `fadeInUp`), optional **Hover**, then duration / delay / trigger.
5. Save the page — `block.motion` is part of the JSON document.
6. Check **Preview** and **Open Page**: the same animation must play (render parity).

## From host code

```tsx
import {
  composePageCss,
  composePageJs,
  initPbMotion,
  type Block,
} from "@itzsa/page-builder";

const block: Block = {
  id: "hero-title",
  type: "heading",
  props: { level: "h1" },
  i18nProps: { en: { title: "Welcome" } },
  motion: {
    entrance: "fadeInUp",
    trigger: "scroll",
    durationMs: 700,
    delayMs: 100,
    hover: "float",
  },
};

// Open Page / Preview already compose CSS + JS via OpenPageView.
// Embedded canvas: after paint, call initPbMotion(canvasRoot).
```

## Do / don’t

| Do | Don’t |
| --- | --- |
| Store intent on `block.motion` | Bake fades into every primitive’s default CSS |
| Rely on composers + `initPbMotion` | `eval` / Framer-only in core for basic entrances |
| Verify canvas === preview === open | Animate only in the editor iframe |

## Related

[motion concept](../concepts/motion.md) · [render-parity](../concepts/render-parity.md) · [custom-css-js](./custom-css-js.md)
