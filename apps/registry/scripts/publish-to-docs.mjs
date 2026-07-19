/**
 * Copy built registry JSON into the docs site `public/r` when the monorepo
 * docs app is present. No-ops on standalone registry deploys (e.g. Vercel
 * project rooted at apps/registry).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryRoot = path.resolve(__dirname, "..");
const registryPublicR = path.join(registryRoot, "public", "r");

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

if (!fs.existsSync(registryPublicR)) {
  console.error(`Missing build output: ${registryPublicR}`);
  process.exit(1);
}

const monorepoRoot = findMonorepoRoot(__dirname);
if (!monorepoRoot) {
  console.log(
    "[publish] no monorepo root found — skipping docs public/r copy (standalone deploy)",
  );
  process.exit(0);
}

const docsPublicR = path.join(monorepoRoot, "public", "r");
fs.mkdirSync(docsPublicR, { recursive: true });

const keep = new Set(["data-table.json", "editor.json", "registry.json"]);

for (const name of fs.readdirSync(registryPublicR)) {
  if (!keep.has(name)) continue;
  fs.copyFileSync(
    path.join(registryPublicR, name),
    path.join(docsPublicR, name),
  );
}

if (fs.existsSync(docsPublicR)) {
  for (const name of fs.readdirSync(docsPublicR)) {
    if (!keep.has(name)) {
      fs.unlinkSync(path.join(docsPublicR, name));
    }
  }
}

console.log(`[publish] synced ${[...keep].join(", ")} → ${docsPublicR}`);
