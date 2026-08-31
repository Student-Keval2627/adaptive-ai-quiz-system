from flask import (
    Blueprint,
    jsonify,
    request,
    session,
)

from pymongo.errors import (
    DuplicateKeyError,
)

from werkzeug.security import (
    check_password_hash,
    generate_password_hash,
)

from models.quiz_model import (
    get_available_subjects,
)

from models.user_model import (
    create_user,
    find_user_by_email,
    find_user_by_id,
    serialize_user,
    update_user_profile,
)


# =========================================================
# BLUEPRINT
# =========================================================

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth",
)


# =========================================================
# CONFIG
# =========================================================

MIN_PASSWORD_LENGTH = 6
MAX_PASSWORD_LENGTH = 128

MAX_NAME_LENGTH = 80
MAX_LEARNING_GOAL_LENGTH = 300


# =========================================================
# HELPERS
# =========================================================

def get_logged_in_user_id():
    return session.get(
        "user_id"
    )


def normalize_email(value):
    return str(
        value or ""
    ).strip().lower()


def clean_text(
    value,
    max_length=None,
):
    text = str(
        value or ""
    ).strip()

    if (
        max_length is not None
        and len(text) > max_length
    ):
        text = text[
            :max_length
        ].strip()

    return text


def serialize_subjects():
    try:
        subjects = (
            get_available_subjects()
        )

    except Exception:
        subjects = []

    return [
        str(subject)
        for subject
        in subjects
        if subject
    ]


# =========================================================
# REGISTER
# =========================================================

@auth_bp.post("/register")
def register():
    data = (
        request.get_json(
            silent=True
        )
        or {}
    )

    name = clean_text(
        data.get(
            "name"
        ),
        MAX_NAME_LENGTH,
    )

    email = normalize_email(
        data.get(
            "email"
        )
    )

    password = str(
        data.get(
            "password",
            "",
        )
    )

    if not name:
        return jsonify(
            {
                "success": False,
                "message":
                    "Name is required",
            }
        ), 400

    if not email:
        return jsonify(
            {
                "success": False,
                "message":
                    "Email is required",
            }
        ), 400

    if (
        "@" not in email
        or "." not in email
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Enter a valid email address",
            }
        ), 400

    if not password:
        return jsonify(
            {
                "success": False,
                "message":
                    "Password is required",
            }
        ), 400

    if (
        len(password)
        < MIN_PASSWORD_LENGTH
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    f"Password must be at least {MIN_PASSWORD_LENGTH} characters",
            }
        ), 400

    if (
        len(password)
        > MAX_PASSWORD_LENGTH
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Password is too long",
            }
        ), 400

    existing_user = (
        find_user_by_email(
            email
        )
    )

    if existing_user:
        return jsonify(
            {
                "success": False,
                "message":
                    "An account with this email already exists",
            }
        ), 409

    password_hash = (
        generate_password_hash(
            password
        )
    )

    try:
        user = (
            create_user(
                name=name,
                email=email,
                password_hash=
                    password_hash,
            )
        )

    except DuplicateKeyError:
        return jsonify(
            {
                "success": False,
                "message":
                    "An account with this email already exists",
            }
        ), 409

    except Exception as error:
        print(
            "Register error:",
            error,
        )

        return jsonify(
            {
                "success": False,
                "message":
                    "Could not create account",
            }
        ), 500

    if not user:
        return jsonify(
            {
                "success": False,
                "message":
                    "Could not create account",
            }
        ), 500

    session.clear()

    session[
        "user_id"
    ] = str(
        user["_id"]
    )

    session.permanent = True

    return jsonify(
        {
            "success": True,
            "message":
                "Account created successfully",
            "user":
                serialize_user(
                    user
                ),
            "availableSubjects":
                serialize_subjects(),
        }
    ), 201


# =========================================================
# LOGIN
# =========================================================

