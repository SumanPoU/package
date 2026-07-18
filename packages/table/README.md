# @ss-components/table

Composable `DataTable` built on shadcn Table primitives — pagination, row selection, sticky header, sortable columns, responsive column hiding, and empty state in one component.

## Install

```bash
pnpm add @ss-components/table
```

### Tailwind v4

Scan this package so utility classes are generated:

```css
@import "tailwindcss";
@source "../node_modules/@ss-components/table";
```

Optionally import the bundled theme tokens:

```css
@import "@ss-components/table/styles.css";
```

## Minimal usage

```tsx
import { DataTable } from "@ss-components/table";

const data = [
  { id: "1", name: "Ada Lovelace", role: "Mathematician" },
  { id: "2", name: "Alan Turing", role: "Computer scientist" },
];

const columns = [
  { key: "name", header: "Name" },
  { key: "role", header: "Role" },
];

export function UsersTable() {
  return <DataTable data={data} columns={columns} />;
}
```

## Full-featured usage

```tsx
import { useState } from "react";
import { DataTable, type DataTableSort } from "@ss-components/table";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

const data: User[] = [
  /* ... */
];

const columns = [
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email", hideBelow: "md" as const },
  { key: "role", header: "Role", sortable: true },
  { key: "status", header: "Status", hideBelow: "lg" as const },
];

export function UsersTable() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sort, setSort] = useState<DataTableSort | null>({
    key: "name",
    direction: "asc",
  });

  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={10}
      selectable
      stickyHeader
      maxHeight="28rem"
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      sort={sort}
      onSortChange={setSort}
    />
  );
}
```

## Props / API

### `DataTable`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `T[]` | — | Row data |
| `columns` | `DataTableColumn<T>[]` | — | Column config |
| `pageSize` | `number` | `10` | Rows per page |
| `selectable` | `boolean` | `false` | Show checkbox selection column |
| `stickyHeader` | `boolean` | `false` | Keep header fixed while scrolling |
| `maxHeight` | `string` | `"24rem"` | Max height of the scroll container |
| `emptyMessage` | `string` | `"No results."` | Message when `data` is empty |
| `getRowId` | `(row, index) => string` | `row.id` or index | Stable row id for selection |
| `selectedIds` | `string[]` | — | Controlled selection |
| `defaultSelectedIds` | `string[]` | `[]` | Uncontrolled initial selection |
| `onSelectionChange` | `(ids: string[]) => void` | — | Selection change callback |
| `sort` | `DataTableSort \| null` | — | Controlled sort |
| `defaultSort` | `DataTableSort \| null` | `null` | Uncontrolled initial sort |
| `onSortChange` | `(sort) => void` | — | Sort change callback |
| `activeRowId` | `string \| null` | `null` | Highlight an active row |
| `onRowClick` | `(row, index) => void` | — | Row click handler |
| `className` | `string` | — | Root className |
| `rowClassName` | `string \| ((row, index) => string)` | — | Per-row className |

### `DataTableColumn`

| Prop | Type | Description |
| --- | --- | --- |
| `key` | `string` | Property key on each row |
| `header` | `string` | Header label |
| `sortable` | `boolean` | Enable click-to-sort |
| `hideBelow` | `"sm" \| "md" \| "lg"` | Hide column below breakpoint (`hidden` / `md:table-cell` pattern) |
| `cell` | `(row, index) => ReactNode` | Custom cell renderer |
| `className` | `string` | Cell className |
| `headerClassName` | `string` | Header className |

### Also exported

| Export | Description |
| --- | --- |
| `TablePagination` | Standalone pagination control |
| `useTableSelection` | Controllable selection hook |
| `Table`, `TableHeader`, `TableBody`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` | shadcn table primitives |
| `Checkbox`, `Button`, `Select` (+ parts) | Supporting primitives |

## Notes

- `@ss-components/resizable-09` was not available (registry not configured). The official shadcn `table` primitive was used instead, along with `checkbox`, `button`, and `select`.
- Packages are framework-agnostic — no Next.js APIs inside this package.
