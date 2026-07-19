# @itzsa/nepal-geo

React selects for Nepal’s administrative hierarchy, powered by
[`@itzsa/nepal-geo-data`](./../nepal-geo-data).

| Level | Count |
| --- | ---: |
| Provinces | 7 |
| Districts | 77 |
| Local levels | 753 |
| Wards | ~6,839 |

**Local type filters:** `metropolitan` · `sub_metropolitan` · `municipality` · `rural_municipality`

## Install

```bash
# UI + data (React)
pnpm add @itzsa/nepal-geo

# Data only (no React)
pnpm add @itzsa/nepal-geo-data
```

```css
@import "@itzsa/nepal-geo/styles.css";
```

## Data helpers

```ts
import {
  getProvinces,
  getDistricts,
  getLocalLevels,
  getWards,
  getMetropolitanCities,
  getMunicipalities,
  getRuralMunicipalities,
  resolveLocalHierarchy,
} from "@itzsa/nepal-geo";
// or: from "@itzsa/nepal-geo-data"

getLocalLevels(27, { typeKeys: ["municipality"] });
getWards(5); // wards for a local id
```

## Single select

```tsx
import {
  NepalProvinceSelect,
  NepalLocalSelect,
  NepalWardSelect,
} from "@itzsa/nepal-geo";

<NepalLocalSelect
  label="Municipality"
  districtId={districtId}
  typeKeys={["municipality", "metropolitan"]}
  value={localId}
  onChange={setLocalId}
  locale="ne"
  vars={{ accent: "#0f766e" }}
  classNames={{ trigger: "my-trigger" }}
/>

<NepalWardSelect
  label="Ward"
  localId={localId}
  value={wardId}
  onChange={setWardId}
/>
```

## Hierarchical select

```tsx
import { NepalLocationSelect } from "@itzsa/nepal-geo";

<NepalLocationSelect
  value={location}
  onChange={setLocation}
  levels={["province", "district", "local", "ward"]}
  typeKeys={["municipality", "rural_municipality"]}
  labels={{ local: "Palika", ward: "Ward no." }}
  locale="ne"
/>
```

`value`: `{ provinceId?, districtId?, localId?, wardId?, wardNumber? }`

## Custom CSS

Import `styles.css`, then override via:

- `vars` — CSS variables (`accent`, `background`, `foreground`, `muted`, `border`, `surface`, `radius`, `font`)
- `classNames` — `root`, `trigger`, `label`, `popover`, `search`, `option`, …
- `label` — per-field label string

## Docs

https://itzsa.acharya-suman.com.np/nepal-geo

## License

MIT
