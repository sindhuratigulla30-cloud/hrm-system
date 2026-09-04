import React, { useState } from "react";
import axios from "axios";

import {
  FaUserShield,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaArrowLeft,
} from "react-icons/fa";

import "./AdminLogin.css";

function AdminLogin({
  apiUrl,
  onLoginSuccess,
  onBack,
}) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // ============================================================
  // ADMIN LOGIN
  // ============================================================

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

      console.log(
        "ADMIN LOGIN RESPONSE:",
        response.data
      );

      const receivedToken = response.data?.token;
      const receivedUser = response.data?.user;

      // Check login response
      if (!receivedToken || !receivedUser) {
        throw new Error(
          "Login response is missing authentication information."
        );
      }

      // Make sure this is actually an admin account
      if (receivedUser.role !== "admin") {
        setError(
          "This account is not an administrator account."
        );
        return;
      }

      // Save login information
      localStorage.setItem(
        "token",
        receivedToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify(receivedUser)
      );

      // Send information to App.jsx
      onLoginSuccess(
        receivedToken,
        receivedUser
      );

    } catch (error) {
      console.error(
        "ADMIN LOGIN ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          "Administrator login failed. Please check your email and password."
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        {/* TOP LINE */}
        <div className="admin-login-top-line" />

        {/* ICON */}
        <div className="admin-login-icon">
          <FaUserShield />
        </div>

        {/* TITLE */}
        <h1>
          Administrator Login
        </h1>

        <p className="admin-login-subtitle">
          Sign in to access the HR management system.
        </p>

        {/* LOGIN FORM */}
        <form
          onSubmit={handleSubmit}
          className="admin-login-form"
        >

          {/* EMAIL */}
          <div className="admin-login-field">

            <label htmlFor="adminEmail">
              Administrator Email
            </label>

            <input
              id="adminEmail"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />

          </div>

          {/* PASSWORD */}
          <div className="admin-login-field">

            <label htmlFor="adminPassword">
              Password
            </label>

            <div className="admin-password-wrapper">

              <input
                id="adminPassword"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter administrator password"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
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
            <div className="admin-login-error">
              {error}
            </div>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >

            <FaSignInAlt />

            <span>
              {loading
                ? "Signing in..."
                : "Administrator Login"}
            </span>

          </button>

        </form>

        {/* DIVIDER */}
        <div className="admin-login-divider">

          <span />

          <span>
            OR
          </span>

          <span />

        </div>

        {/* BACK TO EMPLOYEE LOGIN */}
        <div className="admin-back-section">

          <p>
            Are you an employee?
          </p>

          <button
            type="button"
            className="admin-back-button"
            onClick={onBack}
          >

            <FaArrowLeft />

            <span>
              Back to Employee Login
            </span>

          </button>

        </div>

        {/* SECURITY NOTE */}
        <div className="admin-security-note">

          <FaUserShield />

          <span>
            Administrator access is restricted
            to authorized HR personnel.
          </span>

        </div>

      </div>

    </div>
  );
}

export default AdminLogin;