from datetime import (
    datetime,
    timedelta,
    timezone,
)

from bson import ObjectId

from pymongo.errors import (
    DuplicateKeyError,
)

from database import (
    quiz_results_collection,
    users_collection,
)

from models.quiz_attempt_model import (
    complete_quiz_attempt,
    get_active_quiz_attempt,
)

from models.quiz_model import (
    find_question_by_id,
)


# =========================================================
# CONFIG
# =========================================================

MAX_ANSWERS_PER_QUIZ = 100
RESULT_VERIFICATION_VERSION = 4


# =========================================================
# HELPERS
# =========================================================

def safe_object_id(value):
    try:
        if isinstance(value, ObjectId):
            return value
        return ObjectId(str(value))
    except Exception:
        return None


def safe_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


# =========================================================
# INDEXES
# =========================================================

def create_result_indexes():
    quiz_results_collection.create_index("userId")
    quiz_results_collection.create_index("createdAt")

    quiz_results_collection.create_index(
        [
            ("userId", 1),
            ("createdAt", -1),
        ]
    )

    quiz_results_collection.create_index(
        [
            ("userId", 1),
            ("subject", 1),
            ("createdAt", -1),
        ]
    )

    quiz_results_collection.create_index(
        [
            ("userId", 1),
            ("attemptId", 1),
        ],
        unique=True,
        name="unique_user_quiz_attempt",
        partialFilterExpression={
            "attemptId": {
                "$type": "string"
            }
        },
    )


# =========================================================
# STREAK
# =========================================================

def calculate_streak(user):
    now = datetime.now(timezone.utc)

    stats = user.get(
        "stats",
        {},
    )

    current_streak = safe_int(
        stats.get(
            "streak",
            0,
        )
    )

    last_quiz_at = stats.get(
        "lastQuizAt"
    )

    if not last_quiz_at:
        return 1

    if getattr(
        last_quiz_at,
        "tzinfo",
        None,
    ) is None:
        last_quiz_at = (
            last_quiz_at.replace(
                tzinfo=timezone.utc
            )
        )

    if (
        last_quiz_at.date()
        == now.date()
    ):
        return max(
            current_streak,
            1,
        )

    yesterday = (
        now
        - timedelta(days=1)
    ).date()

    if (
        last_quiz_at.date()
        == yesterday
    ):
        return (
            current_streak + 1
        )

    return 1


# =========================================================
# USER STATS RESPONSE
# =========================================================

def serialize_user_stats(user):
    stats = user.get(
        "stats",
        {},
    )

    return {
        "quizzesCompleted":
            safe_int(
                stats.get(
                    "quizzesCompleted",
                    0,
                )
            ),
        "questionsAnswered":
            safe_int(
                stats.get(
                    "questionsAnswered",
                    0,
                )
            ),
        "correctAnswers":
            safe_int(
                stats.get(
                    "correctAnswers",
                    0,
                )
            ),
        "accuracy":
            safe_int(
                stats.get(
                    "accuracy",
                    0,
                )
            ),
        "bestAccuracy":
            safe_int(
                stats.get(
                    "bestAccuracy",
                    0,
                )
            ),
        "xp":
            safe_int(
                stats.get(
                    "xp",
                    0,
                )
            ),
        "level":
            max(
                1,
                safe_int(
                    stats.get(
                        "level",
                        1,
                    ),
                    1,
                ),
            ),
        "streak":
            safe_int(
                stats.get(
                    "streak",
                    0,
                )
            ),
        "bestStreak":
            safe_int(
                stats.get(
                    "bestStreak",
                    0,
                )
            ),
    }


# =========================================================
# SERIALIZE RESULT
# =========================================================

def serialize_result(result):
    if not result:
        return None

    created_at = result.get(
        "createdAt"
    )

    score = safe_int(
        result.get(
            "score",
            0,
        )
    )

    xp_earned = result.get(
        "xpEarned"
    )

    if xp_earned is None:
        xp_earned = (
            score * 20
        ) + 50

    return {
        "id":
            str(
                result["_id"]
            ),
        "attemptId":
            result.get(
                "attemptId"
            ),
        "subject":
            result.get(
                "subject",
                "",
            ),
        "score":
            score,
        "total":
            safe_int(
                result.get(
                    "total",
                    0,
                )
            ),
        "accuracy":
            safe_int(
                result.get(
                    "accuracy",
                    0,
                )
            ),
        "xpEarned":
            safe_int(
                xp_earned,
                0,
            ),
        "verified":
            bool(
                result.get(
                    "verified",
                    False,
                )
            ),
        "verificationVersion":
            result.get(
                "verificationVersion"
            ),
        "answers":
            result.get(
                "answers",
                [],
            ),
        "createdAt":
            (
                created_at.isoformat()
                if created_at
                else None
            ),
    }


