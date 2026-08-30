from flask import (
    Blueprint,
    jsonify,
    request,
    session
)

from models.result_model import (
    get_user_results,
    save_quiz_result
)


# =========================================================
# BLUEPRINT
# =========================================================

result_bp = Blueprint(
    "results",
    __name__,
    url_prefix="/api/results"
)


# =========================================================
# SAVE QUIZ RESULT
# =========================================================

@result_bp.post("")
@result_bp.post("/")
def save_result():
    user_id = session.get(
        "user_id"
    )

    if not user_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Login required"
            }
        ), 401

    data = request.get_json(
        silent=True
    ) or {}

    subject = str(
        data.get(
            "subject",
            ""
        )
    ).strip()

    answers = data.get(
        "answers",
        []
    )

    try:
        score = int(
            data.get(
                "score",
                0
            )
        )

        total = int(
            data.get(
                "total",
                0
            )
        )

    except (
        TypeError,
        ValueError
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid score or total"
            }
        ), 400

    if not subject:
        return jsonify(
            {
                "success": False,
                "message":
                    "Subject is required"
            }
        ), 400

    if total <= 0:
        return jsonify(
            {
                "success": False,
                "message":
                    "Quiz total must be greater than zero"
            }
        ), 400

    if score < 0 or score > total:
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid quiz score"
            }
        ), 400

    if not isinstance(
        answers,
        list
    ):
        answers = []

    result = save_quiz_result(
        user_id=user_id,
        subject=subject,
        score=score,
        total=total,
        answers=answers
    )

    if not result.get(
        "success"
    ):
        return jsonify(
            result
        ), 400

    return jsonify(
        result
    ), 201


# =========================================================
# RESULT HISTORY
# =========================================================

@result_bp.get("")
@result_bp.get("/")
def result_history():
    user_id = session.get(
        "user_id"
    )

    if not user_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Login required"
            }
        ), 401

    try:
        limit = int(
            request.args.get(
                "limit",
                10
            )
        )

    except ValueError:
        limit = 10

    limit = max(
        1,
        min(
            limit,
            50
        )
    )

    results = get_user_results(
        user_id,
        limit
    )

    return jsonify(
        {
            "success": True,
            "count": len(results),
            "results": results
        }
    )