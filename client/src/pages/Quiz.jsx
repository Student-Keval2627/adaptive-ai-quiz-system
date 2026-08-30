import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

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


const subjects = [
  {
    name: "Python",

    label:
      "Python Programming",

    description:
      "Functions, OOP, collections and syntax",

    icon: Code2,
  },

  {
    name:
      "Machine Learning",

    label:
      "Machine Learning",

    description:
      "Models, algorithms and ML fundamentals",

    icon:
      BrainCircuit,
  },

  {
    name:
      "Data Structures",

    label:
      "Data Structures",

    description:
      "Arrays, stacks, queues, trees and graphs",

    icon:
      Database,
  },
];


function Quiz() {
  const navigate =
    useNavigate();


  const [screen, setScreen] =
    useState("setup");

  const [subject, setSubject] =
    useState("Python");

  const [questions, setQuestions] =
    useState([]);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    targetQuestionCount,
    setTargetQuestionCount,
  ] = useState(5);

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
    answerHistory,
    setAnswerHistory,
  ] = useState([]);

  const [
    adaptiveInfo,
    setAdaptiveInfo,
  ] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [checking, setChecking] =
    useState(false);

  const [
    loadingNext,
    setLoadingNext,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =========================================================
     QUESTION COUNT
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
        JSON.parse(
          savedSettings
        );

      const count =
        Number(
          parsed.questionCount
        );

      if (!count) {
        return 5;
      }

      return Math.max(
        1,
        Math.min(
          count,
          10
        )
      );

    } catch {
      return 5;
    }
  };


  /* =========================================================
     START QUIZ
  ========================================================= */

  const startQuiz =
    async () => {
      try {
        setLoading(true);
        setError("");

        const questionCount =
          getQuestionCount();

        const response =
          await fetch(
            `${API_BASE}/api/quiz/start`,
            {
              method:
                "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    subject,
                  }
                ),
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
            "Could not start adaptive quiz"
          );
        }

        setTargetQuestionCount(
          questionCount
        );

        setQuestions([
          data.question,
        ]);

        setCurrentIndex(0);

        setSelectedAnswer(
          null
        );

        setAnswerChecked(
          false
        );

        setCorrectAnswer(
          null
        );

        setScore(0);

        setAnswerHistory(
          []
        );

        setAdaptiveInfo(
          data.adaptive
        );

        setScreen(
          "quiz"
        );

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

  const checkAnswer =
    async () => {
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
          questions[
            currentIndex
          ];

        const response =
          await fetch(
            `${API_BASE}/api/quiz/check`,
            {
              method:
                "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    questionId:
                      currentQuestion.id,

                    answer:
                      selectedAnswer,
                  }
                ),
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

        setAnswerChecked(
          true
        );


        const historyItem = {
          questionId:
            currentQuestion.id,

          question:
            currentQuestion.question,

          topic:
            data.topic ||
            currentQuestion.topic,

          difficulty:
            data.difficulty ||
            currentQuestion.difficulty,

          selectedAnswer,

          correctAnswer:
            data.correctAnswer,

          correct:
            data.correct,
        };


        setAnswerHistory(
          (previous) => [
            ...previous,
            historyItem,
          ]
        );


        if (data.correct) {
          setScore(
            (previous) =>
              previous + 1
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
     LOAD NEXT ADAPTIVE QUESTION
  ========================================================= */

  const loadNextQuestion =
    async () => {
      try {
        setLoadingNext(
          true
        );

        setError("");

        const currentQuestion =
          questions[
            currentIndex
          ];

        const usedQuestionIds =
          questions.map(
            (question) =>
              question.id
          );


        const response =
          await fetch(
            `${API_BASE}/api/quiz/next`,
            {
              method:
                "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    subject,

                    previousQuestionId:
                      currentQuestion.id,

                    selectedAnswer,

                    usedQuestionIds,
                  }
                ),
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
            "Could not load next adaptive question"
          );
        }


        setQuestions(
          (previous) => [
            ...previous,
            data.question,
          ]
        );


        setCurrentIndex(
          (previous) =>
            previous + 1
        );


        setAdaptiveInfo(
          data.adaptive
        );


        setSelectedAnswer(
          null
        );

        setCorrectAnswer(
          null
        );

        setAnswerChecked(
          false
        );


      } catch (error) {
        setError(
          error.message ||
          "Could not load next question"
        );

      } finally {
        setLoadingNext(
          false
        );
      }
    };


  /* =========================================================
     SAVE FINAL RESULT
  ========================================================= */

  const saveFinalResult =
    async () => {
      try {
        setSaving(true);
        setError("");

        const response =
          await fetch(
            `${API_BASE}/api/results`,
            {
              method:
                "POST",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify(
                  {
                    subject,

                    score,

                    total:
                      targetQuestionCount,

                    answers:
                      answerHistory,
                  }
                ),
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
            "Could not save quiz result"
          );
        }


        const storedUser =
          localStorage.getItem(
            "neuraUser"
          );


        if (storedUser) {
          try {
            const currentUser =
              JSON.parse(
                storedUser
              );

            currentUser.stats =
              data.stats;

            localStorage.setItem(
              "neuraUser",
              JSON.stringify(
                currentUser
              )
            );

          } catch {
            // Ignore invalid cache
          }
        }


        navigate(
          "/results",
          {
            state: {
              subject,

              score,

              total:
                targetQuestionCount,

              accuracy:
                data.result
                  .accuracy,

              xpEarned:
                data.result
                  .xpEarned,

              stats:
                data.stats,

              resultId:
                data.result.id,
            },
          }
        );


      } catch (error) {
        setError(
          error.message ||
          "Failed to save quiz result"
        );

      } finally {
        setSaving(false);
      }
    };


  /* =========================================================
     NEXT BUTTON
  ========================================================= */

  const nextQuestion =
    async () => {
      const answeredQuestions =
        currentIndex + 1;

      const isLastQuestion =
        answeredQuestions >=
        targetQuestionCount;


      if (isLastQuestion) {
        await saveFinalResult();

        return;
      }


      await loadNextQuestion();
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
            onClick={() =>
              navigate("/")
            }
          >
            <ArrowLeft
              size={18}
            />

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

            Adaptive Engine Ready

          </div>

        </header>


        <main className="quiz-setup-container">

          <section className="quiz-setup-hero">

            <div className="quiz-hero-badge">
              <Sparkles
                size={14}
              />

              REAL ADAPTIVE QUIZ
            </div>


            <h1>
              A quiz that changes
              <br />

              <span>
                with every answer.
              </span>
            </h1>


            <p>
              Correct answers increase
              difficulty. Incorrect answers
              reduce difficulty and reinforce
              weak topics.
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

                <Target
                  size={20}
                />

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
                            {description}
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
                    ENGINE CONFIGURATION
                  </span>

                  <h3>
                    Adaptive Mode
                  </h3>
                </div>

              </div>


              <p className="quiz-info-description">
                The backend selects each
                next question dynamically
                from MongoDB.
              </p>


              <div className="quiz-info-list">

                <div className="quiz-info-row">

                  <div>
                    <Zap
                      size={17}
                    />

                    Start Difficulty
                  </div>

                  <strong>
                    Medium
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
                    {getQuestionCount()}
                  </strong>

                </div>


                <div className="quiz-info-row">

                  <div>
                    <BrainCircuit
                      size={17}
                    />

                    Question Flow
                  </div>

                  <strong>
                    Adaptive
                  </strong>

                </div>


                <div className="quiz-info-row">

                  <div>
                    <Flame
                      size={17}
                    />

                    Weak Topics
                  </div>

                  <strong>
                    Prioritized
                  </strong>

                </div>

              </div>


              {error && (
                <div className="quiz-ai-message">

                  <X
                    size={18}
                  />

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
                disabled={
                  loading
                }
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
                  ? "Starting Adaptive Quiz..."
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
     QUESTION SCREEN
  ========================================================= */

  const currentQuestion =
    questions[
      currentIndex
    ];


  const progress =
    (
      (
        currentIndex + 1
      )
      /
      targetQuestionCount
    ) * 100;


  const isCorrect =
    answerChecked &&
    selectedAnswer ===
      correctAnswer;


  const currentDifficulty =
    currentQuestion
      ?.difficulty ||
    adaptiveInfo
      ?.difficulty ||
    "Medium";


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
          <ArrowLeft
            size={18}
          />

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
          className={`quiz-difficulty difficulty-${currentDifficulty.toLowerCase()}`}
        >
          <Zap
            size={14}
          />

          {currentDifficulty}

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
                /
                {targetQuestionCount}
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

              {
                currentQuestion.topic
              }

            </div>


            <div className="quiz-question-ai">

              <Sparkles
                size={14}
              />

              {
                currentDifficulty
              }

            </div>

          </div>


          <h1>
            {
              currentQuestion.question
            }
          </h1>


          {adaptiveInfo?.reason && (
            <div className="quiz-ai-message">

              <Sparkles
                size={16}
              />

              <p>
                {
                  adaptiveInfo.reason
                }
              </p>

            </div>
          )}


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
                  <X
                    size={18}
                  />
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
                    ? "Correct. The adaptive engine may increase difficulty."
                    : `Correct answer: ${correctAnswer}. The next question will adapt to this result.`}
                </p>

              </div>

            </div>
          )}


          {error && (
            <div className="quiz-feedback quiz-feedback-wrong">

              <X
                size={18}
              />

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

                disabled={
                  saving ||
                  loadingNext
                }

                onClick={
                  nextQuestion
                }
              >

                {saving
                  ? "Saving Result..."
                  : loadingNext
                  ? "Adapting Question..."
                  : currentIndex + 1 >=
                    targetQuestionCount
                  ? "View Results"
                  : "Next Adaptive Question"}


                {!saving &&
                  !loadingNext && (
                    <ArrowRight
                      size={17}
                    />
                  )}

              </button>

            )}

          </div>

        </section>

      </main>
    </div>
  );
}


export default Quiz;