/**
 * Phase 19 — signed dynamic import of a remote BlockDefinition module.
 *
 * Hard rules (ADR-12 / §24.3):
 * - Never `eval` / `new Function` of remote source
 * - Host must opt in: `allowSignedBlockImport: true` (default deny)
 * - URL must be https and origin-allowlisted
 * - Bytes must match SRI (`sha256|sha384|sha512-<base64>`) before `import()`
 * - Only then: blob-URL `import()` of the verified bytes → registerBlock
 */

import type { RegistrationCapabilities } from "./blockRegistrationGuard";
import { registerBlockGuarded } from "./blockRegistrationGuard";
import {
  isSignedBlockImportAllowed,
  type PageBuilderCapabilities,
} from "./capabilities";
import type { BlockRegistry } from "./registry";
import type { BlockDefinition } from "./types";

export type SignedBlockImportSpec = {
  /** https URL of an ESM module that exports a BlockDefinition */
  url: string;
  /** Subresource Integrity string, e.g. `sha384-…` */
  integrity: string;
  /**
   * Expected `definition.type` after load (must match export).
   * Prevents a tampered-but-hash-matched swap of a different type if CDN is confused.
   */
  expectedType?: string;
};

export type SignedBlockImportCapabilities = PageBuilderCapabilities &
  RegistrationCapabilities;

export type SignedImportFetch = (url: string) => Promise<Response>;

export type SignedImportModule = (
  moduleUrl: string,
) => Promise<Record<string, unknown>>;

export type RegisterSignedBlockOptions = {
  capabilities?: SignedBlockImportCapabilities;
  /** Allowed origins (e.g. `https://cdn.example.com`). Required — empty denies all. */
  allowedImportOrigins: readonly string[];
  fetch?: SignedImportFetch;
  /** Injectable for tests; defaults to dynamic `import()`. */
  importModule?: SignedImportModule;
  createObjectURL?: (blob: Blob) => string;
  revokeObjectURL?: (url: string) => void;
};

const SRI_RE = /^(sha256|sha384|sha512)-([A-Za-z0-9+/=]+)$/;

const ALGO_MAP = {
  sha256: "SHA-256",
  sha384: "SHA-384",
  sha512: "SHA-512",
} as const;

export const parseSriIntegrity = (
  integrity: string,
): { algo: keyof typeof ALGO_MAP; hashB64: string } | null => {
  const m = integrity.trim().match(SRI_RE);
  if (!m) return null;
  return {
    algo: m[1] as keyof typeof ALGO_MAP,
    hashB64: m[2]!,
  };
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  const maybeBuffer = (
    globalThis as unknown as {
      Buffer?: { from: (b: Uint8Array) => { toString: (e: string) => string } };
    }
  ).Buffer;
  if (maybeBuffer) {
    return maybeBuffer.from(bytes).toString("base64");
  }
  if (typeof globalThis.btoa !== "function") {
    throw new Error("registerSignedBlock: no base64 encoder available");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return globalThis.btoa(binary);
};

/** Verify module bytes against an SRI integrity string. */
export const verifyBytesIntegrity = async (
  bytes: BufferSource,
  integrity: string,
): Promise<{ ok: true } | { ok: false; reason: string }> => {
  const parsed = parseSriIntegrity(integrity);
  if (!parsed) {
    return {
      ok: false,
      reason: `invalid SRI integrity (expected sha256|sha384|sha512-<base64>)`,
    };
  }
  if (!globalThis.crypto?.subtle) {
    return { ok: false, reason: "Web Crypto subtle digest unavailable" };
  }
  const digest = await globalThis.crypto.subtle.digest(
    ALGO_MAP[parsed.algo],
    bytes,
  );
  const actual = bytesToBase64(new Uint8Array(digest));
  if (actual !== parsed.hashB64) {
    return { ok: false, reason: "integrity mismatch" };
  }
  return { ok: true };
};

/**
 * Host-controlled URL gate: https only + origin must be on the allow-list.
 * Origins compared as full origin strings (`https://cdn.example.com`).
 */
export const assertAllowedImportUrl = (
  url: string,
  allowedImportOrigins: readonly string[],
): { ok: true; url: URL } | { ok: false; reason: string } => {
  if (!allowedImportOrigins.length) {
    return { ok: false, reason: "allowedImportOrigins is empty" };
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, reason: "invalid URL" };
  }
  if (parsed.protocol !== "https:") {
    return { ok: false, reason: "URL must be https" };
  }
  const origin = parsed.origin;
  const allowed = allowedImportOrigins.some((o) => {
    try {
      return new URL(o).origin === origin;
    } catch {
      return o === origin;
    }
  });
  if (!allowed) {
    return {
      ok: false,
      reason: `origin ${origin} is not in allowedImportOrigins`,
    };
  }
  return { ok: true, url: parsed };
};

