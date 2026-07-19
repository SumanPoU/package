import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const repo = path.join(root, "..", "..");
/** Data-only package owns the generated tables. */
const srcData = path.join(repo, "packages", "nepal-geo-data", "src", "data");
const tmp = path.join(repo, "tmp-geo");

function parseTsArray(file) {
  const src = fs.readFileSync(path.join(srcData, file), "utf8");
  const json = src.replace(/^[\s\S]*?= /, "").replace(/ as const;?\s*$/, "");
  return JSON.parse(json);
}

function loadJson(name) {
  return JSON.parse(fs.readFileSync(path.join(tmp, name), "utf8"));
}

function writeTs(file, exportName, data, comment) {
  fs.mkdirSync(srcData, { recursive: true });
  const body = JSON.stringify(data, null, 2);
  fs.writeFileSync(
    path.join(srcData, file),
    `/** ${comment} */\nexport const ${exportName} = ${body} as const;\n`,
  );
  console.log("wrote", file, Array.isArray(data) ? data.length : "");
}

function norm(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .replace(
      /(municipality|rural|gaunpalika|nagarpalika|mahanagarpalika|upamahanagarpalika|submetropolitan|metropolitan|city|palika)/g,
      "",
    );
}

const provincesRaw = loadJson("provinces.json");
const districtsRaw = loadJson("districts.json");
const localsRaw = loadJson("local_levels.json");
const typesRaw = loadJson("local_level_type.json");

const provinces = provincesRaw.map((p) => ({
  id: p.province_id,
  nameEn: p.name,
  nameNe: p.nepali_name,
}));

const districts = districtsRaw.map((d) => ({
  id: d.district_id,
  provinceId: d.province_id,
  nameEn: d.name,
  nameNe: d.nepali_name,
}));

const localLevelTypes = typesRaw.map((t) => ({
  id: t.local_level_type_id,
  /** Stable key for filters */
  key:
    t.local_level_type_id === 1
      ? "metropolitan"
      : t.local_level_type_id === 2
        ? "sub_metropolitan"
        : t.local_level_type_id === 3
          ? "municipality"
          : "rural_municipality",
  nameEn: t.name,
  nameNe: t.nepali_name,
}));

const distById = Object.fromEntries(districts.map((d) => [d.id, d]));

const csvLines = fs
  .readFileSync(path.join(tmp, "municipalities.csv"), "utf8")
  .trim()
  .split(/\r?\n/)
  .slice(1);

const csvRows = [];
for (const line of csvLines) {
  // CSV with quotes
  const parts = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQ = !inQ;
      continue;
    }
    if (ch === "," && !inQ) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  if (parts.length < 9) continue;
  csvRows.push({
    district: parts[3],
    name: parts[5],
    type: parts[7],
    wards: Number(parts[8]),
  });
}

const TYPE_DEFAULT_WARDS = {
  1: 32, // metropolitan fallback
  2: 19,
  3: 14,
  4: 9,
};

let matched = 0;
const localLevels = localsRaw.map((l) => {
  const d = distById[l.district_id];
  const n = norm(l.name);
  let wards = null;
  const candidates = csvRows.filter((r) => norm(r.district) === norm(d.nameEn));
  let hit =
    candidates.find((r) => norm(r.name) === n) ||
    candidates.find(
      (r) => norm(r.name).includes(n) || n.includes(norm(r.name)),
    );
  if (hit && Number.isFinite(hit.wards) && hit.wards > 0) {
    wards = hit.wards;
    matched += 1;
  } else {
    wards = TYPE_DEFAULT_WARDS[l.local_level_type_id] ?? 9;
  }
  return {
    id: l.municipality_id,
    districtId: l.district_id,
    typeId: l.local_level_type_id,
    nameEn: l.name,
    nameNe: l.nepali_name,
    wardCount: wards,
  };
});

console.log("ward count matched", matched, "/", localLevels.length);

/** Compact ward index: one row per local → expand via getWards(localId). */
const wardCounts = localLevels.map((l) => ({
  localId: l.id,
  count: l.wardCount,
}));

writeTs(
  "provinces.ts",
  "PROVINCES",
  provinces,
  "7 provinces of Nepal (federal structure).",
);
writeTs("districts.ts", "DISTRICTS", districts, "77 districts of Nepal.");
writeTs(
  "local-levels.ts",
  "LOCAL_LEVELS",
  localLevels,
  "753 local levels with wardCount.",
);
writeTs(
  "local-level-types.ts",
  "LOCAL_LEVEL_TYPES",
  localLevelTypes,
  "Local level type taxonomy (metropolitan, municipality, …).",
);
writeTs(
  "ward-counts.ts",
  "WARD_COUNTS",
  wardCounts,
  "Ward counts per local level (expand to Ward[] via getWards).",
);

const meta = {
  source: {
    structure: "https://github.com/bibekoli/local-levels-of-nepal-dataset",
    wards: "https://github.com/younginnovations/nepal-locallevel-map",
  },
  counts: {
    provinces: provinces.length,
    districts: districts.length,
    localLevels: localLevels.length,
    localLevelTypes: localLevelTypes.length,
    wards: wardCounts.reduce((s, w) => s + w.count, 0),
    wardCountsMatched: matched,
  },
  generatedAt: new Date().toISOString(),
};

fs.mkdirSync(srcData, { recursive: true });
fs.writeFileSync(
  path.join(srcData, "meta.ts"),
  `export const GEO_META = ${JSON.stringify(meta, null, 2)} as const;\n`,
);
console.log("done", meta.counts);
