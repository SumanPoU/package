import { DEFAULT_STORAGE_KEY } from "./types";

/**
 * Inline script for `<head>` — runs before paint to avoid FOUC.
 * Supports legacy unversioned prefs and `{ schemaVersion, values }` docs.
 * Also sets `data-a11y-locale` from `${storageKey}:locale` (attribute only —
 * translated chrome still resolves in React; pass controlled `locale` for SSR).
 * CSS vars use `--itzsa-a11y-*` namespace.
 */
export function getA11yFoucScript(
  storageKey: string = DEFAULT_STORAGE_KEY,
): string {
  return `(function(){try{var k=${JSON.stringify(storageKey)};var r=document.documentElement;var loc=localStorage.getItem(k+":locale");if(loc)r.setAttribute("data-a11y-locale",loc);var raw=localStorage.getItem(k);if(!raw)return;var doc=JSON.parse(raw);if(!doc||typeof doc!=="object")return;var p=(doc.values&&typeof doc.schemaVersion==="number")?doc.values:doc;if(!p||typeof p!=="object")return;function n(v,m){v=+v;if(!isFinite(v)||v<0)return 0;v=v|0;return v>=m?m-1:v}var ts=n(p.textSize,4),hc=n(p.highContrast,3),ta=n(p.textAlign,3),cf=n(p.colorFilter,4),sp=n(p.textSpacing,3),lh=n(p.lineHeight,3),ff=n(p.fontSelection,3),sat=n(p.saturation,3);var dys=!!p.dyslexiaFriendly;r.setAttribute("data-a11y-text-size",String(ts));r.setAttribute("data-a11y-contrast",String(hc));r.setAttribute("data-a11y-align",String(ta));r.setAttribute("data-a11y-color-filter",String(cf));r.setAttribute("data-a11y-text-spacing",String(sp));r.setAttribute("data-a11y-line-height",String(lh));r.setAttribute("data-a11y-font",String(ff));r.setAttribute("data-a11y-saturation",String(sat));r.setAttribute("data-a11y-dyslexia",dys?"1":"0");r.setAttribute("data-a11y-bigger-cursor",p.biggerCursor?"1":"0");r.setAttribute("data-a11y-hide-images",p.hideImages?"1":"0");r.setAttribute("data-a11y-pause-animations",p.pauseAnimations?"1":"0");r.setAttribute("data-a11y-reading-guide",p.readingGuide?"1":"0");r.setAttribute("data-a11y-highlight-links",p.highlightLinks?"1":"0");var zoomOk=typeof CSS!=="undefined"&&CSS.supports&&CSS.supports("zoom","1.5");r.setAttribute("data-a11y-zoom-support",zoomOk?"1":"0");var scales=[1,1.125,1.25,1.45],letters=[0,0.06,0.12],words=[0,0.08,0.16],lines=[1.5,1.75,2],sats=[1,0.45,0],filters=["none","grayscale(1)","hue-rotate(180deg) contrast(1.15)","sepia(0.9) hue-rotate(55deg) saturate(1.2)"];var sLevel=dys?2:sp,lLevel=dys?2:lh;r.style.setProperty("--itzsa-a11y-font-scale",String(scales[ts]));r.style.setProperty("--itzsa-a11y-letter-spacing",letters[sLevel]+"em");r.style.setProperty("--itzsa-a11y-word-spacing",words[sLevel]+"em");r.style.setProperty("--itzsa-a11y-line-height",String(lines[lLevel]));r.style.setProperty("--itzsa-a11y-saturation",String(sats[sat]));r.style.setProperty("--itzsa-a11y-color-filter",filters[cf])}catch(e){}})();`;
}
