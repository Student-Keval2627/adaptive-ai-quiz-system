from bson import ObjectId

from database import (
    quiz_results_collection,
)


# =========================================================
# CONFIG
# =========================================================

MIN_TOPIC_ATTEMPTS_FOR_STRONG = 2


# =========================================================
# SAFE INTEGER
# =========================================================

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


# =========================================================
# TOPIC RECOMMENDATION
# =========================================================

def build_topic_recommendation(
    topic,
    accuracy,
):
    if not topic:
        return (
            "Complete more quizzes to receive "
            "personalized practice recommendations."
        )


    if accuracy < 40:
        return (
            f"Focus strongly on {topic}. "
            "Review the fundamentals and practice "
            "more Easy and Medium questions."
        )


    if accuracy < 60:
        return (
            f"Practice {topic} more often. "
            "You understand some concepts, but "
            "additional targeted questions will help."
        )


    if accuracy < 75:
        return (
            f"Continue practicing {topic}. "
            "Your understanding is improving, but "
            "more consistency is needed."
        )


    return (
        f"Keep strengthening {topic} with "
        "Medium and Hard questions."
    )


# =========================================================
# EMPTY ANALYTICS
# =========================================================

def empty_analytics():
    return {
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
                "Complete a quiz to unlock "
                "personalized topic analytics."
            ),

        "topics":
            [],
    }


# =========================================================
# USER TOPIC ANALYTICS
# =========================================================

