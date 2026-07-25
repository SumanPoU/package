import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const files = ["index.js", "index.mjs"];

for (const file of files) {
  const path = join(root, file);
  const source = readFileSync(path, "utf8");
  if (source.startsWith('"use client"') || source.startsWith("'use client'")) {
    continue;
  }
  writeFileSync(path, `"use client";\n${source}`);
}
