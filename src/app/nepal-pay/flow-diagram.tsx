"use client";

import { cn } from "@/lib/utils";

export type FlowStep = {
  title: string;
  detail: string;
};

/** Shared surface: solid white on light page, card token in dark. */
const PANEL = "rounded-lg border-[0.5px] border-border bg-card";

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
        "flex min-w-0 flex-col gap-0 overflow-hidden p-3 sm:p-4",
        PANEL,
        className,
      )}
    >
      {steps.map((step, i) => (
        <li key={step.title} className="flex min-w-0 gap-3">
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
              "min-w-0 flex-1 overflow-hidden pb-4",
              i === steps.length - 1 && "pb-1",
            )}
          >
            <p className="text-[13px] font-medium tracking-tight break-words text-primary">
              {step.title}
            </p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed break-words [overflow-wrap:anywhere] text-secondary">
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
    title: "Draft the payment",
    detail:
      "Your server takes the order total in NPR (rupees). Optional tax, service, and delivery are added into total_amount.",
  },
  {
    title: "Sign the form",
    detail:
      "HMAC-SHA256 over three fields in a fixed order (total_amount, transaction_uuid, product_code), then Base64. That signature proves the form came from you.",
  },
  {
    title: "Browser form POST",
    detail:
      "Customer’s browser POSTs hidden fields to eSewa’s form URL (sandbox: rc-epay.esewa.com.np). Same idea as a classic bank redirect.",
  },
  {
    title: "Customer pays",
    detail:
      "They log in on eSewa and confirm. UAT demo: ID 9711111111 · password Nepal@123 · token 123456.",
  },
  {
    title: "Return to your site",
    detail:
      "eSewa redirects to your success_url with ?data=… (Base64 JSON). Treat this as a hint only — not proof of payment.",
  },
  {
    title: "Verify on the server",
    detail:
      "Re-check the HMAC, then call eSewa’s status API. Only status COMPLETE means you may deliver the order.",
  },
];

export const KHALTI_FLOW_STEPS: FlowStep[] = [
  {
    title: "Draft the payment",
    detail:
      "Your app uses NPR (e.g. 10.50). The SDK converts to paisa (×100 → 1050) before talking to Khalti.",
  },
  {
    title: "Initiate (JSON API)",
    detail:
      "Server POSTs to /epayment/initiate/ with Authorization: Key <secret>. Khalti returns a payment_url and pidx.",
  },
  {
    title: "Redirect the customer",
    detail:
      "Send the browser to payment_url (sandbox test-pay.khalti.com). The link expires in about 30–60 minutes.",
  },
  {
    title: "Customer pays",
    detail:
      "They pay in the Khalti app/web UI. Sandbox: IDs 9800000000–05 · MPIN 1111 · OTP 987654.",
  },
  {
    title: "Return to your site",
    detail:
      "Khalti redirects to return_url with pidx, status, amount, etc. There is no signature — never trust this alone.",
  },
  {
    title: "Lookup verify",
    detail:
      "Server POSTs /epayment/lookup/ with the pidx. Only status Completed means you may deliver the order.",
  },
];

export const CONNECTIPS_FLOW_STEPS: FlowStep[] = [
  {
    title: "Draft the payment",
    detail:
      "Use NPR in your app. Convert to paisa for TXNAMT (10.50 → 1050). Pick a unique TXNID (max 20 chars) and TXNDATE as DD-MM-YYYY.",
  },
  {
    title: "Build & sign TOKEN",
    detail:
      "Join the login fields with commas (no spaces), end with TOKEN=TOKEN, then SHA256withRSA and Base64. That becomes the TOKEN form field.",
  },
  {
    title: "Browser form POST",
    detail:
      "Customer’s browser POSTs the fields to /connectipswebgw/loginpage (UAT host: uat.connectips.com).",
  },
  {
    title: "Customer pays",
    detail:
      "They finish payment in connectIPS / their bank. NCHL uses fixed success and failure URLs you registered earlier.",
  },
  {
    title: "Return with TXNID",
    detail:
      "Browser lands on your success URL with only ?TXNID=…. No signature. Failure URL can use ?outcome=failure so you know it was a cancel.",
  },
  {
    title: "validatetxn verify",
    detail:
      "Server POSTs validatetxn with Basic Auth (APPID + password) and a second RSA token. Only status SUCCESS means deliver.",
  },
];

