import hashlib
import json

from datetime import (
    datetime,
    timezone,
)

from pathlib import Path

from bson import ObjectId
from pymongo import UpdateOne

from database import (
    question_bank_meta_collection,
    question_history_collection,
    questions_collection,
)


# =========================================================
# QUESTION BANK CONFIG
# =========================================================

QUESTION_BANK_VERSION = 3

QUESTION_DATA_DIR = (
    Path(__file__)
    .resolve()
    .parent
    .parent
    / "data"
    / "questions"
)

VALID_DIFFICULTIES = [
    "Easy",
    "Medium",
    "Hard",
]

PLANNED_SUBJECTS = [
    "Python",
    "C Programming",
    "C++",
    "Java",
    "JavaScript",
    "TypeScript",
    "Data Structures",
    "Algorithms",
    "SQL",
    "DBMS",
    "Operating Systems",
    "Computer Networks",
    "Object Oriented Programming",
    "Machine Learning",
    "Web Development",
    "React",
    "Node.js",
    "Flask",
    "Django",
    "Git & GitHub",
    "Software Engineering",
    "Computer Architecture",
]


# =========================================================
# DEFAULT QUESTIONS
# 21 Python
# 21 Machine Learning
# 21 Data Structures
# Total = 63
#
# These remain as the built-in starter bank.
# External JSON files can add thousands more.
# =========================================================

