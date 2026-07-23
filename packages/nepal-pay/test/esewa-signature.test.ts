import { describe, expect, it } from "vitest";
import {
  buildSignedMessage,
  sign,
  signInitiatePayload,
  verifySignature,
} from "../src/gateways/esewa/signature";
import {
  ESEWA_UAT_SECRET_KEY,
  ESEWA_UAT_SECRET_KEY_DOCS_TYPO,
} from "../src/gateways/esewa/uat";

/**
 * Live sandbox accepts this secret (verified: POST → 302 to /epay?bookingId=…).
 * Official HTML form sample signature also matches this key.
 */
const UAT_SECRET = ESEWA_UAT_SECRET_KEY;

describe("esewa signature", () => {
  it("matches the official HTML form sample (total_amount=110, uuid=241028)", () => {
    // From developer.esewa.com.np form example — ground truth for UAT.
    const message =
      "total_amount=110,transaction_uuid=241028,product_code=EPAYTEST";
    expect(sign(message, UAT_SECRET)).toBe(
      "i94zsd3oXF6ZsSr/kGqT4sSzYQzjj1W/waxjWyRwaME=",
    );
  });

  it("round-trips initiate sign helper", () => {
    const { signature, signedFieldNames } = signInitiatePayload(
      110,
      "241028",
      "EPAYTEST",
      UAT_SECRET,
    );
    expect(signedFieldNames).toBe("total_amount,transaction_uuid,product_code");
    expect(signature).toBe("i94zsd3oXF6ZsSr/kGqT4sSzYQzjj1W/waxjWyRwaME=");
  });

  it("FLAGS DOCS TYPO: trailing '(' in secret causes ES104 on sandbox", () => {
    const message =
      "total_amount=110,transaction_uuid=241028,product_code=EPAYTEST";
    const withTypo = sign(message, ESEWA_UAT_SECRET_KEY_DOCS_TYPO);
    const correct = sign(message, UAT_SECRET);
    expect(withTypo).not.toBe(correct);
    expect(correct).toBe("i94zsd3oXF6ZsSr/kGqT4sSzYQzjj1W/waxjWyRwaME=");
    // Official "Result" sample for total_amount=100 also does not match either key —
    // treat HTML form sample as authoritative, not the Result blurb.
  });

  it("round-trips verify for a callback-style payload", () => {
    const fields = {
      transaction_code: "000AWEO",
      status: "COMPLETE",
      total_amount: 1000.0,
      transaction_uuid: "250610-162413",
      product_code: "EPAYTEST",
      signed_field_names:
        "transaction_code,status,total_amount,transaction_uuid,product_code",
    };
    const names = fields.signed_field_names.split(",");
    const message = buildSignedMessage(fields, names);
    const signature = sign(message, UAT_SECRET);

    expect(
      verifySignature(
        { ...fields, signature },
        fields.signed_field_names,
        signature,
        UAT_SECRET,
      ),
    ).toBe(true);
  });

  it("rejects a tampered signature", () => {
    const fields = {
      transaction_code: "000AWEO",
      status: "COMPLETE",
      total_amount: 1000.0,
      transaction_uuid: "250610-162413",
      product_code: "EPAYTEST",
      signed_field_names:
        "transaction_code,status,total_amount,transaction_uuid,product_code",
    };
    expect(
      verifySignature(
        fields,
        fields.signed_field_names,
        "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
        UAT_SECRET,
      ),
    ).toBe(false);
  });
});
