/** Escape a CSV field (RFC-style quotes). */
export function escapeCsvValue(value: unknown): string {
  const text = value == null ? "" : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export type BuildCsvOptions = {
  /** Include header row. Defaults to `true`. */
  includeHeaders?: boolean;
  /** Line ending. Defaults to `\\r\\n`. */
  lineEnding?: "\n" | "\r\n";
};

export function buildCsv(
  headers: string[],
  rows: unknown[][],
  options: BuildCsvOptions = {},
): string {
  const includeHeaders = options.includeHeaders ?? true;
  const lineEnding = options.lineEnding ?? "\r\n";
  const lines: string[] = [];

  if (includeHeaders) {
    lines.push(headers.map(escapeCsvValue).join(","));
  }

  for (const row of rows) {
    lines.push(row.map(escapeCsvValue).join(","));
  }

  return lines.join(lineEnding);
}

export function downloadTextFile(
  content: string,
  filename: string,
  mimeType = "text/csv;charset=utf-8",
) {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    textarea.remove();
    return ok;
  } catch {
    return false;
  }
}

export type ExportTableDataOptions<T> = {
  columns: Array<{ key: string; header: string }>;
  rows: T[];
  getValue: (row: T, key: string) => unknown;
  filename?: string;
  includeHeaders?: boolean;
};

export function rowsToCsvMatrix<T>({
  columns,
  rows,
  getValue,
}: Omit<ExportTableDataOptions<T>, "filename" | "includeHeaders">): {
  headers: string[];
  matrix: unknown[][];
} {
  const headers = columns.map((column) => column.header);
  const matrix = rows.map((row) =>
    columns.map((column) => getValue(row, column.key)),
  );
  return { headers, matrix };
}
