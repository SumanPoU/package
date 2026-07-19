# @itzsa/table

Composable `DataTable` built on shadcn Table primitives — pagination, selection, sticky header, sorting, filtering, server/client modes, density, and row-action popovers.

## Install

```bash
pnpm add @itzsa/table
```

### Tailwind v4

```css
@import "tailwindcss";
@source "../node_modules/@itzsa/table";
@import "@itzsa/table/styles.css";
```

Thin scrollbars and theme tokens ship in `styles.css`.
## Minimal usage

```tsx
import { DataTable } from "@itzsa/table";

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

## Demo / docs app (`/table`)

Open **`http://localhost:3000/table`** for the full documentation site: installation, getting started, live examples, and props API.

```
src/app/table/
  page.tsx                 # docs page (install, API, examples)
  docs-ui.tsx              # nav, code blocks, props tables
  examples.tsx             # live DataTable demos
  columns.tsx / types.ts
  data/                    # JSON datasets per example
  props/demos.json         # serializable demo props
```

## Styling (MUI-like slots)

Customize appearance with Tailwind classes and/or inline CSS — similar to MUI DataGrid `classes` + `sx`:

```tsx
<DataTable
  className="shadow-lg"
  style={{ "--dt-accent": "oklch(0.6 0.15 250)" } as React.CSSProperties}
  classNames={{
    root: "border-border",
    header: "bg-muted/40",
    row: "hover:bg-muted/30",
    cell: "align-middle",
    pagination: "bg-card",
    scroll: "max-h-[32rem]",
  }}
  styles={{
    root: { borderRadius: 12 },
    headerCell: { fontWeight: 600 },
    pagination: { paddingBlock: 12 },
  }}
  data={rows}
  columns={columns}
/>
```

| Prop | Role |
| --- | --- |
| `className` / `style` | Root element |
| `classNames.*` | Per-slot Tailwind classes (merged last) |
| `styles.*` | Per-slot inline `CSSProperties` |
| `column.className` / `headerClassName` | Per-column |
| `rowClassName` | String or `(row, index) => string` |

Slots include: `root`, `table`, `header`, `headerRow`, `headerCell`, `body`, `row`, `cell`, `scroll`, `toolbar`, `pagination`, `filterBar`, `empty`, `loading`, `detailPanel`, and toolbar control keys.

## Custom page size (type any limit)

By default the footer uses **one combobox**: type a custom limit in the field, or open the chevron for presets.

```tsx
<DataTable
  pageSize={18}
  paginationOptions={{
    allowCustomPageSize: true, // default — type inside the same control
    pageSizeOptions: [10, 18, 25, 50],
    minPageSize: 1,
    maxPageSize: 200,
  }}
  data={rows}
  columns={columns}
/>
```

- Type a number → Enter or blur applies it (clamped to `minPageSize`/`maxPageSize`).
- Chevron opens the preset list in the same control.
- Set `allowCustomPageSize: false` to pick presets only (field becomes read-only).

## Feature defaults

| Feature | Prop | Default |
| --- | --- | --- |
| Auto serial number (SN) | `sn` | `true` |
| SN header label | `snHeader` | `"SN"` |
| Sticky header (heading) | `stickyHeader` | `false` |
| Quick filter (global search) | `enableQuickFilter` | `false` |
| Column selector menu | `showColumnSelector` | `false` |
| Checkbox selection | `selectable` | `false` |
| Sticky first column | `stickyFirstColumn` | `false` |
| Per-column filter bar | `enableFiltering` | `false` |
| Column resize | `resizable` | `false` |
| Column reorder (drag headers) | `reorderable` | `false` |
| Per-header column menu | `showColumnMenu` | `false` |
| Density control UI | `showDensityControl` | `false` |
| Pagination | `showPagination` | `true` |
| Multi-sort | `enableMultiSort` | `true` |
| Radius | `radius` | `'xs'` |

### Sticky header

```tsx
<DataTable stickyHeader maxHeight="28rem" data={rows} columns={columns} />
```

When `stickyHeader` is on and `maxHeight` is omitted, the table uses `28rem` so the header can stick inside the scroll container. Alias: `stickyHeading` (same behavior).

### Notable default: Auto SN is on

By default every table shows an **SN** column (1, 2, 3…). You do **not** put `sn` in your row data — the package computes it from page position:

`sn = (page - 1) * pageSize + rowIndexOnPage + 1`

Page 2 with `pageSize={10}` shows `11, 12, 13…`. Opt out with `sn={false}`.

```tsx
<DataTable data={rows} columns={columns} />
<DataTable sn={false} data={rows} columns={columns} />
<DataTable sn snHeader="#" data={rows} columns={columns} />
```

### Quick filter + column visibility (Phase 1)

```tsx
<DataTable
  enableQuickFilter
  showColumnSelector
  stickyHeader
  data={rows}
  columns={columns}
/>
```

