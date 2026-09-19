import hashlib

from datetime import (
    datetime,
    timezone,
)

from bson import ObjectId
from pymongo import ReturnDocument

from database import (
    certificates_collection,
    users_collection,
)


# =========================================================
# CONFIG
# =========================================================

CERTIFICATE_QUESTION_TARGET = 1000


# =========================================================
# HELPERS
# =========================================================

def safe_object_id(value):
    try:
        if isinstance(
            value,
            ObjectId,
        ):
            return value

        return ObjectId(
            str(value)
        )

    except Exception:
        return None


def serialize_datetime(value):
    if not value:
        return None

    try:
        return value.isoformat()

    except Exception:
        return str(
            value
        )


def build_certificate_id(
    user_id,
    subject,
):
    value = (
        f"{user_id}|"
        f"{subject.strip().lower()}"
    )

    digest = hashlib.sha256(
        value.encode(
            "utf-8"
        )
    ).hexdigest()[:12].upper()

    return f"NQ-{digest}"


def serialize_certificate(
    certificate,
):
    if not certificate:
        return None

    return {
        "id":
            str(
                certificate.get(
                    "_id",
                    "",
                )
            ),
        "certificateId":
            certificate.get(
                "certificateId",
                "",
            ),
        "studentName":
            certificate.get(
                "studentName",
                "Student",
            ),
        "subject":
            certificate.get(
                "subject",
                "",
            ),
        "completedQuestions":
            int(
                certificate.get(
                    "completedQuestions",
                    0,
                )
            ),
        "questionTarget":
            int(
                certificate.get(
                    "questionTarget",
                    CERTIFICATE_QUESTION_TARGET,
                )
            ),
        "issuedAt":
            serialize_datetime(
                certificate.get(
                    "issuedAt"
                )
            ),
        "status":
            certificate.get(
                "status",
                "Issued",
            ),
    }


# =========================================================
# INDEXES
# =========================================================

def create_certificate_indexes():
    certificates_collection.create_index(
        "certificateId",
        unique=True,
    )

    certificates_collection.create_index(
        [
            ("userId", 1),
            ("subject", 1),
        ],
        unique=True,
        name=
            "unique_user_subject_certificate",
    )

    certificates_collection.create_index(
        [
            ("userId", 1),
            ("issuedAt", -1),
        ]
    )


# =========================================================
# ISSUE SUBJECT CERTIFICATE
# =========================================================

def issue_subject_certificate(
    user_id,
    subject,
    completed_questions,
):
    object_user_id = safe_object_id(
        user_id
    )

    subject = str(
        subject or ""
    ).strip()

    try:
        completed_questions = int(
            completed_questions
        )

    except (
        TypeError,
        ValueError,
    ):
        completed_questions = 0

    if (
        not object_user_id or
        not subject or
        completed_questions <
        CERTIFICATE_QUESTION_TARGET
    ):
        return None

    user = users_collection.find_one(
        {
            "_id":
                object_user_id,
        },
        {
            "name": 1,
        },
    )

    if not user:
        return None

    now = datetime.now(
        timezone.utc
    )

    certificate_id = (
        build_certificate_id(
            object_user_id,
            subject,
        )
    )

    certificate = (
        certificates_collection
        .find_one_and_update(
            {
                "userId":
                    object_user_id,
                "subject":
                    subject,
            },
            {
                "$setOnInsert": {
                    "certificateId":
                        certificate_id,
                    "userId":
                        object_user_id,
                    "studentName":
                        str(
                            user.get(
                                "name",
                                "Student",
                            )
                        ).strip()
                        or "Student",
                    "subject":
                        subject,
                    "completedQuestions":
                        completed_questions,
                    "questionTarget":
                        CERTIFICATE_QUESTION_TARGET,
                    "status":
                        "Issued",
                    "issuedAt":
                        now,
                    "createdAt":
                        now,
                }
            },
            upsert=True,
            return_document=
                ReturnDocument.AFTER,
        )
    )

    return serialize_certificate(
        certificate
    )


# =========================================================
# GET USER CERTIFICATES
# =========================================================

def get_user_certificates(
    user_id,
):
    object_user_id = safe_object_id(
        user_id
    )

    if not object_user_id:
        return []

    cursor = (
        certificates_collection.find(
            {
                "userId":
                    object_user_id,
            }
        ).sort(
            "issuedAt",
            -1,
        )
    )

    return [
        serialize_certificate(
            certificate
        )
        for certificate in cursor
    ]
