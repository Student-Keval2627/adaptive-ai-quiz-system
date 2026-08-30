from bson import ObjectId

from database import (
    questions_collection
)


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
        "question":
            "Which keyword is used to define a function in Python?",
        "options": [
            "func",
            "define",
            "def",
            "function"
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
            "list"
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
            "Set"
        ],
        "answer": "Dictionary",
    },

    {
        "subject": "Python",
        "topic": "Functions",
        "difficulty": "Medium",
        "question":
            "What does the return statement do inside a Python function?",
        "options": [
            "Stops Python",
            "Sends a value back to the caller",
            "Creates a loop",
            "Imports a module"
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
            "__main__"
        ],
        "answer":
            "__init__",
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
            "Dictionary only",
            "Frozen set"
        ],
        "answer": "List",
    },

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
            "A loop"
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
            "Compilation"
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
            "error"
        ],
        "answer":
            "finally",
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
            "generate"
        ],
        "answer":
            "yield",
    },


    # =====================================================
    # MACHINE LEARNING
    # =====================================================

    {
        "subject":
            "Machine Learning",
        "topic":
            "Fundamentals",
        "difficulty":
            "Easy",
        "question":
            "Machine learning is primarily used to allow computers to learn patterns from what?",
        "options": [
            "Data",
            "Keyboard",
            "Monitor",
            "HTML"
        ],
        "answer":
            "Data",
    },

    {
        "subject":
            "Machine Learning",
        "topic":
            "Learning Types",
        "difficulty":
            "Easy",
        "question":
            "Which learning type uses labeled training data?",
        "options": [
            "Supervised Learning",
            "Unsupervised Learning",
            "Random Learning",
            "Manual Learning"
        ],
        "answer":
            "Supervised Learning",
    },

    {
        "subject":
            "Machine Learning",
        "topic":
            "Learning Types",
        "difficulty":
            "Easy",
        "question":
            "Which learning type discovers patterns without labeled outputs?",
        "options": [
            "Supervised Learning",
            "Unsupervised Learning",
            "Static Learning",
            "Compiled Learning"
        ],
        "answer":
            "Unsupervised Learning",
    },

    {
        "subject":
            "Machine Learning",
        "topic":
            "Regression",
        "difficulty":
            "Medium",
        "question":
            "Which ML task is commonly used to predict a continuous numerical value?",
        "options": [
            "Regression",
            "Classification",
            "Clustering",
            "Sorting"
        ],
        "answer":
            "Regression",
    },

    {
        "subject":
            "Machine Learning",
        "topic":
            "Classification",
        "difficulty":
            "Medium",
        "question":
            "Which task predicts categories such as spam or not spam?",
        "options": [
            "Regression",
            "Classification",
            "Compression",
            "Rendering"
        ],
        "answer":
            "Classification",
    },

    {
        "subject":
            "Machine Learning",
        "topic":
            "Model Evaluation",
        "difficulty":
            "Medium",
        "question":
            "Why is a test dataset used in machine learning?",
        "options": [
            "To evaluate the trained model on unseen data",
            "To increase screen brightness",
            "To store passwords",
            "To write HTML"
        ],
        "answer":
            "To evaluate the trained model on unseen data",
    },

    {
        "subject":
            "Machine Learning",
        "topic":
            "Overfitting",
        "difficulty":
            "Hard",
        "question":
            "What happens when a model performs very well on training data but poorly on unseen data?",
        "options": [
            "Underflow",
            "Overfitting",
            "Compilation",
            "Normalization"
        ],
        "answer":
            "Overfitting",
    },

    {
        "subject":
            "Machine Learning",
        "topic":
            "Optimization",
        "difficulty":
            "Hard",
        "question":
            "What is the main purpose of gradient descent?",
        "options": [
            "Minimize a loss function",
            "Create HTML",
            "Increase dataset size automatically",
            "Encrypt the model"
        ],
        "answer":
            "Minimize a loss function",
    },

    {
        "subject":
            "Machine Learning",
        "topic":
            "Feature Engineering",
        "difficulty":
            "Hard",
        "question":
            "Why is feature scaling useful for many machine learning algorithms?",
        "options": [
            "It brings features to comparable numerical ranges",
            "It deletes every feature",
            "It converts all data into text",
            "It guarantees 100% accuracy"
        ],
        "answer":
            "It brings features to comparable numerical ranges",
    },

    {
        "subject":
            "Machine Learning",
        "topic":
            "Model Evaluation",
        "difficulty":
            "Hard",
        "question":
            "Which metric is the harmonic mean of precision and recall?",
        "options": [
            "Accuracy",
            "F1 Score",
            "R-squared",
            "MAE"
        ],
        "answer":
            "F1 Score",
    },


    # =====================================================
    # DATA STRUCTURES
    # =====================================================

    {
        "subject":
            "Data Structures",
        "topic":
            "Arrays",
        "difficulty":
            "Easy",
        "question":
            "Which data structure stores elements in contiguous memory locations?",
        "options": [
            "Array",
            "Graph",
            "Tree",
            "Queue"
        ],
        "answer":
            "Array",
    },

    {
        "subject":
            "Data Structures",
        "topic":
            "Stacks",
        "difficulty":
            "Easy",
        "question":
            "Which principle does a stack follow?",
        "options": [
            "FIFO",
            "LIFO",
            "Random",
            "Priority only"
        ],
        "answer":
            "LIFO",
    },

    {
        "subject":
            "Data Structures",
        "topic":
            "Queues",
        "difficulty":
            "Easy",
        "question":
            "Which principle does a basic queue follow?",
        "options": [
            "LIFO",
            "FIFO",
            "Recursive",
            "Random"
        ],
        "answer":
            "FIFO",
    },

    {
        "subject":
            "Data Structures",
        "topic":
            "Linked Lists",
        "difficulty":
            "Medium",
        "question":
            "What does a node in a singly linked list normally contain?",
        "options": [
            "Data and a pointer to the next node",
            "Only a database",
            "A complete tree",
            "Only an index"
        ],
        "answer":
            "Data and a pointer to the next node",
    },

    {
        "subject":
            "Data Structures",
        "topic":
            "Trees",
        "difficulty":
            "Medium",
        "question":
            "What is the topmost node of a tree called?",
        "options": [
            "Leaf",
            "Root",
            "Edge",
            "Queue"
        ],
        "answer":
            "Root",
    },

    {
        "subject":
            "Data Structures",
        "topic":
            "Searching",
        "difficulty":
            "Medium",
        "question":
            "Binary search requires the data to normally be in what state?",
        "options": [
            "Sorted",
            "Encrypted",
            "Random only",
            "Duplicated"
        ],
        "answer":
            "Sorted",
    },

    {
        "subject":
            "Data Structures",
        "topic":
            "Trees",
        "difficulty":
            "Hard",
        "question":
            "What is the maximum number of children a node can have in a binary tree?",
        "options": [
            "1",
            "2",
            "3",
            "Unlimited"
        ],
        "answer":
            "2",
    },

    {
        "subject":
            "Data Structures",
        "topic":
            "Graphs",
        "difficulty":
            "Hard",
        "question":
            "Which traversal commonly uses a queue to explore graph vertices level by level?",
        "options": [
            "DFS",
            "BFS",
            "Binary Search",
            "Selection Sort"
        ],
        "answer":
            "BFS",
    },

    {
        "subject":
            "Data Structures",
        "topic":
            "Complexity",
        "difficulty":
            "Hard",
        "question":
            "What is the average time complexity of binary search?",
        "options": [
            "O(n)",
            "O(log n)",
            "O(n²)",
            "O(1)"
        ],
        "answer":
            "O(log n)",
    },

    {
        "subject":
            "Data Structures",
        "topic":
            "Stacks",
        "difficulty":
            "Hard",
        "question":
            "Which operation removes the top element from a stack?",
        "options": [
            "Push",
            "Pop",
            "Peek",
            "Insert"
        ],
        "answer":
            "Pop",
    },
]


