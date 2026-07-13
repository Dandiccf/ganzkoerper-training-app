import Link from "next/link";
import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Die Grundidee | Kraftwerk",
  description: "Warum drei Ganzkörpereinheiten mit wechselndem Schwerpunkt eine praktische Struktur für Hypertrophietraining bilden.",
};

const days = [
  {
    code: "A",
    name: "Druck-Fokus",
    description: "Brust und drückende Bewegungen eröffnen die Einheit schwer. Beine und Hüftstreckung bleiben leichter.",
    color: "var(--day-a)",
  },
  {
    code: "B",
    name: "Beine-Fokus",
    description: "Kniebeuge und Hüftstreckung bekommen die höchste Priorität. Der Oberkörper arbeitet in höheren Wiederholungsbereichen.",
    color: "var(--day-b)",
  },
  {
    code: "C",
    name: "Rücken-Fokus",
    description: "Zugbewegungen und Rücken starten schwer. Unterkörper und ergänzende Druckarbeit werden leichter dosiert.",
    color: "var(--day-c)",
  },
];

export default function ConceptPage() {
  return (
    <div className="concept-shell">
      <header className="concept-topbar">
        <Link href="/" className="concept-brand">
          <span><Dumbbell size={19} /></span>
          <strong>Kraftwerk</strong>
        </Link>
        <Link href="/" className="back-link"><ArrowLeft size={17} /> Zurück zur App</Link>
      </header>

      <main className="concept-page">
        <section className="concept-hero">
          <div className="concept-hero-copy">
            <span className="eyebrow">Die Grundidee</span>
            <h1>Dreimal Ganzkörper.<br />Jedes Mal ein anderer Schwerpunkt.</h1>
            <p>
              Der Plan verteilt das Muskelaufbautraining auf drei kompakte Einheiten. Der ganze Körper arbeitet jedes Mal –
              aber Druck, Beine und Rücken wechseln sich an der Spitze der Einheit ab.
            </p>
            <div className="concept-keyfacts">
              <span><strong>3×</strong> pro Woche</span>
              <span><strong>2</strong> Arbeitssätze je Übung</span>
              <span><strong>1–2</strong> Wiederholungen im Tank</span>
            </div>
          </div>
          <div className="rotation-visual" aria-label="Rotation der Trainingstage A, B und C">
            <div className="rotation-ring"><RotateCcw size={44} /></div>
            {days.map((day) => <span key={day.code} className={`orbit-day orbit-${day.code.toLowerCase()}`} style={{ background: day.color }}>{day.code}</span>)}
            <small>Belasten · erholen · steigern</small>
          </div>
        </section>

        <section className="concept-origin" aria-labelledby="concept-origin-title">
          <span className="origin-icon"><Youtube /></span>
          <div>
            <span className="eyebrow">Konzeptionelle Quelle</span>
            <h2 id="concept-origin-title">Die Idee begann mit einem Video.</h2>
            <p>
              Zentrale Grundlage für dieses Trainingsprogramm ist das Video <strong>„MEHR MUSKELN in WENIGER ZEIT (kompletter Trainingsplan)“</strong> von Dennis Ratano.
              Die App überführt die dort vermittelte Grundidee in eine flexible A/B/C-Rotation mit Trainingsprotokoll, freier Übungsreihenfolge und anpassbarer Satzanzahl.
            </p>
            <a href="https://www.youtube.com/watch?v=I7UtSo0NTaA" target="_blank" rel="noreferrer"><Youtube size={18} /> Originalvideo auf YouTube ansehen <ExternalLink size={16} /></a>
          </div>
        </section>

        <section className="concept-lead concept-narrow">
          <span className="chapter-number">01</span>
          <div>
            <span className="eyebrow">Das Prinzip</span>
            <h2>Qualität verteilen, statt Ermüdung zu sammeln</h2>
            <p className="large-copy">
              Ein Muskel braucht einen ausreichend starken Trainingsreiz – aber nicht möglichst viele erschöpfte Sätze in einer einzigen Einheit.
              Dieser Plan verteilt das Volumen über die Woche. So beginnen die wichtigen Bewegungen regelmäßig mit hoher Konzentration,
              während die einzelne Einheit überschaubar und regenerierbar bleibt.
            </p>
            <p>
              Die Frequenz ist dabei kein magischer Wachstumsfaktor. Ihr praktischer Vorteil liegt darin, hochwertige Sätze,
              Bewegungspraxis und Progression sinnvoll über die Woche zu organisieren.
            </p>
          </div>
        </section>

        <section className="concept-section">
          <div className="concept-heading">
            <span className="eyebrow">Die Rotation</span>
            <h2>Jeder Tag trainiert alles.<br />Die Priorität wandert.</h2>
          </div>
          <div className="focus-grid">
            {days.map((day, index) => (
              <article key={day.code} className="focus-card" style={{ "--focus-color": day.color } as React.CSSProperties}>
                <div className="focus-card-top"><span>{day.code}</span><small>0{index + 1}</small></div>
                <h3>{day.name}</h3>
                <p>{day.description}</p>
                <div className="focus-rule"><strong>{day.code === "B" ? "Unterkörper" : "Oberkörper"} schwer</strong><span>6–10 Wdh.</span></div>
                <div className="focus-rule light"><strong>{day.code === "B" ? "Oberkörper" : "Unterkörper"} leichter</strong><span>15–25 Wdh.</span></div>
              </article>
            ))}
          </div>
        </section>

        <section className="concept-section hypertrophy-section">
          <div className="concept-heading light-heading">
            <span className="eyebrow">Ziel: Hypertrophie</span>
            <h2>Warum dieser Aufbau Muskeln wachsen lassen kann</h2>
            <p>Muskelaufbau entsteht nicht durch den Namen des Splits, sondern durch wiederholbare, progressive Trainingsreize.</p>
          </div>
          <div className="reason-grid">
            <Reason icon={<Focus />} title="Hochwertige Sätze" text="Zwei konzentrierte Arbeitssätze werden nah genug am Muskelversagen ausgeführt, ohne die Technik unnötig zu opfern." />
            <Reason icon={<Repeat2 />} title="Wiederholte Kontakte" text="Jede Bewegungsfamilie taucht mehrmals in der Rotation auf. Das verteilt Praxis und Belastung über die Woche." />
            <Reason icon={<BatteryCharging />} title="Steuerbare Ermüdung" text="Der wechselnde Fokus verhindert, dass jeder Bereich in jeder Einheit maximal schwer belastet werden muss." />
            <Reason icon={<TrendingUp />} title="Messbare Progression" text="Mehr saubere Wiederholungen, etwas mehr Last oder eine schwerere Variante liefern den langfristigen Wachstumsreiz." />
          </div>
        </section>

        <section className="concept-section quality-section">
          <div className="quality-copy">
            <span className="eyebrow">Zwei gute Sätze</span>
            <h2>„Perfekt“ heißt nicht maximal zerstörerisch</h2>
            <p>
              Ein guter Arbeitssatz ist kontrolliert, reproduzierbar und endet nah am technischen Muskelversagen.
              Das Ziel sind meistens noch ein bis zwei mögliche saubere Wiederholungen – RIR 1–2.
            </p>
            <div className="quality-note"><ShieldCheck /><span><strong>Technisches Versagen ist die Grenze.</strong> Sobald Bewegungsweg oder Kontrolle deutlich zerfallen, ist der Satz vorbei.</span></div>
          </div>
          <ol className="quality-list">
            <li><span>01</span><div><strong>Passende Last wählen</strong><small>Der Zielbereich soll mit stabiler Technik erreichbar sein.</small></div></li>
            <li><span>02</span><div><strong>Wiederholungen kontrollieren</strong><small>Keine erzwungenen Wiederholungen und kein unnötiger Schwung.</small></div></li>
            <li><span>03</span><div><strong>Bei RIR 1–2 stoppen</strong><small>Nah am Limit, aber mit Reserve für Erholung und die nächste Einheit.</small></div></li>
            <li><span>04</span><div><strong>Leistung dokumentieren</strong><small>Nur messbare Sätze können gezielt gesteigert werden.</small></div></li>
          </ol>
        </section>

        <section className="concept-section rep-section">
          <div className="concept-heading">
            <span className="eyebrow">Schwer und leicht</span>
            <h2>Verschiedene Wiederholungsbereiche, dasselbe Ziel</h2>
            <p>„Leicht“ beschreibt hier die Last, nicht die Anstrengung. Auch ein Satz mit 15–25 Wiederholungen endet fordernd.</p>
          </div>
          <div className="rep-spectrum">
            <div className="rep-block heavy"><span>6–10</span><div><strong>Schwere Grundbewegungen</strong><small>Hohe mechanische Spannung, lange Satzpausen</small></div></div>
            <div className="rep-block medium"><span>8–12</span><div><strong>Isolation und Core</strong><small>Kontrollierbar, zielgerichtet, gut messbar</small></div></div>
            <div className="rep-block light"><span>15–25</span><div><strong>Leichtere Ganzkörperarbeit</strong><small>Weniger absolute Last, hoher lokaler Reiz</small></div></div>
          </div>
        </section>

        <section className="concept-section week-section">
          <div className="concept-heading">
            <span className="eyebrow">Die Woche</span>
            <h2>Rotation statt starrer Wochentage</h2>
            <p>Zwischen zwei Einheiten liegen normalerweise ein bis zwei Ruhetage. Verpasste Tage werden nicht nachgeholt – die Rotation läuft einfach weiter.</p>
          </div>
          <div className="week-line">
            <WeekDay label="Mo" code="A" text="Druck" color="var(--day-a)" />
            <WeekDay label="Di" text="Erholung" />
            <WeekDay label="Mi" code="B" text="Beine" color="var(--day-b)" />
            <WeekDay label="Do" text="Erholung" />
            <WeekDay label="Fr" code="C" text="Rücken" color="var(--day-c)" />
            <WeekDay label="Sa/So" text="Erholung" />
          </div>
          <div className="week-principles">
            <span><Timer /> etwa 50–65 Minuten</span>
            <span><Sparkles /> 18 Arbeitssätze pro Einheit</span>
            <span><BatteryCharging /> 1–2 Ruhetage dazwischen</span>
          </div>
        </section>

        <section className="concept-section progression-section">
          <div>
            <span className="eyebrow">Der langfristige Motor</span>
            <h2>Das nächste Training knapp schlagen</h2>
            <p>
              Muskelwachstum braucht progressive Überlastung. Das bedeutet nicht, bei jedem Besuch zwanghaft Gewicht aufzulegen.
              Eine zusätzliche saubere Wiederholung ist bereits Fortschritt.
            </p>
          </div>
          <div className="progression-ladder">
            <span><CheckCircle2 /> Zielbereich erreichen</span>
            <span><CheckCircle2 /> Wiederholungen stabilisieren</span>
            <span><CheckCircle2 /> RIR und Technik halten</span>
            <span><TrendingUp /> Last leicht erhöhen</span>
          </div>
        </section>

        <section className="concept-disclaimer">
          <ShieldCheck />
          <div><strong>Ein Plan ist ein Rahmen, kein Dogma.</strong><p>Schmerz, anhaltender Leistungsabfall oder schlechte Regeneration sind Gründe, Last, Übung oder Trainingshäufigkeit anzupassen. Trainingshinweise ersetzen keine medizinische Beratung.</p></div>
        </section>

        <section className="concept-sources">
          <span className="eyebrow">Hintergrund & Quellen</span>
          <h2>Woher die Idee kommt</h2>
          <p>Die konzeptionelle Basis bildet Dennis Ratanos Video. Übungsauswahl und Ausgestaltung wurden anhand der archivierten Originalvorlagen dieses Projekts konkretisiert und durch wissenschaftliche Übersichtsarbeiten eingeordnet.</p>
          <div className="source-links">
            <a href="https://www.youtube.com/watch?v=I7UtSo0NTaA" target="_blank" rel="noreferrer"><span><strong>MEHR MUSKELN in WENIGER ZEIT</strong><small>Video von Dennis Ratano · zentrale konzeptionelle Grundlage</small></span><ExternalLink /></a>
            <a href="https://pubmed.ncbi.nlm.nih.gov/30558493/" target="_blank" rel="noreferrer"><span><strong>Trainingsfrequenz und Hypertrophie</strong><small>Systematische Übersichtsarbeit und Meta-Analyse</small></span><ExternalLink /></a>
            <a href="https://pubmed.ncbi.nlm.nih.gov/36334240/" target="_blank" rel="noreferrer"><span><strong>Nähe zum Muskelversagen</strong><small>Systematische Übersichtsarbeit mit Meta-Analyse</small></span><ExternalLink /></a>
          </div>
        </section>
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
