import type { ReactNode } from "react";
import { blockRootAttrs } from "./blockClassName";
import type { RegistrationCapabilities } from "./blockRegistrationGuard";
import { createBlockId } from "./blockTree";
import { applyPropsTemplate } from "./dataBinding";
import { FallbackBlock } from "./fallbackBlock";
import {
  assertFieldSpecs,
  buildPropsSchemaFromFields,
  createDynamicContentFields,
  type DynamicFieldSpec,
} from "./fieldAdapterResolve";
import type { BlockRegistry } from "./registry";
import { registerBlock } from "./registry";
import type {
  Block,
  BlockDefinition,
  BlockRenderProps,
  BlockSource,
  I18nPropsMap,
} from "./types";

/** Template node in a Model B spec — same shape as Block without required id. */
export type DynamicTemplateNode = {
  type: string;
  props?: Record<string, unknown>;
  i18nProps?: I18nPropsMap;
  customCss?: string;
  children?: DynamicTemplateNode[];
};

export type DynamicBlockSpec = {
  type: string;
  label: string;
  category?: string;
  source: Exclude<BlockSource, "core">;
  fields: DynamicFieldSpec[];
  /** Composition of existing primitive types only — no custom render code. */
  template: DynamicTemplateNode[];
  defaultProps?: Record<string, unknown>;
  defaultI18nProps?: I18nPropsMap;
};

const materializeTemplate = (nodes: DynamicTemplateNode[]): Block[] =>
  nodes.map((node) => ({
    id: createBlockId(),
    type: node.type,
    props: { ...(node.props ?? {}) },
    i18nProps: node.i18nProps
      ? (JSON.parse(JSON.stringify(node.i18nProps)) as I18nPropsMap)
      : undefined,
    customCss: node.customCss,
    children: node.children ? materializeTemplate(node.children) : undefined,
  }));

const assertTemplateTypes = (
  nodes: DynamicTemplateNode[],
  registry: BlockRegistry,
  path = "template",
): void => {
  for (let i = 0; i < nodes.length; i += 1) {
    const node = nodes[i]!;
    if (!registry.has(node.type)) {
      throw new Error(
        `registerDynamicBlock: ${path}[${i}] type "${node.type}" is not a registered primitive`,
      );
    }
    if (node.children?.length) {
      assertTemplateTypes(node.children, registry, `${path}[${i}].children`);
    }
  }
};

const defaultsFromFields = (
  fields: DynamicFieldSpec[],
): { props: Record<string, unknown>; i18nProps: I18nPropsMap } => {
  const props: Record<string, unknown> = {};
  const i18nEn: Record<string, unknown> = {};
  for (const field of fields) {
    const value =
      field.defaultValue !== undefined
        ? field.defaultValue
        : field.kind === "boolean"
          ? false
          : field.kind === "number"
            ? 0
            : field.kind === "select"
              ? (field.options?.[0]?.value ?? "")
              : "";
    if (field.translatable) i18nEn[field.key] = value;
    else props[field.key] = value;
  }
  return {
    props,
    i18nProps: Object.keys(i18nEn).length ? { en: i18nEn } : {},
  };
};

/**
 * Adapt a Model B JSON spec into a live `BlockDefinition` (§24.2).
 * `render` walks the primitive template — never eval'd remote code.
 */
export const createDefinitionFromDynamicSpec = (
  spec: DynamicBlockSpec,
  registry: BlockRegistry,
): BlockDefinition => {
  const fieldsCheck = assertFieldSpecs(spec.fields);
  if (!fieldsCheck.ok) {
    throw new Error(`registerDynamicBlock: ${fieldsCheck.error.message}`);
  }
  assertTemplateTypes(spec.template, registry);

  const fieldDefaults = defaultsFromFields(spec.fields);
  const templateBlocks = materializeTemplate(spec.template);

  const Render = ({ block, props }: BlockRenderProps) => {
    const bag = { ...block.props, ...props };
    const expanded = templateBlocks.map((node) =>
      applyPropsTemplate(node, bag),
    );

    const renderNode = (node: Block): ReactNode => {
      const def = registry.get(node.type);
      const R = def?.render ?? FallbackBlock;
      const childNodes = node.children?.map((child) => (
        <span key={child.id} style={{ display: "contents" }}>
          {renderNode(child)}
        </span>
      ));
      // Tokens already applied; merge locale i18n into props for primitives.
      const i18nSlice =
        node.i18nProps?.en ??
        (node.i18nProps
          ? (Object.values(node.i18nProps)[0] as Record<string, unknown>)
          : undefined) ??
        {};
      const mergedProps = { ...node.props, ...i18nSlice };
      return (
        <R key={node.id} block={node} props={mergedProps}>
          {childNodes}
        </R>
      );
    };

    return (
      <div {...blockRootAttrs(block)} data-pb-dynamic={spec.type}>
        {expanded.map((node) => renderNode(node))}
      </div>
    );
  };

  return {
    type: spec.type,
    label: spec.label,
    category: spec.category ?? "basic",
    source: spec.source,
    defaultProps: { ...fieldDefaults.props, ...(spec.defaultProps ?? {}) },
    defaultI18nProps: {
      ...fieldDefaults.i18nProps,
      ...(spec.defaultI18nProps ?? {}),
    },
    translatableProps: spec.fields
      .filter((f) => f.translatable)
      .map((f) => f.key),
    sharedProps: spec.fields.filter((f) => !f.translatable).map((f) => f.key),
    propsSchema: buildPropsSchemaFromFields(spec.fields),
    render: Render,
    ContentFields: createDynamicContentFields(spec.fields),
  };
};

/**
 * Register a Model B dynamic block (JSON spec → definition).
 * Requires primitives already registered so template types resolve.
 */
export const registerDynamicBlock = (
  registry: BlockRegistry,
  spec: DynamicBlockSpec,
  capabilities?: RegistrationCapabilities & {
    allowDynamicBlockDefs?: boolean;
  },
): void => {
  if (capabilities?.allowDynamicBlockDefs === false) {
    throw new Error(
      "registerDynamicBlock: capability allowDynamicBlockDefs=false",
    );
  }
  const definition = createDefinitionFromDynamicSpec(spec, registry);
  registerBlock(registry, definition, capabilities);
};

/**
 * Host helper: fetch specs (ADR-05) then register each.
 * Engine never imports host services — host calls this with the JSON array.
 */
export const registerDynamicBlocks = (
  registry: BlockRegistry,
  specs: DynamicBlockSpec[],
  capabilities?: RegistrationCapabilities & {
    allowDynamicBlockDefs?: boolean;
  },
): void => {
  for (const spec of specs) {
    registerDynamicBlock(registry, spec, capabilities);
  }
};
