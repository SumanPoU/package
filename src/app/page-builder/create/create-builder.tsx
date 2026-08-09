"use client";

import {
  type Block,
  buildPreviewUrl,
  CanvasArea,
  type CustomScript,
  cloneBlock,
  composePageCss,
  createDefaultLocaleConfig,
  createEnglishOnlyLocaleConfig,
  createNepaliOnlyLocaleConfig,
  createPreviewSession,
  createRegistry,
  findBlock,
  findBlockPath,
  IframeCanvasStage,
  insertBlock,
  moveBlockByDelta,
  PAGE_SCHEMA_VERSION,
  type Page,
  type PageBuilderCapabilities,
  type PaletteConfig,
  type FetchDataSource,
  PageBuilderHostProvider,
  registerDynamicBlock,
  registerPrimitives,
  removeBlock,
  type UploadAsset,
  updateBlock,
  useBlockHistory,
  useClipboard,
  useDragAndDrop,
  useKeyboardShortcuts,
} from "@itzsa/page-builder";
import "@itzsa/page-builder/styles.css";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { BlockInspector } from "./block-inspector";
import { CreateOutline } from "./create-outline";
import { CreateLeftSidebar } from "./create-sidebar";
import { loadDraftPage, saveDraftPage } from "./draft-store";
import { type Device, EditorHeader } from "./editor-header";
import { type PageMetadata, PageSettingsDialog } from "./page-settings-dialog";
import { DEMO_PROMO_SPEC } from "../demo-promo-spec";
import { SAMPLE_DATA_SOURCES } from "../sample-data-sources";
import { SaveConflictDialog } from "./save-conflict-dialog";

/** `default` | `en` | `ne` — swap to demo single-locale hosts. */
const CREATE_LOCALE_MODE: "default" | "en" | "ne" = "default";

const localeConfig =
  CREATE_LOCALE_MODE === "en"
    ? createEnglishOnlyLocaleConfig()
    : CREATE_LOCALE_MODE === "ne"
      ? createNepaliOnlyLocaleConfig()
      : createDefaultLocaleConfig();

const CREATE_CAPABILITIES: PageBuilderCapabilities = {
  allowCustomCss: true,
  allowCustomJs: true,
  allowDataBinding: true,
  allowDynamicBlockDefs: true,
  allowRegisterTenantBlocks: true,
};

/** Host chrome flags (not package capabilities). */
const CREATE_FEATURES = {
  showHeader: true,
  showCodePanel: true,
  showPreview: true,
  showOpenPage: true,
  showPublish: true,
  /** `iframe` uses sandboxed `/page-builder/canvas` (DnD chrome limited). */
  canvasMode: "embedded" as "embedded" | "iframe",
  canvasSrc: "/page-builder/canvas",
};

/** Hide palette groups and/or individual blocks. Examples:
 *  hideCategories: ["embeds", "presets"]
 *  hideBlocks: ["html", "repeater"]
 */
const CREATE_PALETTE: PaletteConfig = {
  // hideCategories: ["embeds"],
  // hideBlocks: ["html"],
};

/** Host typography font stacks (appended to defaults in the Style tab). */
const CREATE_FONT_FAMILIES = [
  { label: "Inter", value: "Inter, ui-sans-serif, system-ui, sans-serif" },
  {
    label: "Noto Sans Devanagari",
    value: "'Noto Sans Devanagari', 'Noto Sans', sans-serif",
  },
];

const fetchSampleDataSource: FetchDataSource = async (sourceId) => {
  const data = SAMPLE_DATA_SOURCES[sourceId];
  if (!data) return { items: [], state: "empty" };
  return data;
};

