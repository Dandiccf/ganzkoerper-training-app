"use client";

import {
  BarChart3,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Dumbbell,
  History,
  Home,
  ListChecks,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Settings2,
  SkipForward,
  Sparkles,
  TimerReset,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  activateSessionExercise,
  createSession,
  nextDayCode,
  recommendation,
  replaceSessionExercise,
  type SessionExercise,
  type WorkoutSession,
} from "@/src/lib/domain";
import { deleteAllData, loadSessions, saveSession } from "@/src/lib/db";
import { alternativesFor, imageUrl, movementMeta, movementPatternForExercise, trainingPlan, type DayCode } from "@/src/lib/schema";

type View = "today" | "plan" | "history" | "more";

const dayColor: Record<DayCode, string> = { A: "var(--day-a)", B: "var(--day-b)", C: "var(--day-c)" };

function formatDate(value?: string) {
  if (!value) return "–";
  return new Intl.DateTimeFormat("de-AT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function sessionMovement(exercise: SessionExercise) {
  return movementMeta(exercise.movementPattern ?? movementPatternForExercise(exercise.exerciseId));
}

export function TrainingApp() {
  const [view, setView] = useState<View>("today");
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [ready, setReady] = useState(false);
  const [planDay, setPlanDay] = useState<DayCode>("A");

  const refresh = useCallback(async () => {
    setSessions(await loadSessions());
    setReady(true);
  }, []);

  useEffect(() => {
    let mounted = true;
    void loadSessions().then((items) => {
      if (mounted) {
        setSessions(items);
        setReady(true);
      }
    });
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      void navigator.serviceWorker.register("/sw.js");
    }
    return () => { mounted = false; };
  }, []);

  const active = sessions.find((session) => session.status === "active");
  const nextCode = nextDayCode(sessions);
  const nextDay = trainingPlan.days.find((day) => day.code === nextCode)!;
  const completed = sessions.filter((session) => session.status === "completed");

  async function startTraining(code: DayCode) {
    const day = trainingPlan.days.find((item) => item.code === code)!;
    const session = createSession(day);
    await saveSession(session);
    await refresh();
  }

  if (!ready) {
    return <div className="loading"><Dumbbell size={32} /> Trainingsdaten werden vorbereitet …</div>;
  }

  if (active) {
    return <WorkoutView session={active} sessions={sessions} onChange={refresh} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <Navigation view={view} onChange={setView} />
        <div className="sidebar-foot"><CircleUserRound size={20} /> Lokal gespeichert</div>
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
        {view === "plan" && <PlanView selected={planDay} onSelect={setPlanDay} />}
        {view === "history" && <HistoryView sessions={completed} />}
        {view === "more" && <MoreView sessions={sessions} onChange={refresh} />}
      </main>

      <nav className="mobile-nav" aria-label="Hauptnavigation">
        <Navigation view={view} onChange={setView} mobile />
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark"><Dumbbell size={20} /></span>
      <span><strong>Kraftwerk</strong><small>Ganzkörpertraining</small></span>
    </div>
  );
}

