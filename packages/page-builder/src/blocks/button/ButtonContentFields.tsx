import type { BlockContentFieldsProps } from "../../core/types";
import { LinkFields } from "../LinkFields";

export const ButtonContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const label =
    typeof block.i18nProps?.[locale]?.label === "string"
      ? (block.i18nProps[locale]!.label as string)
      : "";

  const handleLabel = (value: string) => {
    const i18nProps = { ...(block.i18nProps ?? {}) };
    i18nProps[locale] = { ...(i18nProps[locale] ?? {}), label: value };
    onChange({ i18nProps });
  };

  return (
    <div className="pb-content-fields">
      <label className="pb-field" htmlFor={`pb-btn-label-${block.id}`}>
        <span className="pb-field-label">Label</span>
        <input
          id={`pb-btn-label-${block.id}`}
          type="text"
          value={label}
          aria-label="Button label"
          onChange={(e) => handleLabel(e.target.value)}
        />
      </label>
      <LinkFields
        block={block}
        onChange={onChange}
        idPrefix={`pb-btn-${block.id}`}
      />
    </div>
  );
};