# =========================================================
# VERIFY ANSWERS AGAINST QUESTION DATABASE
# =========================================================

def verify_quiz_answers(
    subject,
    submitted_answers,
):
    subject = str(
        subject or ""
    ).strip()

    if not subject:
        return {
            "success": False,
            "message":
                "Subject is required",
        }

    if not isinstance(
        submitted_answers,
        list,
    ):
        return {
            "success": False,
            "message":
                "Answers must be a list",
        }

    if len(
        submitted_answers
    ) == 0:
        return {
            "success": False,
            "message":
                "Quiz must contain at least one answer",
        }

    if (
        len(submitted_answers)
        > MAX_ANSWERS_PER_QUIZ
    ):
        return {
            "success": False,
            "message":
                "Too many quiz answers submitted",
        }

    verified_answers = []
    used_question_ids = set()
    score = 0

    for index, answer in enumerate(
        submitted_answers
    ):
        if not isinstance(
            answer,
            dict,
        ):
            return {
                "success": False,
                "message":
                    f"Invalid answer at question {index + 1}",
            }

        question_id = str(
            answer.get(
                "questionId",
                "",
            )
        ).strip()

        if not question_id:
            return {
                "success": False,
                "message":
                    f"Question ID missing at question {index + 1}",
            }

        if (
            question_id in
            used_question_ids
        ):
            return {
                "success": False,
                "message":
                    "Duplicate question detected",
            }

        selected_answer = (
            answer.get(
                "selectedAnswer"
            )
        )

        if selected_answer is None:
            return {
                "success": False,
                "message":
                    f"Answer missing at question {index + 1}",
            }

        question = (
            find_question_by_id(
                question_id
            )
        )

        if not question:
            return {
                "success": False,
                "message":
                    f"Question {index + 1} not found",
            }

        if (
            question.get(
                "subject"
            )
            != subject
        ):
            return {
                "success": False,
                "message":
                    "Question subject mismatch",
            }

        options = question.get(
            "options",
            [],
        )

        if (
            selected_answer
            not in options
        ):
            return {
                "success": False,
                "message":
                    f"Invalid answer at question {index + 1}",
            }

        correct_answer = (
            question.get(
                "answer"
            )
        )

        was_correct = (
            selected_answer
            == correct_answer
        )

        if was_correct:
            score += 1

        verified_answers.append(
            {
                "questionId":
                    question_id,
                "question":
                    question.get(
                        "question",
                        "",
                    ),
                "subject":
                    subject,
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
                "selectedAnswer":
                    selected_answer,
                "correctAnswer":
                    correct_answer,
                "correct":
                    was_correct,
            }
        )

        used_question_ids.add(
            question_id
        )

    total = len(
        verified_answers
    )

    accuracy = (
        round(
            (
                score / total
            ) * 100
        )
        if total > 0
        else 0
    )

    return {
        "success": True,
        "score":
            score,
        "total":
            total,
        "accuracy":
            accuracy,
        "answers":
            verified_answers,
    }


# =========================================================
# VERIFY ANSWERS BELONG TO REAL ATTEMPT
# =========================================================

def verify_attempt_questions(
    attempt,
    subject,
    verified_answers,
):
    attempt_subject = str(
        attempt.get(
            "subject",
            "",
        )
    ).strip()

    if (
        attempt_subject
        != subject
    ):
        return {
            "success": False,
            "message":
                "Quiz subject does not match this attempt",
        }

    served_question_ids = (
        attempt.get(
            "questionIds",
            [],
        )
    )

    if not isinstance(
        served_question_ids,
        list,
    ):
        return {
            "success": False,
            "message":
                "Quiz attempt question data is invalid",
        }

    served_question_ids = [
        str(question_id).strip()
        for question_id
        in served_question_ids
        if str(question_id).strip()
    ]

    submitted_question_ids = [
        str(
            answer.get(
                "questionId",
                "",
            )
        ).strip()
        for answer
        in verified_answers
    ]

    if not served_question_ids:
        return {
            "success": False,
            "message":
                "Quiz attempt contains no served questions",
        }

    if (
        submitted_question_ids
        != served_question_ids
    ):
        return {
            "success": False,
            "message":
                "Submitted answers do not match the questions served in this quiz attempt",
        }

    return {
        "success": True,
    }


