"use client";

import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Dumbbell,
  ExternalLink,
  History,
  Home,
  ListChecks,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Settings2,
  SkipForward,
  Sparkles,
  TimerReset,
  Trash2,
  Upload,
  X,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  activateSessionExercise,
  createSession,
  nextDayCode,
  recommendation,
  replaceSessionExercise,
  setExerciseTargetSets,
  type SessionExercise,
  type WorkoutSession,
} from "@/src/lib/domain";
import { createBackup, parseBackup } from "@/src/lib/backup";
import { deleteAllData, loadPlanConfiguration, loadSessions, replaceAllData, savePlanConfiguration, saveSession } from "@/src/lib/db";
import {
  LanguageSwitcher,
  localizeCue,
  localizeDay,
  localizeEquipment,
  localizeExerciseName,
  localizeMovement,
  localizeMuscles,
  localizeRecommendation,
  useI18n,
  type Locale,
} from "@/src/lib/i18n";
import { alternativesFor, imageUrl, movementMeta, movementPatternForExercise, trainingPlan, type DayCode } from "@/src/lib/schema";
import {
  addPlanSlot,
  availableBaseExercises,
  defaultPlanConfiguration,
  isCustomizedDay,
  movePlanSlot,
  removePlanSlot,
  replacePlanSlotExercise,
  resetPlanDay,
  resolvePlanDay,
  resolvePlanDays,
  type ConfiguredTrainingDay,
  type PlanConfiguration,
} from "@/src/lib/plan";

type View = "today" | "plan" | "history" | "more";

const dayColor: Record<DayCode, string> = { A: "var(--day-a)", B: "var(--day-b)", C: "var(--day-c)" };

