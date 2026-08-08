import { LOCALES, SUPPORTED_LANGUAGES } from '@/config/languages';
import { useLanguageSync } from '@/hooks/useLanguageSync';
import { useAddPage, useUpdatePage, useShowPage } from '@/services/website/use-pages';
import { useToast } from '@/components/ui/use-toast';
import { ZodError } from 'zod';
import { selectLanguage } from '@/store/slice/languageSlice';
import { useNavigate, useSearch, useRouter } from '@tanstack/react-router';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

import type {
  Block,
  Device,
  DeviceVisibility,
  ResponsiveOverrides,
  I18nProps,
  AdvancedStyle,
} from './types';
import { COMPONENT_LIBRARY } from './constants';
import {
  findBlock,
  removeBlockFromTree,
  updateBlockInTree,
  generatePreviewHTML,
  resolveProps,
  storePreviewPayload,
} from './utils';
import { resolveBlockTree } from './blockTreeHelpers';
import { getLangCodeForField } from './langFieldMap';

import { useBlockHistory } from './hooks/useBlockHistory';
import { useClipboard } from './hooks/useClipboard';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useDynamicFonts } from './hooks/useDynamicFonts';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { usePageMeta } from './hooks/usePageMeta';
import { usePageHydration } from './hooks/usePageHydration';

import { HTMLOutput } from './components/HTMLOutput';
import GridDialog from './components/GridDialog';
import { PageSettingsDialog } from './components/PageSettingsDialog';
import { EditorHeader } from './components/EditorHeader';
import { LeftSidebar } from './components/LeftSidebar';
import { CanvasArea } from './components/CanvasArea';
import { DragGhost } from './components/DragGhost';

import { validateBlockTree, formatBlockTreeValidationError } from './core/schema/block.schema';

import './blocks';

