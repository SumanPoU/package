"use client";

import type { BlockDefinition, BlockRegistry } from "@itzsa/page-builder";
import { listPresets } from "@itzsa/page-builder";
import {
  Box,
  ChevronDown,
  Columns3,
  Heading1,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  LayoutTemplate,
  ListOrdered,
  Minus,
  PanelsTopLeft,
  Rows3,
  Search,
  Square,
  Type,
} from "lucide-react";
import { type ComponentType, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  container: Box,
  box: Box,
  flex: Rows3,
  grid: Columns3,
  heading: Heading1,
  text: Type,
  image: ImageIcon,
  button: Square,
  list: ListOrdered,
  divider: Minus,
  spacer: Minus,
  repeater: ListOrdered,
};

const PRESET_ICON: Record<string, ComponentType<{ className?: string }>> = {
  card: LayoutTemplate,
  hero: PanelsTopLeft,
};

const CATEGORY_ORDER = ["presets", "layout", "basic", "media", "embeds"] as const;
const CATEGORY_LABEL: Record<string, string> = {
  presets: "Presets",
  layout: "Layout",
  basic: "Basic",
  media: "Basic",
  content: "Basic",
  embeds: "Embeds",
};

export type CreateElementsPanelProps = {
  registry: BlockRegistry;
  onStartDragNew: (type: string, e: React.PointerEvent) => void;
  onStartDragPreset: (presetId: string, e: React.PointerEvent) => void;
  allowDataBinding?: boolean;
};

export function CreateElementsPanel({
  registry,
  onStartDragNew,
  onStartDragPreset,
  allowDataBinding = true,
}: CreateElementsPanelProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({
    presets: true,
    layout: true,
    basic: true,
  });

  const q = search.trim().toLowerCase();

  const presets = useMemo(
    () =>
      listPresets().filter(
        (p) =>
          !q ||
          p.label.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q),
      ),
    [q],
  );

  const filtered = useMemo(() => {
    return registry
      .list()
      .filter((d) => (allowDataBinding ? true : d.type !== "repeater"))
      .filter(
        (d) =>
          !q ||
          d.label.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q),
      )
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [registry, q, allowDataBinding]);

  const groups = useMemo(() => {
    const map = new Map<string, BlockDefinition[]>();
    for (const item of filtered) {
      let cat = item.category || "basic";
      if (cat === "content" || cat === "media") cat = "basic";
      const list = map.get(cat) ?? [];
      list.push(item);
      map.set(cat, list);
    }
    return CATEGORY_ORDER.filter(
      (c) => c === "presets" || map.has(c),
    ).map((cat) => ({
      cat,
      label: CATEGORY_LABEL[cat] ?? cat,
      items: map.get(cat) ?? [],
    }));
  }, [filtered]);

  const noResults = filtered.length === 0 && presets.length === 0;

  return (
    <>
      <div className="border-b border-gray-100 px-2 py-1.5">
        <div className="relative">
          <Search className="absolute top-1.5 left-2 h-3.5 w-3.5 text-gray-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            aria-label="Search elements"
            className="h-7 w-full rounded border border-gray-100 bg-white pr-2 pl-7 text-[11px] text-gray-700 outline-none focus:border-gray-200"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-12">
        {groups.map(({ cat, label, items }) => {
          const isOpen = open[cat] !== false;
          const showPresets = cat === "presets";
          if (showPresets && presets.length === 0) return null;
          if (!showPresets && items.length === 0) return null;
          return (
            <div key={cat} className="border-b border-gray-100">
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen((prev) => ({ ...prev, [cat]: !isOpen }))}
                className="flex w-full items-center justify-between py-2 text-[11px] font-medium tracking-wide text-gray-400 uppercase hover:text-gray-500"
              >
                {label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    isOpen ? "rotate-0" : "-rotate-90",
                  )}
                />
              </button>
              {isOpen ? (
                <div className="grid grid-cols-2 gap-1.5 pb-2">
                  {showPresets
                    ? presets.map((preset) => {
                        const Icon = PRESET_ICON[preset.id] ?? LayoutGrid;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            aria-label={`Insert ${preset.label} preset`}
                            title={preset.description}
                            onPointerDown={(e) =>
                              onStartDragPreset(preset.id, e)
                            }
                            className="flex cursor-grab touch-none select-none flex-col items-center gap-1 rounded border border-accent/20 bg-accent/5 px-1 py-3 text-center transition-colors hover:border-accent/40 hover:bg-white active:cursor-grabbing"
                          >
                            <Icon className="h-4 w-4 text-accent" />
                            <span className="text-[11px] text-gray-600">
                              {preset.label}
                            </span>
                          </button>
                        );
                      })
                    : items.map((def) => {
                        const Icon = ICON_MAP[def.type] ?? LayoutGrid;
                        return (
                          <button
                            key={def.type}
                            type="button"
                            aria-label={`Insert ${def.label}`}
                            onPointerDown={(e) => onStartDragNew(def.type, e)}
                            className="flex cursor-grab touch-none select-none flex-col items-center gap-1 rounded border border-gray-100 bg-gray-50 px-1 py-3 text-center transition-colors hover:border-gray-200 hover:bg-white active:cursor-grabbing"
                          >
                            <Icon className="h-4 w-4 text-gray-400" />
                            <span className="text-[11px] text-gray-500">
                              {def.label}
                            </span>
                          </button>
                        );
                      })}
                </div>
              ) : null}
            </div>
          );
        })}
        {noResults ? (
          <p className="py-4 text-center text-[11px] text-gray-400">
            No results for &quot;{search}&quot;
          </p>
        ) : null}
      </div>
    </>
  );
}

