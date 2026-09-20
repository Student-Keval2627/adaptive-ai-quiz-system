from collections import Counter, defaultdict
from pathlib import Path
from unittest.mock import patch
import sys
import unittest

from bson import ObjectId


SERVER_DIR = Path(__file__).resolve().parents[1]
if str(SERVER_DIR) not in sys.path:
    sys.path.insert(0, str(SERVER_DIR))

from models import quiz_model  # noqa: E402


def question_document(question_id, text="Question"):
    return {
        "_id": question_id,
        "subject": "Python",
        "topic": "Basics",
        "difficulty": "Easy",
        "question": text,
        "options": ["A", "B", "C", "D"],
        "answer": "A",
        "bankVersion": quiz_model.QUESTION_BANK_VERSION,
    }


class QuestionBankTests(unittest.TestCase):
    def test_materialized_bank_matches_every_target(self):
        bank = quiz_model.build_complete_question_bank()
        counts = defaultdict(Counter)

        for question in bank:
            counts[question["subject"]][question["difficulty"]] += 1

        self.assertEqual(
            len(bank),
            len(quiz_model.PLANNED_SUBJECTS)
            * quiz_model.QUESTIONS_PER_SUBJECT,
        )

        for subject in quiz_model.PLANNED_SUBJECTS:
            self.assertEqual(
                dict(counts[subject]),
                quiz_model.DIFFICULTY_QUESTION_TARGETS,
            )


class RepeatPolicyTests(unittest.TestCase):
    def test_question_list_prefers_unseen_then_allows_only_wrong_repeats(self):
        current_id = ObjectId()
        wrong_id = ObjectId()
        mastered_id = ObjectId()
        unseen_id = ObjectId()
        observed_filters = []

        def fake_sample(match_filter, size):
            observed_filters.append(match_filter)
            if len(observed_filters) == 1:
                return [question_document(unseen_id, "Unseen")]
            return [question_document(wrong_id, "Retry wrong answer")]

        with (
            patch.object(
                quiz_model,
                "get_seen_question_ids",
                return_value=[wrong_id, mastered_id],
            ),
            patch.object(
                quiz_model,
                "get_mastered_question_ids",
                return_value=[mastered_id],
            ),
            patch.object(
                quiz_model,
                "sample_questions",
                side_effect=fake_sample,
            ),
        ):
            result = quiz_model.get_questions(
                subject="Python",
                limit=2,
                user_id=str(ObjectId()),
                exclude_ids=[str(current_id)],
            )

        self.assertEqual(len(result), 2)
        first_blocked = set(observed_filters[0]["_id"]["$nin"])
        retry_blocked = set(observed_filters[1]["_id"]["$nin"])

        self.assertIn(wrong_id, first_blocked)
        self.assertIn(mastered_id, first_blocked)
        self.assertIn(mastered_id, retry_blocked)
        self.assertIn(current_id, retry_blocked)
        self.assertNotIn(wrong_id, retry_blocked)

    def test_adaptive_fallback_never_repeats_mastered_question(self):
        current_id = ObjectId()
        wrong_id = ObjectId()
        mastered_id = ObjectId()
        calls = []

        def fake_select(**kwargs):
            calls.append(kwargs)
            if len(calls) == 1:
                return None
            return question_document(wrong_id, "Retry wrong answer")

        with (
            patch.object(
                quiz_model,
                "get_seen_question_ids",
                return_value=[wrong_id, mastered_id],
            ),
            patch.object(
                quiz_model,
                "get_mastered_question_ids",
                return_value=[mastered_id],
            ),
            patch.object(
                quiz_model,
                "select_adaptive_candidate",
                side_effect=fake_select,
            ),
        ):
            result = quiz_model.get_adaptive_question(
                subject="Python",
                difficulty="Easy",
                exclude_ids=[str(current_id)],
                user_id=str(ObjectId()),
            )

        first_blocked = set(calls[0]["blocked_ids"])
        retry_blocked = set(calls[1]["blocked_ids"])

        self.assertEqual(result["id"], str(wrong_id))
        self.assertIn(wrong_id, first_blocked)
        self.assertIn(mastered_id, first_blocked)
        self.assertIn(mastered_id, retry_blocked)
        self.assertIn(current_id, retry_blocked)
        self.assertNotIn(wrong_id, retry_blocked)


if __name__ == "__main__":
    unittest.main()
