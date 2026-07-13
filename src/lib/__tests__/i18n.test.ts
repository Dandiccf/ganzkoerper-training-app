import { describe, expect, it } from "vitest";
import {
  localeFromLanguages,
  localizeCue,
  localizeDay,
  localizeEquipment,
  localizeExerciseName,
  localizeMovement,
  localizeMuscles,
  localizeRecommendation,
} from "../i18n";

describe("locale selection", () => {
  it("uses German when a German browser locale is available", () => {
    expect(localeFromLanguages(["de-AT", "en-US"])).toBe("de");
  });

  it("falls back to English for other browser locales", () => {
    expect(localeFromLanguages(["fr-FR", "en-GB"])).toBe("en");
  });

  it("respects the browser's preferred supported language order", () => {
    expect(localeFromLanguages(["en-US", "de-DE"])).toBe("en");
  });
});

describe("localized training content", () => {
  it("translates stable day and exercise ids without changing fallbacks", () => {
    expect(localizeDay("B", { name: "Beine-Fokus", focus: "Unterkörper schwer" }, "en")).toEqual({
      name: "Leg Focus",
      focus: "Lower body heavy · Upper body light",
    });
    expect(localizeExerciseName("pullups-pronated", "Klimmzüge Obergriff", "en")).toBe("Pronated Pull-ups");
    expect(localizeExerciseName("unknown", "Custom exercise", "en")).toBe("Custom exercise");
  });

  it("translates exercise details and recommendations", () => {
    expect(localizeMuscles(["Rücken", "Bizeps"], "en")).toEqual(["Back", "Biceps"]);
    expect(localizeEquipment(["Klimmzugstange"], "en")).toEqual(["Pull-up bar"]);
    expect(localizeCue("front-squats", "fallback", "en")).toContain("elbows high");
    expect(localizeMovement("vertical_pull", { category: "Pull", label: "Vertikales Ziehen", tone: "pull" }, "en")).toMatchObject({ label: "Vertical pull", tone: "pull" });
    expect(localizeRecommendation("Noch keine Empfehlung", "en")).toBe("No recommendation yet");
  });
});
