from flask import (
    Blueprint,
    jsonify,
    request,
    session,
)

from models.quiz_attempt_model import (
    add_question_to_attempt,
    create_quiz_attempt,
    get_active_quiz_attempt,
    question_belongs_to_attempt,
)

from models.quiz_model import (
    check_question_answer,
    find_question_by_id,
    get_available_subjects,
    get_questions,
    get_subject_question_counts,
    record_question_seen,
)

from utils.quiz_engine import (
    get_next_adaptive_question,
    start_adaptive_quiz,
)


# =========================================================
# BLUEPRINT
# =========================================================

quiz_bp = Blueprint(
    "quiz",
    __name__,
    url_prefix="/api/quiz",
)


# =========================================================
# CONFIG
# =========================================================

ALLOWED_DIFFICULTIES = [
    "Adaptive",
    "Easy",
    "Medium",
    "Hard",
]


# =========================================================
# HELPERS
# =========================================================

def get_logged_in_user_id():
    return session.get(
        "user_id"
    )


def clean_subject(value):
    return str(
        value or ""
    ).strip()


def clean_difficulty(value):
    difficulty = str(
        value or "Adaptive"
    ).strip()

    if (
        difficulty not in
        ALLOWED_DIFFICULTIES
    ):
        return None

    return difficulty


def normalize_focus_mode(value):
    if isinstance(
        value,
        bool,
    ):
        return value

    if isinstance(
        value,
        str,
    ):
        return (
            value.strip().lower()
            in {
                "true",
                "1",
                "yes",
                "on",
            }
        )

    return bool(
        value
    )


def subject_exists(subject):
    if not subject:
        return False

    return (
        subject in
        get_available_subjects()
    )


def get_current_attempt_question_id(
    attempt,
):
    question_ids = (
        attempt.get(
            "questionIds",
            [],
        )
        if attempt
        else []
    )

    if not isinstance(
        question_ids,
        list,
    ):
        return None

    if not question_ids:
        return None

    return str(
        question_ids[-1]
    )


# =========================================================
# SUBJECTS
#
# Frontend can use this endpoint instead of maintaining a
# hard-coded three-subject list.
#
# As new JSON question banks are added, those subjects will
# automatically appear here.
# =========================================================

@quiz_bp.get("/subjects")
def get_subjects():
    user_id = (
        get_logged_in_user_id()
    )

    if not user_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Login required",
            }
        ), 401

    counts = (
        get_subject_question_counts()
    )

    subjects = [
        {
            "name":
                subject,
            "questionCount":
                int(
                    count
                ),
        }
        for subject, count
        in counts.items()
    ]

    subjects.sort(
        key=lambda item:
            item["name"].lower()
    )

    return jsonify(
        {
            "success": True,
            "count":
                len(
                    subjects
                ),
            "subjects":
                subjects,
        }
    )


# =========================================================
# RANDOM QUESTIONS
#
# Primarily useful for testing / future non-adaptive modes.
# User history is still respected.
# =========================================================

