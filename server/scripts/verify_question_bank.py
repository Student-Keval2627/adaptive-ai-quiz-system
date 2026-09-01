from __future__ import annotations

from collections import Counter, defaultdict
from pathlib import Path
import json
import sys


SERVER_DIR = Path(__file__).resolve().parents[1]

if str(SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(SERVER_DIR))

from models.quiz_model import (  # noqa: E402
    PLANNED_SUBJECTS,
    QUESTION_DATA_DIR,
    VALID_DIFFICULTIES,
    build_complete_question_bank,
)


REQUIRED_JSON_KEYS = {
    "subject",
    "topic",
    "difficulty",
    "question",
    "options",
    "answer",
}


def validate_source_json_files():
    errors = []
    raw_question_count = 0
    source_subject_counts = Counter()
    source_difficulty_counts = defaultdict(Counter)
    seen_questions = {}
    duplicate_questions = []

    json_files = sorted(QUESTION_DATA_DIR.rglob("*.json"))

    if not json_files:
        errors.append(
            f"No JSON question files found in: {QUESTION_DATA_DIR}"
        )
        return {
            "errors": errors,
            "json_files": [],
            "raw_question_count": 0,
            "source_subject_counts": source_subject_counts,
            "source_difficulty_counts": source_difficulty_counts,
            "duplicate_questions": duplicate_questions,
        }

    for file_path in json_files:
        try:
            data = json.loads(
                file_path.read_text(
                    encoding="utf-8"
                )
            )
        except Exception as exc:
            errors.append(
                f"{file_path.name}: invalid JSON ({exc})"
            )
            continue

        if not isinstance(data, list):
            errors.append(
                f"{file_path.name}: top-level JSON must be a list"
            )
            continue

        for index, item in enumerate(
            data,
            start=1,
        ):
            raw_question_count += 1

            location = (
                f"{file_path.name} item #{index}"
            )

            if not isinstance(
                item,
                dict,
            ):
                errors.append(
                    f"{location}: question must be an object"
                )
                continue

            missing_keys = (
                REQUIRED_JSON_KEYS
                - set(item.keys())
            )

            if missing_keys:
                errors.append(
                    f"{location}: missing keys "
                    f"{sorted(missing_keys)}"
                )
                continue

            subject = str(
                item.get(
                    "subject",
                    "",
                )
            ).strip()

            topic = str(
                item.get(
                    "topic",
                    "",
                )
            ).strip()

            difficulty = str(
                item.get(
                    "difficulty",
                    "",
                )
            ).strip()

            question = str(
                item.get(
                    "question",
                    "",
                )
            ).strip()

            options = item.get(
                "options"
            )

            answer = str(
                item.get(
                    "answer",
                    "",
                )
            ).strip()

            if not subject:
                errors.append(
                    f"{location}: empty subject"
                )

            if not topic:
                errors.append(
                    f"{location}: empty topic"
                )

            if difficulty not in (
                VALID_DIFFICULTIES
            ):
                errors.append(
                    f"{location}: invalid difficulty "
                    f"{difficulty!r}"
                )

            if not question:
                errors.append(
                    f"{location}: empty question"
                )

            if not isinstance(
                options,
                list,
            ):
                errors.append(
                    f"{location}: options must be a list"
                )
                options = []

            if len(options) != 4:
                errors.append(
                    f"{location}: expected 4 options, "
                    f"found {len(options)}"
                )

            normalized_options = [
                str(option).strip()
                for option in options
            ]

            if len(
                set(normalized_options)
            ) != len(
                normalized_options
            ):
                errors.append(
                    f"{location}: duplicate options found"
                )

            if answer not in (
                normalized_options
            ):
                errors.append(
                    f"{location}: answer is not present "
                    f"in options"
                )

            source_subject_counts[
                subject
            ] += 1

            source_difficulty_counts[
                subject
            ][difficulty] += 1

            duplicate_key = (
                subject.lower(),
                question.lower(),
            )

            previous = (
                seen_questions.get(
                    duplicate_key
                )
            )

            if previous:
                duplicate_questions.append(
                    (
                        subject,
                        question,
                        previous,
                        location,
                    )
                )
            else:
                seen_questions[
                    duplicate_key
                ] = location

    return {
        "errors": errors,
        "json_files": json_files,
        "raw_question_count": raw_question_count,
        "source_subject_counts": source_subject_counts,
        "source_difficulty_counts": source_difficulty_counts,
        "duplicate_questions": duplicate_questions,
    }


