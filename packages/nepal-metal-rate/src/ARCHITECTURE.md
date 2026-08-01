# Architecture — `@itzsa/nepal-metal-rate`

## Product shape (what we build)

1. **Cron + ingest (server)** — scrape FeNeGoSiDA site and/or call their JSON API,
   validate with Zod, **encrypt** amounts, store in **our** Postgres.
2. **Our HTTP API** — decrypt in memory, return public JSON (`/api/nepal-metal-rate/v1`).
3. **npm package (client)** — apps call **our** API (default) or a **user-supplied**
   `baseUrl` that implements the same contract, then display rates.

Consumers never scrape FeNeGoSiDA from the browser package.

## Entries

| Import | Use |
| --- | --- |
| `@itzsa/nepal-metal-rate` | HTTP client + contract types |
| `@itzsa/nepal-metal-rate/server` | Ingest, crypto, Prisma, cron helper |

## Encrypt-at-rest

- Algorithm: AES-256-GCM (`METAL_RATE_ENCRYPTION_KEY`)
- Columns: `gmRateEnc`, `tolaRateEnc`, per-field HMAC + `rowIntegrity`
- Logs: `maskRateForLog` — never print full rates
- `IngestLog.rawResponse`: `sanitizeForStorage` (strip headers/cookies/tokens)

Hashing alone cannot serve rates back — we use **reversible encryption** plus
**HMAC** for integrity (not password hashing).

## Module map

```
src/
  index.ts / client.ts / contract/   ← public client
  server/
    crypto.ts · db.ts · ingest.ts · cron/
    sources/ · pipeline/ · schema/
```

## Adding FeNeGoSiDA endpoints

Implement `RateSource` under `server/sources/`, register in `createDefaultSources`
or `registry.register`. See `src/docs/extension.md`.
