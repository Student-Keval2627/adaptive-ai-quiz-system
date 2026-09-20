import hashlib
import json

from datetime import (
    datetime,
    timezone,
)

from pathlib import Path

from bson import ObjectId
from pymongo import UpdateOne

from database import (
    question_bank_meta_collection,
    question_history_collection,
    questions_collection,
)


# =========================================================
# QUESTION BANK CONFIG
# =========================================================

QUESTION_BANK_VERSION = 6

QUESTIONS_PER_SUBJECT = 1000

DIFFICULTY_QUESTION_TARGETS = {
    "Easy": 300,      # Low level
    "Medium": 400,    # Mid level
    "Hard": 300,      # High level
}

DIFFICULTY_DISPLAY_NAMES = {
    "Easy": "Low",
    "Medium": "Mid",
    "Hard": "High",
}

VALID_DIFFICULTIES = [
    "Easy",
    "Medium",
    "Hard",
]

QUESTION_DATA_DIR = (
    Path(__file__)
    .resolve()
    .parents[1]
    / "data"
    / "questions"
)

PLANNED_SUBJECTS = [
    "Python",
    "C Programming",
    "C++",
    "Java",
    "JavaScript",
    "TypeScript",
    "Data Structures",
    "Algorithms",
    "SQL",
    "DBMS",
    "Operating Systems",
    "Computer Networks",
    "Object Oriented Programming",
    "Machine Learning",
    "Web Development",
    "React",
    "Node.js",
    "Flask",
    "Django",
    "Git & GitHub",
    "Software Engineering",
    "Computer Architecture",
    "Cyber Security",
    "Cloud Computing",
    "Data Science",
]


# =========================================================
# SAFE OBJECT ID
# =========================================================

def safe_object_id(value):
    try:
        if isinstance(value, ObjectId):
            return value

        return ObjectId(
            str(value)
        )

    except Exception:
        return None


# =========================================================
# NORMALIZE QUESTION
# =========================================================

def normalize_question(question):
    if not isinstance(
        question,
        dict,
    ):
        return None

    subject = str(
        question.get(
            "subject",
            "",
        )
    ).strip()

    topic = str(
        question.get(
            "topic",
            "General",
        )
    ).strip()

    difficulty = str(
        question.get(
            "difficulty",
            "Medium",
        )
    ).strip()

    question_text = str(
        question.get(
            "question",
            "",
        )
    ).strip()

    answer = str(
        question.get(
            "answer",
            "",
        )
    ).strip()

    raw_options = question.get(
        "options",
        [],
    )

    if not subject:
        return None

    if not topic:
        topic = "General"

    if (
        difficulty not in
        VALID_DIFFICULTIES
    ):
        return None

    if not question_text:
        return None

    if not isinstance(
        raw_options,
        list,
    ):
        return None

    options = []

    for option in raw_options:
        cleaned_option = str(
            option
        ).strip()

        if (
            cleaned_option and
            cleaned_option not in
            options
        ):
            options.append(
                cleaned_option
            )

    if len(options) < 2:
        return None

    if (
        not answer or
        answer not in options
    ):
        return None

    return {
        "subject":
            subject,
        "topic":
            topic,
        "difficulty":
            difficulty,
        "question":
            question_text,
        "options":
            options,
        "answer":
            answer,
    }


# =========================================================
# QUESTION BANK KEY
# =========================================================

def build_question_bank_key(
    subject,
    question,
):
    value = (
        f"{subject.strip().lower()}|"
        f"{question.strip().lower()}"
    )

    return hashlib.sha256(
        value.encode(
            "utf-8"
        )
    ).hexdigest()


# =========================================================
# LOAD EXTERNAL JSON QUESTIONS
# =========================================================

def load_external_questions():
    if not QUESTION_DATA_DIR.exists():
        return []

    loaded_questions = []

    json_files = sorted(
        QUESTION_DATA_DIR.rglob(
            "*.json"
        )
    )

    for file_path in json_files:
        try:
            with file_path.open(
                "r",
                encoding="utf-8",
            ) as file:
                content = json.load(
                    file
                )

        except Exception as error:
            print(
                "Question bank file warning:",
                file_path.name,
                error,
            )
            continue

        if isinstance(
            content,
            dict,
        ):
            content = content.get(
                "questions",
                [],
            )

        if not isinstance(
            content,
            list,
        ):
            print(
                "Question bank warning:",
                file_path.name,
                "must contain a list of questions.",
            )
            continue

        for raw_question in content:
            question = normalize_question(
                raw_question
            )

            if question:
                loaded_questions.append(
                    question
                )

    return loaded_questions


