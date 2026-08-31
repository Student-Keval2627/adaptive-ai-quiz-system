from datetime import (
    datetime,
    timezone,
)

from bson import ObjectId

from database import (
    users_collection,
)

from models.quiz_model import (
    get_available_subjects,
)


# =========================================================
# DEFAULTS
# =========================================================

DEFAULT_LEARNING_GOAL = (
    "Improve AI & ML skills"
)

DEFAULT_PREFERRED_SUBJECTS = [
    "Python",
    "Machine Learning",
    "Data Structures",
]


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


def normalize_email(email):
    return str(
        email or ""
    ).strip().lower()


def clean_name(name):
    return str(
        name or ""
    ).strip()


def clean_learning_goal(goal):
    goal = str(
        goal or ""
    ).strip()

    if not goal:
        return (
            DEFAULT_LEARNING_GOAL
        )

    return goal


def get_valid_subjects():
    try:
        subjects = (
            get_available_subjects()
        )

    except Exception:
        subjects = []

    if not subjects:
        return list(
            DEFAULT_PREFERRED_SUBJECTS
        )

    return subjects


def normalize_preferred_subjects(
    preferred_subjects,
    keep_existing_if_invalid=None,
):
    valid_subjects = set(
        get_valid_subjects()
    )

    if not isinstance(
        preferred_subjects,
        list,
    ):
        if isinstance(
            keep_existing_if_invalid,
            list,
        ):
            return (
                keep_existing_if_invalid
            )

        return list(
            DEFAULT_PREFERRED_SUBJECTS
        )

    cleaned = []

    for subject in (
        preferred_subjects
    ):
        subject_name = str(
            subject or ""
        ).strip()

        if not subject_name:
            continue

        if (
            subject_name not in
            valid_subjects
        ):
            continue

        if (
            subject_name in
            cleaned
        ):
            continue

        cleaned.append(
            subject_name
        )

    if cleaned:
        return cleaned

    if isinstance(
        keep_existing_if_invalid,
        list,
    ):
        existing_cleaned = [
            str(subject).strip()
            for subject
            in keep_existing_if_invalid
            if str(subject).strip()
        ]

        if existing_cleaned:
            return (
                existing_cleaned
            )

    defaults = [
        subject
        for subject
        in DEFAULT_PREFERRED_SUBJECTS
        if subject in
        valid_subjects
    ]

    if defaults:
        return defaults

    return sorted(
        valid_subjects
    )[:3]


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


def serialize_datetime(value):
    if not value:
        return None

    try:
        return value.isoformat()

    except Exception:
        return str(
            value
        )


# =========================================================
# INDEX HELPERS
# =========================================================

def has_index_on_field(
    field_name,
):
    try:
        indexes = (
            users_collection
            .index_information()
        )

    except Exception:
        return False

    expected_key = [
        (
            field_name,
            1,
        )
    ]

    for index_data in (
        indexes.values()
    ):
        if (
            index_data.get(
                "key"
            )
            == expected_key
        ):
            return True

    return False


# =========================================================
# INDEXES
#
# IMPORTANT:
# Older versions of this project already created an index
# named "email_1". Creating the same index again with a new
# custom name causes MongoDB IndexOptionsConflict.
#
# We first check whether an index on email already exists.
# If it exists, we keep it instead of trying to rename it.
# =========================================================

def create_user_indexes():

    if not has_index_on_field(
        "email"
    ):
        users_collection.create_index(
            "email",
            unique=True,
        )

    if not has_index_on_field(
        "createdAt"
    ):
        users_collection.create_index(
            "createdAt"
        )


# =========================================================
# CREATE USER
# =========================================================

def create_user(
    name,
    email,
    password_hash=None,
    **kwargs,
):
    name = clean_name(
        name
    )

    email = normalize_email(
        email
    )

    if password_hash is None:
        password_hash = (
            kwargs.get(
                "passwordHash"
            )
        )

    password_hash = str(
        password_hash or ""
    ).strip()

    if not name:
        return None

    if not email:
        return None

    if not password_hash:
        return None

    now = datetime.now(
        timezone.utc
    )

    preferred_subjects = (
        normalize_preferred_subjects(
            kwargs.get(
                "preferredSubjects",
                DEFAULT_PREFERRED_SUBJECTS,
            )
        )
    )

    learning_goal = (
        clean_learning_goal(
            kwargs.get(
                "learningGoal",
                DEFAULT_LEARNING_GOAL,
            )
        )
    )

    document = {
        "name":
            name,

        "email":
            email,

        "passwordHash":
            password_hash,

        "role":
            str(
                kwargs.get(
                    "role",
                    "Student",
                )
                or "Student"
            ).strip(),

        "profile": {
            "learningGoal":
                learning_goal,

            "preferredSubjects":
                preferred_subjects,
        },

        "stats": {
            "quizzesCompleted":
                0,

            "questionsAnswered":
                0,

            "correctAnswers":
                0,

            "accuracy":
                0,

            "bestAccuracy":
                0,

            "streak":
                0,

            "bestStreak":
                0,

            "xp":
                0,

            "level":
                1,

            "lastQuizAt":
                None,
        },

        "createdAt":
            now,

        "updatedAt":
            now,
    }

    result = (
        users_collection
        .insert_one(
            document
        )
    )

    document["_id"] = (
        result.inserted_id
    )

    return document


