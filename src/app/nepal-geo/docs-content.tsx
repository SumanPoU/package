"use client";

import { ExampleDemo } from "@/components/example-demo";
import { InstallCommand } from "@/components/install-command";

import {
  DATA_HELPER_ROWS,
  GEO_SELECT_PROPS,
  LOCATION_SELECT_PROPS,
} from "./api-reference";
import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  PropsTable,
} from "./docs-ui";
import {
  CASCADE_EXAMPLE_CODE,
  LOCALE_EXAMPLE_CODE,
  SINGLE_EXAMPLE_CODE,
  STYLE_EXAMPLE_CODE,
  TYPE_FILTER_EXAMPLE_CODE,
} from "./example-codes";
import {
  CascadeExample,
  LocaleExample,
  SingleExample,
  StyleExample,
  TypeFilterExample,
} from "./examples";
import { DOC_NAV } from "./nav";

const CSS = `@import "tailwindcss";
@source "../node_modules/@itzsa/nepal-geo";
@import "@itzsa/nepal-geo/styles.css";`;

const STARTER = `import { useState } from "react";
import {
  NepalLocationSelect,
  type NepalLocationValue,
} from "@itzsa/nepal-geo";
import "@itzsa/nepal-geo/styles.css";

export function AddressFields() {
  const [location, setLocation] = useState<NepalLocationValue>({});

  return (
    <NepalLocationSelect
      value={location}
      onChange={setLocation}
      levels={["province", "district", "local", "ward"]}
      labels={{ local: "Palika", ward: "Ward" }}
      locale="ne"
    />
  );
}`;

const DATA = `import {
  getProvinces,
  getDistricts,
  getLocalLevels,
  getWards,
  getMetropolitanCities,
  getSubMetropolitanCities,
  getMunicipalities,
  getRuralMunicipalities,
  resolveLocalHierarchy,
} from "@itzsa/nepal-geo";
// Prefer data-only when you do not need React:
// import { … } from "@itzsa/nepal-geo-data";

getProvinces();
getDistricts(3);
getLocalLevels(27, { typeKeys: ["municipality", "rural_municipality"] });
getMetropolitanCities();
getSubMetropolitanCities();
getMunicipalities(27);
getRuralMunicipalities(27);
getWards(5);                 // Ward 1…N for a local
resolveLocalHierarchy(5, 12);`;

const DATA_ONLY = `pnpm add @itzsa/nepal-geo-data

import { getLocalLevels, getWards, GEO_META } from "@itzsa/nepal-geo-data";

// No React peer dependency — safe for Node, workers, APIs.`;

const TYPES = `type LocalLevelTypeKey =
  | "metropolitan"
  | "sub_metropolitan"
  | "municipality"
  | "rural_municipality";

// On selects:
<NepalLocalSelect typeKeys={["metropolitan", "sub_metropolitan"]} />
<NepalLocationSelect typeKeys={["municipality", "rural_municipality"]} />`;

