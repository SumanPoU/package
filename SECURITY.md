# Security Policy

## Supported versions

Security fixes are applied on the `main` branch of this monorepo. Published
npm packages under `@itzsa/*` receive fixes in the next patch release of the
affected package.

| Package surface | Support |
| --- | --- |
| Docs site (`itzsa.acharya-suman.com.np`) | Current `main` |
| `@itzsa/*` npm packages | Latest published version per package |
| Docs/demo API routes (`/api/*`) | Demo-grade — not a production payment/auth SaaS |

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security bugs.

1. Email **sumanacharya186@gmail.com** (or open a private GitHub Security Advisory
   on [SumanPoU/package](https://github.com/SumanPoU/package)).
2. Include: package or route, impact, reproduction steps, and whether you plan
   a coordinated disclosure.
3. You should receive an acknowledgement within **72 hours**.

We will work with you on a fix timeline and credit (optional).

## What we consider in-scope

- XSS / HTML injection via `@itzsa/editor` sanitization gaps
- Authz / token forgery in docs captcha HMAC / humanPass flows
- Secret leakage in published package tarballs
- Dependency supply-chain issues affecting published packages
- Missing or broken security headers on the docs origin

## Out of scope

- Denial of service against the public docs playground
- Issues that require physical access or compromised developer machines
- Vulnerabilities in third-party gateways (eSewa / Khalti / ConnectIPS) themselves
- Social engineering

## Production hardening checklist (host apps)

When you ship `@itzsa/*` in production:

1. **Never** trust client-supplied payment secrets — keep them server-only.
2. Set strong secrets: `CAPTCHA_HMAC_SECRET` (≥32 random bytes), gateway keys
   via environment / secret manager — never commit `.env.local`.
3. Verify payments **server-side** (`@itzsa/nepal-pay` confirm APIs).
4. Sanitize any HTML passed into `@itzsa/editor` through the package security
   helpers (or your own allowlist).
5. Prefer npm **provenance**-attested publishes when available.
6. Keep Next.js and React on patched minors (`pnpm audit` / Dependabot).

## Automated controls in this repo

- Security response headers on the docs Next.js app (`next.config.ts`)
- Dependabot updates (`.github/dependabot.yml`)
- `pnpm audit` CI job (`.github/workflows/security-audit.yml`)
- Captcha HMAC secret **required** when `NODE_ENV=production`
