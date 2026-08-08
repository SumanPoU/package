import type { BlockContentFieldsProps } from "../../core/types";

export const TextContentFields = ({
  block,
  locale,
  onChange,
}: BlockContentFieldsProps) => {
  const content =
    typeof block.i18nProps?.[locale]?.content === "string"
      ? (block.i18nProps[locale]!.content as string)
      : "";

  const handleContent = (value: string) => {
    const i18nProps = { ...(block.i18nProps ?? {}) };
    i18nProps[locale] = { ...(i18nProps[locale] ?? {}), content: value };
    onChange({ i18nProps });
  };

  return (
    <div>
      <label htmlFor={`pb-text-${block.id}`}>
        Text
        <textarea
          id={`pb-text-${block.id}`}
          value={content}
          aria-label="Text content"
          rows={4}
          onChange={(e) => handleContent(e.target.value)}
        />
      </label>
    </div>
  );
};
