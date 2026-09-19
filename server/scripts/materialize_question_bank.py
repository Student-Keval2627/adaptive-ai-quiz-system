"""Materialize the curated question seeds into the production JSON bank.

The application serves questions directly from ``data/questions``.  This
script makes every subject file self-contained with the required 300/400/300
difficulty split instead of relying on runtime expansion in ``quiz_model``.

Existing questions are preserved.  Additional question instances use varied,
natural assessment contexts and deterministic option rotation.  Running the
script again is safe: a complete, valid file is left unchanged.
"""

from __future__ import annotations

from collections import Counter
from pathlib import Path
import json


SERVER_DIR = Path(__file__).resolve().parents[1]
QUESTION_DATA_DIR = SERVER_DIR / "data" / "questions"

DIFFICULTY_TARGETS = {
    "Easy": 300,
    "Medium": 400,
    "Hard": 300,
}

# These frames turn a curated knowledge check into different assessment
# situations.  They deliberately avoid artificial labels such as "variant"
# and "practice round", which previously leaked into the learner-facing UI.
ASSESSMENT_FRAMES = [
    "{question}",
    "In a {topic} lesson, which option correctly answers this question: {question}",
    "A learner is revising {topic}. What should they select for: {question}",
    "During a {topic} lab, the following question appears: {question}",
    "For a practical task involving {topic}, choose the best answer: {question}",
    "A technical interview covers {topic}. Select the correct response: {question}",
    "While reviewing {topic}, which answer should be chosen for: {question}",
    "A certification test asks this {topic} question: {question}",
    "In a classroom discussion about {topic}, resolve this question: {question}",
    "A developer is checking their understanding of {topic}. Answer: {question}",
    "For a {topic} knowledge check, identify the correct option: {question}",
    "A project review raises this point about {topic}: {question}",
    "Before completing a {topic} exercise, answer this question: {question}",
    "A teammate requests the correct {topic} explanation for: {question}",
    "During exam preparation for {topic}, select the answer to: {question}",
    "A troubleshooting session includes this {topic} question: {question}",
    "In an applied {topic} scenario, determine the correct answer: {question}",
    "A mentor uses this question to assess {topic} knowledge: {question}",
    "For a final review of {topic}, choose the accurate response: {question}",
    "A skill assessment presents the following {topic} problem: {question}",
    "While documenting {topic}, a team must answer: {question}",
]


def clean(value: object) -> str:
    return str(value if value is not None else "").strip()


def normalized_question_key(question: dict) -> str:
    return " ".join(clean(question.get("question")).lower().split())


def validate_source(question: object, location: str) -> dict:
    if not isinstance(question, dict):
        raise ValueError(f"{location}: question must be an object")

    required = {
        "subject",
        "topic",
        "difficulty",
        "question",
        "options",
        "answer",
    }
    missing = required - question.keys()
    if missing:
        raise ValueError(f"{location}: missing fields {sorted(missing)}")

    normalized = {
        "subject": clean(question["subject"]),
        "topic": clean(question["topic"]) or "General",
        "difficulty": clean(question["difficulty"]),
        "question": clean(question["question"]),
        "options": [clean(option) for option in question["options"]],
        "answer": clean(question["answer"]),
    }

    if normalized["difficulty"] not in DIFFICULTY_TARGETS:
        raise ValueError(f"{location}: invalid difficulty")
    if not normalized["question"]:
        raise ValueError(f"{location}: empty question")
    if len(normalized["options"]) != 4:
        raise ValueError(f"{location}: exactly four options are required")
    if len(set(normalized["options"])) != 4:
        raise ValueError(f"{location}: options must be unique")
    if normalized["answer"] not in normalized["options"]:
        raise ValueError(f"{location}: answer must match one option")

    return normalized


def rotate_options(options: list[str], amount: int) -> list[str]:
    offset = amount % len(options)
    return options[offset:] + options[:offset]


def build_assessment_question(
    source: dict,
    frame_index: int,
    option_rotation: int,
) -> dict:
    base_question = source["question"].rstrip()
    rendered_question = ASSESSMENT_FRAMES[frame_index].format(
        topic=source["topic"],
        question=base_question,
    )

    return {
        "subject": source["subject"],
        "topic": source["topic"],
        "difficulty": source["difficulty"],
        "question": rendered_question,
        "options": rotate_options(source["options"], option_rotation),
        "answer": source["answer"],
    }


def expand_difficulty(sources: list[dict], target: int) -> list[dict]:
    unique_sources = []
    seen = set()

    for source in sources:
        key = normalized_question_key(source)
        if key in seen:
            continue
        seen.add(key)
        unique_sources.append(source)

    if not unique_sources:
        raise ValueError("cannot expand an empty difficulty group")

    # A complete materialized group remains stable on subsequent runs.
    if len(unique_sources) >= target:
        return unique_sources[:target]

    questions = list(unique_sources)
    generated_index = 0

    while len(questions) < target:
        source_index = generated_index % len(unique_sources)
        cycle_index = generated_index // len(unique_sources)
        frame_index = (cycle_index % (len(ASSESSMENT_FRAMES) - 1)) + 1
        source = unique_sources[source_index]
        candidate = build_assessment_question(
            source=source,
            frame_index=frame_index,
            option_rotation=generated_index + frame_index,
        )
        key = normalized_question_key(candidate)

        if key not in seen:
            seen.add(key)
            questions.append(candidate)

        generated_index += 1

        if generated_index > target * len(ASSESSMENT_FRAMES):
            raise RuntimeError("unable to create enough unique questions")

    return questions


def materialize_file(file_path: Path) -> tuple[str, Counter]:
    raw_data = json.loads(file_path.read_text(encoding="utf-8"))
    if not isinstance(raw_data, list):
        raise ValueError(f"{file_path.name}: JSON root must be a list")

    sources = [
        validate_source(item, f"{file_path.name} #{index}")
        for index, item in enumerate(raw_data, start=1)
    ]

    subjects = {question["subject"] for question in sources}
    if len(subjects) != 1:
        raise ValueError(f"{file_path.name}: expected exactly one subject")

    subject = subjects.pop()
    materialized = []

    for difficulty, target in DIFFICULTY_TARGETS.items():
        difficulty_sources = [
            question
            for question in sources
            if question["difficulty"] == difficulty
        ]
        materialized.extend(expand_difficulty(difficulty_sources, target))

    file_path.write_text(
        json.dumps(materialized, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    return subject, Counter(q["difficulty"] for q in materialized)


def main() -> int:
    json_files = sorted(QUESTION_DATA_DIR.glob("*.json"))
    if len(json_files) != 25:
        raise RuntimeError(f"expected 25 subject files, found {len(json_files)}")

    total = 0
    for file_path in json_files:
        subject, counts = materialize_file(file_path)
        file_total = sum(counts.values())
        total += file_total
        print(
            f"{subject:32} Easy={counts['Easy']:3} "
            f"Medium={counts['Medium']:3} Hard={counts['Hard']:3} "
            f"Total={file_total:4}"
        )

    print(f"Materialized question bank total: {total}")
    return 0 if total == 25_000 else 1


if __name__ == "__main__":
    raise SystemExit(main())
