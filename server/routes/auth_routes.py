from flask import (
    Blueprint,
    jsonify,
    request,
    session
)

from werkzeug.security import (
    check_password_hash
)

from models.user_model import (
    create_user,
    find_user_by_email,
    find_user_by_id,
    serialize_user,
    update_user_profile
)


auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api/auth"
)


# =========================================================
# REGISTER
# =========================================================

@auth_bp.post("/register")
def register():
    data = request.get_json(
        silent=True
    ) or {}

    name = str(
        data.get(
            "name",
            ""
        )
    ).strip()

    email = str(
        data.get(
            "email",
            ""
        )
    ).strip()

    password = str(
        data.get(
            "password",
            ""
        )
    )

    if not name:
        return jsonify(
            {
                "success": False,
                "message":
                    "Name is required"
            }
        ), 400

    if not email:
        return jsonify(
            {
                "success": False,
                "message":
                    "Email is required"
            }
        ), 400

    if len(password) < 6:
        return jsonify(
            {
                "success": False,
                "message":
                    "Password must be at least 6 characters"
            }
        ), 400

    if find_user_by_email(
        email
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Email already registered"
            }
        ), 409

    user = create_user(
        name,
        email,
        password
    )

    if not user:
        return jsonify(
            {
                "success": False,
                "message":
                    "Could not create user"
            }
        ), 500

    session.permanent = True

    session["user_id"] = str(
        user["_id"]
    )

    return jsonify(
        {
            "success": True,
            "message":
                "Registration successful",

            "user":
                serialize_user(
                    user
                )
        }
    ), 201


# =========================================================
# LOGIN
# =========================================================

@auth_bp.post("/login")
def login():
    data = request.get_json(
        silent=True
    ) or {}

    email = str(
        data.get(
            "email",
            ""
        )
    ).strip()

    password = str(
        data.get(
            "password",
            ""
        )
    )

    if not email or not password:
        return jsonify(
            {
                "success": False,
                "message":
                    "Email and password are required"
            }
        ), 400

    user = find_user_by_email(
        email
    )

    if (
        not user
        or not check_password_hash(
            user.get(
                "password",
                ""
            ),
            password
        )
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Invalid email or password"
            }
        ), 401

    session.permanent = True

    session["user_id"] = str(
        user["_id"]
    )

    return jsonify(
        {
            "success": True,
            "message":
                "Login successful",

            "user":
                serialize_user(
                    user
                )
        }
    )


# =========================================================
# CURRENT USER
# =========================================================

@auth_bp.get("/me")
def current_user():
    user_id = session.get(
        "user_id"
    )

    if not user_id:
        return jsonify(
            {
                "success": False,
                "authenticated": False,
                "message":
                    "Not logged in"
            }
        ), 401

    user = find_user_by_id(
        user_id
    )

    if not user:
        session.clear()

        return jsonify(
            {
                "success": False,
                "authenticated": False,
                "message":
                    "User not found"
            }
        ), 401

    return jsonify(
        {
            "success": True,
            "authenticated": True,
            "user":
                serialize_user(
                    user
                )
        }
    )


# =========================================================
# UPDATE PROFILE
# =========================================================

@auth_bp.put("/profile")
def update_profile():
    user_id = session.get(
        "user_id"
    )

    if not user_id:
        return jsonify(
            {
                "success": False,
                "message":
                    "Login required"
            }
        ), 401

    data = request.get_json(
        silent=True
    ) or {}

    name = data.get(
        "name"
    )

    learning_goal = data.get(
        "learningGoal"
    )

    preferred_subjects = data.get(
        "preferredSubjects"
    )

    if (
        name is not None
        and not str(
            name
        ).strip()
    ):
        return jsonify(
            {
                "success": False,
                "message":
                    "Name cannot be empty"
            }
        ), 400

    updated_user = (
        update_user_profile(
            user_id=user_id,
            name=name,
            learning_goal=
                learning_goal,
            preferred_subjects=
                preferred_subjects
        )
    )

    if not updated_user:
        return jsonify(
            {
                "success": False,
                "message":
                    "Could not update profile"
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
                )
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
                "Logged out successfully"
        }
    )