import type { BlockContentFieldsProps } from "../../core/types";
import { LinkFields } from "../LinkFields";

export const HeadingContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const title =
    typeof block.i18nProps?.[locale]?.title === "string"
      ? (block.i18nProps[locale]!.title as string)
      : "";
  const level =
    typeof block.props.level === "string" ? block.props.level : "h2";

  const handleTitle = (value: string) => {
    const i18nProps = { ...(block.i18nProps ?? {}) };
    i18nProps[locale] = { ...(i18nProps[locale] ?? {}), title: value };
    onChange({ i18nProps });
  };

  const filledLocales = Object.keys(block.i18nProps ?? {}).filter(
    (code) =>
      typeof block.i18nProps?.[code]?.title === "string" &&
      String(block.i18nProps[code]!.title).trim(),
  ).length;

  return (
    <div className="pb-content-fields">
      <label className="pb-field" htmlFor={`pb-heading-level-${block.id}`}>
        <span className="pb-field-label">Heading level (shared)</span>
        <select
          id={`pb-heading-level-${block.id}`}
          value={level}
          aria-label="Heading level"
          onChange={(e) =>
            onChange({ props: { ...block.props, level: e.target.value } })
          }
        >
          {[
            ["h1", "Heading 1 (H1)"],
            ["h2", "Heading 2 (H2)"],
            ["h3", "Heading 3 (H3)"],
            ["h4", "Heading 4 (H4)"],
            ["h5", "Heading 5 (H5)"],
            ["h6", "Heading 6 (H6)"],
          ].map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="pb-field" htmlFor={`pb-heading-title-${block.id}`}>
        <span className="pb-field-label">
          Text {Math.max(filledLocales, 1)}/
          {Math.max(Object.keys(block.i18nProps ?? {}).length, 2)}
        </span>
        <input
          id={`pb-heading-title-${block.id}`}
          type="text"
          value={title}
          aria-label="Heading text"
          onChange={(e) => handleTitle(e.target.value)}
        />
      </label>
      <LinkFields
        block={block}
        onChange={onChange}
        idPrefix={`pb-heading-${block.id}`}
      />
    </div>
  );
};
