/**
 * @fileoverview Client-facing errors (safe to throw in browsers).
 */

export class MetalRateError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "MetalRateError";
    this.code = code;
  }
}

export class MetalRateValidationError extends MetalRateError {
  constructor(message: string) {
    super("METAL_RATE_VALIDATION", message);
    this.name = "MetalRateValidationError";
  }
}

export class MetalRateHttpError extends MetalRateError {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super("METAL_RATE_HTTP", message);
    this.name = "MetalRateHttpError";
    this.statusCode = statusCode;
  }
}

export class MetalRateNotFoundError extends MetalRateError {
  constructor(message = "Rate not found") {
    super("METAL_RATE_NOT_FOUND", message);
    this.name = "MetalRateNotFoundError";
  }
}
