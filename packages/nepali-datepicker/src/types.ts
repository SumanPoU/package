export type Locale = "en" | "ne";

export type DateParts = {
  year: number;
  month: number;
  day: number;
};

export type DatePattern =
  | "YYYY-MM-DD"
  | "YYYY/MM/DD"
  | "DD-MM-YYYY"
  | "DD/MM/YYYY";
