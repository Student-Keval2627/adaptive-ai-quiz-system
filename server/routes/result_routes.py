from flask import (
    Blueprint,
    jsonify,
    request,
    session,
)

from models.quiz_model import (
    get_available_subjects,
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


def subject_exists(subject):
    if not subject:
        return False

    return (
        subject in
        get_available_subjects()
    )


# =========================================================
# SAVE QUIZ RESULT
# =========================================================

@result_bp.post("")
@result_bp.post("/")
def save_result():
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

    attempt_id = str(
        data.get(
            "attemptId",
            "",
        )
    ).strip()

    answers = data.get(
        "answers"
    )

    if not subject:
        return jsonify(
            {
                "success": False,
                "message":
                    "Subject is required",
            }
        ), 400

    # Dynamic validation:
    # Any subject present in MongoDB question bank is valid.
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

    if not attempt_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Attempt ID is required",
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
                    "At least one answer is required",
            }
        ), 400

    result = (
        save_quiz_result(
            user_id=user_id,
            subject=subject,
            answers=answers,
            attempt_id=
                attempt_id,
        )
    )

    if not result.get(
        "success"
    ):
        return jsonify(
            result
        ), 400

    # Duplicate result is still a successful response,
    # but no XP/stats are added again.
    if result.get(
        "duplicate"
    ):
        return jsonify(
            result
        ), 200

    return jsonify(
        result
    ), 201


# =========================================================
# RESULT HISTORY
# =========================================================

@result_bp.get("")
@result_bp.get("/")
def get_results():
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
            100,
        ),
    )

    results = (
        get_user_results(
            user_id=user_id,
            limit=limit,
        )
    )

    return jsonify(
        {
            "success": True,
            "count":
                len(
                    results
                ),
            "results":
                results,
        }
    )