function Navigation({ view, onChange, mobile = false }: { view: View; onChange: (view: View) => void; mobile?: boolean }) {
  const items: { id: View; label: string; icon: typeof Home }[] = [
    { id: "today", label: "Heute", icon: Home },
    { id: "plan", label: "Plan", icon: BarChart3 },
    { id: "history", label: "Verlauf", icon: History },
    { id: "more", label: mobile ? "Mehr" : "Einstellungen", icon: mobile ? MoreHorizontal : Settings2 },
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
  nextDay: (typeof trainingPlan.days)[number];
  sessions: WorkoutSession[];
  completed: WorkoutSession[];
  onStart: (code: DayCode) => void;
}) {
  const latest = completed[0];
  const thisWeek = completed.filter((session) => {
    const date = new Date(session.completedAt!);
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    return date >= monday;
  });

  return (
    <div className="page">
      <header className="page-header">
        <div><span className="eyebrow">Heute</span><h1>Bereit für die nächste Einheit?</h1><p>Ein klarer Plan, zwei starke Sätze, kein unnötiger Lärm.</p></div>
        <span className="offline-pill"><span /> Offline bereit</span>
      </header>

      <section className="hero-card" style={{ "--accent": dayColor[nextDay.code] } as React.CSSProperties}>
        <div className="hero-copy">
          <span className="day-badge">TAG {nextDay.code}</span>
          <h2>{nextDay.name}</h2>
          <p>{nextDay.focus}</p>
          <div className="hero-meta">
            <span><Clock3 size={17} /> {trainingPlan.estimatedDurationMinutes.min}–{trainingPlan.estimatedDurationMinutes.max} Min.</span>
            <span><Dumbbell size={17} /> {nextDay.exercises.length} Übungen · 18 Sätze</span>
          </div>
          <button className="primary-button" onClick={() => onStart(nextDay.code)}><Play size={19} fill="currentColor" /> Training starten</button>
        </div>
        <div className="hero-visual"><span>{nextDay.code}</span><small>{nextDay.exercises[0].primaryMuscles.join(" · ")} + mehr</small></div>
      </section>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="section-heading"><div><span className="eyebrow">Rotation</span><h3>Deine Trainingswoche</h3></div><span>{thisWeek.length} von 3</span></div>
          <div className="rotation-row">
            {trainingPlan.days.map((day) => {
              const done = thisWeek.some((session) => session.dayCode === day.code);
              return (
                <div key={day.code} className={`rotation-day ${done ? "done" : day.code === nextDay.code ? "next" : ""}`}>
                  <span style={{ background: dayColor[day.code] }}>{done ? <Check size={18} /> : day.code}</span>
                  <div><strong>Tag {day.code}</strong><small>{done ? "Erledigt" : day.code === nextDay.code ? "Als Nächstes" : day.name}</small></div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel last-session">
          <span className="eyebrow">Letzte Einheit</span>
          {latest ? <><h3>Tag {latest.dayCode} · {latest.dayName}</h3><p>{formatDate(latest.completedAt)} · {latest.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} Sätze</p><div className="quiet-success"><Sparkles size={18} /> Nächstes Ziel wurde vorbereitet.</div></> : <><h3>Noch kein Training</h3><p>Starte Tag A, um deine lokale Historie aufzubauen.</p></>}
        </section>
      </div>

      {sessions.length === 0 && <p className="privacy-note">Deine Trainingsdaten bleiben standardmäßig ausschließlich auf diesem Gerät.</p>}
    </div>
  );
}

function PlanView({ selected, onSelect }: { selected: DayCode; onSelect: (code: DayCode) => void }) {
  const day = trainingPlan.days.find((item) => item.code === selected)!;
  const [openExercise, setOpenExercise] = useState<string | null>(null);
  return (
    <div className="page">
      <header className="page-header"><div><span className="eyebrow">Trainingsplan</span><h1>Die A/B/C-Rotation</h1><p>54 Arbeitssätze, flexibel über die Woche verteilt.</p></div><Link href="/grundidee" className="learn-link"><Sparkles size={17} /> Grundidee verstehen</Link></header>
      <div className="day-tabs">
        {trainingPlan.days.map((item) => <button key={item.code} className={selected === item.code ? "active" : ""} onClick={() => onSelect(item.code)} style={{ "--accent": dayColor[item.code] } as React.CSSProperties}><span>Tag {item.code}</span><small>{item.name}</small></button>)}
      </div>
      <section className="plan-header" style={{ "--accent": dayColor[selected] } as React.CSSProperties}><span className="day-badge">TAG {selected}</span><div><h2>{day.name}</h2><p>{day.focus}</p></div><strong>{day.exercises.length} Übungen</strong></section>
      <div className="exercise-list">
        {day.exercises.map((exercise) => {
          const movement = movementMeta(exercise.movementPattern);
          return <article className="exercise-row" key={exercise.id}>
            <span className="exercise-number">{exercise.order}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(exercise.image)} alt="" />
            <button className="exercise-main" onClick={() => setOpenExercise(openExercise === exercise.id ? null : exercise.id)}>
              <span><strong>{exercise.name}</strong><small className="exercise-meta-line">{exercise.primaryMuscles.join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category}</span></small></span>
              <span className="exercise-target"><strong>{exercise.sets} × {exercise.repRange.min}–{exercise.repRange.max}</strong><small>{exercise.restSeconds}s Pause</small></span>
              <ChevronRight size={19} />
            </button>
            {openExercise === exercise.id && <div className="exercise-detail"><p><strong>Bewegungsmuster:</strong> {movement.label} · {movement.category}</p><p><strong>Technik:</strong> {exercise.techniqueCue}</p><p><strong>Equipment:</strong> {exercise.equipment.join(", ")}</p><p><strong>Alternativen:</strong> {alternativesFor(exercise.id).map((item) => item.name).join(", ")}</p></div>}
          </article>
        })}
      </div>
    </div>
  );
}

function WorkoutView({ session, sessions, onChange }: { session: WorkoutSession; sessions: WorkoutSession[]; onChange: () => Promise<void> }) {
  const currentIndex = Math.max(0, session.exercises.findIndex((exercise) => exercise.status === "active"));
  const exercise = session.exercises[currentIndex];
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
  const currentMovement = sessionMovement(exercise);
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
    const next = activateSessionExercise(session, id);
    const selected = next.exercises.find((item) => item.id === id);
    if (!selected) return;
    const lastSet = selected.sets.at(-1);
    setLoad(lastSet?.load ?? 0);
    setReps(lastSet?.reps ?? selected.repMin);
    setRir(lastSet?.rir ?? 2);
    await update(next);
    setShowExercisePicker(false);
  }

  const allHandled = session.exercises.every((item) => item.status === "completed" || item.status === "skipped");
  return (
    <div className="workout-shell">
      <header className="workout-header">
        <button className="icon-button" onClick={() => void onChange()} aria-label="Training pausieren"><Pause size={20} /></button>
        <button className="workout-progress-button" onClick={() => setShowExercisePicker(true)}><span>TAG {session.dayCode} · {session.dayName}</span><strong><ListChecks size={15} /> Übung {currentIndex + 1} von {session.exercises.length}</strong></button>
        <button className="finish-link" onClick={finish}>{allHandled ? "Abschließen" : "Früh beenden"}</button>
      </header>
      <div className="progress-track"><span style={{ width: `${(completedSets / totalSets) * 100}%` }} /></div>

      <main className="workout-main">
        <section className="workout-exercise">
          <div className="workout-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl(exercise.image)} alt={`Muskelgrafik für ${exercise.name}`} />
            <span>SATZ {Math.min(exercise.sets.length + 1, exercise.targetSets)} / {exercise.targetSets}</span>
          </div>
          <div className="active-exercise-meta"><span>{exercise.primaryMuscles.join(" · ")}</span><span className={`movement-chip ${currentMovement.tone}`}>{currentMovement.category} · {currentMovement.label}</span></div>
          <h1>{exercise.name}</h1>
          <p className="cue">{exercise.techniqueCue}</p>
          <div className="workout-secondary-actions"><button className="text-button" onClick={() => setShowExercisePicker(true)}><ListChecks size={16} /> Andere Übung wählen</button><button className="text-button" onClick={() => setShowAlternatives(true)}><RefreshCw size={16} /> Übung ersetzen</button></div>
        </section>

        <section className="set-entry">
          <div className="target-box"><span>Ziel</span><strong>{exercise.repMin}–{exercise.repMax} Wdh.</strong><small>RIR {exercise.targetRirMin}–{exercise.targetRirMax}</small></div>
          {previous && <p className="previous">Letztes Mal: {previous.sets.map((set) => `${set.load ?? "KG"} × ${set.reps}`).join(" · ")}</p>}
          <div className="number-fields">
            <NumberField label="Gewicht" value={load} suffix="kg" min={0} step={2.5} onChange={setLoad} />
            <NumberField label="Wiederholungen" value={reps} suffix="Wdh." min={0} step={1} onChange={setReps} />
          </div>
          <div className="rir-entry"><span>RIR <small>Wiederholungen im Tank</small></span><div>{[0, 1, 2, 3, 4].map((value) => <button key={value} className={rir === value ? "active" : ""} onClick={() => setRir(value)}>{value}{value === 4 ? "+" : ""}</button>)}</div></div>
          <button className="primary-button wide" onClick={completeSet}><Check size={20} /> Satz abschließen</button>
          <button className="skip-button" onClick={skipExercise}><SkipForward size={17} /> Übung überspringen</button>
          {exercise.sets.length > 0 && <div className="logged-sets">{exercise.sets.map((set) => <span key={set.id}><Check size={15} /> Satz {set.setNumber}: {set.load ? `${set.load} kg` : "Körpergewicht"} × {set.reps}, RIR {set.rir ?? "–"}</span>)}</div>}
        </section>
      </main>

      {timerEnd && <div className="timer-bar"><TimerReset size={22} /><div><span>Pause</span><strong>{formatDuration(remaining)}</strong></div><button onClick={() => setTimerEnd((value) => (value ?? Date.now()) + 15_000)}>+15s</button><button onClick={() => setTimerEnd(null)}>Überspringen</button></div>}

      {showAlternatives && <div className="modal-backdrop" onClick={() => setShowAlternatives(false)}><section className="modal" onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">Nur für heute</span><h2>Übung ersetzen</h2></div><button className="icon-button" onClick={() => setShowAlternatives(false)}><X /></button></header><div className="alternative-list">{alternativesFor(exercise.originalExerciseId ?? exercise.exerciseId).map((item) => { const movement = movementMeta(item.movementPattern); return <button key={item.id} onClick={() => replace(item.id, item.name)}><span><strong>{item.name}</strong><small className="exercise-meta-line">{item.equipment.join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category}</span></small></span><ChevronRight /></button>; })}</div></section></div>}

      {showExercisePicker && <div className="modal-backdrop" onClick={() => setShowExercisePicker(false)}><section className="modal exercise-picker" onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">Freie Reihenfolge</span><h2>Was ist gerade frei?</h2><p>Wechsle zu einer offenen Übung. Deine bisherigen Sätze bleiben gespeichert.</p></div><button className="icon-button" onClick={() => setShowExercisePicker(false)}><X /></button></header><div className="exercise-queue">{session.exercises.map((item, index) => { const isCurrent = item.id === exercise.id; const isDone = item.status === "completed"; const movement = sessionMovement(item); return <button key={item.id} disabled={isCurrent || isDone} className={`${isCurrent ? "current" : ""} ${isDone ? "done" : ""}`} onClick={() => chooseExercise(item.id)}><span className="queue-number">{isDone ? <Check size={16} /> : index + 1}</span><span className="queue-copy"><strong>{item.name}</strong><span className="queue-muscles">{item.primaryMuscles.join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category} · {movement.label}</span></span><small>{item.sets.length} von {item.targetSets} Sätzen · {isCurrent ? "Gerade aktiv" : isDone ? "Abgeschlossen" : item.status === "skipped" ? "Übersprungen" : "Offen"}</small></span>{!isCurrent && !isDone && <span className="queue-action">Jetzt <ChevronRight size={16} /></span>}</button>; })}</div></section></div>}

      {allHandled && <div className="completion-dock"><div><Sparkles /><span><strong>Einheit geschafft</strong><small>{completedSets} Sätze protokolliert</small></span></div><button className="primary-button" onClick={finish}>Training abschließen</button></div>}
    </div>
  );
}

function NumberField({ label, value, suffix, min, step, onChange }: { label: string; value: number; suffix: string; min: number; step: number; onChange: (value: number) => void }) {
  return <label className="number-field"><span>{label}</span><div><button onClick={() => onChange(Math.max(min, value - step))}>−</button><input inputMode="decimal" type="number" min={min} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /><small>{suffix}</small><button onClick={() => onChange(value + step)}>+</button></div></label>;
}

function HistoryView({ sessions }: { sessions: WorkoutSession[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const detail = sessions.find((session) => session.id === selected);
  const totalSets = sessions.reduce((sum, session) => sum + session.exercises.reduce((inner, exercise) => inner + exercise.sets.length, 0), 0);
  return (
    <div className="page">
      <header className="page-header"><div><span className="eyebrow">Verlauf</span><h1>Deine Trainingshistorie</h1><p>Jede Einheit bleibt als unveränderlicher Snapshot nachvollziehbar.</p></div></header>
      <div className="stat-row"><div><strong>{sessions.length}</strong><span>Einheiten</span></div><div><strong>{totalSets}</strong><span>Arbeitssätze</span></div><div><strong>{new Set(sessions.flatMap((s) => s.exercises.filter((e) => e.sets.length).map((e) => e.exerciseId))).size}</strong><span>Übungen</span></div></div>
      {sessions.length === 0 ? <div className="empty-state"><History size={38} /><h2>Noch keine Einheiten</h2><p>Nach deinem ersten abgeschlossenen Training erscheint hier der Verlauf.</p></div> : <div className="history-layout"><div className="session-list">{sessions.map((session) => <button key={session.id} onClick={() => setSelected(session.id)} className={selected === session.id ? "active" : ""}><span className="session-code" style={{ background: dayColor[session.dayCode] }}>{session.dayCode}</span><span><strong>{session.dayName}</strong><small>{formatDate(session.completedAt)} · {session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} Sätze</small></span><ChevronRight /></button>)}</div>{detail && <section className="session-detail"><span className="eyebrow">Tag {detail.dayCode}</span><h2>{detail.dayName}</h2>{detail.exercises.filter((ex) => ex.sets.length).map((exercise) => { const movement = sessionMovement(exercise); return <div key={exercise.id}><strong>{exercise.name}</strong><span className="history-exercise-meta">{exercise.primaryMuscles.join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category}</span></span><span>{exercise.sets.map((set) => `${set.load ?? "KG"} × ${set.reps} @ ${set.rir ?? "–"}`).join(" · ")}</span><small>{recommendation(exercise)}</small></div>; })}</section>}</div>}
    </div>
  );
}

function MoreView({ sessions, onChange }: { sessions: WorkoutSession[]; onChange: () => Promise<void> }) {
  const [unit, setUnit] = useState("kg");
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

  async function clearData() {
    if (!window.confirm("Wirklich alle lokalen Trainingsdaten löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) return;
    await deleteAllData();
    await onChange();
  }

  return (
    <div className="page settings-page">
      <header className="page-header"><div><span className="eyebrow">Mehr</span><h1>Einstellungen & Daten</h1><p>Die App funktioniert ohne Konto und speichert lokal.</p></div></header>
      <section className="settings-section"><h2>Training</h2><div className="setting-row"><span><strong>Einheitensystem</strong><small>Anzeige für externe Lasten</small></span><div className="segmented"><button className={unit === "kg" ? "active" : ""} onClick={() => setUnit("kg")}>kg</button><button className={unit === "lb" ? "active" : ""} onClick={() => setUnit("lb")}>lb</button></div></div><div className="setting-row"><span><strong>Pausentimer</strong><small>Je Übung aus dem Trainingsplan</small></span><span>75–180 s</span></div></section>
      <section className="settings-section"><h2>Daten</h2><div className="data-card"><div><strong>{completedCount} Einheiten lokal gespeichert</strong><small>IndexedDB · nur auf diesem Gerät</small></div><span className="offline-pill"><span /> Sicher</span></div><div className="button-row"><button onClick={() => download("kraftwerk-training.json", "application/json", JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), sessions }, null, 2))}>JSON exportieren</button><button onClick={exportCsv}>CSV exportieren</button></div><button className="danger-button" onClick={clearData}><Trash2 size={17} /> Alle Trainingsdaten löschen</button></section>
      <section className="settings-section about"><h2>Über Kraftwerk</h2><p>Version 0.1.0 · Local-first PWA</p><p>Trainingshinweise ersetzen keine medizinische Beratung. Trainiere nur im schmerzfreien Bewegungsbereich.</p></section>
    </div>
  );
}