# =========================================================
# BUILD COMPLETE QUESTION BANK
# =========================================================

def build_complete_question_bank():
    question_map = {}

    # The materialized JSON bank is the single production
    # source of truth. Missing or incomplete files fail the
    # count validation below instead of creating fake data.
    for raw_question in load_external_questions():
        question = normalize_question(
            raw_question
        )

        if not question:
            continue

        key = (
            question[
                "subject"
            ].lower(),
            question[
                "question"
            ].lower(),
        )

        question_map[key] = question

    questions = list(
        question_map.values()
    )

    counts = {
        subject: {
            difficulty: 0
            for difficulty
            in VALID_DIFFICULTIES
        }
        for subject in PLANNED_SUBJECTS
    }

    for question in questions:
        subject = question["subject"]
        difficulty = question["difficulty"]

        if subject not in counts:
            raise RuntimeError(
                "Unexpected question-bank subject: "
                f"{subject}"
            )

        counts[subject][difficulty] += 1

    count_errors = []

    for subject in PLANNED_SUBJECTS:
        for difficulty in VALID_DIFFICULTIES:
            actual = counts[subject][difficulty]
            expected = (
                DIFFICULTY_QUESTION_TARGETS[
                    difficulty
                ]
            )

            if actual != expected:
                count_errors.append(
                    f"{subject}/{difficulty}: "
                    f"expected {expected}, found {actual}"
                )

    if count_errors:
        raise RuntimeError(
            "Incomplete question bank: "
            + "; ".join(count_errors)
        )

    subject_order = {
        subject: index
        for index, subject
        in enumerate(PLANNED_SUBJECTS)
    }
    difficulty_order = {
        difficulty: index
        for index, difficulty
        in enumerate(VALID_DIFFICULTIES)
    }

    return sorted(
        questions,
        key=lambda question: (
            subject_order[question["subject"]],
            difficulty_order[question["difficulty"]],
            question["question"].lower(),
        ),
    )


# =========================================================
# INDEXES
# =========================================================

def create_question_indexes():

    # -----------------------------------------------------
    # QUESTIONS
    # -----------------------------------------------------

    questions_collection.create_index(
        "subject"
    )

    questions_collection.create_index(
        "difficulty"
    )

    questions_collection.create_index(
        "topic"
    )

    questions_collection.create_index(
        "bankKey"
    )

    questions_collection.create_index(
        [
            ("subject", 1),
            ("difficulty", 1),
        ]
    )

    questions_collection.create_index(
        [
            ("subject", 1),
            ("topic", 1),
            ("difficulty", 1),
        ]
    )

    questions_collection.create_index(
        [
            ("subject", 1),
            ("question", 1),
        ]
    )

    # -----------------------------------------------------
    # QUESTION HISTORY
    # -----------------------------------------------------

    question_history_collection.create_index(
        "userId"
    )

    question_history_collection.create_index(
        "questionId"
    )

    question_history_collection.create_index(
        [
            ("userId", 1),
            ("questionId", 1),
        ],
        unique=True,
        name=
            "unique_user_question_history",
    )

    question_history_collection.create_index(
        [
            ("userId", 1),
            ("subject", 1),
            ("bankVersion", 1),
            ("lastSeenAt", -1),
        ]
    )


# =========================================================
# SAFE QUESTION BANK SYNC
# =========================================================

