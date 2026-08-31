from datetime import (
    datetime,
    timezone,
)

from uuid import uuid4

from bson import ObjectId

from database import (
    quiz_attempts_collection,
)


# =========================================================
# CONFIG
# =========================================================

MAX_QUESTIONS_PER_ATTEMPT = 100


# =========================================================
# HELPERS
# =========================================================

def safe_object_id(value):
    try:
        if isinstance(
            value,
            ObjectId,
        ):
            return value

        return ObjectId(
            str(value)
        )

    except Exception:
        return None


def build_user_query(
    user_id,
):
    object_user_id = (
        safe_object_id(
            user_id
        )
    )

    if not object_user_id:
        return None

    return {
        "$in": [
            object_user_id,
            str(
                object_user_id
            ),
        ]
    }


def normalize_question_id(
    question_id,
):
    value = str(
        question_id or ""
    ).strip()

    if not value:
        return None

    return value


# =========================================================
# INDEXES
# =========================================================

def create_quiz_attempt_indexes():

    quiz_attempts_collection.create_index(
        "userId"
    )

    quiz_attempts_collection.create_index(
        "attemptId",
        unique=True,
        name=
            "unique_quiz_attempt_id",
    )

    quiz_attempts_collection.create_index(
        [
            ("userId", 1),
            ("status", 1),
        ],
        name=
            "user_active_attempt_lookup",
    )

    quiz_attempts_collection.create_index(
        [
            ("userId", 1),
            ("attemptId", 1),
        ],
        name=
            "user_attempt_lookup",
    )

    quiz_attempts_collection.create_index(
        "startedAt"
    )

    quiz_attempts_collection.create_index(
        "completedAt"
    )


# =========================================================
# CREATE ATTEMPT
# =========================================================

def create_quiz_attempt(
    user_id,
    subject,
    first_question_id,
    difficulty="Adaptive",
    focus_mode=True,
):
    object_user_id = (
        safe_object_id(
            user_id
        )
    )

    first_question_id = (
        normalize_question_id(
            first_question_id
        )
    )

    subject = str(
        subject or ""
    ).strip()

    difficulty = str(
        difficulty or
        "Adaptive"
    ).strip()

    if not object_user_id:
        return None

    if not subject:
        return None

    if not first_question_id:
        return None

    now = datetime.now(
        timezone.utc
    )

    attempt = {
        "userId":
            object_user_id,

        "attemptId":
            str(
                uuid4()
            ),

        "subject":
            subject,

        "difficulty":
            difficulty,

        "focusMode":
            bool(
                focus_mode
            ),

        # Ordered list of every question
        # officially served in this attempt.
        "questionIds": [
            first_question_id
        ],

        # Current question is stored separately
        # for clearer attempt state and future
        # concurrency hardening.
        "currentQuestionId":
            first_question_id,

        "status":
            "active",

        "resultId":
            None,

        "startedAt":
            now,

        "updatedAt":
            now,

        "completedAt":
            None,
    }

    result = (
        quiz_attempts_collection
        .insert_one(
            attempt
        )
    )

    attempt["_id"] = (
        result.inserted_id
    )

    return attempt


# =========================================================
# GET ACTIVE ATTEMPT
# =========================================================

def get_active_quiz_attempt(
    user_id,
    attempt_id,
):
    user_query = (
        build_user_query(
            user_id
        )
    )

    attempt_id = str(
        attempt_id or ""
    ).strip()

    if (
        not user_query or
        not attempt_id
    ):
        return None

    return (
        quiz_attempts_collection
        .find_one(
            {
                "userId":
                    user_query,

                "attemptId":
                    attempt_id,

                "status":
                    "active",
            }
        )
    )


# =========================================================
# GET ANY ATTEMPT
# =========================================================

def get_quiz_attempt(
    user_id,
    attempt_id,
):
    user_query = (
        build_user_query(
            user_id
        )
    )

    attempt_id = str(
        attempt_id or ""
    ).strip()

    if (
        not user_query or
        not attempt_id
    ):
        return None

    return (
        quiz_attempts_collection
        .find_one(
            {
                "userId":
                    user_query,

                "attemptId":
                    attempt_id,
            }
        )
    )


# =========================================================
# ADD QUESTION TO ATTEMPT
# =========================================================

