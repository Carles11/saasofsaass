export const TENANT_PALETTES = [
  {
    id: "ocean",
    name: "Ocean",
    primarySwatch: "oklch(0.55 0.18 250)",
    accentSwatch: "oklch(76.606% 0.14236 149.848)",
  },
  {
    id: "sunset",
    name: "Sunset",
    primarySwatch: "oklch(0.55 0.2 25)",
    accentSwatch: "oklch(0.72 0.15 85)",
  },
  {
    id: "forest",
    name: "Forest",
    primarySwatch: "oklch(0.45 0.15 145)",
    accentSwatch: "oklch(0.65 0.12 80)",
  },
] as const;

export type TenantPaletteId = (typeof TENANT_PALETTES)[number]["id"];

export function isValidPaletteId(id: string): id is TenantPaletteId {
  return TENANT_PALETTES.some((p) => p.id === id);
}
