import type { PropRow } from "./api-types";

export const DATATABLE_PROPS: PropRow[] = [
  {
    name: "data",
    type: "T[]",
    description:
      "Row data (full set in client mode, or current page in server mode).",
  },
  {
    name: "columns",
    type: "DataTableColumn<T>[]",
    description: "Column definitions.",
  },
  {
    name: "getRowId",
    type: "(row, index) => string",
    default: "row.id",
    description: "Stable row id for selection, edit, and expand state.",
  },
  {
    name: "showPagination",
    type: "boolean",
    default: "true",
    description: "Show footer pagination.",
  },
  {
    name: "pageSize",
    type: "number",
    default: "10",
    description: "Rows per page. Any positive number (e.g. 18).",
  },
  {
    name: "paginationOptions",
    type: "DataTablePaginationOptions",
    description: "Page-size combobox, totals, numbered pages, min/max.",
  },
  {
    name: "paginationMode",
    type: "'client' | 'server'",
    default: "'client'",
    description: "Who owns paging. Wins over mode when both set.",
  },
  {
    name: "mode",
    type: "'client' | 'server'",
    default: "'client'",
    description: "Legacy alias for data sourcing (prefer paginationMode).",
  },
  {
    name: "totalRows",
    type: "number",
    description: "Server-mode total row count.",
  },
  {
    name: "loading",
    type: "boolean",
    default: "false",
    description: "Loading overlay over the scroll area.",
  },
  {
    name: "onStateChange",
    type: "(state) => void",
    description: "Fires when page, sort, filters, density, etc. change.",
  },
  {
    name: "selectable",
    type: "boolean",
    default: "false",
    description: "Checkbox selection column.",
  },
  {
    name: "selectedIds",
    type: "string[]",
    description: "Controlled selection.",
  },
  {
    name: "defaultSelectedIds",
    type: "string[]",
    description: "Uncontrolled initial selection.",
  },
  {
    name: "onSelectionChange",
    type: "(ids) => void",
    description: "Selection callback.",
  },
  {
    name: "sn",
    type: "boolean",
    default: "true",
    description: "Auto serial-number column (not in row data).",
  },
  {
    name: "snHeader",
    type: "string",
    default: '"SN"',
    description: "SN column header label.",
  },
  {
    name: "stickyHeader",
    type: "boolean",
    default: "false",
    description: "Pin header while scrolling body.",
  },
  {
    name: "stickyHeading",
    type: "boolean",
    default: "false",
    description: "Deprecated alias for stickyHeader.",
  },
  {
    name: "stickyFirstColumn",
    type: "boolean",
    default: "false",
    description: "Pin first data column horizontally.",
  },
  {
    name: "minTableWidth",
    type: "string",
    description: "Min table width before horizontal scroll.",
  },
  {
    name: "maxHeight",
    type: "string",
    description:
      "Scroll container max-height (defaults to 28rem with sticky/virtualization).",
  },
  {
    name: "emptyMessage",
    type: "string",
    default: "locale",
    description: "Empty state text (falls back to localeText.emptyMessage).",
  },
  {
    name: "enableMultiSort",
    type: "boolean",
    default: "true",
    description: "Allow multiple sort columns.",
  },
  { name: "sort", type: "DataTableSort[]", description: "Controlled sort." },
  {
    name: "defaultSort",
    type: "DataTableSort[]",
    default: "[]",
    description: "Uncontrolled initial sort.",
  },
  {
    name: "onSortChange",
    type: "(sort) => void",
    description: "Sort change callback.",
  },
  {
    name: "enableFiltering",
    type: "boolean",
    default: "false",
    description: "Per-column filter bar.",
  },
  {
    name: "filters",
    type: "DataTableFilters",
    description: "Controlled filter bar values.",
  },
  {
    name: "defaultFilters",
    type: "DataTableFilters",
    description: "Uncontrolled initial filters.",
  },
  {
    name: "onFiltersChange",
    type: "(filters) => void",
    description: "Filter bar callback.",
  },
  {
    name: "showFilterBuilder",
    type: "boolean",
    default: "false",
    description: "Advanced multi-condition filter popover.",
  },
  {
    name: "advancedFilters",
    type: "FilterCondition[]",
    description: "Controlled advanced filters.",
  },
  {
    name: "onFilterBuilderApply",
    type: "(payload) => void",
    description: "Called when builder Apply is pressed.",
  },
  {
    name: "enableQuickFilter",
    type: "boolean",
    default: "false",
    description: "Global toolbar search.",
  },
  {
    name: "quickFilter",
    type: "string",
    description: "Controlled quick filter.",
  },
  {
    name: "onQuickFilterChange",
    type: "(value) => void",
    description: "Quick filter callback.",
  },
  {
    name: "quickFilterPlaceholder",
    type: "string",
    description: "Overrides locale quick-filter placeholder.",
  },
  {
    name: "showColumnSelector",
    type: "boolean",
    default: "false",
    description: "Columns show/hide menu.",
  },
  {
    name: "columnVisibility",
    type: "Record<string, boolean>",
    description: "Visibility map (false = hidden).",
  },
  {
    name: "onColumnVisibilityChange",
    type: "(v) => void",
    description: "Visibility callback.",
  },
  {
    name: "reorderable",
    type: "boolean",
    default: "false",
    description: "Drag headers to reorder.",
  },
  {
    name: "columnOrder",
    type: "string[]",
    description: "Controlled column order.",
  },
  {
    name: "onColumnOrderChange",
    type: "(order) => void",
    description: "Order callback.",
  },
  {
    name: "showColumnMenu",
    type: "boolean",
    default: "false",
    description: "Per-header ⋮ menu (sort / pin / hide).",
  },
  {
    name: "pinnedColumns",
    type: "{ left?, right? }",
    description: "Pinned column keys.",
  },
  {
    name: "onPinnedColumnsChange",
    type: "(pinned) => void",
    description: "Pin change callback.",
  },
  {
    name: "resizable",
    type: "boolean",
    default: "false",
    description: "Drag column edges to resize.",
  },
  {
    name: "columnWidths",
    type: "Record<string, number>",
    description: "Controlled widths.",
  },
  {
    name: "onColumnWidthsChange",
    type: "(widths) => void",
    description: "Width callback.",
  },
  {
    name: "density",
    type: "'compact'|'comfortable'|'spacious'",
    default: "'compact'",
    description: "Row density.",
  },
  {
    name: "showDensityControl",
    type: "boolean",
    default: "false",
    description: "Toolbar density menu.",
  },
  {
    name: "activeRowId",
    type: "string | null",
    description: "Highlighted row id.",
  },
  {
    name: "onRowClick",
    type: "(row, index) => void",
    description: "Row click handler.",
  },
  {
    name: "rowClassName",
    type: "string | (row, index) => string",
    description: "Per-row class helper.",
  },
  {
    name: "actions",
    type: "DataTableRowAction[] | (row) => …",
    description: "Declarative row actions.",
  },
  {
    name: "actionsDisplay",
    type: "'menu' | 'icons'",
    default: "'menu'",
    description: "Shorthand for actionsOptions.display.",
  },
  {
    name: "actionsOptions",
    type: "DataTableActionsOptions",
    description: "Permissions, sticky, display mode.",
  },
  {
    name: "renderRowActions",
    type: "(row) => ReactNode",
    description: "Custom actions content (ignored if actions is set).",
  },
  {
    name: "popoverOffset",
    type: "number",
    default: "8",
    description: "floating-ui offset for menus.",
  },
  {
    name: "popoverPlacement",
    type: "Placement",
    default: "bottom-start",
    description: "floating-ui placement.",
  },
  {
    name: "editable",
    type: "boolean",
    default: "false",
    description: "Enable inline editing.",
  },
  {
    name: "editMode",
    type: "'cell' | 'row'",
    default: "'cell'",
    description: "Single cell vs whole-row draft.",
  },
  {
    name: "editAllColumns",
    type: "boolean",
    default: "false",
    description: "All columns editable unless column.editable === false.",
  },
  {
    name: "processRowUpdate",
    type: "(newRow, oldRow) => T | Promise<T>",
    description: "Commit edited row.",
  },
  {
    name: "onProcessRowUpdateError",
    type: "(error) => void",
    description: "Edit commit error handler.",
  },
  {
    name: "onCellEditStart",
    type: "(params) => void",
    description: "Fired when edit begins.",
  },
  {
    name: "onCellEditStop",
    type: "(params) => void",
    description: "Fired when edit ends.",
  },
  {
    name: "isCellEditable",
    type: "(params) => boolean",
    description: "Per-cell edit gate.",
  },
  {
    name: "enableVirtualization",
    type: "boolean",
    default: "false",
    description: "Row virtualization (off with tree/detail).",
  },
  {
    name: "virtualRowHeight",
    type: "number",
    description: "Estimated row height; defaults from density.",
  },
  {
    name: "virtualOverscan",
    type: "number",
    default: "8",
    description: "Extra rows outside viewport.",
  },
  {
    name: "showExport",
    type: "boolean",
    default: "false",
    description: "CSV export toolbar.",
  },
  {
    name: "exportFilename",
    type: "string",
    default: "table-export.csv",
    description: "Download filename.",
  },
  {
    name: "exportScope",
    type: "'filtered' | 'page' | 'selected'",
    default: "'filtered'",
    description: "Which rows are exported.",
  },
  {
    name: "onExported",
    type: "(format) => void",
    description: "After export completes (csv | clipboard).",
  },
  {
    name: "enableKeyboardNavigation",
    type: "boolean",
    default: "false",
    description: "Arrow-key focus; Enter starts edit.",
  },
  {
    name: "getDetailPanelContent",
    type: "(params) => ReactNode",
    description: "Master-detail panel under a row.",
  },
  {
    name: "detailPanelExpandedRowIds",
    type: "string[]",
    description: "Controlled detail expand state.",
  },
  {
    name: "onDetailPanelExpandedRowIdsChange",
    type: "(ids) => void",
    description: "Detail expand callback.",
  },
  {
    name: "treeData",
    type: "boolean",
    default: "false",
    description: "Enable path-based tree hierarchy.",
  },
  {
    name: "getTreeDataPath",
    type: "(row) => string[]",
    description: "Path segments for each row.",
  },
  {
    name: "expandedTreeIds",
    type: "string[]",
    description: "Controlled tree expand ids.",
  },
  {
    name: "defaultGroupingExpansionDepth",
    type: "number",
    description: "Initial expand depth (-1 = all).",
  },
  {
    name: "groupingColDef",
    type: "{ headerName?, width?, … }",
    description: "Grouping column chrome.",
  },
  {
    name: "localeText",
    type: "Partial<DataTableLocaleText>",
    description: "Override UI strings (see localeText table).",
  },
  {
    name: "radius",
    type: "'none'|'xs'|'sm'|'md'",
    default: "'xs'",
    description: "Corner radius token.",
  },
  {
    name: "showRowBorders",
    type: "boolean",
    default: "true",
    description: "Horizontal borders between rows.",
  },
  {
    name: "showColumnBorders",
    type: "boolean",
    default: "false",
    description: "Vertical borders between columns.",
  },
  { name: "className", type: "string", description: "Root element class." },
  {
    name: "style",
    type: "CSSProperties",
    description: "Root element inline style.",
  },
  {
    name: "classNames",
    type: "DataTableClassNames",
    description: "Per-slot Tailwind classes (see classNames slots).",
  },
  {
    name: "styles",
    type: "DataTableStyles",
    description: "Per-slot inline CSS (see styles slots).",
  },
  {
    name: "toolbar",
    type: "ReactNode",
    description: "Extra toolbar content beside built-ins.",
  },
];

