# @itzsa/nepal-metal-rate

**Client** for Nepal gold/silver rates via **your** (itzsa) HTTP API — or any
compatible API you host. FeNeGoSiDA scraping, encryption, and cron live in
`@itzsa/nepal-metal-rate/server` (Node only).

> Unofficial. Attribute displayed rates to
> [FeNeGoSiDA](https://www.fenegosida.org/).

## Architecture

```
Cron (daily) ──► scrape / FeNeGoSiDA API ──► encrypt ──► Postgres
                                              │
Public API ◄── decrypt in memory ◄────────────┘
   ▲
npm client (@itzsa/nepal-metal-rate) ──► default itzsa API
                                      └─► or your baseUrl
```

| Layer | Package entry | Role |
| --- | --- | --- |
| App / users | `@itzsa/nepal-metal-rate` | Call HTTP API, show rates |
| Your backend | `@itzsa/nepal-metal-rate/server` | Ingest, encrypt-at-rest, cron |
| Hosted API | `/api/nepal-metal-rate/v1/*` | Read decrypted rates |

## Install (client)

```bash
pnpm add @itzsa/nepal-metal-rate
```

```ts
import { createMetalRateClient, getLatestRate } from "@itzsa/nepal-metal-rate";

// Default — itzsa hosted API
const gold = await getLatestRate({ metal: "GOLD" });

// Bring your own compatible backend
const mine = createMetalRateClient({
  baseUrl: "https://api.mycompany.com/metal-rates/v1",
  apiKey: process.env.MY_API_KEY, // optional Bearer
});
await mine.getHistory({
  metal: "SILVER",
  from: "2026-07-01",
  to: "2026-07-31",
});
```

## Public API contract (v1)

Compatible backends must implement:

| Method | Path | Query |
| --- | --- | --- |
| GET | `/rates/latest` | `metal`, `series?` |
| GET | `/rates` | `metal`, `from`, `to`, `series?` |

Success body:

```json
{ "ok": true, "data": { "date": "2026-07-31", "metal": "GOLD", "series": "DOMESTIC", "gmRate": 243485, "tolaRate": 284000, "fetchedAt": "…" } }
```

History: `{ "ok": true, "data": [ /* PublicRate[] */ ] }`

## Server (ingest + encrypt)

```bash
pnpm add @itzsa/nepal-metal-rate
# use subpath:
import { runDailyIngest } from "@itzsa/nepal-metal-rate/server";
```

Env (see `.env.example`):

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres |
| `METAL_RATE_ENCRYPTION_KEY` | AES-256 key (64-char hex preferred) |
| `CRON_SECRET` | Cron Bearer |
| `METAL_RATE_API_KEY` | Optional read API Bearer |

Rates in DB are **AES-256-GCM ciphertext** + **HMAC integrity** — plaintext
amounts never persist. API decrypts only in memory for responses. Logs use
`maskRateForLog`.

```bash
cd packages/nepal-metal-rate
pnpm exec prisma generate
pnpm exec prisma migrate dev --name encrypted_metal_rates
```

## Cron

Host route: `GET /api/cron/ingest` + `Authorization: Bearer $CRON_SECRET`  
Vercel: `"0 3 * * *"` ≈ 08:45 Asia/Kathmandu (UTC+5:45).

## Docs

- Package architecture: [`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md)
- Site: https://itzsa.acharya-suman.com.np/nepal-metal-rate
