# Sources

Each FeNeGoSiDA transport is a **`RateSource`** plugin.

## Contract

```ts
type RateSource = {
  id: string;          // kebab-case, stable in logs
  kind: "API" | "SCRAPE";
  priority: number;    // lower runs first
  description?: string;
  fetch(ctx: SourceContext): Promise<SourceResult>;
};
```

`SourceResult.auditPayload` must be **data-only** (rate arrays / mode flags).
Never attach HTTP headers, cookies, or tokens.

## Built-in

| id | kind | priority | File |
| --- | --- | --- | --- |
| `weekly-chart-api` | API | 10 | `weekly-chart-api.ts` |
| `html-scraper` | SCRAPE | 100 | `html-scraper.ts` |

### weekly-chart-api

- URL: `Dashboard/WeeklyChartRate?weekmonthyear=7` (override `FENEGOSIDA_API_URL`)
- Validates with `WeeklyChartRateSchema`
- Maps `goldData` / `silverData` → `series=DOMESTIC`
- Optional `includeInternational` → also persists `INTERNATIONAL` series

### html-scraper

- Cheerio parse of `https://www.fenegosida.org/`
- If SPA shell empty → `Dashboard/today` JSON (still `kind: SCRAPE`)
- Domestic GOLD/SILVER only

## Reserved (not registered yet)

See `future.ts`:

- `datewise-history-api`
- `rate-history-api`
- `monthwise-history-api`
- `fx-usd-api`

## Runtime registration

```ts
import { createMetalRateClient, type RateSource } from "@itzsa/nepal-metal-rate";

const mySource: RateSource = {
  id: "datewise-history-api",
  kind: "API",
  priority: 20,
  async fetch(ctx) { /* … */ return { entries, auditPayload }; },
};

const client = createMetalRateClient();
client.registerSource(mySource);
await client.runDailyIngest();
```