# =========================================================
# EXISTING RESULT FOR ATTEMPT
# =========================================================

def get_existing_attempt(
    user_id,
    attempt_id,
):
    object_user_id = (
        safe_object_id(
            user_id
        )
    )

    attempt_id = str(
        attempt_id or ""
    ).strip()

    if (
        not object_user_id
        or not attempt_id
    ):
        return None

    return (
        quiz_results_collection
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
# DUPLICATE RESPONSE
# =========================================================

def duplicate_result_response(
    existing_result,
    user_id,
):
    object_user_id = (
        safe_object_id(
            user_id
        )
    )

    latest_user = None

    if object_user_id:
        latest_user = (
            users_collection.find_one(
                {
                    "_id":
                        object_user_id
                }
            )
        )

    return {
        "success": True,
        "duplicate": True,
        "message":
            "Quiz result was already saved. No extra XP was added.",
        "result":
            serialize_result(
                existing_result
            ),
        "stats":
            serialize_user_stats(
                latest_user or {}
            ),
    }


# =========================================================
# SAVE VERIFIED RESULT
# =========================================================

def save_quiz_result(
    user_id,
    subject,
    answers=None,
    attempt_id=None,
):
    object_user_id = (
        safe_object_id(
            user_id
        )
    )

    if not object_user_id:
        return {
            "success": False,
            "message":
                "Invalid user ID",
        }

    subject = str(
        subject or ""
    ).strip()

    attempt_id = str(
        attempt_id or ""
    ).strip()

    if not subject:
        return {
            "success": False,
            "message":
                "Subject is required",
        }

    if not attempt_id:
        return {
            "success": False,
            "message":
                "Quiz attempt ID is required",
        }

    if (
        len(attempt_id) < 8
        or len(attempt_id) > 128
    ):
        return {
            "success": False,
            "message":
                "Invalid quiz attempt ID",
        }

    user = (
        users_collection.find_one(
            {
                "_id":
                    object_user_id
            }
        )
    )

    if not user:
        return {
            "success": False,
            "message":
                "User not found",
        }

    existing_result = (
        get_existing_attempt(
            object_user_id,
            attempt_id,
        )
    )

    if existing_result:
        return (
            duplicate_result_response(
                existing_result,
                object_user_id,
            )
        )

    attempt = (
        get_active_quiz_attempt(
            user_id=
                object_user_id,
            attempt_id=
                attempt_id,
        )
    )

    if not attempt:
        return {
            "success": False,
            "message":
                "Active quiz attempt not found or already completed",
        }

    attempt_subject = str(
        attempt.get(
            "subject",
            "",
        )
    ).strip()

    if (
        attempt_subject
        != subject
    ):
        return {
            "success": False,
            "message":
                "Quiz subject does not match this attempt",
        }

    verification = (
        verify_quiz_answers(
            subject,
            answers or [],
        )
    )

    if not verification.get(
        "success"
    ):
        return verification

    score = verification[
        "score"
    ]

    total = verification[
        "total"
    ]

    accuracy = verification[
        "accuracy"
    ]

    verified_answers = (
        verification[
            "answers"
        ]
    )

    attempt_verification = (
        verify_attempt_questions(
            attempt,
            subject,
            verified_answers,
        )
    )

    if not attempt_verification.get(
        "success"
    ):
        return attempt_verification

    old_stats = user.get(
        "stats",
        {},
    )

    old_quizzes = safe_int(
        old_stats.get(
            "quizzesCompleted",
            0,
        )
    )

    old_questions = safe_int(
        old_stats.get(
            "questionsAnswered",
            0,
        )
    )

    old_correct = safe_int(
        old_stats.get(
            "correctAnswers",
            0,
        )
    )

    old_xp = safe_int(
        old_stats.get(
            "xp",
            0,
        )
    )

    old_best_accuracy = safe_int(
        old_stats.get(
            "bestAccuracy",
            0,
        )
    )

    old_best_streak = safe_int(
        old_stats.get(
            "bestStreak",
            0,
        )
    )

    new_quizzes = (
        old_quizzes + 1
    )

    new_questions = (
        old_questions + total
    )

    new_correct = (
        old_correct + score
    )

    new_accuracy = (
        round(
            (
                new_correct
                / new_questions
            ) * 100
        )
        if new_questions > 0
        else 0
    )

    xp_earned = (
        score * 20
    ) + 50

    new_xp = (
        old_xp
        + xp_earned
    )

    new_level = (
        new_xp // 500
    ) + 1

    new_streak = (
        calculate_streak(
            user
        )
    )

    new_best_accuracy = max(
        old_best_accuracy,
        accuracy,
    )

    new_best_streak = max(
        old_best_streak,
        new_streak,
    )

    now = datetime.now(
        timezone.utc
    )

    result_document = {
        "userId":
            object_user_id,
        "attemptId":
            attempt_id,
        "subject":
            subject,
        "score":
            score,
        "total":
            total,
        "accuracy":
            accuracy,
        "answers":
            verified_answers,
        "xpEarned":
            xp_earned,
        "verified":
            True,
        "verificationVersion":
            RESULT_VERIFICATION_VERSION,
        "createdAt":
            now,
    }

    try:
        insert_result = (
            quiz_results_collection
            .insert_one(
                result_document
            )
        )

    except DuplicateKeyError:
        existing_result = (
            get_existing_attempt(
                object_user_id,
                attempt_id,
            )
        )

        if existing_result:
            return (
                duplicate_result_response(
                    existing_result,
                    object_user_id,
                )
            )

        return {
            "success": False,
            "message":
                "Duplicate quiz attempt",
        }

    completed_attempt = (
        complete_quiz_attempt(
            user_id=
                object_user_id,
            attempt_id=
                attempt_id,
            result_id=
                insert_result.inserted_id,
        )
    )

    if not completed_attempt:
        quiz_results_collection.delete_one(
            {
                "_id":
                    insert_result.inserted_id
            }
        )

        return {
            "success": False,
            "message":
                "Quiz attempt could not be completed safely",
        }

    user_update = (
        users_collection.update_one(
            {
                "_id":
                    object_user_id
            },
            {
                "$set": {
                    "stats.quizzesCompleted":
                        new_quizzes,
                    "stats.questionsAnswered":
                        new_questions,
                    "stats.correctAnswers":
                        new_correct,
                    "stats.accuracy":
                        new_accuracy,
                    "stats.bestAccuracy":
                        new_best_accuracy,
                    "stats.xp":
                        new_xp,
                    "stats.level":
                        new_level,
                    "stats.streak":
                        new_streak,
                    "stats.bestStreak":
                        new_best_streak,
                    "stats.lastQuizAt":
                        now,
                    "updatedAt":
                        now,
                }
            },
        )
    )

    if (
        user_update.matched_count
        != 1
    ):
        return {
            "success": False,
            "message":
                "Quiz result was saved, but user statistics could not be updated",
        }

    return {
        "success": True,
        "duplicate": False,
        "message":
            "Verified quiz result saved and quiz attempt completed successfully",
        "result": {
            "id":
                str(
                    insert_result.inserted_id
                ),
            "attemptId":
                attempt_id,
            "subject":
                subject,
            "score":
                score,
            "total":
                total,
            "accuracy":
                accuracy,
            "xpEarned":
                xp_earned,
            "verified":
                True,
            "verificationVersion":
                RESULT_VERIFICATION_VERSION,
            "answers":
                verified_answers,
            "createdAt":
                now.isoformat(),
        },
        "stats": {
            "quizzesCompleted":
                new_quizzes,
            "questionsAnswered":
                new_questions,
            "correctAnswers":
                new_correct,
            "accuracy":
                new_accuracy,
            "bestAccuracy":
                new_best_accuracy,
            "xp":
                new_xp,
            "level":
                new_level,
            "streak":
                new_streak,
            "bestStreak":
                new_best_streak,
        }
    }


# =========================================================
# RESULT HISTORY
# =========================================================

def get_user_results(
    user_id,
    limit=10,
):
    object_user_id = (
        safe_object_id(
            user_id
        )
    )

    if not object_user_id:
        return []

    try:
        limit = int(limit)
    except (
        TypeError,
        ValueError,
    ):
        limit = 10

    limit = max(
        1,
        min(
            limit,
            100,
        ),
    )

    cursor = (
        quiz_results_collection
        .find(
            {
                "userId":
                    object_user_id
            }
        )
        .sort(
            "createdAt",
            -1,
        )
        .limit(
            limit
        )
    )

    return [
        serialize_result(
            result
        )
        for result
        in cursor
    ]