export type CreateLeftSidebarProps = {
  registry: BlockRegistry;
  leftTab: "elements" | "outline";
  onLeftTabChange: (tab: "elements" | "outline") => void;
  onStartDragNew: (type: string, e: React.PointerEvent) => void;
  onStartDragPreset: (presetId: string, e: React.PointerEvent) => void;
  allowDataBinding?: boolean;
  outline: React.ReactNode;
  inspector: React.ReactNode | null;
  /** When false, sidebar is hidden (toggle lives in the header). */
  open?: boolean;
};

const SIDEBAR_WIDTH = "w-[272px]";

export function CreateLeftSidebar({
  registry,
  leftTab,
  onLeftTabChange,
  onStartDragNew,
  onStartDragPreset,
  allowDataBinding = true,
  outline,
  inspector,
  open = true,
}: CreateLeftSidebarProps) {
  if (!open) return null;

  if (inspector) {
    return (
      <aside
        className={cn(
          "flex shrink-0 flex-col overflow-hidden border-r border-gray-200/80 bg-white shadow-[1px_0_0_rgb(0_0_0/0.02)]",
          SIDEBAR_WIDTH,
        )}
      >
        {inspector}
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col overflow-hidden border-r border-gray-200/80 bg-white shadow-[1px_0_0_rgb(0_0_0/0.02)]",
        SIDEBAR_WIDTH,
      )}
    >
      <div className="border-b border-gray-100 px-2 pt-2 pb-2">
        <div className="flex h-8 w-full gap-0.5 rounded-lg bg-gray-100/80 p-1">
          <button
            type="button"
            onClick={() => onLeftTabChange("elements")}
            className={cn(
              "flex h-6 flex-1 items-center justify-center gap-1 rounded-md text-[11px] font-medium",
              leftTab === "elements"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            <LayoutGrid className="h-3 w-3" /> Elements
          </button>
          <button
            type="button"
            onClick={() => onLeftTabChange("outline")}
            className={cn(
              "flex h-6 flex-1 items-center justify-center gap-1 rounded-md text-[11px] font-medium",
              leftTab === "outline"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            <Layers className="h-3 w-3" /> Outline
          </button>
        </div>
      </div>
      {leftTab === "elements" ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <CreateElementsPanel
            registry={registry}
            onStartDragNew={onStartDragNew}
            onStartDragPreset={onStartDragPreset}
            allowDataBinding={allowDataBinding}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2">{outline}</div>
      )}
    </aside>
  );
}
