"use client";

import {
  ACTION_PROPS,
  ACTIONS_OPTIONS_PROPS,
  CLASSNAMES_SLOTS,
  COLUMN_PROPS,
  DATATABLE_PROPS,
  FEATURE_MAP,
  LOCALE_KEYS,
  PAGINATION_PROPS,
  STYLES_SLOTS,
} from "./api-reference";
import {
  Callout,
  CodeBlock,
  DocSection,
  DocsShell,
  PropsTable,
} from "./docs-ui";
import { DOC_NAV } from "./nav";
import {
  FullFeaturedExample,
  LocaleExample,
  RowEditExample,
  TreeExample,
} from "./examples";

const INSTALL_CODE = `pnpm add @itzsa/table
# or: npm install @itzsa/table`;

const CSS_CODE = `@import "tailwindcss";
@source "../node_modules/@itzsa/table";
@import "@itzsa/table/styles.css";`;

const STARTER_CODE = `import { DataTable } from "@itzsa/table";

const data = [
  { id: "1", name: "Ada Lovelace", role: "Mathematician" },
  { id: "2", name: "Alan Turing", role: "Computer scientist" },
];

const columns = [
  { key: "name", header: "Name", sortable: true },
  { key: "role", header: "Role" },
];

export function UsersTable() {
  return (
    <DataTable
      data={data}
      columns={columns}
      pageSize={10}
      showPagination
      sn
    />
  );
}`;

const STYLING_CODE = `<DataTable
  classNames={{
    root: "border-border",
    header: "bg-muted/40",
    row: "hover:bg-muted/30",
    pagination: "bg-card",
  }}
  styles={{
    root: { borderRadius: 12 },
    headerCell: { fontWeight: 600 },
  }}
  data={rows}
  columns={columns}
/>`;

