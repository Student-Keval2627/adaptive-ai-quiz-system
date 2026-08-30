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
# ALLOWED SUBJECTS
# =========================================================

ALLOWED_SUBJECTS = [
    "Python",
    "Machine Learning",
    "Data Structures",
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

    except (TypeError, ValueError):
        limit = 5

    limit = max(
        1,
        min(limit, 10),
    )

    if subject not in ALLOWED_SUBJECTS:
        return jsonify(
            {
                "success": False,
                "message": "Invalid subject",
            }
        ), 400

    quiz_questions = get_questions(
        subject,
        limit,
    )

    return jsonify(
        {
            "success": True,
            "questions": quiz_questions,
        }
    )


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
                "message": "Login required",
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

    if subject not in ALLOWED_SUBJECTS:
        return jsonify(
            {
                "success": False,
                "message": "Invalid subject",
            }
        ), 400

    result = start_adaptive_quiz(
        user_id=user_id,
        subject=subject,
    )

    if not result.get(
        "success"
    ):
        return jsonify(
            result
        ), 400

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
                "message": "Login required",
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

    previous_question_id = str(
        data.get(
            "previousQuestionId",
            "",
        )
    ).strip()

    selected_answer = data.get(
        "selectedAnswer"
    )

    used_question_ids = data.get(
        "usedQuestionIds",
        [],
    )

    if subject not in ALLOWED_SUBJECTS:
        return jsonify(
            {
                "success": False,
                "message": "Invalid subject",
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

    if not isinstance(
        used_question_ids,
        list,
    ):
        used_question_ids = []

    result = get_next_adaptive_question(
        user_id=user_id,
        subject=subject,
        previous_question_id=
            previous_question_id,
        selected_answer=
            selected_answer,
        used_question_ids=
            used_question_ids,
    )

    if not result.get(
        "success"
    ):
        return jsonify(
            result
        ), 400

    return jsonify(
        result
    ), 200


# =========================================================
# CHECK ANSWER
# =========================================================

@quiz_bp.post("/check")
def check_answer():
    data = request.get_json(
        silent=True
    ) or {}

    question_id = str(
        data.get(
            "questionId",
            "",
        )
    ).strip()

    selected_answer = data.get(
        "answer"
    )

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

    result = check_question_answer(
        question_id,
        selected_answer,
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