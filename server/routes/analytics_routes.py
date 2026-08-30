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


# =========================================================
# BLUEPRINT
# =========================================================

analytics_bp = Blueprint(
    "analytics",
    __name__,
    url_prefix="/api/analytics",
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
# TOPIC ANALYTICS
# =========================================================

@analytics_bp.get("/topics")
def topic_analytics():

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


    subject = str(
        request.args.get(
            "subject",
            "",
        )
    ).strip()


    if (
        subject and
        subject not in ALLOWED_SUBJECTS
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid subject",
            }
        ), 400


    result = (
        get_user_topic_analytics(
            user_id=user_id,
            subject=subject or None,
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
    ), 200


# =========================================================
# WEAK TOPICS
# =========================================================

@analytics_bp.get("/weak-topics")
def weak_topics():

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


    subject = str(
        request.args.get(
            "subject",
            "",
        )
    ).strip()


    if (
        subject and
        subject not in ALLOWED_SUBJECTS
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid subject",
            }
        ), 400


    try:
        limit = int(
            request.args.get(
                "limit",
                3,
            )
        )

    except (
        TypeError,
        ValueError,
    ):
        limit = 3


    limit = max(
        1,
        min(
            limit,
            10,
        ),
    )


    topics = (
        get_user_weak_topics(
            user_id=user_id,
            subject=subject or None,
            limit=limit,
        )
    )


    return jsonify(
        {
            "success": True,
            "count":
                len(
                    topics
                ),
            "topics":
                topics,
        }
    ), 200


# =========================================================
# PRIORITY TOPIC
# =========================================================

@analytics_bp.get("/priority-topic")
def priority_topic():

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


    subject = str(
        request.args.get(
            "subject",
            "",
        )
    ).strip()


    if (
        subject not in
        ALLOWED_SUBJECTS
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Valid subject is required",
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
            "priorityTopic":
                topic,
        }
    ), 200