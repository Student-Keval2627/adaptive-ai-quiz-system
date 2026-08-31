from models.analytics_model import (
    get_priority_topic,
)

from models.quiz_model import (
    find_question_by_id,
    get_adaptive_question,
)


# =========================================================
# CONFIG
# =========================================================

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
    difficulty_mode,
):
    mode = str(
        difficulty_mode
        or "Adaptive"
    ).strip()


    if (
        mode not in
        ALLOWED_START_MODES
    ):
        return "Adaptive"


    return mode


# =========================================================
# NEXT DIFFICULTY
# =========================================================

def calculate_next_difficulty(
    current_difficulty,
    was_correct,
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
            len(
                DIFFICULTIES
            ) - 1,
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
# HISTORICAL PRIORITY TOPIC
#
# Uses analytics_model instead of
# calculating topic stats again here.
# =========================================================

def get_weakest_topic(
    user_id,
    subject,
):
    if not user_id:
        return None


    if not subject:
        return None


    try:
        return (
            get_priority_topic(
                user_id=user_id,
                subject=subject,
            )
        )

    except Exception:
        # Quiz should still work even if
        # analytics has no historical data.
        return None


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


    # =====================================================
    # STARTING DIFFICULTY
    # =====================================================

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


    # =====================================================
    # PERSONALIZED TOPIC
    # =====================================================

    preferred_topic = None


    if focus_mode:

        preferred_topic = (
            get_weakest_topic(
                user_id=user_id,
                subject=subject,
            )
        )


    # =====================================================
    # GET FIRST QUESTION
    # =====================================================

    question = (
        get_adaptive_question(
            subject=subject,

            difficulty=
                starting_difficulty,

            preferred_topic=
                preferred_topic,

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


    actual_topic = (
        question.get(
            "topic",
            "General",
        )
    )


    # =====================================================
    # REASON
    # =====================================================

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


    if (
        focus_mode and
        preferred_topic
    ):

        reason += (
            f" Focus Mode is prioritizing "
            f"your weak topic: "
            f"{preferred_topic}."
        )


    elif focus_mode:

        reason += (
            " Focus Mode is enabled, but "
            "there is not enough previous "
            "quiz data to identify a weak topic yet."
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
                preferred_topic,

            "selectedTopic":
                actual_topic,

            "personalized":
                bool(
                    preferred_topic
                ),

            "reason":
                reason,
        },
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


    # =====================================================
    # LOAD PREVIOUS QUESTION
    # =====================================================

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


    # =====================================================
    # VERIFY PREVIOUS ANSWER
    # =====================================================

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


    current_topic = (
        previous_question.get(
            "topic",
            "General",
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


    # =====================================================
    # PERSONALIZED TOPIC SELECTION
    # =====================================================

    preferred_topic = None

    topic_reason = None


    if focus_mode:

        # If user got the current question wrong,
        # immediately reinforce the same topic.

        if not was_correct:

            preferred_topic = (
                current_topic
            )

            topic_reason = (
                "current mistake"
            )


        # If correct, return to the user's
        # historically weakest topic.

        else:

            historical_weak_topic = (
                get_weakest_topic(
                    user_id=user_id,
                    subject=subject,
                )
            )


            if historical_weak_topic:

                preferred_topic = (
                    historical_weak_topic
                )

                topic_reason = (
                    "historical weakness"
                )


    # =====================================================
    # ADAPTIVE REASON
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

        if (
            topic_reason ==
            "current mistake"
        ):

            reason += (
                f" Focus Mode is reinforcing "
                f"{preferred_topic} because "
                f"you answered that topic "
                f"incorrectly."
            )

        else:

            reason += (
                f" Focus Mode is prioritizing "
                f"your historical weak topic: "
                f"{preferred_topic}."
            )


    elif focus_mode:

        reason += (
            " Focus Mode is enabled, but "
            "no weak topic needs priority "
            "right now."
        )


    # Manual Easy / Medium / Hard only
    # controls the starting difficulty.
    # After quiz begins, difficulty remains adaptive.

    if (
        difficulty_mode !=
        "Adaptive"
    ):

        reason += (
            f" Your selected starting "
            f"preference was "
            f"{difficulty_mode}; the quiz "
            f"is now adapting based on "
            f"your answers."
        )


    # =====================================================
    # SAFE USED IDS
    # =====================================================

    if not isinstance(
        used_question_ids,
        list,
    ):
        used_question_ids = []


    used_question_ids = [
        str(
            question_id
        )
        for question_id
        in used_question_ids
        if question_id
    ]


    # =====================================================
    # SELECT NEXT QUESTION
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


    actual_topic = (
        question.get(
            "topic",
            "General",
        )
    )


    # =====================================================
    # FALLBACK INFORMATION
    # =====================================================

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


    if (
        preferred_topic and
        actual_topic !=
        preferred_topic
    ):

        reason += (
            f" No suitable unused "
            f"{preferred_topic} question "
            f"was available, so the engine "
            f"selected {actual_topic}."
        )


    # =====================================================
    # RESPONSE
    # =====================================================

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

            "selectedTopic":
                actual_topic,

            "topicPriorityReason":
                topic_reason,

            "personalized":
                bool(
                    preferred_topic
                ),

            "reason":
                reason,
        },
    }