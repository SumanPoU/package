/** Full copy-paste snippets for table docs (includes sample JSON data). */

export const FULL_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
} from "@itzsa/table";
import "@itzsa/table/styles.css";

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

const data: Employee[] = [
  {
    id: "001",
    name: "Ada Lovelace",
    email: "ada@example.com",
    department: "Engineering",
    role: "Engineer",
    status: "Active",
    location: "San Francisco",
    joined: "2016-01-01",
  },
  {
    id: "002",
    name: "Alan Turing",
    email: "alan@example.com",
    department: "Design",
    role: "Senior Engineer",
    status: "Away",
    location: "New York",
    joined: "2017-02-02",
  },
  {
    id: "003",
    name: "Grace Hopper",
    email: "grace@example.com",
    department: "Product",
    role: "Designer",
    status: "Offline",
    location: "London",
    joined: "2018-03-03",
  },
  {
    id: "004",
    name: "Katherine Johnson",
    email: "katherine@example.com",
    department: "Marketing",
    role: "Product Manager",
    status: "Active",
    location: "Berlin",
    joined: "2019-04-04",
  },
  {
    id: "005",
    name: "Margaret Hamilton",
    email: "margaret@example.com",
    department: "Engineering",
    role: "Staff Engineer",
    status: "Active",
    location: "Boston",
    joined: "2020-05-05",
  },
];

const columns: DataTableColumn<Employee>[] = [
  { key: "name", header: "Name", sortable: true, editable: true, filterable: true },
  { key: "email", header: "Email", editable: true, filterable: true },
  {
    key: "department",
    header: "Department",
    sortable: true,
    editable: true,
    editType: "select",
    editOptions: ["Engineering", "Design", "Product", "Marketing"],
    filterable: true,
    filterType: "enum",
    filterOptions: ["Engineering", "Design", "Product", "Marketing"],
  },
  { key: "role", header: "Role", sortable: true, editable: true },
  { key: "status", header: "Status", sortable: true, filterable: true },
  { key: "location", header: "Location" },
  { key: "joined", header: "Joined", sortable: true },
];

export function FullFeaturedExample() {
  const [rows, setRows] = useState(data);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sort, setSort] = useState<DataTableSort[]>([
    { key: "department", direction: "asc" },
    { key: "name", direction: "asc" },
  ]);

  return (
    <DataTable
      data={rows}
      columns={columns}
      paginationMode="client"
      pageSize={5}
      paginationOptions={{
        pageSizeOptions: [5, 10, 25],
        allowCustomPageSize: true,
        showPageSizeOptions: true,
        showTotal: true,
      }}
      selectable
      sn
      stickyHeader
      editable
      editMode="cell"
      processRowUpdate={(newRow) => {
        setRows((prev) =>
          prev.map((row) => (row.id === newRow.id ? newRow : row)),
        );
        return newRow;
      }}
      getDetailPanelContent={({ row }) => (
        <div>
          <p>
            {row.name} · {row.role} in {row.department}
          </p>
          <p>
            {row.email} · {row.location} · joined {row.joined}
          </p>
        </div>
      )}
      maxHeight="28rem"
      resizable
      reorderable
      showColumnMenu
      enableQuickFilter
      showColumnSelector
      showDensityControl
      showFilterBuilder
      showExport
      exportFilename="employees.csv"
      exportScope="filtered"
      enableKeyboardNavigation
      showPagination
      enableMultiSort
      showRowBorders
      selectedIds={selectedIds}
      onSelectionChange={setSelectedIds}
      sort={sort}
      onSortChange={setSort}
      actionsDisplay="menu"
      actions={[
        {
          id: "view",
          label: "View",
          onClick: (row) => console.log("view", row.id),
        },
        {
          id: "edit",
          label: "Edit",
          show: (row) => row.status !== "Offline",
          onClick: (row) => console.log("edit", row.id),
        },
        {
          id: "delete",
          label: "Delete",
          variant: "destructive",
          show: (row) => row.status === "Offline",
          onClick: (row) => console.log("delete", row.id),
        },
      ]}
    />
  );
}`;

export const ROW_EDIT_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import { DataTable, type DataTableColumn } from "@itzsa/table";
import "@itzsa/table/styles.css";

type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: "Active" | "Away" | "Offline";
};

const data: Employee[] = [
  {
    id: "001",
    name: "Ada Lovelace",
    email: "ada@example.com",
    department: "Engineering",
    role: "Engineer",
    status: "Active",
  },
  {
    id: "002",
    name: "Alan Turing",
    email: "alan@example.com",
    department: "Design",
    role: "Senior Engineer",
    status: "Away",
  },
  {
    id: "003",
    name: "Grace Hopper",
    email: "grace@example.com",
    department: "Product",
    role: "Designer",
    status: "Offline",
  },
];

const columns: DataTableColumn<Employee>[] = [
  { key: "name", header: "Name", editable: true },
  { key: "email", header: "Email", editable: true },
  {
    key: "department",
    header: "Department",
    editable: true,
    editType: "select",
    editOptions: ["Engineering", "Design", "Product", "Marketing"],
  },
  { key: "role", header: "Role", editable: true },
  { key: "status", header: "Status", editable: true },
];

export function RowEditExample() {
  const [rows, setRows] = useState(data);

  return (
    <DataTable
      data={rows}
      columns={columns}
      paginationMode="client"
      pageSize={8}
      showPagination={false}
      editable
      editMode="row"
      processRowUpdate={(newRow) => {
        setRows((prev) =>
          prev.map((row) => (row.id === newRow.id ? newRow : row)),
        );
        return newRow;
      }}
    />
  );
}`;

