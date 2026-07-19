"use client";

import { InstallCommand } from "@/components/install-command";
import { HELPER_API, INPUT_PROPS, TEXTAREA_PROPS } from "./api-reference";
import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  PropsTable,
} from "./docs-ui";
import {
  HelperExample,
  PreetiExample,
  ToggleExample,
  UnicodeExample,
} from "./examples";
import { DOC_NAV } from "./nav";

const CSS = `@import "tailwindcss";
@source "../node_modules/@itzsa/nepali-input";
@import "@itzsa/nepali-input/styles.css";

:root {
  --itzsa-nepali-font: "Noto Sans Devanagari", sans-serif;
}`;

const STARTER = `import { useState } from "react";
import { NepaliInput, NepaliTextarea } from "@itzsa/nepali-input";
import "@itzsa/nepali-input/styles.css";

export function NameForm() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  return (
    <>
      <NepaliInput
        mode="unicode"
        placeholder="नाम"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <NepaliTextarea
        mode="preeti"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />
    </>
  );
}`;

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
            Nepali Input
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            React Input and Textarea that transliterate Latin keystrokes to
            Nepali Devanagari using Unicode or Preeti layouts. Drop-in fields
            with stable caret, controlled/uncontrolled support, and pure
            helpers.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-secondary">
            <span className="pkg rounded-md border-[0.5px] border-border bg-card px-2 py-1 text-[12px]">
              @itzsa/nepali-input
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              Unicode · Preeti
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              React 18 / 19
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
          description="Add the package and optional styles. Use a Devanagari-capable font for correct glyphs."
        >
          <InstallCommand packages="@itzsa/nepali-input" />
          <p className="text-sm text-secondary">Global CSS (Tailwind v4):</p>
          <CodeBlock language="css" code={CSS} />
          <Callout title="Peers">
            Peer deps: <code className="font-mono text-primary">react</code> and{" "}
            <code className="font-mono text-primary">react-dom</code> ^18 or
            ^19.
          </Callout>
        </DocSection>

        <DocSection
          id="getting-started"
          title="Getting started"
          description="Controlled fields. onChange receives e.target.value already mapped to Nepali."
        >
          <CodeBlock code={STARTER} />
        </DocSection>

        <DocSection
          id="examples"
          title="Examples"
          description="Type Latin characters in the fields below — they convert as you type."
        >
          <div className="flex flex-col gap-12">
            <DocSection
              id="example-unicode"
              level={3}
              title="Unicode mode"
              description="Traditional Unicode Nepali keyboard mapping (default)."
            >
              <UnicodeExample />
            </DocSection>

            <DocSection
              id="example-preeti"
              level={3}
              title="Preeti mode"
              description="Preeti layout — some keys expand to conjuncts (e.g. ! → ज्ञ)."
            >
              <PreetiExample />
            </DocSection>

            <DocSection
              id="example-toggle"
              level={3}
              title="Enable / disable"
              description="Toggle transliteration or switch layouts without remounting."
            >
              <ToggleExample />
            </DocSection>

            <DocSection
              id="example-helpers"
              level={3}
              title="toNepali helper"
              description="Use the pure function outside React — forms, validation, server transforms."
            >
              <HelperExample />
              <CodeBlock
                code={`import { toNepali } from "@itzsa/nepali-input";

toNepali("namaste", "unicode");
toNepali("s", "preeti"); // → क`}
              />
            </DocSection>
          </div>
        </DocSection>

        <DocSection
          id="props"
          title="Props API"
          description="Native input/textarea props are forwarded. Package-specific props below."
        >
          <div className="flex flex-col gap-10">
            <DocSection
              id="props-input"
              level={3}
              title="NepaliInput"
              description="Forwarded ref to HTMLInputElement."
            >
              <PropsTable caption="NepaliInputProps" rows={INPUT_PROPS} />
            </DocSection>

            <DocSection
              id="props-textarea"
              level={3}
              title="NepaliTextarea"
              description="Forwarded ref to HTMLTextAreaElement."
            >
              <PropsTable caption="NepaliTextareaProps" rows={TEXTAREA_PROPS} />
            </DocSection>

            <DocSection
              id="props-helpers"
              level={3}
              title="Helpers & maps"
              description="Also exported: unicodeMappings, preetiMappings, NEPALI_MAP_SIZE."
            >
              <PropsTable caption="API" rows={HELPER_API} />
            </DocSection>
          </div>
        </DocSection>

        <DocSection
          id="styling"
          title="Styling & fonts"
          description="Base classes use shadcn-style tokens. Override with className."
        >
          <CodeBlock
            code={`<NepaliInput
  className="h-10 rounded-md border-border"
  mode="unicode"
/>`}
          />
          <Callout title="Font">
            Import <code className="font-mono text-accent">styles.css</code> and
            set{" "}
            <code className="font-mono text-accent">--itzsa-nepali-font</code>,
            or load Noto Sans Devanagari via{" "}
            <code className="font-mono text-primary">next/font/google</code>.
            Without a Devanagari font, some conjuncts may render poorly.
          </Callout>
          <Callout title="Caret & robustness">
            Multi-glyph Preeti keys keep the caret stable. Existing Devanagari
            is never re-mapped. Paste goes through the same path. Use{" "}
            <code className="font-mono text-accent">enabled={"{false}"}</code>{" "}
            for temporary Latin-only entry.
          </Callout>
        </DocSection>
      </div>
    </DocsShell>
  );
}
