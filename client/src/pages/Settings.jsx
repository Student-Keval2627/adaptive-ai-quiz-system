import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

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


const allowedDifficulties = [
  "Adaptive",
  "Easy",
  "Medium",
  "Hard",
];


const allowedQuestionCounts = [
  "5",
  "10",
];


/* =========================================================
   NORMALIZE SETTINGS
========================================================= */

function normalizeSettings(
  storedSettings
) {
  return {
    difficulty:
      allowedDifficulties.includes(
        storedSettings?.difficulty
      )
        ? storedSettings.difficulty
        : defaultSettings.difficulty,

    questionCount:
      allowedQuestionCounts.includes(
        String(
          storedSettings?.questionCount
        )
      )
        ? String(
            storedSettings.questionCount
          )
        : defaultSettings.questionCount,

    sound:
      typeof storedSettings?.sound ===
      "boolean"
        ? storedSettings.sound
        : defaultSettings.sound,

    animations:
      typeof storedSettings?.animations ===
      "boolean"
        ? storedSettings.animations
        : defaultSettings.animations,

    notifications:
      typeof storedSettings?.notifications ===
      "boolean"
        ? storedSettings.notifications
        : defaultSettings.notifications,

    focusMode:
      typeof storedSettings?.focusMode ===
      "boolean"
        ? storedSettings.focusMode
        : defaultSettings.focusMode,
  };
}


/* =========================================================
   SETTINGS
========================================================= */

