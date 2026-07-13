import Dexie, { type EntityTable } from "dexie";
import type { WorkoutSession } from "./domain";
import { defaultPlanConfiguration, type PlanConfiguration } from "./plan";

class TrainingDatabase extends Dexie {
  sessions!: EntityTable<WorkoutSession, "id">;
  plans!: EntityTable<PlanConfiguration, "id">;

  constructor() {
    super("kraftwerk-training");
    this.version(1).stores({ sessions: "id, status, dayCode, startedAt, completedAt" });
    this.version(2).stores({
      sessions: "id, status, dayCode, startedAt, completedAt",
      plans: "id, updatedAt",
    });
  }
}

export const db = new TrainingDatabase();

export async function loadSessions() {
  return db.sessions.orderBy("startedAt").reverse().toArray();
}

export async function saveSession(session: WorkoutSession) {
  await db.sessions.put(session);
}

export async function loadPlanConfiguration() {
  return (await db.plans.get("active")) ?? defaultPlanConfiguration();
}

export async function savePlanConfiguration(configuration: PlanConfiguration) {
  await db.plans.put(configuration);
}

export async function replaceAllData(sessions: WorkoutSession[], configuration: PlanConfiguration) {
  await db.transaction("rw", db.sessions, db.plans, async () => {
    await db.sessions.clear();
    await db.plans.clear();
    await db.sessions.bulkPut(sessions);
    await db.plans.put(configuration);
  });
}

export async function deleteAllData() {
  await db.transaction("rw", db.sessions, db.plans, async () => {
    await db.sessions.clear();
    await db.plans.clear();
  });
}
