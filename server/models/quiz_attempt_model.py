from datetime import (
    datetime,
    timezone,
)

import uuid

from bson import ObjectId

from database import (
    quiz_attempts_collection,
)


# =========================================================
# CREATE QUIZ ATTEMPT
# =========================================================

def create_quiz_attempt(
    user_id,
    subject,
    first_question_id,
    difficulty="Adaptive",
    focus_mode=True,
):
    try:
        object_user_id = ObjectId(
            user_id
        )

    except Exception:
        return {
            "success": False,
            "message":
                "Invalid user ID",
        }


    attempt_id = str(
        uuid.uuid4()
    )


    now = datetime.now(
        timezone.utc
    )


    attempt_document = {
        "userId":
            object_user_id,

        "attemptId":
            attempt_id,

        "subject":
            subject,

        "difficulty":
            difficulty,

        "focusMode":
            focus_mode,

        "questionIds": [
            str(
                first_question_id
            )
        ],

        "status":
            "active",

        "startedAt":
            now,

        "updatedAt":
            now,

        "completedAt":
            None,

        "resultId":
            None,
    }


    try:
        quiz_attempts_collection.insert_one(
            attempt_document
        )

    except Exception as error:
        return {
            "success": False,
            "message":
                f"Could not create quiz attempt: {error}",
        }


    return {
        "success": True,
        "attemptId":
            attempt_id,
    }


# =========================================================
# GET ACTIVE QUIZ ATTEMPT
# =========================================================

def get_active_quiz_attempt(
    user_id,
    attempt_id,
):
    try:
        object_user_id = ObjectId(
            user_id
        )

    except Exception:
        return None


    attempt_id = str(
        attempt_id or ""
    ).strip()


    if not attempt_id:
        return None


    return (
        quiz_attempts_collection
        .find_one(
            {
                "userId":
                    object_user_id,

                "attemptId":
                    attempt_id,

                "status":
                    "active",
            }
        )
    )


# =========================================================
# GET QUIZ ATTEMPT
# =========================================================

def get_quiz_attempt(
    user_id,
    attempt_id,
):
    try:
        object_user_id = ObjectId(
            user_id
        )

    except Exception:
        return None


    attempt_id = str(
        attempt_id or ""
    ).strip()


    if not attempt_id:
        return None


    return (
        quiz_attempts_collection
        .find_one(
            {
                "userId":
                    object_user_id,

                "attemptId":
                    attempt_id,
            }
        )
    )


# =========================================================
# ADD SERVED QUESTION
# =========================================================

def add_question_to_attempt(
    user_id,
    attempt_id,
    question_id,
):
    try:
        object_user_id = ObjectId(
            user_id
        )

    except Exception:
        return {
            "success": False,
            "message":
                "Invalid user ID",
        }


    attempt_id = str(
        attempt_id or ""
    ).strip()


    question_id = str(
        question_id or ""
    ).strip()


    if not attempt_id:
        return {
            "success": False,
            "message":
                "Quiz attempt ID is required",
        }


    if not question_id:
        return {
            "success": False,
            "message":
                "Question ID is required",
        }


    now = datetime.now(
        timezone.utc
    )


    result = (
        quiz_attempts_collection
        .update_one(
            {
                "userId":
                    object_user_id,

                "attemptId":
                    attempt_id,

                "status":
                    "active",
            },

            {
                "$addToSet": {
                    "questionIds":
                        question_id,
                },

                "$set": {
                    "updatedAt":
                        now,
                },
            },
        )
    )


    if result.matched_count == 0:
        return {
            "success": False,
            "message":
                "Active quiz attempt not found",
        }


    return {
        "success": True,
    }


# =========================================================
# VERIFY QUESTION BELONGS TO ATTEMPT
# =========================================================

def question_belongs_to_attempt(
    user_id,
    attempt_id,
    question_id,
):
    attempt = (
        get_active_quiz_attempt(
            user_id,
            attempt_id,
        )
    )


    if not attempt:
        return False


    question_ids = attempt.get(
        "questionIds",
        [],
    )


    return (
        str(question_id)
        in question_ids
    )


# =========================================================
# COMPLETE QUIZ ATTEMPT
# =========================================================

def complete_quiz_attempt(
    user_id,
    attempt_id,
    result_id=None,
):
    try:
        object_user_id = ObjectId(
            user_id
        )

    except Exception:
        return {
            "success": False,
            "message":
                "Invalid user ID",
        }


    attempt_id = str(
        attempt_id or ""
    ).strip()


    if not attempt_id:
        return {
            "success": False,
            "message":
                "Quiz attempt ID is required",
        }


    now = datetime.now(
        timezone.utc
    )


    update_data = {
        "status":
            "completed",

        "completedAt":
            now,

        "updatedAt":
            now,
    }


    if result_id is not None:
        try:
            update_data[
                "resultId"
            ] = ObjectId(
                result_id
            )

        except Exception:
            update_data[
                "resultId"
            ] = str(
                result_id
            )


    result = (
        quiz_attempts_collection
        .update_one(
            {
                "userId":
                    object_user_id,

                "attemptId":
                    attempt_id,

                "status":
                    "active",
            },

            {
                "$set":
                    update_data,
            },
        )
    )


    if result.matched_count == 0:
        return {
            "success": False,
            "message":
                "Active quiz attempt not found",
        }


    return {
        "success": True,
    }


# =========================================================
# CREATE INDEXES
# =========================================================

def create_quiz_attempt_indexes():
    quiz_attempts_collection.create_index(
        "userId"
    )


    quiz_attempts_collection.create_index(
        "attemptId",
        unique=True,
        name="unique_quiz_attempt_id",
    )


    quiz_attempts_collection.create_index(
        [
            ("userId", 1),
            ("status", 1),
        ]
    )


    quiz_attempts_collection.create_index(
        "startedAt"
    )