DEFAULT_QUESTIONS = [

    # =====================================================
    # PYTHON - EASY
    # =====================================================

    {
        "subject": "Python",
        "topic": "Basics",
        "difficulty": "Easy",
        "question":
            "Which keyword is used to define a function in Python?",
        "options": [
            "func",
            "define",
            "def",
            "function",
        ],
        "answer": "def",
    },

    {
        "subject": "Python",
        "topic": "Data Types",
        "difficulty": "Easy",
        "question":
            "Which Python data type stores True or False values?",
        "options": [
            "str",
            "bool",
            "float",
            "list",
        ],
        "answer": "bool",
    },

    {
        "subject": "Python",
        "topic": "Collections",
        "difficulty": "Easy",
        "question":
            "Which collection uses key-value pairs in Python?",
        "options": [
            "List",
            "Tuple",
            "Dictionary",
            "Set",
        ],
        "answer": "Dictionary",
    },

    {
        "subject": "Python",
        "topic": "Loops",
        "difficulty": "Easy",
        "question":
            "Which keyword is commonly used to repeat over items in a Python sequence?",
        "options": [
            "for",
            "repeat",
            "loop",
            "iterate",
        ],
        "answer": "for",
    },

    {
        "subject": "Python",
        "topic": "Operators",
        "difficulty": "Easy",
        "question":
            "Which operator checks whether two Python values are equal?",
        "options": [
            "=",
            "==",
            "!=",
            ":=",
        ],
        "answer": "==",
    },

    {
        "subject": "Python",
        "topic": "Strings",
        "difficulty": "Easy",
        "question":
            "Which built-in function returns the length of a Python string?",
        "options": [
            "size()",
            "count()",
            "len()",
            "length()",
        ],
        "answer": "len()",
    },

    {
        "subject": "Python",
        "topic": "Input Output",
        "difficulty": "Easy",
        "question":
            "Which built-in function displays output in Python?",
        "options": [
            "show()",
            "display()",
            "print()",
            "write()",
        ],
        "answer": "print()",
    },

    # =====================================================
    # PYTHON - MEDIUM
    # =====================================================

    {
        "subject": "Python",
        "topic": "Functions",
        "difficulty": "Medium",
        "question":
            "What does the return statement do inside a Python function?",
        "options": [
            "Stops Python completely",
            "Sends a value back to the caller",
            "Creates a loop",
            "Imports a module",
        ],
        "answer":
            "Sends a value back to the caller",
    },

    {
        "subject": "Python",
        "topic": "OOP",
        "difficulty": "Medium",
        "question":
            "Which method is commonly used as a constructor in Python classes?",
        "options": [
            "__start__",
            "__init__",
            "__create__",
            "__main__",
        ],
        "answer": "__init__",
    },

    {
        "subject": "Python",
        "topic": "Collections",
        "difficulty": "Medium",
        "question":
            "Which Python collection is ordered, mutable, and allows duplicate values?",
        "options": [
            "List",
            "Set",
            "Frozen set",
            "Tuple only",
        ],
        "answer": "List",
    },

    {
        "subject": "Python",
        "topic": "Dictionaries",
        "difficulty": "Medium",
        "question":
            "Which dictionary method safely returns a value for a key and can provide a default value?",
        "options": [
            "get()",
            "append()",
            "push()",
            "index()",
        ],
        "answer": "get()",
    },

    {
        "subject": "Python",
        "topic": "Exceptions",
        "difficulty": "Medium",
        "question":
            "Which block is used to handle an exception in Python?",
        "options": [
            "catch",
            "except",
            "error",
            "handle",
        ],
        "answer": "except",
    },

    {
        "subject": "Python",
        "topic": "Modules",
        "difficulty": "Medium",
        "question":
            "Which keyword loads a module into a Python program?",
        "options": [
            "include",
            "require",
            "import",
            "using",
        ],
        "answer": "import",
    },

    {
        "subject": "Python",
        "topic": "Comprehensions",
        "difficulty": "Medium",
        "question":
            "What is a list comprehension primarily used for?",
        "options": [
            "Creating lists using a compact expression",
            "Creating database tables",
            "Defining classes only",
            "Handling network errors",
        ],
        "answer":
            "Creating lists using a compact expression",
    },

    # =====================================================
    # PYTHON - HARD
    # =====================================================

    {
        "subject": "Python",
        "topic": "Functions",
        "difficulty": "Hard",
        "question":
            "What is a lambda function in Python?",
        "options": [
            "A named class",
            "An anonymous function",
            "A database function",
            "A loop",
        ],
        "answer":
            "An anonymous function",
    },

    {
        "subject": "Python",
        "topic": "OOP",
        "difficulty": "Hard",
        "question":
            "Which concept allows a child class to use properties and methods of a parent class?",
        "options": [
            "Encapsulation",
            "Inheritance",
            "Iteration",
            "Compilation",
        ],
        "answer":
            "Inheritance",
    },

    {
        "subject": "Python",
        "topic": "Exceptions",
        "difficulty": "Hard",
        "question":
            "Which block executes whether an exception occurs or not?",
        "options": [
            "except",
            "finally",
            "raise",
            "error",
        ],
        "answer": "finally",
    },

    {
        "subject": "Python",
        "topic": "Generators",
        "difficulty": "Hard",
        "question":
            "Which keyword is used by a Python generator to produce values one at a time?",
        "options": [
            "send",
            "return",
            "yield",
            "generate",
        ],
        "answer": "yield",
    },

    {
        "subject": "Python",
        "topic": "Decorators",
        "difficulty": "Hard",
        "question":
            "What does a Python decorator commonly do?",
        "options": [
            "Modifies or extends behavior of another function or class",
            "Deletes every variable",
            "Creates a database automatically",
            "Converts Python into HTML",
        ],
        "answer":
            "Modifies or extends behavior of another function or class",
    },

    {
        "subject": "Python",
        "topic": "Iterators",
        "difficulty": "Hard",
        "question":
            "Which special method is called to obtain the next value from a Python iterator?",
        "options": [
            "__next__()",
            "__value__()",
            "__step__()",
            "__move__()",
        ],
        "answer": "__next__()",
    },

    {
        "subject": "Python",
        "topic": "Scope",
        "difficulty": "Hard",
        "question":
            "Which keyword allows a function to assign to a variable in the nearest enclosing non-global scope?",
        "options": [
            "global",
            "nonlocal",
            "outer",
            "scope",
        ],
        "answer": "nonlocal",
    },

    # =====================================================
    # MACHINE LEARNING - EASY
    # =====================================================

    {
        "subject": "Machine Learning",
        "topic": "Fundamentals",
        "difficulty": "Easy",
        "question":
            "Machine learning is primarily used to allow computers to learn patterns from what?",
        "options": [
            "Data",
            "Keyboard",
            "Monitor",
            "HTML",
        ],
        "answer": "Data",
    },

    {
        "subject": "Machine Learning",
        "topic": "Learning Types",
        "difficulty": "Easy",
        "question":
            "Which learning type uses labeled training data?",
        "options": [
            "Supervised Learning",
            "Unsupervised Learning",
            "Random Learning",
            "Manual Learning",
        ],
        "answer":
            "Supervised Learning",
    },

    {
        "subject": "Machine Learning",
        "topic": "Learning Types",
        "difficulty": "Easy",
        "question":
            "Which learning type discovers patterns without labeled outputs?",
        "options": [
            "Supervised Learning",
            "Unsupervised Learning",
            "Static Learning",
            "Compiled Learning",
        ],
        "answer":
            "Unsupervised Learning",
    },

    {
        "subject": "Machine Learning",
        "topic": "Datasets",
        "difficulty": "Easy",
        "question":
            "What is training data used for?",
        "options": [
            "Teaching a model patterns",
            "Designing a webpage",
            "Charging a computer",
            "Creating folders",
        ],
        "answer":
            "Teaching a model patterns",
    },

    {
        "subject": "Machine Learning",
        "topic": "Classification",
        "difficulty": "Easy",
        "question":
            "Which task can predict whether an email is spam or not spam?",
        "options": [
            "Classification",
            "Regression",
            "Sorting",
            "Compression",
        ],
        "answer": "Classification",
    },

    {
        "subject": "Machine Learning",
        "topic": "Regression",
        "difficulty": "Easy",
        "question":
            "Which task is suitable for predicting a house price?",
        "options": [
            "Regression",
            "Classification",
            "Clustering only",
            "Encryption",
        ],
        "answer": "Regression",
    },

    {
        "subject": "Machine Learning",
        "topic": "Features",
        "difficulty": "Easy",
        "question":
            "What is a feature in a machine learning dataset?",
        "options": [
            "An input variable used by a model",
            "A monitor setting",
            "A password",
            "A file extension",
        ],
        "answer":
            "An input variable used by a model",
    },

    # =====================================================
    # MACHINE LEARNING - MEDIUM
    # =====================================================

    {
        "subject": "Machine Learning",
        "topic": "Regression",
        "difficulty": "Medium",
        "question":
            "Which ML task is commonly used to predict a continuous numerical value?",
        "options": [
            "Regression",
            "Classification",
            "Clustering",
            "Sorting",
        ],
        "answer": "Regression",
    },

    {
        "subject": "Machine Learning",
        "topic": "Classification",
        "difficulty": "Medium",
        "question":
            "Which task predicts categories such as spam or not spam?",
        "options": [
            "Regression",
            "Classification",
            "Compression",
            "Rendering",
        ],
        "answer": "Classification",
    },

    {
        "subject": "Machine Learning",
        "topic": "Model Evaluation",
        "difficulty": "Medium",
        "question":
            "Why is a test dataset used in machine learning?",
        "options": [
            "To evaluate the trained model on unseen data",
            "To increase screen brightness",
            "To store passwords",
            "To write HTML",
        ],
        "answer":
            "To evaluate the trained model on unseen data",
    },

    {
        "subject": "Machine Learning",
        "topic": "Clustering",
        "difficulty": "Medium",
        "question":
            "What is clustering used for?",
        "options": [
            "Grouping similar unlabeled data points",
            "Predicting only continuous values",
            "Compiling Python",
            "Encrypting files",
        ],
        "answer":
            "Grouping similar unlabeled data points",
    },

    {
        "subject": "Machine Learning",
        "topic": "Preprocessing",
        "difficulty": "Medium",
        "question":
            "Why are missing values often handled before model training?",
        "options": [
            "They can affect model training and calculations",
            "They always improve accuracy",
            "They convert labels into images",
            "They automatically create features",
        ],
        "answer":
            "They can affect model training and calculations",
    },

    {
        "subject": "Machine Learning",
        "topic": "Model Evaluation",
        "difficulty": "Medium",
        "question":
            "What does accuracy measure in a classification problem?",
        "options": [
            "The proportion of predictions that are correct",
            "The number of features",
            "The training time only",
            "The size of the source code",
        ],
        "answer":
            "The proportion of predictions that are correct",
    },

    {
        "subject": "Machine Learning",
        "topic": "Validation",
        "difficulty": "Medium",
        "question":
            "What is cross-validation mainly used for?",
        "options": [
            "Estimating model performance across multiple data splits",
            "Creating a database",
            "Deleting labels",
            "Increasing monitor resolution",
        ],
        "answer":
            "Estimating model performance across multiple data splits",
    },

    # =====================================================
    # MACHINE LEARNING - HARD
    # =====================================================

    {
        "subject": "Machine Learning",
        "topic": "Overfitting",
        "difficulty": "Hard",
        "question":
            "What happens when a model performs very well on training data but poorly on unseen data?",
        "options": [
            "Underflow",
            "Overfitting",
            "Compilation",
            "Normalization",
        ],
        "answer": "Overfitting",
    },

    {
        "subject": "Machine Learning",
        "topic": "Optimization",
        "difficulty": "Hard",
        "question":
            "What is the main purpose of gradient descent?",
        "options": [
            "Minimize a loss function",
            "Create HTML",
            "Increase dataset size automatically",
            "Encrypt the model",
        ],
        "answer":
            "Minimize a loss function",
    },

    {
        "subject": "Machine Learning",
        "topic": "Feature Engineering",
        "difficulty": "Hard",
        "question":
            "Why is feature scaling useful for many machine learning algorithms?",
        "options": [
            "It brings features to comparable numerical ranges",
            "It deletes every feature",
            "It converts all data into text",
            "It guarantees 100% accuracy",
        ],
        "answer":
            "It brings features to comparable numerical ranges",
    },

    {
        "subject": "Machine Learning",
        "topic": "Model Evaluation",
        "difficulty": "Hard",
        "question":
            "Which metric is the harmonic mean of precision and recall?",
        "options": [
            "Accuracy",
            "F1 Score",
            "R-squared",
            "MAE",
        ],
        "answer": "F1 Score",
    },

    {
        "subject": "Machine Learning",
        "topic": "Regularization",
        "difficulty": "Hard",
        "question":
            "What is a major purpose of regularization in machine learning?",
        "options": [
            "Reduce overfitting by penalizing model complexity",
            "Increase every feature value",
            "Remove the target variable",
            "Guarantee perfect predictions",
        ],
        "answer":
            "Reduce overfitting by penalizing model complexity",
    },

    {
        "subject": "Machine Learning",
        "topic": "Bias Variance",
        "difficulty": "Hard",
        "question":
            "A model that is too simple and consistently misses important patterns usually has what problem?",
        "options": [
            "High bias",
            "High variance only",
            "Perfect generalization",
            "Data encryption",
        ],
        "answer": "High bias",
    },

    {
        "subject": "Machine Learning",
        "topic": "Classification",
        "difficulty": "Hard",
        "question":
            "What does precision measure in binary classification?",
        "options": [
            "The fraction of predicted positives that are actually positive",
            "The fraction of all samples that are negative",
            "The number of model features",
            "The average training time",
        ],
        "answer":
            "The fraction of predicted positives that are actually positive",
    },

    # =====================================================
    # DATA STRUCTURES - EASY
    # =====================================================

    {
        "subject": "Data Structures",
        "topic": "Arrays",
        "difficulty": "Easy",
        "question":
            "Which data structure stores elements in contiguous memory locations?",
        "options": [
            "Array",
            "Graph",
            "Tree",
            "Queue",
        ],
        "answer": "Array",
    },

    {
        "subject": "Data Structures",
        "topic": "Stacks",
        "difficulty": "Easy",
        "question":
            "Which principle does a stack follow?",
        "options": [
            "FIFO",
            "LIFO",
            "Random",
            "Priority only",
        ],
        "answer": "LIFO",
    },

    {
        "subject": "Data Structures",
        "topic": "Queues",
        "difficulty": "Easy",
        "question":
            "Which principle does a basic queue follow?",
        "options": [
            "LIFO",
            "FIFO",
            "Recursive",
            "Random",
        ],
        "answer": "FIFO",
    },

    {
        "subject": "Data Structures",
        "topic": "Linked Lists",
        "difficulty": "Easy",
        "question":
            "What connects nodes together in a linked list?",
        "options": [
            "References or pointers",
            "SQL tables",
            "CSS rules",
            "Passwords",
        ],
        "answer":
            "References or pointers",
    },

    {
        "subject": "Data Structures",
        "topic": "Trees",
        "difficulty": "Easy",
        "question":
            "What is a node with no children commonly called in a tree?",
        "options": [
            "Leaf",
            "Root",
            "Edge",
            "Queue",
        ],
        "answer": "Leaf",
    },

    {
        "subject": "Data Structures",
        "topic": "Graphs",
        "difficulty": "Easy",
        "question":
            "What are the main components of a graph?",
        "options": [
            "Vertices and edges",
            "Rows and columns only",
            "Keys and passwords",
            "Loops and functions only",
        ],
        "answer":
            "Vertices and edges",
    },

    {
        "subject": "Data Structures",
        "topic": "Searching",
        "difficulty": "Easy",
        "question":
            "Which search checks elements one by one until the target is found?",
        "options": [
            "Linear Search",
            "Binary Search",
            "Depth First Search",
            "Hashing",
        ],
        "answer":
            "Linear Search",
    },

    # =====================================================
    # DATA STRUCTURES - MEDIUM
    # =====================================================

    {
        "subject": "Data Structures",
        "topic": "Linked Lists",
        "difficulty": "Medium",
        "question":
            "What does a node in a singly linked list normally contain?",
        "options": [
            "Data and a pointer to the next node",
            "Only a database",
            "A complete tree",
            "Only an index",
        ],
        "answer":
            "Data and a pointer to the next node",
    },

    {
        "subject": "Data Structures",
        "topic": "Trees",
        "difficulty": "Medium",
        "question":
            "What is the topmost node of a tree called?",
        "options": [
            "Leaf",
            "Root",
            "Edge",
            "Queue",
        ],
        "answer": "Root",
    },

    {
        "subject": "Data Structures",
        "topic": "Searching",
        "difficulty": "Medium",
        "question":
            "Binary search requires the data to normally be in what state?",
        "options": [
            "Sorted",
            "Encrypted",
            "Random only",
            "Duplicated",
        ],
        "answer": "Sorted",
    },

    {
        "subject": "Data Structures",
        "topic": "Queues",
        "difficulty": "Medium",
        "question":
            "Which queue operation adds an element to the rear?",
        "options": [
            "Enqueue",
            "Dequeue",
            "Pop",
            "Peek",
        ],
        "answer": "Enqueue",
    },

    {
        "subject": "Data Structures",
        "topic": "Stacks",
        "difficulty": "Medium",
        "question":
            "Which stack operation returns the top element without removing it?",
        "options": [
            "Peek",
            "Pop",
            "Push",
            "Delete",
        ],
        "answer": "Peek",
    },

    {
        "subject": "Data Structures",
        "topic": "Hashing",
        "difficulty": "Medium",
        "question":
            "What is the purpose of a hash function in a hash table?",
        "options": [
            "Map a key to an index or bucket",
            "Sort every value alphabetically",
            "Create tree nodes",
            "Reverse a queue",
        ],
        "answer":
            "Map a key to an index or bucket",
    },

    {
        "subject": "Data Structures",
        "topic": "Sorting",
        "difficulty": "Medium",
        "question":
            "Which sorting algorithm repeatedly compares adjacent elements and swaps them when they are in the wrong order?",
        "options": [
            "Bubble Sort",
            "Binary Search",
            "DFS",
            "Hashing",
        ],
        "answer": "Bubble Sort",
    },

    # =====================================================
    # DATA STRUCTURES - HARD
    # =====================================================

    {
        "subject": "Data Structures",
        "topic": "Trees",
        "difficulty": "Hard",
        "question":
            "What is the maximum number of children a node can have in a binary tree?",
        "options": [
            "1",
            "2",
            "3",
            "Unlimited",
        ],
        "answer": "2",
    },

    {
        "subject": "Data Structures",
        "topic": "Graphs",
        "difficulty": "Hard",
        "question":
            "Which traversal commonly uses a queue to explore graph vertices level by level?",
        "options": [
            "DFS",
            "BFS",
            "Binary Search",
            "Selection Sort",
        ],
        "answer": "BFS",
    },

    {
        "subject": "Data Structures",
        "topic": "Complexity",
        "difficulty": "Hard",
        "question":
            "What is the average time complexity of binary search?",
        "options": [
            "O(n)",
            "O(log n)",
            "O(n²)",
            "O(1)",
        ],
        "answer": "O(log n)",
    },

    {
        "subject": "Data Structures",
        "topic": "Stacks",
        "difficulty": "Hard",
        "question":
            "Which operation removes the top element from a stack?",
        "options": [
            "Push",
            "Pop",
            "Peek",
            "Insert",
        ],
        "answer": "Pop",
    },

    {
        "subject": "Data Structures",
        "topic": "Graphs",
        "difficulty": "Hard",
        "question":
            "Which traversal commonly uses a stack or recursion to explore a graph deeply before backtracking?",
        "options": [
            "DFS",
            "BFS",
            "Linear Search",
            "Bubble Sort",
        ],
        "answer": "DFS",
    },

    {
        "subject": "Data Structures",
        "topic": "Complexity",
        "difficulty": "Hard",
        "question":
            "What is the worst-case time complexity of linear search over n elements?",
        "options": [
            "O(1)",
            "O(log n)",
            "O(n)",
            "O(n²)",
        ],
        "answer": "O(n)",
    },

    {
        "subject": "Data Structures",
        "topic": "Hashing",
        "difficulty": "Hard",
        "question":
            "What is a collision in a hash table?",
        "options": [
            "Two different keys map to the same bucket or index",
            "A stack becomes empty",
            "A tree has no root",
            "A queue follows LIFO",
        ],
        "answer":
            "Two different keys map to the same bucket or index",
    },
]