def sync_question_bank():
    question_bank = (
        build_complete_question_bank()
    )

    operations = []

    for question in question_bank:
        bank_key = (
            build_question_bank_key(
                question[
                    "subject"
                ],
                question[
                    "question"
                ],
            )
        )

        document = {
            **question,
            "bankKey":
                bank_key,
            "bankVersion":
                QUESTION_BANK_VERSION,
        }

        operations.append(
            UpdateOne(
                {
                    "subject":
                        question[
                            "subject"
                        ],
                    "question":
                        question[
                            "question"
                        ],
                },
                {
                    "$set":
                        document,
                },
                upsert=True,
            )
        )

    inserted_count = 0
    updated_count = 0
    removed_count = 0

    if operations:
        result = (
            questions_collection
            .bulk_write(
                operations,
                ordered=False,
            )
        )

        inserted_count = (
            result.upserted_count
        )

        updated_count = (
            result.modified_count
        )

        # Remove records from earlier generated banks only
        # after the complete replacement bank was upserted.
        stale_result = (
            questions_collection.delete_many(
                {
                    "subject": {
                        "$in":
                            PLANNED_SUBJECTS,
                    },
                    "bankVersion": {
                        "$ne":
                            QUESTION_BANK_VERSION,
                    },
                }
            )
        )

        removed_count = (
            stale_result.deleted_count
        )

    total_count = (
        questions_collection
        .count_documents(
            {
                "subject": {
                    "$in":
                        PLANNED_SUBJECTS,
                },
                "bankVersion":
                    QUESTION_BANK_VERSION,
            }
        )
    )

    subject_pipeline = [
        {
            "$match": {
                "subject": {
                    "$in":
                        PLANNED_SUBJECTS,
                },
                "bankVersion":
                    QUESTION_BANK_VERSION,
            }
        },
        {
            "$group": {
                "_id":
                    "$subject",
                "count": {
                    "$sum": 1
                },
            }
        },
        {
            "$sort": {
                "_id": 1
            }
        },
    ]

    subject_counts = {}

    for item in (
        questions_collection.aggregate(
            subject_pipeline
        )
    ):
        subject_name = item.get(
            "_id"
        )

        if subject_name:
            subject_counts[
                subject_name
            ] = item.get(
                "count",
                0,
            )

    now = datetime.now(
        timezone.utc
    )

    question_bank_meta_collection.update_one(
        {
            "_id":
                "main_question_bank",
        },
        {
            "$set": {
                "bankVersion":
                    QUESTION_BANK_VERSION,
                "totalQuestions":
                    total_count,
                "subjects":
                    subject_counts,
                "sourceQuestionCount":
                    len(
                        question_bank
                    ),
                "lastSyncedAt":
                    now,
            }
        },
        upsert=True,
    )

    print(
        "Question bank synced:"
        f" {inserted_count} inserted,"
        f" {updated_count} updated,"
        f" {removed_count} stale removed,"
        f" {total_count} total."
    )

    return {
        "inserted":
            inserted_count,
        "updated":
            updated_count,
        "removed":
            removed_count,
        "total":
            total_count,
        "subjects":
            subject_counts,
    }


# =========================================================
# BACKWARD COMPATIBILITY
# =========================================================

def seed_questions():
    return sync_question_bank()


# =========================================================
# AVAILABLE SUBJECTS
# =========================================================

def get_available_subjects():
    subjects = (
        questions_collection
        .distinct(
            "subject",
            {
                "bankVersion":
                    QUESTION_BANK_VERSION,
            },
        )
    )

    return sorted(
        [
            str(subject)
            for subject
            in subjects
            if subject
        ]
    )


# =========================================================
# SUBJECT QUESTION COUNTS
# =========================================================

def get_subject_question_counts():
    pipeline = [
        {
            "$match": {
                "bankVersion":
                    QUESTION_BANK_VERSION,
            }
        },
        {
            "$group": {
                "_id":
                    "$subject",
                "count": {
                    "$sum": 1
                },
            }
        },
        {
            "$sort": {
                "_id": 1
            }
        },
    ]

    return {
        item["_id"]:
            item["count"]
        for item in
        questions_collection.aggregate(
            pipeline
        )
        if item.get(
            "_id"
        )
    }


# =========================================================
# SERIALIZE PUBLIC QUESTION
# NEVER RETURN THE ANSWER
# =========================================================

def serialize_question(question):
    if not question:
        return None

    return {
        "id":
            str(
                question["_id"]
            ),
        "subject":
            question.get(
                "subject",
                "",
            ),
        "topic":
            question.get(
                "topic",
                "",
            ),
        "difficulty":
            question.get(
                "difficulty",
                "Medium",
            ),
        "question":
            question.get(
                "question",
                "",
            ),
        "options":
            question.get(
                "options",
                [],
            ),
    }


# =========================================================
# FIND RAW QUESTION
# =========================================================

def find_question_by_id(
    question_id,
):
    object_id = safe_object_id(
        question_id
    )

    if not object_id:
        return None

    return (
        questions_collection.find_one(
            {
                "_id":
                    object_id,
                "bankVersion":
                    QUESTION_BANK_VERSION,
            }
        )
    )


