import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BrainCircuit,
  CheckCircle2,
  Crown,
  Flame,
  Lock,
  Medal,
  Play,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import "./Achievements.css";

const achievements = [
  {
    title: "First Step",
    description: "Complete your first adaptive quiz.",
    icon: Zap,
    unlocked: true,
    progress: 100,
    category: "Quiz",
  },
  {
    title: "Quiz Explorer",
    description: "Complete 10 adaptive quizzes.",
    icon: BrainCircuit,
    unlocked: true,
    progress: 100,
    category: "Quiz",
  },
  {
    title: "Sharp Mind",
    description: "Reach 80% overall quiz accuracy.",
    icon: Target,
    unlocked: true,
    progress: 100,
    category: "Accuracy",
  },
  {
    title: "Learning Fire",
    description: "Maintain a 7 day learning streak.",
    icon: Flame,
    unlocked: true,
    progress: 100,
    category: "Streak",
  },
  {
    title: "Quiz Master",
    description: "Complete 50 adaptive quizzes.",
    icon: Trophy,
    unlocked: false,
    progress: 48,
    category: "Quiz",
  },
  {
    title: "Accuracy Expert",
    description: "Reach 90% overall quiz accuracy.",
    icon: Medal,
    unlocked: false,
    progress: 84,
    category: "Accuracy",
  },
  {
    title: "Unstoppable",
    description: "Maintain a 30 day learning streak.",
    icon: Flame,
    unlocked: false,
    progress: 40,
    category: "Streak",
  },
  {
    title: "Neura Champion",
    description: "Reach student level 10.",
    icon: Crown,
    unlocked: false,
    progress: 50,
    category: "Level",
  },
];

function AchievementCard({ achievement }) {
  const Icon = achievement.icon;

  return (
    <div
      className={`achievement-card ${
        achievement.unlocked
          ? "achievement-unlocked"
          : "achievement-locked"
      }`}
    >
      <div className="achievement-card-top">
        <div className="achievement-icon">
          <Icon size={22} />
        </div>

        {achievement.unlocked ? (
          <div className="achievement-state unlocked-state">
            <CheckCircle2 size={13} />
            Unlocked
          </div>
        ) : (
          <div className="achievement-state locked-state">
            <Lock size={12} />
            Locked
          </div>
        )}
      </div>

      <span className="achievement-category">
        {achievement.category}
      </span>

      <h3>{achievement.title}</h3>

      <p>{achievement.description}</p>

      <div className="achievement-progress-info">
        <span>Progress</span>
        <strong>{achievement.progress}%</strong>
      </div>

      <div className="achievement-progress-track">
        <div
          style={{
            width: `${achievement.progress}%`,
          }}
        />
      </div>
    </div>
  );
}

function Achievements() {
  const navigate = useNavigate();

  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  return (
    <div className="achievements-page">
      <div className="achievements-glow achievement-glow-one" />
      <div className="achievements-glow achievement-glow-two" />

      {/* HEADER */}

      <header className="achievements-topbar">
        <button
          className="achievements-back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="achievements-brand">
          <div className="achievements-brand-icon">
            <BrainCircuit size={20} />
          </div>

          <div>
            <strong>NeuraQuiz</strong>
            <span>Adaptive AI</span>
          </div>
        </div>

        <button
          className="achievements-start-button"
          onClick={() => navigate("/quiz")}
        >
          <Play size={14} fill="currentColor" />
          Continue Learning
        </button>
      </header>

      <main className="achievements-container">
        {/* HERO */}

        <section className="achievements-hero">
          <div>
            <div className="achievements-hero-badge">
              <Trophy size={14} />
              LEARNING MILESTONES
            </div>

            <h1>
              Every answer builds
              <br />
              <span>your achievement.</span>
            </h1>

            <p>
              Track milestones you have unlocked and discover
              the challenges waiting for you as your learning
              journey continues.
            </p>
          </div>

          <div className="achievement-level-card">
            <div className="achievement-level-icon">
              <Crown size={26} />
            </div>

            <div className="achievement-level-content">
              <span>CURRENT LEVEL</span>

              <h3>Level 5</h3>

              <p>Adaptive Learner</p>

              <div className="achievement-xp-row">
                <span>2,460 XP</span>
                <strong>3,000 XP</strong>
              </div>

              <div className="achievement-xp-track">
                <div style={{ width: "82%" }} />
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}

        <section className="achievement-stats-grid">
          <div className="achievement-stat-card">
            <div className="achievement-stat-icon">
              <Trophy size={20} />
            </div>

            <strong>
              {unlockedCount}
              <small>/{achievements.length}</small>
            </strong>

            <span>Achievements</span>

            <p>Milestones currently unlocked</p>
          </div>

          <div className="achievement-stat-card">
            <div className="achievement-stat-icon">
              <Star size={20} />
            </div>

            <strong>2,460</strong>

            <span>Total XP</span>

            <p>Experience earned from learning</p>
          </div>

          <div className="achievement-stat-card">
            <div className="achievement-stat-icon">
              <Flame size={20} />
            </div>

            <strong>12 days</strong>

            <span>Current Streak</span>

            <p>Best learning streak: 18 days</p>
          </div>

          <div className="achievement-stat-card">
            <div className="achievement-stat-icon">
              <Target size={20} />
            </div>

            <strong>84%</strong>

            <span>Accuracy</span>

            <p>Your overall quiz performance</p>
          </div>
        </section>

        {/* RECENT ACHIEVEMENT */}

        <section className="recent-achievement-card">
          <div className="recent-achievement-left">
            <div className="recent-achievement-icon">
              <Medal size={26} />
            </div>

            <div>
              <span>RECENTLY UNLOCKED</span>

              <h2>Sharp Mind</h2>

              <p>
                You reached more than 80% overall quiz accuracy.
              </p>
            </div>
          </div>

          <div className="recent-achievement-xp">
            <Sparkles size={15} />
            +250 XP
          </div>
        </section>

        {/* ACHIEVEMENTS */}

        <section className="achievements-panel">
          <div className="achievements-panel-header">
            <div>
              <span>YOUR COLLECTION</span>
              <h2>Learning achievements</h2>
            </div>

            <div className="achievement-progress-badge">
              {unlockedCount}/{achievements.length} unlocked
            </div>
          </div>

          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <AchievementCard
                key={achievement.title}
                achievement={achievement}
              />
            ))}
          </div>
        </section>

        {/* NEXT GOAL */}

        <section className="achievement-next-goal">
          <div className="achievement-next-left">
            <div className="achievement-next-icon">
              <Trophy size={23} />
            </div>

            <div>
              <span>NEXT MILESTONE</span>

              <h2>Quiz Master</h2>

              <p>
                Complete 26 more quizzes to unlock this
                achievement.
              </p>
            </div>
          </div>

          <div className="achievement-next-progress">
            <div>
              <span>24 / 50 quizzes</span>
              <strong>48%</strong>
            </div>

            <div className="achievement-next-track">
              <div style={{ width: "48%" }} />
            </div>
          </div>

          <button
            className="achievement-practice-button"
            onClick={() => navigate("/quiz")}
          >
            <Zap size={15} />
            Start Quiz
          </button>
        </section>
      </main>
    </div>
  );
}

export default Achievements;