export const COLUMN_PROPS: PropRow[] = [
  { name: "key", type: "string", description: "Field key on the row object." },
  { name: "header", type: "string", description: "Header label." },
  {
    name: "sortable",
    type: "boolean",
    description: "Include in sort cycling.",
  },
  {
    name: "hideBelow",
    type: "'sm' | 'md' | 'lg'",
    description: "Hide column below breakpoint.",
  },
  {
    name: "wrap",
    type: "boolean",
    description: "Soft-wrap cell text (disables truncate).",
  },
  {
    name: "truncate",
    type: "boolean",
    default: "true*",
    description: "Ellipsis overflow (*default when wrap is unset).",
  },
  {
    name: "sticky",
    type: "boolean",
    description: "Legacy sticky left; prefer pinned.",
  },
  {
    name: "pinned",
    type: "'left' | 'right'",
    description: "Pin while scrolling horizontally.",
  },
  {
    name: "resizable",
    type: "boolean",
    default: "true",
    description: "Allow resize when table resizable is on.",
  },
  { name: "width", type: "number", description: "Preferred width in px." },
  { name: "minWidth", type: "number", description: "Minimum width in px." },
  { name: "maxWidth", type: "number", description: "Maximum width in px." },
  {
    name: "filterable",
    type: "boolean",
    description: "Appear in filter bar / builder.",
  },
  {
    name: "filterType",
    type: "string | enum | number | …",
    description: "Filter input type.",
  },
  {
    name: "filterOptions",
    type: "string[]",
    description: "Enum / select options for filter.",
  },
  { name: "filterMin", type: "number", description: "Numeric filter min." },
  { name: "filterMax", type: "number", description: "Numeric filter max." },
  { name: "filterStep", type: "number", description: "Numeric filter step." },
  {
    name: "editable",
    type: "boolean",
    description: "Editable when table editable is on.",
  },
  {
    name: "editType",
    type: "'text'|'number'|'select'|'boolean'|'textarea'",
    default: "'text'",
    description: "Built-in editor.",
  },
  {
    name: "editOptions",
    type: "string[]",
    description: "Select options for editType select.",
  },
  {
    name: "renderEditCell",
    type: "(helpers) => ReactNode",
    description: "Custom editor.",
  },
  {
    name: "cell",
    type: "(row, index) => ReactNode",
    description: "Custom display renderer.",
  },
  { name: "className", type: "string", description: "Body cell classes." },
  {
    name: "headerClassName",
    type: "string",
    description: "Header cell classes.",
  },
];

