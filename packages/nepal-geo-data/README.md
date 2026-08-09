# @itzsa/nepal-geo-data

**Data-only** Nepal administrative geography — no React.

| Level | Count |
| --- | ---: |
| Provinces | 7 |
| Districts | 77 |
| Local levels | 753 |
| Wards (expanded) | ~6,839 |

Local-level types (filter keys):

- `metropolitan` — Metropolitan City
- `sub_metropolitan` — Sub-Metropolitan City
- `municipality` — Municipality
- `rural_municipality` — Rural Municipality

## Install

```bash
pnpm add @itzsa/nepal-geo-data
```

For searchable React selects, use [`@itzsa/nepal-geo`](https://www.npmjs.com/package/@itzsa/nepal-geo) instead (it depends on this package).

## Usage

```ts
import {
  getProvinces,
  getDistricts,
  getLocalLevels,
  getWards,
  getMetropolitanCities,
  getMunicipalities,
  getRuralMunicipalities,
  getSubMetropolitanCities,
  resolveLocalHierarchy,
  GEO_META,
} from "@itzsa/nepal-geo-data";

getProvinces();
getDistricts(4); // by province
getLocalLevels(1, { typeKeys: ["municipality", "rural_municipality"] });
getMetropolitanCities();
getSubMetropolitanCities();
getMunicipalities(27);
getRuralMunicipalities(27);
getWards(5); // Kathmandu wards → Ward 1…N
resolveLocalHierarchy(5, 12); // local + optional ward
```

Ward ids are `localId * 1000 + wardNumber` (`encodeWardId` / `decodeWardId`).

## License

[MIT](../../LICENSE) — Copyright (c) 2026 Suman Acharya. Place names from community open datasets of Nepal's federal structure.

## Contributing & bugs

- [CONTRIBUTING.md](../../CONTRIBUTING.md)
- [Report a bug](https://github.com/SumanPoU/package/issues/new?template=bug_report.yml)
- [SECURITY.md](../../SECURITY.md) for vulnerabilities (private only)

