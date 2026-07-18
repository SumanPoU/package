"use client";

import { useState } from "react";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from "@ss-components/table";

import employees from "./employees.json";

type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "Active" | "Away" | "Offline";
  location: string;
  joined: string;
};

const SAMPLE_DATA = employees as Employee[];

const COLUMNS: DataTableColumn<Employee>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    filterable: true,
    filterType: "string",
    minWidth: 120,
    maxWidth: 220,
    truncate: true,
  },
  {
    key: "email",
    header: "Email",
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
    filterable: true,
    filterType: "enum",
    filterOptions: [
      "Engineering",
      "Design",
      "Product",
      "Marketing",
      "Sales",
      "Support",
      "Finance",
      "People",
    ],
    minWidth: 110,
    maxWidth: 180,
    truncate: true,
  },
  {
    key: "role",
    header: "Role",
    sortable: true,
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
    filterable: true,
    filterType: "enum",
    filterOptions: ["Active", "Away", "Offline"],
    minWidth: 96,
    maxWidth: 120,
    cell: (row) => (
      <span
        className={
          row.status === "Active"
            ? "inline-flex items-center rounded-xs bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
            : row.status === "Away"
              ? "inline-flex items-center rounded-xs bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400"
              : "inline-flex items-center rounded-xs bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
        }
      >
        {row.status}
      </span>
    ),
  },
  {
    key: "location",
    header: "Location",
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

export default function TableDemoPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sort, setSort] = useState<DataTableSort[]>([
    { key: "department", direction: "asc" },
    { key: "name", direction: "asc" },
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-4 py-10 sm:px-6">
      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">
            Menu actions (⋯ only) · filter builder · client pagination
            {selectedIds.length > 0
              ? ` · ${selectedIds.length} selected`
              : null}
          </p>
        </header>

        <DataTable
          data={SAMPLE_DATA}
          columns={COLUMNS}
          paginationMode="client"
          pageSize={10}
          paginationOptions={{
            pageSizeOptions: [5, 10, 20, 50],
            showPageSizeOptions: true,
            showPageNumbers: true,
            maxVisiblePages: 3,
            showTotal: true,
            rowsLabel: "Rows",
          }}
          selectable
          sn
          stickyHeader
          resizable
          reorderable
          showColumnMenu
          enableQuickFilter
          showColumnSelector
          showDensityControl
          showFilterBuilder
          showPagination
          enableMultiSort
          showRowBorders
          showColumnBorders={false}
          radius="xs"
          maxHeight="28rem"
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          sort={sort}
          onSortChange={setSort}
          actionsDisplay="menu"
          actionsOptions={{
            // permissions: ["employees:view", "employees:edit", "employees:delete"],
            sticky: true,
          }}
          actions={[
            {
              id: "view",
              label: "View",
              icon: <EyeIcon className="size-3.5" />,
              permission: "employees:view",
              onClick: (row) => console.log("view", row.id),
            },
            {
              id: "edit",
              label: "Edit",
              icon: <PencilIcon className="size-3.5" />,
              permission: "employees:edit",
              show: (row) => row.status !== "Offline",
              onClick: (row) => console.log("edit", row.id),
            },
            {
              id: "delete",
              label: "Delete",
              icon: <Trash2Icon className="size-3.5" />,
              variant: "destructive",
              permission: "employees:delete",
              show: (row) => row.status === "Offline",
              onClick: (row) => console.log("delete", row.id),
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold tracking-tight">
            Icon-only actions
          </h2>
          <p className="text-sm text-muted-foreground">
            <code className="text-foreground">actionsDisplay=&quot;icons&quot;</code>
            {" "}
            — no ⋯ menu
          </p>
        </header>

        <DataTable
          data={SAMPLE_DATA.slice(0, 8)}
          columns={COLUMNS}
          paginationMode="client"
          pageSize={8}
          showPagination={false}
          sn={false}
          radius="xs"
          actionsDisplay="icons"
          actions={[
            {
              label: "View",
              icon: <EyeIcon className="size-3.5" />,
              onClick: (row) => console.log("view", row.id),
            },
            {
              label: "Edit",
              icon: <PencilIcon className="size-3.5" />,
              show: (row) => row.status !== "Offline",
              onClick: (row) => console.log("edit", row.id),
            },
            {
              label: "Delete",
              icon: <Trash2Icon className="size-3.5" />,
              variant: "destructive",
              show: (row) => row.status === "Offline",
              onClick: (row) => console.log("delete", row.id),
            },
          ]}
        />
      </section>
    </main>
  );
}
