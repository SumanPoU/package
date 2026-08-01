# Schema

## Normalized row (`schema/rate-entry.ts`)

| Field | Type | Notes |
| --- | --- | --- |
| `date` | `Date` | UTC midnight calendar day |
| `metal` | `GOLD` \| `SILVER` | Prisma enum — extend in lockstep |
| `series` | string | `DOMESTIC` default; UPPER_SNAKE |
| `gmRate` | number | NPR / gram → Decimal(12,2) |
| `tolaRate` | number | NPR / tola |
| `source` | `API` \| `SCRAPE` | Transport class |
| `fetchedAt` | `Date` | Ingest timestamp |

DB unique: `(date, metal, series)`.

## Upstream payloads (`schema/sources.ts`)

| Schema | Endpoint |
| --- | --- |
| `WeeklyChartRateSchema` | WeeklyChartRate |
| `TodayRateListSchema` | Dashboard/today |
| `ApiDayPointSchema` | Shared chart day point |

Add one Zod family per new upstream contract — do not overload an existing schema
with optional-everything blobs.

## Prisma

See `prisma/schema.prisma`. After changing models:

```bash
pnpm exec prisma migrate dev --name <change>
pnpm exec prisma generate
```
