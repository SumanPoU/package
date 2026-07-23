"use client";

import Link from "next/link";
import { type ReactNode, useCallback, useEffect, useState } from "react";

import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/utils";
import type { PropRow } from "./api-reference";
import { DOC_NAV, type NavItem, RIGHT_TOC } from "./nav";

export { CodeBlock };
export type { PropRow };

export function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    if (ids.length === 0) return;
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const visibility = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }
        let bestId = ids[0] ?? "";
        let bestRatio = -1;
        for (const id of ids) {
          const ratio = visibility.get(id) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        }
        if (bestRatio < 0.05) {
          const mid = window.innerHeight * 0.28;
          let fallback = ids[0] ?? "";
          for (const el of elements) {
            if (el.getBoundingClientRect().top <= mid) fallback = el.id;
          }
          setActiveId(fallback);
          return;
        }
        setActiveId(bestId);
      },
      { rootMargin: "-12% 0px -55% 0px", threshold: [0, 0.1, 0.25, 0.5, 1] },
    );
    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

function NavLink({
  item,
  active,
  size = "default",
}: {
  item: NavItem;
  active: boolean;
  size?: "default" | "toc";
}) {
  return (
    <a
      href={`#${item.id}`}
      aria-current={active ? "location" : undefined}
      className={cn(
        "group relative block rounded-sm transition-colors",
        size === "toc"
          ? "border-l-[0.5px] border-border py-1.5 pl-3 text-[13px] leading-snug"
          : "px-2.5 py-1.5 text-sm",
        item.indent &&
          size === "default" &&
          "ml-2 border-l-[0.5px] border-transparent pl-3 text-[13px]",
        active
          ? size === "toc"
            ? "border-l-2 border-l-accent text-accent"
            : "text-accent"
          : "text-secondary hover:text-primary",
      )}
    >
      {size === "default" && active ? (
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-accent"
        />
      ) : null}
      {item.label}
    </a>
  );
}

function parentSectionId(activeId: string): string {
  const idx = DOC_NAV.findIndex((n) => n.id === activeId);
  if (idx < 0) return activeId;
  for (let i = idx; i >= 0; i--) {
    if (!DOC_NAV[i]?.indent) return DOC_NAV[i]?.id ?? activeId;
  }
  return activeId;
}

function childrenOf(parentId: string): NavItem[] {
  const parentIdx = DOC_NAV.findIndex((n) => n.id === parentId);
  if (parentIdx < 0) return [];
  const kids: NavItem[] = [];
  for (let i = parentIdx + 1; i < DOC_NAV.length; i++) {
    const item = DOC_NAV[i]!;
    if (!item.indent) break;
    kids.push(item);
  }
  return kids;
}

export function DocsShell({ children }: { children: ReactNode }) {
  const ids = DOC_NAV.map((n) => n.id);
  const activeId = useActiveSection(ids);
  const topActive = parentSectionId(activeId);
  const sectionChildren = childrenOf(topActive);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="docs-shell min-h-full bg-page">
      <div className="mx-auto flex w-full max-w-[88rem] gap-4 px-4 py-6 sm:px-6 sm:py-8 lg:gap-8 lg:py-10 xl:gap-10">
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-52 shrink-0 overflow-y-auto lg:block xl:w-56">
          <nav aria-label="Documentation" className="flex flex-col gap-0.5">
            <Link
              href="/"
              className="mb-5 text-[11px] font-medium tracking-[0.16em] text-secondary uppercase transition-colors hover:text-primary"
            >
              ← itzsa
            </Link>
            <div className="mb-4 flex flex-col gap-0.5 px-2.5">
              <p className="text-[15px] font-medium tracking-tight text-primary">
                Nepal Pay
              </p>
              <p className="pkg text-[11px]">@itzsa/nepal-pay</p>
            </div>
            {DOC_NAV.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                active={activeId === item.id}
              />
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-12 sm:pb-24">{children}</main>

        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-44 shrink-0 overflow-y-auto xl:block">
          <nav aria-label="On this page" className="flex flex-col">
            <p className="mb-3 text-[11px] font-medium tracking-[0.14em] text-tertiary uppercase">
              On this page
            </p>
            {RIGHT_TOC.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                active={topActive === item.id}
                size="toc"
              />
            ))}
            {sectionChildren.length > 0 ? (
              <div className="mt-4 flex flex-col border-t-[0.5px] border-border pt-3">
                <p className="mb-2 text-[11px] text-tertiary">In section</p>
                {sectionChildren.map((item) => (
                  <NavLink
                    key={item.id}
                    item={item}
                    active={activeId === item.id}
                    size="toc"
                  />
                ))}
              </div>
            ) : null}
          </nav>
          <button
            type="button"
            onClick={scrollToTop}
            className="mt-6 text-left text-[12px] text-secondary transition-colors hover:text-primary"
          >
            ↑ Back to top
          </button>
        </aside>
      </div>
    </div>
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
  nameHeader = "Name",
}: {
  rows: PropRow[];
  caption?: string;
  nameHeader?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border-[0.5px] border-border bg-card shadow-[0_1px_0_color-mix(in_oklab,var(--border)_80%,transparent)]">
      {caption ? (
        <p className="border-b-[0.5px] border-border bg-card px-3 py-2 font-mono text-[11px] tracking-wide text-tertiary uppercase">
          {caption}
        </p>
      ) : null}
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b-[0.5px] border-border bg-card">
            <th className="px-3 py-2.5 text-[12px] font-medium text-primary">
              {nameHeader}
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
                {row.default ?? "—"}
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
    <div className="rounded-md border-[0.5px] border-border bg-card px-3.5 py-3 text-sm leading-relaxed text-secondary">
      {title ? (
        <p className="mb-1 text-[12px] font-medium tracking-wide text-primary uppercase">
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}
