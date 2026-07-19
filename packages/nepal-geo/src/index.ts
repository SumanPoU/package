/** Re-export data API from the data-only package. */
export type {
  District,
  GeoLevel,
  Locale,
  LocalLevel,
  LocalLevelFilter,
  LocalLevelType,
  LocalLevelTypeKey,
  NamedEntity,
  NamedLabels,
  NepalLocationValue,
  Province,
  Ward,
} from "@itzsa/nepal-geo-data";
export {
  DISTRICTS,
  GEO_META,
  LOCAL_LEVELS,
  LOCAL_LEVEL_TYPES,
  PROVINCES,
  WARD_COUNTS,
  decodeWardId,
  displayName,
  encodeWardId,
  getDistrictById,
  getDistricts,
  getLocalLevelById,
  getLocalLevelTypeById,
  getLocalLevelTypeByKey,
  getLocalLevelTypes,
  getLocalLevels,
  getMetropolitanCities,
  getMunicipalities,
  getProvinceById,
  getProvinces,
  getRuralMunicipalities,
  getSubMetropolitanCities,
  getTypeIdForKey,
  getWardById,
  getWardCount,
  getWards,
  resolveLocalHierarchy,
  searchEntities,
  sortByName,
} from "@itzsa/nepal-geo-data";

export type {
  NepalGeoClassNames,
  NepalGeoVars,
} from "./styling";
export { mergeGeoStyle } from "./styling";

export type { GeoOption, GeoSelectProps } from "./geo-select";
export { GeoSelect } from "./geo-select";

export type { NepalGeoSelectProps } from "./nepal-geo-select";
export {
  NepalDistrictSelect,
  NepalGeoSelect,
  NepalLocalSelect,
  NepalProvinceSelect,
  NepalWardSelect,
} from "./nepal-geo-select";

export type { NepalLocationSelectProps } from "./nepal-location-select";
export {
  formatLocationValue,
  NepalLocationSelect,
} from "./nepal-location-select";

export { cn } from "./lib/utils";