# =========================================================
# INDEXES
# =========================================================

def create_question_indexes():
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
        [
            ("subject", 1),
            ("difficulty", 1)
        ]
    )


# =========================================================
# SEED QUESTIONS
# =========================================================

def seed_questions():
    if (
        questions_collection.count_documents(
            {}
        )
        > 0
    ):
        return

    questions_collection.insert_many(
        DEFAULT_QUESTIONS
    )

    print(
        f"Seeded {len(DEFAULT_QUESTIONS)} quiz questions."
    )


# =========================================================
# SERIALIZE PUBLIC QUESTION
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
                ""
            ),

        "topic":
            question.get(
                "topic",
                ""
            ),

        "difficulty":
            question.get(
                "difficulty",
                "Medium"
            ),

        "question":
            question.get(
                "question",
                ""
            ),

        "options":
            question.get(
                "options",
                []
            ),
    }


# =========================================================
# FIND RAW QUESTION
# =========================================================

def find_question_by_id(
    question_id
):
    try:
        object_id = ObjectId(
            question_id
        )

    except Exception:
        return None

    return questions_collection.find_one(
        {
            "_id":
                object_id
        }
    )


# =========================================================
# OLD RANDOM QUESTIONS ENDPOINT SUPPORT
# =========================================================

def get_questions(
    subject,
    limit=5
):
    pipeline = [
        {
            "$match": {
                "subject":
                    subject
            }
        },

        {
            "$sample": {
                "size":
                    limit
            }
        }
    ]

    questions = list(
        questions_collection.aggregate(
            pipeline
        )
    )

    return [
        serialize_question(
            question
        )
        for question
        in questions
    ]


