from flask import (
    Blueprint,
    jsonify,
    request,
    session,
)

from models.quiz_model import (
    check_question_answer,
    get_questions,
)

from models.quiz_attempt_model import (
    add_question_to_attempt,
    create_quiz_attempt,
    get_active_quiz_attempt,
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

ALLOWED_SUBJECTS = [
    "Python",
    "Machine Learning",
    "Data Structures",
]


ALLOWED_DIFFICULTIES = [
    "Adaptive",
    "Easy",
    "Medium",
    "Hard",
]


# =========================================================
# GET RANDOM QUESTIONS
# =========================================================

@quiz_bp.get("/questions")
def questions():

    subject = str(
        request.args.get(
            "subject",
            "",
        )
    ).strip()


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
            10,
        ),
    )


    if (
        subject not in
        ALLOWED_SUBJECTS
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid subject",
            }
        ), 400


    quiz_questions = (
        get_questions(
            subject,
            limit,
        )
    )


    return jsonify(
        {
            "success": True,
            "questions":
                quiz_questions,
        }
    ), 200


# =========================================================
# START ADAPTIVE QUIZ
# =========================================================

@quiz_bp.post("/start")
def start_quiz():

    user_id = session.get(
        "user_id"
    )


    if not user_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Login required",
            }
        ), 401


    data = request.get_json(
        silent=True
    ) or {}


    subject = str(
        data.get(
            "subject",
            "",
        )
    ).strip()


    difficulty = str(
        data.get(
            "difficulty",
            "Adaptive",
        )
    ).strip()


    focus_mode = data.get(
        "focusMode",
        True,
    )


    # =====================================================
    # VALIDATION
    # =====================================================

    if (
        subject not in
        ALLOWED_SUBJECTS
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid subject",
            }
        ), 400


    if (
        difficulty not in
        ALLOWED_DIFFICULTIES
    ):
        difficulty = "Adaptive"


    if not isinstance(
        focus_mode,
        bool,
    ):
        focus_mode = True


    # =====================================================
    # GET FIRST ADAPTIVE QUESTION
    # =====================================================

    result = (
        start_adaptive_quiz(
            user_id=user_id,
            subject=subject,
            difficulty_mode=difficulty,
            focus_mode=focus_mode,
        )
    )


    if not result.get(
        "success"
    ):
        return jsonify(
            result
        ), 400


    question = result.get(
        "question"
    )


    if not question:
        return jsonify(
            {
                "success": False,
                "message":
                    "Quiz question could not be created",
            }
        ), 400


    question_id = str(
        question.get(
            "id",
            "",
        )
    ).strip()


    if not question_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Quiz question ID is missing",
            }
        ), 400


    # =====================================================
    # CREATE REAL QUIZ ATTEMPT
    #
    # attemptId is now created by backend.
    # First served question is saved immediately.
    # =====================================================

    attempt = (
        create_quiz_attempt(
            user_id=user_id,
            subject=subject,
            first_question_id=question_id,
            difficulty=difficulty,
            focus_mode=focus_mode,
        )
    )


    if not attempt.get(
        "success"
    ):
        return jsonify(
            attempt
        ), 400


    # =====================================================
    # RETURN QUESTION + BACKEND ATTEMPT ID
    # =====================================================

    result["attemptId"] = (
        attempt.get(
            "attemptId"
        )
    )


    return jsonify(
        result
    ), 200


# =========================================================
# NEXT ADAPTIVE QUESTION
# =========================================================

@quiz_bp.post("/next")
def next_question():

    user_id = session.get(
        "user_id"
    )


    if not user_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Login required",
            }
        ), 401


    data = request.get_json(
        silent=True
    ) or {}


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


    # =====================================================
    # ATTEMPT ID REQUIRED
    # =====================================================

    if not attempt_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Quiz attempt ID is required",
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


    # =====================================================
    # LOAD ATTEMPT FROM DATABASE
    #
    # We no longer trust:
    # subject
    # difficulty
    # focusMode
    # usedQuestionIds
    #
    # sent by frontend.
    # =====================================================

    attempt = (
        get_active_quiz_attempt(
            user_id=user_id,
            attempt_id=attempt_id,
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


    subject = str(
        attempt.get(
            "subject",
            "",
        )
    ).strip()


    difficulty = str(
        attempt.get(
            "difficulty",
            "Adaptive",
        )
    ).strip()


    focus_mode = attempt.get(
        "focusMode",
        True,
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
    # VERIFY PREVIOUS QUESTION WAS ACTUALLY SERVED
    # =====================================================

    if (
        previous_question_id
        not in used_question_ids
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Question does not belong to this quiz attempt",
            }
        ), 400


    if (
        subject not in
        ALLOWED_SUBJECTS
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid quiz attempt subject",
            }
        ), 400


    if (
        difficulty not in
        ALLOWED_DIFFICULTIES
    ):
        difficulty = "Adaptive"


    if not isinstance(
        focus_mode,
        bool,
    ):
        focus_mode = True


    # =====================================================
    # GENERATE NEXT ADAPTIVE QUESTION
    # =====================================================

    result = (
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


    if not result.get(
        "success"
    ):
        return jsonify(
            result
        ), 400


    next_question = result.get(
        "question"
    )


    if not next_question:
        return jsonify(
            {
                "success": False,
                "message":
                    "Next question could not be created",
            }
        ), 400


    next_question_id = str(
        next_question.get(
            "id",
            "",
        )
    ).strip()


    if not next_question_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Next question ID is missing",
            }
        ), 400


    # =====================================================
    # SAVE SERVED QUESTION TO ATTEMPT
    # =====================================================

    saved = (
        add_question_to_attempt(
            user_id=user_id,
            attempt_id=attempt_id,
            question_id=next_question_id,
        )
    )


    if not saved.get(
        "success"
    ):
        return jsonify(
            saved
        ), 400


    # Keep same attempt ID throughout quiz
    result["attemptId"] = (
        attempt_id
    )


    return jsonify(
        result
    ), 200


# =========================================================
# CHECK ANSWER
# =========================================================

@quiz_bp.post("/check")
def check_answer():

    user_id = session.get(
        "user_id"
    )


    if not user_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Login required",
            }
        ), 401


    data = request.get_json(
        silent=True
    ) or {}


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


    selected_answer = (
        data.get(
            "answer"
        )
    )


    if not attempt_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Quiz attempt ID is required",
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


    # =====================================================
    # VERIFY ACTIVE ATTEMPT
    # =====================================================

    attempt = (
        get_active_quiz_attempt(
            user_id=user_id,
            attempt_id=attempt_id,
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
        served_question_ids = []


    # =====================================================
    # VERIFY QUESTION BELONGS TO ATTEMPT
    # =====================================================

    if (
        question_id
        not in served_question_ids
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Question does not belong to this quiz attempt",
            }
        ), 400


    # =====================================================
    # CHECK REAL ANSWER
    # =====================================================

    result = (
        check_question_answer(
            question_id,
            selected_answer,
        )
    )


    if not result:
        return jsonify(
            {
                "success": False,
                "message":
                    "Question not found",
            }
        ), 404


    return jsonify(
        {
            "success": True,
            **result,
        }
    ), 200