# =========================================================
# SAFE OBJECT ID
# =========================================================

def safe_object_id(value):
    try:
        if isinstance(value, ObjectId):
            return value

        return ObjectId(
            str(value)
        )

    except Exception:
        return None


# =========================================================
# NORMALIZE QUESTION
# =========================================================

def normalize_question(question):
    if not isinstance(
        question,
        dict,
    ):
        return None

    subject = str(
        question.get(
            "subject",
            "",
        )
    ).strip()

    topic = str(
        question.get(
            "topic",
            "General",
        )
    ).strip()

    difficulty = str(
        question.get(
            "difficulty",
            "Medium",
        )
    ).strip()

    question_text = str(
        question.get(
            "question",
            "",
        )
    ).strip()

    answer = str(
        question.get(
            "answer",
            "",
        )
    ).strip()

    raw_options = question.get(
        "options",
        [],
    )

    if not subject:
        return None

    if not topic:
        topic = "General"

    if (
        difficulty not in
        VALID_DIFFICULTIES
    ):
        return None

    if not question_text:
        return None

    if not isinstance(
        raw_options,
        list,
    ):
        return None

    options = []

    for option in raw_options:
        cleaned_option = str(
            option
        ).strip()

        if (
            cleaned_option and
            cleaned_option not in
            options
        ):
            options.append(
                cleaned_option
            )

    if len(options) < 2:
        return None

    if (
        not answer or
        answer not in options
    ):
        return None

    return {
        "subject":
            subject,
        "topic":
            topic,
        "difficulty":
            difficulty,
        "question":
            question_text,
        "options":
            options,
        "answer":
            answer,
    }


