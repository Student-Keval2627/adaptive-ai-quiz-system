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
  LoaderCircle,
  Play,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";

import "./Quiz.css";


const API_BASE =
  "http://127.0.0.1:5000";


/* =========================================================
   SUBJECTS
========================================================= */

const subjects = [
  {
    name: "Python",
    label: "Python Programming",
    description:
      "Functions, OOP, collections and syntax",
    icon: Code2,
  },
  {
    name: "Machine Learning",
    label: "Machine Learning",
    description:
      "Models, algorithms and ML fundamentals",
    icon: BrainCircuit,
  },
  {
    name: "Data Structures",
    label: "Data Structures",
    description:
      "Arrays, stacks, queues, trees and graphs",
    icon: Database,
  },
];


/* =========================================================
   QUIZ
========================================================= */

function Quiz() {
  const navigate = useNavigate();

  const [screen, setScreen] =
    useState("setup");

  const [subject, setSubject] =
    useState("Python");

  const [questions, setQuestions] =
    useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState(null);

  const [
    answerChecked,
    setAnswerChecked,
  ] = useState(false);

  const [
    correctAnswer,
    setCorrectAnswer,
  ] = useState(null);

  const [score, setScore] =
    useState(0);

  const [
    correctStreak,
    setCorrectStreak,
  ] = useState(0);

  const [
    difficulty,
    setDifficulty,
  ] = useState("Medium");

  const [loading, setLoading] =
    useState(false);

  const [checking, setChecking] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     GET QUESTION COUNT
  ========================================================= */

  const getQuestionCount = () => {
    try {
      const savedSettings =
        localStorage.getItem(
          "neuraQuizSettings"
        );

      if (!savedSettings) {
        return 5;
      }

      const parsed =
        JSON.parse(savedSettings);

      const count = Number(
        parsed.questionCount
      );

      if (!count) {
        return 5;
      }

      return Math.min(
        count,
        10
      );
    } catch {
      return 5;
    }
  };


  /* =========================================================
     START QUIZ
  ========================================================= */

  const startQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      const questionCount =
        getQuestionCount();

      const response = await fetch(
        `${API_BASE}/api/quiz/questions?subject=${encodeURIComponent(
          subject
        )}&limit=${questionCount}`
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to load questions"
        );
      }

      if (
        !data.questions ||
        data.questions.length === 0
      ) {
        throw new Error(
          "No questions found for this subject"
        );
      }

      setQuestions(
        data.questions
      );

      setCurrentIndex(0);

      setSelectedAnswer(null);

      setAnswerChecked(false);

      setCorrectAnswer(null);

      setScore(0);

      setCorrectStreak(0);

      setDifficulty("Medium");

      setScreen("quiz");
    } catch (error) {
      setError(
        error.message ||
          "Could not connect to quiz server"
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     CHECK ANSWER
  ========================================================= */

  const checkAnswer = async () => {
    if (
      !selectedAnswer ||
      answerChecked ||
      checking
    ) {
      return;
    }

    try {
      setChecking(true);
      setError("");

      const currentQuestion =
        questions[currentIndex];

      const response = await fetch(
        `${API_BASE}/api/quiz/check`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            questionId:
              currentQuestion.id,

            answer:
              selectedAnswer,
          }),
        }
      );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Could not check answer"
        );
      }

      setCorrectAnswer(
        data.correctAnswer
      );

      setAnswerChecked(true);

      if (data.correct) {
        setScore(
          (previous) =>
            previous + 1
        );

        const newStreak =
          correctStreak + 1;

        setCorrectStreak(
          newStreak
        );

        if (newStreak >= 2) {
          setDifficulty(
            "Hard"
          );
        } else {
          setDifficulty(
            "Medium"
          );
        }
      } else {
        setCorrectStreak(0);

        setDifficulty(
          "Easy"
        );
      }
    } catch (error) {
      setError(
        error.message ||
          "Could not check answer"
      );
    } finally {
      setChecking(false);
    }
  };


  /* =========================================================
     NEXT QUESTION
  ========================================================= */

  const nextQuestion = () => {
    const isLastQuestion =
      currentIndex ===
      questions.length - 1;

    if (isLastQuestion) {
      navigate(
        "/results",
        {
          state: {
            subject,
            score,
            total:
              questions.length,

            accuracy:
              Math.round(
                (
                  score /
                  questions.length
                ) *
                  100
              ),
          },
        }
      );

      return;
    }

    setCurrentIndex(
      (previous) =>
        previous + 1
    );

    setSelectedAnswer(
      null
    );

    setAnswerChecked(
      false
    );

    setCorrectAnswer(
      null
    );

    setError("");
  };


  /* =========================================================
     SETUP
  ========================================================= */

  if (screen === "setup") {
    return (
      <div className="quiz-page">
        <div className="quiz-background-glow glow-one" />

        <div className="quiz-background-glow glow-two" />

        <header className="quiz-topbar">
          <button
            className="quiz-back-button"
            onClick={() =>
              navigate("/")
            }
          >
            <ArrowLeft size={18} />

            Dashboard
          </button>

          <div className="quiz-brand">
            <div className="quiz-brand-icon">
              <BrainCircuit
                size={20}
              />
            </div>

            <div>
              <strong>
                NeuraQuiz
              </strong>

              <span>
                Adaptive AI
              </span>
            </div>
          </div>

          <div className="quiz-ai-status">
            <span className="quiz-status-dot" />

            MongoDB Connected
          </div>
        </header>

        <main className="quiz-setup-container">

          <section className="quiz-setup-hero">
            <div className="quiz-hero-badge">
              <Sparkles size={14} />

              PERSONALIZED QUIZ
            </div>

            <h1>
              Let's build your
              <br />

              <span>
                next challenge.
              </span>
            </h1>

            <p>
              Choose a subject and
              NeuraQuiz will load your
              questions directly from
              the quiz database.
            </p>
          </section>

          <section className="quiz-setup-grid">

            <div className="quiz-setup-card">
              <div className="quiz-section-heading">
                <div>
                  <span>
                    STEP 01
                  </span>

                  <h2>
                    Choose your subject
                  </h2>
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
                          setSubject(
                            name
                          )
                        }
                      >
                        <div className="quiz-subject-icon">
                          <Icon
                            size={20}
                          />
                        </div>

                        <div className="quiz-subject-content">
                          <strong>
                            {label}
                          </strong>

                          <span>
                            {
                              description
                            }
                          </span>
                        </div>

                        <div className="quiz-subject-check">
                          {active ? (
                            <Check
                              size={14}
                            />
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

            <div className="quiz-info-card">
              <div className="quiz-info-header">
                <div className="quiz-info-ai-icon">
                  <BrainCircuit
                    size={24}
                  />
                </div>

                <div>
                  <span>
                    AI CONFIGURATION
                  </span>

                  <h3>
                    Database Mode
                  </h3>
                </div>
              </div>

              <p className="quiz-info-description">
                Questions are fetched
                securely from MongoDB
                through the Flask API.
              </p>

              <div className="quiz-info-list">

                <div className="quiz-info-row">
                  <div>
                    <Zap size={17} />
                    Difficulty
                  </div>

                  <strong>
                    Adaptive
                  </strong>
                </div>

                <div className="quiz-info-row">
                  <div>
                    <Target
                      size={17}
                    />
                    Questions
                  </div>

                  <strong>
                    {
                      getQuestionCount()
                    }
                  </strong>
                </div>

                <div className="quiz-info-row">
                  <div>
                    <Clock3
                      size={17}
                    />
                    Data source
                  </div>

                  <strong>
                    MongoDB
                  </strong>
                </div>

                <div className="quiz-info-row">
                  <div>
                    <Flame
                      size={17}
                    />
                    Learning
                  </div>

                  <strong>
                    Focused
                  </strong>
                </div>

              </div>

              {error && (
                <div className="quiz-ai-message">
                  <X size={18} />

                  <p>
                    {error}
                  </p>
                </div>
              )}

              <button
                className="quiz-start-button"
                onClick={
                  startQuiz
                }
                disabled={loading}
              >
                <div>
                  {loading ? (
                    <LoaderCircle
                      size={15}
                      className="quiz-loader"
                    />
                  ) : (
                    <Play
                      size={15}
                      fill="currentColor"
                    />
                  )}
                </div>

                {loading
                  ? "Loading Questions..."
                  : "Start Adaptive Quiz"}

                {!loading && (
                  <ArrowRight
                    size={18}
                  />
                )}
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }


  /* =========================================================
     QUESTION
  ========================================================= */

  const currentQuestion =
    questions[currentIndex];

  const progress =
    (
      (currentIndex + 1) /
      questions.length
    ) * 100;

  const isCorrect =
    answerChecked &&
    selectedAnswer ===
      correctAnswer;


  return (
    <div className="quiz-page quiz-running-page">
      <div className="quiz-background-glow glow-one" />

      <div className="quiz-background-glow glow-two" />

      <header className="quiz-running-topbar">
        <button
          className="quiz-back-button"
          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft size={18} />

          Exit Quiz
        </button>

        <div className="quiz-running-title">
          <div className="quiz-brand-icon">
            <BrainCircuit
              size={20}
            />
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
              {Math.round(
                progress
              )}
              %
            </span>
          </div>
        </div>

        <div className="quiz-main-progress">
          <div
            style={{
              width:
                `${progress}%`,
            }}
          />
        </div>

        <section className="quiz-question-card">
          <div className="quiz-question-top">
            <div className="quiz-question-category">
              <BrainCircuit
                size={15}
              />

              {currentQuestion.topic}
            </div>

            <div className="quiz-question-ai">
              <Sparkles
                size={14}
              />

              {
                currentQuestion.difficulty
              }
            </div>
          </div>

          <h1>
            {
              currentQuestion.question
            }
          </h1>

          <p className="quiz-select-label">
            Select one answer
          </p>

          <div className="quiz-options">
            {currentQuestion.options.map(
              (
                option,
                index
              ) => {
                const optionLetter =
                  String.fromCharCode(
                    65 + index
                  );

                const selected =
                  selectedAnswer ===
                  option;

                const correctOption =
                  answerChecked &&
                  option ===
                    correctAnswer;

                const wrongOption =
                  answerChecked &&
                  selected &&
                  !correctOption;

                return (
                  <button
                    key={option}
                    disabled={
                      answerChecked
                    }
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
                        <Check
                          size={17}
                        />
                      ) : wrongOption ? (
                        <X
                          size={17}
                        />
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
                  <Check
                    size={18}
                  />
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
                    ? "Correct answer. Keep going!"
                    : `Correct answer: ${correctAnswer}`}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="quiz-feedback quiz-feedback-wrong">
              <X size={18} />

              <p>
                {error}
              </p>
            </div>
          )}

          <div className="quiz-question-actions">
            <div className="quiz-live-score">
              <Trophy
                size={17}
              />

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
                disabled={
                  !selectedAnswer ||
                  checking
                }
                onClick={
                  checkAnswer
                }
              >
                {checking
                  ? "Checking..."
                  : "Check Answer"}

                {!checking && (
                  <ArrowRight
                    size={17}
                  />
                )}
              </button>
            ) : (
              <button
                className="quiz-check-button"
                onClick={
                  nextQuestion
                }
              >
                {currentIndex ===
                questions.length - 1
                  ? "View Results"
                  : "Next Question"}

                <ArrowRight
                  size={17}
                />
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Quiz;