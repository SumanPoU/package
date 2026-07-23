import { describe, expect, expectTypeOf, it } from "vitest";
import { InvalidTransitionError } from "../src/core/errors";
import {
  PaymentStateMachine,
  statusFromCallback,
} from "../src/core/PaymentStateMachine";
import type { CallbackResult } from "../src/core/types";

describe("payment state machine", () => {
  it("cannot reach confirmed via handleCallback output (type-level)", () => {
    const callback: CallbackResult = {
      kind: "callback_received",
      providerRef: "ref-1",
      raw: {},
    };

    const next = statusFromCallback(callback);
    expectTypeOf(next).toEqualTypeOf<"callback_received" | "failed">();
    // @ts-expect-error — confirmed is not a valid callback target
    const _illegal: "confirmed" = next;
    void _illegal;

    expect(next).toBe("callback_received");
    expect(next).not.toBe("confirmed");
  });

  it("runtime-rejects forcing confirmed from callback-only input", () => {
    const callback: CallbackResult = {
      kind: "callback_received",
      providerRef: "ref-1",
      raw: {},
    };

    expect(() =>
      PaymentStateMachine.rejectCallbackConfirmation(callback),
    ).toThrow(InvalidTransitionError);

    // applyCallback can never return confirmed
    const next = PaymentStateMachine.applyCallback("pending", callback);
    expect(next).toBe("callback_received");

    expect(() =>
      PaymentStateMachine.assertTransition("callback_received", "confirmed"),
    ).toThrow(InvalidTransitionError);
  });

  it("allows confirmed only from verifying via verification result", () => {
    expect(
      PaymentStateMachine.applyVerification("verifying", "confirmed"),
    ).toBe("confirmed");

    expect(() =>
      PaymentStateMachine.assertTransition("pending", "confirmed"),
    ).toThrow(InvalidTransitionError);
  });

  it("maps cancel callback to failed", () => {
    const next = PaymentStateMachine.applyCallback("pending", {
      kind: "callback_cancelled",
      reason: "user canceled",
      raw: {},
    });
    expect(next).toBe("failed");
  });
});
