from pymongo import MongoClient
from pymongo.errors import PyMongoError

from config import Config


# =========================================================
# MONGODB CLIENT
# =========================================================

client = MongoClient(
    Config.MONGO_URI,
    serverSelectionTimeoutMS=3000,
)


# =========================================================
# DATABASE
# =========================================================

db = client[
    Config.MONGO_DB_NAME
]


# =========================================================
# DATABASE CONNECTION CHECK
# =========================================================

def check_database_connection():
    try:
        client.admin.command(
            "ping"
        )

        return {
            "connected": True,
            "database":
                Config.MONGO_DB_NAME,
            "message":
                "MongoDB connected successfully",
        }

    except PyMongoError as error:
        return {
            "connected": False,
            "database":
                Config.MONGO_DB_NAME,
            "message":
                "MongoDB connection failed",
            "error":
                str(error),
        }


# =========================================================
# CORE COLLECTIONS
# =========================================================

users_collection = db[
    "users"
]

questions_collection = db[
    "questions"
]

quiz_results_collection = db[
    "quiz_results"
]

quiz_attempts_collection = db[
    "quiz_attempts"
]


# =========================================================
# QUESTION HISTORY
#
# Stores which questions each user has already received.
#
# This will help:
#
# - prevent repeated questions
# - prioritize unseen questions
# - track subject/topic exposure
# - support thousands of questions
# =========================================================

question_history_collection = db[
    "question_history"
]


# =========================================================
# QUESTION BANK METADATA
#
# Stores information about the question bank.
#
# Example:
#
# bankVersion
# subject counts
# total questions
# last sync time
#
# Useful when question bank grows to 5000+ questions.
# =========================================================

question_bank_meta_collection = db[
    "question_bank_meta"
]