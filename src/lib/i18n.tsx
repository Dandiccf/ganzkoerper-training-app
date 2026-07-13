"use client";

import { Languages } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "de" | "en";
export type LanguagePreference = "auto" | Locale;

const de = {
  "language.label": "Sprache",
  "language.auto": "Auto",
  "language.german": "Deutsch",
  "language.english": "English",
  "brand.subtitle": "Ganzkörpertraining",
  "nav.today": "Heute",
  "nav.plan": "Plan",
  "nav.history": "Verlauf",
  "nav.more": "Mehr",
  "nav.settings": "Einstellungen",
  "nav.aria": "Hauptnavigation",
  "status.local": "Lokal gespeichert",
  "status.loading": "Trainingsdaten werden vorbereitet …",
  "status.offline": "Offline bereit",
  "common.day": "Tag",
  "common.of": "von",
  "common.set": "Satz",
  "common.sets": "Sätze",
  "common.exercises": "Übungen",
  "common.rest": "Pause",
  "common.skip": "Überspringen",
  "common.bodyweight": "Körpergewicht",
  "common.close": "Schließen",
  "today.eyebrow": "Heute",
  "today.title": "Bereit für die nächste Einheit?",
  "today.subtitle": "Ein klarer Plan, zwei starke Sätze, kein unnötiger Lärm.",
  "today.start": "Training starten",
  "today.more": "+ mehr",
  "today.rotation": "Rotation",
  "today.week": "Deine Trainingswoche",
  "today.done": "Erledigt",
  "today.next": "Als Nächstes",
  "today.last": "Letzte Einheit",
  "today.nextGoal": "Nächstes Ziel wurde vorbereitet.",
  "today.none": "Noch kein Training",
  "today.noneHelp": "Starte Tag A, um deine lokale Historie aufzubauen.",
  "today.privacy": "Deine Trainingsdaten bleiben standardmäßig ausschließlich auf diesem Gerät.",
  "plan.eyebrow": "Trainingsplan",
  "plan.title": "Die A/B/C-Rotation",
  "plan.subtitle": "54 Arbeitssätze, flexibel über die Woche verteilt.",
  "plan.learn": "Grundidee verstehen",
  "plan.pattern": "Bewegungsmuster:",
  "plan.technique": "Technik:",
  "plan.equipment": "Equipment:",
  "plan.alternatives": "Alternativen:",
  "plan.edit": "Plan bearbeiten",
  "plan.doneEditing": "Fertig",
  "plan.editorHint": "Passe deinen Masterplan an. Änderungen gelten für alle zukünftigen Einheiten.",
  "plan.moveUp": "Nach oben verschieben",
  "plan.moveDown": "Nach unten verschieben",
  "plan.changePermanent": "Alternative festlegen",
  "plan.remove": "Aus diesem Tag entfernen",
  "plan.addExercise": "Übung hinzufügen",
  "plan.addTitle": "Übungsslot hinzufügen",
  "plan.addHelp": "Wähle eine weitere Muskelgruppe beziehungsweise einen Bewegungsslot für diesen Trainingstag.",
  "plan.chooseAlternative": "Alternative im Masterplan",
  "plan.alternativeHelp": "Diese Auswahl bleibt für zukünftige Einheiten gespeichert. Im Workout kannst du sie weiterhin nur für den Tag ersetzen.",
  "plan.baseExercise": "Standard",
  "plan.configured": "Angepasst",
  "plan.resetDay": "Tag zurücksetzen",
  "plan.confirmReset": "Diesen Trainingstag auf den ursprünglichen Plan zurücksetzen?",
  "plan.noExercisesAvailable": "Alle verfügbaren Übungsslots sind bereits in diesem Tag enthalten.",
  "workout.pause": "Training pausieren",
  "workout.exercise": "Übung",
  "workout.finish": "Abschließen",
  "workout.finishEarly": "Früh beenden",
  "workout.imageAlt": "Muskelgrafik für {exercise}",
  "workout.choose": "Andere Übung wählen",
  "workout.replace": "Übung ersetzen",
  "workout.target": "Ziel",
  "workout.repsShort": "Wdh.",
  "workout.workingSets": "Arbeitssätze",
  "workout.sessionOnly": "Nur für diese Sitzung",
  "workout.removeSet": "Einen Arbeitssatz entfernen",
  "workout.addSet": "Einen Arbeitssatz hinzufügen",
  "workout.lastTime": "Letztes Mal:",
  "workout.weight": "Gewicht",
  "workout.repetitions": "Wiederholungen",
  "workout.rirHelp": "Wiederholungen im Tank",
  "workout.completeSet": "Satz abschließen",
  "workout.skipExercise": "Übung überspringen",
  "workout.onlyToday": "Nur für heute",
  "workout.freeOrder": "Freie Reihenfolge",
  "workout.freeTitle": "Was ist gerade frei?",
  "workout.freeHelp": "Wechsle zu einer offenen Übung oder ergänze spontan einen Zusatzsatz. Deine bisherigen Sätze bleiben gespeichert.",
  "workout.active": "Gerade aktiv",
  "workout.completed": "Abgeschlossen",
  "workout.skipped": "Übersprungen",
  "workout.open": "Offen",
  "workout.extraSet": "Zusatzsatz",
  "workout.now": "Jetzt",
  "workout.sessionDone": "Einheit geschafft",
  "workout.logged": "Sätze protokolliert",
  "workout.complete": "Training abschließen",
  "history.eyebrow": "Verlauf",
  "history.title": "Deine Trainingshistorie",
  "history.subtitle": "Jede Einheit bleibt als unveränderlicher Snapshot nachvollziehbar.",
  "history.sessions": "Einheiten",
  "history.workingSets": "Arbeitssätze",
  "history.exercises": "Übungen",
  "history.empty": "Noch keine Einheiten",
  "history.emptyHelp": "Nach deinem ersten abgeschlossenen Training erscheint hier der Verlauf.",
  "settings.eyebrow": "Mehr",
  "settings.title": "Einstellungen & Daten",
  "settings.subtitle": "Die App funktioniert ohne Konto und speichert lokal.",
  "settings.training": "Training",
  "settings.units": "Einheitensystem",
  "settings.unitsHelp": "Anzeige für externe Lasten",
  "settings.timer": "Pausentimer",
  "settings.timerHelp": "Je Übung aus dem Trainingsplan",
  "settings.data": "Daten",
  "settings.saved": "Einheiten lokal gespeichert",
  "settings.deviceOnly": "IndexedDB · nur auf diesem Gerät",
  "settings.safe": "Sicher",
  "settings.exportJson": "JSON exportieren",
  "settings.exportCsv": "CSV exportieren",
  "settings.delete": "Alle Trainingsdaten löschen",
  "settings.confirmDelete": "Wirklich alle lokalen Trainingsdaten löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
  "settings.about": "Über Kraftwerk",
  "settings.disclaimer": "Trainingshinweise ersetzen keine medizinische Beratung. Trainiere nur im schmerzfreien Bewegungsbereich.",
  "recommendation.none": "Noch keine Empfehlung",
  "recommendation.increase": "Zielbereich erreicht – Last beim nächsten Mal leicht erhöhen.",
  "recommendation.reduce": "Last halten oder leicht reduzieren und sauber im Zielbereich arbeiten.",
  "recommendation.hold": "Last halten und beim nächsten Mal eine Wiederholung ergänzen.",
} as const;

