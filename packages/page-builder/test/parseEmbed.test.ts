import { describe, expect, it } from "vitest";

import {
  isGoogleMapsEmbedSrc,
  parseEmbedInput,
  parseGoogleMapsEmbed,
} from "../src/blocks/parseEmbed";

describe("parseEmbed", () => {
  it("parses a raw https URL", () => {
    const parsed = parseEmbedInput("https://example.com/embed/1");
    expect(parsed?.src).toBe("https://example.com/embed/1");
  });

  it("rejects http URLs", () => {
    expect(parseEmbedInput("http://example.com/x")).toBeNull();
  });

  it("parses iframe HTML and keeps only https src", () => {
    const html = `<iframe src="https://www.youtube.com/embed/abc" width="560" height="315" title="Demo"></iframe>`;
    const parsed = parseEmbedInput(html);
    expect(parsed).toEqual({
      src: "https://www.youtube.com/embed/abc",
      width: "560",
      height: "315",
      title: "Demo",
    });
  });

  it("accepts Google Maps embed iframe", () => {
    const html = `<iframe src="https://www.google.com/maps/embed?pb=!1m18" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
    const parsed = parseGoogleMapsEmbed(html);
    expect(parsed?.src).toContain("google.com/maps/embed");
    expect(isGoogleMapsEmbedSrc(parsed!.src)).toBe(true);
  });

  it("keeps the full pb= query from a real Maps paste", () => {
    const html = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.263804174725!2d85.31580007525393!3d27.709140076181427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb1900fdd5f273%3A0xe62d634aca63bdf9!2sTri-Chandra%20Multiple%20Campus!5e0!3m2!1sen!2snp!4v1786205259791!5m2!1sen!2snp" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    const parsed = parseGoogleMapsEmbed(html);
    expect(parsed?.src.length).toBeGreaterThan(100);
    expect(parsed?.src).toContain("pb=!1m18");
    expect(parsed?.height).toBe("450");
  });

  it("rejects non-maps google URLs for map parser", () => {
    expect(
      parseGoogleMapsEmbed(
        '<iframe src="https://www.google.com/search?q=test"></iframe>',
      ),
    ).toBeNull();
  });
});