def add_question_to_attempt(
    user_id,
    attempt_id,
    question_id,
):
    user_query = (
        build_user_query(
            user_id
        )
    )

    attempt_id = str(
        attempt_id or ""
    ).strip()

    question_id = (
        normalize_question_id(
            question_id
        )
    )

    if (
        not user_query or
        not attempt_id or
        not question_id
    ):
        return None

    attempt = (
        quiz_attempts_collection
        .find_one(
            {
                "userId":
                    user_query,

                "attemptId":
                    attempt_id,

                "status":
                    "active",
            },
            {
                "questionIds": 1,
            },
        )
    )

    if not attempt:
        return None

    question_ids = (
        attempt.get(
            "questionIds",
            [],
        )
    )

    if not isinstance(
        question_ids,
        list,
    ):
        question_ids = []

    # Never allow the same question twice
    # inside one attempt.
    if (
        question_id in
        [
            str(item)
            for item
            in question_ids
        ]
    ):
        return None

    if (
        len(
            question_ids
        ) >=
        MAX_QUESTIONS_PER_ATTEMPT
    ):
        return None

    now = datetime.now(
        timezone.utc
    )

    result = (
        quiz_attempts_collection
        .update_one(
            {
                "userId":
                    user_query,

                "attemptId":
                    attempt_id,

                "status":
                    "active",

                "questionIds": {
                    "$ne":
                        question_id
                },
            },
            {
                "$push": {
                    "questionIds":
                        question_id,
                },

                "$set": {
                    "currentQuestionId":
                        question_id,

                    "updatedAt":
                        now,
                },
            },
        )
    )

    if (
        result.modified_count != 1
    ):
        return None

    return (
        get_active_quiz_attempt(
            user_id=
                user_id,

            attempt_id=
                attempt_id,
        )
    )


# =========================================================
# QUESTION BELONGS TO ATTEMPT
# =========================================================

def question_belongs_to_attempt(
    user_id,
    attempt_id,
    question_id,
):
    attempt = (
        get_active_quiz_attempt(
            user_id=
                user_id,

            attempt_id=
                attempt_id,
        )
    )

    if not attempt:
        return False

    question_id = (
        normalize_question_id(
            question_id
        )
    )

    if not question_id:
        return False

    question_ids = (
        attempt.get(
            "questionIds",
            [],
        )
    )

    if not isinstance(
        question_ids,
        list,
    ):
        return False

    return (
        question_id
        in
        [
            str(item)
            for item
            in question_ids
        ]
    )


# =========================================================
# CURRENT QUESTION
# =========================================================

def get_current_question_id(
    user_id,
    attempt_id,
):
    attempt = (
        get_active_quiz_attempt(
            user_id=
                user_id,

            attempt_id=
                attempt_id,
        )
    )

    if not attempt:
        return None

    current_question_id = (
        attempt.get(
            "currentQuestionId"
        )
    )

    if current_question_id:
        return str(
            current_question_id
        )

    # Backward compatibility for attempts
    # created before currentQuestionId existed.
    question_ids = (
        attempt.get(
            "questionIds",
            [],
        )
    )

    if (
        isinstance(
            question_ids,
            list,
        )
        and question_ids
    ):
        return str(
            question_ids[-1]
        )

    return None


# =========================================================
# COMPLETE ATTEMPT
# =========================================================

def complete_quiz_attempt(
    user_id,
    attempt_id,
    result_id=None,
):
    user_query = (
        build_user_query(
            user_id
        )
    )

    attempt_id = str(
        attempt_id or ""
    ).strip()

    if (
        not user_query or
        not attempt_id
    ):
        return None

    now = datetime.now(
        timezone.utc
    )

    normalized_result_id = None

    if result_id is not None:
        object_result_id = (
            safe_object_id(
                result_id
            )
        )

        normalized_result_id = (
            object_result_id
            if object_result_id
            else str(
                result_id
            )
        )

    result = (
        quiz_attempts_collection
        .update_one(
            {
                "userId":
                    user_query,

                "attemptId":
                    attempt_id,

                "status":
                    "active",
            },
            {
                "$set": {
                    "status":
                        "completed",

                    "resultId":
                        normalized_result_id,

                    "completedAt":
                        now,

                    "updatedAt":
                        now,
                }
            },
        )
    )

    if (
        result.modified_count != 1
    ):
        return None

    return (
        get_quiz_attempt(
            user_id=
                user_id,

            attempt_id=
                attempt_id,
        )
    )
