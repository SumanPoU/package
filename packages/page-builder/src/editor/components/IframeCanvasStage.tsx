"use client";

import { useMemo, useState } from "react";
import { CanvasFrame } from "../../canvas/CanvasFrame";
import type { BridgeMeasurePayload } from "../../canvas/canvasBridge";
import type { PageBuilderCapabilities } from "../../core/capabilities";
import type { FetchDataSource } from "../../core/dataBinding";
import type { BlockRegistry } from "../../core/registry";
import type { LocaleConfig, Page } from "../../core/types";
import type { RenderContext } from "../../core/visibilityResolve";
import { SelectionOverlay } from "./SelectionOverlay";

export type IframeCanvasStageProps = {
  page: Page;
  registry: BlockRegistry;
  localeConfig: LocaleConfig;
  activeLocale: string;
  renderContext: RenderContext;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  canvasSrc: string;
  device?: "desktop" | "tablet" | "mobile";
  pageSlug?: string;
  nonce?: string;
  /** Reserved for parity with CanvasArea — unused in iframe shell. */
  capabilities?: PageBuilderCapabilities;
  fetchDataSource?: FetchDataSource;
};

/**
 * Sandboxed iframe canvas (ADR-02). Page DOM lives in the shell; selection
 * chrome stays in the parent via bridge measures.
 */
export const IframeCanvasStage = ({
  page,
  registry,
  localeConfig,
  activeLocale,
  renderContext,
  selectedId,
  onSelect,
  canvasSrc,
  device = "desktop",
  pageSlug = "page",
  nonce,
}: IframeCanvasStageProps) => {
  const [measures, setMeasures] = useState(
    () => new Map<string, BridgeMeasurePayload["rect"]>(),
  );

  const frameStyle = useMemo(
    () => ({
      width: "100%",
      height: "100%",
      minHeight: 480,
      border: "0",
      background: "#fff",
    }),
    [],
  );

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
        <div className="pb-canvas-stage" style={{ position: "relative" }}>
          <CanvasFrame
            page={page}
            registry={registry}
            localeConfig={localeConfig}
            activeLocale={activeLocale}
            renderContext={renderContext}
            src={canvasSrc}
            nonce={nonce}
            selectedId={selectedId}
            onSelect={onSelect}
            onMeasures={setMeasures}
            allowEmbedded={false}
            style={frameStyle}
            title="Page builder canvas"
          />
          <SelectionOverlay
            selectedId={selectedId}
            measures={measures}
            ghost={false}
          />
        </div>
      </div>
    </main>
  );
};
