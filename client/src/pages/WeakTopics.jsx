import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Code2,
  Database,
  Flame,
  Play,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
  Zap,
} from "lucide-react";

import "./WeakTopics.css";

const weakTopics = [
  {
    subject: "Machine Learning",
    topic: "Regression Models",
    accuracy: 62,
    mistakes: 8,
    priority: "High",
    icon: BrainCircuit,
    description:
      "You are having difficulty with regression concepts, model selection and prediction questions.",
  },
  {
    subject: "Data Structures",
    topic: "Trees & Graphs",
    accuracy: 71,
    mistakes: 5,
    priority: "Medium",
    icon: Database,
    description:
      "Tree traversal and graph relationships need a little more practice.",
  },
  {
    subject: "Python",
    topic: "Object-Oriented Programming",
    accuracy: 78,
    mistakes: 3,
    priority: "Low",
    icon: Code2,
    description:
      "Your Python fundamentals are strong, but OOP concepts can still improve.",
  },
];

function WeakTopics() {
  const navigate = useNavigate();

  return (
    <div className="weak-page">
      <div className="weak-glow weak-glow-one" />
      <div className="weak-glow weak-glow-two" />

      {/* HEADER */}

      <header className="weak-topbar">
        <button
          className="weak-back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="weak-brand">
          <div className="weak-brand-icon">
            <BrainCircuit size={20} />
          </div>

          <div>
            <strong>NeuraQuiz</strong>
            <span>Adaptive AI</span>
          </div>
        </div>

        <button
          className="weak-start-button"
          onClick={() => navigate("/quiz")}
        >
          <Play size={15} fill="currentColor" />
          Start Practice
        </button>
      </header>

      {/* CONTENT */}

      <main className="weak-container">

        {/* HERO */}

        <section className="weak-hero">
          <div>
            <div className="weak-hero-badge">
              <Target size={14} />
              PERSONALIZED ANALYSIS
            </div>

            <h1>
              Focus where it
              <br />
              <span>matters most.</span>
            </h1>

            <p>
              NeuraQuiz analyzes your quiz history and identifies
              concepts where additional practice can improve your
              performance.
            </p>
          </div>

          <div className="weak-hero-card">
            <div className="weak-hero-card-icon">
              <TriangleAlert size={24} />
            </div>

            <div>
              <span>TOP PRIORITY</span>
              <strong>Regression Models</strong>
              <p>Machine Learning</p>
            </div>

            <div className="weak-hero-score">
              62%
            </div>
          </div>
        </section>

        {/* SUMMARY */}

        <section className="weak-summary-grid">

          <div className="weak-summary-card">
            <div className="weak-summary-icon">
              <Target size={20} />
            </div>

            <strong>3</strong>

            <span>Weak Topics</span>

            <p>
              Topics currently needing attention
            </p>
          </div>

          <div className="weak-summary-card">
            <div className="weak-summary-icon">
              <TriangleAlert size={20} />
            </div>

            <strong>16</strong>

            <span>Recent Mistakes</span>

            <p>
              Incorrect answers analyzed by AI
            </p>
          </div>

          <div className="weak-summary-card">
            <div className="weak-summary-icon">
              <TrendingUp size={20} />
            </div>

            <strong>+9%</strong>

            <span>Improvement</span>

            <p>
              Progress over your previous sessions
            </p>
          </div>

          <div className="weak-summary-card">
            <div className="weak-summary-icon">
              <Flame size={20} />
            </div>

            <strong>12</strong>

            <span>Day Streak</span>

            <p>
              Keep your learning consistency going
            </p>
          </div>

        </section>

        {/* MAIN GRID */}

        <section className="weak-main-grid">

          {/* TOPICS */}

          <div className="weak-panel">
            <div className="weak-panel-header">
              <div>
                <span>AI PRIORITY LIST</span>
                <h2>Topics to improve</h2>
              </div>

              <Sparkles size={20} />
            </div>

            <div className="weak-topic-list">
              {weakTopics.map(
                ({
                  subject,
                  topic,
                  accuracy,
                  mistakes,
                  priority,
                  icon: Icon,
                  description,
                }) => (
                  <div
                    className="weak-topic-card"
                    key={topic}
                  >
                    <div className="weak-topic-top">
                      <div className="weak-topic-main">
                        <div className="weak-topic-icon">
                          <Icon size={20} />
                        </div>

                        <div>
                          <span>{subject}</span>
                          <h3>{topic}</h3>
                        </div>
                      </div>

                      <div
                        className={`weak-priority weak-priority-${priority.toLowerCase()}`}
                      >
                        {priority} Priority
                      </div>
                    </div>

                    <p className="weak-topic-description">
                      {description}
                    </p>

                    <div className="weak-topic-performance">
                      <div>
                        <span>Current accuracy</span>
                        <strong>{accuracy}%</strong>
                      </div>

                      <div>
                        <span>Recent mistakes</span>
                        <strong>{mistakes}</strong>
                      </div>
                    </div>

                    <div className="weak-progress-track">
                      <div
                        style={{
                          width: `${accuracy}%`,
                        }}
                      />
                    </div>

                    <button
                      className="weak-practice-button"
                      onClick={() => navigate("/quiz")}
                    >
                      <Zap size={15} />
                      Practice this topic
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          {/* AI PLAN */}

          <div className="weak-panel weak-ai-panel">
            <div className="weak-panel-header">
              <div>
                <span>AI STUDY PLAN</span>
                <h2>Recommended next steps</h2>
              </div>

              <div className="weak-ai-label">
                <Sparkles size={13} />
                AI
              </div>
            </div>

            <div className="weak-ai-visual">
              <div className="weak-ai-ring weak-ring-one" />
              <div className="weak-ai-ring weak-ring-two" />

              <div className="weak-ai-center">
                <BrainCircuit size={31} />
              </div>
            </div>

            <div className="weak-ai-message">
              <Sparkles size={17} />

              <div>
                <strong>
                  Start with Machine Learning.
                </strong>

                <p>
                  Regression Models currently have your lowest
                  accuracy. Improving this topic will have the
                  largest impact on your overall performance.
                </p>
              </div>
            </div>

            <div className="weak-plan-list">

              <div className="weak-plan-item">
                <div className="weak-plan-number">
                  01
                </div>

                <div>
                  <strong>
                    Practice Regression Models
                  </strong>

                  <span>
                    Complete one focused adaptive quiz
                  </span>
                </div>
              </div>

              <div className="weak-plan-item">
                <div className="weak-plan-number">
                  02
                </div>

                <div>
                  <strong>
                    Review Trees & Graphs
                  </strong>

                  <span>
                    Strengthen traversal concepts
                  </span>
                </div>
              </div>

              <div className="weak-plan-item">
                <div className="weak-plan-number">
                  03
                </div>

                <div>
                  <strong>
                    Finish with Python OOP
                  </strong>

                  <span>
                    Improve your remaining weak area
                  </span>
                </div>
              </div>

            </div>

            <button
              className="weak-main-practice-button"
              onClick={() => navigate("/quiz")}
            >
              <Play size={15} fill="currentColor" />
              Start Recommended Practice
              <ArrowRight size={17} />
            </button>
          </div>

        </section>
      </main>
    </div>
  );
}

export default WeakTopics;