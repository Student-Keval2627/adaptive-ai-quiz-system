import {
  useEffect,
  useMemo,
  useState,
} from "react";

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


const API_BASE = "http://127.0.0.1:5000";


/* =========================================================
   PROGRESS HELPER
========================================================= */

function calculateProgress(current, target) {
  if (!target) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (current / target) * 100
    )
  );
}


/* =========================================================
   ACHIEVEMENT CARD
========================================================= */

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


      <h3>
        {achievement.title}
      </h3>


      <p>
        {achievement.description}
      </p>


      <div className="achievement-progress-info">
        <span>
          Progress
        </span>

        <strong>
          {achievement.progress}%
        </strong>
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


/* =========================================================
   ACHIEVEMENTS PAGE
========================================================= */

function Achievements() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* =========================================================
     LOAD USER
  ========================================================= */

  useEffect(() => {
    const loadAchievements = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/api/auth/me`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (
          !response.ok ||
          !data.authenticated
        ) {
          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;
        }

        setUser(data.user);

        localStorage.setItem(
          "neuraUser",
          JSON.stringify(data.user)
        );

      } catch (error) {
        console.error(
          "Achievement load error:",
          error
        );

        setError(
          "Could not load achievements."
        );

      } finally {
        setLoading(false);
      }
    };

    loadAchievements();

  }, [navigate]);


  /* =========================================================
     REAL USER STATS
  ========================================================= */

  const stats = user?.stats || {};

  const quizzesCompleted =
    Number(
      stats.quizzesCompleted || 0
    );

  const accuracy =
    Number(
      stats.accuracy || 0
    );

  const streak =
    Number(
      stats.streak || 0
    );

  const xp =
    Number(
      stats.xp || 0
    );

  const level =
    Number(
      stats.level || 1
    );

  const questionsAnswered =
    Number(
      stats.questionsAnswered || 0
    );


  /* =========================================================
     BEST VALUES

     If backend later stores bestAccuracy/bestStreak,
     these values automatically start using them.
  ========================================================= */

  const bestAccuracy =
    Number(
      stats.bestAccuracy ??
      accuracy
    );

  const bestStreak =
    Number(
      stats.bestStreak ??
      streak
    );


  /* =========================================================
     ACHIEVEMENT RULES
  ========================================================= */

  const achievements = useMemo(() => {
    return [
      {
        id: "first-step",

        title: "First Step",

        description:
          "Complete your first adaptive quiz.",

        icon: Zap,

        category: "Quiz",

        current:
          quizzesCompleted,

        target: 1,

        unlocked:
          quizzesCompleted >= 1,

        progress:
          calculateProgress(
            quizzesCompleted,
            1
          ),
      },


      {
        id: "quiz-explorer",

        title: "Quiz Explorer",

        description:
          "Complete 10 adaptive quizzes.",

        icon: BrainCircuit,

        category: "Quiz",

        current:
          quizzesCompleted,

        target: 10,

        unlocked:
          quizzesCompleted >= 10,

        progress:
          calculateProgress(
            quizzesCompleted,
            10
          ),
      },


      {
        id: "sharp-mind",

        title: "Sharp Mind",

        description:
          "Reach 80% overall quiz accuracy.",

        icon: Target,

        category: "Accuracy",

        current:
          bestAccuracy,

        target: 80,

        unlocked:
          bestAccuracy >= 80,

        progress:
          calculateProgress(
            bestAccuracy,
            80
          ),
      },


      {
        id: "learning-fire",

        title: "Learning Fire",

        description:
          "Maintain a 7 day learning streak.",

        icon: Flame,

        category: "Streak",

        current:
          bestStreak,

        target: 7,

        unlocked:
          bestStreak >= 7,

        progress:
          calculateProgress(
            bestStreak,
            7
          ),
      },


      {
        id: "quiz-master",

        title: "Quiz Master",

        description:
          "Complete 50 adaptive quizzes.",

        icon: Trophy,

        category: "Quiz",

        current:
          quizzesCompleted,

        target: 50,

        unlocked:
          quizzesCompleted >= 50,

        progress:
          calculateProgress(
            quizzesCompleted,
            50
          ),
      },


      {
        id: "accuracy-expert",

        title: "Accuracy Expert",

        description:
          "Reach 90% overall quiz accuracy.",

        icon: Medal,

        category: "Accuracy",

        current:
          bestAccuracy,

        target: 90,

        unlocked:
          bestAccuracy >= 90,

        progress:
          calculateProgress(
            bestAccuracy,
            90
          ),
      },


      {
        id: "unstoppable",

        title: "Unstoppable",

        description:
          "Maintain a 30 day learning streak.",

        icon: Flame,

        category: "Streak",

        current:
          bestStreak,

        target: 30,

        unlocked:
          bestStreak >= 30,

        progress:
          calculateProgress(
            bestStreak,
            30
          ),
      },


      {
        id: "neura-champion",

        title: "Neura Champion",

        description:
          "Reach student level 10.",

        icon: Crown,

        category: "Level",

        current:
          level,

        target: 10,

        unlocked:
          level >= 10,

        progress:
          calculateProgress(
            level,
            10
          ),
      },
    ];

  }, [
    quizzesCompleted,
    bestAccuracy,
    bestStreak,
    level,
  ]);


  /* =========================================================
     UNLOCKED ACHIEVEMENTS
  ========================================================= */

  const unlockedAchievements =
    achievements.filter(
      (achievement) =>
        achievement.unlocked
    );

  const unlockedCount =
    unlockedAchievements.length;


  /* =========================================================
     HIGHEST UNLOCKED ACHIEVEMENT
  ========================================================= */

  const highestUnlocked =
    unlockedAchievements.length > 0
      ? unlockedAchievements[
          unlockedAchievements.length - 1
        ]
      : null;


  const HighestUnlockedIcon =
    highestUnlocked
      ? highestUnlocked.icon
      : Lock;


  /* =========================================================
     NEXT ACHIEVEMENT

     IMPORTANT:
     nextAchievement is created BEFORE
     anything tries to use it.
  ========================================================= */

  const nextAchievement = useMemo(() => {
    const lockedAchievements =
      achievements.filter(
        (achievement) =>
          !achievement.unlocked
      );

    if (
      lockedAchievements.length === 0
    ) {
      return null;
    }

    return [...lockedAchievements].sort(
      (a, b) =>
        b.progress - a.progress
    )[0];

  }, [achievements]);


  /* =========================================================
     SAFE NEXT ACHIEVEMENT ICON
  ========================================================= */

  const NextAchievementIcon =
    nextAchievement
      ? nextAchievement.icon
      : Crown;


  /* =========================================================
     NEXT GOAL MESSAGE
  ========================================================= */

  const nextGoalText = useMemo(() => {
    if (!nextAchievement) {
      return (
        "You have unlocked every available achievement."
      );
    }


    const remaining =
      Math.max(
        nextAchievement.target -
        nextAchievement.current,
        0
      );


    if (
      nextAchievement.category ===
      "Accuracy"
    ) {
      return (
        `Increase your overall accuracy by ${remaining}% to unlock this achievement.`
      );
    }


    if (
      nextAchievement.category ===
      "Level"
    ) {
      return (
        `Reach Level ${nextAchievement.target} to unlock this achievement.`
      );
    }


    if (
      nextAchievement.category ===
      "Streak"
    ) {
      return (
        `Maintain your learning streak for ${remaining} more ${
          remaining === 1
            ? "day"
            : "days"
        } to unlock this achievement.`
      );
    }


    return (
      `Complete ${remaining} more ${
        remaining === 1
          ? "quiz"
          : "quizzes"
      } to unlock this achievement.`
    );

  }, [nextAchievement]);


  /* =========================================================
     LEVEL / XP PROGRESS
  ========================================================= */

  const currentLevelBase =
    (level - 1) * 500;

  const nextLevelXp =
    level * 500;

  const xpInsideLevel =
    Math.max(
      xp - currentLevelBase,
      0
    );

  const levelProgress =
    Math.min(
      100,
      Math.round(
        (xpInsideLevel / 500) *
        100
      )
    );


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#090909",
          color: "#ff8d58",
        }}
      >
        Loading achievements...
      </div>
    );
  }


  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="achievements-page">

      <div className="achievements-glow achievement-glow-one" />

      <div className="achievements-glow achievement-glow-two" />


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="achievements-topbar">

        <button
          className="achievements-back-button"
          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft size={18} />

          Dashboard
        </button>


        <div className="achievements-brand">

          <div className="achievements-brand-icon">
            <BrainCircuit size={20} />
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
          className="achievements-start-button"
          onClick={() =>
            navigate("/quiz")
          }
        >
          <Play
            size={14}
            fill="currentColor"
          />

          Continue Learning
        </button>

      </header>


      <main className="achievements-container">


        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px 15px",
              borderRadius: "10px",

              background:
                "rgba(255, 120, 85, 0.05)",

              border:
                "1px solid rgba(255, 120, 85, 0.15)",

              color: "#e89b8a",
            }}
          >
            {error}
          </div>
        )}


        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="achievements-hero">

          <div>

            <div className="achievements-hero-badge">
              <Trophy size={14} />

              LEARNING MILESTONES
            </div>


            <h1>
              Every answer builds
              <br />

              <span>
                your achievement.
              </span>
            </h1>


            <p>
              Your achievements are
              calculated from your real
              quiz progress, accuracy,
              streak, XP and learning
              level.
            </p>

          </div>


          {/* LEVEL CARD */}

          <div className="achievement-level-card">

            <div className="achievement-level-icon">
              <Crown size={26} />
            </div>


            <div className="achievement-level-content">

              <span>
                CURRENT LEVEL
              </span>


              <h3>
                Level {level}
              </h3>


              <p>
                Adaptive Learner
              </p>


              <div className="achievement-xp-row">

                <span>
                  {xp.toLocaleString()} XP
                </span>

                <strong>
                  {nextLevelXp.toLocaleString()} XP
                </strong>

              </div>


              <div className="achievement-xp-track">

                <div
                  style={{
                    width:
                      `${levelProgress}%`,
                  }}
                />

              </div>

            </div>
          </div>

        </section>


        {/* ===================================================
            STATS
        ==================================================== */}

        <section className="achievement-stats-grid">


          {/* ACHIEVEMENTS */}

          <div className="achievement-stat-card">

            <div className="achievement-stat-icon">
              <Trophy size={20} />
            </div>


            <strong>
              {unlockedCount}

              <small>
                /{achievements.length}
              </small>
            </strong>


            <span>
              Achievements
            </span>


            <p>
              Milestones currently unlocked
            </p>

          </div>


          {/* XP */}

          <div className="achievement-stat-card">

            <div className="achievement-stat-icon">
              <Star size={20} />
            </div>


            <strong>
              {xp.toLocaleString()}
            </strong>


            <span>
              Total XP
            </span>


            <p>
              Experience earned from learning
            </p>

          </div>


          {/* STREAK */}

          <div className="achievement-stat-card">

            <div className="achievement-stat-icon">
              <Flame size={20} />
            </div>


            <strong>
              {streak}{" "}
              {streak === 1
                ? "day"
                : "days"}
            </strong>


            <span>
              Current Streak
            </span>


            <p>
              Current learning consistency
            </p>

          </div>


          {/* ACCURACY */}

          <div className="achievement-stat-card">

            <div className="achievement-stat-icon">
              <Target size={20} />
            </div>


            <strong>
              {accuracy}%
            </strong>


            <span>
              Accuracy
            </span>


            <p>
              Based on {questionsAnswered} answers
            </p>

          </div>

        </section>


        {/* ===================================================
            HIGHEST UNLOCKED
        ==================================================== */}

        <section className="recent-achievement-card">

          <div className="recent-achievement-left">

            <div className="recent-achievement-icon">

              <HighestUnlockedIcon
                size={26}
              />

            </div>


            <div>

              <span>
                HIGHEST UNLOCKED
              </span>


              <h2>
                {highestUnlocked
                  ? highestUnlocked.title
                  : "Start Your Journey"}
              </h2>


              <p>
                {highestUnlocked
                  ? highestUnlocked.description
                  : "Complete your first adaptive quiz to unlock your first achievement."}
              </p>

            </div>

          </div>


          <div className="recent-achievement-xp">

            <Sparkles size={15} />

            Level {level}

          </div>

        </section>


        {/* ===================================================
            ACHIEVEMENT COLLECTION
        ==================================================== */}

        <section className="achievements-panel">

          <div className="achievements-panel-header">

            <div>

              <span>
                YOUR COLLECTION
              </span>

              <h2>
                Learning achievements
              </h2>

            </div>


            <div className="achievement-progress-badge">

              {unlockedCount}
              /
              {achievements.length}
              {" "}
              unlocked

            </div>

          </div>


          <div className="achievements-grid">

            {achievements.map(
              (achievement) => (
                <AchievementCard
                  key={
                    achievement.id
                  }
                  achievement={
                    achievement
                  }
                />
              )
            )}

          </div>

        </section>


        {/* ===================================================
            NEXT GOAL
        ==================================================== */}

        <section className="achievement-next-goal">


          <div className="achievement-next-left">


            <div className="achievement-next-icon">

              <NextAchievementIcon
                size={23}
              />

            </div>


            <div>

              <span>
                {nextAchievement
                  ? "NEXT MILESTONE"
                  : "ALL MILESTONES"}
              </span>


              <h2>
                {nextAchievement
                  ? nextAchievement.title
                  : "Neura Champion"}
              </h2>


              <p>
                {nextGoalText}
              </p>

            </div>

          </div>


          <div className="achievement-next-progress">


            <div>

              <span>
                {nextAchievement
                  ? `${nextAchievement.current} / ${nextAchievement.target}`
                  : `${achievements.length} / ${achievements.length}`}
              </span>


              <strong>
                {nextAchievement
                  ? `${nextAchievement.progress}%`
                  : "100%"}
              </strong>

            </div>


            <div className="achievement-next-track">

              <div
                style={{
                  width:
                    `${
                      nextAchievement
                        ? nextAchievement.progress
                        : 100
                    }%`,
                }}
              />

            </div>

          </div>


          <button
            className="achievement-practice-button"
            onClick={() =>
              navigate("/quiz")
            }
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