const en: Record<keyof typeof de, string> = {
  "language.label": "Language",
  "language.auto": "Auto",
  "language.german": "Deutsch",
  "language.english": "English",
  "brand.subtitle": "Full-body training",
  "nav.today": "Today",
  "nav.plan": "Plan",
  "nav.history": "History",
  "nav.more": "More",
  "nav.settings": "Settings",
  "nav.aria": "Main navigation",
  "status.local": "Stored locally",
  "status.loading": "Preparing your training data …",
  "status.offline": "Offline ready",
  "common.day": "Day",
  "common.of": "of",
  "common.set": "Set",
  "common.sets": "sets",
  "common.exercises": "exercises",
  "common.rest": "Rest",
  "common.skip": "Skip",
  "common.bodyweight": "Bodyweight",
  "common.close": "Close",
  "today.eyebrow": "Today",
  "today.title": "Ready for your next session?",
  "today.subtitle": "A clear plan, two strong sets, no unnecessary noise.",
  "today.start": "Start workout",
  "today.more": "+ more",
  "today.rotation": "Rotation",
  "today.week": "Your training week",
  "today.done": "Done",
  "today.next": "Up next",
  "today.last": "Last session",
  "today.nextGoal": "Your next target is ready.",
  "today.none": "No workouts yet",
  "today.noneHelp": "Start Day A to build your local training history.",
  "today.privacy": "Your workout data stays on this device by default.",
  "plan.eyebrow": "Training plan",
  "plan.title": "The A/B/C rotation",
  "plan.subtitle": "54 working sets, flexibly distributed across the week.",
  "plan.learn": "Understand the concept",
  "plan.pattern": "Movement pattern:",
  "plan.technique": "Technique:",
  "plan.equipment": "Equipment:",
  "plan.alternatives": "Alternatives:",
  "plan.edit": "Edit plan",
  "plan.doneEditing": "Done",
  "plan.editorHint": "Customize your master plan. Changes apply to all future sessions.",
  "plan.moveUp": "Move up",
  "plan.moveDown": "Move down",
  "plan.changePermanent": "Set alternative",
  "plan.remove": "Remove from this day",
  "plan.addExercise": "Add exercise",
  "plan.addTitle": "Add exercise slot",
  "plan.addHelp": "Choose another muscle group or movement slot for this training day.",
  "plan.chooseAlternative": "Master plan alternative",
  "plan.alternativeHelp": "This choice is saved for future sessions. During a workout you can still replace it for that day only.",
  "plan.baseExercise": "Default",
  "plan.configured": "Customized",
  "plan.resetDay": "Reset day",
  "plan.confirmReset": "Reset this training day to the original plan?",
  "plan.noExercisesAvailable": "Every available exercise slot is already included in this day.",
  "workout.pause": "Pause workout",
  "workout.exercise": "Exercise",
  "workout.finish": "Finish",
  "workout.finishEarly": "Finish early",
  "workout.imageAlt": "Muscle illustration for {exercise}",
  "workout.choose": "Choose another exercise",
  "workout.replace": "Replace exercise",
  "workout.target": "Target",
  "workout.repsShort": "reps",
  "workout.workingSets": "Working sets",
  "workout.sessionOnly": "This session only",
  "workout.removeSet": "Remove one working set",
  "workout.addSet": "Add one working set",
  "workout.lastTime": "Last time:",
  "workout.weight": "Weight",
  "workout.repetitions": "Repetitions",
  "workout.rirHelp": "Reps in reserve",
  "workout.completeSet": "Complete set",
  "workout.skipExercise": "Skip exercise",
  "workout.onlyToday": "For today only",
  "workout.freeOrder": "Free exercise order",
  "workout.freeTitle": "What is available now?",
  "workout.freeHelp": "Switch to an available exercise or add an extra set spontaneously. Your logged sets stay saved.",
  "workout.active": "Currently active",
  "workout.completed": "Completed",
  "workout.skipped": "Skipped",
  "workout.open": "Open",
  "workout.extraSet": "Extra set",
  "workout.now": "Now",
  "workout.sessionDone": "Session complete",
  "workout.logged": "sets logged",
  "workout.complete": "Complete workout",
  "history.eyebrow": "History",
  "history.title": "Your training history",
  "history.subtitle": "Every session remains available as an immutable snapshot.",
  "history.sessions": "Sessions",
  "history.workingSets": "Working sets",
  "history.exercises": "Exercises",
  "history.empty": "No sessions yet",
  "history.emptyHelp": "Your history appears here after your first completed workout.",
  "settings.eyebrow": "More",
  "settings.title": "Settings & data",
  "settings.subtitle": "The app works without an account and stores data locally.",
  "settings.training": "Training",
  "settings.units": "Unit system",
  "settings.unitsHelp": "Display for external loads",
  "settings.timer": "Rest timer",
  "settings.timerHelp": "Based on each exercise in the plan",
  "settings.data": "Data",
  "settings.saved": "sessions stored locally",
  "settings.deviceOnly": "IndexedDB · only on this device",
  "settings.safe": "Safe",
  "settings.exportJson": "Export JSON",
  "settings.exportCsv": "Export CSV",
  "settings.delete": "Delete all workout data",
  "settings.confirmDelete": "Delete all local workout data? This action cannot be undone.",
  "settings.about": "About Kraftwerk",
  "settings.disclaimer": "Training guidance is not medical advice. Only train through pain-free ranges of motion.",
  "recommendation.none": "No recommendation yet",
  "recommendation.increase": "Target range achieved — increase the load slightly next time.",
  "recommendation.reduce": "Keep or slightly reduce the load and stay within the target range with clean form.",
  "recommendation.hold": "Keep the load and add one repetition next time.",
};

