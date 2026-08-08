import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from 'vitest';

const PAGE_BUILDER_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const BANNED_LITERAL = /(['"])(en|eng|np|nep)\1/g;
const BANNED_BARE_KEY = /(?<![.\w$])(en|eng|np|nep)\s*:/g;

function walkTsFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkTsFiles(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

test('page-builder has no raw locale string literals (use LOCALES from config/languages.ts)', () => {
  const files = walkTsFiles(PAGE_BUILDER_ROOT);
  const violations: string[] = [];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const rel = path.relative(PAGE_BUILDER_ROOT, file).replace(/\\/g, '/');

    for (const match of source.matchAll(BANNED_LITERAL)) {
      violations.push(`${rel}: quoted locale literal ${match[0]}`);
    }
    for (const match of source.matchAll(BANNED_BARE_KEY)) {
      violations.push(`${rel}: bare locale key "${match[1]}:" — use [LOCALES.*]:`);
    }
  }

  expect(violations, violations.join('\n')).toEqual([]);
});
