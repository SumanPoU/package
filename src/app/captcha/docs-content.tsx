"use client";

import {
  Captcha,
  type CaptchaCharsetMode,
  type CaptchaHandle,
} from "@itzsa/captcha";
import { useRef, useState } from "react";

import { CdnUrlList } from "@/components/cdn-url-list";
import { InstallCommand } from "@/components/install-command";

import {
  CHROME_PROPS,
  CORE_PROPS,
  HANDLE_ROWS,
  VERIFY_PROPS,
} from "./api-reference";
import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  PropsTable,
} from "./docs-ui";
import { DOC_NAV } from "./nav";

const MINIMAL = `import { useRef, useState } from "react";
import { Captcha, type CaptchaHandle } from "@itzsa/captcha";

export function LoginGate() {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [verified, setVerified] = useState(false);

  function handleCaptchaVerified(valid: boolean) {
    setVerified(valid);
  }

  function onSubmit() {
    // Imperative check before submit
    if (!captchaRef.current?.validate()) return;
    // …submit form
  }

  return (
    <>
      <Captcha ref={captchaRef} onVerified={handleCaptchaVerified} />
      <button type="button" disabled={!verified} onClick={onSubmit}>
        Continue
      </button>
    </>
  );
}`;

const SERVER = `const [apiError, setApiError] = useState<string | null>(null);

<Captcha
  ref={captchaRef}
  error={apiError}
  maxAttempts={5}
  verify={async ({ value, challengeId }) => {
    const res = await fetch("/api/captcha/verify", {
      method: "POST",
      body: JSON.stringify({ value, challengeId }),
    });
    if (!res.ok) throw new Error("verify_failed"); // → onError + status "error"
    return true;
  }}
  onError={(err) => console.warn(err.code, err.message)}
  onVerified={handleCaptchaVerified}
/>`;

const REGISTRY = `pnpm dlx shadcn@latest add https://itzsa.acharya-suman.com.np/r/captcha.json`;

const MODES: { id: CaptchaCharsetMode; label: string }[] = [
  { id: "both", label: "Both" },
  { id: "letters", label: "Letters" },
  { id: "numbers", label: "Numbers" },
];

