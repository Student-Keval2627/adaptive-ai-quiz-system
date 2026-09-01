import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  BrainCircuit,
  Check,
  Edit3,
  Flame,
  GraduationCap,
  LoaderCircle,
  LogOut,
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


/* =========================================================
   SUBJECT HELPERS
========================================================= */

function getSubjectShort(
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
      subjectName ||
      ""
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


/* =========================================================
   PROFILE
========================================================= */

function Profile() {
  const navigate =
    useNavigate();


  const [
    editing,
    setEditing,
  ] = useState(false);


  const [
    profile,
    setProfile,
  ] = useState({
    name: "",
    email: "",
    role: "Student",
    goal: "",
  });


  const [
    originalProfile,
    setOriginalProfile,
  ] = useState(null);


  const [
    user,
    setUser,
  ] = useState(null);


  const [
    results,
    setResults,
  ] = useState([]);


  const [
    availableSubjects,
    setAvailableSubjects,
  ] = useState(
    FALLBACK_SUBJECTS
  );


  const [
    preferredSubjects,
    setPreferredSubjects,
  ] = useState(
    FALLBACK_SUBJECTS
  );


  const [
    originalPreferredSubjects,
    setOriginalPreferredSubjects,
  ] = useState(
    FALLBACK_SUBJECTS
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);


  const [
    saved,
    setSaved,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  /* =========================================================
     LOAD PROFILE
  ========================================================= */

  useEffect(() => {
    let active = true;


    const loadProfile =
      async () => {
        try {
          setLoading(true);
          setError("");


          /* =============================================
             CURRENT USER
          ============================================== */

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
                replace: true,
              }
            );

            return;
          }


          if (!active) {
            return;
          }


          const currentUser =
            userData.user;


          setUser(
            currentUser
          );


          const loadedProfile = {
            name:
              currentUser?.name ||
              "",

            email:
              currentUser?.email ||
              "",

            role:
              currentUser?.role ||
              "Student",

            goal:
              currentUser?.profile
                ?.learningGoal ||
              "",
          };


          setProfile(
            loadedProfile
          );


          setOriginalProfile(
            loadedProfile
          );


          const responseSubjects =
            Array.isArray(
              userData.availableSubjects
            )
              ? userData.availableSubjects
              : [];


          let loadedSubjects =
            responseSubjects
              .map(
                (subject) =>
                  String(
                    subject ||
                    ""
                  ).trim()
              )
              .filter(Boolean);


          /* =============================================
             FALLBACK SUBJECT FETCH
          ============================================== */

          if (
            loadedSubjects.length === 0
          ) {
            try {
              const subjectResponse =
                await fetch(
                  `${API_BASE}/api/auth/subjects`,
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
                loadedSubjects =
                  subjectData.subjects
                    .map(
                      (subject) =>
                        String(
                          subject ||
                          ""
                        ).trim()
                    )
                    .filter(Boolean);
              }

            } catch {
              // Keep fallback subjects.
            }
          }


          if (
            loadedSubjects.length === 0
          ) {
            loadedSubjects = [
              ...FALLBACK_SUBJECTS,
            ];
          }


          loadedSubjects = [
            ...new Set(
              loadedSubjects
            ),
          ].sort(
            (a, b) =>
              a.localeCompare(
                b
              )
          );


          setAvailableSubjects(
            loadedSubjects
          );


          const savedPreferred =
            Array.isArray(
              currentUser?.profile
                ?.preferredSubjects
            )
              ? currentUser.profile
                  .preferredSubjects
                  .filter(
                    (subject) =>
                      loadedSubjects.includes(
                        subject
                      )
                  )
              : [];


          const initialPreferred =
            savedPreferred.length > 0
              ? savedPreferred
              : loadedSubjects.slice(
                  0,
                  Math.min(
                    3,
                    loadedSubjects.length
                  )
                );


          setPreferredSubjects(
            initialPreferred
          );


          setOriginalPreferredSubjects(
            initialPreferred
          );


          localStorage.setItem(
            "neuraUser",
            JSON.stringify(
              currentUser
            )
          );


          /* =============================================
             QUIZ RESULTS
          ============================================== */

          const resultResponse =
            await fetch(
              `${API_BASE}/api/results?limit=100`,
              {
                credentials:
                  "include",
              }
            );


          const resultData =
            await resultResponse.json();


          if (
            active &&
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


        } catch (error) {
          if (!active) {
            return;
          }


          setError(
            error.message ||
            "Could not load your profile."
          );


        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };


    loadProfile();


    return () => {
      active = false;
    };
  }, [navigate]);


  /* =========================================================
     PROFILE INPUT
  ========================================================= */

  const handleChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;


      setProfile(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );


      setSaved(false);
      setError("");
    };


  /* =========================================================
     TOGGLE PREFERRED SUBJECT
  ========================================================= */

  const togglePreferredSubject =
    (subjectName) => {
      if (!editing) {
        return;
      }


      setPreferredSubjects(
        (previous) => {
          if (
            previous.includes(
              subjectName
            )
          ) {
            // Keep at least one preferred subject.
            if (
              previous.length === 1
            ) {
              return previous;
            }


            return previous.filter(
              (subject) =>
                subject !==
                subjectName
            );
          }


          return [
            ...previous,
            subjectName,
          ];
        }
      );


      setSaved(false);
      setError("");
    };


  /* =========================================================
     CANCEL EDIT
  ========================================================= */

  const cancelEdit = () => {
    if (
      originalProfile
    ) {
      setProfile(
        originalProfile
      );
    }


    setPreferredSubjects(
      originalPreferredSubjects
    );


    setEditing(false);
    setSaved(false);
    setError("");
  };


  /* =========================================================
     SAVE PROFILE TO MONGODB
  ========================================================= */

  const saveProfile =
    async () => {
      if (
        !profile.name.trim()
      ) {
        setError(
          "Name cannot be empty."
        );

        return;
      }


      if (
        preferredSubjects.length ===
        0
      ) {
        setError(
          "Select at least one preferred subject."
        );

        return;
      }


      try {
        setSaving(true);
        setError("");
        setSaved(false);


        const response =
          await fetch(
            `${API_BASE}/api/auth/profile`,
            {
              method: "PUT",

              credentials:
                "include",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  name:
                    profile.name,

                  learningGoal:
                    profile.goal,

                  preferredSubjects,
                }),
            }
          );


        const data =
          await response.json();


        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
            "Could not save profile"
          );
        }


        const updatedUser =
          data.user;


        setUser(
          updatedUser
        );


        const updatedProfile = {
          name:
            updatedUser?.name ||
            "",

          email:
            updatedUser?.email ||
            "",

          role:
            updatedUser?.role ||
            "Student",

          goal:
            updatedUser?.profile
              ?.learningGoal ||
            "",
        };


        const updatedPreferred =
          Array.isArray(
            updatedUser?.profile
              ?.preferredSubjects
          )
            ? updatedUser.profile
                .preferredSubjects
            : preferredSubjects;


        setProfile(
          updatedProfile
        );


        setOriginalProfile(
          updatedProfile
        );


        setPreferredSubjects(
          updatedPreferred
        );


        setOriginalPreferredSubjects(
          updatedPreferred
        );


        localStorage.setItem(
          "neuraUser",
          JSON.stringify(
            updatedUser
          )
        );


        setEditing(false);
        setSaved(true);


        setTimeout(() => {
          setSaved(false);
        }, 2500);


      } catch (error) {
        setError(
          error.message ||
          "Failed to save profile."
        );


      } finally {
        setSaving(false);
      }
    };


  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout =
    async () => {
      try {
        setLoggingOut(true);


        await fetch(
          `${API_BASE}/api/auth/logout`,
          {
            method: "POST",

            credentials:
              "include",
          }
        );


      } catch {
        // Local logout still happens.


      } finally {
        localStorage.removeItem(
          "neuraUser"
        );


        localStorage.removeItem(
          "neuraProfile"
        );


        setLoggingOut(false);


        navigate(
          "/login",
          {
            replace: true,
          }
        );
      }
    };


  /* =========================================================
     REAL STATS
  ========================================================= */

  const stats =
    user?.stats || {};


  const quizzes =
    Number(
      stats.quizzesCompleted
    ) || 0;


  const accuracy =
    Number(
      stats.accuracy
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


  const questionsAnswered =
    Number(
      stats.questionsAnswered
    ) || 0;


  /* =========================================================
     LEVEL PROGRESS
  ========================================================= */

  const levelBaseXp =
    (
      level - 1
    ) * 500;


  const nextLevelXp =
    level * 500;


  const levelProgress =
    Math.min(
      100,
      Math.max(
        0,
        (
          (
            xp -
            levelBaseXp
          ) /
          500
        ) * 100
      )
    );


  /* =========================================================
     DYNAMIC SUBJECT DEFINITIONS
  ========================================================= */

  const subjectDefinitions =
    useMemo(() => {
      return availableSubjects.map(
        (name) => ({
          name,

          short:
            getSubjectShort(
              name
            ),
        })
      );
    }, [
      availableSubjects,
    ]);


  /* =========================================================
     SUBJECT PERFORMANCE
  ========================================================= */

  const subjectPerformance =
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


      const allSubjectNames = [
        ...new Set([
          ...availableSubjects,
          ...resultSubjects,
        ]),
      ];


      return allSubjectNames.map(
        (subjectName) => {
          const subjectResults =
            results.filter(
              (result) =>
                result.subject ===
                subjectName
            );


          const totalQuestions =
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


          const totalCorrect =
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


          const subjectAccuracy =
            totalQuestions > 0
              ? Math.round(
                  (
                    totalCorrect /
                    totalQuestions
                  ) * 100
                )
              : 0;


          return {
            name:
              subjectName,

            short:
              getSubjectShort(
                subjectName
              ),

            accuracy:
              subjectAccuracy,

            quizzes:
              subjectResults.length,
          };
        }
      );
    }, [
      availableSubjects,
      results,
    ]);


  /* =========================================================
     ATTEMPTED SUBJECTS
  ========================================================= */

  const attemptedSubjects =
    subjectPerformance.filter(
      (subject) =>
        subject.quizzes > 0
    );


  const strongestSubject =
    attemptedSubjects.length > 0
      ? [
          ...attemptedSubjects,
        ].sort(
          (a, b) =>
            b.accuracy -
            a.accuracy
        )[0]
      : null;


  const focusSubject =
    attemptedSubjects.length > 0
      ? [
          ...attemptedSubjects,
        ].sort(
          (a, b) =>
            a.accuracy -
            b.accuracy
        )[0]
      : null;


  /* =========================================================
     DISPLAYED SUBJECTS
  ========================================================= */

  const displayedSubjects =
    useMemo(() => {
      if (editing) {
        return subjectDefinitions.map(
          (subject) => {
            const performance =
              subjectPerformance.find(
                (item) =>
                  item.name ===
                  subject.name
              );


            return {
              ...subject,

              accuracy:
                performance
                  ?.accuracy || 0,

              quizzes:
                performance
                  ?.quizzes || 0,
            };
          }
        );
      }


      if (
        preferredSubjects.length >
        0
      ) {
        return subjectPerformance.filter(
          (subject) =>
            preferredSubjects.includes(
              subject.name
            )
        );
      }


      return subjectPerformance;
    }, [
      editing,
      preferredSubjects,
      subjectDefinitions,
      subjectPerformance,
    ]);


  /* =========================================================
     QUIZ SETTINGS
  ========================================================= */

  const preferredDifficulty =
    useMemo(() => {
      try {
        const savedSettings =
          localStorage.getItem(
            "neuraQuizSettings"
          );


        if (!savedSettings) {
          return "Adaptive";
        }


        const parsed =
          JSON.parse(
            savedSettings
          );


        return (
          parsed.difficulty ||
          "Adaptive"
        );


      } catch {
        return "Adaptive";
      }
    }, []);


  /* =========================================================
     LEARNING PROFILE
  ========================================================= */

  const learningStyle =
    useMemo(() => {
      if (
        quizzes === 0
      ) {
        return {
          title:
            "Learning profile building",

          message:
            "Complete adaptive quizzes and NeuraQuiz will build your learning profile from your real performance.",
        };
      }


      if (
        accuracy >= 80
      ) {
        return {
          title:
            "Strong adaptive learner",

          message:
            "Your overall quiz accuracy is strong. Continue practicing weaker topics to maintain balanced progress.",
        };
      }


      if (
        accuracy >= 60
      ) {
        return {
          title:
            "Developing adaptive learner",

          message:
            "Your performance is improving. Focused practice on lower-accuracy topics can strengthen your results.",
        };
      }


      return {
        title:
          "Focused practice recommended",

        message:
          "Your quiz history shows opportunities for improvement. Short targeted quizzes can help strengthen weak areas.",
      };
    }, [
      accuracy,
      quizzes,
    ]);


  /* =========================================================
     AVATAR
  ========================================================= */

  const avatarLetter =
    profile.name
      ?.trim()
      .charAt(0)
      .toUpperCase() ||
    "S";


  /* =========================================================
     LOADING
  ========================================================= */

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
        }}
      >
        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            gap:
              "10px",
          }}
        >
          <LoaderCircle
            size={18}
            className="quiz-loader"
          />

          Loading your profile...
        </div>
      </div>
    );
  }


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="profile-page">

      <div className="profile-glow profile-glow-one" />

      <div className="profile-glow profile-glow-two" />


      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="profile-topbar">

        <button
          className="profile-back-button"

          onClick={() =>
            navigate("/")
          }
        >
          <ArrowLeft
            size={18}
          />

          Dashboard
        </button>


        <div className="profile-brand">

          <div className="profile-brand-icon">
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


        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "flex-end",

            gap:
              "10px",
          }}
        >

          <button
            className="profile-back-button"

            onClick={
              logout
            }

            disabled={
              loggingOut
            }
          >
            {loggingOut ? (
              <LoaderCircle
                size={16}
              />

            ) : (
              <LogOut
                size={16}
              />
            )}

            {loggingOut
              ? "Logging out..."
              : "Logout"}
          </button>


          <button
            className="profile-start-button"

            onClick={() =>
              navigate("/quiz")
            }
          >
            <Play
              size={14}
              fill="currentColor"
            />

            Start Quiz
          </button>

        </div>

      </header>


      <main className="profile-container">


        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="profile-hero">

          <div>

            <div className="profile-hero-badge">
              <UserRound
                size={14}
              />

              STUDENT PROFILE
            </div>


            <h1>
              Your learning.
              <br />

              <span>
                Your progress.
              </span>
            </h1>


            <p>
              Manage your learning
              profile, preferred subjects,
              real performance and your
              NeuraQuiz learning journey.
            </p>

          </div>


          <div className="profile-level-card">

            <div className="profile-level-avatar">
              {avatarLetter}
            </div>


            <div className="profile-level-info">

              <span>
                CURRENT LEVEL
              </span>


              <h3>
                Level {level}
              </h3>


              <p>
                Adaptive Learner
              </p>


              <div className="profile-level-progress-info">

                <span>
                  {xp.toLocaleString()}
                  {" "}
                  XP
                </span>


                <strong>
                  {nextLevelXp.toLocaleString()}
                  {" "}
                  XP
                </strong>

              </div>


              <div className="profile-level-track">
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
            REAL STATS
        ==================================================== */}

        <section className="profile-stats-grid">

          <div className="profile-stat-card">

            <div className="profile-stat-icon">
              <Trophy
                size={20}
              />
            </div>

            <strong>
              {quizzes}
            </strong>

            <span>
              Quizzes
            </span>

            <p>
              Total quizzes completed
            </p>

          </div>


          <div className="profile-stat-card">

            <div className="profile-stat-icon">
              <Target
                size={20}
              />
            </div>

            <strong>
              {accuracy}%
            </strong>

            <span>
              Accuracy
            </span>

            <p>
              Overall quiz performance
            </p>

          </div>


          <div className="profile-stat-card">

            <div className="profile-stat-icon">
              <Flame
                size={20}
              />
            </div>

            <strong>
              {streak}
              {" "}
              {streak === 1
                ? "day"
                : "days"}
            </strong>

            <span>
              Streak
            </span>

            <p>
              Current learning streak
            </p>

          </div>


          <div className="profile-stat-card">

            <div className="profile-stat-icon">
              <Star
                size={20}
              />
            </div>

            <strong>
              {xp.toLocaleString()}
            </strong>

            <span>
              Total XP
            </span>

            <p>
              Experience earned
            </p>

          </div>

        </section>


        {/* ===================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            style={{
              marginBottom:
                "20px",

              padding:
                "12px 15px",

              border:
                "1px solid rgba(255, 120, 85, 0.18)",

              borderRadius:
                "10px",

              background:
                "rgba(255, 120, 85, 0.05)",

              color:
                "#e99985",

              fontSize:
                "11px",
            }}
          >
            {error}
          </div>
        )}


        {/* ===================================================
            MAIN GRID
        ==================================================== */}

        <section className="profile-main-grid">


          {/* PROFILE DETAILS */}

          <div className="profile-panel">

            <div className="profile-panel-header">

              <div>
                <span>
                  PERSONAL INFORMATION
                </span>

                <h2>
                  Profile details
                </h2>
              </div>


              <button
                className="profile-edit-button"

                onClick={
                  editing
                    ? cancelEdit
                    : () =>
                        setEditing(
                          true
                        )
                }
              >
                <Edit3
                  size={15}
                />

                {editing
                  ? "Cancel"
                  : "Edit"}
              </button>

            </div>


            <div className="profile-form">


              {/* NAME */}

              <div className="profile-field">

                <label>
                  <UserRound
                    size={15}
                  />

                  Full name
                </label>


                <input
                  name="name"

                  value={
                    profile.name
                  }

                  onChange={
                    handleChange
                  }

                  disabled={
                    !editing
                  }
                />

              </div>


              {/* EMAIL */}

              <div className="profile-field">

                <label>
                  <Mail
                    size={15}
                  />

                  Email
                </label>


                <input
                  name="email"

                  value={
                    profile.email
                  }

                  disabled
                />

              </div>


              {/* ROLE */}

              <div className="profile-field">

                <label>
                  <GraduationCap
                    size={15}
                  />

                  Role
                </label>


                <input
                  name="role"

                  value={
                    profile.role
                  }

                  disabled
                />

              </div>


              {/* GOAL */}

              <div className="profile-field profile-field-full">

                <label>
                  <Target
                    size={15}
                  />

                  Learning goal
                </label>


                <input
                  name="goal"

                  value={
                    profile.goal
                  }

                  onChange={
                    handleChange
                  }

                  disabled={
                    !editing
                  }
                />

              </div>

            </div>


            {editing && (
              <button
                className="profile-save-button"

                onClick={
                  saveProfile
                }

                disabled={
                  saving
                }
              >
                {saving ? (
                  <LoaderCircle
                    size={16}
                  />

                ) : (
                  <Save
                    size={16}
                  />
                )}

                {saving
                  ? "Saving..."
                  : "Save Profile"}
              </button>
            )}


            {saved && (
              <div className="profile-save-message">

                <Check
                  size={16}
                />

                Profile saved to MongoDB successfully

              </div>
            )}

          </div>


          {/* =================================================
              LEARNING PROFILE
          ================================================== */}

          <div className="profile-panel profile-ai-panel">

            <div className="profile-panel-header">

              <div>
                <span>
                  LEARNING PROFILE
                </span>

                <h2>
                  Learning style
                </h2>
              </div>


              <div className="profile-ai-label">
                <Sparkles
                  size={13}
                />

                LIVE
              </div>

            </div>


            <div className="profile-ai-visual">

              <div className="profile-ai-ring profile-ring-one" />

              <div className="profile-ai-ring profile-ring-two" />


              <div className="profile-ai-center">
                <BrainCircuit
                  size={30}
                />
              </div>

            </div>


            <div className="profile-ai-message">

              <Sparkles
                size={17}
              />


              <div>

                <strong>
                  {
                    learningStyle.title
                  }
                </strong>


                <p>
                  {
                    learningStyle.message
                  }
                </p>

              </div>

            </div>


            <div className="profile-learning-row">

              <span>
                Preferred difficulty
              </span>

              <strong>
                {
                  preferredDifficulty
                }
              </strong>

            </div>


            <div className="profile-learning-row">

              <span>
                Questions answered
              </span>

              <strong>
                {
                  questionsAnswered
                }
              </strong>

            </div>


            <div className="profile-learning-row">

              <span>
                Best subject
              </span>

              <strong>
                {strongestSubject
                  ? strongestSubject.name
                  : "No data yet"}
              </strong>

            </div>


            <div className="profile-learning-row">

              <span>
                Focus subject
              </span>

              <strong>
                {focusSubject
                  ? focusSubject.name
                  : "No data yet"}
              </strong>

            </div>


            <button
              className="profile-practice-button"

              onClick={() =>
                navigate("/quiz")
              }
            >
              <Zap
                size={15}
              />

              Continue Learning
            </button>

          </div>

        </section>


        {/* ===================================================
            SUBJECTS
        ==================================================== */}

        <section className="profile-panel profile-subject-panel">

          <div className="profile-panel-header">

            <div>
              <span>
                LEARNING INTERESTS
              </span>

              <h2>
                {editing
                  ? "Choose preferred subjects"
                  : "Preferred subjects"}
              </h2>
            </div>


            <div
              style={{
                fontSize:
                  "11px",

                color:
                  "#9f9a96",
              }}
            >
              {editing
                ? `${preferredSubjects.length} selected`
                : `${availableSubjects.length} subjects available`}
            </div>

          </div>


          {editing && (
            <div
              style={{
                marginBottom:
                  "16px",

                fontSize:
                  "11px",

                color:
                  "#8f8a86",
              }}
            >
              Click a subject card to add or remove it from your learning profile.
            </div>
          )}


          <div className="profile-subject-grid">

            {displayedSubjects.map(
              (subject) => {
                const selected =
                  preferredSubjects.includes(
                    subject.name
                  );


                let label =
                  selected
                    ? "Preferred subject"
                    : "Available subject";


                if (
                  strongestSubject &&
                  strongestSubject.name ===
                    subject.name
                ) {
                  label =
                    "Strongest subject";
                }


                if (
                  focusSubject &&
                  focusSubject.name ===
                    subject.name &&
                  attemptedSubjects.length >
                    1
                ) {
                  label =
                    "Focus subject";
                }


                return (
                  <div
                    className="profile-subject-card"

                    key={
                      subject.name
                    }

                    role={
                      editing
                        ? "button"
                        : undefined
                    }

                    tabIndex={
                      editing
                        ? 0
                        : undefined
                    }

                    onClick={() =>
                      togglePreferredSubject(
                        subject.name
                      )
                    }

                    onKeyDown={
                      (event) => {
                        if (
                          editing &&
                          (
                            event.key ===
                              "Enter" ||
                            event.key ===
                              " "
                          )
                        ) {
                          event.preventDefault();

                          togglePreferredSubject(
                            subject.name
                          );
                        }
                      }
                    }

                    style={{
                      cursor:
                        editing
                          ? "pointer"
                          : "default",

                      opacity:
                        editing &&
                        !selected
                          ? 0.5
                          : 1,

                      outline:
                        editing &&
                        selected
                          ? "1px solid rgba(255, 130, 85, 0.45)"
                          : "none",

                      transition:
                        "0.2s ease",
                    }}
                  >

                    <div className="profile-subject-icon">
                      {
                        subject.short
                      }
                    </div>


                    <div>

                      <strong>
                        {
                          subject.name
                        }
                      </strong>


                      <span>
                        {editing
                          ? selected
                            ? "Selected"
                            : "Click to select"
                          : label}
                      </span>

                    </div>


                    <div className="profile-subject-score">

                      {editing ? (
                        selected ? (
                          <Check
                            size={16}
                          />
                        ) : (
                          "+"
                        )

                      ) : (
                        <>
                          {
                            subject.accuracy
                          }
                          %
                        </>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

      </main>

    </div>
  );
}


export default Profile;