@auth_bp.post("/login")
def login():
    data = (
        request.get_json(
            silent=True
        )
        or {}
    )

    email = normalize_email(
        data.get(
            "email"
        )
    )

    password = str(
        data.get(
            "password",
            "",
        )
    )

    if (
        not email
        or not password
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Email and password are required",
            }
        ), 400

    user = (
        find_user_by_email(
            email
        )
    )

    if not user:
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid email or password",
            }
        ), 401

    password_hash = str(
        user.get(
            "passwordHash",
            "",
        )
    )

    if (
        not password_hash
        or not check_password_hash(
            password_hash,
            password,
        )
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid email or password",
            }
        ), 401

    session.clear()

    session[
        "user_id"
    ] = str(
        user["_id"]
    )

    session.permanent = True

    return jsonify(
        {
            "success": True,
            "message":
                "Login successful",
            "user":
                serialize_user(
                    user
                ),
            "availableSubjects":
                serialize_subjects(),
        }
    )


# =========================================================
# CURRENT USER
# =========================================================

@auth_bp.get("/me")
def me():
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

    user = (
        find_user_by_id(
            user_id
        )
    )

    if not user:
        session.clear()

        return jsonify(
            {
                "success": False,
                "message":
                    "User account not found",
            }
        ), 401

    return jsonify(
        {
            "success": True,
            "user":
                serialize_user(
                    user
                ),
            "availableSubjects":
                serialize_subjects(),
        }
    )


# =========================================================
# AVAILABLE SUBJECTS
#
# Profile and future frontend screens can use this route.
# The main quiz route also has /api/quiz/subjects.
# =========================================================

@auth_bp.get("/subjects")
def available_subjects():
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

    subjects = (
        serialize_subjects()
    )

    return jsonify(
        {
            "success": True,
            "count":
                len(
                    subjects
                ),
            "subjects":
                subjects,
        }
    )


# =========================================================
# UPDATE PROFILE
# =========================================================

@auth_bp.put("/profile")
@auth_bp.patch("/profile")
def update_profile():
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

    current_user = (
        find_user_by_id(
            user_id
        )
    )

    if not current_user:
        session.clear()

        return jsonify(
            {
                "success": False,
                "message":
                    "User account not found",
            }
        ), 401

    name = None

    if (
        "name"
        in data
    ):
        name = clean_text(
            data.get(
                "name"
            ),
            MAX_NAME_LENGTH,
        )

        if not name:
            return jsonify(
                {
                    "success": False,
                    "message":
                        "Name cannot be empty",
                }
            ), 400

    learning_goal = None

    if (
        "learningGoal"
        in data
    ):
        learning_goal = clean_text(
            data.get(
                "learningGoal"
            ),
            MAX_LEARNING_GOAL_LENGTH,
        )

        if not learning_goal:
            learning_goal = None

    preferred_subjects = None

    if (
        "preferredSubjects"
        in data
    ):
        preferred_subjects = (
            data.get(
                "preferredSubjects"
            )
        )

        if not isinstance(
            preferred_subjects,
            list,
        ):
            return jsonify(
                {
                    "success": False,
                    "message":
                        "Preferred subjects must be a list",
                }
            ), 400

    try:
        updated_user = (
            update_user_profile(
                user_id=user_id,
                name=name,
                learning_goal=
                    learning_goal,
                preferred_subjects=
                    preferred_subjects,
            )
        )

    except Exception as error:
        print(
            "Profile update error:",
            error,
        )

        return jsonify(
            {
                "success": False,
                "message":
                    "Could not update profile",
            }
        ), 500

    if not updated_user:
        return jsonify(
            {
                "success": False,
                "message":
                    "Could not update profile",
            }
        ), 400

    return jsonify(
        {
            "success": True,
            "message":
                "Profile updated successfully",
            "user":
                serialize_user(
                    updated_user
                ),
            "availableSubjects":
                serialize_subjects(),
        }
    )


# =========================================================
# LOGOUT
# =========================================================

@auth_bp.post("/logout")
def logout():
    session.clear()

    return jsonify(
        {
            "success": True,
            "message":
                "Logged out successfully",
        }
    )
