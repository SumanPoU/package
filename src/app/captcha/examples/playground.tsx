"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CAPTCHA_EXAMPLES,
  examplesForTrust,
  getCaptchaExample,
} from "./registry";
import { SegmentedControl } from "./shared";
import {
  type CaptchaExampleId,
  type CaptchaTrustModel,
  TRUST_MODEL_OPTIONS,
} from "./types";

/**
 * Company-standard playground: pick trust model first, then challenge type.
 * Adding a module to CAPTCHA_EXAMPLES wires it here automatically.
 */
export function CaptchaPlayground() {
  const [trust, setTrust] = useState<CaptchaTrustModel>("client");
  const filtered = useMemo(() => examplesForTrust(trust), [trust]);
  const [kind, setKind] = useState<CaptchaExampleId>(filtered[0]?.id ?? "text");

  useEffect(() => {
    const stillVisible = filtered.some((e) => e.id === kind);
    if (!stillVisible && filtered[0]) setKind(filtered[0].id);
  }, [filtered, kind]);

  const active = useMemo(() => getCaptchaExample(kind), [kind]);
  const Example = active?.Example;
  const trustMeta = TRUST_MODEL_OPTIONS.find((t) => t.id === trust);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-3 rounded-lg border-[0.5px] border-border bg-card p-3 sm:p-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="text-[11px] font-medium tracking-wide text-tertiary uppercase">
            Trust model
          </span>
          <SegmentedControl
            ariaLabel="Captcha trust model"
            options={TRUST_MODEL_OPTIONS.map((t) => ({
              id: t.id,
              label: t.label,
            }))}
            value={trust}
            onChange={setTrust}
          />
          <span className="text-[11px] font-medium tracking-wide text-tertiary uppercase">
            Type
          </span>
          <SegmentedControl
            ariaLabel="Captcha type"
            options={filtered.map((e) => ({ id: e.id, label: e.label }))}
            value={kind}
            onChange={setKind}
          />
          {active ? (
            <span className="rounded-md border-[0.5px] border-border bg-page px-2 py-1 font-mono text-[11px] text-secondary">
              {active.component}
            </span>
          ) : null}
        </div>
        {trustMeta ? (
          <p className="text-xs leading-relaxed text-secondary">
            {trustMeta.summary}
            {active ? (
              <>
                {" "}
                <span className="text-tertiary">·</span>{" "}
                <span className="text-primary">{active.recommendedFor}</span>
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      {Example ? <Example key={`${trust}-${kind}`} /> : null}

      <p className="text-[11px] text-tertiary">
        {CAPTCHA_EXAMPLES.length} registered examples · trust={" "}
        <span className="text-secondary">{trust}</span>
        {" · "}
        active: <span className="text-secondary">{kind}</span>
      </p>
    </div>
  );
}
