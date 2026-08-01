# Security

## Secrets

| Env | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma Postgres URL |
| `CRON_SECRET` | Bearer token for `/api/cron/ingest` |
| `FENEGOSIDA_API_URL` | Optional API override |
| `FENEGOSIDA_SCRAPE_URL` | Optional scrape override |

Never commit real values. Use `.env.example` placeholders only.

## Cron route (host app)

1. Reject missing/wrong `Authorization: Bearer ${CRON_SECRET}` with **401**
2. Do not rely solely on `x-vercel-cron`
3. Return generic `{ ok: true|false }` — log details server-side only
4. No stack traces in response bodies

## Validation

- Every external payload → Zod `safeParse` before DB
- Scraped text → `sanitizeNumericText` before `parseFloat`
- No `eval`, no blind casts

## Audit

- Every ingest writes `IngestLog` (success or failure)
- `pnpm run audit` / workspace `security-audit.yml` — fail on high+

## Logging

Allowed: source id/kind, record count, duration, non-sensitive error messages.  
Forbidden: secrets, connection strings, full request headers, raw auth cookies.
