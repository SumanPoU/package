"use client";

import { ExampleDemo } from "@/components/example-demo";
import { InstallCommand } from "@/components/install-command";

import {
  CONFIG_ROWS,
  ERROR_ROWS,
  ESEWA_STATUS_ROWS,
  GATEWAY_API,
  KHALTI_STATUS_ROWS,
  REQUEST_ROWS,
  SERVICE_API,
  STATUS_ROWS,
  STORE_API,
} from "./api-reference";
import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  PropsTable,
} from "./docs-ui";
import {
  RESPONSE_EXPLORER_CODE,
  ResponseExplorer,
  STATE_MACHINE_DEMO_CODE,
  StateMachineDemo,
} from "./examples";
import { ArrowFlow, ESEWA_FLOW_STEPS, KHALTI_FLOW_STEPS } from "./flow-diagram";
import { DOC_NAV } from "./nav";
import {
  ESEWA_CALLBACK_SUCCESS,
  ESEWA_INITIATE_SUCCESS,
  ESEWA_SIGNATURE_MISMATCH,
  ESEWA_STATUS_CANCELED,
  ESEWA_STATUS_COMPLETE,
  KHALTI_AUTH_ERROR,
  KHALTI_CALLBACK_COMPLETED,
  KHALTI_INITIATE_REQUEST,
  KHALTI_INITIATE_SUCCESS,
  KHALTI_LOOKUP_COMPLETED,
  KHALTI_VALIDATION_ERROR,
  SDK_CALLBACK_RECEIVED,
  SDK_VERIFY_CONFIRMED,
  SDK_VERIFY_FAILED,
} from "./response-samples";
import { UNIFIED_CHECKOUT_CODE, UnifiedCheckoutForm } from "./unified-checkout";

const STARTER = `import {
  createNepalPay,
  createPaymentService,
  MemoryPaymentStore,
} from "@itzsa/nepal-pay";

const pay = createNepalPay({
  mode: "sandbox",
  timeoutMs: 15_000,
  retries: 1,
  esewa: {
    productCode: "EPAYTEST",
    secretKey: process.env.ESEWA_SECRET!, // UAT: 8gBm/:&EnhH.1/q  (no trailing '(')
  },
  khalti: {
    secretKey: process.env.KHALTI_SECRET!,
  },
});

const store = new MemoryPaymentStore(); // swap for PrismaPaymentStore in prod
const khalti = pay.gateway("khalti");

const service = createPaymentService(khalti, store, {
  successUrl: "https://example.com/pay/success",
  failureUrl: "https://example.com/pay/failed",
  onConfirmed: async (paymentId) => {
    await fulfillOrder(paymentId); // runs at most once
  },
});

const { initiate, record } = await service.start({
  amount: 10.5, // NPR — never paisa at the public API
  orderId: "order-42",
  orderName: "Pro plan",
  returnUrl: "https://example.com/pay/khalti/return",
  websiteUrl: "https://example.com",
});

// Redirect user to initiate.redirectUrl`;

const ESEWA_FORM = `const esewa = pay.gateway("esewa");
const { initiate } = await service.start({ /* … */ });

// eSewa is HTML form POST — auto-submit on the server or client:
const html = \`<!doctype html><html><body>
<form id="esewa" action="\${initiate.redirectUrl}" method="POST">
\${Object.entries(initiate.formFields!)
  .map(([k, v]) => \`<input type="hidden" name="\${k}" value="\${v}" />\`)
  .join("")}
</form>
<script>document.getElementById("esewa").submit()</script>
</body></html>\`;`;

const KHALTI_REDIRECT = `const { initiate } = await service.start({
  amount: 10.5,          // → 1050 paisa inside KhaltiGateway
  orderId: "order-42",
  orderName: "Pro plan",
  returnUrl: "https://example.com/pay/khalti/return",
  websiteUrl: "https://example.com",
});

// 302 / client navigate to initiate.redirectUrl (GET)
res.redirect(initiate.redirectUrl);`;

const RETURN_HANDLER = `import { createReturnUrlHandler } from "@itzsa/nepal-pay";

const handleReturn = createReturnUrlHandler(gateway, store, {
  successUrl: "https://example.com/pay/success",
  failureUrl: "https://example.com/pay/failed",
  onConfirmed: async (id) => fulfillOrder(id),
});

// 1) handleCallback (untrusted)
// 2) cancel → failed
// 3) callback_received → verifying → verify()
// 4) confirmed (idempotent) → successUrl
// 5) else → failureUrl`;

