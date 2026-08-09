import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  assertAllowedImportUrl,
  type BlockDefinition,
  createRegistry,
  isSignedBlockImportAllowed,
  parseSriIntegrity,
  registerSignedBlock,
  verifyBytesIntegrity,
} from "../src/index";

const stubDef = (type = "tenant:remote-widget"): BlockDefinition => ({
  type,
  label: "Remote",
  category: "test",
  defaultProps: {},
  translatableProps: [],
  sharedProps: [],
  propsSchema: z.object({}).passthrough(),
  render: () => null,
  ContentFields: () => null,
  source: "tenant",
});

const sriSha256 = (bytes: Uint8Array): string => {
  const hash = createHash("sha256").update(bytes).digest("base64");
  return `sha256-${hash}`;
};

describe("Phase 19 signed block import", () => {
  it("defaults deny for allowSignedBlockImport", () => {
    expect(isSignedBlockImportAllowed(undefined)).toBe(false);
    expect(isSignedBlockImportAllowed({})).toBe(false);
    expect(isSignedBlockImportAllowed({ allowSignedBlockImport: false })).toBe(
      false,
    );
    expect(isSignedBlockImportAllowed({ allowSignedBlockImport: true })).toBe(
      true,
    );
  });

  it("parses SRI integrity strings", () => {
    expect(parseSriIntegrity("sha256-abc=")?.algo).toBe("sha256");
    expect(parseSriIntegrity("not-sri")).toBeNull();
  });

  it("gates URL to https + allow-listed origins", () => {
    expect(
      assertAllowedImportUrl("https://cdn.example.com/a.js", [
        "https://cdn.example.com",
      ]).ok,
    ).toBe(true);
    expect(
      assertAllowedImportUrl("http://cdn.example.com/a.js", [
        "https://cdn.example.com",
      ]).ok,
    ).toBe(false);
    expect(
      assertAllowedImportUrl("https://evil.example/a.js", [
        "https://cdn.example.com",
      ]).ok,
    ).toBe(false);
    expect(assertAllowedImportUrl("https://cdn.example.com/a.js", []).ok).toBe(
      false,
    );
  });

  it("verifies matching bytes and rejects mismatch", async () => {
    const body = new TextEncoder().encode("export const x = 1;\n");
    const integrity = sriSha256(body);
    const ok = await verifyBytesIntegrity(body.buffer, integrity);
    expect(ok).toEqual({ ok: true });

    const bad = await verifyBytesIntegrity(
      new TextEncoder().encode("tampered").buffer,
      integrity,
    );
    expect(bad.ok).toBe(false);
  });

  it("refuses registerSignedBlock without explicit capability", async () => {
    const registry = createRegistry();
    await expect(
      registerSignedBlock(
        registry,
        {
          url: "https://cdn.example.com/widget.js",
          integrity: "sha256-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=",
        },
        { allowedImportOrigins: ["https://cdn.example.com"] },
      ),
    ).rejects.toThrow(/allowSignedBlockImport must be explicitly true/);
  });

  it("registers after SRI verify + injected import (never eval)", async () => {
    const registry = createRegistry();
    const def = stubDef("tenant:signed-callout");
    const payload = new TextEncoder().encode(
      "// verified remote module (bytes only — import is injected in test)\n",
    );
    const integrity = sriSha256(payload);

    const fetchMock = vi.fn(
      async () =>
        new Response(payload, {
          status: 200,
          headers: { "Content-Type": "text/javascript" },
        }),
    );

    const importModule = vi.fn(async () => ({ definition: def }));
    const createObjectURL = vi.fn(() => "blob:test-module");
    const revokeObjectURL = vi.fn();

    const registered = await registerSignedBlock(
      registry,
      {
        url: "https://cdn.example.com/blocks/callout.js",
        integrity,
        expectedType: "tenant:signed-callout",
      },
      {
        capabilities: { allowSignedBlockImport: true },
        allowedImportOrigins: ["https://cdn.example.com"],
        fetch: fetchMock,
        importModule,
        createObjectURL,
        revokeObjectURL,
      },
    );

    expect(registered.type).toBe("tenant:signed-callout");
    expect(registry.has("tenant:signed-callout")).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(importModule).toHaveBeenCalledWith("blob:test-module");
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test-module");
  });

  it("rejects integrity mismatch before import", async () => {
    const registry = createRegistry();
    const payload = new TextEncoder().encode("export default {};\n");
    const importModule = vi.fn();

    await expect(
      registerSignedBlock(
        registry,
        {
          url: "https://cdn.example.com/x.js",
          integrity: sriSha256(new TextEncoder().encode("other")),
        },
        {
          capabilities: { allowSignedBlockImport: true },
          allowedImportOrigins: ["https://cdn.example.com"],
          fetch: async () => new Response(payload, { status: 200 }),
          importModule,
          createObjectURL: () => "blob:x",
          revokeObjectURL: () => {},
        },
      ),
    ).rejects.toThrow(/integrity mismatch/);

    expect(importModule).not.toHaveBeenCalled();
  });

  it("rejects disallowed origin before fetch", async () => {
    const registry = createRegistry();
    const fetchMock = vi.fn();
    await expect(
      registerSignedBlock(
        registry,
        {
          url: "https://evil.example/x.js",
          integrity: "sha256-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa=",
        },
        {
          capabilities: { allowSignedBlockImport: true },
          allowedImportOrigins: ["https://cdn.example.com"],
          fetch: fetchMock,
        },
      ),
    ).rejects.toThrow(/not in allowedImportOrigins/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects remote source:core modules", async () => {
    const registry = createRegistry();
    const def = stubDef("tenant:x");
    def.source = "core";
    const payload = new TextEncoder().encode("module");
    await expect(
      registerSignedBlock(
        registry,
        { url: "https://cdn.example.com/x.js", integrity: sriSha256(payload) },
        {
          capabilities: { allowSignedBlockImport: true },
          allowedImportOrigins: ["https://cdn.example.com"],
          fetch: async () => new Response(payload, { status: 200 }),
          importModule: async () => ({ definition: def }),
          createObjectURL: () => "blob:x",
          revokeObjectURL: () => {},
        },
      ),
    ).rejects.toThrow(/cannot register source:"core"/);
  });
});
