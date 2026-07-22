import type { NrbRatesResponse } from "../src/types";

/** Fixture shaped like live NRB payload (verified 2026-07-17). */
export const FIXTURE_DAY_2026_07_17: NrbRatesResponse = {
  status: { code: 200 },
  errors: { validation: null },
  data: {
    payload: [
      {
        date: "2026-07-17",
        published_on: "2026-07-17 00:00:06",
        modified_on: "2026-07-16 15:56:59",
        rates: [
          {
            currency: { iso3: "INR", name: "Indian Rupee", unit: 100 },
            buy: "160.00",
            sell: "160.15",
          },
          {
            currency: { iso3: "USD", name: "U.S. Dollar", unit: 1 },
            buy: "153.86",
            sell: "154.46",
          },
          {
            currency: { iso3: "JPY", name: "Japanese Yen", unit: 10 },
            buy: "9.49",
            sell: "9.52",
          },
          {
            currency: { iso3: "KRW", name: "South Korean Won", unit: 100 },
            buy: "10.40",
            sell: "10.45",
          },
        ],
      },
    ],
  },
  pagination: {
    page: 1,
    pages: 1,
    per_page: 100,
    total: 1,
    links: { prev: null, next: null },
  },
};

export const FIXTURE_EMPTY: NrbRatesResponse = {
  status: { code: 200 },
  data: { payload: [] },
  pagination: {
    page: 1,
    pages: 1,
    per_page: 100,
    total: 0,
    links: { prev: null, next: null },
  },
};

export function pageResponse(
  days: NonNullable<NrbRatesResponse["data"]>["payload"],
  page: number,
  pages: number,
): NrbRatesResponse {
  return {
    status: { code: 200 },
    data: { payload: days },
    pagination: {
      page,
      pages,
      per_page: 100,
      total: pages,
      links: {
        prev: page > 1 ? "prev" : null,
        next: page < pages ? "next" : null,
      },
    },
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