function Settings() {
  const navigate =
    useNavigate();

  const [
    settings,
    setSettings,
  ] = useState(
    defaultSettings
  );

  const [
    saved,
    setSaved,
  ] = useState(false);


  /* =========================================================
     LOAD SAVED SETTINGS
  ========================================================= */

  useEffect(() => {
    const storedSettings =
      localStorage.getItem(
        "neuraQuizSettings"
      );

    if (!storedSettings) {
      return;
    }

    try {
      const parsed =
        JSON.parse(
          storedSettings
        );

      const normalized =
        normalizeSettings(
          parsed
        );

      setSettings(
        normalized
      );

      localStorage.setItem(
        "neuraQuizSettings",
        JSON.stringify(
          normalized
        )
      );

    } catch {
      setSettings(
        defaultSettings
      );
    }
  }, []);


  /* =========================================================
     CHANGE SELECT
  ========================================================= */

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setSettings(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );

      setSaved(false);
    };


  /* =========================================================
     TOGGLE
  ========================================================= */

  const toggleSetting =
    (name) => {
      setSettings(
        (previous) => ({
          ...previous,
          [name]:
            !previous[name],
        })
      );

      setSaved(false);
    };


  /* =========================================================
     SAVE
  ========================================================= */

  const saveSettings = () => {
    const normalized =
      normalizeSettings(
        settings
      );

    setSettings(
      normalized
    );

    localStorage.setItem(
      "neuraQuizSettings",
      JSON.stringify(
        normalized
      )
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };


  /* =========================================================
     RESET
  ========================================================= */

  const resetSettings = () => {
    setSettings(
      defaultSettings
    );

    localStorage.setItem(
      "neuraQuizSettings",
      JSON.stringify(
        defaultSettings
      )
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };


  /* =========================================================
     DIFFICULTY DESCRIPTION
  ========================================================= */

  const difficultyDescription = {
    Adaptive:
      "Starts at Medium and changes after every answer.",

    Easy:
      "Starts from Easy and adapts from your performance.",

    Medium:
      "Starts from Medium and adapts from your performance.",

    Hard:
      "Starts from Hard and adapts from your performance.",
  };


  return (
    <div className="settings-page">

      <div className="settings-glow settings-glow-one" />

      <div className="settings-glow settings-glow-two" />


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="settings-topbar">

        <button
          className="settings-back-button"
          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft
            size={18}
          />

          Dashboard
        </button>


        <div className="settings-brand">

          <div className="settings-brand-icon">
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
          className="settings-save-top"
          onClick={
            saveSettings
          }
        >
          <Save
            size={15}
          />

          Save Settings
        </button>

      </header>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="settings-container">


        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="settings-hero">

          <div>

            <div className="settings-hero-badge">
              <SettingsIcon
                size={14}
              />

              PERSONALIZATION
            </div>


            <h1>
              Learn your way.
              <br />

              <span>
                Control the experience.
              </span>
            </h1>


            <p>
              Customize how the adaptive
              quiz engine starts, how many
              questions you receive and
              whether weaker topics receive
              extra priority.
            </p>

          </div>


          <div className="settings-ai-card">

            <div className="settings-ai-icon">
              <Sparkles
                size={24}
              />
            </div>


            <div>

              <span>
                ADAPTIVE ENGINE
              </span>

              <strong>
                {settings.difficulty}
              </strong>

              <p>
                {
                  difficultyDescription[
                    settings.difficulty
                  ]
                }
              </p>

            </div>


            <div className="settings-ai-status">
              Active
            </div>

          </div>

        </section>


        {/* ===================================================
            MAIN GRID
        ==================================================== */}

        <section className="settings-main-grid">


          {/* =================================================
              QUIZ SETTINGS
          ================================================== */}

          <div className="settings-panel">

            <div className="settings-panel-header">

              <div>
                <span>
                  QUIZ CONFIGURATION
                </span>

                <h2>
                  Adaptive quiz settings
                </h2>
              </div>

              <BrainCircuit
                size={20}
              />

            </div>


            {/* DIFFICULTY */}

            <div className="settings-option">

              <div className="settings-option-left">

                <div className="settings-option-icon">
                  <Gauge
                    size={19}
                  />
                </div>


                <div>

                  <strong>
                    Starting Difficulty
                  </strong>

                  <p>
                    Choose where the adaptive
                    engine should begin.
                  </p>

                </div>

              </div>


              <select
                name="difficulty"
                value={
                  settings.difficulty
                }
                onChange={
                  handleChange
                }
                className="settings-select"
              >
                <option value="Adaptive">
                  Adaptive
                </option>

                <option value="Easy">
                  Easy
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Hard">
                  Hard
                </option>
              </select>

            </div>


            {/* QUESTIONS */}

            <div className="settings-option">

              <div className="settings-option-left">

                <div className="settings-option-icon">
                  <Target
                    size={19}
                  />
                </div>


                <div>

                  <strong>
                    Questions per Quiz
                  </strong>

                  <p>
                    Select the number of
                    unique questions in each
                    quiz session.
                  </p>

                </div>

              </div>


              <select
                name="questionCount"
                value={
                  settings.questionCount
                }
                onChange={
                  handleChange
                }
                className="settings-select"
              >
                <option value="5">
                  5 Questions
                </option>

                <option value="10">
                  10 Questions
                </option>
              </select>

            </div>


            {/* FOCUS */}

            <div className="settings-option">

              <div className="settings-option-left">

                <div className="settings-option-icon">
                  <Flame
                    size={19}
                  />
                </div>


                <div>

                  <strong>
                    Focus Mode
                  </strong>

                  <p>
                    Prioritize your weak
                    topics while adapting
                    question difficulty.
                  </p>

                </div>

              </div>


              <button
                type="button"

                className={`settings-toggle ${
                  settings.focusMode
                    ? "settings-toggle-active"
                    : ""
                }`}

                onClick={() =>
                  toggleSetting(
                    "focusMode"
                  )
                }
              >
                <span />
              </button>

            </div>

          </div>


          {/* =================================================
              EXPERIENCE
          ================================================== */}

          <div className="settings-panel">

            <div className="settings-panel-header">

              <div>
                <span>
                  EXPERIENCE
                </span>

                <h2>
                  Interface preferences
                </h2>
              </div>

              <Zap
                size={20}
              />

            </div>


            {/* SOUND */}

            <div className="settings-option">

              <div className="settings-option-left">

                <div className="settings-option-icon">
                  <Volume2
                    size={19}
                  />
                </div>


                <div>

                  <strong>
                    Quiz Sounds
                  </strong>

                  <p>
                    Play feedback sounds
                    during quizzes.
                  </p>

                </div>

              </div>


              <button
                type="button"

                className={`settings-toggle ${
                  settings.sound
                    ? "settings-toggle-active"
                    : ""
                }`}

                onClick={() =>
                  toggleSetting(
                    "sound"
                  )
                }
              >
                <span />
              </button>

            </div>


            {/* ANIMATIONS */}

            <div className="settings-option">

              <div className="settings-option-left">

                <div className="settings-option-icon">
                  <Sparkles
                    size={19}
                  />
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
                type="button"

                className={`settings-toggle ${
                  settings.animations
                    ? "settings-toggle-active"
                    : ""
                }`}

                onClick={() =>
                  toggleSetting(
                    "animations"
                  )
                }
              >
                <span />
              </button>

            </div>


            {/* NOTIFICATIONS */}

            <div className="settings-option">

              <div className="settings-option-left">

                <div className="settings-option-icon">
                  <Bell
                    size={19}
                  />
                </div>


                <div>

                  <strong>
                    Learning Reminders
                  </strong>

                  <p>
                    Keep your reminder
                    preference for future
                    notification support.
                  </p>

                </div>

              </div>


              <button
                type="button"

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


        {/* ===================================================
            SUMMARY
        ==================================================== */}

        <section className="settings-summary-card">

          <div className="settings-summary-left">

            <div className="settings-summary-icon">
              <BrainCircuit
                size={25}
              />
            </div>


            <div>

              <span>
                CURRENT QUIZ CONFIGURATION
              </span>

              <h2>
                Your personalized quiz setup
              </h2>

              <p>
                These quiz preferences are
                sent to the Flask adaptive
                engine when your next quiz
                starts.
              </p>

            </div>

          </div>


          <div className="settings-summary-values">

            <div>
              <span>
                Start Level
              </span>

              <strong>
                {
                  settings.difficulty
                }
              </strong>
            </div>


            <div>
              <span>
                Questions
              </span>

              <strong>
                {
                  settings.questionCount
                }
              </strong>
            </div>


            <div>
              <span>
                Weak Topics
              </span>

              <strong>
                {settings.focusMode
                  ? "Prioritized"
                  : "Normal"}
              </strong>
            </div>

          </div>

        </section>


        {/* ===================================================
            ACTIONS
        ==================================================== */}

        <section className="settings-actions-card">

          <div>

            <span>
              SETTINGS MANAGEMENT
            </span>

            <h3>
              Save or restore your preferences
            </h3>

            <p>
              Quiz configuration is stored
              in your browser and applied
              automatically to the adaptive
              engine.
            </p>

          </div>


          <div className="settings-actions">

            <button
              className="settings-reset-button"
              onClick={
                resetSettings
              }
            >
              <RotateCcw
                size={15}
              />

              Reset Default
            </button>


            <button
              className="settings-main-save-button"
              onClick={
                saveSettings
              }
            >
              <Save
                size={15}
              />

              Save Changes
            </button>

          </div>

        </section>


        {/* ===================================================
            SUCCESS
        ==================================================== */}

        {saved && (
          <div className="settings-saved-message">
            <Check
              size={16}
            />

            Settings saved successfully
          </div>
        )}

      </main>
    </div>
  );
}


export default Settings;