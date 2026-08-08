import { useMemo, useState } from "react";

import type { BlockRegistry } from "../../core/registry";
import { listPresets } from "../../presets";

const CATEGORY_ORDER = [
  "presets",
  "layout",
  "content",
  "media",
  "basic",
  "embeds",
] as const;

const CATEGORY_LABEL: Record<string, string> = {
  presets: "Presets",
  layout: "Layout",
  content: "Basic",
  media: "Media",
  basic: "Basic",
  embeds: "Embeds",
  marketing: "Marketing",
};

export type ElementsPanelProps = {
  registry: BlockRegistry;
  onStartDragNew: (type: string, e: React.PointerEvent) => void;
  onStartDragPreset?: (presetId: string, e: React.PointerEvent) => void;
  /** Optional click-to-insert fallback (accessibility). */
  onInsertType?: (type: string) => void;
  allowDataBinding?: boolean;
};

export const ElementsPanel = ({
  registry,
  onStartDragNew,
  onStartDragPreset,
  onInsertType,
  allowDataBinding = true,
}: ElementsPanelProps) => {
  const [search, setSearch] = useState("");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATEGORY_ORDER.map((c) => [c, true])),
  );

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

  const items = useMemo(() => {
    return registry
      .list()
      .filter((d) => (allowDataBinding ? true : d.type !== "repeater"))
      .filter(
        (d) => !q || d.label.toLowerCase().includes(q) || d.type.includes(q),
      )
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [registry, q, allowDataBinding]);

  const categories = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const cat = item.category || "basic";
      const list = map.get(cat) ?? [];
      list.push(item);
      map.set(cat, list);
    }
    const ordered = CATEGORY_ORDER.filter(
      (c) => c === "presets" || map.has(c),
    );
    for (const key of map.keys()) {
      if (!ordered.includes(key as (typeof CATEGORY_ORDER)[number])) {
        ordered.push(key as (typeof CATEGORY_ORDER)[number]);
      }
    }
    return ordered.map((cat) => ({
      cat,
      label: CATEGORY_LABEL[cat] ?? cat,
      items: map.get(cat) ?? [],
    }));
  }, [items]);

  const noResults = items.length === 0 && presets.length === 0;

  return (
    <div className="pb-elements">
      <div className="pb-elements-search">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          aria-label="Search elements"
          className="pb-elements-search-input"
        />
      </div>
      <div className="pb-elements-scroll">
        {categories.map(({ cat, label, items: catItems }) => {
          const isPresets = cat === "presets";
          if (isPresets && (!onStartDragPreset || presets.length === 0)) {
            return null;
          }
          if (!isPresets && !catItems.length) return null;
          const open = openCats[cat] !== false;
          return (
            <div key={cat} className="pb-elements-cat">
              <button
                type="button"
                className="pb-elements-cat-trigger"
                aria-expanded={open}
                onClick={() =>
                  setOpenCats((prev) => ({ ...prev, [cat]: !open }))
                }
              >
                {label}
              </button>
              {open ? (
                <div className="pb-elements-grid">
                  {isPresets
                    ? presets.map((preset) => (
                        <div
                          key={preset.id}
                          role="button"
                          tabIndex={0}
                          aria-label={`Insert ${preset.label} preset`}
                          title={preset.description}
                          className="pb-elements-tile"
                          onPointerDown={(e) =>
                            onStartDragPreset?.(preset.id, e)
                          }
                        >
                          <span className="pb-elements-tile-icon" aria-hidden>
                            {preset.label.slice(0, 1)}
                          </span>
                          <span className="pb-elements-tile-label">
                            {preset.label}
                          </span>
                        </div>
                      ))
                    : catItems.map((def) => (
                        <div
                          key={def.type}
                          role="button"
                          tabIndex={0}
                          aria-label={`Insert ${def.label}`}
                          className="pb-elements-tile"
                          onPointerDown={(e) => onStartDragNew(def.type, e)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onInsertType?.(def.type);
                            }
                          }}
                        >
                          <span className="pb-elements-tile-icon" aria-hidden>
                            {def.label.slice(0, 1)}
                          </span>
                          <span className="pb-elements-tile-label">
                            {def.label}
                          </span>
                        </div>
                      ))}
                </div>
              ) : null}
            </div>
          );
        })}
        {noResults ? (
          <p className="pb-elements-empty">
            No results for &quot;{search}&quot;
          </p>
        ) : null}
      </div>
    </div>
  );
};
