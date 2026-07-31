# Changelog

All notable changes to `@itzsa/captcha` are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-07-31

First public release.

### Added
- Canvas text captcha with charset modes
- **MathCaptcha** — BODMAS engine, stack/inline layouts, auto-refresh on wrong answer
- **SliderCaptcha**
- Shared headless helpers (`generateMathChallenge`, `verifyMathAnswer`, etc.)
- Dual trust models: client-local verify vs server challenge (`serverChallenge` + `onRequestChallenge`)
- Company-standard docs for Client vs Server flows

[0.1.0]: https://www.npmjs.com/package/@itzsa/captcha/v/0.1.0
