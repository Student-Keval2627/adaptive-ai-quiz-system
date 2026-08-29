from datetime import datetime, timezone

from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from werkzeug.security import generate_password_hash

from database import users_collection


# =========================================================
# USER COLLECTION INDEX
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
    return email.strip().lower()


# =========================================================
# CREATE USER
# =========================================================

def create_user(name, email, password):
    email = normalize_email(email)

    user_document = {
        "name": name.strip(),
        "email": email,
        "password": generate_password_hash(password),

        "role": "Student",

        "profile": {
            "learningGoal": "Improve AI & ML skills",
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

        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc)
    }

    try:
        result = users_collection.insert_one(
            user_document
        )

        return {
            "success": True,
            "user_id": str(result.inserted_id)
        }

    except DuplicateKeyError:
        return {
            "success": False,
            "message": "Email already registered"
        }


# =========================================================
# FIND USER BY EMAIL
# =========================================================

def find_user_by_email(email):
    return users_collection.find_one(
        {
            "email": normalize_email(email)
        }
    )


# =========================================================
# FIND USER BY ID
# =========================================================

def find_user_by_id(user_id):
    try:
        object_id = ObjectId(user_id)

    except Exception:
        return None

    return users_collection.find_one(
        {
            "_id": object_id
        }
    )


# =========================================================
# USER RESPONSE
# =========================================================

def serialize_user(user):
    if not user:
        return None

    return {
        "id": str(user["_id"]),
        "name": user.get(
            "name",
            ""
        ),
        "email": user.get(
            "email",
            ""
        ),
        "role": user.get(
            "role",
            "Student"
        ),
        "profile": user.get(
            "profile",
            {}
        ),
        "stats": user.get(
            "stats",
            {}
        )
    }