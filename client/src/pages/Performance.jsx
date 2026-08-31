import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

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
    name:
      "Python",

    topic:
      "Programming Concepts",

    icon:
      Code2,
  },

  {
    name:
      "Machine Learning",

    topic:
      "Models & Algorithms",

    icon:
      BrainCircuit,
  },

  {
    name:
      "Data Structures",

    topic:
      "Core Structures",

    icon:
      Database,
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


      <p>
        {description}
      </p>

    </div>
  );
}


/* =========================================================
   PERFORMANCE
========================================================= */

function Performance() {
  const navigate =
    useNavigate();


  const [
    user,
    setUser,
  ] = useState(
    null
  );


  const [
    results,
    setResults,
  ] = useState(
    []
  );


  const [
    analytics,
    setAnalytics,
  ] = useState(
    null
  );


  const [
    loading,
    setLoading,
  ] = useState(
    true
  );


  const [
    error,
    setError,
  ] = useState(
    ""
  );


  /* =========================================================
     LOAD DATABASE DATA
  ========================================================= */

  useEffect(() => {
    const loadPerformance =
      async () => {
        try {
          setLoading(
            true
          );

          setError("");


          /* =============================================
             AUTH USER
          ============================================== */

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
                replace:
                  true,
              }
            );

            return;
          }


          setUser(
            userData.user
          );


          localStorage.setItem(
            "neuraUser",
            JSON.stringify(
              userData.user
            )
          );


          /* =============================================
             RESULTS + ANALYTICS
          ============================================== */

          const [
            resultResponse,
            analyticsResponse,
          ] = await Promise.all([
            fetch(
              `${API_BASE}/api/results?limit=50`,
              {
                credentials:
                  "include",
              }
            ),

            fetch(
              `${API_BASE}/api/analytics/topics`,
              {
                credentials:
                  "include",
              }
            ),
          ]);


          const [
            resultData,
            analyticsData,
          ] = await Promise.all([
            resultResponse.json(),
            analyticsResponse.json(),
          ]);


          if (
            resultResponse.ok &&
            resultData.success
          ) {
            setResults(
              resultData.results ||
                []
            );
          }


          if (
            analyticsResponse.ok &&
            analyticsData.success
          ) {
            setAnalytics(
              analyticsData.analytics ||
                null
            );
          }


        } catch (error) {
          setError(
            error.message ||
            "Could not load performance data."
          );

        } finally {
          setLoading(
            false
          );
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
     TOPIC ANALYTICS
  ========================================================= */

  const weakestTopic =
    analytics?.weakestTopic ||
    null;


  const strongestTopic =
    analytics?.strongestTopic ||
    null;


  const recommendedTopic =
    analytics?.recommendedTopic ||
    weakestTopic?.topic ||
    null;


  const recommendation =
    analytics?.recommendation ||
    (
      weakestTopic
        ? `Practice ${weakestTopic.topic} to improve your current topic accuracy.`
        : "Complete more adaptive quizzes to unlock personalized recommendations."
    );


  const overallTopicAccuracy =
    analytics?.overallAccuracy ||
    0;


  const totalTopics =
    analytics?.totalTopics ||
    0;


  const topicAnalytics =
    Array.isArray(
      analytics?.topics
    )
      ? analytics.topics
      : [];


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
              (
                sum,
                result
              ) =>
                sum +
                (
                  result.total ||
                  0
                ),
              0
            );


          const correct =
            subjectResults.reduce(
              (
                sum,
                result
              ) =>
                sum +
                (
                  result.score ||
                  0
                ),
              0
            );


          const progress =
            total > 0
              ? Math.round(
                  (
                    correct /
                    total
                  ) * 100
                )
              : 0;


          let status =
            "Not Started";


          if (total > 0) {
            if (
              progress >= 80
            ) {
              status =
                "Strong";

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
     STRONGEST + WEAKEST SUBJECT
  ========================================================= */

  const attemptedSubjects =
    subjectData.filter(
      (subject) =>
        subject.quizzes > 0
    );


  const strongestSubject =
    attemptedSubjects.length
      ? [...attemptedSubjects].sort(
          (
            a,
            b
          ) =>
            b.progress -
            a.progress
        )[0]
      : null;


  const weakestSubject =
    attemptedSubjects.length
      ? [...attemptedSubjects].sort(
          (
            a,
            b
          ) =>
            a.progress -
            b.progress
        )[0]
      : null;


  /* =========================================================
     DIFFICULTY PERFORMANCE
  ========================================================= */

  const difficultyPerformance =
    useMemo(() => {

      const summary = {
        Easy: {
          answered:
            0,

          correct:
            0,
        },

        Medium: {
          answered:
            0,

          correct:
            0,
        },

        Hard: {
          answered:
            0,

          correct:
            0,
        },
      };


      topicAnalytics.forEach(
        (topic) => {

          const difficultyStats =
            topic.difficultyStats ||
            {};


          const mapping = [
            [
              "Easy",
              "easy",
            ],

            [
              "Medium",
              "medium",
            ],

            [
              "Hard",
              "hard",
            ],
          ];


          mapping.forEach(
            ([
              label,
              key,
            ]) => {

              const difficulty =
                difficultyStats[
                  key
                ] || {};


              summary[
                label
              ].answered +=
                Number(
                  difficulty.answered
                ) || 0;


              summary[
                label
              ].correct +=
                Number(
                  difficulty.correct
                ) || 0;
            }
          );
        }
      );


      return Object.entries(
        summary
      ).map(
        ([
          difficulty,
          item,
        ]) => {

          const difficultyAccuracy =
            item.answered > 0
              ? Math.round(
                  (
                    item.correct /
                    item.answered
                  ) * 100
                )
              : 0;


          return {
            difficulty,

            answered:
              item.answered,

            correct:
              item.correct,

            accuracy:
              difficultyAccuracy,
          };
        }
      );

    }, [topicAnalytics]);


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
          new Date(
            date
          );


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
            (
              sum,
              result
            ) =>
              sum +
              (
                result.total ||
                0
              ),
            0
          );


        const correct =
          dayResults.reduce(
            (
              sum,
              result
            ) =>
              sum +
              (
                result.score ||
                0
              ),
            0
          );


        const value =
          total > 0
            ? Math.round(
                (
                  correct /
                  total
                ) * 100
              )
            : 0;


        days.push(
          {
            day:
              date
                .toLocaleDateString(
                  "en-US",
                  {
                    weekday:
                      "short",
                  }
                )
                .toUpperCase(),

            value,
          }
        );
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


      return (
        uniqueDays.size
      );

    }, [results]);


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight:
            "100vh",

          background:
            "#090909",

          color:
            "#ff8d58",

          display:
            "grid",

          placeItems:
            "center",
        }}
      >
        Loading performance...
      </div>
    );
  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="performance-page">

      <div className="performance-glow performance-glow-one" />
      <div className="performance-glow performance-glow-two" />


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="performance-topbar">

        <button
          className="performance-back-button"

          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft
            size={18}
          />

          Dashboard
        </button>


        <div className="performance-brand">

          <div className="performance-brand-icon">
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


        <button
          className="performance-start-button"

          onClick={() =>
            navigate(
              "/quiz"
            )
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


        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            style={{
              marginBottom:
                "20px",

              padding:
                "12px 15px",

              borderRadius:
                "10px",

              color:
                "#e58f7e",

              background:
                "rgba(255,105,78,0.04)",

              border:
                "1px solid rgba(255,105,78,0.1)",
            }}
          >
            {error}
          </div>
        )}


        {/* ===================================================
            HERO
        ==================================================== */}

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
              Your performance is calculated
              from verified MongoDB quiz
              history and personalized topic
              analytics.
            </p>

          </div>


          <div className="performance-hero-score">

            <div className="performance-score-ring">

              <div>
                <strong>
                  {accuracy}
                </strong>

                <span>
                  %
                </span>
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


        {/* ===================================================
            STATS
        ==================================================== */}

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
            label="Topic Accuracy"
            value={`${overallTopicAccuracy}%`}
            description={`${totalTopics} topics analyzed`}
            trend="AI"
          />


          <PerformanceStat
            icon={Trophy}
            label="Quizzes Completed"
            value={
              quizzesCompleted
            }
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


        {/* ===================================================
            MAIN GRID
        ==================================================== */}

        <section className="performance-main-grid">


          {/* =================================================
              GRAPH
          ================================================== */}

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

                        key={
                          item.day
                        }
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
                          {
                            item.day
                          }
                        </span>

                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              AI INSIGHT
          ================================================== */}

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
                  {weakestTopic
                    ? `${weakestTopic.topic} needs the most attention.`
                    : weakestSubject
                    ? `${weakestSubject.name} needs the most attention.`
                    : "Complete your first quiz."}
                </strong>


                <p>
                  {weakestTopic
                    ? `${weakestTopic.topic} is currently at ${weakestTopic.accuracy}% accuracy.`
                    : weakestSubject
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
                  {recommendedTopic ||
                    weakestSubject?.name ||
                    "Not available"}
                </strong>

                <p>
                  {weakestTopic
                    ? weakestTopic.subject
                    : weakestSubject
                    ? weakestSubject.topic
                    : "Complete a quiz first"}
                </p>
              </div>


              <div className="performance-ai-focus-score">
                {weakestTopic
                  ? `${weakestTopic.accuracy}%`
                  : weakestSubject
                  ? `${weakestSubject.progress}%`
                  : "--"}
              </div>

            </div>


            <div
              style={{
                marginBottom:
                  "14px",

                padding:
                  "12px 14px",

                borderRadius:
                  "12px",

                background:
                  "rgba(255,255,255,0.025)",

                border:
                  "1px solid rgba(255,255,255,0.06)",

                color:
                  "#8b837b",

                fontSize:
                  "9px",

                lineHeight:
                  1.6,
              }}
            >
              {recommendation}
            </div>


            <button
              className="performance-practice-button"

              onClick={() =>
                navigate(
                  "/quiz"
                )
              }
            >
              <Zap
                size={16}
              />

              Practice Recommended Topic

              <ArrowRight
                size={16}
              />
            </button>

          </div>

        </section>


        {/* ===================================================
            SUBJECTS
        ==================================================== */}

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
                navigate(
                  "/quiz"
                )
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

                  key={
                    name
                  }
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


        {/* ===================================================
            TOPIC ANALYTICS
        ==================================================== */}

        <section
          className="performance-panel"

          style={{
            marginTop:
              "20px",
          }}
        >

          <div className="performance-panel-header">

            <div>
              <span>
                TOPIC ANALYSIS
              </span>

              <h2>
                Topic performance
              </h2>
            </div>


            <div className="performance-chart-badge">
              <Target
                size={14}
              />

              {overallTopicAccuracy}% overall
            </div>

          </div>


          {topicAnalytics.length > 0 ? (

            <div
              style={{
                display:
                  "grid",

                gap:
                  "12px",

                marginTop:
                  "18px",
              }}
            >

              {topicAnalytics
                .slice(
                  0,
                  6
                )
                .map(
                  (
                    topic,
                    index
                  ) => (
                    <div
                      key={
                        `${topic.subject}-${topic.topic}-${index}`
                      }

                      style={{
                        display:
                          "grid",

                        gridTemplateColumns:
                          "minmax(170px, 1.2fr) 100px 1.6fr 75px",

                        gap:
                          "14px",

                        alignItems:
                          "center",

                        padding:
                          "14px 16px",

                        borderRadius:
                          "14px",

                        background:
                          "rgba(255,255,255,0.025)",

                        border:
                          "1px solid rgba(255,255,255,0.06)",
                      }}
                    >

                      <div>

                        <strong
                          style={{
                            display:
                              "block",

                            color:
                              "#eee7e0",

                            fontSize:
                              "12px",

                            marginBottom:
                              "4px",
                          }}
                        >
                          {
                            topic.topic
                          }
                        </strong>


                        <span
                          style={{
                            color:
                              "#756e67",

                            fontSize:
                              "9px",
                          }}
                        >
                          {
                            topic.subject
                          }
                        </span>

                      </div>


                      <span
                        style={{
                          color:
                            "#8e867e",

                          fontSize:
                            "9px",
                        }}
                      >
                        {
                          topic.correct ||
                          0
                        }
                        /
                        {
                          topic.answered ||
                          0
                        }
                        {" "}correct
                      </span>


                      <div
                        style={{
                          height:
                            "6px",

                          borderRadius:
                            "999px",

                          overflow:
                            "hidden",

                          background:
                            "rgba(255,255,255,0.06)",
                        }}
                      >
                        <div
                          style={{
                            width:
                              `${Math.max(
                                0,
                                Math.min(
                                  Number(
                                    topic.accuracy
                                  ) || 0,
                                  100
                                )
                              )}%`,

                            height:
                              "100%",

                            borderRadius:
                              "999px",

                            background:
                              "linear-gradient(90deg, #ff8d58, #f0b07f)",
                          }}
                        />
                      </div>


                      <strong
                        style={{
                          color:
                            "#ff9f70",

                          textAlign:
                            "right",

                          fontSize:
                            "11px",
                        }}
                      >
                        {
                          topic.accuracy
                        }
                        %
                      </strong>

                    </div>
                  )
                )}

            </div>

          ) : (

            <div
              style={{
                padding:
                  "35px 5px 10px",

                textAlign:
                  "center",

                color:
                  "#716a63",

                fontSize:
                  "10px",
              }}
            >
              Complete more quizzes to
              unlock topic-level
              performance.
            </div>

          )}

        </section>


        {/* ===================================================
            DIFFICULTY PERFORMANCE
        ==================================================== */}

        <section
          className="performance-panel"

          style={{
            marginTop:
              "20px",
          }}
        >

          <div className="performance-panel-header">

            <div>
              <span>
                DIFFICULTY ANALYSIS
              </span>

              <h2>
                Performance by difficulty
              </h2>
            </div>


            <div className="performance-chart-badge">
              <Zap
                size={14}
              />

              Adaptive levels
            </div>

          </div>


          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",

              gap:
                "14px",

              marginTop:
                "18px",
            }}
          >

            {difficultyPerformance.map(
              (item) => (
                <div
                  key={
                    item.difficulty
                  }

                  style={{
                    padding:
                      "18px",

                    borderRadius:
                      "14px",

                    border:
                      "1px solid rgba(255,255,255,0.06)",

                    background:
                      "rgba(255,255,255,0.025)",
                  }}
                >

                  <span
                    style={{
                      display:
                        "block",

                      color:
                        "#766f68",

                      fontSize:
                        "9px",

                      letterSpacing:
                        "1px",

                      marginBottom:
                        "8px",
                    }}
                  >
                    {
                      item.difficulty
                        .toUpperCase()
                    }
                  </span>


                  <strong
                    style={{
                      display:
                        "block",

                      color:
                        "#f3ece6",

                      fontSize:
                        "24px",

                      marginBottom:
                        "6px",
                    }}
                  >
                    {
                      item.accuracy
                    }
                    %
                  </strong>


                  <p
                    style={{
                      margin:
                        "0 0 12px",

                      color:
                        "#7d756d",

                      fontSize:
                        "9px",
                    }}
                  >
                    {
                      item.correct
                    }{" "}
                    correct from{" "}
                    {
                      item.answered
                    }{" "}
                    answers
                  </p>


                  <div
                    style={{
                      height:
                        "6px",

                      borderRadius:
                        "999px",

                      overflow:
                        "hidden",

                      background:
                        "rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        width:
                          `${item.accuracy}%`,

                        height:
                          "100%",

                        borderRadius:
                          "999px",

                        background:
                          "linear-gradient(90deg, #ff8d58, #f0b07f)",
                      }}
                    />
                  </div>

                </div>
              )
            )}

          </div>

        </section>


        {/* ===================================================
            INSIGHTS
        ==================================================== */}

        <section className="performance-insights-grid">


          {/* STRONGEST */}

          <div className="performance-insight-card">

            <div className="performance-insight-icon strong-icon">
              <Trophy
                size={21}
              />
            </div>


            <span>
              STRONGEST TOPIC
            </span>


            <h3>
              {strongestTopic
                ? strongestTopic.topic
                : strongestSubject
                ? strongestSubject.name
                : "No data yet"}
            </h3>


            <p>
              {strongestTopic
                ? `${strongestTopic.accuracy}% accuracy in ${strongestTopic.subject}.`
                : strongestSubject
                ? `${strongestSubject.progress}% accuracy from ${strongestSubject.quizzes} quizzes.`
                : "Complete quizzes to identify your strongest area."}
            </p>


            <div className="performance-small-progress">

              <div
                style={{
                  width:
                    `${strongestTopic?.accuracy ||
                    strongestSubject?.progress ||
                    0}%`,
                }}
              />

            </div>

          </div>


          {/* WEAKEST */}

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
              {weakestTopic
                ? weakestTopic.topic
                : weakestSubject
                ? weakestSubject.name
                : "No data yet"}
            </h3>


            <p>
              {weakestTopic
                ? `${weakestTopic.accuracy}% accuracy in ${weakestTopic.subject}.`
                : weakestSubject
                ? `${weakestSubject.progress}% current accuracy.`
                : "Your weak area will appear after quiz attempts."}
            </p>


            <div className="performance-small-progress">

              <div
                style={{
                  width:
                    `${weakestTopic?.accuracy ||
                    weakestSubject?.progress ||
                    0}%`,
                }}
              />

            </div>

          </div>


          {/* XP */}

          <div className="performance-insight-card">

            <div className="performance-insight-icon time-icon">
              <Star
                size={21}
              />
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
                      (
                        xp %
                        500
                      ) / 5,
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