def get_user_topic_analytics(
    user_id,
    subject=None,
):
    try:
        object_user_id = ObjectId(
            user_id
        )

    except Exception:
        return {
            "success": False,
            "message":
                "Invalid user ID",
            "analytics":
                empty_analytics(),
        }


    # =====================================================
    # RESULT FILTER
    # =====================================================

    query = {
        "userId":
            object_user_id,

        "verified":
            True,
    }


    if subject:
        query[
            "subject"
        ] = subject


    # =====================================================
    # LOAD QUIZ RESULTS
    # =====================================================

    cursor = (
        quiz_results_collection
        .find(
            query,
            {
                "subject": 1,
                "answers": 1,
                "createdAt": 1,
            },
        )
        .sort(
            "createdAt",
            -1,
        )
    )


    topic_stats = {}


    total_answered = 0

    total_correct = 0


    # =====================================================
    # PROCESS EVERY VERIFIED ANSWER
    # =====================================================

    for result in cursor:

        result_subject = str(
            result.get(
                "subject",
                "",
            )
        ).strip()


        answers = result.get(
            "answers",
            [],
        )


        if not isinstance(
            answers,
            list,
        ):
            continue


        for answer in answers:

            if not isinstance(
                answer,
                dict,
            ):
                continue


            topic = str(
                answer.get(
                    "topic",
                    "General",
                )
            ).strip()


            if not topic:
                topic = "General"


            difficulty = str(
                answer.get(
                    "difficulty",
                    "Medium",
                )
            ).strip()


            was_correct = bool(
                answer.get(
                    "correct",
                    False,
                )
            )


            key = (
                result_subject,
                topic,
            )


            if key not in topic_stats:

                topic_stats[
                    key
                ] = {
                    "subject":
                        result_subject,

                    "topic":
                        topic,

                    "answered":
                        0,

                    "correct":
                        0,

                    "easyAnswered":
                        0,

                    "easyCorrect":
                        0,

                    "mediumAnswered":
                        0,

                    "mediumCorrect":
                        0,

                    "hardAnswered":
                        0,

                    "hardCorrect":
                        0,
                }


            stats = topic_stats[
                key
            ]


            stats[
                "answered"
            ] += 1


            total_answered += 1


            if was_correct:

                stats[
                    "correct"
                ] += 1

                total_correct += 1


            # =============================================
            # DIFFICULTY STATS
            # =============================================

            normalized_difficulty = (
                difficulty.lower()
            )


            if (
                normalized_difficulty
                == "easy"
            ):

                stats[
                    "easyAnswered"
                ] += 1

                if was_correct:

                    stats[
                        "easyCorrect"
                    ] += 1


            elif (
                normalized_difficulty
                == "hard"
            ):

                stats[
                    "hardAnswered"
                ] += 1

                if was_correct:

                    stats[
                        "hardCorrect"
                    ] += 1


            else:

                stats[
                    "mediumAnswered"
                ] += 1

                if was_correct:

                    stats[
                        "mediumCorrect"
                    ] += 1


    # =====================================================
    # NO DATA
    # =====================================================

    if not topic_stats:

        return {
            "success": True,
            "analytics":
                empty_analytics(),
        }


    # =====================================================
    # BUILD TOPIC RESPONSE
    # =====================================================

    topics = []


    for stats in (
        topic_stats.values()
    ):

        answered = safe_int(
            stats.get(
                "answered"
            )
        )


        correct = safe_int(
            stats.get(
                "correct"
            )
        )


        accuracy = (
            round(
                (
                    correct /
                    answered
                ) * 100
            )
            if answered > 0
            else 0
        )


        easy_answered = safe_int(
            stats.get(
                "easyAnswered"
            )
        )


        easy_correct = safe_int(
            stats.get(
                "easyCorrect"
            )
        )


        medium_answered = safe_int(
            stats.get(
                "mediumAnswered"
            )
        )


        medium_correct = safe_int(
            stats.get(
                "mediumCorrect"
            )
        )


        hard_answered = safe_int(
            stats.get(
                "hardAnswered"
            )
        )


        hard_correct = safe_int(
            stats.get(
                "hardCorrect"
            )
        )


        easy_accuracy = (
            round(
                (
                    easy_correct /
                    easy_answered
                ) * 100
            )
            if easy_answered
            else None
        )


        medium_accuracy = (
            round(
                (
                    medium_correct /
                    medium_answered
                ) * 100
            )
            if medium_answered
            else None
        )


        hard_accuracy = (
            round(
                (
                    hard_correct /
                    hard_answered
                ) * 100
            )
            if hard_answered
            else None
        )


        if accuracy < 50:

            level = "Weak"


        elif accuracy < 75:

            level = "Improving"


        else:

            level = "Strong"


        topics.append(
            {
                "subject":
                    stats.get(
                        "subject",
                        "",
                    ),

                "topic":
                    stats.get(
                        "topic",
                        "General",
                    ),

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
                    accuracy,

                "level":
                    level,

                "difficultyStats": {
                    "easy": {
                        "answered":
                            easy_answered,

                        "correct":
                            easy_correct,

                        "accuracy":
                            easy_accuracy,
                    },

                    "medium": {
                        "answered":
                            medium_answered,

                        "correct":
                            medium_correct,

                        "accuracy":
                            medium_accuracy,
                    },

                    "hard": {
                        "answered":
                            hard_answered,

                        "correct":
                            hard_correct,

                        "accuracy":
                            hard_accuracy,
                    },
                },
            }
        )


    # =====================================================
    # SORT
    #
    # Lowest accuracy comes first.
    # If accuracy is equal, topic with more
    # answered questions gets higher priority.
    # =====================================================

    topics.sort(
        key=lambda item: (
            item[
                "accuracy"
            ],

            -item[
                "answered"
            ],
        )
    )


    weakest_topic = (
        topics[0]
        if topics
        else None
    )


    strongest_candidates = [
        topic
        for topic
        in topics
        if topic[
            "answered"
        ] >=
        MIN_TOPIC_ATTEMPTS_FOR_STRONG
    ]


    if strongest_candidates:

        strongest_topic = max(
            strongest_candidates,
            key=lambda item: (
                item[
                    "accuracy"
                ],

                item[
                    "answered"
                ],
            ),
        )

    else:

        strongest_topic = max(
            topics,
            key=lambda item: (
                item[
                    "accuracy"
                ],

                item[
                    "answered"
                ],
            ),
        )


    # =====================================================
    # OVERALL ACCURACY
    # =====================================================

    overall_accuracy = (
        round(
            (
                total_correct /
                total_answered
            ) * 100
        )
        if total_answered > 0
        else 0
    )


    recommended_topic = (
        weakest_topic.get(
            "topic"
        )
        if weakest_topic
        else None
    )


    recommendation = (
        build_topic_recommendation(
            recommended_topic,

            weakest_topic.get(
                "accuracy",
                0,
            )
            if weakest_topic
            else 0,
        )
    )


    return {
        "success": True,

        "analytics": {

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
                recommended_topic,

            "recommendation":
                recommendation,

            "topics":
                topics,
        },
    }


# =========================================================
# GET WEAK TOPICS ONLY
# =========================================================

def get_user_weak_topics(
    user_id,
    subject=None,
    limit=3,
):
    result = (
        get_user_topic_analytics(
            user_id,
            subject,
        )
    )


    if not result.get(
        "success"
    ):
        return []


    analytics = result.get(
        "analytics",
        {},
    )


    topics = analytics.get(
        "topics",
        [],
    )


    weak_topics = [
        topic
        for topic
        in topics
        if topic.get(
            "accuracy",
            0,
        ) < 75
    ]


    try:
        limit = int(
            limit
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


    return (
        weak_topics[
            :limit
        ]
    )


# =========================================================
# GET PRIORITY TOPIC
#
# Adaptive engine can use this later.
# =========================================================

def get_priority_topic(
    user_id,
    subject,
):
    weak_topics = (
        get_user_weak_topics(
            user_id=user_id,
            subject=subject,
            limit=1,
        )
    )


    if not weak_topics:
        return None


    return (
        weak_topics[
            0
        ].get(
            "topic"
        )
    )