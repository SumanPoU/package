"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/utils";
import {
  ArrowFlow,
  CONNECTIPS_FLOW_STEPS,
  ESEWA_FLOW_STEPS,
  KHALTI_FLOW_STEPS,
  TestCredentialsCard,
} from "./flow-diagram";

type GatewayChoice = "esewa" | "khalti" | "connectips";

/** Stable SSR default — regenerate only on user action to avoid hydration mismatch. */
const DEFAULT_ORDER_ID = "ORD-DEMO-001";

function nextOrderId(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

type InitiateResult = {
  ok: boolean;
  live?: boolean;
  note?: string;
  signedMessage?: string;
  loginTokenMessage?: string;
  amountNpr?: number;
  amountPaisa?: number;
  requestSent?: Record<string, unknown>;
  formFields?: Record<string, string>;
  simulateReturnUrl?: string;
  initiate?: {
    redirectUrl: string;
    providerRef: string;
    method: "GET" | "POST";
    formFields?: Record<string, string>;
  };
  upstream?: Record<string, unknown>;
  flow?: string[];
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

function flowStepsFor(gateway: GatewayChoice) {
  if (gateway === "esewa") return ESEWA_FLOW_STEPS;
  if (gateway === "khalti") return KHALTI_FLOW_STEPS;
  return CONNECTIPS_FLOW_STEPS;
}

/**
 * Unified eSewa + Khalti + connectIPS checkout (same fields → gateway initiate).
 */
export function UnifiedCheckoutForm() {
  const [gateway, setGateway] = useState<GatewayChoice>("esewa");
  const [name, setName] = useState("Suman Acharya");
  const [amount, setAmount] = useState("100");
  const [orderId, setOrderId] = useState(DEFAULT_ORDER_ID);
  const [description, setDescription] = useState("Order payment");
  const [successUrl, setSuccessUrl] = useState("");
  const [failureUrl, setFailureUrl] = useState("");
  const [tax, setTax] = useState("0");
  const [service, setService] = useState("0");
  const [delivery, setDelivery] = useState("0");
  const [khaltiSecret, setKhaltiSecret] = useState("");
  const [connectPem, setConnectPem] = useState("");
  const [connectMerchantId, setConnectMerchantId] = useState("");
  const [connectAppId, setConnectAppId] = useState("");
  const [connectAppName, setConnectAppName] = useState("");
  const [connectPassword, setConnectPassword] = useState("");
  const [useMock, setUseMock] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<InitiateResult | null>(null);
  const [origin, setOrigin] = useState("http://localhost:3000");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const total = useMemo(() => {
    const a = Number(amount) || 0;
    const t = Number(tax) || 0;
    const s = Number(service) || 0;
    const d = Number(delivery) || 0;
    return (a + t + s + d).toFixed(2).replace(/\.00$/, "");
  }, [amount, tax, service, delivery]);

  const defaultSuccess =
    gateway === "esewa"
      ? `${origin}/nepal-pay/return`
      : gateway === "khalti"
        ? `${origin}/nepal-pay/khalti-return`
        : `${origin}/nepal-pay/connectips-return`;
  const defaultFailure =
    gateway === "esewa"
      ? `${origin}/nepal-pay/return?failed=1`
      : gateway === "khalti"
        ? `${origin}/nepal-pay/khalti-return?status=${encodeURIComponent("User canceled")}`
        : `${origin}/nepal-pay/connectips-return?outcome=failure`;

  function clearForm() {
    setName("Suman Acharya");
    setAmount("100");
    setOrderId(nextOrderId());
    setDescription("Order payment");
    setSuccessUrl("");
    setFailureUrl("");
    setTax("0");
    setService("0");
    setDelivery("0");
    setKhaltiSecret("");
    setConnectPem("");
    setConnectMerchantId("");
    setConnectAppId("");
    setConnectAppName("");
    setConnectPassword("");
    setUseMock(true);
    setResult(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);

    const returnUrl = successUrl.trim() || defaultSuccess;
    const failUrl = failureUrl.trim() || defaultFailure;
    const ref =
      gateway === "connectips"
        ? orderId.replace(/[^A-Za-z0-9]/g, "").slice(0, 20)
        : orderId.replace(/[^A-Za-z0-9_-]/g, "-").slice(0, 40);

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
      } else if (gateway === "khalti") {
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
      } else {
        const res = await fetch("/api/nepal-pay/connectips/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(amount),
            orderId: ref,
            orderName: description || "Order payment",
            returnUrl,
            failureUrl: failUrl,
            remarks: description || "Order payment",
            particulars: description || "Order payment",
            mock: useMock,
            merchantId: connectMerchantId.trim() || undefined,
            appId: connectAppId.trim() || undefined,
            appName: connectAppName.trim() || undefined,
            password: connectPassword.trim() || undefined,
            privateKeyPem: connectPem.trim() || undefined,
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

  const paisa = Math.round((Number(amount) || 0) * 100);

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
    : gateway === "khalti"
      ? `// Khalti: amount NPR → paisa internally (${paisa} paisa)
const res = await fetch("/api/nepal-pay/khalti/initiate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...payload,
    customerPhone: "9800000000",
    secretKey: process.env.KHALTI_SECRET,
    mock: ${useMock},
  }),
});
const { initiate } = await res.json();
// window.location = initiate.redirectUrl
// → /nepal-pay/khalti-return?pidx=&status=… → lookup verify`
      : `// connectIPS: NPR → paisa TXNAMT (${paisa}); RSA TOKEN on form
const res = await fetch("/api/nepal-pay/connectips/initiate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...payload,
    remarks: payload.orderName,
    particulars: payload.orderName,
    mock: ${useMock},
    // live UAT: merchantId, appId, appName, password, privateKeyPem
  }),
});
const { initiate, loginTokenMessage } = await res.json();
// <form method="POST" action={initiate.redirectUrl}>…formFields…</form>
// → /nepal-pay/connectips-return?TXNID=… → validatetxn
// Mock: simulate return without NCHL; live needs NCHL CREDITOR cert`
}`;

  const fields =
    result?.initiate?.formFields ?? result?.formFields ?? undefined;

  const submitLabel =
    gateway === "esewa"
      ? "Generate signed form"
      : gateway === "khalti"
        ? "Initiate Khalti payment"
        : "Draft connectIPS payment";

  return (
    <div className="flex flex-col gap-5">
      <TestCredentialsCard gateway={gateway} />
      <ArrowFlow steps={flowStepsFor(gateway)} />

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
              gateway === "esewa"
                ? "eSewa uses NPR decimals"
                : `Sent as paisa (×100) → ${paisa}`
            }
          />
          <LabeledInput
            label="Reference / Order ID"
            value={orderId}
            onChange={setOrderId}
            hint={
              gateway === "connectips"
                ? "TXNID ≤ 20 alphanumeric (auto-trimmed)"
                : "Alphanumeric + hyphen; unique per payment"
            }
          />
          <LabeledInput
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Order payment"
            hint={
              gateway === "connectips"
                ? "Maps to REMARKS / PARTICULARS"
                : undefined
            }
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
            {(
              [
                ["esewa", "eSewa"],
                ["khalti", "Khalti"],
                ["connectips", "connectIPS"],
              ] as const
            ).map(([id, label]) => (
              <label
                key={id}
                className="flex items-center gap-2 text-[13px] text-primary"
              >
                <input
                  type="radio"
                  name="gateway"
                  checked={gateway === id}
                  onChange={() => {
                    setGateway(id);
                    setResult(null);
                    setUseMock(true);
                  }}
                />
                {label}
              </label>
            ))}
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

        {gateway === "connectips" ? (
          <div className="flex flex-col gap-3 rounded-md border-[0.5px] border-border bg-muted/40 p-3">
            <p className="text-[12px] text-tertiary">
              Optional live UAT credentials (otherwise mock drafts a signed
              payload with a throwaway RSA key).
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <LabeledInput
                label="Merchant ID"
                value={connectMerchantId}
                onChange={setConnectMerchantId}
                placeholder="from NCHL"
              />
              <LabeledInput
                label="App ID"
                value={connectAppId}
                onChange={setConnectAppId}
              />
              <LabeledInput
                label="App name"
                value={connectAppName}
                onChange={setConnectAppName}
              />
              <LabeledInput
                label="App password"
                value={connectPassword}
                onChange={setConnectPassword}
                type="password"
              />
            </div>
            <label className="flex flex-col gap-1.5 text-[13px]">
              <span className="text-secondary">Private key PEM</span>
              <textarea
                value={connectPem}
                onChange={(e) => setConnectPem(e.target.value)}
                rows={4}
                placeholder="-----BEGIN PRIVATE KEY----- … (from CREDITOR.pfx)"
                className="rounded-md border-[0.5px] border-border bg-card px-3 py-2 font-mono text-[11px] text-primary outline-none focus:border-accent"
              />
            </label>
            <label className="flex items-center gap-2 text-[13px] text-secondary">
              <input
                type="checkbox"
                checked={useMock}
                onChange={(e) => setUseMock(e.target.checked)}
              />
              Mock mode (draft form + simulate validatetxn SUCCESS)
            </label>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-accent-fg disabled:opacity-50"
          >
            {busy ? "Working…" : submitLabel}
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
          {result.signedMessage || result.loginTokenMessage ? (
            <JsonBlock
              title={
                gateway === "connectips"
                  ? "connectIPS TOKEN message (pre-sign)"
                  : "eSewa HMAC message"
              }
              data={result.loginTokenMessage || result.signedMessage}
            />
          ) : null}
          {result.requestSent && gateway === "khalti" ? (
            <JsonBlock
              title="Khalti request body (paisa)"
              data={result.requestSent}
              tone="ok"
            />
          ) : null}
          {result.amountPaisa != null && gateway === "connectips" ? (
            <JsonBlock
              title="Amount conversion"
              data={{
                amountNpr: result.amountNpr,
                TXNAMT_paisa: result.amountPaisa,
              }}
              tone="ok"
            />
          ) : null}
          <JsonBlock title="Initiate response" data={result} tone="ok" />

          {(gateway === "esewa" || gateway === "connectips") && fields ? (
            <form
              action={
                gateway === "connectips" && !result.live
                  ? undefined
                  : result.initiate.redirectUrl
              }
              method="POST"
              onSubmit={
                gateway === "connectips" && !result.live
                  ? (ev) => {
                      ev.preventDefault();
                    }
                  : undefined
              }
              className="flex flex-col gap-3 rounded-xl border-[0.5px] border-border bg-card p-4"
            >
              {Object.entries(fields).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
              <p className="text-[13px] font-medium text-primary">
                {gateway === "esewa"
                  ? "HTML form ready — POST to eSewa sandbox"
                  : result.live
                    ? "HTML form ready — POST to connectIPS UAT loginpage"
                    : "Draft form payload (mock) — inspect fields, then simulate return"}
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
                          {v.length > 80 ? `${v.slice(0, 80)}…` : v}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap gap-2">
                {gateway === "esewa" || result.live ? (
                  <button
                    type="submit"
                    className="self-start rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-accent-fg"
                  >
                    {gateway === "esewa"
                      ? "Pay with eSewa →"
                      : "Pay with connectIPS →"}
                  </button>
                ) : null}
                {gateway === "connectips" && result.simulateReturnUrl ? (
                  <a
                    href={result.simulateReturnUrl}
                    className="rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-accent-fg no-underline"
                  >
                    Complete return + validatetxn →
                  </a>
                ) : null}
              </div>
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

export const UNIFIED_CHECKOUT_CODE = `// One form → eSewa | Khalti | connectIPS
// Fields: name, amount, orderId, description, success/failure URLs,
//         tax, service, delivery → total
//
// eSewa      → POST /api/nepal-pay/esewa/initiate
//              → HTML form POST → /nepal-pay/return?data=…
// Khalti     → POST /api/nepal-pay/khalti/initiate
//              → payment_url → /nepal-pay/khalti-return?pidx=…
// connectIPS → POST /api/nepal-pay/connectips/initiate
//              → HTML form POST → /nepal-pay/connectips-return?TXNID=…
//
// eSewa UAT: 9711111111 / Nepal@123 / 123456 · secret 8gBm/:&EnhH.1/q
// Khalti:    9800000000–05 / MPIN 1111 / OTP 987654 · merchant test secret
// connectIPS: NCHL merchant + CREDITOR.pfx (docs mock drafts signed payload)`;
