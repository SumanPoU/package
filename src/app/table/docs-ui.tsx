"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { DOC_NAV, RIGHT_TOC, type NavItem } from "./nav";

export type { PropRow } from "./api-types";
export type { NavItem };

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

        // Prefer the last section above the midpoint when nothing intersects well
        if (bestRatio < 0.05) {
          const mid = window.innerHeight * 0.28;
          let fallback = ids[0] ?? "";
          for (const el of elements) {
            const top = el.getBoundingClientRect().top;
            if (top <= mid) fallback = el.id;
          }
          setActiveId(fallback);
          return;
        }

        setActiveId(bestId);
      },
      {
        rootMargin: "-12% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 1],
      },
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
          ? "border-l border-border/80 py-1.5 pl-3 text-[13px] leading-snug"
          : "px-2.5 py-1.5 text-sm",
        item.indent && size === "default" && "ml-2 border-l border-transparent pl-3 text-[13px]",
        active
          ? size === "toc"
            ? "border-l-[2.5px] border-l-[oklch(0.42_0.06_165)] font-medium text-foreground"
            : "bg-[oklch(0.42_0.06_165_/0.08)] font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      {size === "default" && active ? (
        <span
          aria-hidden
          className="absolute top-1.5 bottom-1.5 left-0 w-[2.5px] rounded-full bg-[oklch(0.42_0.06_165)]"
        />
      ) : null}
      {item.label}
    </a>
  );
}

export function DocSidebar({
  activeId,
  className,
}: {
  activeId: string;
  className?: string;
}) {
  return (
    <nav
      aria-label="Documentation"
      className={cn("flex flex-col gap-0.5", className)}
    >
      <Link
        href="/"
        className="mb-5 text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase transition-colors hover:text-foreground"
      >
        ← @itzsa
      </Link>
      <div className="mb-4 flex flex-col gap-0.5 px-2.5">
        <p className="text-[15px] font-semibold tracking-tight text-foreground">
          table
        </p>
        <p className="font-mono text-[11px] text-muted-foreground">
          @itzsa/table
        </p>
      </div>
      {DOC_NAV.map((item) => (
        <NavLink key={item.id} item={item} active={activeId === item.id} />
      ))}
    </nav>
  );
}

