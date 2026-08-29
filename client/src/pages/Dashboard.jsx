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
  Clock3,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
  Play,
  BookOpen,
  Zap,
  CircleUserRound,
  MoreHorizontal,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

const subjects = [
  {
    name: "Python",
    topic: "Functions & OOP",
    progress: 82,
    icon: "PY",
  },
  {
    name: "Machine Learning",
    topic: "Regression Models",
    progress: 68,
    icon: "ML",
  },
  {
    name: "Data Structures",
    topic: "Trees & Graphs",
    progress: 54,
    icon: "DS",
  },
];

const recentQuizzes = [
  {
    subject: "Python",
    title: "Functions & OOP",
    score: "8/10",
    accuracy: "80%",
    time: "8 min",
  },
  {
    subject: "Machine Learning",
    title: "Linear Regression",
    score: "7/10",
    accuracy: "70%",
    time: "11 min",
  },
  {
    subject: "Data Structures",
    title: "Arrays & Linked Lists",
    score: "9/10",
    accuracy: "90%",
    time: "7 min",
  },
];

/* =====================================================
   SIDEBAR
===================================================== */

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    {
      icon: LayoutDashboard,
      name: "Overview",
      path: "/",
    },
    {
      icon: BrainCircuit,
      name: "Adaptive Quiz",
      path: "/quiz",
    },
    {
      icon: BarChart3,
      name: "Performance",
      path: "/performance",
    },
    {
      icon: Target,
      name: "Weak Topics",
      path: "/weak-topics",
    },
    {
      icon: Trophy,
      name: "Achievements",
      path: "/achievements",
    },
  ];

  return (
    <aside className="sidebar">
      <div>
        <div
          className="brand"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <div className="brand-logo">
            <BrainCircuit size={22} />
          </div>

          <div>
            <h2>NeuraQuiz</h2>
            <span>Adaptive AI</span>
          </div>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-menu">
          {menu.map(({ icon: Icon, name, path }) => {
            const active = location.pathname === path;

            return (
              <button
                key={name}
                onClick={() => navigate(path)}
                className={`sidebar-link ${active ? "active" : ""}`}
              >
                <Icon size={19} />

                <span>{name}</span>

                {active && <div className="active-indicator" />}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <button
          className="sidebar-link"
          onClick={() => navigate("/settings")}
        >
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <div
          className="sidebar-profile"
          onClick={() => navigate("/profile")}
          style={{ cursor: "pointer" }}
        >
          <div className="profile-avatar">K</div>

          <div className="profile-details">
            <strong>Keval</strong>
            <span>Student</span>
          </div>

          <MoreHorizontal size={18} />
        </div>
      </div>
    </aside>
  );
}

/* =====================================================
   HEADER
===================================================== */

function Header() {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <div>
        <p className="welcome-small">WELCOME BACK</p>

        <h1>
          Ready to learn, <span>Keval?</span>
        </h1>
      </div>

      <div className="topbar-actions">
        <div className="search-box">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search topics..."
          />

          <span>⌘ K</span>
        </div>

        <button
          className="icon-button notification-button"
          type="button"
        >
          <Bell size={19} />

          <span className="notification-dot" />
        </button>

        <button
          className="avatar-button"
          type="button"
          onClick={() => navigate("/profile")}
        >
          <CircleUserRound size={22} />
        </button>
      </div>
    </header>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

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
          <Icon size={20} />
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

/* =====================================================
   DASHBOARD
===================================================== */

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      {/* Background */}

      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="grid-background" />

      {/* Sidebar */}

      <Sidebar />

      {/* Main */}

      <main className="main-content">
        <Header />

        <section className="dashboard-content">

          {/* ================= HERO ================= */}

          <section className="hero">
            <div className="hero-content">
              <div className="hero-badge">
                <Sparkles size={15} />
                AI POWERED LEARNING
              </div>

              <h2>
                Study smarter with a quiz
                <br />
                that <span>adapts to you.</span>
              </h2>

              <p>
                NeuraQuiz analyzes every answer,
                understands your weak topics, and
                automatically adjusts question difficulty
                to help you improve faster.
              </p>

              <div className="hero-actions">
                <button
                  className="primary-button"
                  onClick={() => navigate("/quiz")}
                >
                  <div className="button-play">
                    <Play
                      size={15}
                      fill="currentColor"
                    />
                  </div>

                  Start Adaptive Quiz

                  <ArrowUpRight size={18} />
                </button>

                <button
                  className="secondary-button"
                  onClick={() =>
                    navigate("/performance")
                  }
                >
                  <BarChart3 size={18} />

                  View Performance
                </button>
              </div>
            </div>

            {/* AI Visual */}

            <div className="hero-visual">
              <div className="visual-glow" />

              <div className="brain-card">
                <div className="brain-ring ring-three" />
                <div className="brain-ring ring-two" />
                <div className="brain-ring ring-one" />

                <div className="brain-center">
                  <BrainCircuit size={42} />
                </div>

                <div className="floating-pill pill-one">
                  <Zap size={14} />
                  Adaptive
                </div>

                <div className="floating-pill pill-two">
                  <Target size={14} />
                  Personalized
                </div>

                <div className="floating-pill pill-three">
                  <Sparkles size={14} />
                  AI Powered
                </div>
              </div>
            </div>
          </section>

          {/* ================= STATS ================= */}

          <section className="stats-grid">
            <StatCard
              icon={Target}
              label="Overall Accuracy"
              value="84%"
              description="Across 126 questions"
              badge="+6.2%"
            />

            <StatCard
              icon={BookOpen}
              label="Quizzes Completed"
              value="24"
              description="6 completed this week"
              badge="+4"
            />

            <StatCard
              icon={Flame}
              label="Learning Streak"
              value="12 days"
              description="Best streak: 18 days"
              badge="Keep going"
            />

            <StatCard
              icon={Clock3}
              label="Study Time"
              value="8.4h"
              description="This week's learning"
              badge="+18%"
            />
          </section>

          {/* ================= LEARNING ================= */}

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
                    navigate("/performance")
                  }
                >
                  View all

                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="subject-list">
                {subjects.map((subject) => (
                  <div
                    className="subject-item"
                    key={subject.name}
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
                          {subject.topic}
                        </p>

                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${subject.progress}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      className="subject-action"
                      onClick={() =>
                        navigate("/quiz")
                      }
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= AI FOCUS ================= */}

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
                  <Sparkles size={14} />
                  AI
                </div>
              </div>

              <div className="focus-score">
                <div className="focus-circle">
                  <span>62</span>
                  <small>%</small>
                </div>

                <div>
                  <p>
                    Needs attention
                  </p>

                  <h4>
                    Machine Learning
                  </h4>

                  <span>
                    Regression Models
                  </span>
                </div>
              </div>

              <div className="ai-message">
                <Sparkles size={17} />

                <p>
                  You answered{" "}
                  <strong>4 of 7</strong>{" "}
                  regression questions correctly.
                  A focused quiz can strengthen
                  this topic.
                </p>
              </div>

              <button
                className="focus-button"
                onClick={() =>
                  navigate("/weak-topics")
                }
              >
                Practice weak topic

                <ArrowUpRight size={17} />
              </button>
            </div>
          </section>

          {/* ================= RECENT QUIZZES ================= */}

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
                  navigate("/results")
                }
              >
                See history

                <ChevronRight size={16} />
              </button>
            </div>

            <div className="quiz-table">

              {/* Table Header */}

              <div className="quiz-table-head">
                <span>QUIZ</span>
                <span>SCORE</span>
                <span>ACCURACY</span>
                <span>TIME</span>
                <span />
              </div>

              {/* Table Rows */}

              {recentQuizzes.map(
                (quiz, index) => (
                  <div
                    className="quiz-table-row"
                    key={quiz.title}
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
                          {quiz.title}
                        </strong>

                        <span>
                          {quiz.subject}
                        </span>
                      </div>
                    </div>

                    <strong>
                      {quiz.score}
                    </strong>

                    <div className="accuracy">
                      <span>
                        {quiz.accuracy}
                      </span>

                      <div className="mini-progress">
                        <div
                          style={{
                            width:
                              quiz.accuracy,
                          }}
                        />
                      </div>
                    </div>

                    <span className="table-muted">
                      {quiz.time}
                    </span>

                    <button
                      className="table-button"
                      onClick={() =>
                        navigate("/results")
                      }
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;