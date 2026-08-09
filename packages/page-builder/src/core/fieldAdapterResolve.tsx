import { type ZodType, z } from "zod";

import type { BlockContentFieldsProps } from "./types";

/**
 * Authoritative Model B field `kind` enum (§24.2).
 * Adding a kind requires updating `docs/page-builder/api/field-types.md`.
 */
export const FIELD_KINDS = [
  "text",
  "richText",
  "image",
  "select",
  "boolean",
  "number",
  "url",
] as const;

export type FieldKind = (typeof FIELD_KINDS)[number];

export type DynamicFieldSpec = {
  key: string;
  kind: FieldKind;
  label?: string;
  translatable?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: unknown;
};

const KIND_SET = new Set<string>(FIELD_KINDS);

export type FieldKindError = {
  code: "unknown-kind" | "empty-key" | "duplicate-key";
  message: string;
};

export const assertFieldSpecs = (
  fields: DynamicFieldSpec[],
): { ok: true } | { ok: false; error: FieldKindError } => {
  const seen = new Set<string>();
  for (const field of fields) {
    if (!field.key.trim()) {
      return {
        ok: false,
        error: { code: "empty-key", message: "field key must be non-empty" },
      };
    }
    if (seen.has(field.key)) {
      return {
        ok: false,
        error: {
          code: "duplicate-key",
          message: `duplicate field key "${field.key}"`,
        },
      };
    }
    seen.add(field.key);
    if (!KIND_SET.has(field.kind)) {
      return {
        ok: false,
        error: {
          code: "unknown-kind",
          message: `unknown field kind "${String(field.kind)}" — must be one of ${FIELD_KINDS.join(", ")}`,
        },
      };
    }
    if (
      field.kind === "select" &&
      (!field.options || field.options.length === 0)
    ) {
      return {
        ok: false,
        error: {
          code: "unknown-kind",
          message: `select field "${field.key}" requires options`,
        },
      };
    }
  }
  return { ok: true };
};

export const isFieldKind = (value: string): value is FieldKind =>
  KIND_SET.has(value);

const zodForKind = (field: DynamicFieldSpec): ZodType => {
  switch (field.kind) {
    case "boolean":
      return z.boolean().optional();
    case "number":
      return z.number().optional();
    case "select": {
      const values = (field.options ?? []).map((o) => o.value);
      return values.length
        ? z.enum(values as [string, ...string[]]).optional()
        : z.string().optional();
    }
    default:
      return z.string().optional();
  }
};

/** Build a Zod object from Model B field specs (shared + translatable keys). */
export const buildPropsSchemaFromFields = (
  fields: DynamicFieldSpec[],
): ZodType => {
  const shape: Record<string, ZodType> = {};
  for (const field of fields) {
    shape[field.key] = zodForKind(field);
  }
  return z.object(shape).passthrough();
};

const readFieldValue = (
  block: BlockContentFieldsProps["block"],
  locale: string,
  field: DynamicFieldSpec,
): string | boolean | number => {
  if (field.translatable) {
    const raw = block.i18nProps?.[locale]?.[field.key];
    if (field.kind === "boolean") return Boolean(raw);
    if (field.kind === "number")
      return typeof raw === "number" ? raw : Number(raw) || 0;
    return typeof raw === "string" ? raw : raw != null ? String(raw) : "";
  }
  const raw = block.props[field.key];
  if (field.kind === "boolean") return Boolean(raw);
  if (field.kind === "number")
    return typeof raw === "number" ? raw : Number(raw) || 0;
  return typeof raw === "string" ? raw : raw != null ? String(raw) : "";
};

const writeFieldValue = (
  block: BlockContentFieldsProps["block"],
  locale: string,
  field: DynamicFieldSpec,
  value: unknown,
  onChange: BlockContentFieldsProps["onChange"],
): void => {
  if (field.translatable) {
    onChange({
      i18nProps: {
        ...(block.i18nProps ?? {}),
        [locale]: {
          ...(block.i18nProps?.[locale] ?? {}),
          [field.key]: value,
        },
      },
    });
    return;
  }
  onChange({
    props: { ...block.props, [field.key]: value },
  });
};

/** Engine-generated ContentFields from Model B field specs. */
export const createDynamicContentFields = (fields: DynamicFieldSpec[]) => {
  const DynamicContentFields = ({
    block,
    locale,
    onChange,
  }: BlockContentFieldsProps) => (
    <div className="pb-content-fields pb-fields">
      {fields.map((field) => {
        const id = `pb-dyn-${block.id}-${field.key}`;
        const label = field.label ?? field.key;
        const value = readFieldValue(block, locale, field);

        if (field.kind === "boolean") {
          return (
            <label key={field.key} className="pb-field" htmlFor={id}>
              <span className="pb-field-label">{label}</span>
              <input
                id={id}
                type="checkbox"
                checked={Boolean(value)}
                aria-label={label}
                onChange={(e) =>
                  writeFieldValue(
                    block,
                    locale,
                    field,
                    e.target.checked,
                    onChange,
                  )
                }
              />
            </label>
          );
        }

        if (field.kind === "select") {
          return (
            <label key={field.key} className="pb-field" htmlFor={id}>
              <span className="pb-field-label">{label}</span>
              <select
                id={id}
                value={String(value)}
                aria-label={label}
                onChange={(e) =>
                  writeFieldValue(
                    block,
                    locale,
                    field,
                    e.target.value,
                    onChange,
                  )
                }
              >
                {(field.options ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          );
        }

        if (field.kind === "richText") {
          return (
            <label key={field.key} className="pb-field" htmlFor={id}>
              <span className="pb-field-label">{label}</span>
              <textarea
                id={id}
                rows={4}
                value={String(value)}
                aria-label={label}
                onChange={(e) =>
                  writeFieldValue(
                    block,
                    locale,
                    field,
                    e.target.value,
                    onChange,
                  )
                }
              />
            </label>
          );
        }

        if (field.kind === "number") {
          return (
            <label key={field.key} className="pb-field" htmlFor={id}>
              <span className="pb-field-label">{label}</span>
              <input
                id={id}
                type="number"
                value={Number(value)}
                aria-label={label}
                onChange={(e) =>
                  writeFieldValue(
                    block,
                    locale,
                    field,
                    Number(e.target.value),
                    onChange,
                  )
                }
              />
            </label>
          );
        }

        const inputType =
          field.kind === "url"
            ? "url"
            : field.kind === "image"
              ? "url"
              : "text";

        return (
          <label key={field.key} className="pb-field" htmlFor={id}>
            <span className="pb-field-label">{label}</span>
            <input
              id={id}
              type={inputType}
              value={String(value)}
              aria-label={label}
              onChange={(e) =>
                writeFieldValue(block, locale, field, e.target.value, onChange)
              }
            />
          </label>
        );
      })}
    </div>
  );

  return DynamicContentFields;
};
