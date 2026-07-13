# Produkt- und Architekturplan: Responsive Trainings-PWA

## 1. Zielbild

Die Anwendung begleitet ein komplettes Krafttraining vom Wochenplan bis zum abgeschlossenen Satz. Sie soll sich auf dem Smartphone wie eine ruhige, schnelle Trainings-App anfühlen, auf Tablet und Desktop aber zusätzlich Planung, Auswertung und Bearbeitung komfortabel darstellen.

Die erste Version ist eine responsive Progressive Web App (PWA):

- eine Codebasis für iPhone, Android, Tablet und Desktop;
- auf dem Home-Bildschirm installierbar;
- vollständig nutzbar ohne stabile Internetverbindung;
- keine Registrierung für den Einstieg erforderlich;
- später erweiterbar um Benutzerkonto, Cloud-Sync und native Apple-Watch-App.

## 2. Produktziele

### Primäre Ziele

1. Ein Training muss mit möglichst wenigen Interaktionen durchführbar sein.
2. Gewicht, Wiederholungen und RIR müssen zuverlässig protokolliert werden.
3. Die Anwendung muss das nächste sinnvolle Trainingsziel verständlich vorschlagen.
4. Der aktuelle Satz, die nächste Aktion und der Pausentimer müssen jederzeit eindeutig sein.
5. Alle aktiven Trainingsfunktionen müssen offline funktionieren.

### Sekundäre Ziele

- Verlauf und persönliche Bestleistungen sichtbar machen.
- Übungsalternativen verwalten.
- Wochenrhythmus flexibel statt starr an Wochentage binden.
- Datenexport als JSON, CSV und druckbare PDF ermöglichen.
- Architektur für weitere Trainingspläne vorbereiten.

### Nicht-Ziele des MVP

- soziales Netzwerk oder öffentliche Profile;
- Ernährungsplanung;
- automatisches Wiederholungszählen per Kamera;
- Live-Coaching durch KI;
- Marktplatz für Trainingspläne;
- Apple Watch, HealthKit oder Wear OS im ersten Web-MVP;
- Abonnements und In-App-Käufe.

## 3. Zielgruppen

### Primär: selbstständig trainierende Person

- trainiert zwei- bis viermal pro Woche;
- möchte einen klaren Plan ohne unnötige Konfiguration;
- protokolliert aktuell auf Papier, in Notizen oder gar nicht;
- braucht im Training große Bedienelemente und wenig Ablenkung.

### Sekundär: Trainer oder fortgeschrittener Nutzer

- möchte Übungen, Satzbereiche und Alternativen anpassen;
- wertet Volumen, Leistung und Adhärenz aus;
- exportiert Daten oder teilt einen Plan.

## 4. Produktprinzipien

1. **Training vor Verwaltung:** Der Start der nächsten Einheit ist die wichtigste Aktion.
2. **Local-first:** Ein Netzausfall darf kein Training unterbrechen oder Daten verlieren.
3. **Eine Entscheidung pro Ansicht:** Während des Trainings steht die nächste Aktion im Mittelpunkt.
4. **Progression nachvollziehbar:** Empfehlungen zeigen immer ihre Begründung.
5. **Keine falsche Präzision:** Muskelgrafiken und Auswertungen unterstützen, ersetzen aber keine medizinische Bewertung.
6. **Rückgängig statt bestätigen:** Satzaktionen sollen schnell sein und anschließend korrigiert werden können.

## 5. MVP-Funktionsumfang

### 5.1 Start und Wochenübersicht

- Nächsten Trainingstag aus Rotation A → B → C bestimmen.
- Letzte Einheit, nächstes Training und Erholungszeit anzeigen.
- Direkter Button „Training starten“.
- Wochenstatus mit absolvierten und geplanten Einheiten.
- Optionaler Wechsel auf einen anderen Trainingstag.
- Fortsetzen eines unterbrochenen Trainings.

### 5.2 Trainingsmodus

- Aktuelle Übung mit Muskelgrafik, Technikhinweis und Zielbereich.
- Anzeige von Übungsnummer, Satznummer und Trainingsfortschritt.
- Vorgabe aus dem letzten Training: Gewicht, Wiederholungen und RIR.
- Schnelle Eingabe über Stepper und Zifferntastatur.
- Satz abschließen, korrigieren oder löschen.
- Automatischer Pausentimer nach abgeschlossenem Satz.
- Akustisches Signal und Browser-Benachrichtigung am Pausenende, soweit unterstützt.
- Übung überspringen, ersetzen oder später fortsetzen.
- Training pausieren, verwerfen oder abschließen.
- Abschlussübersicht mit Fortschritten und Notizen.

### 5.3 Trainingshistorie

