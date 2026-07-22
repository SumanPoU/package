# @itzsa/nrb-forex

Typed TypeScript client for the **Nepal Rastra Bank (NRB)** public Forex API —
fetch daily rates, convert foreign currency → NPR with correct `unit` handling,
cache politely, and retry transient network failures.

> **Unofficial wrapper.** This package is **not affiliated with, endorsed by, or
> maintained by Nepal Rastra Bank**. It consumes NRB’s publicly documented HTTP
> API as a convenience for developers. Rate accuracy and availability remain
> subject to NRB’s publication schedule and API.

## Install

```bash
pnpm add @itzsa/nrb-forex
```

Node 18+ (native fetch). Also works in modern browsers (use a server proxy — NRB has no CORS).

**Docs:** https://itzsa.acharya-suman.com.np/nrb-forex

## Quick start

```ts
import {
  getRate,
  getRatesForDate,
  getRateHistory,
  convert,
  createNrbForexClient,
} from "@itzsa/nrb-forex";

const usd = await getRate("USD"); // today (UTC date)
const all = await getRatesForDate("2026-07-17");
const history = await getRateHistory("USD", "2026-07-01", "2026-07-17");

// 100 INR → NPR using NRB buy side (unit=100 aware)
const npr = await convert(100, "INR", "NPR", {
  date: "2026-07-17",
  side: "buy",
});

// Weekend / holiday: opt-in fallback to last published business day
const client = createNrbForexClient({ fallbackToPreviousDay: true });
await client.getRate("USD", "2026-07-19");
```

## NRB Forex API (V1)

Upstream contract this package wraps.

| Item | Detail |
| --- | --- |
| **Base URL** | `https://www.nrb.org.np/api/forex/v1/` |
| **Endpoint** | `GET /rates` |
| **Full URL** | `https://www.nrb.org.np/api/forex/v1/rates` |
| **Required params** | `from`, `to` (`Y-m-d`), `page`, `per_page` (integer **1–100**) |
| **Publication** | Typically **once per business day**. Weekends/public holidays often have **no** payload — use `{ fallbackToPreviousDay: true }` when you need the last known official rate |
| **Immutability** | Past dates do not change once published; this client caches them indefinitely |
| **`unit` quirk** | Rates are quoted **per `unit` foreign units**, not always per 1. Live examples (2026-07): INR/KRW `unit: 100`, JPY `unit: 10`. Always divide `buy`/`sell` by `unit` for a per-1 NPR rate (or use `convert` / `perUnitRates`) |

```http
GET https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=100&from=2026-07-17&to=2026-07-17
```

### Query parameters

| Param | Description |
| --- | --- |
| `from` | Starting date (`Y-m-d`). Required. |
| `to` | Ending date (`Y-m-d`). Required. |
| `page` | Current page (cursor). Required. |
| `per_page` | Items per page (1–100). Required. |

### Response envelope

| Field | Description |
| --- | --- |
| `status.code` | `200` OK · `400` Bad Request / invalid arguments |
| `errors.validation` | Field errors for `per_page`, `page`, `from`, `to` |
| `params` | Echo of GET parameters |
| `data.payload` | Array of daily snapshots, or `null` when empty/invalid |
| `pagination` | `page`, `pages`, `per_page`, `total`, `links.prev`, `links.next` |

### `data.payload[]` day object

| Field | Description |
| --- | --- |
| `date` | FOREX rates for this calendar date |
| `published_on` | Publish timestamp |
| `modified_on` | Last modified timestamp |
| `rates` | Array of currency quotes |

### `rates[]` currency object

| Field | Description |
| --- | --- |
| `currency.name` | Display name |
| `currency.iso3` | ISO 4217 alpha-3 |
| `currency.unit` | Units buy/sell are quoted for |
| `buy` | Buying rate in NPR |
| `sell` | Selling rate in NPR |

### Live API notes

- Successful responses also include `errors` and `params` alongside `status` / `data` / `pagination`.
- Some calendar Saturdays may still return a published rate row — do not assume “weekend ⇒ empty”; rely on empty `payload` instead.
- Official host has **no CORS** — browsers need a proxy (docs use `/api/nrb-forex`).
- If NRB changes param names or payload shape, open an issue — this client follows the documented v1 contract above.

## Caching

Default: in-memory `MemoryForexCache` (fine for a long-lived Node process).

NRB usually publishes **once per business day** (~09:00–10:00 NST) and may apply
**slight midday revisions**. Caching follows that:

| Snapshot day (NST) | TTL |
| --- | --- |
| **Past** | Forever (`null`) — treated as immutable |
| **Today / future** | Soft **2 hours** — picks up rare revisions without hammering NRB |

Also:

- Concurrent calls for the same range **coalesce** into one HTTP request.
- Use `{ fallbackToPreviousDay: true }` before the morning publish / on weekends.
- On **serverless**, inject Redis (or similar) via `ForexCache` so instances share state.
- Browsers should call a **proxy** with `Cache-Control` — never NRB directly (no CORS).

```ts
import { createNrbForexClient, MemoryForexCache, type ForexCache } from "@itzsa/nrb-forex";

const client = createNrbForexClient({
  cache: new MemoryForexCache(),
  fallbackToPreviousDay: true,
});

const redisCache: ForexCache = {
  async get(key) { /* … */ },
  async set(key, value, ttlMs) { /* … */ },
  async has(key) { /* … */ },
};

const shared = createNrbForexClient({ cache: redisCache });
```

## Errors

| Class | When |
| --- | --- |
| `NrbValidationError` | Bad currency/date/range before network |
| `NrbApiError` | Upstream HTTP/JSON/malformed money strings |
| `NrbRateNotFoundError` | Valid call, but no published rate (e.g. empty day without fallback) |

Network failures retry with exponential backoff (**3** attempts by default).

## Node helpers

```ts
import { syncDailyRates } from "@itzsa/nrb-forex/node";

await syncDailyRates({
  write: async (snapshot) => {
    // upsert snapshot.rates into your DB
  },
});
```

CLI (after install):

```bash
npx nrb-forex USD 2026-07-17
npx nrb-forex USD 2026-07-19 --fallback
```

## API

- `getRate(currency, date?, options?)`
- `getRatesForDate(date?, options?)`
- `getRateHistory(currency, from, to)`
- `getRatesInRange(from, to)`
- `convert(amount, from, 'NPR', options?)`
- `getSupportedCurrencies(date?, options?)`
- `createNrbForexClient(options?)` / `NrbForexClient`
- `perUnitRates(rate)` / `convertAmount(amount, rate, side)`

## License

MIT
