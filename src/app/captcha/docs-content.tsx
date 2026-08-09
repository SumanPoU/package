"use client";

import { CdnUrlList } from "@/components/cdn-url-list";
import { ExampleDemo } from "@/components/example-demo";
import { InstallCommand } from "@/components/install-command";

import {
  CHROME_PROPS,
  CORE_PROPS,
  HANDLE_ROWS,
  MATH_PROPS,
  SLIDER_PROPS,
  VERIFY_PROPS,
} from "./api-reference";
import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  PropsTable,
} from "./docs-ui";
import {
  CAPTCHA_EXAMPLES,
  CaptchaPlayground,
  CLIENT_MATH_MINIMAL,
  EXPRESS_SECURE_SERVER,
  MATH_HEADLESS_CODE,
  SERVER_MATH_MINIMAL,
  TEXT_MINIMAL_CODE,
} from "./examples";
import { DOC_NAV } from "./nav";
import { CaptchaTrustFlowchart } from "./trust-flowchart";

const REGISTRY = `pnpm dlx shadcn@latest add https://itzsa.acharya-suman.com.np/r/captcha.json`;

export function DocsContent() {
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
            Math & Slider Captcha — @itzsa/captcha
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            Company-standard React captcha with{" "}
            <strong className="font-medium text-primary">
              two trust models
            </strong>
            : client-side generate + verify (UX friction), and server-side
            challenge + verify (trusted source of truth). One package — Text,
            Math (BODMAS), Slider — shared{" "}
            <code className="font-mono text-primary">ref</code> /{" "}
            <code className="font-mono text-primary">onVerified</code> API.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-secondary">
            <span className="pkg rounded-md border-[0.5px] border-border bg-card px-2 py-1 text-[12px]">
              @itzsa/captcha
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              Client generate + verify
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              Server challenge + verify
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
          title="Live playground"
          description="Pick trust model (Client / Server), then type. Registry-driven — scalable as you add modes."
        >
          <CaptchaPlayground />
        </DocSection>

        <DocSection
          id="trust-models"
          title="Trust models"
          description="Both are first-class. Choose by risk — not by preference for shiny UI."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border-[0.5px] border-border bg-card p-4">
              <p className="text-[12px] font-medium tracking-wide text-primary">
                Client
              </p>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                Browser runs{" "}
                <code className="font-mono text-primary">
                  generateMathChallenge
                </code>{" "}
                /{" "}
                <code className="font-mono text-primary">generateCaptcha</code>{" "}
                and verifies locally. Optional{" "}
                <code className="font-mono text-primary">verify()</code> after a
                local match. Fast UX friction —{" "}
                <strong className="font-medium text-primary">
                  not a security boundary alone
                </strong>
                .
              </p>
            </div>
            <div className="rounded-lg border-[0.5px] border-emerald-500/30 bg-emerald-500/5 p-4">
              <p className="text-[12px] font-medium tracking-wide text-emerald-700 dark:text-emerald-300">
                Server (company standard)
              </p>
              <p className="mt-2 text-sm leading-relaxed text-secondary">
                API issues{" "}
                <code className="font-mono text-primary">prompt</code> +{" "}
                <code className="font-mono text-primary">token</code>; answer
                stays in Redis/memory. UI uses{" "}
                <code className="font-mono text-primary">serverChallenge</code>.
                Required for login / checkout / signup.
              </p>
            </div>
          </div>
          <CaptchaTrustFlowchart />
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
          description="Same MathCaptcha component — flip trust model with or without serverChallenge."
        >
          <DocSection
            id="minimal"
            level={3}
            title="Client — generate + verify in the browser"
            description="No serverChallenge. Local match is enough to enable submit. Soft gate only."
          >
            <CodeBlock code={CLIENT_MATH_MINIMAL} language="tsx" />
            <Callout title="When to use">
              Newsletter, contact, comments, low-risk forms. Pair with rate
              limits on the form endpoint if abuse appears.
            </Callout>
          </DocSection>

          <DocSection
            id="server-trusted"
            level={3}
            title="Server — trusted challenge + verify"
            description="serverChallenge + verify() → your /api/captcha/*. Answer never reaches the client."
          >
            <CodeBlock code={SERVER_MATH_MINIMAL} language="tsx" />
            <Callout title="When to use">
              Login, checkout, signup, password reset. Gate the action with the
              issued humanPass cookie / JWT.
            </Callout>
          </DocSection>

          <DocSection
            id="minimal-text"
            level={3}
            title="Client text (canvas) — ref + onVerified"
            description="Classic canvas captcha. Local generate + local verify; optional verify() callback."
          >
            <CodeBlock code={TEXT_MINIMAL_CODE} language="tsx" />
          </DocSection>
        </DocSection>

        <DocSection
          id="examples"
          title="Examples"
          description="Each mode is its own codebase under examples/. Preview + Code tabs. Tagged by trust model."
        >
          <div className="flex flex-col gap-12">
            {CAPTCHA_EXAMPLES.map((mod) => (
              <DocSection
                key={mod.id}
                id={mod.sectionId}
                level={3}
                title={mod.title}
                description={`${mod.description} · ${mod.recommendedFor}`}
              >
                <ExampleDemo code={mod.code} size={mod.size ?? "lg"}>
                  <mod.Example />
                </ExampleDemo>
              </DocSection>
            ))}

            <DocSection
              id="example-math-headless"
              level={3}
              title="Math engine (headless)"
              description="Same helpers power client UI and the server challenge API."
            >
              <CodeBlock code={MATH_HEADLESS_CODE} language="tsx" />
            </DocSection>
          </div>
        </DocSection>

        <DocSection
          id="security"
          title="Production security"
          description="This docs app is Next.js (not Express). @itzsa/captcha is not a security boundary alone — use server-issued challenges, single-use tokens, rate limits, Turnstile, honeypot + timing, and gate sensitive routes."
        >
          <Callout title="What the package actually provides">
            <ul className="mt-1 list-disc space-y-1 pl-4">
              <li>
                Headless:{" "}
                <code className="font-mono text-primary">
                  generateMathChallenge
                </code>
                ,{" "}
                <code className="font-mono text-primary">verifyMathAnswer</code>
                ,{" "}
                <code className="font-mono text-primary">generateCaptcha</code>,{" "}
                <code className="font-mono text-primary">verifyCaptcha</code>
              </li>
              <li>
                React UI:{" "}
                <code className="font-mono text-primary">Captcha</code>,{" "}
                <code className="font-mono text-primary">MathCaptcha</code>,{" "}
                <code className="font-mono text-primary">SliderCaptcha</code>{" "}
                (local generate by default)
              </li>
              <li>
                Secure UI mode:{" "}
                <code className="font-mono text-primary">
                  MathCaptcha serverChallenge
                </code>{" "}
                + your <code className="font-mono text-primary">verify()</code>{" "}
                → API
              </li>
              <li>
                No built-in Redis store, JWT, or Turnstile — those live in{" "}
                <code className="font-mono text-primary">
                  src/lib/captcha-security
                </code>
              </li>
            </ul>
          </Callout>

          <DocSection
            id="security-api"
            level={3}
            title="Challenge + verify API (this app)"
            description="Implemented under src/app/api/captcha and src/lib/captcha-security."
          >
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-secondary">
              <li>
                <code className="font-mono text-primary">
                  POST /api/captcha/challenge
                </code>{" "}
                — stores answer server-side (TTL 5m); returns{" "}
                <code className="font-mono text-primary">token</code>,{" "}
                <code className="font-mono text-primary">prompt</code>,{" "}
                <code className="font-mono text-primary">renderStamp</code>,{" "}
                <code className="font-mono text-primary">honeypotField</code>
              </li>
              <li>
                <code className="font-mono text-primary">
                  POST /api/captcha/verify
                </code>{" "}
                — honeypot + timing + optional Turnstile +{" "}
                <code className="font-mono text-primary">verifyMathAnswer</code>
                . Single-use delete. Issues{" "}
                <code className="font-mono text-primary">humanPass</code> cookie
              </li>
              <li>
                Gated demos:{" "}
                <code className="font-mono text-primary">POST /api/login</code>,{" "}
                <code className="font-mono text-primary">
                  POST /api/checkout
                </code>{" "}
                (velocity + idempotency)
              </li>
              <li>
                Env:{" "}
                <code className="font-mono text-primary">
                  CAPTCHA_HMAC_SECRET
                </code>
                ,{" "}
                <code className="font-mono text-primary">
                  TURNSTILE_SECRET_KEY
                </code>
                , optional{" "}
                <code className="font-mono text-primary">REDIS_URL</code>
              </li>
            </ul>
          </DocSection>

          <DocSection
            id="security-express"
            level={3}
            title="Express sample"
            description="For Express apps — same package helpers, express-rate-limit + Redis. Copy-adapt; this monorepo serves Next.js routes."
          >
            <CodeBlock code={EXPRESS_SECURE_SERVER} language="tsx" />
          </DocSection>
        </DocSection>

        <DocSection
          id="props"
          title="Props"
          description="Public surface of Captcha, MathCaptcha, and SliderCaptcha."
        >
          <div className="flex flex-col gap-10">
            <DocSection id="props-core" level={3} title="Captcha (text)">
              <PropsTable caption="Core" rows={CORE_PROPS} />
            </DocSection>
            <DocSection id="props-math" level={3} title="MathCaptcha">
              <PropsTable caption="MathCaptcha" rows={MATH_PROPS} />
            </DocSection>
            <DocSection id="props-slider" level={3} title="SliderCaptcha">
              <PropsTable caption="SliderCaptcha" rows={SLIDER_PROPS} />
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
          description="Shared handle shape via ref — refresh, reset, validate, unlock. MathCaptcha also exposes getChallenge()."
        >
          <PropsTable caption="Handle" rows={HANDLE_ROWS} />
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
