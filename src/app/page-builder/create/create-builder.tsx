"use client";

import {
  type Block,
  buildPreviewUrl,
  CanvasArea,
  cloneBlock,
  composePageCss,
  createDefaultLocaleConfig,
  createPreviewSession,
  createRegistry,
  findBlock,
  findBlockPath,
  insertBlock,
  moveBlockByDelta,
  PAGE_SCHEMA_VERSION,
  type Page,
  registerPrimitives,
  removeBlock,
  updateBlock,
  useBlockHistory,
  useClipboard,
  useDragAndDrop,
  useKeyboardShortcuts,
} from "@itzsa/page-builder";
import "@itzsa/page-builder/styles.css";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState } from "react";

import { BlockInspector } from "./block-inspector";
import { CreateOutline } from "./create-outline";
import { CreateLeftSidebar } from "./create-sidebar";
import { type Device, EditorHeader } from "./editor-header";
import { type PageMetadata, PageSettingsDialog } from "./page-settings-dialog";

function toSlug(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "untitled-page"
  );
}

const localeConfig = createDefaultLocaleConfig();

/** Stable across SSR + hydration — Date.now() here causes data-pb-page mismatch. */
const DRAFT_PAGE_ID = "page-draft";

const emptyPage = (): Page => ({
  id: DRAFT_PAGE_ID,
  schemaVersion: PAGE_SCHEMA_VERSION,
  revision: "1",
  meta: { title: "Untitled page" },
  blocks: [],
});

