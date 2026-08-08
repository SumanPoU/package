import type { BlockContentFieldsProps } from "../../core/types";

export const ButtonContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const label =
    typeof block.i18nProps?.[locale]?.label === "string"
      ? (block.i18nProps[locale]!.label as string)
      : "";
  const href = typeof block.props.href === "string" ? block.props.href : "";

  const handleLabel = (value: string) => {
    const i18nProps = { ...(block.i18nProps ?? {}) };
    i18nProps[locale] = { ...(i18nProps[locale] ?? {}), label: value };
    onChange({ i18nProps });
  };

  return (
    <div>
      <label htmlFor={`pb-btn-label-${block.id}`}>
        Label
        <input
          id={`pb-btn-label-${block.id}`}
          type="text"
          value={label}
          aria-label="Button label"
          onChange={(e) => handleLabel(e.target.value)}
        />
      </label>
      <label htmlFor={`pb-btn-href-${block.id}`}>
        Link URL
        <input
          id={`pb-btn-href-${block.id}`}
          type="url"
          value={href}
          aria-label="Button href"
          onChange={(e) =>
            onChange({ props: { ...block.props, href: e.target.value } })
          }
        />
      </label>
    </div>
  );
};
