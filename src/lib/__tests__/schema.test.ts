import { describe, expect, it } from "vitest";
import { alternativeData, movementMeta, trainingPlan } from "../schema";

describe("movement metadata", () => {
  it("classifies push, pull, legs and core movements", () => {
    expect(movementMeta("horizontal_press").category).toBe("Push");
    expect(movementMeta("vertical_pull").category).toBe("Pull");
    expect(movementMeta("knee_dominant").category).toBe("Beine");
    expect(movementMeta("anti_extension").category).toBe("Core");
  });

  it("covers every movement pattern in the training plan", () => {
    const patterns = [
      ...trainingPlan.days.flatMap((day) => day.exercises.map((exercise) => exercise.movementPattern)),
      ...alternativeData.catalog.map((exercise) => exercise.movementPattern),
    ];
    expect(patterns.filter((pattern) => movementMeta(pattern).category === "Sonstige")).toEqual([]);
  });
});