# =========================================================
# QUESTION BANK KEY
# =========================================================

def build_question_bank_key(
    subject,
    question,
):
    value = (
        f"{subject.strip().lower()}|"
        f"{question.strip().lower()}"
    )

    return hashlib.sha256(
        value.encode(
            "utf-8"
        )
    ).hexdigest()


# =========================================================
# LOAD EXTERNAL JSON QUESTIONS
# =========================================================

def load_external_questions():
    if not QUESTION_DATA_DIR.exists():
        return []

    loaded_questions = []

    json_files = sorted(
        QUESTION_DATA_DIR.rglob(
            "*.json"
        )
    )

    for file_path in json_files:
        try:
            with file_path.open(
                "r",
                encoding="utf-8",
            ) as file:
                content = json.load(
                    file
                )

        except Exception as error:
            print(
                "Question bank file warning:",
                file_path.name,
                error,
            )
            continue

        if isinstance(
            content,
            dict,
        ):
            content = content.get(
                "questions",
                [],
            )

        if not isinstance(
            content,
            list,
        ):
            print(
                "Question bank warning:",
                file_path.name,
                "must contain a list of questions.",
            )
            continue

        for raw_question in content:
            question = normalize_question(
                raw_question
            )

            if question:
                loaded_questions.append(
                    question
                )

    return loaded_questions


