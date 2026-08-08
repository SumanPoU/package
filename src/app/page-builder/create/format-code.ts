/** Pretty-print author CSS without a full parser (ponytail: brace indent; upgrade to prettier if needed). */
export const formatCss = (raw: string): string => {
  const src = raw.trim();
  if (!src) return "";

  let out = "";
  let depth = 0;
  let i = 0;
  const indent = () => "  ".repeat(Math.max(0, depth));

  while (i < src.length) {
    const ch = src[i]!;

    if (ch === "{") {
      out = `${out.trimEnd()} {\n`;
      depth += 1;
      out += indent();
      i += 1;
      continue;
    }

    if (ch === "}") {
      depth = Math.max(0, depth - 1);
      out = `${out.trimEnd()}\n${indent()}}\n`;
      if (depth > 0) out += indent();
      i += 1;
      continue;
    }

    if (ch === ";") {
      out += ";\n";
      if (depth > 0) out += indent();
      i += 1;
      while (src[i] === " " || src[i] === "\n" || src[i] === "\r") i += 1;
      continue;
    }

    if (ch === "\n" || ch === "\r") {
      i += 1;
      continue;
    }

    out += ch;
    i += 1;
  }

  return out
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line, idx, arr) => !(line === "" && arr[idx - 1] === ""))
    .join("\n")
    .trim();
};

/** Indent HTML-ish markup for display. */
export const formatHtml = (raw: string): string => {
  const flat = raw.replace(/>\s+</g, "><").trim();
  if (!flat) return "";

  const tokens = flat.split(/(<\/?[^>]+>)/g).filter(Boolean);
  let depth = 0;
  const lines: string[] = [];

  for (const token of tokens) {
    if (token.startsWith("</")) {
      depth = Math.max(0, depth - 1);
      lines.push(`${"  ".repeat(depth)}${token}`);
      continue;
    }
    if (
      token.startsWith("<") &&
      !token.startsWith("<!") &&
      !token.endsWith("/>")
    ) {
      lines.push(`${"  ".repeat(depth)}${token}`);
      if (
        !/^<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i.test(
          token,
        )
      ) {
        depth += 1;
      }
      continue;
    }
    if (token.startsWith("<")) {
      lines.push(`${"  ".repeat(depth)}${token}`);
      continue;
    }
    const text = token.trim();
    if (text) lines.push(`${"  ".repeat(depth)}${text}`);
  }

  return lines.join("\n");
};

export const formatJson = (value: unknown): string =>
  JSON.stringify(value, null, 2);
