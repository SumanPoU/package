/**
 * Sync registry sources from npm packages → apps/registry/registry/itzsa/*
 * Run before `shadcn build`. Do not hand-edit synced files — they are overwritten.
 *
 * Flags:
 * - packages/editor is missing → writes a stub and prints a REGISTRY NOTE.
 * - No workspace-only imports found in @itzsa/table (safe to copy as-is).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryRoot = path.resolve(__dirname, "..");
const monorepoRoot = path.resolve(registryRoot, "../..");

const TABLE_SRC = path.join(monorepoRoot, "packages/table/src");
const TABLE_DEST = path.join(registryRoot, "registry/itzsa/data-table");
const EDITOR_SRC = path.join(monorepoRoot, "packages/editor/src");
const EDITOR_DEST = path.join(registryRoot, "registry/itzsa/editor");

const WORKSPACE_IMPORT =
  /from\s+["']@(?:itzsa|ss-components)\/|from\s+["']workspace:/;

function rmrf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function walkFiles(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, base));
    } else if (/\.(tsx?|jsx?|css)$/.test(entry.name)) {
      out.push(path.relative(base, full).split(path.sep).join("/"));
    }
  }
  return out.sort();
}

function classifyFile(rel) {
  if (rel.includes("/lib/") || rel.startsWith("lib/")) return "registry:lib";
  if (
    rel.startsWith("use-") ||
    rel.includes("/hooks/") ||
    /\/use-[^/]+\.tsx?$/.test(rel)
  ) {
    return "registry:hook";
  }
  if (rel.includes("/components/ui/")) return "registry:component";
  if (rel.endsWith(".css")) return "registry:component";
  return "registry:component";
}

function scanWorkspaceImports(dir) {
  const hits = [];
  for (const rel of walkFiles(dir)) {
    const text = fs.readFileSync(path.join(dir, rel), "utf8");
    if (WORKSPACE_IMPORT.test(text)) hits.push(rel);
  }
  return hits;
}

function syncTable() {
  if (!fs.existsSync(TABLE_SRC)) {
    throw new Error(`Missing table package source: ${TABLE_SRC}`);
  }
  rmrf(TABLE_DEST);
  ensureDir(path.dirname(TABLE_DEST));
  fs.cpSync(TABLE_SRC, TABLE_DEST, { recursive: true });

  const workspaceHits = scanWorkspaceImports(TABLE_DEST);
  if (workspaceHits.length > 0) {
    console.warn(
      "\n[REGISTRY NOTE] data-table has workspace-only imports — needs a registry-friendly flatten before shipping:",
    );
    for (const h of workspaceHits) console.warn(`  - ${h}`);
  } else {
    console.log("[sync] data-table: no workspace-only imports (OK)");
  }

  return walkFiles(TABLE_DEST).map((rel) => ({
    path: `registry/itzsa/data-table/${rel}`,
    type: classifyFile(rel),
    target: `components/itzsa/data-table/${rel}`,
  }));
}

function syncEditor() {
  ensureDir(path.dirname(EDITOR_DEST));

  if (!fs.existsSync(EDITOR_SRC)) {
    console.warn(
      "\n[REGISTRY NOTE] packages/editor/src does not exist yet.\n" +
        "  Writing a stub under registry/itzsa/editor. Replace when @itzsa/editor ships.\n" +
        "  Prefer npm `pnpm add @itzsa/editor` once published; registry item is a placeholder.\n",
    );
    rmrf(EDITOR_DEST);
    ensureDir(EDITOR_DEST);
    fs.writeFileSync(
      path.join(EDITOR_DEST, "editor.tsx"),
      `/**
 * REGISTRY NOTE — placeholder
 * ---------------------------------------------------------------------------
 * \`packages/editor\` is not in this monorepo yet. This file exists so the
 * registry item builds. When @itzsa/editor is added, \`sync-from-packages.mjs\`
 * will copy real sources from packages/editor/src and overwrite this stub.
 *
 * Do not treat this stub as a production editor.
 */
"use client";

export type EditorProps = {
  className?: string;
  placeholder?: string;
};

export function Editor({ className, placeholder = "Editor coming soon…" }: EditorProps) {
  return (
    <div
      className={className}
      data-itzsa-editor-stub=""
      style={{
        border: "1px dashed currentColor",
        borderRadius: 8,
        opacity: 0.6,
        padding: 16,
        fontFamily: "ui-monospace, monospace",
        fontSize: 13,
      }}
    >
      {placeholder}
    </div>
  );
}
`,
      "utf8",
    );
    return [
      {
        path: "registry/itzsa/editor/editor.tsx",
        type: "registry:component",
        target: "components/itzsa/editor/editor.tsx",
      },
    ];
  }

  rmrf(EDITOR_DEST);
  fs.cpSync(EDITOR_SRC, EDITOR_DEST, { recursive: true });
  const workspaceHits = scanWorkspaceImports(EDITOR_DEST);
  if (workspaceHits.length > 0) {
    console.warn(
      "\n[REGISTRY NOTE] editor has workspace-only imports — flatten before shipping:",
    );
    for (const h of workspaceHits) console.warn(`  - ${h}`);
  }
  return walkFiles(EDITOR_DEST).map((rel) => ({
    path: `registry/itzsa/editor/${rel}`,
    type: classifyFile(rel),
    target: `components/itzsa/editor/${rel}`,
  }));
}

function readTableDeps() {
  const pkg = JSON.parse(
    fs.readFileSync(
      path.join(monorepoRoot, "packages/table/package.json"),
      "utf8",
    ),
  );
  return Object.keys(pkg.dependencies ?? {}).sort();
}

function readEditorDeps() {
  const pkgPath = path.join(monorepoRoot, "packages/editor/package.json");
  if (!fs.existsSync(pkgPath)) return [];
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  return Object.keys(pkg.dependencies ?? {}).sort();
}

function writeRegistryJson(tableFiles, editorFiles) {
  const registry = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "itzsa",
    homepage: "https://itzsa.dev",
    items: [
      {
        name: "data-table",
        type: "registry:component",
        title: "Data table",
        description:
          "Composable data table with sorting, pagination, filtering, row selection, editing, export, tree/detail panels, and server/client modes. Source synced from @itzsa/table.",
        // Vendored shadcn primitives ship inside the item (relative imports).
        // Do not also pull registry button/checkbox/select — that would duplicate.
        registryDependencies: [],
        dependencies: readTableDeps(),
        files: tableFiles,
      },
      {
        name: "editor",
        type: "registry:component",
        title: "Editor",
        description:
          "Rich text / block editor. Placeholder until packages/editor exists — prefer npm @itzsa/editor when published.",
        registryDependencies: [],
        dependencies: readEditorDeps(),
        files: editorFiles,
      },
    ],
  };

  const outPath = path.join(registryRoot, "registry.json");
  fs.writeFileSync(outPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  console.log(`[sync] wrote ${outPath}`);
  console.log(
    `[sync] data-table files: ${tableFiles.length}, editor files: ${editorFiles.length}`,
  );
}

const tableFiles = syncTable();
const editorFiles = syncEditor();
writeRegistryJson(tableFiles, editorFiles);
console.log("[sync] done");