export const PAGINATION_PROPS: PropRow[] = [
  {
    name: "showPageSizeOptions",
    type: "boolean",
    default: "true",
    description: "Show rows-per-page combobox.",
  },
  {
    name: "pageSizeOptions",
    type: "number[]",
    default: "[5,10,20,50]",
    description: "Preset sizes; current pageSize always merged in.",
  },
  {
    name: "allowCustomPageSize",
    type: "boolean",
    default: "true",
    description: "Type a custom limit in the same control.",
  },
  {
    name: "minPageSize",
    type: "number",
    default: "1",
    description: "Clamp typed values (min).",
  },
  {
    name: "maxPageSize",
    type: "number",
    default: "500",
    description: "Clamp typed values (max).",
  },
  {
    name: "showPageNumbers",
    type: "boolean",
    default: "true",
    description: "Numbered page buttons.",
  },
  {
    name: "maxVisiblePages",
    type: "number",
    default: "3",
    description: "Sliding window of page numbers.",
  },
  {
    name: "showTotal",
    type: "boolean",
    default: "true",
    description: "Showing X–Y of Z.",
  },
  {
    name: "rowsLabel",
    type: "string",
    default: '"Rows"',
    description: "Label beside page-size control.",
  },
  {
    name: "showPrevNext",
    type: "boolean",
    default: "true",
    description: "Previous / next buttons.",
  },
];

