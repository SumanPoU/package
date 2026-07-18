# Cursor Prompt — Table Package (shadcn-based DataTable)

## 1. CLI setup (completed)

```bash
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add table   # fallback: registry @itzsa/resizable-09 was unavailable
pnpm dlx shadcn@latest add checkbox button select
pnpm add lucide-react
```

## 2. Implementation goals

Build `DataTable` in `packages/table/src/data-table.tsx` with:

1. Highlightable rows
2. Pagination
3. Row selection
4. Sticky header
5. Overflow scroll
6. Responsive columns (`hideBelow`)
7. Empty state
8. Sortable columns

Export `DataTable`, `TablePagination`, `useTableSelection` from `src/index.tsx`.
