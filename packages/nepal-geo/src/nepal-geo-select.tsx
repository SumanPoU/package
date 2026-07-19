"use client";

import type {
  GeoLevel,
  Locale,
  LocalLevelTypeKey,
} from "@itzsa/nepal-geo-data";
import {
  decodeWardId,
  displayName,
  getDistrictById,
  getDistricts,
  getLocalLevelById,
  getLocalLevels,
  getLocalLevelTypeById,
  getProvinces,
  getWards,
  sortByName,
} from "@itzsa/nepal-geo-data";
import * as React from "react";

import { GeoSelect } from "./geo-select";
import type { NepalGeoClassNames, NepalGeoVars } from "./styling";

export type NepalGeoSelectProps = {
  /** Which administrative level to list. */
  level: GeoLevel;
  value?: number | null;
  onChange?: (id: number | null) => void;
  /** When `null`, wait for parent (cascade). When `undefined`, list all. */
  provinceId?: number | null;
  /** When `null`, wait for parent (cascade). When `undefined`, list all. */
  districtId?: number | null;
  /** Required for wards when cascading. `null` = wait for local. */
  localId?: number | null;
  /**
   * Filter local levels by type key.
   * e.g. `["metropolitan", "sub_metropolitan"]` or `["municipality"]`.
   */
  typeKeys?: readonly LocalLevelTypeKey[];
  locale?: Locale;
  /** Visible label above the select. */
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  /** Show local-level type (e.g. Municipality) as meta. */
  showLocalType?: boolean;
  id?: string;
  name?: string;
  className?: string;
  triggerClassName?: string;
  style?: React.CSSProperties;
  vars?: NepalGeoVars;
  classNames?: NepalGeoClassNames;
  "aria-label"?: string;
};

export function NepalGeoSelect({
  level,
  value = null,
  onChange,
  provinceId,
  districtId,
  localId,
  typeKeys,
  locale = "en",
  label,
  placeholder,
  searchPlaceholder,
  disabled = false,
  clearable = true,
  showLocalType = true,
  id,
  name,
  className,
  triggerClassName,
  style,
  vars,
  classNames,
  "aria-label": ariaLabel,
}: NepalGeoSelectProps) {
  const options = React.useMemo(() => {
    if (level === "province") {
      return sortByName(getProvinces(), locale).map((p) => ({
        id: p.id,
        nameEn: p.nameEn,
        nameNe: p.nameNe,
      }));
    }
    if (level === "district") {
      return sortByName(getDistricts(provinceId), locale).map((d) => ({
        id: d.id,
        nameEn: d.nameEn,
        nameNe: d.nameNe,
      }));
    }
    if (level === "ward") {
      return getWards(localId).map((w) => ({
        id: w.id,
        nameEn: w.nameEn,
        nameNe: w.nameNe,
      }));
    }
    return sortByName(
      getLocalLevels(districtId, typeKeys?.length ? { typeKeys } : undefined),
      locale,
    ).map((l) => {
      const type = getLocalLevelTypeById(l.typeId);
      return {
        id: l.id,
        nameEn: l.nameEn,
        nameNe: l.nameNe,
        meta: showLocalType && type ? displayName(type, locale) : undefined,
      };
    });
  }, [level, provinceId, districtId, localId, typeKeys, locale, showLocalType]);

  const defaultPlaceholder =
    placeholder ??
    (locale === "ne"
      ? level === "province"
        ? "प्रदेश छान्नुहोस्"
        : level === "district"
          ? "जिल्ला छान्नुहोस्"
          : level === "ward"
            ? "वडा छान्नुहोस्"
            : "स्थानीय तह छान्नुहोस्"
      : level === "province"
        ? "Select province"
        : level === "district"
          ? "Select district"
          : level === "ward"
            ? "Select ward"
            : "Select local level");

  React.useEffect(() => {
    if (value == null) return;
    if (level === "district" && provinceId != null) {
      const d = getDistrictById(value);
      if (d && d.provinceId !== provinceId) onChange?.(null);
    }
    if (level === "local" && districtId != null) {
      const l = getLocalLevelById(value);
      if (l && l.districtId !== districtId) onChange?.(null);
    }
    if (level === "local" && typeKeys?.length) {
      const l = getLocalLevelById(value);
      const type = l ? getLocalLevelTypeById(l.typeId) : undefined;
      if (type && !typeKeys.includes(type.key)) onChange?.(null);
    }
    if (level === "ward" && localId != null) {
      const { localId: widLocal } = decodeWardId(value);
      if (widLocal !== localId) onChange?.(null);
    }
  }, [level, provinceId, districtId, localId, typeKeys, value, onChange]);

  const waitingParent =
    (level === "district" && provinceId === null) ||
    (level === "local" && districtId === null) ||
    (level === "ward" && localId === null);

  const scopedDisabled = disabled || waitingParent;

  return (
    <GeoSelect
      options={options}
      value={value}
      onChange={onChange}
      locale={locale}
      label={label}
      placeholder={defaultPlaceholder}
      searchPlaceholder={searchPlaceholder}
      disabled={scopedDisabled}
      clearable={clearable}
      id={id}
      name={name}
      className={className}
      triggerClassName={triggerClassName}
      style={style}
      vars={vars}
      classNames={classNames}
      aria-label={ariaLabel}
      emptyLabel={
        waitingParent
          ? locale === "ne"
            ? level === "district"
              ? "पहिले प्रदेश छान्नुहोस्"
              : level === "ward"
                ? "पहिले स्थानीय तह छान्नुहोस्"
                : "पहिले जिल्ला छान्नुहोस्"
            : level === "district"
              ? "Select a province first"
              : level === "ward"
                ? "Select a local level first"
                : "Select a district first"
          : undefined
      }
    />
  );
}

/** Convenience aliases */
export function NepalProvinceSelect(props: Omit<NepalGeoSelectProps, "level">) {
  return <NepalGeoSelect level="province" {...props} />;
}

export function NepalDistrictSelect(props: Omit<NepalGeoSelectProps, "level">) {
  return <NepalGeoSelect level="district" {...props} />;
}

export function NepalLocalSelect(props: Omit<NepalGeoSelectProps, "level">) {
  return <NepalGeoSelect level="local" {...props} />;
}

export function NepalWardSelect(props: Omit<NepalGeoSelectProps, "level">) {
  return <NepalGeoSelect level="ward" {...props} />;
}

export {
  getDistrictById,
  getLocalLevelById,
  getProvinceById,
  getWardById,
} from "@itzsa/nepal-geo-data";
