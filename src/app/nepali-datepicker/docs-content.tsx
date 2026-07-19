"use client";

import { InstallCommand } from "@/components/install-command";

import {
  EDITABLE_PROPS,
  HELPER_API,
  PICKER_PROPS,
  RANGE_PROPS,
} from "./api-reference";
import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  PropsTable,
} from "./docs-ui";
import {
  BasicExample,
  BoundsExample,
  EditableExample,
  HelpersExample,
  LocaleExample,
  RangeExample,
  StyledExample,
} from "./examples";
import { DOC_NAV } from "./nav";

const CSS = `@import "tailwindcss";
@source "../node_modules/@itzsa/nepali-datepicker";
@import "@itzsa/nepali-datepicker/styles.css";

:root {
  --itzsa-nepali-font: "Noto Sans Devanagari", sans-serif;
}`;

const STARTER = `import { useState } from "react";
import {
  EditableNepaliDatePicker,
  NepaliDatePicker,
  NepaliDateRangePicker,
  isCompleteBsDate,
  validateBsDate,
} from "@itzsa/nepali-datepicker";
import "@itzsa/nepali-datepicker/styles.css";

export function DateFields() {
  const [date, setDate] = useState("");
  const [typed, setTyped] = useState("");
  const [range, setRange] = useState<{ from?: string; to?: string }>({});

  return (
    <>
      <NepaliDatePicker value={date} onChange={setDate} locale="ne" />
      <EditableNepaliDatePicker value={typed} onChange={setTyped} />
      <NepaliDateRangePicker value={range} onChange={setRange} />
      {/* before submit: */}
      {isCompleteBsDate(typed) ? "ok" : "incomplete"}
    </>
  );
}`;

const STYLE_CODE = `<NepaliDatePicker
  value={date}
  onChange={setDate}
  vars={{
    accent: "#0f766e",
    radius: "12px",
    border: "#99f6e4",
    surface: "#f0fdfa",
  }}
  classNames={{
    input: "h-10 font-medium",
    popover: "shadow-lg",
  }}
/>`;

const VALIDATE_CODE = `import {
  isCompleteBsDate,
  parseDateString,
  validateBsDate,
  assertValidBsDate,
} from "@itzsa/nepali-datepicker";

// Soft (forms)
const result = validateBsDate(2082, 1, 32);
// → { ok: false, code: "invalid_date", message: "…" }

if (!isCompleteBsDate(value)) {
  // still typing or bad calendar day
}

// Hard (throw)
assertValidBsDate(2082, 4, 15);

const parts = parseDateString("2082-04-15"); // null if invalid`;

