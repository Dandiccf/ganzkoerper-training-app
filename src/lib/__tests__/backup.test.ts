import { describe, expect, it } from "vitest";
import { createBackup, parseBackup } from "../backup";
import { createSession } from "../domain";
import { defaultPlanConfiguration, replacePlanSlotExercise, resolvePlanDay } from "../plan";
import { defaultAppSettings } from "../settings";

describe("JSON backup", () => {
  it("round-trips sessions, every plan slot and preferences", () => {
    const defaults = defaultPlanConfiguration();
    const slot = defaults.days.A[0];
    const plan = replacePlanSlotExercise(defaults, "A", slot.id, "flat-dumbbell-bench-press");
    const session = createSession(resolvePlanDay(plan, "A"));
    session.status = "paused";
    session.drafts[session.exercises[0].id] = { load: 22.5, reps: 9, rir: 2 };
    session.restTimerEndsAt = new Date(Date.now() + 90_000).toISOString();
    const sessions = [session];
    const settings = { ...defaultAppSettings(), unit: "lb" as const, weightStep: 5 };
    const exported = createBackup(sessions, plan, { language: "de" }, settings);

    const restored = parseBackup(JSON.parse(JSON.stringify(exported)));

    expect(restored.sessions).toEqual(sessions);
    expect(restored.planConfiguration).toEqual(plan);
    expect(restored.planConfiguration.days.A[0]).toMatchObject({
      baseExerciseId: "weighted-dips",
      exerciseId: "flat-dumbbell-bench-press",
    });
    expect(restored.preferences).toEqual({ language: "de" });
    expect(restored.settings).toEqual(settings);
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
    expect(restored.preferences).toEqual({ language: "auto" });
    expect(restored.settings).toMatchObject({ unit: "kg", weightStep: 2.5 });
  });

  it("migrates version 3 display preferences into persistent settings", () => {
    const plan = defaultPlanConfiguration();
    const restored = parseBackup({
      version: 3,
      exportedAt: new Date().toISOString(),
      sessions: [createSession(resolvePlanDay(plan, "A"))],
      planConfiguration: plan,
      preferences: { language: "en", unit: "lb" },
    });

    expect(restored.preferences).toEqual({ language: "en" });
    expect(restored.settings).toMatchObject({ unit: "lb", weightStep: 5 });
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

  it("rejects logically inconsistent version 4 data", () => {
    const plan = defaultPlanConfiguration();
    const emptyCompleted = {
      ...createSession(resolvePlanDay(plan, "A")),
      status: "completed" as const,
      completedAt: new Date().toISOString(),
    };
    const backup = createBackup([emptyCompleted], plan, { language: "auto" }, defaultAppSettings());

    expect(() => parseBackup(backup)).toThrow();
    expect(() => parseBackup({ ...backup, sessions: [backup.sessions[0], backup.sessions[0]] })).toThrow();
  });
});
