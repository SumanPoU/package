import type {
  Block,
  BlockVisibility,
  Device,
  VisibilityPredicate,
  VisibleWhen,
} from "./types";

export type RenderSurface = "canvas" | "preview" | "open";

export type RenderContext = {
  locale: string;
  device: Device;
  auth?: { isLoggedIn: boolean; roles?: string[] };
  flags?: Record<string, boolean | string>;
  query?: Record<string, string>;
  dateNow?: string;
  ab?: { variant: string };
  /** Item scope inside repeater expansion (§23.2.1). */
  item?: Record<string, unknown>;
  [key: string]: unknown;
};

export type VisibilityResult = "show" | "hide" | "ghost";

const getByPath = (ctx: RenderContext, key: string): unknown => {
  const parts = key.split(".");
  let cur: unknown = ctx;
  for (const part of parts) {
    if (cur === null || cur === undefined || typeof cur !== "object") {
      return undefined;
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
};

const evalPredicate = (
  predicate: VisibilityPredicate,
  ctx: RenderContext,
): boolean => {
  const value = getByPath(ctx, predicate.key);

  if (predicate.equals !== undefined) {
    return value === predicate.equals;
  }
  if (predicate.notEquals !== undefined) {
    return value !== predicate.notEquals;
  }
  if (predicate.between) {
    const [start, end] = predicate.between;
    const now =
      typeof value === "string"
        ? value
        : typeof ctx.dateNow === "string"
          ? ctx.dateNow
          : new Date().toISOString();
    return now >= start && now <= end;
  }
  // Unknown predicate shape → fail safe (hidden)
  return false;
};

const evalVisibleWhen = (
  visibleWhen: VisibleWhen | undefined,
  ctx: RenderContext,
): boolean => {
  if (!visibleWhen) return true;
  const { allOf, anyOf } = visibleWhen;
  if (allOf?.length && !allOf.every((p) => evalPredicate(p, ctx))) {
    return false;
  }
  if (anyOf?.length && !anyOf.some((p) => evalPredicate(p, ctx))) {
    return false;
  }
  return true;
};

const surfaceFail = (surface: RenderSurface): VisibilityResult =>
  surface === "canvas" ? "ghost" : "hide";

/**
 * Evaluate author visibility + basic visibleWhen predicates.
 * Canvas ghosts hidden blocks; preview/open omit them from the DOM.
 */
export const resolveVisibility = (
  block: Block,
  ctx: RenderContext,
  surface: RenderSurface,
): VisibilityResult => {
  const v: BlockVisibility = block.visibility ?? {};

  if (v.hiddenOnPublish && surface !== "canvas") {
    return "hide";
  }
  if (v.hiddenOnCanvas && surface === "canvas") {
    return "ghost";
  }
  if (v.hiddenDevices?.includes(ctx.device)) {
    return surfaceFail(surface);
  }
  if (v.hiddenLocales?.includes(ctx.locale)) {
    return surfaceFail(surface);
  }
  if (!evalVisibleWhen(block.visibleWhen, ctx)) {
    return surfaceFail(surface);
  }
  return "show";
};

export const isVisibleAsPageContent = (
  block: Block,
  ctx: RenderContext,
  surface: RenderSurface,
): boolean => resolveVisibility(block, ctx, surface) === "show";
