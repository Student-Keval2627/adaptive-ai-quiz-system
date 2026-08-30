from flask import (
    Blueprint,
    jsonify,
    request,
    session,
)

from models.result_model import (
    get_user_results,
    save_quiz_result,
)


result_bp = Blueprint(
    "results",
    __name__,
    url_prefix="/api/results",
)


ALLOWED_SUBJECTS = [
    "Python",
    "Machine Learning",
    "Data Structures",
]


# =========================================================
# SAVE RESULT
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


    attempt_id = str(
        data.get(
            "attemptId",
            "",
        )
    ).strip()


    answers = data.get(
        "answers",
        [],
    )


    if (
        subject not in
        ALLOWED_SUBJECTS
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid quiz subject",
            }
        ), 400


    if not attempt_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Quiz attempt ID is required",
            }
        ), 400


    if not isinstance(
        answers,
        list,
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Answers must be a list",
            }
        ), 400


    if len(
        answers
    ) == 0:
        return jsonify(
            {
                "success": False,
                "message":
                    "Quiz answers are required",
            }
        ), 400


    result = save_quiz_result(
        user_id=user_id,
        subject=subject,
        answers=answers,
        attempt_id=attempt_id,
    )


    if not result.get(
        "success"
    ):
        return jsonify(
            result
        ), 400


    # New result = 201
    # Duplicate replay = 200

    status_code = (
        200
        if result.get(
            "duplicate"
        )
        else 201
    )


    return jsonify(
        result
    ), status_code


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
                    "Login required",
            }
        ), 401


    try:
        limit = int(
            request.args.get(
                "limit",
                10,
            )
        )

    except (
        TypeError,
        ValueError,
    ):
        limit = 10


    limit = max(
        1,
        min(
            limit,
            50,
        ),
    )


    results = get_user_results(
        user_id,
        limit,
    )


    return jsonify(
        {
            "success": True,

            "count":
                len(results),

            "results":
                results,
        }
    ), 200