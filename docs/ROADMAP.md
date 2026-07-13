# Umsetzungsroadmap

Die Schätzung gilt für eine erfahrene Vollzeit-Entwicklung. Bei Teilzeit verlängert sich die Kalenderdauer entsprechend. Jede Phase endet mit einem nutzbaren, testbaren Ergebnis.

## Phase 0: Entscheidungen und Projektstart

**Dauer:** 2–3 Tage

### Aufgaben

- MVP-Fragen aus `APP_PLAN.md` entscheiden.
- Produktname und vorläufige Domain festlegen.
- Next.js, TypeScript, Linting und Tests initialisieren.
- Design Tokens für Farbe, Typografie, Abstand und Status definieren.
- JSON-Schema für `training-plan.v1.json` validieren.
- CI für Lint, Typprüfung und Tests einrichten.

### Ergebnis

- startbares Repository;
- dokumentierte Architekturentscheidungen;
- automatisierter Qualitätscheck.

## Phase 1: Responsive App-Shell und Plan

**Dauer:** 1 Woche

### Aufgaben

- mobile und Desktop-Navigation;
- Heute-, Plan- und Einstellungs-Grundansichten;
- A/B/C-Seed-Daten importieren;
- Übungskarten und Übungsdetail;
- responsive Layouts für 320 px bis Desktop;
- PWA-Manifest und Icons;
- grundlegende Accessibility-Prüfung.

### Akzeptanz

- alle 27 Übungen werden korrekt angezeigt;
- kein Text überlappt bei 320, 390, 768 und 1440 px;
- App kann auf dem Home-Bildschirm installiert werden;
- Navigation funktioniert per Touch und Tastatur.

## Phase 2: Aktiver Trainingsmodus

**Dauer:** 1,5–2 Wochen

### Aufgaben

- Session aus Trainingstag erzeugen;
- Übungs- und Satznavigation;
- Eingabe für Last, Wiederholungen und RIR;
- Satz abschließen, korrigieren und löschen;
- kuratierte Alternativen nach Equipment filtern;
- Übung nur für die Session oder dauerhaft im Plan ersetzen;
- Pausentimer mit absolutem Endzeitpunkt;
- Training pausieren, fortsetzen und abschließen;
- Abschlussübersicht;
- automatische Wiederherstellung nach Reload.

### Akzeptanz

- eine komplette A/B/C-Einheit kann ohne Netzwerk abgeschlossen werden;
- Reload verliert keinen abgeschlossenen Satz;
- Timer bleibt nach Hintergrundwechsel korrekt;
- versehentliche Satzaktion kann rückgängig gemacht werden.
- jede der 27 Übungen bietet mindestens drei validierte Alternativen;
- ein Session-Tausch verändert den Basisplan nicht.

## Phase 3: Local-first-Persistenz

**Dauer:** 1 Woche

### Aufgaben

- IndexedDB-Schema über Dexie;
- Migrationen und Versionsmanagement;
- lokale Historie;
- Export als JSON und CSV;
- Daten löschen und Testdaten zurücksetzen;
- Speicher- und Fehlerzustände gestalten;
- Service Worker und Offline-App-Shell.

### Akzeptanz

- App startet nach Erstbesuch offline;
- historische Sessions bleiben nach Browser-Neustart erhalten;
- Export kann in einer frischen Testinstanz wieder eingelesen werden;
- Schema-Upgrade bewahrt bestehende Daten.

## Phase 4: Progression und Verlauf

**Dauer:** 1–1,5 Wochen

### Aufgaben

- getestete Progressionsfunktion als reine Domänenlogik;
- nächstes Ziel je Übung;
- Begründung der Empfehlung;
- Übungshistorie und persönliche Bestleistung;
- Trainingsdetail und nachträgliche Korrektur;
- Rotation aus letzter abgeschlossener Einheit.

### Akzeptanz

- Grenzfälle für Rep-Minimum, Rep-Maximum und RIR sind getestet;
- Nutzer kann Empfehlung überschreiben;
- Planänderungen verändern historische Sessions nicht;
- nächste A/B/C-Einheit wird korrekt ermittelt.

## Phase 5: Konto und Cloud-Sync

**Dauer:** 1,5–2 Wochen

Diese Phase kann für einen privaten Offline-MVP verschoben werden.

### Aufgaben