# =========================================================
# BUILD COMPLETE QUESTION BANK
# =========================================================

def build_complete_question_bank():
    question_map = {}

    for raw_question in DEFAULT_QUESTIONS:
        question = normalize_question(
            raw_question
        )

        if not question:
            continue

        key = (
            question[
                "subject"
            ].lower(),
            question[
                "question"
            ].lower(),
        )

        question_map[key] = question

    for question in load_external_questions():
        key = (
            question[
                "subject"
            ].lower(),
            question[
                "question"
            ].lower(),
        )

        # External JSON can replace the
        # built-in version of the same question.
        question_map[key] = question

    return list(
        question_map.values()
    )


# =========================================================
# INDEXES
# =========================================================

def create_question_indexes():

    # -----------------------------------------------------
    # QUESTIONS
    # -----------------------------------------------------

    questions_collection.create_index(
        "subject"
    )

    questions_collection.create_index(
        "difficulty"
    )

    questions_collection.create_index(
        "topic"
    )

    questions_collection.create_index(
        "bankKey"
    )

    questions_collection.create_index(
        [
            ("subject", 1),
            ("difficulty", 1),
        ]
    )

    questions_collection.create_index(
        [
            ("subject", 1),
            ("topic", 1),
            ("difficulty", 1),
        ]
    )

    questions_collection.create_index(
        [
            ("subject", 1),
            ("question", 1),
        ]
    )

    # -----------------------------------------------------
    # QUESTION HISTORY
    # -----------------------------------------------------

    question_history_collection.create_index(
        "userId"
    )

    question_history_collection.create_index(
        "questionId"
    )

    question_history_collection.create_index(
        [
            ("userId", 1),
            ("questionId", 1),
        ],
        unique=True,
        name=
            "unique_user_question_history",
    )

    question_history_collection.create_index(
        [
            ("userId", 1),
            ("subject", 1),
            ("lastSeenAt", -1),
        ]
    )


