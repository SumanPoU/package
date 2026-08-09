import { cloneBlock } from "./blockTree";
import type { Block } from "./types";
import type { RenderContext } from "./visibilityResolve";

/** Host-resolved binding payload (Strategy A — §25.3). */
export type BindingSourceState = "ready" | "loading" | "empty" | "error";

export type BindingSourceData = {
  items: Record<string, unknown>[];
  state?: BindingSourceState;
};

/** Host callback — Strategy B (§25.3). Engine never imports host services. */
export type FetchDataSource = (
  sourceId: string,
  params: Record<string, unknown>,
) => Promise<BindingSourceData>;

/**
 * Extend renderContext with host-resolved DataSource results.
 * Keys match `dataBinding.sourceId`.
 */
export type BindingRenderContext = RenderContext & {
  dataSources?: Record<string, BindingSourceData>;
};

/** Token roots: `{{item.*}}` (repeater) and `{{props.*}}` (Model B templates). */
export type BindingScope = {
  item?: Record<string, unknown>;
  props?: Record<string, unknown>;
};

const TOKEN_RE = /\{\{\s*((?:item|props)(?:\.[A-Za-z_][A-Za-z0-9_]*)+)\s*\}\}/g;

const lookupPath = (
  root: Record<string, unknown> | undefined,
  pathAfterRoot: string[],
): unknown => {
  if (!root) return undefined;
  let cur: unknown = root;
  for (const part of pathAfterRoot) {
    if (cur === null || cur === undefined || typeof cur !== "object") {
      return undefined;
    }
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
};

const coerceString = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

/**
 * One-pass token resolve (§25.4). Invalid / incomplete `{{` stays literal.
 * Missing paths → empty string. Resolved values are not re-scanned.
 */
export const resolveTemplateString = (
  input: string,
  scope: BindingScope,
): string => {
  if (!input.includes("{{")) return input;
  return input.replace(TOKEN_RE, (_match, path: string) => {
    const parts = path.split(".");
    const rootName = parts[0];
    const rest = parts.slice(1);
    const root =
      rootName === "item"
        ? scope.item
        : rootName === "props"
          ? scope.props
          : undefined;
    return coerceString(lookupPath(root, rest));
  });
};

/** Convenience: resolve `{{item.*}}` against a single item record. */
export const resolveBindingString = (
  input: string,
  item: Record<string, unknown>,
): string => resolveTemplateString(input, { item });

export const resolveBindingsInValue = (
  value: unknown,
  scope: BindingScope | Record<string, unknown>,
): unknown => {
  const normalized: BindingScope =
    scope && typeof scope === "object" && ("item" in scope || "props" in scope)
      ? (scope as BindingScope)
      : { item: scope as Record<string, unknown> };

  if (typeof value === "string")
    return resolveTemplateString(value, normalized);
  if (Array.isArray(value)) {
    return value.map((v) => resolveBindingsInValue(v, normalized));
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = resolveBindingsInValue(v, normalized);
    }
    return out;
  }
  return value;
};

const applyScopeToBlock = (block: Block, scope: BindingScope): Block => {
  const cloned = cloneBlock(block);
  const walk = (node: Block): void => {
    node.props = resolveBindingsInValue(node.props, scope) as Record<
      string,
      unknown
    >;
    if (node.i18nProps) {
      node.i18nProps = resolveBindingsInValue(
        node.i18nProps,
        scope,
      ) as Block["i18nProps"];
    }
    node.children?.forEach(walk);
  };
  walk(cloned);
  return cloned;
};

/** Clone block with fresh ids and resolve `{{item.*}}` in props / i18nProps. */
export const applyBindingsToBlock = (
  block: Block,
  item: Record<string, unknown>,
): Block => applyScopeToBlock(block, { item });

/** Clone template tree and resolve `{{props.*}}` (Model B). */
export const applyPropsTemplate = (
  block: Block,
  props: Record<string, unknown>,
): Block => applyScopeToBlock(block, { props });

export const getRepeaterTemplate = (block: Block): Block[] => {
  const fromBinding = block.dataBinding?.itemTemplate;
  if (fromBinding && fromBinding.length > 0) return fromBinding;
  return block.children ?? [];
};

export const resolveBindingSource = (
  sourceId: string,
  ctx: BindingRenderContext,
): BindingSourceData => {
  const data = ctx.dataSources?.[sourceId];
  if (!data) return { items: [], state: "empty" };
  if (data.state) return data;
  if (!data.items.length) return { items: [], state: "empty" };
  return { items: data.items, state: "ready" };
};

export type ExpandRepeaterResult = {
  state: BindingSourceState;
  /** One root fragment per item — each is a list of template clones. */
  instances: Block[][];
};

/**
 * Expand repeater template once per item. Does not mutate the stored block.
 */
export const expandRepeater = (
  block: Block,
  ctx: BindingRenderContext,
): ExpandRepeaterResult => {
  const binding = block.dataBinding;
  if (!binding) {
    return { state: "empty", instances: [] };
  }
  const source = resolveBindingSource(binding.sourceId, ctx);
  if (source.state === "loading" || source.state === "error") {
    return { state: source.state, instances: [] };
  }
  if (source.state === "empty" || source.items.length === 0) {
    return { state: "empty", instances: [] };
  }
  const template = getRepeaterTemplate(block);
  if (!template.length) {
    return { state: "empty", instances: [] };
  }
  const instances = source.items.map((item) =>
    template.map((node) => applyBindingsToBlock(node, item)),
  );
  return { state: "ready", instances };
};
