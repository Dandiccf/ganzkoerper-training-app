import { describe, expect, it } from "vitest";
import { createSession } from "../domain";
import {
  addPlanSlot,
  defaultPlanConfiguration,
  movePlanSlot,
  removePlanSlot,
  replacePlanSlotExercise,
  resetPlanDay,
  resolvePlanDay,
} from "../plan";

describe("master plan configuration", () => {
  it("starts with the full default A day", () => {
    const configuration = defaultPlanConfiguration();
    expect(resolvePlanDay(configuration, "A").exercises).toHaveLength(9);
  });

  it("reorders and removes slots without allowing an empty day", () => {
    let configuration = defaultPlanConfiguration();
    const first = configuration.days.A[0];
    configuration = movePlanSlot(configuration, "A", first.id, 1);
    expect(configuration.days.A[1].id).toBe(first.id);

    while (configuration.days.A.length > 1) {
      configuration = removePlanSlot(configuration, "A", configuration.days.A[0].id);
    }
    expect(configuration.days.A).toHaveLength(1);
    expect(removePlanSlot(configuration, "A", configuration.days.A[0].id)).toBe(configuration);
  });

  it("adds a unique exercise slot and rejects duplicates", () => {
    let configuration = defaultPlanConfiguration();
    configuration = addPlanSlot(configuration, "A", "barbell-bench-press", "invalid-alt");
    expect(configuration.days.A).toHaveLength(9);

    configuration = addPlanSlot(configuration, "A", "barbell-bench-press", "duplicate");
    expect(configuration.days.A).toHaveLength(9);

    configuration = addPlanSlot(configuration, "A", "incline-dumbbell-press", "new-slot");
    expect(configuration.days.A.at(-1)).toMatchObject({ id: "new-slot", baseExerciseId: "incline-dumbbell-press" });
  });

  it("keeps the slot prescription when a curated alternative is selected", () => {
    const configuration = defaultPlanConfiguration();
    const slot = configuration.days.A[0];
    const changed = replacePlanSlotExercise(configuration, "A", slot.id, "flat-dumbbell-bench-press");
    const exercise = resolvePlanDay(changed, "A").exercises[0];

    expect(exercise).toMatchObject({
      id: "flat-dumbbell-bench-press",
      baseExerciseId: "weighted-dips",
      sets: 2,
      primaryMuscles: ["Brust"],
      image: "design-assets/muscle-groups/a-1.png",
    });

    const session = createSession(resolvePlanDay(changed, "A"));
    expect(session.exercises[0]).toMatchObject({
      exerciseId: "flat-dumbbell-bench-press",
      originalExerciseId: "weighted-dips",
    });
  });

  it("rejects uncurated replacements and can reset a day", () => {
    const configuration = defaultPlanConfiguration();
    const slot = configuration.days.A[0];
    expect(replacePlanSlotExercise(configuration, "A", slot.id, "dead-bug")).toBe(configuration);

    const changed = removePlanSlot(configuration, "A", slot.id);
    expect(resetPlanDay(changed, "A").days.A).toEqual(defaultPlanConfiguration().days.A);
  });
});