export function CreateBuilder() {
  const router = useRouter();
  const registry = useMemo(() => {
    const r = createRegistry();
    registerPrimitives(r);
    return r;
  }, []);

  const [page, setPage] = useState<Page>(emptyPage);
  const [activeLocale, setActiveLocale] = useState(localeConfig.defaultLocale);
  const [device, setDevice] = useState<Device>("desktop");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [leftTab, setLeftTab] = useState<"elements" | "outline">("elements");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [pageName, setPageName] = useState("Untitled page");
  const [pageNameNp, setPageNameNp] = useState("");
  const [statusActive, setStatusActive] = useState(true);
  const [metadata, setMetadata] = useState<PageMetadata>({});

  const pageSlug = toSlug(pageName);

  const history = useBlockHistory({ page, onChange: setPage });
  const pageRef = useRef(page);
  pageRef.current = page;
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

  const selectedBlock = selectedId
    ? (findBlock(page.blocks, selectedId) ?? null)
    : null;

  const renderContext = useMemo(
    () => ({ locale: activeLocale, device }),
    [activeLocale, device],
  );

  const authorCss = useMemo(() => composePageCss(page).css, [page]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    try {
      history.push({ ...page, blocks: removeBlock(page.blocks, selectedId) });
      setSelectedId(null);
    } catch {
      // no-op
    }
  }, [history, page, selectedId]);

  useKeyboardShortcuts({
    onDelete: handleDelete,
    onCopy: clipboard.copy,
    onCut: clipboard.cut,
    onPaste: clipboard.paste,
    onDuplicate: clipboard.duplicate,
    onUndo: history.undo,
    onRedo: history.redo,
  });

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
    [history, page, selectedId],
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

  const handleDuplicateBlock = useCallback(
    (id: string) => {
      const path = findBlockPath(page.blocks, id);
      const block = path?.block;
      if (!path || !block) return;
      try {
        const clone = cloneBlock(block);
        const parentId = path.parent?.id ?? null;
        history.push({
          ...page,
          blocks: insertBlock(page.blocks, clone, parentId, path.index + 1),
        });
        setSelectedId(clone.id);
      } catch {
        // no-op
      }
    },
    [history, page],
  );

  const handleToggleHidden = useCallback(
    (id: string) => {
      const block = findBlock(page.blocks, id);
      if (!block) return;
      const hidden = block.visibility?.hiddenDevices ?? [];
      const next = hidden.includes(device)
        ? hidden.filter((d) => d !== device)
        : [...hidden, device];
      handleChangeBlock(id, {
        visibility: { ...(block.visibility ?? {}), hiddenDevices: next },
      });
    },
    [device, handleChangeBlock, page.blocks],
  );

  const flashSaved = () => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  };

  const handlePublish = () => {
    const revision = String(Number(page.revision ?? "0") + 1);
    setPage({
      ...page,
      revision,
      meta: {
        ...page.meta,
        title: pageName,
        title_np: pageNameNp,
        status: statusActive ? "active" : "inactive",
        slug: pageSlug,
        ...metadata,
      },
    });
    flashSaved();
  };

  const handlePreview = async () => {
    const session = await createPreviewSession({
      page: {
        ...page,
        meta: { ...page.meta, title: pageName, slug: pageSlug, ...metadata },
      },
      activeLocale,
      store: "sessionStorage",
    });
    router.push(buildPreviewUrl("/page-builder/preview", session.id));
  };

  const outline = (
    <CreateOutline
      blocks={page.blocks}
      registry={registry}
      selectedId={selectedId}
      device={device}
      onSelect={setSelectedId}
      onRemove={handleRemoveBlock}
      onDuplicate={handleDuplicateBlock}
      onToggleHidden={handleToggleHidden}
    />
  );

  const inspector = selectedBlock ? (
    <BlockInspector
      block={selectedBlock}
      registry={registry}
      locale={activeLocale}
      locales={localeConfig.locales}
      localeConfig={localeConfig}
      device={device}
      onDeviceChange={setDevice}
      onLocaleChange={setActiveLocale}
      onBack={() => setSelectedId(null)}
      onChange={(patch) => handleChangeBlock(selectedBlock.id, patch)}
      onRemove={() => handleRemoveBlock(selectedBlock.id)}
    />
  ) : null;

  return (
    <div className="flex h-dvh flex-col bg-[#e8eaed] text-gray-900">
      <EditorHeader
        pageName={pageName}
        pageSlug={pageSlug}
        onPageNameChange={setPageName}
        device={device}
        onDeviceChange={setDevice}
        activeLocale={activeLocale}
        onActiveLocaleChange={setActiveLocale}
        locales={localeConfig.locales}
        page={page}
        registry={registry}
        localeConfig={localeConfig}
        onGlobalCssChange={(globalCss) =>
          history.push({ ...pageRef.current, globalCss })
        }
        onSettingsOpen={() => setSettingsOpen(true)}
        onPreview={() => void handlePreview()}
        onPublish={handlePublish}
        savedFlash={savedFlash}
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <CreateLeftSidebar
          registry={registry}
          leftTab={leftTab}
          onLeftTabChange={setLeftTab}
          onStartDragNew={dnd.startDragNew}
          outline={outline}
          inspector={inspector}
          open={sidebarOpen}
        />

        <CanvasArea
          page={page}
          registry={registry}
          localeConfig={localeConfig}
          activeLocale={activeLocale}
          renderContext={renderContext}
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
          device={device}
          pageSlug={pageSlug}
        />
      </div>

      {dnd.drag && dnd.pointer ? (
        <div
          className="pointer-events-none fixed z-50 flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-600 shadow-md"
          style={{ left: dnd.pointer.x + 10, top: dnd.pointer.y + 10 }}
          aria-hidden
        >
          {dnd.drag.kind === "new" ? dnd.drag.label : dnd.drag.type}
        </div>
      ) : null}

      <PageSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        pageName={pageName}
        pageNameNp={pageNameNp}
        pageSlug={pageSlug}
        onPageNameChange={setPageName}
        onPageNameNpChange={setPageNameNp}
        status={statusActive}
        onStatusChange={setStatusActive}
        metadata={metadata}
        onMetadataChange={(key, value) =>
          setMetadata((m) => ({ ...m, [key]: value }))
        }
      />
    </div>
  );
}
