"""Strict offline verification for the production question bank."""

from collections import Counter, defaultdict
from pathlib import Path
import json
import sys


SERVER_DIR = Path(__file__).resolve().parents[1]

if str(SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(SERVER_DIR))

from models.quiz_model import (  # noqa: E402
    DIFFICULTY_QUESTION_TARGETS,
    PLANNED_SUBJECTS,
    QUESTION_DATA_DIR,
    QUESTIONS_PER_SUBJECT,
    VALID_DIFFICULTIES,
    build_complete_question_bank,
)


def clean(value):
    return str(value if value is not None else "").strip()


def question_key(subject, question):
    return (
        " ".join(clean(subject).lower().split()),
        " ".join(clean(question).lower().split()),
    )


def main():
    errors = []
    raw_count = 0
    raw_subject_counts = Counter()
    raw_difficulty_counts = defaultdict(Counter)
    subject_files = defaultdict(set)
    raw_seen = set()
    json_files = sorted(QUESTION_DATA_DIR.glob("*.json"))

    if len(json_files) != len(PLANNED_SUBJECTS):
        errors.append(
            "Expected "
            f"{len(PLANNED_SUBJECTS)} JSON files, found {len(json_files)}"
        )

    required = {
        "subject",
        "topic",
        "difficulty",
        "question",
        "options",
        "answer",
    }

    for file_path in json_files:
        try:
            data = json.loads(file_path.read_text(encoding="utf-8"))
        except Exception as exc:
            errors.append(f"{file_path.name}: invalid JSON: {exc}")
            continue

        if not isinstance(data, list):
            errors.append(f"{file_path.name}: root must be a list")
            continue

        file_subjects = set()

        for index, question in enumerate(data, start=1):
            raw_count += 1
            location = f"{file_path.name} #{index}"

            if not isinstance(question, dict):
                errors.append(f"{location}: item is not an object")
                continue

            missing = required - set(question)
            if missing:
                errors.append(f"{location}: missing keys {sorted(missing)}")
                continue

            subject = clean(question.get("subject"))
            topic = clean(question.get("topic"))
            difficulty = clean(question.get("difficulty"))
            text = clean(question.get("question"))
            options = question.get("options")
            answer = clean(question.get("answer"))

            file_subjects.add(subject)
            subject_files[subject].add(file_path.name)
            raw_subject_counts[subject] += 1
            raw_difficulty_counts[subject][difficulty] += 1

            if subject not in PLANNED_SUBJECTS:
                errors.append(f"{location}: unexpected subject {subject!r}")
            if not topic:
                errors.append(f"{location}: topic is empty")
            if difficulty not in VALID_DIFFICULTIES:
                errors.append(f"{location}: invalid difficulty {difficulty!r}")
            if not text:
                errors.append(f"{location}: question is empty")

            key = question_key(subject, text)
            if key in raw_seen:
                errors.append(f"{location}: duplicate raw question")
            raw_seen.add(key)

            if not isinstance(options, list) or len(options) != 4:
                errors.append(f"{location}: exactly 4 options required")
                continue

            normalized_options = [clean(option) for option in options]

            if any(not option for option in normalized_options):
                errors.append(f"{location}: options cannot be empty")
            if len(set(normalized_options)) != 4:
                errors.append(f"{location}: duplicate options")
            if answer not in normalized_options:
                errors.append(f"{location}: answer not in options")

        if len(file_subjects) != 1:
            errors.append(
                f"{file_path.name}: expected one subject, found "
                f"{sorted(file_subjects)}"
            )

    for subject in PLANNED_SUBJECTS:
        if len(subject_files[subject]) != 1:
            errors.append(
                f"{subject}: expected one JSON file, found "
                f"{sorted(subject_files[subject])}"
            )

        if raw_subject_counts[subject] != QUESTIONS_PER_SUBJECT:
            errors.append(
                f"{subject}: expected {QUESTIONS_PER_SUBJECT} raw questions, "
                f"found {raw_subject_counts[subject]}"
            )

        for difficulty, target in DIFFICULTY_QUESTION_TARGETS.items():
            actual = raw_difficulty_counts[subject][difficulty]
            if actual != target:
                errors.append(
                    f"{subject}/{difficulty}: expected {target}, found {actual}"
                )

    try:
        bank = build_complete_question_bank()
    except Exception as exc:
        errors.append(f"Unable to build final bank: {exc}")
        bank = []

    final_subject_counts = Counter()
    final_difficulty_counts = defaultdict(Counter)
    final_seen = set()

    for question in bank:
        subject = clean(question.get("subject"))
        difficulty = clean(question.get("difficulty"))
        text = clean(question.get("question"))
        key = question_key(subject, text)

        if key in final_seen:
            errors.append(f"Duplicate final question: {subject} - {text}")

        final_seen.add(key)
        final_subject_counts[subject] += 1
        final_difficulty_counts[subject][difficulty] += 1

    expected_total = len(PLANNED_SUBJECTS) * QUESTIONS_PER_SUBJECT
    if raw_count != expected_total:
        errors.append(f"Expected {expected_total} raw questions, found {raw_count}")
    if len(bank) != expected_total:
        errors.append(f"Expected {expected_total} final questions, found {len(bank)}")

    print("=" * 72)
    print("NEURAQUIZ QUESTION BANK VERIFICATION V3")
    print("=" * 72)
    print(f"JSON files found        : {len(json_files)}")
    print(f"Raw JSON questions      : {raw_count}")
    print(f"Final deduplicated bank : {len(bank)}")
    print(f"Planned subjects        : {len(PLANNED_SUBJECTS)}")
    print()
    print(f"{'Subject':32}{'Easy':>8}{'Medium':>10}{'Hard':>8}{'Total':>8}")
    print("-" * 72)

    for subject in PLANNED_SUBJECTS:
        easy = final_difficulty_counts[subject].get("Easy", 0)
        medium = final_difficulty_counts[subject].get("Medium", 0)
        hard = final_difficulty_counts[subject].get("Hard", 0)
        total = final_subject_counts[subject]
        print(f"{subject:32}{easy:>8}{medium:>10}{hard:>8}{total:>8}")

    print("-" * 72)

    if errors:
        print("\nVALIDATION ERRORS:")
        for error in errors[:100]:
            print("[ERROR]", error)
        if len(errors) > 100:
            print(f"... and {len(errors) - 100} more errors")
        print("\nFAIL: Review the output above.")
        return 1

    print(
        "\nPASS: 25,000 raw questions are valid, duplicate-free, and "
        "match every subject and difficulty target."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
