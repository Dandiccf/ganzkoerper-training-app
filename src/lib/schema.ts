import { z } from "zod";
import rawPlan from "@/data/training-plan.v1.json";
import rawAlternatives from "@/data/exercise-alternatives.v1.json";

const rangeSchema = z.object({ min: z.number(), max: z.number() });

export const exerciseSchema = z.object({
  id: z.string(),
  order: z.number(),
  name: z.string(),
  displaySubtitle: z.string().optional(),
  movementPattern: z.string(),
  intensity: z.enum(["heavy", "light", "isolation"]),
  sets: z.number().int().positive(),
  repRange: rangeSchema,
  restSeconds: z.number().int().positive(),
  targetRir: rangeSchema,
  primaryMuscles: z.array(z.string()),
  secondaryMuscles: z.array(z.string()),
  equipment: z.array(z.string()),
  image: z.string(),
  techniqueCue: z.string(),
  alternatives: z.array(z.string()),
});

const daySchema = z.object({
  code: z.enum(["A", "B", "C"]),
  name: z.string(),
  focus: z.string(),
  colorToken: z.string(),
  exercises: z.array(exerciseSchema),
});

const planSchema = z.object({
  schemaVersion: z.number(),
  program: z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    version: z.number(),
    rotation: z.tuple([z.literal("A"), z.literal("B"), z.literal("C")]),
    recommendedRestDays: rangeSchema,
    estimatedDurationMinutes: rangeSchema,
    defaults: z.object({
      sets: z.number(),
      targetRir: rangeSchema,
      heavyRestSeconds: z.number(),
      lightRestSeconds: z.number(),
      isolationRestSeconds: z.number(),
    }),
    days: z.array(daySchema).length(3),
  }),
});

const alternativeSchema = z.object({
  id: z.string(),
  name: z.string(),
  movementPattern: z.string(),
  equipment: z.array(z.string()),
  tags: z.array(z.string()),
});

const alternativesSchema = z.object({
  schemaVersion: z.number(),
  catalog: z.array(alternativeSchema),
  mappings: z.array(z.object({
    exerciseId: z.string(),
    preferredAlternativeIds: z.array(z.string()).min(3),
  })),
});

export type PlanExercise = z.infer<typeof exerciseSchema>;
export type TrainingDay = z.infer<typeof daySchema>;
export type DayCode = TrainingDay["code"];
export type AlternativeExercise = z.infer<typeof alternativeSchema>;

export const trainingPlan = planSchema.parse(rawPlan).program;
export const alternativeData = alternativesSchema.parse(rawAlternatives);

export function imageUrl(imagePath: string) {
  return imagePath.replace("design-assets/muscle-groups", "/muscle-groups");
}

export function alternativesFor(exerciseId: string) {
  const mapping = alternativeData.mappings.find((item) => item.exerciseId === exerciseId);
  if (!mapping) return [];
  const planExercises = trainingPlan.days.flatMap((day) => day.exercises);
  return mapping.preferredAlternativeIds.flatMap((id) => {
    const catalogItem = alternativeData.catalog.find((item) => item.id === id);
    if (catalogItem) return [catalogItem];
    const planItem = planExercises.find((item) => item.id === id);
    return planItem
      ? [{ id: planItem.id, name: planItem.name, movementPattern: planItem.movementPattern, equipment: planItem.equipment, tags: ["Planübung"] }]
      : [];
  });
}