# =========================================================
# FIND BY EMAIL
# =========================================================

def find_user_by_email(
    email,
):
    email = (
        normalize_email(
            email
        )
    )

    if not email:
        return None

    return (
        users_collection
        .find_one(
            {
                "email":
                    email
            }
        )
    )


# =========================================================
# FIND BY ID
# =========================================================

def find_user_by_id(
    user_id,
):
    object_user_id = (
        safe_object_id(
            user_id
        )
    )

    if not object_user_id:
        return None

    return (
        users_collection
        .find_one(
            {
                "_id":
                    object_user_id
            }
        )
    )


# =========================================================
# UPDATE PROFILE
# =========================================================

def update_user_profile(
    user_id,
    name=None,
    learning_goal=None,
    preferred_subjects=None,
    **kwargs,
):
    object_user_id = (
        safe_object_id(
            user_id
        )
    )

    if not object_user_id:
        return None

    current_user = (
        users_collection
        .find_one(
            {
                "_id":
                    object_user_id
            }
        )
    )

    if not current_user:
        return None

    if learning_goal is None:
        learning_goal = (
            kwargs.get(
                "learningGoal"
            )
        )

    if preferred_subjects is None:
        preferred_subjects = (
            kwargs.get(
                "preferredSubjects"
            )
        )

    update_fields = {}

    if name is not None:
        cleaned_name = (
            clean_name(
                name
            )
        )

        if cleaned_name:
            update_fields[
                "name"
            ] = cleaned_name

    if learning_goal is not None:
        update_fields[
            "profile.learningGoal"
        ] = (
            clean_learning_goal(
                learning_goal
            )
        )

    if preferred_subjects is not None:
        existing_subjects = (
            current_user
            .get(
                "profile",
                {},
            )
            .get(
                "preferredSubjects",
                DEFAULT_PREFERRED_SUBJECTS,
            )
        )

        update_fields[
            "profile.preferredSubjects"
        ] = (
            normalize_preferred_subjects(
                preferred_subjects,
                keep_existing_if_invalid=
                    existing_subjects,
            )
        )

    update_fields[
        "updatedAt"
    ] = datetime.now(
        timezone.utc
    )

    users_collection.update_one(
        {
            "_id":
                object_user_id
        },
        {
            "$set":
                update_fields
        },
    )

    return (
        find_user_by_id(
            object_user_id
        )
    )


# =========================================================
# SERIALIZE USER
# =========================================================

def serialize_user(
    user,
):
    if not user:
        return None

    profile = user.get(
        "profile",
        {},
    )

    stats = user.get(
        "stats",
        {},
    )

    preferred_subjects = (
        profile.get(
            "preferredSubjects",
            DEFAULT_PREFERRED_SUBJECTS,
        )
    )

    if not isinstance(
        preferred_subjects,
        list,
    ):
        preferred_subjects = list(
            DEFAULT_PREFERRED_SUBJECTS
        )

    last_quiz_at = (
        stats.get(
            "lastQuizAt"
        )
    )

    return {
        "id":
            str(
                user["_id"]
            ),

        "name":
            user.get(
                "name",
                "",
            ),

        "email":
            user.get(
                "email",
                "",
            ),

        "role":
            user.get(
                "role",
                "Student",
            ),

        "profile": {
            "learningGoal":
                profile.get(
                    "learningGoal",
                    DEFAULT_LEARNING_GOAL,
                ),

            "preferredSubjects":
                preferred_subjects,
        },

        "stats": {
            "quizzesCompleted":
                safe_int(
                    stats.get(
                        "quizzesCompleted",
                        0,
                    )
                ),

            "questionsAnswered":
                safe_int(
                    stats.get(
                        "questionsAnswered",
                        0,
                    )
                ),

            "correctAnswers":
                safe_int(
                    stats.get(
                        "correctAnswers",
                        0,
                    )
                ),

            "accuracy":
                safe_int(
                    stats.get(
                        "accuracy",
                        0,
                    )
                ),

            "bestAccuracy":
                safe_int(
                    stats.get(
                        "bestAccuracy",
                        stats.get(
                            "accuracy",
                            0,
                        ),
                    )
                ),

            "streak":
                safe_int(
                    stats.get(
                        "streak",
                        0,
                    )
                ),

            "bestStreak":
                safe_int(
                    stats.get(
                        "bestStreak",
                        stats.get(
                            "streak",
                            0,
                        ),
                    )
                ),

            "xp":
                safe_int(
                    stats.get(
                        "xp",
                        0,
                    )
                ),

            "level":
                max(
                    1,
                    safe_int(
                        stats.get(
                            "level",
                            1,
                        ),
                        1,
                    ),
                ),

            "lastQuizAt":
                serialize_datetime(
                    last_quiz_at
                ),
        },

        "createdAt":
            serialize_datetime(
                user.get(
                    "createdAt"
                )
            ),

        "updatedAt":
            serialize_datetime(
                user.get(
                    "updatedAt"
                )
            ),
    }
