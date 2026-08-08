/** Emit a nonce-bearing style tag string for CSP-safe injection. */
export const emitStyleTag = (css: string, nonce?: string): string => {
  const nonceAttr = nonce ? ` nonce="${nonce.replace(/"/g, "")}"` : "";
  return `<style${nonceAttr}>${css}</style>`;
};

export const injectStyleElement = (
  doc: Document,
  css: string,
  nonce?: string,
): HTMLStyleElement => {
  const el = doc.createElement("style");
  if (nonce) el.setAttribute("nonce", nonce);
  el.textContent = css;
  doc.head.appendChild(el);
  return el;
};