export type TranslationKey = keyof typeof de;

const exerciseNames: Record<string, string> = {
  "pullups-pronated": "Pronated Pull-ups",
  "ez-bar-curls": "EZ-Bar Curls",
  "romanian-deadlifts": "Romanian Deadlifts",
  "dumbbell-shoulder-press": "Dumbbell Shoulder Press",
  "lateral-raises": "Lateral Raises",
  "standing-calf-raises": "Standing Calf Raises",
  "incline-dumbbell-press": "Incline Dumbbell Press",
  "barbell-overhead-press": "Barbell Overhead Press",
  "cable-triceps-pushdowns": "Cable Triceps Pushdowns",
  "barbell-bench-press": "Barbell Bench Press",
  "flat-dumbbell-bench-press": "Dumbbell Bench Press",
  "machine-chest-press": "Machine Chest Press",
  "weighted-pushups": "Weighted Push-ups",
  "standard-pushups": "Push-ups",
  "assisted-dips": "Assisted Dips",
  "incline-barbell-bench-press": "Incline Barbell Bench Press",
  "incline-machine-chest-press": "Incline Machine Chest Press",
  "lat-pulldown-pronated": "Pronated Lat Pulldown",
  "lat-pulldown-neutral": "Neutral-Grip Lat Pulldown",
  "assisted-pullups-machine": "Assisted Pull-up Machine",
  "band-assisted-pullups": "Band-Assisted Pull-ups",
  "machine-shoulder-press": "Machine Shoulder Press",
  "seated-cable-row": "Seated Cable Row",
  "one-arm-dumbbell-row": "One-Arm Dumbbell Row",
  "machine-row": "Machine Row",
  "leg-press": "Leg Press",
  "bodyweight-tempo-squats": "Bodyweight Tempo Squats",
  "dumbbell-rdls": "Dumbbell Romanian Deadlifts",
  "barbell-hip-thrusts": "Barbell Hip Thrusts",
  "machine-back-extensions": "Machine Back Extensions",
  "lying-leg-curls": "Lying Leg Curls",
  "cable-curls": "Cable Curls",
  "alternating-dumbbell-curls": "Alternating Dumbbell Curls",
  "incline-dumbbell-curls": "Incline Dumbbell Curls",
  "overhead-cable-triceps-extensions": "Overhead Cable Triceps Extensions",
  "close-grip-bench-press": "Close-Grip Bench Press",
  "captains-chair-knee-raises": "Captain's Chair Knee Raises",
  "lying-leg-raises": "Lying Leg Raises",
  "cable-lateral-raises": "Cable Lateral Raises",
  "machine-lateral-raises": "Machine Lateral Raises",
  "seated-calf-raises": "Seated Calf Raises",
  "leg-press-calf-raises": "Leg Press Calf Raises",
  "single-leg-calf-raises": "Single-Leg Calf Raises",
  "single-leg-press": "Single-Leg Press",
};

