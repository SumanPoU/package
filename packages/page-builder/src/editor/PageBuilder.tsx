import { useCallback, useMemo, useState } from "react";
import {
  createBlockFromDefinition,
  findBlock,
  insertBlock,
  moveBlockByDelta,
  removeBlock,
  updateBlock,
} from "../core/blockTree";
import type { PageBuilderCapabilities } from "../core/capabilities";
import { composePageCss } from "../core/customCssComposer";
import type { FetchDataSource } from "../core/dataBinding";
import type { BlockRegistry } from "../core/registry";
import type { Block, LocaleConfig, Page } from "../core/types";
import type { RenderContext } from "../core/visibilityResolve";
import { CanvasArea } from "./components/CanvasArea";
import { DragGhost } from "./components/DragGhost";
import { IframeCanvasStage } from "./components/IframeCanvasStage";
import { LeftSidebar } from "./components/LeftSidebar";
import type { CanvasMode, PageBuilderUiFeatures } from "./features";
import { useBlockHistory } from "./hooks/useBlockHistory";
import { useClipboard } from "./hooks/useClipboard";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { PageBuilderHostProvider, type UploadAsset } from "./hostContext";

export type { PageBuilderCapabilities };
export type { CanvasMode, PageBuilderUiFeatures, UploadAsset };

export type PageBuilderProps = {
  page: Page;
  onChange: (page: Page) => void;
  localeConfig: LocaleConfig;
  registry: BlockRegistry;
  activeLocale: string;
  onActiveLocaleChange: (locale: string) => void;
  onSave?: (
    page: Page,
    opts: { expectedRevision?: string },
  ) => void | Promise<void>;
  onPreview?: (page: Page) => void | Promise<void>;
  onOpenPage?: (page: Page) => void | Promise<void>;
  capabilities?: PageBuilderCapabilities;
  renderContext?: Partial<RenderContext>;
  fetchDataSource?: FetchDataSource;
  /** Host CDN / media upload — Image Upload prefers this over Base64. */
  uploadAsset?: UploadAsset;
  selectedId?: string | null;
  onSelectedIdChange?: (id: string | null) => void;
  title?: string;
  /** Toolbar visibility flags (host chrome). */
  features?: PageBuilderUiFeatures;
  /**
   * `embedded` (default): same-doc editable canvas with DnD chrome.
   * `iframe`: sandboxed shell at `canvasSrc` (ADR-02).
   */
  canvasMode?: CanvasMode;
  /** Required when canvasMode is `iframe` — e.g. `/page-builder/canvas`. */
  canvasSrc?: string;
  canvasNonce?: string;
};

