"use client";

import { STEP_LEVEL_LABELS } from "./effect-values";
import { resolveIcon } from "./icons";
import type { A11yFeatureDef } from "./registry";
import type { SteppedFeatureId } from "./types";

export type ToolCardProps = {
  feature: A11yFeatureDef;
  /** Current step index (0-based) or 0/1 for toggles. */
  value: number;
  pressed?: boolean;
  onActivate: () => void;
};

export function ToolCard({
  feature,
  value,
  pressed = false,
  onActivate,
}: ToolCardProps) {
  const Icon = resolveIcon(feature.iconId);
  const { title } = feature.labels;
  const kind = feature.kind;
  const steps = feature.levels ?? 0;
  const active = kind === "stepped" ? value > 0 : pressed;

  const levelName =
    kind === "stepped"
      ? (STEP_LEVEL_LABELS[feature.id as SteppedFeatureId]?.[value] ??
        `Level ${value + 1}`)
      : null;

  // Visible UI is icon + title + dashes; state stays in the accessible name.
  const accessibleName =
    kind === "toggle"
      ? `${title}, ${pressed ? "on" : "off"}`
      : `${title}, ${levelName}`;

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
      <span className="itzsa-a11y-card-label">{title}</span>
      {kind === "stepped" && steps > 0 ? (
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
      {kind === "toggle" ? (
        <span className="itzsa-a11y-steps" aria-hidden>
          <span
            className="itzsa-a11y-step itzsa-a11y-step-toggle"
            data-on={pressed ? "true" : "false"}
          />
        </span>
      ) : null}
    </button>
  );
}
