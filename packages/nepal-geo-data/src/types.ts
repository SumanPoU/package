export type Locale = "en" | "ne";

export type GeoLevel = "province" | "district" | "local" | "ward";

/** Stable keys for local-level type filters. */
export type LocalLevelTypeKey =
  | "metropolitan"
  | "sub_metropolitan"
  | "municipality"
  | "rural_municipality";

export type Province = {
  id: number;
  nameEn: string;
  nameNe: string;
};

export type District = {
  id: number;
  provinceId: number;
  nameEn: string;
  nameNe: string;
};

export type LocalLevel = {
  id: number;
  districtId: number;
  typeId: number;
  nameEn: string;
  nameNe: string;
  /** Number of wards in this local level. */
  wardCount: number;
};

export type LocalLevelType = {
  id: number;
  key: LocalLevelTypeKey;
  nameEn: string;
  nameNe: string;
};

/** Ward within a local level (expanded from ward counts). */
export type Ward = {
  /** Unique id: `localId * 1000 + number`. */
  id: number;
  localId: number;
  /** 1-based ward number within the local level. */
  number: number;
  nameEn: string;
  nameNe: string;
};

/** Controlled hierarchical selection. */
export type NepalLocationValue = {
  provinceId?: number | null;
  districtId?: number | null;
  localId?: number | null;
  /** Unique ward id (`localId * 1000 + number`), or use `wardNumber`. */
  wardId?: number | null;
  /** 1-based ward number within the selected local. */
  wardNumber?: number | null;
};

export type NamedEntity = {
  id: number;
  nameEn: string;
  nameNe: string;
};

export type NamedLabels = {
  nameEn: string;
  nameNe: string;
};

export type LocalLevelFilter = {
  /** Restrict to these type keys (metropolitan, municipality, …). */
  typeKeys?: readonly LocalLevelTypeKey[];
  /** Restrict to these numeric type ids (1–4). */
  typeIds?: readonly number[];
};

export function displayName(
  entity: NamedLabels | null | undefined,
  locale: Locale = "en",
): string {
  if (!entity) return "";
  return locale === "ne" ? entity.nameNe : entity.nameEn;
}

/** Encode a unique ward id from local + ward number. */
export function encodeWardId(localId: number, wardNumber: number): number {
  return localId * 1000 + wardNumber;
}

/** Decode unique ward id → local + number. */
export function decodeWardId(wardId: number): {
  localId: number;
  number: number;
} {
  return {
    localId: Math.floor(wardId / 1000),
    number: wardId % 1000,
  };
}
