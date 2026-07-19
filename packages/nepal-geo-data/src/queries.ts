import { DISTRICTS } from "./data/districts";
import { LOCAL_LEVEL_TYPES } from "./data/local-level-types";
import { LOCAL_LEVELS } from "./data/local-levels";
import { GEO_META } from "./data/meta";
import { PROVINCES } from "./data/provinces";
import { WARD_COUNTS } from "./data/ward-counts";
import type {
  District,
  Locale,
  LocalLevel,
  LocalLevelFilter,
  LocalLevelType,
  LocalLevelTypeKey,
  Province,
  Ward,
} from "./types";
import { decodeWardId, displayName, encodeWardId } from "./types";

export {
  GEO_META,
  PROVINCES,
  DISTRICTS,
  LOCAL_LEVELS,
  LOCAL_LEVEL_TYPES,
  WARD_COUNTS,
};

const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

function toNepaliDigits(n: number): string {
  return String(n)
    .split("")
    .map((d) => NEPALI_DIGITS[Number(d)] ?? d)
    .join("");
}

const wardCountByLocal = new Map<number, number>(
  WARD_COUNTS.map((w) => [w.localId as number, w.count as number]),
);

const typeIdByKey = new Map<LocalLevelTypeKey, number>(
  LOCAL_LEVEL_TYPES.map((t) => [t.key as LocalLevelTypeKey, t.id as number]),
);

function matchesLocalFilter(
  local: LocalLevel,
  filter?: LocalLevelFilter,
): boolean {
  if (!filter) return true;
  if (filter.typeIds?.length && !filter.typeIds.includes(local.typeId)) {
    return false;
  }
  if (filter.typeKeys?.length) {
    const type = getLocalLevelTypeById(local.typeId);
    if (!type || !filter.typeKeys.includes(type.key as LocalLevelTypeKey)) {
      return false;
    }
  }
  return true;
}

export function getProvinces(): readonly Province[] {
  return PROVINCES;
}

export function getProvinceById(id: number): Province | undefined {
  return PROVINCES.find((p) => p.id === id);
}

export function getDistricts(provinceId?: number | null): readonly District[] {
  if (provinceId === undefined) return DISTRICTS;
  if (provinceId === null) return [];
  return DISTRICTS.filter((d) => d.provinceId === provinceId);
}

export function getDistrictById(id: number): District | undefined {
  return DISTRICTS.find((d) => d.id === id);
}

export function getLocalLevels(
  districtId?: number | null,
  filter?: LocalLevelFilter,
): readonly LocalLevel[] {
  let list: readonly LocalLevel[];
  if (districtId === undefined) list = LOCAL_LEVELS;
  else if (districtId === null) list = [];
  else list = LOCAL_LEVELS.filter((l) => l.districtId === districtId);

  if (!filter?.typeKeys?.length && !filter?.typeIds?.length) return list;
  return list.filter((l) => matchesLocalFilter(l, filter));
}

export function getLocalLevelById(id: number): LocalLevel | undefined {
  return LOCAL_LEVELS.find((l) => l.id === id);
}

export function getLocalLevelTypes(): readonly LocalLevelType[] {
  return LOCAL_LEVEL_TYPES as unknown as readonly LocalLevelType[];
}

export function getLocalLevelTypeById(id: number): LocalLevelType | undefined {
  return (LOCAL_LEVEL_TYPES as unknown as LocalLevelType[]).find(
    (t) => t.id === id,
  );
}

export function getLocalLevelTypeByKey(
  key: LocalLevelTypeKey,
): LocalLevelType | undefined {
  return (LOCAL_LEVEL_TYPES as unknown as LocalLevelType[]).find(
    (t) => t.key === key,
  );
}

export function getTypeIdForKey(key: LocalLevelTypeKey): number | undefined {
  return typeIdByKey.get(key);
}

/** Metropolitan cities only (`typeId` 1). */
export function getMetropolitanCities(
  districtId?: number | null,
): readonly LocalLevel[] {
  return getLocalLevels(districtId, { typeKeys: ["metropolitan"] });
}

/** Sub-metropolitan cities only (`typeId` 2). */
export function getSubMetropolitanCities(
  districtId?: number | null,
): readonly LocalLevel[] {
  return getLocalLevels(districtId, { typeKeys: ["sub_metropolitan"] });
}

/** Urban municipalities only (`typeId` 3). */
export function getMunicipalities(
  districtId?: number | null,
): readonly LocalLevel[] {
  return getLocalLevels(districtId, { typeKeys: ["municipality"] });
}

/** Rural municipalities / gaunpalika only (`typeId` 4). */
export function getRuralMunicipalities(
  districtId?: number | null,
): readonly LocalLevel[] {
  return getLocalLevels(districtId, { typeKeys: ["rural_municipality"] });
}

export function getWardCount(localId: number): number {
  return wardCountByLocal.get(localId) ?? 0;
}

/**
 * Expand ward count for a local into Ward[].
 * When `localId` is `null`/omitted as cascade wait → `[]`.
 * When `undefined` → empty (wards always need a local parent).
 */
export function getWards(localId?: number | null): readonly Ward[] {
  if (localId == null) return [];
  const count = getWardCount(localId);
  const wards: Ward[] = [];
  for (let n = 1; n <= count; n++) {
    wards.push({
      id: encodeWardId(localId, n),
      localId,
      number: n,
      nameEn: `Ward ${n}`,
      nameNe: `वडा ${toNepaliDigits(n)}`,
    });
  }
  return wards;
}

export function getWardById(wardId: number): Ward | undefined {
  const { localId, number } = decodeWardId(wardId);
  if (number < 1) return undefined;
  const count = getWardCount(localId);
  if (number > count) return undefined;
  return {
    id: wardId,
    localId,
    number,
    nameEn: `Ward ${number}`,
    nameNe: `वडा ${toNepaliDigits(number)}`,
  };
}

/** Resolve full hierarchy for a local level id (optionally include ward). */
export function resolveLocalHierarchy(
  localId: number,
  wardNumber?: number | null,
): {
  province: Province;
  district: District;
  local: LocalLevel;
  type: LocalLevelType | undefined;
  ward: Ward | undefined;
} | null {
  const local = getLocalLevelById(localId);
  if (!local) return null;
  const district = getDistrictById(local.districtId);
  if (!district) return null;
  const province = getProvinceById(district.provinceId);
  if (!province) return null;
  const ward =
    wardNumber != null && wardNumber >= 1
      ? getWardById(encodeWardId(localId, wardNumber))
      : undefined;
  return {
    province,
    district,
    local,
    type: getLocalLevelTypeById(local.typeId),
    ward,
  };
}

export function searchEntities<T extends { nameEn: string; nameNe: string }>(
  items: readonly T[],
  query: string,
  locale: Locale = "en",
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...items];
  return items.filter((item) => {
    const en = item.nameEn.toLowerCase();
    const ne = item.nameNe;
    return (
      en.includes(q) ||
      ne.includes(q) ||
      displayName(item, locale).toLowerCase().includes(q)
    );
  });
}

export function sortByName<T extends { nameEn: string; nameNe: string }>(
  items: readonly T[],
  locale: Locale = "en",
): T[] {
  return [...items].sort((a, b) =>
    displayName(a, locale).localeCompare(
      displayName(b, locale),
      locale === "ne" ? "ne" : "en",
    ),
  );
}
