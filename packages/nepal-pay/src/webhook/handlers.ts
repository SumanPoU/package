import {
  SignatureMismatchError,
  VerificationFailedError,
} from "../core/errors";
import type { PaymentGateway } from "../core/PaymentGateway";
import { PaymentStateMachine } from "../core/PaymentStateMachine";
import type { CallbackResult, VerificationResult } from "../core/types";
import type { PaymentStore } from "../store/PaymentStore";

export interface ReturnUrlHandlerOptions {
  /** Redirect here after successful verify → confirmed. */
  successUrl: string;
  /** Redirect here on cancel / failed verification. */
  failureUrl: string;
  /**
   * Called exactly once when a payment first reaches `confirmed`.
   * Concurrent duplicate confirms must not invoke this twice.
   */
  onConfirmed?: (
    paymentId: string,
    providerRef: string,
  ) => void | Promise<void>;
  /**
   * Resolve NPR amount for eSewa status check. Defaults to the stored record amount.
   */
  resolveAmount?: (providerRef: string) => Promise<number | undefined>;
}

export interface ReturnUrlHandlerResult {
  redirectTo: string;
  paymentId?: string;
  status?: string;
}

/**
 * Framework-agnostic return-URL handler.
 *
 * Flow:
 * 1. handleCallback (untrusted)
 * 2. cancel → failed → failureUrl
 * 3. callback_received → verifying → verify()
 * 4. confirmed → idempotent store update → successUrl
 * 5. otherwise → failed → failureUrl
 */
export function createReturnUrlHandler(
  gateway: PaymentGateway,
  store: PaymentStore,
  options: ReturnUrlHandlerOptions,
): (query: Record<string, string>) => Promise<ReturnUrlHandlerResult> {
  return async (query) => {
    let callback: CallbackResult;
    try {
      callback = await gateway.handleCallback(query);
    } catch (err) {
      if (err instanceof SignatureMismatchError) {
        return { redirectTo: options.failureUrl, status: "signature_mismatch" };
      }
      throw err;
    }

    const providerRef = callback.providerRef;

    const record = providerRef
      ? await store.findByProviderRef(gateway.name, providerRef)
      : null;

    if (callback.kind === "callback_cancelled") {
      if (record) {
        const next = PaymentStateMachine.applyCallback(record.status, callback);
        await store.updateStatus(record.id, next);
      }
      return {
        redirectTo: options.failureUrl,
        paymentId: record?.id,
        status: "failed",
      };
    }

    if (!record || !providerRef) {
      return {
        redirectTo: options.failureUrl,
        status: "not_found",
      };
    }

    // Transition through callback_received → verifying (skip if already past).
    let current = record;
    if (current.status === "pending") {
      const next = PaymentStateMachine.applyCallback(current.status, callback);
      const updated = await store.updateStatus(current.id, next);
      current = updated.record;
    }

    if (current.status !== "confirmed" && current.status !== "verifying") {
      PaymentStateMachine.assertTransition(current.status, "verifying");
      const updated = await store.updateStatus(current.id, "verifying");
      current = updated.record;
    }

    let verification: VerificationResult;
    try {
      const amount =
        (await options.resolveAmount?.(providerRef)) ?? current.amount;

      verification = await gateway.verify(providerRef, {
        amount,
        callbackPayload: callback.raw,
      });
    } catch (err) {
      if (
        err instanceof SignatureMismatchError ||
        err instanceof VerificationFailedError
      ) {
        await store.updateStatus(record.id, "failed");
        return {
          redirectTo: options.failureUrl,
          paymentId: record.id,
          status: "failed",
        };
      }
      await store.updateStatus(record.id, "failed");
      throw err;
    }

    // If already confirmed (duplicate fire), short-circuit without re-verify side effects.
    if (current.status === "confirmed") {
      return {
        redirectTo: options.successUrl,
        paymentId: current.id,
        status: "confirmed",
      };
    }

    const nextStatus = PaymentStateMachine.applyVerification(
      "verifying",
      verification.status,
    );

    if (nextStatus === "confirmed") {
      const { record: updated, changed } = await store.updateStatus(
        record.id,
        "confirmed",
      );

      if (changed && options.onConfirmed) {
        await options.onConfirmed(updated.id, providerRef);
      }

      return {
        redirectTo: options.successUrl,
        paymentId: updated.id,
        status: "confirmed",
      };
    }

    await store.updateStatus(
      record.id,
      nextStatus === "pending" ? "pending" : "failed",
    );
    return {
      redirectTo: options.failureUrl,
      paymentId: record.id,
      status: nextStatus,
    };
  };
}
