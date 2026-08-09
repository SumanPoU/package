"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { asString } from "../shared";

const TONES = ["info", "success", "warn", "error"] as const;

export const AlertElement = ({ block, props }: BlockRenderProps) => {
  const title = asString(props.title).trim();
  const body = asString(props.body).trim();
  const tone = asString(props.tone, "info") || "info";
  const role = tone === "error" || tone === "warn" ? "alert" : "status";
  return (
    <div
      {...blockRootAttrs(block)}
      data-pb-type="alert"
      data-tone={tone}
      role={role}
    >
      {title ? <strong>{title}</strong> : null}
      {body ? <p>{body}</p> : title ? null : <p>Alert</p>}
    </div>
  );
};

const AlertContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const title =
    typeof block.i18nProps?.[locale]?.title === "string"
      ? (block.i18nProps[locale]!.title as string)
      : asString(block.props.title);
  const body =
    typeof block.i18nProps?.[locale]?.body === "string"
      ? (block.i18nProps[locale]!.body as string)
      : asString(block.props.body);
  const tone = asString(block.props.tone, "info");

  const handleI18n = (key: string, value: string) => {
    onChange({
      i18nProps: {
        ...(block.i18nProps ?? {}),
        [locale]: { ...(block.i18nProps?.[locale] ?? {}), [key]: value },
      },
    });
  };

  return (
    <div className="pb-content-fields">
      <label className="pb-field">
        <span className="pb-field-label">
          Tone <span className="pb-field-label-muted">(shared)</span>
        </span>
        <select
          value={tone}
          aria-label="Alert tone"
          onChange={(e) =>
            onChange({ props: { ...block.props, tone: e.target.value } })
          }
        >
          {TONES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      <label className="pb-field">
        <span className="pb-field-label">Title</span>
        <input
          type="text"
          value={title}
          aria-label="Alert title"
          onChange={(e) => handleI18n("title", e.target.value)}
        />
      </label>
      <label className="pb-field">
        <span className="pb-field-label">Body</span>
        <textarea
          rows={3}
          value={body}
          aria-label="Alert body"
          onChange={(e) => handleI18n("body", e.target.value)}
        />
      </label>
    </div>
  );
};

export const alertDefinition: BlockDefinition = {
  type: "alert",
  label: "Alert",
  category: "basic",
  defaultProps: { tone: "info" },
  defaultI18nProps: {
    en: { title: "Info", body: "Alert message" },
    ne: { title: "जानकारी", body: "सन्देश" },
  },
  translatableProps: ["title", "body"],
  sharedProps: ["tone"],
  propsSchema: z
    .object({
      tone: z.enum(["info", "success", "warn", "error"]).optional(),
      title: z.string().optional(),
      body: z.string().optional(),
    })
    .passthrough(),
  render: AlertElement,
  ContentFields: AlertContentFields,
  source: "core",
};