@quiz_bp.get("/questions")
def questions():
    user_id = (
        get_logged_in_user_id()
    )

    if not user_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Login required",
            }
        ), 401

    subject = clean_subject(
        request.args.get(
            "subject"
        )
    )

    if not subject:
        return jsonify(
            {
                "success": False,
                "message":
                    "Subject is required",
            }
        ), 400

    if not subject_exists(
        subject
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid or unavailable subject",
            }
        ), 400

    try:
        limit = int(
            request.args.get(
                "limit",
                5,
            )
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

    selected_questions = (
        get_questions(
            subject=subject,
            limit=limit,
            user_id=user_id,
        )
    )

    # Every returned question is considered served,
    # therefore it is added to user history.
    for question in (
        selected_questions
    ):
        question_id = (
            question.get(
                "id"
            )
        )

        if question_id:
            record_question_seen(
                user_id=user_id,
                question_id=
                    question_id,
            )

    return jsonify(
        {
            "success": True,
            "subject":
                subject,
            "count":
                len(
                    selected_questions
                ),
            "questions":
                selected_questions,
        }
    )


# =========================================================
# START ADAPTIVE QUIZ
# =========================================================

@quiz_bp.post("/start")
def start_quiz():
    user_id = (
        get_logged_in_user_id()
    )

    if not user_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Login required",
            }
        ), 401

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )

    subject = clean_subject(
        data.get(
            "subject"
        )
    )

    difficulty = (
        clean_difficulty(
            data.get(
                "difficulty",
                "Adaptive",
            )
        )
    )

    focus_mode = (
        normalize_focus_mode(
            data.get(
                "focusMode",
                True,
            )
        )
    )

    if not subject:
        return jsonify(
            {
                "success": False,
                "message":
                    "Subject is required",
            }
        ), 400

    if not subject_exists(
        subject
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid or unavailable subject",
            }
        ), 400

    if not difficulty:
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid difficulty",
            }
        ), 400

    adaptive_result = (
        start_adaptive_quiz(
            user_id=user_id,
            subject=subject,
            difficulty_mode=
                difficulty,
            focus_mode=
                focus_mode,
        )
    )

    if not adaptive_result.get(
        "success"
    ):
        return jsonify(
            adaptive_result
        ), 400

    question = (
        adaptive_result.get(
            "question"
        )
    )

    if not question:
        return jsonify(
            {
                "success": False,
                "message":
                    "Quiz engine did not return a question",
            }
        ), 500

    first_question_id = (
        question.get(
            "id"
        )
    )

    if not first_question_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Quiz question ID is missing",
            }
        ), 500

    attempt = (
        create_quiz_attempt(
            user_id=user_id,
            subject=subject,
            first_question_id=
                first_question_id,
            difficulty=
                difficulty,
            focus_mode=
                focus_mode,
        )
    )

    if not attempt:
        return jsonify(
            {
                "success": False,
                "message":
                    "Could not create quiz attempt",
            }
        ), 500

    # Only record the question after the attempt
    # has been successfully created.
    record_question_seen(
        user_id=user_id,
        question_id=
            first_question_id,
    )

    return jsonify(
        {
            "success": True,
            "attemptId":
                attempt.get(
                    "attemptId"
                ),
            "question":
                question,
            "adaptive":
                adaptive_result.get(
                    "adaptive",
                    {},
                ),
        }
    ), 201


# =========================================================
# NEXT ADAPTIVE QUESTION
# =========================================================

@quiz_bp.post("/next")
def next_question():
    user_id = (
        get_logged_in_user_id()
    )

    if not user_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Login required",
            }
        ), 401

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )

    attempt_id = str(
        data.get(
            "attemptId",
            "",
        )
    ).strip()

    previous_question_id = str(
        data.get(
            "previousQuestionId",
            "",
        )
    ).strip()

    selected_answer = data.get(
        "selectedAnswer"
    )

    if not attempt_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Attempt ID is required",
            }
        ), 400

    if not previous_question_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Previous question ID is required",
            }
        ), 400

    if selected_answer is None:
        return jsonify(
            {
                "success": False,
                "message":
                    "Selected answer is required",
            }
        ), 400

    attempt = (
        get_active_quiz_attempt(
            user_id=user_id,
            attempt_id=
                attempt_id,
        )
    )

    if not attempt:
        return jsonify(
            {
                "success": False,
                "message":
                    "Active quiz attempt not found",
            }
        ), 404

    subject = clean_subject(
        attempt.get(
            "subject"
        )
    )

    difficulty = (
        clean_difficulty(
            attempt.get(
                "difficulty",
                "Adaptive",
            )
        )
        or "Adaptive"
    )

    focus_mode = (
        normalize_focus_mode(
            attempt.get(
                "focusMode",
                True,
            )
        )
    )

    used_question_ids = (
        attempt.get(
            "questionIds",
            [],
        )
    )

    if not isinstance(
        used_question_ids,
        list,
    ):
        used_question_ids = []

    # =====================================================
    # CURRENT QUESTION PROTECTION
    #
    # The frontend may only ask for a next question after
    # answering the latest question served by this attempt.
    #
    # This prevents replaying /next using an older question
    # to artificially expand an attempt.
    # =====================================================

    current_question_id = (
        get_current_attempt_question_id(
            attempt
        )
    )

    if (
        not current_question_id or
        previous_question_id !=
        current_question_id
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Previous question is not the current quiz question",
            }
        ), 409

    if not question_belongs_to_attempt(
        user_id=user_id,
        attempt_id=
            attempt_id,
        question_id=
            previous_question_id,
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Question does not belong to this quiz attempt",
            }
        ), 403

    previous_question = (
        find_question_by_id(
            previous_question_id
        )
    )

    if not previous_question:
        return jsonify(
            {
                "success": False,
                "message":
                    "Previous question not found",
            }
        ), 404

    if (
        previous_question.get(
            "subject"
        )
        != subject
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Question subject mismatch",
            }
        ), 400

    valid_options = (
        previous_question.get(
            "options",
            [],
        )
    )

    if (
        selected_answer not in
        valid_options
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Selected answer is not a valid option",
            }
        ), 400

    adaptive_result = (
        get_next_adaptive_question(
            user_id=user_id,
            subject=subject,
            previous_question_id=
                previous_question_id,
            selected_answer=
                selected_answer,
            used_question_ids=
                used_question_ids,
            difficulty_mode=
                difficulty,
            focus_mode=
                focus_mode,
        )
    )

    if not adaptive_result.get(
        "success"
    ):
        return jsonify(
            adaptive_result
        ), 400

    next_question_data = (
        adaptive_result.get(
            "question"
        )
    )

    if not next_question_data:
        return jsonify(
            {
                "success": False,
                "message":
                    "Quiz engine did not return the next question",
            }
        ), 500

    next_question_id = (
        next_question_data.get(
            "id"
        )
    )

    if not next_question_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Next question ID is missing",
            }
        ), 500

    updated_attempt = (
        add_question_to_attempt(
            user_id=user_id,
            attempt_id=
                attempt_id,
            question_id=
                next_question_id,
        )
    )

    if not updated_attempt:
        return jsonify(
            {
                "success": False,
                "message":
                    "Could not add question to quiz attempt",
            }
        ), 409

    # Question is now officially served.
    record_question_seen(
        user_id=user_id,
        question_id=
            next_question_id,
    )

    return jsonify(
        {
            "success": True,
            "attemptId":
                attempt_id,
            "question":
                next_question_data,
            "adaptive":
                adaptive_result.get(
                    "adaptive",
                    {},
                ),
        }
    )