function parentSectionId(activeId: string): string {
  const idx = DOC_NAV.findIndex((n) => n.id === activeId);
  if (idx < 0) return activeId;
  for (let i = idx; i >= 0; i--) {
    if (!DOC_NAV[i]?.indent) return DOC_NAV[i]!.id;
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

export function DocToc({
  activeId,
  className,
}: {
  activeId: string;
  className?: string;
}) {
  const topActive = parentSectionId(activeId);
  const sectionChildren = childrenOf(topActive);

  return (
    <nav aria-label="On this page" className={cn("flex flex-col", className)}>
      <p className="mb-3 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        On this page
      </p>
      <div className="flex flex-col">
        {RIGHT_TOC.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={topActive === item.id}
            size="toc"
          />
        ))}
      </div>
      {sectionChildren.length > 0 ? (
        <div className="mt-4 flex flex-col border-t border-border/60 pt-3">
          <p className="mb-2 text-[11px] text-muted-foreground">In section</p>
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
  );
}

export function DocsShell({ children }: { children: ReactNode }) {
  const ids = DOC_NAV.map((n) => n.id);
  const activeId = useActiveSection(ids);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="docs-shell min-h-full">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(1200px_600px_at_10%_-10%,oklch(0.94_0.02_165/_0.55),transparent_55%),radial-gradient(900px_500px_at_90%_0%,oklch(0.96_0.015_85/_0.4),transparent_50%),linear-gradient(180deg,oklch(0.985_0.004_95)_0%,oklch(0.972_0.006_95)_100%)] dark:bg-none dark:bg-background"
      />
      <div className="mx-auto flex w-full max-w-[88rem] gap-8 px-4 py-10 sm:px-6 lg:gap-10 xl:gap-12">
        <aside className="sticky top-8 hidden h-[calc(100vh-4rem)] w-52 shrink-0 overflow-y-auto lg:block xl:w-56">
          <DocSidebar activeId={activeId} />
        </aside>

        <main className="min-w-0 flex-1 pb-24">{children}</main>

        <aside className="sticky top-8 hidden h-[calc(100vh-4rem)] w-44 shrink-0 overflow-y-auto xl:block">
          <DocToc activeId={activeId} />
          <button
            type="button"
            onClick={scrollToTop}
            className="mt-6 text-left text-[12px] text-muted-foreground transition-colors hover:text-foreground"
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
    <section id={id} className="scroll-mt-24 flex flex-col gap-4">
      <header
        className={cn(
          "flex flex-col gap-1.5",
          level === 2 && "border-b border-border/70 pb-3",
        )}
      >
        <Heading
          className={cn(
            "font-semibold tracking-tight text-foreground",
            level === 2 ? "text-xl sm:text-[1.35rem]" : "text-[15px]",
          )}
        >
          <a
            href={`#${id}`}
            className="group inline-flex items-baseline gap-1.5 no-underline hover:underline hover:decoration-border"
          >
            {title}
            <span className="text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/70">
              #
            </span>
          </a>
        </Heading>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function CodeBlock({
  code,
  language = "tsx",
}: {
  code: string;
  language?: string;
}) {
  return (
    <pre
      data-language={language}
      className="data-table-thin-scroll overflow-x-auto rounded-md border border-border/80 bg-[oklch(0.22_0.015_165)] p-4 text-[12.5px] leading-relaxed text-[oklch(0.93_0.01_95)] shadow-[inset_0_1px_0_oklch(1_0_0/0.06)] dark:bg-muted/40 dark:text-foreground"
    >
      <code className="font-mono whitespace-pre">{code.trim()}</code>
    </pre>
  );
}

export function PropsTable({
  rows,
  caption,
}: {
  rows: import("./api-types").PropRow[];
  caption?: string;
}) {
  return (
    <div className="data-table-thin-scroll overflow-x-auto rounded-md border border-border/80 bg-card/60 shadow-[0_1px_0_oklch(0_0_0/0.03)]">
      {caption ? (
        <p className="border-b border-border/70 bg-muted/30 px-3 py-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {caption}
        </p>
      ) : null}
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/35">
            <th className="px-3 py-2.5 text-[12px] font-semibold text-foreground">
              Prop
            </th>
            <th className="px-3 py-2.5 text-[12px] font-semibold text-foreground">
              Type
            </th>
            <th className="px-3 py-2.5 text-[12px] font-semibold text-foreground">
              Default
            </th>
            <th className="px-3 py-2.5 text-[12px] font-semibold text-foreground">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.name}
              className="border-b border-border/60 last:border-0 even:bg-muted/15"
            >
              <td className="px-3 py-2.5 align-top font-mono text-[12.5px] font-medium text-foreground">
                {row.name}
              </td>
              <td className="max-w-[14rem] px-3 py-2.5 align-top font-mono text-[11.5px] leading-snug break-all text-muted-foreground">
                {row.type}
              </td>
              <td className="px-3 py-2.5 align-top font-mono text-[12px] whitespace-nowrap text-muted-foreground">
                {row.default ?? "—"}
              </td>
              <td className="px-3 py-2.5 align-top text-[13px] leading-relaxed text-muted-foreground">
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
    <div className="rounded-md border border-[oklch(0.42_0.06_165_/0.25)] bg-[oklch(0.42_0.06_165_/0.06)] px-3.5 py-3 text-sm leading-relaxed text-muted-foreground">
      {title ? (
        <p className="mb-1 text-[12px] font-semibold tracking-wide text-foreground uppercase">
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}
