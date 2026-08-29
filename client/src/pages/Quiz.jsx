import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronRight,
  Clock3,
  Code2,
  Database,
  Flame,
  Play,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";

import "./Quiz.css";

/* =========================================================
   QUESTION BANK
========================================================= */

const questionBanks = {
  Python: [
    {
      question: "Which keyword is used to create a function in Python?",
      options: ["function", "def", "func", "define"],
      answer: "def",
    },
    {
      question: "Which data type stores multiple values in an ordered collection?",
      options: ["list", "int", "bool", "float"],
      answer: "list",
    },
    {
      question: "What does len() return in Python?",
      options: [
        "Data type",
        "Number of items",
        "Memory size",
        "Variable name",
      ],
      answer: "Number of items",
    },
    {
      question: "Which symbol is used for comments in Python?",
      options: ["//", "#", "/* */", "--"],
      answer: "#",
    },
    {
      question: "Which operator is used for exponentiation in Python?",
      options: ["^", "**", "//", "%%"],
      answer: "**",
    },
  ],

  "Machine Learning": [
    {
      question:
        "Which type of machine learning uses labeled training data?",
      options: [
        "Supervised Learning",
        "Unsupervised Learning",
        "Reinforcement Learning",
        "Random Learning",
      ],
      answer: "Supervised Learning",
    },
    {
      question:
        "Which algorithm is commonly used for predicting continuous values?",
      options: [
        "Linear Regression",
        "K-Means",
        "Apriori",
        "DBSCAN",
      ],
      answer: "Linear Regression",
    },
    {
      question:
        "What is the main purpose of training data in machine learning?",
      options: [
        "Teach the model patterns",
        "Delete model errors",
        "Design the interface",
        "Store passwords",
      ],
      answer: "Teach the model patterns",
    },
    {
      question:
        "Which metric represents the percentage of correct predictions?",
      options: [
        "Accuracy",
        "Database",
        "Iteration",
        "Compiler",
      ],
      answer: "Accuracy",
    },
    {
      question:
        "Overfitting occurs when a model performs very well on:",
      options: [
        "Training data but poorly on new data",
        "Every possible dataset",
        "Only empty datasets",
        "No training data",
      ],
      answer: "Training data but poorly on new data",
    },
  ],

  "Data Structures": [
    {
      question: "Which principle does a stack follow?",
      options: ["LIFO", "FIFO", "Random", "Sorted"],
      answer: "LIFO",
    },
    {
      question: "Which data structure uses FIFO?",
      options: ["Queue", "Stack", "Tree", "Graph"],
      answer: "Queue",
    },
    {
      question:
        "Which data structure consists of nodes connected using edges?",
      options: ["Graph", "Integer", "String", "Boolean"],
      answer: "Graph",
    },
    {
      question:
        "Which structure contains a root node and child nodes?",
      options: ["Tree", "Queue", "Array only", "Variable"],
      answer: "Tree",
    },
    {
      question:
        "Array elements are generally accessed using:",
      options: ["Index", "Password", "Compiler", "Database"],
      answer: "Index",
    },
  ],
};

/* =========================================================
   SUBJECT DATA
========================================================= */

const subjects = [
  {
    name: "Python",
    label: "Python Programming",
    description: "Functions, OOP, collections and syntax",
    icon: Code2,
  },
  {
    name: "Machine Learning",
    label: "Machine Learning",
    description: "Models, algorithms and ML fundamentals",
    icon: BrainCircuit,
  },
  {
    name: "Data Structures",
    label: "Data Structures",
    description: "Arrays, stacks, queues, trees and graphs",
    icon: Database,
  },
];

/* =========================================================
   QUIZ
========================================================= */

