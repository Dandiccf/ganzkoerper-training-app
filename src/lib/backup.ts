import { z } from "zod";
import type { WorkoutSession } from "./domain";
import type { LanguagePreference } from "./i18n";
import { defaultPlanConfiguration, type PlanConfiguration } from "./plan";
import { alternativesFor, trainingPlan } from "./schema";

export type AppPreferences = {
  language: LanguagePreference;
  unit: "kg" | "lb";
};

export type TrainingBackup = {
  version: 3;
  exportedAt: string;
  sessions: WorkoutSession[];
  planConfiguration: PlanConfiguration;
  preferences: AppPreferences;
};

export type RestorableBackup = Omit<TrainingBackup, "version" | "exportedAt">;

const setLogSchema = z.object({
  id: z.string().min(1),
  setNumber: z.number().int().positive(),
  load: z.number().nonnegative().nullable(),
  reps: z.number().int().nonnegative(),
  rir: z.number().int().min(0).nullable(),
  completedAt: z.string().min(1),
}).passthrough();

const sessionExerciseSchema = z.object({
  id: z.string().min(1),
  exerciseId: z.string().min(1),
  originalExerciseId: z.string().min(1).optional(),
  name: z.string().min(1),
  movementPattern: z.string().optional(),
  position: z.number().int().positive(),
  targetSets: z.number().int().positive(),
  repMin: z.number().int().nonnegative(),
  repMax: z.number().int().nonnegative(),
  targetRirMin: z.number().int().nonnegative(),
  targetRirMax: z.number().int().nonnegative(),
  restSeconds: z.number().int().nonnegative(),
  image: z.string(),
  techniqueCue: z.string(),
  primaryMuscles: z.array(z.string()),
  status: z.enum(["pending", "active", "completed", "skipped"]),
  sets: z.array(setLogSchema),
}).passthrough();

const workoutSessionSchema = z.object({
  id: z.string().min(1),
  dayCode: z.enum(["A", "B", "C"]),
  dayName: z.string().min(1),
  focus: z.string(),
  status: z.enum(["active", "completed", "discarded"]),
  startedAt: z.string().min(1),
  completedAt: z.string().min(1).optional(),
  notes: z.string(),
  exercises: z.array(sessionExerciseSchema).min(1),
}).passthrough();

const planSlotSchema = z.object({
  id: z.string().min(1),
  baseExerciseId: z.string().min(1),
  exerciseId: z.string().min(1),
});

const baseExerciseIds = new Set(trainingPlan.days.flatMap((day) => day.exercises.map((exercise) => exercise.id)));

const planConfigurationSchema = z.object({
  id: z.literal("active"),
  version: z.literal(1),
  updatedAt: z.string().min(1),
  days: z.object({
    A: z.array(planSlotSchema).min(1),
    B: z.array(planSlotSchema).min(1),
    C: z.array(planSlotSchema).min(1),
  }),
}).superRefine((configuration, context) => {
  for (const code of ["A", "B", "C"] as const) {
    const slotIds = new Set<string>();
    const baseIds = new Set<string>();
    configuration.days[code].forEach((slot, index) => {
      if (slotIds.has(slot.id) || baseIds.has(slot.baseExerciseId)) {
        context.addIssue({ code: "custom", message: "Duplicate plan slot", path: ["days", code, index] });
      }
      slotIds.add(slot.id);
      baseIds.add(slot.baseExerciseId);

      if (!baseExerciseIds.has(slot.baseExerciseId)) {
        context.addIssue({ code: "custom", message: "Unknown base exercise", path: ["days", code, index, "baseExerciseId"] });
        return;
      }
      const allowed = new Set([slot.baseExerciseId, ...alternativesFor(slot.baseExerciseId).map((exercise) => exercise.id)]);
      if (!allowed.has(slot.exerciseId)) {
        context.addIssue({ code: "custom", message: "Invalid exercise alternative", path: ["days", code, index, "exerciseId"] });
      }
    });
  }
});

const preferencesSchema = z.object({
  language: z.enum(["auto", "de", "en"]),
  unit: z.enum(["kg", "lb"]),
});

const backupSchema = z.discriminatedUnion("version", [
  z.object({
    version: z.literal(1),
    exportedAt: z.string().min(1),
    sessions: z.array(workoutSessionSchema),
  }),
  z.object({
    version: z.literal(2),
    exportedAt: z.string().min(1),
    sessions: z.array(workoutSessionSchema),
    planConfiguration: planConfigurationSchema,
  }),
  z.object({
    version: z.literal(3),
    exportedAt: z.string().min(1),
    sessions: z.array(workoutSessionSchema),
    planConfiguration: planConfigurationSchema,
    preferences: preferencesSchema,
  }),
]);

export function createBackup(
  sessions: WorkoutSession[],
  planConfiguration: PlanConfiguration,
  preferences: AppPreferences,
): TrainingBackup {
  return {
    version: 3,
    exportedAt: new Date().toISOString(),
    sessions,
    planConfiguration,
    preferences,
  };
}

export function parseBackup(input: unknown): RestorableBackup {
  const backup = backupSchema.parse(input);
  return {
    sessions: backup.sessions as WorkoutSession[],
    planConfiguration: backup.version === 1
      ? defaultPlanConfiguration()
      : backup.planConfiguration as PlanConfiguration,
    preferences: backup.version === 3
      ? backup.preferences
      : { language: "auto", unit: "kg" },
  };
}
