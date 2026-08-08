import { useState } from "react";

import type { BlockContentFieldsProps } from "../core/types";

type LinkFieldsProps = Pick<BlockContentFieldsProps, "block" | "onChange"> & {
  idPrefix: string;
  /** Optional label above the URL field. */
  label?: string;
};

/**
 * Elementor-style link row: URL + gear, then open-in-new-window / nofollow.
 */
export const LinkFields = ({
  block,
  onChange,
  idPrefix,
  label = "Link",
}: LinkFieldsProps) => {
  const href = typeof block.props.href === "string" ? block.props.href : "";
  const openInNewWindow = Boolean(block.props.openInNewWindow);
  const nofollow = Boolean(block.props.nofollow);
  const [optionsOpen, setOptionsOpen] = useState(true);

  const patchProps = (patch: Record<string, unknown>) => {
    onChange({ props: { ...block.props, ...patch } });
  };

  return (
    <div className="pb-link-fields">
      <span className="pb-field-label" id={`${idPrefix}-link-label`}>
        {label}
      </span>
      <div className="pb-link-row">
        <input
          id={`${idPrefix}-href`}
          type="url"
          value={href}
          placeholder="Enter url here"
          aria-labelledby={`${idPrefix}-link-label`}
          onChange={(e) => patchProps({ href: e.target.value })}
        />
        <button
          type="button"
          className={["pb-link-gear", optionsOpen ? "pb-link-gear--open" : ""]
            .filter(Boolean)
            .join(" ")}
          aria-label="Link options"
          aria-expanded={optionsOpen}
          aria-controls={`${idPrefix}-link-options`}
          onClick={() => setOptionsOpen((v) => !v)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </svg>
        </button>
      </div>
      {optionsOpen ? (
        <div className="pb-link-checks" id={`${idPrefix}-link-options`}>
          <label className="pb-check" htmlFor={`${idPrefix}-blank`}>
            <input
              id={`${idPrefix}-blank`}
              type="checkbox"
              checked={openInNewWindow}
              onChange={(e) =>
                patchProps({ openInNewWindow: e.target.checked })
              }
            />
            <span>Open in new window</span>
          </label>
          <label className="pb-check" htmlFor={`${idPrefix}-nofollow`}>
            <input
              id={`${idPrefix}-nofollow`}
              type="checkbox"
              checked={nofollow}
              onChange={(e) => patchProps({ nofollow: e.target.checked })}
            />
            <span>Add nofollow</span>
          </label>
        </div>
      ) : null}
    </div>
  );
};