const STYLE = `<NepalProvinceSelect
  label="Province"
  vars={{ accent: "#0f766e", radius: "12px" }}
  classNames={{ trigger: "my-trigger", label: "my-label" }}
/>`;

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
            Nepal Geo
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-secondary">
            Nepal administrative geography — provinces, districts, local levels
            (metropolitan, sub-metropolitan, municipality, rural municipality),
            and wards — with searchable React selects and a data-only package.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-secondary">
            <span className="pkg rounded-md border-[0.5px] border-border bg-card px-2 py-1 text-[12px]">
              @itzsa/nepal-geo
            </span>
            <span className="pkg rounded-md border-[0.5px] border-border bg-card px-2 py-1 text-[12px]">
              @itzsa/nepal-geo-data
            </span>
            <span className="rounded-md border-[0.5px] border-border bg-card px-2 py-1">
              7 · 77 · 753 · ~6839
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
          description="UI package includes React selects. Install the data package alone when you only need queries."
        >
          <InstallCommand packages="@itzsa/nepal-geo" />
          <InstallCommand packages="@itzsa/nepal-geo-data" />
          <CodeBlock language="css" code={CSS} />
        </DocSection>

        <DocSection
          id="data"
          title="Data helpers"
          description="Queryable without mounting any UI. Same API on both packages."
        >
          <CodeBlock code={DATA} />
          <Callout title="IDs">
            Values are numeric ids (
            <code className="font-mono text-primary">provinceId</code>,{" "}
            <code className="font-mono text-primary">districtId</code>,{" "}
            <code className="font-mono text-primary">localId</code>,{" "}
            <code className="font-mono text-primary">wardId</code>). Ward ids
            are{" "}
            <code className="font-mono text-primary">
              localId * 1000 + number
            </code>
            .
          </Callout>

          <DocSection
            id="data-only"
            level={3}
            title="Data-only package"
            description="Use @itzsa/nepal-geo-data when you do not need React selects."
          >
            <CodeBlock code={DATA_ONLY} />
          </DocSection>

          <DocSection
            id="types-filters"
            level={3}
            title="Local types & filters"
            description="Filter to metropolitan, sub-metropolitan, municipality, or rural municipality."
          >
            <CodeBlock code={TYPES} />
          </DocSection>

          <DocSection
            id="wards"
            level={3}
            title="Wards"
            description="Ward lists are expanded from per-local counts — no huge static ward table."
          >
            <CodeBlock
              code={`import { getWards, encodeWardId } from "@itzsa/nepal-geo-data";

const wards = getWards(localId); // [{ id, localId, number, nameEn, nameNe }, …]
encodeWardId(5, 12); // → 5012`}
            />
          </DocSection>

          <CodeBlock code={STARTER} />
        </DocSection>

        <DocSection
          id="examples"
          title="Examples"
          description="Searchable selects — Preview / Code toggle; copy from the upper right."
        >
          <div className="flex flex-col gap-12">
            <DocSection
              id="example-single"
              level={3}
              title="Single select"
              description="label prop on each field; district waits until a province is chosen."
            >
              <ExampleDemo code={SINGLE_EXAMPLE_CODE}>
                <SingleExample />
              </ExampleDemo>
            </DocSection>

            <DocSection
              id="example-cascade"
              level={3}
              title="Hierarchy + ward"
              description="Province → district → local → ward. Changing a parent clears children."
            >
              <ExampleDemo code={CASCADE_EXAMPLE_CODE}>
                <CascadeExample />
              </ExampleDemo>
            </DocSection>

            <DocSection
              id="example-types"
              level={3}
              title="Type filters"
              description="Limit locals to urban types, then pick a ward."
            >
              <ExampleDemo code={TYPE_FILTER_EXAMPLE_CODE}>
                <TypeFilterExample />
              </ExampleDemo>
            </DocSection>

            <DocSection
              id="example-style"
              level={3}
              title="Custom CSS"
              description="vars and classNames without forking styles.css."
            >
              <ExampleDemo code={STYLE_EXAMPLE_CODE}>
                <StyleExample />
              </ExampleDemo>
            </DocSection>

            <DocSection
              id="example-locale"
              level={3}
              title="Locale"
              description="English or Nepali labels from the same dataset."
            >
              <ExampleDemo code={LOCALE_EXAMPLE_CODE}>
                <LocaleExample />
              </ExampleDemo>
            </DocSection>
          </div>
        </DocSection>

        <DocSection
          id="styling"
          title="Styling API"
          description="Same pattern as @itzsa/nepali-datepicker."
        >
          <CodeBlock code={STYLE} />
          <Callout title="classNames keys">
            root, trigger, label, popover, search, option, optionMeta, empty,
            clear, field, cascade
          </Callout>
          <Callout title="vars keys">
            accent, background, foreground, muted, border, surface, radius, font
          </Callout>
        </DocSection>

        <DocSection
          id="props"
          title="Props API"
          description="Full prop tables for selects and data helpers."
        >
          <div className="flex flex-col gap-8">
            <PropsTable
              caption="NepalGeoSelect (and Province / District / Local / Ward aliases)"
              rows={GEO_SELECT_PROPS}
            />
            <PropsTable
              caption="NepalLocationSelect"
              rows={LOCATION_SELECT_PROPS}
            />
            <PropsTable
              caption="Data helpers (@itzsa/nepal-geo & @itzsa/nepal-geo-data)"
              rows={DATA_HELPER_ROWS}
            />
          </div>
        </DocSection>
      </div>
    </DocsShell>
  );
}
