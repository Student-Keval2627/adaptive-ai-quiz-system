import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  BrainCircuit,
  Check,
  Edit3,
  Flame,
  GraduationCap,
  Mail,
  Play,
  Save,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";

import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Keval",
    email: "keval@student.com",
    role: "Student",
    goal: "Improve AI & ML skills",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
  };

  const saveProfile = () => {
    setEditing(false);
    setSaved(true);

    localStorage.setItem(
      "neuraProfile",
      JSON.stringify(profile)
    );

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="profile-page">
      <div className="profile-glow profile-glow-one" />
      <div className="profile-glow profile-glow-two" />

      {/* HEADER */}

      <header className="profile-topbar">
        <button
          className="profile-back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="profile-brand">
          <div className="profile-brand-icon">
            <BrainCircuit size={20} />
          </div>

          <div>
            <strong>NeuraQuiz</strong>
            <span>Adaptive AI</span>
          </div>
        </div>

        <button
          className="profile-start-button"
          onClick={() => navigate("/quiz")}
        >
          <Play size={14} fill="currentColor" />
          Start Quiz
        </button>
      </header>

      <main className="profile-container">

        {/* HERO */}

        <section className="profile-hero">
          <div>
            <div className="profile-hero-badge">
              <UserRound size={14} />
              STUDENT PROFILE
            </div>

            <h1>
              Your learning.
              <br />
              <span>Your progress.</span>
            </h1>

            <p>
              Manage your learning profile, view your progress
              and personalize how NeuraQuiz adapts to your
              study goals.
            </p>
          </div>

          <div className="profile-level-card">
            <div className="profile-level-avatar">
              K
            </div>

            <div className="profile-level-info">
              <span>CURRENT LEVEL</span>

              <h3>Level 5</h3>

              <p>Adaptive Learner</p>

              <div className="profile-level-progress-info">
                <span>2,460 XP</span>
                <strong>3,000 XP</strong>
              </div>

              <div className="profile-level-track">
                <div style={{ width: "82%" }} />
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}

        <section className="profile-stats-grid">

          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <Trophy size={20} />
            </div>

            <strong>24</strong>
            <span>Quizzes</span>
            <p>Total quizzes completed</p>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <Target size={20} />
            </div>

            <strong>84%</strong>
            <span>Accuracy</span>
            <p>Overall quiz performance</p>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <Flame size={20} />
            </div>

            <strong>12 days</strong>
            <span>Streak</span>
            <p>Current learning streak</p>
          </div>

          <div className="profile-stat-card">
            <div className="profile-stat-icon">
              <Star size={20} />
            </div>

            <strong>2,460</strong>
            <span>Total XP</span>
            <p>Experience earned</p>
          </div>

        </section>

        {/* MAIN GRID */}

        <section className="profile-main-grid">

          {/* PROFILE DETAILS */}

          <div className="profile-panel">
            <div className="profile-panel-header">
              <div>
                <span>PERSONAL INFORMATION</span>
                <h2>Profile details</h2>
              </div>

              <button
                className="profile-edit-button"
                onClick={() => setEditing(!editing)}
              >
                <Edit3 size={15} />
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>

            <div className="profile-form">

              <div className="profile-field">
                <label>
                  <UserRound size={15} />
                  Full name
                </label>

                <input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="profile-field">
                <label>
                  <Mail size={15} />
                  Email
                </label>

                <input
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="profile-field">
                <label>
                  <GraduationCap size={15} />
                  Role
                </label>

                <input
                  name="role"
                  value={profile.role}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="profile-field profile-field-full">
                <label>
                  <Target size={15} />
                  Learning goal
                </label>

                <input
                  name="goal"
                  value={profile.goal}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

            </div>

            {editing && (
              <button
                className="profile-save-button"
                onClick={saveProfile}
              >
                <Save size={16} />
                Save Profile
              </button>
            )}

            {saved && (
              <div className="profile-save-message">
                <Check size={16} />
                Profile saved successfully
              </div>
            )}
          </div>

          {/* AI PROFILE */}

          <div className="profile-panel profile-ai-panel">
            <div className="profile-panel-header">
              <div>
                <span>AI PROFILE</span>
                <h2>Learning style</h2>
              </div>

              <div className="profile-ai-label">
                <Sparkles size={13} />
                AI
              </div>
            </div>

            <div className="profile-ai-visual">
              <div className="profile-ai-ring profile-ring-one" />
              <div className="profile-ai-ring profile-ring-two" />

              <div className="profile-ai-center">
                <BrainCircuit size={30} />
              </div>
            </div>

            <div className="profile-ai-message">
              <Sparkles size={17} />

              <div>
                <strong>
                  Focused adaptive learner
                </strong>

                <p>
                  You perform best with short focused quizzes
                  followed by targeted practice on weaker topics.
                </p>
              </div>
            </div>

            <div className="profile-learning-row">
              <span>Preferred difficulty</span>
              <strong>Adaptive</strong>
            </div>

            <div className="profile-learning-row">
              <span>Average session</span>
              <strong>8 min</strong>
            </div>

            <div className="profile-learning-row">
              <span>Best subject</span>
              <strong>Python</strong>
            </div>

            <div className="profile-learning-row">
              <span>Focus subject</span>
              <strong>Machine Learning</strong>
            </div>

            <button
              className="profile-practice-button"
              onClick={() => navigate("/quiz")}
            >
              <Zap size={15} />
              Continue Learning
            </button>
          </div>

        </section>

        {/* SUBJECTS */}

        <section className="profile-panel profile-subject-panel">
          <div className="profile-panel-header">
            <div>
              <span>LEARNING INTERESTS</span>
              <h2>Preferred subjects</h2>
            </div>
          </div>

          <div className="profile-subject-grid">

            <div className="profile-subject-card">
              <div className="profile-subject-icon">
                PY
              </div>

              <div>
                <strong>Python</strong>
                <span>Primary subject</span>
              </div>

              <div className="profile-subject-score">
                88%
              </div>
            </div>

            <div className="profile-subject-card">
              <div className="profile-subject-icon">
                ML
              </div>

              <div>
                <strong>Machine Learning</strong>
                <span>Focus subject</span>
              </div>

              <div className="profile-subject-score">
                62%
              </div>
            </div>

            <div className="profile-subject-card">
              <div className="profile-subject-icon">
                DS
              </div>

              <div>
                <strong>Data Structures</strong>
                <span>Secondary subject</span>
              </div>

              <div className="profile-subject-score">
                76%
              </div>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}

export default Profile;