- Supabase-Projekt und Migrationen;
- Row Level Security;
- Magic-Link-Anmeldung;
- Gastdaten einem Konto zuordnen;
- idempotente Sync-Warteschlange;
- Konfliktbehandlung und Sync-Status;
- Gerätewechsel testen.

### Akzeptanz

- Gast kann App ohne Konto verwenden;
- Konto-Verknüpfung verliert keine lokalen Daten;
- Offline erstellte Sätze synchronisieren später genau einmal;
- ein zweites Gerät erhält abgeschlossene Sessions;
- fremde Benutzer können keine Daten lesen oder verändern.

## Phase 6: PWA-Polish und Beta

**Dauer:** 1 Woche

### Aufgaben

- Installation auf iOS und Android testen;
- Offline- und Update-UX;
- Lade-, Leer-, Fehler- und Konfliktzustände;
- Performance- und Accessibility-Audit;
- E2E-Suite für Kernabläufe;
- datensparsame Fehleranalyse;
- Datenschutzseite und Impressum für öffentliche Nutzung;
- zehn echte Testeinheiten durchführen.

### Release-Kriterien

- keine offenen Fehler mit Datenverlust-Risiko;
- alle Kernabläufe auf iPhone, Android und Desktop bestanden;
- Satzabschluss reagiert lokal ohne merkliche Verzögerung;
- Testpersonen können eine Einheit ohne Erklärung durchführen;
- Backup- und Exportweg dokumentiert.

## Optionale Phase 7: Planeditor

**Dauer:** 1–2 Wochen

- Reihenfolge ändern;
- Übungen ersetzen;
- eigene Übungen;
- Satz- und Rep-Bereiche bearbeiten;
- Programme duplizieren;
- Validierung gegen unvollständige Trainingstage.

## Optionale Phase 8: Apple Watch

**Dauer:** 3–5 Wochen

- native SwiftUI-watchOS-App;
- Session vom Backend oder iPhone laden;
- Übung und Satz anzeigen;
- Last, Wiederholungen und RIR erfassen;
- Pausentimer und Haptik;
- robuste bidirektionale Synchronisierung;
- Tests mit physischem iPhone und Apple Watch;
- HealthKit erst als getrenntes Teilprojekt.

## Vorgeschlagene Meilensteine

| Meilenstein | Inhalt | Zielzeit |
|---|---|---:|
| M1 | installierbarer, responsiver Planbrowser | Ende Woche 1 |
| M2 | vollständiges lokales Training | Ende Woche 3 |
| M3 | Offline-Historie und Progression | Ende Woche 5 |
| M4 | optionaler Cloud-Sync | Ende Woche 7 |
| M5 | getestete öffentliche Beta | Ende Woche 8 |

## Hauptrisiken

| Risiko | Wirkung | Gegenmaßnahme |
|---|---|---|
| Hintergrundtimer auf Mobilbrowsern | verspätete Anzeige | absolute Endzeit plus Benachrichtigung statt Intervallzählung |
| Offline-Sync erzeugt Duplikate | falsche Historie | UUIDs und idempotente Operationen |
| zu viele Eingaben pro Satz | schlechte Nutzung im Studio | Defaults aus letzter Einheit und große Stepper |
| frühe Konto-Pflicht | unnötiger Einstiegshinderungsgrund | Gastmodus als Standard |
| Planänderung verfälscht Historie | Datenverlust an Bedeutung | Session-Snapshots |
| kleine, uneinheitliche Bildassets | unruhiges UI | feste Bildflächen und später eigenes Illustrationsset |
| zu großer MVP | lange Zeit ohne testbares Produkt | Cloud, Editor und Watch als getrennte Phasen |

## Erste Implementierungstickets

1. Repository und Next.js-App initialisieren.
2. Design Tokens aus PDF-Farben definieren.
3. Zod-Schema für Trainingsplan erstellen.
4. Seed-JSON laden und validieren.
5. responsive App-Shell umsetzen.
6. Heute-Ansicht mit nächstem Trainingstag bauen.
7. Planansicht A/B/C bauen.
8. Übungsdetail und Muskelgrafik integrieren.
9. Alternativkatalog, Equipment-Filter und Tauschdialog bauen.
10. IndexedDB-Grundschema erstellen.
11. Session-Erzeugung aus Tag A implementieren.
12. Satz-Eingabekomponente bauen.
13. Pausentimer als testbare Zustandsmaschine bauen.
14. Reload-Wiederherstellung implementieren.
15. Training abschließen und Historie speichern.
16. Tag B und C über dieselbe Domänenlogik aktivieren.
