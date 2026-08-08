import type { ComponentType } from '../types';
import type { BlockDefinition } from './types';

const registry = new Map<ComponentType, BlockDefinition>();

export function registerBlock<P extends Record<string, unknown>>(
  definition: BlockDefinition<P>,
): void {
  if (registry.has(definition.type)) {
    if (import.meta.env.DEV) {
      console.warn(
        `[page-builder] Block type "${definition.type}" is already registered. Skipping duplicate.`,
      );
    }
    return;
  }

  registry.set(definition.type, definition as BlockDefinition);
}

export function getBlockDefinition(type: ComponentType): BlockDefinition | undefined {
  return registry.get(type);
}

export function isRegisteredBlockType(type: string): boolean {
  return registry.has(type as ComponentType);
}

export function listBlocks(): BlockDefinition[] {
  return Array.from(registry.values());
}
