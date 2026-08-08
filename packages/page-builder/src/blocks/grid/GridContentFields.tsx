import type { BlockContentFieldsProps } from "../../core/types";

export const GridContentFields = ({
  block,
  onChange,
}: BlockContentFieldsProps) => {
  const bg =
    typeof block.props.backgroundImage === "string"
      ? block.props.backgroundImage
      : "";

  return (
    <div>
      <label htmlFor={`pb-grid-bg-${block.id}`}>
        Background image URL
        <input
          id={`pb-grid-bg-${block.id}`}
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
