from pathlib import Path
import json

SERVER_DIR = Path(__file__).resolve().parents[1]
QUESTIONS_DIR = SERVER_DIR / "data" / "questions"

ml_path = QUESTIONS_DIR / "machine_learning.json"
ds_path = QUESTIONS_DIR / "data_structures.json"

ml = json.loads(ml_path.read_text(encoding="utf-8"))
ds = json.loads(ds_path.read_text(encoding="utf-8"))

ml_replacements = {
    "Which learning type uses labeled training data?": {
        "subject": "Machine Learning",
        "topic": "Training",
        "difficulty": "Easy",
        "question": "What is an epoch in machine learning training?",
        "options": [
            "One complete pass through the training dataset",
            "One test prediction only",
            "One input feature",
            "One class label"
        ],
        "answer": "One complete pass through the training dataset"
    },
    "What is clustering used for?": {
        "subject": "Machine Learning",
        "topic": "Data Splitting",
        "difficulty": "Medium",
        "question": "What is a stratified train-test split designed to preserve?",
        "options": [
            "Approximately the same class proportions in each split",
            "Exactly the same rows in each split",
            "Only numeric features",
            "The original row order in every case"
        ],
        "answer": "Approximately the same class proportions in each split"
    },
}

ds_replacements = {
    "Which principle does a stack follow?": {
        "subject": "Data Structures",
        "topic": "Stacks",
        "difficulty": "Easy",
        "question": "What is stack underflow?",
        "options": [
            "Trying to remove or access an item from an empty stack",
            "Adding an item to a full fixed-size stack",
            "Sorting a stack",
            "Copying a stack"
        ],
        "answer": "Trying to remove or access an item from an empty stack"
    },
    "Which principle does a basic queue follow?": {
        "subject": "Data Structures",
        "topic": "Queues",
        "difficulty": "Easy",
        "question": "What is queue overflow in a fixed-size queue?",
        "options": [
            "Trying to insert when no storage position is available",
            "Removing the front element",
            "Reading the rear element",
            "Reversing the queue"
        ],
        "answer": "Trying to insert when no storage position is available"
    },
}

def patch(bank, replacements):
    changed = []
    for i, q in enumerate(bank):
        old_q = q.get("question")
        if old_q in replacements:
            bank[i] = replacements[old_q]
            changed.append(old_q)
    return changed

ml_changed = patch(ml, ml_replacements)
ds_changed = patch(ds, ds_replacements)

if len(ml_changed) != 2:
    raise SystemExit(
        f"Machine Learning patch expected 2 replacements, found {len(ml_changed)}: {ml_changed}"
    )

if len(ds_changed) != 2:
    raise SystemExit(
        f"Data Structures patch expected 2 replacements, found {len(ds_changed)}: {ds_changed}"
    )

ml_path.write_text(
    json.dumps(ml, indent=2, ensure_ascii=False),
    encoding="utf-8"
)

ds_path.write_text(
    json.dumps(ds, indent=2, ensure_ascii=False),
    encoding="utf-8"
)

print("PATCH SUCCESS")
print("Machine Learning replacements:", len(ml_changed))
print("Data Structures replacements:", len(ds_changed))
print("Now run verify_question_bank_v2.py")
