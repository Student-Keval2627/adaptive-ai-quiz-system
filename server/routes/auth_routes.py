from flask import (
    Blueprint,
    jsonify,
    request,
    session
)

from werkzeug.security import check_password_hash

from models.user_model import (
    create_user,
    find_user_by_email,
    find_user_by_id,
    serialize_user
)


# =========================================================
# AUTH BLUEPRINT
# =========================================================

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
        data.get("name", "")
    ).strip()

    email = str(
        data.get("email", "")
    ).strip().lower()

    password = str(
        data.get("password", "")
    )

    # Validation

    if not name:
        return jsonify(
            {
                "success": False,
                "message": "Name is required"
            }
        ), 400

    if not email:
        return jsonify(
            {
                "success": False,
                "message": "Email is required"
            }
        ), 400

    if "@" not in email:
        return jsonify(
            {
                "success": False,
                "message": "Enter a valid email address"
            }
        ), 400

    if len(password) < 6:
        return jsonify(
            {
                "success": False,
                "message": "Password must contain at least 6 characters"
            }
        ), 400

    result = create_user(
        name,
        email,
        password
    )

    if not result["success"]:
        return jsonify(
            result
        ), 409

    user = find_user_by_id(
        result["user_id"]
    )

    # Automatically login after registration

    session["user_id"] = str(
        user["_id"]
    )

    return jsonify(
        {
            "success": True,
            "message": "Account created successfully",
            "user": serialize_user(user)
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
        data.get("email", "")
    ).strip().lower()

    password = str(
        data.get("password", "")
    )

    if not email or not password:
        return jsonify(
            {
                "success": False,
                "message": "Email and password are required"
            }
        ), 400

    user = find_user_by_email(
        email
    )

    if not user:
        return jsonify(
            {
                "success": False,
                "message": "Invalid email or password"
            }
        ), 401

    password_correct = check_password_hash(
        user["password"],
        password
    )

    if not password_correct:
        return jsonify(
            {
                "success": False,
                "message": "Invalid email or password"
            }
        ), 401

    session["user_id"] = str(
        user["_id"]
    )

    session.permanent = True

    return jsonify(
        {
            "success": True,
            "message": "Login successful",
            "user": serialize_user(user)
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
                "message": "Not logged in"
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
                "message": "User not found"
            }
        ), 401

    return jsonify(
        {
            "success": True,
            "authenticated": True,
            "user": serialize_user(user)
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
            "message": "Logout successful"
        }
    )