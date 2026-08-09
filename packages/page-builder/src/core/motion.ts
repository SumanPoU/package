import type { Block } from "./types";

/** Elementor-style entrance presets (CSS keyframes). */
export const MOTION_ENTRANCES = [
  "none",
  "fadeIn",
  "fadeInUp",
  "fadeInDown",
  "fadeInLeft",
  "fadeInRight",
  "zoomIn",
  "slideInLeft",
  "slideInRight",
] as const;

export type MotionEntrance = (typeof MOTION_ENTRANCES)[number];

export const MOTION_HOVERS = ["none", "grow", "shrink", "float"] as const;

export type MotionHover = (typeof MOTION_HOVERS)[number];

export type MotionTrigger = "load" | "scroll";

export type BlockMotion = {
  entrance?: MotionEntrance;
  hover?: MotionHover;
  /** Animation length in ms (default 600). */
  durationMs?: number;
  /** Delay before start in ms (default 0). */
  delayMs?: number;
  /** `scroll` = IntersectionObserver; `load` = on mount. Default `scroll`. */
  trigger?: MotionTrigger;
};

const ENTRANCE_SET = new Set<string>(MOTION_ENTRANCES);
const HOVER_SET = new Set<string>(MOTION_HOVERS);

export const getBlockMotion = (block: Block): BlockMotion =>
  (block.motion as BlockMotion | undefined) ?? {};

export const hasActiveEntrance = (motion: BlockMotion): boolean =>
  Boolean(motion.entrance && motion.entrance !== "none");

export const hasActiveHover = (motion: BlockMotion): boolean =>
  Boolean(motion.hover && motion.hover !== "none");

export const pageUsesMotion = (blocks: Block[]): boolean => {
  for (const block of blocks) {
    const m = getBlockMotion(block);
    if (hasActiveEntrance(m) || hasActiveHover(m)) return true;
    if (block.children?.length && pageUsesMotion(block.children)) return true;
  }
  return false;
};

export const pageNeedsMotionRuntime = (blocks: Block[]): boolean => {
  for (const block of blocks) {
    if (hasActiveEntrance(getBlockMotion(block))) return true;
    if (block.children?.length && pageNeedsMotionRuntime(block.children))
      return true;
  }
  return false;
};

export const normalizeMotion = (raw: unknown): BlockMotion | undefined => {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const entrance =
    typeof r.entrance === "string" && ENTRANCE_SET.has(r.entrance)
      ? (r.entrance as MotionEntrance)
      : undefined;
  const hover =
    typeof r.hover === "string" && HOVER_SET.has(r.hover)
      ? (r.hover as MotionHover)
      : undefined;
  const trigger =
    r.trigger === "load" || r.trigger === "scroll" ? r.trigger : undefined;
  const durationMs =
    typeof r.durationMs === "number" && Number.isFinite(r.durationMs)
      ? Math.max(0, Math.round(r.durationMs))
      : undefined;
  const delayMs =
    typeof r.delayMs === "number" && Number.isFinite(r.delayMs)
      ? Math.max(0, Math.round(r.delayMs))
      : undefined;
  const next: BlockMotion = {};
  if (entrance && entrance !== "none") next.entrance = entrance;
  if (hover && hover !== "none") next.hover = hover;
  if (trigger) next.trigger = trigger;
  if (durationMs !== undefined && durationMs !== 600)
    next.durationMs = durationMs;
  if (delayMs !== undefined && delayMs !== 0) next.delayMs = delayMs;
  return Object.keys(next).length ? next : undefined;
};

/** Per-block CSS vars when entrance or hover is set. */
export const motionVarsCssRule = (block: Block): string | null => {
  const m = getBlockMotion(block);
  if (!hasActiveEntrance(m) && !hasActiveHover(m)) return null;
  const duration = m.durationMs ?? 600;
  const delay = m.delayMs ?? 0;
  return `.b-${block.id}{--pb-motion-duration:${duration}ms;--pb-motion-delay:${delay}ms}`;
};

/**
 * Engine motion stylesheet — only composed when the page uses motion.
 * No decorative defaults: inactive blocks get no rules from this sheet alone.
 */
