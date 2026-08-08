"use client";

import type { Block, BlockRegistry, Device } from "@itzsa/page-builder";
import {
  Box,
  ChevronDown,
  ChevronRight,
  Columns3,
  Copy,
  Eye,
  EyeOff,
  Heading1,
  Image as ImageIcon,
  Rows3,
  Square,
  Trash2,
  Type,
} from "lucide-react";
import { type ComponentType, useState } from "react";
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
};

export type CreateOutlineProps = {
  blocks: Block[];
  registry: BlockRegistry;
  selectedId: string | null;
  device: Device;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleHidden: (id: string) => void;
  depth?: number;
};

export function CreateOutline({
  blocks,
  registry,
  selectedId,
  device,
  onSelect,
  onRemove,
  onDuplicate,
  onToggleHidden,
  depth = 0,
}: CreateOutlineProps) {
  if (!blocks.length && depth === 0) {
    return (
      <p className="px-2 py-6 text-center text-[11px] text-gray-400">
        No blocks yet. Drag elements onto the canvas.
      </p>
    );
  }

  return (
    <div className="space-y-0.5 px-1.5 py-1">
      {blocks.map((block, index) => (
        <OutlineRow
          key={block.id}
          block={block}
          index={index}
          registry={registry}
          selectedId={selectedId}
          device={device}
          depth={depth}
          onSelect={onSelect}
          onRemove={onRemove}
          onDuplicate={onDuplicate}
          onToggleHidden={onToggleHidden}
        />
      ))}
    </div>
  );
}

function OutlineRow({
  block,
  index,
  registry,
  selectedId,
  device,
  depth,
  onSelect,
  onRemove,
  onDuplicate,
  onToggleHidden,
}: {
  block: Block;
  index: number;
  registry: BlockRegistry;
  selectedId: string | null;
  device: Device;
  depth: number;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleHidden: (id: string) => void;
}) {
  const def = registry.get(block.type);
  const Icon = ICON_MAP[block.type] ?? Square;
  const hasChildren = Boolean(block.children?.length);
  const [open, setOpen] = useState(true);
  const selected = selectedId === block.id;
  const hidden = block.visibility?.hiddenDevices?.includes(device) ?? false;
  const label = def?.label ?? block.type;

  return (
    <div>
      <div
        style={{ paddingLeft: 6 + depth * 14 }}
        className={cn(
          "group flex w-full items-center gap-0.5 rounded-md py-1.5 pr-1 text-left text-[12px] transition-colors",
          selected
            ? "bg-accent/10 text-accent ring-1 ring-accent/25"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          hidden && "opacity-45",
        )}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={open ? "Collapse" : "Expand"}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-card"
          >
            {open ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>
        ) : (
          <span className="w-5 shrink-0" aria-hidden />
        )}

        <button
          type="button"
          onClick={() => onSelect(block.id)}
          className="flex min-w-0 flex-1 items-center gap-1.5"
        >
          <span className="w-3.5 shrink-0 text-right text-[10px] text-muted-foreground/50 select-none">
            {index + 1}
          </span>
          <Icon
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              selected ? "text-accent" : "text-muted-foreground",
            )}
          />
          <span className="truncate font-medium capitalize">{label}</span>
          {hidden ? (
            <EyeOff
              className="h-3 w-3 shrink-0 text-muted-foreground"
              aria-hidden
            />
          ) : null}
        </button>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            aria-label={hidden ? `Show on ${device}` : `Hide on ${device}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleHidden(block.id);
            }}
            className="rounded p-1 text-muted-foreground hover:bg-card hover:text-accent"
          >
            {hidden ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
          </button>
          <button
            type="button"
            aria-label={`Duplicate ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(block.id);
            }}
            className="rounded p-1 text-muted-foreground hover:bg-card hover:text-accent"
          >
            <Copy className="h-3 w-3" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(block.id);
            }}
            className="rounded p-1 text-gray-400 hover:bg-white hover:text-red-500"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {hasChildren && open ? (
        <CreateOutline
          blocks={block.children ?? []}
          registry={registry}
          selectedId={selectedId}
          device={device}
          depth={depth + 1}
          onSelect={onSelect}
          onRemove={onRemove}
          onDuplicate={onDuplicate}
          onToggleHidden={onToggleHidden}
        />
      ) : null}
    </div>
  );
}
