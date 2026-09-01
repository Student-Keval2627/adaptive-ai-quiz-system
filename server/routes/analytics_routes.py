from flask import (
    Blueprint,
    jsonify,
    request,
    session,
)

from models.analytics_model import (
    get_priority_topic,
    get_user_topic_analytics,
    get_user_weak_topics,
)

from models.quiz_model import (
    get_available_subjects,
)


# =========================================================
# BLUEPRINT
# =========================================================

analytics_bp = Blueprint(
    "analytics",
    __name__,
    url_prefix="/api/analytics",
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


def validate_optional_subject(
    subject,
):
    if not subject:
        return {
            "valid": True,
            "subject": None,
        }

    if not subject_exists(
        subject
    ):
        return {
            "valid": False,
            "subject":
                subject,
            "message":
                "Invalid or unavailable subject",
        }

    return {
        "valid": True,
        "subject":
            subject,
    }


# =========================================================
# TOPIC ANALYTICS
#
# Examples:
#
# GET /api/analytics/topics
# GET /api/analytics/topics?subject=Python
#
# The subject filter is optional.
# =========================================================

@analytics_bp.get("/topics")
def topic_analytics():
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

    validation = (
        validate_optional_subject(
            subject
        )
    )

    if not validation.get(
        "valid"
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    validation.get(
                        "message",
                        "Invalid subject",
                    ),
            }
        ), 400

    result = (
        get_user_topic_analytics(
            user_id=user_id,
            subject=
                validation.get(
                    "subject"
                ),
        )
    )

    if not result.get(
        "success"
    ):
        return jsonify(
            result
        ), 400

    return jsonify(
        result
    )


# =========================================================
# WEAK TOPICS
#
# Examples:
#
# GET /api/analytics/weak-topics
# GET /api/analytics/weak-topics?limit=10
# GET /api/analytics/weak-topics?subject=Python&limit=10
# =========================================================

@analytics_bp.get("/weak-topics")
def weak_topics():
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

    validation = (
        validate_optional_subject(
            subject
        )
    )

    if not validation.get(
        "valid"
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    validation.get(
                        "message",
                        "Invalid subject",
                    ),
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
            50,
        ),
    )

    topics = (
        get_user_weak_topics(
            user_id=user_id,
            subject=
                validation.get(
                    "subject"
                ),
            limit=limit,
        )
    )

    return jsonify(
        {
            "success": True,

            "subject":
                validation.get(
                    "subject"
                ),

            "count":
                len(
                    topics
                ),

            "topics":
                topics,
        }
    )


# =========================================================
# PRIORITY TOPIC
#
# This route is useful for debugging and future frontend
# features. The adaptive quiz engine uses the same analytics
# model directly.
#
# Example:
# GET /api/analytics/priority-topic?subject=Python
# =========================================================

@analytics_bp.get("/priority-topic")
def priority_topic():
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

    topic = (
        get_priority_topic(
            user_id=user_id,
            subject=subject,
        )
    )

    return jsonify(
        {
            "success": True,
            "subject":
                subject,
            "topic":
                topic,
            "hasPriorityTopic":
                bool(
                    topic
                ),
        }
    )
