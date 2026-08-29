import os
from dotenv import load_dotenv


# Load environment variables from .env
load_dotenv()


class Config:
    # Flask
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "neuraquiz-development-secret-key"
    )

    FLASK_PORT = int(
        os.getenv("FLASK_PORT", 5000)
    )

    DEBUG = (
        os.getenv(
            "FLASK_DEBUG",
            "True"
        ).lower()
        == "true"
    )

    # MongoDB
    MONGO_URI = os.getenv(
        "MONGO_URI",
        "mongodb://127.0.0.1:27017/"
    )

    MONGO_DB_NAME = os.getenv(
        "MONGO_DB_NAME",
        "adaptive_ai_quiz"
    )