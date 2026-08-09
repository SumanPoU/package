# Accessibility (ADR-13)

Every block `render` (canvas + Open Page) and all editor chrome must meet **WCAG 2.2 Level AA**. Accessibility is not optional polish.

## Contract

| Surface | Requirement |
| --- | --- |
| Block `render` | Semantic HTML (`h1`–`h6`, `button`, `a`, `img` with `alt`, `blockquote`, alerts with `role`); no click-only `div` buttons |
| Editor chrome | Focusable controls, `aria-*` where needed; Outline / Inspector keyboard-operable |
| Rich text | Sanitized subset stays keyboard-navigable; links have discernible text |
| Locale / `dir` | Honor `lang` / `dir` from active locale (§19) |

## Limits & failure modes

| Limit | Behavior |
| --- | --- |
| Host Model A `render` skips semantics | Engine cannot auto-fix; host owns a11y for custom types |
| Decorative container backgrounds | Use CSS/background props — not a fake `<img>` without alt |
| Empty `alt` on meaningful images | Author responsibility; smoke test only asserts `alt` attribute presence on the `image` primitive |

## Smoke gate (§14)

Package test `a11ySmoke.test.ts` renders every `CORE_PRIMITIVE_TYPES` `render` via `renderToStaticMarkup` and asserts semantic tags (no new a11y deps). New primitives must extend that list.

## Integrator rules

- New primitives ship an a11y smoke assertion
- Host-provided Model A `render` must satisfy the same semantic contract
- Prefer `createProductionCapabilities()` so custom JS stays off unless needed

## Related

[render-parity](./render-parity.md) · [inspector-fields](../editor/inspector-fields.md) · [composition](./composition.md)
