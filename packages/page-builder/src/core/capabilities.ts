export type PageBuilderCapabilities = {
  allowCustomCss?: boolean;
  allowCustomJs?: boolean;
  allowRegisterPluginBlocks?: boolean;
  allowRegisterTenantBlocks?: boolean;
  allowDynamicBlockDefs?: boolean;
  allowDataBinding?: boolean;
};

/** Default: allow (existing hosts keep working). Explicit `false` gates the feature. */
export const isCapabilityAllowed = (
  capabilities: PageBuilderCapabilities | undefined,
  key: keyof PageBuilderCapabilities,
): boolean => capabilities?.[key] !== false;

export const isDataBindingAllowed = (
  capabilities?: PageBuilderCapabilities,
): boolean => isCapabilityAllowed(capabilities, "allowDataBinding");

export const isCustomCssAllowed = (
  capabilities?: PageBuilderCapabilities,
): boolean => isCapabilityAllowed(capabilities, "allowCustomCss");

export const isCustomJsAllowed = (
  capabilities?: PageBuilderCapabilities,
): boolean => isCapabilityAllowed(capabilities, "allowCustomJs");
