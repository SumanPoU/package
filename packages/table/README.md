# @ss-components/table

Composable `DataTable` built on shadcn Table primitives — pagination, selection, sticky header, sorting, filtering, server/client modes, density, and row-action popovers.

## Install

```bash
pnpm add @ss-components/table
```

### Tailwind v4

```css
@import "tailwindcss";
@source "../node_modules/@ss-components/table";
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

## Feature defaults

| Feature | Prop | Default |
| --- | --- | --- |
| Auto serial number (SN) | `sn` | `true` |
| SN header label | `snHeader` | `"SN"` |
| Checkbox selection | `selectable` | `false` |
| Sticky header | `stickyHeader` | `false` |
| Sticky first column | `stickyFirstColumn` | `false` |
| Filtering | `enableFiltering` | `false` |
| Column resize | `resizable` | `false` |
| Density control UI | `showDensityControl` | `false` |
| Pagination | `showPagination` | `true` |
| Multi-sort | `enableMultiSort` | `true` |
| Radius | `radius` | `'xs'` |

### Notable default: Auto SN is on

By default every table shows an **SN** column (1, 2, 3…). You do **not** put `sn` in your row data — the package computes it from page position:

`sn = (page - 1) * pageSize + rowIndexOnPage + 1`

Page 2 with `pageSize={10}` shows `11, 12, 13…`. Opt out with `sn={false}`.

```tsx
{/* Default — SN column visible */}
<DataTable data={rows} columns={columns} />

{/* Hide SN */}
<DataTable sn={false} data={rows} columns={columns} />

{/* Custom header */}
<DataTable sn snHeader="#" data={rows} columns={columns} />
```

Density options live in the package (`DENSITY_OPTIONS` + `DensityControl`). Enable with `showDensityControl`.

## Column resize

```tsx
<DataTable
  resizable
  data={rows}
  columns={[
    { key: "name", header: "Name", minWidth: 120 },
    { key: "email", header: "Email", minWidth: 160 },
  ]}
/>
```

Drag the right edge of a header to resize. Double-click resets. Arrow keys work when the handle is focused.

## Density (built into the package)

```tsx
<DataTable showDensityControl data={rows} columns={columns} />
```

Or use the control yourself:

```tsx
import { DensityControl, DENSITY_OPTIONS } from "@ss-components/table";
```


Click headers to stack sorts (priority badges appear when more than one is active). Click again to flip direction, click a third time to remove that column from the sort list.

```tsx
const [sort, setSort] = useState<DataTableSort[]>([
  { key: "department", direction: "asc" },
  { key: "name", direction: "asc" },
]);

<DataTable
  data={employees}
  columns={columns}
  sort={sort}
  onSortChange={setSort}
/>
```

## Density

```tsx
<DataTable density="compact" ... />
<DataTable density="comfortable" ... />
<DataTable density="spacious" ... />
```

Pass a `toolbar` slot to render density controls above the table.

## Filtering (opt-in)

Filtering is **off by default**. Enable it explicitly:

```tsx
<DataTable
  enableFiltering
  data={employees}
  columns={[
    { key: "name", header: "Name", filterable: true },
    {
      key: "department",
      header: "Department",
      filterable: true,
      filterType: "select",
      filterOptions: ["Engineering", "Design"],
    },
  ]}
/>
```

## Server mode with pagination

```tsx
import { useState } from "react";
import { DataTable, type DataTableState } from "@ss-components/table";

export function ServerUsersTable() {
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load(state: DataTableState) {
    setLoading(true);
    const res = await fetch(
      `/api/users?page=${state.page}&pageSize=${state.pageSize}`,
    );
    const json = await res.json();
    setRows(json.items);
    setTotalRows(json.total);
    setLoading(false);
  }

  return (
    <DataTable
      mode="server"
      data={rows}
      totalRows={totalRows}
      loading={loading}
      columns={[
        { key: "name", header: "Name", sortable: true },
        { key: "email", header: "Email" },
      ]}
      onStateChange={load}
    />
  );
}
```

## Row-actions popover

```tsx
<DataTable
  data={employees}
  columns={columns}
  selectable
  radius="xs"
  popoverOffset={12}
  popoverPlacement="right-start"
  renderRowActions={(row) => (
    <div className="flex flex-col gap-0.5 p-0.5">
      <button type="button" className="px-2 py-1.5 text-left text-sm hover:bg-muted">
        Edit {row.name}
      </button>
    </div>
  )}
/>
```

## Props / API

### `DataTable`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `T[]` | — | Row data |
| `columns` | `DataTableColumn<T>[]` | — | Column config |
| `pageSize` | `number` | `10` | Rows per page |
| `selectable` | `boolean` | `false` | Checkbox column |
| `stickyHeader` | `boolean` | `true` | Sticky header on vertical scroll |
| `stickyFirstColumn` | `boolean` | `true` | Sticky first column on horizontal scroll |
| `minTableWidth` | `string` | `"42rem"` | Min width before horizontal scroll |
| `maxHeight` | `string` | `"28rem"` | Scroll container max height |
| `sort` / `defaultSort` | `DataTableSort[]` | `[]` | Multi-column sort (priority order) |
| `onSortChange` | `(sort) => void` | — | Sort callback |
| `enableFiltering` | `boolean` | `false` | Show filter bar when columns are filterable |
| `density` | `'compact' \| 'comfortable' \| 'spacious'` | `'comfortable'` | Row padding / type size |
| `radius` | `'none' \| 'xs' \| 'sm' \| 'md'` | `'xs'` | Corner radius |
| `toolbar` | `ReactNode` | — | Optional bar above the table |
| `mode` | `'client' \| 'server'` | `'client'` | Who owns slice/sort/filter |
| `totalRows` | `number` | — | Server-mode total |
| `loading` | `boolean` | `false` | Loading overlay |
| `onStateChange` | `(state) => void` | — | Page/sort/filter changes |
| `className` / `style` / `classNames` | — | — | Styling overrides |
| `renderRowActions` | `(row) => ReactNode` | — | Row action popover |
| `popoverOffset` / `popoverPlacement` | — | `8` / `bottom-start` | floating-ui options |

### `DataTableColumn`

| Prop | Type | Description |
| --- | --- | --- |
| `key` / `header` | `string` | Field + label |
| `sortable` | `boolean` | Multi-sort participation |
| `hideBelow` | `'sm' \| 'md' \| 'lg'` | Responsive column hiding |
| `wrap` | `boolean` | Allow text wrap (better on narrow screens) |
| `sticky` | `boolean` | Force sticky column |
| `filterable` / `filterType` / `filterOptions` | — | Used only when `enableFiltering` |
| `cell` | `(row, index) => ReactNode` | Custom renderer |


### Also exported

| Export | Description |
| --- | --- |
| `TablePagination` | Standalone pagination control |
| `FilterBar` | Standalone filter bar |
| `RowActionsPopover` | Floating row-actions menu |
| `useTableSelection` | Controllable selection hook |
| `Table`, `TableHeader`, `TableBody`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` | Table primitives |
| `Checkbox`, `Button`, `Select` (+ parts) | Supporting primitives |

## Notes

- Client mode filters with AND logic across active column filters.
- Server mode trusts `data` as the current page and uses `totalRows` for page math.
- Consumer `className` / `classNames.*` always merge last via `tailwind-merge`.
- Packages are framework-agnostic — no Next.js APIs inside this package.
