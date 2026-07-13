# Kraftwerk – Ganzkörper Training App

Responsive, installierbare und local-first entwickelte Trainings-PWA auf Grundlage einer Ganzkörper-3-Tage-Rotation.

## App starten

Voraussetzung ist Node.js 22 oder neuer.

```bash
npm install
npm run dev
```

Anschließend ist die App unter `http://localhost:3000` erreichbar.

Qualitätschecks:

```bash
npm run validate:data
npm run check
```

## Implementierter Stand

- Trainingskonzept A/B/C ist definiert.
- Responsive App-Shell für Mobilgeräte, Tablet und Desktop.
- Heute-Ansicht mit automatischer A/B/C-Rotation.
- Vollständiger Planbrowser für alle 27 Übungen.
- Aktiver Trainingsmodus mit Last, Wiederholungen und RIR.
- Satzabschluss, Überspringen und Übungstausch für die aktuelle Session.
- Pausentimer auf Basis eines absoluten Endzeitpunkts.
- Automatische Wiederherstellung laufender Trainings nach einem Reload.
- Lokale Historie und einfache Progressionsempfehlungen.
- Datenexport als JSON und CSV.
- IndexedDB-Persistenz über Dexie und Service Worker für die PWA-App-Shell.
- Druckfertige PDF mit Wochenplan, Trainingstagen, Progression und Protokoll liegt vor.
- Alle drei Originalvorlagen wurden archiviert.
- 27 bereinigte Muskelgrafiken sind als App-Assets vorhanden.
- Der Trainingsplan liegt zusätzlich als strukturierte JSON-Datei vor.
- Für alle 27 Planübungen sind kuratierte, auswählbare Alternativen hinterlegt.
- Produkt-, Technik- und Umsetzungsplanung sind dokumentiert.

Noch nicht umgesetzt sind die laut Roadmap optionalen beziehungsweise späteren Phasen Cloud-Sync, Konto, Planeditor und Apple-Watch-App.

## Projektstruktur

```text
ganzkoerper-training-app/
├── app/                  # Next.js App Router, Manifest und Styles
├── src/
│   ├── components/       # App-Oberfläche und Trainingsmodus
│   └── lib/              # Domänenlogik, Schema und IndexedDB
├── public/               # PWA- und Muskelgrafik-Assets
├── data/
│   ├── exercise-alternatives.v1.json
│   └── training-plan.v1.json
├── design-assets/
│   ├── muscle-groups/
│   ├── previews/
│   ├── source-crops/
│   └── cover.png
├── docs/
│   ├── APP_PLAN.md
│   ├── DATA_MODEL.md
│   ├── EXERCISE_SUBSTITUTIONS.md
│   └── ROADMAP.md
├── pdf/
│   └── Trainingsplan-Ganzkoerper-3-Tage.pdf
├── references/
│   ├── 01-training-overview.png
│   ├── 02-training-days.png
│   └── 03-training-week.png
└── tools/
    └── pdf-generator/
```

## Kanonischer Trainingsplan

- Tag A: Druck-Fokus, Oberkörper schwer, Unterkörper leicht
- Tag B: Beine-Fokus, Unterkörper schwer, Oberkörper leicht
- Tag C: Rücken-Fokus, Oberkörper schwer, Unterkörper leicht
- Zwei Arbeitssätze pro Übung
- Zielintensität: 1–2 Wiederholungen im Tank (RIR 1–2)
- Rotation: A → 1–2 Ruhetage → B → 1–2 Ruhetage → C

## Technik

- Next.js 16 mit App Router
- React 19 und TypeScript im Strict Mode
- Zod zur Laufzeitvalidierung der Seed-Daten
- Dexie und IndexedDB für lokale Sessions
- Vitest für Domänenlogik
- ESLint und Production-Build als Qualitätsbarrieren

## Grundsatz

Die erste Version wird local-first und ohne zwingende Registrierung gebaut. Ein Training muss auch bei schlechtem oder fehlendem Netz vollständig durchgeführt und gespeichert werden können.