- Chronologische Liste abgeschlossener Einheiten.
- Detailansicht mit allen Satzdaten.
- Entwicklung je Übung: bestes Gewicht, Wiederholungen und geschätztes Volumen.
- Persönliche Bestleistungen markieren.
- Frühere Einheit nachträglich korrigieren.

### 5.4 Planansicht

- Tag A, B und C mit allen Übungen.
- Primäre und sekundäre Muskelgruppen.
- Satz-, Wiederholungs-, RIR- und Pausenvorgaben.
- Technikhinweise und kuratierte Alternativen.
- Alternative nach Equipment filtern.
- Übung nur für die aktuelle Session oder dauerhaft im Plan ersetzen.
- Plan zunächst nur lesbar; Bearbeitung folgt in Version 1.1.

### 5.5 Einstellungen und Daten

- Einheiten kg/lb.
- Standard-Pausenzeiten.
- Ton und Benachrichtigungen.
- Datenexport als JSON und CSV.
- Lokale Daten vollständig löschen.
- App-Version, Datenschutzhinweise und Datenstatus.

## 6. Spätere Ausbaustufen

### Version 1.1

- Trainingsplan bearbeiten und duplizieren.
- Übungen austauschen und eigene Übungen anlegen.
- Körpergewicht und Wochen-Check-in.
- einfache Diagramme und Volumenvergleich.
- Konto optional verbinden und Geräte synchronisieren.

### Version 1.2

- mehrere Trainingsprogramme;
- Deload-Vorschläge;
- geplante Trainingswoche und Kalenderintegration;
- Datenimport aus CSV;
- Trainerfreigabe über einen privaten Link.

### Native Erweiterung

- SwiftUI-App für Apple Watch;
- aktuelle Übung, Satz und Pausentimer;
- haptisches Pausenende;
- bidirektionale Synchronisierung;
- optional HealthKit-Workout-Session und Herzfrequenz.

## 7. Informationsarchitektur

### Mobile Hauptnavigation

1. **Heute** – nächstes Training und Schnellstart
2. **Plan** – A/B/C und Übungsdetails
3. **Verlauf** – Trainingseinheiten und Leistung
4. **Mehr** – Einstellungen, Export und später Profil

Während eines laufenden Trainings wird die Hauptnavigation ausgeblendet. Der Trainingsmodus verwendet eine eigene, fokussierte Navigation.

### Desktop-Navigation

- feste linke Seitenleiste;
- Hauptinhalt in einer begrenzten Arbeitsfläche;
- rechte Kontextspalte für aktuelle Woche, Timer oder Details;
- Tabellen und Diagramme erhalten mehr Raum, ohne die mobile Struktur zu verändern.

## 8. Screen-Spezifikation

### 8.1 Heute

**Primäre Inhalte**

- Trainingstag, Fokus und geschätzte Dauer;
- Anzahl Übungen und Arbeitssätze;
- Zeitpunkt der letzten Einheit;
- auffälliger Start- oder Fortsetzen-Button;
- kompakte Wochenrotation;
- letzter Fortschritt oder Hinweis zur Erholung.

**Zustände**

- noch keine Daten;
- bereit für A/B/C;
- Training läuft;
- heute bereits trainiert;
- planmäßiger Ruhetag;
- Offline-Modus.

### 8.2 Training vorbereiten

- Liste aller Übungen in Reihenfolge;
- vorgeschlagene Gewichte aus dem letzten Training;
- Möglichkeit, einzelne Übungen vorab zu ersetzen;
- Gesamtdauer und Pausenvorgaben;
- Start-Button.

### 8.3 Aktiver Satz

**Fix sichtbare Elemente**

- Übungsname und Fortschritt, zum Beispiel „3 von 9“;
- Muskelgrafik;
- aktueller Satz, Zielwiederholungen und Ziel-RIR;
- Gewicht und Wiederholungen;
- große Aktion „Satz abschließen“.

**Sekundäre Aktionen**

- Technikhinweis öffnen;
- vorherige Leistung anzeigen;
- Übung ersetzen;
- Satz überspringen;
- Training beenden.

Beim Ersetzen zeigt die App bekannte Alternativen aus `data/exercise-alternatives.v1.json`. Leistungsdaten bleiben je Übungs-ID getrennt; ein Tausch übernimmt nicht automatisch das Gewicht der ursprünglichen Übung.

### 8.4 Pausentimer

- große verbleibende Zeit;
- +15 s, −15 s und Überspringen;
- Vorschau des nächsten Satzes;
- Timer läuft auch bei Navigation innerhalb der App weiter;
- bei Hintergrundbetrieb Benachrichtigung verwenden, soweit erlaubt.

