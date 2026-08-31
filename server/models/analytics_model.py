from bson import ObjectId

from database import (
    quiz_results_collection,
)


# =========================================================
# CONFIG
# =========================================================

MIN_TOPIC_ATTEMPTS_FOR_STRONG = 2

WEAK_TOPIC_ACCURACY_LIMIT = 75


# =========================================================
# HELPERS
# =========================================================

def safe_object_id(value):
    try:
        if isinstance(
            value,
            ObjectId,
        ):
            return value

        return ObjectId(
            str(value)
        )

    except Exception:
        return None


def safe_int(
    value,
    default=0,
):
    try:
        return int(
            value
        )

    except (
        TypeError,
        ValueError,
    ):
        return default


def calculate_accuracy(
    correct,
    answered,
):
    correct = safe_int(
        correct
    )

    answered = safe_int(
        answered
    )

    if answered <= 0:
        return 0

    return round(
        (
            correct /
            answered
        ) * 100
    )


# =========================================================
# TOPIC LEVEL
# =========================================================

def get_topic_level(
    accuracy,
):
    accuracy = safe_int(
        accuracy
    )

    if accuracy < 50:
        return "Weak"

    if accuracy < 75:
        return "Improving"

    return "Strong"


# =========================================================
# RECOMMENDATION
# =========================================================

def build_recommendation(
    weakest_topic,
):
    if not weakest_topic:
        return (
            "Complete more adaptive quizzes "
            "to unlock personalized topic recommendations."
        )

    topic = weakest_topic.get(
        "topic",
        "this topic",
    )

    accuracy = safe_int(
        weakest_topic.get(
            "accuracy",
            0,
        )
    )

    if accuracy < 40:
        return (
            f"Focus on {topic}. Review the fundamentals "
            f"and practice Easy and Medium questions first."
        )

    if accuracy < 60:
        return (
            f"Practice {topic} more frequently. "
            f"Use Focus Mode to reinforce this weak area."
        )

    if accuracy < 75:
        return (
            f"Keep practicing {topic}. Your understanding is "
            f"improving, but more consistency is needed."
        )

    return (
        f"Continue practicing {topic} with Medium and Hard "
        f"questions to strengthen mastery."
    )


# =========================================================
# EMPTY ANALYTICS
# =========================================================

def empty_analytics():
    return {
        "totalSubjects":
            0,

        "totalTopics":
            0,

        "totalAnswered":
            0,

        "totalCorrect":
            0,

        "overallAccuracy":
            0,

        "weakestTopic":
            None,

        "strongestTopic":
            None,

        "recommendedTopic":
            None,

        "recommendation":
            (
                "Complete more adaptive quizzes "
                "to unlock personalized topic recommendations."
            ),

        "subjects":
            [],

        "topics":
            [],
    }


# =========================================================
# BUILD DIFFICULTY STATS
# =========================================================

def build_difficulty_stats(
    row,
):
    easy_answered = safe_int(
        row.get(
            "easyAnswered",
            0,
        )
    )

    easy_correct = safe_int(
        row.get(
            "easyCorrect",
            0,
        )
    )

    medium_answered = safe_int(
        row.get(
            "mediumAnswered",
            0,
        )
    )

    medium_correct = safe_int(
        row.get(
            "mediumCorrect",
            0,
        )
    )

    hard_answered = safe_int(
        row.get(
            "hardAnswered",
            0,
        )
    )

    hard_correct = safe_int(
        row.get(
            "hardCorrect",
            0,
        )
    )

    return {
        "easy": {
            "answered":
                easy_answered,

            "correct":
                easy_correct,

            "accuracy":
                (
                    calculate_accuracy(
                        easy_correct,
                        easy_answered,
                    )
                    if easy_answered > 0
                    else None
                ),
        },

        "medium": {
            "answered":
                medium_answered,

            "correct":
                medium_correct,

            "accuracy":
                (
                    calculate_accuracy(
                        medium_correct,
                        medium_answered,
                    )
                    if medium_answered > 0
                    else None
                ),
        },

        "hard": {
            "answered":
                hard_answered,

            "correct":
                hard_correct,

            "accuracy":
                (
                    calculate_accuracy(
                        hard_correct,
                        hard_answered,
                    )
                    if hard_answered > 0
                    else None
                ),
        },
    }


