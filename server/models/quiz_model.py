from bson import ObjectId

from database import questions_collection


# =========================================================
# QUESTION BANK VERSION
# =========================================================

QUESTION_BANK_VERSION = 2


# =========================================================
# DEFAULT QUESTIONS
# 21 Python
# 21 Machine Learning
# 21 Data Structures
# Total = 63
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

    # This helps safe sync find the same
    # question quickly.
    #
    # Not unique intentionally:
    # if an old database accidentally has
    # duplicates, server startup will not fail.

    questions_collection.create_index(
        [
            ("subject", 1),
            ("question", 1),
        ]
    )


# =========================================================
# SAFE QUESTION BANK SYNC
# =========================================================

def sync_question_bank():
    inserted_count = 0
    updated_count = 0

    for question in DEFAULT_QUESTIONS:

        question_document = {
            **question,

            "bankVersion":
                QUESTION_BANK_VERSION,
        }

        result = (
            questions_collection.update_one(
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
                        question_document
                },

                upsert=True,
            )
        )

        if result.upserted_id:
            inserted_count += 1

        elif result.modified_count > 0:
            updated_count += 1


    total_count = (
        questions_collection.count_documents(
            {}
        )
    )


    print(
        "Question bank synced:"
        f" {inserted_count} inserted,"
        f" {updated_count} updated,"
        f" {total_count} total in MongoDB."
    )


    return {
        "inserted":
            inserted_count,

        "updated":
            updated_count,

        "total":
            total_count,
    }


# =========================================================
# BACKWARD COMPATIBILITY
# =========================================================

def seed_questions():
    """
    Existing app.py already calls
    seed_questions().

    We keep this function so app.py does
    not need to change.

    It now performs a SAFE sync instead
    of only inserting when MongoDB is empty.
    """

    return sync_question_bank()


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


    return (
        questions_collection.find_one(
            {
                "_id":
                    object_id
            }
        )
    )


# =========================================================
# RANDOM QUESTION LIST
# =========================================================

def get_questions(
    subject,
    limit=5
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
            20
        ),
    )


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
        },
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
            selected_answer ==
            correct_answer,

        "correctAnswer":
            correct_answer,

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
    }


# =========================================================
# RANDOM QUESTION HELPER
# =========================================================

def _sample_one(
    match_filter
):
    pipeline = [
        {
            "$match":
                match_filter
        },

        {
            "$sample": {
                "size": 1
            }
        },
    ]


    questions = list(
        questions_collection.aggregate(
            pipeline
        )
    )


    if not questions:
        return None


    return questions[0]


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


    base_filter = {
        "subject":
            subject,

        "_id": {
            "$nin":
                object_ids
        },
    }


    # =====================================================
    # ATTEMPT 1
    # Preferred topic + exact difficulty
    # =====================================================

    if preferred_topic:

        question = _sample_one(
            {
                **base_filter,

                "difficulty":
                    difficulty,

                "topic":
                    preferred_topic,
            }
        )


        if question:
            return (
                serialize_question(
                    question
                )
            )


    # =====================================================
    # ATTEMPT 2
    # Exact requested difficulty
    # =====================================================

    question = _sample_one(
        {
            **base_filter,

            "difficulty":
                difficulty,
        }
    )


    if question:
        return (
            serialize_question(
                question
            )
        )


    # =====================================================
    # ATTEMPT 3
    # Preferred topic, any difficulty
    # =====================================================

    if preferred_topic:

        question = _sample_one(
            {
                **base_filter,

                "topic":
                    preferred_topic,
            }
        )


        if question:
            return (
                serialize_question(
                    question
                )
            )


    # =====================================================
    # ATTEMPT 4
    # Any unused question from subject
    # =====================================================

    question = _sample_one(
        base_filter
    )


    if not question:
        return None


    return (
        serialize_question(
            question
        )
    )