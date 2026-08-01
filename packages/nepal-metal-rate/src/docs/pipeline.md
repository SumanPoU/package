# Pipeline

## Registry (`pipeline/registry.ts`)

- `createSourceRegistry(initial?)` — mutable map of `RateSource`
- `list()` — sorted by `priority` asc, then `id`
- `register` / `unregister` / `get`

Duplicate `id` replaces the previous plugin (hot-swap friendly).

## Runner (`pipeline/runner.ts`)

`runSourceChain(options)`:

1. Resolve registry (custom or default FeNeGoSiDA set)
2. Optional `sourceIds` filter
3. Build `SourceContext` (fetch, timeouts, retries, log, config)
4. Try each source; on success + non-empty validated entries → return
5. On total failure → `success: false` with combined `errorMsg` and `attempts[]`

**Never throws.** Callers always get `IngestResult`.

## Normalize (`pipeline/normalize.ts`)

- `chartPointsToEntries` — ApiDayPoint[] → RateEntry[]
- `normalizeWeeklyChart` — full WeeklyChart payload helper
- `validateEntries` — defense-in-depth Zod at pipeline boundary

## Ingest vs cron

| Function | DB writes | Use when |
| --- | --- | --- |
| `ingestDailyRates` | no | Preview / custom persistence |
| `runDailyIngest` | upsert + IngestLog | Cron / production job |