# =========================================================
# SAFE QUESTION BANK SYNC
# =========================================================

def sync_question_bank():
    question_bank = (
        build_complete_question_bank()
    )

    operations = []

    for question in question_bank:
        bank_key = (
            build_question_bank_key(
                question[
                    "subject"
                ],
                question[
                    "question"
                ],
            )
        )

        document = {
            **question,
            "bankKey":
                bank_key,
            "bankVersion":
                QUESTION_BANK_VERSION,
        }

        operations.append(
            UpdateOne(
                {
                    "subject":
                        question[
                            "subject"
                        ],
                    "question":
                        question[
                            "question"
                        ],
                },
                {
                    "$set":
                        document,
                },
                upsert=True,
            )
        )

    inserted_count = 0
    updated_count = 0

    if operations:
        result = (
            questions_collection
            .bulk_write(
                operations,
                ordered=False,
            )
        )

        inserted_count = (
            result.upserted_count
        )

        updated_count = (
            result.modified_count
        )

    total_count = (
        questions_collection
        .count_documents(
            {}
        )
    )

    subject_pipeline = [
        {
            "$group": {
                "_id":
                    "$subject",
                "count": {
                    "$sum": 1
                },
            }
        },
        {
            "$sort": {
                "_id": 1
            }
        },
    ]

    subject_counts = {}

    for item in (
        questions_collection.aggregate(
            subject_pipeline
        )
    ):
        subject_name = item.get(
            "_id"
        )

        if subject_name:
            subject_counts[
                subject_name
            ] = item.get(
                "count",
                0,
            )

    now = datetime.now(
        timezone.utc
    )

    question_bank_meta_collection.update_one(
        {
            "_id":
                "main_question_bank",
        },
        {
            "$set": {
                "bankVersion":
                    QUESTION_BANK_VERSION,
                "totalQuestions":
                    total_count,
                "subjects":
                    subject_counts,
                "sourceQuestionCount":
                    len(
                        question_bank
                    ),
                "lastSyncedAt":
                    now,
            }
        },
        upsert=True,
    )

    print(
        "Question bank synced:"
        f" {inserted_count} inserted,"
        f" {updated_count} updated,"
        f" {total_count} total."
    )

    return {
        "inserted":
            inserted_count,
        "updated":
            updated_count,
        "total":
            total_count,
        "subjects":
            subject_counts,
    }


