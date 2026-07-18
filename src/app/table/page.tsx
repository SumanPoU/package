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
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email", hideBelow: "md" },
  { key: "department", header: "Department", sortable: true },
  { key: "role", header: "Role", sortable: true, hideBelow: "sm" },
  {
    key: "status",
    header: "Status",
    sortable: true,
    cell: (row) => (
      <span
        className={
          row.status === "Active"
            ? "text-emerald-600 dark:text-emerald-400"
            : row.status === "Away"
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground"
        }
      >
        {row.status}
      </span>
    ),
  },
  { key: "location", header: "Location", hideBelow: "lg" },
  { key: "joined", header: "Joined", sortable: true, hideBelow: "md" },
];

export default function TableDemoPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sort, setSort] = useState<DataTableSort | null>({
    key: "name",
    direction: "asc",
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">@ss-components/table</p>
        <h1 className="text-3xl font-semibold tracking-tight">DataTable demo</h1>
        <p className="max-w-2xl text-muted-foreground">
          {SAMPLE_DATA.length} sample employees from{" "}
          <code className="text-foreground">employees.json</code> — pagination,
          selection, sticky header, sorting, and responsive columns.
        </p>
        <p className="text-sm text-muted-foreground">
          Selected:{" "}
          <span className="font-medium text-foreground">
            {selectedIds.length}
          </span>
        </p>
      </header>

      <DataTable
        data={SAMPLE_DATA}
        columns={COLUMNS}
        pageSize={10}
        selectable
        stickyHeader
        maxHeight="28rem"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sort={sort}
        onSortChange={setSort}
      />
    </main>
  );
}
