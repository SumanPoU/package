"use client";

import { InstallCommand } from "@/components/install-command";

import {
  ARITHMETIC_API,
  CALENDAR_API,
  CONVERT_API,
  ENGINE_API,
  FORMAT_API,
  HOLIDAY_API,
  VALIDATE_API,
} from "./api-reference";
import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  PropsTable,
} from "./docs-ui";
import { AgeExample, ConvertExample, HolidaysExample } from "./examples";
import { DOC_NAV } from "./nav";

const STARTER = `import {
  adToBs,
  bsToAd,
  addDays,
  addMonths,
  diffInBsYears,
  formatBs,
  toNepaliNumerals,
  isPublicHoliday,
  createBsDateEngine,
} from "@itzsa/bs-date";

adToBs("2025-04-14"); // { year: 2082, month: 1, day: 1 }
bsToAd("2080-10-15");

addDays("2082-01-30", 5);
diffInBsYears("2082-01-01", "2070-05-15"); // age-style years

formatBs("2082-01-05", "DD MMMM YYYY", { locale: "ne" });
toNepaliNumerals(2082); // "२०८२"

isPublicHoliday("2082-01-01");`;

const ENGINE = `import {
  createBsDateEngine,
  extendCalendarData,
  DEFAULT_CALENDAR_DATA,
} from "@itzsa/bs-date";

// Isolated: no shared holiday mutation across tenants / workers
const payroll = createBsDateEngine({
  holidays: {
    asOf: "org-2082",
    yearRange: { min: 2082, max: 2082 },
    entries: [
      { year: 2082, month: 6, day: 12, nameEn: "Dashain", nameNe: "दशैं" },
    ],
  },
});

payroll.isPublicHoliday("2082-06-12"); // true
payroll.adToBs("2025-04-14");

// Extend month-length tables past the bundled max year
const wider = extendCalendarData(DEFAULT_CALENDAR_DATA, {
  2101: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
});
const future = createBsDateEngine({ calendar: wider });`;