export function DocsContent() {
  return (
    <DocsShell>
      <div className="flex flex-col gap-14">
        <header
          id="introduction"
          className="scroll-mt-24 flex flex-col gap-3 border-b border-border/80 pb-8"
        >
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Documentation · @itzsa
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            table
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            Composable DataTable for React — pagination, selection, sorting,
            filters, editing, export, tree data, and keyboard navigation.
            Built on shadcn-style primitives; features are opt-in via props.
          </p>
          <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
            <span className="rounded-sm border border-border/80 bg-card/80 px-2 py-1 font-mono shadow-sm">
              npm i @itzsa/table
            </span>
            <span className="rounded-sm border border-border/80 bg-card/80 px-2 py-1">
              React 18 / 19
            </span>
            <span className="rounded-sm border border-border/80 bg-card/80 px-2 py-1">
              Tailwind v4
            </span>
          </div>
        </header>

        <nav
          aria-label="Jump to"
          className="flex flex-wrap gap-2 lg:hidden"
        >
          {DOC_NAV.filter((n) => !n.indent).map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="rounded-sm border border-border/80 bg-card/80 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <DocSection
          id="installation"
          title="Installation"
          description="Add the package, then wire Tailwind so utility classes inside the table are generated."
        >
          <CodeBlock language="bash" code={INSTALL_CODE} />
          <p className="text-sm text-muted-foreground">
            In your global CSS (Tailwind v4):
          </p>
          <CodeBlock language="css" code={CSS_CODE} />
          <Callout title="Peers">
            Peer deps: <code className="text-foreground">react</code> and{" "}
            <code className="text-foreground">react-dom</code> ^18 or ^19.
            Import styles once at the app root.
          </Callout>
        </DocSection>

        <DocSection
          id="getting-started"
          title="Getting started"
          description="Minimal client table. Serial numbers (SN) default on — pass sn={false} to hide."
        >
          <CodeBlock code={STARTER_CODE} />
          <Callout title="Opt-in by default">
            Almost every behavioral feature is{" "}
            <strong className="text-foreground">off by default</strong> except
            SN and pagination. Turn on what you need with props like{" "}
            <code className="text-foreground">selectable</code>,{" "}
            <code className="text-foreground">editable</code>,{" "}
            <code className="text-foreground">showExport</code>.
          </Callout>
        </DocSection>

        <DocSection
          id="examples"
          title="Examples"
          description="Live demos from this docs app. Data and serializable props live under src/app/table/data and props/."
        >
          <div className="flex flex-col gap-12">
            <DocSection
              id="example-full"
              level={3}
              title="Full-featured grid"
              description="Cell edit, detail panel, filters, export, keyboard nav, actions, and custom page size (type or pick)."
            >
              <FullFeaturedExample />
            </DocSection>

            <DocSection
              id="example-row-edit"
              level={3}
              title="Row edit mode"
              description='editMode="row" — double-click, edit several fields, then save or cancel.'
            >
              <RowEditExample />
            </DocSection>

            <DocSection
              id="example-tree"
              level={3}
              title="Tree data"
              description="Path-based hierarchy via getTreeDataPath. Expand groups on the first column."
            >
              <TreeExample />
              <CodeBlock
                code={`<DataTable
  treeData
  getTreeDataPath={(row) => row.path}
  defaultGroupingExpansionDepth={1}
  groupingColDef={{ headerName: "Org / name" }}
  data={rows}
  columns={columns}
/>`}
              />
            </DocSection>

            <DocSection
              id="example-locale"
              level={3}
              title="Locale override"
              description="Partial localeText map for toolbar and control labels."
            >
              <LocaleExample />
            </DocSection>
          </div>
        </DocSection>

        <DocSection
          id="props"
          title="Props API"
          description="Full surface area — DataTable, columns, pagination, actions, classNames, styles, and localeText. Use these tables when wiring the package in another app."
        >
          <div className="flex flex-col gap-10">
            <DocSection
              id="props-datatable"
              level={3}
              title="DataTable"
              description="Core props. Features stay opt-in unless noted."
            >
              <PropsTable caption="DataTableProps" rows={DATATABLE_PROPS} />
            </DocSection>

            <DocSection
              id="props-column"
              level={3}
              title="DataTableColumn"
              description="Per-column configuration passed in columns[]."
            >
              <PropsTable caption="DataTableColumn<T>" rows={COLUMN_PROPS} />
            </DocSection>

            <DocSection
              id="props-pagination"
              level={3}
              title="paginationOptions"
              description="Footer rows-per-page combobox (type + dropdown) and pager chrome."
            >
              <PropsTable
                caption="DataTablePaginationOptions"
                rows={PAGINATION_PROPS}
              />
            </DocSection>

            <DocSection
              id="props-actions"
              level={3}
              title="actions & actionsOptions"
              description="Declarative row actions — menu or icons, never both."
            >
              <PropsTable caption="DataTableRowAction" rows={ACTION_PROPS} />
              <PropsTable
                caption="DataTableActionsOptions"
                rows={ACTIONS_OPTIONS_PROPS}
              />
            </DocSection>

            <DocSection
              id="props-classnames"
              level={3}
              title="classNames slots"
              description="Pass Tailwind (or any) class strings per slot. Merged last via tailwind-merge — same idea as MUI DataGrid classes."
            >
              <PropsTable
                caption="DataTableClassNames"
                rows={CLASSNAMES_SLOTS}
              />
              <CodeBlock
                code={`classNames={{
  root: "shadow-sm",
  headerCell: "text-xs uppercase tracking-wide",
  row: "hover:bg-muted/40",
  pagination: "border-t",
}}`}
              />
            </DocSection>

            <DocSection
              id="props-styles"
              level={3}
              title="styles slots"
              description="Per-slot React.CSSProperties. Prefer classNames for theme tokens; use styles for one-off layout."
            >
              <PropsTable caption="DataTableStyles" rows={STYLES_SLOTS} />
              <CodeBlock
                code={`styles={{
  root: { borderRadius: 10 },
  scroll: { maxHeight: "22rem" },
  headerCell: { letterSpacing: "0.02em" },
}}`}
              />
            </DocSection>

            <DocSection
              id="props-locale"
              level={3}
              title="localeText"
              description="Partial map over DataTableLocaleText. Unset keys keep English defaults from DEFAULT_LOCALE_TEXT."
            >
              <PropsTable
                caption="Partial<DataTableLocaleText>"
                rows={LOCALE_KEYS}
              />
            </DocSection>
          </div>
        </DocSection>

        <DocSection
          id="styling"
          title="CSS & theming"
          description="Import package CSS once, then override via classNames / styles. Consumer classes win."
        >
          <CodeBlock code={STYLING_CODE} />
          <Callout title="Merge order">
            Internal classes →{" "}
            <code className="text-foreground">classNames.*</code> (via{" "}
            <code className="text-foreground">tailwind-merge</code>) →{" "}
            <code className="text-foreground">styles.*</code> inline. Column{" "}
            <code className="text-foreground">className</code> /{" "}
            <code className="text-foreground">headerClassName</code> apply on
            that column’s cells.
          </Callout>
        </DocSection>

        <DocSection
          id="features"
          title="Feature map"
          description="Capability → prop. Everything here is opt-in except SN and pagination."
        >
          <PropsTable caption="Quick reference" rows={FEATURE_MAP} />
        </DocSection>
      </div>
    </DocsShell>
  );
}
