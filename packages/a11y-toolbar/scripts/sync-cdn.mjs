import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Copy browser drop-in assets into the docs `public/` CDN folder. */
const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(pkgRoot, "dist");
const outDir = join(pkgRoot, "..", "..", "public", "cdn", "a11y-toolbar");

mkdirSync(outDir, { recursive: true });

for (const name of ["a11y-toolbar.min.js", "a11y-toolbar.min.css"]) {
  copyFileSync(join(dist, name), join(outDir, name));
  console.log(`copied ${name} → public/cdn/a11y-toolbar/`);
}
