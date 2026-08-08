import type { BridgeMeasurePayload } from "../../canvas/canvasBridge";

export type SelectionOverlayProps = {
  selectedId: string | null;
  measures: Map<string, BridgeMeasurePayload["rect"]>;
  /** Dimmed dashed ring when block is hidden by visibility (canvas ghost). */
  ghost?: boolean;
};

/**
 * Parent-document selection chrome (ADR-02). Positioned from canvas measures —
 * never painted into the page visual contract / published CSS.
 */
export const SelectionOverlay = ({
  selectedId,
  measures,
  ghost = false,
}: SelectionOverlayProps) => {
  if (!selectedId) return null;
  const rect = measures.get(selectedId);
  if (!rect || rect.width <= 0 || rect.height <= 0) return null;

  return (
    <div
      className="pb-selection-overlay"
      data-ghost={ghost ? "true" : undefined}
      aria-hidden
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }}
    />
  );
};
