/**
 * Copy built registry JSON into the docs site `public/r` so
 * `http://localhost:3000/r/data-table.json` works from the main Next app.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const registryPublicR = path.resolve(__dirname, "../public/r");
const docsPublicR = path.resolve(__dirname, "../../../public/r");

if (!fs.existsSync(registryPublicR)) {
  console.error(`Missing build output: ${registryPublicR}`);
  process.exit(1);
}

fs.mkdirSync(docsPublicR, { recursive: true });

const keep = new Set(["data-table.json", "editor.json", "registry.json"]);

for (const name of fs.readdirSync(registryPublicR)) {
  if (!keep.has(name)) continue;
  fs.copyFileSync(
    path.join(registryPublicR, name),
    path.join(docsPublicR, name),
  );
}

for (const name of fs.readdirSync(docsPublicR)) {
  if (!keep.has(name)) {
    fs.unlinkSync(path.join(docsPublicR, name));
  }
}

console.log(`[publish] synced ${[...keep].join(", ")} → ${docsPublicR}`);
