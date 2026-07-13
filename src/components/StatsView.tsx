"use client";

import { Activity, BarChart3, Dumbbell, Scale, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import type { WorkoutSession } from "@/src/lib/domain";
import { localizeExerciseName, localizeMovement, localizeMuscles, useI18n } from "@/src/lib/i18n";
import { movementMeta, movementPatternForExercise } from "@/src/lib/schema";
import { displayLoad, type AppSettings } from "@/src/lib/settings";

type Range = "8w" | "6m" | "all";
type Bucket = { key: string; label: string; sessions: number; sets: number; volume: number };

function day(value: string | undefined) {
  return value ? new Date(value) : new Date(0);
}

function weekStart(value: Date) {
  const result = new Date(value);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

function compact(value: number, locale: "de" | "en") {
  return new Intl.NumberFormat(locale === "de" ? "de-AT" : "en-GB", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function LineChart({ values, labels, ariaLabel }: { values: number[]; labels: string[]; ariaLabel: string }) {
  const width = 700;
  const height = 210;
  const pad = 22;
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => {
    const x = values.length <= 1 ? width / 2 : pad + index * ((width - pad * 2) / (values.length - 1));
    const y = height - pad - (value / max) * (height - pad * 2);
    return { x, y, value };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = points.length ? `${pad},${height - pad} ${line} ${points.at(-1)!.x},${height - pad}` : "";

  return (
    <div className="stats-chart-wrap">
      <svg className="stats-line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
        <defs><linearGradient id="stats-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--green)" stopOpacity=".32" /><stop offset="1" stopColor="var(--green)" stopOpacity="0" /></linearGradient></defs>
        {[0, .25, .5, .75, 1].map((tick) => <line key={tick} x1={pad} x2={width - pad} y1={pad + tick * (height - pad * 2)} y2={pad + tick * (height - pad * 2)} />)}
        {points.length > 0 && <><polygon points={area} fill="url(#stats-area)" /><polyline points={line} /><g>{points.map((point, index) => <circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r="5"><title>{labels[index]}: {Math.round(point.value)}</title></circle>)}</g></>}
      </svg>
      <div className="stats-chart-labels">{labels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div>
    </div>
  );
}

export function StatsView({ sessions, settings }: { sessions: WorkoutSession[]; settings: AppSettings }) {
  const { locale, t } = useI18n();
  const [range, setRange] = useState<Range>("8w");
  const exerciseOptions = useMemo(() => {
    const values = new Map<string, string>();
    sessions.forEach((session) => session.exercises.forEach((exercise) => {
      if (exercise.sets.length) values.set(exercise.exerciseId, localizeExerciseName(exercise.exerciseId, exercise.name, locale));
    }));
    return [...values].sort((a, b) => a[1].localeCompare(b[1], locale));
  }, [locale, sessions]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const activeExercise = exerciseOptions.some(([id]) => id === selectedExercise) ? selectedExercise : exerciseOptions[0]?.[0] ?? "";

  const filtered = useMemo(() => {
    if (range === "all") return sessions;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (range === "8w" ? 56 : 183));
    return sessions.filter((session) => day(session.completedAt) >= cutoff);
  }, [range, sessions]);

  const buckets = useMemo(() => {
    const monthly = range === "6m";
    const map = new Map<string, Bucket>();
    const now = new Date();
    const count = range === "8w" ? 8 : range === "6m" ? 6 : 0;
    for (let offset = count - 1; offset >= 0; offset -= 1) {
      const date = new Date(now);
      if (monthly) date.setMonth(date.getMonth() - offset, 1);
      else date.setDate(date.getDate() - offset * 7);
      const start = monthly ? new Date(date.getFullYear(), date.getMonth(), 1) : weekStart(date);
      const key = monthly ? `${start.getFullYear()}-${start.getMonth()}` : start.toISOString().slice(0, 10);
      const label = new Intl.DateTimeFormat(locale === "de" ? "de-AT" : "en-GB", monthly ? { month: "short" } : { day: "2-digit", month: "2-digit" }).format(start);
      map.set(key, { key, label, sessions: 0, sets: 0, volume: 0 });
    }
    filtered.forEach((session) => {
      const date = day(session.completedAt);
      const start = monthly ? new Date(date.getFullYear(), date.getMonth(), 1) : weekStart(date);
      const key = monthly ? `${start.getFullYear()}-${start.getMonth()}` : start.toISOString().slice(0, 10);
      const label = new Intl.DateTimeFormat(locale === "de" ? "de-AT" : "en-GB", monthly ? { month: "short", year: "2-digit" } : { day: "2-digit", month: "2-digit" }).format(start);
      const bucket = map.get(key) ?? { key, label, sessions: 0, sets: 0, volume: 0 };
      bucket.sessions += 1;
      session.exercises.forEach((exercise) => exercise.sets.forEach((set) => {
        bucket.sets += 1;
        bucket.volume += (set.load ?? 0) * set.reps;
      }));
      map.set(key, bucket);
    });
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  }, [filtered, locale, range]);

  const totalSets = filtered.reduce((sum, session) => sum + session.exercises.reduce((inner, exercise) => inner + exercise.sets.length, 0), 0);
  const totalVolumeKg = filtered.reduce((sum, session) => sum + session.exercises.reduce((inner, exercise) => inner + exercise.sets.reduce((sets, set) => sets + (set.load ?? 0) * set.reps, 0), 0), 0);
  const averageSets = filtered.length ? totalSets / filtered.length : 0;

  const exercisePoints = useMemo(() => filtered
    .map((session) => {
      const exercises = session.exercises.filter((exercise) => exercise.exerciseId === activeExercise && exercise.sets.length);
      const sets = exercises.flatMap((exercise) => exercise.sets);
      if (!sets.length) return null;
      const loaded = sets.filter((set) => set.load !== null);
      const score = loaded.length ? Math.max(...loaded.map((set) => set.load! * (1 + set.reps / 30))) : Math.max(...sets.map((set) => set.reps));
      return { date: day(session.completedAt), score };
    })
    .filter((point): point is { date: Date; score: number } => Boolean(point))
    .sort((a, b) => a.date.getTime() - b.date.getTime()), [activeExercise, filtered]);

  const muscleRows = useMemo(() => {
    const values = new Map<string, number>();
    filtered.forEach((session) => session.exercises.forEach((exercise) => {
      if (!exercise.sets.length) return;
      exercise.primaryMuscles.forEach((muscle) => values.set(muscle, (values.get(muscle) ?? 0) + exercise.sets.length));
    }));
    return [...values].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [filtered]);
  const maxMuscle = Math.max(1, ...muscleRows.map(([, sets]) => sets));

  const movementRows = useMemo(() => {
    const values = new Map<string, { label: string; sets: number; tone: string }>();
    filtered.forEach((session) => session.exercises.forEach((exercise) => {
      if (!exercise.sets.length) return;
      const pattern = exercise.movementPattern ?? movementPatternForExercise(exercise.exerciseId);
      const movement = localizeMovement(pattern, movementMeta(pattern), locale);
      const key = movement.category;
      const previous = values.get(key);
      values.set(key, { label: movement.category, tone: movement.tone, sets: (previous?.sets ?? 0) + exercise.sets.length });
    }));
    return [...values.values()].sort((a, b) => b.sets - a.sets);
  }, [filtered, locale]);
  const maxMovement = Math.max(1, ...movementRows.map((row) => row.sets));
  const progression = exercisePoints.length > 1 && exercisePoints[0].score > 0
    ? ((exercisePoints.at(-1)!.score / exercisePoints[0].score) - 1) * 100
    : null;

  return (
    <div className="page stats-page">
      <header className="page-header"><div><span className="eyebrow">{t("stats.eyebrow")}</span><h1>{t("stats.title")}</h1><p>{t("stats.subtitle")}</p></div><div className="range-switch" aria-label={t("stats.range")}><button aria-pressed={range === "8w"} className={range === "8w" ? "active" : ""} onClick={() => setRange("8w")}>{t("stats.eightWeeks")}</button><button aria-pressed={range === "6m"} className={range === "6m" ? "active" : ""} onClick={() => setRange("6m")}>{t("stats.sixMonths")}</button><button aria-pressed={range === "all"} className={range === "all" ? "active" : ""} onClick={() => setRange("all")}>{t("stats.all")}</button></div></header>

      <div className="stats-kpis"><article><Activity /><span>{t("stats.sessions")}</span><strong>{filtered.length}</strong></article><article><Dumbbell /><span>{t("stats.sets")}</span><strong>{totalSets}</strong><small>{averageSets.toFixed(1)} {t("stats.perSession")}</small></article><article><Scale /><span>{t("stats.externalVolume")}</span><strong>{compact(displayLoad(totalVolumeKg, settings.unit) ?? 0, locale)} {settings.unit}</strong></article><article><TrendingUp /><span>{t("stats.exerciseTrend")}</span><strong>{progression === null ? "–" : `${progression >= 0 ? "+" : ""}${progression.toFixed(1)}%`}</strong></article></div>

      {sessions.length === 0 ? <div className="empty-state"><BarChart3 size={38} /><h2>{t("stats.empty")}</h2><p>{t("stats.emptyHelp")}</p></div> : <>
        <section className="stats-card stats-wide"><header><div><span className="eyebrow">{t("stats.consistency")}</span><h2>{range === "6m" ? t("stats.monthlySets") : t("stats.weeklySets")}</h2></div></header><LineChart values={buckets.map((bucket) => bucket.sets)} labels={buckets.map((bucket) => bucket.label)} ariaLabel={t("stats.setChartLabel")} /></section>

        <div className="stats-grid">
          <section className="stats-card"><header><div><span className="eyebrow">{t("stats.progression")}</span><h2>{t("stats.byExercise")}</h2></div><select value={activeExercise} onChange={(event) => setSelectedExercise(event.target.value)} aria-label={t("stats.chooseExercise")}>{exerciseOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></header>{exercisePoints.length ? <LineChart values={exercisePoints.map((point) => displayLoad(point.score, settings.unit) ?? 0)} labels={exercisePoints.map((point) => new Intl.DateTimeFormat(locale === "de" ? "de-AT" : "en-GB", { day: "2-digit", month: "2-digit" }).format(point.date))} ariaLabel={t("stats.exerciseChartLabel")} /> : <p className="stats-empty-inline">{t("stats.noExerciseData")}</p>}<p className="stats-footnote">{t("stats.e1rmHelp")}</p></section>

          <section className="stats-card"><header><div><span className="eyebrow">{t("stats.balance")}</span><h2>{t("stats.movementBalance")}</h2></div></header><div className="balance-list">{movementRows.map((row) => <div key={row.label}><span><i className={row.tone} />{row.label}</span><div><i style={{ width: `${(row.sets / maxMovement) * 100}%` }} /></div><strong>{row.sets}</strong></div>)}</div><p className="stats-footnote">{t("stats.balanceHelp")}</p></section>
        </div>

        <section className="stats-card muscle-card"><header><div><span className="eyebrow">{t("stats.distribution")}</span><h2>{t("stats.byMuscle")}</h2></div></header><div className="muscle-bars">{muscleRows.map(([muscle, sets]) => <div key={muscle}><span>{localizeMuscles([muscle], locale)[0]}</span><div><i style={{ width: `${(sets / maxMuscle) * 100}%` }} /></div><strong>{sets} {t(sets === 1 ? "common.setSingular" : "common.sets")}</strong></div>)}</div></section>
      </>}
    </div>
  );
}
