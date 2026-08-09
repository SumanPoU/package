export type PageBuilderCapabilities = {
  allowCustomCss?: boolean;
  allowCustomJs?: boolean;
  allowRegisterPluginBlocks?: boolean;
  allowRegisterTenantBlocks?: boolean;
  allowDynamicBlockDefs?: boolean;
  allowDataBinding?: boolean;
  /**
   * Phase 19 — signed remote `import()` of BlockDefinition modules.
   * **Default deny:** must be explicitly `true` (unlike other caps).
   */
  allowSignedBlockImport?: boolean;
};

/**
 * Hardened defaults for production / low-trust tenants (Phase 18).
 * Opt-in — existing hosts that omit capabilities keep the permissive defaults.
 */
export const createProductionCapabilities = (): PageBuilderCapabilities => ({
  allowCustomCss: true,
  allowCustomJs: false,
  allowDataBinding: true,
  allowRegisterTenantBlocks: true,
  allowRegisterPluginBlocks: false,
  allowDynamicBlockDefs: true,
  allowSignedBlockImport: false,
});

/** Default: allow (existing hosts keep working). Explicit `false` gates the feature. */
export const isCapabilityAllowed = (
  capabilities: PageBuilderCapabilities | undefined,
  key: keyof PageBuilderCapabilities,
): boolean => {
  if (key === "allowSignedBlockImport") {
    return capabilities?.allowSignedBlockImport === true;
  }
  return capabilities?.[key] !== false;
};

export const isDataBindingAllowed = (
  capabilities?: PageBuilderCapabilities,
): boolean => isCapabilityAllowed(capabilities, "allowDataBinding");

export const isCustomCssAllowed = (
  capabilities?: PageBuilderCapabilities,
): boolean => isCapabilityAllowed(capabilities, "allowCustomCss");

export const isCustomJsAllowed = (
  capabilities?: PageBuilderCapabilities,
): boolean => isCapabilityAllowed(capabilities, "allowCustomJs");

export const isSignedBlockImportAllowed = (
  capabilities?: PageBuilderCapabilities,
): boolean => isCapabilityAllowed(capabilities, "allowSignedBlockImport");
