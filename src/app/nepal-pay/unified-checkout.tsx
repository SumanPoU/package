"use client";

import { type FormEvent, useMemo, useState } from "react";

import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/utils";
import {
  ArrowFlow,
  ESEWA_FLOW_STEPS,
  KHALTI_FLOW_STEPS,
  TestCredentialsCard,
} from "./flow-diagram";

type GatewayChoice = "esewa" | "khalti";

type InitiateResult = {
  ok: boolean;
  live?: boolean;
  note?: string;
  signedMessage?: string;
  amountNpr?: number;
  amountPaisa?: number;
  requestSent?: Record<string, unknown>;
  simulateReturnUrl?: string;
  initiate?: {
    redirectUrl: string;
    providerRef: string;
    method: "GET" | "POST";
    formFields?: Record<string, string>;
  };
  upstream?: Record<string, unknown>;
  error?: {
    code?: string;
    name?: string;
    message: string;
    statusCode?: number;
    body?: unknown;
  };
};

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  readOnly,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  readOnly?: boolean;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5 text-[13px]", className)}>
      <span className="text-secondary">{label}</span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={cn(
          "rounded-md border-[0.5px] border-border bg-card px-3 py-2 text-[13px] text-primary outline-none focus:border-accent",
          readOnly && "bg-muted/60 text-secondary",
          type === "number" && "font-mono",
        )}
      />
      {hint ? <span className="text-[11px] text-tertiary">{hint}</span> : null}
    </label>
  );
}

function JsonBlock({
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

/**
 * Unified eSewa + Khalti checkout form (same fields → gateway-specific initiate).
 * Always shows the full form and generated code — nothing behind tabs.
 */
export function UnifiedCheckoutForm() {
  const [gateway, setGateway] = useState<GatewayChoice>("esewa");
  const [name, setName] = useState("Suman Acharya");
  const [amount, setAmount] = useState("100");
  const [orderId, setOrderId] = useState(
    () => `ORD-${Date.now().toString(36).toUpperCase()}`,
  );
  const [description, setDescription] = useState("Order payment");
  const [successUrl, setSuccessUrl] = useState("");
  const [failureUrl, setFailureUrl] = useState("");
  const [tax, setTax] = useState("0");
  const [service, setService] = useState("0");
  const [delivery, setDelivery] = useState("0");
  const [khaltiSecret, setKhaltiSecret] = useState("");
  const [useMock, setUseMock] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<InitiateResult | null>(null);

  const total = useMemo(() => {
    const a = Number(amount) || 0;
    const t = Number(tax) || 0;
    const s = Number(service) || 0;
    const d = Number(delivery) || 0;
    return (a + t + s + d).toFixed(2).replace(/\.00$/, "");
  }, [amount, tax, service, delivery]);

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000";

  const defaultSuccess =
    gateway === "esewa"
      ? `${origin}/nepal-pay/return`
      : `${origin}/nepal-pay/khalti-return`;
  const defaultFailure =
    gateway === "esewa"
      ? `${origin}/nepal-pay/return?failed=1`
      : `${origin}/nepal-pay/khalti-return?status=${encodeURIComponent("User canceled")}`;

  function clearForm() {
    setName("Suman Acharya");
    setAmount("100");
    setOrderId(`ORD-${Date.now().toString(36).toUpperCase()}`);
    setDescription("Order payment");
    setSuccessUrl("");
    setFailureUrl("");
    setTax("0");
    setService("0");
    setDelivery("0");
    setKhaltiSecret("");
    setUseMock(true);
    setResult(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);

    const returnUrl = successUrl.trim() || defaultSuccess;
    const failUrl = failureUrl.trim() || defaultFailure;
    const ref = orderId.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 40);

    try {
      if (gateway === "esewa") {
        const res = await fetch("/api/nepal-pay/esewa/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(amount),
            taxAmount: Number(tax) || 0,
            serviceCharge: Number(service) || 0,
            deliveryCharge: Number(delivery) || 0,
            orderId: ref,
            orderName: description || "Order payment",
            returnUrl,
            failureUrl: failUrl,
          }),
        });
        setResult((await res.json()) as InitiateResult);
      } else {
        const res = await fetch("/api/nepal-pay/khalti/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(amount),
            orderId: ref,
            orderName: description || "Order payment",
            returnUrl,
            customerName: name,
            customerPhone: "9800000000",
            secretKey: khaltiSecret.trim() || undefined,
            mock: useMock,
          }),
        });
        setResult((await res.json()) as InitiateResult);
      }
    } catch (err) {
      setResult({
        ok: false,
        error: {
          message: err instanceof Error ? err.message : String(err),
        },
      });
    } finally {
      setBusy(false);
    }
  }

  const snippet = `// Unified checkout → ${gateway}
const payload = {
  amount: ${Number(amount) || 0},
  taxAmount: ${Number(tax) || 0},
  serviceCharge: ${Number(service) || 0},
  deliveryCharge: ${Number(delivery) || 0},
  orderId: ${JSON.stringify(orderId)},
  orderName: ${JSON.stringify(description || "Order payment")},
  customerName: ${JSON.stringify(name)},
  returnUrl: ${JSON.stringify(successUrl.trim() || defaultSuccess)},
  failureUrl: ${JSON.stringify(failureUrl.trim() || defaultFailure)},
};

${
  gateway === "esewa"
    ? `// eSewa: signed HTML POST
