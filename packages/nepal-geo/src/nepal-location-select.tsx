"use client";

import * as React from "react";
import type {
  GeoLevel,
  Locale,
  LocalLevelTypeKey,
  NepalLocationValue,
} from "@itzsa/nepal-geo-data";
import {
  decodeWardId,
  encodeWardId,
  getDistrictById,
  getLocalLevelById,
  getProvinceById,
  getWardById,
} from "@itzsa/nepal-geo-data";

import { cn } from "./lib/utils";
import { NepalGeoSelect } from "./nepal-geo-select";
import {
  mergeGeoStyle,
  type NepalGeoClassNames,
  type NepalGeoVars,
} from "./styling";

export type NepalLocationSelectProps = {
  value?: NepalLocationValue;
  defaultValue?: NepalLocationValue;
  onChange?: (value: NepalLocationValue) => void;
  /**
   * Which steps to show, in order.
   * Default: province → district → local → ward.
   */
  levels?: GeoLevel[];
  /**
   * Filter local-level options by type.
   * e.g. `["metropolitan"]` or `["municipality", "rural_municipality"]`.
   */
  typeKeys?: readonly LocalLevelTypeKey[];
  locale?: Locale;
  disabled?: boolean;
  clearable?: boolean;
  showLocalType?: boolean;
  className?: string;
  style?: React.CSSProperties;
  vars?: NepalGeoVars;
  classNames?: NepalGeoClassNames;
  /** Labels above each field (prop overrides defaults). */
  labels?: Partial<Record<GeoLevel, string>>;
  placeholders?: Partial<Record<GeoLevel, string>>;
  /** Stack vertically (default) or horizontal row on wide screens. */
  orientation?: "vertical" | "horizontal";
};

const DEFAULT_LEVELS: GeoLevel[] = [
  "province",
  "district",
  "local",
  "ward",
];