# =========================================================
# NORMALIZE QUESTION IDS
# =========================================================

def normalize_question_ids(
    question_ids,
):
    if not isinstance(
        question_ids,
        list,
    ):
        return []

    object_ids = []
    seen = set()

    for question_id in question_ids:
        object_id = safe_object_id(
            question_id
        )

        if not object_id:
            continue

        string_id = str(
            object_id
        )

        if string_id in seen:
            continue

        seen.add(
            string_id
        )

        object_ids.append(
            object_id
        )

    return object_ids


# =========================================================
# USER QUESTION HISTORY
# =========================================================

def get_mastered_question_ids(
    user_id,
    subject=None,
):
    object_user_id = safe_object_id(
        user_id
    )

    if not object_user_id:
        return []

    query = {
        "userId": object_user_id,
        "isCorrect": True,
        "bankVersion":
            QUESTION_BANK_VERSION,
    }

    if subject:
        query["subject"] = subject

    cursor = (
        question_history_collection.find(
            query,
            {
                "questionId": 1,
            },
        )
    )

    question_ids = []

    for item in cursor:
        question_id = safe_object_id(
            item.get("questionId")
        )

        if question_id:
            question_ids.append(
                question_id
            )

    return question_ids


def get_seen_question_ids(
    user_id,
    subject=None,
):
    object_user_id = safe_object_id(
        user_id
    )

    if not object_user_id:
        return []

    query = {
        "userId": object_user_id,
        "bankVersion":
            QUESTION_BANK_VERSION,
    }

    if subject:
        query["subject"] = subject

    cursor = (
        question_history_collection.find(
            query,
            {
                "questionId": 1,
            },
        )
    )

    question_ids = []

    for item in cursor:
        question_id = safe_object_id(
            item.get("questionId")
        )

        if question_id:
            question_ids.append(
                question_id
            )

    return question_ids

# =========================================================
# RECORD SERVED QUESTION
# =========================================================

def record_question_seen(
    user_id,
    question_id,
):
    object_user_id = safe_object_id(
        user_id
    )

    object_question_id = safe_object_id(
        question_id
    )

    if (
        not object_user_id or
        not object_question_id
    ):
        return {
            "success": False,
            "message":
                "Invalid user or question ID",
        }

    question = (
        questions_collection.find_one(
            {
                "_id":
                    object_question_id
            }
        )
    )

    if not question:
        return {
            "success": False,
            "message":
                "Question not found",
        }

    now = datetime.now(
        timezone.utc
    )

    question_history_collection.update_one(
        {
            "userId":
                object_user_id,
            "questionId":
                object_question_id,
        },
        {
            "$set": {
                "subject":
                    question.get(
                        "subject",
                        "",
                    ),
                "topic":
                    question.get(
                        "topic",
                        "General",
                    ),
                "difficulty":
                    question.get(
                        "difficulty",
                        "Medium",
                    ),
                "bankVersion":
                    question.get(
                        "bankVersion",
                        QUESTION_BANK_VERSION,
                    ),
                "lastSeenAt":
                    now,
            },
            "$setOnInsert": {
                "firstSeenAt":
                    now,
            },
            "$inc": {
                "timesSeen": 1,
            },
        },
        upsert=True,
    )

    return {
        "success": True,
    }

# =========================================================
# RECORD QUESTION ANSWER
# =========================================================

def record_question_answer(
    user_id,
    question_id,
    selected_answer,
):
    object_user_id = safe_object_id(
        user_id
    )

    object_question_id = safe_object_id(
        question_id
    )

    if (
        not object_user_id or
        not object_question_id
    ):
        return {
            "success": False,
            "message":
                "Invalid user or question ID",
        }

    question = questions_collection.find_one(
        {
            "_id": object_question_id,
        }
    )

    if not question:
        return {
            "success": False,
            "message":
                "Question not found",
        }

    correct_answer = question.get(
        "answer"
    )

    is_correct = (
        selected_answer ==
        correct_answer
    )

    now = datetime.now(
        timezone.utc
    )

    update_fields = {
        "subject":
            question.get(
                "subject",
                "",
            ),
        "topic":
            question.get(
                "topic",
                "General",
            ),
        "difficulty":
            question.get(
                "difficulty",
                "Medium",
            ),
        "bankVersion":
            question.get(
                "bankVersion",
                QUESTION_BANK_VERSION,
            ),
        "lastSelectedAnswer":
            selected_answer,
        "lastAnswerCorrect":
            is_correct,
        "lastAnsweredAt":
            now,
    }

    if is_correct:
        update_fields["isCorrect"] = True
        update_fields["masteredAt"] = now

    else:
        update_fields[
            "hasIncorrectAnswer"
        ] = True

        update_fields[
            "lastIncorrectAt"
        ] = now

    question_history_collection.update_one(
        {
            "userId":
                object_user_id,
            "questionId":
                object_question_id,
        },
        {
            "$set":
                update_fields,
            "$setOnInsert": {
                "firstSeenAt":
                    now,
                "timesSeen":
                    0,
            },
        },
        upsert=True,
    )

    return {
        "success": True,
        "correct":
            is_correct,
    }