export const ACTION_PROPS: PropRow[] = [
  { name: "id", type: "string", description: "Optional action id." },
  { name: "label", type: "string", description: "Menu / tooltip label." },
  { name: "onClick", type: "(row) => void", description: "Click handler." },
  {
    name: "icon",
    type: "ReactNode",
    description: "Icon for menu or icons mode.",
  },
  {
    name: "variant",
    type: "'default' | 'destructive'",
    description: "Destructive styling for delete-like actions.",
  },
  {
    name: "show",
    type: "boolean | (row) => boolean",
    description: "Conditional visibility (prefer over hidden).",
  },
  {
    name: "hidden",
    type: "boolean | (row) => boolean",
    description: "Hide when true.",
  },
  {
    name: "disabled",
    type: "boolean | (row) => boolean",
    description: "Disable per row.",
  },
  {
    name: "permission",
    type: "string | (row) => boolean",
    description: "Checked via actionsOptions.permissions / canAccess.",
  },
];

export const ACTIONS_OPTIONS_PROPS: PropRow[] = [
  {
    name: "display",
    type: "'menu' | 'icons'",
    default: "'menu'",
    description: "⋯ popover or icon buttons only (never both).",
  },
  {
    name: "permissions",
    type: "string[] | Record<string, boolean>",
    description: "Allowed permission keys.",
  },
  {
    name: "canAccess",
    type: "(permission, row) => boolean",
    description: "Custom permission check (wins).",
  },
  {
    name: "sticky",
    type: "boolean",
    default: "true",
    description: "Sticky actions column.",
  },
  {
    name: "menuAriaLabel",
    type: "string",
    description: "Aria label for ⋯ trigger.",
  },
];

