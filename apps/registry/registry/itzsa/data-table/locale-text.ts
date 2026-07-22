"use client";

import * as React from "react";

/** All built-in user-facing strings for DataTable UI. */
export type DataTableLocaleText = {
  // Core
  emptyMessage: string;
  loading: string;
  snHeader: string;
  actionsHeader: string;

  // Quick filter
  quickFilterPlaceholder: string;
  quickFilterAriaLabel: string;
  quickFilterClear: string;

  // Density
  densityLabel: string;
  densityAriaLabel: string;
  densityCompact: string;
  densityComfortable: string;
  densitySpacious: string;

  // Columns menu
  columnsLabel: string;
  columnsSearchPlaceholder: string;
  columnsSearchAriaLabel: string;
  columnsCount: (n: number) => string;
  columnsShowAll: string;
  columnsHideAll: string;
  columnsNoMatch: string;
  columnsToggleAria: (header: string) => string;

  // Export
  exportLabel: string;
  exportDownloadCsv: string;
  exportCopyCsv: string;
  exportCopied: string;

  // Pagination
  paginationShowing: string;
  paginationOf: string;
  paginationRowsLabel: string;
  paginationRowsPerPageAria: string;
  paginationCustomPageSizeAria: string;
  paginationPrevious: string;
  paginationNext: string;
  paginationPageAria: (n: number) => string;

  // Filter bar / builder
  filterBuilderLabel: string;
  filterBarAll: string;
  filterBarPlaceholder: (header: string) => string;
  filterBarAria: (header: string) => string;
  filterBarActiveCount: (n: number) => string;
  filterBarClear: string;

  // Column header menu
  columnMenuAria: (header: string) => string;
  columnMenuSortAsc: string;
  columnMenuSortDesc: string;
  columnMenuClearSort: string;
  columnMenuActive: string;
  columnMenuPinLeft: string;
  columnMenuPinRight: string;
  columnMenuUnpin: string;
  columnMenuHide: string;

  // Selection / actions aria
  selectAllAria: string;
  selectRowAria: (id: string) => string;
  rowActionsAria: (id: string) => string;
  sortByAria: (header: string) => string;
  sortPriorityAria: (n: number) => string;
  resizeColumnAria: (header: string) => string;
  editFieldAria: (header: string) => string;
  saveRowAria: string;
  cancelEditAria: string;

  // Expand / detail / tree
  expandRowAria: string;
  collapseRowAria: string;
  expandGroupAria: string;
  collapseGroupAria: string;
  detailPanelAria: string;
};

export const DEFAULT_LOCALE_TEXT: DataTableLocaleText = {
  emptyMessage: "No results.",
  loading: "Loading…",
  snHeader: "SN",
  actionsHeader: "Actions",

  quickFilterPlaceholder: "Search…",
  quickFilterAriaLabel: "Quick filter",
  quickFilterClear: "Clear search",

  densityLabel: "Density",
  densityAriaLabel: "Table density",
  densityCompact: "Compact",
  densityComfortable: "Comfortable",
  densitySpacious: "Spacious",

  columnsLabel: "Columns",
  columnsSearchPlaceholder: "Search columns…",
  columnsSearchAriaLabel: "Search columns",
  columnsCount: (n) => `${n} columns`,
  columnsShowAll: "All",
  columnsHideAll: "None",
  columnsNoMatch: "No columns match",
  columnsToggleAria: (header) => `Toggle ${header}`,

  exportLabel: "Export",
  exportDownloadCsv: "Download CSV",
  exportCopyCsv: "Copy CSV",
  exportCopied: "Copied",

  paginationShowing: "Showing",
  paginationOf: "of",
  paginationRowsLabel: "Rows",
  paginationRowsPerPageAria: "Rows per page",
  paginationCustomPageSizeAria: "Custom rows per page",
  paginationPrevious: "Previous page",
  paginationNext: "Next page",
  paginationPageAria: (n) => `Page ${n}`,

  filterBuilderLabel: "Filters",
  filterBarAll: "All",
  filterBarPlaceholder: (header) => `Filter ${header}…`,
  filterBarAria: (header) => `Filter by ${header}`,
  filterBarActiveCount: (n) => `${n} active`,
  filterBarClear: "Clear filters",

  columnMenuAria: (header) => `${header} column menu`,
  columnMenuSortAsc: "Sort ascending",
  columnMenuSortDesc: "Sort descending",
  columnMenuClearSort: "Clear sort",
  columnMenuActive: "Active",
  columnMenuPinLeft: "Pin left",
  columnMenuPinRight: "Pin right",
  columnMenuUnpin: "Unpin",
  columnMenuHide: "Hide column",

  selectAllAria: "Select all rows on this page",
  selectRowAria: (id) => `Select row ${id}`,
  rowActionsAria: (id) => `Actions for row ${id}`,
  sortByAria: (header) => `Sort by ${header}`,
  sortPriorityAria: (n) => `Sort priority ${n}`,
  resizeColumnAria: (header) => `Resize ${header} column`,
  editFieldAria: (header) => `Edit ${header}`,
  saveRowAria: "Save row",
  cancelEditAria: "Cancel edit",

  expandRowAria: "Expand row",
  collapseRowAria: "Collapse row",
  expandGroupAria: "Expand group",
  collapseGroupAria: "Collapse group",
  detailPanelAria: "Row details",
};

export function resolveLocaleText(
  partial?: Partial<DataTableLocaleText>,
): DataTableLocaleText {
  if (!partial) return DEFAULT_LOCALE_TEXT;
  return { ...DEFAULT_LOCALE_TEXT, ...partial };
}

const LocaleContext =
  React.createContext<DataTableLocaleText>(DEFAULT_LOCALE_TEXT);

export function DataTableLocaleProvider({
  value,
  children,
}: {
  value: DataTableLocaleText;
  children: React.ReactNode;
}) {
  return React.createElement(LocaleContext.Provider, { value }, children);
}

export function useDataTableLocale(): DataTableLocaleText {
  return React.useContext(LocaleContext);
}