export function NepalLocationSelect({
  value: valueProp,
  defaultValue = {},
  onChange,
  levels = DEFAULT_LEVELS,
  typeKeys,
  locale = "en",
  disabled = false,
  clearable = true,
  showLocalType = true,
  className,
  style,
  vars,
  classNames,
  labels,
  placeholders,
  orientation = "vertical",
}: NepalLocationSelectProps) {
  const isControlled = valueProp !== undefined;
  const [uncontrolled, setUncontrolled] =
    React.useState<NepalLocationValue>(defaultValue);
  const value = isControlled ? (valueProp ?? {}) : uncontrolled;

  const commit = React.useCallback(
    (next: NepalLocationValue) => {
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const setProvince = (provinceId: number | null) => {
    commit({
      provinceId,
      districtId: null,
      localId: null,
      wardId: null,
      wardNumber: null,
    });
  };

  const setDistrict = (districtId: number | null) => {
    const district = districtId != null ? getDistrictById(districtId) : null;
    commit({
      provinceId: district?.provinceId ?? value.provinceId ?? null,
      districtId,
      localId: null,
      wardId: null,
      wardNumber: null,
    });
  };

  const setLocal = (localId: number | null) => {
    const local = localId != null ? getLocalLevelById(localId) : null;
    const district =
      local != null ? getDistrictById(local.districtId) : null;
    commit({
      provinceId: district?.provinceId ?? value.provinceId ?? null,
      districtId: local?.districtId ?? value.districtId ?? null,
      localId,
      wardId: null,
      wardNumber: null,
    });
  };

  const setWard = (wardId: number | null) => {
    if (wardId == null) {
      commit({
        ...value,
        wardId: null,
        wardNumber: null,
      });
      return;
    }
    const { localId, number } = decodeWardId(wardId);
    const local = getLocalLevelById(localId);
    const district =
      local != null ? getDistrictById(local.districtId) : null;
    commit({
      provinceId: district?.provinceId ?? value.provinceId ?? null,
      districtId: local?.districtId ?? value.districtId ?? null,
      localId: localId ?? value.localId ?? null,
      wardId,
      wardNumber: number,
    });
  };

  const defaultLabels: Record<GeoLevel, string> =
    locale === "ne"
      ? {
          province: "प्रदेश",
          district: "जिल्ला",
          local: "स्थानीय तह",
          ward: "वडा",
        }
      : {
          province: "Province",
          district: "District",
          local: "Local level",
          ward: "Ward",
        };

  const wardValue =
    value.wardId ??
    (value.localId != null && value.wardNumber != null
      ? encodeWardId(value.localId, value.wardNumber)
      : null);

  const fieldClass = cn("itzsa-geo-cascade-field", classNames?.field);

  return (
    <div
      className={cn(
        "itzsa-geo-cascade",
        orientation === "horizontal" && "is-horizontal",
        className,
        classNames?.cascade,
        classNames?.root,
      )}
      style={mergeGeoStyle(vars, style)}
      data-locale={locale}
    >
      {levels.includes("province") ? (
        <div className={fieldClass}>
          <NepalGeoSelect
            level="province"
            label={labels?.province ?? defaultLabels.province}
            value={value.provinceId ?? null}
            onChange={setProvince}
            locale={locale}
            disabled={disabled}
            clearable={clearable}
            placeholder={placeholders?.province}
            vars={vars}
            classNames={classNames}
          />
        </div>
      ) : null}

      {levels.includes("district") ? (
        <div className={fieldClass}>
          <NepalGeoSelect
            level="district"
            label={labels?.district ?? defaultLabels.district}
            value={value.districtId ?? null}
            onChange={setDistrict}
            provinceId={
              levels.includes("province")
                ? (value.provinceId ?? null)
                : undefined
            }
            locale={locale}
            disabled={disabled}
            clearable={clearable}
            placeholder={placeholders?.district}
            vars={vars}
            classNames={classNames}
          />
        </div>
      ) : null}

      {levels.includes("local") ? (
        <div className={fieldClass}>
          <NepalGeoSelect
            level="local"
            label={labels?.local ?? defaultLabels.local}
            value={value.localId ?? null}
            onChange={setLocal}
            districtId={
              levels.includes("district")
                ? (value.districtId ?? null)
                : undefined
            }
            typeKeys={typeKeys}
            locale={locale}
            disabled={disabled}
            clearable={clearable}
            showLocalType={showLocalType}
            placeholder={placeholders?.local}
            vars={vars}
            classNames={classNames}
          />
        </div>
      ) : null}

      {levels.includes("ward") ? (
        <div className={fieldClass}>
          <NepalGeoSelect
            level="ward"
            label={labels?.ward ?? defaultLabels.ward}
            value={wardValue}
            onChange={setWard}
            localId={value.localId ?? null}
            locale={locale}
            disabled={disabled}
            clearable={clearable}
            placeholder={placeholders?.ward}
            vars={vars}
            classNames={classNames}
          />
        </div>
      ) : null}
    </div>
  );
}

/** Human summary of a location value. */
export function formatLocationValue(
  value: NepalLocationValue,
  locale: Locale = "en",
): string {
  const parts: string[] = [];
  const ward =
    value.wardId != null
      ? getWardById(value.wardId)
      : value.localId != null && value.wardNumber != null
        ? getWardById(encodeWardId(value.localId, value.wardNumber))
        : undefined;
  if (ward) parts.push(locale === "ne" ? ward.nameNe : ward.nameEn);
  if (value.localId != null) {
    const l = getLocalLevelById(value.localId);
    if (l) parts.push(locale === "ne" ? l.nameNe : l.nameEn);
  }
  if (value.districtId != null) {
    const d = getDistrictById(value.districtId);
    if (d) parts.push(locale === "ne" ? d.nameNe : d.nameEn);
  }
  if (value.provinceId != null) {
    const p = getProvinceById(value.provinceId);
    if (p) parts.push(locale === "ne" ? p.nameNe : p.nameEn);
  }
  return parts.join(", ");
}
