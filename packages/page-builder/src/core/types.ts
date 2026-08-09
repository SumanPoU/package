import type { ComponentType, ReactNode } from "react";
import type { ZodType } from "zod";

import type { BlockMotion } from "./motion";

export type Device = "desktop" | "tablet" | "mobile";

export type BlockSource = "core" | "tenant" | "plugin";

export type LocaleStorage = "nested" | "flat";

export type TextDirection = "ltr" | "rtl";

export type LocaleDefinition = {
  code: string;
  label: string;
  dir: TextDirection;
  /** Suffix aliases for flat keys; first entry is the canonical write suffix. */
  flatSuffixes: string[];
};

export type LocaleConfig = {
  locales: LocaleDefinition[];
  defaultLocale: string;
  fallbackLocale: string;
  localeStorage: LocaleStorage;
  /** When true, unknown `*_suffix` keys that match no locale throw. */
  strictFlatKeys?: boolean;
};

/** Canonical nested map: locale → logicalKey → value */
export type I18nPropsMap = Record<string, Record<string, unknown>>;

export type BlockVisibility = {
  hiddenOnCanvas?: boolean;
  hiddenOnPublish?: boolean;
  hiddenDevices?: Device[];
  hiddenLocales?: string[];
};

export type VisibilityPredicate = {
  key: string;
  equals?: unknown;
  notEquals?: unknown;
  between?: [string, string];
};

export type VisibleWhen = {
  allOf?: VisibilityPredicate[];
  anyOf?: VisibilityPredicate[];
};

export type DataBinding = {
  sourceId: string;
  params: Record<string, unknown>;
  itemTemplate: Block[];
};

export type CustomScript = {
  code: string;
  runAt: "domReady" | "afterHydration";
  enabled: boolean;
};

export type Block = {
  id: string;
  type: string;
  props: Record<string, unknown>;
  i18nProps?: I18nPropsMap;
  customCss?: string;
  customJs?: CustomScript;
  style?: Record<string, unknown>;
  responsiveStyle?: Record<string, unknown>;
  /** Entrance / hover motion (Elementor-style). Omit or entrance none = no effect. */
  motion?: BlockMotion;
  visibility?: BlockVisibility;
  visibleWhen?: VisibleWhen;
  dataBinding?: DataBinding;
  children?: Block[];
};

export type PageMeta = {
  title?: string | Record<string, string>;
  description?: string | Record<string, string>;
  [key: string]: unknown;
};

export type Page = {
  id: string;
  blocks: Block[];
  meta: PageMeta;
  globalCss?: string;
  globalJs?: CustomScript | CustomScript[];
  schemaVersion: number;
  /** Opaque host concurrency token (ADR-16). */
  revision?: string;
};

export type BlockRenderProps = {
  block: Block;
  /** Shared props merged with active-locale i18n slice (via `i18nResolve`). */
  props: Record<string, unknown>;
  children?: ReactNode;
};

export type BlockContentFieldsProps = {
  block: Block;
  locale: string;
  onChange: (patch: Partial<Block>) => void;
};

export type BlockDefinition = {
  type: string;
  label: string;
  icon?: string;
  category: string;
  isContainer?: boolean;
  canAcceptChild?: (childType: string) => boolean;
  defaultProps: Record<string, unknown>;
  defaultI18nProps?: I18nPropsMap;
  /** Seed `dataBinding` on insert (repeater) — itemTemplate stays empty; children are the template. */
  defaultDataBinding?: Omit<DataBinding, "itemTemplate"> & {
    itemTemplate?: Block[];
  };
  /** Logical keys stored under `i18nProps[locale]` (e.g. `desc`, not `desc_en`). */
  translatableProps: string[];
  /** Keys that live only on `props` (shared across locales). */
  sharedProps: string[];
  propsSchema: ZodType;
  render: ComponentType<BlockRenderProps>;
  ContentFields: ComponentType<BlockContentFieldsProps>;
  source: BlockSource;
  capabilities?: string[];
};

export type FlatKeyWarning = {
  locale: string;
  logicalKey: string;
  keptKey: string;
  droppedKey: string;
};

export type NormalizeI18nResult = {
  props: Record<string, unknown>;
  i18nProps: I18nPropsMap;
  warnings: FlatKeyWarning[];
};
