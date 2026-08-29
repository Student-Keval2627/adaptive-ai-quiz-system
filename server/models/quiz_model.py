from bson import ObjectId

from database import questions_collection


# =========================================================
# CREATE QUESTION INDEXES
# =========================================================

def create_question_indexes():
    questions_collection.create_index("subject")
    questions_collection.create_index("difficulty")


# =========================================================
# DEFAULT QUESTIONS
# =========================================================

DEFAULT_QUESTIONS = [
    # =====================================================
    # PYTHON
    # =====================================================

    {
        "subject": "Python",
        "topic": "Basics",
        "difficulty": "Easy",
        "question": "Which keyword is used to create a function in Python?",
        "options": [
            "function",
            "def",
            "func",
            "define"
        ],
        "answer": "def"
    },
    {
        "subject": "Python",
        "topic": "Collections",
        "difficulty": "Easy",
        "question": "Which Python data type stores ordered multiple values?",
        "options": [
            "list",
            "int",
            "bool",
            "float"
        ],
        "answer": "list"
    },
    {
        "subject": "Python",
        "topic": "Functions",
        "difficulty": "Easy",
        "question": "What does len() return in Python?",
        "options": [
            "Number of items",
            "Data type",
            "Memory size",
            "Variable name"
        ],
        "answer": "Number of items"
    },
    {
        "subject": "Python",
        "topic": "Syntax",
        "difficulty": "Easy",
        "question": "Which symbol is used for a single-line comment in Python?",
        "options": [
            "#",
            "//",
            "--",
            "/*"
        ],
        "answer": "#"
    },
    {
        "subject": "Python",
        "topic": "Operators",
        "difficulty": "Medium",
        "question": "Which operator performs exponentiation in Python?",
        "options": [
            "**",
            "^",
            "//",
            "%"
        ],
        "answer": "**"
    },
    {
        "subject": "Python",
        "topic": "OOP",
        "difficulty": "Medium",
        "question": "Which keyword is used to create a class in Python?",
        "options": [
            "class",
            "object",
            "struct",
            "new"
        ],
        "answer": "class"
    },
    {
        "subject": "Python",
        "topic": "Collections",
        "difficulty": "Medium",
        "question": "Which collection stores unique values only?",
        "options": [
            "set",
            "list",
            "tuple",
            "string"
        ],
        "answer": "set"
    },
    {
        "subject": "Python",
        "topic": "Exceptions",
        "difficulty": "Medium",
        "question": "Which block is used to handle exceptions in Python?",
        "options": [
            "try-except",
            "if-else",
            "switch-case",
            "for-while"
        ],
        "answer": "try-except"
    },
    {
        "subject": "Python",
        "topic": "Functions",
        "difficulty": "Hard",
        "question": "What is a lambda in Python?",
        "options": [
            "Anonymous function",
            "Loop",
            "Class",
            "Module"
        ],
        "answer": "Anonymous function"
    },
    {
        "subject": "Python",
        "topic": "OOP",
        "difficulty": "Hard",
        "question": "Which method is normally used as a constructor in Python classes?",
        "options": [
            "__init__",
            "__main__",
            "__start__",
            "__newclass__"
        ],
        "answer": "__init__"
    },

    # =====================================================
    # MACHINE LEARNING
    # =====================================================

    {
        "subject": "Machine Learning",
        "topic": "Fundamentals",
        "difficulty": "Easy",
        "question": "Which learning type uses labeled training data?",
        "options": [
            "Supervised Learning",
            "Unsupervised Learning",
            "Reinforcement Learning",
            "Random Learning"
        ],
        "answer": "Supervised Learning"
    },
    {
        "subject": "Machine Learning",
        "topic": "Regression",
        "difficulty": "Easy",
        "question": "Which algorithm is commonly used to predict continuous values?",
        "options": [
            "Linear Regression",
            "K-Means",
            "Apriori",
            "DBSCAN"
        ],
        "answer": "Linear Regression"
    },
    {
        "subject": "Machine Learning",
        "topic": "Training",
        "difficulty": "Easy",
        "question": "What is the purpose of training data?",
        "options": [
            "Teach patterns to the model",
            "Design the website",
            "Delete the model",
            "Store passwords"
        ],
        "answer": "Teach patterns to the model"
    },
    {
        "subject": "Machine Learning",
        "topic": "Evaluation",
        "difficulty": "Easy",
        "question": "Which metric represents the percentage of correct predictions?",
        "options": [
            "Accuracy",
            "Compiler",
            "Iteration",
            "Database"
        ],
        "answer": "Accuracy"
    },
    {
        "subject": "Machine Learning",
        "topic": "Overfitting",
        "difficulty": "Medium",
        "question": "What is overfitting?",
        "options": [
            "Model performs well on training data but poorly on new data",
            "Model works perfectly everywhere",
            "Model has no training data",
            "Model has no features"
        ],
        "answer": "Model performs well on training data but poorly on new data"
    },
    {
        "subject": "Machine Learning",
        "topic": "Classification",
        "difficulty": "Medium",
        "question": "Which task predicts categories such as spam or not spam?",
        "options": [
            "Classification",
            "Regression",
            "Clustering",
            "Sorting"
        ],
        "answer": "Classification"
    },
    {
        "subject": "Machine Learning",
        "topic": "Clustering",
        "difficulty": "Medium",
        "question": "K-Means is mainly used for which task?",
        "options": [
            "Clustering",
            "Regression",
            "Compilation",
            "Encryption"
        ],
        "answer": "Clustering"
    },
    {
        "subject": "Machine Learning",
        "topic": "Dataset",
        "difficulty": "Medium",
        "question": "Why is a test dataset used?",
        "options": [
            "Evaluate the model on unseen data",
            "Train the model again",
            "Create HTML",
            "Delete features"
        ],
        "answer": "Evaluate the model on unseen data"
    },
    {
        "subject": "Machine Learning",
        "topic": "Features",
        "difficulty": "Hard",
        "question": "What is feature scaling used for?",
        "options": [
            "Bring numerical features to comparable ranges",
            "Increase dataset rows",
            "Delete labels",
            "Convert models into databases"
        ],
        "answer": "Bring numerical features to comparable ranges"
    },
    {
        "subject": "Machine Learning",
        "topic": "Regression",
        "difficulty": "Hard",
        "question": "Which value measures the strength of a linear relationship between variables?",
        "options": [
            "Correlation coefficient",
            "Primary key",
            "Loop counter",
            "Queue size"
        ],
        "answer": "Correlation coefficient"
    },

    # =====================================================
    # DATA STRUCTURES
    # =====================================================

    {
        "subject": "Data Structures",
        "topic": "Stack",
        "difficulty": "Easy",
        "question": "Which principle does a stack follow?",
        "options": [
            "LIFO",
            "FIFO",
            "Random",
            "Sorted"
        ],
        "answer": "LIFO"
    },
    {
        "subject": "Data Structures",
        "topic": "Queue",
        "difficulty": "Easy",
        "question": "Which principle does a queue follow?",
        "options": [
            "FIFO",
            "LIFO",
            "Random",
            "Recursive"
        ],
        "answer": "FIFO"
    },
    {
        "subject": "Data Structures",
        "topic": "Graph",
        "difficulty": "Easy",
        "question": "Which structure contains vertices connected by edges?",
        "options": [
            "Graph",
            "String",
            "Integer",
            "Boolean"
        ],
        "answer": "Graph"
    },
    {
        "subject": "Data Structures",
        "topic": "Tree",
        "difficulty": "Easy",
        "question": "Which data structure contains a root node and child nodes?",
        "options": [
            "Tree",
            "Queue",
            "Variable",
            "String"
        ],
        "answer": "Tree"
    },
    {
        "subject": "Data Structures",
        "topic": "Array",
        "difficulty": "Medium",
        "question": "Array elements are normally accessed using what?",
        "options": [
            "Index",
            "Password",
            "Compiler",
            "Database"
        ],
        "answer": "Index"
    },
    {
        "subject": "Data Structures",
        "topic": "Linked List",
        "difficulty": "Medium",
        "question": "A linked list node generally contains data and what else?",
        "options": [
            "A reference to another node",
            "A database",
            "A compiler",
            "A password"
        ],
        "answer": "A reference to another node"
    },
    {
        "subject": "Data Structures",
        "topic": "Tree",
        "difficulty": "Medium",
        "question": "A binary tree node can have at most how many children?",
        "options": [
            "2",
            "1",
            "3",
            "Unlimited"
        ],
        "answer": "2"
    },
    {
        "subject": "Data Structures",
        "topic": "Searching",
        "difficulty": "Medium",
        "question": "Binary search requires the data to be:",
        "options": [
            "Sorted",
            "Encrypted",
            "Random",
            "Duplicated"
        ],
        "answer": "Sorted"
    },
    {
        "subject": "Data Structures",
        "topic": "Complexity",
        "difficulty": "Hard",
        "question": "What is the typical time complexity of binary search?",
        "options": [
            "O(log n)",
            "O(n)",
            "O(n²)",
            "O(1)"
        ],
        "answer": "O(log n)"
    },
    {
        "subject": "Data Structures",
        "topic": "Graph",
        "difficulty": "Hard",
        "question": "Which data structure is commonly used by Breadth First Search?",
        "options": [
            "Queue",
            "Stack",
            "Array only",
            "Hash only"
        ],
        "answer": "Queue"
    }
]


