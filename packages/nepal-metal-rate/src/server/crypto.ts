/**
 * @fileoverview Encrypt-at-rest for rate values + integrity HMAC.
 *
 * Plaintext rates never sit in Postgres. Columns store AES-256-GCM ciphertext
 * and an HMAC so tampering is detectable. Decryption only happens in memory
 * inside the server API before JSON responses.
 *
 * Env: `METAL_RATE_ENCRYPTION_KEY` — 64-char hex (32 bytes) or any passphrase
 * (scrypt-derived). Never commit the key.
 */

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;
const KEY_LEN = 32;
const VERSION = "v1";

export type EncryptedMoney = {
  /** `v1.<iv>.<tag>.<ciphertext>` all base64url */
  ciphertext: string;
  /** HMAC-SHA256 hex over canonical plaintext fields */
  integrity: string;
};

const getMasterKey = (): Buffer => {
  const raw = process.env.METAL_RATE_ENCRYPTION_KEY;
  if (!raw || raw.trim().length < 16) {
    throw new Error(
      "METAL_RATE_ENCRYPTION_KEY is required (min 16 chars, prefer 64-char hex)",
    );
  }
  const trimmed = raw.trim();
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, "hex");
  }
  return scryptSync(trimmed, "itzsa-nepal-metal-rate-v1", KEY_LEN);
};

const b64url = (buf: Buffer): string =>
  buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const fromB64url = (s: string): Buffer => {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64");
};

/** Mask a number for logs — never log full rates. */
export const maskRateForLog = (n: number): string => {
  if (!Number.isFinite(n)) return "[invalid]";
  const s = n.toFixed(2);
  if (s.length <= 4) return "****";
  return `${s.slice(0, 2)}***${s.slice(-2)}`;
};

export const encryptMoney = (amount: number): EncryptedMoney => {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("encryptMoney: invalid amount");
  }
  const key = getMasterKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const plain = Buffer.from(amount.toFixed(2), "utf8");
  const enc = Buffer.concat([cipher.update(plain), cipher.final()]);
  const tag = cipher.getAuthTag();
  const ciphertext = `${VERSION}.${b64url(iv)}.${b64url(tag)}.${b64url(enc)}`;
  const integrity = createHmac("sha256", key)
    .update(`money:${amount.toFixed(2)}`)
    .digest("hex");
  return { ciphertext, integrity };
};

export const decryptMoney = (
  ciphertext: string,
  integrity: string,
): number => {
  const key = getMasterKey();
  const parts = ciphertext.split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("decryptMoney: unsupported ciphertext format");
  }
  const iv = fromB64url(parts[1]!);
  const tag = fromB64url(parts[2]!);
  const data = fromB64url(parts[3]!);
  if (iv.length !== IV_LEN || tag.length !== TAG_LEN) {
    throw new Error("decryptMoney: corrupt ciphertext");
  }
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
  const amount = Number.parseFloat(plain);
  if (!Number.isFinite(amount)) {
    throw new Error("decryptMoney: invalid plaintext");
  }
  const expected = createHmac("sha256", key)
    .update(`money:${amount.toFixed(2)}`)
    .digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(integrity, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("decryptMoney: integrity check failed");
  }
  return amount;
};

/** Row-level integrity over date|metal|series|gm|tola. */
export const rowIntegrityHash = (parts: {
  dateIso: string;
  metal: string;
  series: string;
  gmRate: number;
  tolaRate: number;
}): string => {
  const key = getMasterKey();
  const canonical = [
    parts.dateIso,
    parts.metal,
    parts.series,
    parts.gmRate.toFixed(2),
    parts.tolaRate.toFixed(2),
  ].join("|");
  return createHmac("sha256", key).update(canonical).digest("hex");
};

export const verifyRowIntegrity = (
  parts: {
    dateIso: string;
    metal: string;
    series: string;
    gmRate: number;
    tolaRate: number;
  },
  hash: string,
): boolean => {
  const expected = rowIntegrityHash(parts);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
};