export function DocsContent() {
  return (
    <DocsShell>
      <div className="flex flex-col gap-14">
        <header
          id="introduction"
          className="scroll-mt-28 flex flex-col gap-3 border-b-[0.5px] border-border pb-8"
        >
          <p className="text-[11px] font-medium tracking-[0.16em] text-secondary uppercase">
            Documentation · itzsa
          </p>
          <h1 className="text-3xl font-medium tracking-tight text-primary sm:text-4xl">
            nepali-datepicker
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            Production-ready Bikram Sambat pickers for React: calendar select,
            typeable <code className="font-mono text-primary">YYYY-MM-DD</code>{" "}
            input, and dual-month range — with AD ↔ BS conversion, validation
            helpers, and theme tokens via props.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-secondary">
            <span className="pkg rounded-md border-[0.5px] border-border bg-card px-2 py-1 text-[12px]">
              @itzsa/nepali-datepicker
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              single · editable · range
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              BS 2000–2100
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
          description="Install with your package manager, then import styles once in the app."
        >
          <InstallCommand packages="@itzsa/nepali-datepicker" />
          <p className="text-sm text-secondary">Global CSS (Tailwind v4):</p>
          <CodeBlock language="css" code={CSS} />
          <Callout title="Peers">
            Peer deps: <code className="font-mono text-primary">react</code> and{" "}
            <code className="font-mono text-primary">react-dom</code> ^18 or ^19.
            Load a Devanagari font for Nepali labels.
          </Callout>
        </DocSection>

        <DocSection
          id="getting-started"
          title="Getting started"
          description="Canonical values are always ASCII YYYY-MM-DD (BS). Display locale is separate from the stored value."
        >
          <CodeBlock code={STARTER} />
          <Callout title="vs jQuery NepaliDatePicker">
            You do <strong>not</strong> need to port that plugin’s compressed
            month codec or special-case patches. This package uses explicit BS
            month-length tables (2000–2100) plus{" "}
            <code className="font-mono text-primary">validateBsDate</code> /{" "}
            <code className="font-mono text-primary">minDate</code> /{" "}
            <code className="font-mono text-primary">maxDate</code> — same job,
            clearer API.
          </Callout>
        </DocSection>

        <DocSection
          id="validation"
          title="Validation"
          description="Use soft checks in forms; assert helpers throw TypeError / RangeError when you need hard guards."
        >
          <CodeBlock code={VALIDATE_CODE} />
          <Callout title="What we validate">
            Integer year/month/day, year in 2000–2100, month 1–12, day within that
            month’s length. Incomplete typed strings fail{" "}
            <code className="font-mono text-primary">isCompleteBsDate</code> until
            the user finishes a real calendar day.
          </Callout>
        </DocSection>

        <DocSection
          id="examples"
          title="Examples"
          description="Interactive demos for each picker variant."
        >
          <div className="flex flex-col gap-12">
            <DocSection
              id="example-basic"
              level={3}
              title="Basic picker"
              description="Read-only field with Nepali label — open calendar to pick."
            >
              <BasicExample />
            </DocSection>

            <DocSection
              id="example-editable"
              level={3}
              title="Editable input"
              description="Type digits (auto-masked to YYYY-MM-DD) or open the calendar."
            >
              <EditableExample />
            </DocSection>

            <DocSection
              id="example-range"
              level={3}
              title="Date range"
              description="Click start, then end. Hover previews the span; dual months on desktop."
            >
              <RangeExample />
            </DocSection>

            <DocSection
              id="example-styled"
              level={3}
              title="Custom styling"
              description="Theme with vars (CSS tokens) and classNames (per-part Tailwind / CSS)."
            >
              <StyledExample />
              <CodeBlock code={STYLE_CODE} />
            </DocSection>

            <DocSection
              id="example-locale"
              level={3}
              title="Locale"
              description="Switch calendar and labels between ne and en."
            >
              <LocaleExample />
            </DocSection>

            <DocSection
              id="example-bounds"
              level={3}
              title="Min / max"
              description="Limit selectable days and years."
            >
              <BoundsExample />
            </DocSection>

            <DocSection
              id="example-helpers"
              level={3}
              title="AD ↔ BS helpers"
              description="Pure functions for conversion outside React."
            >
              <HelpersExample />
              <CodeBlock
                code={`import { adToBs, bsToAd, todayBs } from "@itzsa/nepali-datepicker";

const today = todayBs();
const ad = bsToAd(today.year, today.month, today.day);
const bs = adToBs(ad.year, ad.month, ad.day);`}
              />
            </DocSection>
          </div>
        </DocSection>

        <DocSection
          id="props"
          title="Props API"
          description="Canonical date strings are always ASCII YYYY-MM-DD (BS)."
        >
          <div className="flex flex-col gap-10">
            <DocSection
              id="props-picker"
              level={3}
              title="NepaliDatePicker"
              description="Human-readable display; calendar selection only."
            >
              <PropsTable caption="NepaliDatePickerProps" rows={PICKER_PROPS} />
            </DocSection>

            <DocSection
              id="props-editable"
              level={3}
              title="EditableNepaliDatePicker"
              description="Typeable masked input + calendar. Validate with isCompleteBsDate."
            >
              <PropsTable
                caption="EditableNepaliDatePickerProps"
                rows={EDITABLE_PROPS}
              />
            </DocSection>

            <DocSection
              id="props-range"
              level={3}
              title="NepaliDateRangePicker"
              description="from / to as YYYY-MM-DD. Duration shown in the footer."
            >
              <PropsTable
                caption="NepaliDateRangePickerProps"
                rows={RANGE_PROPS}
              />
            </DocSection>

            <DocSection
              id="props-helpers"
              level={3}
              title="Helpers"
              description="Tree-shakeable utilities from the same package entry."
            >
              <PropsTable caption="Conversion, format & validation" rows={HELPER_API} />
            </DocSection>
          </div>
        </DocSection>

        <DocSection
          id="styling"
          title="Styling & fonts"
          description="Three layers: CSS import tokens, vars prop, and classNames / className."
        >
          <CodeBlock
            language="css"
            code={`.itzsa-ndp {
  --ndp-accent: #1d9e75;
  --ndp-border: #e4e2db;
  --ndp-radius: 10px;
  --itzsa-nepali-font: "Noto Sans Devanagari", sans-serif;
}`}
          />
          <p className="text-sm text-secondary">
            <code className="font-mono text-primary">vars</code> maps to the same
            CSS variables at runtime.{" "}
            <code className="font-mono text-primary">classNames</code> targets
            root, field, input, trigger, popover (and range-specific keys on the
            range picker).
          </p>
          <Callout title="Calendar data range">
            Tables cover BS 2000–2100. Outside that range, conversion helpers
            throw <code className="font-mono text-primary">RangeError</code>.
          </Callout>
          <p className="text-sm text-secondary">
            Source:{" "}
            <a
              className="text-accent underline-offset-2 hover:underline"
              href="https://github.com/SumanPoU/package/tree/main/packages/nepali-datepicker"
            >
              packages/nepali-datepicker
            </a>
          </p>
        </DocSection>
      </div>
    </DocsShell>
  );
}
