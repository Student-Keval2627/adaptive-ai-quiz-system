import {
  LayoutDashboard,
  BrainCircuit,
  BarChart3,
  Trophy,
  Target,
  Settings,
  Bell,
  Search,
  Flame,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Play,
  BookOpen,
  Zap,
  CircleUserRound,
  MoreHorizontal,
  CheckCircle2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

const API_BASE =
  "http://127.0.0.1:5000";

const FALLBACK_SUBJECTS = [
  "Python",
  "C Programming",
  "C++",
  "Java",
  "JavaScript",
  "TypeScript",
  "Data Structures",
  "Algorithms",
  "SQL",
  "DBMS",
  "Operating Systems",
  "Computer Networks",
  "Object Oriented Programming",
  "Machine Learning",
  "Web Development",
  "React",
  "Node.js",
  "Flask",
  "Django",
  "Git & GitHub",
  "Software Engineering",
  "Computer Architecture",
];

function getSubjectIcon(
  subjectName
) {
  const predefined = {
    Python: "PY",
    "Machine Learning": "ML",
    "Data Structures": "DS",
    "C Programming": "C",
    "C++": "C++",
    Java: "JV",
    JavaScript: "JS",
    TypeScript: "TS",
    Algorithms: "AL",
    SQL: "SQL",
    DBMS: "DB",
    "Operating Systems": "OS",
    "Computer Networks": "CN",
    "Object Oriented Programming": "OOP",
    "Web Development": "WEB",
    React: "RE",
    "Node.js": "ND",
    Flask: "FL",
    Django: "DJ",
    "Git & GitHub": "GIT",
    "Software Engineering": "SE",
    "Computer Architecture": "CA",
  };

  if (
    predefined[
      subjectName
    ]
  ) {
    return predefined[
      subjectName
    ];
  }

  const words =
    String(
      subjectName || ""
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (
    words.length === 0
  ) {
    return "AI";
  }

  if (
    words.length === 1
  ) {
    return words[0]
      .slice(0, 3)
      .toUpperCase();
  }

  return words
    .slice(0, 3)
    .map(
      (word) =>
        word.charAt(0)
    )
    .join("")
    .toUpperCase();
}

function Sidebar({
  user,
}) {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const menu = [
    {
      icon:
        LayoutDashboard,
      name:
        "Overview",
      path:
        "/",
    },
    {
      icon:
        BrainCircuit,
      name:
        "Adaptive Quiz",
      path:
        "/quiz",
    },
    {
      icon:
        BarChart3,
      name:
        "Performance",
      path:
        "/performance",
    },
    {
      icon:
        Target,
      name:
        "Weak Topics",
      path:
        "/weak-topics",
    },
    {
      icon:
        Trophy,
      name:
        "Achievements",
      path:
        "/achievements",
    },
  ];

  const userName =
    user?.name ||
    "Student";

  const firstLetter =
    userName
      .charAt(0)
      .toUpperCase();

  return (
    <aside className="sidebar">
      <div>
        <div
          className="brand"
          onClick={() =>
            navigate("/")
          }
          style={{
            cursor:
              "pointer",
          }}
        >
          <div className="brand-logo">
            <BrainCircuit
              size={22}
            />
          </div>

          <div>
            <h2>
              NeuraQuiz
            </h2>

            <span>
              Adaptive AI
            </span>
          </div>
        </div>

        <p className="sidebar-label">
          WORKSPACE
        </p>

        <nav className="sidebar-menu">
          {menu.map(
            ({
              icon: Icon,
              name,
              path,
            }) => {
              const active =
                location.pathname ===
                path;

              return (
                <button
                  key={name}
                  onClick={() =>
                    navigate(
                      path
                    )
                  }
                  className={`sidebar-link ${
                    active
                      ? "active"
                      : ""
                  }`}
                >
                  <Icon
                    size={19}
                  />

                  <span>
                    {name}
                  </span>

                  {active && (
                    <div className="active-indicator" />
                  )}
                </button>
              );
            }
          )}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button
          className="sidebar-link"
          onClick={() =>
            navigate(
              "/settings"
            )
          }
        >
          <Settings
            size={19}
          />

          <span>
            Settings
          </span>
        </button>

        <div
          className="sidebar-profile"
          onClick={() =>
            navigate(
              "/profile"
            )
          }
          style={{
            cursor:
              "pointer",
          }}
        >
          <div className="profile-avatar">
            {firstLetter}
          </div>

          <div className="profile-details">
            <strong>
              {userName}
            </strong>

            <span>
              {user?.role ||
                "Student"}
            </span>
          </div>

          <MoreHorizontal
            size={18}
          />
        </div>
      </div>
    </aside>
  );
}

function Header({
  user,
}) {
  const navigate =
    useNavigate();

  const userName =
    user?.name ||
    "Student";

  return (
    <header className="topbar">
      <div>
        <p className="welcome-small">
          WELCOME BACK
        </p>

        <h1>
          Ready to learn,{" "}
          <span>
            {userName}?
          </span>
        </h1>
      </div>

      <div className="topbar-actions">
        <div className="search-box">
          <Search
            size={17}
          />

          <input
            type="text"
            placeholder="Search topics..."
          />

          <span>
            ⌘ K
          </span>
        </div>

        <button
          className="icon-button notification-button"
          type="button"
        >
          <Bell
            size={19}
          />

          <span className="notification-dot" />
        </button>

        <button
          className="avatar-button"
          type="button"
          onClick={() =>
            navigate(
              "/profile"
            )
          }
        >
          <CircleUserRound
            size={22}
          />
        </button>
      </div>
    </header>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  badge,
}) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon">
          <Icon
            size={20}
          />
        </div>

        <span className="stat-badge">
          {badge}
        </span>
      </div>

      <div className="stat-value">
        {value}
      </div>

      <div className="stat-label">
        {label}
      </div>

      <div className="stat-description">
        {description}
      </div>
    </article>
  );
}

