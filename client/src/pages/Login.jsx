import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  BrainCircuit,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";

import "./Auth.css";

const API_BASE = "http://127.0.0.1:5000";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError(
        "Email and password are required."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/auth/login`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: form.email,
            password: form.password,
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
            "Login failed"
        );
      }

      localStorage.setItem(
        "neuraUser",
        JSON.stringify(data.user)
      );

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      setError(
        error.message ||
          "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <div className="auth-layout">
        {/* LEFT */}

        <section className="auth-intro">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <BrainCircuit size={24} />
            </div>

            <div>
              <strong>NeuraQuiz</strong>
              <span>Adaptive AI Learning</span>
            </div>
          </div>

          <div className="auth-intro-content">
            <div className="auth-badge">
              <Sparkles size={14} />
              PERSONALIZED LEARNING
            </div>

            <h1>
              Learn smarter.
              <br />
              <span>Improve faster.</span>
            </h1>

            <p>
              Sign in to continue your adaptive
              learning journey and access your
              quizzes, performance and personalized
              AI insights.
            </p>
          </div>

          <div className="auth-features">
            <div>
              <strong>Adaptive</strong>
              <span>
                Difficulty changes with your performance
              </span>
            </div>

            <div>
              <strong>Personalized</strong>
              <span>
                Focuses on the topics you need most
              </span>
            </div>

            <div>
              <strong>Tracked</strong>
              <span>
                Every quiz improves your learning profile
              </span>
            </div>
          </div>
        </section>

        {/* LOGIN */}

        <section className="auth-form-section">
          <form
            className="auth-card"
            onSubmit={handleSubmit}
          >
            <div className="auth-card-heading">
              <span>WELCOME BACK</span>

              <h2>Sign in to NeuraQuiz</h2>

              <p>
                Continue from where you left off.
              </p>
            </div>

            <div className="auth-field">
              <label>Email address</label>

              <div className="auth-input-wrapper">
                <Mail size={17} />

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>

              <div className="auth-input-wrapper">
                <Lock size={17} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              className="auth-submit-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign In"}

              {!loading && (
                <ArrowRight size={17} />
              )}
            </button>

            <div className="auth-divider">
              <span />
              <p>NEW TO NEURAQUIZ?</p>
              <span />
            </div>

            <p className="auth-switch-text">
              Don't have an account?{" "}

              <Link to="/register">
                Create account
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Login;