# =========================================================
# SUBJECT MASTERY PROGRESS
# =========================================================

def get_subject_mastery_progress(
    user_id,
    subject,
):
    object_user_id = safe_object_id(
        user_id
    )

    subject = str(
        subject or ""
    ).strip()

    levels = {}

    for difficulty in VALID_DIFFICULTIES:
        target = (
            DIFFICULTY_QUESTION_TARGETS[
                difficulty
            ]
        )

        completed = 0

        if (
            object_user_id and
            subject
        ):
            completed = (
                question_history_collection
                .count_documents(
                    {
                        "userId":
                            object_user_id,
                        "subject":
                            subject,
                        "difficulty":
                            difficulty,
                        "bankVersion":
                            QUESTION_BANK_VERSION,
                        "isCorrect":
                            True,
                    }
                )
            )

        completed = min(
            int(completed),
            target,
        )

        percentage = round(
            (
                completed /
                target
            ) * 100
        ) if target else 0

        levels[difficulty] = {
            "name":
                DIFFICULTY_DISPLAY_NAMES[
                    difficulty
                ],
            "completed":
                completed,
            "target":
                target,
            "percentage":
                percentage,
            "passed":
                completed >= target,
        }

    total_completed = sum(
        level["completed"]
        for level in levels.values()
    )

    total_percentage = round(
        (
            total_completed /
            QUESTIONS_PER_SUBJECT
        ) * 100
    )

    return {
        "subject":
            subject,
        "totalCompleted":
            total_completed,
        "totalTarget":
            QUESTIONS_PER_SUBJECT,
        "percentage":
            total_percentage,
        "levels":
            levels,
        "lowLevelPassed":
            levels["Easy"]["passed"],
        "subjectCompleted":
            (
                total_completed >=
                QUESTIONS_PER_SUBJECT
            ),
    }



# =========================================================
# RANDOM SAMPLE
# =========================================================

def sample_questions(
    match_filter,
    size,
):
    if size <= 0:
        return []

    pipeline = [
        {
            "$match":
                match_filter
        },
        {
            "$sample": {
                "size":
                    size
            }
        },
    ]

    return list(
        questions_collection.aggregate(
            pipeline
        )
    )


# =========================================================
# RANDOM QUESTION LIST
# =========================================================

def get_questions(
    subject,
    limit=5,
    user_id=None,
    exclude_ids=None,
):
    try:
        limit = int(
            limit
        )

    except (
        TypeError,
        ValueError,
    ):
        limit = 5

    limit = max(
        1,
        min(
            limit,
            20,
        ),
    )

    excluded_ids = (
        normalize_question_ids(
            exclude_ids or []
        )
    )

    seen_ids = []

    if user_id:
        seen_ids = (
            get_seen_question_ids(
                user_id=user_id,
                subject=subject,
            )
        )

    mastered_ids = []

    if user_id:
        mastered_ids = (
            get_mastered_question_ids(
                user_id=user_id,
                subject=subject,
            )
        )

    blocked_ids = {
        str(question_id):
            question_id
        for question_id in (
            excluded_ids +
            seen_ids
        )
    }

    unseen_filter = {
        "subject":
            subject,
        "bankVersion":
            QUESTION_BANK_VERSION,
        "_id": {
            "$nin":
                list(
                    blocked_ids.values()
                )
        },
    }

    selected = (
        sample_questions(
            unseen_filter,
            limit,
        )
    )

    if len(selected) < limit:
        selected_ids = [
            question["_id"]
            for question
            in selected
        ]

        fallback_blocked = (
            excluded_ids +
            selected_ids +
            mastered_ids
        )

        fallback_filter = {
            "subject":
                subject,
            "bankVersion":
                QUESTION_BANK_VERSION,
            "_id": {
                "$nin":
                    fallback_blocked
            },
        }

        remaining = (
            limit -
            len(selected)
        )

        selected.extend(
            sample_questions(
                fallback_filter,
                remaining,
            )
        )

    return [
        serialize_question(
            question
        )
        for question
        in selected
    ]


