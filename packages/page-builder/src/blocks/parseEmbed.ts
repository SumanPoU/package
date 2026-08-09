/**
 * Parse a pasted iframe snippet or raw URL into a safe embed descriptor.
 * Stores only https src (+ optional size/title) — never arbitrary HTML.
 */
export type ParsedEmbed = {
  src: string;
  width?: string;
  height?: string;
  title?: string;
};

const ATTR = (tag: string, name: string): string | undefined => {
  const re = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const m = tag.match(re);
  return m?.[1] ?? m?.[2] ?? m?.[3];
};

export const parseEmbedInput = (raw: string): ParsedEmbed | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^https:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      if (u.protocol !== "https:") return null;
      return { src: u.toString() };
    } catch {
      return null;
    }
  }

  const iframe = trimmed.match(/<iframe\b[^>]*>/i)?.[0];
  if (!iframe) return null;
  const src = ATTR(iframe, "src");
  if (!src || !/^https:\/\//i.test(src)) return null;
  try {
    const u = new URL(src);
    if (u.protocol !== "https:") return null;
    return {
      src: u.toString(),
      width: ATTR(iframe, "width"),
      height: ATTR(iframe, "height"),
      title: ATTR(iframe, "title"),
    };
  } catch {
    return null;
  }
};

export const isGoogleMapsEmbedSrc = (src: string): boolean => {
  try {
    const u = new URL(src);
    if (u.protocol !== "https:") return false;
    const host = u.hostname;
    const isGoogle =
      host === "google.com" ||
      host.endsWith(".google.com") ||
      /\.google\.[a-z.]+$/i.test(host) ||
      host === "maps.googleapis.com";
    if (!isGoogle) return false;
    return u.pathname.includes("/maps") || u.searchParams.has("pb");
  } catch {
    return false;
  }
};

/** Prefer /maps/embed URLs; accept pasted Google Maps iframe HTML. */
export const parseGoogleMapsEmbed = (raw: string): ParsedEmbed | null => {
  const parsed = parseEmbedInput(raw);
  if (!parsed) return null;
  if (!isGoogleMapsEmbedSrc(parsed.src)) return null;
  return parsed;
};
