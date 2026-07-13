export type WeightUnit = "kg" | "lb";

export type AppSettings = {
  id: "active";
  version: 1;
  unit: WeightUnit;
  weightStep: number;
  updatedAt: string;
};

export function defaultAppSettings(): AppSettings {
  return {
    id: "active",
    version: 1,
    unit: "kg",
    weightStep: 2.5,
    updatedAt: new Date(0).toISOString(),
  };
}

const POUNDS_PER_KILOGRAM = 2.2046226218;

export function displayLoad(loadKg: number | null, unit: WeightUnit) {
  if (loadKg === null) return null;
  const value = unit === "lb" ? loadKg * POUNDS_PER_KILOGRAM : loadKg;
  return Math.round(value * 100) / 100;
}

export function storeLoad(displayValue: number, unit: WeightUnit) {
  const value = unit === "lb" ? displayValue / POUNDS_PER_KILOGRAM : displayValue;
  return Math.round(value * 1000) / 1000;
}

export function defaultWeightStep(unit: WeightUnit) {
  return unit === "lb" ? 5 : 2.5;
}
