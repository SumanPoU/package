import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import type { BlockRegistry } from "../core/registry";
import type { LocaleConfig, Page } from "../core/types";
import type { RenderContext } from "../core/visibilityResolve";
import { CanvasDocument } from "./CanvasDocument";
import {
  type BridgeEnvelope,
  type BridgeMeasurePayload,
  type BridgePageSyncPayload,
  type BridgeSelectPayload,
  createParentBridgeListener,
  postToCanvas,
} from "./canvasBridge";
import {
  CANVAS_SANDBOX,
  createCanvasCsp,
  type SandboxPolicyOptions,
} from "./sandboxPolicy";

export type CanvasFrameProps = {
  page: Page;
  registry: BlockRegistry;
  localeConfig: LocaleConfig;
  activeLocale: string;
  renderContext?: Partial<RenderContext>;
  /** Host-served canvas shell URL — page JSON syncs via bridge. */
  src?: string;
  srcDoc?: string;
  nonce?: string;
  sandboxOptions?: SandboxPolicyOptions;
  selectedId?: string | null;
  onSelect?: (blockId: string | null) => void;
  onMeasures?: (measures: Map<string, BridgeMeasurePayload["rect"]>) => void;
  onBridgeMessage?: (message: BridgeEnvelope) => void;
  className?: string;
  style?: CSSProperties;
  title?: string;
  /**
   * When no `src`/`srcDoc`, render CanvasDocument in-process for local demos.
   * Production hosts should pass a sandboxed shell `src` (ADR-02).
   * ponytail: ceiling = embedded skips iframe isolation; upgrade = always set src.
   */
  allowEmbedded?: boolean;
};

export const CanvasFrame = ({
  page,
  registry,
  localeConfig,
  activeLocale,
  renderContext,
  src,
  srcDoc,
  nonce,
  sandboxOptions,
  selectedId,
  onSelect,
  onMeasures,
  onBridgeMessage,
  className,
  style,
  title = "Page builder canvas",
  allowEmbedded = true,
}: CanvasFrameProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const frameReadyRef = useRef(false);
  const measuresRef = useRef(new Map<string, BridgeMeasurePayload["rect"]>());

  const syncPayload = useMemo<BridgePageSyncPayload>(
    () => ({
      page,
      activeLocale,
      localeConfig,
      renderContext,
      selectedId: selectedId ?? null,
    }),
    [page, activeLocale, localeConfig, renderContext, selectedId],
  );

  const pushSync = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !frameReadyRef.current) return;
    postToCanvas(iframe, "page-sync", syncPayload);
  }, [syncPayload]);

  const handleMessage = useCallback(
    (message: BridgeEnvelope) => {
      onBridgeMessage?.(message);
      if (message.type === "ready") {
        frameReadyRef.current = true;
        pushSync();
        return;
      }
      if (message.type === "select") {
        onSelect?.((message.payload as BridgeSelectPayload).blockId);
        return;
      }
      if (message.type === "measure") {
        const payload = message.payload as BridgeMeasurePayload;
        measuresRef.current.set(payload.blockId, payload.rect);
        onMeasures?.(new Map(measuresRef.current));
      }
    },
    [onBridgeMessage, onMeasures, onSelect, pushSync],
  );

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || (!src && !srcDoc)) return;
    frameReadyRef.current = false;
    return createParentBridgeListener(iframe, handleMessage);
  }, [handleMessage, src, srcDoc]);

  useEffect(() => {
    pushSync();
  }, [pushSync]);

  const useIframe = Boolean(src || srcDoc);

  if (!useIframe && allowEmbedded) {
    return (
      <div
        className={className}
        style={style}
        title={title}
        data-pb-canvas-frame="embedded"
      >
        <CanvasDocument
          page={page}
          registry={registry}
          localeConfig={localeConfig}
          activeLocale={activeLocale}
          renderContext={renderContext}
          nonce={nonce}
          selectedId={selectedId}
          embedded
          onSelect={onSelect}
          onMeasures={onMeasures}
        />
      </div>
    );
  }

  const csp =
    nonce !== undefined ? createCanvasCsp(nonce, sandboxOptions) : undefined;

  return (
    <iframe
      ref={iframeRef}
      className={className}
      style={style}
      title={title}
      src={src}
      srcDoc={src ? undefined : srcDoc}
      sandbox={CANVAS_SANDBOX}
      {...(csp ? { csp } : {})}
      data-pb-canvas-frame="iframe"
    />
  );
};

export { CANVAS_SANDBOX };