export const MOTION_CSS = `
@media (prefers-reduced-motion: reduce) {
  [data-pb-motion]:not([data-pb-motion="none"]) {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
  }
}
[data-pb-motion]:not([data-pb-motion="none"]):not([data-pb-motion-state="played"]) {
  opacity: 0;
}
[data-pb-motion="fadeInUp"]:not([data-pb-motion-state="played"]) { transform: translate3d(0, 24px, 0); }
[data-pb-motion="fadeInDown"]:not([data-pb-motion-state="played"]) { transform: translate3d(0, -24px, 0); }
[data-pb-motion="fadeInLeft"]:not([data-pb-motion-state="played"]) { transform: translate3d(-24px, 0, 0); }
[data-pb-motion="fadeInRight"]:not([data-pb-motion-state="played"]) { transform: translate3d(24px, 0, 0); }
[data-pb-motion="zoomIn"]:not([data-pb-motion-state="played"]) { transform: scale(0.85); }
[data-pb-motion="slideInLeft"]:not([data-pb-motion-state="played"]) { transform: translate3d(-40px, 0, 0); }
[data-pb-motion="slideInRight"]:not([data-pb-motion-state="played"]) { transform: translate3d(40px, 0, 0); }
[data-pb-motion-state="played"]:not([data-pb-motion-run]) {
  opacity: 1;
  transform: none;
}
[data-pb-motion-run][data-pb-motion="fadeIn"] { animation: pb-fadeIn var(--pb-motion-duration, 600ms) var(--pb-motion-delay, 0ms) both; }
[data-pb-motion-run][data-pb-motion="fadeInUp"] { animation: pb-fadeInUp var(--pb-motion-duration, 600ms) var(--pb-motion-delay, 0ms) both; }
[data-pb-motion-run][data-pb-motion="fadeInDown"] { animation: pb-fadeInDown var(--pb-motion-duration, 600ms) var(--pb-motion-delay, 0ms) both; }
[data-pb-motion-run][data-pb-motion="fadeInLeft"] { animation: pb-fadeInLeft var(--pb-motion-duration, 600ms) var(--pb-motion-delay, 0ms) both; }
[data-pb-motion-run][data-pb-motion="fadeInRight"] { animation: pb-fadeInRight var(--pb-motion-duration, 600ms) var(--pb-motion-delay, 0ms) both; }
[data-pb-motion-run][data-pb-motion="zoomIn"] { animation: pb-zoomIn var(--pb-motion-duration, 600ms) var(--pb-motion-delay, 0ms) both; }
[data-pb-motion-run][data-pb-motion="slideInLeft"] { animation: pb-slideInLeft var(--pb-motion-duration, 600ms) var(--pb-motion-delay, 0ms) both; }
[data-pb-motion-run][data-pb-motion="slideInRight"] { animation: pb-slideInRight var(--pb-motion-duration, 600ms) var(--pb-motion-delay, 0ms) both; }
@keyframes pb-fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pb-fadeInUp { from { opacity: 0; transform: translate3d(0, 24px, 0); } to { opacity: 1; transform: none; } }
@keyframes pb-fadeInDown { from { opacity: 0; transform: translate3d(0, -24px, 0); } to { opacity: 1; transform: none; } }
@keyframes pb-fadeInLeft { from { opacity: 0; transform: translate3d(-24px, 0, 0); } to { opacity: 1; transform: none; } }
@keyframes pb-fadeInRight { from { opacity: 0; transform: translate3d(24px, 0, 0); } to { opacity: 1; transform: none; } }
@keyframes pb-zoomIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: none; } }
@keyframes pb-slideInLeft { from { opacity: 0; transform: translate3d(-40px, 0, 0); } to { opacity: 1; transform: none; } }
@keyframes pb-slideInRight { from { opacity: 0; transform: translate3d(40px, 0, 0); } to { opacity: 1; transform: none; } }
[data-pb-hover="grow"] { transition: transform 0.25s ease; }
[data-pb-hover="grow"]:hover { transform: scale(1.05); }
[data-pb-hover="shrink"] { transition: transform 0.25s ease; }
[data-pb-hover="shrink"]:hover { transform: scale(0.96); }
[data-pb-hover="float"] { transition: transform 0.25s ease; }
[data-pb-hover="float"]:hover { transform: translateY(-6px); }
`.trim();