const EXPRESS = `import express from "express";
import { createNepalPay, createPaymentService, MemoryPaymentStore } from "@itzsa/nepal-pay";

const app = express();
const pay = createNepalPay({ /* config */ });
const store = new MemoryPaymentStore();
const service = createPaymentService(pay.gateway("khalti"), store, {
  successUrl: "https://example.com/ok",
  failureUrl: "https://example.com/fail",
  onConfirmed: fulfillOrder,
});

app.get("/pay/khalti/return", async (req, res) => {
  const query = Object.fromEntries(
    Object.entries(req.query).map(([k, v]) => [k, String(v)]),
  );
  const { redirectTo } = await service.handleReturn(query);
  res.redirect(redirectTo);
});`;

const NEXT = `// app/api/pay/khalti/return/route.ts
import { createNepalPay, createPaymentService, MemoryPaymentStore } from "@itzsa/nepal-pay";

const pay = createNepalPay({ /* config from env */ });
const store = new MemoryPaymentStore(); // use a shared store in real apps
const service = createPaymentService(pay.gateway("khalti"), store, {
  successUrl: "https://example.com/ok",
  failureUrl: "https://example.com/fail",
  onConfirmed: fulfillOrder,
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const { redirectTo } = await service.handleReturn(query);
  return Response.redirect(redirectTo);
}`;

const CUSTOM_GATEWAY = `import { registerGateway, type PaymentGateway } from "@itzsa/nepal-pay";

registerGateway("fonepay", (ctx) => {
  // Implement PaymentGateway against Fonepay docs
  const gateway: PaymentGateway = {
    name: "fonepay",
    async initiate(req) { /* … */ },
    async handleCallback(query) { /* never return confirmed */ },
    async verify(ref) { /* only path to confirmed */ },
    async refund() { /* … */ },
  };
  return gateway;
});

const fonepay = pay.gateway("fonepay");`;

const PRISMA = `import { PrismaPaymentStore } from "@itzsa/nepal-pay";
import { prisma } from "./db"; // your PrismaClient

const store = new PrismaPaymentStore(prisma);

// schema:
// model Payment {
//   id          String   @id @default(cuid())
//   gateway     String
//   providerRef String
//   orderId     String
//   amount      Float
//   status      String
//   metadata    Json?
//   createdAt   DateTime @default(now())
//   updatedAt   DateTime @updatedAt
//   @@unique([gateway, providerRef])
// }`;

