from datetime import timedelta

from flask import (
    Flask,
    jsonify,
)

from flask_cors import CORS

from config import Config

from database import (
    check_database_connection,
)

from models.user_model import (
    create_user_indexes,
)

from models.quiz_model import (
    create_question_indexes,
    seed_questions,
)

from models.quiz_attempt_model import (
    create_quiz_attempt_indexes,
)

from models.result_model import (
    create_result_indexes,
)

from routes.auth_routes import (
    auth_bp,
)

from routes.quiz_routes import (
    quiz_bp,
)

from routes.result_routes import (
    result_bp,
)

from routes.analytics_routes import (
    analytics_bp,
)


# =========================================================
# APP
# =========================================================

app = Flask(
    __name__
)

app.config.from_object(
    Config
)


# =========================================================
# SESSION
# =========================================================

app.config[
    "PERMANENT_SESSION_LIFETIME"
] = timedelta(
    days=7
)

app.config[
    "SESSION_COOKIE_HTTPONLY"
] = True

app.config[
    "SESSION_COOKIE_SAMESITE"
] = "Lax"

# Local development uses HTTP.
# Set this to True when deploying behind HTTPS.
app.config[
    "SESSION_COOKIE_SECURE"
] = False


# =========================================================
# CORS
#
# Frontend currently runs with Vite on 5173 / 5174.
# Credentials are required because Flask sessions use
# cookies.
# =========================================================

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://127.0.0.1:5173",
                "http://localhost:5173",
                "http://127.0.0.1:5174",
                "http://localhost:5174",
            ]
        }
    },
    supports_credentials=True,
)


# =========================================================
# DATABASE INITIALIZATION
#
# Each initialization step is isolated so one warning does
# not stop the remaining indexes or question-bank sync.
# =========================================================

def initialize_database():
    initialization_steps = [
        (
            "user indexes",
            create_user_indexes,
        ),
        (
            "question indexes",
            create_question_indexes,
        ),
        (
            "quiz attempt indexes",
            create_quiz_attempt_indexes,
        ),
        (
            "result indexes",
            create_result_indexes,
        ),
        (
            "question bank",
            seed_questions,
        ),
    ]

    for (
        label,
        initializer,
    ) in initialization_steps:

        try:
            initializer()

            print(
                f"Initialized {label}."
            )

        except Exception as error:
            print(
                f"MongoDB initialization warning "
                f"({label}):",
                error,
            )


initialize_database()


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
            "name":
                "NeuraQuiz API",
            "message":
                "Adaptive AI Quiz System backend is running",
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
            "status":
                "healthy",
            "service":
                "NeuraQuiz API",
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
        if result.get(
            "connected"
        )
        else 503
    )

    return jsonify(
        {
            "success":
                bool(
                    result.get(
                        "connected"
                    )
                ),
            **result,
        }
    ), status_code


# =========================================================
# 404
# =========================================================

@app.errorhandler(404)
def page_not_found(
    error,
):
    return jsonify(
        {
            "success": False,
            "message":
                "Route not found",
        }
    ), 404


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=
            Config.FLASK_PORT,
        debug=
            Config.DEBUG,
    )
