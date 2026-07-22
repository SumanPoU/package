export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export const CLIENT_API: PropRow[] = [
  {
    name: "getRate",
    type: "(currency, date?, options?) => Promise<ForexRate>",
    description: "Single currency for a day (ISO3, e.g. USD).",
  },
  {
    name: "getRatesForDate",
    type: "(date?, options?) => Promise<ForexRate[]>",
    description: "All currencies published for one day.",
  },
  {
    name: "getRateHistory",
    type: "(currency, from, to) => Promise<ForexRate[]>",
    description: "One currency across a date range (charts).",
  },
  {
    name: "getRatesInRange",
    type: "(from, to) => Promise<DailyForexSnapshot[]>",
    description: "Full snapshots; pagination handled internally.",
  },
  {
    name: "convert",
    type: "(amount, from, 'NPR', options?) => Promise<number>",
    description: "Foreign → NPR using buy / sell / mid and unit.",
  },
  {
    name: "getSupportedCurrencies",
    type: "(date?, options?) => Promise<CurrencyInfo[]>",
    description: "ISO3 + name + unit for the day.",
  },
  {
    name: "createNrbForexClient",
    type: "(options?) => NrbForexClient",
    description: "Isolated client (cache, fetch, retries, fallback).",
  },
];

export const RATE_FIELDS: PropRow[] = [
  {
    name: "currency",
    type: "string",
    description: "ISO3 code (USD, INR, JPY, …).",
  },
  {
    name: "currencyName",
    type: "string",
    description: "Display name from NRB (e.g. U.S. Dollar).",
  },
  {
    name: "unit",
    type: "number",
    description:
      "NRB quotes buy/sell per this many units (often 1, 10, or 100).",
  },
  {
    name: "buy / sell",
    type: "number",
    description: "As published — divide by unit for per-1 NPR.",
  },
  {
    name: "date",
    type: "string",
    description: "Effective rate date (YYYY-MM-DD).",
  },
  {
    name: "publishedOn",
    type: "string",
    description: "When NRB published the snapshot.",
  },
  {
    name: "isFallback",
    type: "boolean?",
    description: "True when returned via fallbackToPreviousDay.",
  },
];

/** Official NRB FOREX API V1 — query params for GET /rates */
export const NRB_RATE_PARAMS: PropRow[] = [
  {
    name: "from",
    type: "string (Y-m-d)",
    description: "Starting date. Required.",
  },
  {
    name: "to",
    type: "string (Y-m-d)",
    description: "Ending date. Required.",
  },
  {
    name: "page",
    type: "integer",
    description: "Current page (cursor). Required.",
  },
  {
    name: "per_page",
    type: "integer 1–100",
    description: "Items per page. Required. Max 100.",
  },
];

export const NRB_STATUS_CODES: PropRow[] = [
  {
    name: "200",
    type: "OK",
    description: "Request succeeded; inspect data.payload for rates.",
  },
  {
    name: "400",
    type: "Bad Request",
    description: "Invalid or missing arguments — see errors.validation.",
  },
];

export const NRB_RESPONSE_ROOT: PropRow[] = [
  {
    name: "status",
    type: "{ code: number }",
    description: "HTTP-style status from the API body.",
  },
  {
    name: "errors",
    type: "object",
    description:
      "Validation and other errors (present even on some successes).",
  },
  {
    name: "errors.validation",
    type: "Record<string, string[]>",
    description: "Field errors for per_page, page, from, to.",
  },
  {
    name: "params",
    type: "object",
    description: "Echo of GET parameters (per_page, page, from, to).",
  },
  {
    name: "data",
    type: "object",
    description: "Main response container.",
  },
  {
    name: "data.payload",
    type: "array | null",
    description: "Array of daily forex snapshots, or null when empty/invalid.",
  },
  {
    name: "pagination",
    type: "object",
    description: "Page cursor, totals, and prev/next links.",
  },
];

export const NRB_PAYLOAD_DAY: PropRow[] = [
  {
    name: "date",
    type: "string (Y-m-d)",
    description: "FOREX rates for this calendar date.",
  },
  {
    name: "published_on",
    type: "string",
    description: "When NRB published these rates.",
  },
  {
    name: "modified_on",
    type: "string",
    description: "Last modification timestamp for the snapshot.",
  },
  {
    name: "rates",
    type: "array",
    description: "Per-currency buy/sell quotes for the day.",
  },
];

export const NRB_PAYLOAD_RATE: PropRow[] = [
  {
    name: "currency.name",
    type: "string",
    description: "Currency display name.",
  },
  {
    name: "currency.iso3",
    type: "string",
    description: "ISO 4217 alpha-3 code (USD, INR, …).",
  },
  {
    name: "currency.unit",
    type: "number",
    description: "Units the buy/sell figures are quoted for.",
  },
  {
    name: "buy",
    type: "number",
    description: "Buying rate in NPR (for `unit` foreign units).",
  },
  {
    name: "sell",
    type: "number",
    description: "Selling rate in NPR (for `unit` foreign units).",
  },
];

export const NRB_PAGINATION: PropRow[] = [
  {
    name: "page",
    type: "number | null",
    description: "Current page (cursor).",
  },
  {
    name: "pages",
    type: "number | null",
    description: "Total number of pages.",
  },
  {
    name: "per_page",
    type: "number | null",
    description: "Items per page.",
  },
  {
    name: "total",
    type: "number | null",
    description: "Total number of items across pages.",
  },
  {
    name: "links.prev",
    type: "string | null",
    description: "URL for the previous page.",
  },
  {
    name: "links.next",
    type: "string | null",
    description: "URL for the next page.",
  },
];

export const NRB_EXAMPLE_REQUEST = `GET https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=100&from=2026-07-17&to=2026-07-17`;

export const NRB_EXAMPLE_SUCCESS = `{
  "status": { "code": 200 },
  "errors": { "validation": null },
  "params": {
    "from": "2026-07-17",
    "to": "2026-07-17",
    "per_page": 100,
    "page": 1
  },
  "data": {
    "payload": [
      {
        "date": "2026-07-17",
        "published_on": "2026-07-17 00:00:17",
        "modified_on": "2026-07-17 00:00:17",
        "rates": [
          {
            "currency": { "iso3": "USD", "name": "U.S. Dollar", "unit": 1 },
            "buy": 133.45,
            "sell": 134.05
          },
          {
            "currency": { "iso3": "INR", "name": "Indian Rupee", "unit": 100 },
            "buy": 160.0,
            "sell": 160.15
          }
        ]
      }
    ]
  },
  "pagination": {
    "page": 1,
    "pages": 1,
    "per_page": 100,
    "total": 1,
    "links": { "prev": null, "next": null }
  }
}`;

export const NRB_EXAMPLE_VALIDATION_ERROR = `{
  "status": { "code": 400 },
  "errors": {
    "validation": {
      "per_page": [
        "Per Page is required",
        "Per Page must be an integer",
        "Per Page must be at least 1",
        "Per Page must be no more than 100"
      ],
      "page": ["Page is required", "Page must be an integer"],
      "from": [
        "From is required",
        "From must be date with format 'Y-m-d'"
      ],
      "to": ["To is required"]
    }
  },
  "params": { "from": "", "to": "", "per_page": "", "page": "" },
  "data": { "payload": null },
  "pagination": {
    "page": null,
    "pages": null,
    "per_page": null,
    "total": null,
    "links": { "prev": null, "next": null }
  }
}`;