# =========================================================
# BACKWARD COMPATIBILITY
# =========================================================

def seed_questions():
    return sync_question_bank()


# =========================================================
# AVAILABLE SUBJECTS
# =========================================================

def get_available_subjects():
    subjects = (
        questions_collection
        .distinct(
            "subject"
        )
    )

    return sorted(
        [
            str(subject)
            for subject
            in subjects
            if subject
        ]
    )


# =========================================================
# SUBJECT QUESTION COUNTS
# =========================================================

def get_subject_question_counts():
    pipeline = [
        {
            "$group": {
                "_id":
                    "$subject",
                "count": {
                    "$sum": 1
                },
            }
        },
        {
            "$sort": {
                "_id": 1
            }
        },
    ]

    return {
        item["_id"]:
            item["count"]
        for item in
        questions_collection.aggregate(
            pipeline
        )
        if item.get(
            "_id"
        )
    }


# =========================================================
# SERIALIZE PUBLIC QUESTION
# NEVER RETURN THE ANSWER
# =========================================================

def serialize_question(question):
    if not question:
        return None

    return {
        "id":
            str(
                question["_id"]
            ),
        "subject":
            question.get(
                "subject",
                "",
            ),
        "topic":
            question.get(
                "topic",
                "",
            ),
        "difficulty":
            question.get(
                "difficulty",
                "Medium",
            ),
        "question":
            question.get(
                "question",
                "",
            ),
        "options":
            question.get(
                "options",
                [],
            ),
    }


# =========================================================
# FIND RAW QUESTION
# =========================================================

def find_question_by_id(
    question_id,
):
    object_id = safe_object_id(
        question_id
    )

    if not object_id:
        return None

    return (
        questions_collection.find_one(
            {
                "_id":
                    object_id
            }
        )
    )


# =========================================================
# NORMALIZE QUESTION IDS
# =========================================================

def normalize_question_ids(
    question_ids,
):
    if not isinstance(
        question_ids,
        list,
    ):
        return []

    object_ids = []
    seen = set()

    for question_id in question_ids:
        object_id = safe_object_id(
            question_id
        )

        if not object_id:
            continue

        string_id = str(
            object_id
        )

        if string_id in seen:
            continue

        seen.add(
            string_id
        )

        object_ids.append(
            object_id
        )

    return object_ids


# =========================================================
# USER QUESTION HISTORY
# =========================================================

def get_seen_question_ids(
    user_id,
    subject=None,
):
    object_user_id = safe_object_id(
        user_id
    )

    if not object_user_id:
        return []

    query = {
        "userId":
            object_user_id,
    }

    if subject:
        query[
            "subject"
        ] = subject

    cursor = (
        question_history_collection
        .find(
            query,
            {
                "questionId": 1
            },
        )
    )

    question_ids = []

    for item in cursor:
        question_id = safe_object_id(
            item.get(
                "questionId"
            )
        )

        if question_id:
            question_ids.append(
                question_id
            )

    return question_ids


# =========================================================
# RECORD SERVED QUESTION
# =========================================================

def record_question_seen(
    user_id,
    question_id,
):
    object_user_id = safe_object_id(
        user_id
    )

    object_question_id = safe_object_id(
        question_id
    )

    if (
        not object_user_id or
        not object_question_id
    ):
        return {
            "success": False,
            "message":
                "Invalid user or question ID",
        }

    question = (
        questions_collection.find_one(
            {
                "_id":
                    object_question_id
            }
        )
    )

    if not question:
        return {
            "success": False,
            "message":
                "Question not found",
        }

    now = datetime.now(
        timezone.utc
    )

    question_history_collection.update_one(
        {
            "userId":
                object_user_id,
            "questionId":
                object_question_id,
        },
        {
            "$set": {
                "subject":
                    question.get(
                        "subject",
                        "",
                    ),
                "topic":
                    question.get(
                        "topic",
                        "General",
                    ),
                "difficulty":
                    question.get(
                        "difficulty",
                        "Medium",
                    ),
                "lastSeenAt":
                    now,
            },
            "$setOnInsert": {
                "firstSeenAt":
                    now,
            },
            "$inc": {
                "timesSeen": 1,
            },
        },
        upsert=True,
    )

    return {
        "success": True,
    }


# =========================================================
# RANDOM SAMPLE
# =========================================================

def sample_questions(
    match_filter,
    size,
):
    if size <= 0:
        return []

    pipeline = [
        {
            "$match":
                match_filter
        },
        {
            "$sample": {
                "size":
                    size
            }
        },
    ]

    return list(
        questions_collection.aggregate(
            pipeline
        )
    )


# =========================================================
# RANDOM QUESTION LIST
# =========================================================

