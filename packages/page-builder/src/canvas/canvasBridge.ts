import { z } from "zod";

export const BRIDGE_VERSION = 1 as const;

export const bridgeEnvelopeSchema = z.object({
  type: z.string().min(1),
  version: z.literal(BRIDGE_VERSION),
  payload: z.unknown(),
});

export type BridgeEnvelope<T = unknown> = {
  type: string;
  version: typeof BRIDGE_VERSION;
  payload: T;
};

export type BridgeReadyPayload = { frameId?: string };
export type BridgeSelectPayload = { blockId: string | null };
export type BridgeMeasurePayload = {
  blockId: string;
  rect: { top: number; left: number; width: number; height: number };
};
export type BridgePointerPayload = {
  x: number;
  y: number;
  blockId?: string | null;
};
export type BridgeDndHitPayload = {
  parentId: string | null;
  index: number;
  blockId?: string | null;
};

/** Parent → canvas: serializable page state (registry stays local to each side). */
export type BridgePageSyncPayload = {
  page: unknown;
  activeLocale: string;
  localeConfig: unknown;
  renderContext?: unknown;
  selectedId?: string | null;
};

export type ChildToParentBridgeType =
  | "ready"
  | "select"
  | "measure"
  | "pointer"
  | "dnd-hit";

export type ParentToChildBridgeType = "page-sync";

export type KnownBridgeType = ChildToParentBridgeType | ParentToChildBridgeType;

export const CHILD_TO_PARENT_TYPES = new Set<string>([
  "ready",
  "select",
  "measure",
  "pointer",
  "dnd-hit",
]);

export const PARENT_TO_CHILD_TYPES = new Set<string>(["page-sync"]);

export const KNOWN_BRIDGE_TYPES = new Set<string>([
  ...CHILD_TO_PARENT_TYPES,
  ...PARENT_TO_CHILD_TYPES,
]);

export const createBridgeMessage = <T>(
  type: KnownBridgeType | string,
  payload: T,
): BridgeEnvelope<T> => ({
  type,
  version: BRIDGE_VERSION,
  payload,
});

export type ParseBridgeResult =
  | { ok: true; message: BridgeEnvelope }
  | { ok: false; reason: string };

export const parseBridgeMessage = (
  data: unknown,
  allowed?: Set<string>,
): ParseBridgeResult => {
  const parsed = bridgeEnvelopeSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, reason: "invalid envelope" };
  }
  const allow = allowed ?? KNOWN_BRIDGE_TYPES;
  if (!allow.has(parsed.data.type)) {
    return { ok: false, reason: `unknown type "${parsed.data.type}"` };
  }
  if (parsed.data.version !== BRIDGE_VERSION) {
    return { ok: false, reason: "version mismatch" };
  }
  return {
    ok: true,
    message: {
      type: parsed.data.type,
      version: parsed.data.version,
      payload: parsed.data.payload,
    },
  };
};

/**
 * Parent-side listener: accept only messages from `iframe.contentWindow`.
 */
export const createParentBridgeListener = (
  iframe: HTMLIFrameElement,
  onMessage: (message: BridgeEnvelope) => void,
): (() => void) => {
  const handler = (event: MessageEvent) => {
    if (event.source !== iframe.contentWindow) return;
    const result = parseBridgeMessage(event.data, CHILD_TO_PARENT_TYPES);
    if (!result.ok) return;
    onMessage(result.message);
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
};

/** Canvas-side listener: accept only messages from `window.parent`. */
export const createChildBridgeListener = (
  onMessage: (message: BridgeEnvelope) => void,
): (() => void) => {
  const handler = (event: MessageEvent) => {
    if (event.source !== window.parent) return;
    const result = parseBridgeMessage(event.data, PARENT_TO_CHILD_TYPES);
    if (!result.ok) return;
    onMessage(result.message);
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
};

/** Post from canvas document to parent. */
export const postToParent = <T>(
  type: ChildToParentBridgeType,
  payload: T,
): void => {
  if (typeof window === "undefined" || !window.parent) return;
  window.parent.postMessage(createBridgeMessage(type, payload), "*");
};

/** Post from parent editor to canvas iframe. */
export const postToCanvas = <T>(
  iframe: HTMLIFrameElement,
  type: ParentToChildBridgeType,
  payload: T,
): void => {
  iframe.contentWindow?.postMessage(createBridgeMessage(type, payload), "*");
};
