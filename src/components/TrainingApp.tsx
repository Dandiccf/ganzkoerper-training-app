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
  Undo2,
  Upload,
  X,
  Youtube,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  activateSessionExercise,
  createSession,
  nextDayCode,
  recommendation,
  replaceSessionExercise,
  setExerciseTargetSets,
  touchSession,
  updateLoggedSet,
  deleteLoggedSet,
  type SetLog,
  type SessionExercise,
  type WorkoutSession,
} from "@/src/lib/domain";
import { createBackup, parseBackup } from "@/src/lib/backup";
import { clearSessionRestTimer, deleteAllData, loadAppSettings, loadPlanConfiguration, loadSessions, replaceAllData, saveAppSettings, savePlanConfiguration, saveSession, saveSessionDraft, subscribeToDataChanges } from "@/src/lib/db";
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
import { defaultAppSettings, defaultWeightStep, displayLoad, storeLoad, type AppSettings } from "@/src/lib/settings";
import { StatsView } from "@/src/components/StatsView";

type View = "today" | "plan" | "stats" | "history" | "more";

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

function ModalLayer({ children, onDismiss }: { children: ReactNode; onDismiss: () => void }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onDismiss(); }}>{children}</div>,
    document.body,
  );
}

function useMobileViewport() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 560px)");
    const update = () => setMobile(query.matches);
    update();
    if (query.addEventListener) query.addEventListener("change", update);
    else query.addListener(update);
    return () => {
      if (query.removeEventListener) query.removeEventListener("change", update);
      else query.removeListener(update);
    };
  }, []);
  return mobile;
}

function useDialogAccessibility(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const dialog = document.querySelector<HTMLElement>("[role='dialog']:last-of-type");
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () => dialog ? [...dialog.querySelectorAll<HTMLElement>("button:not(:disabled), select:not(:disabled), input:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])")] : [];
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    const onTouchMove = (event: TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || !dialog?.contains(target)) event.preventDefault();
    };
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    const oldBodyOverflow = document.body.style.overflow;
    const oldRootOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("touchmove", onTouchMove);
      document.documentElement.style.overflow = oldRootOverflow;
      document.body.style.overflow = oldBodyOverflow;
      previous?.focus();
    };
  }, [onClose, open]);
}

export function TrainingApp() {
  const { locale, t } = useI18n();
  const [view, setView] = useState<View>("today");
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [planConfiguration, setPlanConfiguration] = useState<PlanConfiguration>(defaultPlanConfiguration);
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);
  const [ready, setReady] = useState(false);
  const [planDay, setPlanDay] = useState<DayCode>("A");
  const [storageError, setStorageError] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [mutationError, setMutationError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [storedSessions, storedPlan, storedSettings] = await Promise.all([loadSessions(), loadPlanConfiguration(), loadAppSettings()]);
      setSessions(storedSessions);
      setPlanConfiguration(storedPlan);
      setSettings(storedSettings);
      setStorageError(false);
    } catch {
      setStorageError(true);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    const initialFrame = window.requestAnimationFrame(() => {
      void refresh();
      setOnline(navigator.onLine);
    });
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const unsubscribe = subscribeToDataChanges(() => { void refresh(); });
    if (navigator.storage?.persist) void navigator.storage.persist();
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      let refreshing = false;
      const onControllerChange = () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
      void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
        void registration.update();
        void navigator.serviceWorker.ready.then(() => setOfflineReady(true));
        if (registration.waiting) registration.waiting.postMessage({ type: "SKIP_WAITING" });
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateAvailable(true);
          });
        });
      }).catch(() => setOfflineReady(false));
      return () => {
        window.cancelAnimationFrame(initialFrame);
        unsubscribe();
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
        navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      };
    }
    return () => {
      window.cancelAnimationFrame(initialFrame);
      unsubscribe();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [refresh]);

  useEffect(() => {
    document.title = locale === "de" ? "Kraftwerk – Ganzkörpertraining" : "Kraftwerk – Full-Body Training";
  }, [locale]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const frame = window.requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => window.cancelAnimationFrame(frame);
  }, [view]);

  const active = sessions.find((session) => session.status === "active");
  const paused = sessions.find((session) => session.status === "paused");
  const nextCode = nextDayCode(sessions);
  const configuredDays = useMemo(() => resolvePlanDays(planConfiguration), [planConfiguration]);
  const nextDay = configuredDays.find((day) => day.code === nextCode)!;
  const completed = sessions.filter((session) => session.status === "completed" && session.exercises.some((exercise) => exercise.sets.length > 0));

  async function startTraining(code: DayCode) {
    if (paused) return;
    try {
      setMutationError(false);
      const day = configuredDays.find((item) => item.code === code)!;
      const session = createSession(day);
      await saveSession(session);
      await refresh();
    } catch { setMutationError(true); }
  }

  async function resumeTraining() {
    if (!paused) return;
    try {
      setMutationError(false);
      await saveSession(touchSession({ ...paused, status: "active" }));
      await refresh();
    } catch { setMutationError(true); }
  }

  async function discardPausedTraining() {
    if (!paused || !window.confirm(t("today.confirmDiscard"))) return;
    try {
      setMutationError(false);
      await saveSession(touchSession({ ...paused, status: "discarded", restTimerEndsAt: undefined }));
      await refresh();
    } catch { setMutationError(true); }
  }

  async function updatePlan(next: PlanConfiguration) {
    try {
      setMutationError(false);
      await savePlanConfiguration(next);
      setPlanConfiguration(next);
    } catch { setMutationError(true); }
  }

  async function updateSettings(next: AppSettings) {
    try {
      setMutationError(false);
      const saved = await saveAppSettings(next);
      setSettings(saved);
    } catch { setMutationError(true); }
  }

  if (!ready) {
    return <div className="loading"><Dumbbell size={32} /> {t("status.loading")}</div>;
  }

  if (storageError) {
    return <div className="loading error-state"><Dumbbell size={32} /><h1>{t("storage.title")}</h1><p>{t("storage.help")}</p><button className="primary-button" onClick={() => void refresh()}>{t("storage.retry")}</button></div>;
  }

  if (active) {
    return <WorkoutView session={active} sessions={sessions} settings={settings} onChange={refresh} />;
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
        <div className="connection-status" role="status"><span className={online ? "online" : "offline"} />{online ? offlineReady ? t("status.offlineReady") : t("status.online") : t("status.offline")}</div>
        {updateAvailable && <button className="update-banner" onClick={() => navigator.serviceWorker.getRegistration().then((registration) => registration?.waiting?.postMessage({ type: "SKIP_WAITING" }))}>{t("status.update")}</button>}
        {mutationError && <div className="app-error" role="alert">{t("storage.saveError")}<button aria-label={t("common.close")} onClick={() => setMutationError(false)}><X size={15} /></button></div>}
        {view === "today" && (
          <TodayView
            nextDay={nextDay}
            sessions={sessions}
            completed={completed}
            onStart={startTraining}
            paused={paused}
            onResume={resumeTraining}
            onDiscard={discardPausedTraining}
            onShowStats={() => setView("stats")}
          />
        )}
        {view === "plan" && <PlanView selected={planDay} onSelect={setPlanDay} configuration={planConfiguration} onChange={updatePlan} />}
        {view === "stats" && <StatsView sessions={completed} settings={settings} />}
        {view === "history" && <HistoryView sessions={completed} settings={settings} onChange={refresh} onShowStats={() => setView("stats")} />}
        {view === "more" && <MoreView sessions={sessions} planConfiguration={planConfiguration} settings={settings} onSettingsChange={updateSettings} onChange={refresh} />}
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
    { id: "plan", label: t("nav.plan"), icon: ListChecks },
    { id: "stats", label: t("nav.stats"), icon: BarChart3 },
    { id: "history", label: t("nav.history"), icon: History },
    { id: "more", label: mobile ? t("nav.more") : t("nav.settings"), icon: mobile ? MoreHorizontal : Settings2 },
  ];
  return (
    <div className={mobile ? "nav-items mobile" : "nav-items"}>
      {items.map((item) => {
        const Icon = item.icon;
        return <button key={item.id} aria-current={view === item.id ? "page" : undefined} className={view === item.id ? "active" : ""} onClick={() => onChange(item.id)}><Icon size={20} /><span>{item.label}</span></button>;
      })}
    </div>
  );
}