function toSlug(name: string) {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "untitled-page"
  );
}

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
    registerDynamicBlock(r, DEMO_PROMO_SPEC);
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
  const [isPublishing, setIsPublishing] = useState(false);
  const [pageName, setPageName] = useState("Untitled page");
  const [pageNameNp, setPageNameNp] = useState("");
  const [statusActive, setStatusActive] = useState(true);
  const [metadata, setMetadata] = useState<PageMetadata>({});
  const [conflict, setConflict] = useState<{
    current: Page;
    expectedRevision: string | undefined;
    currentRevision: string | undefined;
    pending: Page;
  } | null>(null);

  const pageSlug = toSlug(pageName);

  const history = useBlockHistory({ page, onChange: setPage });
  const pageRef = useRef(page);
  pageRef.current = page;

  useEffect(() => {
    const stored = loadDraftPage(DRAFT_PAGE_ID);
    if (!stored) return;
    setPage(stored);
    const title = stored.meta.title;
    if (typeof title === "string" && title.trim()) setPageName(title);
    const titleNp = stored.meta.title_np;
    if (typeof titleNp === "string") setPageNameNp(titleNp);
    if (stored.meta.status === "inactive") setStatusActive(false);
  }, []);
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
    () => ({
      locale: activeLocale,
      device,
      dataSources: SAMPLE_DATA_SOURCES,
    }),
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

  const applySavedPage = useCallback((saved: Page) => {
    setPage(saved);
    pageRef.current = saved;
    const title = saved.meta.title;
    if (typeof title === "string" && title.trim()) setPageName(title);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  }, []);

  const buildPublishPage = useCallback((): Page => {
    const current = pageRef.current;
    return {
      ...current,
      meta: {
        ...current.meta,
        title: pageName,
        title_np: pageNameNp,
        status: statusActive ? "active" : "inactive",
        slug: pageSlug,
        ...metadata,
      },
    };
  }, [metadata, pageName, pageNameNp, pageSlug, statusActive]);

  const handlePublish = useCallback(
    async (opts: { overwrite?: boolean } = {}) => {
      setIsPublishing(true);
      try {
        const pending = buildPublishPage();

        const gate = await fetch("/api/page-builder/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: pending,
            expectedRevision: pending.revision,
          }),
        });
        if (gate.status === 422) {
          const body = (await gate.json()) as {
            cssErrors?: string[];
            jsErrors?: string[];
          };
          window.alert(
            [
              "Author CSS/JS rejected by server validation:",
              ...(body.cssErrors ?? []),
              ...(body.jsErrors ?? []),
            ]
              .filter(Boolean)
              .join("\n"),
          );
          return;
        }

        const result = saveDraftPage(pending, {
          expectedRevision: pending.revision,
          overwrite: opts.overwrite,
        });
        if (result.ok) {
          setConflict(null);
          applySavedPage(result.page);
          return;
        }
        if ("conflict" in result && result.conflict) {
          setConflict({
            current: result.current,
            expectedRevision: result.expectedRevision,
            currentRevision: result.currentRevision,
            pending,
          });
          return;
        }
        window.alert(result.error);
      } finally {
        setIsPublishing(false);
      }
    },
    [applySavedPage, buildPublishPage],
  );

  const uploadAsset = useCallback<UploadAsset>(async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/page-builder/upload", {
      method: "POST",
      body: form,
    });
    if (!res.ok) throw new Error(`upload failed (${res.status})`);
    const data = (await res.json()) as { url?: string };
    if (!data.url) throw new Error("upload missing url");
    return { url: data.url };
  }, []);

  const handlePreview = async () => {
    const session = await createPreviewSession({
      page: buildPublishPage(),
      activeLocale,
      store: "sessionStorage",
    });
    router.push(buildPreviewUrl("/page-builder/preview", session.id));
  };

  const handleOpenPage = async () => {
    const session = await createPreviewSession({
      page: buildPublishPage(),
      activeLocale,
      store: "sessionStorage",
      meta: { surface: "open" },
    });
    router.push(buildPreviewUrl("/page-builder/open", session.id, "page"));
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
      allowCustomCss={CREATE_CAPABILITIES.allowCustomCss !== false}
      allowCustomJs={CREATE_CAPABILITIES.allowCustomJs !== false}
      allowDataBinding={CREATE_CAPABILITIES.allowDataBinding !== false}
      fontFamilies={CREATE_FONT_FAMILIES}
    />
  ) : null;

  return (
    <div className="flex h-dvh flex-col bg-[#e8eaed] text-gray-900">
      <EditorHeader
        pageName={pageName}
        pageNameNp={pageNameNp}
        pageSlug={pageSlug}
        onPageNameChange={setPageName}
        onPageNameNpChange={setPageNameNp}
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
        onGlobalJsChange={(globalJs: CustomScript) =>
          history.push({ ...pageRef.current, globalJs })
        }
        onSettingsOpen={() => setSettingsOpen(true)}
        onPreview={() => void handlePreview()}
        onOpenPage={() => void handleOpenPage()}
        onPublish={() => void handlePublish()}
        isPublishing={isPublishing}
        savedFlash={savedFlash}
        sidebarOpen={sidebarOpen}
        onSidebarOpenChange={setSidebarOpen}
        showHeader={CREATE_FEATURES.showHeader}
        showCodePanel={CREATE_FEATURES.showCodePanel}
        showPreview={CREATE_FEATURES.showPreview}
        showOpenPage={CREATE_FEATURES.showOpenPage}
        showPublish={CREATE_FEATURES.showPublish}
      />

      <PageBuilderHostProvider value={{ uploadAsset }}>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <CreateLeftSidebar
          registry={registry}
          leftTab={leftTab}
          onLeftTabChange={setLeftTab}
          onStartDragNew={dnd.startDragNew}
          onStartDragPreset={dnd.startDragPreset}
          allowDataBinding={CREATE_CAPABILITIES.allowDataBinding !== false}
          palette={CREATE_PALETTE}
          outline={outline}
          inspector={inspector}
          open={sidebarOpen}
        />

        {CREATE_FEATURES.canvasMode === "iframe" ? (
          <IframeCanvasStage
            page={page}
            registry={registry}
            localeConfig={localeConfig}
            activeLocale={activeLocale}
            renderContext={renderContext}
            selectedId={selectedId}
            onSelect={setSelectedId}
            canvasSrc={CREATE_FEATURES.canvasSrc}
            device={device}
            pageSlug={pageSlug}
            capabilities={CREATE_CAPABILITIES}
            fetchDataSource={fetchSampleDataSource}
          />
        ) : (
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
            capabilities={CREATE_CAPABILITIES}
            fetchDataSource={fetchSampleDataSource}
          />
        )}
      </div>
      </PageBuilderHostProvider>

      {CREATE_FEATURES.canvasMode !== "iframe" && dnd.drag && dnd.pointer ? (
        <div
          className="pointer-events-none fixed z-50 flex items-center gap-1.5 rounded border border-gray-200 bg-white px-2 py-1 text-[11px] text-gray-600 shadow-md"
          style={{ left: dnd.pointer.x + 10, top: dnd.pointer.y + 10 }}
          aria-hidden
        >
          {dnd.drag.kind === "new" || dnd.drag.kind === "preset"
            ? dnd.drag.label
            : dnd.drag.type}
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

      <SaveConflictDialog
        open={Boolean(conflict)}
        expectedRevision={conflict?.expectedRevision}
        currentRevision={conflict?.currentRevision}
        onDismiss={() => setConflict(null)}
        onReload={() => {
          if (!conflict) return;
          applySavedPage(conflict.current);
          setConflict(null);
        }}
        onOverwrite={() => void handlePublish({ overwrite: true })}
      />
    </div>
  );
}
