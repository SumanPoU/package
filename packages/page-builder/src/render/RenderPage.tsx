import type { CSSProperties } from "react";

import type { BlockRegistry } from "../core/registry";
import type { LocaleConfig, Page } from "../core/types";
import type { RenderContext, RenderSurface } from "../core/visibilityResolve";
import { RenderBlock } from "./RenderBlock";

export type RenderPageProps = {
  page: Page;
  registry: BlockRegistry;
  localeConfig: LocaleConfig;
  activeLocale: string;
  renderContext?: Partial<RenderContext>;
  surface?: RenderSurface;
  className?: string;
  /** Structural only — no decorative engine styles. */
  style?: CSSProperties;
};

export const RenderPage = ({
  page,
  registry,
  localeConfig,
  activeLocale,
  renderContext,
  surface = "open",
  className,
  style,
}: RenderPageProps) => {
  const ctx: RenderContext = {
    device: "desktop",
    ...renderContext,
    locale: renderContext?.locale ?? activeLocale,
  };

  return (
    <div
      className={className}
      style={style}
      data-pb-page={page.id}
      data-pb-surface={surface}
      lang={activeLocale}
    >
      {page.blocks.map((block) => (
        <RenderBlock
          key={block.id}
          block={block}
          registry={registry}
          localeConfig={localeConfig}
          activeLocale={activeLocale}
          renderContext={ctx}
          surface={surface}
        />
      ))}
    </div>
  );
};