export default function PageBuilder() {
  useLanguageSync();
  const navigate = useNavigate();
  const router = useRouter();
  const { pageId: pageIdParam } = useSearch({ strict: false }) as {
    pageId?: string | number;
  };
  const editingPageId =
    pageIdParam !== undefined && pageIdParam !== null && pageIdParam !== ''
      ? Number(pageIdParam)
      : null;
  const isEditMode = editingPageId != null && !Number.isNaN(editingPageId) && editingPageId > 0;

  const currentLang = useSelector(selectLanguage);
  const [device, setDevice] = useState<Device>('desktop');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [panelTab, setPanelTab] = useState<'content' | 'style' | 'advanced'>('content');
  const [leftTab, setLeftTab] = useState<'elements' | 'outline'>('elements');

  const { blocks, setBlocks, setBlocksWithHistory, undo, redo } = useBlockHistory();
  const selectedBlock = selectedId ? findBlock(blocks, selectedId) : null;

  const { clipboardRef, handlePaste } = useClipboard(
    selectedId,
    setBlocksWithHistory,
    setSelectedId,
  );
  useKeyboardShortcuts(selectedBlock, clipboardRef, handlePaste, undo, redo);

  const {
    pageId,
    setPageId,
    pageNameI18n,
    setPageNameI18n,
    pageName,
    pageSlug,
    pageDescription,
    setPageName,
    settingsOpen,
    setSettingsOpen,
    savedFlash,
    setSavedFlash,
    status,
    setStatus,
    metadata,
    setMetadata,
    codeOpen,
    setCodeOpen,
    codeCopied,
    setCodeCopied,
    primaryLangCode,
    secondaryLangCode,
  } = usePageMeta(currentLang);

  const {
    drag,
    pointer,
    hover,
    canvasRef,
    registerRef,
    pendingDrop,
    setPendingDrop,
    startDragNew,
    startDragMove,
    isDraggingOverRoot,
  } = useDragAndDrop(blocks, setBlocksWithHistory, currentLang, setSelectedId, setPanelTab);

  useDynamicFonts(blocks);

  const { mutate: addPage, isPending: isAdding } = useAddPage();
  const { mutate: updatePage, isPending: isUpdating } = useUpdatePage(editingPageId ?? 0);
  const isPublishing = isAdding || isUpdating;
  const { toast } = useToast();

  const { page: existingPage, isLoading: isLoadingPage } = useShowPage(
    isEditMode ? editingPageId! : undefined,
  );

  const { showLoading } = usePageHydration(
    isEditMode,
    existingPage,
    isLoadingPage,
    currentLang,
    setPageId,
    setPageNameI18n,
    setBlocks,
    setMetadata,
    setStatus,
  );

  useEffect(() => {
    setBlocks((prev) => prev.map((b) => resolveBlockTree(b, currentLang)));
  }, [currentLang, setBlocks]);

  const updateBlockI18n = (id: string, i18nProps: I18nProps) => {
    setBlocksWithHistory((p) =>
      updateBlockInTree(p, id, (b) => {
        const resolved = resolveProps({ ...b, i18nProps }, currentLang);
        return { ...b, i18nProps, props: resolved };
      }),
    );
  };

  const updateBlockSharedProp = (id: string, key: string, value: string) => {
    setBlocksWithHistory((p) =>
      updateBlockInTree(p, id, (b) => ({ ...b, props: { ...b.props, [key]: value } })),
    );
  };

  const updateBlockStyle = (id: string, style: AdvancedStyle) =>
    setBlocksWithHistory((p) => updateBlockInTree(p, id, (b) => ({ ...b, style })));

  const updateBlockVisibility = (id: string, visibility: DeviceVisibility) =>
    setBlocksWithHistory((p) => updateBlockInTree(p, id, (b) => ({ ...b, visibility })));

  const updateBlockResponsiveStyle = (id: string, responsiveStyle: ResponsiveOverrides) =>
    setBlocksWithHistory((p) => updateBlockInTree(p, id, (b) => ({ ...b, responsiveStyle })));

  const removeBlock = (id: string) => {
    setBlocksWithHistory((p) => removeBlockFromTree(p, id).tree);
    if (selectedId === id) setSelectedId(null);
  };

  const handlePublish = () => {
    try {
      validateBlockTree(blocks);
    } catch (error) {
      const description =
        error instanceof ZodError
          ? formatBlockTreeValidationError(error)
          : 'Page content failed validation.';
      toast({
        variant: 'destructive',
        title: 'Cannot publish page',
        description,
      });
      return;
    }

    const slug = pageSlug;
    const primaryCode = getLangCodeForField('title');
    const secondaryCode = getLangCodeForField('title_np');

    const title = pageNameI18n[primaryCode] ?? pageNameI18n[currentLang] ?? 'Untitled page';
    const title_np = pageNameI18n[secondaryCode] ?? '';

    const description = JSON.stringify(blocks.map((b) => resolveBlockTree(b, LOCALES.EN)));
    const description_np = JSON.stringify(blocks.map((b) => resolveBlockTree(b, LOCALES.NP)));

    const onPublishSuccess = () => {
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1800);
      navigate({ to: '/website/pages' });
    };

    if (isEditMode) {
      updatePage(
        {
          id: String(pageId),
          title,
          title_np,
          slug,
          description,
          description_np,
          metadata,
          status,
        },
        { onSuccess: onPublishSuccess },
      );
    } else {
      addPage(
        {
          title,
          title_np,
          slug,
          description,
          description_np,
          metadata,
          status,
        } as Parameters<typeof addPage>[0],
        { onSuccess: onPublishSuccess },
      );
    }
  };

  const handlePreview = () => {
    const slugForUrl = pageSlug;
    const previewKey = storePreviewPayload(slugForUrl, {
      blocks,
      metadata,
      title: pageName,
      description: pageDescription,
    });
    const href = router.buildLocation({
      to: '/website/pages/preview/$slug',
      params: { slug: slugForUrl },
      search: { previewKey },
    }).href;

    window.open(href, '_blank');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(
      generatePreviewHTML(blocks, pageName, pageDescription, currentLang, metadata),
    );
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 1500);
  };

  const filteredLibrary = COMPONENT_LIBRARY.filter((c) =>
    c.label.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);

  if (showLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <p className="text-sm text-gray-400">Loading page…</p>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen w-full flex-col bg-white overflow-hidden"
      dir={langConfig?.dir ?? 'ltr'}
    >
      <EditorHeader
        pageName={pageName}
        pageSlug={pageSlug}
        onPageNameChange={setPageName}
        device={device}
        onDeviceChange={setDevice}
        onSettingsOpen={() => setSettingsOpen(true)}
        onPreview={handlePreview}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        isEditMode={isEditMode}
        savedFlash={savedFlash}
      />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar
          selectedBlock={selectedBlock}
          panelTab={panelTab}
          onPanelTabChange={setPanelTab}
          leftTab={leftTab}
          onLeftTabChange={setLeftTab}
          search={search}
          onSearchChange={setSearch}
          filteredLibrary={filteredLibrary}
          blocks={blocks}
          selectedId={selectedId}
          device={device}
          currentLang={currentLang}
          onSelectBlock={setSelectedId}
          onDeselectBlock={() => setSelectedId(null)}
          onDeviceChange={setDevice}
          onStartDragNew={startDragNew}
          onRemoveBlock={removeBlock}
          onDuplicateBlock={handlePaste}
          onChangeI18n={updateBlockI18n}
          onChangeSharedProp={updateBlockSharedProp}
          onChangeStyle={updateBlockStyle}
          onVisibilityChange={updateBlockVisibility}
          onResponsiveStyleChange={updateBlockResponsiveStyle}
        />

        <CanvasArea
          blocks={blocks}
          device={device}
          pageSlug={pageSlug}
          drag={drag}
          hover={hover}
          selectedId={selectedId}
          currentLang={currentLang}
          isDraggingOverRoot={isDraggingOverRoot}
          canvasRef={canvasRef}
          onDeselectBlock={() => setSelectedId(null)}
          onSelectBlock={setSelectedId}
          onStartMove={startDragMove}
          onRemoveBlock={removeBlock}
          registerRef={registerRef}
        />
      </div>

      {drag && pointer && <DragGhost drag={drag} pointer={pointer} />}

      <GridDialog
        open={!!pendingDrop}
        onOpenChange={(v) => !v && setPendingDrop(null)}
        pendingDrop={pendingDrop}
        currentLang={currentLang}
        setPendingDrop={setPendingDrop}
        setBlocksWithHistory={setBlocksWithHistory}
        setSelectedId={setSelectedId}
        setPanelTab={setPanelTab}
      />

      <HTMLOutput
        langConfig={langConfig}
        codeOpen={codeOpen}
        setCodeOpen={setCodeOpen}
        blocks={blocks}
        pageName={pageName}
        pageDescription={pageDescription}
        currentLang={currentLang}
        metadata={metadata}
        handleCopyCode={handleCopyCode}
        codeCopied={codeCopied}
      />

      <PageSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        pageName={pageNameI18n[primaryLangCode] ?? pageName}
        pageNameNp={pageNameI18n[secondaryLangCode] ?? ''}
        onPageNameChange={(value) => setPageNameI18n((p) => ({ ...p, [primaryLangCode]: value }))}
        onPageNameNpChange={(value) =>
          setPageNameI18n((p) => ({ ...p, [secondaryLangCode]: value }))
        }
        metadata={metadata}
        onMetadataChange={(key, value) => setMetadata((p) => ({ ...p, [key]: value }))}
        status={status}
        onStatusChange={setStatus}
      />
    </div>
  );
}
