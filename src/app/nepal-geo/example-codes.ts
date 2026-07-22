export const SINGLE_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import {
  NepalProvinceSelect,
  NepalDistrictSelect,
} from "@itzsa/nepal-geo";
import "@itzsa/nepal-geo/styles.css";

export function SingleExample() {
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);

  return (
    <div>
      <NepalProvinceSelect
        label="Province"
        value={provinceId}
        onChange={setProvinceId}
        locale="en"
      />
      <NepalDistrictSelect
        label="District (scoped)"
        value={districtId}
        onChange={setDistrictId}
        provinceId={provinceId}
        locale="en"
      />
      <p>
        provinceId: {provinceId ?? "—"} · districtId: {districtId ?? "—"}
      </p>
    </div>
  );
}`;

export const CASCADE_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import {
  formatLocationValue,
  NepalLocationSelect,
  type NepalLocationValue,
} from "@itzsa/nepal-geo";
import "@itzsa/nepal-geo/styles.css";

export function CascadeExample() {
  const [location, setLocation] = useState<NepalLocationValue>({});

  return (
    <div>
      <NepalLocationSelect
        value={location}
        onChange={setLocation}
        levels={["province", "district", "local", "ward"]}
        locale="ne"
        orientation="horizontal"
        labels={{
          province: "प्रदेश",
          district: "जिल्ला",
          local: "स्थानीय तह",
          ward: "वडा",
        }}
      />
      <p>{formatLocationValue(location, "ne") || "—"}</p>
      <pre>{JSON.stringify(location, null, 2)}</pre>
    </div>
  );
}`;

export const TYPE_FILTER_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import {
  getMetropolitanCities,
  getMunicipalities,
  getRuralMunicipalities,
  getWards,
  NepalDistrictSelect,
  NepalLocalSelect,
  NepalWardSelect,
} from "@itzsa/nepal-geo";
import "@itzsa/nepal-geo/styles.css";

export function TypeFilterExample() {
  const [districtId, setDistrictId] = useState<number | null>(27);
  const [localId, setLocalId] = useState<number | null>(null);
  const [wardId, setWardId] = useState<number | null>(null);

  return (
    <div>
      <NepalDistrictSelect
        label="District"
        value={districtId}
        onChange={(id) => {
          setDistrictId(id);
          setLocalId(null);
          setWardId(null);
        }}
        locale="en"
      />
      <NepalLocalSelect
        label="Municipalities only"
        districtId={districtId}
        typeKeys={["municipality", "metropolitan", "sub_metropolitan"]}
        value={localId}
        onChange={(id) => {
          setLocalId(id);
          setWardId(null);
        }}
        locale="en"
      />
      <NepalWardSelect
        label="Ward"
        localId={localId}
        value={wardId}
        onChange={setWardId}
        locale="en"
      />
      <p>
        Dataset: {getMetropolitanCities().length} metro ·{" "}
        {getMunicipalities().length} municipalities ·{" "}
        {getRuralMunicipalities().length} rural ·{" "}
        {localId != null ? getWards(localId).length : 0} wards
      </p>
    </div>
  );
}`;

export const STYLE_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import { NepalProvinceSelect } from "@itzsa/nepal-geo";
import "@itzsa/nepal-geo/styles.css";

export function StyleExample() {
  const [id, setId] = useState<number | null>(null);

  return (
    <NepalProvinceSelect
      label="Styled province"
      value={id}
      onChange={setId}
      locale="en"
      vars={{
        accent: "#0f766e",
        border: "#99f6e4",
        radius: "12px",
      }}
      classNames={{
        trigger: "font-medium",
        label: "text-teal-800",
      }}
    />
  );
}`;

export const LOCALE_EXAMPLE_CODE = `"use client";

import { useState } from "react";
import {
  GEO_META,
  getDistricts,
  getProvinces,
  NepalGeoSelect,
} from "@itzsa/nepal-geo";
import "@itzsa/nepal-geo/styles.css";

export function LocaleExample() {
  const [locale, setLocale] = useState<"ne" | "en">("ne");
  const [id, setId] = useState<number | null>(4);

  return (
    <div>
      <button type="button" onClick={() => setLocale("ne")}>
        ne
      </button>
      <button type="button" onClick={() => setLocale("en")}>
        en
      </button>
      <NepalGeoSelect
        level="province"
        label={locale === "ne" ? "प्रदेश" : "Province"}
        value={id}
        onChange={setId}
        locale={locale}
      />
      <p>
        Dataset: {GEO_META.counts.provinces} provinces ·{" "}
        {GEO_META.counts.districts} districts · {GEO_META.counts.localLevels}{" "}
        local · {GEO_META.counts.wards} wards
      </p>
      <p>
        Loaded: {getProvinces().length} / {getDistricts().length}
      </p>
    </div>
  );
}`;
