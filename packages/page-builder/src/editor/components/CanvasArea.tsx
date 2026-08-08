import { FallbackBlock } from "../../core/fallbackBlock";
import { resolveProps } from "../../core/i18nResolve";
import type { BlockRegistry } from "../../core/registry";
import type { Block, LocaleConfig } from "../../core/types";
import type { RenderContext } from "../../core/visibilityResolve";
import type { DragPayload, HoverTarget } from "../hooks/useDragAndDrop";
import { BlockChrome } from "./BlockChrome";

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
}: CanvasAreaProps) => {
  const renderChrome = (block: Block, depth: number, siblings: Block[]) => {
    const def = registry.get(block.type);
    const isContainer = Boolean(def?.isContainer);
    const Render = def?.render ?? FallbackBlock;
    const resolved = resolveProps(block, activeLocale, localeConfig);
    const index = siblings.findIndex((b) => b.id === block.id);

    const childNodes = isContainer
      ? (block.children ?? []).map((child, childIndex) => (
          <div key={child.id}>
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
            block.type === "flex" ? "pb-dropzone--flex" : "",
            block.type === "grid" ? "pb-dropzone--grid" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {childNodes}
          {(!block.children || block.children.length === 0) && drag ? (
            <div className="pb-dropzone-empty">Drop here</div>
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
      </div>
    </main>
  );
};
