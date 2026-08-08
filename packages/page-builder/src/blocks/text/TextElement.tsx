import { blockRootAttrs } from "../../core/blockClassName";
import { sanitizeRichText } from "../../core/sanitizeRichText";
import type { BlockRenderProps } from "../../core/types";
import { asString } from "../shared";

export const TextElement = ({ block, props }: BlockRenderProps) => {
  const content = asString(props.content);
  const html = asString(props.html);
  const useRich = Boolean(html);

  if (useRich) {
    return (
      <div
        {...blockRootAttrs(block)}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized via sanitizeRichText
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
      />
    );
  }

  return <p {...blockRootAttrs(block)}>{content}</p>;
};
