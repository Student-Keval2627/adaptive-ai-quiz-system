from pymongo import MongoClient
from pymongo.errors import PyMongoError

from config import Config


# =========================================================
# MONGODB CLIENT
# =========================================================

client = MongoClient(
    Config.MONGO_URI,
    serverSelectionTimeoutMS=3000
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
        client.admin.command("ping")

        return {
            "connected": True,
            "database": Config.MONGO_DB_NAME,
            "message": "MongoDB connected successfully"
        }

    except PyMongoError as error:
        return {
            "connected": False,
            "database": Config.MONGO_DB_NAME,
            "message": "MongoDB connection failed",
            "error": str(error)
        }


# =========================================================
# COLLECTIONS
# =========================================================

users_collection = db["users"]

questions_collection = db["questions"]

quiz_results_collection = db["quiz_results"]