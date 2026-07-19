/**
 * Brand color reference for the docs app.
 * Source of truth: `src/app/globals.css` (`:root` + `@theme inline`).
 *
 * Tailwind v4 does not need tailwind.config.ts for colors — edit CSS vars only.
 *
 * | Token            | Hex       | Tailwind examples        |
 * |------------------|-----------|--------------------------|
 * | --accent         | #1D9E75   | bg-accent, text-accent   |
 * | --accent-fg      | #04342C   | text-accent-fg           |
 * | --bg-page        | #0B0B0B   | bg-page                  |
 * | --bg-card        | #161615   | bg-card                  |
 * | --border-color   | #2C2C2A   | border-border            |
 * | --text-primary   | #F1EFE8   | text-primary             |
 * | --text-secondary | #888780   | text-secondary           |
 * | --text-tertiary  | #5F5E5A   | text-tertiary            |
 */
export const brand = {
  accent: "#1D9E75",
  accentFg: "#04342C",
  bgPage: "#0B0B0B",
  bgCard: "#161615",
  border: "#2C2C2A",
  textPrimary: "#F1EFE8",
  textSecondary: "#888780",
  textTertiary: "#5F5E5A",
} as const;