const cues: Record<string, string> = {
  "weighted-dips": "Keep your chest up and shoulder blades stable; use a pain-free range of motion.",
  "pullups-pronated": "Pull from an active hang without generating momentum from the hips.",
  "pike-pushups": "Keep the hips high and lower your head under control in front of your hands.",
  "seal-rows": "Keep your chest on the bench and pause briefly at the top.",
  "goblet-squats": "Track your knees over your toes and keep your torso upright.",
  "hyperextensions": "Extend through the hips without hyperextending your lower back at the top.",
  "ez-bar-curls": "Keep your elbows still and lower the weight under control.",
  "ring-triceps-extensions": "Keep your body in one line and scale difficulty through foot position.",
  "hanging-knee-raises": "Curl the pelvis actively and avoid swinging.",
  "front-squats": "Keep your elbows high, brace hard, and descend under control.",
  "romanian-deadlifts": "Push the hips far back and keep the bar close to your body.",
  "dumbbell-shoulder-press": "Keep your ribs down and press the dumbbells overhead under control.",
  "chinups": "Use a band or pulldown variation if needed to stay within the target range.",
  "inverted-rows": "Keep your body in one line and pull your chest toward the bar.",
  "ring-pushups": "Stabilize the rings and let your shoulder blades move under control.",
  "lateral-raises": "Use a light weight without momentum and raise in the plane of the shoulder.",
  "standing-calf-raises": "Use a full stretch at the bottom and squeeze clearly for one second at the top.",
  "ab-wheel-rollouts": "Squeeze your glutes and stop the range before your lower back arches.",
  "neutral-grip-pullups": "Set the shoulder blades first and drive the elbows downward.",
  "incline-dumbbell-press": "Keep the shoulder blades stable and lower the dumbbells under control.",
  "chest-supported-rows": "Pull toward the lower chest without momentum and pause briefly at the top.",
  "barbell-overhead-press": "Brace hard and keep the bar path close to your face.",
  "atg-split-squats": "Guide the front knee forward under control; master balance before adding load.",
  "good-mornings": "Train light, push the hips back, and keep a neutral spine.",
  "cable-triceps-pushdowns": "Fix the elbows and extend fully under control at the bottom.",
  "hammer-curls": "Use a neutral grip and keep the upper arms still beside your body.",
  "hanging-leg-raises": "Curl the pelvis at the top and lower without swinging.",
};

