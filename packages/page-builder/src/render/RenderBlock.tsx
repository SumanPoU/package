import { useEffect, useState } from "react";

import {
  isDataBindingAllowed,
  type PageBuilderCapabilities,
} from "../core/capabilities";
import {
  type BindingRenderContext,
  type BindingSourceData,
  expandRepeater,
  type FetchDataSource,
} from "../core/dataBinding";
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
  capabilities?: PageBuilderCapabilities;
  fetchDataSource?: FetchDataSource;
};

export const RenderBlock = ({
  block,
  registry,
  localeConfig,
  activeLocale,
  renderContext,
  surface,
  capabilities,
  fetchDataSource,
}: RenderBlockProps) => {
  const visibility = resolveVisibility(block, renderContext, surface);
  if (visibility === "hide") return null;
  if (visibility === "ghost") return null;
  if (!isVisibleAsPageContent(block, renderContext, surface)) return null;

  const definition = registry.get(block.type);
  const Render = definition?.render ?? FallbackBlock;
  const resolved = resolveProps(block, activeLocale, localeConfig);

  const binding = block.dataBinding;
  const bindingAllowed = isDataBindingAllowed(capabilities);
  const bindingCtx = renderContext as BindingRenderContext;
  const sourceId = binding?.sourceId;
  const hostItems = sourceId ? bindingCtx.dataSources?.[sourceId] : undefined;

  const [fetched, setFetched] = useState<BindingSourceData | null>(null);

  useEffect(() => {
    if (!binding || !bindingAllowed || !fetchDataSource || !sourceId) return;
    if (hostItems) return;
    let cancelled = false;
    setFetched({ items: [], state: "loading" });
    void fetchDataSource(sourceId, binding.params)
      .then((data) => {
        if (!cancelled) setFetched(data);
      })
      .catch(() => {
        if (!cancelled) setFetched({ items: [], state: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [
    binding,
    bindingAllowed,
    fetchDataSource,
    sourceId,
    hostItems,
    binding?.params,
  ]);

  if (binding) {
    // Capability off → inert: template once, no fetch / no expand (§22.8).
    if (!bindingAllowed) {
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
            capabilities={capabilities}
            fetchDataSource={fetchDataSource}
          />
        )) ?? null;
      return (
        <Render block={block} props={{ ...resolved, bindingState: "empty" }}>
          {children}
        </Render>
      );
    }

    const mergedCtx: BindingRenderContext = {
      ...bindingCtx,
      dataSources: {
        ...(bindingCtx.dataSources ?? {}),
        ...(sourceId && fetched
          ? { [sourceId]: fetched }
          : sourceId && hostItems
            ? { [sourceId]: hostItems }
            : {}),
      },
    };

    const { state, instances } = expandRepeater(block, mergedCtx);

    if (
      surface === "canvas" &&
      (state === "empty" || state === "loading" || instances.length === 0)
    ) {
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
            capabilities={capabilities}
            fetchDataSource={fetchDataSource}
          />
        )) ?? null;
      return (
        <Render block={block} props={{ ...resolved, bindingState: state }}>
          {children}
        </Render>
      );
    }

    const sourceItems = mergedCtx.dataSources?.[binding.sourceId]?.items ?? [];

    return (
      <Render block={block} props={{ ...resolved, bindingState: state }}>
        {instances.map((clones, index) => {
          const item = sourceItems[index] ?? {};
          const itemCtx: RenderContext = { ...renderContext, item };
          return clones.map((clone) => (
            <RenderBlock
              key={clone.id}
              block={clone}
              registry={registry}
              localeConfig={localeConfig}
              activeLocale={activeLocale}
              renderContext={itemCtx}
              surface={surface}
              capabilities={capabilities}
              fetchDataSource={fetchDataSource}
            />
          ));
        })}
      </Render>
    );
  }

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
        capabilities={capabilities}
        fetchDataSource={fetchDataSource}
      />
    )) ?? null;

  return (
    <Render block={block} props={resolved}>
      {children}
    </Render>
  );
};
