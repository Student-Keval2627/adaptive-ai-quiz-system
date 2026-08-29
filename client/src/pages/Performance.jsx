import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  Flame,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

import "./Performance.css";

/* =========================================================
   WEEKLY DATA
========================================================= */

const weeklyData = [
  { day: "MON", value: 58 },
  { day: "TUE", value: 72 },
  { day: "WED", value: 64 },
  { day: "THU", value: 82 },
  { day: "FRI", value: 76 },
  { day: "SAT", value: 91 },
  { day: "SUN", value: 84 },
];

/* =========================================================
   SUBJECT DATA
========================================================= */

const subjectData = [
  {
    name: "Python",
    topic: "Functions & OOP",
    progress: 88,
    quizzes: 10,
    accuracy: "88%",
    icon: Code2,
    status: "Strong",
  },
  {
    name: "Machine Learning",
    topic: "Regression Models",
    progress: 62,
    quizzes: 7,
    accuracy: "62%",
    icon: BrainCircuit,
    status: "Needs Practice",
  },
  {
    name: "Data Structures",
    topic: "Trees & Graphs",
    progress: 76,
    quizzes: 7,
    accuracy: "76%",
    icon: Database,
    status: "Improving",
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
   PERFORMANCE PAGE
========================================================= */

function Performance() {
  const navigate = useNavigate();

  return (
    <div className="performance-page">
      <div className="performance-glow performance-glow-one" />
      <div className="performance-glow performance-glow-two" />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="performance-topbar">
        <button
          className="performance-back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="performance-brand">
          <div className="performance-brand-icon">
            <BrainCircuit size={20} />
          </div>

          <div>
            <strong>NeuraQuiz</strong>
            <span>Adaptive AI</span>
          </div>
        </div>

        <button
          className="performance-start-button"
          onClick={() => navigate("/quiz")}
        >
          <Play size={15} fill="currentColor" />
          Start Quiz
        </button>
      </header>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="performance-container">

        {/* HERO */}

        <section className="performance-hero">
          <div>
            <div className="performance-hero-badge">
              <BarChart3 size={14} />
              LEARNING ANALYTICS
            </div>

            <h1>
              Track your growth.
              <br />
              <span>Learn from every answer.</span>
            </h1>

            <p>
              Understand your quiz performance, subject
              strengths, learning consistency and the areas
              NeuraQuiz recommends you focus on next.
            </p>
          </div>

          <div className="performance-hero-score">
            <div className="performance-score-ring">
              <div>
                <strong>84</strong>
                <span>%</span>
              </div>
            </div>

            <div className="performance-score-info">
              <span>OVERALL PERFORMANCE</span>
              <strong>Excellent progress</strong>

              <p>
                +6.2% compared with your previous learning
                period.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="performance-stats-grid">
          <PerformanceStat
            icon={Target}
            label="Overall Accuracy"
            value="84%"
            description="Across all completed quizzes"
            trend="+6.2%"
          />

          <PerformanceStat
            icon={CheckCircle2}
            label="Questions Answered"
            value="126"
            description="106 answers were correct"
            trend="+24"
          />

          <PerformanceStat
            icon={Trophy}
            label="Quizzes Completed"
            value="24"
            description="6 quizzes completed this week"
            trend="+4"
          />

          <PerformanceStat
            icon={Flame}
            label="Learning Streak"
            value="12 days"
            description="Your best streak is 18 days"
            trend="+3"
          />
        </section>

        {/* =====================================================
            MAIN ANALYTICS GRID
        ===================================================== */}

        <section className="performance-main-grid">

          {/* WEEKLY GRAPH */}

          <div className="performance-panel performance-chart-panel">
            <div className="performance-panel-header">
              <div>
                <span>WEEKLY ACTIVITY</span>
                <h2>Accuracy trend</h2>
              </div>

              <div className="performance-chart-badge">
                <TrendingUp size={14} />
                +12.4%
              </div>
            </div>

            <div className="performance-chart-summary">
              <div>
                <strong>84%</strong>
                <span>Average accuracy</span>
              </div>

              <p>
                Your performance improved during this week.
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
                  {weeklyData.map((item) => (
                    <div
                      className="performance-bar-column"
                      key={item.day}
                    >
                      <div className="performance-bar-value">
                        {item.value}%
                      </div>

                      <div className="performance-bar-track">
                        <div
                          className="performance-bar-fill"
                          style={{
                            height: `${item.value}%`,
                          }}
                        />
                      </div>

                      <span>{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI ANALYSIS */}

          <div className="performance-panel performance-ai-panel">
            <div className="performance-panel-header">
              <div>
                <span>AI ANALYSIS</span>
                <h2>Learning insight</h2>
              </div>

              <div className="performance-ai-badge">
                <Sparkles size={14} />
                AI
              </div>
            </div>

            <div className="performance-ai-visual">
              <div className="performance-ai-ring ring-large" />
              <div className="performance-ai-ring ring-small" />

              <div className="performance-ai-center">
                <BrainCircuit size={31} />
              </div>
            </div>

            <div className="performance-ai-message">
              <Sparkles size={17} />

              <div>
                <strong>
                  You're learning consistently.
                </strong>

                <p>
                  Your Python performance is strong, while
                  Machine Learning regression concepts need
                  additional practice.
                </p>
              </div>
            </div>

            <div className="performance-ai-focus">
              <div>
                <span>NEXT FOCUS AREA</span>
                <strong>Regression Models</strong>
                <p>Machine Learning</p>
              </div>

              <div className="performance-ai-focus-score">
                62%
              </div>
            </div>

            <button
              className="performance-practice-button"
              onClick={() => navigate("/quiz")}
            >
              <Zap size={16} />
              Practice Recommended Topic
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* =====================================================
            SUBJECT PERFORMANCE
        ===================================================== */}

        <section className="performance-panel performance-subject-panel">
          <div className="performance-panel-header">
            <div>
              <span>SUBJECT ANALYSIS</span>
              <h2>Your subject performance</h2>
            </div>

            <button
              className="performance-text-button"
              onClick={() => navigate("/quiz")}
            >
              Practice
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="performance-subject-list">
            {subjectData.map(
              ({
                name,
                topic,
                progress,
                quizzes,
                accuracy,
                icon: Icon,
                status,
              }) => (
                <div
                  className="performance-subject-row"
                  key={name}
                >
                  <div className="performance-subject-main">
                    <div className="performance-subject-icon">
                      <Icon size={19} />
                    </div>

                    <div className="performance-subject-name">
                      <strong>{name}</strong>
                      <span>{topic}</span>
                    </div>
                  </div>

                  <div className="performance-subject-progress">
                    <div className="performance-subject-progress-top">
                      <span>Progress</span>
                      <strong>{progress}%</strong>
                    </div>

                    <div className="performance-subject-track">
                      <div
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="performance-subject-stat">
                    <span>QUIZZES</span>
                    <strong>{quizzes}</strong>
                  </div>

                  <div className="performance-subject-stat">
                    <span>ACCURACY</span>
                    <strong>{accuracy}</strong>
                  </div>

                  <div
                    className={`performance-status performance-status-${status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {status}
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* =====================================================
            INSIGHT CARDS
        ===================================================== */}

        <section className="performance-insights-grid">

          <div className="performance-insight-card">
            <div className="performance-insight-icon strong-icon">
              <Trophy size={21} />
            </div>

            <span>STRONGEST SUBJECT</span>

            <h3>Python</h3>

            <p>
              Your Python accuracy is currently your highest
              at 88%.
            </p>

            <div className="performance-small-progress">
              <div style={{ width: "88%" }} />
            </div>
          </div>

          <div className="performance-insight-card">
            <div className="performance-insight-icon focus-icon">
              <Target size={21} />
            </div>

            <span>NEEDS IMPROVEMENT</span>

            <h3>Machine Learning</h3>

            <p>
              Regression Models currently have the lowest
              accuracy at 62%.
            </p>

            <div className="performance-small-progress">
              <div style={{ width: "62%" }} />
            </div>
          </div>

          <div className="performance-insight-card">
            <div className="performance-insight-icon time-icon">
              <Clock3 size={21} />
            </div>

            <span>STUDY TIME</span>

            <h3>8.4 hours</h3>

            <p>
              You spent approximately 18% more time studying
              this week.
            </p>

            <div className="performance-small-progress">
              <div style={{ width: "74%" }} />
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}

export default Performance;