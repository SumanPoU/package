"use client";

import { ExampleDemo } from "@/components/example-demo";
import { InstallCommand } from "@/components/install-command";

import {
  CLIENT_API,
  NRB_EXAMPLE_REQUEST,
  NRB_EXAMPLE_SUCCESS,
  NRB_EXAMPLE_VALIDATION_ERROR,
  NRB_PAGINATION,
  NRB_PAYLOAD_DAY,
  NRB_PAYLOAD_RATE,
  NRB_RATE_PARAMS,
  NRB_RESPONSE_ROOT,
  NRB_STATUS_CODES,
  RATE_FIELDS,
} from "./api-reference";
import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  PropsTable,
} from "./docs-ui";
import {
  CONVERT_EXAMPLE_CODE,
  ConvertExample,
  CURRENCIES_EXAMPLE_CODE,
  CurrenciesExample,
  ForexRatesBoard,
  HISTORY_EXAMPLE_CODE,
  HistoryExample,
  RATES_BOARD_CODE,
} from "./examples";
import { DOC_NAV } from "./nav";

const STARTER = `import {
  getRate,
  getRatesForDate,
  convert,
  createNrbForexClient,
} from "@itzsa/nrb-forex";

const usd = await getRate("USD"); // today (UTC)
const all = await getRatesForDate("2026-07-17");

// Unit-aware: 100 INR → NPR on buy side
const npr = await convert(100, "INR", "NPR", {
  date: "2026-07-17",
  side: "buy",
});

const client = createNrbForexClient({ fallbackToPreviousDay: true });
await client.getRate("USD", "2026-07-19");`;

const CACHE = `import {
  createNrbForexClient,
  type ForexCache,
} from "@itzsa/nrb-forex";

const redisCache: ForexCache = {
  async get(key) { /* redis.get */ },
  async set(key, value, ttlMs) { /* redis.set */ },
  async has(key) { /* … */ },
};

const client = createNrbForexClient({ cache: redisCache });`;

const NODE = `import { syncDailyRates } from "@itzsa/nrb-forex/node";

await syncDailyRates({
  write: async (snapshot) => {
    // upsert snapshot.rates into DB / Redis
  },
});

// CLI
// npx nrb-forex USD 2026-07-17
// npx nrb-forex USD 2026-07-19 --fallback`;

