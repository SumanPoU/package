"use client";

import Link from "next/link";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import { useScrollNavToActive } from "./use-scroll-nav-to-active";

export type DocsNavItem = {
  id: string;
  label: string;
  indent?: boolean;
};

export function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    if (ids.length === 0) return;

    const elements = () =>
      ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => Boolean(el));

    let frame = 0;
    const update = () => {
      const els = elements();
      if (els.length === 0) return;

      // Near page bottom → last heading (short trailing sections never reach the line).
      const doc = document.documentElement;
      const atBottom =
        window.scrollY + window.innerHeight >= doc.scrollHeight - 24;
      if (atBottom) {
        setActiveId(els[els.length - 1]!.id);
        return;
      }

      // Last section whose top has crossed the reading line (~header + TOC offset).
      const line = Math.min(120, window.innerHeight * 0.22);
      let current = els[0]!.id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    const onHash = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash && ids.includes(hash) && document.getElementById(hash)) {
        setActiveId(hash);
      }
    };

    update();
    onHash();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", onHash);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", onHash);
    };
  }, [ids]);

  return activeId;
}

function NavLink({
  item,
  active,
  size = "default",
}: {
  item: DocsNavItem;
  active: boolean;
  size?: "default" | "toc";
}) {
  return (
    <a
      href={`#${item.id}`}
      data-nav-id={item.id}
      aria-current={active ? "location" : undefined}
      className={cn(
        "group relative block rounded-sm transition-colors",
        size === "toc"
          ? "border-l-[0.5px] border-border py-1 pl-2.5 text-[12px] leading-snug"
          : "px-2 py-1 text-[12.5px]",
        item.indent &&
          size === "default" &&
          "ml-1.5 border-l-[0.5px] border-transparent pl-2.5 text-[12px]",
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

function parentSectionId(nav: DocsNavItem[], activeId: string): string {
  const idx = nav.findIndex((n) => n.id === activeId);
  if (idx < 0) return activeId;
  for (let i = idx; i >= 0; i--) {
    if (!nav[i]?.indent) return nav[i]?.id ?? activeId;
  }
  return activeId;
}

function childrenOf(nav: DocsNavItem[], parentId: string): DocsNavItem[] {
  const parentIdx = nav.findIndex((n) => n.id === parentId);
  if (parentIdx < 0) return [];
  const kids: DocsNavItem[] = [];
  for (let i = parentIdx + 1; i < nav.length; i++) {
    const item = nav[i]!;
    if (!item.indent) break;
    kids.push(item);
  }
  return kids;
}

/**
 * Shared docs chrome: sticky left nav + main + right TOC.
 * Left/right sidebars auto-scroll to the active section (same behavior for every package).
 */
export function PackageDocsShell({
  title,
  packageName,
  nav,
  children,
}: {
  title: string;
  packageName: string;
  nav: DocsNavItem[];
  children: ReactNode;
}) {
  const leftRef = useRef<HTMLElement>(null);
  const rightRef = useRef<HTMLElement>(null);

  const ids = useMemo(() => nav.map((n) => n.id), [nav]);
  const rightToc = useMemo(() => nav.filter((n) => !n.indent), [nav]);

  const activeId = useActiveSection(ids);
  const topActive = parentSectionId(nav, activeId);
  const sectionChildren = childrenOf(nav, topActive);

  useScrollNavToActive(activeId, leftRef);
  // Right rail: prefer the indented active link, else the parent TOC entry.
  const rightScrollId = sectionChildren.some((c) => c.id === activeId)
    ? activeId
    : topActive;
  useScrollNavToActive(rightScrollId, rightRef);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="docs-shell min-h-full bg-page text-[12.5px] leading-normal">
      <div className="mx-auto flex w-full max-w-[88rem] gap-3 px-4 py-5 sm:px-6 sm:py-6 lg:gap-6 lg:py-7 xl:gap-8">
        <aside
          ref={leftRef}
          data-docs-sidebar="left"
          className="sticky top-20 hidden h-[calc(100vh-6rem)] w-48 shrink-0 overflow-y-auto overscroll-contain lg:block xl:w-52"
        >
          <nav
            aria-label="Documentation"
            className="flex flex-col gap-0.5 pb-8"
          >
            <Link
              href="/"
              className="mb-4 text-[10px] font-medium tracking-[0.16em] text-secondary uppercase transition-colors hover:text-primary"
            >
              ← itzsa
            </Link>
            <div className="mb-3 flex flex-col gap-0.5 px-2">
              <p className="text-[13px] font-medium tracking-tight text-primary">
                {title}
              </p>
              <p className="pkg text-[10px]">{packageName}</p>
            </div>
            {nav.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                active={activeId === item.id}
              />
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-10 sm:pb-16">{children}</main>

        <aside
          ref={rightRef}
          data-docs-sidebar="right"
          className="sticky top-20 hidden h-[calc(100vh-6rem)] w-40 shrink-0 overflow-y-auto overscroll-contain xl:block"
        >
          <nav aria-label="On this page" className="flex flex-col pb-8">
            <p className="mb-2 text-[10px] font-medium tracking-[0.14em] text-tertiary uppercase">
              On this page
            </p>
            {rightToc.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                active={topActive === item.id}
                size="toc"
              />
            ))}
            {sectionChildren.length > 0 ? (
              <div className="mt-3 flex flex-col border-t-[0.5px] border-border pt-2.5">
                <p className="mb-1.5 text-[10px] text-tertiary">In section</p>
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
            className="mt-5 text-left text-[11px] text-secondary transition-colors hover:text-primary"
          >
            ↑ Back to top
          </button>
        </aside>
      </div>
    </div>
  );
}