# =========================================================
# CHECK ANSWER
# =========================================================

def check_question_answer(
    question_id,
    selected_answer
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
            selected_answer
            == correct_answer,

        "correctAnswer":
            correct_answer,

        "subject":
            question.get(
                "subject"
            ),

        "topic":
            question.get(
                "topic"
            ),

        "difficulty":
            question.get(
                "difficulty"
            ),
    }


# =========================================================
# ADAPTIVE QUESTION SELECTOR
# =========================================================

def get_adaptive_question(
    subject,
    difficulty,
    preferred_topic=None,
    exclude_ids=None,
):
    exclude_ids = (
        exclude_ids or []
    )

    object_ids = []

    for question_id in exclude_ids:
        try:
            object_ids.append(
                ObjectId(
                    question_id
                )
            )

        except Exception:
            continue


    # =====================================================
    # BASE FILTER
    # =====================================================

    base_filter = {
        "subject":
            subject,

        "_id": {
            "$nin":
                object_ids
        }
    }


    # =====================================================
    # ATTEMPT 1:
    # preferred topic + requested difficulty
    # =====================================================

    if preferred_topic:
        question = (
            questions_collection.find_one(
                {
                    **base_filter,

                    "difficulty":
                        difficulty,

                    "topic":
                        preferred_topic,
                }
            )
        )

        if question:
            return (
                serialize_question(
                    question
                )
            )


    # =====================================================
    # ATTEMPT 2:
    # requested difficulty
    # =====================================================

    pipeline = [
        {
            "$match": {
                **base_filter,

                "difficulty":
                    difficulty,
            }
        },

        {
            "$sample": {
                "size": 1
            }
        }
    ]

    questions = list(
        questions_collection.aggregate(
            pipeline
        )
    )

    if questions:
        return serialize_question(
            questions[0]
        )


    # =====================================================
    # ATTEMPT 3:
    # preferred topic with any difficulty
    # =====================================================

    if preferred_topic:
        pipeline = [
            {
                "$match": {
                    **base_filter,

                    "topic":
                        preferred_topic,
                }
            },

            {
                "$sample": {
                    "size": 1
                }
            }
        ]

        questions = list(
            questions_collection.aggregate(
                pipeline
            )
        )

        if questions:
            return (
                serialize_question(
                    questions[0]
                )
            )


    # =====================================================
    # ATTEMPT 4:
    # any unused subject question
    # =====================================================

    pipeline = [
        {
            "$match":
                base_filter
        },

        {
            "$sample": {
                "size": 1
            }
        }
    ]

    questions = list(
        questions_collection.aggregate(
            pipeline
        )
    )

    if not questions:
        return None

    return serialize_question(
        questions[0]
    )