const ARCH = `packages/nepal-pay/src
  core/          types, errors, state machine, amount helpers
  gateways/      esewa/ · khalti/  (+ future folders)
  registry/      registerGateway() for plugins
  store/         PaymentStore + Memory + Prisma reference
  flow/          PaymentService orchestrator
  webhook/       createReturnUrlHandler (framework-agnostic)
  http/          fetchJson (timeout + retries)
  index.ts       public API only`;

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
            Nepal Pay
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            Unified TypeScript SDK for eSewa (ePay v2) and Khalti (KPG-2).
            Server-side verification is mandatory — a browser redirect is never
            treated as proof of payment.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-secondary">
            <span className="pkg rounded-md border-[0.5px] border-border bg-card px-2 py-1 text-[12px]">
              @itzsa/nepal-pay
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              headless
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              Node 18+
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              ESM + CJS
            </span>
          </div>
          <Callout title="Unofficial">
            Not affiliated with or endorsed by eSewa (F1Soft) or Khalti.
            Merchant agreements and credentials stay between you and the
            providers.{" "}
            <a
              href="http://developer.esewa.com.np/pages/Epay"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              eSewa docs
            </a>
            {" · "}
            <a
              href="https://docs.khalti.com/khalti-epayment/"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              Khalti docs
            </a>
            .
          </Callout>
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
          id="installation"
          title="Installation"
          description="Zero runtime dependencies. Uses Node crypto + native fetch."
        >
          <InstallCommand packages="@itzsa/nepal-pay" />
        </DocSection>

        <DocSection
          id="quick-start"
          title="Quick start"
          description="Prefer PaymentService — it wires initiate, store, and verify-on-return."
        >
          <CodeBlock code={STARTER} />
        </DocSection>

        <DocSection
          id="playground"
          title="Test forms"
          description="One checkout form for both gateways — same fields, arrow flow, full code always visible, then pay → return → verify."
        >
          <Callout title="Complete a transaction">
            Pick <strong className="font-medium text-primary">eSewa</strong> or{" "}
            <strong className="font-medium text-primary">Khalti</strong>, fill
            the form, generate/initiate, then follow the pay button. Returns
            land on{" "}
            <code className="font-mono text-primary">/nepal-pay/return</code>{" "}
            (eSewa) or{" "}
            <code className="font-mono text-primary">
              /nepal-pay/khalti-return
            </code>{" "}
            (Khalti) for server-side verify. Khalti mock mode still runs the
            full return → lookup path; paste a sandbox secret and uncheck mock
            for a live payment page.
          </Callout>

          <DocSection
            id="playground-checkout"
            level={3}
            title="Unified checkout"
            description="Name, amount, reference, URLs, tax/service/delivery, gateway toggle — matches a real merchant form."
          >
            <UnifiedCheckoutForm />
            <p className="mt-3 text-[11px] font-medium tracking-wide text-tertiary uppercase">
              Integration outline
            </p>
            <CodeBlock code={UNIFIED_CHECKOUT_CODE} />
          </DocSection>

          <DocSection
            id="playground-diagrams"
            level={3}
            title="Flow comparison"
            description="Arrow paths for both gateways."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-medium text-primary">eSewa</p>
                <ArrowFlow steps={ESEWA_FLOW_STEPS} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[13px] font-medium text-primary">Khalti</p>
                <ArrowFlow steps={KHALTI_FLOW_STEPS} />
              </div>
            </div>
          </DocSection>
        </DocSection>

        <DocSection
          id="responses"
          title="Responses"
          description="Every good and error payload you should handle — gateway upstream shapes and typed SDK results."
        >
          <DocSection
            id="responses-explorer"
            level={3}
            title="Explorer"
            description="Filter by gateway and success / error / info."
          >
            <ExampleDemo
              code={RESPONSE_EXPLORER_CODE}
              size="xl"
              previewClassName="bg-transparent p-0"
            >
              <ResponseExplorer />
            </ExampleDemo>
          </DocSection>

          <DocSection
            id="responses-esewa"
            level={3}
            title="eSewa payloads"
            description="Initiate (SDK), callback (decoded), status API, and signature errors."
          >
            <p className="text-[13px] font-medium text-primary">
              Good — initiate
            </p>
            <CodeBlock code={ESEWA_INITIATE_SUCCESS} />
            <p className="text-[13px] font-medium text-primary">
              Good — callback (decoded data param)
            </p>
            <CodeBlock code={ESEWA_CALLBACK_SUCCESS} />
            <p className="text-[13px] font-medium text-primary">
              Good — status COMPLETE (only paid status)
            </p>
            <CodeBlock code={ESEWA_STATUS_COMPLETE} />
            <p className="text-[13px] font-medium text-primary">
              Error — status CANCELED
            </p>
            <CodeBlock code={ESEWA_STATUS_CANCELED} />
            <p className="text-[13px] font-medium text-primary">
              Error — SignatureMismatchError
            </p>
            <CodeBlock code={ESEWA_SIGNATURE_MISMATCH} />
            <PropsTable rows={ESEWA_STATUS_ROWS} nameHeader="Status" />
          </DocSection>

          <DocSection
            id="responses-khalti"
            level={3}
            title="Khalti payloads"
            description="Initiate request/response, untrusted callback, lookup, and API errors."
          >
            <p className="text-[13px] font-medium text-primary">
              Request — initiate (paisa)
            </p>
            <CodeBlock code={KHALTI_INITIATE_REQUEST} />
            <p className="text-[13px] font-medium text-primary">
              Good — initiate success
            </p>
            <CodeBlock code={KHALTI_INITIATE_SUCCESS} />
            <p className="text-[13px] font-medium text-primary">
              Info — callback Completed (untrusted alone)
            </p>
            <CodeBlock code={KHALTI_CALLBACK_COMPLETED} />
            <p className="text-[13px] font-medium text-primary">
              Good — lookup Completed (deliver service)
            </p>
            <CodeBlock code={KHALTI_LOOKUP_COMPLETED} />
            <p className="text-[13px] font-medium text-primary">
              Error — 401 Invalid token
            </p>
            <CodeBlock code={KHALTI_AUTH_ERROR} />
            <p className="text-[13px] font-medium text-primary">
              Error — 400 validation
            </p>
            <CodeBlock code={KHALTI_VALIDATION_ERROR} />
            <PropsTable rows={KHALTI_STATUS_ROWS} nameHeader="Status" />
          </DocSection>

          <DocSection
            id="responses-sdk"
            level={3}
            title="SDK results & errors"
            description="Normalized shapes from handleCallback / verify / return handler."
          >
            <p className="text-[13px] font-medium text-primary">
              Callback received (never confirmed)
            </p>
            <CodeBlock code={SDK_CALLBACK_RECEIVED} />
            <p className="text-[13px] font-medium text-primary">
              Verification confirmed
            </p>
            <CodeBlock code={SDK_VERIFY_CONFIRMED} />
            <p className="text-[13px] font-medium text-primary">
              Verification failed
            </p>
            <CodeBlock code={SDK_VERIFY_FAILED} />
            <PropsTable rows={ERROR_ROWS} nameHeader="Class" />
          </DocSection>
        </DocSection>

        <DocSection
          id="architecture"
          title="Architecture"
          description="Backend-first, framework-agnostic. Gateways are adapters behind one interface."
        >
          <CodeBlock code={ARCH} />

          <DocSection
            id="state-machine"
            level={3}
            title="State machine"
            description="TypeScript + runtime enforcement. handleCallback cannot produce confirmed."
          >
            <PropsTable rows={STATUS_ROWS} nameHeader="Status" />
            <ExampleDemo
              code={STATE_MACHINE_DEMO_CODE}
              previewClassName="bg-transparent p-0"
            >
              <StateMachineDemo />
            </ExampleDemo>
          </DocSection>

          <DocSection
            id="amounts"
            level={3}
            title="Amount units"
            description="Public API is always NPR decimal. Khalti paisa conversion is internal."
          >
            <Callout title="100× bug">
              eSewa uses NPR decimals. Khalti uses paisa (NPR × 100). Passing{" "}
              <code className="font-mono text-primary">10.50</code> to{" "}
              <code className="font-mono text-primary">initiate</code> sends{" "}
              <code className="font-mono text-primary">1050</code> paisa to
              Khalti — never ask your app code to convert.
            </Callout>
          </DocSection>

          <DocSection
            id="idempotency"
            level={3}
            title="Idempotency"
            description="Unique (gateway, providerRef). Confirming twice is a no-op."
          >
            <p className="text-sm leading-relaxed text-secondary">
              <code className="font-mono text-primary">updateStatus</code>{" "}
              returns{" "}
              <code className="font-mono text-primary">
                {"{ record, changed }"}
              </code>
              . Already-confirmed → confirmed sets{" "}
              <code className="font-mono text-primary">changed: false</code>.
              The return-URL handler only runs{" "}
              <code className="font-mono text-primary">onConfirmed</code> when{" "}
              <code className="font-mono text-primary">changed</code> is true,
              so double webhooks / double-clicks grant access once.
            </p>
          </DocSection>
        </DocSection>

        <DocSection
          id="examples"
          title="Examples"
          description="Copy-paste patterns for both gateways and common frameworks."
        >
          <DocSection
            id="example-flow"
            level={3}
            title="Checkout flow"
            description="start → redirect → return URL → verify → fulfill."
          >
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-secondary">
              <li>
                Call{" "}
                <code className="font-mono text-primary">service.start()</code>{" "}
                — persists{" "}
                <code className="font-mono text-primary">pending</code>.
              </li>
              <li>
                Send the user to{" "}
                <code className="font-mono text-primary">
                  initiate.redirectUrl
                </code>{" "}
                (GET for Khalti, auto-POST form for eSewa).
              </li>
              <li>
                On return, call{" "}
                <code className="font-mono text-primary">
                  service.handleReturn(query)
                </code>
                .
              </li>
              <li>
                Fulfill only inside{" "}
                <code className="font-mono text-primary">onConfirmed</code>.
              </li>
            </ol>
          </DocSection>

          <DocSection id="example-esewa" level={3} title="eSewa form POST">
            <CodeBlock code={ESEWA_FORM} />
          </DocSection>

          <DocSection id="example-khalti" level={3} title="Khalti redirect">
            <CodeBlock code={KHALTI_REDIRECT} />
          </DocSection>

          <DocSection id="example-return" level={3} title="Return URL handler">
            <CodeBlock code={RETURN_HANDLER} />
          </DocSection>

          <DocSection id="example-express" level={3} title="Express">
            <CodeBlock code={EXPRESS} />
          </DocSection>

          <DocSection id="example-next" level={3} title="Next.js App Router">
            <CodeBlock code={NEXT} />
          </DocSection>
        </DocSection>

        <DocSection
          id="api"
          title="Package API"
          description="Full public surface. Types are exported alongside values."
        >
          <DocSection id="api-config" level={3} title="Config & factories">
            <PropsTable rows={CONFIG_ROWS} />
            <PropsTable
              rows={REQUEST_ROWS}
              caption="PaymentRequest"
              nameHeader="Field"
            />
          </DocSection>

          <DocSection id="api-gateway" level={3} title="PaymentGateway">
            <PropsTable rows={GATEWAY_API} nameHeader="Method" />
          </DocSection>

          <DocSection id="api-service" level={3} title="PaymentService">
            <PropsTable rows={SERVICE_API} nameHeader="Method" />
          </DocSection>

          <DocSection id="api-store" level={3} title="PaymentStore">
            <PropsTable rows={STORE_API} nameHeader="Method" />
          </DocSection>

          <DocSection id="api-errors" level={3} title="Errors">
            <PropsTable rows={ERROR_ROWS} nameHeader="Class" />
          </DocSection>
        </DocSection>

        <DocSection
          id="esewa"
          title="eSewa (ePay v2)"
          description="Form POST initiate, signed callback, status check API."
        >
          <DocSection id="esewa-sign" level={3} title="Signature">
            <p className="text-sm leading-relaxed text-secondary">
              HMAC-SHA256 over{" "}
              <code className="font-mono text-primary">
                total_amount=…,transaction_uuid=…,product_code=…
              </code>{" "}
              (order is load-bearing), Base64 output. Callback signatures use
              the order in{" "}
              <code className="font-mono text-primary">signed_field_names</code>
              .
            </p>
          </DocSection>

          <DocSection id="esewa-status" level={3} title="Status API mapping">
            <PropsTable rows={ESEWA_STATUS_ROWS} nameHeader="Gateway status" />
          </DocSection>

          <DocSection id="esewa-divergence" level={3} title="Docs divergence">
            <Callout title="ES104 — Invalid payload signature">
              Some eSewa doc pages print the UAT secret as{" "}
              <code className="font-mono text-primary">
                8gBm/:&amp;EnhH.1/q(
              </code>{" "}
              (trailing parenthesis). Sandbox rejects that. Use{" "}
              <code className="font-mono text-primary">
                8gBm/:&amp;EnhH.1/q
              </code>{" "}
              — exported as{" "}
              <code className="font-mono text-primary">
                ESEWA_UAT_SECRET_KEY
              </code>
              . Verified: correct key → HTTP 302 to payment page; typo key →
              ES104.
            </Callout>
          </DocSection>
        </DocSection>

        <DocSection
          id="khalti"
          title="Khalti (KPG-2)"
          description="JSON initiate → payment_url. Callback has no signature — lookup is mandatory."
        >
          <DocSection id="khalti-auth" level={3} title="Auth header">
            <Callout title="Common mistake">
              Use{" "}
              <code className="font-mono text-primary">
                Authorization: Key &lt;secret&gt;
              </code>{" "}
              — literal word <code className="font-mono text-primary">Key</code>
              , not Bearer. Wrong format surfaces as typed{" "}
              <code className="font-mono text-primary">GatewayApiError</code>.
            </Callout>
          </DocSection>

          <DocSection id="khalti-lookup" level={3} title="Lookup mapping">
            <PropsTable rows={KHALTI_STATUS_ROWS} nameHeader="Gateway status" />
          </DocSection>
        </DocSection>

        <DocSection
          id="scalability"
          title="Scalability"
          description="Designed so new gateways and stores are additive — no SDK fork required."
        >
          <DocSection id="extending" level={3} title="Custom gateways">
            <CodeBlock code={CUSTOM_GATEWAY} />
          </DocSection>

          <DocSection id="prisma" level={3} title="Prisma store">
            <CodeBlock code={PRISMA} />
          </DocSection>

          <DocSection id="http" level={3} title="HTTP timeouts & retries">
            <p className="text-sm leading-relaxed text-secondary">
              All gateway HTTP goes through{" "}
              <code className="font-mono text-primary">fetchJson</code>: default
              15s timeout, one retry on network / 5xx / 429. Tune via{" "}
              <code className="font-mono text-primary">timeoutMs</code> /{" "}
              <code className="font-mono text-primary">retries</code> on{" "}
              <code className="font-mono text-primary">createNepalPay</code>.
              Under concurrent return-URL hits,{" "}
              <code className="font-mono text-primary">MemoryPaymentStore</code>{" "}
              serializes updates per payment id; Prisma uses a transaction +
              unique constraint.
            </p>
          </DocSection>
        </DocSection>
      </div>
    </DocsShell>
  );
}
