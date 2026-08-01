# Persistence

## Client

- `getPrismaClient()` / `setPrismaClient(client)` — injectable singleton
- Schema owned by this package (no shared Prisma app in the monorepo yet)

## Writes

| API | Behavior |
| --- | --- |
| `upsertRateEntries(entries)` | Upsert by `(date, metal, series)` |
| `logIngestRun(result)` | Always insert; `rawResponse` via `sanitizeForStorage` |

## Reads

| API | Behavior |
| --- | --- |
| `getLatestRate(metal, { series? })` | Latest row (default series DOMESTIC) |
| `getRateHistory(metal, from, to, { series? })` | Inclusive date range |

## Masking (`sanitize.ts`)

`sanitizeForStorage` redacts keys matching auth/cookie/token/IP/UA/headers.
Rate values themselves are public market data — **not** masked.

## Least privilege

Grant the ingestion DB role only `rate_entries` + `ingest_logs`
(SELECT/INSERT/UPDATE) when the platform supports RBAC.
