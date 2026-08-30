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


# =========================================================
# BLUEPRINT
# =========================================================

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
# SAVE VERIFIED QUIZ RESULT
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


    answers = data.get(
        "answers",
        [],
    )


    # =====================================================
    # SUBJECT VALIDATION
    # =====================================================

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


    # =====================================================
    # ANSWERS VALIDATION
    # =====================================================

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


    # =====================================================
    # IMPORTANT
    #
    # We intentionally DO NOT read:
    #
    # data["score"]
    # data["total"]
    # data["accuracy"]
    #
    # Those values come from the browser
    # and therefore cannot be trusted.
    #
    # result_model.py calculates them
    # again from MongoDB.
    # =====================================================


    result = save_quiz_result(
        user_id=user_id,
        subject=subject,
        answers=answers,
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