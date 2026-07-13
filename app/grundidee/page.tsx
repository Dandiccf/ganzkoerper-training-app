"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowLeft,
  BatteryCharging,
  CheckCircle2,
  Dumbbell,
  ExternalLink,
  Focus,
  Repeat2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Youtube,
} from "lucide-react";
import { LanguageSwitcher, useI18n } from "@/src/lib/i18n";

const copy = {
  de: {
    back: "Zurück zur App",
    heroEyebrow: "Die Grundidee",
    heroTitle: <>Dreimal Ganzkörper.<br />Jedes Mal ein anderer Schwerpunkt.</>,
    heroText: "Der Plan verteilt das Muskelaufbautraining auf drei kompakte Einheiten. Der ganze Körper arbeitet jedes Mal – aber Druck, Beine und Rücken wechseln sich an der Spitze der Einheit ab.",
    facts: ["pro Woche", "Arbeitssätze je Übung", "Wiederholungen im Tank"],
    rotationAria: "Rotation der Trainingstage A, B und C",
    rotationText: "Belasten · erholen · steigern",
    originEyebrow: "Konzeptionelle Quelle",
    originTitle: "Die Idee begann mit einem Video.",
    originBefore: "Zentrale Grundlage für dieses Trainingsprogramm ist das Video",
    originAfter: "von Dennis Ratano. Die App überführt die dort vermittelte Grundidee in eine flexible A/B/C-Rotation mit Trainingsprotokoll, freier Übungsreihenfolge und anpassbarer Satzanzahl.",
    originLink: "Originalvideo auf YouTube ansehen",
    principleEyebrow: "Das Prinzip",
    principleTitle: "Qualität verteilen, statt Ermüdung zu sammeln",
    principleLead: "Ein Muskel braucht einen ausreichend starken Trainingsreiz – aber nicht möglichst viele erschöpfte Sätze in einer einzigen Einheit. Dieser Plan verteilt das Volumen über die Woche. So beginnen die wichtigen Bewegungen regelmäßig mit hoher Konzentration, während die einzelne Einheit überschaubar und regenerierbar bleibt.",
    principleText: "Die Frequenz ist dabei kein magischer Wachstumsfaktor. Ihr praktischer Vorteil liegt darin, hochwertige Sätze, Bewegungspraxis und Progression sinnvoll über die Woche zu organisieren.",
    rotationEyebrow: "Die Rotation",
    rotationTitle: <>Jeder Tag trainiert alles.<br />Die Priorität wandert.</>,
    heavy: "schwer",
    lighter: "leichter",
    repShort: "Wdh.",
    upper: "Oberkörper",
    lower: "Unterkörper",
    days: [
      { code: "A", name: "Druck-Fokus", description: "Brust und drückende Bewegungen eröffnen die Einheit schwer. Beine und Hüftstreckung bleiben leichter.", color: "var(--day-a)" },
      { code: "B", name: "Beine-Fokus", description: "Kniebeuge und Hüftstreckung bekommen die höchste Priorität. Der Oberkörper arbeitet in höheren Wiederholungsbereichen.", color: "var(--day-b)" },
      { code: "C", name: "Rücken-Fokus", description: "Zugbewegungen und Rücken starten schwer. Unterkörper und ergänzende Druckarbeit werden leichter dosiert.", color: "var(--day-c)" },
    ],
    hypertrophyEyebrow: "Ziel: Hypertrophie",
    hypertrophyTitle: "Warum dieser Aufbau Muskeln wachsen lassen kann",
    hypertrophyText: "Muskelaufbau entsteht nicht durch den Namen des Splits, sondern durch wiederholbare, progressive Trainingsreize.",
    reasons: [
      ["Hochwertige Sätze", "Zwei konzentrierte Arbeitssätze werden nah genug am Muskelversagen ausgeführt, ohne die Technik unnötig zu opfern."],
      ["Wiederholte Kontakte", "Jede Bewegungsfamilie taucht mehrmals in der Rotation auf. Das verteilt Praxis und Belastung über die Woche."],
      ["Steuerbare Ermüdung", "Der wechselnde Fokus verhindert, dass jeder Bereich in jeder Einheit maximal schwer belastet werden muss."],
      ["Messbare Progression", "Mehr saubere Wiederholungen, etwas mehr Last oder eine schwerere Variante liefern den langfristigen Wachstumsreiz."],
    ],
    qualityEyebrow: "Zwei gute Sätze",
    qualityTitle: "„Perfekt“ heißt nicht maximal zerstörerisch",
    qualityText: "Ein guter Arbeitssatz ist kontrolliert, reproduzierbar und endet nah am technischen Muskelversagen. Das Ziel sind meistens noch ein bis zwei mögliche saubere Wiederholungen – RIR 1–2.",
    qualityNoteTitle: "Technisches Versagen ist die Grenze.",
    qualityNoteText: "Sobald Bewegungsweg oder Kontrolle deutlich zerfallen, ist der Satz vorbei.",
    qualitySteps: [
      ["Passende Last wählen", "Der Zielbereich soll mit stabiler Technik erreichbar sein."],
      ["Wiederholungen kontrollieren", "Keine erzwungenen Wiederholungen und kein unnötiger Schwung."],
      ["Bei RIR 1–2 stoppen", "Nah am Limit, aber mit Reserve für Erholung und die nächste Einheit."],
      ["Leistung dokumentieren", "Nur messbare Sätze können gezielt gesteigert werden."],
    ],
    repsEyebrow: "Schwer und leicht",
    repsTitle: "Verschiedene Wiederholungsbereiche, dasselbe Ziel",
    repsText: "„Leicht“ beschreibt hier die Last, nicht die Anstrengung. Auch ein Satz mit 15–25 Wiederholungen endet fordernd.",
    repBlocks: [
      ["Schwere Grundbewegungen", "Hohe mechanische Spannung, lange Satzpausen"],
      ["Isolation und Core", "Kontrollierbar, zielgerichtet, gut messbar"],
      ["Leichtere Ganzkörperarbeit", "Weniger absolute Last, hoher lokaler Reiz"],
    ],
    weekEyebrow: "Die Woche",
    weekTitle: "Rotation statt starrer Wochentage",
    weekText: "Zwischen zwei Einheiten liegen normalerweise ein bis zwei Ruhetage. Verpasste Tage werden nicht nachgeholt – die Rotation läuft einfach weiter.",
    weekdays: [["Mo", "Druck"], ["Di", "Erholung"], ["Mi", "Beine"], ["Do", "Erholung"], ["Fr", "Rücken"], ["Sa/So", "Erholung"]],
    principles: ["etwa 50–65 Minuten", "18 Arbeitssätze pro Einheit", "1–2 Ruhetage dazwischen"],
    progressionEyebrow: "Der langfristige Motor",
    progressionTitle: "Das nächste Training knapp schlagen",
    progressionText: "Muskelwachstum braucht progressive Überlastung. Das bedeutet nicht, bei jedem Besuch zwanghaft Gewicht aufzulegen. Eine zusätzliche saubere Wiederholung ist bereits Fortschritt.",
    progressionSteps: ["Zielbereich erreichen", "Wiederholungen stabilisieren", "RIR und Technik halten", "Last leicht erhöhen"],
    disclaimerTitle: "Ein Plan ist ein Rahmen, kein Dogma.",
    disclaimerText: "Schmerz, anhaltender Leistungsabfall oder schlechte Regeneration sind Gründe, Last, Übung oder Trainingshäufigkeit anzupassen. Trainingshinweise ersetzen keine medizinische Beratung.",
    sourcesEyebrow: "Hintergrund & Quellen",
    sourcesTitle: "Woher die Idee kommt",
    sourcesText: "Die konzeptionelle Basis bildet Dennis Ratanos Video. Übungsauswahl und Ausgestaltung wurden anhand der archivierten Originalvorlagen dieses Projekts konkretisiert und durch wissenschaftliche Übersichtsarbeiten eingeordnet.",
    sourceItems: [["MEHR MUSKELN in WENIGER ZEIT", "Video von Dennis Ratano · zentrale konzeptionelle Grundlage"], ["Trainingsfrequenz und Hypertrophie", "Systematische Übersichtsarbeit und Meta-Analyse"], ["Nähe zum Muskelversagen", "Systematische Übersichtsarbeit mit Meta-Analyse"]],
  },
  en: {
    back: "Back to the app",
    heroEyebrow: "The concept",
    heroTitle: <>Three full-body sessions.<br />A different priority every time.</>,
    heroText: "The plan distributes hypertrophy training across three compact sessions. The whole body works every time, while push, legs, and back rotate to the front of the session.",
    facts: ["per week", "working sets per exercise", "reps in reserve"],
    rotationAria: "Rotation of training days A, B, and C",
    rotationText: "Train · recover · progress",
    originEyebrow: "Concept source",
    originTitle: "The idea started with a video.",
    originBefore: "The central foundation for this training program is the video",
    originAfter: "by Dennis Ratano. The app turns its core concept into a flexible A/B/C rotation with workout logging, free exercise order, and adjustable set counts.",
    originLink: "Watch the original on YouTube",
    principleEyebrow: "The principle",
    principleTitle: "Distribute quality instead of accumulating fatigue",
    principleLead: "A muscle needs a sufficiently strong training stimulus, not the maximum number of exhausted sets in one session. This plan distributes volume across the week, so important movements regularly start with high concentration while each session remains manageable and recoverable.",
    principleText: "Frequency is not a magical growth factor. Its practical advantage is that it organizes high-quality sets, movement practice, and progression sensibly across the week.",
    rotationEyebrow: "The rotation",
    rotationTitle: <>Every day trains everything.<br />The priority moves.</>,
    heavy: "heavy",
    lighter: "lighter",
    repShort: "reps",
    upper: "Upper body",
    lower: "Lower body",
    days: [
      { code: "A", name: "Push Focus", description: "Chest and pressing movements open the session heavy. Legs and hip extension stay lighter.", color: "var(--day-a)" },
      { code: "B", name: "Leg Focus", description: "Squatting and hip extension receive the highest priority. The upper body works in higher repetition ranges.", color: "var(--day-b)" },
      { code: "C", name: "Back Focus", description: "Pulling movements and back work start heavy. Lower-body and supporting press work are dosed more lightly.", color: "var(--day-c)" },
    ],
    hypertrophyEyebrow: "Goal: hypertrophy",
    hypertrophyTitle: "Why this structure can build muscle",
    hypertrophyText: "Muscle growth does not come from the name of a split, but from repeatable, progressive training stimuli.",
    reasons: [
      ["High-quality sets", "Two focused working sets are taken close enough to muscular failure without sacrificing technique unnecessarily."],
      ["Repeated exposure", "Each movement family appears several times in the rotation, distributing practice and load across the week."],
      ["Manageable fatigue", "The rotating priority prevents every area from being trained maximally heavy in every session."],
      ["Measurable progression", "More clean repetitions, slightly more load, or a harder variation provide the long-term growth stimulus."],
    ],
    qualityEyebrow: "Two strong sets",
    qualityTitle: "“Perfect” does not mean maximally destructive",
    qualityText: "A good working set is controlled, repeatable, and ends close to technical muscular failure. The usual target is one or two clean repetitions still in reserve — RIR 1–2.",
    qualityNoteTitle: "Technical failure is the boundary.",
    qualityNoteText: "When range of motion or control clearly breaks down, the set is over.",
    qualitySteps: [
      ["Choose an appropriate load", "The target range should be achievable with stable technique."],
      ["Control every repetition", "No forced repetitions and no unnecessary momentum."],
      ["Stop at RIR 1–2", "Close to the limit, with enough reserve for recovery and the next session."],
      ["Record performance", "Only measurable sets can be progressed deliberately."],
    ],
    repsEyebrow: "Heavy and light",
    repsTitle: "Different repetition ranges, the same goal",
    repsText: "“Light” describes the load, not the effort. A set of 15–25 repetitions still ends up demanding.",
    repBlocks: [["Heavy compound movements", "High mechanical tension and long rest periods"], ["Isolation and core", "Controllable, targeted, and easy to measure"], ["Lighter full-body work", "Lower absolute load with a strong local stimulus"]],
    weekEyebrow: "The week",
    weekTitle: "Rotation instead of rigid weekdays",
    weekText: "There are usually one or two rest days between sessions. Missed days are not made up; the rotation simply continues.",
    weekdays: [["Mon", "Push"], ["Tue", "Recovery"], ["Wed", "Legs"], ["Thu", "Recovery"], ["Fri", "Back"], ["Sat/Sun", "Recovery"]],
    principles: ["about 50–65 minutes", "18 working sets per session", "1–2 rest days between sessions"],
    progressionEyebrow: "The long-term engine",
    progressionTitle: "Slightly beat your last workout",
    progressionText: "Muscle growth requires progressive overload. That does not mean forcing more weight every visit. One additional clean repetition already counts as progress.",
    progressionSteps: ["Reach the target range", "Stabilize repetitions", "Maintain RIR and technique", "Increase the load slightly"],
    disclaimerTitle: "A plan is a framework, not a dogma.",
    disclaimerText: "Pain, persistent performance decline, or poor recovery are reasons to adjust load, exercise, or training frequency. Training guidance is not medical advice.",
    sourcesEyebrow: "Background & sources",
    sourcesTitle: "Where the idea comes from",
    sourcesText: "Dennis Ratano's video provides the conceptual foundation. Exercise selection and implementation were refined using the project's archived original references and contextualized with scientific reviews.",
    sourceItems: [["MORE MUSCLE IN LESS TIME", "Video by Dennis Ratano · central conceptual foundation"], ["Training frequency and hypertrophy", "Systematic review and meta-analysis"], ["Proximity to muscular failure", "Systematic review with meta-analysis"]],
  },
} as const;

