import { useLocation, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  Home,
  RefreshCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";

import "./Results.css";

function Results() {
  const navigate = useNavigate();
  const location = useLocation();

  const result = location.state || {};

  const subject = result.subject || "Adaptive Quiz";
  const score = result.score ?? 0;
  const total = result.total ?? 5;

  const accuracy =
    result.accuracy ??
    Math.round((score / total) * 100);

  const wrongAnswers = total - score;

  const getPerformance = () => {
    if (accuracy >= 90) {
      return {
        title: "Outstanding performance",
        message:
          "Excellent work. You have a strong understanding of this topic.",
        level: "Excellent",
      };
    }

    if (accuracy >= 75) {
      return {
        title: "Great progress",
        message:
          "You understand most concepts well. A little more practice will make you even stronger.",
        level: "Great",
      };
    }

    if (accuracy >= 60) {
      return {
        title: "Good attempt",
        message:
          "You are making progress, but some concepts still need more focused practice.",
        level: "Improving",
      };
    }

    return {
      title: "Keep learning",
      message:
        "This topic needs more attention. NeuraQuiz recommends another focused practice session.",
      level: "Needs Practice",
    };
  };

  const performance = getPerformance();

  return (
    <div className="results-page">
      <div className="results-glow results-glow-one" />
      <div className="results-glow results-glow-two" />

      {/* ================= HEADER ================= */}

      <header className="results-topbar">
        <button
          className="results-back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="results-brand">
          <div className="results-brand-icon">
            <BrainCircuit size={20} />
          </div>

          <div>
            <strong>NeuraQuiz</strong>
            <span>Adaptive AI</span>
          </div>
        </div>

        <div className="results-status">
          <CheckCircle2 size={15} />
          Quiz Completed
        </div>
      </header>

      {/* ================= CONTENT ================= */}

      <main className="results-container">

        {/* ================= RESULT HERO ================= */}

        <section className="results-hero">
          <div className="results-complete-badge">
            <Sparkles size={14} />
            QUIZ COMPLETE
          </div>

          <h1>
            Nice work.
            <br />
            <span>Here's how you performed.</span>
          </h1>

          <p>
            NeuraQuiz analyzed your answers and prepared
            a learning summary for your next study session.
          </p>
        </section>

        {/* ================= MAIN GRID ================= */}

        <section className="results-main-grid">

          {/* SCORE CARD */}

          <div className="results-score-card">
            <div className="results-card-label">
              <Trophy size={17} />
              FINAL SCORE
            </div>

            <div className="results-score-circle">
              <div
                className="results-score-progress"
                style={{
                  "--score-angle": `${accuracy * 3.6}deg`,
                }}
              >
                <div className="results-score-inner">
                  <strong>{accuracy}</strong>
                  <span>%</span>
                </div>
              </div>
            </div>

            <div className="results-score-text">
              <h2>{performance.title}</h2>

              <p>{performance.message}</p>
            </div>

            <div className="results-subject-pill">
              <BrainCircuit size={15} />

              <div>
                <span>SUBJECT</span>
                <strong>{subject}</strong>
              </div>
            </div>
          </div>

          {/* SUMMARY */}

          <div className="results-summary-card">
            <div className="results-section-header">
              <div>
                <span>PERFORMANCE</span>
                <h2>Quiz summary</h2>
              </div>

              <BarChart3 size={20} />
            </div>

            <div className="results-stats-grid">

              <div className="result-stat-box">
                <div className="result-stat-icon result-stat-score">
                  <Trophy size={19} />
                </div>

                <div>
                  <span>Score</span>

                  <strong>
                    {score}
                    <small>/{total}</small>
                  </strong>
                </div>
              </div>

              <div className="result-stat-box">
                <div className="result-stat-icon result-stat-correct">
                  <CheckCircle2 size={19} />
                </div>

                <div>
                  <span>Correct</span>
                  <strong>{score}</strong>
                </div>
              </div>

              <div className="result-stat-box">
                <div className="result-stat-icon result-stat-wrong">
                  <XCircle size={19} />
                </div>

                <div>
                  <span>Incorrect</span>
                  <strong>{wrongAnswers}</strong>
                </div>
              </div>

              <div className="result-stat-box">
                <div className="result-stat-icon result-stat-accuracy">
                  <Target size={19} />
                </div>

                <div>
                  <span>Accuracy</span>
                  <strong>{accuracy}%</strong>
                </div>
              </div>
            </div>

            {/* PERFORMANCE BAR */}

            <div className="results-performance-area">
              <div className="results-performance-heading">
                <span>Overall performance</span>
                <strong>{performance.level}</strong>
              </div>

              <div className="results-performance-track">
                <div
                  className="results-performance-fill"
                  style={{
                    width: `${accuracy}%`,
                  }}
                />
              </div>

              <div className="results-performance-scale">
                <span>Beginner</span>
                <span>Improving</span>
                <span>Strong</span>
              </div>
            </div>

            {/* AI INSIGHT */}

            <div className="results-ai-insight">
              <div className="results-ai-icon">
                <Sparkles size={19} />
              </div>

              <div>
                <span>AI LEARNING INSIGHT</span>

                <h3>
                  {accuracy >= 80
                    ? "You're ready for a harder challenge."
                    : "Another practice round is recommended."}
                </h3>

                <p>
                  {accuracy >= 80
                    ? "Your accuracy is strong. NeuraQuiz can increase difficulty in your next adaptive session."
                    : "Review the topic and retry the quiz. NeuraQuiz will adjust the questions to help strengthen your weak areas."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= NEXT STEP ================= */}

        <section className="results-next-card">
          <div className="results-next-content">
            <div className="results-next-icon">
              <Zap size={24} />
            </div>

            <div>
              <span>WHAT'S NEXT?</span>

              <h2>
                Continue building your knowledge.
              </h2>

              <p>
                Practice again or explore your performance
                analytics to understand where you can improve.
              </p>
            </div>
          </div>

          <div className="results-actions">

            <button
              className="results-secondary-button"
              onClick={() => navigate("/")}
            >
              <Home size={17} />
              Dashboard
            </button>

            <button
              className="results-secondary-button"
              onClick={() => navigate("/performance")}
            >
              <BarChart3 size={17} />
              Performance
            </button>

            <button
              className="results-primary-button"
              onClick={() => navigate("/quiz")}
            >
              <RefreshCcw size={17} />
              Try Another Quiz
              <ArrowRight size={17} />
            </button>

          </div>
        </section>
      </main>
    </div>
  );
}

export default Results;