const muscles: Record<string, string> = {
  "Beinbeuger": "Hamstrings", "Bizeps": "Biceps", "Brust": "Chest", "Gesäß": "Glutes",
  "Hintere Schulter": "Rear delts", "Hüftbeuger": "Hip flexors", "Mittlerer Rücken": "Mid back",
  "Obere Brust": "Upper chest", "Quadrizeps": "Quadriceps", "Rücken": "Back", "Schulter": "Shoulders",
  "Seitliche Schulter": "Lateral delts", "Trapez": "Traps", "Trizeps": "Triceps", "Unterarm": "Forearms",
  "Unterer Rücken": "Lower back", "Vordere Schulter": "Front delts", "Waden": "Calves",
};

const equipment: Record<string, string> = {
  "Bank": "Bench", "Beinbeuger-Maschine": "Leg curl machine", "Beinpresse": "Leg press",
  "Belt-Squat-Maschine oder Gürtel": "Belt squat machine or belt", "Box oder Bank": "Box or bench",
  "Brustpresse": "Chest press", "Dip-Barren": "Dip bars", "Dip-Gürtel": "Dip belt",
  "Dip-Maschine oder Band": "Dip machine or band", "Gewicht": "Weight", "Gewicht oder Band": "Weight or band",
  "Gymnastikball": "Stability ball", "Hack-Squat-Maschine": "Hack squat machine", "Hyperextension-Bank": "Back extension bench",
  "Kabelzug": "Cable station", "Klimmzugmaschine": "Assisted pull-up machine", "Klimmzugstange": "Pull-up bar",
  "Klimmzugstange Neutralgriff": "Neutral-grip pull-up bar", "Kurzhantel": "Dumbbell", "Kurzhanteln": "Dumbbells",
  "Kurzhanteln optional": "Dumbbells optional", "Kurzhantel oder Kettlebell": "Dumbbell or kettlebell",
  "Kurzhanteln oder Kabel": "Dumbbells or cable", "Körpergewicht": "Bodyweight",
  "Körpergewicht oder Kurzhantel": "Bodyweight or dumbbell", "Körpergewicht oder Kurzhanteln": "Bodyweight or dumbbells",
  "Landmine": "Landmine", "Langhantel": "Barbell", "Latzug": "Lat pulldown", "Matte": "Mat",
  "Matte oder Bank": "Mat or bench", "Neutralgriff": "Neutral-grip handle", "Rack": "Rack", "Ringe": "Rings",
  "Rudermaschine": "Row machine", "Rudermaschine oder Bank und Kurzhanteln": "Row machine or bench and dumbbells",
  "Rückenstrecker-Maschine": "Back extension machine", "Schrägbank": "Incline bench",
  "Schrägbank-Brustpresse": "Incline chest press", "Schulterpresse": "Shoulder press", "Scottbank": "Preacher bench",
  "Seilgriff": "Rope attachment", "Seitheben-Maschine": "Lateral raise machine", "Slider oder Ringe": "Sliders or rings",
  "Stange oder Ringe": "Bar or rings", "Stütze": "Support", "T-Bar oder Landmine": "T-bar or landmine",
  "Wadenmaschine oder freie Last": "Calf machine or free weight", "Wadenmaschine sitzend": "Seated calf machine",
  "Wand optional": "Wall optional", "Widerstandsband": "Resistance band", "SZ-Stange": "EZ bar",
  "SZ-Stange oder Kurzhanteln": "EZ bar or dumbbells", "SZ-Stange oder Maschine": "EZ bar or machine",
};