export default function ConceptPage() {
  const { locale } = useI18n();
  const c = copy[locale];
  const reasonIcons = [<Focus key="focus" />, <Repeat2 key="repeat" />, <BatteryCharging key="battery" />, <TrendingUp key="trend" />];
  const sourceUrls = ["https://www.youtube.com/watch?v=I7UtSo0NTaA", "https://pubmed.ncbi.nlm.nih.gov/30558493/", "https://pubmed.ncbi.nlm.nih.gov/36334240/"];
  useEffect(() => {
    document.title = locale === "de" ? "Die Grundidee | Kraftwerk" : "The Concept | Kraftwerk";
  }, [locale]);
  return (
    <div className="concept-shell">
      <header className="concept-topbar">
        <Link href="/" className="concept-brand"><span><Dumbbell size={19} /></span><strong>Kraftwerk</strong></Link>
        <div className="concept-topbar-actions"><LanguageSwitcher compact /><Link href="/" className="back-link"><ArrowLeft size={17} /> {c.back}</Link></div>
      </header>

      <main className="concept-page">
        <section className="concept-hero">
          <div className="concept-hero-copy"><span className="eyebrow">{c.heroEyebrow}</span><h1>{c.heroTitle}</h1><p>{c.heroText}</p><div className="concept-keyfacts"><span><strong>3×</strong> {c.facts[0]}</span><span><strong>2</strong> {c.facts[1]}</span><span><strong>1–2</strong> {c.facts[2]}</span></div></div>
          <div className="rotation-visual" aria-label={c.rotationAria}><div className="rotation-ring"><RotateCcw size={44} /></div>{c.days.map((day) => <span key={day.code} className={`orbit-day orbit-${day.code.toLowerCase()}`} style={{ background: day.color }}>{day.code}</span>)}<small>{c.rotationText}</small></div>
        </section>

        <section className="concept-origin" aria-labelledby="concept-origin-title"><span className="origin-icon"><Youtube /></span><div><span className="eyebrow">{c.originEyebrow}</span><h2 id="concept-origin-title">{c.originTitle}</h2><p>{c.originBefore} <strong>“MEHR MUSKELN in WENIGER ZEIT (kompletter Trainingsplan)”</strong> {c.originAfter}</p><a href={sourceUrls[0]} target="_blank" rel="noreferrer"><Youtube size={18} /> {c.originLink} <ExternalLink size={16} /></a></div></section>

        <section className="concept-lead concept-narrow"><span className="chapter-number">01</span><div><span className="eyebrow">{c.principleEyebrow}</span><h2>{c.principleTitle}</h2><p className="large-copy">{c.principleLead}</p><p>{c.principleText}</p></div></section>

        <section className="concept-section"><div className="concept-heading"><span className="eyebrow">{c.rotationEyebrow}</span><h2>{c.rotationTitle}</h2></div><div className="focus-grid">{c.days.map((day, index) => <article key={day.code} className="focus-card" style={{ "--focus-color": day.color } as React.CSSProperties}><div className="focus-card-top"><span>{day.code}</span><small>0{index + 1}</small></div><h3>{day.name}</h3><p>{day.description}</p><div className="focus-rule"><strong>{day.code === "B" ? c.lower : c.upper} {c.heavy}</strong><span>6–10 {c.repShort}</span></div><div className="focus-rule light"><strong>{day.code === "B" ? c.upper : c.lower} {c.lighter}</strong><span>15–25 {c.repShort}</span></div></article>)}</div></section>

        <section className="concept-section hypertrophy-section"><div className="concept-heading light-heading"><span className="eyebrow">{c.hypertrophyEyebrow}</span><h2>{c.hypertrophyTitle}</h2><p>{c.hypertrophyText}</p></div><div className="reason-grid">{c.reasons.map(([title, text], index) => <Reason key={title} icon={reasonIcons[index]} title={title} text={text} />)}</div></section>

        <section className="concept-section quality-section"><div className="quality-copy"><span className="eyebrow">{c.qualityEyebrow}</span><h2>{c.qualityTitle}</h2><p>{c.qualityText}</p><div className="quality-note"><ShieldCheck /><span><strong>{c.qualityNoteTitle}</strong> {c.qualityNoteText}</span></div></div><ol className="quality-list">{c.qualitySteps.map(([title, text], index) => <li key={title}><span>0{index + 1}</span><div><strong>{title}</strong><small>{text}</small></div></li>)}</ol></section>

        <section className="concept-section rep-section"><div className="concept-heading"><span className="eyebrow">{c.repsEyebrow}</span><h2>{c.repsTitle}</h2><p>{c.repsText}</p></div><div className="rep-spectrum">{["6–10", "8–12", "15–25"].map((range, index) => <div key={range} className={`rep-block ${index === 1 ? "medium" : index === 2 ? "light" : "heavy"}`}><span>{range}</span><div><strong>{c.repBlocks[index][0]}</strong><small>{c.repBlocks[index][1]}</small></div></div>)}</div></section>

        <section className="concept-section week-section"><div className="concept-heading"><span className="eyebrow">{c.weekEyebrow}</span><h2>{c.weekTitle}</h2><p>{c.weekText}</p></div><div className="week-line">{c.weekdays.map(([label, text], index) => <WeekDay key={label} label={label} code={index % 2 === 0 && index < 5 ? (["A", "B", "C"] as const)[index / 2] : undefined} text={text} color={index === 0 ? "var(--day-a)" : index === 2 ? "var(--day-b)" : index === 4 ? "var(--day-c)" : undefined} />)}</div><div className="week-principles"><span><Timer /> {c.principles[0]}</span><span><Sparkles /> {c.principles[1]}</span><span><BatteryCharging /> {c.principles[2]}</span></div></section>

        <section className="concept-section progression-section"><div><span className="eyebrow">{c.progressionEyebrow}</span><h2>{c.progressionTitle}</h2><p>{c.progressionText}</p></div><div className="progression-ladder">{c.progressionSteps.map((step, index) => <span key={step}>{index === 3 ? <TrendingUp /> : <CheckCircle2 />} {step}</span>)}</div></section>

        <section className="concept-disclaimer"><ShieldCheck /><div><strong>{c.disclaimerTitle}</strong><p>{c.disclaimerText}</p></div></section>

        <section className="concept-sources"><span className="eyebrow">{c.sourcesEyebrow}</span><h2>{c.sourcesTitle}</h2><p>{c.sourcesText}</p><div className="source-links">{c.sourceItems.map(([title, description], index) => <a key={title} href={sourceUrls[index]} target="_blank" rel="noreferrer"><span><strong>{title}</strong><small>{description}</small></span><ExternalLink /></a>)}</div></section>
      </main>
    </div>
  );
}

function Reason({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="reason-card"><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>;
}

function WeekDay({ label, code, text, color }: { label: string; code?: string; text: string; color?: string }) {
  return <div className={code ? "week-day training" : "week-day"}><small>{label}</small>{code ? <span style={{ background: color }}>{code}</span> : <span className="rest-dot" />}<strong>{text}</strong></div>;
}
