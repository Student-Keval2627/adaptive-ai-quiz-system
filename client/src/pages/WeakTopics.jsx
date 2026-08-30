import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

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


function WeakTopics() {
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
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    const loadWeakTopics =
      async () => {
        try {
          setLoading(true);

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
            "Could not load weak-topic analysis."
          );
        } finally {
          setLoading(false);
        }
      };

    loadWeakTopics();
  }, [navigate]);


  /* =========================================================
     TOPIC ANALYSIS
  ========================================================= */

  const analysis =
    useMemo(() => {
      const topicMap = {};

      results.forEach(
        (result) => {
          const answers =
            result.answers || [];

          answers.forEach(
            (answer) => {
              const topic =
                answer.topic ||
                "General";

              const key =
                `${result.subject}::${topic}`;

              if (!topicMap[key]) {
                topicMap[key] = {
                  subject:
                    result.subject,

                  topic,

                  total: 0,

                  correct: 0,

                  mistakes: 0,
                };
              }

              topicMap[key].total +=
                1;

              if (
                answer.correct
              ) {
                topicMap[
                  key
                ].correct += 1;
              } else {
                topicMap[
                  key
                ].mistakes += 1;
              }
            }
          );
        }
      );

      return Object.values(
        topicMap
      )
        .map((item) => {
          const accuracy =
            item.total > 0
              ? Math.round(
                  (
                    item.correct /
                    item.total
                  ) * 100
                )
              : 0;

          let priority =
            "Low";

          if (accuracy < 60) {
            priority = "High";
          } else if (
            accuracy < 75
          ) {
            priority =
              "Medium";
          }

          return {
            ...item,
            accuracy,
            priority,
          };
        })
        .filter(
          (item) =>
            item.mistakes > 0
        )
        .sort(
          (a, b) => {
            if (
              a.accuracy !==
              b.accuracy
            ) {
              return (
                a.accuracy -
                b.accuracy
              );
            }

            return (
              b.mistakes -
              a.mistakes
            );
          }
        );
    }, [results]);


  const weakTopics =
    analysis.slice(0, 3);

  const topPriority =
    weakTopics[0] || null;


  /* =========================================================
     TOTAL MISTAKES
  ========================================================= */

  const totalMistakes =
    analysis.reduce(
      (sum, item) =>
        sum +
        item.mistakes,
      0
    );


  const streak =
    user?.stats?.streak || 0;


  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#090909",
          display: "grid",
          placeItems: "center",
          color: "#ff8d58",
        }}
      >
        Analyzing weak topics...
      </div>
    );
  }


  return (
    <div className="weak-page">
      <div className="weak-glow weak-glow-one" />
      <div className="weak-glow weak-glow-two" />

      {/* HEADER */}

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
            navigate("/quiz")
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

        <section className="weak-hero">
          <div>
            <div className="weak-hero-badge">
              <Target
                size={14}
              />

              REAL QUIZ ANALYSIS
            </div>

            <h1>
              Focus where it
              <br />

              <span>
                matters most.
              </span>
            </h1>

            <p>
              Your weak topics are now
              calculated from the actual
              answers stored in your
              MongoDB quiz history.
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

        {/* SUMMARY */}

        <section className="weak-summary-grid">
          <div className="weak-summary-card">
            <div className="weak-summary-icon">
              <Target
                size={20}
              />
            </div>

            <strong>
              {analysis.length}
            </strong>

            <span>
              Weak Topics
            </span>

            <p>
              Topics containing incorrect
              answers
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
              Incorrect answers analyzed
              from quiz history
            </p>
          </div>

          <div className="weak-summary-card">
            <div className="weak-summary-icon">
              <TrendingUp
                size={20}
              />
            </div>

            <strong>
              {
                results.length
              }
            </strong>

            <span>
              Quizzes Analyzed
            </span>

            <p>
              Real completed quiz
              sessions
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
              Current learning
              consistency
            </p>
          </div>
        </section>

        {/* MAIN */}

        <section className="weak-main-grid">

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

            {weakTopics.length >
            0 ? (
              <div className="weak-topic-list">
                {weakTopics.map(
                  ({
                    subject,
                    topic,
                    accuracy,
                    mistakes,
                    priority,
                  }) => (
                    <div
                      className="weak-topic-card"
                      key={`${subject}-${topic}`}
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
                              {subject}
                            </span>

                            <h3>
                              {topic}
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
                        This analysis is
                        based on your real
                        answers. You made{" "}
                        {mistakes}{" "}
                        {mistakes === 1
                          ? "mistake"
                          : "mistakes"}{" "}
                        in this topic.
                      </p>

                      <div className="weak-topic-performance">
                        <div>
                          <span>
                            Current accuracy
                          </span>

                          <strong>
                            {accuracy}%
                          </strong>
                        </div>

                        <div>
                          <span>
                            Mistakes
                          </span>

                          <strong>
                            {mistakes}
                          </strong>
                        </div>
                      </div>

                      <div className="weak-progress-track">
                        <div
                          style={{
                            width:
                              `${accuracy}%`,
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

                        Practice this topic

                        <ArrowRight
                          size={16}
                        />
                      </button>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div
                style={{
                  padding: "40px 5px",
                  textAlign: "center",
                  color: "#716a63",
                  fontSize: "10px",
                }}
              >
                No weak topics detected
                yet. Complete quizzes and
                incorrect answers will be
                analyzed here.
              </div>
            )}
          </div>

          {/* AI PLAN */}

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
                  {topPriority
                    ? `Start with ${topPriority.topic}.`
                    : "More learning data needed."}
                </strong>

                <p>
                  {topPriority
                    ? `${topPriority.topic} currently has your lowest analyzed accuracy at ${topPriority.accuracy}%.`
                    : "Complete adaptive quizzes to generate a personalized study plan."}
                </p>
              </div>
            </div>

            <div className="weak-plan-list">
              {weakTopics.length >
              0 ? (
                weakTopics.map(
                  (
                    topic,
                    index
                  ) => (
                    <div
                      className="weak-plan-item"
                      key={`${topic.subject}-${topic.topic}`}
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
                          {topic.topic}
                        </strong>

                        <span>
                          {topic.subject} •{" "}
                          {topic.accuracy}%
                          accuracy
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
                      Complete an adaptive
                      quiz
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
                navigate("/quiz")
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