Controlled visibility (MUI-style model — `false` hides):

```tsx
<DataTable
  showColumnSelector
  columnVisibility={{ email: false }}
  onColumnVisibilityChange={setVisibility}
  data={rows}
  columns={columns}
/>
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

Density uses a **Select** with `position="popper"` and `sideOffset={8}`:

```tsx
<DataTable showDensityControl data={rows} columns={columns} />
<DataTable density="compact" data={rows} columns={columns} />
```

Or use the control yourself:

```tsx
import { DensityControl, DENSITY_OPTIONS } from "@itzsa/table";
```

## Multi-sort

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

## Phase 4: cell / row editing

```tsx
<DataTable
  editable
  editMode="cell" // or "row"
  processRowUpdate={(newRow, oldRow) => {
    // persist, then return the committed row
    return newRow;
  }}
  onProcessRowUpdateError={(error) => console.error(error)}
  columns={[
    { key: "name", header: "Name", editable: true, editType: "text" },
    {
      key: "status",
      header: "Status",
      editable: true,
      editType: "select",
      editOptions: ["Active", "Away"],
    },
  ]}
  data={rows}
/>
```

- **Cell mode** — double-click a cell; Enter / blur saves; Esc cancels
- **Row mode** — double-click starts row edit; ✓ saves, ✕ cancels
- Per-column: `editable`, `editType`, `editOptions`, `renderEditCell`
- `editAllColumns` makes every column editable unless `editable: false`

## Phase 5: CSV export

```tsx
<DataTable
  showExport
  exportFilename="employees.csv"
  exportScope="filtered" // "filtered" | "page" | "selected"
  onExported={(format) => console.log(format)} // "csv" | "clipboard"
  data={rows}
  columns={columns}
/>
```

Toolbar **Export** menu: download CSV or copy CSV to clipboard. Scope uses visible columns; `filtered` exports the current sorted/filtered set (or current `data` in server mode).

## Phase 6: keyboard navigation

```tsx
<DataTable
  enableKeyboardNavigation
  editable // optional — Enter starts edit
  data={rows}
  columns={columns}
/>
```

Arrow keys move focus; Home / End (and Ctrl+Home / Ctrl+End) jump; Enter starts edit when `editable` is on. Navigation is skipped while an editor is open.

## Master-detail panels

```tsx
<DataTable
  getDetailPanelContent={({ row }) => (
    <div className="p-3 text-sm">{row.email}</div>
  )}
  // optional controlled expansion:
  // detailPanelExpandedRowIds={ids}
  // onDetailPanelExpandedRowIdsChange={setIds}
  data={rows}
  columns={columns}
/>
```

Shows an expand column. Returning `null` from `getDetailPanelContent` hides the toggle for that row. **Virtualization is disabled** while detail panels are enabled.

## Tree data

```tsx
import orgTree from "./data/org-tree.json";

<DataTable
  treeData
  getTreeDataPath={(row) => row.path} // e.g. ["Engineering", "Platform", "Ada"]
  defaultGroupingExpansionDepth={1} // -1 all, 0 none, 1 top-level
  groupingColDef={{ headerName: "Org / name" }}
  data={orgTree}
  columns={columns}
/>
```

Builds groups from path segments (intermediate nodes need not exist as rows). Expand/collapse on the first data column. Groups are not selectable. **Virtualization is disabled** with tree data.

See the demo’s [`org-tree.json`](../../src/app/table/data/org-tree.json) for a full sample dataset.

## Locale text

```tsx
import demoProps from "./props/demos.json";

<DataTable
  localeText={demoProps.locale.localeText}
  data={rows}
  columns={columns}
/>
```

Partial override of built-in UI strings. Explicit props like `emptyMessage` / `snHeader` still win over `localeText`. See `DEFAULT_LOCALE_TEXT` for all keys. Demo copy lives in [`props/demos.json`](../../src/app/table/props/demos.json) under `locale.localeText`.

## Phase 3: virtualization

```tsx
<DataTable
  enableVirtualization
  maxHeight="28rem"
  pageSize={50}
  virtualOverscan={8}
  // optional: virtualRowHeight={48}
  data={rows}
  columns={columns}
/>
```

Uses `@tanstack/react-virtual` to render only visible body rows. Sticky header + scroll container work together; if `maxHeight` is omitted with virtualization on, defaults to `28rem`.

## Filter builder

Opt-in advanced filters. Only columns with `filterable: true` appear.

```tsx
<DataTable
  showFilterBuilder
  columns={[
    { key: "name", header: "Name", filterable: true, filterType: "string" },
    {
      key: "status",
      header: "Status",
      filterable: true,
      filterType: "enum",
      filterOptions: ["Active", "Away", "Offline"],
    },
    { key: "joined", header: "Joined" }, // not in filter builder
  ]}
  data={rows}
  onFilterBuilderApply={({ conditions, params }) => {
    // server mode: send params / conditions to your API
  }}
