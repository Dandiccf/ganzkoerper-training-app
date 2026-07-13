import Dexie, { type EntityTable } from "dexie";
import type { WorkoutSession } from "./domain";
import { defaultPlanConfiguration, type PlanConfiguration } from "./plan";
import { defaultAppSettings, type AppSettings } from "./settings";

class TrainingDatabase extends Dexie {
  sessions!: EntityTable<WorkoutSession, "id">;
  plans!: EntityTable<PlanConfiguration, "id">;
  settings!: EntityTable<AppSettings, "id">;

  constructor() {
    super("kraftwerk-training");
    this.version(1).stores({ sessions: "id, status, dayCode, startedAt, completedAt" });
    this.version(2).stores({
      sessions: "id, status, dayCode, startedAt, completedAt",
      plans: "id, updatedAt",
    });
    this.version(3).stores({
      sessions: "id, status, dayCode, startedAt, completedAt, updatedAt",
      plans: "id, updatedAt",
      settings: "id, updatedAt",
    }).upgrade(async (transaction) => {
      await transaction.table("sessions").toCollection().modify((session) => {
        session.drafts ??= {};
        session.updatedAt ??= session.completedAt ?? session.startedAt ?? new Date(0).toISOString();
      });
    });
  }
}

export const db = new TrainingDatabase();

export async function loadSessions() {
  return db.sessions.orderBy("startedAt").reverse().toArray();
}

export async function saveSession(session: WorkoutSession) {
  await db.sessions.put({ ...session, updatedAt: new Date().toISOString() });
  broadcastDataChange();
}

export async function saveSessionDraft(sessionId: string, exerciseId: string, draft: WorkoutSession["drafts"][string]) {
  await db.sessions.where("id").equals(sessionId).modify((session) => {
    session.drafts = { ...(session.drafts ?? {}), [exerciseId]: draft };
    session.updatedAt = new Date().toISOString();
  });
}

export async function clearSessionRestTimer(sessionId: string) {
  await db.sessions.where("id").equals(sessionId).modify((session) => {
    delete session.restTimerEndsAt;
    session.updatedAt = new Date().toISOString();
  });
}

export async function loadPlanConfiguration() {
  return (await db.plans.get("active")) ?? defaultPlanConfiguration();
}

export async function savePlanConfiguration(configuration: PlanConfiguration) {
  await db.plans.put(configuration);
  broadcastDataChange();
}

export async function loadAppSettings() {
  return (await db.settings.get("active")) ?? defaultAppSettings();
}

export async function saveAppSettings(settings: AppSettings) {
  const next = { ...settings, updatedAt: new Date().toISOString() };
  await db.settings.put(next);
  broadcastDataChange();
  return next;
}

export async function replaceAllData(sessions: WorkoutSession[], configuration: PlanConfiguration, settings: AppSettings) {
  await db.transaction("rw", db.sessions, db.plans, db.settings, async () => {
    await db.sessions.clear();
    await db.plans.clear();
    await db.settings.clear();
    await db.sessions.bulkPut(sessions);
    await db.plans.put(configuration);
    await db.settings.put(settings);
  });
  broadcastDataChange();
}

export async function deleteAllData() {
  await db.transaction("rw", db.sessions, db.plans, db.settings, async () => {
    await db.sessions.clear();
    await db.plans.clear();
    await db.settings.clear();
  });
  broadcastDataChange();
}

const CHANNEL_NAME = "kraftwerk-data";

function broadcastDataChange() {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage({ type: "changed" });
  channel.close();
}

export function subscribeToDataChanges(callback: () => void) {
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) return () => undefined;
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.addEventListener("message", callback);
  return () => channel.close();
}
