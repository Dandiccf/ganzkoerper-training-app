import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"


def load(name: str):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def main():
    plan = load("training-plan.v1.json")
    alternatives = load("exercise-alternatives.v1.json")

    base_ids = {
        exercise["id"]
        for day in plan["program"]["days"]
        for exercise in day["exercises"]
    }
    catalog_ids = [exercise["id"] for exercise in alternatives["catalog"]]
    assert len(catalog_ids) == len(set(catalog_ids)), "Doppelte ID im Alternativkatalog"

    mappings = alternatives["mappings"]
    mapped_ids = [mapping["exerciseId"] for mapping in mappings]
    assert len(mapped_ids) == len(set(mapped_ids)), "Doppeltes Mapping"
    assert set(mapped_ids) == base_ids, "Nicht jede Planübung besitzt genau ein Mapping"

    known_ids = base_ids | set(catalog_ids)
    for mapping in mappings:
        exercise_id = mapping["exerciseId"]
        choices = mapping["preferredAlternativeIds"]
        assert len(choices) >= 3, f"Zu wenige Alternativen: {exercise_id}"
        assert len(choices) == len(set(choices)), f"Doppelte Alternative: {exercise_id}"
        assert exercise_id not in choices, f"Selbstreferenz: {exercise_id}"
        unknown = set(choices) - known_ids
        assert not unknown, f"Unbekannte IDs bei {exercise_id}: {sorted(unknown)}"

    print(f"Planübungen: {len(base_ids)}")
    print(f"Zusätzliche Übungen: {len(catalog_ids)}")
    print(f"Tauschbeziehungen: {sum(len(m['preferredAlternativeIds']) for m in mappings)}")
    print("Validierung: OK")


if __name__ == "__main__":
    main()

