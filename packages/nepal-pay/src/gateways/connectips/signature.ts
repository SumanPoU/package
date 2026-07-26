import { spawnSync } from "node:child_process";
import { createPrivateKey, createSign, type KeyObject } from "node:crypto";

import { ConfigError } from "../../core/errors";

export type ConnectIpsKeySource =
  | { kind: "pem"; pem: string }
  | { kind: "pfx"; pfx: Buffer; passphrase: string };

/**
 * Load an RSA private key from PEM text or a PKCS#12 (.pfx) buffer.
 *
 * Node.js cannot extract signing keys from PKCS#12 natively. When `pfx` is
 * supplied, we shell out to `openssl pkcs12` (same tool NCHL/Java merchants
 * already use). Prefer `privateKeyPem` in apps/CI if you convert once:
 * `openssl pkcs12 -in CREDITOR.pfx -nocerts -nodes -out key.pem`
 */
export function loadConnectIpsPrivateKey(
  source: ConnectIpsKeySource,
): KeyObject {
  try {
    if (source.kind === "pem") {
      return createPrivateKey(source.pem);
    }
    const pem = extractPemFromPfx(source.pfx, source.passphrase);
    return createPrivateKey(pem);
  } catch (err) {
    if (err instanceof ConfigError) throw err;
    throw new ConfigError(
      `connectips private key could not be loaded: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}

/**
 * Convert PKCS#12 → PEM private key via OpenSSL CLI.
 */
export function extractPemFromPfx(pfx: Buffer, passphrase: string): string {
  const result = spawnSync(
    "openssl",
    ["pkcs12", "-nocerts", "-nodes", "-passin", `pass:${passphrase}`],
    {
      input: pfx,
      encoding: "buffer",
      maxBuffer: 4 * 1024 * 1024,
      windowsHide: true,
    },
  );

  if (result.error) {
    throw new ConfigError(
      `connectips.pfx requires OpenSSL on PATH to extract the private key (${result.error.message}). ` +
        "Convert once with: openssl pkcs12 -in CREDITOR.pfx -nocerts -nodes -out key.pem " +
        "and set connectips.privateKeyPem instead.",
    );
  }

  if (result.status !== 0) {
    const stderr = result.stderr?.toString("utf8") ?? "";
    throw new ConfigError(
      `connectips.pfx could not be unlocked with openssl pkcs12` +
        (stderr ? `: ${stderr.trim().slice(0, 200)}` : "") +
        ". Check pfxPassword, or set privateKeyPem after converting the PFX.",
    );
  }

  const pem = result.stdout.toString("utf8");
  if (!pem.includes("BEGIN") || !pem.includes("PRIVATE KEY")) {
    throw new ConfigError(
      "connectips.pfx did not contain a private key (unexpected openssl output)",
    );
  }
  return pem;
}

/**
 * SHA256withRSA signature → Base64 token (connectIPS §3.3).
 */
export function signConnectIpsToken(
  message: string,
  privateKey: KeyObject,
): string {
  const signer = createSign("SHA256");
  signer.update(message, "utf8");
  signer.end();
  return signer.sign(privateKey, "base64");
}

/** Login-page token string (ends with `TOKEN=TOKEN`). */
export function buildConnectIpsLoginMessage(fields: {
  merchantId: string | number;
  appId: string;
  appName: string;
  txnId: string;
  txnDate: string;
  txnCrncy: string;
  txnAmt: number;
  referenceId: string;
  remarks: string;
  particulars: string;
}): string {
  return [
    `MERCHANTID=${fields.merchantId}`,
    `APPID=${fields.appId}`,
    `APPNAME=${fields.appName}`,
    `TXNID=${fields.txnId}`,
    `TXNDATE=${fields.txnDate}`,
    `TXNCRNCY=${fields.txnCrncy}`,
    `TXNAMT=${fields.txnAmt}`,
    `REFERENCEID=${fields.referenceId}`,
    `REMARKS=${fields.remarks}`,
    `PARTICULARS=${fields.particulars}`,
    "TOKEN=TOKEN",
  ].join(",");
}

/** validatetxn / gettxndetail token string. */
export function buildConnectIpsValidateMessage(fields: {
  merchantId: string | number;
  appId: string;
  referenceId: string;
  txnAmt: number;
}): string {
  return [
    `MERCHANTID=${fields.merchantId}`,
    `APPID=${fields.appId}`,
    `REFERENCEID=${fields.referenceId}`,
    `TXNAMT=${fields.txnAmt}`,
  ].join(",");
}

export function resolvePfxBuffer(pfx: Buffer | string): Buffer {
  if (Buffer.isBuffer(pfx)) return pfx;
  const trimmed = pfx.trim();
  if (trimmed.includes("BEGIN")) {
    throw new ConfigError(
      "connectips.pfx looks like PEM — use privateKeyPem instead",
    );
  }
  return Buffer.from(trimmed, "base64");
}
