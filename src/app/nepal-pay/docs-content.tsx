"use client";

import { ExampleDemo } from "@/components/example-demo";
import { InstallCommand } from "@/components/install-command";

import {
  CONFIG_ROWS,
  CONNECTIPS_FORM_ROWS,
  CONNECTIPS_STATUS_ROWS,
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
import {
  ArrowFlow,
  CONNECTIPS_FLOW_STEPS,
  GatewayComparisonTable,
  GatewayFlowCompare,
} from "./flow-diagram";
import { DOC_NAV } from "./nav";
import {
  CONNECTIPS_CALLBACK,
  CONNECTIPS_INITIATE_SUCCESS,
  CONNECTIPS_VALIDATE_REQUEST,
  CONNECTIPS_VALIDATE_SUCCESS,
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
  connectips: {
    merchantId: process.env.CONNECTIPS_MERCHANT_ID!,
    appId: process.env.CONNECTIPS_APP_ID!,
    appName: process.env.CONNECTIPS_APP_NAME!,
    password: process.env.CONNECTIPS_PASSWORD!,
    pfx: process.env.CONNECTIPS_PFX_BASE64!,
    pfxPassword: process.env.CONNECTIPS_PFX_PASSWORD!,
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

const CONNECTIPS_FORM = `const connectips = pay.gateway("connectips");
const service = createPaymentService(connectips, store, {
  successUrl: "https://example.com/pay/success",
  failureUrl: "https://example.com/pay/failed",
});

const { initiate } = await service.start({
  amount: 10.5, // → 1050 paisa in TXNAMT
  orderId: "order-42",
  orderName: "Pro plan",
  returnUrl: "https://example.com/pay/connectips/return", // NCHL registers static URLs
  websiteUrl: "https://example.com",
});

// Same HTML form POST pattern as eSewa (loginpage)
const html = \`<!doctype html><html><body>
<form id="cips" action="\${initiate.redirectUrl}" method="POST">
\${Object.entries(initiate.formFields!)
  .map(([k, v]) => \`<input type="hidden" name="\${k}" value="\${v}" />\`)
  .join("")}
</form>
<script>document.getElementById("cips").submit()</script>
</body></html>\`;

// Return URL gets ?TXNID=… only — always call verify() / handleReturn
// Point NCHL failure URL at …/return?outcome=failure`;

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
  gateways/      esewa/ · khalti/ · connectips/
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
            Unified TypeScript SDK for eSewa (ePay v2), Khalti (KPG-2), and
            connectIPS (NCHL). Server-side verification is mandatory — a browser
            redirect is never treated as proof of payment.
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
            Not affiliated with or endorsed by eSewa (F1Soft), Khalti, or
            NCHL/connectIPS. Merchant agreements and credentials stay between
            you and the providers.{" "}
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
            {" · "}
            connectIPS Process Interface Doc v5.1.
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
          description="One checkout form for eSewa, Khalti, and connectIPS — same fields, per-gateway arrow flow, full code always visible, then draft → pay → return → verify."
        >
          <Callout title="Complete a transaction">
            Pick <strong className="font-medium text-primary">eSewa</strong>,{" "}
            <strong className="font-medium text-primary">Khalti</strong>, or{" "}
            <strong className="font-medium text-primary">connectIPS</strong>,
            fill the form, generate/draft/initiate, then follow the pay or
            simulate button. Returns land on{" "}
            <code className="font-mono text-primary">/nepal-pay/return</code>,{" "}
            <code className="font-mono text-primary">
              /nepal-pay/khalti-return
            </code>
            , or{" "}
            <code className="font-mono text-primary">
              /nepal-pay/connectips-return
            </code>{" "}
            for server-side verify. connectIPS mock mode builds a real
            RSA-signed form payload, then simulates{" "}
            <code className="font-mono text-primary">validatetxn SUCCESS</code>.
          </Callout>

          <DocSection
            id="playground-checkout"
            level={3}
            title="Unified checkout"
            description="Name, amount, reference, URLs, tax/service/delivery, gateway toggle — draft payment + payload for each rail."
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
            title="Flow diagrams"
            description="Six phases each: draft → sign/initiate → pay → return → verify. Text stays inside the white cards."
          >
            <GatewayFlowCompare />
          </DocSection>

          <DocSection
            id="playground-compare"
            level={3}
            title="Gateway comparison"
            description="Same ideas side-by-side — what a layman cares about under each technical row."
          >
            <GatewayComparisonTable />
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
            id="responses-connectips"
            level={3}
            title="connectIPS payloads"
            description="Draft form (RSA TOKEN), callback TXNID, validatetxn request/response."
          >
            <p className="text-[13px] font-medium text-primary">
              Good — draft initiate (form + TOKEN message)
            </p>
            <CodeBlock code={CONNECTIPS_INITIATE_SUCCESS} />
            <p className="text-[13px] font-medium text-primary">
              Info — callback (?TXNID= only — untrusted)
            </p>
            <CodeBlock code={CONNECTIPS_CALLBACK} />
            <p className="text-[13px] font-medium text-primary">
              Request — validatetxn body
            </p>
            <CodeBlock code={CONNECTIPS_VALIDATE_REQUEST} />
            <p className="text-[13px] font-medium text-primary">
              Good — validatetxn SUCCESS (deliver service)
            </p>
            <CodeBlock code={CONNECTIPS_VALIDATE_SUCCESS} />
            <PropsTable rows={CONNECTIPS_STATUS_ROWS} nameHeader="Status" />
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
            description="Public API is always NPR decimal. Paisa conversion for Khalti / connectIPS is internal."
          >
            <Callout title="100× bug">
              eSewa uses NPR decimals. Khalti and connectIPS use paisa (NPR ×
              100). Passing{" "}
              <code className="font-mono text-primary">10.50</code> to{" "}
              <code className="font-mono text-primary">initiate</code> sends{" "}
              <code className="font-mono text-primary">1050</code> paisa to
              those gateways — never ask your app code to convert.
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

          <DocSection
            id="example-connectips"
            level={3}
            title="connectIPS form POST"
          >
            <CodeBlock code={CONNECTIPS_FORM} />
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
          id="connectips"
          title="connectIPS (NCHL)"
          description="Bank / wallet payments via Nepal Clearing House. Same safety rule as the others: a browser redirect is never proof of payment."
        >
          <DocSection
            id="connectips-overview"
            level={3}
            title="In plain words"
            description="For product owners and first-time integrators."
          >
            <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-secondary">
              <li>
                <span className="font-medium text-primary">You draft</span> an
                order on your server (amount, order id, remarks).
              </li>
              <li>
                <span className="font-medium text-primary">You seal it</span>{" "}
                with a digital signature (RSA TOKEN) so NCHL knows the request
                is really from your merchant app.
              </li>
              <li>
                <span className="font-medium text-primary">
                  The customer pays
                </span>{" "}
                on the connectIPS / bank page after an HTML form POST.
              </li>
              <li>
                <span className="font-medium text-primary">They come back</span>{" "}
                to your site with only a transaction id (
                <code className="font-mono text-primary">TXNID</code>) — anyone
                could fake that URL.
              </li>
              <li>
                <span className="font-medium text-primary">You ask NCHL</span>{" "}
                “did this payment succeed?” via{" "}
                <code className="font-mono text-primary">validatetxn</code>.
                Only <code className="font-mono text-primary">SUCCESS</code>{" "}
                means deliver the product.
              </li>
            </ol>
            <Callout title="Who needs what from NCHL">
              After onboarding you receive merchant id, app id, app name, app
              password, and a{" "}
              <code className="font-mono text-primary">CREDITOR.pfx</code>{" "}
              certificate. Register static success and failure URLs with NCHL
              (they cannot be changed per payment like eSewa’s success_url).
            </Callout>
          </DocSection>

          <DocSection
            id="connectips-phases"
            level={3}
            title="Each phase"
            description="What happens, who does it, and what you store."
          >
            <div className="flex flex-col gap-4">
              <div className="min-w-0 overflow-hidden rounded-lg border-[0.5px] border-border bg-card p-4 dark:bg-card">
                <p className="text-[13px] font-medium text-primary">
                  Phase 1 — Draft payment
                </p>
                <p className="mt-1 text-sm leading-relaxed break-words text-secondary">
                  Start from NPR in your checkout (example: Rs. 10.50). The SDK
                  converts to paisa for{" "}
                  <code className="font-mono text-primary">TXNAMT</code> (1050).
                  Create a unique{" "}
                  <code className="font-mono text-primary">TXNID</code> (≤ 20
                  characters) — this is your{" "}
                  <code className="font-mono text-primary">providerRef</code>.
                  Set <code className="font-mono text-primary">TXNDATE</code> to
                  today as{" "}
                  <code className="font-mono text-primary">DD-MM-YYYY</code>.
                  Persist a pending row in your DB keyed by that TXNID before
                  sending the customer away.
                </p>
              </div>
              <div className="min-w-0 overflow-hidden rounded-lg border-[0.5px] border-border bg-card p-4 dark:bg-card">
                <p className="text-[13px] font-medium text-primary">
                  Phase 2 — Build the TOKEN
                </p>
                <p className="mt-1 text-sm leading-relaxed break-words text-secondary">
                  Concatenate the login fields in the documented order,
                  separated by commas with{" "}
                  <span className="font-medium text-primary">no spaces</span>,
                  and end with{" "}
                  <code className="font-mono text-primary">TOKEN=TOKEN</code>.
                  Sign that string with your private key (SHA256withRSA) and
                  Base64-encode the result. That value is the form’s{" "}
                  <code className="font-mono text-primary">TOKEN</code> field.
                  Prefer exporting PEM from the PFX once; the playground can
                  draft a mock-signed payload without NCHL.
                </p>
              </div>
              <div className="min-w-0 overflow-hidden rounded-lg border-[0.5px] border-border bg-card p-4 dark:bg-card">
                <p className="text-[13px] font-medium text-primary">
                  Phase 3 — HTML form POST (loginpage)
                </p>
                <p className="mt-1 text-sm leading-relaxed break-words text-secondary">
                  Same pattern as eSewa: render a hidden form and auto-submit to{" "}
                  <code className="font-mono text-primary [overflow-wrap:anywhere]">
                    …/connectipswebgw/loginpage
                  </code>
                  . Do not turn this into a GET. UAT host:{" "}
                  <code className="font-mono text-primary [overflow-wrap:anywhere]">
                    https://uat.connectips.com
                  </code>
                  .
                </p>
              </div>
              <div className="min-w-0 overflow-hidden rounded-lg border-[0.5px] border-border bg-card p-4 dark:bg-card">
                <p className="text-[13px] font-medium text-primary">
                  Phase 4 — Customer pays
                </p>
                <p className="mt-1 text-sm leading-relaxed break-words text-secondary">
                  The user authenticates with connectIPS or their bank. You do
                  not control this UI. On success NCHL redirects to your
                  registered success URL; on cancel/fail, to the failure URL.
                </p>
              </div>
              <div className="min-w-0 overflow-hidden rounded-lg border-[0.5px] border-border bg-card p-4 dark:bg-card">
                <p className="text-[13px] font-medium text-primary">
                  Phase 5 — Return URL (untrusted)
                </p>
                <p className="mt-1 text-sm leading-relaxed break-words text-secondary">
                  Success redirect appends only{" "}
                  <code className="font-mono text-primary">?TXNID=…</code>.
                  Point the NCHL failure URL at the same handler with{" "}
                  <code className="font-mono text-primary">
                    ?outcome=failure
                  </code>{" "}
                  so{" "}
                  <code className="font-mono text-primary">handleCallback</code>{" "}
                  can mark cancel without waiting on validate. Never fulfill
                  from this step alone.
                </p>
              </div>
              <div className="min-w-0 overflow-hidden rounded-lg border-[0.5px] border-border bg-card p-4 dark:bg-card">
                <p className="text-[13px] font-medium text-primary">
                  Phase 6 — validatetxn (only path to “paid”)
                </p>
                <p className="mt-1 text-sm leading-relaxed break-words text-secondary">
                  Your server POSTs to{" "}
                  <code className="font-mono text-primary [overflow-wrap:anywhere]">
                    …/connectipswebws/api/creditor/validatetxn
                  </code>{" "}
                  with Basic Auth (
                  <code className="font-mono text-primary">APPID</code> as
                  username, app password) and a signed body ( merchantId, appId,
                  referenceId = TXNID, txnAmt in paisa). Map{" "}
                  <code className="font-mono text-primary">SUCCESS</code> →
                  confirmed,{" "}
                  <code className="font-mono text-primary">FAILED</code> →
                  failed, <code className="font-mono text-primary">ERROR</code>{" "}
                  → pending (not found / incomplete — re-poll, do not deliver).
                  Optional:{" "}
                  <code className="font-mono text-primary">gettxndetail</code>{" "}
                  for richer fields after SUCCESS.
                </p>
              </div>
            </div>
            <div className="mt-4 min-w-0 overflow-hidden">
              <p className="mb-2 text-[12px] font-medium text-primary">
                Diagram (same six phases)
              </p>
              <ArrowFlow steps={CONNECTIPS_FLOW_STEPS} />
            </div>
          </DocSection>

          <DocSection id="connectips-token" level={3} title="TOKEN signing">
            <p className="text-sm leading-relaxed break-words text-secondary">
              Build the comma-joined string (no spaces after commas) ending in{" "}
              <code className="font-mono text-primary">TOKEN=TOKEN</code>, then
              sign with SHA256withRSA using the NCHL-issued PKCS#12 private key
              and Base64-encode. Prefer{" "}
              <code className="font-mono text-primary">privateKeyPem</code>{" "}
              (convert{" "}
              <code className="font-mono text-primary">CREDITOR.pfx</code> once
              with OpenSSL). <code className="font-mono text-primary">pfx</code>{" "}
              + <code className="font-mono text-primary">pfxPassword</code>{" "}
              works when <code className="font-mono text-primary">openssl</code>{" "}
              is on PATH. Amounts on the wire are paisa integers.
            </p>
            <CodeBlock
              code={`MERCHANTID=902,APPID=MER-902-APP-1,APPNAME=Demo,TXNID=ord42txn001,TXNDATE=22-07-2026,TXNCRNCY=NPR,TXNAMT=1050,REFERENCEID=ord42txn001,REMARKS=Pro plan,PARTICULARS=Pro plan,TOKEN=TOKEN
// → SHA256withRSA(privateKey) → Base64 → form field TOKEN`}
            />
          </DocSection>

          <DocSection
            id="connectips-form"
            level={3}
            title="Login form fields"
            description="Draft payment payload posted to /connectipswebgw/loginpage."
          >
            <PropsTable rows={CONNECTIPS_FORM_ROWS} />
          </DocSection>

          <DocSection id="connectips-validate" level={3} title="validatetxn">
            <Callout title="Callback is untrusted">
              Success/failure URLs only receive{" "}
              <code className="font-mono text-primary">?TXNID=</code>. Always
              call <code className="font-mono text-primary">verify()</code>{" "}
              (Basic Auth + signed body). Point the NCHL failure URL at the same
              handler with{" "}
              <code className="font-mono text-primary">?outcome=failure</code>{" "}
              so cancel can be detected before validate.
            </Callout>
            <PropsTable
              rows={CONNECTIPS_STATUS_ROWS}
              nameHeader="Gateway status"
            />
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
