import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Performance from "./pages/Performance";
import WeakTopics from "./pages/WeakTopics";
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

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
          element={<Settings />}
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