const movementEnglish: Record<string, { category: string; label: string }> = {
  horizontal_press: { category: "Push", label: "Horizontal press" },
  vertical_press: { category: "Push", label: "Vertical press" },
  elbow_extension: { category: "Push", label: "Triceps isolation" },
  horizontal_pull: { category: "Pull", label: "Horizontal pull" },
  vertical_pull: { category: "Pull", label: "Vertical pull" },
  elbow_flexion: { category: "Pull", label: "Biceps isolation" },
  knee_dominant: { category: "Legs", label: "Knee dominant" },
  knee_dominant_unilateral: { category: "Legs", label: "Unilateral knee dominant" },
  hip_hinge: { category: "Legs", label: "Hip hinge" },
  hip_extension: { category: "Legs", label: "Hip extension" },
  knee_flexion: { category: "Legs", label: "Hamstring isolation" },
  plantar_flexion: { category: "Legs", label: "Calf isolation" },
  shoulder_abduction: { category: "Isolation", label: "Shoulder abduction" },
  core_flexion: { category: "Core", label: "Trunk flexion" },
  anti_extension: { category: "Core", label: "Anti-extension" },
};

const dayEnglish = {
  A: { name: "Push Focus", focus: "Upper body heavy · Lower body light" },
  B: { name: "Leg Focus", focus: "Lower body heavy · Upper body light" },
  C: { name: "Back Focus", focus: "Upper body heavy · Lower body light" },
} as const;

