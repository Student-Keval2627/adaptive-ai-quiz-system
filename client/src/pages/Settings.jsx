import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Bell,
  BrainCircuit,
  Check,
  Flame,
  Gauge,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
  Sparkles,
  Target,
  Volume2,
  Zap,
} from "lucide-react";

import "./Settings.css";

const defaultSettings = {
  difficulty: "Adaptive",
  questionCount: "5",
  sound: true,
  animations: true,
  notifications: true,
  focusMode: true,
};

function Settings() {
  const navigate = useNavigate();

  const [settings, setSettings] =
    useState(defaultSettings);

  const [saved, setSaved] =
    useState(false);

  /* ================================================
     LOAD SAVED SETTINGS
  ================================================= */

  useEffect(() => {
    const storedSettings =
      localStorage.getItem(
        "neuraQuizSettings"
      );

    if (storedSettings) {
      try {
        setSettings(
          JSON.parse(storedSettings)
        );
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  /* ================================================
     CHANGE SELECT
  ================================================= */

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSaved(false);
  };

  /* ================================================
     TOGGLE
  ================================================= */

  const toggleSetting = (name) => {
    setSettings((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));

    setSaved(false);
  };

  /* ================================================
     SAVE
  ================================================= */

  const saveSettings = () => {
    localStorage.setItem(
      "neuraQuizSettings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /* ================================================
     RESET
  ================================================= */

  const resetSettings = () => {
    setSettings(defaultSettings);

    localStorage.setItem(
      "neuraQuizSettings",
      JSON.stringify(defaultSettings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="settings-page">
      <div className="settings-glow settings-glow-one" />
      <div className="settings-glow settings-glow-two" />

      {/* =============================================
          HEADER
      ============================================== */}

      <header className="settings-topbar">
        <button
          className="settings-back-button"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="settings-brand">
          <div className="settings-brand-icon">
            <BrainCircuit size={20} />
          </div>

          <div>
            <strong>NeuraQuiz</strong>
            <span>Adaptive AI</span>
          </div>
        </div>

        <button
          className="settings-save-top"
          onClick={saveSettings}
        >
          <Save size={15} />
          Save Settings
        </button>
      </header>

      {/* =============================================
          CONTENT
      ============================================== */}

      <main className="settings-container">

        {/* HERO */}

        <section className="settings-hero">
          <div>
            <div className="settings-hero-badge">
              <SettingsIcon size={14} />
              PERSONALIZATION
            </div>

            <h1>
              Learn your way.
              <br />
              <span>Control the experience.</span>
            </h1>

            <p>
              Customize how NeuraQuiz creates your
              adaptive quizzes and how the learning
              interface behaves.
            </p>
          </div>

          <div className="settings-ai-card">
            <div className="settings-ai-icon">
              <Sparkles size={24} />
            </div>

            <div>
              <span>AI QUIZ MODE</span>

              <strong>
                {settings.difficulty}
              </strong>

              <p>
                Current difficulty preference
              </p>
            </div>

            <div className="settings-ai-status">
              Active
            </div>
          </div>
        </section>

        {/* =============================================
            MAIN GRID
        ============================================== */}

        <section className="settings-main-grid">

          {/* QUIZ SETTINGS */}

          <div className="settings-panel">
            <div className="settings-panel-header">
              <div>
                <span>QUIZ CONFIGURATION</span>
                <h2>Adaptive quiz settings</h2>
              </div>

              <BrainCircuit size={20} />
            </div>

            {/* Difficulty */}

            <div className="settings-option">
              <div className="settings-option-left">
                <div className="settings-option-icon">
                  <Gauge size={19} />
                </div>

                <div>
                  <strong>
                    Quiz Difficulty
                  </strong>

                  <p>
                    Choose how difficult your quiz
                    should be.
                  </p>
                </div>
              </div>

              <select
                name="difficulty"
                value={settings.difficulty}
                onChange={handleChange}
                className="settings-select"
              >
                <option>
                  Adaptive
                </option>

                <option>
                  Easy
                </option>

                <option>
                  Medium
                </option>

                <option>
                  Hard
                </option>
              </select>
            </div>

            {/* Questions */}

            <div className="settings-option">
              <div className="settings-option-left">
                <div className="settings-option-icon">
                  <Target size={19} />
                </div>

                <div>
                  <strong>
                    Questions per Quiz
                  </strong>

                  <p>
                    Select your preferred quiz
                    length.
                  </p>
                </div>
              </div>

              <select
                name="questionCount"
                value={
                  settings.questionCount
                }
                onChange={handleChange}
                className="settings-select"
              >
                <option value="5">
                  5 Questions
                </option>

                <option value="10">
                  10 Questions
                </option>

                <option value="15">
                  15 Questions
                </option>
              </select>
            </div>

            {/* Focus */}

            <div className="settings-option">
              <div className="settings-option-left">
                <div className="settings-option-icon">
                  <Flame size={19} />
                </div>

                <div>
                  <strong>
                    Focus Mode
                  </strong>

                  <p>
                    Prioritize questions from
                    weaker topics.
                  </p>
                </div>
              </div>

              <button
                className={`settings-toggle ${
                  settings.focusMode
                    ? "settings-toggle-active"
                    : ""
                }`}
                onClick={() =>
                  toggleSetting("focusMode")
                }
              >
                <span />
              </button>
            </div>
          </div>

          {/* EXPERIENCE */}

          <div className="settings-panel">
            <div className="settings-panel-header">
              <div>
                <span>EXPERIENCE</span>
                <h2>Interface preferences</h2>
              </div>

              <Zap size={20} />
            </div>

            {/* Sounds */}

            <div className="settings-option">
              <div className="settings-option-left">
                <div className="settings-option-icon">
                  <Volume2 size={19} />
                </div>

                <div>
                  <strong>
                    Quiz Sounds
                  </strong>

                  <p>
                    Play feedback sounds during
                    quizzes.
                  </p>
                </div>
              </div>

              <button
                className={`settings-toggle ${
                  settings.sound
                    ? "settings-toggle-active"
                    : ""
                }`}
                onClick={() =>
                  toggleSetting("sound")
                }
              >
                <span />
              </button>
            </div>

            {/* Animations */}

            <div className="settings-option">
              <div className="settings-option-left">
                <div className="settings-option-icon">
                  <Sparkles size={19} />
                </div>

                <div>
                  <strong>
                    Animations
                  </strong>

                  <p>
                    Enable smooth interface
                    animations.
                  </p>
                </div>
              </div>

              <button
                className={`settings-toggle ${
                  settings.animations
                    ? "settings-toggle-active"
                    : ""
                }`}
                onClick={() =>
                  toggleSetting("animations")
                }
              >
                <span />
              </button>
            </div>

            {/* Notifications */}

            <div className="settings-option">
              <div className="settings-option-left">
                <div className="settings-option-icon">
                  <Bell size={19} />
                </div>

                <div>
                  <strong>
                    Learning Reminders
                  </strong>

                  <p>
                    Receive learning streak and
                    practice reminders.
                  </p>
                </div>
              </div>

              <button
                className={`settings-toggle ${
                  settings.notifications
                    ? "settings-toggle-active"
                    : ""
                }`}
                onClick={() =>
                  toggleSetting(
                    "notifications"
                  )
                }
              >
                <span />
              </button>
            </div>
          </div>

        </section>

        {/* =============================================
            AI SUMMARY
        ============================================== */}

        <section className="settings-summary-card">
          <div className="settings-summary-left">
            <div className="settings-summary-icon">
              <BrainCircuit size={25} />
            </div>

            <div>
              <span>
                CURRENT LEARNING CONFIGURATION
              </span>

              <h2>
                Your personalized quiz setup
              </h2>

              <p>
                NeuraQuiz will use these preferences
                when preparing your future adaptive
                learning sessions.
              </p>
            </div>
          </div>

          <div className="settings-summary-values">

            <div>
              <span>Difficulty</span>

              <strong>
                {settings.difficulty}
              </strong>
            </div>

            <div>
              <span>Questions</span>

              <strong>
                {settings.questionCount}
              </strong>
            </div>

            <div>
              <span>Focus Mode</span>

              <strong>
                {settings.focusMode
                  ? "Enabled"
                  : "Disabled"}
              </strong>
            </div>

          </div>
        </section>

        {/* =============================================
            ACTIONS
        ============================================== */}

        <section className="settings-actions-card">
          <div>
            <span>SETTINGS MANAGEMENT</span>

            <h3>
              Save or restore your preferences
            </h3>

            <p>
              Your settings are stored locally in
              your browser for now.
            </p>
          </div>

          <div className="settings-actions">

            <button
              className="settings-reset-button"
              onClick={resetSettings}
            >
              <RotateCcw size={15} />
              Reset Default
            </button>

            <button
              className="settings-main-save-button"
              onClick={saveSettings}
            >
              <Save size={15} />
              Save Changes
            </button>

          </div>
        </section>

        {/* SUCCESS */}

        {saved && (
          <div className="settings-saved-message">
            <Check size={16} />
            Settings saved successfully
          </div>
        )}

      </main>
    </div>
  );
}

export default Settings;