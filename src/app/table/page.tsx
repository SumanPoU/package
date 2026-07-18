"use client";

import { useState } from "react";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from "@ss-components/table";

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

const FIRST_NAMES = [
  "Ada",
  "Alan",
  "Grace",
  "Katherine",
  "Linus",
  "Margaret",
  "Donald",
  "Barbara",
  "Tim",
  "Radia",
  "Guido",
  "Bjarne",
  "Ken",
  "Dennis",
  "Sophie",
  "James",
  "Brendan",
  "Anders",
  "Leslie",
  "Edsger",
];

const LAST_NAMES = [
  "Lovelace",
  "Turing",
  "Hopper",
  "Johnson",
  "Torvalds",
  "Hamilton",
  "Knuth",
  "Liskov",
  "Berners-Lee",
  "Perlman",
  "van Rossum",
  "Stroustrup",
  "Thompson",
  "Ritchie",
  "Wilson",
  "Gosling",
  "Eich",
  "Hejlsberg",
  "Lamport",
  "Dijkstra",
];

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Support",
  "Finance",
  "People",
];

const ROLES = [
  "Engineer",
  "Senior Engineer",
  "Designer",
  "Product Manager",
  "Analyst",
  "Lead",
  "Director",
  "Specialist",
];

const STATUSES: Employee["status"][] = ["Active", "Away", "Offline"];

const LOCATIONS = [
  "San Francisco",
  "New York",
  "London",
  "Berlin",
  "Tokyo",
  "Toronto",
  "Sydney",
  "Remote",
];

function buildEmployees(count: number): Employee[] {
  return Array.from({ length: count }, (_, index) => {
    const first = FIRST_NAMES[index % FIRST_NAMES.length];
    const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
    const id = String(index + 1);
    const year = 2016 + (index % 10);
    const month = String((index % 12) + 1).padStart(2, "0");
    const day = String((index % 28) + 1).padStart(2, "0");

    return {
      id,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${id}@example.com`,
      department: DEPARTMENTS[index % DEPARTMENTS.length],
      role: ROLES[index % ROLES.length],
      status: STATUSES[index % STATUSES.length],
      location: LOCATIONS[index % LOCATIONS.length],
      joined: `${year}-${month}-${day}`,
    };
  });
}

const SAMPLE_DATA = buildEmployees(120);

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
          {SAMPLE_DATA.length} sample employees with pagination, selection,
          sticky header, sorting, and responsive columns.
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
