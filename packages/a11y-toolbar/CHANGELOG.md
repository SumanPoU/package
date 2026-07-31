# Changelog

All notable changes to `@itzsa/a11y-toolbar` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-07-30

First public release.

### Added
- Floating accessibility preference toolbar (text size, contrast, spacing, motion, reading aids)
- Keyboard shortcuts registry (`DEFAULT_A11Y_SHORTCUTS`, `mergeA11yShortcuts`)
- **Read Aloud** — click-to-speak under `[data-a11y-content]` with pause/resume/stop and `speechRate` (0.5–2)
- Theme / CSS custom property customization (`theme`, `style`, `CSS_VAR`)
- SSR FOUC bootstrap (`getA11yFoucScript` / `/headless`)
- Browser/CDN drop-in (`ItzsaA11yToolbar.mount`)
- English + Nepali i18n dictionaries

### Fixed
- Bigger cursor applied page-wide immediately (including while the panel is open)

### Docs
- Architecture flowchart, WCAG POUR mapping, React/Next/Vite examples

[0.1.0]: https://www.npmjs.com/package/@itzsa/a11y-toolbar/v/0.1.0
