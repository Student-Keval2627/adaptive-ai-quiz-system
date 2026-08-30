from collections import defaultdict

from bson import ObjectId

from database import quiz_results_collection

from models.quiz_model import (
    find_question_by_id,
    get_adaptive_question,
)


DIFFICULTIES = [
    "Easy",
    "Medium",
    "Hard",
]


# =========================================================
# NEXT DIFFICULTY
# =========================================================

def calculate_next_difficulty(
    current_difficulty,
    was_correct
):
    try:
        current_index = DIFFICULTIES.index(
            current_difficulty
        )

    except ValueError:
        current_index = 1

    if was_correct:
        next_index = min(
            current_index + 1,
            len(DIFFICULTIES) - 1
        )

    else:
        next_index = max(
            current_index - 1,
            0
        )

    return DIFFICULTIES[
        next_index
    ]


# =========================================================
# FIND HISTORICAL WEAK TOPIC
# =========================================================

def get_weakest_topic(
    user_id,
    subject
):
    if not user_id:
        return None

    try:
        object_user_id = ObjectId(
            user_id
        )

    except Exception:
        return None

    results = quiz_results_collection.find(
        {
            "userId":
                object_user_id,

            "subject":
                subject,
        }
    )

    topic_stats = defaultdict(
        lambda: {
            "total": 0,
            "correct": 0,
            "wrong": 0,
        }
    )

    for result in results:
        answers = result.get(
            "answers",
            []
        )

        for answer in answers:
            topic = answer.get(
                "topic"
            )

            if not topic:
                continue

            topic_stats[
                topic
            ]["total"] += 1

            if answer.get(
                "correct"
            ):
                topic_stats[
                    topic
                ]["correct"] += 1

            else:
                topic_stats[
                    topic
                ]["wrong"] += 1

    weakest_topic = None
    weakest_accuracy = 101

    for topic, stats in topic_stats.items():
        if (
            stats["total"] <= 0
            or stats["wrong"] <= 0
        ):
            continue

        topic_accuracy = (
            stats["correct"]
            / stats["total"]
        ) * 100

        if topic_accuracy < weakest_accuracy:
            weakest_accuracy = (
                topic_accuracy
            )

            weakest_topic = topic

    return weakest_topic


# =========================================================
# START ADAPTIVE QUIZ
# =========================================================

def start_adaptive_quiz(
    user_id,
    subject
):
    weak_topic = get_weakest_topic(
        user_id,
        subject
    )

    question = get_adaptive_question(
        subject=subject,
        difficulty="Medium",
        preferred_topic=weak_topic,
        exclude_ids=[],
    )

    if not question:
        return {
            "success": False,
            "message":
                "No questions available"
        }

    if weak_topic:
        reason = (
            f"Starting with Medium difficulty "
            f"and prioritizing your weaker "
            f"topic: {weak_topic}."
        )

    else:
        reason = (
            "Starting with Medium difficulty "
            "to measure your current level."
        )

    return {
        "success": True,

        "question":
            question,

        "adaptive": {
            "difficulty":
                question.get(
                    "difficulty",
                    "Medium"
                ),

            "preferredTopic":
                weak_topic,

            "reason":
                reason,
        }
    }


# =========================================================
# GET NEXT ADAPTIVE QUESTION
# =========================================================

def get_next_adaptive_question(
    user_id,
    subject,
    previous_question_id,
    selected_answer,
    used_question_ids
):
    previous_question = (
        find_question_by_id(
            previous_question_id
        )
    )

    if not previous_question:
        return {
            "success": False,
            "message":
                "Previous question not found"
        }

    if (
        previous_question.get(
            "subject"
        )
        != subject
    ):
        return {
            "success": False,
            "message":
                "Question subject mismatch"
        }

    correct_answer = (
        previous_question.get(
            "answer"
        )
    )

    was_correct = (
        selected_answer
        == correct_answer
    )

    current_difficulty = (
        previous_question.get(
            "difficulty",
            "Medium"
        )
    )

    next_difficulty = (
        calculate_next_difficulty(
            current_difficulty,
            was_correct
        )
    )


    # =====================================================
    # TOPIC PRIORITY
    # =====================================================

    if not was_correct:
        # Wrong answer:
        # immediately reinforce same topic.
        preferred_topic = (
            previous_question.get(
                "topic"
            )
        )

        reason = (
            f"Your previous answer was incorrect, "
            f"so difficulty changed from "
            f"{current_difficulty} to "
            f"{next_difficulty}. "
            f"We are reinforcing "
            f"{preferred_topic}."
        )

    else:
        # Correct answer:
        # increase difficulty and optionally
        # target historical weakness.
        historical_weak_topic = (
            get_weakest_topic(
                user_id,
                subject
            )
        )

        preferred_topic = (
            historical_weak_topic
        )

        if preferred_topic:
            reason = (
                f"Correct answer. Difficulty "
                f"changed from "
                f"{current_difficulty} to "
                f"{next_difficulty}, while "
                f"prioritizing your weaker topic "
                f"{preferred_topic}."
            )

        else:
            reason = (
                f"Correct answer. Difficulty "
                f"changed from "
                f"{current_difficulty} to "
                f"{next_difficulty}."
            )


    # =====================================================
    # GET QUESTION
    # =====================================================

    question = get_adaptive_question(
        subject=subject,
        difficulty=
            next_difficulty,
        preferred_topic=
            preferred_topic,
        exclude_ids=
            used_question_ids,
    )

    if not question:
        return {
            "success": False,
            "message":
                "No unused questions available"
        }

    return {
        "success": True,

        "question":
            question,

        "adaptive": {
            "previousCorrect":
                was_correct,

            "difficulty":
                question.get(
                    "difficulty",
                    next_difficulty
                ),

            "requestedDifficulty":
                next_difficulty,

            "preferredTopic":
                preferred_topic,

            "reason":
                reason,
        }
    }