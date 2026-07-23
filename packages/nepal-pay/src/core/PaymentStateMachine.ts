import { InvalidTransitionError } from "./errors";
import type {
  CallbackResult,
  PaymentStatus,
  VerificationStatus,
} from "./types";

/**
 * Allowed transitions. `confirmed` is reachable only from `verifying`
 * (which itself is only entered after a trusted verify path).
 */
const ALLOWED: Record<PaymentStatus, ReadonlySet<PaymentStatus>> = {
  pending: new Set(["callback_received", "verifying", "failed"]),
  callback_received: new Set(["verifying", "failed"]),
  verifying: new Set(["confirmed", "failed", "pending", "refunded"]),
  confirmed: new Set(["refunded"]), // already-confirmed is a no-op at the store layer
  failed: new Set([]),
  refunded: new Set([]),
};

/**
 * Maps untrusted callback kinds → allowed status targets.
 * Deliberately omits `confirmed`.
 */
export type CallbackTargetStatus = Extract<
  PaymentStatus,
  "callback_received" | "failed"
>;

export function statusFromCallback(
  result: CallbackResult,
): CallbackTargetStatus {
  if (result.kind === "callback_cancelled") {
    return "failed";
  }
  return "callback_received";
}

/**
 * Maps verification result → next status.
 * This is the only path that can yield `confirmed`.
 */
export function statusFromVerification(
  result: VerificationStatus,
): Extract<PaymentStatus, "confirmed" | "failed" | "pending" | "refunded"> {
  switch (result) {
    case "confirmed":
      return "confirmed";
    case "pending":
      return "pending";
    case "refunded":
    case "partially_refunded":
      return "refunded";
    case "failed":
      return "failed";
  }
}

function canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  if (from === to) {
    // Idempotent same-status is allowed (especially confirmed → confirmed).
    return true;
  }
  return ALLOWED[from]?.has(to) ?? false;
}

/**
 * Asserts a transition is legal. Throws `InvalidTransitionError` otherwise.
 * Same-status transitions are allowed (idempotent).
 */
function assertTransition(from: PaymentStatus, to: PaymentStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}

/**
 * Apply a callback result. Cannot produce `confirmed` — enforced by
 * `CallbackTargetStatus` (no `confirmed` in the union).
 */
function applyCallback(
  current: PaymentStatus,
  result: CallbackResult,
): CallbackTargetStatus {
  const next = statusFromCallback(result);
  assertTransition(current, next);
  return next;
}

/**
 * Apply a verification result. This is the sole path into `confirmed`.
 */
function applyVerification(
  current: PaymentStatus,
  verificationStatus: VerificationStatus,
): PaymentStatus {
  const next = statusFromVerification(verificationStatus);
  assertTransition(current, next);
  return next;
}

/**
 * Runtime guard used by tests / defensive callers: refuses any attempt to
 * mark confirmed from callback-only input.
 */
function rejectCallbackConfirmation(result: CallbackResult): never {
  void result;
  throw new InvalidTransitionError("callback_received", "confirmed");
}

/** Transition helpers grouped under a single export for a stable public API. */
export const PaymentStateMachine = {
  canTransition,
  assertTransition,
  applyCallback,
  applyVerification,
  rejectCallbackConfirmation,
} as const;