# =========================================================
# CHECK ANSWER
# =========================================================

@quiz_bp.post("/check")
def check_answer():
    user_id = (
        get_logged_in_user_id()
    )

    if not user_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Login required",
            }
        ), 401

    data = (
        request.get_json(
            silent=True
        )
        or {}
    )

    attempt_id = str(
        data.get(
            "attemptId",
            "",
        )
    ).strip()

    question_id = str(
        data.get(
            "questionId",
            "",
        )
    ).strip()

    selected_answer = data.get(
        "answer"
    )

    if not attempt_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Attempt ID is required",
            }
        ), 400

    if not question_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Question ID is required",
            }
        ), 400

    if selected_answer is None:
        return jsonify(
            {
                "success": False,
                "message":
                    "Answer is required",
            }
        ), 400

    attempt = (
        get_active_quiz_attempt(
            user_id=user_id,
            attempt_id=
                attempt_id,
        )
    )

    if not attempt:
        return jsonify(
            {
                "success": False,
                "message":
                    "Active quiz attempt not found",
            }
        ), 404

    current_question_id = (
        get_current_attempt_question_id(
            attempt
        )
    )

    if (
        not current_question_id or
        question_id !=
        current_question_id
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Only the current quiz question can be checked",
            }
        ), 409

    if not question_belongs_to_attempt(
        user_id=user_id,
        attempt_id=
            attempt_id,
        question_id=
            question_id,
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Question does not belong to this quiz attempt",
            }
        ), 403

    question = (
        find_question_by_id(
            question_id
        )
    )

    if not question:
        return jsonify(
            {
                "success": False,
                "message":
                    "Question not found",
            }
        ), 404

    if (
        question.get(
            "subject"
        )
        != attempt.get(
            "subject"
        )
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Question subject mismatch",
            }
        ), 400

    valid_options = (
        question.get(
            "options",
            [],
        )
    )

    if (
        selected_answer not in
        valid_options
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Answer is not a valid option",
            }
        ), 400

    result = (
        check_question_answer(
            question_id=
                question_id,
            selected_answer=
                selected_answer,
        )
    )

    if not result:
        return jsonify(
            {
                "success": False,
                "message":
                    "Could not check answer",
            }
        ), 400

    return jsonify(
        {
            "success": True,
            **result,
        }
    )
