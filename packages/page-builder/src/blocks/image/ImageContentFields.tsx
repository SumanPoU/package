import type { BlockContentFieldsProps } from "../../core/types";

export const ImageContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const src = typeof block.props.src === "string" ? block.props.src : "";
  const alt =
    typeof block.i18nProps?.[locale]?.alt === "string"
      ? (block.i18nProps[locale]!.alt as string)
      : "";

  const handleAlt = (value: string) => {
    const i18nProps = { ...(block.i18nProps ?? {}) };
    i18nProps[locale] = { ...(i18nProps[locale] ?? {}), alt: value };
    onChange({ i18nProps });
  };

  return (
    <div>
      <label htmlFor={`pb-img-src-${block.id}`}>
        Image URL
        <input
          id={`pb-img-src-${block.id}`}
          type="url"
          value={src}
          aria-label="Image source URL"
          onChange={(e) =>
            onChange({ props: { ...block.props, src: e.target.value } })
          }
        />
      </label>
      <label htmlFor={`pb-img-alt-${block.id}`}>
        Alt text
        <input
          id={`pb-img-alt-${block.id}`}
          type="text"
          value={alt}
          aria-label="Image alt text"
          onChange={(e) => handleAlt(e.target.value)}
        />
      </label>
    </div>
  );
};
