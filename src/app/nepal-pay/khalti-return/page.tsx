"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { CodeBlock } from "@/components/code-block";

type VerifyPayload = {
  ok: boolean;
  stage?: string;
  live?: boolean;
  note?: string;
  fulfill?: string;
  callback?: unknown;
  verification?: unknown;
  error?: { code?: string; name?: string; message: string; body?: unknown };
};

function ReturnInner() {
  const params = useSearchParams();
  const [result, setResult] = useState<VerifyPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = Object.fromEntries(params.entries());
    const pidx = query.pidx;
    if (!pidx) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/nepal-pay/khalti/verify-return", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pidx,
            status: query.status,
            amount: query.amount || query.total_amount,
            mock: query.mock,
            query,
          }),
        });
        const json = (await res.json()) as VerifyPayload;
        if (!cancelled) setResult(json);
      } catch (err) {
        if (!cancelled) {
          setResult({
            ok: false,
            error: {
              message: err instanceof Error ? err.message : String(err),
            },
            fulfill: "DO_NOT_FULFILL",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params]);

  const pidx = params.get("pidx");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
          Khalti return · sandbox
        </p>
        <h1 className="text-2xl font-medium tracking-tight text-primary">
          Payment return
        </h1>
        <p className="text-sm leading-relaxed text-secondary">
          Khalti redirects here with query params (
          <code className="font-mono text-primary">pidx</code>,{" "}
          <code className="font-mono text-primary">status</code>, …). There is{" "}
          <strong className="font-medium text-primary">no signature</strong> on
          this callback — we always call{" "}
          <code className="font-mono text-primary">/epayment/lookup/</code>{" "}
          before fulfilling.
        </p>
      </div>

      {!pidx ? (
        <div className="rounded-md border-[0.5px] border-border bg-card px-3.5 py-3 text-sm text-secondary">
          No <code className="font-mono text-primary">pidx</code>. Start from
          the{" "}
          <Link href="/nepal-pay#playground-khalti" className="text-accent">
            Khalti test form
          </Link>
          .
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-secondary">Running lookup verify…</p>
      ) : null}

      {result ? (
        <div className="flex flex-col gap-3">
          <div
            className={`rounded-md border-[0.5px] px-3.5 py-3 text-sm ${
              result.fulfill === "SAFE_TO_FULFILL"
                ? "border-accent/40 bg-accent/5 text-primary"
                : "border-border bg-card text-secondary"
            }`}
          >
            <p className="font-medium text-primary">
              {result.fulfill === "SAFE_TO_FULFILL"
                ? "Lookup Completed — safe to fulfill"
                : "Not confirmed — do not fulfill"}
            </p>
            {result.note ? <p className="mt-1">{result.note}</p> : null}
            {result.error ? (
              <p className="mt-1">
                {result.error.name ?? "Error"}: {result.error.message}
              </p>
            ) : null}
          </div>
          <CodeBlock code={JSON.stringify(result, null, 2)} />
        </div>
      ) : null}

      <Link
        href="/nepal-pay#playground-khalti"
        className="text-sm text-accent no-underline hover:underline"
      >
        ← Back to Khalti test form
      </Link>
    </main>
  );
}

export default function KhaltiReturnPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-2xl px-4 py-10 text-sm text-secondary">
          Loading return…
        </main>
      }
    >
      <ReturnInner />
    </Suspense>
  );
}
