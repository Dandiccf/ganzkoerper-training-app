import Dexie, { type EntityTable } from "dexie";
import type { WorkoutSession } from "./domain";

class TrainingDatabase extends Dexie {
  sessions!: EntityTable<WorkoutSession, "id">;

  constructor() {
    super("kraftwerk-training");
    this.version(1).stores({ sessions: "id, status, dayCode, startedAt, completedAt" });
  }
}

export const db = new TrainingDatabase();

export async function loadSessions() {
  return db.sessions.orderBy("startedAt").reverse().toArray();
}

export async function saveSession(session: WorkoutSession) {
  await db.sessions.put(session);
}

export async function deleteAllData() {
  await db.sessions.clear();
}
