"use client";

import { useState } from "react";
import {
  DataTable,
  type DataTableColumn,
  type DataTableDensity,
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
  { key: "email", header: "Email", hideBelow: "md", wrap: true },
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
  { key: "location", header: "Location", hideBelow: "lg" },
  { key: "joined", header: "Joined", sortable: true, hideBelow: "md" },
];

const DENSITY_OPTIONS: { value: DataTableDensity; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
];

export default function TableDemoPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [density, setDensity] = useState<DataTableDensity>("comfortable");
  const [sort, setSort] = useState<DataTableSort[]>([
    { key: "department", direction: "asc" },
    { key: "name", direction: "asc" },
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
        <p className="text-sm text-muted-foreground">
          {SAMPLE_DATA.length} people
          {selectedIds.length > 0 ? ` · ${selectedIds.length} selected` : null}
          {sort.length > 0
            ? ` · sorted by ${sort.map((s) => s.key).join(", ")}`
            : null}
        </p>
      </header>

      <DataTable
        data={SAMPLE_DATA}
        columns={COLUMNS}
        pageSize={10}
        selectable
        stickyHeader
        stickyFirstColumn
        radius="xs"
        density={density}
        maxHeight="28rem"
        minTableWidth="48rem"
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sort={sort}
        onSortChange={setSort}
        toolbar={
          <div className="flex w-full flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Click column headers to multi-sort · scroll horizontally on small
              screens
            </p>
            <div
              className="inline-flex rounded-xs bg-muted p-0.5"
              role="group"
              aria-label="Table density"
            >
              {DENSITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDensity(option.value)}
                  aria-pressed={density === option.value}
                  className={
                    density === option.value
                      ? "rounded-xs bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm"
                      : "rounded-xs px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        }
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
    </main>
  );
}
