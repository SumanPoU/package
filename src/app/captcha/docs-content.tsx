"use client";

import { Captcha, type CaptchaCharsetMode } from "@itzsa/captcha";
import { useState } from "react";

import { CdnUrlList } from "@/components/cdn-url-list";
import { CodeBlock } from "@/components/code-block";
import { InstallCommand } from "@/components/install-command";

const STARTER = `import { useRef, useState } from "react";
import { Captcha, type CaptchaHandle } from "@itzsa/captcha";

export function FormGate() {
  const ref = useRef<CaptchaHandle>(null);
  const [ok, setOk] = useState(false);

  return (
    <>
      <Captcha
        ref={ref}
        length={6}           // number of characters
        charsetMode="both"   // "both" | "letters" | "numbers"
        theme="system"
        onVerified={setOk}
      />
      <button type="button" disabled={!ok}>
        Continue
      </button>
    </>
  );
}`;

const REGISTRY = `pnpm dlx shadcn@latest add https://itzsa.acharya-suman.com.np/r/captcha.json
# → components/itzsa/captcha/… (includes components/ui/input.tsx)`;

const PROPS = [
  ["length / chars", "number", "6", "How many characters (3–16)"],
  [
    "charsetMode",
    '"both" | "letters" | "numbers"',
    '"both"',
    "Letters + digits, letters only, or digits only",
  ],
  ["caseSensitive", "boolean", "true", "Exact case (ignored for numbers)"],
  ["theme", '"light" | "dark" | "system"', '"system"', "Canvas palette"],
  ["noise", "number", "0.7", "Interference 0–1"],
  ["width / height", "number", "210 / 62", "Canvas size"],
  [
    "onVerified",
    "(valid: boolean) => void",
    "—",
    "When input length is complete",
  ],
  ["messages", "CaptchaMessages", "EN defaults", "Labels & status copy"],
] as const;

const MODES: { id: CaptchaCharsetMode; label: string }[] = [
  { id: "both", label: "Both" },
  { id: "letters", label: "Letters" },
  { id: "numbers", label: "Numbers" },
];

export function DocsContent() {
  const [verified, setVerified] = useState(false);
  const [mode, setMode] = useState<CaptchaCharsetMode>("both");
  const [length, setLength] = useState(6);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-12 px-6 py-16">
      <header className="flex flex-col gap-3 border-b-[0.5px] border-border pb-8">
        <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
          Documentation · itzsa
        </p>
        <h1 className="text-3xl font-medium tracking-tight text-primary sm:text-4xl">
          Captcha
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-secondary">
          Canvas challenge with prop-driven length, charset mode (letters /
          numbers / both), theme, and callbacks. Client-side friction only — not
          a security boundary.
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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Live demo</h2>
        <div className="flex flex-wrap items-center gap-3">
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
              }}
              className="w-28"
            />
            <span className="tabular-nums text-primary">{length}</span>
          </label>
        </div>
        <div className="rounded-md border-[0.5px] border-border bg-card p-5">
          <Captcha
            key={`${mode}-${length}`}
            length={length}
            charsetMode={mode}
            theme="system"
            noise={0.65}
            onVerified={setVerified}
            className="max-w-sm"
          />
          <p className="mt-3 text-sm text-secondary">
            Status:{" "}
            <span className="font-medium text-primary">
              {verified ? "verified" : "not verified"}
            </span>
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Installation</h2>
        <InstallCommand packages="@itzsa/captcha" />
        <p className="text-sm text-secondary">
          Or copy from the itzsa registry:
        </p>
        <CodeBlock code={REGISTRY} language="bash" showPrompt />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Getting started</h2>
        <CodeBlock code={STARTER} language="tsx" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Props</h2>
        <div className="overflow-x-auto rounded-md border-[0.5px] border-border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b-[0.5px] border-border bg-card text-xs tracking-wide text-secondary uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Prop</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Default</th>
                <th className="px-3 py-2 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {PROPS.map(([name, type, def, desc]) => (
                <tr
                  key={name}
                  className="border-b-[0.5px] border-border last:border-0"
                >
                  <td className="px-3 py-2 font-mono text-[13px] text-accent">
                    {name}
                  </td>
                  <td className="px-3 py-2 font-mono text-[12px] text-secondary">
                    {type}
                  </td>
                  <td className="px-3 py-2 font-mono text-[12px] text-secondary">
                    {def}
                  </td>
                  <td className="px-3 py-2 text-secondary">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-primary">Registry JSON</h2>
        <CdnUrlList
          assets={[
            {
              label: "captcha.json",
              url: "https://itzsa.acharya-suman.com.np/r/captcha.json",
            },
          ]}
        />
      </section>
    </main>
  );
}
