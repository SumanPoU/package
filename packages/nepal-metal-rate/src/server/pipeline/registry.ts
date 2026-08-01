import type { RateSource } from "../types";

export type SourceRegistry = {
  list: () => readonly RateSource[];
  get: (id: string) => RateSource | undefined;
  register: (source: RateSource) => void;
  unregister: (id: string) => boolean;
};

export const createSourceRegistry = (
  initial: readonly RateSource[] = [],
): SourceRegistry => {
  const map = new Map<string, RateSource>();
  for (const source of initial) {
    map.set(source.id, source);
  }

  const list = (): readonly RateSource[] =>
    [...map.values()].sort(
      (a, b) => a.priority - b.priority || a.id.localeCompare(b.id),
    );

  return {
    list,
    get: (id) => map.get(id),
    register: (source) => {
      map.set(source.id, source);
    },
    unregister: (id) => map.delete(id),
  };
};
