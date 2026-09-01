from collections import Counter, defaultdict
from pathlib import Path
import json
import sys

SERVER_DIR = Path(__file__).resolve().parents[1]

if str(SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(SERVER_DIR))

from models.quiz_model import (
    PLANNED_SUBJECTS,
    QUESTION_DATA_DIR,
    VALID_DIFFICULTIES,
    build_complete_question_bank,
)

def clean(value):
    return str(value if value is not None else "").strip()

def main():
    errors = []
    raw_count = 0
    json_files = sorted(QUESTION_DATA_DIR.rglob("*.json"))

    for file_path in json_files:
        try:
            data = json.loads(file_path.read_text(encoding="utf-8"))
        except Exception as exc:
            errors.append(f"{file_path.name}: invalid JSON: {exc}")
            continue

        if not isinstance(data, list):
            errors.append(f"{file_path.name}: root must be a list")
            continue

        for i, q in enumerate(data, start=1):
            raw_count += 1
            loc = f"{file_path.name} #{i}"

            if not isinstance(q, dict):
                errors.append(f"{loc}: item is not an object")
                continue

            required = {
                "subject",
                "topic",
                "difficulty",
                "question",
                "options",
                "answer",
            }

            missing = required - set(q.keys())
            if missing:
                errors.append(f"{loc}: missing keys {sorted(missing)}")
                continue

            options = q.get("options")
            answer = clean(q.get("answer"))

            if clean(q.get("difficulty")) not in VALID_DIFFICULTIES:
                errors.append(f"{loc}: invalid difficulty")

            if not isinstance(options, list) or len(options) != 4:
                errors.append(f"{loc}: exactly 4 options required")
                continue

            normalized = [clean(x) for x in options]

            if len(set(normalized)) != 4:
                errors.append(f"{loc}: duplicate options")

            if answer not in normalized:
                errors.append(f"{loc}: answer not in options")

    bank = build_complete_question_bank()

    subject_counts = Counter()
    difficulty_counts = defaultdict(Counter)
    seen = set()

    for q in bank:
        subject = clean(q.get("subject"))
        difficulty = clean(q.get("difficulty"))
        question = clean(q.get("question"))

        key = (subject.lower(), question.lower())

        if key in seen:
            errors.append(f"Duplicate final bank question: {subject} - {question}")

        seen.add(key)
        subject_counts[subject] += 1
        difficulty_counts[subject][difficulty] += 1

    print("=" * 72)
    print("NEURAQUIZ QUESTION BANK VERIFICATION V2")
    print("=" * 72)
    print(f"JSON files found        : {len(json_files)}")
    print(f"Raw JSON questions      : {raw_count}")
    print(f"Final deduplicated bank : {len(bank)}")
    print(f"Planned subjects        : {len(PLANNED_SUBJECTS)}")
    print()
    print(f"{'Subject':32}{'Easy':>8}{'Medium':>10}{'Hard':>8}{'Total':>8}")
    print("-" * 72)

    below_100 = {}

    for subject in PLANNED_SUBJECTS:
        e = difficulty_counts[subject].get("Easy", 0)
        m = difficulty_counts[subject].get("Medium", 0)
        h = difficulty_counts[subject].get("Hard", 0)
        total = subject_counts[subject]

        print(f"{subject:32}{e:>8}{m:>10}{h:>8}{total:>8}")

        if total < 100:
            below_100[subject] = total

    print("-" * 72)

    if below_100:
        print("SUBJECTS BELOW 100:")
        for subject, count in below_100.items():
            print(f"- {subject}: {count}")

    if errors:
        print()
        print("VALIDATION ERRORS:")
        for error in errors[:50]:
            print("[ERROR]", error)

        if len(errors) > 50:
            print(f"... and {len(errors) - 50} more errors")

    print()
    if not errors and not below_100:
        print("PASS: Question bank is valid, duplicate-free, and every planned subject has at least 100 questions.")
        return 0

    print("FAIL: Review the output above.")
    return 1

if __name__ == "__main__":
    raise SystemExit(main())
