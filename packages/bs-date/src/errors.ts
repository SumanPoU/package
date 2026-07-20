/** Base error for @itzsa/bs-date. */
export class BsDateError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "BsDateError";
    this.code = code;
  }
}

export class BsRangeError extends BsDateError {
  constructor(message: string) {
    super("BS_RANGE", message);
    this.name = "BsRangeError";
  }
}

export class BsParseError extends BsDateError {
  constructor(message: string) {
    super("BS_PARSE", message);
    this.name = "BsParseError";
  }
}

export class BsInvalidError extends BsDateError {
  constructor(message: string) {
    super("BS_INVALID", message);
    this.name = "BsInvalidError";
  }
}
