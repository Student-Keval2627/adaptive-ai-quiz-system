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
  Flame,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
  Zap,
} from "lucide-react";

import "./WeakTopics.css";


const API_BASE =
  "http://127.0.0.1:5000";


/* =========================================================
   PRIORITY
========================================================= */

function getPriority(
  accuracy,
) {
  const value =
    Number(
      accuracy
    ) || 0;

  if (value < 50) {
    return "High";
  }

  if (value < 75) {
    return "Medium";
  }

  return "Low";
}


/* =========================================================
   WEAK TOPICS PAGE
========================================================= */

function WeakTopics() {
  const navigate =
    useNavigate();


  const [
    user,
    setUser,
  ] = useState(
    null
  );


  const [
    analytics,
    setAnalytics,
  ] = useState(
    null
  );


  const [
    weakTopics,
    setWeakTopics,
  ] = useState(
    []
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
     LOAD REAL BACKEND ANALYTICS
  ========================================================= */

  useEffect(() => {
    const loadWeakTopics =
      async () => {
        try {
          setLoading(
            true
          );

          setError("");


          /* =============================================
             AUTH
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
             ANALYTICS
          ============================================== */

          const [
            analyticsResponse,
            weakResponse,
          ] = await Promise.all([
            fetch(
              `${API_BASE}/api/analytics/topics`,
              {
                credentials:
                  "include",
              }
            ),

            fetch(
              `${API_BASE}/api/analytics/weak-topics?limit=10`,
              {
                credentials:
                  "include",
              }
            ),
          ]);


          const [
            analyticsData,
            weakData,
          ] = await Promise.all([
            analyticsResponse.json(),
            weakResponse.json(),
          ]);


          if (
            !analyticsResponse.ok ||
            !analyticsData.success
          ) {
            throw new Error(
              analyticsData.message ||
              "Could not load topic analytics"
            );
          }


          if (
            !weakResponse.ok ||
            !weakData.success
          ) {
            throw new Error(
              weakData.message ||
              "Could not load weak topics"
            );
          }


          setAnalytics(
            analyticsData.analytics ||
              null
          );


          setWeakTopics(
            Array.isArray(
              weakData.topics
            )
              ? weakData.topics
              : []
          );


        } catch (error) {
          setError(
            error.message ||
            "Could not load weak-topic analysis."
          );

        } finally {
          setLoading(
            false
          );
        }
      };


    loadWeakTopics();

  }, [navigate]);


  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const topPriority =
    analytics?.weakestTopic ||
    weakTopics[0] ||
    null;


  const strongestTopic =
    analytics?.strongestTopic ||
    null;


  const recommendedTopic =
    analytics?.recommendedTopic ||
    topPriority?.topic ||
    null;


  const recommendation =
    analytics?.recommendation ||
    (
      topPriority
        ? `Practice ${topPriority.topic} to improve your current topic accuracy.`
        : "Complete adaptive quizzes to unlock a personalized study recommendation."
    );


  const totalMistakes =
    weakTopics.reduce(
      (
        sum,
        topic
      ) => (
        sum +
        (
          Number(
            topic.wrong
          ) || 0
        )
      ),
      0
    );


  const totalAnswered =
    analytics?.totalAnswered ||
    0;


  const overallAccuracy =
    analytics?.overallAccuracy ||
    0;


  const totalTopics =
    analytics?.totalTopics ||
    0;


  const quizzesCompleted =
    user?.stats
      ?.quizzesCompleted ||
    0;


  const streak =
    user?.stats
      ?.streak ||
    0;


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

          display:
            "grid",

          placeItems:
            "center",

          color:
            "#ff8d58",
        }}
      >
        Analyzing weak topics...
      </div>
    );
  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="weak-page">

      <div className="weak-glow weak-glow-one" />
      <div className="weak-glow weak-glow-two" />


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="weak-topbar">

        <button
          className="weak-back-button"

          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft
            size={18}
          />

          Dashboard
        </button>


        <div className="weak-brand">

          <div className="weak-brand-icon">
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
          className="weak-start-button"

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

          Start Practice
        </button>

      </header>


      <main className="weak-container">


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

        <section className="weak-hero">

          <div>

            <div className="weak-hero-badge">
              <Target
                size={14}
              />

              PERSONALIZED TOPIC ANALYSIS
            </div>


            <h1>
              Focus where it
              <br />

              <span>
                matters most.
              </span>
            </h1>


            <p>
              NeuraQuiz now uses the same
              backend analytics that power
              your adaptive quiz engine to
              identify weak topics and
              recommend what to practice next.
            </p>

          </div>


          <div className="weak-hero-card">

            <div className="weak-hero-card-icon">
              <TriangleAlert
                size={24}
              />
            </div>


            <div>
              <span>
                TOP PRIORITY
              </span>

              <strong>
                {topPriority
                  ? topPriority.topic
                  : "No weak topic"}
              </strong>

              <p>
                {topPriority
                  ? topPriority.subject
                  : "Complete more quizzes"}
              </p>
            </div>


            <div className="weak-hero-score">
              {topPriority
                ? `${topPriority.accuracy}%`
                : "--"}
            </div>

          </div>

        </section>


        {/* ===================================================
            SUMMARY
        ==================================================== */}

        <section className="weak-summary-grid">

          <div className="weak-summary-card">

            <div className="weak-summary-icon">
              <Target
                size={20}
              />
            </div>

            <strong>
              {weakTopics.length}
            </strong>

            <span>
              Weak Topics
            </span>

            <p>
              Topics currently below
              75% accuracy
            </p>

          </div>


          <div className="weak-summary-card">

            <div className="weak-summary-icon">
              <TriangleAlert
                size={20}
              />
            </div>

            <strong>
              {totalMistakes}
            </strong>

            <span>
              Mistakes
            </span>

            <p>
              Incorrect answers inside
              your weak topics
            </p>

          </div>


          <div className="weak-summary-card">

            <div className="weak-summary-icon">
              <TrendingUp
                size={20}
              />
            </div>

            <strong>
              {overallAccuracy}%
            </strong>

            <span>
              Topic Accuracy
            </span>

            <p>
              {totalAnswered} answers across
              {" "}
              {totalTopics} topics
            </p>

          </div>


          <div className="weak-summary-card">

            <div className="weak-summary-icon">
              <Flame
                size={20}
              />
            </div>

            <strong>
              {streak}
            </strong>

            <span>
              Day Streak
            </span>

            <p>
              {quizzesCompleted} completed
              {" "}
              {quizzesCompleted === 1
                ? "quiz"
                : "quizzes"}
            </p>

          </div>

        </section>


        {/* ===================================================
            MAIN
        ==================================================== */}

        <section className="weak-main-grid">


          {/* =================================================
              WEAK TOPICS
          ================================================== */}

          <div className="weak-panel">

            <div className="weak-panel-header">

              <div>
                <span>
                  AI PRIORITY LIST
                </span>

                <h2>
                  Topics to improve
                </h2>
              </div>


              <Sparkles
                size={20}
              />

            </div>


            {weakTopics.length > 0 ? (

              <div className="weak-topic-list">

                {weakTopics
                  .slice(0, 5)
                  .map(
                    (topic) => {

                      const priority =
                        getPriority(
                          topic.accuracy
                        );


                      const mistakes =
                        Number(
                          topic.wrong
                        ) || 0;


                      return (
                        <div
                          className="weak-topic-card"

                          key={
                            `${topic.subject}-${topic.topic}`
                          }
                        >

                          <div className="weak-topic-top">

                            <div className="weak-topic-main">

                              <div className="weak-topic-icon">
                                <BrainCircuit
                                  size={20}
                                />
                              </div>


                              <div>
                                <span>
                                  {
                                    topic.subject
                                  }
                                </span>

                                <h3>
                                  {
                                    topic.topic
                                  }
                                </h3>
                              </div>

                            </div>


                            <div
                              className={`weak-priority weak-priority-${priority.toLowerCase()}`}
                            >
                              {priority} Priority
                            </div>

                          </div>


                          <p className="weak-topic-description">
                            Backend analytics
                            found{" "}
                            {mistakes}{" "}
                            {mistakes === 1
                              ? "mistake"
                              : "mistakes"}{" "}
                            from{" "}
                            {topic.answered || 0}{" "}
                            answers in this
                            topic.
                          </p>


                          <div className="weak-topic-performance">

                            <div>
                              <span>
                                Current accuracy
                              </span>

                              <strong>
                                {
                                  topic.accuracy
                                }
                                %
                              </strong>
                            </div>


                            <div>
                              <span>
                                Correct
                              </span>

                              <strong>
                                {
                                  topic.correct ||
                                  0
                                }
                                /
                                {
                                  topic.answered ||
                                  0
                                }
                              </strong>
                            </div>

                          </div>


                          <div className="weak-progress-track">

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
                              }}
                            />

                          </div>


                          <button
                            className="weak-practice-button"

                            onClick={() =>
                              navigate(
                                "/quiz"
                              )
                            }
                          >
                            <Zap
                              size={15}
                            />

                            Practice with Focus Mode

                            <ArrowRight
                              size={16}
                            />
                          </button>

                        </div>
                      );
                    }
                  )}

              </div>

            ) : (

              <div
                style={{
                  padding:
                    "40px 5px",

                  textAlign:
                    "center",

                  color:
                    "#716a63",

                  fontSize:
                    "10px",
                }}
              >
                No weak topics detected.
                Complete more adaptive
                quizzes and NeuraQuiz will
                keep analyzing your
                performance.
              </div>

            )}

          </div>


          {/* =================================================
              AI PLAN
          ================================================== */}

          <div className="weak-panel weak-ai-panel">

            <div className="weak-panel-header">

              <div>
                <span>
                  AI STUDY PLAN
                </span>

                <h2>
                  Recommended next steps
                </h2>
              </div>


              <div className="weak-ai-label">
                <Sparkles
                  size={13}
                />

                AI
              </div>

            </div>


            <div className="weak-ai-visual">

              <div className="weak-ai-ring weak-ring-one" />
              <div className="weak-ai-ring weak-ring-two" />


              <div className="weak-ai-center">
                <BrainCircuit
                  size={31}
                />
              </div>

            </div>


            <div className="weak-ai-message">

              <Sparkles
                size={17}
              />


              <div>

                <strong>
                  {recommendedTopic
                    ? `Start with ${recommendedTopic}.`
                    : "More learning data needed."}
                </strong>


                <p>
                  {recommendation}
                </p>

              </div>

            </div>


            {strongestTopic && (
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
                }}
              >
                <span
                  style={{
                    display:
                      "block",

                    color:
                      "#716a63",

                    fontSize:
                      "9px",

                    marginBottom:
                      "5px",
                  }}
                >
                  CURRENT STRONGEST TOPIC
                </span>

                <strong
                  style={{
                    color:
                      "#eee7e0",

                    fontSize:
                      "12px",
                  }}
                >
                  {
                    strongestTopic.topic
                  }
                  {" "}•{" "}
                  {
                    strongestTopic.accuracy
                  }
                  %
                </strong>
              </div>
            )}


            <div className="weak-plan-list">

              {weakTopics.length > 0 ? (

                weakTopics
                  .slice(0, 3)
                  .map(
                    (
                      topic,
                      index
                    ) => (
                      <div
                        className="weak-plan-item"

                        key={
                          `${topic.subject}-${topic.topic}`
                        }
                      >

                        <div className="weak-plan-number">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>


                        <div>

                          <strong>
                            Practice{" "}
                            {
                              topic.topic
                            }
                          </strong>


                          <span>
                            {
                              topic.subject
                            }
                            {" "}•{" "}
                            {
                              topic.accuracy
                            }
                            % accuracy
                          </span>

                        </div>

                      </div>
                    )
                  )

              ) : (

                <div className="weak-plan-item">

                  <div className="weak-plan-number">
                    01
                  </div>


                  <div>
                    <strong>
                      Complete an adaptive quiz
                    </strong>

                    <span>
                      Build enough data for
                      personalized analysis
                    </span>
                  </div>

                </div>

              )}

            </div>


            <button
              className="weak-main-practice-button"

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

              Start Recommended Practice

              <ArrowRight
                size={17}
              />
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}


export default WeakTopics;