/>
```

Supported `filterType` values: `string`, `textarea`, `number`, `range`, `date`, `datetime`, `time`, `boolean`, `email`, `url`, `color`, `enum`, `multi` (plus legacy `text` / `select`).

## Pagination mode & options

```tsx
<DataTable
  paginationMode="client" // or "server"
  pageSize={18} // initial size — users can type a different limit in the footer
  paginationOptions={{
    pageSizeOptions: [10, 18, 25, 50], // suggestions when allowCustomPageSize
    allowCustomPageSize: true,
    minPageSize: 1,
    maxPageSize: 200,
    showPageSizeOptions: true,
    showPageNumbers: true,
    maxVisiblePages: 3,
    showTotal: true,
    rowsLabel: "Rows",
    showPrevNext: true,
  }}
  // server mode also needs:
  // totalRows={1000}
  // onStateChange={(state) => fetchPage(state)}
  data={rows}
  columns={columns}
/>
```

`paginationMode` wins over `mode` when both are set. With `allowCustomPageSize` (default), the footer page-size control is a single combobox (type + dropdown).

## Row actions (menu / icons / permissions)

```tsx
<DataTable
  actionsDisplay="menu" // or "icons" — never both in one table
  actionsOptions={{
    permissions: ["users:edit", "users:delete"],
    // or: canAccess: (permission, row) => check(permission, row),
    sticky: true,
  }}
  actions={[
    {
      label: "Edit",
      icon: <PencilIcon className="size-3.5" />,
      permission: "users:edit",
      show: (row) => row.status !== "locked",
      onClick: (row) => edit(row),
    },
    {
      label: "Delete",
      variant: "destructive",
      permission: "users:delete",
      onClick: (row) => remove(row),
    },
  ]}
  data={rows}
  columns={columns}
/>
```

- **`menu`** — only the ⋯ popover (all actions inside)
- **`icons`** — only inline icon buttons (no ⋯)
- **`show` / `hidden` / `permission`** — per-action visibility

## Phase 2: reorder, pin, column menu

```tsx
<DataTable
  reorderable
  showColumnMenu
  showColumnSelector
  showDensityControl
  stickyHeader
  resizable
  showRowBorders
  showColumnBorders={false}
  actions={[
    { label: "Edit", onClick: (row) => console.log(row) },
    { label: "Delete", variant: "destructive", onClick: (row) => console.log(row) },
  ]}
  data={rows}
  columns={columns}
/>
```

- **Reorder** — drag column headers when `reorderable` is on (`columnOrder` / `onColumnOrderChange` for controlled).
- **Pin** — pin left/right from the header ⋮ menu; pinned columns move to the edge and stay sticky while scrolling (`pinnedColumns` / `onPinnedColumnsChange`, or `column.pinned`).
- **Column menu** — sort, hide, pin/unpin per column (`showColumnMenu`).
- **Columns selector** — includes a search field to filter column names.
- **Row borders** — `showRowBorders` (default `true`).
- **Column borders** — `showColumnBorders` (default `false`).
- **Actions** — pass `actions` (array or `(row) => actions`) for the row ⋯ menu.

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
import { DataTable, type DataTableState } from "@itzsa/table";

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
| `pageSize` | `number` | `10` | Rows per page (any value, e.g. `18`) |
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
| `className` / `style` / `classNames` / `styles` | — | — | Styling overrides (MUI-like slots) |
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
| `ExportMenu` | Standalone CSV export menu |
| `buildCsv` / `downloadTextFile` / `copyTextToClipboard` / `rowsToCsvMatrix` | Export helpers |
| `useTableKeyboard` | Cell focus / arrow-key navigation hook |
| `DEFAULT_LOCALE_TEXT` / `resolveLocaleText` / `useDataTableLocale` | Locale map |
| `DetailExpandButton` | Expand/collapse control |
| `buildTreeFromPaths` / `flattenVisibleTree` | Tree helpers |
| `useTableSelection` | Controllable selection hook |
| `Table`, `TableHeader`, `TableBody`, `TableHead`, `TableRow`, `TableCell`, `TableCaption` | Table primitives |
| `Checkbox`, `Button`, `Select` (+ parts) | Supporting primitives |

## Notes

- Client mode filters with AND logic across active column filters.
- Server mode trusts `data` as the current page and uses `totalRows` for page math.
- Consumer `className` / `classNames.*` always merge last via `tailwind-merge`.
- `styles.*` apply as inline CSS on the matching slots (after internal layout styles).
- `pageSize` is always included in the rows-per-page select via `mergePageSizeOptions`.
- Packages are framework-agnostic — no Next.js APIs inside this package.
