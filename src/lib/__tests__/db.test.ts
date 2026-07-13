import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createSession } from "../domain";
import { db, loadAppSettings, loadPlanConfiguration, loadSessions, replaceAllData, saveSession, saveSessionDraft } from "../db";
import { defaultPlanConfiguration, resolvePlanDay } from "../plan";
import { defaultAppSettings } from "../settings";

describe("local persistence", () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  it("persists session drafts independently so an interrupted workout can resume", async () => {
    const session = createSession(resolvePlanDay(defaultPlanConfiguration(), "A"));
    await saveSession(session);
    await saveSessionDraft(session.id, session.exercises[0].id, { load: 22.5, reps: 9, rir: 2 });

    const restored = (await loadSessions())[0];
    expect(restored.drafts[session.exercises[0].id]).toEqual({ load: 22.5, reps: 9, rir: 2 });
    expect(Date.parse(restored.updatedAt)).toBeGreaterThanOrEqual(Date.parse(session.updatedAt));
  });

  it("restores sessions, plan and settings as one backup transaction", async () => {
    const plan = defaultPlanConfiguration();
    const session = createSession(resolvePlanDay(plan, "B"));
    const settings = { ...defaultAppSettings(), unit: "lb" as const, weightStep: 5 };

    await replaceAllData([session], plan, settings);

    expect(await loadSessions()).toEqual([session]);
    expect(await loadPlanConfiguration()).toEqual(plan);
    expect(await loadAppSettings()).toEqual(settings);
  });
});
