export type EmployeeStatus = "Active" | "Away" | "Offline";

export type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: EmployeeStatus;
  location: string;
  joined: string;
};

export type OrgNode = {
  id: string;
  name: string;
  role: string;
  email: string;
  location: string;
  status: EmployeeStatus;
  path: string[];
};

export const DEPARTMENT_OPTIONS = [
  "Engineering",
  "Design",
  "Product",
  "Marketing",
  "Sales",
  "Support",
  "Finance",
  "People",
] as const;

export const STATUS_OPTIONS = ["Active", "Away", "Offline"] as const;
