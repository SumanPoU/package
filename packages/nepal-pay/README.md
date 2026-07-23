# @itzsa/nepal-pay

Unified TypeScript SDK for Nepal’s two dominant digital wallets — **eSewa (ePay v2)** and **Khalti (KPG-2)** — with **server-side verification mandatory by default**.

> **Disclaimer — unofficial community wrapper**  
> `@itzsa/nepal-pay` is an independent, community-built library. It is **not affiliated with, endorsed by, or partnered with** eSewa (F1Soft) or Khalti. Gateway APIs, credentials, and merchant agreements remain between you and the respective providers. Always verify against official docs before going live.

**Docs site:** [itzsa.acharya-suman.com.np/nepal-pay](https://itzsa.acharya-suman.com.np/nepal-pay) — includes interactive eSewa HTML form + Khalti React form playgrounds and a full success/error response explorer.

## Why this exists

Redirecting a browser to your `success_url` / `return_url` is **not proof of payment**. It only means *some* interaction happened — a real payment, a cancel, or someone manually hitting the URL with fabricated query params.

| Gateway | Untrusted callback | Mandatory verification |
|---------|--------------------|------------------------|
| eSewa   | Base64 JSON on success URL (has a signature — still re-check it) | Recompute HMAC + call status API (`COMPLETE` only) |
| Khalti  | Query params with **no signature** | `POST /epayment/lookup/` (`Completed` only) |

This SDK makes `verify()` the only path to `confirmed`.

## Install

```bash
pnpm add @itzsa/nepal-pay
# npm install @itzsa/nepal-pay
```

Requires Node.js 18+ (native `fetch` + `crypto`). Dual ESM + CJS build.

## Quick start (recommended: PaymentService)

```ts
import {
  createNepalPay,
  createPaymentService,
  MemoryPaymentStore, // or PrismaPaymentStore
} from "@itzsa/nepal-pay";

const pay = createNepalPay({
  mode: "sandbox", // or "production"
  timeoutMs: 15_000,
  retries: 1,
  esewa: {
    productCode: "EPAYTEST",
    secretKey: process.env.ESEWA_SECRET!, // UAT: 8gBm/:&EnhH.1/q (no trailing '(')
  },
  khalti: {
    secretKey: process.env.KHALTI_SECRET!,
  },
});

const store = new MemoryPaymentStore();
const service = createPaymentService(pay.gateway("khalti"), store, {
  successUrl: "https://example.com/pay/success",
  failureUrl: "https://example.com/pay/failed",
  onConfirmed: async (paymentId) => {
    await fulfillOrder(paymentId); // at most once
  },
});

const { initiate, record } = await service.start({
  amount: 10.5, // NPR decimal — paisa conversion is internal
  orderId: "order-42",
  orderName: "Pro plan",
  returnUrl: "https://example.com/pay/khalti/return",
  websiteUrl: "https://example.com",
});

// Redirect to initiate.redirectUrl
```

On the return URL:

```ts
const { redirectTo } = await service.handleReturn(
  Object.fromEntries(new URL(request.url).searchParams),
);
return Response.redirect(redirectTo);
```

## Architecture

```
src/
  core/       types · errors · state machine · amount helpers
  gateways/   esewa/ · khalti/   (additive folders for future gateways)
  registry/   registerGateway() plugin API
  store/      PaymentStore · MemoryPaymentStore · PrismaPaymentStore
  flow/       PaymentService (initiate + persist + return handler)
  webhook/    createReturnUrlHandler (framework-agnostic)
  http/       fetchJson (timeout + retries)
```

### State machine

```
pending
  ├─ handleCallback (cancel) ──► failed
  └─ handleCallback (ok) ──► callback_received ──► verifying
                                                      ├─ confirmed   ← verify() only
                                                      ├─ pending
                                                      └─ failed
confirmed ──► refunded
```

- `handleCallback()` return type is only `callback_received | callback_cancelled` — **no `confirmed` variant**.
- Only `verify()` may produce a result that transitions into `confirmed`.
- Illegal transitions throw `InvalidTransitionError`.

### Amount units

| Layer | Unit |
|-------|------|
| Public `PaymentRequest.amount` | NPR decimal (`10.50`) |
| eSewa form / status API | NPR decimal |
| Khalti initiate / lookup | Paisa (`1050`) — converted inside `KhaltiGateway` |

### Idempotency

- Stores enforce unique `(gateway, providerRef)`.
- `updateStatus(id, "confirmed")` on an already-confirmed row returns `{ changed: false }`.
- `onConfirmed` runs only when `changed === true`.

## eSewa

- **Sandbox form:** `POST https://rc-epay.esewa.com.np/api/epay/main/v2/form`
- **Signature:** HMAC-SHA256 → Base64 over `total_amount,transaction_uuid,product_code` (order fixed).
- **Callback:** Base64 JSON; recompute signature before trusting; still call status API.
- **Status values:** `COMPLETE` (paid), `PENDING`, `AMBIGUOUS`, `CANCELED`, `NOT_FOUND`, `FULL_REFUND`, `PARTIAL_REFUND`.

`initiate()` returns `method: "POST"` + `formFields` — render an auto-submit HTML form.

### Docs divergence (UAT secret typo → ES104)

Some eSewa pages print the UAT secret as `8gBm/:&EnhH.1/q(` (trailing `(`). **Sandbox returns `ES104 Invalid payload signature` for that key.**

Working UAT secret (live-verified POST → 302): `8gBm/:&EnhH.1/q`  
Exported as `ESEWA_UAT_SECRET_KEY`. The official HTML form sample signature for `total_amount=110,transaction_uuid=241028,product_code=EPAYTEST` matches this key.

## Khalti

- **Sandbox base:** `https://dev.khalti.com/api/v2/`
- **Auth:** `Authorization: Key <secret>` (not Bearer).
- **Initiate:** `POST /epayment/initiate/` → `payment_url` + `pidx`.
- **Lookup (mandatory):** `POST /epayment/lookup/` — only `Completed` means deliver service.
- **Min amount:** > Rs. 10 (> 1000 paisa).

## Scalability

### Custom gateways

```ts
import { registerGateway } from "@itzsa/nepal-pay";

registerGateway("fonepay", (ctx) => new FonepayGateway(ctx));
const gw = pay.gateway("fonepay");
```

### Production store (Prisma)

```ts
import { PrismaPaymentStore } from "@itzsa/nepal-pay";

const store = new PrismaPaymentStore(prisma);
// @@unique([gateway, providerRef])
```

### HTTP resilience

`fetchJson` applies a 15s timeout and retries network / 5xx / 429 by default. Configure via `createNepalPay({ timeoutMs, retries })`.

## Public API

| Export | Role |
|--------|------|
| `createNepalPay` / `NepalPay` | Config + gateway access |
| `createPaymentService` / `PaymentService` | Orchestrated checkout |
| `createReturnUrlHandler` | Low-level return-URL factory |
| `EsewaGateway` / `KhaltiGateway` | Direct adapters |
| `MemoryPaymentStore` / `PrismaPaymentStore` | Stores |
| `registerGateway` | Plugin registration |
| `PaymentStateMachine` | Transition enforcement |
| `nprToPaisa` / `formatNprAmount` | Amount helpers |
| Typed errors | `SignatureMismatchError`, `GatewayApiError`, … |

## Framework adapters

### Express

```ts
app.get("/pay/khalti/return", async (req, res) => {
  const query = Object.fromEntries(
    Object.entries(req.query).map(([k, v]) => [k, String(v)]),
  );
  const { redirectTo } = await service.handleReturn(query);
  res.redirect(redirectTo);
});
```

### Next.js App Router

```ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  const { redirectTo } = await service.handleReturn(query);
  return Response.redirect(redirectTo);
}
```

## Sandbox credentials (from provider docs)

**eSewa UAT:** product code `EPAYTEST`, secret `8gBm/:&EnhH.1/q`  
(Do **not** use a trailing `(` — some official pages show `8gBm/:&EnhH.1/q(` which produces `ES104 Invalid payload signature` on sandbox.)

**Khalti test:** IDs `9800000000`–`9800000005`, MPIN `1111`, OTP `987654`

## Non-goals (v1)

- Fonepay / ConnectIPS / IME Pay — register via `registerGateway` when ready
- UI components — headless / backend-first
- Hard ORM dependency — bring your own `PaymentStore` (Prisma reference included)
- Merchant refund APIs — `refund()` throws `RefundNotSupportedError`

## References

- [Khalti KPG-2](https://docs.khalti.com/khalti-epayment/)
- [eSewa ePay v2](http://developer.esewa.com.np/pages/Epay)
- [Praxium Labs playbook](https://praxiumlabs.com/blog/esewa-khalti-automation/)

## License

MIT