const res = await fetch("/api/nepal-pay/esewa/initiate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const { initiate } = await res.json();
// <form method="POST" action={initiate.redirectUrl}>…formFields…</form>
// → /nepal-pay/return?data=… → verify signature + status`
    : `// Khalti: amount NPR → paisa internally (${Math.round((Number(amount) || 0) * 100)} paisa)
const res = await fetch("/api/nepal-pay/khalti/initiate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...payload,
    customerPhone: "9800000000",
    secretKey: process.env.KHALTI_SECRET, // or paste in form
    mock: ${useMock},
  }),
});
const { initiate } = await res.json();
// window.location = initiate.redirectUrl
// → /nepal-pay/khalti-return?pidx=&status=… → lookup verify
// Test: 9800000000–05 · MPIN 1111 · OTP 987654`
}`;

  const fields = result?.initiate?.formFields;

  return (
    <div className="flex flex-col gap-5">
      <TestCredentialsCard gateway={gateway} />
      <ArrowFlow
        steps={gateway === "esewa" ? ESEWA_FLOW_STEPS : KHALTI_FLOW_STEPS}
      />

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 rounded-xl border-[0.5px] border-border bg-card p-4 sm:p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledInput label="Name" value={name} onChange={setName} />
          <LabeledInput
            label="Amount (NPR)"
            value={amount}
            onChange={setAmount}
            type="number"
            hint={
              gateway === "khalti"
                ? "Must be > 10 — sent as paisa (×100)"
                : "eSewa uses NPR decimals"
            }
          />
          <LabeledInput
            label="Reference / Order ID"
            value={orderId}
            onChange={setOrderId}
            hint="Alphanumeric + hyphen (eSewa); unique per payment"
          />
          <LabeledInput
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Order payment"
          />
          <LabeledInput
            label="Success URL"
            value={successUrl}
            onChange={setSuccessUrl}
            placeholder={defaultSuccess}
            hint="Leave blank to use the docs return page"
          />
          <LabeledInput
            label="Failure URL"
            value={failureUrl}
            onChange={setFailureUrl}
            placeholder={defaultFailure}
          />
          <LabeledInput
            label="Tax (NPR)"
            value={tax}
            onChange={setTax}
            type="number"
          />
          <LabeledInput
            label="Service charge (NPR)"
            value={service}
            onChange={setService}
            type="number"
          />
          <LabeledInput
            label="Delivery (NPR)"
            value={delivery}
            onChange={setDelivery}
            type="number"
          />
          <LabeledInput
            label="Total (NPR)"
            value={total}
            readOnly
            hint="amount + tax + service + delivery"
          />
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-[13px] text-secondary">Payment method</legend>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-[13px] text-primary">
              <input
                type="radio"
                name="gateway"
                checked={gateway === "esewa"}
                onChange={() => {
                  setGateway("esewa");
                  setResult(null);
                }}
              />
              eSewa
            </label>
            <label className="flex items-center gap-2 text-[13px] text-primary">
              <input
                type="radio"
                name="gateway"
                checked={gateway === "khalti"}
                onChange={() => {
                  setGateway("khalti");
                  setResult(null);
                }}
              />
              Khalti
            </label>
          </div>
        </fieldset>

        {gateway === "khalti" ? (
          <div className="flex flex-col gap-3 rounded-md border-[0.5px] border-border bg-muted/40 p-3">
            <LabeledInput
              label="Khalti sandbox secret (for live pay)"
              value={khaltiSecret}
              onChange={setKhaltiSecret}
              type="password"
              placeholder="Paste test secret — or set KHALTI_SECRET"
            />
            <label className="flex items-center gap-2 text-[13px] text-secondary">
              <input
                type="checkbox"
                checked={useMock}
                onChange={(e) => setUseMock(e.target.checked)}
              />
              Mock mode (full return → lookup without a secret)
            </label>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-accent-fg disabled:opacity-50"
          >
            {busy
              ? "Working…"
              : gateway === "esewa"
                ? "Generate signed form"
                : "Initiate Khalti payment"}
          </button>
          <button
            type="button"
            onClick={clearForm}
            className="rounded-md border-[0.5px] border-border bg-card px-4 py-2 text-[13px] text-secondary hover:text-primary"
          >
            Clear
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-medium tracking-wide text-tertiary uppercase">
          Full code (always visible)
        </p>
        <CodeBlock code={snippet} />
      </div>

      {result?.error ? (
        <JsonBlock title="Error response" data={result} tone="err" />
      ) : null}

      {result?.ok && result.initiate ? (
        <div className="flex flex-col gap-3">
          {result.signedMessage ? (
            <JsonBlock title="eSewa HMAC message" data={result.signedMessage} />
          ) : null}
          {result.requestSent ? (
            <JsonBlock
              title="Khalti request body (paisa)"
              data={result.requestSent}
              tone="ok"
            />
          ) : null}
          <JsonBlock title="Initiate response" data={result} tone="ok" />

          {gateway === "esewa" && fields ? (
            <form
              action={result.initiate.redirectUrl}
              method="POST"
              className="flex flex-col gap-3 rounded-xl border-[0.5px] border-border bg-card p-4"
            >
              {Object.entries(fields).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
              <p className="text-[13px] font-medium text-primary">
                HTML form ready — POST to eSewa sandbox
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] text-left text-[12px]">
                  <thead>
                    <tr className="border-b-[0.5px] border-border text-tertiary">
                      <th className="py-1 pr-3">Field</th>
                      <th className="py-1">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(fields).map(([k, v]) => (
                      <tr
                        key={k}
                        className="border-b-[0.5px] border-border last:border-0"
                      >
                        <td className="py-1.5 pr-3 font-mono text-accent">
                          {k}
                        </td>
                        <td className="py-1.5 font-mono break-all text-secondary">
                          {v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                type="submit"
                className="self-start rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-accent-fg"
              >
                Pay with eSewa →
              </button>
            </form>
          ) : null}

          {gateway === "khalti" ? (
            <div className="flex flex-wrap gap-2">
              {result.live ? (
                <a
                  href={result.initiate.redirectUrl}
                  className="rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-accent-fg no-underline"
                >
                  Pay with Khalti →
                </a>
              ) : (
                <a
                  href={result.simulateReturnUrl || result.initiate.redirectUrl}
                  className="rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-accent-fg no-underline"
                >
                  Complete return + lookup verify →
                </a>
              )}
            </div>
          ) : null}

          {result.note ? (
            <p className="text-[12px] text-tertiary">{result.note}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export const UNIFIED_CHECKOUT_CODE = `// One form → eSewa or Khalti
// Fields: name, amount, orderId, description, success/failure URLs,
//         tax, service, delivery → total
//
// eSewa  → POST /api/nepal-pay/esewa/initiate → HTML form POST → /nepal-pay/return
// Khalti → POST /api/nepal-pay/khalti/initiate → payment_url → /nepal-pay/khalti-return
//
// eSewa UAT: 9711111111 / Nepal@123 / 123456 · secret 8gBm/:&EnhH.1/q
// Khalti:    9800000000–05 / MPIN 1111 / OTP 987654 · merchant test secret`;
