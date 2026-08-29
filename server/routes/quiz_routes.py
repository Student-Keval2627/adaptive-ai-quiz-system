from flask import (
    Blueprint,
    jsonify,
    request
)

from models.quiz_model import (
    check_question_answer,
    get_questions
)


quiz_bp = Blueprint(
    "quiz",
    __name__,
    url_prefix="/api/quiz"
)


# =========================================================
# START QUIZ
# =========================================================

@quiz_bp.get("/questions")
def quiz_questions():
    subject = request.args.get(
        "subject",
        "Python"
    ).strip()

    try:
        limit = int(
            request.args.get(
                "limit",
                5
            )
        )

    except ValueError:
        limit = 5

    # Maximum currently available per subject
    limit = max(
        1,
        min(limit, 10)
    )

    allowed_subjects = [
        "Python",
        "Machine Learning",
        "Data Structures"
    ]

    if subject not in allowed_subjects:
        return jsonify(
            {
                "success": False,
                "message": "Invalid subject"
            }
        ), 400

    questions = get_questions(
        subject,
        limit
    )

    return jsonify(
        {
            "success": True,
            "subject": subject,
            "count": len(questions),
            "questions": questions
        }
    )


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
            ""
        )
    )

    selected_answer = str(
        data.get(
            "answer",
            ""
        )
    )

    if not question_id:
        return jsonify(
            {
                "success": False,
                "message": "Question ID is required"
            }
        ), 400

    if not selected_answer:
        return jsonify(
            {
                "success": False,
                "message": "Answer is required"
            }
        ), 400

    result = check_question_answer(
        question_id,
        selected_answer
    )

    if not result:
        return jsonify(
            {
                "success": False,
                "message": "Question not found"
            }
        ), 404

    return jsonify(
        {
            "success": True,
            **result
        }
    )