type MotionWindow = Window & {
  __pbMotionPlayed?: Set<string>;
  __pbMotionScan?: () => void;
  __pbMotionIo?: IntersectionObserver;
};

const playEntrance = (el: HTMLElement, played: Set<string>) => {
  const id = el.getAttribute("data-block-id") ?? "";
  if (id && played.has(id)) {
    el.setAttribute("data-pb-motion-state", "played");
    el.removeAttribute("data-pb-motion-run");
    return;
  }
  if (id) played.add(id);
  el.setAttribute("data-pb-motion-state", "played");
  el.setAttribute("data-pb-motion-run", "");
  const clearRun = () => {
    el.removeAttribute("data-pb-motion-run");
    el.removeEventListener("animationend", clearRun);
  };
  el.addEventListener("animationend", clearRun);
};

/**
 * Bind entrance motion under `root` (canvas / preview / open).
 * Idempotent — safe to call after React re-renders.
 */
export const initPbMotion = (root: ParentNode | null | undefined): void => {
  if (!root || typeof window === "undefined") return;
  const w = window as MotionWindow;
  if (!w.__pbMotionPlayed) w.__pbMotionPlayed = new Set();
  const played = w.__pbMotionPlayed;
  const reduced =
    typeof w.matchMedia === "function" &&
    w.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scan = () => {
    const nodes = root.querySelectorAll<HTMLElement>(
      '[data-pb-motion]:not([data-pb-motion="none"])',
    );
    nodes.forEach((el) => {
      const id = el.getAttribute("data-block-id") ?? "";
      if (id && played.has(id)) {
        el.setAttribute("data-pb-motion-state", "played");
        el.removeAttribute("data-pb-motion-run");
        return;
      }
      if (reduced) {
        playEntrance(el, played);
        return;
      }
      const trigger = el.getAttribute("data-pb-motion-trigger") || "scroll";
      if (trigger === "load") {
        playEntrance(el, played);
        return;
      }
      if (!w.__pbMotionIo) {
        w.__pbMotionIo = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const target = entry.target as HTMLElement;
              playEntrance(target, played);
              w.__pbMotionIo?.unobserve(target);
            }
          },
          { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
        );
      }
      if (el.getAttribute("data-pb-motion-state") === "played") return;
      w.__pbMotionIo.observe(el);
    });
  };

  w.__pbMotionScan = scan;
  scan();
};

/** Script body for composePageJs / static head tags (never eval). */
export const getMotionRuntimeScript = (): string =>
  `(function(){var w=window;if(typeof w.__pbMotionScan==="function"){w.__pbMotionScan();return;}var played=w.__pbMotionPlayed||(w.__pbMotionPlayed=new Set());var reduced=typeof w.matchMedia==="function"&&w.matchMedia("(prefers-reduced-motion: reduce)").matches;var io=null;function play(el){var id=el.getAttribute("data-block-id")||"";if(id&&played.has(id)){el.setAttribute("data-pb-motion-state","played");el.removeAttribute("data-pb-motion-run");return;}if(id)played.add(id);el.setAttribute("data-pb-motion-state","played");el.setAttribute("data-pb-motion-run","");var done=function(){el.removeAttribute("data-pb-motion-run");el.removeEventListener("animationend",done);};el.addEventListener("animationend",done);}function scan(){var root=document.querySelector("[data-pb-page]")||document.body;var nodes=root.querySelectorAll('[data-pb-motion]:not([data-pb-motion="none"])');nodes.forEach(function(el){var id=el.getAttribute("data-block-id")||"";if(id&&played.has(id)){el.setAttribute("data-pb-motion-state","played");el.removeAttribute("data-pb-motion-run");return;}if(reduced){play(el);return;}var trigger=el.getAttribute("data-pb-motion-trigger")||"scroll";if(trigger==="load"){play(el);return;}if(!io){io=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)return;play(entry.target);io.unobserve(entry.target);});},{threshold:0.15,rootMargin:"0px 0px -5% 0px"});}if(el.getAttribute("data-pb-motion-state")==="played")return;io.observe(el);});}w.__pbMotionScan=scan;if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",scan,{once:true});}else{scan;}var mo=new MutationObserver(function(){scan();});mo.observe(document.documentElement,{childList:true,subtree:true});})();`;