# =========================================================
# CHECK ANSWER
# =========================================================

def check_question_answer(
    question_id,
    selected_answer,
):
    question = (
        find_question_by_id(
            question_id
        )
    )

    if not question:
        return None

    correct_answer = (
        question.get(
            "answer"
        )
    )

    return {
        "correct":
            selected_answer ==
            correct_answer,
        "correctAnswer":
            correct_answer,
        "subject":
            question.get(
                "subject",
                "",
            ),
        "topic":
            question.get(
                "topic",
                "",
            ),
        "difficulty":
            question.get(
                "difficulty",
                "Medium",
            ),
    }


# =========================================================
# SAMPLE ONE
# =========================================================

def _sample_one(
    match_filter,
):
    questions = sample_questions(
        match_filter,
        1,
    )

    if not questions:
        return None

    return questions[0]


# =========================================================
# SELECT ADAPTIVE CANDIDATE
# =========================================================

def select_adaptive_candidate(
    subject,
    difficulty,
    preferred_topic,
    blocked_ids,
):
    base_filter = {
        "subject":
            subject,
        "bankVersion":
            QUESTION_BANK_VERSION,
        "_id": {
            "$nin":
                blocked_ids
        },
    }

    candidate_filters = []

    # Focus Mode priority:
    # 1. preferred topic + exact difficulty
    # 2. preferred topic + any difficulty
    # 3. exact difficulty + any topic
    # 4. any available question

    if preferred_topic:
        candidate_filters.append(
            {
                **base_filter,
                "topic":
                    preferred_topic,
                "difficulty":
                    difficulty,
            }
        )

        candidate_filters.append(
            {
                **base_filter,
                "topic":
                    preferred_topic,
            }
        )

    candidate_filters.append(
        {
            **base_filter,
            "difficulty":
                difficulty,
        }
    )

    candidate_filters.append(
        base_filter
    )

    for candidate_filter in candidate_filters:
        question = _sample_one(
            candidate_filter
        )

        if question:
            return question

    return None


# =========================================================
# ADAPTIVE QUESTION SELECTOR
#
# 1. Questions from the current quiz are never repeated.
# 2. User history is avoided when user_id is supplied.
# 3. Seen questions are reusable only after unseen questions
#    for that subject are exhausted.
# =========================================================

def get_adaptive_question(
    subject,
    difficulty,
    preferred_topic=None,
    exclude_ids=None,
    user_id=None,
):
    current_quiz_ids = (
        normalize_question_ids(
            exclude_ids or []
        )
    )

    seen_ids = []
    mastered_ids = []

    if user_id:
        seen_ids = (
            get_seen_question_ids(
                user_id=user_id,
                subject=subject,
            )
        )

        mastered_ids = (
            get_mastered_question_ids(
                user_id=user_id,
                subject=subject,
            )
        )

    # =====================================================
    # FIRST PASS: NEVER-SEEN QUESTIONS
    # =====================================================

    unseen_blocked_map = {
        str(question_id):
            question_id
        for question_id in (
            current_quiz_ids +
            seen_ids
        )
    }

    question = (
        select_adaptive_candidate(
            subject=subject,
            difficulty=difficulty,
            preferred_topic=
                preferred_topic,
            blocked_ids=
                list(
                    unseen_blocked_map
                    .values()
                ),
        )
    )

    if question:
        return serialize_question(
            question
        )

    # =====================================================
    # SECOND PASS:
    # All unseen questions for this subject are exhausted.
    # Previously incorrect questions may now be reused.
    # Correctly answered questions and current-attempt
    # questions always remain blocked.
    # =====================================================

    question = (
        select_adaptive_candidate(
            subject=subject,
            difficulty=difficulty,
            preferred_topic=
                preferred_topic,
            blocked_ids=
                list(
                    {
                        str(question_id):
                            question_id
                        for question_id in (
                            current_quiz_ids +
                            mastered_ids
                        )
                    }.values()
                ),
        )
    )

    if not question:
        return None

    return serialize_question(
        question
    )