const isBlockDefinition = (value: unknown): value is BlockDefinition => {
  if (!value || typeof value !== "object") return false;
  const d = value as Record<string, unknown>;
  return (
    typeof d.type === "string" &&
    typeof d.label === "string" &&
    typeof d.render === "function" &&
    d.propsSchema != null &&
    (d.source === "tenant" || d.source === "plugin" || d.source === "core")
  );
};

export const extractBlockDefinition = (
  mod: Record<string, unknown>,
): BlockDefinition | null => {
  if (isBlockDefinition(mod.definition)) return mod.definition;
  if (isBlockDefinition(mod.default)) return mod.default;
  return null;
};

/**
 * Dynamic import trampoline — avoids bundlers statically analyzing a variable
 * specifier. Does NOT evaluate remote source text (SRI-verified blob URL only).
 */
const defaultImportModule: SignedImportModule = (moduleUrl) => {
  if (!moduleUrl.startsWith("blob:") && !moduleUrl.startsWith("https:")) {
    return Promise.reject(
      new Error("registerSignedBlock: import URL must be blob: or https:"),
    );
  }
  const run = new Function("url", "return import(url)") as (
    url: string,
  ) => Promise<Record<string, unknown>>;
  return run(moduleUrl);
};

/**
 * Fetch → SRI verify → blob `import()` → `registerBlock` (namespaced, guarded).
 * Throws on any failed gate — never registers unverified code.
 */
export const registerSignedBlock = async (
  registry: BlockRegistry,
  spec: SignedBlockImportSpec,
  options: RegisterSignedBlockOptions,
): Promise<BlockDefinition> => {
  if (!isSignedBlockImportAllowed(options.capabilities)) {
    throw new Error(
      "registerSignedBlock: allowSignedBlockImport must be explicitly true (Phase 19 default deny)",
    );
  }

  const urlGate = assertAllowedImportUrl(
    spec.url,
    options.allowedImportOrigins,
  );
  if (!urlGate.ok) {
    throw new Error(`registerSignedBlock: ${urlGate.reason}`);
  }

  const parsedSri = parseSriIntegrity(spec.integrity);
  if (!parsedSri) {
    throw new Error(
      "registerSignedBlock: integrity must be SRI (sha256|sha384|sha512-<base64>)",
    );
  }

  const fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
  if (!fetchImpl) {
    throw new Error("registerSignedBlock: fetch is unavailable");
  }

  const res = await fetchImpl(urlGate.url.toString());
  if (!res.ok) {
    throw new Error(
      `registerSignedBlock: fetch failed (${res.status} ${res.statusText})`,
    );
  }

  const bytes = await res.arrayBuffer();
  const verified = await verifyBytesIntegrity(bytes, spec.integrity);
  if (!verified.ok) {
    throw new Error(`registerSignedBlock: ${verified.reason}`);
  }

  const createObjectURL =
    options.createObjectURL ??
    (typeof URL !== "undefined" && URL.createObjectURL
      ? URL.createObjectURL.bind(URL)
      : undefined);
  const revokeObjectURL =
    options.revokeObjectURL ??
    (typeof URL !== "undefined" && URL.revokeObjectURL
      ? URL.revokeObjectURL.bind(URL)
      : undefined);

  if (!createObjectURL || !revokeObjectURL) {
    throw new Error("registerSignedBlock: blob URL APIs unavailable");
  }

  const blob = new Blob([new Uint8Array(bytes)], { type: "text/javascript" });
  const blobUrl = createObjectURL(blob);
  const importModule = options.importModule ?? defaultImportModule;

  let mod: Record<string, unknown>;
  try {
    mod = await importModule(blobUrl);
  } finally {
    revokeObjectURL(blobUrl);
  }

  const definition = extractBlockDefinition(mod);
  if (!definition) {
    throw new Error(
      "registerSignedBlock: module must export `definition` or `default` BlockDefinition",
    );
  }

  if (definition.source === "core") {
    throw new Error(
      'registerSignedBlock: remote modules cannot register source:"core"',
    );
  }

  if (spec.expectedType && definition.type !== spec.expectedType) {
    throw new Error(
      `registerSignedBlock: expected type "${spec.expectedType}" but module exported "${definition.type}"`,
    );
  }

  registerBlockGuarded(registry, definition, options.capabilities);
  return definition;
};