function formatDate(value: string | undefined, locale: Locale) {
  if (!value) return "–";
  return new Intl.DateTimeFormat(locale === "de" ? "de-AT" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function sessionMovement(exercise: SessionExercise, locale: Locale) {
  const pattern = exercise.movementPattern ?? movementPatternForExercise(exercise.exerciseId);
  return localizeMovement(pattern, movementMeta(pattern), locale);
}

export function TrainingApp() {
  const { locale, t } = useI18n();
  const [view, setView] = useState<View>("today");
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [planConfiguration, setPlanConfiguration] = useState<PlanConfiguration>(defaultPlanConfiguration);
  const [ready, setReady] = useState(false);
  const [planDay, setPlanDay] = useState<DayCode>("A");

  const refresh = useCallback(async () => {
    const [storedSessions, storedPlan] = await Promise.all([loadSessions(), loadPlanConfiguration()]);
    setSessions(storedSessions);
    setPlanConfiguration(storedPlan);
    setReady(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    void Promise.all([loadSessions(), loadPlanConfiguration()]).then(([items, storedPlan]) => {
      if (mounted) {
        setSessions(items);
        setPlanConfiguration(storedPlan);
        setReady(true);
      }
    });
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      void navigator.serviceWorker.register("/sw.js");
    }
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    document.title = locale === "de" ? "Kraftwerk – Ganzkörpertraining" : "Kraftwerk – Full-Body Training";
  }, [locale]);

  const active = sessions.find((session) => session.status === "active");
  const nextCode = nextDayCode(sessions);
  const configuredDays = useMemo(() => resolvePlanDays(planConfiguration), [planConfiguration]);
  const nextDay = configuredDays.find((day) => day.code === nextCode)!;
  const completed = sessions.filter((session) => session.status === "completed");

  async function startTraining(code: DayCode) {
    const day = configuredDays.find((item) => item.code === code)!;
    const session = createSession(day);
    await saveSession(session);
    await refresh();
  }

  async function updatePlan(next: PlanConfiguration) {
    await savePlanConfiguration(next);
    setPlanConfiguration(next);
  }

  if (!ready) {
    return <div className="loading"><Dumbbell size={32} /> {t("status.loading")}</div>;
  }

  if (active) {
    return <WorkoutView session={active} sessions={sessions} onChange={refresh} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <Navigation view={view} onChange={setView} />
        <div className="sidebar-language"><LanguageSwitcher /></div>
        <div className="sidebar-foot"><CircleUserRound size={20} /> {t("status.local")}</div>
      </aside>

      <main className="main-content">
        {view === "today" && (
          <TodayView
            nextDay={nextDay}
            sessions={sessions}
            completed={completed}
            onStart={startTraining}
          />
        )}
        {view === "plan" && <PlanView selected={planDay} onSelect={setPlanDay} configuration={planConfiguration} onChange={updatePlan} />}
        {view === "history" && <HistoryView sessions={completed} />}
        {view === "more" && <MoreView sessions={sessions} planConfiguration={planConfiguration} onChange={refresh} />}
      </main>

      <nav className="mobile-nav" aria-label={t("nav.aria")}>
        <Navigation view={view} onChange={setView} mobile />
      </nav>
    </div>
  );
}

function Brand() {
  const { t } = useI18n();
  return (
    <div className="brand">
      <span className="brand-mark"><Dumbbell size={20} /></span>
      <span><strong>Kraftwerk</strong><small>{t("brand.subtitle")}</small></span>
    </div>
  );
}

function Navigation({ view, onChange, mobile = false }: { view: View; onChange: (view: View) => void; mobile?: boolean }) {
  const { t } = useI18n();
  const items: { id: View; label: string; icon: typeof Home }[] = [
    { id: "today", label: t("nav.today"), icon: Home },
    { id: "plan", label: t("nav.plan"), icon: BarChart3 },
    { id: "history", label: t("nav.history"), icon: History },
    { id: "more", label: mobile ? t("nav.more") : t("nav.settings"), icon: mobile ? MoreHorizontal : Settings2 },
  ];
  return (
    <div className={mobile ? "nav-items mobile" : "nav-items"}>
      {items.map((item) => {
        const Icon = item.icon;
        return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => onChange(item.id)}><Icon size={20} /><span>{item.label}</span></button>;
      })}
    </div>
  );
}

function TodayView({
  nextDay,
  sessions,
  completed,
  onStart,
}: {
  nextDay: ConfiguredTrainingDay;
  sessions: WorkoutSession[];
  completed: WorkoutSession[];
  onStart: (code: DayCode) => void;
}) {
  const { locale, t } = useI18n();
  const latest = completed[0];
  const localizedNextDay = localizeDay(nextDay.code, nextDay, locale);
  const thisWeek = completed.filter((session) => {
    const date = new Date(session.completedAt!);
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return date >= monday;
  });
  const completedDaysThisWeek = new Set(thisWeek.map((session) => session.dayCode)).size;

  return (
    <div className="page">
      <header className="page-header">
        <div><span className="eyebrow">{t("today.eyebrow")}</span><h1>{t("today.title")}</h1><p>{t("today.subtitle")}</p></div>
        <span className="offline-pill"><span /> {t("status.offline")}</span>
      </header>

      <section className="hero-card" style={{ "--accent": dayColor[nextDay.code] } as React.CSSProperties}>
        <div className="hero-copy">
          <span className="day-badge">{t("common.day").toUpperCase()} {nextDay.code}</span>
          <h2>{localizedNextDay.name}</h2>
          <p>{localizedNextDay.focus}</p>
          <div className="hero-meta">
            <span><Clock3 size={17} /> {trainingPlan.estimatedDurationMinutes.min}–{trainingPlan.estimatedDurationMinutes.max} Min.</span>
            <span><Dumbbell size={17} /> {nextDay.exercises.length} {t("common.exercises")} · {nextDay.exercises.reduce((sum, exercise) => sum + exercise.sets, 0)} {t("common.sets")}</span>
          </div>
          <button className="primary-button" onClick={() => onStart(nextDay.code)}><Play size={19} fill="currentColor" /> {t("today.start")}</button>
        </div>
        <div className="hero-visual"><span>{nextDay.code}</span><small>{localizeMuscles(nextDay.exercises[0].primaryMuscles, locale).join(" · ")} {t("today.more")}</small></div>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading"><div><span className="eyebrow">{t("today.rotation")}</span><h3>{t("today.week")}</h3></div><span>{completedDaysThisWeek} {t("common.of")} 3</span></div>
          <div className="rotation-row">
            {trainingPlan.days.map((day) => {
              const done = thisWeek.some((session) => session.dayCode === day.code);
              const localizedDay = localizeDay(day.code, day, locale);
              return (
                <div key={day.code} className={`rotation-day ${done ? "done" : day.code === nextDay.code ? "next" : ""}`}>
                  <span style={{ background: dayColor[day.code] }}>{done ? <Check size={18} /> : day.code}</span>
                  <div><strong>{t("common.day")} {day.code}</strong><small>{done ? t("today.done") : day.code === nextDay.code ? t("today.next") : localizedDay.name}</small></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel last-session">
          <span className="eyebrow">{t("today.last")}</span>
          {latest ? <><h3>{t("common.day")} {latest.dayCode} · {localizeDay(latest.dayCode, { name: latest.dayName, focus: latest.focus }, locale).name}</h3><p>{formatDate(latest.completedAt, locale)} · {latest.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} {t("common.sets")}</p><div className="quiet-success"><Sparkles size={18} /> {t("today.nextGoal")}</div></> : <><h3>{t("today.none")}</h3><p>{t("today.noneHelp")}</p></>}
        </section>
      </div>

      {sessions.length === 0 && <p className="privacy-note">{t("today.privacy")}</p>}
    </div>
  );
}

function PlanView({
  selected,
  onSelect,
  configuration,
  onChange,
}: {
  selected: DayCode;
  onSelect: (code: DayCode) => void;
  configuration: PlanConfiguration;
  onChange: (next: PlanConfiguration) => Promise<void>;
}) {
  const { locale, t } = useI18n();
  const day = resolvePlanDay(configuration, selected);
  const localizedDay = localizeDay(day.code, day, locale);
  const [openExercise, setOpenExercise] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [alternativeSlot, setAlternativeSlot] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const slots = configuration.days[selected];
  const selectedSlot = slots.find((slot) => slot.id === alternativeSlot);
  const baseExercises = trainingPlan.days.flatMap((item) => item.exercises);
  const baseExercise = selectedSlot ? baseExercises.find((exercise) => exercise.id === selectedSlot.baseExerciseId) : undefined;
  const addable = availableBaseExercises(configuration, selected);

  async function commit(next: PlanConfiguration) {
    await onChange(next);
  }

  async function resetDay() {
    if (!window.confirm(t("plan.confirmReset"))) return;
    await commit(resetPlanDay(configuration, selected));
  }

  return (
    <div className="page">
      <header className="page-header"><div><span className="eyebrow">{t("plan.eyebrow")}</span><h1>{t("plan.title")}</h1><p>{t("plan.subtitle")}</p></div><div className="page-header-actions"><Link href="/grundidee" className="learn-link"><Sparkles size={17} /> {t("plan.learn")}</Link><button className={`learn-link ${editing ? "active" : ""}`} onClick={() => setEditing((value) => !value)}><Pencil size={17} /> {editing ? t("plan.doneEditing") : t("plan.edit")}</button></div></header>
      <div className="day-tabs">
        {trainingPlan.days.map((item) => <button key={item.code} className={selected === item.code ? "active" : ""} onClick={() => onSelect(item.code)} style={{ "--accent": dayColor[item.code] } as React.CSSProperties}><span>{t("common.day")} {item.code}</span><small>{localizeDay(item.code, item, locale).name}</small></button>)}
      </div>
      {editing && <div className="plan-editor-toolbar"><p><Pencil size={17} /> {t("plan.editorHint")}</p>{isCustomizedDay(configuration, selected) && <button onClick={resetDay}><RefreshCw size={16} /> {t("plan.resetDay")}</button>}</div>}
      <section className="plan-header" style={{ "--accent": dayColor[selected] } as React.CSSProperties}><span className="day-badge">{t("common.day").toUpperCase()} {selected}</span><div><h2>{localizedDay.name}</h2><p>{localizedDay.focus}</p></div><strong>{day.exercises.length} {t("common.exercises")}</strong></section>
      <div className="exercise-list">
        {day.exercises.map((exercise, index) => {
          const slot = slots[index];
          const movement = localizeMovement(exercise.movementPattern, movementMeta(exercise.movementPattern), locale);
          const name = localizeExerciseName(exercise.id, exercise.name, locale);
          return <article className={`exercise-row ${editing ? "editing" : ""}`} key={slot?.id ?? exercise.id}>
            <span className="exercise-number">{exercise.order}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(exercise.image)} alt="" />
            <button className="exercise-main" onClick={() => setOpenExercise(openExercise === (slot?.id ?? exercise.id) ? null : (slot?.id ?? exercise.id))}>
              <span><strong>{name} {slot && slot.exerciseId !== slot.baseExerciseId && <small className="configured-pill">{t("plan.configured")}</small>}</strong><small className="exercise-meta-line">{localizeMuscles(exercise.primaryMuscles, locale).join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category}</span></small></span>
              <span className="exercise-target"><strong>{exercise.sets} × {exercise.repRange.min}–{exercise.repRange.max}</strong><small>{exercise.restSeconds}s {t("common.rest")}</small></span>
              <ChevronRight size={19} />
            </button>
            {editing && slot && <div className="plan-editor-actions"><button aria-label={t("plan.moveUp")} title={t("plan.moveUp")} disabled={index === 0} onClick={() => void commit(movePlanSlot(configuration, selected, slot.id, -1))}><ArrowUp size={17} /></button><button aria-label={t("plan.moveDown")} title={t("plan.moveDown")} disabled={index === slots.length - 1} onClick={() => void commit(movePlanSlot(configuration, selected, slot.id, 1))}><ArrowDown size={17} /></button><button className="editor-action-wide" onClick={() => setAlternativeSlot(slot.id)}><RefreshCw size={16} /> {t("plan.changePermanent")}</button><button className="editor-remove" aria-label={t("plan.remove")} title={t("plan.remove")} disabled={slots.length <= 1} onClick={() => void commit(removePlanSlot(configuration, selected, slot.id))}><Trash2 size={17} /></button></div>}
            {openExercise === (slot?.id ?? exercise.id) && <div className="exercise-detail"><p><strong>{t("plan.pattern")}</strong> {movement.label} · {movement.category}</p><p><strong>{t("plan.technique")}</strong> {localizeCue(exercise.baseExerciseId, exercise.techniqueCue, locale)}</p><p><strong>{t("plan.equipment")}</strong> {localizeEquipment(exercise.equipment, locale).join(", ")}</p><p><strong>{t("plan.alternatives")}</strong> {alternativesFor(exercise.baseExerciseId).map((item) => localizeExerciseName(item.id, item.name, locale)).join(", ")}</p></div>}
          </article>
        })}
        {editing && <button className="add-exercise-button" onClick={() => setShowAdd(true)}><Plus size={19} /> {t("plan.addExercise")}</button>}
      </div>

      {selectedSlot && baseExercise && <div className="modal-backdrop" onClick={() => setAlternativeSlot(null)}><section className="modal" onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{t("plan.chooseAlternative")}</span><h2>{localizeMuscles(baseExercise.primaryMuscles, locale).join(" · ")}</h2><p>{t("plan.alternativeHelp")}</p></div><button className="icon-button" aria-label={t("common.close")} onClick={() => setAlternativeSlot(null)}><X /></button></header><div className="alternative-list master-alternatives">{[baseExercise, ...alternativesFor(baseExercise.id)].map((item) => { const movement = localizeMovement(item.movementPattern, movementMeta(item.movementPattern), locale); const active = selectedSlot.exerciseId === item.id; return <button key={item.id} className={active ? "selected" : ""} onClick={async () => { await commit(replacePlanSlotExercise(configuration, selected, selectedSlot.id, item.id)); setAlternativeSlot(null); }}><span><strong>{localizeExerciseName(item.id, item.name, locale)} {item.id === baseExercise.id && <small className="configured-pill">{t("plan.baseExercise")}</small>}</strong><small className="exercise-meta-line">{localizeEquipment(item.equipment, locale).join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category}</span></small></span>{active ? <Check /> : <ChevronRight />}</button>; })}</div></section></div>}

      {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><section className="modal exercise-picker" onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{t("plan.addExercise")}</span><h2>{t("plan.addTitle")}</h2><p>{t("plan.addHelp")}</p></div><button className="icon-button" aria-label={t("common.close")} onClick={() => setShowAdd(false)}><X /></button></header>{addable.length ? <div className="exercise-queue add-slot-list">{addable.map((exercise) => { const movement = localizeMovement(exercise.movementPattern, movementMeta(exercise.movementPattern), locale); return <button key={exercise.id} onClick={async () => { await commit(addPlanSlot(configuration, selected, exercise.id, crypto.randomUUID())); setShowAdd(false); }}><span className="queue-copy"><strong>{localizeExerciseName(exercise.id, exercise.name, locale)}</strong><span className="queue-muscles">{localizeMuscles(exercise.primaryMuscles, locale).join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category} · {movement.label}</span></span><small>{exercise.sets} × {exercise.repRange.min}–{exercise.repRange.max} · {localizeEquipment(exercise.equipment, locale).join(" · ")}</small></span><span className="queue-action"><Plus size={17} /></span></button>; })}</div> : <div className="empty-state"><Check size={32} /><p>{t("plan.noExercisesAvailable")}</p></div>}</section></div>}
    </div>
  );
}

function WorkoutView({ session, sessions, onChange }: { session: WorkoutSession; sessions: WorkoutSession[]; onChange: () => Promise<void> }) {
  const { locale, t } = useI18n();
  const currentIndex = Math.max(0, session.exercises.findIndex((exercise) => exercise.status === "active"));
  const exercise = session.exercises[currentIndex];
  const exerciseName = localizeExerciseName(exercise.exerciseId, exercise.name, locale);
  const localizedDay = localizeDay(session.dayCode, { name: session.dayName, focus: session.focus }, locale);
  const [load, setLoad] = useState(0);
  const [reps, setReps] = useState(exercise.repMin);
  const [rir, setRir] = useState<number | null>(2);
  const [timerEnd, setTimerEnd] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  useEffect(() => {
    if (!timerEnd) return;
    const tick = () => {
      const value = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
      setRemaining(value);
      if (value === 0) setTimerEnd(null);
    };
    tick();
    const interval = window.setInterval(tick, 500);
    return () => window.clearInterval(interval);
  }, [timerEnd]);

  const completedSets = session.exercises.reduce((sum, item) => sum + item.sets.length, 0);
  const totalSets = session.exercises.reduce((sum, item) => sum + item.targetSets, 0);
  const currentMovement = sessionMovement(exercise, locale);
  const previous = sessions
    .filter((item) => item.status === "completed")
    .flatMap((item) => item.exercises)
    .find((item) => item.exerciseId === exercise.exerciseId && item.sets.length);

  async function update(next: WorkoutSession) {
    await saveSession(next);
    await onChange();
  }

  async function completeSet() {
    const next = structuredClone(session);
    const target = next.exercises[currentIndex];
    target.sets.push({ id: crypto.randomUUID(), setNumber: target.sets.length + 1, load: load || null, reps, rir, completedAt: new Date().toISOString() });
    setTimerEnd(Date.now() + target.restSeconds * 1000);
    if (target.sets.length >= target.targetSets) {
      target.status = "completed";
      const nextExercise = next.exercises.find((item) => item.status === "pending");
      if (nextExercise) {
        nextExercise.status = "active";
        setReps(nextExercise.repMin);
        setLoad(0);
        setRir(2);
      }
    }
    await update(next);
  }

  async function skipExercise() {
    const next = structuredClone(session);
    next.exercises[currentIndex].status = "skipped";
    const nextExercise = next.exercises.find((item) => item.status === "pending");
    if (nextExercise) {
      nextExercise.status = "active";
      setReps(nextExercise.repMin);
      setLoad(0);
      setRir(2);
    }
    await update(next);
  }

  async function finish() {
    const next = structuredClone(session);
    next.status = "completed";
    next.completedAt = new Date().toISOString();
    next.exercises.forEach((item) => { if (item.status === "active" || item.status === "pending") item.status = "skipped"; });
    await update(next);
  }

  async function replace(id: string, name: string) {
    const next = structuredClone(session);
    next.exercises[currentIndex] = {
      ...replaceSessionExercise(next.exercises[currentIndex], { id, name }),
      movementPattern: movementPatternForExercise(id),
    };
    setLoad(0);
    setReps(next.exercises[currentIndex].repMin);
    setRir(2);
    await update(next);
    setShowAlternatives(false);
  }

  async function chooseExercise(id: string) {
    const chosen = session.exercises.find((item) => item.id === id);
    if (!chosen) return;
    const prepared = chosen.status === "completed"
      ? setExerciseTargetSets(session, id, Math.max(chosen.targetSets + 1, chosen.sets.length + 1))
      : session;
    const next = activateSessionExercise(prepared, id);
    const selected = next.exercises.find((item) => item.id === id);
    if (!selected) return;
    const lastSet = selected.sets.at(-1);
    setLoad(lastSet?.load ?? 0);
    setReps(lastSet?.reps ?? selected.repMin);
    setRir(lastSet?.rir ?? 2);
    await update(next);
    setShowExercisePicker(false);
  }

  async function adjustTargetSets(delta: number) {
    const next = setExerciseTargetSets(session, exercise.id, exercise.targetSets + delta);
    const nextActive = next.exercises.find((item) => item.status === "active");
    if (nextActive && nextActive.id !== exercise.id) {
      const lastSet = nextActive.sets.at(-1);
      setLoad(lastSet?.load ?? 0);
      setReps(lastSet?.reps ?? nextActive.repMin);
      setRir(lastSet?.rir ?? 2);
    }
    await update(next);
  }

  const allHandled = session.exercises.every((item) => item.status === "completed" || item.status === "skipped");
  return (
    <div className="workout-shell">
      <header className="workout-header">
        <div className="workout-header-tools"><button className="icon-button" onClick={() => void onChange()} aria-label={t("workout.pause")}><Pause size={20} /></button><LanguageSwitcher compact /></div>
        <button className="workout-progress-button" onClick={() => setShowExercisePicker(true)}><span>{t("common.day").toUpperCase()} {session.dayCode} · {localizedDay.name}</span><strong><ListChecks size={15} /> {t("workout.exercise")} {currentIndex + 1} {t("common.of")} {session.exercises.length}</strong></button>
        <button className="finish-link" onClick={finish}>{allHandled ? t("workout.finish") : t("workout.finishEarly")}</button>
      </header>
      <div className="progress-track"><span style={{ width: `${(completedSets / totalSets) * 100}%` }} /></div>

      <main className="workout-main">
        <section className="workout-exercise">
          <div className="workout-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(exercise.image)} alt={t("workout.imageAlt", { exercise: exerciseName })} />
            <span>{t("common.set").toUpperCase()} {Math.min(exercise.sets.length + 1, exercise.targetSets)} / {exercise.targetSets}</span>
          </div>
          <div className="active-exercise-meta"><span>{localizeMuscles(exercise.primaryMuscles, locale).join(" · ")}</span><span className={`movement-chip ${currentMovement.tone}`}>{currentMovement.category} · {currentMovement.label}</span></div>
          <h1>{exerciseName}</h1>
          <p className="cue">{localizeCue(exercise.originalExerciseId ?? exercise.exerciseId, exercise.techniqueCue, locale)}</p>
          <div className="workout-secondary-actions"><button className="text-button" onClick={() => setShowExercisePicker(true)}><ListChecks size={16} /> {t("workout.choose")}</button><button className="text-button" onClick={() => setShowAlternatives(true)}><RefreshCw size={16} /> {t("workout.replace")}</button></div>
        </section>

        <section className="set-entry">
          <div className="target-box"><span>{t("workout.target")}</span><strong>{exercise.repMin}–{exercise.repMax} {t("workout.repsShort")}</strong><small>RIR {exercise.targetRirMin}–{exercise.targetRirMax}</small></div>
          <div className="session-set-control"><span><strong>{t("workout.workingSets")}</strong><small>{t("workout.sessionOnly")}</small></span><div className="set-stepper"><button aria-label={t("workout.removeSet")} disabled={exercise.targetSets <= Math.max(1, exercise.sets.length)} onClick={() => adjustTargetSets(-1)}>−</button><strong>{exercise.targetSets}</strong><button aria-label={t("workout.addSet")} onClick={() => adjustTargetSets(1)}>+</button></div></div>
          {previous && <p className="previous">{t("workout.lastTime")} {previous.sets.map((set) => `${set.load ?? "KG"} × ${set.reps}`).join(" · ")}</p>}
          <div className="number-fields">
            <NumberField label={t("workout.weight")} value={load} suffix="kg" min={0} step={2.5} onChange={setLoad} />
            <NumberField label={t("workout.repetitions")} value={reps} suffix={t("workout.repsShort")} min={0} step={1} onChange={setReps} />
          </div>
          <div className="rir-entry"><span>RIR <small>{t("workout.rirHelp")}</small></span><div>{[0, 1, 2, 3, 4].map((value) => <button key={value} className={rir === value ? "active" : ""} onClick={() => setRir(value)}>{value}{value === 4 ? "+" : ""}</button>)}</div></div>
          <button className="primary-button wide" onClick={completeSet}><Check size={20} /> {t("workout.completeSet")}</button>
          <button className="skip-button" onClick={skipExercise}><SkipForward size={17} /> {t("workout.skipExercise")}</button>
          {exercise.sets.length > 0 && <div className="logged-sets">{exercise.sets.map((set) => <span key={set.id}><Check size={15} /> {t("common.set")} {set.setNumber}: {set.load ? `${set.load} kg` : t("common.bodyweight")} × {set.reps}, RIR {set.rir ?? "–"}</span>)}</div>}
        </section>
      </main>

      {timerEnd && <div className="timer-bar"><TimerReset size={22} /><div><span>{t("common.rest")}</span><strong>{formatDuration(remaining)}</strong></div><button onClick={() => setTimerEnd((value) => (value ?? Date.now()) + 15_000)}>+15s</button><button onClick={() => setTimerEnd(null)}>{t("common.skip")}</button></div>}

      {showAlternatives && <div className="modal-backdrop" onClick={() => setShowAlternatives(false)}><section className="modal" onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{t("workout.onlyToday")}</span><h2>{t("workout.replace")}</h2></div><button className="icon-button" onClick={() => setShowAlternatives(false)}><X /></button></header><div className="alternative-list">{alternativesFor(exercise.originalExerciseId ?? exercise.exerciseId).map((item) => { const movement = localizeMovement(item.movementPattern, movementMeta(item.movementPattern), locale); return <button key={item.id} onClick={() => replace(item.id, item.name)}><span><strong>{localizeExerciseName(item.id, item.name, locale)}</strong><small className="exercise-meta-line">{localizeEquipment(item.equipment, locale).join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category}</span></small></span><ChevronRight /></button>; })}</div></section></div>}

      {showExercisePicker && <div className="modal-backdrop" onClick={() => setShowExercisePicker(false)}><section className="modal exercise-picker" onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{t("workout.freeOrder")}</span><h2>{t("workout.freeTitle")}</h2><p>{t("workout.freeHelp")}</p></div><button className="icon-button" onClick={() => setShowExercisePicker(false)}><X /></button></header><div className="exercise-queue">{session.exercises.map((item, index) => { const isCurrent = item.id === exercise.id; const isDone = item.status === "completed"; const movement = sessionMovement(item, locale); return <button key={item.id} disabled={isCurrent} className={`${isCurrent ? "current" : ""} ${isDone ? "done" : ""}`} onClick={() => chooseExercise(item.id)}><span className="queue-number">{isDone ? <Check size={16} /> : index + 1}</span><span className="queue-copy"><strong>{localizeExerciseName(item.exerciseId, item.name, locale)}</strong><span className="queue-muscles">{localizeMuscles(item.primaryMuscles, locale).join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category} · {movement.label}</span></span><small>{item.sets.length} {t("common.of")} {item.targetSets} {t("common.sets")} · {isCurrent ? t("workout.active") : isDone ? t("workout.completed") : item.status === "skipped" ? t("workout.skipped") : t("workout.open")}</small></span>{!isCurrent && <span className="queue-action">{isDone ? t("workout.extraSet") : t("workout.now")} <ChevronRight size={16} /></span>}</button>; })}</div></section></div>}

      {allHandled && <div className="completion-dock"><div><Sparkles /><span><strong>{t("workout.sessionDone")}</strong><small>{completedSets} {t("workout.logged")}</small></span></div><button className="primary-button" onClick={finish}>{t("workout.complete")}</button></div>}
    </div>
  );
}

function NumberField({ label, value, suffix, min, step, onChange }: { label: string; value: number; suffix: string; min: number; step: number; onChange: (value: number) => void }) {
  return <label className="number-field"><span>{label}</span><div><button onClick={() => onChange(Math.max(min, value - step))}>−</button><input inputMode="decimal" type="number" min={min} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /><small>{suffix}</small><button onClick={() => onChange(value + step)}>+</button></div></label>;
}

function HistoryView({ sessions }: { sessions: WorkoutSession[] }) {
  const { locale, t } = useI18n();
  const [selected, setSelected] = useState<string | null>(null);
  const detail = sessions.find((session) => session.id === selected);
  const totalSets = sessions.reduce((sum, session) => sum + session.exercises.reduce((inner, exercise) => inner + exercise.sets.length, 0), 0);
  return (
    <div className="page">
      <header className="page-header"><div><span className="eyebrow">{t("history.eyebrow")}</span><h1>{t("history.title")}</h1><p>{t("history.subtitle")}</p></div></header>
      <div className="stat-row"><div><strong>{sessions.length}</strong><span>{t("history.sessions")}</span></div><div><strong>{totalSets}</strong><span>{t("history.workingSets")}</span></div><div><strong>{new Set(sessions.flatMap((s) => s.exercises.filter((e) => e.sets.length).map((e) => e.exerciseId))).size}</strong><span>{t("history.exercises")}</span></div></div>
      {sessions.length === 0 ? <div className="empty-state"><History size={38} /><h2>{t("history.empty")}</h2><p>{t("history.emptyHelp")}</p></div> : <div className="history-layout"><div className="session-list">{sessions.map((session) => <button key={session.id} onClick={() => setSelected(session.id)} className={selected === session.id ? "active" : ""}><span className="session-code" style={{ background: dayColor[session.dayCode] }}>{session.dayCode}</span><span><strong>{localizeDay(session.dayCode, { name: session.dayName, focus: session.focus }, locale).name}</strong><small>{formatDate(session.completedAt, locale)} · {session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} {t("common.sets")}</small></span><ChevronRight /></button>)}</div>{detail && <section className="session-detail"><span className="eyebrow">{t("common.day")} {detail.dayCode}</span><h2>{localizeDay(detail.dayCode, { name: detail.dayName, focus: detail.focus }, locale).name}</h2>{detail.exercises.filter((ex) => ex.sets.length).map((exercise) => { const movement = sessionMovement(exercise, locale); return <div key={exercise.id}><strong>{localizeExerciseName(exercise.exerciseId, exercise.name, locale)}</strong><span className="history-exercise-meta">{localizeMuscles(exercise.primaryMuscles, locale).join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category}</span></span><span>{exercise.sets.map((set) => `${set.load ?? "KG"} × ${set.reps} @ ${set.rir ?? "–"}`).join(" · ")}</span><small>{localizeRecommendation(recommendation(exercise), locale)}</small></div>; })}</section>}</div>}
    </div>
  );
}

function MoreView({ sessions, planConfiguration, onChange }: { sessions: WorkoutSession[]; planConfiguration: PlanConfiguration; onChange: () => Promise<void> }) {
  const { preference, setPreference, t } = useI18n();
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const completedCount = useMemo(() => sessions.filter((session) => session.status === "completed").length, [sessions]);

  function download(name: string, type: string, content: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const rows = ["session_id,tag,datum,uebung,satz,gewicht,wiederholungen,rir"];
    for (const session of sessions) for (const exercise of session.exercises) for (const set of exercise.sets) rows.push([session.id, session.dayCode, session.completedAt ?? session.startedAt, `"${exercise.name}"`, set.setNumber, set.load ?? "", set.reps, set.rir ?? ""].join(","));
    download("kraftwerk-training.csv", "text/csv;charset=utf-8", rows.join("\n"));
  }

  async function importJson(file: File | undefined) {
    if (!file) return;
    setImportStatus("idle");
    try {
      const backup = parseBackup(JSON.parse(await file.text()));
      if (!window.confirm(t("settings.confirmImport"))) return;
      await replaceAllData(backup.sessions, backup.planConfiguration);
      setUnit(backup.preferences.unit);
      setPreference(backup.preferences.language);
      await onChange();
      setImportStatus("success");
    } catch {
      setImportStatus("error");
    }
  }

  async function clearData() {
    if (!window.confirm(t("settings.confirmDelete"))) return;
    await deleteAllData();
    await onChange();
  }

  return (
    <div className="page settings-page">
      <header className="page-header"><div><span className="eyebrow">{t("settings.eyebrow")}</span><h1>{t("settings.title")}</h1><p>{t("settings.subtitle")}</p></div></header>
      <section className="settings-section"><h2>{t("settings.training")}</h2><div className="setting-row language-setting"><span><strong>{t("language.label")}</strong><small>{t("language.auto")}, DE, EN</small></span><LanguageSwitcher /></div><div className="setting-row"><span><strong>{t("settings.units")}</strong><small>{t("settings.unitsHelp")}</small></span><div className="segmented"><button className={unit === "kg" ? "active" : ""} onClick={() => setUnit("kg")}>kg</button><button className={unit === "lb" ? "active" : ""} onClick={() => setUnit("lb")}>lb</button></div></div><div className="setting-row"><span><strong>{t("settings.timer")}</strong><small>{t("settings.timerHelp")}</small></span><span>75–180 s</span></div></section>
      <section className="settings-section"><h2>{t("settings.source")}</h2><a className="settings-source-card" href="https://www.youtube.com/watch?v=I7UtSo0NTaA" target="_blank" rel="noreferrer"><span className="settings-source-icon"><Youtube size={25} /></span><span><strong>„MEHR MUSKELN in WENIGER ZEIT (kompletter Trainingsplan)“</strong><small>{t("settings.sourceDescription")}</small></span><span className="settings-source-action">{t("settings.sourceLink")} <ExternalLink size={16} /></span></a></section>
      <section className="settings-section"><h2>{t("settings.data")}</h2><div className="data-card"><div><strong>{completedCount} {t("settings.saved")}</strong><small>{t("settings.deviceOnly")}</small></div><span className="offline-pill"><span /> {t("settings.safe")}</span></div><p className="import-help">{t("settings.importHelp")}</p><div className="button-row"><button onClick={() => download("kraftwerk-training.json", "application/json", JSON.stringify(createBackup(sessions, planConfiguration, { language: preference, unit }), null, 2))}>{t("settings.exportJson")}</button><label className="import-button"><Upload size={17} /> {t("settings.importJson")}<input type="file" accept="application/json,.json" onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; void importJson(file); }} /></label><button onClick={exportCsv}>{t("settings.exportCsv")}</button></div>{importStatus !== "idle" && <p className={`import-status ${importStatus}`} role="status">{t(importStatus === "success" ? "settings.importSuccess" : "settings.importError")}</p>}<button className="danger-button" onClick={clearData}><Trash2 size={17} /> {t("settings.delete")}</button></section>
      <section className="settings-section about"><h2>{t("settings.about")}</h2><p>Version 0.1.0 · Local-first PWA</p><p>{t("settings.disclaimer")}</p></section>
    </div>
  );
}
