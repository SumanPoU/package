import { generateKeyPairSync } from "node:crypto";

import {
  buildConnectIpsLoginMessage,
  ConnectIpsGateway,
  nprToPaisa,
} from "@itzsa/nepal-pay";
import { NextResponse } from "next/server";

type Body = {
  amount?: number;
  orderId?: string;
  orderName?: string;
  returnUrl?: string;
  failureUrl?: string;
  websiteUrl?: string;
  remarks?: string;
  particulars?: string;
  /** Force mock draft even if live credentials exist. */
  mock?: boolean;
  /** Live UAT overrides (prefer env CONNECTIPS_*). */
  merchantId?: string | number;
  appId?: string;
  appName?: string;
  password?: string;
  privateKeyPem?: string;
};

function demoPem(): string {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  return privateKey.export({ type: "pkcs8", format: "pem" }) as string;
}

/**
 * Docs playground: draft a connectIPS login-page payload (RSA TOKEN + form fields).
 * Mock mode never hits NCHL — still produces a real signed form for inspection.
 */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CONFIG",
          name: "ConfigError",
          message: "Request body must be JSON",
        },
      },
      { status: 400 },
    );
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || !(amount > 0)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "CONFIG",
          name: "ConfigError",
          message: "amount must be a positive NPR decimal",
        },
      },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;
  const stamp = Date.now().toString(36);
  const orderId = (body.orderId?.trim() || `demo-${stamp}`)
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 20);
  const orderName = body.orderName?.trim() || "itzsa docs demo";
  const returnUrl =
    body.returnUrl?.trim() || `${origin}/nepal-pay/connectips-return`;
  const failureUrl =
    body.failureUrl?.trim() ||
    `${origin}/nepal-pay/connectips-return?outcome=failure`;
  const amountPaisa = nprToPaisa(amount);

  const envMerchant = process.env.CONNECTIPS_MERCHANT_ID?.trim();
  const envAppId = process.env.CONNECTIPS_APP_ID?.trim();
  const envAppName = process.env.CONNECTIPS_APP_NAME?.trim();
  const envPassword = process.env.CONNECTIPS_PASSWORD?.trim();
  const envPem = process.env.CONNECTIPS_PEM?.trim();

  const merchantId = body.merchantId ?? envMerchant ?? "902";
  const appId = body.appId?.trim() || envAppId || "MER-DEMO-APP";
  const appName = body.appName?.trim() || envAppName || "itzsa docs";
  const password = body.password?.trim() || envPassword || "demo-password";
  const privateKeyPem = body.privateKeyPem?.trim() || envPem || "";

  const hasLiveCreds = Boolean(
    privateKeyPem &&
      (body.merchantId || envMerchant) &&
      (body.appId || envAppId) &&
      (body.password || envPassword),
  );
  const useMock = body.mock === true || !hasLiveCreds;

  const flow = [
    "1. Draft payment — NPR → paisa TXNAMT; TXNID ≤ 20; TXNDATE DD-MM-YYYY",
    "2. Build TOKEN string (…,TOKEN=TOKEN) → SHA256withRSA → Base64",
    "3. HTML form POST to /connectipswebgw/loginpage",
    "4. User pays on connectIPS / bank UI",
    "5. NCHL redirects to static success URL?TXNID=… (failure URL on cancel)",
    "6. Server POST /validatetxn — only SUCCESS = fulfill",
  ];

  const pemForSign = privateKeyPem || demoPem();

  try {
    const gateway = new ConnectIpsGateway({
      mode: "sandbox",
      config: {
        merchantId,
        appId,
        appName,
        password,
        privateKeyPem: pemForSign,
        // Mock never POSTs to NCHL; live uses real UAT host from mode.
      },
    });

    const initiate = await gateway.initiate({
      amount,
      orderId,
      orderName,
      returnUrl,
      failureUrl,
      websiteUrl: body.websiteUrl?.trim() || origin,
      metadata: {
        txn_id: orderId.slice(0, 20),
        remarks: (body.remarks ?? orderName).slice(0, 50),
        particulars: (body.particulars ?? orderName).slice(0, 100),
      },
    });

    const fields = initiate.formFields ?? {};
    const loginTokenMessage = buildConnectIpsLoginMessage({
      merchantId: fields.MERCHANTID ?? merchantId,
      appId: fields.APPID ?? appId,
      appName: fields.APPNAME ?? appName,
      txnId: fields.TXNID ?? initiate.providerRef,
      txnDate: fields.TXNDATE ?? "",
      txnCrncy: fields.TXNCRNCY ?? "NPR",
      txnAmt: Number(fields.TXNAMT ?? amountPaisa),
      referenceId: fields.REFERENCEID ?? initiate.providerRef,
      remarks: fields.REMARKS ?? orderName,
      particulars: fields.PARTICULARS ?? orderName,
    });

    const simulateReturnUrl = `${origin}/nepal-pay/connectips-return?TXNID=${encodeURIComponent(initiate.providerRef)}&amount=${amount}&mock=1`;

    if (useMock) {
      return NextResponse.json({
        ok: true,
        gateway: "connectips",
        mode: "sandbox",
        live: false,
        amountNpr: amount,
        amountPaisa,
        loginTokenMessage,
        signedMessage: loginTokenMessage,
        requestSent: fields,
        formFields: fields,
        flow,
        note: hasLiveCreds
          ? "mock=true — draft signed payload without posting to NCHL. Uncheck mock for live loginpage."
          : "Draft payment (mock): RSA-signed form fields ready. Simulate return → validatetxn SUCCESS. For live UAT, paste PEM + merchant credentials or set CONNECTIPS_*.",
        initiate,
        simulateReturnUrl,
        successUrlHint: returnUrl,
        failureUrlHint: failureUrl,
        nchl: {
          loginpage: initiate.redirectUrl,
          validatetxn:
            "https://uat.connectips.com/connectipswebws/api/creditor/validatetxn",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      gateway: "connectips",
      mode: "sandbox",
      live: true,
      amountNpr: amount,
      amountPaisa,
      loginTokenMessage,
      signedMessage: loginTokenMessage,
      requestSent: fields,
      formFields: fields,
      flow,
      note: "Live draft — click Pay to POST the form to UAT loginpage. Register success/failure URLs with NCHL first.",
      initiate,
      successUrlHint: returnUrl,
      failureUrlHint: failureUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : "CONFIG";
    const name = err instanceof Error ? err.name : "Error";
    return NextResponse.json(
      {
        ok: false,
        error: { code, name, message },
        flow,
      },
      { status: 400 },
    );
  }
}
