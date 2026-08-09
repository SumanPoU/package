import { z } from "zod";
import { getMotionRuntimeScript, pageNeedsMotionRuntime } from "./motion";
import type { CustomScript, Page } from "./types";

export type ComposeJsOptions = {
  nonce?: string;
};

export type ComposeJsResult = {
  /** Script bodies ready for injection (not eval'd). */
  scripts: Array<{
    code: string;
    runAt: CustomScript["runAt"];
    enabled: boolean;
  }>;
  errors: string[];
};

const customScriptShape = z.object({
  code: z.string(),
  runAt: z.enum(["domReady", "afterHydration"]),
  enabled: z.boolean(),
});

export const validateCustomScript = (
  value: unknown,
): { ok: true; script: CustomScript } | { ok: false; error: string } => {
  const parsed = customScriptShape.safeParse(value);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.message };
  }
  return { ok: true, script: parsed.data };
};

/**
 * Shape-validate CustomScript entries and wrap for runAt.
 * Network access is default-deny via CSP `connect-src` (see sandboxPolicy) —
 * this composer does not grant fetch; isolation is the control. Never uses eval.
 * When any block has an entrance motion, appends the shared motion runtime.
 */
export const composePageJs = (
  page: Page,
  _options: ComposeJsOptions = {},
): ComposeJsResult => {
  const errors: string[] = [];
  const scripts: ComposeJsResult["scripts"] = [];

  const push = (value: unknown, label: string) => {
    const result = validateCustomScript(value);
    if (!result.ok) {
      errors.push(`${label}: ${result.error}`);
      return;
    }
    if (!result.script.enabled) return;
    scripts.push({
      code: wrapForRunAt(result.script.code, result.script.runAt),
      runAt: result.script.runAt,
      enabled: true,
    });
  };

  if (page.globalJs) {
    const list = Array.isArray(page.globalJs) ? page.globalJs : [page.globalJs];
    for (let i = 0; i < list.length; i += 1) {
      push(list[i]!, `globalJs[${i}]`);
    }
  }

  const walk = (blocks: Page["blocks"]) => {
    for (const block of blocks) {
      if (block.customJs) push(block.customJs, `block:${block.id}.customJs`);
      if (block.children?.length) walk(block.children);
    }
  };
  walk(page.blocks);

  if (pageNeedsMotionRuntime(page.blocks)) {
    scripts.push({
      code: getMotionRuntimeScript(),
      runAt: "domReady",
      enabled: true,
    });
  }

  return { scripts, errors };
};

const wrapForRunAt = (code: string, runAt: CustomScript["runAt"]): string => {
  if (runAt === "domReady") {
    return `(function(){function __pbRun(){${code}\n}if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",__pbRun,{once:true});}else{__pbRun();}})();`;
  }
  // afterHydration — host/canvas calls after React mount; still wrap IIFE
  return `(function(){${code}\n})();`;
};

/** Emit a nonce-bearing script tag string (host / injectScripts). */
export const emitScriptTag = (code: string, nonce?: string): string => {
  const nonceAttr = nonce ? ` nonce="${nonce.replace(/"/g, "")}"` : "";
  return `<script${nonceAttr}>${code}</script>`;
};
