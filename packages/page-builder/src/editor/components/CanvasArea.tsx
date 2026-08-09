import { useEffect, useState } from "react";
import type { BridgeMeasurePayload } from "../../canvas/canvasBridge";
import { findBlock } from "../../core/blockTree";
import {
  isDataBindingAllowed,
  type PageBuilderCapabilities,
} from "../../core/capabilities";
import {
  type BindingRenderContext,
  type FetchDataSource,
  resolveBindingSource,
} from "../../core/dataBinding";
import { FallbackBlock } from "../../core/fallbackBlock";
import { resolveProps } from "../../core/i18nResolve";
import type { BlockRegistry } from "../../core/registry";
import type { Block, LocaleConfig } from "../../core/types";
import {
  type RenderContext,
  resolveVisibility,
} from "../../core/visibilityResolve";
import { RenderBlock } from "../../render/RenderBlock";
import type { DragPayload, HoverTarget } from "../hooks/useDragAndDrop";
import { BlockChrome } from "./BlockChrome";
import { SelectionOverlay } from "./SelectionOverlay";

export type CanvasAreaProps = {
  page: import("../../core/types").Page;
  registry: BlockRegistry;
  localeConfig: LocaleConfig;
  activeLocale: string;
  renderContext: RenderContext;
  drag: DragPayload | null;
  hover: HoverTarget;
  selectedId: string | null;
  isDraggingOverRoot: boolean;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  onDeselect: () => void;
  onSelect: (id: string) => void;
  onStartMove: (blockId: string, type: string, e: React.PointerEvent) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  registerRef: (id: string, el: HTMLElement | null) => void;
  authorCss?: string;
  device?: "desktop" | "tablet" | "mobile";
  pageSlug?: string;
  capabilities?: PageBuilderCapabilities;
  fetchDataSource?: FetchDataSource;
};

