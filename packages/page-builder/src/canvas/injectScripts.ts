/** Emit a nonce-bearing script tag string — never eval / new Function. */
export const emitScriptTagFromCanvas = (
  code: string,
  nonce?: string,
): string => {
  const nonceAttr = nonce ? ` nonce="${nonce.replace(/"/g, "")}"` : "";
  return `<script${nonceAttr}>${code}</script>`;
};

/**
 * Append a script element with text content (not a network src).
 * Isolation relies on iframe sandbox + CSP nonce — not on parsing/rewriting JS.
 */
export const injectScriptElement = (
  doc: Document,
  code: string,
  nonce?: string,
): HTMLScriptElement => {
  const el = doc.createElement("script");
  if (nonce) el.setAttribute("nonce", nonce);
  el.textContent = code;
  doc.body.appendChild(el);
  return el;
};
