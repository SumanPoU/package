"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { asString } from "../shared";

const TONE: Record<string, { bg: string; fg: string }> = {
  neutral: { bg: "#f1f5f9", fg: "#0f172a" },
  info: { bg: "#e0f2fe", fg: "#075985" },
  success: { bg: "#dcfce7", fg: "#166534" },
  warn: { bg: "#fef3c7", fg: "#92400e" },
  danger: { bg: "#fee2e2", fg: "#991b1b" },
};

export const BadgeElement = ({ block, props }: BlockRenderProps) => {
  const text = asString(props.text, "Badge") || "Badge";
  const tone = asString(props.tone, "neutral") || "neutral";
  const colors = TONE[tone] ?? TONE.neutral!;
  return (
    <span
      {...blockRootAttrs(block)}
      data-pb-type="badge"
      data-tone={tone}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.02em",
        background: colors.bg,
        color: colors.fg,
      }}
    >
      {text}
    </span>
  );
};

const BadgeContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const text =
    typeof block.i18nProps?.[locale]?.text === "string"
      ? (block.i18nProps[locale]!.text as string)
      : asString(block.props.text, "Badge");
  const tone = asString(block.props.tone, "neutral");

  return (
    <div className="pb-content-fields">
      <label className="pb-field">
        <span className="pb-field-label">Label</span>
        <input
          type="text"
          value={text}
          aria-label="Badge label"
          onChange={(e) => {
            const i18nProps = { ...(block.i18nProps ?? {}) };
            i18nProps[locale] = {
              ...(i18nProps[locale] ?? {}),
              text: e.target.value,
            };
            onChange({ i18nProps });
          }}
        />
      </label>
      <label className="pb-field">
        <span className="pb-field-label">
          Tone <span className="pb-field-label-muted">(shared)</span>
        </span>
        <select
          value={tone}
          aria-label="Badge tone"
          onChange={(e) =>
            onChange({ props: { ...block.props, tone: e.target.value } })
          }
        >
          {Object.keys(TONE).map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export const badgeDefinition: BlockDefinition = {
  type: "badge",
  label: "Badge",
  category: "basic",
  defaultProps: { tone: "info" },
  defaultI18nProps: {
    en: { text: "Badge" },
    ne: { text: "ब्याज" },
  },
  translatableProps: ["text"],
  sharedProps: ["tone"],
  propsSchema: z
    .object({
      text: z.string().optional(),
      tone: z.string().optional(),
    })
    .passthrough(),
  render: BadgeElement,
  ContentFields: BadgeContentFields,
  source: "core",
};