function TodayView({
  nextDay,
  sessions,
  completed,
  onStart,
  paused,
  onResume,
  onDiscard,
  onShowStats,
}: {
  nextDay: ConfiguredTrainingDay;
  sessions: WorkoutSession[];
  completed: WorkoutSession[];
  onStart: (code: DayCode) => void;
  paused?: WorkoutSession;
  onResume: () => void;
  onDiscard: () => void;
  onShowStats: () => void;
}) {
  const { locale, t } = useI18n();
  const latest = completed[0];
  const latestSets = latest?.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0) ?? 0;
  const pausedSets = paused?.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0) ?? 0;
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
      </header>

      {paused && <section className="resume-card"><span className="day-badge" style={{ "--accent": dayColor[paused.dayCode] } as React.CSSProperties}>{t("common.day").toUpperCase()} {paused.dayCode}</span><div><span className="eyebrow">{t("today.paused")}</span><h2>{localizeDay(paused.dayCode, { name: paused.dayName, focus: paused.focus }, locale).name}</h2><p>{pausedSets} {t(pausedSets === 1 ? "common.setSingular" : "common.sets")} · {t("today.resumeHelp")}</p></div><div><button className="primary-button" onClick={onResume}><Play size={18} /> {t("today.resume")}</button><button className="text-button danger-text" onClick={onDiscard}><Trash2 size={16} /> {t("today.discard")}</button></div></section>}

      <section className="hero-card" style={{ "--accent": dayColor[nextDay.code] } as React.CSSProperties}>
        <div className="hero-copy">
          <span className="day-badge">{t("common.day").toUpperCase()} {nextDay.code}</span>
          <h2>{localizedNextDay.name}</h2>
          <p>{localizedNextDay.focus}</p>
          <div className="hero-meta">
            <span><Clock3 size={17} /> {trainingPlan.estimatedDurationMinutes.min}–{trainingPlan.estimatedDurationMinutes.max} Min.</span>
            <span><Dumbbell size={17} /> {nextDay.exercises.length} {t("common.exercises")} · {nextDay.exercises.reduce((sum, exercise) => sum + exercise.sets, 0)} {t("common.sets")}</span>
          </div>
          <button className="primary-button" disabled={Boolean(paused)} onClick={() => onStart(nextDay.code)}><Play size={19} fill="currentColor" /> {paused ? t("today.resumeFirst") : t("today.start")}</button>
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
          {latest ? <><h3>{t("common.day")} {latest.dayCode} · {localizeDay(latest.dayCode, { name: latest.dayName, focus: latest.focus }, locale).name}</h3><p>{formatDate(latest.completedAt, locale)} · {latestSets} {t(latestSets === 1 ? "common.setSingular" : "common.sets")}</p><div className="quiet-success"><Sparkles size={18} /> {t("today.nextGoal")}</div><button className="progress-link" onClick={onShowStats}><BarChart3 size={16} /> {t("stats.open")}</button></> : <><h3>{t("today.none")}</h3><p>{t("today.noneHelp")}</p></>}
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
  const totalPlanSets = resolvePlanDays(configuration).reduce((sum, item) => sum + item.exercises.reduce((daySum, exercise) => daySum + exercise.sets, 0), 0);
  const closePlanDialog = useCallback(() => { setAlternativeSlot(null); setShowAdd(false); }, [setAlternativeSlot, setShowAdd]);
  useDialogAccessibility(Boolean((selectedSlot && baseExercise) || showAdd), closePlanDialog);

  async function commit(next: PlanConfiguration) {
    await onChange(next);
  }

  async function resetDay() {
    if (!window.confirm(t("plan.confirmReset"))) return;
    await commit(resetPlanDay(configuration, selected));
  }

  return (
    <div className="page">
      <header className="page-header"><div><span className="eyebrow">{t("plan.eyebrow")}</span><h1>{t("plan.title")}</h1><p>{t("plan.subtitleDynamic", { sets: totalPlanSets })}</p></div><div className="page-header-actions"><Link href="/grundidee" className="learn-link"><Sparkles size={17} /> {t("plan.learn")}</Link><button className={`learn-link ${editing ? "active" : ""}`} onClick={() => setEditing((value) => !value)}><Pencil size={17} /> {editing ? t("plan.doneEditing") : t("plan.edit")}</button></div></header>
      <div className="day-tabs">
        {trainingPlan.days.map((item) => <button key={item.code} aria-pressed={selected === item.code} className={selected === item.code ? "active" : ""} onClick={() => onSelect(item.code)} style={{ "--accent": dayColor[item.code] } as React.CSSProperties}><span>{t("common.day")} {item.code}</span><small>{localizeDay(item.code, item, locale).name}</small></button>)}
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

      {selectedSlot && baseExercise && <ModalLayer onDismiss={() => setAlternativeSlot(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="plan-alternative-title" onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{t("plan.chooseAlternative")}</span><h2 id="plan-alternative-title">{localizeMuscles(baseExercise.primaryMuscles, locale).join(" · ")}</h2><p>{t("plan.alternativeHelp")}</p></div><button className="icon-button" aria-label={t("common.close")} onClick={() => setAlternativeSlot(null)}><X /></button></header><div className="alternative-list master-alternatives">{[baseExercise, ...alternativesFor(baseExercise.id)].map((item) => { const movement = localizeMovement(item.movementPattern, movementMeta(item.movementPattern), locale); const active = selectedSlot.exerciseId === item.id; return <button key={item.id} className={active ? "selected" : ""} onClick={async () => { await commit(replacePlanSlotExercise(configuration, selected, selectedSlot.id, item.id)); setAlternativeSlot(null); }}><span><strong>{localizeExerciseName(item.id, item.name, locale)} {item.id === baseExercise.id && <small className="configured-pill">{t("plan.baseExercise")}</small>}</strong><small className="exercise-meta-line">{localizeEquipment(item.equipment, locale).join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category}</span></small></span>{active ? <Check /> : <ChevronRight />}</button>; })}</div></section></ModalLayer>}

      {showAdd && <ModalLayer onDismiss={() => setShowAdd(false)}><section className="modal exercise-picker" role="dialog" aria-modal="true" aria-labelledby="plan-add-title" onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{t("plan.addExercise")}</span><h2 id="plan-add-title">{t("plan.addTitle")}</h2><p>{t("plan.addHelp")}</p></div><button className="icon-button" aria-label={t("common.close")} onClick={() => setShowAdd(false)}><X /></button></header>{addable.length ? <div className="exercise-queue add-slot-list">{addable.map((exercise) => { const movement = localizeMovement(exercise.movementPattern, movementMeta(exercise.movementPattern), locale); return <button key={exercise.id} onClick={async () => { await commit(addPlanSlot(configuration, selected, exercise.id, crypto.randomUUID())); setShowAdd(false); }}><span className="queue-copy"><strong>{localizeExerciseName(exercise.id, exercise.name, locale)}</strong><span className="queue-muscles">{localizeMuscles(exercise.primaryMuscles, locale).join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category} · {movement.label}</span></span><small>{exercise.sets} × {exercise.repRange.min}–{exercise.repRange.max} · {localizeEquipment(exercise.equipment, locale).join(" · ")}</small></span><span className="queue-action"><Plus size={17} /></span></button>; })}</div> : <div className="empty-state"><Check size={32} /><p>{t("plan.noExercisesAvailable")}</p></div>}</section></ModalLayer>}
    </div>
  );
}

function WorkoutView({ session, sessions, settings, onChange }: { session: WorkoutSession; sessions: WorkoutSession[]; settings: AppSettings; onChange: () => Promise<void> }) {
  const { locale, t } = useI18n();
  const mobileViewport = useMobileViewport();
  const currentIndex = Math.max(0, session.exercises.findIndex((exercise) => exercise.status === "active"));
  const exercise = session.exercises[currentIndex];
  const exerciseName = localizeExerciseName(exercise.exerciseId, exercise.name, locale);
  const localizedDay = localizeDay(session.dayCode, { name: session.dayName, focus: session.focus }, locale);
  const previous = sessions
    .filter((item) => item.status === "completed" && item.id !== session.id)
    .flatMap((item) => item.exercises)
    .find((item) => item.exerciseId === exercise.exerciseId && item.sets.length);
  const initialDraft = session.drafts?.[exercise.id];
  const previousSet = previous?.sets.at(-1);
  const [load, setLoad] = useState(displayLoad(initialDraft?.load ?? previousSet?.load ?? null, settings.unit) ?? 0);
  const [reps, setReps] = useState(initialDraft?.reps ?? previousSet?.reps ?? exercise.repMin);
  const [rir, setRir] = useState<number | null>(initialDraft?.rir ?? previousSet?.rir ?? 2);
  const [timerEnd, setTimerEnd] = useState<number | null>(session.restTimerEndsAt ? Date.parse(session.restTimerEndsAt) : null);
  const [remaining, setRemaining] = useState(0);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [editingSet, setEditingSet] = useState<{ id: string; load: number; reps: number; rir: number | null } | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<WorkoutSession | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timerDone, setTimerDone] = useState(false);
  const mobileDialogScroll = useRef(0);
  const closeWorkoutDialog = useCallback(() => { setShowAlternatives(false); setShowExercisePicker(false); setEditingSet(null); }, [setEditingSet, setShowAlternatives, setShowExercisePicker]);
  useDialogAccessibility((!mobileViewport && (showAlternatives || showExercisePicker)) || Boolean(editingSet), closeWorkoutDialog);

  useEffect(() => {
    if (!mobileViewport || (!showAlternatives && !showExercisePicker)) return;
    mobileDialogScroll.current = window.scrollY;
    const openFrame = window.requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.querySelector<HTMLElement>(".mobile-dialog-page .icon-button")?.focus();
    });
    return () => {
      window.cancelAnimationFrame(openFrame);
      const restoreTo = mobileDialogScroll.current;
      window.requestAnimationFrame(() => window.scrollTo(0, restoreTo));
    };
  }, [mobileViewport, showAlternatives, showExercisePicker]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const draft = session.drafts?.[exercise.id];
      const prior = sessions
        .filter((item) => item.status === "completed" && item.id !== session.id)
        .flatMap((item) => item.exercises)
        .find((item) => item.exerciseId === exercise.exerciseId && item.sets.length)
        ?.sets.at(-1);
      setLoad(displayLoad(draft?.load ?? prior?.load ?? null, settings.unit) ?? 0);
      setReps(draft?.reps ?? prior?.reps ?? exercise.repMin);
      setRir(draft?.rir ?? prior?.rir ?? 2);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [exercise.id, exercise.exerciseId, exercise.repMin, session.drafts, session.id, sessions, settings.unit]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setTimerEnd(session.restTimerEndsAt ? Date.parse(session.restTimerEndsAt) : null));
    return () => window.cancelAnimationFrame(frame);
  }, [session.restTimerEndsAt]);

  useEffect(() => {
    if (!timerEnd) return;
    const tick = () => {
      const value = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
      setRemaining(value);
      if (value === 0) {
        setTimerEnd(null);
        setTimerDone(true);
        navigator.vibrate?.([180, 80, 180]);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(t("workout.timerDone"), { body: exerciseName, tag: "kraftwerk-rest" });
        }
        void clearSessionRestTimer(session.id);
      }
    };
    tick();
    const interval = window.setInterval(tick, 500);
    return () => window.clearInterval(interval);
  }, [exerciseName, session.id, t, timerEnd]);

  const completedSets = session.exercises.reduce((sum, item) => sum + item.sets.length, 0);
  const totalSets = session.exercises.reduce((sum, item) => sum + item.targetSets, 0);
  const currentMovement = sessionMovement(exercise, locale);
  async function update(next: WorkoutSession) {
    try {
      setSaveError(false);
      const withCurrentDraft = {
        ...next,
        drafts: {
          ...(next.drafts ?? {}),
          [exercise.id]: { load: load ? storeLoad(load, settings.unit) : null, reps, rir },
        },
      };
      await saveSession(touchSession(withCurrentDraft));
      await onChange();
    } catch {
      setSaveError(true);
    }
  }

  function persistDraft(nextLoad: number, nextReps: number, nextRir: number | null) {
    void saveSessionDraft(session.id, exercise.id, { load: nextLoad ? storeLoad(nextLoad, settings.unit) : null, reps: nextReps, rir: nextRir }).catch(() => setSaveError(true));
  }

  async function completeSet() {
    if (submitting || reps < 1 || load < 0) return;
    setSubmitting(true);
    const next = structuredClone(session);
    const target = next.exercises[currentIndex];
    target.sets.push({ id: crypto.randomUUID(), setNumber: target.sets.length + 1, load: load ? storeLoad(load, settings.unit) : null, reps, rir, completedAt: new Date().toISOString() });
    const end = Date.now() + target.restSeconds * 1000;
    next.restTimerEndsAt = new Date(end).toISOString();
    next.drafts = { ...(next.drafts ?? {}), [exercise.id]: { load: load ? storeLoad(load, settings.unit) : null, reps, rir } };
    setTimerEnd(end);
    setTimerDone(false);
    setUndoSnapshot(session);
    if (target.sets.length >= target.targetSets) {
      target.status = "completed";
      const nextExercise = next.exercises.find((item) => item.status === "pending");
      if (nextExercise) {
        nextExercise.status = "active";
      }
    }
    await update(next);
    setSubmitting(false);
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
    if (!allHandled && completedSets === 0) {
      if (!window.confirm(t("workout.confirmDiscardEmpty"))) return;
      next.status = "discarded";
      next.restTimerEndsAt = undefined;
      await update(next);
      return;
    }
    if (!allHandled && !window.confirm(t("workout.confirmFinishPartial", { sets: completedSets }))) return;
    next.status = "completed";
    next.completedAt = new Date().toISOString();
    next.restTimerEndsAt = undefined;
    next.exercises.forEach((item) => { if (item.status === "active" || item.status === "pending") item.status = "skipped"; });
    await update(next);
  }

  async function pauseWorkout() {
    const next = structuredClone(session);
    next.status = "paused";
    await update(next);
  }

  async function replace(id: string, name: string) {
    if (exercise.sets.length > 0) return;
    const next = structuredClone(session);
    next.exercises[currentIndex] = {
      ...replaceSessionExercise(next.exercises[currentIndex], { id, name }),
      movementPattern: movementPatternForExercise(id),
    };
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
    await update(next);
    setShowExercisePicker(false);
  }

  async function adjustTargetSets(delta: number) {
    const next = setExerciseTargetSets(session, exercise.id, exercise.targetSets + delta);
    const nextActive = next.exercises.find((item) => item.status === "active");
    if (nextActive && nextActive.id !== exercise.id) {
      const lastSet = nextActive.sets.at(-1);
      setLoad(displayLoad(lastSet?.load ?? null, settings.unit) ?? 0);
      setReps(lastSet?.reps ?? nextActive.repMin);
      setRir(lastSet?.rir ?? 2);
    }
    await update(next);
  }

  async function saveEditedSet() {
    if (!editingSet || editingSet.reps < 1 || editingSet.load < 0) return;
    const next = updateLoggedSet(session, exercise.id, editingSet.id, {
      load: editingSet.load ? storeLoad(editingSet.load, settings.unit) : null,
      reps: editingSet.reps,
      rir: editingSet.rir,
    });
    await update(next);
    setEditingSet(null);
  }

  async function removeSet(setId: string) {
    setUndoSnapshot(session);
    await update(deleteLoggedSet(session, exercise.id, setId));
  }

  async function undoLastAction() {
    if (!undoSnapshot) return;
    const snapshot = undoSnapshot;
    setUndoSnapshot(null);
    await update(snapshot);
  }

  async function changeTimer(delta: number | null) {
    const next = structuredClone(session);
    if (delta === null) {
      next.restTimerEndsAt = undefined;
      setTimerEnd(null);
    } else {
      const end = (timerEnd ?? Date.now()) + delta;
      next.restTimerEndsAt = new Date(end).toISOString();
      setTimerEnd(end);
    }
    await update(next);
  }

  const allHandled = session.exercises.every((item) => item.status === "completed" || item.status === "skipped");
  const alternativesPanel = <section className="modal" role="dialog" aria-modal="true" aria-labelledby="workout-alternatives-title" onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{t("workout.onlyToday")}</span><h2 id="workout-alternatives-title">{t("workout.replace")}</h2></div><button className="icon-button" aria-label={t("common.close")} onClick={() => setShowAlternatives(false)}><X /></button></header><div className="alternative-list">{alternativesFor(exercise.originalExerciseId ?? exercise.exerciseId).map((item) => { const movement = localizeMovement(item.movementPattern, movementMeta(item.movementPattern), locale); return <button key={item.id} onClick={() => replace(item.id, item.name)}><span><strong>{localizeExerciseName(item.id, item.name, locale)}</strong><small className="exercise-meta-line">{localizeEquipment(item.equipment, locale).join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category}</span></small></span><ChevronRight /></button>; })}</div></section>;
  const exercisePickerPanel = <section className="modal exercise-picker" role="dialog" aria-modal="true" aria-labelledby="exercise-picker-title" onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{t("workout.freeOrder")}</span><h2 id="exercise-picker-title">{t("workout.freeTitle")}</h2><p>{t("workout.freeHelp")}</p></div><button className="icon-button" aria-label={t("common.close")} onClick={() => setShowExercisePicker(false)}><X /></button></header><div className="exercise-queue">{session.exercises.map((item, index) => { const isCurrent = item.id === exercise.id; const isDone = item.status === "completed"; const movement = sessionMovement(item, locale); return <button key={item.id} disabled={isCurrent} className={`${isCurrent ? "current" : ""} ${isDone ? "done" : ""}`} onClick={() => chooseExercise(item.id)}><span className="queue-number">{isDone ? <Check size={16} /> : index + 1}</span><span className="queue-copy"><strong>{localizeExerciseName(item.exerciseId, item.name, locale)}</strong><span className="queue-muscles">{localizeMuscles(item.primaryMuscles, locale).join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category} · {movement.label}</span></span><small>{item.sets.length} {t("common.of")} {item.targetSets} {t(item.targetSets === 1 ? "common.setSingular" : "common.sets")} · {isCurrent ? t("workout.active") : isDone ? t("workout.completed") : item.status === "skipped" ? t("workout.skipped") : t("workout.open")}</small></span>{!isCurrent && <span className="queue-action">{isDone ? t("workout.extraSet") : t("workout.now")} <ChevronRight size={16} /></span>}</button>; })}</div></section>;

  if (mobileViewport && showAlternatives) return <main className="mobile-dialog-page">{alternativesPanel}</main>;
  if (mobileViewport && showExercisePicker) return <main className="mobile-dialog-page">{exercisePickerPanel}</main>;

  return (
    <div className={`workout-shell${timerEnd || timerDone ? " timer-visible" : ""}`}>
      <header className="workout-header">
        <div className="workout-header-tools"><button className="icon-button" onClick={pauseWorkout} aria-label={t("workout.pause")}><Pause size={20} /></button></div>
        <button className="workout-progress-button" onClick={() => setShowExercisePicker(true)}><span>{t("common.day").toUpperCase()} {session.dayCode} · {localizedDay.name}</span><strong><ListChecks size={15} /> {t("workout.exercise")} {currentIndex + 1} {t("common.of")} {session.exercises.length}</strong></button>
        <button className="finish-link" onClick={finish}>{allHandled ? t("workout.finish") : t("workout.finishEarly")}</button>
      </header>
      <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={totalSets} aria-valuenow={completedSets}><span style={{ width: `${(completedSets / totalSets) * 100}%` }} /></div>
      {saveError && <div className="workout-error" role="alert">{t("storage.saveError")} <button onClick={() => void onChange()}>{t("storage.retry")}</button></div>}

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
          <div className="workout-secondary-actions"><button className="text-button" onClick={() => setShowExercisePicker(true)}><ListChecks size={16} /> {t("workout.choose")}</button><button className="text-button" disabled={exercise.sets.length > 0} title={exercise.sets.length > 0 ? t("workout.replaceLocked") : undefined} onClick={() => setShowAlternatives(true)}><RefreshCw size={16} /> {exercise.sets.length > 0 ? t("workout.replaceLockedShort") : t("workout.replace")}</button></div>
        </section>

        <section className="set-entry">
          <div className="set-entry-setup">
            <div className="target-box"><span>{t("workout.target")}</span><strong>{exercise.repMin}–{exercise.repMax} {t("workout.repsShort")}</strong><small>RIR {exercise.targetRirMin}–{exercise.targetRirMax}</small></div>
            <div className="session-set-control"><span><strong>{t("workout.workingSets")}</strong><small>{t("workout.sessionOnly")}</small></span><div className="set-stepper"><button aria-label={t("workout.removeSet")} disabled={exercise.targetSets <= Math.max(1, exercise.sets.length)} onClick={() => adjustTargetSets(-1)}>−</button><strong>{exercise.targetSets}</strong><button aria-label={t("workout.addSet")} onClick={() => adjustTargetSets(1)}>+</button></div></div>
            {previous && <p className="previous">{t("workout.lastTime")} {previous.sets.map((set) => `${set.load === null ? t("common.bodyweight") : `${displayLoad(set.load, settings.unit)} ${settings.unit}`} × ${set.reps}`).join(" · ")}</p>}
            {exercise.sets.length > 0 && <div className="logged-sets">{exercise.sets.map((set) => <div key={set.id}><span><Check size={15} /> {t("common.set")} {set.setNumber}: {set.load !== null ? `${displayLoad(set.load, settings.unit)} ${settings.unit}` : t("common.bodyweight")} × {set.reps}, RIR {set.rir ?? "–"}</span><span className="logged-set-actions"><button aria-label={t("workout.editSet")} onClick={() => setEditingSet({ id: set.id, load: displayLoad(set.load, settings.unit) ?? 0, reps: set.reps, rir: set.rir })}><Pencil size={15} /></button><button aria-label={t("workout.deleteSet")} onClick={() => removeSet(set.id)}><Trash2 size={15} /></button></span></div>)}</div>}
          </div>
          <div className="set-entry-controls">
            <div className="number-fields">
              <NumberField label={t("workout.weight")} value={load} suffix={settings.unit} min={0} step={settings.weightStep} onChange={(value) => { setLoad(value); persistDraft(value, reps, rir); }} />
              <NumberField label={t("workout.repetitions")} value={reps} suffix={t("workout.repsShort")} min={1} step={1} onChange={(value) => { setReps(value); persistDraft(load, value, rir); }} />
            </div>
            <div className="rir-entry"><span>RIR <small>{t("workout.rirHelp")}</small></span><div>{[0, 1, 2, 3, 4].map((value) => <button key={value} className={rir === value ? "active" : ""} onClick={() => { setRir(value); persistDraft(load, reps, value); }}>{value}{value === 4 ? "+" : ""}</button>)}</div></div>
          </div>
          <div className="set-entry-actions">
            <button className="primary-button wide" disabled={submitting || reps < 1 || load < 0} onClick={completeSet}><Check size={20} /> {submitting ? t("workout.saving") : t("workout.completeSet")}</button>
            <button className="skip-button" onClick={skipExercise}><SkipForward size={17} /> {t("workout.skipExercise")}</button>
          </div>
        </section>
      </main>

      {timerEnd && <div className="timer-bar" role="timer" aria-live="polite"><TimerReset size={22} /><div><span>{t("common.rest")}</span><strong>{formatDuration(remaining)}</strong></div><button onClick={() => changeTimer(15_000)}>+15s</button><button onClick={() => changeTimer(-15_000)}>−15s</button><button onClick={() => changeTimer(null)}>{t("common.skip")}</button></div>}
      {timerDone && <div className="timer-done" role="status"><Check size={18} /><span>{t("workout.timerDone")}</span><button aria-label={t("common.close")} onClick={() => setTimerDone(false)}><X size={15} /></button></div>}

      {!mobileViewport && showAlternatives && <ModalLayer onDismiss={() => setShowAlternatives(false)}>{alternativesPanel}</ModalLayer>}

      {!mobileViewport && showExercisePicker && <ModalLayer onDismiss={() => setShowExercisePicker(false)}>{exercisePickerPanel}</ModalLayer>}

      {editingSet && <ModalLayer onDismiss={() => setEditingSet(null)}><section className="modal set-editor-modal" role="dialog" aria-modal="true" aria-labelledby="set-editor-title" onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{t("workout.correctSet")}</span><h2 id="set-editor-title">{t("workout.editSet")}</h2></div><button className="icon-button" aria-label={t("common.close")} onClick={() => setEditingSet(null)}><X /></button></header><div className="number-fields"><NumberField label={t("workout.weight")} value={editingSet.load} suffix={settings.unit} min={0} step={settings.weightStep} onChange={(value) => setEditingSet({ ...editingSet, load: value })} /><NumberField label={t("workout.repetitions")} value={editingSet.reps} suffix={t("workout.repsShort")} min={1} step={1} onChange={(value) => setEditingSet({ ...editingSet, reps: value })} /></div><div className="rir-entry"><span>RIR</span><div>{[0, 1, 2, 3, 4].map((value) => <button key={value} className={editingSet.rir === value ? "active" : ""} onClick={() => setEditingSet({ ...editingSet, rir: value })}>{value}{value === 4 ? "+" : ""}</button>)}</div></div><button className="primary-button wide" onClick={saveEditedSet}><Check size={18} /> {t("common.save")}</button></section></ModalLayer>}

      {undoSnapshot && <div className="undo-bar" role="status"><span>{t("workout.undoHelp")}</span><button onClick={undoLastAction}><Undo2 size={16} /> {t("common.undo")}</button><button aria-label={t("common.close")} onClick={() => setUndoSnapshot(null)}><X size={15} /></button></div>}

      {allHandled && <div className="completion-dock"><div><Sparkles /><span><strong>{t("workout.sessionDone")}</strong><small>{completedSets} {t("workout.logged")}</small></span></div><button className="primary-button" onClick={finish}>{t("workout.complete")}</button></div>}
    </div>
  );
}