/** One row per DataTableClassNames slot — pass Tailwind classes here. */
export const CLASSNAMES_SLOTS: PropRow[] = [
  { name: "root", type: "string", description: "Outer DataTable wrapper." },
  { name: "toolbar", type: "string", description: "Top toolbar row." },
  { name: "quickFilter", type: "string", description: "Quick filter control." },
  {
    name: "columnSelector",
    type: "string",
    description: "Columns visibility menu.",
  },
  { name: "densityControl", type: "string", description: "Density menu." },
  { name: "export", type: "string", description: "Export menu." },
  {
    name: "filterBuilder",
    type: "string",
    description: "Advanced filter builder trigger/popover.",
  },
  { name: "filterBar", type: "string", description: "Per-column filter bar." },
  {
    name: "scroll",
    type: "string",
    description: "Scroll container around the table.",
  },
  { name: "table", type: "string", description: "<table> element." },
  { name: "header", type: "string", description: "<thead> region." },
  { name: "headerRow", type: "string", description: "Header <tr>." },
  { name: "headerCell", type: "string", description: "Header <th> cells." },
  { name: "body", type: "string", description: "<tbody>." },
  { name: "row", type: "string", description: "Body <tr>." },
  { name: "cell", type: "string", description: "Body <td> cells." },
  { name: "pagination", type: "string", description: "Footer pagination." },
  { name: "loading", type: "string", description: "Loading overlay." },
  { name: "empty", type: "string", description: "Empty-state cell." },
  {
    name: "detailPanel",
    type: "string",
    description: "Expanded detail panel cell.",
  },
  {
    name: "expandCell",
    type: "string",
    description: "Expand/collapse control cell.",
  },
  {
    name: "checkboxCell",
    type: "string",
    description: "Selection checkbox cell.",
  },
  { name: "snCell", type: "string", description: "Serial-number cell." },
  { name: "actionsCell", type: "string", description: "Row actions cell." },
  {
    name: "actionsHeader",
    type: "string",
    description: "Actions column header.",
  },
];

/** One row per DataTableStyles slot — pass CSSProperties here. */
export const STYLES_SLOTS: PropRow[] = [
  { name: "root", type: "CSSProperties", description: "Outer wrapper." },
  { name: "toolbar", type: "CSSProperties", description: "Toolbar." },
  { name: "filterBar", type: "CSSProperties", description: "Filter bar." },
  { name: "scroll", type: "CSSProperties", description: "Scroll container." },
  { name: "table", type: "CSSProperties", description: "<table>." },
  { name: "header", type: "CSSProperties", description: "Header region." },
  { name: "headerRow", type: "CSSProperties", description: "Header row." },
  { name: "headerCell", type: "CSSProperties", description: "Header cells." },
  { name: "body", type: "CSSProperties", description: "Body." },
  { name: "row", type: "CSSProperties", description: "Body rows." },
  {
    name: "cell",
    type: "CSSProperties",
    description: "Body cells (merged after size/pin styles).",
  },
  { name: "pagination", type: "CSSProperties", description: "Footer." },
  { name: "loading", type: "CSSProperties", description: "Loading overlay." },
  { name: "empty", type: "CSSProperties", description: "Empty state." },
  { name: "detailPanel", type: "CSSProperties", description: "Detail panel." },
];

