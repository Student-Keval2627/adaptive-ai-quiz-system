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
  UserRound,
} from "lucide-react";

import "./Auth.css";

const API_BASE = "http://127.0.0.1:5000";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (
      !form.name ||
      !form.email ||
      !form.password
    ) {
      setError(
        "Please complete all fields."
      );

      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/auth/register`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: form.name,
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
            "Registration failed"
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
          "Unable to create account"
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
              CREATE YOUR PROFILE
            </div>

            <h1>
              Start learning
              <br />
              <span>your way.</span>
            </h1>

            <p>
              Create your NeuraQuiz account and
              build a learning profile that becomes
              smarter with every quiz you complete.
            </p>
          </div>

          <div className="auth-features">
            <div>
              <strong>Smart Questions</strong>
              <span>
                Questions matched to your level
              </span>
            </div>

            <div>
              <strong>Weak Topics</strong>
              <span>
                Automatically identify areas to improve
              </span>
            </div>

            <div>
              <strong>Real Progress</strong>
              <span>
                Save quiz history and performance
              </span>
            </div>
          </div>
        </section>

        {/* FORM */}

        <section className="auth-form-section">
          <form
            className="auth-card"
            onSubmit={handleSubmit}
          >
            <div className="auth-card-heading">
              <span>GET STARTED</span>

              <h2>Create your account</h2>

              <p>
                Your adaptive journey starts here.
              </p>
            </div>

            <div className="auth-field">
              <label>Full name</label>

              <div className="auth-input-wrapper">
                <UserRound size={17} />

                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
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
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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

            <div className="auth-field">
              <label>Confirm password</label>

              <div className="auth-input-wrapper">
                <Lock size={17} />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  placeholder="Enter password again"
                  value={
                    form.confirmPassword
                  }
                  onChange={handleChange}
                  autoComplete="new-password"
                />
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
                ? "Creating Account..."
                : "Create Account"}

              {!loading && (
                <ArrowRight size={17} />
              )}
            </button>

            <div className="auth-divider">
              <span />
              <p>ALREADY REGISTERED?</p>
              <span />
            </div>

            <p className="auth-switch-text">
              Already have an account?{" "}

              <Link to="/login">
                Sign in
              </Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  );
}

export default Register;