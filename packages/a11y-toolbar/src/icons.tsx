import type { ReactElement, SVGProps } from "react";

import type { FeatureIconId } from "./registry";
import type { FeatureId } from "./types";

type IconProps = SVGProps<SVGSVGElement>;

/** Shared outline icon base — 24×24, 1.75 stroke, round caps/joins. */
function base(props: IconProps): IconProps {
  return {
    width: 24,
    height: 24,
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
      <path d="M4 19V7h4" />
      <path d="M4 13h3" />
      <path d="M12 19V5h5" />
      <path d="M12 11h4" />
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
      <path d="M12 4a8 8 0 0 1 0 16" />
      <path d="M8 12h8" />
    </svg>
  );
}

export function IconSpacing(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 7v10M19 7v10" />
      <path d="M9 12h6M9 12l2-2M15 12l-2-2M9 12l2 2M15 12l-2 2" />
    </svg>
  );
}

export function IconLineHeight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 4v16M6 4l-2 2M6 4l2 2M6 20l-2-2M6 20l2-2" />
      <path d="M11 7h9M11 12h9M11 17h9" />
    </svg>
  );
}

export function IconFont(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 18V8h5" />
      <path d="M5 12h4" />
      <path d="M14 18V8h5" />
      <path d="M14 18h5" />
    </svg>
  );
}

export function IconSaturation(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function IconDyslexia(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 7h6M5 12h9M5 17h7" />
      <path d="M16 7l3 5-3 5" />
    </svg>
  );
}

export function IconCursor(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 4l10 8-4.5 1.2L14 20l-2.2.8-2.3-6.2L5 17.5z" />
    </svg>
  );
}

export function IconHideImages(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <circle cx="9" cy="11" r="1.5" />
      <path d="M3.5 15.5l4.5-3.5 3 2.5 4-4 5.5 5" />
      <path d="M4 4l16 16" />
    </svg>
  );
}

export function IconPause(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="5" width="3" height="14" rx="1" />
      <rect x="14" y="5" width="3" height="14" rx="1" />
    </svg>
  );
}

export function IconReadingGuide(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h10" />
      <path d="M3 10.5h18" strokeWidth="2.5" />
    </svg>
  );
}

export function IconHighlightLinks(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 11a3.5 3.5 0 0 1 0-5l2-2a3.5 3.5 0 0 1 5 5l-1 1" />
      <path d="M15 13a3.5 3.5 0 0 1 0 5l-2 2a3.5 3.5 0 0 1-5-5l1-1" />
    </svg>
  );
}

/** Speaker / read-aloud mark. */
export function IconReadAloud(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 9v6h3.5L12 19V5L7.5 9H4z" />
      <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
      <path d="M17.5 7a6 6 0 0 1 0 10" />
    </svg>
  );
}

export function IconSectionDisplay(props: IconProps) {
  return (
    <svg {...base({ ...props, width: 16, height: 16 })}>
      <rect x="4" y="5" width="16" height="12" rx="2" />
      <path d="M8 9h8M8 13h5" />
    </svg>
  );
}

export function IconSectionMotion(props: IconProps) {
  return (
    <svg {...base({ ...props, width: 16, height: 16 })}>
      <path d="M5 12h4l2-6 3 12 2-6h3" />
    </svg>
  );
}

/** Circular reset arrow — restores all preferences. */
export function IconReset(props: IconProps) {
  return (
    <svg {...base({ ...props, width: 20, height: 20 })}>
      <path d="M4 12a8 8 0 1 0 2.2-5.5" />
      <path d="M4 4v4.5h4.5" />
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

/**
 * Universal Symbol of Access launcher mark.
 * Circle + ring + outstretched figure; fill/glyph from CSS `currentColor` / button vars.
 */
export function IconLauncher(props: IconProps) {
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
      <circle
        cx="32"
        cy="32"
        r="23.5"
        stroke="currentColor"
        strokeWidth="3.5"
        fill="none"
      />
      <circle cx="32" cy="17.5" r="4.75" fill="currentColor" />
      {/* Horizontal outstretched arms */}
      <rect
        x="12.5"
        y="25.25"
        width="39"
        height="5.5"
        rx="2.75"
        fill="currentColor"
      />
      {/* Torso + A-frame legs */}
      <path
        d="M32 30.5v9.25M32 39.75 21.5 52.25M32 39.75 42.5 52.25"
        stroke="currentColor"
        strokeWidth="5.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** @deprecated Use IconLauncher */
export const IconAccessibility = IconLauncher;

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
    readAloud: IconReadAloud,
  };

export const SECTION_ICONS = {
  sectionDisplay: IconSectionDisplay,
  sectionMotion: IconSectionMotion,
} as const;

export function resolveIcon(
  iconId: FeatureIconId,
): (p: IconProps) => ReactElement {
  if (iconId in FEATURE_ICONS) {
    return FEATURE_ICONS[iconId as FeatureId];
  }
  if (iconId === "sectionDisplay") return IconSectionDisplay;
  if (iconId === "sectionMotion") return IconSectionMotion;
  if (iconId === "launcher") return IconLauncher;
  if (iconId === "reset") return IconReset;
  if (iconId === "close") return IconClose;
  return IconTextSize;
}
