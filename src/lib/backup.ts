import { z } from "zod";
import type { WorkoutSession } from "./domain";
import type { LanguagePreference } from "./i18n";
import { defaultPlanConfiguration, type PlanConfiguration } from "./plan";
import { alternativesFor, trainingPlan } from "./schema";
import { defaultAppSettings, type AppSettings } from "./settings";

export type AppPreferences = { language: LanguagePreference };

export type TrainingBackup = {
  version: 4;
  exportedAt: string;
  sessions: WorkoutSession[];
  planConfiguration: PlanConfiguration;
  preferences: AppPreferences;
  settings: AppSettings;
};

export type RestorableBackup = Omit<TrainingBackup, "version" | "exportedAt">;

const dateTimeSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date");

const setLogSchema = z.object({
  id: z.string().min(1),
  setNumber: z.number().int().positive(),
  load: z.number().nonnegative().nullable(),
  reps: z.number().int().positive(),
  rir: z.number().int().min(0).max(4).nullable(),
  completedAt: dateTimeSchema,
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
  status: z.enum(["active", "paused", "completed", "discarded"]),
  startedAt: dateTimeSchema,
  completedAt: dateTimeSchema.optional(),
  notes: z.string(),
  exercises: z.array(sessionExerciseSchema).min(1),
  drafts: z.record(z.string(), z.object({
    load: z.number().nonnegative().nullable(),
    reps: z.number().int().positive(),
    rir: z.number().int().min(0).max(4).nullable(),
  })).optional(),
  restTimerEndsAt: dateTimeSchema.optional(),
  updatedAt: dateTimeSchema.optional(),
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
  updatedAt: dateTimeSchema,
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
});

const legacyPreferencesSchema = preferencesSchema.extend({ unit: z.enum(["kg", "lb"]) });

const appSettingsSchema = z.object({
  id: z.literal("active"),
  version: z.literal(1),
  unit: z.enum(["kg", "lb"]),
  weightStep: z.number().positive().max(100),
  updatedAt: dateTimeSchema,
});

const backupSchema = z.discriminatedUnion("version", [
  z.object({
    version: z.literal(1),
    exportedAt: dateTimeSchema,
    sessions: z.array(workoutSessionSchema),
  }),
  z.object({
    version: z.literal(2),
    exportedAt: dateTimeSchema,
    sessions: z.array(workoutSessionSchema),
    planConfiguration: planConfigurationSchema,
  }),
  z.object({
    version: z.literal(3),
    exportedAt: dateTimeSchema,
    sessions: z.array(workoutSessionSchema),
    planConfiguration: planConfigurationSchema,
    preferences: legacyPreferencesSchema,
  }),
  z.object({
    version: z.literal(4),
    exportedAt: dateTimeSchema,
    sessions: z.array(workoutSessionSchema),
    planConfiguration: planConfigurationSchema,
    preferences: preferencesSchema,
    settings: appSettingsSchema,
  }),
]).superRefine((backup, context) => {
  const sessionIds = new Set<string>();
  let ongoingSessions = 0;
  backup.sessions.forEach((session, sessionIndex) => {
    if (sessionIds.has(session.id)) context.addIssue({ code: "custom", message: "Duplicate session id", path: ["sessions", sessionIndex, "id"] });
    sessionIds.add(session.id);
    if (session.status === "active" || session.status === "paused") ongoingSessions += 1;
    if (session.status === "completed" && !session.completedAt) context.addIssue({ code: "custom", message: "Completed session needs a completion date", path: ["sessions", sessionIndex, "completedAt"] });
    if (backup.version === 4 && session.status === "completed" && !session.exercises.some((exercise) => exercise.sets.length)) context.addIssue({ code: "custom", message: "Completed session needs at least one set", path: ["sessions", sessionIndex, "exercises"] });

    const exerciseIds = new Set<string>();
    session.exercises.forEach((exercise, exerciseIndex) => {
      if (exerciseIds.has(exercise.id)) context.addIssue({ code: "custom", message: "Duplicate session exercise id", path: ["sessions", sessionIndex, "exercises", exerciseIndex, "id"] });
      exerciseIds.add(exercise.id);
      if (exercise.repMin > exercise.repMax || exercise.targetRirMin > exercise.targetRirMax) context.addIssue({ code: "custom", message: "Invalid target range", path: ["sessions", sessionIndex, "exercises", exerciseIndex] });
      const setIds = new Set<string>();
      exercise.sets.forEach((set, setIndex) => {
        if (setIds.has(set.id)) context.addIssue({ code: "custom", message: "Duplicate set id", path: ["sessions", sessionIndex, "exercises", exerciseIndex, "sets", setIndex, "id"] });
        if (set.setNumber !== setIndex + 1) context.addIssue({ code: "custom", message: "Invalid set sequence", path: ["sessions", sessionIndex, "exercises", exerciseIndex, "sets", setIndex, "setNumber"] });
        setIds.add(set.id);
      });
    });
  });
  if (ongoingSessions > 1) context.addIssue({ code: "custom", message: "Only one active or paused session is allowed", path: ["sessions"] });
});

export function createBackup(
  sessions: WorkoutSession[],
  planConfiguration: PlanConfiguration,
  preferences: AppPreferences,
  settings: AppSettings,
): TrainingBackup {
  return {
    version: 4,
    exportedAt: new Date().toISOString(),
    sessions,
    planConfiguration,
    preferences,
    settings,
  };
}

export function parseBackup(input: unknown): RestorableBackup {
  const backup = backupSchema.parse(input);
  const sessions = backup.sessions.map((session) => ({
    ...session,
    drafts: session.drafts ?? {},
    updatedAt: session.updatedAt ?? session.completedAt ?? session.startedAt,
  })) as WorkoutSession[];
  const settings = backup.version === 4
    ? backup.settings as AppSettings
    : backup.version === 3
      ? { ...defaultAppSettings(), unit: backup.preferences.unit, weightStep: backup.preferences.unit === "lb" ? 5 : 2.5 }
      : defaultAppSettings();
  return {
    sessions,
    planConfiguration: backup.version === 1
      ? defaultPlanConfiguration()
      : backup.planConfiguration as PlanConfiguration,
    preferences: backup.version === 3 || backup.version === 4
      ? { language: backup.preferences.language }
      : { language: "auto" },
    settings,
  };
}
