import { describe, expect, it } from "vitest";
import { nextDayCode, recommendation, type SessionExercise, type WorkoutSession } from "../domain";

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
