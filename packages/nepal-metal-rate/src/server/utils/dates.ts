import { MetalRateValidationError } from "../errors";

const MONTH_INDEX: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

export const toUtcDateOnly = (value: Date): Date =>
  new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );

export const parseApiChartDate = (point: {
  date: string;
  year: string;
  month: string;
}): Date => {
  const monthKey = point.month.trim().toLowerCase();
  const month = MONTH_INDEX[monthKey];
  const day = Number.parseInt(point.date, 10);
  const year = Number.parseInt(point.year, 10);

  if (
    month === undefined ||
    !Number.isFinite(day) ||
    !Number.isFinite(year) ||
    day < 1 ||
    day > 31
  ) {
    throw new MetalRateValidationError(
      `Invalid chart date: ${point.year}-${point.month}-${point.date}`,
    );
  }

  return new Date(Date.UTC(year, month, day));
};