# =========================================================
# DATABASE AGGREGATION
#
# This keeps analytics scalable as quiz history grows.
# The frontend response shape remains compatible with the
# existing Dashboard, Performance and Weak Topics pages.
# =========================================================

def get_topic_rows(
    user_id,
    subject=None,
):
    object_user_id = (
        safe_object_id(
            user_id
        )
    )

    if not object_user_id:
        return []

    match_filter = {
        "userId":
            object_user_id,

        "verified":
            True,
    }

    if subject:
        match_filter[
            "subject"
        ] = subject

    pipeline = [
        {
            "$match":
                match_filter
        },

        {
            "$unwind":
                "$answers"
        },

        {
            "$group": {
                "_id": {
                    "subject": {
                        "$ifNull": [
                            "$answers.subject",
                            "$subject",
                        ]
                    },

                    "topic": {
                        "$ifNull": [
                            "$answers.topic",
                            "General",
                        ]
                    },
                },

                "answered": {
                    "$sum": 1
                },

                "correct": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$answers.correct",
                                    True,
                                ]
                            },
                            1,
                            0,
                        ]
                    }
                },

                "easyAnswered": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$answers.difficulty",
                                    "Easy",
                                ]
                            },
                            1,
                            0,
                        ]
                    }
                },

                "easyCorrect": {
                    "$sum": {
                        "$cond": [
                            {
                                "$and": [
                                    {
                                        "$eq": [
                                            "$answers.difficulty",
                                            "Easy",
                                        ]
                                    },
                                    {
                                        "$eq": [
                                            "$answers.correct",
                                            True,
                                        ]
                                    },
                                ]
                            },
                            1,
                            0,
                        ]
                    }
                },

                "mediumAnswered": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$answers.difficulty",
                                    "Medium",
                                ]
                            },
                            1,
                            0,
                        ]
                    }
                },

                "mediumCorrect": {
                    "$sum": {
                        "$cond": [
                            {
                                "$and": [
                                    {
                                        "$eq": [
                                            "$answers.difficulty",
                                            "Medium",
                                        ]
                                    },
                                    {
                                        "$eq": [
                                            "$answers.correct",
                                            True,
                                        ]
                                    },
                                ]
                            },
                            1,
                            0,
                        ]
                    }
                },

                "hardAnswered": {
                    "$sum": {
                        "$cond": [
                            {
                                "$eq": [
                                    "$answers.difficulty",
                                    "Hard",
                                ]
                            },
                            1,
                            0,
                        ]
                    }
                },

                "hardCorrect": {
                    "$sum": {
                        "$cond": [
                            {
                                "$and": [
                                    {
                                        "$eq": [
                                            "$answers.difficulty",
                                            "Hard",
                                        ]
                                    },
                                    {
                                        "$eq": [
                                            "$answers.correct",
                                            True,
                                        ]
                                    },
                                ]
                            },
                            1,
                            0,
                        ]
                    }
                },
            }
        },
    ]

    return list(
        quiz_results_collection.aggregate(
            pipeline
        )
    )


# =========================================================
# USER TOPIC ANALYTICS
# =========================================================

