import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  BrainCircuit,
  ArrowLeft,
  Construction,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Performance from "./pages/Performance";
import WeakTopics from "./pages/WeakTopics";
import Achievements from "./pages/Achievements";

function ComingSoonPage({
  title,
  description,
}) {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="grid-background" />

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "550px",
            padding: "45px",
            borderRadius: "24px",
            background: "rgba(20, 20, 19, 0.92)",
            border:
              "1px solid rgba(255, 140, 80, 0.13)",
            textAlign: "center",
            boxShadow:
              "0 30px 80px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              width: "65px",
              height: "65px",
              margin: "0 auto 22px",
              borderRadius: "18px",
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(135deg,#ff8550,#e84c25)",
              color: "white",
            }}
          >
            <Construction size={28} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "7px",
              color: "#ff9360",
              fontSize: "11px",
              fontWeight: "700",
              letterSpacing: "1px",
              marginBottom: "12px",
            }}
          >
            <BrainCircuit size={15} />
            NEURAQUIZ
          </div>

          <h1
            style={{
              color: "#fff8ee",
              fontSize: "32px",
              marginBottom: "12px",
            }}
          >
            {title}
          </h1>

          <p
            style={{
              color: "#8e877e",
              lineHeight: "1.7",
              fontSize: "14px",
              marginBottom: "28px",
            }}
          >
            {description}
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/")}
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Dashboard />}
        />

        <Route
          path="/quiz"
          element={<Quiz />}
        />

        <Route
          path="/results"
          element={<Results />}
        />

        <Route
          path="/performance"
          element={<Performance />}
        />

        <Route
          path="/weak-topics"
          element={<WeakTopics />}
        />

        <Route
          path="/achievements"
          element={<Achievements />}
        />

        <Route
          path="/profile"
          element={
            <ComingSoonPage
              title="Profile"
              description="Your student profile and learning preferences will appear here."
            />
          }
        />

        <Route
          path="/settings"
          element={
            <ComingSoonPage
              title="Settings"
              description="Application and adaptive quiz settings will appear here."
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;