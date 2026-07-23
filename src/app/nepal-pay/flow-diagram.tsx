"use client";

import { cn } from "@/lib/utils";

export type FlowStep = {
  title: string;
  detail: string;
};

export function ArrowFlow({
  steps,
  className,
}: {
  steps: FlowStep[];
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "flex flex-col gap-0 rounded-lg border-[0.5px] border-border bg-card p-3 sm:p-4",
        className,
      )}
    >
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-3">
          <div className="flex w-8 shrink-0 flex-col items-center">
            <span className="flex size-7 items-center justify-center rounded-full border-[0.5px] border-accent/50 bg-accent/10 font-mono text-[12px] text-accent">
              {i + 1}
            </span>
            {i < steps.length - 1 ? (
              <span
                aria-hidden
                className="mt-1 flex flex-1 flex-col items-center py-1 text-accent"
              >
                <span className="w-px flex-1 bg-border" />
                <span className="text-[10px] leading-none">↓</span>
              </span>
            ) : null}
          </div>
          <div
            className={cn(
              "min-w-0 flex-1 pb-4",
              i === steps.length - 1 && "pb-1",
            )}
          >
            <p className="text-[13px] font-medium tracking-tight text-primary">
              {step.title}
            </p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-secondary">
              {step.detail}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export const ESEWA_FLOW_STEPS: FlowStep[] = [
  {
    title: "Generate signed form",
    detail:
      "Server HMAC-SHA256 over total_amount,transaction_uuid,product_code → Base64 signature.",
  },
  {
    title: "HTML form POST",
    detail:
      "Browser POSTs hidden fields to https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  },
  {
    title: "Pay on eSewa UAT",
    detail: "Login 9711111111 / Nepal@123 / token 123456 — confirm payment.",
  },
  {
    title: "Redirect to success_url",
    detail:
      "eSewa appends ?data=<base64 JSON> (signed callback — still untrusted alone).",
  },
  {
    title: "Verify signature + status API",
    detail:
      "Recompute HMAC, then GET status — only COMPLETE means safe to fulfill.",
  },
];

export const KHALTI_FLOW_STEPS: FlowStep[] = [
  {
    title: "Initiate (JSON)",
    detail:
      "POST /epayment/initiate/ with amount in paisa (NPR × 100). Auth: Key <secret>.",
  },
  {
    title: "Redirect to payment_url",
    detail: "Browser GET to test-pay.khalti.com/?pidx=… (expires ~30–60 min).",
  },
  {
    title: "Pay on Khalti sandbox",
    detail: "Khalti ID 9800000000–9800000005 · MPIN 1111 · OTP 987654.",
  },
  {
    title: "Redirect to return_url",
    detail:
      "Query params: pidx, status, amount, … — no signature; never trust alone.",
  },
  {
    title: "Lookup verify",
    detail:
      "POST /epayment/lookup/ { pidx } — only status Completed means deliver service.",
  },
];

export function TestCredentialsCard({
  gateway,
}: {
  gateway: "esewa" | "khalti";
}) {
  if (gateway === "esewa") {
    return (
      <div className="rounded-md border-[0.5px] border-border bg-card px-3.5 py-3 text-[13px] text-secondary">
        <p className="mb-2 text-[11px] font-medium tracking-wide text-primary uppercase">
          eSewa UAT test credentials
        </p>
        <ul className="space-y-1 font-mono text-[12px]">
          <li>
            <span className="text-tertiary">eSewa ID</span>{" "}
            <span className="text-primary">9711111111</span> (also
            9711111112–14)
          </li>
          <li>
            <span className="text-tertiary">Password</span>{" "}
            <span className="text-primary">Nepal@123</span>
          </li>
          <li>
            <span className="text-tertiary">Token / OTP</span>{" "}
            <span className="text-primary">123456</span>
          </li>
          <li>
            <span className="text-tertiary">Product</span>{" "}
            <span className="text-primary">EPAYTEST</span>
          </li>
          <li>
            <span className="text-tertiary">Secret</span>{" "}
            <span className="text-primary">8gBm/:&EnhH.1/q</span>{" "}
            <span className="font-sans text-tertiary">(no trailing `(`)</span>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-md border-[0.5px] border-border bg-card px-3.5 py-3 text-[13px] text-secondary">
      <p className="mb-2 text-[11px] font-medium tracking-wide text-primary uppercase">
        Khalti KPG-2 sandbox test credentials
      </p>
      <ul className="space-y-1 font-mono text-[12px]">
        <li>
          <span className="text-tertiary">Khalti ID</span>{" "}
          <span className="text-primary">9800000000</span> –{" "}
          <span className="text-primary">9800000005</span>
        </li>
        <li>
          <span className="text-tertiary">MPIN</span>{" "}
          <span className="text-primary">1111</span>
        </li>
        <li>
          <span className="text-tertiary">OTP</span>{" "}
          <span className="text-primary">987654</span>
        </li>
        <li className="font-sans text-[12px] text-tertiary">
          Merchant <span className="font-mono text-primary">secret key</span>{" "}
          comes from your Khalti merchant dashboard (test). Paste it in the form
          or set <span className="font-mono text-primary">KHALTI_SECRET</span>.
        </li>
      </ul>
    </div>
  );
}
