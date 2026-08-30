from datetime import (
    datetime,
    timedelta,
    timezone,
)

from bson import ObjectId

from database import (
    quiz_results_collection,
    users_collection,
)

from models.quiz_model import (
    find_question_by_id,
)


# =========================================================
# CONFIG
# =========================================================

MAX_ANSWERS_PER_QUIZ = 20

RESULT_VERIFICATION_VERSION = 1


# =========================================================
# CREATE INDEXES
# =========================================================

def create_result_indexes():
    quiz_results_collection.create_index(
        "userId"
    )

    quiz_results_collection.create_index(
        "createdAt"
    )

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


# =========================================================
# CALCULATE STREAK
# =========================================================

def calculate_streak(user):
    now = datetime.now(
        timezone.utc
    )

    stats = user.get(
        "stats",
        {},
    )

    current_streak = int(
        stats.get(
            "streak",
            0,
        ) or 0
    )

    last_quiz_at = stats.get(
        "lastQuizAt"
    )

    # First quiz
    if not last_quiz_at:
        return 1

    # Old MongoDB dates may be naive
    if last_quiz_at.tzinfo is None:
        last_quiz_at = (
            last_quiz_at.replace(
                tzinfo=timezone.utc
            )
        )

    today = now.date()

    last_quiz_date = (
        last_quiz_at.date()
    )

    # Already completed a quiz today
    if last_quiz_date == today:
        return max(
            current_streak,
            1,
        )

    yesterday = (
        now - timedelta(days=1)
    ).date()

    # Continue streak
    if last_quiz_date == yesterday:
        return (
            current_streak + 1
        )

    # Streak broken
    return 1


# =========================================================
# VERIFY ANSWERS FROM MONGODB
# =========================================================

def verify_quiz_answers(
    subject,
    submitted_answers,
):
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
        >
        MAX_ANSWERS_PER_QUIZ
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


        # Prevent same question being counted twice
        if (
            question_id in
            used_question_ids
        ):
            return {
                "success": False,
                "message":
                    "Duplicate question detected in quiz result",
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
                    f"Selected answer missing at question {index + 1}",
            }


        # Read original question directly
        # from MongoDB using its ID.
        question = (
            find_question_by_id(
                question_id
            )
        )


        if not question:
            return {
                "success": False,
                "message":
                    f"Question {index + 1} does not exist",
            }


        question_subject = (
            question.get(
                "subject",
                "",
            )
        )


        # Prevent mixing questions
        # from different subjects.
        if (
            question_subject !=
            subject
        ):
            return {
                "success": False,
                "message":
                    "Question subject does not match quiz subject",
            }


        options = question.get(
            "options",
            [],
        )


        # Selected answer must actually
        # be one of the MongoDB options.
        if (
            selected_answer not in
            options
        ):
            return {
                "success": False,
                "message":
                    f"Invalid selected answer at question {index + 1}",
            }


        correct_answer = (
            question.get(
                "answer"
            )
        )


        was_correct = (
            selected_answer ==
            correct_answer
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
                    question_subject,

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
                score /
                total
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
# SAVE VERIFIED RESULT
# =========================================================

def save_quiz_result(
    user_id,
    subject,
    score=None,
    total=None,
    answers=None,
):
    """
    score and total remain in the
    function signature for backward
    compatibility.

    They are NOT trusted.

    Real score and total are calculated
    from MongoDB questions and submitted
    answers.
    """

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


    # =====================================================
    # VERIFY QUIZ
    # =====================================================

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


    # Never use client score/total
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


    # =====================================================
    # CURRENT STATS
    # =====================================================

    old_stats = user.get(
        "stats",
        {},
    )


    old_quizzes = int(
        old_stats.get(
            "quizzesCompleted",
            0,
        ) or 0
    )


    old_questions = int(
        old_stats.get(
            "questionsAnswered",
            0,
        ) or 0
    )


    old_correct = int(
        old_stats.get(
            "correctAnswers",
            0,
        ) or 0
    )


    old_xp = int(
        old_stats.get(
            "xp",
            0,
        ) or 0
    )


    old_best_accuracy = int(
        old_stats.get(
            "bestAccuracy",
            0,
        ) or 0
    )


    old_best_streak = int(
        old_stats.get(
            "bestStreak",
            0,
        ) or 0
    )


    # =====================================================
    # UPDATED TOTALS
    # =====================================================

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
                new_correct /
                new_questions
            ) * 100
        )
        if new_questions > 0
        else 0
    )


    # 20 XP per correct answer
    # + 50 XP completion bonus

    xp_earned = (
        score * 20
    ) + 50


    new_xp = (
        old_xp + xp_earned
    )


    # Every 500 XP = next level
    new_level = (
        new_xp // 500
    ) + 1


    new_streak = (
        calculate_streak(
            user
        )
    )


    # Keep lifetime best values.
    # Useful for achievements even if
    # current accuracy/streak later drops.

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


    # =====================================================
    # RESULT DOCUMENT
    # =====================================================

    result_document = {
        "userId":
            object_user_id,

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


    insert_result = (
        quiz_results_collection
        .insert_one(
            result_document
        )
    )


    # =====================================================
    # UPDATE USER STATS
    # =====================================================

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
        }
    )


    # =====================================================
    # RESPONSE
    # =====================================================

    return {
        "success": True,

        "message":
            "Verified quiz result saved successfully",

        "result": {
            "id":
                str(
                    insert_result.inserted_id
                ),

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
# GET USER RESULTS
# =========================================================

def get_user_results(
    user_id,
    limit=10,
):
    try:
        object_user_id = ObjectId(
            user_id
        )

    except Exception:
        return []


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


    results = []


    for result in cursor:
        created_at = result.get(
            "createdAt"
        )


        score = result.get(
            "score",
            0,
        )


        xp_earned = result.get(
            "xpEarned"
        )


        # Old results created before
        # this update may not contain
        # xpEarned.
        if xp_earned is None:
            xp_earned = (
                score * 20
            ) + 50


        results.append(
            {
                "id":
                    str(
                        result["_id"]
                    ),

                "subject":
                    result.get(
                        "subject",
                        "",
                    ),

                "score":
                    score,

                "total":
                    result.get(
                        "total",
                        0,
                    ),

                "accuracy":
                    result.get(
                        "accuracy",
                        0,
                    ),

                "xpEarned":
                    xp_earned,

                "verified":
                    result.get(
                        "verified",
                        False,
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
        )


    return results