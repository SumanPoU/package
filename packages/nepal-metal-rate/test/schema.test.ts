import { afterEach, describe, expect, it } from "vitest";
import {
  ApiOkLatestSchema,
  createMetalRateClient,
  PublicRateSchema,
} from "../src/index";
import {
  decryptMoney,
  encryptMoney,
  maskRateForLog,
  parseRatesFromHtml,
  parseTodayRates,
  rowIntegrityHash,
  verifyRowIntegrity,
} from "../src/server";

describe("public API contract", () => {
  it("accepts a latest payload", () => {
    const parsed = ApiOkLatestSchema.parse({
      ok: true,
      data: {
        date: "2026-07-31",
        metal: "GOLD",
        series: "DOMESTIC",
        gmRate: 243485,
        tolaRate: 284000,
        fetchedAt: "2026-07-31T03:00:00.000Z",
      },
    });
    expect(parsed.data?.metal).toBe("GOLD");
  });
});

describe("HTTP client with custom baseUrl", () => {
  afterEach(() => {
    // no shared state beyond fetch mock
  });

  it("calls user-provided API", async () => {
    const fetchMock: typeof fetch = async (input) => {
      const url = String(input);
      expect(url).toContain("https://api.example.com/v1/rates/latest");
      expect(url).toContain("metal=GOLD");
      return new Response(
        JSON.stringify({
          ok: true,
          data: {
            date: "2026-07-31",
            metal: "GOLD",
            series: "DOMESTIC",
            gmRate: 1,
            tolaRate: 11.66,
            fetchedAt: "2026-07-31T03:00:00.000Z",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const client = createMetalRateClient({
      baseUrl: "https://api.example.com/v1",
      fetch: fetchMock,
    });
    const row = await client.getLatest({ metal: "GOLD" });
    expect(row?.gmRate).toBe(1);
  });
});

describe("encrypt-at-rest", () => {
  it("round-trips money and verifies integrity", () => {
    process.env.METAL_RATE_ENCRYPTION_KEY =
      "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const enc = encryptMoney(243485.5);
    expect(enc.ciphertext.startsWith("v1.")).toBe(true);
    expect(decryptMoney(enc.ciphertext, enc.integrity)).toBe(243485.5);
    expect(maskRateForLog(243485.5)).toMatch(/\*/);

    const hash = rowIntegrityHash({
      dateIso: "2026-07-31",
      metal: "GOLD",
      series: "DOMESTIC",
      gmRate: 243485.5,
      tolaRate: 284000,
    });
    expect(
      verifyRowIntegrity(
        {
          dateIso: "2026-07-31",
          metal: "GOLD",
          series: "DOMESTIC",
          gmRate: 243485.5,
          tolaRate: 284000,
        },
        hash,
      ),
    ).toBe(true);
  });
});

describe("scrape helpers", () => {
  it("parses HTML cards", () => {
    const html = `
      <html><body>
        <h3>Fine Gold (9999)</h3>
        <p>per 10 grams</p>
        <p>Nrs 243485/-</p>
        <h3>Silver</h3>
        <p>per 10 grams</p>
        <p>Nrs 3695/-</p>
      </body></html>
    `;
    const entries = parseRatesFromHtml(html, new Date("2026-07-31T00:00:00Z"));
    expect(entries.find((e) => e.metal === "GOLD")?.gmRate).toBe(24348.5);
  });

  it("pairs today endpoint rows", () => {
    const entries = parseTodayRates(
      [
        {
          todayDate: "2026-07-30T05:56:57.755+00:00",
          rateType: "gold tola",
          todayBaseRatePerGram: 284000,
        },
        {
          todayDate: "2026-07-30T05:56:57.755+00:00",
          rateType: "gold gm",
          todayBaseRatePerGram: 243485,
        },
        {
          todayDate: "2026-07-30T05:56:57.755+00:00",
          rateType: "silver tola",
          todayBaseRatePerGram: 4310,
        },
        {
          todayDate: "2026-07-30T05:56:57.755+00:00",
          rateType: "silver gm",
          todayBaseRatePerGram: 3695,
        },
      ],
      new Date(),
    );
    expect(PublicRateSchema.safeParse({
      date: "2026-07-30",
      metal: "GOLD",
      series: "DOMESTIC",
      gmRate: entries.find((e) => e.metal === "GOLD")!.gmRate,
      tolaRate: entries.find((e) => e.metal === "GOLD")!.tolaRate,
      fetchedAt: new Date().toISOString(),
    }).success).toBe(true);
  });
});