export function DocsContent() {
  const captchaRef = useRef<CaptchaHandle>(null);
  const [verified, setVerified] = useState(false);
  const [mode, setMode] = useState<CaptchaCharsetMode>("both");
  const [length, setLength] = useState(6);
  const [demoError, setDemoError] = useState<string | null>(null);

  function handleCaptchaVerified(valid: boolean) {
    setVerified(valid);
    if (valid) setDemoError(null);
  }

  return (
    <DocsShell>
      <div className="flex flex-col gap-8 sm:gap-14">
        <header
          id="introduction"
          className="scroll-mt-28 flex flex-col gap-3 border-b-[0.5px] border-border pb-6 sm:pb-8"
        >
          <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
            Documentation · itzsa
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-primary sm:text-4xl">
            Captcha
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            Company-standard canvas captcha with{" "}
            <code className="font-mono text-primary">ref</code> +{" "}
            <code className="font-mono text-primary">onVerified</code>, attempt
            limits, and structured API error props. Client friction only — pair
            with a server check for sensitive flows.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-secondary">
            <span className="pkg rounded-md border-[0.5px] border-border bg-card px-2 py-1 text-[12px]">
              @itzsa/captcha
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              registry → components/itzsa/captcha
            </span>
          </div>
        </header>

        <nav aria-label="Jump to" className="flex flex-wrap gap-2 lg:hidden">
          {DOC_NAV.filter((n) => !n.indent).map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-md border-[0.5px] border-border bg-card px-2.5 py-1 text-xs text-secondary hover:text-accent"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <DocSection
          id="demo"
          title="Live demo"
          description="Same API as production — try charset mode, length, and a simulated bad API response."
        >
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <fieldset
              aria-label="Charset mode"
              className="flex rounded-md border-[0.5px] border-border bg-card p-0.5"
            >
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setMode(m.id);
                    setVerified(false);
                    setDemoError(null);
                  }}
                  className={`rounded-sm px-2.5 py-1 text-xs transition-colors ${
                    mode === m.id
                      ? "bg-muted font-medium text-primary"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </fieldset>
            <label className="flex items-center gap-2 text-xs text-secondary">
              Length
              <input
                type="range"
                min={3}
                max={10}
                value={length}
                onChange={(e) => {
                  setLength(Number(e.target.value));
                  setVerified(false);
                  setDemoError(null);
                }}
                className="w-28"
              />
              <span className="tabular-nums text-primary">{length}</span>
            </label>
            <button
              type="button"
              className="rounded-md border-[0.5px] border-border bg-card px-2.5 py-1 text-xs text-secondary hover:text-primary"
              onClick={() =>
                setDemoError("API error: captcha rejected by server (429).")
              }
            >
              Simulate bad API
            </button>
          </div>
          <div className="min-w-0 overflow-hidden rounded-lg border-[0.5px] border-border bg-card p-4 sm:p-5">
            <Captcha
              key={`${mode}-${length}`}
              ref={captchaRef}
              length={length}
              charsetMode={mode}
              error={demoError}
              onVerified={handleCaptchaVerified}
              className="w-full max-w-sm"
            />
            <p className="mt-4 break-words text-sm leading-relaxed text-secondary [overflow-wrap:anywhere]">
              <span className="text-tertiary">onVerified</span>
              {" → "}
              <span className="font-medium text-primary">
                {verified ? "true" : "false"}
              </span>
              <span className="text-tertiary">{" · "}</span>
              <span className="text-tertiary">validate()</span>
              {" → "}
              <span className="font-medium text-primary">
                {verified ? "true" : "false"}
              </span>
            </p>
          </div>
        </DocSection>

        <DocSection
          id="installation"
          title="Installation"
          description="npm package or copy-paste from the itzsa registry."
        >
          <InstallCommand packages="@itzsa/captcha" />
          <CodeBlock code={REGISTRY} language="bash" showPrompt />
        </DocSection>

        <DocSection
          id="getting-started"
          title="Getting started"
          description="Minimal usage is enough for most forms."
        >
          <DocSection
            id="minimal"
            level={3}
            title="Minimal — ref + onVerified"
            description="Yes: this pattern is fully supported. onVerified(true) when the answer is accepted; onVerified(false) on wrong input, refresh, or clear."
          >
            <CodeBlock code={MINIMAL} language="tsx" />
            <Callout title="Checklist">
              <ul className="mt-1 list-disc space-y-1 pl-4">
                <li>
                  <code className="font-mono text-primary">onVerified</code>{" "}
                  updates UI (enable submit).
                </li>
                <li>
                  <code className="font-mono text-primary">
                    captchaRef.current?.validate()
                  </code>{" "}
                  before submit.
                </li>
                <li>
                  Optional:{" "}
                  <code className="font-mono text-primary">
                    captchaRef.current?.refresh()
                  </code>{" "}
                  after a failed host API.
                </li>
              </ul>
            </Callout>
          </DocSection>

          <DocSection
            id="server-verify"
            level={3}
            title="Server verify / API errors"
            description="Pass verify for async checks. Throw or return false on bad API calls — onError receives a CaptchaError. Use error for host-driven messages."
          >
            <CodeBlock code={SERVER} language="tsx" />
          </DocSection>
        </DocSection>

        <DocSection
          id="props"
          title="Props"
          description="Public surface of Captcha. Tables use a solid white background."
        >
          <div className="flex flex-col gap-10">
            <DocSection id="props-core" level={3} title="Core">
              <PropsTable caption="Core" rows={CORE_PROPS} />
            </DocSection>
            <DocSection id="props-verify" level={3} title="Verify & errors">
              <PropsTable caption="Verify & errors" rows={VERIFY_PROPS} />
            </DocSection>
            <DocSection id="props-chrome" level={3} title="Chrome & styling">
              <PropsTable caption="Chrome" rows={CHROME_PROPS} />
            </DocSection>
          </div>
        </DocSection>

        <DocSection
          id="imperative"
          title="Imperative API"
          description="CaptchaHandle via ref — same object as captchaRef.current."
        >
          <PropsTable caption="CaptchaHandle" rows={HANDLE_ROWS} />
        </DocSection>

        <DocSection
          id="registry"
          title="Registry"
          description="Installs under components/itzsa/captcha (nested components/ui)."
        >
          <CdnUrlList
            assets={[
              {
                label: "captcha.json",
                url: "https://itzsa.acharya-suman.com.np/r/captcha.json",
              },
            ]}
          />
        </DocSection>
      </div>
    </DocsShell>
  );
}
