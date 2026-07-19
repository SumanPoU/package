"use client";

import type { DataTableColumn } from "@itzsa/table";

import {
  DEPARTMENT_OPTIONS,
  type Employee,
  type OrgNode,
  STATUS_OPTIONS,
} from "./types";

function StatusBadge({ status }: { status: Employee["status"] }) {
  return (
    <span
      className={
        status === "Active"
          ? "inline-flex items-center rounded-xs border-[0.5px] border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
          : status === "Away"
            ? "inline-flex items-center rounded-xs border-[0.5px] border-border bg-card px-2 py-0.5 text-xs font-medium text-secondary"
            : "inline-flex items-center rounded-xs border-[0.5px] border-border bg-card px-2 py-0.5 text-xs font-medium text-tertiary"
      }
    >
      {status}
    </span>
  );
}

/** Full employee grid — editing, filters, sort. */
export const EMPLOYEE_COLUMNS: DataTableColumn<Employee>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    editable: true,
    editType: "text",
    filterable: true,
    filterType: "string",
    minWidth: 120,
    maxWidth: 220,
    truncate: true,
  },
  {
    key: "email",
    header: "Email",
    editable: true,
    editType: "text",
    filterable: true,
    filterType: "email",
    hideBelow: "md",
    minWidth: 140,
    maxWidth: 260,
    truncate: true,
  },
  {
    key: "department",
    header: "Department",
    sortable: true,
    editable: true,
    editType: "select",
    editOptions: [...DEPARTMENT_OPTIONS],
    filterable: true,
    filterType: "enum",
    filterOptions: [...DEPARTMENT_OPTIONS],
    minWidth: 110,
    maxWidth: 180,
    truncate: true,
  },
  {
    key: "role",
    header: "Role",
    sortable: true,
    editable: true,
    editType: "text",
    filterable: true,
    filterType: "string",
    hideBelow: "sm",
    minWidth: 110,
    maxWidth: 180,
    truncate: true,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
    editable: true,
    editType: "select",
    editOptions: [...STATUS_OPTIONS],
    filterable: true,
    filterType: "enum",
    filterOptions: [...STATUS_OPTIONS],
    minWidth: 96,
    maxWidth: 120,
    cell: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "location",
    header: "Location",
    editable: true,
    editType: "text",
    filterable: true,
    filterType: "string",
    hideBelow: "lg",
    minWidth: 110,
    maxWidth: 160,
    truncate: true,
  },
  {
    key: "joined",
    header: "Joined",
    sortable: true,
    filterable: true,
    filterType: "string",
    hideBelow: "md",
    minWidth: 100,
    maxWidth: 120,
  },
];

/** Locale demo — fewer columns. */
export const LOCALE_COLUMNS: DataTableColumn<Employee>[] =
  EMPLOYEE_COLUMNS.slice(0, 4);

/** Org tree — hierarchy uses `path`; first column gets tree chrome. */
export const ORG_TREE_COLUMNS: DataTableColumn<OrgNode>[] = [
  {
    key: "name",
    header: "Name",
    minWidth: 200,
    truncate: true,
  },
  {
    key: "role",
    header: "Role",
    minWidth: 140,
    truncate: true,
  },
  {
    key: "email",
    header: "Email",
    hideBelow: "md",
    minWidth: 160,
    truncate: true,
  },
  {
    key: "location",
    header: "Location",
    hideBelow: "lg",
    minWidth: 110,
    truncate: true,
  },
  {
    key: "status",
    header: "Status",
    minWidth: 96,
    maxWidth: 120,
    cell: (row) => <StatusBadge status={row.status} />,
  },
];
