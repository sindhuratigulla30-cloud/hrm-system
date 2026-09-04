import React, { useState } from "react";
import {
  FaUserTie,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";
import axios from "axios";

import "./Login.css";

function Login({
  apiUrl,
  onLoginSuccess,
  onBack,
  onRegister,
}) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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

    if (!form.email.trim() || !form.password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
        const response = await axios.post(
  `${apiUrl}/api/auth/login`,
        {
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }
      );

      console.log("LOGIN RESPONSE:", response.data);

      const token = response.data?.token;
      const user = response.data?.user;

      if (!token || !user) {
        throw new Error(
          "Login response is missing authentication information."
        );
      }

      /*
       * Store authentication information.
       */
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      /*
       * IMPORTANT:
       *
       * Backend automatically identifies whether
       * the account is admin or employee.
       *
       * App.jsx decides which dashboard to display.
       */
      onLoginSuccess(token, user);
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      console.error("SERVER RESPONSE:", error.response?.data);

      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-login-page">
      <div className="employee-login-card">

        {/* TOP GRADIENT LINE */}
        <div className="employee-login-top-line" />

        {/* ICON */}
        <div className="employee-login-icon">
          <FaUserTie />
        </div>

        {/* TITLE */}
        <h1>Employee Login</h1>

        <p className="employee-login-subtitle">
          Sign in to access your personal employee portal.
        </p>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="employee-login-form"
        >

          {/* EMAIL */}
          <div className="employee-login-field">
            <label htmlFor="employeeEmail">
              Email Address
            </label>

            <input
              id="employeeEmail"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="employee@example.com"
              autoComplete="email"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="employee-login-field">
            <label htmlFor="employeePassword">
              Password
            </label>

            <div className="employee-password-wrapper">
              <input
                id="employeePassword"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="employee-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) => !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="employee-login-error">
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="employee-login-button"
            disabled={loading}
          >
            <FaSignInAlt />

            <span>
              {loading
                ? "Signing in..."
                : "Login"}
            </span>
          </button>
        </form>

        {/* DIVIDER */}
        <div className="employee-login-divider">
          <span />
          <span>OR</span>
          <span />
        </div>

        {/* REGISTER */}
        <div className="employee-register-section">
          <p>
            Don't have an employee account?
          </p>

          <button
            type="button"
            className="employee-register-button"
            onClick={onRegister}
          >
            <FaUserPlus />

            <span>
              Create Employee Account
            </span>
          </button>
        </div>

        {/* BACK TO ADMIN */}
        <div className="employee-back-section">
          <p>
            Are you an administrator?
          </p>

          <button
            type="button"
            className="employee-back-button"
            onClick={onBack}
          >
            <FaArrowLeft />

            <span>
              Back to Administrator Login
            </span>
          </button>
        </div>

        {/* SECURITY NOTE */}
        <div className="employee-security-note">
          <FaUserTie />

          <span>
            Your account provides access only to
            your personal profile and attendance.
          </span>
        </div>

      </div>
    </div>
  );
}

export default Login;
