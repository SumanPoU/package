"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { CodeBlock } from "@/components/code-block";

type VerifyPayload = {
  ok: boolean;
  stage?: string;
  live?: boolean;
  fulfill?: string;
  note?: string;
  callback?: unknown;
  verification?: unknown;
  error?: { code?: string; name?: string; message: string };
};

function ReturnInner() {
  const params = useSearchParams();
  const txnId = params.get("TXNID") || params.get("txnid");
  const outcome = params.get("outcome");
  const cancelled = params.get("cancelled");
  const amount = params.get("amount");
  const mock = params.get("mock");
  const failed =
    outcome === "failure" || outcome === "failed" || cancelled === "true";

  const [result, setResult] = useState<VerifyPayload | null>(null);
  const [loading, setLoading] = useState(Boolean(txnId) || failed);

  useEffect(() => {
    if (!txnId && !failed) {
      setLoading(false);
      return;
    }

    let cancelledReq = false;
    (async () => {
      try {
        const res = await fetch("/api/nepal-pay/connectips/verify-return", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            TXNID: txnId ?? undefined,
            amount: amount ? Number(amount) : undefined,
            mock: mock === "1" || mock === "true",
            outcome: outcome ?? undefined,
            cancelled: cancelled ?? undefined,
          }),
        });
        const json = (await res.json()) as VerifyPayload;
        if (!cancelledReq) setResult(json);
      } catch (err) {
        if (!cancelledReq) {
          setResult({
            ok: false,
            error: {
              message: err instanceof Error ? err.message : String(err),
            },
            fulfill: "DO_NOT_FULFILL",
          });
        }
      } finally {
        if (!cancelledReq) setLoading(false);
      }
    })();

    return () => {
      cancelledReq = true;
    };
  }, [txnId, amount, mock, outcome, cancelled, failed]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
          connectIPS return · sandbox
        </p>
        <h1 className="text-2xl font-medium tracking-tight text-primary">
          Payment return
        </h1>
        <p className="text-sm leading-relaxed text-secondary">
          connectIPS redirects here with{" "}
          <code className="font-mono text-primary">?TXNID=</code> only. This
          page calls <code className="font-mono text-primary">validatetxn</code>{" "}
          (or mock SUCCESS in the docs playground) — the redirect alone is never
          treated as paid.
        </p>
      </div>

      {failed && !txnId ? (
        <div className="rounded-md border-[0.5px] border-border bg-card px-3.5 py-3 text-sm text-secondary">
          Failure / cancel URL hit (register this path with NCHL as the failure
          URL, optionally with{" "}
          <code className="font-mono text-primary">?outcome=failure</code>).
        </div>
      ) : null}

      {!txnId && !failed ? (
        <div className="rounded-md border-[0.5px] border-border bg-card px-3.5 py-3 text-sm text-secondary">
          No <code className="font-mono text-primary">TXNID</code> param. Start
          from the{" "}
          <Link href="/nepal-pay#playground-checkout" className="text-accent">
            unified checkout
          </Link>{" "}
          (connectIPS).
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-secondary">Verifying via validatetxn…</p>
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
                ? "Verified — safe to fulfill"
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
        href="/nepal-pay#playground-checkout"
        className="text-sm text-accent no-underline hover:underline"
      >
        ← Back to unified checkout
      </Link>
    </main>
  );
}

export default function ConnectIpsReturnPage() {
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
