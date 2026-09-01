import {
  useEffect,
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


const defaultQuizSettings = {
  difficulty:
    "Adaptive",

  questionCount:
    5,

  focusMode:
    true,
};


/* =========================================================
   FALLBACK SUBJECTS

   These are used only if the backend subject endpoint
   cannot be loaded. The real subject list comes from:
   GET /api/quiz/subjects
========================================================= */

const fallbackSubjects = [
  {
    name:
      "Python",

    questionCount:
      100,
  },

  {
    name:
      "C Programming",

    questionCount:
      100,
  },

  {
    name:
      "C++",

    questionCount:
      100,
  },

  {
    name:
      "Java",

    questionCount:
      100,
  },

  {
    name:
      "JavaScript",

    questionCount:
      100,
  },

  {
    name:
      "TypeScript",

    questionCount:
      100,
  },

  {
    name:
      "Data Structures",

    questionCount:
      100,
  },

  {
    name:
      "Algorithms",

    questionCount:
      100,
  },

  {
    name:
      "SQL",

    questionCount:
      100,
  },

  {
    name:
      "DBMS",

    questionCount:
      100,
  },

  {
    name:
      "Operating Systems",

    questionCount:
      100,
  },

  {
    name:
      "Computer Networks",

    questionCount:
      100,
  },

  {
    name:
      "Object Oriented Programming",

    questionCount:
      100,
  },

  {
    name:
      "Machine Learning",

    questionCount:
      100,
  },

  {
    name:
      "Web Development",

    questionCount:
      100,
  },

  {
    name:
      "React",

    questionCount:
      100,
  },

  {
    name:
      "Node.js",

    questionCount:
      100,
  },

  {
    name:
      "Flask",

    questionCount:
      100,
  },

  {
    name:
      "Django",

    questionCount:
      100,
  },

  {
    name:
      "Git & GitHub",

    questionCount:
      100,
  },

  {
    name:
      "Software Engineering",

    questionCount:
      100,
  },

  {
    name:
      "Computer Architecture",

    questionCount:
      100,
  },
];


/* =========================================================
   SUBJECT UI METADATA

   Backend decides which subjects actually exist.
   This function only controls labels, descriptions and icons.
========================================================= */

function getSubjectMeta(
  subjectName
) {
  const metadata = {
    Python: {
      label:
        "Python Programming",

      description:
        "Functions, OOP, collections and syntax",

      icon:
        Code2,
    },

    "C Programming": {
      label:
        "C Programming",

      description:
        "Pointers, functions, arrays and core C concepts",

      icon:
        Code2,
    },

    "C++": {
      label:
        "C++ Programming",

      description:
        "OOP, STL, pointers and modern C++ concepts",

      icon:
        Code2,
    },

    Java: {
      label:
        "Java Programming",

      description:
        "OOP, collections, exceptions and Java fundamentals",

      icon:
        Code2,
    },

    JavaScript: {
      label:
        "JavaScript",

      description:
        "Functions, objects, DOM and modern JavaScript",

      icon:
        Code2,
    },

    TypeScript: {
      label:
        "TypeScript",

      description:
        "Types, interfaces and typed JavaScript development",

      icon:
        Code2,
    },

    "Data Structures": {
      label:
        "Data Structures",

      description:
        "Arrays, stacks, queues, trees and graphs",

      icon:
        Database,
    },

    Algorithms: {
      label:
        "Algorithms",

      description:
        "Searching, sorting, complexity and problem solving",

      icon:
        BrainCircuit,
    },

    SQL: {
      label:
        "SQL",

      description:
        "Queries, joins, grouping and database operations",

      icon:
        Database,
    },

    DBMS: {
      label:
        "Database Management Systems",

      description:
        "Normalization, transactions, keys and database design",

      icon:
        Database,
    },

    "Operating Systems": {
      label:
        "Operating Systems",

      description:
        "Processes, scheduling, memory and file systems",

      icon:
        BrainCircuit,
    },

    "Computer Networks": {
      label:
        "Computer Networks",

      description:
        "OSI, TCP/IP, protocols and networking fundamentals",

      icon:
        BrainCircuit,
    },

    "Object Oriented Programming": {
      label:
        "Object Oriented Programming",

      description:
        "Classes, inheritance, polymorphism and abstraction",

      icon:
        Code2,
    },

    "Machine Learning": {
      label:
        "Machine Learning",

      description:
        "Models, algorithms and ML fundamentals",

      icon:
        BrainCircuit,
    },

    "Web Development": {
      label:
        "Web Development",

      description:
        "HTML, CSS, JavaScript and web fundamentals",

      icon:
        Code2,
    },

    React: {
      label:
        "React",

      description:
        "Components, hooks, state and React patterns",

      icon:
        Code2,
    },

    "Node.js": {
      label:
        "Node.js",

      description:
        "Server-side JavaScript, APIs and Node fundamentals",

      icon:
        Code2,
    },

    Flask: {
      label:
        "Flask",

      description:
        "Python web APIs, routing and Flask fundamentals",

      icon:
        Code2,
    },

    Django: {
      label:
        "Django",

      description:
        "Models, views, URLs and Django development",

      icon:
        Code2,
    },

    "Git & GitHub": {
      label:
        "Git & GitHub",

      description:
        "Version control, branches, commits and collaboration",

      icon:
        Code2,
    },

    "Software Engineering": {
      label:
        "Software Engineering",

      description:
        "SDLC, testing, design and development practices",

      icon:
        BrainCircuit,
    },

    "Computer Architecture": {
      label:
        "Computer Architecture",

      description:
        "CPU, memory, instruction cycles and architecture",

      icon:
        BrainCircuit,
    },
  };


  return (
    metadata[
      subjectName
    ] || {
      label:
        subjectName,

      description:
        "Adaptive practice questions for this subject",

      icon:
        BrainCircuit,
    }
  );
}


/* =========================================================
   SETTINGS
========================================================= */

function getSavedQuizSettings() {
  try {
    const stored =
      localStorage.getItem(
        "neuraQuizSettings"
      );


    if (!stored) {
      return {
        ...defaultQuizSettings,
      };
    }


    const parsed =
      JSON.parse(
        stored
      );


    const allowedDifficulties = [
      "Adaptive",
      "Easy",
      "Medium",
      "Hard",
    ];


    const difficulty =
      allowedDifficulties.includes(
        parsed.difficulty
      )
        ? parsed.difficulty
        : "Adaptive";


    const rawCount =
      Number(
        parsed.questionCount
      );


    const questionCount =
      [5, 10, 15].includes(
        rawCount
      )
        ? rawCount
        : 5;


    const focusMode =
      typeof parsed.focusMode ===
      "boolean"
        ? parsed.focusMode
        : true;


    return {
      difficulty,
      questionCount,
      focusMode,
    };


  } catch {
    return {
      ...defaultQuizSettings,
    };
  }
}


/* =========================================================
   QUIZ
========================================================= */

function Quiz() {
  const navigate =
    useNavigate();


  const [
    screen,
    setScreen,
  ] = useState(
    "setup"
  );


  const [
    availableSubjects,
    setAvailableSubjects,
  ] = useState(
    fallbackSubjects
  );


  const [
    loadingSubjects,
    setLoadingSubjects,
  ] = useState(
    true
  );


  const [
    subject,
    setSubject,
  ] = useState(
    "Python"
  );


  const [
    questions,
    setQuestions,
  ] = useState(
    []
  );


  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(
    0
  );


  const [
    attemptId,
    setAttemptId,
  ] = useState(
    null
  );


  const [
    activeSettings,
    setActiveSettings,
  ] = useState(
    getSavedQuizSettings()
  );


  const [
    targetQuestionCount,
    setTargetQuestionCount,
  ] = useState(
    getSavedQuizSettings()
      .questionCount
  );


  const [
    selectedAnswer,
    setSelectedAnswer,
  ] = useState(
    null
  );


  const [
    answerChecked,
    setAnswerChecked,
  ] = useState(
    false
  );


  const [
    correctAnswer,
    setCorrectAnswer,
  ] = useState(
    null
  );


  const [
    score,
    setScore,
  ] = useState(
    0
  );


  const [
    answerHistory,
    setAnswerHistory,
  ] = useState(
    []
  );


  const [
    adaptiveInfo,
    setAdaptiveInfo,
  ] = useState(
    null
  );


  const [
    loading,
    setLoading,
  ] = useState(
    false
  );


  const [
    checking,
    setChecking,
  ] = useState(
    false
  );


  const [
    loadingNext,
    setLoadingNext,
  ] = useState(
    false
  );


  const [
    saving,
    setSaving,
  ] = useState(
    false
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );


  /* =========================================================
     LOAD DYNAMIC SUBJECTS
  ========================================================= */

  useEffect(() => {
    let active = true;


    const loadSubjects =
      async () => {
        try {
          setLoadingSubjects(
            true
          );


          const response =
            await fetch(
              `${API_BASE}/api/quiz/subjects`,
              {
                credentials:
                  "include",
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
              "Could not load subjects"
            );
          }


          const backendSubjects =
            Array.isArray(
              data.subjects
            )
              ? data.subjects
                  .filter(
                    (item) =>
                      item &&
                      typeof item.name ===
                        "string" &&
                      item.name.trim()
                  )
                  .map(
                    (item) => ({
                      name:
                        item.name.trim(),

                      questionCount:
                        Number(
                          item.questionCount
                        ) || 0,
                    })
                  )
              : [];


          if (
            !active ||
            backendSubjects.length === 0
          ) {
            return;
          }


          setAvailableSubjects(
            backendSubjects
          );


          setSubject(
            (currentSubject) => {
              const currentExists =
                backendSubjects.some(
                  (item) =>
                    item.name ===
                    currentSubject
                );


              if (currentExists) {
                return currentSubject;
              }


              return (
                backendSubjects[0]
                  .name
              );
            }
          );


        } catch (error) {
          if (!active) {
            return;
          }


          // Keep starter subjects as a safe fallback.
          // The quiz can still work while the backend is
          // being restarted or updated.
          setAvailableSubjects(
            fallbackSubjects
          );


        } finally {
          if (active) {
            setLoadingSubjects(
              false
            );
          }
        }
      };


    loadSubjects();


    return () => {
      active = false;
    };
  }, []);


  /* =========================================================
     START QUIZ
  ========================================================= */

  const startQuiz =
    async () => {
      if (!subject) {
        setError(
          "Please select a subject."
        );

        return;
      }


      try {
        setLoading(true);
        setError("");


        const quizSettings =
          getSavedQuizSettings();


        setAttemptId(
          null
        );


        setActiveSettings(
          quizSettings
        );


        setTargetQuestionCount(
          quizSettings.questionCount
        );


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

                    difficulty:
                      quizSettings.difficulty,

                    focusMode:
                      quizSettings.focusMode,
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


        const backendAttemptId =
          String(
            data.attemptId ||
            ""
          ).trim();


        if (!backendAttemptId) {
          throw new Error(
            "Quiz server did not return an attempt ID"
          );
        }


        if (!data.question) {
          throw new Error(
            "Quiz server did not return a question"
          );
        }


        setAttemptId(
          backendAttemptId
        );


        setQuestions([
          data.question,
        ]);


        setCurrentIndex(
          0
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


        setScore(
          0
        );


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
        setAttemptId(
          null
        );


        setError(
          error.message ||
          "Could not connect to quiz server"
        );


      } finally {
        setLoading(
          false
        );
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


      if (!attemptId) {
        setError(
          "Quiz attempt is missing. Please start a new quiz."
        );

        return;
      }


      try {
        setChecking(
          true
        );

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
                    attemptId,

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

          subject:
            currentQuestion.subject ||
            subject,

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


        if (
          data.correct
        ) {
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
        setChecking(
          false
        );
      }
    };


  /* =========================================================
     NEXT QUESTION
  ========================================================= */

  const loadNextQuestion =
    async () => {
      if (!attemptId) {
        setError(
          "Quiz attempt is missing. Please start a new quiz."
        );

        return;
      }


      try {
        setLoadingNext(
          true
        );

        setError("");


        const currentQuestion =
          questions[
            currentIndex
          ];


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
                    attemptId,

                    previousQuestionId:
                      currentQuestion.id,

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
            "Could not load next adaptive question"
          );
        }


        if (!data.question) {
          throw new Error(
            "Quiz server did not return the next question"
          );
        }


        if (
          data.attemptId &&
          data.attemptId !==
            attemptId
        ) {
          throw new Error(
            "Quiz attempt validation failed"
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
     SAVE FINAL VERIFIED RESULT
  ========================================================= */

  const saveFinalResult =
    async () => {
      if (!attemptId) {
        setError(
          "Quiz attempt ID is missing. Please start a new quiz."
        );

        return;
      }


      try {
        setSaving(
          true
        );

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
                    attemptId,

                    subject,

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
            // Ignore local cache errors.
          }
        }


        navigate(
          "/results",
          {
            state: {
              subject:
                data.result.subject,

              score:
                data.result.score,

              total:
                data.result.total,

              accuracy:
                data.result.accuracy,

              xpEarned:
                data.result.xpEarned,

              stats:
                data.stats,

              resultId:
                data.result.id,

              attemptId:
                data.result.attemptId,

              duplicate:
                data.duplicate,

              difficulty:
                activeSettings
                  .difficulty,

              focusMode:
                activeSettings
                  .focusMode,
            },
          }
        );


      } catch (error) {
        setError(
          error.message ||
          "Failed to save quiz result"
        );


      } finally {
        setSaving(
          false
        );
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


      if (
        isLastQuestion
      ) {
        await saveFinalResult();

        return;
      }


      await loadNextQuestion();
    };


  /* =========================================================
     SETUP SCREEN
  ========================================================= */

  const latestSettings =
    getSavedQuizSettings();


  if (
    screen === "setup"
  ) {
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
              <BrainCircuit size={20} />
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

            {loadingSubjects
              ? "Loading Subjects..."
              : `${availableSubjects.length} Subjects Ready`}
          </div>

        </header>


        <main className="quiz-setup-container">

          <section className="quiz-setup-hero">

            <div className="quiz-hero-badge">
              <Sparkles size={14} />
              PERSONALIZED ADAPTIVE QUIZ
            </div>


            <h1>
              Your settings.
              <br />

              <span>
                Your adaptive challenge.
              </span>
            </h1>


            <p>
              Choose any subject available
              in the live question bank.
              Your saved difficulty, quiz
              length and Focus Mode are
              applied automatically.
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

                {availableSubjects.map(
                  (subjectItem) => {
                    const {
                      name,
                      questionCount,
                    } =
                      subjectItem;


                    const {
                      label,
                      description,
                      icon: Icon,
                    } =
                      getSubjectMeta(
                        name
                      );


                    const active =
                      subject ===
                      name;


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
                          <Icon size={20} />
                        </div>


                        <div className="quiz-subject-content">

                          <strong>
                            {label}
                          </strong>


                          <span>
                            {description}
                          </span>


                          {questionCount > 0 && (
                            <span>
                              {questionCount}
                              {" "}
                              questions available
                            </span>
                          )}

                        </div>


                        <div className="quiz-subject-check">

                          {active ? (
                            <Check size={14} />

                          ) : (
                            <ChevronRight size={16} />
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
                  <BrainCircuit size={24} />
                </div>


                <div>
                  <span>
                    ACTIVE SETTINGS
                  </span>

                  <h3>
                    {latestSettings.difficulty}
                  </h3>
                </div>

              </div>


              <p className="quiz-info-description">
                These settings are loaded
                directly from your saved
                NeuraQuiz preferences.
              </p>


              <div className="quiz-info-list">

                <div className="quiz-info-row">

                  <div>
                    <Zap size={17} />
                    Start Level
                  </div>

                  <strong>
                    {latestSettings.difficulty}
                  </strong>

                </div>


                <div className="quiz-info-row">

                  <div>
                    <Target size={17} />
                    Questions
                  </div>

                  <strong>
                    {latestSettings.questionCount}
                  </strong>

                </div>


                <div className="quiz-info-row">

                  <div>
                    <BrainCircuit size={17} />
                    Difficulty Flow
                  </div>

                  <strong>
                    Adaptive
                  </strong>

                </div>


                <div className="quiz-info-row">

                  <div>
                    <Flame size={17} />
                    Focus Mode
                  </div>

                  <strong>
                    {latestSettings.focusMode
                      ? "Enabled"
                      : "Disabled"}
                  </strong>

                </div>


                <div className="quiz-info-row">

                  <div>
                    <Database size={17} />
                    Subject Bank
                  </div>

                  <strong>
                    {availableSubjects.length}
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
                onClick={startQuiz}

                disabled={
                  loading ||
                  loadingSubjects ||
                  !subject
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
                  ? "Applying Settings..."
                  : loadingSubjects
                  ? "Loading Subjects..."
                  : "Start Adaptive Quiz"}


                {!loading &&
                  !loadingSubjects && (
                    <ArrowRight size={18} />
                  )}

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
    questions[
      currentIndex
    ];


  if (!currentQuestion) {
    return (
      <div className="quiz-page">

        <main className="quiz-setup-container">

          <section className="quiz-setup-card">

            <div className="quiz-ai-message">

              <X size={18} />

              <p>
                Quiz question could not be loaded.
              </p>

            </div>


            <button
              className="quiz-start-button"

              onClick={() =>
                setScreen(
                  "setup"
                )
              }
            >
              Back to Quiz Setup
            </button>

          </section>

        </main>

      </div>
    );
  }


  const progress =
    Math.min(
      100,
      (
        (
          currentIndex + 1
        )
        /
        targetQuestionCount
      ) * 100
    );


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
              {activeSettings.difficulty} Start
            </span>
          </div>

        </div>


        <div
          className={`quiz-difficulty difficulty-${currentDifficulty.toLowerCase()}`}
        >
          <Zap size={14} />
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
                /{targetQuestionCount}
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
              width:
                `${progress}%`,
            }}
          />

        </div>


        <section className="quiz-question-card">

          <div className="quiz-question-top">

            <div className="quiz-question-category">
              <BrainCircuit size={15} />
              {currentQuestion.topic}
            </div>


            <div className="quiz-question-ai">
              <Sparkles size={14} />
              {currentDifficulty}
            </div>

          </div>


          <h1>
            {currentQuestion.question}
          </h1>


          {adaptiveInfo?.reason && (
            <div className="quiz-ai-message">

              <Sparkles size={16} />

              <p>
                {adaptiveInfo.reason}
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
                    key={`${currentQuestion.id}-${index}`}

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
                    ? "Correct. Your next question will adapt to this answer."
                    : `Correct answer: ${correctAnswer}. The next question will adapt to your performance.`}
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
                  <ArrowRight size={17} />
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
                    <ArrowRight size={17} />
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
