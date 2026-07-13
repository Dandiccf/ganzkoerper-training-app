import { alternativeData, alternativesFor, trainingPlan, type DayCode, type PlanExercise, type TrainingDay } from "./schema";

export type PlanSlot = {
  id: string;
  baseExerciseId: string;
  exerciseId: string;
};

export type PlanConfiguration = {
  id: "active";
  version: 1;
  updatedAt: string;
  days: Record<DayCode, PlanSlot[]>;
};

export type ConfiguredPlanExercise = PlanExercise & { baseExerciseId: string };
export type ConfiguredTrainingDay = Omit<TrainingDay, "exercises"> & { exercises: ConfiguredPlanExercise[] };

const allBaseExercises = trainingPlan.days.flatMap((day) => day.exercises);

export function defaultPlanConfiguration(): PlanConfiguration {
  return {
    id: "active",
    version: 1,
    updatedAt: new Date(0).toISOString(),
    days: Object.fromEntries(trainingPlan.days.map((day) => [
      day.code,
      day.exercises.map((exercise) => ({
        id: `${day.code}-${exercise.id}`,
        baseExerciseId: exercise.id,
        exerciseId: exercise.id,
      })),
    ])) as Record<DayCode, PlanSlot[]>,
  };
}

export function resolvePlanDays(configuration: PlanConfiguration): ConfiguredTrainingDay[] {
  return trainingPlan.days.map((day) => resolvePlanDay(configuration, day.code));
}

export function resolvePlanDay(configuration: PlanConfiguration, code: DayCode): ConfiguredTrainingDay {
  const seedDay = trainingPlan.days.find((day) => day.code === code)!;
  const resolved = (configuration.days[code] ?? []).flatMap((slot, index) => {
    const base = allBaseExercises.find((exercise) => exercise.id === slot.baseExerciseId);
    if (!base) return [];
    const selected = allBaseExercises.find((exercise) => exercise.id === slot.exerciseId)
      ?? alternativeData.catalog.find((exercise) => exercise.id === slot.exerciseId)
      ?? base;
    return [{
      ...base,
      id: selected.id,
      name: selected.name,
      movementPattern: selected.movementPattern,
      equipment: selected.equipment,
      order: index + 1,
      baseExerciseId: base.id,
    }];
  });

  return {
    ...seedDay,
    exercises: resolved.length ? resolved : seedDay.exercises.map((exercise) => ({ ...exercise, baseExerciseId: exercise.id })),
  };
}

export function movePlanSlot(configuration: PlanConfiguration, code: DayCode, slotId: string, direction: -1 | 1): PlanConfiguration {
  const slots = [...configuration.days[code]];
  const index = slots.findIndex((slot) => slot.id === slotId);
  const destination = index + direction;
  if (index < 0 || destination < 0 || destination >= slots.length) return configuration;
  [slots[index], slots[destination]] = [slots[destination], slots[index]];
  return updateDay(configuration, code, slots);
}

export function removePlanSlot(configuration: PlanConfiguration, code: DayCode, slotId: string): PlanConfiguration {
  const slots = configuration.days[code];
  if (slots.length <= 1 || !slots.some((slot) => slot.id === slotId)) return configuration;
  return updateDay(configuration, code, slots.filter((slot) => slot.id !== slotId));
}

export function addPlanSlot(configuration: PlanConfiguration, code: DayCode, baseExerciseId: string, slotId: string): PlanConfiguration {
  if (!allBaseExercises.some((exercise) => exercise.id === baseExerciseId)) return configuration;
  if (configuration.days[code].some((slot) => slot.baseExerciseId === baseExerciseId)) return configuration;
  return updateDay(configuration, code, [...configuration.days[code], { id: slotId, baseExerciseId, exerciseId: baseExerciseId }]);
}

export function replacePlanSlotExercise(configuration: PlanConfiguration, code: DayCode, slotId: string, exerciseId: string): PlanConfiguration {
  const slot = configuration.days[code].find((item) => item.id === slotId);
  if (!slot) return configuration;
  const allowed = [slot.baseExerciseId, ...alternativesFor(slot.baseExerciseId).map((exercise) => exercise.id)];
  if (!allowed.includes(exerciseId)) return configuration;
  return updateDay(configuration, code, configuration.days[code].map((item) => item.id === slotId ? { ...item, exerciseId } : item));
}

export function resetPlanDay(configuration: PlanConfiguration, code: DayCode): PlanConfiguration {
  const defaults = defaultPlanConfiguration();
  return updateDay(configuration, code, defaults.days[code]);
}

export function isCustomizedDay(configuration: PlanConfiguration, code: DayCode) {
  const defaults = defaultPlanConfiguration().days[code];
  const slots = configuration.days[code];
  return slots.length !== defaults.length || slots.some((slot, index) => (
    slot.baseExerciseId !== defaults[index]?.baseExerciseId || slot.exerciseId !== defaults[index]?.exerciseId
  ));
}

export function availableBaseExercises(configuration: PlanConfiguration, code: DayCode) {
  const used = new Set(configuration.days[code].map((slot) => slot.baseExerciseId));
  return allBaseExercises.filter((exercise) => !used.has(exercise.id));
}

function updateDay(configuration: PlanConfiguration, code: DayCode, slots: PlanSlot[]): PlanConfiguration {
  return {
    ...configuration,
    updatedAt: new Date().toISOString(),
    days: { ...configuration.days, [code]: slots },
  };
}
