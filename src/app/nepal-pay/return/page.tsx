"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { CodeBlock } from "@/components/code-block";

type VerifyPayload = {
  ok: boolean;
  stage?: string;
  signatureValid?: boolean | null;
  fulfill?: string;
  callback?: unknown;
  verification?: unknown;
  error?: { code?: string; name?: string; message: string };
};

function ReturnInner() {
  const params = useSearchParams();
  const failed = params.get("failed") === "1";
  const data = params.get("data");
  const [result, setResult] = useState<VerifyPayload | null>(null);
  const [loading, setLoading] = useState(Boolean(data));

  useEffect(() => {
    if (!data) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/nepal-pay/esewa/verify-return", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
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
  }, [data]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
          eSewa return · sandbox
        </p>
        <h1 className="text-2xl font-medium tracking-tight text-primary">
          Payment return
        </h1>
        <p className="text-sm leading-relaxed text-secondary">
          eSewa redirects here with a base64{" "}
          <code className="font-mono text-primary">data</code> query param. This
          page verifies the signature and calls the status API — the redirect
          alone is never treated as paid.
        </p>
      </div>

      {failed && !data ? (
        <div className="rounded-md border-[0.5px] border-border bg-card px-3.5 py-3 text-sm text-secondary">
          Failure / cancel URL hit (no callback payload).
        </div>
      ) : null}

      {!data && !failed ? (
        <div className="rounded-md border-[0.5px] border-border bg-card px-3.5 py-3 text-sm text-secondary">
          No <code className="font-mono text-primary">data</code> param. Start
          from the{" "}
          <Link href="/nepal-pay#playground-esewa" className="text-accent">
            eSewa test form
          </Link>
          .
        </div>
      ) : null}

      {loading ? (
        <p className="text-sm text-secondary">Verifying callback…</p>
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
            {result.signatureValid === false ? (
              <p className="mt-1">Signature mismatch — treat as tampering.</p>
            ) : null}
            {result.signatureValid === true ? (
              <p className="mt-1">Callback signature OK; status API checked.</p>
            ) : null}
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
        href="/nepal-pay#playground-esewa"
        className="text-sm text-accent no-underline hover:underline"
      >
        ← Back to eSewa test form
      </Link>
    </main>
  );
}

export default function EsewaReturnPage() {
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
