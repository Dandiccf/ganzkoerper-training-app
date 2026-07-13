# Übungsalternativen und Tauschlogik

## Ziel

Jede der 27 Planübungen erhält eine kuratierte Liste bekannter Alternativen. Nutzer können nach Equipment und Präferenz filtern und eine Übung entweder nur für die laufende Einheit oder dauerhaft im Trainingsplan ersetzen.

Die Daten liegen in `data/exercise-alternatives.v1.json`.

## Auswahl im Training

Die Aktion „Übung ersetzen“ öffnet ein Bottom Sheet beziehungsweise auf Desktop einen Dialog.

### Darstellung je Alternative

- Name;
- benötigtes Equipment;
- relevante Tags, zum Beispiel Maschine, Körpergewicht oder einseitig;
- zuletzt verwendetes Gewicht und letzte Leistung;
- Kennzeichnung als häufig verwendet oder Favorit;
- Hinweis, wenn das aktuelle Wiederholungsziel angepasst werden sollte.

### Filter

- gesamtes Equipment;
- nur Körpergewicht;
- Kurzhanteln;
- Langhantel;
- Kabelzug;
- Maschine;
- Home Gym;
- favorisierte Übungen.

## Zwei Tauschmodi

### Nur für heute

- Die ursprüngliche Planübung bleibt unverändert.
- Die Session speichert `original_exercise_id` und die tatsächlich ausgeführte `exercise_id`.
- Beim nächsten Auftreten des Trainingstags wird wieder die Planübung vorgeschlagen.
- Die App kann die zuletzt für diesen Slot gewählte Alternative als Schnellaktion anbieten.

### Dauerhaft im Plan

- Die Alternative ersetzt die Übung im jeweiligen Tag und Slot.
- Satz-, Wiederholungs-, RIR- und Pausenvorgaben werden zunächst übernommen.
- Vor dem Speichern zeigt die App eine Zusammenfassung der geänderten Vorgaben.
- Historische Sessions bleiben unverändert.
- Die Änderung erhöht die lokale Planrevision.

## Progressionshistorie

Leistungsdaten werden pro Übungs-ID geführt. Gewichte verschiedener Übungen werden nicht automatisch miteinander verglichen.

Beispiel:

- 80 kg Brustpresse gelten nicht als Fortsetzung von 30-kg-Kurzhanteln.
- Nach dem Wechsel zeigt die App die letzte Leistung der gewählten Alternative.
- Gibt es noch keine Historie, schlägt die App kein Startgewicht vor.
- Optional kann der Nutzer ein Startgewicht manuell speichern.

## Satz- und Wiederholungsziele

Standardmäßig übernimmt eine Alternative die Vorgaben des aktuellen Slots. Die kuratierten Listen sind so aufgebaut, dass dies in der Regel praktikabel ist.

Eine Anpassung wird angeboten, wenn:

- eine Körpergewichtsregression den Zielbereich deutlich überschreitet;
- eine technisch anspruchsvollere freie Übung einen sehr hohen Wiederholungsbereich übernehmen würde;
- eine einseitige Übung eine beidseitige Übung ersetzt;
- die Alternative als reine Isolation statt Mehrgelenksübung dient.

Die App darf eine Übung nicht stillschweigend als medizinisch geeigneter kennzeichnen. Tags wie „schulterfreundliche Option“ sind allgemeine Trainingshinweise und keine individuelle Empfehlung.

## Sortierung

Alternativen erscheinen in dieser Reihenfolge:

1. kuratierte Reihenfolge aus `preferredAlternativeIds`;
2. verfügbar mit dem aktuell gewählten Equipment;
3. Favoriten;
4. zuletzt erfolgreich verwendet;
5. alphabetischer Rest.

## Datenregeln

- Jede Planübung besitzt genau ein Mapping.
- Eine Alternative verweist auf eine stabile ID.
- Die ID existiert entweder im Basisplan oder im Alternativkatalog.
- Eine Übung darf nicht sich selbst als Alternative enthalten.
- Doppelte Alternativen innerhalb eines Mappings sind unzulässig.
- Gelöschte eigene Übungen bleiben in historischen Sessions als Snapshot erhalten.

## MVP-Akzeptanzkriterien

1. Jede der 27 Planübungen zeigt mindestens drei Alternativen.
2. Equipment-Filter verändern die Auswahl ohne Datenverlust.
3. „Nur heute“ ändert den Trainingsplan nicht.
4. „Dauerhaft“ ersetzt genau den gewählten Plan-Slot.
5. Der Tausch kann vor dem ersten Satz rückgängig gemacht werden.
6. Historische Leistung der ursprünglichen Übung bleibt erhalten.
7. Die neue Übung erhält ihre eigene Progressionshistorie.
8. Offline durchgeführte Tauschaktionen werden später synchronisiert.

