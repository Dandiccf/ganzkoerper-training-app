import { describe, expect, it } from "vitest";
import { activateSessionExercise, nextDayCode, recommendation, type SessionExercise, type WorkoutSession } from "../domain";

describe("training rotation", () => {
  it("starts at A without history", () => expect(nextDayCode([])).toBe("A"));

  it("rotates after the latest completed session", () => {
    const sessions = [
      { dayCode: "A", status: "completed", completedAt: "2026-07-10T10:00:00Z" },
      { dayCode: "B", status: "completed", completedAt: "2026-07-12T10:00:00Z" },
    ] as WorkoutSession[];
    expect(nextDayCode(sessions)).toBe("C");
  });
});

describe("progression", () => {
  const base = {
    targetSets: 2,
    repMin: 6,
    repMax: 10,
  } as SessionExercise;

  it("recommends an increase at the top of the range", () => {
    const exercise = { ...base, sets: [{ reps: 10, rir: 2 }, { reps: 10, rir: 1 }] } as SessionExercise;
    expect(recommendation(exercise)).toContain("erhöhen");
  });

  it("holds the load while reps remain", () => {
    const exercise = { ...base, sets: [{ reps: 9, rir: 2 }, { reps: 8, rir: 1 }] } as SessionExercise;
    expect(recommendation(exercise)).toContain("Last halten");
  });
});

describe("free exercise order", () => {
  it("keeps partial sets when switching to another exercise", () => {
    const session = {
      exercises: [
        { id: "first", status: "active", targetSets: 2, sets: [{ id: "set-1" }] },
        { id: "second", status: "pending", targetSets: 2, sets: [] },
      ],
    } as WorkoutSession;

    const result = activateSessionExercise(session, "second");

    expect(result.exercises[0].status).toBe("pending");
    expect(result.exercises[0].sets).toHaveLength(1);
    expect(result.exercises[1].status).toBe("active");
  });

  it("does not reopen a completed exercise", () => {
    const session = {
      exercises: [{ id: "done", status: "completed", targetSets: 2, sets: [{}, {}] }],
    } as WorkoutSession;

    expect(activateSessionExercise(session, "done")).toBe(session);
  });
});
