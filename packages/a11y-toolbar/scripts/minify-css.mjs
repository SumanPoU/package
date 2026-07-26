import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { transformSync } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssIn = join(root, "src", "styles.css");
const dist = join(root, "dist");
const cssOut = join(dist, "a11y-toolbar.min.css");

mkdirSync(dist, { recursive: true });
const source = readFileSync(cssIn, "utf8");
const { code } = transformSync(source, {
  loader: "css",
  minify: true,
});
writeFileSync(cssOut, code);
console.log(`wrote ${cssOut} (${code.length} bytes)`);
