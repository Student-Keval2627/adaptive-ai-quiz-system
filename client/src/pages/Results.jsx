import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Flame,
  Home,
  RefreshCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";

import "./Results.css";


const API_BASE =
  "http://127.0.0.1:5000";


function Results() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const routeResult =
    location.state || {};


  /* =========================================================
     STATE
  ========================================================= */

  const [
    savedResult,
    setSavedResult,
  ] = useState(null);

  const [
    userStats,
    setUserStats,
  ] = useState(
    routeResult.stats || {}
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  /* =========================================================
     LOAD SAVED RESULT FROM MONGODB
  ========================================================= */

  useEffect(() => {
    const loadResult =
      async () => {
        try {
          setLoading(true);
          setError("");


          /* =============================================
             LOAD RESULT HISTORY
          ============================================== */

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
            resultResponse.status ===
            401
          ) {
            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return;
          }


          if (
            resultResponse.ok &&
            resultData.success
          ) {
            const allResults =
              resultData.results ||
              [];


            let currentResult =
              null;


            if (
              routeResult.resultId
            ) {
              currentResult =
                allResults.find(
                  (item) =>
                    item.id ===
                    routeResult.resultId
                );
            }


            if (
              !currentResult &&
              allResults.length > 0
            ) {
              currentResult =
                allResults[0];
            }


            if (
              currentResult
            ) {
              setSavedResult(
                currentResult
              );
            }
          }


          /* =============================================
             LOAD UPDATED USER STATS
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
            userResponse.ok &&
            userData.authenticated
          ) {
            setUserStats(
              userData.user
                ?.stats || {}
            );
          }

        } catch (error) {
          console.error(
            "Result load error:",
            error
          );

          setError(
            "Could not load full result analysis."
          );

        } finally {
          setLoading(false);
        }
      };


    loadResult();

  }, [
    navigate,
    routeResult.resultId,
  ]);


  /* =========================================================
     RESULT VALUES
  ========================================================= */

  const subject =
    savedResult?.subject ||
    routeResult.subject ||
    "Adaptive Quiz";


  const score =
    savedResult?.score ??
    routeResult.score ??
    0;


  const total =
    savedResult?.total ??
    routeResult.total ??
    5;


  const accuracy =
    savedResult?.accuracy ??
    routeResult.accuracy ??
    (
      total > 0
        ? Math.round(
            (score / total) *
            100
          )
        : 0
    );


  const wrongAnswers =
    Math.max(
      total - score,
      0
    );


  const xpEarned =
    routeResult.xpEarned ??
    (
      score * 20 + 50
    );


  const level =
    userStats.level || 1;


  const streak =
    userStats.streak || 0;


  const totalXp =
    userStats.xp || 0;


  const difficultyMode =
    routeResult.difficulty ||
    "Adaptive";


  const focusMode =
    routeResult.focusMode ??
    true;


  /* =========================================================
     ANSWERS
  ========================================================= */

  const answers =
    savedResult?.answers || [];


  /* =========================================================
     WRONG TOPIC ANALYSIS
  ========================================================= */

  const wrongTopics =
    useMemo(() => {
      const topicMap = {};


      answers.forEach(
        (answer) => {
          if (
            answer.correct
          ) {
            return;
          }


          const topic =
            answer.topic ||
            "General";


          if (
            !topicMap[topic]
          ) {
            topicMap[topic] = {
              topic,
              mistakes: 0,
            };
          }


          topicMap[
            topic
          ].mistakes += 1;
        }
      );


      return Object.values(
        topicMap
      ).sort(
        (a, b) =>
          b.mistakes -
          a.mistakes
      );

    }, [answers]);


  const mainWeakTopic =
    wrongTopics[0] || null;


  /* =========================================================
     DIFFICULTY JOURNEY
  ========================================================= */

  const difficultyJourney =
    useMemo(() => {
      if (
        answers.length === 0
      ) {
        return [];
      }


      return answers.map(
        (answer) =>
          answer.difficulty ||
          "Medium"
      );

    }, [answers]);


  /* =========================================================
     TOPIC PERFORMANCE
  ========================================================= */

  const topicPerformance =
    useMemo(() => {
      const topicMap = {};


      answers.forEach(
        (answer) => {
          const topic =
            answer.topic ||
            "General";


          if (
            !topicMap[topic]
          ) {
            topicMap[topic] = {
              topic,
              total: 0,
              correct: 0,
            };
          }


          topicMap[
            topic
          ].total += 1;


          if (
            answer.correct
          ) {
            topicMap[
              topic
            ].correct += 1;
          }
        }
      );


      return Object.values(
        topicMap
      ).map(
        (item) => ({
          ...item,

          accuracy:
            item.total > 0
              ? Math.round(
                  (
                    item.correct /
                    item.total
                  ) * 100
                )
              : 0,
        })
      );

    }, [answers]);


  /* =========================================================
     PERFORMANCE MESSAGE
  ========================================================= */

  const performance =
    useMemo(() => {
      if (
        accuracy >= 90
      ) {
        return {
          title:
            "Outstanding performance",

          message:
            "Excellent work. Your quiz accuracy shows a very strong understanding of this subject.",

          level:
            "Excellent",
        };
      }


      if (
        accuracy >= 75
      ) {
        return {
          title:
            "Great progress",

          message:
            "You understand most concepts well. Focused practice on your missed topics can push your score even higher.",

          level:
            "Great",
        };
      }


      if (
        accuracy >= 60
      ) {
        return {
          title:
            "Good attempt",

          message:
            "You are making progress, but some concepts still need more focused practice.",

          level:
            "Improving",
        };
      }


      return {
        title:
          "Keep learning",

        message:
          "This subject needs more attention. Another adaptive practice session can help strengthen your weak areas.",

        level:
          "Needs Practice",
      };

    }, [accuracy]);


  /* =========================================================
     PERSONALIZED RECOMMENDATION
  ========================================================= */

  const recommendation =
    useMemo(() => {
      if (
        mainWeakTopic
      ) {
        return {
          title:
            `Focus on ${mainWeakTopic.topic}`,

          message:
            `You made ${mainWeakTopic.mistakes} ${
              mainWeakTopic.mistakes ===
              1
                ? "mistake"
                : "mistakes"
            } in ${mainWeakTopic.topic}. Your next practice session should prioritize this topic.`,
        };
      }


      if (
        accuracy >= 80
      ) {
        return {
          title:
            "You're ready for a harder challenge",

          message:
            "No major weak topic was detected in this attempt. Continue with adaptive mode and let the engine increase the challenge.",
        };
      }


      return {
        title:
          "Continue adaptive practice",

        message:
          "Complete another quiz to build more learning data and improve topic-level recommendations.",
      };

    }, [
      accuracy,
      mainWeakTopic,
    ]);


  /* =========================================================
     LOADING
  ========================================================= */

  if (
    loading &&
    !routeResult.subject
  ) {
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
        Loading result analysis...
      </div>
    );
  }


  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="results-page">

      <div className="results-glow results-glow-one" />

      <div className="results-glow results-glow-two" />


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="results-topbar">

        <button
          className="results-back-button"
          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft
            size={18}
          />

          Dashboard
        </button>


        <div className="results-brand">

          <div className="results-brand-icon">
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


        <div className="results-status">

          <CheckCircle2
            size={15}
          />

          Quiz Completed
        </div>

      </header>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="results-container">


        {/* ERROR */}

        {error && (
          <div
            style={{
              marginBottom:
                "18px",

              padding:
                "12px 15px",

              borderRadius:
                "10px",

              border:
                "1px solid rgba(255, 120, 85, 0.15)",

              background:
                "rgba(255, 120, 85, 0.05)",

              color:
                "#e89b8a",
            }}
          >
            {error}
          </div>
        )}


        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="results-hero">

          <div className="results-complete-badge">

            <Sparkles
              size={14}
            />

            QUIZ COMPLETE
          </div>


          <h1>
            Nice work.
            <br />

            <span>
              Here's how you performed.
            </span>
          </h1>


          <p>
            NeuraQuiz analyzed your
            saved quiz answers, adaptive
            difficulty and topic
            performance to prepare this
            learning summary.
          </p>

        </section>


        {/* ===================================================
            MAIN GRID
        ==================================================== */}

        <section className="results-main-grid">


          {/* =================================================
              SCORE
          ================================================== */}

          <div className="results-score-card">

            <div className="results-card-label">

              <Trophy
                size={17}
              />

              FINAL SCORE
            </div>


            <div className="results-score-circle">

              <div
                className="results-score-progress"

                style={{
                  "--score-angle":
                    `${accuracy * 3.6}deg`,
                }}
              >

                <div className="results-score-inner">

                  <strong>
                    {accuracy}
                  </strong>

                  <span>
                    %
                  </span>

                </div>

              </div>

            </div>


            <div className="results-score-text">

              <h2>
                {performance.title}
              </h2>

              <p>
                {performance.message}
              </p>

            </div>


            <div className="results-subject-pill">

              <BrainCircuit
                size={15}
              />

              <div>

                <span>
                  SUBJECT
                </span>

                <strong>
                  {subject}
                </strong>

              </div>

            </div>

          </div>


          {/* =================================================
              SUMMARY
          ================================================== */}

          <div className="results-summary-card">

            <div className="results-section-header">

              <div>
                <span>
                  PERFORMANCE
                </span>

                <h2>
                  Quiz summary
                </h2>
              </div>

              <BarChart3
                size={20}
              />

            </div>


            <div className="results-stats-grid">


              {/* SCORE */}

              <div className="result-stat-box">

                <div className="result-stat-icon result-stat-score">
                  <Trophy
                    size={19}
                  />
                </div>

                <div>

                  <span>
                    Score
                  </span>

                  <strong>
                    {score}

                    <small>
                      /{total}
                    </small>
                  </strong>

                </div>

              </div>


              {/* CORRECT */}

              <div className="result-stat-box">

                <div className="result-stat-icon result-stat-correct">
                  <CheckCircle2
                    size={19}
                  />
                </div>

                <div>

                  <span>
                    Correct
                  </span>

                  <strong>
                    {score}
                  </strong>

                </div>

              </div>


              {/* WRONG */}

              <div className="result-stat-box">

                <div className="result-stat-icon result-stat-wrong">
                  <XCircle
                    size={19}
                  />
                </div>

                <div>

                  <span>
                    Incorrect
                  </span>

                  <strong>
                    {wrongAnswers}
                  </strong>

                </div>

              </div>


              {/* ACCURACY */}

              <div className="result-stat-box">

                <div className="result-stat-icon result-stat-accuracy">
                  <Target
                    size={19}
                  />
                </div>

                <div>

                  <span>
                    Accuracy
                  </span>

                  <strong>
                    {accuracy}%
                  </strong>

                </div>

              </div>

            </div>


            {/* PERFORMANCE */}

            <div className="results-performance-area">

              <div className="results-performance-heading">

                <span>
                  Overall performance
                </span>

                <strong>
                  {performance.level}
                </strong>

              </div>


              <div className="results-performance-track">

                <div
                  className="results-performance-fill"

                  style={{
                    width:
                      `${accuracy}%`,
                  }}
                />

              </div>


              <div className="results-performance-scale">

                <span>
                  Beginner
                </span>

                <span>
                  Improving
                </span>

                <span>
                  Strong
                </span>

              </div>

            </div>


            {/* REAL RECOMMENDATION */}

            <div className="results-ai-insight">

              <div className="results-ai-icon">
                <Sparkles
                  size={19}
                />
              </div>


              <div>

                <span>
                  LEARNING INSIGHT
                </span>

                <h3>
                  {
                    recommendation.title
                  }
                </h3>

                <p>
                  {
                    recommendation.message
                  }
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            ATTEMPT ANALYSIS
        ==================================================== */}

        <section
          className="results-next-card"
          style={{
            alignItems:
              "stretch",
          }}
        >

          <div
            style={{
              width: "100%",
            }}
          >

            <div
              className="results-section-header"
              style={{
                marginBottom:
                  "22px",
              }}
            >

              <div>
                <span>
                  ADAPTIVE ANALYSIS
                </span>

                <h2>
                  This quiz journey
                </h2>
              </div>

              <BrainCircuit
                size={20}
              />

            </div>


            {/* SETTINGS / XP / LEVEL */}

            <div className="results-stats-grid">

              <div className="result-stat-box">

                <div className="result-stat-icon result-stat-score">
                  <Star
                    size={19}
                  />
                </div>

                <div>
                  <span>
                    XP Earned
                  </span>

                  <strong>
                    +{xpEarned}
                  </strong>
                </div>

              </div>


              <div className="result-stat-box">

                <div className="result-stat-icon result-stat-correct">
                  <Trophy
                    size={19}
                  />
                </div>

                <div>
                  <span>
                    Level
                  </span>

                  <strong>
                    {level}
                  </strong>
                </div>

              </div>


              <div className="result-stat-box">

                <div className="result-stat-icon result-stat-wrong">
                  <Flame
                    size={19}
                  />
                </div>

                <div>
                  <span>
                    Streak
                  </span>

                  <strong>
                    {streak}
                  </strong>
                </div>

              </div>


              <div className="result-stat-box">

                <div className="result-stat-icon result-stat-accuracy">
                  <Zap
                    size={19}
                  />
                </div>

                <div>
                  <span>
                    Start Mode
                  </span>

                  <strong>
                    {difficultyMode}
                  </strong>
                </div>

              </div>

            </div>


            {/* DIFFICULTY JOURNEY */}

            <div
              className="results-performance-area"
              style={{
                marginTop:
                  "22px",
              }}
            >

              <div className="results-performance-heading">

                <span>
                  Difficulty journey
                </span>

                <strong>
                  {focusMode
                    ? "Focus ON"
                    : "Focus OFF"}
                </strong>

              </div>


              <div
                style={{
                  display:
                    "flex",

                  gap:
                    "8px",

                  flexWrap:
                    "wrap",

                  marginTop:
                    "15px",
                }}
              >

                {difficultyJourney.length >
                0 ? (
                  difficultyJourney.map(
                    (
                      difficulty,
                      index
                    ) => (
                      <div
                        key={`${difficulty}-${index}`}

                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap:
                            "8px",
                        }}
                      >

                        <span
                          style={{
                            padding:
                              "8px 12px",

                            borderRadius:
                              "999px",

                            border:
                              "1px solid rgba(255,255,255,0.08)",

                            background:
                              "rgba(255,255,255,0.03)",

                            fontSize:
                              "10px",

                            fontWeight:
                              "700",
                          }}
                        >
                          Q{index + 1}
                          {" "}
                          {difficulty}
                        </span>


                        {index <
                          difficultyJourney.length -
                            1 && (
                          <ArrowRight
                            size={14}
                          />
                        )}

                      </div>
                    )
                  )
                ) : (
                  <span
                    style={{
                      opacity:
                        0.6,
                    }}
                  >
                    Difficulty history unavailable
                  </span>
                )}

              </div>

            </div>


            {/* WRONG TOPICS */}

            <div
              className="results-ai-insight"
              style={{
                marginTop:
                  "22px",
              }}
            >

              <div className="results-ai-icon">

                {wrongTopics.length >
                0 ? (
                  <Target
                    size={19}
                  />
                ) : (
                  <CheckCircle2
                    size={19}
                  />
                )}

              </div>


              <div>

                <span>
                  TOPIC ANALYSIS
                </span>


                <h3>
                  {wrongTopics.length >
                  0
                    ? "Topics that need more practice"
                    : "No weak topic detected in this attempt"}
                </h3>


                {wrongTopics.length >
                0 ? (
                  <p>
                    {wrongTopics
                      .map(
                        (item) =>
                          `${item.topic} (${item.mistakes} ${
                            item.mistakes ===
                            1
                              ? "mistake"
                              : "mistakes"
                          })`
                      )
                      .join(
                        " • "
                      )}
                  </p>
                ) : (
                  <p>
                    You answered every
                    saved topic correctly
                    in this quiz.
                  </p>
                )}

              </div>

            </div>


            {/* TOPIC PERFORMANCE */}

            {topicPerformance.length >
              0 && (
              <div
                style={{
                  marginTop:
                    "22px",
                }}
              >

                <div className="results-performance-heading">

                  <span>
                    Topic accuracy
                  </span>

                  <strong>
                    {
                      topicPerformance.length
                    }{" "}
                    topics
                  </strong>

                </div>


                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(160px, 1fr))",

                    gap:
                      "10px",

                    marginTop:
                      "14px",
                  }}
                >

                  {topicPerformance.map(
                    (topic) => (
                      <div
                        className="result-stat-box"
                        key={
                          topic.topic
                        }
                      >

                        <div>
                          <span>
                            {
                              topic.topic
                            }
                          </span>

                          <strong>
                            {
                              topic.accuracy
                            }
                            %
                          </strong>
                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          </div>

        </section>


        {/* ===================================================
            NEXT STEP
        ==================================================== */}

        <section className="results-next-card">

          <div className="results-next-content">

            <div className="results-next-icon">
              <Zap
                size={24}
              />
            </div>


            <div>

              <span>
                WHAT'S NEXT?
              </span>

              <h2>
                {mainWeakTopic
                  ? `Strengthen ${mainWeakTopic.topic}.`
                  : "Continue building your knowledge."}
              </h2>


              <p>
                {mainWeakTopic
                  ? `Your next adaptive quiz can help reinforce ${mainWeakTopic.topic} while continuing to adjust difficulty from your answers.`
                  : "Try another adaptive quiz or explore your performance analytics to continue building your learning history."}
              </p>

            </div>

          </div>


          <div className="results-actions">

            <button
              className="results-secondary-button"
              onClick={() =>
                navigate("/")
              }
            >
              <Home
                size={17}
              />

              Dashboard
            </button>


            <button
              className="results-secondary-button"
              onClick={() =>
                navigate(
                  "/performance"
                )
              }
            >
              <BarChart3
                size={17}
              />

              Performance
            </button>


            <button
              className="results-primary-button"
              onClick={() =>
                navigate(
                  "/quiz"
                )
              }
            >
              <RefreshCcw
                size={17}
              />

              Try Another Quiz

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


export default Results;