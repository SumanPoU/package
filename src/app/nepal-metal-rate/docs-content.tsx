"use client";

import { InstallCommand } from "@/components/install-command";

import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  PropsTable,
} from "./docs-ui";
import { DOC_NAV } from "./nav";

const CLIENT = `import {
  createMetalRateClient,
  getLatestRate,
} from "@itzsa/nepal-metal-rate";

// Default — itzsa hosted API
const gold = await getLatestRate({ metal: "GOLD" });

// Bring your own compatible API
const mine = createMetalRateClient({
  baseUrl: "https://api.mycompany.com/metal-rates/v1",
  apiKey: process.env.MY_API_KEY,
});
await mine.getHistory({
  metal: "SILVER",
  from: "2026-07-01",
  to: "2026-07-31",
});`;

const SERVER = `import { runDailyIngest } from "@itzsa/nepal-metal-rate/server";

// Cron handler (Node only)
await runDailyIngest();
// → scrape/API → encrypt → Postgres → IngestLog`;

const API_ROWS = [
  {
    name: "createMetalRateClient",
    type: "(opts?) => Client",
    description: "HTTP client; baseUrl defaults to itzsa API; pass your own",
  },
  {
    name: "getLatestRate",
    type: "({ metal, series? }) => Promise<PublicRate | null>",
    description: "Latest rate via default client",
  },
  {
    name: "getRateHistory",
    type: "({ metal, from, to, series? }) => Promise<PublicRate[]>",
    description: "History via default client",
  },
  {
    name: "runDailyIngest (server)",
    type: "() => Promise<RunDailyIngestResult>",
    description: "Cron: ingest + encrypt upsert + audit log",
  },
];

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
            Metal Rate
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            Call <strong>our</strong> metal-rate API (or your compatible
            backend) from the npm client. Cron scrapes FeNeGoSiDA / their JSON
            API, stores rates <strong>encrypted</strong> in our DB, and the
            public API decrypts only for responses.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-secondary">
            <span className="pkg rounded-md border-[0.5px] border-border bg-card px-2 py-1 text-[12px]">
              @itzsa/nepal-metal-rate
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              + /server
            </span>
          </div>
          <Callout title="Unofficial">
            Attribute rates to{" "}
            <a
              href="https://www.fenegosida.org/"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline-offset-2 hover:underline"
            >
              FeNeGoSiDA
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

        <DocSection id="installation" title="Installation">
          <InstallCommand packages="@itzsa/nepal-metal-rate" />
        </DocSection>

        <DocSection
          id="quick-start"
          title="Quick start (client)"
          description="Apps fetch from itzsa API by default — or pass baseUrl for your own."
        >
          <CodeBlock code={CLIENT} />
        </DocSection>

        <DocSection
          id="sources"
          title="Ingest sources (server)"
          description="weekly-chart-api → html-scraper. Extensible RateSource plugins."
        >
          <CodeBlock code={SERVER} />
          <DocSection
            id="pipeline"
            title="Encrypt-at-rest"
            description="AES-256-GCM + HMAC. Plaintext rates never sit in Postgres."
            level={3}
          >
            <Callout>
              Set <code className="font-mono text-primary">METAL_RATE_ENCRYPTION_KEY</code>.
              API routes decrypt in memory only.
            </Callout>
          </DocSection>
          <DocSection
            id="extending"
            title="Your own API"
            description="Implement GET /rates/latest and GET /rates — then point the client baseUrl at it."
            level={3}
          >
            <p className="text-sm text-secondary">
              Hosted paths:{" "}
              <code className="font-mono text-primary">
                /api/nepal-metal-rate/v1/rates/latest
              </code>{" "}
              and{" "}
              <code className="font-mono text-primary">
                /api/nepal-metal-rate/v1/rates
              </code>
              .
            </p>
          </DocSection>
        </DocSection>

        <DocSection
          id="persistence"
          title="Persistence"
          description="Unique (date, metal, series). Ciphertext columns + rowIntegrity HMAC."
        />

        <DocSection
          id="cron"
          title="Cron"
          description="GET /api/cron/ingest with Bearer CRON_SECRET. Schedule 0 3 * * * UTC ≈ 08:45 NST."
        />

        <DocSection
          id="security"
          title="Security"
          description="Encryption key, cron secret, optional METAL_RATE_API_KEY for reads, sanitized IngestLog."
        />

        <DocSection id="api" title="Package API">
          <PropsTable rows={API_ROWS} caption="Public exports" />
        </DocSection>
      </div>
    </DocsShell>
  );
}
