from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from database import check_database_connection


# =========================================================
# FLASK APPLICATION
# =========================================================

app = Flask(__name__)


# Load configuration
app.config.from_object(Config)


# =========================================================
# CORS
# =========================================================

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ]
        }
    },
    supports_credentials=True
)


# =========================================================
# HOME ROUTE
# =========================================================

@app.get("/")
def home():
    return jsonify(
        {
            "success": True,
            "project": "Adaptive AI Quiz System",
            "app": "NeuraQuiz",
            "message": "Backend server is running"
        }
    )


# =========================================================
# SERVER HEALTH CHECK
# =========================================================

@app.get("/api/health")
def health():
    return jsonify(
        {
            "success": True,
            "status": "healthy",
            "message": "NeuraQuiz API is running"
        }
    )


# =========================================================
# DATABASE TEST
# =========================================================

@app.get("/api/db-test")
def database_test():
    result = check_database_connection()

    status_code = (
        200
        if result["connected"]
        else 500
    )

    return jsonify(result), status_code


# =========================================================
# ERROR HANDLER - 404
# =========================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify(
        {
            "success": False,
            "message": "API route not found"
        }
    ), 404


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":
    print()
    print("=" * 50)
    print(" NeuraQuiz Backend")
    print("=" * 50)
    print(
        f" Server: http://127.0.0.1:{Config.FLASK_PORT}"
    )
    print(
        f" Health: http://127.0.0.1:{Config.FLASK_PORT}/api/health"
    )
    print(
        f" MongoDB: http://127.0.0.1:{Config.FLASK_PORT}/api/db-test"
    )
    print("=" * 50)
    print()

    app.run(
        host="127.0.0.1",
        port=Config.FLASK_PORT,
        debug=Config.DEBUG
    )