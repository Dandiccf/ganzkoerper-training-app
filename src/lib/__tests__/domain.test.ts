import { describe, expect, it } from "vitest";
import { activateSessionExercise, deleteLoggedSet, nextDayCode, recommendation, replaceSessionExercise, setExerciseTargetSets, updateLoggedSet, type SessionExercise, type WorkoutSession } from "../domain";

describe("training rotation", () => {
  it("starts at A without history", () => expect(nextDayCode([])).toBe("A"));

  it("rotates after the latest completed session", () => {
    const sessions = [
      { dayCode: "A", status: "completed", completedAt: "2026-07-10T10:00:00Z" },
      { dayCode: "B", status: "completed", completedAt: "2026-07-12T10:00:00Z" },
    ].map((session) => ({ ...session, exercises: [{ sets: [{}] }] })) as WorkoutSession[];
    expect(nextDayCode(sessions)).toBe("C");
  });

  it("ignores legacy zero-set completions", () => {
    const session = { dayCode: "C", status: "completed", completedAt: "2026-07-12T10:00:00Z", exercises: [{ sets: [] }] } as unknown as WorkoutSession;
    expect(nextDayCode([session])).toBe("A");
  });
});

describe("safe set corrections", () => {
  const session = {
    updatedAt: "2026-07-12T10:00:00Z",
    exercises: [{ id: "exercise", status: "completed", targetSets: 2, sets: [
      { id: "one", setNumber: 1, load: 20, reps: 10, rir: 2 },
      { id: "two", setNumber: 2, load: 20, reps: 9, rir: 1 },
    ] }],
  } as WorkoutSession;

  it("updates a logged set without changing its identity", () => {
    const result = updateLoggedSet(session, "exercise", "one", { load: 22.5, reps: 8, rir: 1 });
    expect(result.exercises[0].sets[0]).toMatchObject({ id: "one", setNumber: 1, load: 22.5, reps: 8, rir: 1 });
  });

  it("renumbers after deletion and reopens the exercise", () => {
    const result = deleteLoggedSet(session, "exercise", "one");
    expect(result.exercises[0].sets).toMatchObject([{ id: "two", setNumber: 1 }]);
    expect(result.exercises[0].status).toBe("active");
  });

  it("does not replace an exercise that already contains sets", () => {
    const exercise = session.exercises[0] as SessionExercise;
    expect(replaceSessionExercise(exercise, { id: "replacement", name: "Replacement" })).toBe(exercise);
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

describe("flexible session set targets", () => {
  it("adds a planned set without changing the current exercise", () => {
    const session = {
      exercises: [{ id: "current", status: "active", targetSets: 2, sets: [{}] }],
    } as WorkoutSession;

    const result = setExerciseTargetSets(session, "current", 3);

    expect(result.exercises[0]).toMatchObject({ status: "active", targetSets: 3 });
    expect(result.exercises[0].sets).toHaveLength(1);
  });

  it("finishes the current exercise and activates the next one when reducing to the logged set count", () => {
    const session = {
      exercises: [
        { id: "current", status: "active", targetSets: 2, sets: [{}] },
        { id: "next", status: "pending", targetSets: 2, sets: [] },
      ],
    } as WorkoutSession;

    const result = setExerciseTargetSets(session, "current", 1);

    expect(result.exercises[0].status).toBe("completed");
    expect(result.exercises[1].status).toBe("active");
  });

  it("reopens a completed exercise when a set is added", () => {
    const session = {
      exercises: [{ id: "done", status: "completed", targetSets: 2, sets: [{}, {}] }],
    } as WorkoutSession;

    const expanded = setExerciseTargetSets(session, "done", 3);
    const result = activateSessionExercise(expanded, "done");

    expect(result.exercises[0]).toMatchObject({ status: "active", targetSets: 3 });
    expect(result.exercises[0].sets).toHaveLength(2);
  });

  it("never removes logged sets or allows a target below one", () => {
    const withLogs = {
      exercises: [{ id: "current", status: "active", targetSets: 3, sets: [{}, {}] }],
    } as WorkoutSession;
    const empty = {
      exercises: [{ id: "empty", status: "active", targetSets: 2, sets: [] }],
    } as unknown as WorkoutSession;

    expect(setExerciseTargetSets(withLogs, "current", 1).exercises[0].targetSets).toBe(2);
    expect(setExerciseTargetSets(withLogs, "current", 1).exercises[0].sets).toHaveLength(2);
    expect(setExerciseTargetSets(empty, "empty", 0).exercises[0].targetSets).toBe(1);
  });
});
