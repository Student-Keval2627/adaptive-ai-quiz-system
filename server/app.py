from datetime import timedelta

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from database import check_database_connection

from models.user_model import (
    create_user_indexes
)

from models.quiz_model import (
    create_question_indexes,
    seed_questions
)

from models.result_model import (
    create_result_indexes
)

from routes.auth_routes import auth_bp
from routes.quiz_routes import quiz_bp
from routes.result_routes import result_bp

from routes.analytics_routes import (
    analytics_bp,
)
# =========================================================
# FLASK APP
# =========================================================

app = Flask(__name__)

app.config.from_object(
    Config
)


# =========================================================
# SESSION CONFIG
# =========================================================

app.config[
    "PERMANENT_SESSION_LIFETIME"
] = timedelta(days=7)

app.config[
    "SESSION_COOKIE_HTTPONLY"
] = True

app.config[
    "SESSION_COOKIE_SAMESITE"
] = "Lax"

app.config[
    "SESSION_COOKIE_SECURE"
] = False


# =========================================================
# CORS
# =========================================================

CORS(
    app,

    origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
    ],

    supports_credentials=True,

    allow_headers=[
        "Content-Type",
        "Authorization",
    ],

    methods=[
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
    ],
)


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

try:
    create_user_indexes()

    create_question_indexes()

    create_result_indexes()

    seed_questions()

except Exception as error:
    print(
        "MongoDB initialization warning:",
        error
    )


# =========================================================
# BLUEPRINTS
# =========================================================

app.register_blueprint(
    auth_bp
)

app.register_blueprint(
    quiz_bp
)

app.register_blueprint(
    result_bp
)
app.register_blueprint(
    analytics_bp
)

# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return jsonify(
        {
            "success": True,
            "project":
                "Adaptive AI Quiz System",

            "app":
                "NeuraQuiz",

            "message":
                "Backend server is running"
        }
    )


# =========================================================
# HEALTH
# =========================================================

@app.get("/api/health")
def health():
    return jsonify(
        {
            "success": True,
            "status": "healthy",
            "message":
                "NeuraQuiz API is running"
        }
    )


# =========================================================
# DATABASE TEST
# =========================================================

@app.get("/api/db-test")
def database_test():
    result = (
        check_database_connection()
    )

    status_code = (
        200
        if result["connected"]
        else 500
    )

    return jsonify(
        result
    ), status_code


# =========================================================
# 404
# =========================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify(
        {
            "success": False,
            "message":
                "API route not found"
        }
    ), 404


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    print()

    print("=" * 55)
    print(" NeuraQuiz Backend")
    print("=" * 55)

    print(
        f" Server: "
        f"http://127.0.0.1:"
        f"{Config.FLASK_PORT}"
    )

    print(
        f" Results: "
        f"http://127.0.0.1:"
        f"{Config.FLASK_PORT}"
        f"/api/results"
    )

    print("=" * 55)
    print()

    app.run(
        host="127.0.0.1",
        port=Config.FLASK_PORT,
        debug=Config.DEBUG
    )