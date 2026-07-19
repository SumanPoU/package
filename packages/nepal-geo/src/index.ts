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
  decodeWardId,
  displayName,
  encodeWardId,
  GEO_META,
  getDistrictById,
  getDistricts,
  getLocalLevelById,
  getLocalLevels,
  getLocalLevelTypeById,
  getLocalLevelTypeByKey,
  getLocalLevelTypes,
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
  LOCAL_LEVEL_TYPES,
  LOCAL_LEVELS,
  PROVINCES,
  resolveLocalHierarchy,
  searchEntities,
  sortByName,
  WARD_COUNTS,
} from "@itzsa/nepal-geo-data";
export type { GeoOption, GeoSelectProps } from "./geo-select";
export { GeoSelect } from "./geo-select";
export { cn } from "./lib/utils";
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
export type {
  NepalGeoClassNames,
  NepalGeoVars,
} from "./styling";
export { mergeGeoStyle } from "./styling";
