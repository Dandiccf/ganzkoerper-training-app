import type { DayCode, PlanExercise, TrainingDay } from "./schema";

export type SetLog = {
  id: string;
  setNumber: number;
  load: number | null;
  reps: number;
  rir: number | null;
  completedAt: string;
};

export type SessionExercise = {
  id: string;
  exerciseId: string;
  originalExerciseId?: string;
  name: string;
  movementPattern?: string;
  position: number;
  targetSets: number;
  repMin: number;
  repMax: number;
  targetRirMin: number;
  targetRirMax: number;
  restSeconds: number;
  image: string;
  techniqueCue: string;
  primaryMuscles: string[];
  status: "pending" | "active" | "completed" | "skipped";
  sets: SetLog[];
};

export type WorkoutSession = {
  id: string;
  dayCode: DayCode;
  dayName: string;
  focus: string;
  status: "active" | "completed" | "discarded";
  startedAt: string;
  completedAt?: string;
  notes: string;
  exercises: SessionExercise[];
};

export function nextDayCode(sessions: WorkoutSession[]): DayCode {
  const completed = sessions
    .filter((session) => session.status === "completed" && session.completedAt)
    .sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));
  if (!completed.length) return "A";
  const rotation: DayCode[] = ["A", "B", "C"];
  return rotation[(rotation.indexOf(completed[0].dayCode) + 1) % rotation.length];
}

export function createSession(day: TrainingDay): WorkoutSession {
  const sessionId = crypto.randomUUID();
  return {
    id: sessionId,
    dayCode: day.code,
    dayName: day.name,
    focus: day.focus,
    status: "active",
    startedAt: new Date().toISOString(),
    notes: "",
    exercises: day.exercises.map((exercise, index) => snapshotExercise(exercise, index, sessionId)),
  };
}

function snapshotExercise(exercise: PlanExercise, index: number, sessionId: string): SessionExercise {
  return {
    id: `${sessionId}-${exercise.id}`,
    exerciseId: exercise.id,
    name: exercise.name,
    movementPattern: exercise.movementPattern,
    position: index + 1,
    targetSets: exercise.sets,
    repMin: exercise.repRange.min,
    repMax: exercise.repRange.max,
    targetRirMin: exercise.targetRir.min,
    targetRirMax: exercise.targetRir.max,
    restSeconds: exercise.restSeconds,
    image: exercise.image,
    techniqueCue: exercise.techniqueCue,
    primaryMuscles: exercise.primaryMuscles,
    status: index === 0 ? "active" : "pending",
    sets: [],
  };
}

export function replaceSessionExercise(
  exercise: SessionExercise,
  replacement: { id: string; name: string },
): SessionExercise {
  return {
    ...exercise,
    originalExerciseId: exercise.originalExerciseId ?? exercise.exerciseId,
    exerciseId: replacement.id,
    name: replacement.name,
    sets: [],
    status: "active",
  };
}

export function activateSessionExercise(session: WorkoutSession, exerciseId: string): WorkoutSession {
  const target = session.exercises.find((exercise) => exercise.id === exerciseId);
  if (!target || target.status === "completed") return session;

  return {
    ...session,
    exercises: session.exercises.map((exercise) => {
      if (exercise.id === exerciseId) return { ...exercise, status: "active" as const };
      if (exercise.status !== "active") return exercise;
      return {
        ...exercise,
        status: exercise.sets.length >= exercise.targetSets ? "completed" as const : "pending" as const,
      };
    }),
  };
}

export function recommendation(exercise: SessionExercise) {
  if (exercise.sets.length < exercise.targetSets) return "Noch keine Empfehlung";
  const atTop = exercise.sets.every((set) => set.reps >= exercise.repMax && (set.rir ?? 0) >= 1);
  if (atTop) return "Zielbereich erreicht – Last beim nächsten Mal leicht erhöhen.";
  const below = exercise.sets.some((set) => set.reps < exercise.repMin && set.rir === 0);
  if (below) return "Last halten oder leicht reduzieren und sauber im Zielbereich arbeiten.";
  return "Last halten und beim nächsten Mal eine Wiederholung ergänzen.";
}
