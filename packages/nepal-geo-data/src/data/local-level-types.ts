/** Local level type taxonomy (metropolitan, municipality, …). */
export const LOCAL_LEVEL_TYPES = [
  {
    id: 1,
    key: "metropolitan",
    nameEn: "Metropolitan City",
    nameNe: "महानगरपालिका",
  },
  {
    id: 2,
    key: "sub_metropolitan",
    nameEn: "Sub-Metropolitan City",
    nameNe: "उपमहानगरपालिका",
  },
  {
    id: 3,
    key: "municipality",
    nameEn: "Municipality",
    nameNe: "नगरपालिका",
  },
  {
    id: 4,
    key: "rural_municipality",
    nameEn: "Rural Municipality",
    nameNe: "गाउँपालिका",
  },
] as const;
