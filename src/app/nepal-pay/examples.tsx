"use client";

import { type FormEvent, useState } from "react";

import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/utils";
import {
  ArrowFlow,
  ESEWA_FLOW_STEPS,
  KHALTI_FLOW_STEPS,
  TestCredentialsCard,
} from "./flow-diagram";
import { RESPONSE_SAMPLES } from "./response-samples";

type DemoStatus =
  | "pending"
  | "callback_received"
  | "verifying"
  | "confirmed"
  | "failed";

const STEPS: { id: DemoStatus; label: string; note: string }[] = [
  {
    id: "pending",
    label: "pending",
    note: "After initiate() — user is on the gateway page",
  },
  {
    id: "callback_received",
    label: "callback_received",
    note: "Browser hit return URL — still untrusted",
  },
  {
    id: "verifying",
    label: "verifying",
    note: "Server calling status API / lookup",
  },
  {
    id: "confirmed",
    label: "confirmed",
    note: "Only verify() can land here — safe to fulfill",
  },
];

export function StateMachineDemo() {
  const [status, setStatus] = useState<DemoStatus>("pending");
  const [log, setLog] = useState<string[]>(["Payment created → pending"]);
  const [grants, setGrants] = useState(0);

  function push(msg: string) {
    setLog((prev) => [...prev.slice(-6), msg]);
  }

  function simulateCallback(ok: boolean) {
    if (status !== "pending") return;
    if (!ok) {
      setStatus("failed");
      push("handleCallback → cancelled → failed");
      return;
    }
    setStatus("callback_received");
    push("handleCallback → callback_received (untrusted)");
  }

  function simulateVerify(ok: boolean) {
    if (status !== "callback_received" && status !== "verifying") return;
    setStatus("verifying");
    push("transition → verifying");
    window.setTimeout(() => {
      if (ok) {
        setStatus("confirmed");
        setGrants((g) => g + 1);
        push("verify() → confirmed · onConfirmed fired");
      } else {
        setStatus("failed");
        push("verify() → failed");
      }
    }, 400);
  }

  function simulateDoubleConfirm() {
    if (status !== "confirmed") return;
    push("duplicate confirm → idempotent no-op (onConfirmed skipped)");
  }

  function reset() {
    setStatus("pending");
    setGrants(0);
    setLog(["Payment created → pending"]);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border-[0.5px] border-border bg-muted/40 p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={cn(
              "rounded-md border-[0.5px] px-2.5 py-1.5 text-[12px] font-mono transition-colors",
              status === step.id
                ? "border-accent bg-accent/10 text-accent"
                : status === "failed" && step.id === "confirmed"
                  ? "border-border text-tertiary"
                  : "border-border bg-card text-secondary",
            )}
          >
            {step.label}
          </div>
        ))}
        {status === "failed" ? (
          <div className="rounded-md border-[0.5px] border-border bg-card px-2.5 py-1.5 font-mono text-[12px] text-secondary">
            failed
          </div>
        ) : null}
      </div>

      <p className="text-[13px] text-secondary">
        {STEPS.find((s) => s.id === status)?.note ??
          "Payment failed — do not fulfill"}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border-[0.5px] border-border bg-card px-3 py-1.5 text-[13px] text-primary hover:border-accent/40"
          onClick={() => simulateCallback(true)}
          disabled={status !== "pending"}
        >
          Simulate return (ok)
        </button>
        <button
          type="button"
          className="rounded-md border-[0.5px] border-border bg-card px-3 py-1.5 text-[13px] text-primary hover:border-accent/40"
          onClick={() => simulateCallback(false)}
          disabled={status !== "pending"}
        >
          Simulate cancel
        </button>
        <button
          type="button"
          className="rounded-md border-[0.5px] border-border bg-card px-3 py-1.5 text-[13px] text-primary hover:border-accent/40"
          onClick={() => simulateVerify(true)}
          disabled={status !== "callback_received"}
        >
          verify() success
        </button>
        <button
          type="button"
          className="rounded-md border-[0.5px] border-border bg-card px-3 py-1.5 text-[13px] text-primary hover:border-accent/40"
          onClick={() => simulateVerify(false)}
          disabled={status !== "callback_received"}
        >
          verify() fail
        </button>
        <button
          type="button"
          className="rounded-md border-[0.5px] border-border bg-card px-3 py-1.5 text-[13px] text-primary hover:border-accent/40"
          onClick={simulateDoubleConfirm}
          disabled={status !== "confirmed"}
        >
          Duplicate webhook
        </button>
        <button
          type="button"
          className="rounded-md border-[0.5px] border-border bg-card px-3 py-1.5 text-[13px] text-secondary hover:text-primary"
          onClick={reset}
        >
          Reset
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="text-secondary">
          <span className="font-mono text-primary">onConfirmed</span> calls:{" "}
          <span className="font-mono text-accent">{grants}</span>
        </span>
        <span className="text-tertiary">Demo only — no live gateway calls</span>
      </div>

      <ul className="rounded-md border-[0.5px] border-border bg-card px-3 py-2 font-mono text-[11px] leading-relaxed text-secondary">
        {log.map((line, i) => (
          <li key={`${i}-${line}`}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

export const STATE_MACHINE_DEMO_CODE = `"use client";
// Interactive demo on the docs site — mirrors PaymentStateMachine rules:
// handleCallback → callback_received | failed (never confirmed)
// verify()       → confirmed | failed | pending
// duplicate confirm → onConfirmed runs once`;

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
};

function Field({ label, value, onChange, type = "text", hint }: FieldProps) {
  return (
    <label className="flex flex-col gap-1 text-[13px]">
      <span className="text-secondary">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border-[0.5px] border-border bg-card px-2.5 py-1.5 font-mono text-[12.5px] text-primary outline-none focus:border-accent"
      />
      {hint ? <span className="text-[11px] text-tertiary">{hint}</span> : null}
    </label>
  );
}

function JsonPanel({
  title,
  data,
  tone = "neutral",
}: {
  title: string;
  data: unknown;
  tone?: "neutral" | "ok" | "err";
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-md border-[0.5px] px-3 py-2",
        tone === "ok" && "border-accent/40 bg-accent/5",
        tone === "err" && "border-border bg-card",
        tone === "neutral" && "border-border bg-card",
      )}
    >
      <p className="mb-1 text-[11px] font-medium tracking-wide text-tertiary uppercase">
        {title}
      </p>
      <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-secondary">
        {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

type EsewaInitiateResponse = {
  ok: boolean;
  initiate?: {
    redirectUrl: string;
    providerRef: string;
    method: "POST" | "GET";
    formFields?: Record<string, string>;
  };
  signedMessage?: string;
  flow?: string[];
  note?: string;
  error?: { code: string; name: string; message: string };
};

export function EsewaTestForm() {
  const [amount, setAmount] = useState("100");
  const [tax, setTax] = useState("0");
  const [orderId, setOrderId] = useState(`demo-${Date.now().toString(36)}`);
  const [returnUrl, setReturnUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<EsewaInitiateResponse | null>(null);

  async function generate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/nepal-pay/esewa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          taxAmount: Number(tax) || 0,
          orderId: orderId.replace(/[^A-Za-z0-9-]/g, "-"),
          returnUrl: returnUrl || undefined,
          failureUrl: returnUrl
            ? `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}failed=1`
            : undefined,
        }),
      });
      const json = (await res.json()) as EsewaInitiateResponse;
      setResult(json);
    } catch (err) {
      setResult({
        ok: false,
        error: {
          code: "NETWORK",
          name: "NetworkError",
          message: err instanceof Error ? err.message : String(err),
        },
      });
    } finally {
      setBusy(false);
    }
  }

  const fields = result?.initiate?.formFields;

  return (
    <div className="flex flex-col gap-4 rounded-lg border-[0.5px] border-border bg-muted/40 p-4 sm:p-5">
      <TestCredentialsCard gateway="esewa" />
      <ArrowFlow steps={ESEWA_FLOW_STEPS} />

      <ol className="list-decimal space-y-1 pl-5 text-[13px] text-secondary">
        <li>
          Generate a signed form (UAT secret without trailing parenthesis)
        </li>
        <li>Submit the HTML POST — opens eSewa sandbox login</li>
        <li>Pay with the credentials above</li>
        <li>
          Return to{" "}
          <span className="font-mono text-primary">/nepal-pay/return</span> for
          signature + status verify
        </li>
      </ol>

      <form onSubmit={generate} className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Amount (NPR)"
          value={amount}
          onChange={setAmount}
          type="number"
          hint="Decimal NPR — eSewa uses the same unit"
        />
        <Field label="Tax amount" value={tax} onChange={setTax} type="number" />
        <Field
          label="transaction_uuid (alphanumeric + hyphen)"
          value={orderId}
          onChange={setOrderId}
        />
        <Field
          label="Return URL (optional)"
          value={returnUrl}
          onChange={setReturnUrl}
          hint="Defaults to /nepal-pay/return — do not use hash URLs"
        />
        <div className="flex items-end sm:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md border-[0.5px] border-border bg-card px-3 py-2 text-[13px] text-primary hover:border-accent/40 disabled:opacity-50"
          >
            {busy ? "Signing…" : "1. Generate signed form"}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-medium tracking-wide text-tertiary uppercase">
          Full request code
        </p>
        <CodeBlock
          code={`const res = await fetch("/api/nepal-pay/esewa/initiate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    amount: ${Number(amount) || 100},
    taxAmount: ${Number(tax) || 0},
    orderId: ${JSON.stringify(orderId)},
  }),
});
const { initiate } = await res.json();
// POST form → initiate.redirectUrl with initiate.formFields
// Return → /nepal-pay/return?data=… → verify signature + status`}
        />
      </div>

      {result?.error ? (
        <JsonPanel title="Error response" data={result} tone="err" />
      ) : null}

      {result?.ok && result.initiate && fields ? (
        <div className="flex flex-col gap-3">
          {result.signedMessage ? (
            <JsonPanel
              title="Canonical string used for HMAC"
              data={result.signedMessage}
              tone="neutral"
            />
          ) : null}
          <JsonPanel
            title="Good response (SDK initiate)"
            data={result}
            tone="ok"
          />
          {result.note ? (
            <p className="text-[12px] text-tertiary">{result.note}</p>
          ) : null}
          <form
            action={result.initiate.redirectUrl}
            method="POST"
            className="flex flex-col gap-3 rounded-md border-[0.5px] border-border bg-card p-3"
          >
            {Object.entries(fields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[28rem] text-left text-[12px]">
                <thead>
                  <tr className="border-b-[0.5px] border-border text-tertiary">
                    <th className="py-1 pr-3 font-medium">Field</th>
                    <th className="py-1 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(fields).map(([name, value]) => (
                    <tr
                      key={name}
                      className="border-b-[0.5px] border-border last:border-0"
                    >
                      <td className="py-1.5 pr-3 font-mono text-accent">
                        {name}
                      </td>
                      <td className="py-1.5 font-mono break-all text-secondary">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="submit"
              className="self-start rounded-md bg-accent px-3 py-2 text-[13px] font-medium text-accent-fg"
            >
              2. Pay with eSewa (sandbox) →
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export const ESEWA_TEST_FORM_CODE = `// Full eSewa sandbox flow (same as the form above)
const res = await fetch("/api/nepal-pay/esewa/initiate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    amount: 100,
    taxAmount: 0,
    orderId: "demo-1",
    // defaults to /nepal-pay/return
  }),
});
const { initiate } = await res.json();

// Real HTML form — browser POST (not GET)
// <form action={initiate.redirectUrl} method="POST">
//   {Object.entries(initiate.formFields).map(([k,v]) =>
//     <input type="hidden" name={k} value={v} />)}
//   <button type="submit">Pay with eSewa</button>
// </form>
//
// After pay → /nepal-pay/return?data=<base64>
// Server verifies signature + GET status API`;

type KhaltiInitiateResponse = {
  ok: boolean;
  live?: boolean;
  note?: string;
  amountNpr?: number;
  amountPaisa?: number;
  flow?: string[];
  testCredentials?: {
    khaltiIds: string[];
    mpin: string;
    otp: string;
  };
  requestSent?: Record<string, unknown>;
  simulateReturnUrl?: string;
  initiate?: {
    redirectUrl: string;
    providerRef: string;
    method: "GET" | "POST";
  };
  upstream?: Record<string, unknown>;
  error?: {
    code: string;
    name: string;
    message: string;
    statusCode?: number;
    body?: unknown;
  };
};

export function KhaltiTestForm() {
  const [amount, setAmount] = useState("10.50");
  const [orderId, setOrderId] = useState(`demo-${Date.now().toString(36)}`);
  const [orderName, setOrderName] = useState("itzsa docs demo");
  const [phone, setPhone] = useState("9800000000");
  const [secretKey, setSecretKey] = useState("");
  const [useMock, setUseMock] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<KhaltiInitiateResponse | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/nepal-pay/khalti/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          orderId,
          orderName,
          customerPhone: phone,
          secretKey: secretKey.trim() || undefined,
          mock: useMock,
        }),
      });
      const json = (await res.json()) as KhaltiInitiateResponse;
      setResult(json);
    } catch (err) {
      setResult({
        ok: false,
        error: {
          code: "NETWORK",
          name: "NetworkError",
          message: err instanceof Error ? err.message : String(err),
        },
      });
    } finally {
      setBusy(false);
    }
  }

  const fullCode = `// NPR ${amount} → ${Math.round(Number(amount) * 100)} paisa
const res = await fetch("/api/nepal-pay/khalti/initiate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    amount: ${Number(amount)},
    orderId: ${JSON.stringify(orderId)},
    orderName: ${JSON.stringify(orderName)},
    customerPhone: ${JSON.stringify(phone)},
    mock: ${useMock},
    // secretKey: "your_test_secret", // or set KHALTI_SECRET
    // returnUrl defaults to /nepal-pay/khalti-return
  }),
});
const { initiate, requestSent } = await res.json();
// requestSent.amount === ${Math.round(Number(amount) * 100)}  (paisa)
// Live: window.location = initiate.redirectUrl
// Mock: open simulateReturnUrl → lookup verify on return page`;

  return (
    <div className="flex flex-col gap-4 rounded-lg border-[0.5px] border-border bg-muted/40 p-4 sm:p-5">
      <TestCredentialsCard gateway="khalti" />
      <ArrowFlow steps={KHALTI_FLOW_STEPS} />

      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Amount (NPR)"
          value={amount}
          onChange={setAmount}
          type="number"
          hint="Must be > 10. Converted to paisa (×100) in the request"
        />
        <Field label="Order name" value={orderName} onChange={setOrderName} />
        <Field
          label="purchase_order_id"
          value={orderId}
          onChange={setOrderId}
        />
        <Field
          label="Customer phone (test ID)"
          value={phone}
          onChange={setPhone}
          hint="Use 9800000000–9800000005 in sandbox"
        />
        <label className="flex flex-col gap-1 text-[13px] sm:col-span-2">
          <span className="text-secondary">
            Khalti sandbox secret key (optional for live)
          </span>
          <input
            type="password"
            autoComplete="off"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Paste test secret — or set KHALTI_SECRET in env"
            className="rounded-md border-[0.5px] border-border bg-card px-2.5 py-1.5 font-mono text-[12.5px] text-primary outline-none focus:border-accent"
          />
        </label>
        <label className="flex items-center gap-2 text-[13px] text-secondary sm:col-span-2">
          <input
            type="checkbox"
            checked={useMock}
            onChange={(e) => setUseMock(e.target.checked)}
          />
          Mock mode (complete full return → lookup flow without a secret)
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md border-[0.5px] border-border bg-card px-3 py-2 text-[13px] text-primary hover:border-accent/40 disabled:opacity-50"
          >
            {busy ? "Initiating…" : "1. Initiate payment"}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-medium tracking-wide text-tertiary uppercase">
          Full request code
        </p>
        <CodeBlock code={fullCode} />
      </div>

      {result?.requestSent ? (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-medium tracking-wide text-tertiary uppercase">
            Request body (what Khalti receives)
          </p>
          <JsonPanel
            title="requestSent — amount in paisa"
            data={result.requestSent}
          />
          {result.amountNpr != null && result.amountPaisa != null ? (
            <p className="font-mono text-[12px] text-secondary">
              {result.amountNpr} NPR → {result.amountPaisa} paisa
            </p>
          ) : null}
        </div>
      ) : null}

      {result?.error ? (
        <JsonPanel title="Error response" data={result} tone="err" />
      ) : null}

      {result?.ok && result.initiate ? (
        <div className="flex flex-col gap-3">
          <JsonPanel
            title={
              result.live
                ? "Good response (live sandbox)"
                : "Good response (mock — full return flow still works)"
            }
            data={result}
            tone="ok"
          />
          {result.upstream ? (
            <JsonPanel title="Upstream initiate shape" data={result.upstream} />
          ) : null}
          {result.note ? (
            <p className="text-[13px] text-secondary">{result.note}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {result.live ? (
              <a
                href={result.initiate.redirectUrl}
                className="rounded-md bg-accent px-3 py-2 text-[13px] font-medium text-accent-fg no-underline"
              >
                2. Pay with Khalti (sandbox) →
              </a>
            ) : (
              <a
                href={result.simulateReturnUrl || result.initiate.redirectUrl}
                className="rounded-md bg-accent px-3 py-2 text-[13px] font-medium text-accent-fg no-underline"
              >
                2. Simulate return + lookup verify →
              </a>
            )}
          </div>

          {!result.live ? (
            <p className="text-[12px] text-tertiary">
              For a real Khalti page: uncheck mock, paste your test secret, then
              Initiate again. After paying with ID/MPIN/OTP you land on{" "}
              <code className="font-mono text-primary">
                /nepal-pay/khalti-return
              </code>
              .
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export const KHALTI_TEST_FORM_CODE = `// Full Khalti sandbox flow (mirrors eSewa return → verify)
const res = await fetch("/api/nepal-pay/khalti/initiate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    amount: 10.5,              // NPR → 1050 paisa inside adapter
    orderId: "demo-1",
    orderName: "Pro plan",
    customerPhone: "9800000000",
    secretKey: process.env.KHALTI_SECRET, // or paste in the form
    mock: false,
  }),
});
const { initiate, requestSent } = await res.json();
// window.location.href = initiate.redirectUrl
//
// After pay → /nepal-pay/khalti-return?pidx=&status=Completed&…
// Server POST /epayment/lookup/ — only Completed = fulfill
//
// Test: ID 9800000000–05 · MPIN 1111 · OTP 987654`;

export function ResponseExplorer() {
  const [gateway, setGateway] = useState<"all" | "esewa" | "khalti" | "sdk">(
    "all",
  );
  const [kind, setKind] = useState<"all" | "success" | "error" | "info">("all");
  const [activeId, setActiveId] = useState(RESPONSE_SAMPLES[0]?.id ?? "");

  const filtered = RESPONSE_SAMPLES.filter((s) => {
    if (gateway !== "all" && s.gateway !== gateway) return false;
    if (kind !== "all" && s.kind !== kind) return false;
    return true;
  });

  const active = filtered.find((s) => s.id === activeId) ?? filtered[0] ?? null;

  return (
    <div className="flex flex-col gap-4 rounded-lg border-[0.5px] border-border bg-muted/40 p-4 sm:p-5">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["esewa", "eSewa"],
            ["khalti", "Khalti"],
            ["sdk", "SDK"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setGateway(id)}
            className={cn(
              "rounded-md border-[0.5px] px-2.5 py-1 text-[12px]",
              gateway === id
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-card text-secondary",
            )}
          >
            {label}
          </button>
        ))}
        <span className="mx-1 text-tertiary">·</span>
        {(
          [
            ["all", "All"],
            ["success", "Success"],
            ["error", "Errors"],
            ["info", "Info"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setKind(id)}
            className={cn(
              "rounded-md border-[0.5px] px-2.5 py-1 text-[12px]",
              kind === id
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-card text-secondary",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[14rem_1fr]">
        <ul className="flex max-h-72 flex-col gap-0.5 overflow-y-auto rounded-md border-[0.5px] border-border bg-card p-1">
          {filtered.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setActiveId(s.id)}
                className={cn(
                  "w-full rounded-sm px-2 py-1.5 text-left text-[12px]",
                  active?.id === s.id
                    ? "bg-accent/10 text-accent"
                    : "text-secondary hover:text-primary",
                )}
              >
                <span
                  className={cn(
                    "mr-1.5 inline-block size-1.5 rounded-full",
                    s.kind === "success" && "bg-accent",
                    s.kind === "error" && "bg-secondary",
                    s.kind === "info" && "bg-tertiary",
                  )}
                />
                {s.label}
              </button>
            </li>
          ))}
        </ul>

        {active ? (
          <div className="flex flex-col gap-2">
            <p className="text-[13px] text-secondary">{active.note}</p>
            <JsonPanel
              title={`${active.label} · ${active.kind}`}
              data={active.json}
              tone={
                active.kind === "success"
                  ? "ok"
                  : active.kind === "error"
                    ? "err"
                    : "neutral"
              }
            />
          </div>
        ) : (
          <p className="text-[13px] text-tertiary">
            No samples for this filter.
          </p>
        )}
      </div>
    </div>
  );
}

export const RESPONSE_EXPLORER_CODE = `// All success + error payloads live in response-samples.ts
// Filter by gateway (esewa | khalti | sdk) and kind (success | error | info)`;
