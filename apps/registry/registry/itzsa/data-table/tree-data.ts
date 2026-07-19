export type TreeNodeKind = "group" | "leaf";

export type TreeFlatRow<T> = {
  /** Stable id — leaf uses getRowId; group uses path key. */
  id: string;
  /** Original row for leaves; synthetic placeholder for pure groups. */
  row: T | null;
  depth: number;
  kind: TreeNodeKind;
  /** Path segments from root to this node. */
  path: string[];
  /** Direct children count (before filter flatten). */
  childrenCount: number;
  /** Label shown in the tree column for groups (last path segment). */
  label: string;
};

export type TreeBuildOptions<T> = {
  rows: T[];
  getTreeDataPath: (row: T) => readonly string[];
  getRowId: (row: T, index: number) => string;
};

type InternalNode<T> = {
  path: string[];
  pathKey: string;
  label: string;
  children: Map<string, InternalNode<T>>;
  /** Set when a real data row terminates at this path. */
  leafRow?: T;
  leafIndex?: number;
  leafId?: string;
};

export function pathToGroupId(path: string[]): string {
  return `__group__:${path.join("\u0001")}`;
}

function ensureNode<T>(
  root: Map<string, InternalNode<T>>,
  path: string[],
): InternalNode<T> {
  let map = root;
  let node: InternalNode<T> | undefined;

  for (let i = 0; i < path.length; i += 1) {
    const segment = path[i]!;
    const partial = path.slice(0, i + 1);
    const key = segment;
    let child = map.get(key);
    if (!child) {
      child = {
        path: partial,
        pathKey: pathToGroupId(partial),
        label: segment,
        children: new Map(),
      };
      map.set(key, child);
    }
    node = child;
    map = child.children;
  }

  return node!;
}

/** Build a forest from leaf rows + path segments. */
export function buildTreeFromPaths<T>({
  rows,
  getTreeDataPath,
  getRowId,
}: TreeBuildOptions<T>): Map<string, InternalNode<T>> {
  const root = new Map<string, InternalNode<T>>();

  rows.forEach((row, index) => {
    const path = [...getTreeDataPath(row)];
    if (path.length === 0) return;
    const node = ensureNode(root, path);
    node.leafRow = row;
    node.leafIndex = index;
    node.leafId = getRowId(row, index);
  });

  return root;
}

function countDirectChildren<T>(node: InternalNode<T>): number {
  return node.children.size;
}

function nodeToFlat<T>(
  node: InternalNode<T>,
  depth: number,
): TreeFlatRow<T> {
  const isLeaf = node.leafRow != null && node.children.size === 0;
  // A path that is both a leaf and a parent: treat as group with leaf data.
  const hasChildren = node.children.size > 0;
  const kind: TreeNodeKind = hasChildren || node.leafRow == null ? "group" : "leaf";

  if (isLeaf || (!hasChildren && node.leafRow != null)) {
    return {
      id: node.leafId!,
      row: node.leafRow!,
      depth,
      kind: "leaf",
      path: node.path,
      childrenCount: 0,
      label: node.label,
    };
  }

  return {
    id: node.pathKey,
    row: node.leafRow ?? null,
    depth,
    kind: "group",
    path: node.path,
    childrenCount: countDirectChildren(node),
    label: node.label,
  };
}

export type FlattenTreeOptions = {
  /** Expanded group ids (`pathToGroupId` or leaf ids that act as parents). */
  expandedIds: ReadonlySet<string>;
};

/** Depth-first flatten of visible nodes given expansion state. */
export function flattenVisibleTree<T>(
  root: Map<string, InternalNode<T>>,
  { expandedIds }: FlattenTreeOptions,
): TreeFlatRow<T>[] {
  const out: TreeFlatRow<T>[] = [];

  const walk = (map: Map<string, InternalNode<T>>, depth: number) => {
    for (const node of map.values()) {
      const flat = nodeToFlat(node, depth);
      out.push(flat);

      const expandable = flat.kind === "group" && flat.childrenCount > 0;
      if (expandable && expandedIds.has(flat.id)) {
        walk(node.children, depth + 1);
      } else if (
        // Leaf that also has children shouldn't happen with path model, but
        // if a terminating row shares a prefix parent, children hang under group.
        flat.kind === "leaf" &&
        node.children.size > 0 &&
        expandedIds.has(flat.id)
      ) {
        walk(node.children, depth + 1);
      }
    }
  };

  walk(root, 0);
  return out;
}

/**
 * Collect group ids that should start expanded for a given depth.
 * `depth === -1` expands all groups; `0` expands none; `1` expands top level only.
 */
export function getDefaultExpandedGroupIds<T>(
  root: Map<string, InternalNode<T>>,
  depth: number,
): string[] {
  if (depth === 0) return [];
  const ids: string[] = [];

  const walk = (map: Map<string, InternalNode<T>>, currentDepth: number) => {
    for (const node of map.values()) {
      if (node.children.size === 0) continue;
      const id = node.pathKey;
      if (depth === -1 || currentDepth < depth) {
        ids.push(id);
        walk(node.children, currentDepth + 1);
      }
    }
  };

  walk(root, 0);
  return ids;
}

/** True when the flat row is a selectable leaf with real data. */
export function isSelectableTreeRow<T>(row: TreeFlatRow<T>): boolean {
  return row.kind === "leaf" && row.row != null;
}