export function DocsContent() {
  return (
    <DocsShell>
      <div className="flex flex-col gap-8 sm:gap-14">
        <header
          id="introduction"
          className="scroll-mt-28 flex flex-col gap-3 border-b-[0.5px] border-border pb-6 sm:pb-8"
        >
          <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
            Documentation · itzsa
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-primary sm:text-4xl">
            NRB Forex
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            Typed client for Nepal Rastra Bank’s public forex API — fetch,
            cache, and convert foreign currency → NPR with correct{" "}
            <code className="font-mono text-primary">unit</code> handling. No
            React required.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-secondary">
            <span className="pkg rounded-md border-[0.5px] border-border bg-card px-2 py-1 text-[12px]">
              @itzsa/nrb-forex
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              headless
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              Node 18+ / browser
            </span>
          </div>
          <Callout title="Unofficial">
            Not affiliated with or endorsed by Nepal Rastra Bank. Rates follow
            NRB’s publication schedule and API availability. Upstream docs:{" "}
            <a
              href="https://www.nrb.org.np/forex/"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              NRB Forex
            </a>
            .
          </Callout>
        </header>

        <nav aria-label="Jump to" className="flex flex-wrap gap-2 lg:hidden">
          {DOC_NAV.filter((n) => !n.indent).map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-md border-[0.5px] border-border bg-card px-2.5 py-1 text-xs text-secondary hover:text-accent"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <DocSection
          id="installation"
          title="Installation"
          description="Zero runtime dependencies. Uses native fetch (Node 18+)."
        >
          <InstallCommand packages="@itzsa/nrb-forex" />
        </DocSection>

        <DocSection
          id="quick-start"
          title="Quick start"
          description="Module helpers use a default client; create your own for Redis or custom fetch."
        >
          <CodeBlock code={STARTER} />
        </DocSection>

        <DocSection
          id="nrb-api"
          title="NRB Forex API (V1)"
          description="Official upstream contract this package wraps. Published typically once per business day."
        >
          <div className="overflow-x-auto rounded-lg border-[0.5px] border-border bg-card shadow-[0_1px_0_color-mix(in_oklab,var(--border)_80%,transparent)]">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <tbody className="text-secondary">
                <tr className="border-b-[0.5px] border-border">
                  <td className="px-3 py-2.5 font-medium text-primary">
                    Base URL
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[12px] text-primary">
                    https://www.nrb.org.np/api/forex/v1/
                  </td>
                </tr>
                <tr className="border-b-[0.5px] border-border">
                  <td className="px-3 py-2.5 font-medium text-primary">
                    Endpoint
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[12px] text-primary">
                    GET /rates
                  </td>
                </tr>
                <tr className="border-b-[0.5px] border-border">
                  <td className="px-3 py-2.5 font-medium text-primary">
                    Full URL
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[12px] break-all">
                    https://www.nrb.org.np/api/forex/v1/rates
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-medium text-primary">
                    Empty days
                  </td>
                  <td className="px-3 py-2.5">
                    Weekends/holidays may return{" "}
                    <code className="font-mono text-[12px] text-primary">
                      payload: null
                    </code>{" "}
                    — use{" "}
                    <code className="font-mono text-[12px] text-primary">
                      fallbackToPreviousDay
                    </code>{" "}
                    in this client.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <DocSection
            id="nrb-rates"
            level={3}
            title="GET /rates"
            description="Returns foreign exchange rates for a given date range. All four query parameters are required."
          >
            <PropsTable rows={NRB_RATE_PARAMS} caption="Query parameters" />
            <CodeBlock code={NRB_EXAMPLE_REQUEST} language="http" />
            <Callout title="Unit quirk">
              Buy/sell are quoted per{" "}
              <code className="font-mono text-primary">currency.unit</code>{" "}
              foreign units — not always per 1. INR/KRW are often{" "}
              <code className="font-mono text-primary">100</code>; JPY often{" "}
              <code className="font-mono text-primary">10</code>. Prefer{" "}
              <code className="font-mono text-primary">convert</code> so you do
              not forget to divide.
            </Callout>
          </DocSection>

          <DocSection
            id="nrb-response"
            level={3}
            title="Response shape"
            description="Top-level envelope, daily payload, and per-currency rate objects."
          >
            <PropsTable rows={NRB_RESPONSE_ROOT} caption="Root fields" />
            <PropsTable rows={NRB_PAYLOAD_DAY} caption="data.payload[] day" />
            <PropsTable
              rows={NRB_PAYLOAD_RATE}
              caption="data.payload[].rates[]"
            />
            <PropsTable rows={NRB_PAGINATION} caption="pagination" />
            <CodeBlock code={NRB_EXAMPLE_SUCCESS} language="json" />
          </DocSection>

          <DocSection
            id="nrb-errors"
            level={3}
            title="Status & errors"
            description="Body status.code mirrors HTTP-style outcomes. Validation failures return 400 with field messages."
          >
            <PropsTable rows={NRB_STATUS_CODES} caption="status.code" />
            <CodeBlock code={NRB_EXAMPLE_VALIDATION_ERROR} language="json" />
            <Callout title="Browser / CORS">
              The official NRB host does not send CORS headers. Docs demos call{" "}
              <code className="font-mono text-primary">/api/nrb-forex</code>{" "}
              (same query shape). Node and server runtimes can hit NRB directly.
            </Callout>
          </DocSection>
        </DocSection>

        <DocSection
          id="api"
          title="Package API"
          description="Typed helpers over the NRB V1 rates endpoint."
        >
          <PropsTable rows={CLIENT_API} caption="Client helpers" />
          <DocSection id="convert" level={3} title="Convert & units">
            <PropsTable rows={RATE_FIELDS} caption="ForexRate" />
            <Callout title="Math">
              NPR = amount × (buy|sell|mid) / unit. Prefer{" "}
              <code className="font-mono text-primary">convert</code> or{" "}
              <code className="font-mono text-primary">perUnitRates</code>.
            </Callout>
          </DocSection>
          <DocSection id="cache" level={3} title="Caching">
            <CodeBlock code={CACHE} />
          </DocSection>
          <DocSection
            id="errors"
            level={3}
            title="Errors"
            description="NrbValidationError · NrbApiError · NrbRateNotFoundError — network retries up to 3×."
          >
            <Callout title="Mapped from NRB">
              Missing params or empty ranges surface as typed errors; this
              client also paginates{" "}
              <code className="font-mono text-primary">getRatesInRange</code>{" "}
              for you.
            </Callout>
          </DocSection>
        </DocSection>

        <DocSection
          id="examples"
          title="Examples"
          description="Live via the docs proxy. NRB publishes ~22 ISO currencies (not every ISO 4217 code)."
        >
          <DocSection
            id="example-rates"
            level={3}
            title="Latest rates"
            description="Every currency for the day — date picker, multi-select popover, Buy / Sell / Mid."
          >
            <ExampleDemo
              code={RATES_BOARD_CODE}
              size="xl"
              previewClassName="overflow-x-auto overflow-y-visible bg-muted/40"
            >
              <ForexRatesBoard />
            </ExampleDemo>
          </DocSection>
          <DocSection id="example-convert" level={3} title="Convert to NPR">
            <ExampleDemo
              code={CONVERT_EXAMPLE_CODE}
              previewClassName="bg-muted/40"
            >
              <ConvertExample />
            </ExampleDemo>
          </DocSection>
          <DocSection
            id="example-history"
            level={3}
            title="Rate history"
            description="Pick currency, from, and to — getRateHistory with Buy / Sell."
          >
            <ExampleDemo
              code={HISTORY_EXAMPLE_CODE}
              size="lg"
              previewClassName="bg-muted/40"
            >
              <HistoryExample />
            </ExampleDemo>
          </DocSection>
          <DocSection
            id="example-currencies"
            level={3}
            title="Published currencies"
            description="All NRB currencies for a date with Unit / Buy / Sell / Mid."
          >
            <ExampleDemo
              code={CURRENCIES_EXAMPLE_CODE}
              size="lg"
              previewClassName="bg-muted/40"
            >
              <CurrenciesExample />
            </ExampleDemo>
          </DocSection>
        </DocSection>

        <DocSection
          id="node"
          title="Node / CLI"
          description="Nightly sync helper and npx CLI."
        >
          <CodeBlock code={NODE} />
        </DocSection>
      </div>
    </DocsShell>
  );
}
