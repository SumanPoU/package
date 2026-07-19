"use client";

import {
  formatLocationValue,
  GEO_META,
  getDistricts,
  getMetropolitanCities,
  getMunicipalities,
  getProvinces,
  getRuralMunicipalities,
  getWards,
  NepalDistrictSelect,
  NepalGeoSelect,
  NepalLocalSelect,
  NepalLocationSelect,
  type NepalLocationValue,
  NepalProvinceSelect,
  NepalWardSelect,
} from "@itzsa/nepal-geo";
import { useState } from "react";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[12px] font-medium tracking-wide text-secondary">
      {children}
    </p>
  );
}

export function SingleExample() {
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <div className="flex flex-col gap-1.5">
        <NepalProvinceSelect
          label="Province"
          value={provinceId}
          onChange={setProvinceId}
          locale="en"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <NepalDistrictSelect
          label="District (scoped)"
          value={districtId}
          onChange={setDistrictId}
          provinceId={provinceId}
          locale="en"
        />
      </div>
      <p className="font-mono text-[12px] text-tertiary">
        provinceId: <span className="text-primary">{provinceId ?? "—"}</span>
        {" · "}
        districtId: <span className="text-primary">{districtId ?? "—"}</span>
      </p>
    </div>
  );
}

export function CascadeExample() {
  const [location, setLocation] = useState<NepalLocationValue>({});

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
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
      <p className="text-sm text-secondary">
        {formatLocationValue(location, "ne") || "—"}
      </p>
      <p className="font-mono text-[12px] text-tertiary">
        {JSON.stringify(location)}
      </p>
    </div>
  );
}

export function TypeFilterExample() {
  const [districtId, setDistrictId] = useState<number | null>(27);
  const [localId, setLocalId] = useState<number | null>(null);
  const [wardId, setWardId] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
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
      <p className="text-[12px] text-secondary">
        Dataset helpers: {getMetropolitanCities().length} metro ·{" "}
        {getMunicipalities().length} municipalities ·{" "}
        {getRuralMunicipalities().length} rural ·{" "}
        {localId != null ? getWards(localId).length : 0} wards for selection
      </p>
    </div>
  );
}

export function StyleExample() {
  const [id, setId] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
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
      <FieldLabel>
        Use <code className="text-primary">vars</code> and{" "}
        <code className="text-primary">classNames</code> — same pattern as the
        datepicker.
      </FieldLabel>
    </div>
  );
}

export function LocaleExample() {
  const [locale, setLocale] = useState<"ne" | "en">("ne");
  const [id, setId] = useState<number | null>(4);

  return (
    <div className="flex flex-col gap-4 rounded-md border-[0.5px] border-border bg-card p-4">
      <div className="flex flex-wrap gap-2">
        {(["ne", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            className={
              locale === l
                ? "rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-accent-fg"
                : "rounded-md border-[0.5px] border-border px-2.5 py-1 text-xs text-secondary"
            }
          >
            {l}
          </button>
        ))}
      </div>
      <NepalGeoSelect
        level="province"
        label={locale === "ne" ? "प्रदेश" : "Province"}
        value={id}
        onChange={setId}
        locale={locale}
      />
      <p className="text-[12px] text-secondary">
        Dataset: {GEO_META.counts.provinces} provinces ·{" "}
        {GEO_META.counts.districts} districts · {GEO_META.counts.localLevels}{" "}
        local levels · {GEO_META.counts.wards} wards
      </p>
      <p className="text-[12px] text-tertiary">
        Sample: {getProvinces().length} / {getDistricts().length} loaded
      </p>
    </div>
  );
}