export const CanvasArea = ({
  page,
  registry,
  localeConfig,
  activeLocale,
  renderContext,
  drag,
  hover,
  selectedId,
  isDraggingOverRoot,
  canvasRef,
  onDeselect,
  onSelect,
  onStartMove,
  onRemove,
  onMoveUp,
  onMoveDown,
  registerRef,
  authorCss,
  device = "desktop",
  pageSlug = "page",
  capabilities,
  fetchDataSource,
}: CanvasAreaProps) => {
  const [measures, setMeasures] = useState(
    () => new Map<string, BridgeMeasurePayload["rect"]>(),
  );

  useEffect(() => {
    const root = canvasRef.current;
    if (!root) return;

    const report = () => {
      const map = new Map<string, BridgeMeasurePayload["rect"]>();
      const rootRect = root.getBoundingClientRect();
      root.querySelectorAll<HTMLElement>("[data-block-id]").forEach((el) => {
        const id = el.getAttribute("data-block-id");
        if (!id) return;
        const rect = el.getBoundingClientRect();
        map.set(id, {
          top: rect.top - rootRect.top + root.scrollTop,
          left: rect.left - rootRect.left + root.scrollLeft,
          width: rect.width,
          height: rect.height,
        });
      });
      setMeasures(map);
    };

    report();
    const ro = new ResizeObserver(report);
    ro.observe(root);
    root.addEventListener("scroll", report, { passive: true });
    window.addEventListener("resize", report);
    return () => {
      ro.disconnect();
      root.removeEventListener("scroll", report);
      window.removeEventListener("resize", report);
    };
  }, [canvasRef, page, selectedId, device, authorCss]);

  const renderChrome = (block: Block, depth: number, siblings: Block[]) => {
    const def = registry.get(block.type);
    const isContainer = Boolean(def?.isContainer);
    const Render = def?.render ?? FallbackBlock;
    const resolved = resolveProps(block, activeLocale, localeConfig);
    const index = siblings.findIndex((b) => b.id === block.id);
    const isGhost =
      resolveVisibility(block, renderContext, "canvas") === "ghost";

    // §25 — canvas WYSIWYG: expand repeater when host sample/live items exist.
    const binding = block.dataBinding;
    if (binding && isDataBindingAllowed(capabilities)) {
      const source = resolveBindingSource(
        binding.sourceId,
        renderContext as BindingRenderContext,
      );
      if (source.state === "ready" && source.items.length > 0) {
        return (
          <BlockChrome
            key={block.id}
            block={block}
            label={def?.label ?? block.type}
            isContainer={isContainer}
            selectedId={selectedId}
            drag={drag}
            hover={hover}
            depth={depth}
            ghost={isGhost}
            canMoveUp={index > 0}
            canMoveDown={index >= 0 && index < siblings.length - 1}
            onSelect={onSelect}
            onStartMove={onStartMove}
            onRemove={onRemove}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
            registerRef={registerRef}
            renderChild={(child, d) =>
              renderChrome(child, d, block.children ?? [])
            }
          >
            <RenderBlock
              block={block}
              registry={registry}
              localeConfig={localeConfig}
              activeLocale={activeLocale}
              renderContext={renderContext}
              surface="canvas"
              capabilities={capabilities}
              fetchDataSource={fetchDataSource}
            />
          </BlockChrome>
        );
      }
    }

    const childNodes = isContainer
      ? (block.children ?? []).map((child, childIndex) => (
          <div key={child.id} className="pb-canvas-slot">
            {drag &&
            hover?.containerId === block.id &&
            hover.index === childIndex ? (
              <div className="pb-drop-indicator" aria-hidden />
            ) : null}
            {renderChrome(child, depth + 1, block.children ?? [])}
          </div>
        ))
      : null;

    const content = isContainer ? (
      <Render block={block} props={resolved}>
        <div
          data-dropzone={block.id}
          className={[
            "pb-dropzone",
            drag && hover?.containerId === block.id
              ? "pb-dropzone--active"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {childNodes}
          {!block.children || block.children.length === 0 ? (
            <div className="pb-dropzone-empty">
              {drag ? "Drop here" : "Empty"}
            </div>
          ) : null}
          {drag &&
          hover?.containerId === block.id &&
          hover.index === (block.children?.length ?? 0) &&
          (block.children?.length ?? 0) > 0 ? (
            <div className="pb-drop-indicator" aria-hidden />
          ) : null}
        </div>
      </Render>
    ) : (
      <Render block={block} props={resolved} />
    );

    return (
      <BlockChrome
        key={block.id}
        block={block}
        label={def?.label ?? block.type}
        isContainer={isContainer}
        selectedId={selectedId}
        drag={drag}
        hover={hover}
        depth={depth}
        ghost={isGhost}
        canMoveUp={index > 0}
        canMoveDown={index >= 0 && index < siblings.length - 1}
        onSelect={onSelect}
        onStartMove={onStartMove}
        onRemove={onRemove}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        registerRef={registerRef}
        renderChild={(child, d) => renderChrome(child, d, block.children ?? [])}
      >
        {content}
      </BlockChrome>
    );
  };

  const selectedBlock = selectedId ? findBlock(page.blocks, selectedId) : null;
  const selectedGhost = selectedBlock
    ? resolveVisibility(selectedBlock, renderContext, "canvas") === "ghost"
    : false;

  return (
    <main className="pb-canvas-area">
      <div
        className={[
          "pb-canvas-device",
          device === "desktop" ? "pb-canvas-device--desktop" : "",
          device === "tablet" ? "pb-canvas-device--tablet" : "",
          device === "mobile" ? "pb-canvas-device--mobile" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {device !== "desktop" ? (
          <div className="pb-canvas-device-chrome">
            <span className="pb-canvas-device-dot" />
            <span className="pb-canvas-device-dot" />
            <span className="pb-canvas-device-dot" />
            <div className="pb-canvas-device-url">/{pageSlug}</div>
          </div>
        ) : null}
        <div className="pb-canvas-stage">
          <div
            ref={canvasRef}
            data-dropzone="root"
            data-pb-page={page.id}
            data-pb-surface="canvas"
            data-pb-device={device}
            lang={activeLocale}
            className={[
              "pb-canvas-root",
              isDraggingOverRoot ? "pb-canvas-root--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={onDeselect}
          >
            {authorCss ? (
              <style
                // biome-ignore lint/security/noDangerouslySetInnerHtml: author CSS via composer
                dangerouslySetInnerHTML={{ __html: authorCss }}
              />
            ) : null}

            {page.blocks.length === 0 && !drag ? (
              <div className="pb-canvas-empty">
                <div className="pb-canvas-empty-icon" aria-hidden>
                  ▦
                </div>
                <p>Drag a widget here to get started</p>
              </div>
            ) : null}

            {page.blocks.length === 0 && drag ? (
              <div className="pb-canvas-empty pb-canvas-empty--drop">
                <p>Drop here</p>
              </div>
            ) : null}

            {drag &&
            hover?.containerId === "root" &&
            hover.index === 0 &&
            page.blocks.length > 0 ? (
              <div className="pb-drop-indicator" aria-hidden />
            ) : null}

            {page.blocks.map((block, index) => (
              <div key={block.id}>
                {renderChrome(block, 0, page.blocks)}
                {drag &&
                hover?.containerId === "root" &&
                hover.index === index + 1 ? (
                  <div className="pb-drop-indicator" aria-hidden />
                ) : null}
              </div>
            ))}
          </div>
          <SelectionOverlay
            selectedId={selectedId}
            measures={measures}
            ghost={selectedGhost}
          />
        </div>
      </div>
    </main>
  );
};
