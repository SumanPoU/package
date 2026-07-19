export type Locale = "en" | "ne";

export type DateParts = {
  year: number;
  month: number;
  day: number;
};

/** BS civil date + clock time (24h). */
export type DateTimeParts = DateParts & {
  hour: number;
  minute: number;
  /** Optional; included in string only when `withSeconds` is used. */
  second?: number;
};

export type DatePattern =
  | "YYYY-MM-DD"
  | "YYYY/MM/DD"
  | "DD-MM-YYYY"
  | "DD/MM/YYYY";
