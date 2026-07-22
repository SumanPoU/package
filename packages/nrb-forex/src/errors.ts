export class NrbForexError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "NrbForexError";
    this.code = code;
  }
}

/** Bad caller input before any network request. */
export class NrbValidationError extends NrbForexError {
  constructor(message: string) {
    super("NRB_VALIDATION", message);
    this.name = "NrbValidationError";
  }
}

/** Upstream NRB API returned an error / unexpected payload. */
export class NrbApiError extends NrbForexError {
  readonly statusCode?: number;
  readonly body?: unknown;

  constructor(message: string, statusCode?: number, body?: unknown) {
    super("NRB_API", message);
    this.name = "NrbApiError";
    this.statusCode = statusCode;
    this.body = body;
  }
}

/** Valid request, but no published rate for that date/currency. */
export class NrbRateNotFoundError extends NrbForexError {
  readonly currency?: string;
  readonly date: string;

  constructor(date: string, currency?: string) {
    const target = currency
      ? `${currency} on ${date}`
      : `any currency on ${date}`;
    super("NRB_RATE_NOT_FOUND", `No NRB forex rate found for ${target}`);
    this.name = "NrbRateNotFoundError";
    this.date = date;
    this.currency = currency;
  }
}
