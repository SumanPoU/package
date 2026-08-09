# Page builder docs

Integrator-facing documentation for `@itzsa/page-builder`.

**Live docs (recommended):** monorepo site route `/page-builder` — structured like Puck (Introduction → Getting started → Integrating → API reference → Guides).

**Design authority:** repo root `ARCHITECTURE-PAGE-BUILDER.md`.

## On the docs site

| Section | What it covers |
| --- | --- |
| Introduction | What it is, features table, demo CTA |
| Getting started | Install, `PageBuilder`, `RenderPage` / `OpenPageView`, **show page on your site** |
| Integrating | Blocks, Flex/Grid nesting, locales, CSS/JS, images, **background**, typography, visibility, capabilities, **palette filters**, canvas |
| Integrating | Blocks, data model, locales, CSS/JS, images, visibility, data sources, capabilities, canvas, theming |
| API reference | Props tables + host callbacks + `validateAuthorCode` |
| Guides | Links into the markdown tree below |

## Markdown topic tree

### Start here

- [Data model](./concepts/data-model.md)
- [Registry](./concepts/registry.md)
- [Render parity](./concepts/render-parity.md)
- [Host callbacks](./api/host-callbacks.md)
- [Add a block](./guides/add-a-block.md)
- [Show page on your site](./guides/show-page-on-site.md) — save → fetch → `OpenPageView`

### Concepts

[composition](./concepts/composition.md) · [locales](./concepts/locales.md) · [visibility](./concepts/visibility.md) · [data-binding](./concepts/data-binding.md) · [author-css](./concepts/author-css.md) · [preview](./concepts/preview.md) · [persistence](./concepts/persistence.md) · [security](./concepts/security.md) · [accessibility](./concepts/accessibility.md)

### Editor

[outline](./editor/outline-tree.md) · [clipboard](./editor/clipboard.md) · [dnd](./editor/drag-and-drop.md) · [inspector](./editor/inspector-fields.md)

### API

[PageBuilder](./api/PageBuilder.md) · [registerBlock](./api/registerBlock.md) · [field-types](./api/field-types.md) · [sandbox](./api/sandbox-policy.md)

### Guides

[custom CSS/JS](./guides/custom-css-js.md) · [Model A](./guides/register-custom-block.md) · [Model B](./guides/dynamic-block-data-binding.md) · [blog card loop](./guides/dynamic-blog-card.md) · [show on site](./guides/show-page-on-site.md) · [add a locale](./guides/add-a-locale.md) · [signed import](./guides/phase-19-signed-import.md)

### §18.1 layout

Matches architecture: `concepts/` (incl. author-css, accessibility, composition), `editor/`, `api/`, `guides/` (incl. show-page-on-site + phase-19-signed-import).