### 8.5 Trainingsabschluss

- Dauer und absolvierte Sätze;
- neue Bestleistungen;
- Übungen mit gesteigerter, gleicher oder reduzierter Leistung;
- kurze Belastungsbewertung;
- freie Notiz;
- nächster Trainingstag der Rotation.

### 8.6 Verlauf

- Filter nach Übung, Trainingstag und Zeitraum;
- Trainingseinheiten als scanbare Liste;
- Übungsdetail mit Satzhistorie;
- keine dekorativen Diagramme ohne konkrete Aussage.

## 9. Responsive Gestaltung

### Layoutbereiche

- **Klein, 320–479 px:** einspaltig, große Touch-Ziele, fixierte Hauptaktion.
- **Mobil, 480–767 px:** einspaltig mit mehr Kontext und größeren Grafiken.
- **Tablet, 768–1023 px:** zwei Spalten für Plan und Details.
- **Desktop, ab 1024 px:** Seitenleiste, Hauptbereich und optionale Kontextspalte.

### Bedienungsregeln

- Touch-Ziele mindestens 44 × 44 CSS-Pixel.
- Kritische Aktionen nicht allein über Farbe kennzeichnen.
- Zahlenfelder mit numerischer Bildschirmtastatur.
- Bedienelemente eines aktiven Satzes im unteren Daumenbereich.
- Keine verschachtelten Karten; Trainingsabschnitte bleiben als klare Flächen organisiert.
- Bewegungsreduktion und hohe Kontraste berücksichtigen.

## 10. Empfohlener Technologie-Stack

### Frontend

- Next.js mit App Router
- TypeScript im Strict Mode
- React
- CSS Modules oder Tailwind CSS mit eigenen Design Tokens
- Radix UI nur für komplexe, barrierearme Primitive
- Lucide für Icons
- React Hook Form plus Zod für Formulare und Validierung

### Client-Daten

- IndexedDB über Dexie für Trainingsplan, Sessions und Sync-Warteschlange
- TanStack Query für Serverstatus und Cache
- Zustand nur für kurzlebigen UI-Status, beispielsweise aktiver Timer
- UUIDs auf dem Client, damit Offline-Einträge sofort erstellt werden können

### Backend

- Supabase für PostgreSQL, Auth, Row Level Security und Storage
- REST/RPC nur für klar definierte Operationen
- Datenbankmigrationen im Repository
- Gastmodus ohne Konto; spätere Konto-Verknüpfung migriert lokale Daten

### PWA

- Web App Manifest
- Service Worker für App-Shell und statische Trainingsassets
- installierbare Icons und Splash-Assets
- Offline-Fallback
- Web Push erst nach validiertem Benachrichtigungsbedarf

### Qualität

- Vitest für Einheiten- und Domänenlogik
- Testing Library für Komponenten
- Playwright für Kernabläufe auf Mobil- und Desktop-Viewports
- axe-core für automatisierte Accessibility-Prüfungen
- Sentry für Fehleranalyse erst ab öffentlicher Beta

## 11. Local-first- und Sync-Strategie

### Grundregel

Die lokale IndexedDB ist während des Trainings die führende Datenquelle. Netzwerkzugriffe blockieren niemals eine Satzaktion.

### Schreibablauf

1. Nutzer schließt einen Satz ab.
2. Datensatz wird sofort lokal mit UUID gespeichert.
3. UI bestätigt den Satz ohne Server-Wartezeit.
4. Eine idempotente Sync-Operation landet in der Warteschlange.
5. Bei Verbindung wird die Operation an den Server gesendet.
6. Server bestätigt Versionsnummer und Zeitstempel.

### Konflikte

- Satzdaten: neueste explizite Bearbeitung gewinnt.
- abgeschlossene Sessions werden nicht automatisch zusammengeführt.
- Planänderungen verwenden Versionsnummern.
- Konflikte mit möglichem Datenverlust werden sichtbar zur Auswahl gestellt.
- Löschungen nutzen zunächst `deleted_at` statt physischer Löschung.

### Wiederherstellung

- laufende Session nach Browser-Neustart fortsetzen;
- Timer aus absoluten Zeitstempeln berechnen, nicht durch dauerhaftes Herunterzählen;
- ungesendete Änderungen sichtbar kennzeichnen;
- Export funktioniert auch ohne Konto.

## 12. Progressionslogik

### Eingaben

- Zielbereich `rep_min` bis `rep_max`;
- Gewicht beziehungsweise Schwierigkeitsstufe;
- Wiederholungen je Arbeitssatz;
- RIR je Arbeitssatz;
- Technik- oder Schmerzmarkierung;
- vorherige zwei bis drei Einheiten.