# =========================================================
# SEED QUESTIONS
# =========================================================

def seed_questions():
    if questions_collection.count_documents({}) > 0:
        return

    questions_collection.insert_many(
        DEFAULT_QUESTIONS
    )

    print(
        f"Seeded {len(DEFAULT_QUESTIONS)} quiz questions"
    )


# =========================================================
# GET QUESTIONS
# =========================================================

def get_questions(subject, limit=5):
    cursor = questions_collection.aggregate(
        [
            {
                "$match": {
                    "subject": subject
                }
            },
            {
                "$sample": {
                    "size": limit
                }
            }
        ]
    )

    questions = []

    for question in cursor:
        questions.append(
            {
                "id": str(question["_id"]),
                "subject": question["subject"],
                "topic": question["topic"],
                "difficulty": question["difficulty"],
                "question": question["question"],
                "options": question["options"]
            }
        )

    return questions


# =========================================================
# CHECK ANSWER
# =========================================================

def check_question_answer(question_id, selected_answer):
    try:
        object_id = ObjectId(
            question_id
        )

    except Exception:
        return None

    question = questions_collection.find_one(
        {
            "_id": object_id
        }
    )

    if not question:
        return None

    correct_answer = question["answer"]

    return {
        "correct": (
            selected_answer
            == correct_answer
        ),
        "correctAnswer": correct_answer,
        "topic": question.get(
            "topic",
            ""
        ),
        "difficulty": question.get(
            "difficulty",
            "Medium"
        )
    }