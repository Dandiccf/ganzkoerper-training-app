# Datenmodell und Domänenlogik

## 1. Modellierungsziele

- Trainingspläne und protokollierte Einheiten strikt trennen.
- Historische Einheiten dürfen sich durch spätere Planänderungen nicht verändern.
- Alle schreibbaren Datensätze müssen offline mit UUID erstellt werden können.
- Synchronisierung muss wiederholbar und idempotent sein.
- Übungen sollen später in mehreren Programmen verwendet werden können.

## 2. Kernobjekte

> Implementierungshinweis: Der aktuelle Local-first-MVP speichert diese Konzepte dokumentenorientiert in drei Dexie-Tabellen (`sessions`, `plans`, `settings`). Externe Lasten und Eingabeentwürfe liegen kanonisch in kg; kg/lb ist eine reine, persistente Anzeigeeinstellung. JSON-Backups tragen Schema-Version 4 und enthalten alle drei Bereiche atomar.

### `profiles`

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | UUID | Benutzer-ID |
| `display_name` | Text, optional | Anzeigename |
| `unit_system` | Enum | `metric` oder `imperial` |
| `created_at` | Timestamp | Erstellung |
| `updated_at` | Timestamp | letzte Änderung |

### `programs`

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | UUID | Programm-ID |
| `owner_id` | UUID, optional | leer für eingebauten Plan |
| `slug` | Text | stabiler technischer Name |
| `name` | Text | sichtbarer Name |
| `version` | Integer | Planversion |
| `is_builtin` | Boolean | mit App ausgeliefert |
| `is_active` | Boolean | aktuell verwendeter Plan |

### `training_days`

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | UUID | Trainingstag-ID |
| `program_id` | UUID | zugehöriger Plan |
| `code` | Text | A, B oder C |
| `name` | Text | Druck-, Beine- oder Rücken-Fokus |
| `focus` | Text | Kurzbeschreibung |
| `rotation_order` | Integer | Reihenfolge |
| `color_token` | Text | Design-Token, keine freie Farbe |

### `exercises`

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | UUID | Übungs-ID |
| `slug` | Text | stabiler Schlüssel |
| `name` | Text | sichtbarer Name |
| `movement_pattern` | Text | Bewegungsmuster |
| `equipment` | JSON/Text[] | benötigtes Equipment |
| `primary_muscles` | JSON/Text[] | primäre Muskelgruppen |
| `secondary_muscles` | JSON/Text[] | sekundäre Muskelgruppen |
| `technique_cue` | Text | kurzer Ausführungshinweis |
| `image_path` | Text | lokales oder CDN-Asset |

### `day_exercises`

Verknüpft Übungen mit einem konkreten Trainingstag.

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | UUID | Zuordnungs-ID |
| `training_day_id` | UUID | Trainingstag |
| `exercise_id` | UUID | Übung |
| `position` | Integer | Reihenfolge |
| `sets` | Integer | Arbeitssätze |
| `rep_min` | Integer | Untergrenze |
| `rep_max` | Integer | Obergrenze |
| `target_rir_min` | Integer | minimale Ziel-RIR |
| `target_rir_max` | Integer | maximale Ziel-RIR |
| `rest_seconds` | Integer | Pausenvorgabe |
| `per_side` | Boolean | Wiederholungen je Seite |
| `load_increment` | Decimal | empfohlene Steigerung |

### `exercise_alternatives`

| Feld | Typ | Bedeutung |
|---|---|---|
| `exercise_id` | UUID | ursprüngliche Übung |
| `alternative_id` | UUID | Ersatzübung |
| `priority` | Integer | Sortierung |
| `reason` | Text, optional | Equipment, Schmerzfreiheit etc. |

Die kuratierte Reihenfolge und der zusätzliche Katalog werden zunächst aus `data/exercise-alternatives.v1.json` geladen. Eine Auswahl kann den Scope `session_only` oder `plan_slot` besitzen. Details stehen in `EXERCISE_SUBSTITUTIONS.md`.

### `workout_sessions`

Eine konkrete absolvierte oder laufende Einheit. Planwerte werden als Snapshot gespeichert.

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | UUID | lokal erzeugte Session-ID |
| `user_id` | UUID, optional | leer im Gastmodus |
| `program_id` | UUID | Quellprogramm |
| `training_day_code` | Text | A, B oder C als Snapshot |
| `program_version` | Integer | verwendete Planversion |
| `status` | Enum | `active`, `paused`, `completed`, `discarded` |
| `started_at` | Timestamp | Start |
| `completed_at` | Timestamp, optional | Ende |
| `duration_seconds` | Integer | aktive Gesamtdauer |
| `notes` | Text, optional | Trainingsnotiz |
| `readiness` | Integer, optional | Belastungsgefühl vorab |
| `effort` | Integer, optional | Gesamtbelastung danach |
| `sync_status` | Enum | `local`, `pending`, `synced`, `conflict` |
| `updated_at` | Timestamp | Konfliktauflösung |

