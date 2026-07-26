/**
 * Sync registry sources from npm packages → apps/registry/registry/itzsa/*
 * Run before `shadcn build`. Do not hand-edit synced files — they are overwritten
 * when the monorepo packages are present.
 *
 * Path resolution walks up from this script to find the monorepo root
 * (pnpm-workspace.yaml). It does not assume a fixed `../..` depth — that broke
 * on Vercel when only apps/registry was deployed (resolved to `/packages/...`).
 *
 * When packages/table is absent (standalone registry deploy), reuse the
 * already-committed registry/itzsa/data-table tree instead of failing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryRoot = path.resolve(__dirname, "..");

function findMonorepoRoot(startDir) {
  let dir = startDir;
  while (dir !== path.parse(dir).root) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        if (pkg.workspaces) return dir;
      } catch {
        /* continue */
      }
    }
    dir = path.dirname(dir);
  }
  return null;
}

const monorepoRoot = findMonorepoRoot(__dirname);

const TABLE_SRC = monorepoRoot
  ? path.join(monorepoRoot, "packages", "table", "src")
  : null;
const EDITOR_SRC = monorepoRoot
  ? path.join(monorepoRoot, "packages", "editor", "src")
  : null;
const CAPTCHA_SRC = monorepoRoot
  ? path.join(monorepoRoot, "packages", "captcha", "src")
  : null;
const TABLE_DEST = path.join(registryRoot, "registry", "itzsa", "data-table");
const EDITOR_DEST = path.join(registryRoot, "registry", "itzsa", "editor");
const CAPTCHA_DEST = path.join(registryRoot, "registry", "itzsa", "captcha");

const WORKSPACE_IMPORT =
  /from\s+["']@(?:itzsa|ss-components)\/|from\s+["']workspace:/;

/** Fallback deps if packages/table/package.json is not on disk (standalone deploy). */
const TABLE_DEPS_FALLBACK = [
  "@floating-ui/react",
  "@tanstack/react-virtual",
  "class-variance-authority",
  "clsx",
  "lucide-react",
  "radix-ui",
  "tailwind-merge",
];

function rmrf(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function walkFiles(dir, base = dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
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

function fileEntries(destDir, registryPrefix) {
  return walkFiles(destDir).map((rel) => ({
    path: `${registryPrefix}/${rel}`,
    type: classifyFile(rel),
    target: `components/itzsa/${registryPrefix.split("/").pop()}/${rel}`,
  }));
}

function syncPackage({ name, src, dest, stub }) {
  const hasPackageSrc = src && fs.existsSync(src);

  if (hasPackageSrc) {
    rmrf(dest);
    ensureDir(path.dirname(dest));
    fs.cpSync(src, dest, { recursive: true });
    console.log(`[sync] ${name} ← ${src}`);
    const workspaceHits = scanWorkspaceImports(dest);
    if (workspaceHits.length > 0) {
      console.warn(
        `\n[REGISTRY NOTE] ${name} has workspace-only imports — flatten before shipping:`,
      );
      for (const h of workspaceHits) console.warn(`  - ${h}`);
    } else {
      console.log(`[sync] ${name}: no workspace-only imports (OK)`);
    }
    return fileEntries(dest, `registry/itzsa/${name}`);
  }

  if (walkFiles(dest).length > 0) {
    console.warn(
      `[sync] packages/${name}/src not found` +
        (src
          ? ` at ${src} (monorepo root: ${monorepoRoot})`
          : ` (no monorepo root from ${__dirname})`) +
        `\n  Reusing committed ${dest}`,
    );
    return fileEntries(dest, `registry/itzsa/${name}`);
  }

  if (stub) {
    console.warn(
      `\n[REGISTRY NOTE] packages/${name}/src does not exist yet.\n` +
        `  Writing a stub under registry/itzsa/${name}.\n`,
    );
    ensureDir(dest);
    fs.writeFileSync(path.join(dest, stub.filename), stub.content, "utf8");
    return fileEntries(dest, `registry/itzsa/${name}`);
  }

  throw new Error(
    `Missing ${name} package source` +
      (src
        ? `: ${src} (resolved from monorepo root: ${monorepoRoot})`
        : ` and no monorepo root found walking up from ${__dirname}`) +
      `\nAlso no committed files under ${dest}`,
  );
}

const EDITOR_STUB = `/**
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
`;

function readDeps(packageDirName, itemName = packageDirName, fallback = []) {
  if (monorepoRoot) {
    const pkgPath = path.join(
      monorepoRoot,
      "packages",
      packageDirName,
      "package.json",
    );
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
      return Object.keys(pkg.dependencies ?? {}).sort();
    }
  }
  const existing = path.join(registryRoot, "registry.json");
  if (fs.existsSync(existing)) {
    try {
      const reg = JSON.parse(fs.readFileSync(existing, "utf8"));
      const item = reg.items?.find((i) => i.name === itemName);
      if (item?.dependencies?.length) return item.dependencies;
    } catch {
      /* fall through */
    }
  }
  return fallback;
}

function writeRegistryJson(tableFiles, editorFiles, captchaFiles) {
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
        registryDependencies: [],
        dependencies: readDeps("table", "data-table", TABLE_DEPS_FALLBACK),
        files: tableFiles,
      },
      {
        name: "editor",
        type: "registry:component",
        title: "Editor",
        description:
          "TipTap rich text editor with Nepali Unicode/Preeti input and language guard. Source synced from @itzsa/editor.",
        registryDependencies: [],
        dependencies: readDeps("editor", "editor"),
        files: editorFiles,
      },
      {
        name: "captcha",
        type: "registry:component",
        title: "Captcha",
        description:
          "Canvas captcha with configurable length, theme, noise, and verification callbacks. Installs under components/itzsa/captcha (nested components/ui). Synced from @itzsa/captcha.",
        registryDependencies: [],
        dependencies: readDeps("captcha", "captcha"),
        files: captchaFiles,
      },
    ],
  };

  const outPath = path.join(registryRoot, "registry.json");
  fs.writeFileSync(outPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  console.log(`[sync] wrote ${outPath}`);
  console.log(
    `[sync] root=${monorepoRoot ?? "(standalone registry)"} data-table=${tableFiles.length} editor=${editorFiles.length} captcha=${captchaFiles.length}`,
  );
}

console.log(`[sync] script dir=${__dirname}`);
console.log(`[sync] registry root=${registryRoot}`);
console.log(
  `[sync] monorepo root=${monorepoRoot ?? "(not found — standalone mode)"}`,
);

const tableFiles = syncPackage({
  name: "data-table",
  src: TABLE_SRC,
  dest: TABLE_DEST,
});
const editorFiles = syncPackage({
  name: "editor",
  src: EDITOR_SRC,
  dest: EDITOR_DEST,
  stub: { filename: "editor.tsx", content: EDITOR_STUB },
});
const captchaFiles = syncPackage({
  name: "captcha",
  src: CAPTCHA_SRC,
  dest: CAPTCHA_DEST,
});
writeRegistryJson(tableFiles, editorFiles, captchaFiles);
console.log("[sync] done");