export type ComparisonRow = {
  aspect: string;
  plain: string;
  esewa: string;
  khalti: string;
  connectips: string;
};

export const GATEWAY_COMPARISON_ROWS: ComparisonRow[] = [
  {
    aspect: "How payment starts",
    plain: "How the customer is sent to the gateway",
    esewa: "HTML form POST",
    khalti: "JSON then open payment_url",
    connectips: "HTML form POST",
  },
  {
    aspect: "Amount on the wire",
    plain: "Unit sent to the gateway API",
    esewa: "NPR (rupees)",
    khalti: "Paisa (NPR × 100)",
    connectips: "Paisa (NPR × 100)",
  },
  {
    aspect: "Prove initiate is yours",
    plain: "Auth or signature when starting payment",
    esewa: "HMAC-SHA256",
    khalti: "Auth header Key …",
    connectips: "RSA TOKEN",
  },
  {
    aspect: "What comes back",
    plain: "Query params on your return URL",
    esewa: "Base64 data=…",
    khalti: "pidx + status + …",
    connectips: "TXNID only",
  },
  {
    aspect: "Return URL trusted?",
    plain: "Can you mark paid from the redirect?",
    esewa: "No — re-check HMAC",
    khalti: "No signature",
    connectips: "No signature",
  },
  {
    aspect: "Must call to confirm",
    plain: "Server API that proves money moved",
    esewa: "Status → COMPLETE",
    khalti: "Lookup → Completed",
    connectips: "validatetxn → SUCCESS",
  },
  {
    aspect: "Payment id (providerRef)",
    plain: "Id you store and pass to verify()",
    esewa: "transaction_uuid",
    khalti: "pidx",
    connectips: "TXNID",
  },
  {
    aspect: "Sandbox host",
    plain: "Where test traffic goes",
    esewa: "rc-epay.esewa.com.np",
    khalti: "dev.khalti.com",
    connectips: "uat.connectips.com",
  },
];

