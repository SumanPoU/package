"use client";

import { useState } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import {
  DataTable,
  type DataTableLocaleText,
  type DataTableSort,
} from "@itzsa/table";

import {
  EMPLOYEE_COLUMNS,
  LOCALE_COLUMNS,
  ORG_TREE_COLUMNS,
} from "./columns";
import employeesData from "./data/employees.json";
import localeSampleData from "./data/locale-sample.json";
import orgTreeData from "./data/org-tree.json";
import rowEditData from "./data/row-edit.json";
import demoProps from "./props/demos.json";
import type { Employee, OrgNode } from "./types";

const EMPLOYEES = employeesData as Employee[];
const ROW_EDIT_ROWS = rowEditData as Employee[];
const LOCALE_ROWS = localeSampleData as Employee[];
const ORG_TREE_ROWS = orgTreeData as OrgNode[];

const full = demoProps.fullFeatures;
const rowEdit = demoProps.rowEdit;
const tree = demoProps.tree;
const locale = demoProps.locale;

export function FullFeaturedExample() {
  const [rows, setRows] = useState(EMPLOYEES);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sort, setSort] = useState<DataTableSort[]>(
    full.defaultSort as DataTableSort[],
  );

  return (
    <div className="flex flex-col gap-2">
      {selectedIds.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} selected
        </p>
      ) : null}
      <DataTable
        data={rows}
        columns={EMPLOYEE_COLUMNS}
        paginationMode={full.paginationMode as "client"}
        pageSize={full.pageSize}
        paginationOptions={full.paginationOptions}
        selectable={full.selectable}
        sn={full.sn}
        stickyHeader={full.stickyHeader}
        enableVirtualization={full.enableVirtualization}
        editable={full.editable}
        editMode={full.editMode as "cell"}
        processRowUpdate={(newRow) => {
          setRows((prev) =>
            prev.map((row) => (row.id === newRow.id ? newRow : row)),
          );
          return newRow;
        }}
        getDetailPanelContent={({ row }) => (
          <div className="flex flex-col gap-1 px-2 py-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">{row.name}</span>
              {" · "}
              {row.role} in {row.department}
            </p>
            <p>
              {row.email} · {row.location} · joined {row.joined}
            </p>
          </div>
        )}
        maxHeight={full.maxHeight}
        resizable={full.resizable}
        reorderable={full.reorderable}
        showColumnMenu={full.showColumnMenu}
        enableQuickFilter={full.enableQuickFilter}
        showColumnSelector={full.showColumnSelector}
        showDensityControl={full.showDensityControl}
        showFilterBuilder={full.showFilterBuilder}
        showExport={full.showExport}
        exportFilename={full.exportFilename}
        exportScope={full.exportScope as "filtered"}
        enableKeyboardNavigation={full.enableKeyboardNavigation}
        showPagination={full.showPagination}
        enableMultiSort={full.enableMultiSort}
        showRowBorders={full.showRowBorders}
        showColumnBorders={full.showColumnBorders}
        radius={full.radius as "xs"}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sort={sort}
        onSortChange={setSort}
        actionsDisplay={full.actionsDisplay as "menu"}
        actionsOptions={full.actionsOptions}
        actions={[
          {
            id: "view",
            label: "View",
            icon: <EyeIcon className="size-3.5" />,
            onClick: (row) => console.log("view", row.id),
          },
          {
            id: "edit",
            label: "Edit",
            icon: <PencilIcon className="size-3.5" />,
            show: (row) => row.status !== "Offline",
            onClick: (row) => console.log("edit", row.id),
          },
          {
            id: "delete",
            label: "Delete",
            icon: <Trash2Icon className="size-3.5" />,
            variant: "destructive",
            show: (row) => row.status === "Offline",
            onClick: (row) => console.log("delete", row.id),
          },
        ]}
      />
    </div>
  );
}

export function RowEditExample() {
  const [rows, setRows] = useState(ROW_EDIT_ROWS);

  return (
    <DataTable
      data={rows}
      columns={EMPLOYEE_COLUMNS}
      paginationMode={rowEdit.paginationMode as "client"}
      pageSize={rowEdit.pageSize}
      showPagination={rowEdit.showPagination}
      sn={rowEdit.sn}
      editable={rowEdit.editable}
      editMode={rowEdit.editMode as "row"}
      processRowUpdate={(newRow) => {
        setRows((prev) =>
          prev.map((row) => (row.id === newRow.id ? newRow : row)),
        );
        return newRow;
      }}
      radius={rowEdit.radius as "xs"}
    />
  );
}

export function TreeExample() {
  return (
    <DataTable
      data={ORG_TREE_ROWS}
      columns={ORG_TREE_COLUMNS}
      treeData={tree.treeData}
      getTreeDataPath={(row) => row.path}
      defaultGroupingExpansionDepth={tree.defaultGroupingExpansionDepth}
      groupingColDef={tree.groupingColDef}
      paginationMode={tree.paginationMode as "client"}
      pageSize={tree.pageSize}
      showPagination={tree.showPagination}
      sn={tree.sn}
      selectable={tree.selectable}
      radius={tree.radius as "xs"}
      maxHeight={tree.maxHeight}
      stickyHeader={tree.stickyHeader}
      showRowBorders={tree.showRowBorders}
    />
  );
}

export function LocaleExample() {
  return (
    <DataTable
      data={LOCALE_ROWS}
      columns={LOCALE_COLUMNS}
      sn={locale.sn}
      showPagination={locale.showPagination}
      showExport={locale.showExport}
      showColumnSelector={locale.showColumnSelector}
      showDensityControl={locale.showDensityControl}
      enableQuickFilter={locale.enableQuickFilter}
      radius={locale.radius as "xs"}
      localeText={locale.localeText as Partial<DataTableLocaleText>}
    />
  );
}
