"use client";

import { FEATURE_LABELS } from "./defaults";
import { STEP_LEVEL_LABELS } from "./effect-values";
import { FEATURE_ICONS } from "./icons";
import type { FeatureId, SteppedFeatureId } from "./types";

export type ToolCardProps = {
  feature: FeatureId;
  kind: "step" | "toggle";
  /** Current step index (0-based). */
  value: number;
  /** Total steps for stepped features. */
  steps?: number;
  pressed?: boolean;
  onActivate: () => void;
};

export function ToolCard({
  feature,
  kind,
  value,
  steps = 0,
  pressed = false,
  onActivate,
}: ToolCardProps) {
  const Icon = FEATURE_ICONS[feature];
  const label = FEATURE_LABELS[feature];
  const active = kind === "step" ? value > 0 : pressed;

  const levelName =
    kind === "step"
      ? (STEP_LEVEL_LABELS[feature as SteppedFeatureId]?.[value] ??
        `Level ${value + 1}`)
      : null;

  // Toggle: stable accessible name; state via aria-pressed only (APG toggle).
  // Stepped: visible + accessible name includes current level (not aria-valuenow).
  const accessibleName = kind === "toggle" ? label : `${label} — ${levelName}`;

  return (
    <button
      type="button"
      className="itzsa-a11y-card"
      data-active={active ? "true" : "false"}
      aria-pressed={kind === "toggle" ? pressed : undefined}
      aria-label={accessibleName}
      onClick={onActivate}
    >
      <span className="itzsa-a11y-card-icon">
        <Icon />
      </span>
      <span className="itzsa-a11y-card-label">{label}</span>
      {kind === "step" && levelName ? (
        <span className="itzsa-a11y-card-level">{levelName}</span>
      ) : null}
      {kind === "step" && steps > 0 ? (
        <span className="itzsa-a11y-steps" aria-hidden>
          {Array.from({ length: steps }, (_, i) => (
            <span
              key={i}
              className="itzsa-a11y-step"
              data-on={i <= value ? "true" : "false"}
            />
          ))}
        </span>
      ) : null}
    </button>
  );
}
