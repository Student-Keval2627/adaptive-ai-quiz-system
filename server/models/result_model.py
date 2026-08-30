from datetime import datetime, timedelta, timezone

from bson import ObjectId

from database import (
    quiz_results_collection,
    users_collection
)


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
            ("createdAt", -1)
        ]
    )


# =========================================================
# CALCULATE STREAK
# =========================================================

def calculate_streak(user):
    now = datetime.now(timezone.utc)

    stats = user.get(
        "stats",
        {}
    )

    current_streak = stats.get(
        "streak",
        0
    )

    last_quiz_at = stats.get(
        "lastQuizAt"
    )

    # First completed quiz
    if not last_quiz_at:
        return 1

    # Ensure timezone awareness
    if last_quiz_at.tzinfo is None:
        last_quiz_at = last_quiz_at.replace(
            tzinfo=timezone.utc
        )

    today = now.date()

    last_quiz_date = (
        last_quiz_at.date()
    )

    # Already completed quiz today
    if last_quiz_date == today:
        return max(
            current_streak,
            1
        )

    yesterday = (
        now - timedelta(days=1)
    ).date()

    # Continue streak
    if last_quiz_date == yesterday:
        return current_streak + 1

    # Streak broken
    return 1


# =========================================================
# SAVE RESULT
# =========================================================

def save_quiz_result(
    user_id,
    subject,
    score,
    total,
    answers=None
):
    try:
        object_user_id = ObjectId(
            user_id
        )

    except Exception:
        return {
            "success": False,
            "message": "Invalid user ID"
        }

    user = users_collection.find_one(
        {
            "_id": object_user_id
        }
    )

    if not user:
        return {
            "success": False,
            "message": "User not found"
        }

    # =====================================================
    # RESULT VALUES
    # =====================================================

    accuracy = (
        round(
            (score / total) * 100
        )
        if total > 0
        else 0
    )

    now = datetime.now(
        timezone.utc
    )

    answers = answers or []

    result_document = {
        "userId": object_user_id,

        "subject": subject,

        "score": score,

        "total": total,

        "accuracy": accuracy,

        "answers": answers,

        "createdAt": now
    }

    result = (
        quiz_results_collection.insert_one(
            result_document
        )
    )

    # =====================================================
    # CURRENT USER STATS
    # =====================================================

    old_stats = user.get(
        "stats",
        {}
    )

    old_quizzes = old_stats.get(
        "quizzesCompleted",
        0
    )

    old_questions = old_stats.get(
        "questionsAnswered",
        0
    )

    old_correct = old_stats.get(
        "correctAnswers",
        0
    )

    old_xp = old_stats.get(
        "xp",
        0
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
                new_correct
                / new_questions
            )
            * 100
        )
        if new_questions > 0
        else 0
    )

    # XP:
    # 20 XP per correct answer
    # +50 completion bonus

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
        calculate_streak(user)
    )

    # =====================================================
    # UPDATE USER
    # =====================================================

    users_collection.update_one(
        {
            "_id": object_user_id
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

                "stats.xp":
                    new_xp,

                "stats.level":
                    new_level,

                "stats.streak":
                    new_streak,

                "stats.lastQuizAt":
                    now,

                "updatedAt":
                    now
            }
        }
    )

    return {
        "success": True,

        "result": {
            "id": str(
                result.inserted_id
            ),

            "subject": subject,

            "score": score,

            "total": total,

            "accuracy": accuracy,

            "xpEarned": xp_earned,

            "createdAt":
                now.isoformat()
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

            "xp":
                new_xp,

            "level":
                new_level,

            "streak":
                new_streak
        }
    }


# =========================================================
# GET USER RESULTS
# =========================================================

def get_user_results(
    user_id,
    limit=10
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
            -1
        )
        .limit(limit)
    )

    results = []

    for result in cursor:
        created_at = result.get(
            "createdAt"
        )

        results.append(
            {
                "id": str(
                    result["_id"]
                ),

                "subject":
                    result.get(
                        "subject",
                        ""
                    ),

                "score":
                    result.get(
                        "score",
                        0
                    ),

                "total":
                    result.get(
                        "total",
                        0
                    ),

                "accuracy":
                    result.get(
                        "accuracy",
                        0
                    ),

                "answers":
                    result.get(
                        "answers",
                        []
                    ),

                "createdAt":
                    (
                        created_at.isoformat()
                        if created_at
                        else None
                    )
            }
        )

    return results