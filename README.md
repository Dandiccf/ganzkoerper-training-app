# Kraftwerk – Ganzkörper Training App

Responsive, installierbare und local-first entwickelte Trainings-PWA auf Grundlage einer Ganzkörper-3-Tage-Rotation.

## App starten

Voraussetzung ist Node.js 22 oder neuer.

```bash
npm install
npm run dev
```

Anschließend ist die App unter `http://localhost:3000` erreichbar.

## Cloudflare Pages

Die Produktions-PWA wird als statischer Next.js-Export auf Cloudflare Pages gebaut:

```bash
make cloudflare-status
make cloudflare-deploy
```

Falls auf dem Rechner noch keine Cloudflare-Anmeldung vorhanden ist, vorher einmal `make cloudflare-login` ausführen. Der normale lokale Build bleibt davon unberührt. Das Deployment verwendet das separate Pages-Projekt `kraftwerk-training` und die kostenlose Adresse `https://kraftwerk-training.pages.dev`.

Das Makefile enthält keine Zugangsdaten. Wrangler speichert die lokale Anmeldung außerhalb des Repositories; API-Tokens oder andere Secrets dürfen nicht in Git eingecheckt werden. Alternativ bleiben `npm run build:cloudflare` und `npm run deploy:cloudflare` direkt verwendbar.

Qualitätschecks:

```bash
npm run validate:data
npm run check
```

## Implementierter Stand

- Trainingskonzept A/B/C ist definiert.
- Responsive App-Shell für Mobilgeräte, Tablet und Desktop.
- Automatische Browser-Spracherkennung mit dauerhaft auswählbarem Deutsch/Englisch-Modus.
- Heute-Ansicht mit automatischer A/B/C-Rotation.
- Vollständiger Planbrowser für alle 27 Übungen.
- Persistenter Masterplan-Editor: Übungen je A/B/C-Tag sortieren, entfernen und ergänzen.
- Dauerhafte Übungsalternativen je Muskel-/Bewegungsslot mit unveränderter Satz- und Wiederholungsvorgabe.
- Aktiver Trainingsmodus mit Last, Wiederholungen und RIR.
- Unterbrechungssicheres Pausieren/Fortsetzen mit persistenten Eingabeentwürfen und absolutem Timer-Endzeitpunkt.
- Freie Übungsreihenfolge innerhalb einer Session, etwa bei belegten Geräten.
- Flexible Satzanzahl pro Übung und Sitzung inklusive spontaner Zusatzsätze.
- Muskelgruppen und Bewegungsprofile wie Push, Pull, Beine und Core in allen Übungslisten.
- Satzabschluss, Überspringen und Übungstausch für die aktuelle Session.
- Editieren und Löschen protokollierter Sätze mit Rückgängig-Funktion – während des Trainings und im Verlauf.
- Automatische Wiederherstellung laufender oder pausierter Trainings nach Reload und Browser-Neustart.
- Echte kg/lb-Konvertierung mit konfigurierbaren Gewichtsschritten und vorausgefüllten Werten aus der letzten Einheit.
- Statistikseite für Wochen/Monate/Gesamtzeit mit Satztrend, Übungsprogression, Bewegungsmuster-Balance und Muskelgruppenverteilung.
- Lokale Historie und Progressionsempfehlungen.
- Vollständiger, validierter JSON-Export und -Import für Verlauf, Masterplan, Übungsreihenfolge, Slots, Alternativen und Einstellungen; zusätzlicher CSV-Export.
- Versionierte IndexedDB-Persistenz über Dexie, tabübergreifende Aktualisierung und sichtbar behandelte Speicherfehler.
- Service Worker mit vorgecacheter PWA-App-Shell, echtem Offline-Status und kontrolliertem Update-Flow.
- Druckfertige PDF mit Wochenplan, Trainingstagen, Progression und Protokoll liegt vor.
- Alle drei Originalvorlagen wurden archiviert.
- 27 bereinigte Muskelgrafiken sind als App-Assets vorhanden.
- Der Trainingsplan liegt zusätzlich als strukturierte JSON-Datei vor.
- Für alle 27 Planübungen sind kuratierte, auswählbare Alternativen hinterlegt.
- Produkt-, Technik- und Umsetzungsplanung sind dokumentiert.

Noch nicht umgesetzt sind die laut Roadmap optionalen beziehungsweise späteren Phasen Cloud-Sync, Konto und Apple-Watch-App.

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
- Dexie und IndexedDB für Sessions, Eingabeentwürfe, Timer, persönliche Plan-Konfiguration und App-Einstellungen
- Vitest inklusive Domänen-, Backup/Migrations- und IndexedDB-Integrationstests
- ESLint und Production-Build als Qualitätsbarrieren

## Grundsatz

Die erste Version wird local-first und ohne zwingende Registrierung gebaut. Ein Training muss auch bei schlechtem oder fehlendem Netz vollständig durchgeführt und gespeichert werden können.