def get_questions(
    subject,
    limit=5,
    user_id=None,
    exclude_ids=None,
):
    try:
        limit = int(
            limit
        )

    except (
        TypeError,
        ValueError,
    ):
        limit = 5

    limit = max(
        1,
        min(
            limit,
            20,
        ),
    )

    excluded_ids = (
        normalize_question_ids(
            exclude_ids or []
        )
    )

    seen_ids = []

    if user_id:
        seen_ids = (
            get_seen_question_ids(
                user_id=user_id,
                subject=subject,
            )
        )

    blocked_ids = {
        str(question_id):
            question_id
        for question_id in (
            excluded_ids +
            seen_ids
        )
    }

    unseen_filter = {
        "subject":
            subject,
        "_id": {
            "$nin":
                list(
                    blocked_ids.values()
                )
        },
    }

    selected = (
        sample_questions(
            unseen_filter,
            limit,
        )
    )

    if len(selected) < limit:
        selected_ids = [
            question["_id"]
            for question
            in selected
        ]

        fallback_blocked = (
            excluded_ids +
            selected_ids
        )

        fallback_filter = {
            "subject":
                subject,
            "_id": {
                "$nin":
                    fallback_blocked
            },
        }

        remaining = (
            limit -
            len(selected)
        )

        selected.extend(
            sample_questions(
                fallback_filter,
                remaining,
            )
        )

    return [
        serialize_question(
            question
        )
        for question
        in selected
    ]


# =========================================================
# CHECK ANSWER
# =========================================================

def check_question_answer(
    question_id,
    selected_answer,
):
    question = (
        find_question_by_id(
            question_id
        )
    )

    if not question:
        return None

    correct_answer = (
        question.get(
            "answer"
        )
    )

    return {
        "correct":
            selected_answer ==
            correct_answer,
        "correctAnswer":
            correct_answer,
        "subject":
            question.get(
                "subject",
                "",
            ),
        "topic":
            question.get(
                "topic",
                "",
            ),
        "difficulty":
            question.get(
                "difficulty",
                "Medium",
            ),
    }


# =========================================================
# SAMPLE ONE
# =========================================================

def _sample_one(
    match_filter,
):
    questions = sample_questions(
        match_filter,
        1,
    )

    if not questions:
        return None

    return questions[0]


# =========================================================
# SELECT ADAPTIVE CANDIDATE
# =========================================================

def select_adaptive_candidate(
    subject,
    difficulty,
    preferred_topic,
    blocked_ids,
):
    base_filter = {
        "subject":
            subject,
        "_id": {
            "$nin":
                blocked_ids
        },
    }

    candidate_filters = []

    # Focus Mode priority:
    # 1. preferred topic + exact difficulty
    # 2. preferred topic + any difficulty
    # 3. exact difficulty + any topic
    # 4. any available question

    if preferred_topic:
        candidate_filters.append(
            {
                **base_filter,
                "topic":
                    preferred_topic,
                "difficulty":
                    difficulty,
            }
        )

        candidate_filters.append(
            {
                **base_filter,
                "topic":
                    preferred_topic,
            }
        )

    candidate_filters.append(
        {
            **base_filter,
            "difficulty":
                difficulty,
        }
    )

    candidate_filters.append(
        base_filter
    )

    for candidate_filter in candidate_filters:
        question = _sample_one(
            candidate_filter
        )

        if question:
            return question

    return None


# =========================================================
# ADAPTIVE QUESTION SELECTOR
#
# 1. Questions from the current quiz are never repeated.
# 2. User history is avoided when user_id is supplied.
# 3. Seen questions are reusable only after unseen questions
#    for that subject are exhausted.
# =========================================================

def get_adaptive_question(
    subject,
    difficulty,
    preferred_topic=None,
    exclude_ids=None,
    user_id=None,
):
    current_quiz_ids = (
        normalize_question_ids(
            exclude_ids or []
        )
    )

    seen_ids = []

    if user_id:
        seen_ids = (
            get_seen_question_ids(
                user_id=user_id,
                subject=subject,
            )
        )

    # =====================================================
    # FIRST PASS: NEVER-SEEN QUESTIONS
    # =====================================================

    unseen_blocked_map = {
        str(question_id):
            question_id
        for question_id in (
            current_quiz_ids +
            seen_ids
        )
    }

    question = (
        select_adaptive_candidate(
            subject=subject,
            difficulty=difficulty,
            preferred_topic=
                preferred_topic,
            blocked_ids=
                list(
                    unseen_blocked_map
                    .values()
                ),
        )
    )

    if question:
        return serialize_question(
            question
        )

    # =====================================================
    # SECOND PASS:
    # All unseen questions for this subject are exhausted.
    # Previously seen questions may now be reused, while
    # current-attempt questions remain blocked.
    # =====================================================

    question = (
        select_adaptive_candidate(
            subject=subject,
            difficulty=difficulty,
            preferred_topic=
                preferred_topic,
            blocked_ids=
                current_quiz_ids,
        )
    )

    if not question:
        return None

    return serialize_question(
        question
    )