def get_user_topic_analytics(
    user_id,
    subject=None,
):
    rows = get_topic_rows(
        user_id=user_id,
        subject=subject,
    )

    if not rows:
        return {
            "success": True,
            "analytics":
                empty_analytics(),
        }

    topics = []

    total_answered = 0
    total_correct = 0

    subject_totals = {}

    for row in rows:
        row_id = row.get(
            "_id",
            {},
        )

        result_subject = str(
            row_id.get(
                "subject",
                "",
            )
            or ""
        ).strip()

        topic_name = str(
            row_id.get(
                "topic",
                "General",
            )
            or "General"
        ).strip()

        if not result_subject:
            continue

        if not topic_name:
            topic_name = "General"

        answered = safe_int(
            row.get(
                "answered",
                0,
            )
        )

        correct = safe_int(
            row.get(
                "correct",
                0,
            )
        )

        wrong = max(
            answered - correct,
            0,
        )

        accuracy = (
            calculate_accuracy(
                correct,
                answered,
            )
        )

        topic = {
            "subject":
                result_subject,

            "topic":
                topic_name,

            "answered":
                answered,

            "correct":
                correct,

            "wrong":
                wrong,

            "accuracy":
                accuracy,

            "level":
                get_topic_level(
                    accuracy
                ),

            "difficultyStats":
                build_difficulty_stats(
                    row
                ),
        }

        topics.append(
            topic
        )

        total_answered += (
            answered
        )

        total_correct += (
            correct
        )

        if (
            result_subject
            not in subject_totals
        ):
            subject_totals[
                result_subject
            ] = {
                "subject":
                    result_subject,

                "answered":
                    0,

                "correct":
                    0,
            }

        subject_totals[
            result_subject
        ][
            "answered"
        ] += answered

        subject_totals[
            result_subject
        ][
            "correct"
        ] += correct

    if not topics:
        return {
            "success": True,
            "analytics":
                empty_analytics(),
        }

    # Weakest topics first.
    # With equal accuracy, more attempts get priority
    # because the signal is more reliable.
    topics.sort(
        key=lambda item: (
            item[
                "accuracy"
            ],
            -item[
                "answered"
            ],
            item[
                "subject"
            ].lower(),
            item[
                "topic"
            ].lower(),
        )
    )

    weakest_topic = (
        topics[0]
    )

    strong_candidates = [
        topic
        for topic
        in topics
        if topic[
            "answered"
        ] >=
        MIN_TOPIC_ATTEMPTS_FOR_STRONG
    ]

    if not strong_candidates:
        strong_candidates = (
            topics
        )

    strongest_topic = max(
        strong_candidates,
        key=lambda item: (
            item[
                "accuracy"
            ],
            item[
                "answered"
            ],
        ),
    )

    subjects = []

    for item in (
        subject_totals.values()
    ):
        answered = safe_int(
            item.get(
                "answered",
                0,
            )
        )

        correct = safe_int(
            item.get(
                "correct",
                0,
            )
        )

        subjects.append(
            {
                "subject":
                    item[
                        "subject"
                    ],

                "answered":
                    answered,

                "correct":
                    correct,

                "wrong":
                    max(
                        answered -
                        correct,
                        0,
                    ),

                "accuracy":
                    calculate_accuracy(
                        correct,
                        answered,
                    ),
            }
        )

    subjects.sort(
        key=lambda item: (
            item[
                "accuracy"
            ],
            item[
                "subject"
            ].lower(),
        )
    )

    overall_accuracy = (
        calculate_accuracy(
            total_correct,
            total_answered,
        )
    )

    return {
        "success": True,

        "analytics": {
            "totalSubjects":
                len(
                    subjects
                ),

            "totalTopics":
                len(
                    topics
                ),

            "totalAnswered":
                total_answered,

            "totalCorrect":
                total_correct,

            "overallAccuracy":
                overall_accuracy,

            "weakestTopic":
                weakest_topic,

            "strongestTopic":
                strongest_topic,

            "recommendedTopic":
                weakest_topic.get(
                    "topic"
                ),

            "recommendation":
                build_recommendation(
                    weakest_topic
                ),

            "subjects":
                subjects,

            "topics":
                topics,
        },
    }


# =========================================================
# WEAK TOPICS
# =========================================================

def get_user_weak_topics(
    user_id,
    subject=None,
    limit=5,
):
    try:
        limit = int(
            limit
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

    result = (
        get_user_topic_analytics(
            user_id=user_id,
            subject=subject,
        )
    )

    analytics = (
        result.get(
            "analytics",
            {}
        )
    )

    topics = analytics.get(
        "topics",
        [],
    )

    weak_topics = [
        topic
        for topic
        in topics
        if safe_int(
            topic.get(
                "accuracy",
                0,
            )
        )
        <
        WEAK_TOPIC_ACCURACY_LIMIT
    ]

    return weak_topics[
        :limit
    ]


# =========================================================
# PRIORITY TOPIC
#
# Used directly by the adaptive quiz engine.
# =========================================================

def get_priority_topic(
    user_id,
    subject,
):
    subject = str(
        subject or ""
    ).strip()

    if not subject:
        return None

    weak_topics = (
        get_user_weak_topics(
            user_id=user_id,
            subject=subject,
            limit=1,
        )
    )

    if not weak_topics:
        return None

    return weak_topics[
        0
    ].get(
        "topic"
    )
