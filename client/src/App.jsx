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
import Profile from "./pages/Profile";

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
            background:
              "rgba(20, 20, 19, 0.92)",
            border:
              "1px solid rgba(255, 140, 80, 0.13)",
            textAlign: "center",
          }}
        >
          <Construction size={32} />

          <h1>{title}</h1>

          <p>{description}</p>

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
          element={<Profile />}
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