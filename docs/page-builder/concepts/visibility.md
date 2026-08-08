# Visibility (`visibility` + `visibleWhen`)

Visibility is evaluated at **render time**. Hidden blocks keep their full tree data (children, props, CSS) — never silently deleted from JSON.

## Surfaces

| Surface | Failed visibility |
| --- | --- |
| **Canvas** | `ghost` — still selectable; chrome / outline dimmed; not painted as published page content |
| **Preview / Open** | `hide` — omitted from DOM |

## Author intent — `Block.visibility`

```ts
visibility?: {
  hiddenOnCanvas?: boolean;
  hiddenOnPublish?: boolean;
  hiddenDevices?: ("desktop" | "tablet" | "mobile")[];
  hiddenLocales?: string[]; // locale codes from host LocaleConfig
}
```

## Runtime predicates — `Block.visibleWhen`

```ts
visibleWhen?: {
  allOf?: VisibilityPredicate[];
  anyOf?: VisibilityPredicate[];
}

// VisibilityPredicate
{ key: "auth.isLoggedIn", equals: true }
{ key: "flags.beta", equals: "on" }
{ key: "dateNow", between: ["2026-01-01", "2026-12-31"] }
```

Keys are dotted paths into host-injected `renderContext`. Unknown / failing predicates fail safe (hidden).

## Evaluation order

Documented in `visibilityResolve.ts`:

1. `hiddenOnPublish` (non-canvas → hide)
2. `hiddenOnCanvas` (canvas → ghost)
3. `hiddenDevices`
4. `hiddenLocales`
5. `visibleWhen`

## Host `renderContext`

```ts
{
  locale: string;
  device: "desktop" | "tablet" | "mobile";
  auth?: { isLoggedIn: boolean; roles?: string[] };
  flags?: Record<string, boolean | string>;
  // …
}
```

Item-scoped keys (`item.*`) resolve only inside repeater expansion (§25).
