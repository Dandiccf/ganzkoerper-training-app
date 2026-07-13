import { describe, expect, it } from "vitest";
import { createBackup, parseBackup } from "../backup";
import { createSession } from "../domain";
import { defaultPlanConfiguration, replacePlanSlotExercise, resolvePlanDay } from "../plan";

describe("JSON backup", () => {
  it("round-trips sessions, every plan slot and preferences", () => {
    const defaults = defaultPlanConfiguration();
    const slot = defaults.days.A[0];
    const plan = replacePlanSlotExercise(defaults, "A", slot.id, "flat-dumbbell-bench-press");
    const sessions = [createSession(resolvePlanDay(plan, "A"))];
    const exported = createBackup(sessions, plan, { language: "de", unit: "lb" });

    const restored = parseBackup(JSON.parse(JSON.stringify(exported)));

    expect(restored.sessions).toEqual(sessions);
    expect(restored.planConfiguration).toEqual(plan);
    expect(restored.planConfiguration.days.A[0]).toMatchObject({
      baseExerciseId: "weighted-dips",
      exerciseId: "flat-dumbbell-bench-press",
    });
    expect(restored.preferences).toEqual({ language: "de", unit: "lb" });
  });

  it("imports the previous version 2 format", () => {
    const plan = defaultPlanConfiguration();
    const restored = parseBackup({
      version: 2,
      exportedAt: new Date().toISOString(),
      sessions: [createSession(resolvePlanDay(plan, "A"))],
      planConfiguration: plan,
    });

    expect(restored.planConfiguration).toEqual(plan);
    expect(restored.preferences).toEqual({ language: "auto", unit: "kg" });
  });

  it("rejects incomplete backups before they can replace local data", () => {
    expect(() => parseBackup({
      version: 3,
      exportedAt: new Date().toISOString(),
      sessions: [],
      preferences: { language: "de", unit: "kg" },
    })).toThrow();
  });

  it("rejects unknown exercises and invalid alternatives", () => {
    const plan = defaultPlanConfiguration();
    plan.days.A[0] = { ...plan.days.A[0], exerciseId: "unknown-exercise" };

    expect(() => parseBackup({
      version: 2,
      exportedAt: new Date().toISOString(),
      sessions: [],
      planConfiguration: plan,
    })).toThrow();
  });
});
