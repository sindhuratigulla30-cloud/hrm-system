import React, { useState } from "react";
import {
  FaUserTie,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaSignInAlt,
} from "react-icons/fa";
import axios from "axios";

import "./Login.css";

function Login({
  apiUrl,
  onLoginSuccess,
  onBack,
}) {
  const [form, setForm] = useState({
    employeeId: "",
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

    if (
      !form.employeeId.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError(
        "Employee ID, email and password are required."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log(
        "Employee login request:",
        {
          employeeId: form.employeeId,
          email: form.email,
        }
      );

      const response = await axios.post(
        `${apiUrl}/api/auth/employee-login`,
        {
          employeeId:
            form.employeeId.trim(),

          email:
            form.email
              .trim()
              .toLowerCase(),

          password:
            form.password,
        }
      );

      console.log(
        "Employee login response:",
        response.data
      );

      const token =
        response.data?.token ||
        response.data?.data?.token;

      const user =
        response.data?.user ||
        response.data?.employee ||
        response.data?.data?.user ||
        response.data?.data?.employee ||
        null;

      if (!token) {
        throw new Error(
          "Authentication token was not received."
        );
      }

      /*
       * Send the successful login
       * back to App.jsx.
       *
       * App.jsx will then call:
       *
       * GET /api/employees/me
       *
       * to load ONLY this employee.
       */

      onLoginSuccess(
        token,
        user
      );
    } catch (error) {
      console.error(
        "EMPLOYEE LOGIN ERROR:",
        error
      );

      console.error(
        "Server response:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          "Employee login failed. Please check your Employee ID, email and password."
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
        <h1>
          Employee Login
        </h1>

        <p className="employee-login-subtitle">
          Sign in to access your employee portal.
        </p>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="employee-login-form"
        >

          {/* EMPLOYEE ID */}
          <div className="employee-login-field">

            <label htmlFor="employeeId">
              Employee ID
            </label>

            <input
              id="employeeId"
              type="text"
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              placeholder="EMP002"
              autoComplete="username"
              required
            />

          </div>

          {/* EMAIL */}
          <div className="employee-login-field">

            <label htmlFor="employeeEmail">
              Email
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
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
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
                : "Login as Employee"}
            </span>

          </button>

        </form>

        {/* DIVIDER */}
        <div className="employee-login-divider">
          <span />
          <span>OR</span>
          <span />
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

        {/* SECURITY MESSAGE */}
        <div className="employee-security-note">
          <FaUserTie />

          <span>
            Employee access is restricted to
            your own profile and attendance.
          </span>
        </div>

      </div>

    </div>
  );
}

export default Login;