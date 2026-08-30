from datetime import datetime, timezone

from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from werkzeug.security import generate_password_hash

from database import users_collection


# =========================================================
# INDEXES
# =========================================================

def create_user_indexes():
    users_collection.create_index(
        "email",
        unique=True
    )


# =========================================================
# NORMALIZE EMAIL
# =========================================================

def normalize_email(email):
    return str(email).strip().lower()


# =========================================================
# CREATE USER
# =========================================================

def create_user(name, email, password):
    email = normalize_email(email)

    now = datetime.now(timezone.utc)

    user_document = {
        "name": name.strip(),

        "email": email,

        "password": generate_password_hash(
            password
        ),

        "role": "Student",

        "profile": {
            "learningGoal":
                "Improve AI & ML skills",

            "preferredSubjects": [
                "Python",
                "Machine Learning",
                "Data Structures"
            ]
        },

        "stats": {
            "quizzesCompleted": 0,
            "questionsAnswered": 0,
            "correctAnswers": 0,
            "accuracy": 0,
            "streak": 0,
            "xp": 0,
            "level": 1
        },

        "createdAt": now,
        "updatedAt": now
    }

    try:
        result = users_collection.insert_one(
            user_document
        )

        user_document["_id"] = (
            result.inserted_id
        )

        return user_document

    except DuplicateKeyError:
        return None


# =========================================================
# FIND USER BY EMAIL
# =========================================================

def find_user_by_email(email):
    return users_collection.find_one(
        {
            "email":
                normalize_email(email)
        }
    )


# =========================================================
# FIND USER BY ID
# =========================================================

def find_user_by_id(user_id):
    try:
        object_id = ObjectId(
            user_id
        )

    except Exception:
        return None

    return users_collection.find_one(
        {
            "_id": object_id
        }
    )


# =========================================================
# UPDATE PROFILE
# =========================================================

def update_user_profile(
    user_id,
    name=None,
    learning_goal=None,
    preferred_subjects=None
):
    try:
        object_id = ObjectId(
            user_id
        )

    except Exception:
        return None

    update_fields = {
        "updatedAt":
            datetime.now(
                timezone.utc
            )
    }

    if name is not None:
        cleaned_name = str(
            name
        ).strip()

        if cleaned_name:
            update_fields["name"] = (
                cleaned_name
            )

    if learning_goal is not None:
        update_fields[
            "profile.learningGoal"
        ] = str(
            learning_goal
        ).strip()

    if preferred_subjects is not None:
        if isinstance(
            preferred_subjects,
            list
        ):
            allowed_subjects = [
                "Python",
                "Machine Learning",
                "Data Structures"
            ]

            cleaned_subjects = [
                subject
                for subject
                in preferred_subjects
                if subject
                in allowed_subjects
            ]

            update_fields[
                "profile.preferredSubjects"
            ] = cleaned_subjects

    users_collection.update_one(
        {
            "_id": object_id
        },
        {
            "$set":
                update_fields
        }
    )

    return find_user_by_id(
        user_id
    )


# =========================================================
# SERIALIZE USER
# =========================================================

def serialize_user(user):
    if not user:
        return None

    created_at = user.get(
        "createdAt"
    )

    updated_at = user.get(
        "updatedAt"
    )

    return {
        "id":
            str(user["_id"]),

        "name":
            user.get(
                "name",
                ""
            ),

        "email":
            user.get(
                "email",
                ""
            ),

        "role":
            user.get(
                "role",
                "Student"
            ),

        "profile":
            user.get(
                "profile",
                {}
            ),

        "stats":
            user.get(
                "stats",
                {}
            ),

        "createdAt":
            (
                created_at.isoformat()
                if created_at
                else None
            ),

        "updatedAt":
            (
                updated_at.isoformat()
                if updated_at
                else None
            )
    }