### MVP-Regeln

1. Beide Sätze erreichen `rep_max` bei RIR ≥ 1 und ohne Warnmarkierung: Gewicht um definierte Stufe erhöhen.
2. Mindestens ein Satz liegt innerhalb des Bereichs, aber noch nicht an der Obergrenze: Gewicht halten und Wiederholungen steigern.
3. Ein Satz liegt unter `rep_min`, obwohl RIR 0 erreicht wurde: Gewicht halten oder reduzieren; keine Steigerung.
4. Zwei Einheiten in Folge deutlicher Leistungsabfall: Regenerationshinweis anzeigen.
5. Schmerzmarkierung: keine automatische Progression; Übungsalternative anbieten.

### Darstellung

Jeder Vorschlag zeigt eine kurze Begründung, zum Beispiel:

> Letztes Mal 10/10 Wiederholungen bei RIR 2/1. Vorschlag: von 70 kg auf 72,5 kg erhöhen.

Der Nutzer kann jeden Vorschlag überschreiben.

## 13. Datenschutz und Sicherheit

- Trainingsdaten standardmäßig lokal speichern.
- Konto und Cloud-Sync ausdrücklich aktivieren lassen.
- Nur notwendige personenbezogene Daten erfassen.
- Export und vollständige Löschung anbieten.
- Transport ausschließlich über HTTPS.
- Row Level Security für alle benutzerbezogenen Tabellen.
- Keine HealthKit- oder Gesundheitsdaten im Web-MVP.
- Datenschutzerklärung vor öffentlicher Veröffentlichung erstellen.
- Analytics nur datensparsam und nach klarer Produktentscheidung.

## 14. Teststrategie

### Domänentests

- Ermittlung des nächsten Trainingstags;
- Progressionsentscheidung für alle Grenzfälle;
- kg/lb-Konvertierung;
- Pausentimer nach Hintergrundwechsel;
- Offline-Sync und Wiederholung idempotenter Operationen;
- Wiederherstellung einer laufenden Session.

### End-to-End-Kernabläufe

1. Gast startet Tag A, protokolliert zwei Sätze und beendet das Training.
2. Browser wird während des Trainings geschlossen und die Session wird wiederhergestellt.
3. Training wird offline beendet und später synchronisiert.
4. Satz wird nachträglich korrigiert.
5. Übung wird ersetzt, ohne die Historie der ursprünglichen Übung zu verlieren.
6. Export enthält alle lokalen und synchronisierten Daten.

### Geräteprüfung

- kleines iPhone-Viewport;
- aktuelles großes iPhone;
- Android-Mittelklassegerät;
- iPad Hoch- und Querformat;
- Desktop Chrome, Safari und Firefox;
- installierte PWA und normaler Browserbetrieb.

## 15. Leistungsziele

- Startansicht auf Mittelklassegerät in unter 2,5 Sekunden interaktiv.
- Satzabschluss reagiert lokal in unter 100 ms.
- aktive Trainingsansicht benötigt keine laufenden Netzwerkrequests.
- Bilder in geeigneten Größen und modernen Formaten ausliefern.
- initiales JavaScript-Budget bewusst begrenzen.

## 16. Definition of Done für das MVP

- alle 27 Übungen sind korrekt importiert;
- A/B/C-Rotation funktioniert über mehrere Wochen;
- Training kann vollständig offline durchgeführt werden;
- laufende Session überlebt Reload und Browser-Neustart;
- Satzdaten können eingegeben, korrigiert und gelöscht werden;
- Progressionsvorschläge sind getestet und begründet;
- PWA ist auf iOS und Android installierbar;
- Export als JSON und CSV funktioniert;
- Kernabläufe bestehen E2E-Tests;
- WCAG-relevante Tastatur-, Kontrast- und Screenreader-Prüfungen sind bestanden;
- Datenschutz- und Löschfunktionen sind vorhanden;
- Beta wurde in mindestens zehn echten Trainingseinheiten getestet.

## 17. Offene Produktentscheidungen vor Implementierung

1. Soll das MVP komplett ohne Konto bleiben oder optionalen Sync bereits enthalten?
2. Ist der Plan zunächst unveränderlich oder dürfen Übungen und Reihenfolge sofort bearbeitet werden?
3. Sollen RIR-Werte verpflichtend oder optional sein?
4. Sind Körpergewicht und Wochen-Check-in Teil des MVP?
5. Welche Lastschritte gelten je Übung und verfügbarem Equipment?
6. Werden die vorhandenen Muskelgrafiken dauerhaft verwendet oder später durch eigene Illustrationen ersetzt?
7. Soll die Anwendung privat bleiben oder öffentlich veröffentlicht werden?
