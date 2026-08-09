"use client";

import { z } from "zod";

import { blockRootAttrs } from "../../core/blockClassName";
import type {
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
} from "../../core/types";
import { asString } from "../shared";

export const CodeElement = ({ block, props }: BlockRenderProps) => {
  const code = asString(props.code);
  const language = asString(props.language, "text");
  return (
    <pre
      {...blockRootAttrs(block)}
      data-pb-type="code"
      data-language={language}
      style={{
        margin: 0,
        padding: "12px 14px",
        overflow: "auto",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "13px",
        lineHeight: 1.5,
        background: "#0f172a",
        color: "#e2e8f0",
        borderRadius: 8,
      }}
    >
      <code>{code || "// code"}</code>
    </pre>
  );
};

const CodeContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const code =
    typeof block.i18nProps?.[locale]?.code === "string"
      ? (block.i18nProps[locale]!.code as string)
      : asString(block.props.code);
  const language = asString(block.props.language, "text");

  return (
    <div className="pb-content-fields">
      <label className="pb-field">
        <span className="pb-field-label">
          Language <span className="pb-field-label-muted">(shared)</span>
        </span>
        <select
          value={language}
          aria-label="Code language"
          onChange={(e) =>
            onChange({
              props: { ...block.props, language: e.target.value },
            })
          }
        >
          {[
            "text",
            "javascript",
            "typescript",
            "tsx",
            "html",
            "css",
            "json",
            "python",
            "bash",
          ].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <label className="pb-field">
        <span className="pb-field-label">Code</span>
        <textarea
          rows={10}
          value={code}
          aria-label="Code content"
          spellCheck={false}
          style={{ fontFamily: "ui-monospace, monospace", fontSize: 12 }}
          onChange={(e) => {
            const i18nProps = { ...(block.i18nProps ?? {}) };
            i18nProps[locale] = {
              ...(i18nProps[locale] ?? {}),
              code: e.target.value,
            };
            onChange({ i18nProps });
          }}
        />
      </label>
    </div>
  );
};

export const codeDefinition: BlockDefinition = {
  type: "code",
  label: "Code",
  category: "basic",
  defaultProps: { language: "javascript" },
  defaultI18nProps: {
    en: { code: "console.log('hello');" },
    ne: { code: "console.log('नमस्ते');" },
  },
  translatableProps: ["code"],
  sharedProps: ["language"],
  propsSchema: z
    .object({
      code: z.string().optional(),
      language: z.string().optional(),
    })
    .passthrough(),
  render: CodeElement,
  ContentFields: CodeContentFields,
  source: "core",
};