export function localeFromLanguages(languages: readonly string[]): Locale {
  for (const language of languages) {
    const normalized = language.toLowerCase();
    if (normalized.startsWith("de")) return "de";
    if (normalized.startsWith("en")) return "en";
  }
  return "en";
}

function browserLocale(): Locale {
  if (typeof navigator === "undefined") return "de";
  return localeFromLanguages(navigator.languages);
}

type I18nContextValue = {
  locale: Locale;
  preference: LanguagePreference;
  setPreference: (preference: LanguagePreference) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<LanguagePreference>("auto");
  const [automaticLocale, setAutomaticLocale] = useState<Locale>("de");

  useEffect(() => {
    const update = () => setAutomaticLocale(browserLocale());
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem("kraftwerk-language");
      if (stored === "de" || stored === "en" || stored === "auto") setPreferenceState(stored);
      update();
    });
    window.addEventListener("languagechange", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("languagechange", update);
    };
  }, []);

  const locale = preference === "auto" ? automaticLocale : preference;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setPreference = useCallback((next: LanguagePreference) => {
    window.localStorage.setItem("kraftwerk-language", next);
    setPreferenceState(next);
  }, []);

  const t = useCallback((key: TranslationKey, values?: Record<string, string | number>) => {
    let text = (locale === "de" ? de : en)[key];
    for (const [name, value] of Object.entries(values ?? {})) text = text.replaceAll(`{${name}}`, String(value));
    return text;
  }, [locale]);

  const value = useMemo(() => ({ locale, preference, setPreference, t }), [locale, preference, setPreference, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside LocaleProvider");
  return context;
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { preference, setPreference, t } = useI18n();
  return (
    <label className={`language-switcher ${compact ? "compact" : ""}`}>
      <Languages size={16} />
      {!compact && <span>{t("language.label")}</span>}
      <select aria-label={t("language.label")} value={preference} onChange={(event) => setPreference(event.target.value as LanguagePreference)}>
        <option value="auto">{t("language.auto")}</option>
        <option value="de">DE</option>
        <option value="en">EN</option>
      </select>
    </label>
  );
}

export function localizeDay(code: "A" | "B" | "C", fallback: { name: string; focus: string }, locale: Locale) {
  return locale === "en" ? dayEnglish[code] : fallback;
}

export function localizeExerciseName(id: string, fallback: string, locale: Locale) {
  return locale === "en" ? exerciseNames[id] ?? fallback : fallback;
}

export function localizeCue(id: string, fallback: string, locale: Locale) {
  return locale === "en" ? cues[id] ?? fallback : fallback;
}

export function localizeMuscles(values: string[], locale: Locale) {
  return locale === "en" ? values.map((value) => muscles[value] ?? value) : values;
}

export function localizeEquipment(values: string[], locale: Locale) {
  return locale === "en" ? values.map((value) => equipment[value] ?? value) : values;
}

export function localizeMovement(pattern: string | undefined, fallback: { category: string; label: string; tone: string }, locale: Locale) {
  const translated = locale === "en" ? movementEnglish[pattern ?? ""] : undefined;
  return translated ? { ...fallback, ...translated } : fallback;
}

export function localizeRecommendation(value: string, locale: Locale) {
  if (locale === "de") return value;
  const recommendationMap: Record<string, TranslationKey> = {
    "Noch keine Empfehlung": "recommendation.none",
    "Zielbereich erreicht – Last beim nächsten Mal leicht erhöhen.": "recommendation.increase",
    "Last halten oder leicht reduzieren und sauber im Zielbereich arbeiten.": "recommendation.reduce",
    "Last halten und beim nächsten Mal eine Wiederholung ergänzen.": "recommendation.hold",
  };
  const key = recommendationMap[value];
  return key ? en[key] : value;
}