function Quiz() {
  const navigate = useNavigate();

  const [screen, setScreen] = useState("setup");

  const [subject, setSubject] = useState("Python");

  const [questions, setQuestions] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [answerChecked, setAnswerChecked] = useState(false);

  const [score, setScore] = useState(0);

  const [correctStreak, setCorrectStreak] = useState(0);

  const [difficulty, setDifficulty] = useState("Medium");

  /* =========================================================
     START QUIZ
  ========================================================= */

  const startQuiz = () => {
    const selectedQuestions = questionBanks[subject];

    setQuestions(selectedQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswerChecked(false);
    setScore(0);
    setCorrectStreak(0);
    setDifficulty("Medium");

    setScreen("quiz");
  };

  /* =========================================================
     CHECK ANSWER
  ========================================================= */

  const checkAnswer = () => {
    if (!selectedAnswer || answerChecked) {
      return;
    }

    const currentQuestion = questions[currentIndex];

    const isCorrect =
      selectedAnswer === currentQuestion.answer;

    setAnswerChecked(true);

    if (isCorrect) {
      setScore((previous) => previous + 1);

      const newStreak = correctStreak + 1;

      setCorrectStreak(newStreak);

      if (newStreak >= 2) {
        setDifficulty("Hard");
      }
    } else {
      setCorrectStreak(0);
      setDifficulty("Easy");
    }
  };

  /* =========================================================
     NEXT QUESTION
  ========================================================= */

  const nextQuestion = () => {
    const isLastQuestion =
      currentIndex === questions.length - 1;

    if (isLastQuestion) {
      navigate("/results", {
        state: {
          subject,
          score,
          total: questions.length,
          accuracy: Math.round(
            (score / questions.length) * 100
          ),
        },
      });

      return;
    }

    setCurrentIndex(
      (previous) => previous + 1
    );

    setSelectedAnswer(null);
    setAnswerChecked(false);
  };

  /* =========================================================
     SETUP SCREEN
  ========================================================= */

  if (screen === "setup") {
    return (
      <div className="quiz-page">
        <div className="quiz-background-glow glow-one" />
        <div className="quiz-background-glow glow-two" />

        <header className="quiz-topbar">
          <button
            className="quiz-back-button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <div className="quiz-brand">
            <div className="quiz-brand-icon">
              <BrainCircuit size={20} />
            </div>

            <div>
              <strong>NeuraQuiz</strong>
              <span>Adaptive AI</span>
            </div>
          </div>

          <div className="quiz-ai-status">
            <span className="quiz-status-dot" />
            AI Engine Ready
          </div>
        </header>

        <main className="quiz-setup-container">
          {/* Hero */}

          <section className="quiz-setup-hero">
            <div className="quiz-hero-badge">
              <Sparkles size={14} />
              PERSONALIZED QUIZ
            </div>

            <h1>
              Let's build your
              <br />
              <span>next challenge.</span>
            </h1>

            <p>
              Choose a subject and NeuraQuiz will
              automatically adjust the difficulty based
              on how you perform.
            </p>
          </section>

          {/* Main setup */}

          <section className="quiz-setup-grid">
            <div className="quiz-setup-card">
              <div className="quiz-section-heading">
                <div>
                  <span>STEP 01</span>
                  <h2>Choose your subject</h2>
                </div>

                <Target size={20} />
              </div>

              <div className="quiz-subject-list">
                {subjects.map(
                  ({
                    name,
                    label,
                    description,
                    icon: Icon,
                  }) => {
                    const active =
                      subject === name;

                    return (
                      <button
                        key={name}
                        className={`quiz-subject-card ${
                          active
                            ? "quiz-subject-active"
                            : ""
                        }`}
                        onClick={() =>
                          setSubject(name)
                        }
                      >
                        <div className="quiz-subject-icon">
                          <Icon size={20} />
                        </div>

                        <div className="quiz-subject-content">
                          <strong>
                            {label}
                          </strong>

                          <span>
                            {description}
                          </span>
                        </div>

                        <div className="quiz-subject-check">
                          {active ? (
                            <Check size={14} />
                          ) : (
                            <ChevronRight
                              size={16}
                            />
                          )}
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Quiz intelligence */}

            <div className="quiz-info-card">
              <div className="quiz-info-header">
                <div className="quiz-info-ai-icon">
                  <BrainCircuit size={24} />
                </div>

                <div>
                  <span>AI CONFIGURATION</span>
                  <h3>Adaptive Mode</h3>
                </div>
              </div>

              <p className="quiz-info-description">
                Difficulty automatically changes according
                to your answers.
              </p>

              <div className="quiz-info-list">
                <div className="quiz-info-row">
                  <div>
                    <Zap size={17} />
                    Difficulty
                  </div>

                  <strong>Adaptive</strong>
                </div>

                <div className="quiz-info-row">
                  <div>
                    <Target size={17} />
                    Questions
                  </div>

                  <strong>5</strong>
                </div>

                <div className="quiz-info-row">
                  <div>
                    <Clock3 size={17} />
                    Estimated time
                  </div>

                  <strong>5 min</strong>
                </div>

                <div className="quiz-info-row">
                  <div>
                    <Flame size={17} />
                    Learning mode
                  </div>

                  <strong>Focused</strong>
                </div>
              </div>

              <div className="quiz-ai-message">
                <Sparkles size={18} />

                <p>
                  The quiz starts at medium difficulty.
                  Correct answers increase the challenge,
                  while mistakes lower the difficulty.
                </p>
              </div>

              <button
                className="quiz-start-button"
                onClick={startQuiz}
              >
                <div>
                  <Play
                    size={15}
                    fill="currentColor"
                  />
                </div>

                Start Adaptive Quiz

                <ArrowRight size={18} />
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  /* =========================================================
     QUIZ SCREEN
  ========================================================= */

  const currentQuestion =
    questions[currentIndex];

  const progress =
    ((currentIndex + 1) /
      questions.length) *
    100;

  const isCorrect =
    selectedAnswer ===
    currentQuestion.answer;

  return (
    <div className="quiz-page quiz-running-page">
      <div className="quiz-background-glow glow-one" />
      <div className="quiz-background-glow glow-two" />

      {/* Topbar */}

      <header className="quiz-running-topbar">
        <button
          className="quiz-back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Exit Quiz
        </button>

        <div className="quiz-running-title">
          <div className="quiz-brand-icon">
            <BrainCircuit size={20} />
          </div>

          <div>
            <strong>
              {subject}
            </strong>

            <span>
              Adaptive Quiz
            </span>
          </div>
        </div>

        <div
          className={`quiz-difficulty difficulty-${difficulty.toLowerCase()}`}
        >
          <Zap size={14} />
          {difficulty}
        </div>
      </header>

      <main className="quiz-question-container">

        {/* Progress */}

        <div className="quiz-progress-header">
          <div>
            <span>
              QUESTION
            </span>

            <strong>
              {currentIndex + 1}
              <small>
                /{questions.length}
              </small>
            </strong>
          </div>

          <div className="quiz-progress-right">
            <span>
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        <div className="quiz-main-progress">
          <div
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {/* Question */}

        <section className="quiz-question-card">
          <div className="quiz-question-top">
            <div className="quiz-question-category">
              <BrainCircuit size={15} />
              {subject}
            </div>

            <div className="quiz-question-ai">
              <Sparkles size={14} />
              AI Adaptive
            </div>
          </div>

          <h1>
            {currentQuestion.question}
          </h1>

          <p className="quiz-select-label">
            Select one answer
          </p>

          {/* Options */}

          <div className="quiz-options">
            {currentQuestion.options.map(
              (option, index) => {
                const optionLetter =
                  String.fromCharCode(
                    65 + index
                  );

                const selected =
                  selectedAnswer === option;

                const correctOption =
                  answerChecked &&
                  option ===
                    currentQuestion.answer;

                const wrongOption =
                  answerChecked &&
                  selected &&
                  !correctOption;

                return (
                  <button
                    key={option}
                    disabled={answerChecked}
                    onClick={() =>
                      setSelectedAnswer(
                        option
                      )
                    }
                    className={[
                      "quiz-option",
                      selected
                        ? "quiz-option-selected"
                        : "",
                      correctOption
                        ? "quiz-option-correct"
                        : "",
                      wrongOption
                        ? "quiz-option-wrong"
                        : "",
                    ].join(" ")}
                  >
                    <div className="quiz-option-letter">
                      {correctOption ? (
                        <Check size={17} />
                      ) : wrongOption ? (
                        <X size={17} />
                      ) : (
                        optionLetter
                      )}
                    </div>

                    <span>
                      {option}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {/* Feedback */}

          {answerChecked && (
            <div
              className={`quiz-feedback ${
                isCorrect
                  ? "quiz-feedback-correct"
                  : "quiz-feedback-wrong"
              }`}
            >
              <div>
                {isCorrect ? (
                  <Check size={18} />
                ) : (
                  <X size={18} />
                )}
              </div>

              <div>
                <strong>
                  {isCorrect
                    ? "Great answer!"
                    : "Not quite."}
                </strong>

                <p>
                  {isCorrect
                    ? "Your answer is correct. The AI may increase the next question's difficulty."
                    : `The correct answer is "${currentQuestion.answer}". The AI has adjusted your difficulty.`}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}

          <div className="quiz-question-actions">
            <div className="quiz-live-score">
              <Trophy size={17} />

              <span>
                Score
              </span>

              <strong>
                {score}
              </strong>
            </div>

            {!answerChecked ? (
              <button
                className="quiz-check-button"
                disabled={!selectedAnswer}
                onClick={checkAnswer}
              >
                Check Answer
                <ArrowRight size={17} />
              </button>
            ) : (
              <button
                className="quiz-check-button"
                onClick={nextQuestion}
              >
                {currentIndex ===
                questions.length - 1
                  ? "View Results"
                  : "Next Question"}

                <ArrowRight size={17} />
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Quiz;