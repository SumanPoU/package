/**
 * @fileoverview Server-only typed errors (ingest / crypto / upstream).
 */

export {
  MetalRateError,
  MetalRateHttpError,
  MetalRateValidationError,
} from "../errors";

export class MetalRateSchemaError extends Error {
  readonly code = "METAL_RATE_SCHEMA";
  readonly sourceId: string;
  readonly issues?: unknown;

  constructor(sourceId: string, message: string, issues?: unknown) {
    super(message);
    this.name = "MetalRateSchemaError";
    this.sourceId = sourceId;
    this.issues = issues;
  }
}

export class MetalRateEmptyError extends Error {
  readonly code = "METAL_RATE_EMPTY";
  readonly sourceId: string;

  constructor(sourceId: string, message?: string) {
    super(message ?? `Source "${sourceId}" returned no rate entries`);
    this.name = "MetalRateEmptyError";
    this.sourceId = sourceId;
  }
}

export const toErrorMessage = (
  err: unknown,
  fallback = "unknown error",
): string => (err instanceof Error ? err.message : fallback);
