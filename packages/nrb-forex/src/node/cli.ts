/**
 * Minimal CLI: `npx nrb-forex USD 2026-07-18`
 * Prints JSON ForexRate to stdout.
 */
import { createNrbForexClient } from "../client";
import { NrbForexError } from "../errors";
import { perUnitRates } from "../parse";

async function main(argv: string[]): Promise<void> {
  const currency = argv[0] ?? "USD";
  const date = argv[1];
  const fallback = argv.includes("--fallback");

  const client = createNrbForexClient({
    fallbackToPreviousDay: fallback,
  });

  const rate = await client.getRate(currency, date, {
    fallbackToPreviousDay: fallback,
  });
  const per = perUnitRates(rate);

  const out = {
    ...rate,
    perUnit: per,
  };
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
}

main(process.argv.slice(2)).catch((err: unknown) => {
  const message =
    err instanceof NrbForexError
      ? `${err.name}: ${err.message}`
      : err instanceof Error
        ? err.message
        : String(err);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
