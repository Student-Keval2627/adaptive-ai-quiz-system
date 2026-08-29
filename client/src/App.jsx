import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Performance from "./pages/Performance";
import WeakTopics from "./pages/WeakTopics";
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import Login from "./pages/Login";
import Register from "./pages/Register";


const API_BASE =
  "http://127.0.0.1:5000";


/* =========================================================
   AUTHENTICATION GUARD
========================================================= */

function ProtectedRoute({
  children,
}) {
  const [loading, setLoading] =
    useState(true);

  const [
    authenticated,
    setAuthenticated,
  ] = useState(false);

  useEffect(() => {
    const checkAuthentication =
      async () => {
        try {
          const response =
            await fetch(
              `${API_BASE}/api/auth/me`,
              {
                credentials:
                  "include",
              }
            );

          const data =
            await response.json();

          if (
            response.ok &&
            data.authenticated
          ) {
            setAuthenticated(
              true
            );

            localStorage.setItem(
              "neuraUser",
              JSON.stringify(
                data.user
              )
            );
          } else {
            setAuthenticated(
              false
            );

            localStorage.removeItem(
              "neuraUser"
            );
          }
        } catch {
          setAuthenticated(
            false
          );
        } finally {
          setLoading(false);
        }
      };

    checkAuthentication();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#090909",
          color: "#ff8d58",
          fontFamily:
            "Manrope, sans-serif",
        }}
      >
        Checking session...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* DASHBOARD */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* QUIZ */}

        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />

        {/* RESULTS */}

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          }
        />

        {/* PERFORMANCE */}

        <Route
          path="/performance"
          element={
            <ProtectedRoute>
              <Performance />
            </ProtectedRoute>
          }
        />

        {/* WEAK TOPICS */}

        <Route
          path="/weak-topics"
          element={
            <ProtectedRoute>
              <WeakTopics />
            </ProtectedRoute>
          }
        />

        {/* ACHIEVEMENTS */}

        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <Achievements />
            </ProtectedRoute>
          }
        />

        {/* PROFILE */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* SETTINGS */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* UNKNOWN */}

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