/**
 * Brand color reference for the docs app.
 * Source of truth: `src/app/globals.css` (`:root` / `.light` + `.dark`).
 */
export const brand = {
  accent: "#1D9E75",
  accentFg: "#04342C",
  light: {
    bgPage: "#F7F6F2",
    bgCard: "#FFFFFF",
    border: "#E4E2DB",
    textPrimary: "#1A1915",
    textSecondary: "#6F6E68",
    textTertiary: "#9B9A93",
  },
  dark: {
    bgPage: "#0B0B0B",
    bgCard: "#161615",
    border: "#2C2C2A",
    textPrimary: "#F1EFE8",
    textSecondary: "#888780",
    textTertiary: "#5F5E5A",
  },
} as const;
