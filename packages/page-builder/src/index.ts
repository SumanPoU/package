export {
  boxDefinition,
  buttonDefinition,
  containerDefinition,
  dividerDefinition,
  flexDefinition,
  gridDefinition,
  headingDefinition,
  imageDefinition,
  PRIMITIVE_DEFINITIONS,
  registerPrimitives,
  repeaterDefinition,
  spacerDefinition,
  textDefinition,
} from "./blocks";
export {
  CanvasDocument,
  type CanvasDocumentProps,
} from "./canvas/CanvasDocument";
export { CanvasFrame, type CanvasFrameProps } from "./canvas/CanvasFrame";
export {
  BRIDGE_VERSION,
  type BridgeEnvelope,
  type BridgeMeasurePayload,
  type BridgePageSyncPayload,
  CHILD_TO_PARENT_TYPES,
  createBridgeMessage,
  createChildBridgeListener,
  createParentBridgeListener,
  KNOWN_BRIDGE_TYPES,
  type KnownBridgeType,
  PARENT_TO_CHILD_TYPES,
  parseBridgeMessage,
  postToCanvas,
  postToParent,
} from "./canvas/canvasBridge";
export { injectScriptElement } from "./canvas/injectScripts";
export { emitStyleTag, injectStyleElement } from "./canvas/injectStyles";
export {
  buildCspTemplate,
  CANVAS_SANDBOX,
  createCanvasCsp,
  fillCspNonce,
  getCanvasSandboxAttribute,
  type SandboxPolicyOptions,
} from "./canvas/sandboxPolicy";
export {
  CORE_PRIMITIVE_TYPES,
  type CorePrimitiveType,
  PAGE_SCHEMA_VERSION,
} from "./constants";
export {
  blockClassName,
  blockRootAttrs,
  blockSelector,
} from "./core/blockClassName";
export {
  assertBlockRegistration,
  assertRegistrationCapability,
  isNamespacedBlockType,
  type RegistrationCapabilities,
  type RegistrationGuardError,
  type RegistrationGuardResult,
  registerBlockGuarded,
} from "./core/blockRegistrationGuard";
export {
  type BlockStyle,
  buildBlockStyleRule,
  buildStyleDeclarations,
  collectAllBlockStyleCss,
  collectBlockStyleCssRules,
  type DimValue,
  formatCustomCssRules,
  getBlockStyle,
  resolveCustomCssText,
  type SpacingBox,
} from "./core/blockStyleCss";
export {
  type BlockPath,
  cloneBlock,
  createBlockFromDefinition,
  createBlockId,
  findBlock,
  findBlockPath,
  getChildrenIds,
  insertBlock,
  isDescendant,
  moveBlock,
  moveBlockByDelta,
  removeBlock,
  updateBlock,
} from "./core/blockTree";
export {
  type ClipboardPayload,
  clearClipboard,
  copyBlockToClipboard,
  cutBlockToClipboard,
  getClipboard,
  setClipboard,
  takePasteClone,
} from "./core/clipboard";
export {
  type CssParseError,
  type CssParseOptions,
  type CssParseResult,
  parseAuthorCss,
} from "./core/cssParser";
export {
  composeBlockCss,
  composePageCss,
} from "./core/customCssComposer";
export {
  isCapabilityAllowed,
  isCustomCssAllowed,
  isCustomJsAllowed,
  isDataBindingAllowed,
} from "./core/capabilities";
export {
  applyBindingsToBlock,
  applyPropsTemplate,
  type BindingRenderContext,
  type BindingScope,
  type BindingSourceData,
  type BindingSourceState,
  expandRepeater,
  type FetchDataSource,
  getRepeaterTemplate,
  resolveBindingSource,
  resolveBindingString,
  resolveBindingsInValue,
  resolveTemplateString,
} from "./core/dataBinding";
export {
  createDefinitionFromDynamicSpec,
  type DynamicBlockSpec,
  type DynamicTemplateNode,
  registerDynamicBlock,
  registerDynamicBlocks,
} from "./core/dynamicBlock";
export {
  assertFieldSpecs,
  buildPropsSchemaFromFields,
  createDynamicContentFields,
  type DynamicFieldSpec,
  type FieldKind,
  FIELD_KINDS,
  isFieldKind,
} from "./core/fieldAdapterResolve";
export {
  composePageJs,
  emitScriptTag,
} from "./core/customJsComposer";
export { FallbackBlock } from "./core/fallbackBlock";
export {
  createDefaultLocaleConfig,
  getActiveLocaleDir,
  getLocaleDefinition,
  normalizeBlockI18n,
  normalizeI18n,
  resolveProps,
  serializeI18n,
} from "./core/i18nResolve";
export {
  type BlockRegistry,
  createRegistry,
  registerBlock,
} from "./core/registry";
export {
  assertRevisionMatch,
  type RevisionMatch,
} from "./core/revision";
export { sanitizeRichText } from "./core/sanitizeRichText";
export {
  type BlockSchema,
  blockSchema,
  blockVisibilitySchema,
  createBlockSchema,
  createPageSchema,
  customScriptSchema,
  deviceSchema,
  i18nPropsSchema,
  localeConfigSchema,
  localeDefinitionSchema,
  pageMetaSchema,
  pageSchema,
  visibilityPredicateSchema,
  visibleWhenSchema,
} from "./core/schema";
export type {
  Block,
  BlockContentFieldsProps,
  BlockDefinition,
  BlockRenderProps,
  BlockSource,
  BlockVisibility,
  CustomScript,
  DataBinding,
  Device,
  FlatKeyWarning,
  I18nPropsMap,
  LocaleConfig,
  LocaleDefinition,
  LocaleStorage,
  NormalizeI18nResult,
  Page,
  PageMeta,
  TextDirection,
  VisibilityPredicate,
  VisibleWhen,
} from "./core/types";
export {
  isVisibleAsPageContent,
  type RenderContext,
  type RenderSurface,
  resolveVisibility,
  type VisibilityResult,
} from "./core/visibilityResolve";
export {
  CORE_PRESETS,
  cardPreset,
  createCardPreset,
  createHeroPreset,
  getPreset,
  heroPreset,
  listPresets,
  PRESET_CATEGORY,
  type PresetDefinition,
} from "./presets";
export { CanvasArea } from "./editor/components/CanvasArea";
export { SelectionOverlay } from "./editor/components/SelectionOverlay";
export { useBlockHistory } from "./editor/hooks/useBlockHistory";
export { useClipboard } from "./editor/hooks/useClipboard";
export {
  type DragPayload,
  type HoverTarget,
  useDragAndDrop,
} from "./editor/hooks/useDragAndDrop";
export { useKeyboardShortcuts } from "./editor/hooks/useKeyboardShortcuts";
export {
  PageBuilder,
  type PageBuilderCapabilities,
  type PageBuilderProps,
} from "./editor/PageBuilder";
export type { PageBuilderCapabilities as Capabilities } from "./core/capabilities";
export {
  buildPreviewUrl,
  type CreatePreviewSessionInput,
  createPreviewSession,
} from "./preview/createPreviewSession";
export {
  getPreviewIdFromUrl,
  type LoadPreviewOptions,
  loadPreviewSession,
} from "./preview/loadPreviewSession";
export type {
  PreviewSession,
  PreviewStoreKind,
} from "./preview/types";
export {
  composeOpenPageHeadTags,
  OpenPageView,
  type OpenPageViewProps,
} from "./render/OpenPageView";
export { RenderBlock, type RenderBlockProps } from "./render/RenderBlock";
export { RenderPage, type RenderPageProps } from "./render/RenderPage";