function Dashboard() {
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
    availableSubjects,
    setAvailableSubjects,
  ] = useState(
    FALLBACK_SUBJECTS
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

  useEffect(() => {
    let active =
      true;

    const loadDashboard =
      async () => {
        try {
          setLoading(
            true
          );

          setError(
            ""
          );

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

          if (!active) {
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

          let subjects =
            Array.isArray(
              userData.availableSubjects
            )
              ? userData.availableSubjects
                  .map(
                    (name) =>
                      String(
                        name || ""
                      ).trim()
                  )
                  .filter(Boolean)
              : [];

          if (
            subjects.length ===
            0
          ) {
            try {
              const subjectResponse =
                await fetch(
                  `${API_BASE}/api/quiz/subjects`,
                  {
                    credentials:
                      "include",
                  }
                );

              const subjectData =
                await subjectResponse.json();

              if (
                subjectResponse.ok &&
                subjectData.success &&
                Array.isArray(
                  subjectData.subjects
                )
              ) {
                subjects =
                  subjectData.subjects
                    .map(
                      (item) =>
                        String(
                          item?.name ||
                            ""
                        ).trim()
                    )
                    .filter(Boolean);
              }
            } catch {
              // Use fallback.
            }
          }

          if (
            subjects.length ===
            0
          ) {
            subjects = [
              ...FALLBACK_SUBJECTS,
            ];
          }

          setAvailableSubjects(
            [
              ...new Set(
                subjects
              ),
            ].sort(
              (a, b) =>
                a.localeCompare(
                  b
                )
            )
          );

          const [
            resultResponse,
            analyticsResponse,
          ] =
            await Promise.all([
              fetch(
                `${API_BASE}/api/results?limit=100`,
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
          ] =
            await Promise.all([
              resultResponse.json(),
              analyticsResponse.json(),
            ]);

          if (!active) {
            return;
          }

          if (
            resultResponse.ok &&
            resultData.success
          ) {
            setResults(
              Array.isArray(
                resultData.results
              )
                ? resultData.results
                : []
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
          if (!active) {
            return;
          }

          setError(
            error.message ||
              "Could not load dashboard data."
          );

        } finally {
          if (active) {
            setLoading(
              false
            );
          }
        }
      };

    loadDashboard();

    return () => {
      active =
        false;
    };

  }, [navigate]);

  const stats =
    user?.stats || {};

  const accuracy =
    Number(
      stats.accuracy
    ) || 0;

  const quizzesCompleted =
    Number(
      stats.quizzesCompleted
    ) || 0;

  const questionsAnswered =
    Number(
      stats.questionsAnswered
    ) || 0;

  const correctAnswers =
    Number(
      stats.correctAnswers
    ) || 0;

  const streak =
    Number(
      stats.streak
    ) || 0;

  const xp =
    Number(
      stats.xp
    ) || 0;

  const level =
    Number(
      stats.level
    ) || 1;

  const weakestTopic =
    analytics?.weakestTopic ||
    null;

  const strongestTopic =
    analytics?.strongestTopic ||
    null;

  const recommendedTopic =
    analytics?.recommendedTopic ||
    null;

  const recommendation =
    analytics?.recommendation ||
    "Complete more quizzes to unlock personalized topic recommendations.";

  const overallTopicAccuracy =
    Number(
      analytics?.overallAccuracy
    ) || 0;

  const topicAnalytics =
    Array.isArray(
      analytics?.topics
    )
      ? analytics.topics
      : [];

  const subjectProgress =
    useMemo(() => {
      const resultSubjects =
        results
          .map(
            (result) =>
              String(
                result?.subject ||
                  ""
              ).trim()
          )
          .filter(Boolean);

      const names = [
        ...new Set([
          ...availableSubjects,
          ...resultSubjects,
        ]),
      ];

      return names
        .map(
          (name) => {
            const subjectResults =
              results.filter(
                (result) =>
                  result.subject ===
                  name
              );

            const total =
              subjectResults.reduce(
                (
                  sum,
                  result
                ) =>
                  sum +
                  (
                    Number(
                      result.total
                    ) || 0
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
                    Number(
                      result.score
                    ) || 0
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

            return {
              name,
              icon:
                getSubjectIcon(
                  name
                ),
              progress,
              quizzes:
                subjectResults.length,
            };
          }
        )
        .sort(
          (a, b) => {
            if (
              b.quizzes !==
              a.quizzes
            ) {
              return (
                b.quizzes -
                a.quizzes
              );
            }

            return (
              a.name.localeCompare(
                b.name
              )
            );
          }
        );

    }, [
      availableSubjects,
      results,
    ]);

  const preferredSubjects =
    Array.isArray(
      user?.profile
        ?.preferredSubjects
    )
      ? user.profile
          .preferredSubjects
      : [];

  const dashboardSubjects =
    useMemo(() => {
      const preferred =
        preferredSubjects.length >
        0
          ? subjectProgress.filter(
              (subject) =>
                preferredSubjects.includes(
                  subject.name
                )
            )
          : [];

      const source =
        preferred.length > 0
          ? preferred
          : subjectProgress;

      return source.slice(
        0,
        6
      );

    }, [
      preferredSubjects,
      subjectProgress,
    ]);

  const focusSubject =
    useMemo(() => {
      const attempted =
        subjectProgress.filter(
          (subject) =>
            subject.quizzes > 0
        );

      if (
        attempted.length ===
        0
      ) {
        return null;
      }

      return [
        ...attempted,
      ].sort(
        (a, b) =>
          a.progress -
          b.progress
      )[0];

    }, [
      subjectProgress,
    ]);

  const recentQuizzes =
    results.slice(
      0,
      3
    );

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
          fontFamily:
            "Manrope, sans-serif",
        }}
      >
        Loading your learning dashboard...
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="grid-background" />

      <Sidebar
        user={user}
      />

      <main className="main-content">
        <Header
          user={user}
        />

        <section className="dashboard-content">

          {error && (
            <div
              style={{
                marginBottom:
                  "15px",
                padding:
                  "12px 15px",
                borderRadius:
                  "10px",
                color:
                  "#e89b8a",
                background:
                  "rgba(255,105,78,0.04)",
                border:
                  "1px solid rgba(255,105,78,0.1)",
                fontSize:
                  "10px",
              }}
            >
              {error}
            </div>
          )}

          <section className="hero">
            <div className="hero-content">
              <div className="hero-badge">
                <Sparkles
                  size={15}
                />
                AI POWERED LEARNING
              </div>

              <h2>
                Study smarter with a quiz
                <br />
                that{" "}
                <span>
                  adapts to you.
                </span>
              </h2>

              <p>
                NeuraQuiz analyzes your real
                quiz history, tracks your
                accuracy and identifies the
                exact topics where you need
                more practice across all
                available subjects.
              </p>

              <div className="hero-actions">
                <button
                  className="primary-button"
                  onClick={() =>
                    navigate(
                      "/quiz"
                    )
                  }
                >
                  <div className="button-play">
                    <Play
                      size={15}
                      fill="currentColor"
                    />
                  </div>

                  Start Adaptive Quiz

                  <ArrowUpRight
                    size={18}
                  />
                </button>

                <button
                  className="secondary-button"
                  onClick={() =>
                    navigate(
                      "/performance"
                    )
                  }
                >
                  <BarChart3
                    size={18}
                  />
                  View Performance
                </button>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-glow" />

              <div className="brain-card">
                <div className="brain-ring ring-three" />
                <div className="brain-ring ring-two" />
                <div className="brain-ring ring-one" />

                <div className="brain-center">
                  <BrainCircuit
                    size={42}
                  />
                </div>

                <div className="floating-pill pill-one">
                  <Zap
                    size={14}
                  />
                  Level {level}
                </div>

                <div className="floating-pill pill-two">
                  <Target
                    size={14}
                  />
                  {accuracy}% Accuracy
                </div>

                <div className="floating-pill pill-three">
                  <Sparkles
                    size={14}
                  />
                  {xp} XP
                </div>
              </div>
            </div>
          </section>

          <section className="stats-grid">
            <StatCard
              icon={Target}
              label="Overall Accuracy"
              value={`${accuracy}%`}
              description={`${correctAnswers} correct from ${questionsAnswered} questions`}
              badge={
                questionsAnswered >
                0
                  ? "Live"
                  : "Start learning"
              }
            />

            <StatCard
              icon={BookOpen}
              label="Quizzes Completed"
              value={
                quizzesCompleted
              }
              description="Saved in your learning history"
              badge={`${quizzesCompleted}`}
            />

            <StatCard
              icon={Flame}
              label="Learning Streak"
              value={`${streak} ${
                streak === 1
                  ? "day"
                  : "days"
              }`}
              description="Complete quizzes regularly to grow it"
              badge={
                streak > 0
                  ? "Active"
                  : "Start today"
              }
            />

            <StatCard
              icon={CheckCircle2}
              label="Topic Accuracy"
              value={`${overallTopicAccuracy}%`}
              description={
                topicAnalytics.length >
                0
                  ? `${topicAnalytics.length} topics analyzed`
                  : "Complete quizzes to unlock topic analytics"
              }
              badge={
                topicAnalytics.length >
                0
                  ? "AI Insight"
                  : "No data"
              }
            />
          </section>

          <section
            className="panel"
            style={{
              marginBottom:
                "18px",
            }}
          >
            <div className="panel-header">
              <div>
                <p className="panel-eyebrow">
                  PERSONALIZED ANALYTICS
                </p>

                <h3>
                  Topic intelligence
                </h3>
              </div>

              <button
                className="text-button"
                onClick={() =>
                  navigate(
                    "/weak-topics"
                  )
                }
              >
                View weak topics
                <ChevronRight
                  size={16}
                />
              </button>
            </div>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap:
                  "12px",
                marginTop:
                  "18px",
              }}
            >
              <div
                style={{
                  padding:
                    "16px",
                  borderRadius:
                    "14px",
                  border:
                    "1px solid rgba(255,255,255,0.07)",
                  background:
                    "rgba(255,255,255,0.025)",
                }}
              >
                <p
                  style={{
                    margin:
                      "0 0 8px",
                    fontSize:
                      "9px",
                    letterSpacing:
                      "1.2px",
                    color:
                      "#766f68",
                    fontWeight:
                      700,
                  }}
                >
                  WEAKEST TOPIC
                </p>

                <strong
                  style={{
                    display:
                      "block",
                    color:
                      "#f2ede8",
                    fontSize:
                      "14px",
                    marginBottom:
                      "5px",
                  }}
                >
                  {weakestTopic?.topic ||
                    "Not identified yet"}
                </strong>

                <span
                  style={{
                    color:
                      "#8b837b",
                    fontSize:
                      "10px",
                  }}
                >
                  {weakestTopic
                    ? `${weakestTopic.subject} • ${weakestTopic.accuracy}% accuracy`
                    : "Complete more quizzes to unlock this insight"}
                </span>
              </div>

              <div
                style={{
                  padding:
                    "16px",
                  borderRadius:
                    "14px",
                  border:
                    "1px solid rgba(255,255,255,0.07)",
                  background:
                    "rgba(255,255,255,0.025)",
                }}
              >
                <p
                  style={{
                    margin:
                      "0 0 8px",
                    fontSize:
                      "9px",
                    letterSpacing:
                      "1.2px",
                    color:
                      "#766f68",
                    fontWeight:
                      700,
                  }}
                >
                  STRONGEST TOPIC
                </p>

                <strong
                  style={{
                    display:
                      "block",
                    color:
                      "#f2ede8",
                    fontSize:
                      "14px",
                    marginBottom:
                      "5px",
                  }}
                >
                  {strongestTopic?.topic ||
                    "Not identified yet"}
                </strong>

                <span
                  style={{
                    color:
                      "#8b837b",
                    fontSize:
                      "10px",
                  }}
                >
                  {strongestTopic
                    ? `${strongestTopic.subject} • ${strongestTopic.accuracy}% accuracy`
                    : "Complete more quizzes to unlock this insight"}
                </span>
              </div>

              <div
                style={{
                  padding:
                    "16px",
                  borderRadius:
                    "14px",
                  border:
                    "1px solid rgba(255,255,255,0.07)",
                  background:
                    "rgba(255,141,88,0.035)",
                }}
              >
                <p
                  style={{
                    margin:
                      "0 0 8px",
                    fontSize:
                      "9px",
                    letterSpacing:
                      "1.2px",
                    color:
                      "#8b7567",
                    fontWeight:
                      700,
                  }}
                >
                  RECOMMENDED PRACTICE
                </p>

                <strong
                  style={{
                    display:
                      "block",
                    color:
                      "#ff9f70",
                    fontSize:
                      "14px",
                    marginBottom:
                      "7px",
                  }}
                >
                  {recommendedTopic ||
                    "Complete a quiz"}
                </strong>

                <span
                  style={{
                    display:
                      "block",
                    color:
                      "#8b837b",
                    fontSize:
                      "10px",
                    lineHeight:
                      1.65,
                  }}
                >
                  {recommendation}
                </span>
              </div>
            </div>

            {topicAnalytics.length >
              0 && (
              <div
                style={{
                  marginTop:
                    "16px",
                  display:
                    "grid",
                  gap:
                    "10px",
                }}
              >
                {topicAnalytics
                  .slice(
                    0,
                    5
                  )
                  .map(
                    (
                      topic,
                      index
                    ) => (
                      <div
                        key={`${topic.subject}-${topic.topic}-${index}`}
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "minmax(150px, 1fr) 100px 1.5fr 55px",
                          gap:
                            "12px",
                          alignItems:
                            "center",
                          padding:
                            "12px 14px",
                          borderRadius:
                            "12px",
                          background:
                            "rgba(255,255,255,0.02)",
                          border:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              display:
                                "block",
                              color:
                                "#e9e3dd",
                              fontSize:
                                "11px",
                            }}
                          >
                            {topic.topic}
                          </strong>

                          <span
                            style={{
                              color:
                                "#716a63",
                              fontSize:
                                "9px",
                            }}
                          >
                            {topic.subject}
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
                          {topic.correct || 0}/
                          {topic.answered || 0}
                          {" "}correct
                        </span>

                        <div
                          style={{
                            height:
                              "5px",
                            borderRadius:
                              "999px",
                            background:
                              "rgba(255,255,255,0.06)",
                            overflow:
                              "hidden",
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
                              "10px",
                          }}
                        >
                          {topic.accuracy}%
                        </strong>
                      </div>
                    )
                  )}
              </div>
            )}
          </section>

          <section className="dashboard-grid">
            <div className="panel learning-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-eyebrow">
                    YOUR LEARNING
                  </p>

                  <h3>
                    Subject progress
                  </h3>
                </div>

                <button
                  className="text-button"
                  onClick={() =>
                    navigate(
                      "/performance"
                    )
                  }
                >
                  View all
                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>

              <div className="subject-list">
                {dashboardSubjects.map(
                  (subject) => (
                    <div
                      className="subject-item"
                      key={
                        subject.name
                      }
                    >
                      <div className="subject-main">
                        <div className="subject-icon">
                          {subject.icon}
                        </div>

                        <div className="subject-info">
                          <div className="subject-name-row">
                            <strong>
                              {subject.name}
                            </strong>

                            <span>
                              {subject.progress}%
                            </span>
                          </div>

                          <p>
                            {subject.quizzes}{" "}
                            {subject.quizzes === 1
                              ? "quiz"
                              : "quizzes"}{" "}
                            completed
                          </p>

                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{
                                width:
                                  `${subject.progress}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        className="subject-action"
                        onClick={() =>
                          navigate(
                            "/quiz"
                          )
                        }
                      >
                        <ChevronRight
                          size={18}
                        />
                      </button>
                    </div>
                  )
                )}
              </div>

              {subjectProgress.length >
                dashboardSubjects.length && (
                <button
                  className="text-button"
                  style={{
                    marginTop:
                      "14px",
                  }}
                  onClick={() =>
                    navigate(
                      "/performance"
                    )
                  }
                >
                  View all {subjectProgress.length} subjects
                  <ChevronRight
                    size={16}
                  />
                </button>
              )}
            </div>

            <div className="panel focus-panel">
              <div className="panel-header">
                <div>
                  <p className="panel-eyebrow">
                    AI INSIGHT
                  </p>

                  <h3>
                    Focus area
                  </h3>
                </div>

                <div className="ai-mini-badge">
                  <Sparkles
                    size={14}
                  />
                  AI
                </div>
              </div>

              {weakestTopic ? (
                <>
                  <div className="focus-score">
                    <div className="focus-circle">
                      <span>
                        {weakestTopic.accuracy}
                      </span>

                      <small>
                        %
                      </small>
                    </div>

                    <div>
                      <p>
                        Needs attention
                      </p>

                      <h4>
                        {weakestTopic.topic}
                      </h4>

                      <span>
                        {weakestTopic.subject}{" "}
                        •{" "}
                        {weakestTopic.answered}{" "}
                        answers analyzed
                      </span>
                    </div>
                  </div>

                  <div className="ai-message">
                    <Sparkles
                      size={17}
                    />

                    <p>
                      Your current weakest
                      topic is{" "}
                      <strong>
                        {weakestTopic.topic}
                      </strong>{" "}
                      with{" "}
                      <strong>
                        {weakestTopic.accuracy}%
                      </strong>{" "}
                      accuracy. Focus Mode
                      can prioritize this
                      topic in your next
                      adaptive quiz.
                    </p>
                  </div>

                  <button
                    className="focus-button"
                    onClick={() =>
                      navigate(
                        "/quiz"
                      )
                    }
                  >
                    Practice weak topic
                    <ArrowUpRight
                      size={17}
                    />
                  </button>
                </>
              ) : focusSubject ? (
                <>
                  <div className="focus-score">
                    <div className="focus-circle">
                      <span>
                        {focusSubject.progress}
                      </span>

                      <small>
                        %
                      </small>
                    </div>

                    <div>
                      <p>
                        Needs attention
                      </p>

                      <h4>
                        {focusSubject.name}
                      </h4>

                      <span>
                        {focusSubject.quizzes}{" "}
                        quizzes analyzed
                      </span>
                    </div>
                  </div>

                  <div className="ai-message">
                    <Sparkles
                      size={17}
                    />

                    <p>
                      Topic-level analytics
                      needs more data. Your
                      lowest subject accuracy
                      is currently{" "}
                      <strong>
                        {focusSubject.progress}%
                      </strong>{" "}
                      in{" "}
                      <strong>
                        {focusSubject.name}
                      </strong>
                      .
                    </p>
                  </div>

                  <button
                    className="focus-button"
                    onClick={() =>
                      navigate(
                        "/quiz"
                      )
                    }
                  >
                    Practice weak subject
                    <ArrowUpRight
                      size={17}
                    />
                  </button>
                </>
              ) : (
                <>
                  <div className="ai-message">
                    <Sparkles
                      size={17}
                    />

                    <p>
                      Complete your first
                      quiz and NeuraQuiz
                      will identify your
                      weakest topic
                      automatically.
                    </p>
                  </div>

                  <button
                    className="focus-button"
                    onClick={() =>
                      navigate(
                        "/quiz"
                      )
                    }
                  >
                    Start first quiz
                    <ArrowUpRight
                      size={17}
                    />
                  </button>
                </>
              )}
            </div>
          </section>

          <section className="panel recent-panel">
            <div className="panel-header">
              <div>
                <p className="panel-eyebrow">
                  ACTIVITY
                </p>

                <h3>
                  Recent quizzes
                </h3>
              </div>

              <button
                className="text-button"
                onClick={() =>
                  navigate(
                    "/performance"
                  )
                }
              >
                See performance
                <ChevronRight
                  size={16}
                />
              </button>
            </div>

            {recentQuizzes.length >
            0 ? (
              <div className="quiz-table">
                <div className="quiz-table-head">
                  <span>QUIZ</span>
                  <span>SCORE</span>
                  <span>ACCURACY</span>
                  <span>DATE</span>
                  <span />
                </div>

                {recentQuizzes.map(
                  (
                    quiz,
                    index
                  ) => {
                    const date =
                      quiz.createdAt
                        ? new Date(
                            quiz.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day:
                                "2-digit",
                              month:
                                "short",
                            }
                          )
                        : "-";

                    return (
                      <div
                        className="quiz-table-row"
                        key={
                          quiz.id ||
                          index
                        }
                      >
                        <div className="quiz-name">
                          <div
                            className={`quiz-number number-${
                              index + 1
                            }`}
                          >
                            {index + 1}
                          </div>

                          <div>
                            <strong>
                              {quiz.subject}
                            </strong>

                            <span>
                              Adaptive Quiz
                            </span>
                          </div>
                        </div>

                        <strong>
                          {quiz.score}/{quiz.total}
                        </strong>

                        <div className="accuracy">
                          <span>
                            {quiz.accuracy}%
                          </span>

                          <div className="mini-progress">
                            <div
                              style={{
                                width:
                                  `${quiz.accuracy}%`,
                              }}
                            />
                          </div>
                        </div>

                        <span className="table-muted">
                          {date}
                        </span>

                        <button
                          className="table-button"
                          onClick={() =>
                            navigate(
                              "/performance"
                            )
                          }
                        >
                          <ChevronRight
                            size={18}
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
                    "35px 10px 15px",
                  textAlign:
                    "center",
                  color:
                    "#716a63",
                  fontSize:
                    "10px",
                }}
              >
                No quiz history yet.
                Complete your first
                adaptive quiz to see it
                here.
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