function NumberField({ label, value, suffix, min, step, onChange }: { label: string; value: number; suffix: string; min: number; step: number; onChange: (value: number) => void }) {
  return <label className="number-field"><span>{label}</span><div><button onClick={() => onChange(Math.max(min, value - step))}>−</button><input inputMode="decimal" type="number" min={min} step={step} value={value} onChange={(event) => { const next = Number(event.target.value); onChange(Number.isFinite(next) ? Math.max(min, next) : min); }} /><small>{suffix}</small><button onClick={() => onChange(Math.max(min, value + step))}>+</button></div></label>;
}

function HistoryView({ sessions, settings, onChange, onShowStats }: { sessions: WorkoutSession[]; settings: AppSettings; onChange: () => Promise<void>; onShowStats: () => void }) {
  const { locale, t } = useI18n();
  const [selected, setSelected] = useState<string | null>(sessions[0]?.id ?? null);
  const [editing, setEditing] = useState<{ sessionId: string; exerciseId: string; set: SetLog; load: number } | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<WorkoutSession | null>(null);
  const [saveError, setSaveError] = useState(false);
  const closeHistoryDialog = useCallback(() => setEditing(null), [setEditing]);
  useDialogAccessibility(Boolean(editing), closeHistoryDialog);
  const detail = sessions.find((session) => session.id === selected);
  const totalSets = sessions.reduce((sum, session) => sum + session.exercises.reduce((inner, exercise) => inner + exercise.sets.length, 0), 0);

  function countSets(value: number) {
    return `${value} ${t(value === 1 ? "common.setSingular" : "common.sets")}`;
  }

  function setText(set: SetLog) {
    const loadText = set.load === null ? t("common.bodyweight") : `${displayLoad(set.load, settings.unit)} ${settings.unit}`;
    return `${loadText} × ${set.reps} @ ${set.rir ?? "–"}`;
  }

  async function saveHistorySession(next: WorkoutSession) {
    try {
      setSaveError(false);
      await saveSession(next);
      await onChange();
      return true;
    } catch {
      setSaveError(true);
      return false;
    }
  }

  async function saveHistorySet() {
    if (!editing) return;
    const target = sessions.find((session) => session.id === editing.sessionId);
    if (!target) return;
    const saved = await saveHistorySession(updateLoggedSet(target, editing.exerciseId, editing.set.id, {
      load: editing.load ? storeLoad(editing.load, settings.unit) : null,
      reps: editing.set.reps,
      rir: editing.set.rir,
    }));
    if (saved) setEditing(null);
  }

  async function deleteHistorySet(session: WorkoutSession, exerciseId: string, setId: string) {
    const next = structuredClone(session);
    const exercise = next.exercises.find((item) => item.id === exerciseId);
    if (!exercise) return;
    exercise.sets = exercise.sets.filter((set) => set.id !== setId).map((set, index) => ({ ...set, setNumber: index + 1 }));
    exercise.status = exercise.sets.length ? "completed" : "skipped";
    if (await saveHistorySession(touchSession(next))) setUndoSnapshot(session);
  }

  async function undoHistoryChange() {
    if (!undoSnapshot) return;
    const snapshot = undoSnapshot;
    if (await saveHistorySession(snapshot)) setUndoSnapshot(null);
  }

  return (
    <div className="page">
      <header className="page-header"><div><span className="eyebrow">{t("history.eyebrow")}</span><h1>{t("history.title")}</h1><p>{t("history.subtitle")}</p></div><button className="learn-link" onClick={onShowStats}><BarChart3 size={17} /> {t("stats.open")}</button></header>
      {saveError && <div className="inline-error" role="alert">{t("storage.saveError")}<button onClick={() => setSaveError(false)} aria-label={t("common.close")}><X size={15} /></button></div>}
      <div className="stat-row"><div><strong>{sessions.length}</strong><span>{t("history.sessions")}</span></div><div><strong>{totalSets}</strong><span>{t("history.workingSets")}</span></div><div><strong>{new Set(sessions.flatMap((s) => s.exercises.filter((e) => e.sets.length).map((e) => e.exerciseId))).size}</strong><span>{t("history.exercises")}</span></div></div>
      {sessions.length === 0 ? <div className="empty-state"><History size={38} /><h2>{t("history.empty")}</h2><p>{t("history.emptyHelp")}</p></div> : <div className="history-layout"><div className="session-list">{sessions.map((session) => { const setCount = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0); return <button key={session.id} onClick={() => setSelected(session.id)} className={selected === session.id ? "active" : ""}><span className="session-code" style={{ background: dayColor[session.dayCode] }}>{session.dayCode}</span><span><strong>{localizeDay(session.dayCode, { name: session.dayName, focus: session.focus }, locale).name}</strong><small>{formatDate(session.completedAt, locale)} · {countSets(setCount)}</small></span><ChevronRight /></button>; })}</div>{detail && <section className="session-detail"><span className="eyebrow">{t("common.day")} {detail.dayCode}</span><h2>{localizeDay(detail.dayCode, { name: detail.dayName, focus: detail.focus }, locale).name}</h2>{detail.exercises.filter((ex) => ex.sets.length).map((exercise) => { const movement = sessionMovement(exercise, locale); return <div key={exercise.id}><strong>{localizeExerciseName(exercise.exerciseId, exercise.name, locale)}</strong><span className="history-exercise-meta">{localizeMuscles(exercise.primaryMuscles, locale).join(" · ")}<span className={`movement-chip ${movement.tone}`}>{movement.category}</span></span><div className="history-set-list">{exercise.sets.map((set) => <span key={set.id}><span>{t("common.set")} {set.setNumber}: {setText(set)}</span><span><button aria-label={t("workout.editSet")} onClick={() => setEditing({ sessionId: detail.id, exerciseId: exercise.id, set, load: displayLoad(set.load, settings.unit) ?? 0 })}><Pencil size={14} /></button><button aria-label={t("workout.deleteSet")} onClick={() => deleteHistorySet(detail, exercise.id, set.id)}><Trash2 size={14} /></button></span></span>)}</div><small>{localizeRecommendation(recommendation(exercise), locale)}</small></div>; })}</section>}</div>}

      {editing && <ModalLayer onDismiss={() => setEditing(null)}><section className="modal set-editor-modal" role="dialog" aria-modal="true" aria-labelledby="history-set-editor-title" onClick={(event) => event.stopPropagation()}><header><div><span className="eyebrow">{t("workout.correctSet")}</span><h2 id="history-set-editor-title">{t("workout.editSet")}</h2></div><button className="icon-button" aria-label={t("common.close")} onClick={() => setEditing(null)}><X /></button></header><div className="number-fields"><NumberField label={t("workout.weight")} value={editing.load} suffix={settings.unit} min={0} step={settings.weightStep} onChange={(load) => setEditing({ ...editing, load })} /><NumberField label={t("workout.repetitions")} value={editing.set.reps} suffix={t("workout.repsShort")} min={1} step={1} onChange={(reps) => setEditing({ ...editing, set: { ...editing.set, reps } })} /></div><div className="rir-entry"><span>RIR</span><div>{[0, 1, 2, 3, 4].map((value) => <button key={value} className={editing.set.rir === value ? "active" : ""} onClick={() => setEditing({ ...editing, set: { ...editing.set, rir: value } })}>{value}{value === 4 ? "+" : ""}</button>)}</div></div><button className="primary-button wide" onClick={saveHistorySet}><Check size={18} /> {t("common.save")}</button></section></ModalLayer>}
      {undoSnapshot && <div className="undo-bar" role="status"><span>{t("workout.undoHelp")}</span><button onClick={undoHistoryChange}><Undo2 size={16} /> {t("common.undo")}</button><button aria-label={t("common.close")} onClick={() => setUndoSnapshot(null)}><X size={15} /></button></div>}
    </div>
  );
}

