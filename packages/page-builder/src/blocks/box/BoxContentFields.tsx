import type { BlockContentFieldsProps } from "../../core/types";

export const BoxContentFields = ({
  block,
  onChange,
}: BlockContentFieldsProps) => {
  const bg =
    typeof block.props.backgroundImage === "string"
      ? block.props.backgroundImage
      : "";

  return (
    <div>
      <label htmlFor={`pb-bg-${block.id}`}>
        Background image URL
        <input
          id={`pb-bg-${block.id}`}
          type="url"
          value={bg}
          aria-label="Background image URL"
          onChange={(e) =>
            onChange({
              props: { ...block.props, backgroundImage: e.target.value },
            })
          }
        />
      </label>
    </div>
  );
};
