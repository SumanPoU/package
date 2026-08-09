# @itzsa/page-builder

## 0.0.0

### Added

- Phase 1: core types, registry, block tree, Zod schemas, locale config + `i18nResolve`
- Phase 2: primitives (`box`/`container`, `flex`, `grid`, `heading`, `text`, `image`, `button`)
- Phase 3: `RenderPage`, canvas frame/document, sandbox + CSP helpers, bridge
- Phase 4: `PageBuilder` chrome (palette, outline, inspector, history, locale switcher)
- Phase 5: clipboard + keyboard shortcuts (copy/cut/paste/duplicate/delete)
- Phase 6: palette DnD hook + drop overlay wiring
- Phase 7–8: preview session store (opaque id only) + `OpenPageView`
- Phase 9–11: CSS/JS composers, rich-text sanitizer, revision match helper
- Visibility resolve + registration guard (early slices of later phases)
- `uploadAsset` host context; image placehold.co default + Base64/CDN upload; width/height
- Image Content: preview, content width, alignment, link; shared `MediaUrlField` (CDN/Base64)
- Background Type color|image with opacity + dark overlay (containers + Style tab)
- Flex/Grid ContentFields: direction/justify/align/gap/columns
- Primitives: `list`, `video`, `html` (sanitized)
- Primitives: `badge`, `icon`, `code`, `map` (Google Maps iframe parse), `embed`
- List Content: list-style markers + per-item rows / Add / delete
- Spacer labeled **Space**; Divider thickness/color fields
- Demo upload route imports `../../../page-builder/media-store`
- `PaletteConfig` — hideCategories / hideBlocks / hidePresets
- Typography: typeable font weight, letter-spacing units, host `fontFamilies`
- `validateAuthorCode` for host save/publish re-validation
- Locale presets: `createEnglishOnlyLocaleConfig` / `createNepaliOnlyLocaleConfig` / `createLocaleConfig`
- `canvasMode: "iframe"` + `IframeCanvasStage` (sandboxed shell via `canvasSrc`)
- `PageBuilder` UI `features` flags (save/preview/open)
