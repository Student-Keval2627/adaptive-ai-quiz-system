from collections import defaultdict

from bson import ObjectId

from database import (
    quiz_results_collection,
)

from models.quiz_model import (
    find_question_by_id,
    get_adaptive_question,
)


DIFFICULTIES = [
    "Easy",
    "Medium",
    "Hard",
]


ALLOWED_START_MODES = [
    "Adaptive",
    "Easy",
    "Medium",
    "Hard",
]


# =========================================================
# NORMALIZE MODE
# =========================================================

def normalize_difficulty_mode(
    difficulty_mode
):
    mode = str(
        difficulty_mode or "Adaptive"
    ).strip()

    if mode not in ALLOWED_START_MODES:
        return "Adaptive"

    return mode


# =========================================================
# NEXT DIFFICULTY
# =========================================================

def calculate_next_difficulty(
    current_difficulty,
    was_correct
):
    try:
        current_index = (
            DIFFICULTIES.index(
                current_difficulty
            )
        )

    except ValueError:
        current_index = 1

    if was_correct:
        next_index = min(
            current_index + 1,
            len(DIFFICULTIES) - 1,
        )

    else:
        next_index = max(
            current_index - 1,
            0,
        )

    return DIFFICULTIES[
        next_index
    ]


# =========================================================
# HISTORICAL WEAK TOPIC
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


    results = (
        quiz_results_collection.find(
            {
                "userId":
                    object_user_id,

                "subject":
                    subject,
            }
        )
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
            [],
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


    for (
        topic,
        stats,
    ) in topic_stats.items():

        if (
            stats["total"] <= 0
            or stats["wrong"] <= 0
        ):
            continue


        topic_accuracy = (
            stats["correct"]
            /
            stats["total"]
        ) * 100


        if (
            topic_accuracy <
            weakest_accuracy
        ):
            weakest_accuracy = (
                topic_accuracy
            )

            weakest_topic = topic


    return weakest_topic


# =========================================================
# START QUIZ
# =========================================================

def start_adaptive_quiz(
    user_id,
    subject,
    difficulty_mode="Adaptive",
    focus_mode=True,
):
    difficulty_mode = (
        normalize_difficulty_mode(
            difficulty_mode
        )
    )


    # Adaptive always begins at Medium.
    # Manual preferences choose the
    # starting difficulty.

    if (
        difficulty_mode ==
        "Adaptive"
    ):
        starting_difficulty = (
            "Medium"
        )

    else:
        starting_difficulty = (
            difficulty_mode
        )


    weak_topic = None

    if focus_mode:
        weak_topic = (
            get_weakest_topic(
                user_id,
                subject,
            )
        )


    question = (
        get_adaptive_question(
            subject=subject,

            difficulty=
                starting_difficulty,

            preferred_topic=
                weak_topic,

            exclude_ids=[],
        )
    )


    if not question:
        return {
            "success": False,
            "message":
                "No questions available",
        }


    actual_difficulty = (
        question.get(
            "difficulty",
            starting_difficulty,
        )
    )


    if (
        difficulty_mode ==
        "Adaptive"
    ):
        reason = (
            "Adaptive mode starts at "
            "Medium difficulty."
        )

    else:
        reason = (
            f"Your quiz preference starts "
            f"at {difficulty_mode} difficulty."
        )


    if weak_topic:
        reason += (
            f" Focus Mode is prioritizing "
            f"your weaker topic: "
            f"{weak_topic}."
        )


    if (
        actual_difficulty !=
        starting_difficulty
    ):
        reason += (
            f" No unused "
            f"{starting_difficulty} question "
            f"was available, so the engine "
            f"selected "
            f"{actual_difficulty}."
        )


    return {
        "success": True,

        "question":
            question,

        "adaptive": {
            "mode":
                difficulty_mode,

            "difficulty":
                actual_difficulty,

            "requestedDifficulty":
                starting_difficulty,

            "focusMode":
                bool(
                    focus_mode
                ),

            "preferredTopic":
                weak_topic,

            "reason":
                reason,
        }
    }


# =========================================================
# NEXT QUESTION
# =========================================================

def get_next_adaptive_question(
    user_id,
    subject,
    previous_question_id,
    selected_answer,
    used_question_ids,
    difficulty_mode="Adaptive",
    focus_mode=True,
):
    difficulty_mode = (
        normalize_difficulty_mode(
            difficulty_mode
        )
    )


    previous_question = (
        find_question_by_id(
            previous_question_id
        )
    )


    if not previous_question:
        return {
            "success": False,
            "message":
                "Previous question not found",
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
                "Question subject mismatch",
        }


    correct_answer = (
        previous_question.get(
            "answer"
        )
    )


    was_correct = (
        selected_answer ==
        correct_answer
    )


    current_difficulty = (
        previous_question.get(
            "difficulty",
            "Medium",
        )
    )


    # =====================================================
    # ADAPTIVE DIFFICULTY
    # =====================================================

    next_difficulty = (
        calculate_next_difficulty(
            current_difficulty,
            was_correct,
        )
    )


    preferred_topic = None


    # =====================================================
    # FOCUS MODE
    # =====================================================

    if focus_mode:

        if not was_correct:
            preferred_topic = (
                previous_question.get(
                    "topic"
                )
            )

        else:
            preferred_topic = (
                get_weakest_topic(
                    user_id,
                    subject,
                )
            )


    # =====================================================
    # REASON
    # =====================================================

    if was_correct:
        reason = (
            f"Correct answer. Difficulty "
            f"changed from "
            f"{current_difficulty} to "
            f"{next_difficulty}."
        )

    else:
        reason = (
            f"Incorrect answer. Difficulty "
            f"changed from "
            f"{current_difficulty} to "
            f"{next_difficulty}."
        )


    if (
        focus_mode and
        preferred_topic
    ):
        reason += (
            f" Focus Mode is prioritizing "
            f"{preferred_topic}."
        )


    # User-selected Easy/Medium/Hard
    # controls the starting point.
    # After that, adaptive learning
    # still reacts to every answer.

    if (
        difficulty_mode !=
        "Adaptive"
    ):
        reason += (
            f" Your selected starting "
            f"preference is "
            f"{difficulty_mode}."
        )


    # =====================================================
    # SELECT QUESTION
    # =====================================================

    question = (
        get_adaptive_question(
            subject=subject,

            difficulty=
                next_difficulty,

            preferred_topic=
                preferred_topic,

            exclude_ids=
                used_question_ids,
        )
    )


    if not question:
        return {
            "success": False,
            "message":
                "No unused questions available",
        }


    actual_difficulty = (
        question.get(
            "difficulty",
            next_difficulty,
        )
    )


    if (
        actual_difficulty !=
        next_difficulty
    ):
        reason += (
            f" No unused "
            f"{next_difficulty} question "
            f"was available, so "
            f"{actual_difficulty} was "
            f"selected."
        )


    return {
        "success": True,

        "question":
            question,

        "adaptive": {
            "mode":
                difficulty_mode,

            "previousCorrect":
                was_correct,

            "difficulty":
                actual_difficulty,

            "requestedDifficulty":
                next_difficulty,

            "focusMode":
                bool(
                    focus_mode
                ),

            "preferredTopic":
                preferred_topic,

            "reason":
                reason,
        }
    }