export const PageBuilder = ({
  page,
  onChange,
  localeConfig,
  registry,
  activeLocale,
  onActiveLocaleChange,
  onSave,
  onPreview,
  onOpenPage,
  capabilities,
  renderContext,
  fetchDataSource,
  uploadAsset,
  selectedId: controlledSelectedId,
  onSelectedIdChange,
  title = "Page builder",
  features,
  canvasMode = "embedded",
  canvasSrc,
  canvasNonce,
}: PageBuilderProps) => {
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selectedId =
    controlledSelectedId !== undefined
      ? controlledSelectedId
      : internalSelected;
  const setSelectedId = useCallback(
    (id: string | null) => {
      onSelectedIdChange?.(id);
      if (controlledSelectedId === undefined) setInternalSelected(id);
    },
    [controlledSelectedId, onSelectedIdChange],
  );

  const [leftTab, setLeftTab] = useState<"elements" | "outline">("elements");

  const history = useBlockHistory({ page, onChange });
  const clipboard = useClipboard({
    page,
    selectedId,
    registry,
    push: history.push,
    onSelect: setSelectedId,
  });
  const dnd = useDragAndDrop({
    page,
    registry,
    push: history.push,
    onSelect: setSelectedId,
  });

  const ctx: RenderContext = useMemo(
    () => ({
      device: "desktop",
      ...renderContext,
      locale: renderContext?.locale ?? activeLocale,
    }),
    [activeLocale, renderContext],
  );

  const selectedBlock = selectedId
    ? (findBlock(page.blocks, selectedId) ?? null)
    : null;

  const authorCss = useMemo(() => composePageCss(page).css, [page]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    try {
      history.push({ ...page, blocks: removeBlock(page.blocks, selectedId) });
      setSelectedId(null);
    } catch {
      // no-op
    }
  }, [history, page, selectedId, setSelectedId]);

  useKeyboardShortcuts({
    onDelete: handleDelete,
    onCopy: clipboard.copy,
    onCut: clipboard.cut,
    onPaste: clipboard.paste,
    onDuplicate: clipboard.duplicate,
    onUndo: history.undo,
    onRedo: history.redo,
  });

  const handleInsertType = useCallback(
    (type: string) => {
      const def = registry.get(type);
      if (!def) return;
      const block = createBlockFromDefinition(def);
      let parentId: string | null = null;
      if (selectedId) {
        const selected = findBlock(page.blocks, selectedId);
        const selectedDef = selected ? registry.get(selected.type) : undefined;
        if (
          selected &&
          selectedDef?.isContainer &&
          (selectedDef.canAcceptChild?.(type) ?? true)
        ) {
          parentId = selected.id;
        }
      }
      try {
        history.push({
          ...page,
          blocks: insertBlock(page.blocks, block, parentId),
        });
        setSelectedId(block.id);
      } catch {
        // no-op
      }
    },
    [history, page, registry, selectedId, setSelectedId],
  );

  const handleChangeBlock = useCallback(
    (id: string, patch: Partial<Block>) => {
      try {
        history.push({
          ...page,
          blocks: updateBlock(page.blocks, id, (b) => ({ ...b, ...patch })),
        });
      } catch {
        // no-op
      }
    },
    [history, page],
  );

  const handleRemoveBlock = useCallback(
    (id: string) => {
      try {
        history.push({ ...page, blocks: removeBlock(page.blocks, id) });
        if (selectedId === id) setSelectedId(null);
      } catch {
        // no-op
      }
    },
    [history, page, selectedId, setSelectedId],
  );

  const handleMoveBlock = useCallback(
    (id: string, delta: -1 | 1) => {
      try {
        const next = moveBlockByDelta(page.blocks, id, delta);
        if (next === page.blocks) return;
        history.push({ ...page, blocks: next });
      } catch {
        // no-op
      }
    },
    [history, page],
  );

  const useIframe = canvasMode === "iframe" && Boolean(canvasSrc);
  const showSave = features?.showSave !== false && Boolean(onSave);
  const showPreview = features?.showPreview !== false && Boolean(onPreview);
  const showOpenPage = features?.showOpenPage !== false && Boolean(onOpenPage);

  const hostValue = useMemo(() => ({ uploadAsset }), [uploadAsset]);

  return (
    <PageBuilderHostProvider value={hostValue}>
      <div className="pb-root" data-pb-editor="">
        <div className="pb-toolbar" role="toolbar" aria-label="Page builder">
          <span className="pb-toolbar-title">{title}</span>
          <button
            type="button"
            disabled={!history.canUndo}
            onClick={history.undo}
            aria-label="Undo"
          >
            Undo
          </button>
          <button
            type="button"
            disabled={!history.canRedo}
            onClick={history.redo}
            aria-label="Redo"
          >
            Redo
          </button>
          <label>
            Locale
            <select
              value={activeLocale}
              aria-label="Active locale"
              onChange={(e) => onActiveLocaleChange(e.target.value)}
            >
              {localeConfig.locales.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <span className="pb-toolbar-spacer" />
          {showSave ? (
            <button
              type="button"
              onClick={() =>
                void onSave?.(page, { expectedRevision: page.revision })
              }
            >
              Save
            </button>
          ) : null}
          {showPreview ? (
            <button type="button" onClick={() => void onPreview?.(page)}>
              Preview
            </button>
          ) : null}
          {showOpenPage ? (
            <button type="button" onClick={() => void onOpenPage?.(page)}>
              Open Page
            </button>
          ) : null}
        </div>

        <div className="pb-body">
          <LeftSidebar
            page={page}
            registry={registry}
            selectedId={selectedId}
            selectedBlock={selectedBlock}
            locale={activeLocale}
            renderContext={ctx}
            leftTab={leftTab}
            onLeftTabChange={setLeftTab}
            onSelect={setSelectedId}
            onStartDragNew={dnd.startDragNew}
            onStartDragPreset={dnd.startDragPreset}
            onInsertType={handleInsertType}
            onChangeBlock={handleChangeBlock}
            onRemoveBlock={handleRemoveBlock}
            allowCustomCss={capabilities?.allowCustomCss !== false}
            allowCustomJs={capabilities?.allowCustomJs !== false}
            allowDataBinding={capabilities?.allowDataBinding !== false}
          />

          {useIframe && canvasSrc ? (
            <IframeCanvasStage
              page={page}
              registry={registry}
              localeConfig={localeConfig}
              activeLocale={activeLocale}
              renderContext={ctx}
              selectedId={selectedId}
              onSelect={setSelectedId}
              canvasSrc={canvasSrc}
              nonce={canvasNonce}
              capabilities={capabilities}
              fetchDataSource={fetchDataSource}
            />
          ) : (
            <CanvasArea
              page={page}
              registry={registry}
              localeConfig={localeConfig}
              activeLocale={activeLocale}
              renderContext={ctx}
              drag={dnd.drag}
              hover={dnd.hover}
              selectedId={selectedId}
              isDraggingOverRoot={dnd.isDraggingOverRoot}
              canvasRef={dnd.canvasRef}
              onDeselect={() => setSelectedId(null)}
              onSelect={setSelectedId}
              onStartMove={dnd.startDragMove}
              onRemove={handleRemoveBlock}
              onMoveUp={(id) => handleMoveBlock(id, -1)}
              onMoveDown={(id) => handleMoveBlock(id, 1)}
              registerRef={dnd.registerRef}
              authorCss={authorCss}
              capabilities={capabilities}
              fetchDataSource={fetchDataSource}
            />
          )}
        </div>

        {!useIframe && dnd.drag && dnd.pointer ? (
          <DragGhost drag={dnd.drag} pointer={dnd.pointer} />
        ) : null}
      </div>
    </PageBuilderHostProvider>
  );
};
