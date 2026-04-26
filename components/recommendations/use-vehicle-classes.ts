/**
 * Client-side vehicle class resolution logic — mirrors the backend pipeline.
 */

export const PURPOSE_AREA: Record<string, Record<string, string[]>> = {
  economy: {
    city: ["KEI CAR", "MINICOMPACT", "SUBCOMPACT"],
    highway: ["MINICOMPACT", "SUBCOMPACT", "COMPACT", "WAGON", "MID - SIZE"],
    mixed: ["MINICOMPACT", "SUBCOMPACT", "COMPACT", "WAGON"],
    "off-road": ["SUV - SMALL", "SUV - STANDARD", "OFF - ROAD"],
  },
  family: {
    city: ["MINICOMPACT", "SUBCOMPACT", "COMPACT", "WAGON", "MPV"],
    highway: ["MINICOMPACT", "SUBCOMPACT", "COMPACT", "WAGON", "MPV", "MID - SIZE", "SUV - SMALL", "SUV - STANDARD"],
    mixed: ["MINICOMPACT", "SUBCOMPACT", "COMPACT", "WAGON", "MPV", "MID - SIZE", "SUV - SMALL", "SUV - STANDARD"],
    "off-road": ["SUV - SMALL", "SUV - STANDARD", "OFF - ROAD", "MPV"],
  },
  performance: {
    city: ["SUBCOMPACT", "COMPACT", "MID - SIZE"],
    highway: ["COMPACT", "MID - SIZE", "FULL - SIZE"],
    mixed: ["COMPACT", "MID - SIZE"],
    "off-road": ["SUV - STANDARD", "SUV", "OFF - ROAD"],
  },
  luxury: {
    city: ["COMPACT", "MID - SIZE", "FULL - SIZE", "MPV"],
    highway: ["MID - SIZE", "FULL - SIZE", "SUV - STANDARD"],
    mixed: ["MID - SIZE", "FULL - SIZE", "MPV", "SUV - STANDARD"],
    "off-road": ["FULL - SIZE", "SUV - STANDARD", "SUV", "OFF - ROAD"],
  },
};

export interface SalaryTier {
  max: number;
  classes: string[];
  tier: string;
}

export const SALARY_CLASSES: SalaryTier[] = [
  { max: 99999,   classes: ["KEI CAR", "MINICOMPACT", "SUBCOMPACT"],                                                                  tier: "Low (<100k)" },
  { max: 249999,  classes: ["SUBCOMPACT", "WAGON", "MINICOMPACT"],                                                                    tier: "Medium-Low (100k–249k)" },
  { max: 600000,  classes: ["COMPACT", "MINICOMPACT", "SUBCOMPACT", "MID - SIZE", "WAGON", "MPV", "SUV - SMALL", "SUV - STANDARD"],   tier: "Medium (250k–600k)" },
  { max: 1000000, classes: ["MID - SIZE", "FULL - SIZE", "SUV", "SUV - STANDARD", "OFF - ROAD", "MPV", "WAGON"],                      tier: "High (600k–1M)" },
  { max: Infinity,classes: ["MID - SIZE", "FULL - SIZE", "SUV", "SUV - STANDARD", "OFF - ROAD", "MPV", "WAGON"],                      tier: "Luxury (>1M)" },
];

export const PURPOSE_MAP: Record<string, string> = {
  daily_commute: "economy",
  family: "family",
  performance: "performance",
  luxury: "luxury",
};

export function getSalaryInfo(sal: number): SalaryTier {
  return SALARY_CLASSES.find((r) => sal <= r.max) ?? SALARY_CLASSES[SALARY_CLASSES.length - 1];
}

export function getPurposeClasses(purpose: string, area: string): string[] {
  const need = PURPOSE_MAP[purpose] || "economy";
  const areaMap = PURPOSE_AREA[need] || {};
  return areaMap[area] || areaMap["mixed"] || [];
}

export function intersectClasses(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  const result = a.filter((x) => setB.has(x));
  return result.length ? result : a;
}
