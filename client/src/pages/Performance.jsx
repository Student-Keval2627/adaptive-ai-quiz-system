import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Database,
  Flame,
  Play,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

import "./Performance.css";


const API_BASE =
  "http://127.0.0.1:5000";


const subjectConfig = [
  {
    name: "Python",
    topic: "Programming Concepts",
    icon: Code2,
  },
  {
    name: "Machine Learning",
    topic: "Models & Algorithms",
    icon: BrainCircuit,
  },
  {
    name: "Data Structures",
    topic: "Core Structures",
    icon: Database,
  },
];


/* =========================================================
   STAT CARD
========================================================= */

function PerformanceStat({
  icon: Icon,
  label,
  value,
  description,
  trend,
}) {
  return (
    <div className="performance-stat-card">
      <div className="performance-stat-top">
        <div className="performance-stat-icon">
          <Icon size={20} />
        </div>

        <div className="performance-stat-trend">
          <TrendingUp size={13} />
          {trend}
        </div>
      </div>

      <strong className="performance-stat-value">
        {value}
      </strong>

      <span className="performance-stat-label">
        {label}
      </span>

      <p>{description}</p>
    </div>
  );
}


/* =========================================================
   PERFORMANCE
========================================================= */

function Performance() {
  const navigate =
    useNavigate();

  const [user, setUser] =
    useState(null);

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  /* =========================================================
     LOAD DATABASE DATA
  ========================================================= */

  useEffect(() => {
    const loadPerformance =
      async () => {
        try {
          setLoading(true);
          setError("");

          const userResponse =
            await fetch(
              `${API_BASE}/api/auth/me`,
              {
                credentials:
                  "include",
              }
            );

          const userData =
            await userResponse.json();

          if (
            !userResponse.ok ||
            !userData.authenticated
          ) {
            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return;
          }

          setUser(
            userData.user
          );

          const resultResponse =
            await fetch(
              `${API_BASE}/api/results?limit=50`,
              {
                credentials:
                  "include",
              }
            );

          const resultData =
            await resultResponse.json();

          if (
            resultResponse.ok &&
            resultData.success
          ) {
            setResults(
              resultData.results ||
                []
            );
          }
        } catch {
          setError(
            "Could not load performance data."
          );
        } finally {
          setLoading(false);
        }
      };

    loadPerformance();
  }, [navigate]);


  /* =========================================================
     USER STATS
  ========================================================= */

  const stats =
    user?.stats || {};

  const accuracy =
    stats.accuracy || 0;

  const quizzesCompleted =
    stats.quizzesCompleted || 0;

  const questionsAnswered =
    stats.questionsAnswered || 0;

  const correctAnswers =
    stats.correctAnswers || 0;

  const streak =
    stats.streak || 0;

  const xp =
    stats.xp || 0;


  /* =========================================================
     SUBJECT DATA
  ========================================================= */

  const subjectData =
    useMemo(() => {
      return subjectConfig.map(
        (subject) => {
          const subjectResults =
            results.filter(
              (result) =>
                result.subject ===
                subject.name
            );

          const total =
            subjectResults.reduce(
              (sum, result) =>
                sum +
                (result.total || 0),
              0
            );

          const correct =
            subjectResults.reduce(
              (sum, result) =>
                sum +
                (result.score || 0),
              0
            );

          const progress =
            total > 0
              ? Math.round(
                  (correct / total) *
                    100
                )
              : 0;

          let status =
            "Not Started";

          if (total > 0) {
            if (progress >= 80) {
              status = "Strong";
            } else if (
              progress >= 65
            ) {
              status =
                "Improving";
            } else {
              status =
                "Needs Practice";
            }
          }

          return {
            ...subject,

            progress,

            quizzes:
              subjectResults.length,

            accuracy:
              `${progress}%`,

            status,
          };
        }
      );
    }, [results]);


  /* =========================================================
     STRONGEST + WEAKEST
  ========================================================= */

  const attemptedSubjects =
    subjectData.filter(
      (subject) =>
        subject.quizzes > 0
    );

  const strongestSubject =
    attemptedSubjects.length
      ? [...attemptedSubjects].sort(
          (a, b) =>
            b.progress -
            a.progress
        )[0]
      : null;

  const weakestSubject =
    attemptedSubjects.length
      ? [...attemptedSubjects].sort(
          (a, b) =>
            a.progress -
            b.progress
        )[0]
      : null;


  /* =========================================================
     WEEKLY DATA
  ========================================================= */

  const weeklyData =
    useMemo(() => {
      const days = [];

      for (
        let offset = 6;
        offset >= 0;
        offset--
      ) {
        const date =
          new Date();

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setDate(
          date.getDate() -
            offset
        );

        const nextDay =
          new Date(date);

        nextDay.setDate(
          nextDay.getDate() +
            1
        );

        const dayResults =
          results.filter(
            (result) => {
              if (
                !result.createdAt
              ) {
                return false;
              }

              const created =
                new Date(
                  result.createdAt
                );

              return (
                created >= date &&
                created < nextDay
              );
            }
          );

        const total =
          dayResults.reduce(
            (sum, result) =>
              sum +
              (result.total || 0),
            0
          );

        const correct =
          dayResults.reduce(
            (sum, result) =>
              sum +
              (result.score || 0),
            0
          );

        const value =
          total > 0
            ? Math.round(
                (correct / total) *
                  100
              )
            : 0;

        days.push({
          day: date
            .toLocaleDateString(
              "en-US",
              {
                weekday: "short",
              }
            )
            .toUpperCase(),

          value,
        });
      }

      return days;
    }, [results]);


  /* =========================================================
     ACTIVE DAYS
  ========================================================= */

  const activeDays =
    useMemo(() => {
      const uniqueDays =
        new Set();

      results.forEach(
        (result) => {
          if (
            result.createdAt
          ) {
            uniqueDays.add(
              new Date(
                result.createdAt
              ).toDateString()
            );
          }
        }
      );

      return uniqueDays.size;
    }, [results]);


  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#090909",
          color: "#ff8d58",
          display: "grid",
          placeItems: "center",
        }}
      >
        Loading performance...
      </div>
    );
  }


  return (
    <div className="performance-page">
      <div className="performance-glow performance-glow-one" />
      <div className="performance-glow performance-glow-two" />

      {/* HEADER */}

      <header className="performance-topbar">
        <button
          className="performance-back-button"
          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="performance-brand">
          <div className="performance-brand-icon">
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

        <button
          className="performance-start-button"
          onClick={() =>
            navigate("/quiz")
          }
        >
          <Play
            size={15}
            fill="currentColor"
          />

          Start Quiz
        </button>
      </header>

      <main className="performance-container">

        {error && (
          <div
            style={{
              marginBottom: "20px",
              color: "#e58f7e",
            }}
          >
            {error}
          </div>
        )}

        {/* HERO */}

        <section className="performance-hero">
          <div>
            <div className="performance-hero-badge">
              <BarChart3
                size={14}
              />

              LIVE LEARNING ANALYTICS
            </div>

            <h1>
              Track your growth.
              <br />

              <span>
                Learn from every answer.
              </span>
            </h1>

            <p>
              Your analytics are
              calculated directly from
              your saved MongoDB quiz
              history.
            </p>
          </div>

          <div className="performance-hero-score">
            <div className="performance-score-ring">
              <div>
                <strong>
                  {accuracy}
                </strong>

                <span>%</span>
              </div>
            </div>

            <div className="performance-score-info">
              <span>
                OVERALL PERFORMANCE
              </span>

              <strong>
                {accuracy >= 80
                  ? "Strong progress"
                  : accuracy >= 60
                  ? "Improving"
                  : quizzesCompleted > 0
                  ? "Needs practice"
                  : "Start learning"}
              </strong>

              <p>
                Based on{" "}
                {questionsAnswered}{" "}
                answered questions.
              </p>
            </div>
          </div>
        </section>

        {/* STATS */}

        <section className="performance-stats-grid">
          <PerformanceStat
            icon={Target}
            label="Overall Accuracy"
            value={`${accuracy}%`}
            description={`${correctAnswers} correct answers`}
            trend="Live"
          />

          <PerformanceStat
            icon={CheckCircle2}
            label="Questions Answered"
            value={questionsAnswered}
            description="Stored across your quizzes"
            trend={`${correctAnswers}`}
          />

          <PerformanceStat
            icon={Trophy}
            label="Quizzes Completed"
            value={quizzesCompleted}
            description="Saved in MongoDB"
            trend={`${quizzesCompleted}`}
          />

          <PerformanceStat
            icon={Flame}
            label="Learning Streak"
            value={`${streak} ${
              streak === 1
                ? "day"
                : "days"
            }`}
            description={`${activeDays} active learning days`}
            trend="Active"
          />
        </section>

        {/* MAIN GRID */}

        <section className="performance-main-grid">

          {/* GRAPH */}

          <div className="performance-panel performance-chart-panel">
            <div className="performance-panel-header">
              <div>
                <span>
                  LAST 7 DAYS
                </span>

                <h2>
                  Accuracy trend
                </h2>
              </div>

              <div className="performance-chart-badge">
                <TrendingUp
                  size={14}
                />

                Real data
              </div>
            </div>

            <div className="performance-chart-summary">
              <div>
                <strong>
                  {accuracy}%
                </strong>

                <span>
                  Overall accuracy
                </span>
              </div>

              <p>
                Calculated from your
                completed quizzes.
              </p>
            </div>

            <div className="performance-chart">
              <div className="performance-y-axis">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              <div className="performance-bars-area">
                <div className="performance-grid-lines">
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>

                <div className="performance-bars">
                  {weeklyData.map(
                    (item) => (
                      <div
                        className="performance-bar-column"
                        key={item.day}
                      >
                        <div className="performance-bar-value">
                          {
                            item.value
                          }
                          %
                        </div>

                        <div className="performance-bar-track">
                          <div
                            className="performance-bar-fill"
                            style={{
                              height:
                                `${item.value}%`,
                            }}
                          />
                        </div>

                        <span>
                          {item.day}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI */}

          <div className="performance-panel performance-ai-panel">
            <div className="performance-panel-header">
              <div>
                <span>
                  AI ANALYSIS
                </span>

                <h2>
                  Learning insight
                </h2>
              </div>

              <div className="performance-ai-badge">
                <Sparkles
                  size={14}
                />
                AI
              </div>
            </div>

            <div className="performance-ai-visual">
              <div className="performance-ai-ring ring-large" />
              <div className="performance-ai-ring ring-small" />

              <div className="performance-ai-center">
                <BrainCircuit
                  size={31}
                />
              </div>
            </div>

            <div className="performance-ai-message">
              <Sparkles
                size={17}
              />

              <div>
                <strong>
                  {weakestSubject
                    ? `${weakestSubject.name} needs the most attention.`
                    : "Complete your first quiz."}
                </strong>

                <p>
                  {weakestSubject
                    ? `Your current ${weakestSubject.name} accuracy is ${weakestSubject.progress}%.`
                    : "NeuraQuiz needs quiz history before it can calculate a focus area."}
                </p>
              </div>
            </div>

            <div className="performance-ai-focus">
              <div>
                <span>
                  NEXT FOCUS AREA
                </span>

                <strong>
                  {weakestSubject
                    ? weakestSubject.name
                    : "Not available"}
                </strong>

                <p>
                  {weakestSubject
                    ? weakestSubject.topic
                    : "Complete a quiz first"}
                </p>
              </div>

              <div className="performance-ai-focus-score">
                {weakestSubject
                  ? `${weakestSubject.progress}%`
                  : "--"}
              </div>
            </div>

            <button
              className="performance-practice-button"
              onClick={() =>
                navigate("/quiz")
              }
            >
              <Zap size={16} />

              Practice Recommended Subject

              <ArrowRight
                size={16}
              />
            </button>
          </div>
        </section>

        {/* SUBJECTS */}

        <section className="performance-panel performance-subject-panel">
          <div className="performance-panel-header">
            <div>
              <span>
                SUBJECT ANALYSIS
              </span>

              <h2>
                Your subject performance
              </h2>
            </div>

            <button
              className="performance-text-button"
              onClick={() =>
                navigate("/quiz")
              }
            >
              Practice
              <ArrowRight
                size={15}
              />
            </button>
          </div>

          <div className="performance-subject-list">
            {subjectData.map(
              ({
                name,
                topic,
                progress,
                quizzes,
                accuracy:
                  subjectAccuracy,
                icon: Icon,
                status,
              }) => (
                <div
                  className="performance-subject-row"
                  key={name}
                >
                  <div className="performance-subject-main">
                    <div className="performance-subject-icon">
                      <Icon
                        size={19}
                      />
                    </div>

                    <div className="performance-subject-name">
                      <strong>
                        {name}
                      </strong>

                      <span>
                        {topic}
                      </span>
                    </div>
                  </div>

                  <div className="performance-subject-progress">
                    <div className="performance-subject-progress-top">
                      <span>
                        Accuracy
                      </span>

                      <strong>
                        {progress}%
                      </strong>
                    </div>

                    <div className="performance-subject-track">
                      <div
                        style={{
                          width:
                            `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="performance-subject-stat">
                    <span>
                      QUIZZES
                    </span>

                    <strong>
                      {quizzes}
                    </strong>
                  </div>

                  <div className="performance-subject-stat">
                    <span>
                      ACCURACY
                    </span>

                    <strong>
                      {
                        subjectAccuracy
                      }
                    </strong>
                  </div>

                  <div
                    className={`performance-status ${
                      status ===
                      "Not Started"
                        ? ""
                        : `performance-status-${status
                            .toLowerCase()
                            .replace(
                              " ",
                              "-"
                            )}`
                    }`}
                  >
                    {status}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* INSIGHTS */}

        <section className="performance-insights-grid">

          <div className="performance-insight-card">
            <div className="performance-insight-icon strong-icon">
              <Trophy
                size={21}
              />
            </div>

            <span>
              STRONGEST SUBJECT
            </span>

            <h3>
              {strongestSubject
                ? strongestSubject.name
                : "No data yet"}
            </h3>

            <p>
              {strongestSubject
                ? `${strongestSubject.progress}% accuracy from ${strongestSubject.quizzes} quizzes.`
                : "Complete quizzes to identify your strongest subject."}
            </p>

            <div className="performance-small-progress">
              <div
                style={{
                  width:
                    `${strongestSubject?.progress || 0}%`,
                }}
              />
            </div>
          </div>

          <div className="performance-insight-card">
            <div className="performance-insight-icon focus-icon">
              <Target
                size={21}
              />
            </div>

            <span>
              NEEDS IMPROVEMENT
            </span>

            <h3>
              {weakestSubject
                ? weakestSubject.name
                : "No data yet"}
            </h3>

            <p>
              {weakestSubject
                ? `${weakestSubject.progress}% current accuracy.`
                : "Your weak area will appear after quiz attempts."}
            </p>

            <div className="performance-small-progress">
              <div
                style={{
                  width:
                    `${weakestSubject?.progress || 0}%`,
                }}
              />
            </div>
          </div>

          <div className="performance-insight-card">
            <div className="performance-insight-icon time-icon">
              <Star size={21} />
            </div>

            <span>
              TOTAL EXPERIENCE
            </span>

            <h3>
              {xp} XP
            </h3>

            <p>
              Experience earned from
              your completed adaptive
              quizzes.
            </p>

            <div className="performance-small-progress">
              <div
                style={{
                  width:
                    `${Math.min(
                      (xp % 500) /
                        5,
                      100
                    )}%`,
                }}
              />
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}

export default Performance;