Im lokalen Sitzungsdokument werden außerdem Eingabeentwürfe je Session-Übung sowie der absolute Endzeitpunkt des Pausentimers gespeichert. Dadurch überstehen noch nicht abgeschlossene Eingaben, Pause und Timer einen Reload.

### `session_exercises`

Snapshot der Übung innerhalb einer Session.

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | UUID | Session-Übungs-ID |
| `session_id` | UUID | Einheit |
| `exercise_id` | UUID | Referenz zur Übung |
| `original_exercise_id` | UUID, optional | falls ersetzt |
| `position` | Integer | Reihenfolge |
| `name_snapshot` | Text | historischer Anzeigename |
| `rep_min` / `rep_max` | Integer | historische Zielwerte |
| `target_rir_min` / `max` | Integer | historische Zielwerte |
| `rest_seconds` | Integer | verwendete Pause |
| `status` | Enum | `pending`, `active`, `completed`, `skipped` |
| `notes` | Text, optional | Übungsnotiz |

### `set_logs`

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | UUID | Satz-ID |
| `session_exercise_id` | UUID | zugehörige Session-Übung |
| `set_number` | Integer | Satzreihenfolge |
| `load_value` | Decimal, optional | Gewicht oder Zusatzlast |
| `load_unit` | Enum | `kg`, `lb`, `bodyweight`, `assisted` |
| `reps` | Integer | Wiederholungen |
| `rir` | Integer, optional | Wiederholungen im Tank |
| `side` | Enum, optional | `left`, `right`, `both` |
| `completed_at` | Timestamp | Abschluss |
| `pain_flag` | Boolean | Warnmarkierung |
| `technique_flag` | Boolean | Technik nicht ausreichend |
| `notes` | Text, optional | Satznotiz |
| `updated_at` | Timestamp | letzte Korrektur |
| `deleted_at` | Timestamp, optional | Soft Delete |

### `progression_recommendations`

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | UUID | Empfehlung |
| `exercise_id` | UUID | Übung |
| `source_session_id` | UUID | auslösende Einheit |
| `recommended_load` | Decimal, optional | nächste Last |
| `recommended_rep_target` | Integer, optional | nächstes Ziel |
| `decision` | Enum | `increase`, `hold`, `reduce`, `review` |
| `reason_code` | Text | maschinenlesbare Begründung |
| `reason_text` | Text | sichtbare Begründung |
| `accepted_at` | Timestamp, optional | Nutzer hat übernommen |
| `dismissed_at` | Timestamp, optional | Nutzer hat verworfen |

### `weekly_checkins`

| Feld | Typ | Bedeutung |
|---|---|---|
| `id` | UUID | Check-in-ID |
| `user_id` | UUID | Benutzer |
| `week_start` | Datum | Wochenbezug |
| `bodyweight` | Decimal, optional | Körpergewicht |
| `sleep_quality` | Integer 1–5 | Schlaf |
| `energy` | Integer 1–5 | Energie |
| `soreness` | Integer 1–5 | Muskelkater |
| `motivation` | Integer 1–5 | Motivation |
| `joint_status` | Integer 1–5 | Gelenkgefühl |
| `success_note` | Text | Erfolg |
| `difficulty_note` | Text | Schwierigkeit |
| `next_focus` | Text | nächster Fokus |

## 3. Rotation

Die Rotation wird nicht allein aus dem Wochentag berechnet.

```text
next_day = day_after(last_completed_day)
A -> B
B -> C
C -> A
```

Ein manuell gestarteter abweichender Tag ändert die Rotation nur, wenn die Session abgeschlossen und ausdrücklich als reguläre Einheit gewertet wird.

## 4. Session-Snapshot

Beim Start eines Trainings werden Name, Zielwiederholungen, Pausen und Reihenfolge in `session_exercises` kopiert. Dadurch bleibt eine alte Einheit nachvollziehbar, selbst wenn der Trainingsplan später bearbeitet wird.

## 5. Lasten und Körpergewichtsübungen

- Externe Last wird im aktuellen Local-first-MVP kanonisch in Kilogramm gespeichert und bei der Anzeige verlustarm in kg oder lb umgerechnet.
- Körpergewichtsübungen können `bodyweight` ohne Last verwenden.
- Zusatzgewicht wird positiv gespeichert.
- Unterstützung wird als Typ `assisted` mit positivem Unterstützungswert gespeichert.
- Die Anzeige erzeugt daraus zum Beispiel `+15 kg`, `Körpergewicht` oder `−20 kg Unterstützung`.

## 6. Offline-Synchronisierung

Jeder veränderbare Datensatz besitzt:

- eine clientseitige UUID;
- `updated_at`;
- optional `deleted_at`;
- lokalen `sync_status`;
- eine monoton steigende lokale Revision.

Sync-Operationen verwenden eine eigene `operation_id`, damit wiederholte Requests keinen zweiten Datensatz erzeugen.

## 7. Seed-Daten

`data/training-plan.v1.json` ist die kanonische Seed-Datei für den eingebauten Plan. Datenbank-Seeds und Client-Fallback werden daraus generiert; parallele manuelle Kopien sind zu vermeiden.