export const LOCALE_KEYS: PropRow[] = [
  {
    name: "emptyMessage",
    type: "string",
    default: '"No results."',
    description: "Empty table copy.",
  },
  {
    name: "loading",
    type: "string",
    default: '"Loading…"',
    description: "Loading overlay text.",
  },
  {
    name: "snHeader",
    type: "string",
    default: '"SN"',
    description: "SN column header.",
  },
  {
    name: "actionsHeader",
    type: "string",
    default: '"Actions"',
    description: "Actions column header.",
  },
  {
    name: "quickFilterPlaceholder",
    type: "string",
    default: '"Search…"',
    description: "Quick filter placeholder.",
  },
  {
    name: "quickFilterAriaLabel",
    type: "string",
    description: "Quick filter aria-label.",
  },
  {
    name: "quickFilterClear",
    type: "string",
    description: "Clear search button label.",
  },
  {
    name: "densityLabel",
    type: "string",
    description: "Density control label.",
  },
  {
    name: "densityCompact / Comfortable / Spacious",
    type: "string",
    description: "Density option labels.",
  },
  {
    name: "columnsLabel",
    type: "string",
    description: "Columns menu trigger.",
  },
  {
    name: "columnsSearchPlaceholder",
    type: "string",
    description: "Columns search field.",
  },
  {
    name: "columnsShowAll / columnsHideAll",
    type: "string",
    description: "Bulk visibility actions.",
  },
  {
    name: "columnsCount",
    type: "(n) => string",
    description: "Visible column count text.",
  },
  { name: "exportLabel", type: "string", description: "Export menu trigger." },
  {
    name: "exportDownloadCsv / exportCopyCsv / exportCopied",
    type: "string",
    description: "Export menu items + toast.",
  },
  {
    name: "paginationShowing / paginationOf",
    type: "string",
    description: "“Showing X–Y of Z” parts.",
  },
  {
    name: "paginationRowsLabel",
    type: "string",
    description: "Rows label (also overridable via paginationOptions).",
  },
  {
    name: "paginationPrevious / paginationNext",
    type: "string",
    description: "Pager buttons.",
  },
  {
    name: "paginationPageAria",
    type: "(n) => string",
    description: "Page button aria.",
  },
  {
    name: "filterBuilderLabel",
    type: "string",
    description: "Filter builder trigger.",
  },
  {
    name: "filterBarAll / filterBarClear",
    type: "string",
    description: "Filter bar chrome.",
  },
  {
    name: "filterBarPlaceholder / filterBarAria",
    type: "(header) => string",
    description: "Per-column filter labels.",
  },
  {
    name: "columnMenuSortAsc / SortDesc / ClearSort",
    type: "string",
    description: "Header menu sort items.",
  },
  {
    name: "columnMenuPinLeft / PinRight / Unpin / Hide",
    type: "string",
    description: "Header menu pin/hide.",
  },
  {
    name: "selectAllAria / selectRowAria",
    type: "string | fn",
    description: "Selection aria.",
  },
  {
    name: "expandRowAria / collapseRowAria",
    type: "string",
    description: "Detail expand aria.",
  },
  {
    name: "expandGroupAria / collapseGroupAria",
    type: "string",
    description: "Tree group aria.",
  },
  {
    name: "detailPanelAria",
    type: "string",
    description: "Detail panel region aria.",
  },
];

export const FEATURE_MAP: PropRow[] = [
  {
    name: "Auto SN",
    type: "sn",
    default: "true",
    description: "Computed serial column",
  },
  {
    name: "Selection",
    type: "selectable",
    default: "false",
    description: "Checkbox column",
  },
  {
    name: "Quick filter",
    type: "enableQuickFilter",
    default: "false",
    description: "Toolbar search",
  },
  {
    name: "Filter bar",
    type: "enableFiltering",
    default: "false",
    description: "Per-column filters",
  },
  {
    name: "Filter builder",
    type: "showFilterBuilder",
    default: "false",
    description: "Advanced filters",
  },
  {
    name: "Export CSV",
    type: "showExport",
    default: "false",
    description: "Download / copy",
  },
  {
    name: "Editing",
    type: "editable",
    default: "false",
    description: "Cell or row mode",
  },
  {
    name: "Detail panel",
    type: "getDetailPanelContent",
    default: "—",
    description: "Expandable rows",
  },
  {
    name: "Tree data",
    type: "treeData + getTreeDataPath",
    default: "false",
    description: "Hierarchy",
  },
  {
    name: "Virtualization",
    type: "enableVirtualization",
    default: "false",
    description: "Large pages",
  },
  {
    name: "Keyboard",
    type: "enableKeyboardNavigation",
    default: "false",
    description: "Arrow focus",
  },
  {
    name: "i18n",
    type: "localeText",
    default: "—",
    description: "UI string map",
  },
  {
    name: "Custom CSS",
    type: "classNames / styles",
    default: "—",
    description: "Per-slot styling",
  },
];
