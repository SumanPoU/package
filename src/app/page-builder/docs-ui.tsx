"use client";

import type { ReactNode } from "react";

import { CodeBlock } from "@/components/code-block";
import { PackageDocsShell } from "@/components/docs/package-docs-shell";
import { cn } from "@/lib/utils";
import { DOC_NAV } from "./nav";

export { CodeBlock };

export type PropRow = {
  name: string;
  type: string;
  default?: string;
  description: string;
};

export function DocsShell({ children }: { children: ReactNode }) {
  return (
    <PackageDocsShell
      title="Page Builder"
      packageName="@itzsa/page-builder"
      nav={DOC_NAV}
    >
      {children}
    </PackageDocsShell>
  );
}

export function DocSection({
  id,
  title,
  description,
  children,
  level = 2,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  level?: 2 | 3;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <section id={id} className="scroll-mt-28 flex flex-col gap-4">
      <header
        className={cn(
          "flex flex-col gap-1.5",
          level === 2 && "border-b-[0.5px] border-border pb-3",
        )}
      >
        <Heading
          className={cn(
            "font-medium tracking-tight text-primary",
            level === 2 ? "text-xl sm:text-[1.35rem]" : "text-[15px]",
          )}
        >
          <a
            href={`#${id}`}
            className="group inline-flex items-baseline gap-1.5 no-underline hover:text-accent"
          >
            {title}
            <span className="text-tertiary opacity-0 transition-opacity group-hover:opacity-100">
              #
            </span>
          </a>
        </Heading>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-secondary">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function PropsTable({
  rows,
  caption,
}: {
  rows: PropRow[];
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-md border-[0.5px] border-border bg-card">
      {caption ? (
        <p className="border-b-[0.5px] border-border px-3 py-2 font-mono text-[11px] tracking-wide text-tertiary uppercase">
          {caption}
        </p>
      ) : null}
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b-[0.5px] border-border">
            <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
              Prop
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
              Type
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
              Default
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.name}
              className="border-b-[0.5px] border-border last:border-0"
            >
              <td className="px-3 py-2.5 align-top font-mono text-[12.5px] text-accent">
                {row.name}
              </td>
              <td className="max-w-[14rem] px-3 py-2.5 align-top font-mono text-[11.5px] leading-snug break-all text-secondary">
                {row.type}
              </td>
              <td className="px-3 py-2.5 align-top font-mono text-[12px] whitespace-nowrap text-tertiary">
                {row.default ?? "-"}
              </td>
              <td className="px-3 py-2.5 align-top text-[13px] leading-relaxed text-secondary">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Callout({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <div
      data-a11y-readable
      className="rounded-md border-[0.5px] border-border bg-card px-3.5 py-3 text-sm leading-relaxed text-secondary"
    >
      {title ? (
        <p className="mb-1 text-[12px] font-medium tracking-wide text-primary uppercase">
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function FeaturesTable({
  rows,
}: {
  rows: { feature: string; description: string }[];
}) {
  return (
    <div className="overflow-x-auto rounded-md border-[0.5px] border-border bg-card">
      <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b-[0.5px] border-border">
            <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
              Feature
            </th>
            <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.feature}
              className="border-b-[0.5px] border-border last:border-0"
            >
              <td className="px-3 py-2.5 align-top text-[13px] font-medium whitespace-nowrap text-primary">
                {row.feature}
              </td>
              <td className="px-3 py-2.5 align-top text-[13px] leading-relaxed text-secondary">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
