# Extending with a new API type

Checklist for the next FeNeGoSiDA endpoint (e.g. datewise history).

## 1. Capture a sample payload

Save a redacted fixture under `test/fixtures/` (no cookies/tokens).

## 2. Add Zod

```ts
// schema/sources.ts
export const DatewiseHistorySchema = z.object({ /* … */ });
```

## 3. Normalize → RateEntry

Prefer reusing `chartPointsToEntries` / `toUtcDateOnly`.  
Choose `series` carefully (`DOMESTIC` vs new key).

## 4. Implement RateSource

```ts
// sources/datewise-history-api.ts
export const createDatewiseHistorySource = (): RateSource => ({
  id: "datewise-history-api",
  kind: "API",
  priority: 20, // after weekly-chart (10), before scrape (100)
  description: "Dashboard/datewisehistory",
  async fetch(ctx) {
    const json = await fetchJson({ url, ...ctx });
    const parsed = DatewiseHistorySchema.safeParse(json);
    if (!parsed.success) {
      throw new MetalRateSchemaError("datewise-history-api", "…", parsed.error.issues);
    }
    const entries = /* map → RateEntry[] */;
    if (!entries.length) throw new MetalRateEmptyError("datewise-history-api");
    return { entries, auditPayload: { /* data only */ } };
  },
});
```

## 5. Register

**Default chain** (ships to all consumers):

```ts
// sources/index.ts — createDefaultSources()
createDatewiseHistorySource(),
```

**App-only** (no package default change):

```ts
createMetalRateClient({
  extraSources: [createDatewiseHistorySource()],
});
```

## 6. Tests + docs

- Unit-test normalize/parse with the fixture
- Update `docs/sources.md` and remove the id from “reserved” in `future.ts`
- Run `typecheck` / `test` / `build` / `prisma validate`

## Priority conventions

| Range | Role |
| --- | --- |
| 1–9 | Overrides / paid / preferred mirrors |
| 10–49 | Primary FeNeGoSiDA JSON APIs |
| 50–99 | Secondary / historical APIs |
| 100+ | Scrape / last-resort |