const HOLIDAYS = `import {
  setHolidayCalendar,
  mergeHolidayCalendars,
  DEFAULT_HOLIDAY_CALENDAR,
  type HolidayCalendar,
} from "@itzsa/bs-date";

const org: HolidayCalendar = {
  asOf: "2082 HR",
  yearRange: { min: 2082, max: 2082 },
  entries: [
    { year: 2082, month: 1, day: 1, nameEn: "New Year", nameNe: "नयाँ वर्ष" },
  ],
};

// Module API — process-global (fine for single-tenant apps)
setHolidayCalendar(mergeHolidayCalendars(DEFAULT_HOLIDAY_CALENDAR, org));

// Prefer createBsDateEngine({ holidays }) in servers / multi-tenant.`;

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
            BS Date
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            Headless Bikram Sambat date logic — convert, arithmetic, format, and
            swappable holidays. No React, no CSS, no picker. Pair with{" "}
            <a href="/nepali-datepicker" className="text-accent hover:underline">
              @itzsa/nepali-datepicker
            </a>{" "}
            when you need UI.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-secondary">
            <span className="pkg rounded-md border-[0.5px] border-border bg-card px-2 py-1 text-[12px]">
              @itzsa/bs-date
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              headless
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              BS 2000–2100
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              en / ne
            </span>
          </div>
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
          description="Zero runtime dependencies. Works in Node, browsers, and edge runtimes."
        >
          <InstallCommand packages="@itzsa/bs-date" />
        </DocSection>

        <DocSection
          id="quick-start"
          title="Quick start"
          description="Module-level helpers share one default calendar and a process-global holiday set."
        >
          <CodeBlock code={STARTER} />
        </DocSection>

        <DocSection
          id="convert"
          title="Convert"
          description="AD ↔ BS using community-verified Panchanga month lengths."
        >
          <PropsTable rows={CONVERT_API} caption="Convert" />
        </DocSection>

        <DocSection
          id="arithmetic"
          title="Arithmetic"
          description="Day/month/year math with clamp semantics; age helpers for HR and forms."
        >
          <PropsTable rows={ARITHMETIC_API} caption="Arithmetic" />
        </DocSection>

        <DocSection
          id="calendar"
          title="Calendar"
          description="Month bounds, weekdays, and compare."
        >
          <PropsTable rows={CALENDAR_API} caption="Calendar" />
        </DocSection>

        <DocSection
          id="format"
          title="Format"
          description="Pattern tokens plus Nepali numerals and month names."
        >
          <PropsTable rows={FORMAT_API} caption="Format" />
        </DocSection>

        <DocSection
          id="holidays"
          title="Holidays"
          description="Bundled list is sample data — override for payroll or bank calendars. Lookups are indexed O(1)."
        >
          <CodeBlock code={HOLIDAYS} />
          <PropsTable rows={HOLIDAY_API} caption="Holidays" />
          <Callout title="Scalability">
            Module setters mutate process state. Use{" "}
            <code className="font-mono text-primary">createBsDateEngine</code>{" "}
            when multiple holiday sets must coexist (multi-tenant APIs, workers).
          </Callout>
        </DocSection>

        <DocSection
          id="engine"
          title="Engine & scale"
          description="Pluggable calendar tables and isolated engines keep the library robust beyond a single global config."
        >
          <DocSection
            id="engine-isolated"
            level={3}
            title="Isolated engines"
            description="Own calendar + holiday index — no cross-request leakage."
          >
            <CodeBlock code={ENGINE} />
          </DocSection>
          <DocSection
            id="engine-calendar"
            level={3}
            title="Extend calendar"
            description="Ship extra year rows without forking. Epoch must stay consistent if you change minYear."
          >
            <PropsTable rows={ENGINE_API} caption="Engine / registry" />
          </DocSection>
        </DocSection>

        <DocSection
          id="examples"
          title="Examples"
          description="Live against the workspace package."
        >
          <DocSection id="example-convert" level={3} title="Convert live">
            <ConvertExample />
          </DocSection>
          <DocSection id="example-age" level={3} title="Age / tenure">
            <AgeExample />
          </DocSection>
          <DocSection id="example-holidays" level={3} title="Month holidays">
            <HolidaysExample />
          </DocSection>
        </DocSection>

        <DocSection
          id="api"
          title="API reference"
          description="Validation and error types."
        >
          <PropsTable rows={VALIDATE_API} caption="Validation" />
        </DocSection>

        <DocSection
          id="limits"
          title="Data & limits"
          description="What ships in the box — and what you should override."
        >
          <div className="overflow-x-auto rounded-md border-[0.5px] border-border bg-card">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-[0.5px] border-border">
                  <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
                    Topic
                  </th>
                  <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody className="text-secondary">
                <tr className="border-b-[0.5px] border-border">
                  <td className="px-3 py-2.5 font-medium text-primary">
                    BS year range
                  </td>
                  <td className="px-3 py-2.5">
                    2000–2100 inclusive (extend via{" "}
                    <code className="font-mono text-[12px] text-primary">
                      extendCalendarData
                    </code>
                    )
                  </td>
                </tr>
                <tr className="border-b-[0.5px] border-border">
                  <td className="px-3 py-2.5 font-medium text-primary">Epoch</td>
                  <td className="px-3 py-2.5">
                    BS 2000-01-01 ↔ AD 1943-04-14
                  </td>
                </tr>
                <tr className="border-b-[0.5px] border-border">
                  <td className="px-3 py-2.5 font-medium text-primary">
                    Timezones
                  </td>
                  <td className="px-3 py-2.5">
                    Civil-day math only;{" "}
                    <code className="font-mono text-[12px] text-primary">
                      bsToAd
                    </code>{" "}
                    returns local midnight for that AD day
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2.5 font-medium text-primary">
                    Holidays
                  </td>
                  <td className="px-3 py-2.5">
                    Sample data (<code className="font-mono text-[12px]">asOf</code>{" "}
                    in package). Always override for production payroll.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </DocSection>
      </div>
    </DocsShell>
  );
}