def validate_final_bank():
    bank = (
        build_complete_question_bank()
    )

    errors = []
    subject_counts = Counter()
    difficulty_counts = (
        defaultdict(
            Counter
        )
    )
    seen_bank_keys = set()
    seen_subject_question = set()

    for index, item in enumerate(
        bank,
        start=1,
    ):
        subject = str(
            item.get(
                "subject",
                "",
            )
        ).strip()

        topic = str(
            item.get(
                "topic",
                "",
            )
        ).strip()

        difficulty = str(
            item.get(
                "difficulty",
                "",
            )
        ).strip()

        question = str(
            item.get(
                "question",
                "",
            )
        ).strip()

        options = item.get(
            "options",
            [],
        )

        answer = str(
            item.get(
                "answer",
                "",
            )
        ).strip()

        bank_key = str(
            item.get(
                "bankKey",
                "",
            )
        ).strip()

        location = (
            f"final bank item #{index}"
        )

        if not all(
            [
                subject,
                topic,
                difficulty,
                question,
                answer,
                bank_key,
            ]
        ):
            errors.append(
                f"{location}: one or more required "
                f"normalized fields are empty"
            )

        if difficulty not in (
            VALID_DIFFICULTIES
        ):
            errors.append(
                f"{location}: invalid difficulty "
                f"{difficulty!r}"
            )

        if not isinstance(
            options,
            list,
        ) or len(
            options
        ) != 4:
            errors.append(
                f"{location}: expected exactly "
                f"4 options"
            )

        normalized_options = [
            str(option).strip()
            for option in options
        ]

        if len(
            set(normalized_options)
        ) != 4:
            errors.append(
                f"{location}: options are not unique"
            )

        if answer not in (
            normalized_options
        ):
            errors.append(
                f"{location}: answer is not in options"
            )

        if bank_key in (
            seen_bank_keys
        ):
            errors.append(
                f"{location}: duplicate bankKey "
                f"{bank_key}"
            )

        seen_bank_keys.add(
            bank_key
        )

        subject_question_key = (
            subject.lower(),
            question.lower(),
        )

        if subject_question_key in (
            seen_subject_question
        ):
            errors.append(
                f"{location}: duplicate final question "
                f"for {subject}: {question}"
            )

        seen_subject_question.add(
            subject_question_key
        )

        subject_counts[
            subject
        ] += 1

        difficulty_counts[
            subject
        ][difficulty] += 1

    missing_subjects = [
        subject
        for subject in PLANNED_SUBJECTS
        if subject_counts[
            subject
        ] == 0
    ]

    below_100 = {
        subject: subject_counts[
            subject
        ]
        for subject in PLANNED_SUBJECTS
        if subject_counts[
            subject
        ] < 100
    }

    return {
        "bank": bank,
        "errors": errors,
        "subject_counts": subject_counts,
        "difficulty_counts": difficulty_counts,
        "missing_subjects": missing_subjects,
        "below_100": below_100,
    }


def print_subject_table(
    subject_counts,
    difficulty_counts,
):
    print()
    print(
        "SUBJECT QUESTION COUNTS"
    )
    print(
        "-" * 72
    )
    print(
        f"{'Subject':32}"
        f"{'Easy':>8}"
        f"{'Medium':>10}"
        f"{'Hard':>8}"
        f"{'Total':>8}"
    )
    print(
        "-" * 72
    )

    for subject in (
        PLANNED_SUBJECTS
    ):
        counts = (
            difficulty_counts[
                subject
            ]
        )

        print(
            f"{subject:32}"
            f"{counts.get('Easy', 0):>8}"
            f"{counts.get('Medium', 0):>10}"
            f"{counts.get('Hard', 0):>8}"
            f"{subject_counts[subject]:>8}"
        )

    print(
        "-" * 72
    )


def main():
    print(
        "=" * 72
    )
    print(
        "NEURAQUIZ QUESTION BANK VERIFICATION"
    )
    print(
        "=" * 72
    )

    source_result = (
        validate_source_json_files()
    )

    final_result = (
        validate_final_bank()
    )

    print()
    print(
        f"Question JSON directory : "
        f"{QUESTION_DATA_DIR}"
    )

    print(
        f"JSON files found        : "
        f"{len(source_result['json_files'])}"
    )

    print(
        f"Raw JSON questions      : "
        f"{source_result['raw_question_count']}"
    )

    print(
        f"Final deduplicated bank : "
        f"{len(final_result['bank'])}"
    )

    print(
        f"Planned subjects        : "
        f"{len(PLANNED_SUBJECTS)}"
    )

    print_subject_table(
        final_result[
            "subject_counts"
        ],
        final_result[
            "difficulty_counts"
        ],
    )

    all_errors = (
        source_result[
            "errors"
        ]
        + final_result[
            "errors"
        ]
    )

    duplicate_questions = (
        source_result[
            "duplicate_questions"
        ]
    )

    if duplicate_questions:
        print()
        print(
            "SOURCE DUPLICATE QUESTIONS"
        )
        print(
            "-" * 72
        )

        for (
            subject,
            question,
            first_location,
            second_location,
        ) in duplicate_questions:
            print(
                f"[DUPLICATE] {subject}: "
                f"{question}"
            )
            print(
                f"  first : "
                f"{first_location}"
            )
            print(
                f"  again : "
                f"{second_location}"
            )

    if final_result[
        "missing_subjects"
    ]:
        print()
        print(
            "MISSING PLANNED SUBJECTS:"
        )

        for subject in (
            final_result[
                "missing_subjects"
            ]
        ):
            print(
                f"  - {subject}"
            )

    if final_result[
        "below_100"
    ]:
        print()
        print(
            "PLANNED SUBJECTS BELOW 100 QUESTIONS:"
        )

        for (
            subject,
            count,
        ) in final_result[
            "below_100"
        ].items():
            print(
                f"  - {subject}: "
                f"{count}"
            )

    if all_errors:
        print()
        print(
            "VALIDATION ERRORS"
        )
        print(
            "-" * 72
        )

        for error in all_errors:
            print(
                f"[ERROR] {error}"
            )

    print()
    print(
        "=" * 72
    )

    if (
        not all_errors
        and not duplicate_questions
        and not final_result[
            "missing_subjects"
        ]
        and not final_result[
            "below_100"
        ]
    ):
        print(
            "PASS: Question bank is valid, "
            "duplicate-free, and every planned "
            "subject has at least 100 questions."
        )
        return 0

    print(
        "FAIL: Review the warnings/errors above."
    )
    return 1


if __name__ == "__main__":
    raise SystemExit(
        main()
    )
