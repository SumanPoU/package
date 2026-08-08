import { emitStyleTag } from "../canvas/injectStyles";
import type { CssParseOptions } from "../core/cssParser";
import { composePageCss } from "../core/customCssComposer";
import { composePageJs, emitScriptTag } from "../core/customJsComposer";
import type { BlockRegistry } from "../core/registry";
import type { LocaleConfig, Page } from "../core/types";
import type { RenderContext } from "../core/visibilityResolve";
import { RenderPage } from "./RenderPage";

export type OpenPageViewProps = {
  page: Page;
  registry: BlockRegistry;
  localeConfig: LocaleConfig;
  activeLocale: string;
  renderContext?: Partial<RenderContext>;
  nonce?: string;
  cssOptions?: CssParseOptions;
  injectAuthorCode?: boolean;
};

/**
 * Published / Open Page surface — same RenderPage path as canvas + preview.
 */
export const OpenPageView = ({
  page,
  registry,
  localeConfig,
  activeLocale,
  renderContext,
  nonce,
  cssOptions,
  injectAuthorCode = true,
}: OpenPageViewProps) => {
  const { css, errors: cssErrors } = composePageCss(page, cssOptions);
  const { scripts, errors: jsErrors } = composePageJs(page, { nonce });

  return (
    <>
      {injectAuthorCode && css ? (
        <style
          nonce={nonce}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: author CSS via composer
          dangerouslySetInnerHTML={{ __html: css }}
          data-pb-author-css=""
        />
      ) : null}
      {injectAuthorCode && cssErrors.length > 0 ? (
        <script type="application/json" data-pb-css-errors="">
          {JSON.stringify(cssErrors)}
        </script>
      ) : null}
      <RenderPage
        page={page}
        registry={registry}
        localeConfig={localeConfig}
        activeLocale={activeLocale}
        renderContext={renderContext}
        surface="open"
      />
      {injectAuthorCode
        ? scripts.map((s, i) => (
            <script
              key={`pb-js-${i}`}
              nonce={nonce}
              // biome-ignore lint/security/noDangerouslySetInnerHtml: author JS via composer
              dangerouslySetInnerHTML={{ __html: s.code }}
              data-pb-author-js=""
              data-pb-run-at={s.runAt}
            />
          ))
        : null}
      {injectAuthorCode && jsErrors.length > 0 ? (
        <script type="application/json" data-pb-js-errors="">
          {JSON.stringify(jsErrors)}
        </script>
      ) : null}
    </>
  );
};

export const composeOpenPageHeadTags = (
  page: Page,
  options: { nonce?: string; cssOptions?: CssParseOptions } = {},
): { styleTag: string; scriptTags: string[]; errors: string[] } => {
  const { css, errors } = composePageCss(page, options.cssOptions);
  const { scripts, errors: jsErrors } = composePageJs(page, {
    nonce: options.nonce,
  });
  return {
    styleTag: css ? emitStyleTag(css, options.nonce) : "",
    scriptTags: scripts.map((s) => emitScriptTag(s.code, options.nonce)),
    errors: [...errors.map((e) => e.message), ...jsErrors],
  };
};
