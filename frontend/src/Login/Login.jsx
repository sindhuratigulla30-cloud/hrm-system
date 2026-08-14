import { useState } from "react";
import axios from "axios";
import { FaUserShield, FaEnvelope, FaLock } from "react-icons/fa";
import "./Login.css";

const API_URL =
  "https://labeled-directions-begin-initially.trycloudflare.com";

function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    setError("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        form
      );

      const newToken = response.data?.token;

      if (!newToken) {
        setError("Login failed. Token was not received.");
        return;
      }

      localStorage.setItem("token", newToken);

      if (onLogin) {
        onLogin(newToken);
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to login. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background"></div>

      <div className="login-card">
        <div className="login-icon">
          <FaUserShield />
        </div>

        <div className="login-header">
          <h1>HR Management</h1>

          <p>Administrator Login</p>

          <span>
            Login to manage your organization
          </span>
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label>Email Address</label>

            <div className="login-input-wrapper">
              <FaEnvelope />

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-form-group">
            <label>Password</label>

            <div className="login-input-wrapper">
              <FaLock />

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <span>HR Management System</span>
          <small>Secure Administrator Access</small>
        </div>
      </div>
    </div>
  );
}

export default Login;