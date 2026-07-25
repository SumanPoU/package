import type { ReactElement, SVGProps } from "react";

import type { FeatureId } from "./types";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps): IconProps {
  return {
    width: 28,
    height: 28,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

export function IconTextSize(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 18V8h3" />
      <path d="M4 13h2.5" />
      <path d="M12 18V6h4" />
      <path d="M12 12h3.5" />
    </svg>
  );
}

export function IconContrast(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 0 16V4Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconAlign(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M7 12h10M5 17h14" />
    </svg>
  );
}

export function IconColorFilter(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4a8 8 0 0 1 0 16" fill="#f472b6" stroke="none" />
    </svg>
  );
}

export function IconSpacing(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 8h3v10H5" />
      <path d="M16 8h3v10h-3" />
      <path d="M9 12h6M9 12l2-2M15 12l-2-2M9 12l2 2M15 12l-2 2" />
    </svg>
  );
}

export function IconLineHeight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 5v14M6 5l-2 2M6 5l2 2M6 19l-2-2M6 19l2-2" />
      <path d="M11 8h9M11 12h9M11 16h9" />
    </svg>
  );
}

export function IconFont(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 17V8h5" />
      <path d="M5 12h4" />
      <path d="M14 17V8h5" />
      <path d="M14 17h5" />
    </svg>
  );
}

export function IconSaturation(props: IconProps) {
  return (
    <svg {...base({ ...props, stroke: "none" })}>
      <circle cx="9" cy="10" r="4" fill="#ef4444" opacity="0.9" />
      <circle cx="15" cy="10" r="4" fill="#22c55e" opacity="0.9" />
      <circle cx="12" cy="15" r="4" fill="#3b82f6" opacity="0.9" />
    </svg>
  );
}

export function IconDyslexia(props: IconProps) {
  return (
    <svg {...base({ ...props, stroke: "none", fill: "currentColor" })}>
      <text x="3" y="17" fontSize="11" fontFamily="system-ui,sans-serif">
        Df
      </text>
    </svg>
  );
}

export function IconCursor(props: IconProps) {
  return (
    <svg {...base({ ...props, fill: "currentColor", stroke: "none" })}>
      <path d="M5 3l12 9-5.5 1.5L14 21l-2.5-1.2L9 15.5 5 18V3z" />
    </svg>
  );
}

export function IconHideImages(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M4 4l16 16" />
    </svg>
  );
}

export function IconPause(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" strokeDasharray="2 2" />
      <path d="M10 9v6M14 9v6" />
    </svg>
  );
}

export function IconReadingGuide(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16M4 12h16M4 18h10" />
      <path d="M3 10h18" strokeWidth="2.5" />
    </svg>
  );
}

export function IconHighlightLinks(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 5" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.8 13.12a5 5 0 0 0 7.07 7.07L13 19" />
    </svg>
  );
}

export function IconReset(props: IconProps) {
  return (
    <svg {...base({ ...props, width: 20, height: 20 })}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base({ ...props, width: 20, height: 20 })}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Universal Symbol of Access mark — blue disc, white ring, outstretched figure. */
export function IconAccessibility(props: IconProps) {
  const { width = 56, height = 56, ...rest } = props;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden
      {...rest}
    >
      <circle cx="32" cy="32" r="32" fill="#4B5EBB" />
      <circle
        cx="32"
        cy="32"
        r="23.5"
        stroke="#fff"
        strokeWidth="3.5"
        fill="none"
      />
      <circle cx="32" cy="17.5" r="4.75" fill="#fff" />
      {/* Horizontal outstretched arms */}
      <rect x="12.5" y="25.25" width="39" height="5.5" rx="2.75" fill="#fff" />
      {/* Torso + A-frame legs */}
      <path
        d="M32 30.5v9.25M32 39.75 21.5 52.25M32 39.75 42.5 52.25"
        stroke="#fff"
        strokeWidth="5.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const FEATURE_ICONS: Record<FeatureId, (p: IconProps) => ReactElement> =
  {
    textSize: IconTextSize,
    highContrast: IconContrast,
    textAlign: IconAlign,
    colorFilter: IconColorFilter,
    textSpacing: IconSpacing,
    lineHeight: IconLineHeight,
    fontSelection: IconFont,
    saturation: IconSaturation,
    dyslexiaFriendly: IconDyslexia,
    biggerCursor: IconCursor,
    hideImages: IconHideImages,
    pauseAnimations: IconPause,
    readingGuide: IconReadingGuide,
    highlightLinks: IconHighlightLinks,
  };
