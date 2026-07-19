import { type FC, useEffect, useRef, useState } from "react";

import { COLORS } from "./constants";

interface ColorPickerProps {
  label: "Text" | "Highlight";
  currentColor?: string;
  onSelect: (color: string) => void;
}

export const ColorPicker: FC<ColorPickerProps> = ({
  label,
  currentColor,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [customColor, setCustomColor] = useState(currentColor ?? "#1a1915");
  const ref = useRef<HTMLDivElement>(null);
  const isText = label === "Text";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title={`${label} color`}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex size-8 flex-col items-center justify-center gap-0.5 rounded-md transition-colors hover:bg-[var(--editor-surface)]"
      >
        <span className="text-[13px] leading-none font-bold text-[var(--editor-fg)]">
          {isText ? "A" : "H"}
        </span>
        <span
          className="h-[3px] w-4 rounded-full"
          style={{
            background:
              currentColor ?? (isText ? "var(--editor-fg)" : "#fef08a"),
          }}
        />
      </button>

      {open && (
        <div className="absolute top-9 left-0 z-50 w-[172px] rounded-xl border border-[var(--editor-border)] bg-[var(--editor-bg)] p-3 shadow-xl">
          <div className="mb-3 flex flex-wrap gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => {
                  onSelect(c);
                  setCustomColor(c);
                  setOpen(false);
                }}
                className="size-[22px] rounded-md border border-transparent transition-transform hover:scale-110"
                style={{
                  background: c,
                  borderColor:
                    c === "#ffffff" ? "var(--editor-border)" : "transparent",
                  outline:
                    currentColor === c
                      ? "2px solid var(--editor-accent)"
                      : undefined,
                  outlineOffset: "1px",
                }}
              />
            ))}
          </div>
          <div className="mb-2 h-px bg-[var(--editor-border)]" />
          <label className="group flex cursor-pointer items-center gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-[var(--editor-muted-fg)] uppercase">
              Custom
            </span>
            <input
              type="color"
              value={customColor}
              onChange={(e) => {
                setCustomColor(e.target.value);
                onSelect(e.target.value);
              }}
              onBlur={() => setOpen(false)}
              className="h-7 w-full flex-1 cursor-pointer rounded-md border border-[var(--editor-border)] bg-transparent"
              style={{ padding: "1px" }}
            />
          </label>
        </div>
      )}
    </div>
  );
};
