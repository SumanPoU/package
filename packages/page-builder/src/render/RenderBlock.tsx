import { FallbackBlock } from "../core/fallbackBlock";
import { resolveProps } from "../core/i18nResolve";
import type { BlockRegistry } from "../core/registry";
import type { Block, LocaleConfig } from "../core/types";
import {
  isVisibleAsPageContent,
  type RenderContext,
  type RenderSurface,
  resolveVisibility,
} from "../core/visibilityResolve";

export type RenderBlockProps = {
  block: Block;
  registry: BlockRegistry;
  localeConfig: LocaleConfig;
  activeLocale: string;
  renderContext: RenderContext;
  surface: RenderSurface;
};

export const RenderBlock = ({
  block,
  registry,
  localeConfig,
  activeLocale,
  renderContext,
  surface,
}: RenderBlockProps) => {
  const visibility = resolveVisibility(block, renderContext, surface);
  if (visibility === "hide") return null;
  // Canvas ghost: skip painting as page content (parent overlay may still show it).
  if (visibility === "ghost") return null;
  if (!isVisibleAsPageContent(block, renderContext, surface)) return null;

  const definition = registry.get(block.type);
  const Render = definition?.render ?? FallbackBlock;
  const resolved = resolveProps(block, activeLocale, localeConfig);

  const children =
    block.children?.map((child) => (
      <RenderBlock
        key={child.id}
        block={child}
        registry={registry}
        localeConfig={localeConfig}
        activeLocale={activeLocale}
        renderContext={renderContext}
        surface={surface}
      />
    )) ?? null;

  return (
    <Render block={block} props={resolved}>
      {children}
    </Render>
  );
};