/** Side-by-side comparison table — white panel, cells wrap safely. */
export function GatewayComparisonTable({ className }: { className?: string }) {
  return (
    <div className={cn("min-w-0 overflow-x-auto", PANEL, className)}>
      <table className="w-full min-w-[36rem] table-fixed border-collapse text-left text-[12.5px]">
        <colgroup>
          <col className="w-[22%]" />
          <col className="w-[26%]" />
          <col className="w-[26%]" />
          <col className="w-[26%]" />
        </colgroup>
        <thead>
          <tr className="border-b-[0.5px] border-border bg-card">
            <th className="px-3 py-2.5 font-medium break-words text-tertiary">
              Aspect
            </th>
            <th className="px-3 py-2.5 font-medium break-words text-primary">
              eSewa
            </th>
            <th className="px-3 py-2.5 font-medium break-words text-primary">
              Khalti
            </th>
            <th className="px-3 py-2.5 font-medium break-words text-primary">
              connectIPS
            </th>
          </tr>
        </thead>
        <tbody>
          {GATEWAY_COMPARISON_ROWS.map((row) => (
            <tr
              key={row.aspect}
              className="border-b-[0.5px] border-border last:border-0"
            >
              <td className="px-3 py-2.5 align-top">
                <p className="font-medium break-words text-secondary">
                  {row.aspect}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug break-words text-tertiary">
                  {row.plain}
                </p>
              </td>
              <td className="px-3 py-2.5 align-top break-words [overflow-wrap:anywhere] text-secondary">
                {row.esewa}
              </td>
              <td className="px-3 py-2.5 align-top break-words [overflow-wrap:anywhere] text-secondary">
                {row.khalti}
              </td>
              <td className="px-3 py-2.5 align-top break-words [overflow-wrap:anywhere] text-secondary">
                {row.connectips}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Three arrow diagrams — each column constrained so text cannot spill. */
export function GatewayFlowCompare({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-2 overflow-hidden">
        <p className="text-[13px] font-medium text-primary">eSewa (ePay v2)</p>
        <p className="text-[12px] break-words text-tertiary">
          Signed form · NPR · status API
        </p>
        <ArrowFlow steps={ESEWA_FLOW_STEPS} />
      </div>
      <div className="flex min-w-0 flex-col gap-2 overflow-hidden">
        <p className="text-[13px] font-medium text-primary">Khalti (KPG-2)</p>
        <p className="text-[12px] break-words text-tertiary">
          JSON initiate · paisa · lookup
        </p>
        <ArrowFlow steps={KHALTI_FLOW_STEPS} />
      </div>
      <div className="flex min-w-0 flex-col gap-2 overflow-hidden">
        <p className="text-[13px] font-medium text-primary">
          connectIPS (NCHL)
        </p>
        <p className="text-[12px] break-words text-tertiary">
          RSA TOKEN · paisa · validatetxn
        </p>
        <ArrowFlow steps={CONNECTIPS_FLOW_STEPS} />
      </div>
    </div>
  );
}

export function TestCredentialsCard({
  gateway,
}: {
  gateway: "esewa" | "khalti" | "connectips";
}) {
  if (gateway === "esewa") {
    return (
      <div
        className={cn(
          "min-w-0 overflow-hidden px-3.5 py-3 text-[13px] text-secondary",
          PANEL,
        )}
      >
        <p className="mb-2 text-[11px] font-medium tracking-wide text-primary uppercase">
          eSewa UAT test credentials
        </p>
        <ul className="space-y-1 font-mono text-[12px] break-words">
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
          <li className="[overflow-wrap:anywhere]">
            <span className="text-tertiary">Secret</span>{" "}
            <span className="text-primary">8gBm/:&EnhH.1/q</span>{" "}
            <span className="font-sans text-tertiary">(no trailing `(`)</span>
          </li>
        </ul>
      </div>
    );
  }

  if (gateway === "connectips") {
    return (
      <div
        className={cn(
          "min-w-0 overflow-hidden px-3.5 py-3 text-[13px] text-secondary",
          PANEL,
        )}
      >
        <p className="mb-2 text-[11px] font-medium tracking-wide text-primary uppercase">
          connectIPS UAT (NCHL)
        </p>
        <ul className="space-y-1.5 text-[12px] break-words">
          <li className="font-sans text-secondary">
            Merchant ID, APPID, password, and{" "}
            <span className="font-mono text-primary">CREDITOR.pfx</span> come
            from NCHL after onboarding — there is no public demo login like
            eSewa/Khalti.
          </li>
          <li className="font-sans text-secondary">
            Docs playground defaults to{" "}
            <span className="font-mono text-primary">mock</span>: builds a real
            RSA-signed form, then simulates return →{" "}
            <span className="font-mono text-primary">validatetxn SUCCESS</span>.
          </li>
          <li className="font-sans text-tertiary">
            For live UAT: paste PEM (exported from the PFX) plus merchant
            fields, or set{" "}
            <span className="font-mono text-primary">CONNECTIPS_*</span> env
            vars and uncheck mock.
          </li>
          <li className="font-mono text-[11px] text-tertiary [overflow-wrap:anywhere]">
            Host: https://uat.connectips.com
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden px-3.5 py-3 text-[13px] text-secondary",
        PANEL,
      )}
    >
      <p className="mb-2 text-[11px] font-medium tracking-wide text-primary uppercase">
        Khalti KPG-2 sandbox test credentials
      </p>
      <ul className="space-y-1 font-mono text-[12px] break-words">
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
