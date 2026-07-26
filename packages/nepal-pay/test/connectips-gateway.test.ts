import { generateKeyPairSync } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { nprToPaisa } from "../src/core/amount";
import { ConfigError } from "../src/core/errors";
import {
  ConnectIpsGateway,
  mapConnectIpsStatusForTest,
} from "../src/gateways/connectips/ConnectIpsGateway";
import {
  buildConnectIpsLoginMessage,
  buildConnectIpsValidateMessage,
  signConnectIpsToken,
} from "../src/gateways/connectips/signature";

const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privateKeyPem = privateKey.export({
  type: "pkcs8",
  format: "pem",
}) as string;

function makeGateway(fetchImpl?: typeof fetch) {
  return new ConnectIpsGateway({
    mode: "sandbox",
    config: {
      merchantId: 902,
      appId: "MER-902-APP-1",
      appName: "Merchant Demo",
      password: "Pwd123",
      privateKeyPem,
    },
    fetchImpl,
  });
}

describe("connectips gateway", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds login token message without spaces after commas", () => {
    const msg = buildConnectIpsLoginMessage({
      merchantId: 902,
      appId: "MER-902-APP-1",
      appName: "Demo",
      txnId: "txn1",
      txnDate: "22-07-2026",
      txnCrncy: "NPR",
      txnAmt: 1000,
      referenceId: "ref1",
      remarks: "order",
      particulars: "item",
    });
    expect(msg).toBe(
      "MERCHANTID=902,APPID=MER-902-APP-1,APPNAME=Demo,TXNID=txn1,TXNDATE=22-07-2026,TXNCRNCY=NPR,TXNAMT=1000,REFERENCEID=ref1,REMARKS=order,PARTICULARS=item,TOKEN=TOKEN",
    );
    expect(msg).not.toContain(", ");
  });

  it("builds validate token message", () => {
    expect(
      buildConnectIpsValidateMessage({
        merchantId: 902,
        appId: "MER-902-APP-1",
        referenceId: "txn1",
        txnAmt: 1050,
      }),
    ).toBe("MERCHANTID=902,APPID=MER-902-APP-1,REFERENCEID=txn1,TXNAMT=1050");
  });

  it("signs with SHA256withRSA → base64", () => {
    const token = signConnectIpsToken("hello", privateKey);
    expect(token).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(token.length).toBeGreaterThan(50);
  });

  it("initiate returns POST form with paisa TXNAMT and TOKEN", async () => {
    const gw = makeGateway();
    const result = await gw.initiate({
      amount: 10.5,
      orderId: "ord-42",
      orderName: "Widget",
      returnUrl: "https://merchant.test/return",
      websiteUrl: "https://merchant.test",
      metadata: {
        txn_id: "ord42txn001",
        txn_date: "22-07-2026",
      },
    });

    expect(result.method).toBe("POST");
    expect(result.redirectUrl).toBe(
      "https://uat.connectips.com/connectipswebgw/loginpage",
    );
    expect(result.providerRef).toBe("ord42txn001");
    expect(result.formFields?.TXNAMT).toBe(String(nprToPaisa(10.5)));
    expect(result.formFields?.TXNCRNCY).toBe("NPR");
    expect(result.formFields?.MERCHANTID).toBe("902");
    expect(result.formFields?.TOKEN).toBeTruthy();
    expect(result.formFields?.TOKEN.length).toBeGreaterThan(50);
  });

  it("maps validatetxn statuses", () => {
    expect(mapConnectIpsStatusForTest("SUCCESS")).toBe("confirmed");
    expect(mapConnectIpsStatusForTest("FAILED")).toBe("failed");
    expect(mapConnectIpsStatusForTest("ERROR")).toBe("pending");
  });

  it("verify() posts validatetxn with Basic Auth and maps SUCCESS", async () => {
    let auth: string | null = null;
    const urls: string[] = [];
    let body: Record<string, unknown> | undefined;

    const fetchImpl = vi.fn(
      async (input: string | URL | Request, init?: RequestInit) => {
        const requestUrl = String(input);
        urls.push(requestUrl);
        const headers = new Headers(init?.headers);
        auth = headers.get("Authorization");
        body = JSON.parse(String(init?.body)) as Record<string, unknown>;
        if (requestUrl.includes("validatetxn")) {
          return Response.json({
            merchantId: 902,
            appId: "MER-902-APP-1",
            referenceId: "ord42txn001",
            txnAmt: "1050",
            status: "SUCCESS",
            statusDesc: "Transaction successful",
          });
        }
        // gettxndetail enrichment
        return Response.json({
          status: "SUCCESS",
          txnId: 998877,
          txnAmt: 1050,
          creditStatus: "000",
        });
      },
    ) as unknown as typeof fetch;

    const result = await makeGateway(fetchImpl).verify("ord42txn001", {
      amount: 10.5,
    });

    expect(urls[0]).toContain("/connectipswebws/api/creditor/validatetxn");
    expect(urls[1]).toContain("/connectipswebws/api/creditor/gettxndetail");
    expect(auth).toMatch(/^Basic /);
    expect(Buffer.from(auth!.slice(6), "base64").toString("utf8")).toBe(
      "MER-902-APP-1:Pwd123",
    );
    expect(body?.referenceId).toBe("ord42txn001");
    expect(body?.txnAmt).toBe(1050);
    expect(typeof body?.token).toBe("string");
    expect(result.status).toBe("confirmed");
    expect(result.amount).toBe(10.5);
    expect(result.transactionId).toBe("998877");
  });

  it("verify() requires context.amount", async () => {
    await expect(makeGateway().verify("txn-1")).rejects.toBeInstanceOf(
      ConfigError,
    );
  });

  it("handleCallback never returns confirmed — TXNID → callback_received", async () => {
    const result = await makeGateway().handleCallback({ TXNID: "txn-9" });
    expect(result.kind).toBe("callback_received");
    if (result.kind === "callback_received") {
      expect(result.providerRef).toBe("txn-9");
    }
  });

  it("handleCallback maps failure outcome to cancelled", async () => {
    const result = await makeGateway().handleCallback({
      TXNID: "txn-9",
      outcome: "failure",
    });
    expect(result.kind).toBe("callback_cancelled");
  });

  it("handleCallback without TXNID is cancelled", async () => {
    const result = await makeGateway().handleCallback({});
    expect(result.kind).toBe("callback_cancelled");
  });
});