export const TREE_EXAMPLE_CODE = `"use client";

import { DataTable, type DataTableColumn } from "@itzsa/table";
import "@itzsa/table/styles.css";

type OrgNode = {
  id: string;
  name: string;
  role: string;
  email: string;
  location: string;
  status: string;
  path: string[];
};

const data: OrgNode[] = [
  {
    id: "eng-ava",
    name: "Ava Chen",
    role: "VP Engineering",
    email: "ava.chen@example.com",
    location: "San Francisco",
    status: "Active",
    path: ["Engineering", "Ava Chen"],
  },
  {
    id: "eng-plat-ben",
    name: "Ben Ortiz",
    role: "Staff Engineer",
    email: "ben.ortiz@example.com",
    location: "Austin",
    status: "Active",
    path: ["Engineering", "Platform", "Ben Ortiz"],
  },
  {
    id: "eng-plat-cara",
    name: "Cara Ng",
    role: "Senior Engineer",
    email: "cara.ng@example.com",
    location: "Seattle",
    status: "Away",
    path: ["Engineering", "Platform", "Cara Ng"],
  },
  {
    id: "eng-app-mira",
    name: "Mira Soto",
    role: "Engineering Manager",
    email: "mira.soto@example.com",
    location: "Remote",
    status: "Active",
    path: ["Engineering", "Apps", "Mira Soto"],
  },
  {
    id: "des-noah",
    name: "Noah Kim",
    role: "Design Lead",
    email: "noah.kim@example.com",
    location: "New York",
    status: "Active",
    path: ["Design", "Noah Kim"],
  },
];

const columns: DataTableColumn<OrgNode>[] = [
  { key: "role", header: "Role" },
  { key: "email", header: "Email" },
  { key: "location", header: "Location" },
  { key: "status", header: "Status" },
];

export function TreeExample() {
  return (
    <DataTable
      data={data}
      columns={columns}
      treeData
      getTreeDataPath={(row) => row.path}
      defaultGroupingExpansionDepth={1}
      groupingColDef={{ headerName: "Org / name" }}
      paginationMode="client"
      pageSize={30}
      showPagination={false}
      selectable
      maxHeight="22rem"
      stickyHeader
      showRowBorders
    />
  );
}`;

export const LOCALE_EXAMPLE_CODE = `"use client";

import { DataTable, type DataTableColumn } from "@itzsa/table";
import "@itzsa/table/styles.css";

type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: string;
};

const data: Employee[] = [
  {
    id: "001",
    name: "Ada Lovelace",
    email: "ada@example.com",
    department: "Engineering",
    role: "Engineer",
    status: "Active",
  },
  {
    id: "002",
    name: "Alan Turing",
    email: "alan@example.com",
    department: "Design",
    role: "Senior Engineer",
    status: "Away",
  },
  {
    id: "003",
    name: "Grace Hopper",
    email: "grace@example.com",
    department: "Product",
    role: "Designer",
    status: "Offline",
  },
];

const columns: DataTableColumn<Employee>[] = [
  { key: "name", header: "Nombre" },
  { key: "email", header: "Correo" },
  { key: "department", header: "Departamento" },
  { key: "role", header: "Rol" },
  { key: "status", header: "Estado" },
];

export function LocaleExample() {
  return (
    <DataTable
      data={data}
      columns={columns}
      showExport
      showColumnSelector
      showDensityControl
      enableQuickFilter
      localeText={{
        searchPlaceholder: "Buscar…",
        export: "Exportar",
        columns: "Columnas",
        density: "Densidad",
        noRows: "Sin filas",
      }}
    />
  );
}`;