function MoreView({ sessions, planConfiguration, settings, onSettingsChange, onChange }: { sessions: WorkoutSession[]; planConfiguration: PlanConfiguration; settings: AppSettings; onSettingsChange: (settings: AppSettings) => Promise<void>; onChange: () => Promise<void> }) {
  const { locale, preference, setPreference, t } = useI18n();
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const completedCount = useMemo(() => sessions.filter((session) => session.status === "completed" && session.exercises.some((exercise) => exercise.sets.length)).length, [sessions]);

  function download(name: string, type: string, content: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    const rows = [`session_id,tag,datum,status,uebung,muskelgruppen,bewegungsmuster,satz,gewicht_${settings.unit},wiederholungen,rir`];
    for (const session of sessions) for (const exercise of session.exercises) for (const set of exercise.sets) rows.push([
      session.id,
      session.dayCode,
      session.completedAt ?? session.startedAt,
      session.status,
      `"${localizeExerciseName(exercise.exerciseId, exercise.name, locale).replaceAll('"', '""')}"`,
      `"${localizeMuscles(exercise.primaryMuscles, locale).join(" · ")}"`,
      exercise.movementPattern ?? movementPatternForExercise(exercise.exerciseId),
      set.setNumber,
      set.load === null ? "" : displayLoad(set.load, settings.unit),
      set.reps,
      set.rir ?? "",
    ].join(","));
    download("kraftwerk-training.csv", "text/csv;charset=utf-8", rows.join("\n"));
  }

  async function importJson(file: File | undefined) {
    if (!file) return;
    setImportStatus("idle");
    try {
      const backup = parseBackup(JSON.parse(await file.text()));
      if (!window.confirm(t("settings.confirmImport"))) return;
      await replaceAllData(backup.sessions, backup.planConfiguration, backup.settings);
      setPreference(backup.preferences.language);
      await onChange();
      setImportStatus("success");
    } catch {
      setImportStatus("error");
    }
  }

  async function clearData() {
    if (!window.confirm(t("settings.confirmDelete"))) return;
    try {
      await deleteAllData();
      await onChange();
    } catch { setImportStatus("error"); }
  }

  return (
    <div className="page settings-page">
      <header className="page-header"><div><span className="eyebrow">{t("settings.eyebrow")}</span><h1>{t("settings.title")}</h1><p>{t("settings.subtitle")}</p></div></header>
      <section className="settings-section"><h2>{t("settings.training")}</h2><div className="setting-row language-setting"><span><strong>{t("language.label")}</strong><small>{t("language.auto")}, DE, EN</small></span><LanguageSwitcher /></div><div className="setting-row"><span><strong>{t("settings.units")}</strong><small>{t("settings.unitsHelp")}</small></span><div className="segmented"><button aria-pressed={settings.unit === "kg"} className={settings.unit === "kg" ? "active" : ""} onClick={() => void onSettingsChange({ ...settings, unit: "kg", weightStep: defaultWeightStep("kg") })}>kg</button><button aria-pressed={settings.unit === "lb"} className={settings.unit === "lb" ? "active" : ""} onClick={() => void onSettingsChange({ ...settings, unit: "lb", weightStep: defaultWeightStep("lb") })}>lb</button></div></div><label className="setting-row"><span><strong>{t("settings.weightStep")}</strong><small>{t("settings.weightStepHelp")}</small></span><span className="setting-number"><input type="number" min="0.25" step="0.25" value={settings.weightStep} onChange={(event) => { const weightStep = Math.max(.25, Number(event.target.value) || defaultWeightStep(settings.unit)); void onSettingsChange({ ...settings, weightStep }); }} /> {settings.unit}</span></label><div className="setting-row"><span><strong>{t("settings.timer")}</strong><small>{t("settings.timerHelp")}</small></span><span>75–180 s</span></div></section>
      <section className="settings-section"><h2>{t("settings.source")}</h2><a className="settings-source-card" href="https://www.youtube.com/watch?v=I7UtSo0NTaA" target="_blank" rel="noreferrer"><span className="settings-source-icon"><Youtube size={25} /></span><span><strong>„MEHR MUSKELN in WENIGER ZEIT (kompletter Trainingsplan)“</strong><small>{t("settings.sourceDescription")}</small></span><span className="settings-source-action">{t("settings.sourceLink")} <ExternalLink size={16} /></span></a></section>
      <section className="settings-section"><h2>{t("settings.data")}</h2><div className="data-card"><div><strong>{completedCount} {t("settings.saved")}</strong><small>{t("settings.deviceOnly")}</small></div><span className="offline-pill"><span /> {t("settings.safe")}</span></div><p className="import-help">{t("settings.importHelp")}</p><div className="button-row"><button onClick={() => download("kraftwerk-training.json", "application/json", JSON.stringify(createBackup(sessions, planConfiguration, { language: preference }, settings), null, 2))}>{t("settings.exportJson")}</button><label className="import-button"><Upload size={17} /> {t("settings.importJson")}<input type="file" accept="application/json,.json" onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ""; void importJson(file); }} /></label><button onClick={exportCsv}>{t("settings.exportCsv")}</button></div>{importStatus !== "idle" && <p className={`import-status ${importStatus}`} role="status">{t(importStatus === "success" ? "settings.importSuccess" : "settings.importError")}</p>}<button className="danger-button" onClick={clearData}><Trash2 size={17} /> {t("settings.delete")}</button></section>
      <section className="settings-section about"><h2>{t("settings.about")}</h2><p>Version 0.1.0 · Local-first PWA</p><p>{t("settings.disclaimer")}</p></section>
    </div>
  );
}
