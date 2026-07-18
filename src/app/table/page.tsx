"use client";

import { useState } from "react";
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
    minWidth: 120,
    maxWidth: 220,
    truncate: true,
  },
  {
    key: "email",
    header: "Email",
    hideBelow: "md",
    minWidth: 140,
    maxWidth: 260,
    truncate: true,
  },
  {
    key: "department",
    header: "Department",
    sortable: true,
    minWidth: 110,
    maxWidth: 180,
    truncate: true,
  },
  {
    key: "role",
    header: "Role",
    sortable: true,
    hideBelow: "sm",
    minWidth: 110,
    maxWidth: 180,
    truncate: true,
  },
  {
    key: "status",
    header: "Status",
    sortable: true,
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
    hideBelow: "lg",
    minWidth: 110,
    maxWidth: 160,
    truncate: true,
  },
  {
    key: "joined",
    header: "Joined",
    sortable: true,
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
            {SAMPLE_DATA.length} people · auto SN on by default (no{" "}
            <code className="text-foreground">sn</code> field in data)
            {selectedIds.length > 0
              ? ` · ${selectedIds.length} selected`
              : null}
          </p>
        </header>

        <DataTable
          data={SAMPLE_DATA}
          columns={COLUMNS}
          pageSize={10}
          selectable
          resizable
          showDensityControl
          showPagination
          enableMultiSort
          radius="xs"
          maxHeight="28rem"
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          sort={sort}
          onSortChange={setSort}
          renderRowActions={(row) => (
            <div className="flex flex-col">
              <button
                type="button"
                className="px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                Edit {row.name}
              </button>
              <button
                type="button"
                className="px-2 py-1.5 text-left text-sm text-destructive hover:bg-muted"
              >
                Delete
              </button>
            </div>
          )}
        />
      </section>

      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-1.5">
          <h2 className="text-lg font-semibold tracking-tight">
            Without SN column
          </h2>
          <p className="text-sm text-muted-foreground">
            Same data with <code className="text-foreground">sn={"{false}"}</code>{" "}
            — no serial column, no empty gap.
          </p>
        </header>

        <DataTable
          sn={false}
          data={SAMPLE_DATA.slice(0, 8)}
          columns={COLUMNS}
          pageSize={8}
          showPagination={false}
          radius="xs"
        />
      </section>
    </main>
  );
}
