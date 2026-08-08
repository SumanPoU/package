# Accessibility (ADR-13)

Every block `render` (canvas + Open Page) and all editor chrome must meet **WCAG 2.2 Level AA** and the repo Web Interface Guidelines. Accessibility is not optional polish.

## Contract

| Surface | Requirement |
| --- | --- |
| Block `render` | Semantic HTML (`h1`–`h6`, `button`, `a`, `img` with `alt` from props/i18n); no click-only `div` buttons |
| Editor chrome | Focusable controls, `aria-*` where needed; Outline / Inspector keyboard-operable |
| Rich text | Sanitized subset stays keyboard-navigable; links have discernible text |
| Locale / `dir` | Honor `lang` / `dir` from active locale (§19.5) |

## Why

Inaccessible primitives multiply inaccessible published pages. Editor chrome that cannot be used with keyboard/AT excludes authors.

## Integrator rules

- New primitives ship an a11y smoke check (§14)
- Host-provided Model A `render` functions must satisfy the same semantic contract
- Contrast / focus visibility apply to page content **and** parent chrome

## Related

[render-parity](./render-parity.md) · [inspector-fields](../editor/inspector-fields.md) · [outline-tree](../editor/outline-tree.md)
