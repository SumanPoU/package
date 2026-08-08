import { useMemo, useState } from "react";

import type { BlockRegistry } from "../../core/registry";

const CATEGORY_ORDER = [
  "layout",
  "content",
  "media",
  "basic",
  "embeds",
] as const;

const CATEGORY_LABEL: Record<string, string> = {
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
  /** Optional click-to-insert fallback (accessibility). */
  onInsertType?: (type: string) => void;
};

export const ElementsPanel = ({
  registry,
  onStartDragNew,
  onInsertType,
}: ElementsPanelProps) => {
  const [search, setSearch] = useState("");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATEGORY_ORDER.map((c) => [c, true])),
  );

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registry
      .list()
      .filter((d) => d.source === "core")
      .filter(
        (d) => !q || d.label.toLowerCase().includes(q) || d.type.includes(q),
      )
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [registry, search]);

  const categories = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const cat = item.category || "basic";
      const list = map.get(cat) ?? [];
      list.push(item);
      map.set(cat, list);
    }
    const ordered = CATEGORY_ORDER.filter((c) => map.has(c));
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
          if (!catItems.length) return null;
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
                  {catItems.map((def) => (
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
        {items.length === 0 ? (
          <p className="pb-elements-empty">
            No results for &quot;{search}&quot;
          </p>
        ) : null}
      </div>
    </div>
  );
};
