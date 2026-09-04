import React, { useState } from "react";
import axios from "axios";
import {
  FaUserPlus,
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaBuilding,
  FaBriefcase,
  FaMapMarkerAlt,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

import "./EmployeeRegister.css";

function EmployeeRegister({
  apiUrl,
  onBackToLogin,
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: "",
    position: "",
    address: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [registeredEmployee, setRegisteredEmployee] =
    useState(null);

  // ============================================================
  // HANDLE INPUT
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
  // VALIDATE FORM
  // ============================================================

  const validateForm = () => {
    if (!form.firstName.trim()) {
      return "First name is required.";
    }

    if (!form.email.trim()) {
      return "Email address is required.";
    }

    if (!form.password) {
      return "Password is required.";
    }

    if (form.password.length < 6) {
      return "Password must contain at least 6 characters.";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match.";
    }

    if (
      form.phone &&
      form.phone.trim().length < 10
    ) {
      return "Please enter a valid phone number.";
    }

    return "";
  };

  // ============================================================
  // SUBMIT REGISTRATION
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/api/auth/register`,
        {
          firstName:
            form.firstName.trim(),

          lastName:
            form.lastName.trim(),

          email:
            form.email
              .trim()
              .toLowerCase(),

          password:
            form.password,

          phone:
            form.phone.trim(),

          department:
            form.department.trim(),

          position:
            form.position.trim(),

          address:
            form.address.trim(),
        }
      );

      console.log(
        "REGISTRATION RESPONSE:",
        response.data
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Registration failed."
        );
      }

      setRegisteredEmployee(
        response.data.employee
      );

      setSuccess(true);

    } catch (error) {
      console.error(
        "EMPLOYEE REGISTRATION ERROR:",
        error
      );

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          "Unable to create employee account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SUCCESS SCREEN
  // ============================================================

  if (success) {
    return (
      <div className="employee-register-page">

        <div className="employee-register-success-card">

          <div className="employee-register-success-icon">
            <FaCheckCircle />
          </div>

          <h1>
            Registration Successful
          </h1>

          <p className="success-description">
            Your employee account has been
            created successfully.
          </p>

          <div className="employee-id-card">

            <span>
              Your Employee ID
            </span>

            <strong>
              {registeredEmployee?.employeeId}
            </strong>

            <small>
              Keep this ID for your records.
            </small>

          </div>

          <div className="success-details">

            <div>
              <span>Name</span>

              <strong>
                {registeredEmployee?.firstName}{" "}
                {registeredEmployee?.lastName}
              </strong>
            </div>

            <div>
              <span>Email</span>

              <strong>
                {registeredEmployee?.email}
              </strong>
            </div>

            <div>
              <span>Account Type</span>

              <strong>
                Employee
              </strong>
            </div>

          </div>

          <button
            type="button"
            className="success-login-button"
            onClick={onBackToLogin}
          >
            <FaArrowLeft />

            <span>
              Continue to Employee Login
            </span>
          </button>

        </div>

      </div>
    );
  }

  // ============================================================
  // REGISTRATION PAGE
  // ============================================================

  return (
    <div className="employee-register-page">

      <div className="employee-register-card">

        {/* TOP LINE */}
        <div className="employee-register-top-line" />

        {/* HEADER */}
        <div className="employee-register-header">

          <div className="employee-register-icon">
            <FaUserPlus />
          </div>

          <div>
            <h1>
              Create Employee Account
            </h1>

            <p>
              Register to access your personal
              employee portal.
            </p>
          </div>

        </div>

        {/* INFORMATION */}
        <div className="employee-register-info">

          <FaCheckCircle />

          <span>
            Employee ID will be generated
            automatically after registration.
          </span>

        </div>

        {/* ERROR */}
        {error && (
          <div className="employee-register-error">
            {error}
          </div>
        )}

        {/* FORM */}
        <form
          className="employee-register-form"
          onSubmit={handleSubmit}
        >

          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <div className="register-section-title">
            <span>01</span>

            <div>
              <h2>
                Personal Information
              </h2>

              <p>
                Enter your basic personal details.
              </p>
            </div>
          </div>

          <div className="register-grid">

            {/* FIRST NAME */}
            <div className="register-field">

              <label htmlFor="firstName">
                First Name *
              </label>

              <div className="register-input-wrapper">

                <FaUser />

                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  autoComplete="given-name"
                  required
                />

              </div>

            </div>

            {/* LAST NAME */}
            <div className="register-field">

              <label htmlFor="lastName">
                Last Name
              </label>

              <div className="register-input-wrapper">

                <FaUser />

                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  autoComplete="family-name"
                />

              </div>

            </div>

            {/* EMAIL */}
            <div className="register-field">

              <label htmlFor="registerEmail">
                Email Address *
              </label>

              <div className="register-input-wrapper">

                <FaEnvelope />

                <input
                  id="registerEmail"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />

              </div>

            </div>

            {/* PHONE */}
            <div className="register-field">

              <label htmlFor="phone">
                Phone Number
              </label>

              <div className="register-input-wrapper">

                <FaPhone />

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  autoComplete="tel"
                />

              </div>

            </div>

          </div>

          {/* ADDRESS */}
          <div className="register-field register-full-field">

            <label htmlFor="address">
              Address
            </label>

            <div className="register-input-wrapper">

              <FaMapMarkerAlt />

              <input
                id="address"
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter your address"
                autoComplete="street-address"
              />

            </div>

          </div>

          {/* ==================================================
              PROFESSIONAL INFORMATION
          ================================================== */}

          <div className="register-section-title">

            <span>02</span>

            <div>
              <h2>
                Professional Information
              </h2>

              <p>
                Tell us about your role.
              </p>
            </div>

          </div>

          <div className="register-grid">

            {/* DEPARTMENT */}
            <div className="register-field">

              <label htmlFor="department">
                Department
              </label>

              <div className="register-input-wrapper">

                <FaBuilding />

                <input
                  id="department"
                  type="text"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Finance"
                />

              </div>

            </div>

            {/* POSITION */}
            <div className="register-field">

              <label htmlFor="position">
                Position
              </label>

              <div className="register-input-wrapper">

                <FaBriefcase />

                <input
                  id="position"
                  type="text"
                  name="position"
                  value={form.position}
                  onChange={handleChange}
                  placeholder="e.g. Manager"
                />

              </div>

            </div>

          </div>

          {/* ==================================================
              SECURITY
          ================================================== */}

          <div className="register-section-title">

            <span>03</span>

            <div>
              <h2>
                Account Security
              </h2>

              <p>
                Create a secure password.
              </p>
            </div>

          </div>

          <div className="register-grid">

            {/* PASSWORD */}
            <div className="register-field">

              <label htmlFor="registerPassword">
                Password *
              </label>

              <div className="register-input-wrapper">

                <FaLock />

                <input
                  id="registerPassword"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
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

            {/* CONFIRM PASSWORD */}
            <div className="register-field">

              <label htmlFor="confirmPassword">
                Confirm Password *
              </label>

              <div className="register-input-wrapper">

                <FaLock />

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

            </div>

          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="employee-register-submit"
            disabled={loading}
          >

            {loading ? (
              <>
                <FaSpinner className="register-spinner" />

                <span>
                  Creating Account...
                </span>
              </>
            ) : (
              <>
                <FaUserPlus />

                <span>
                  Create Employee Account
                </span>
              </>
            )}

          </button>

        </form>

        {/* BACK TO LOGIN */}
        <div className="employee-register-footer">

          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={onBackToLogin}
          >
            <FaArrowLeft />

            Back to Login
          </button>

        </div>

      </div>

    </div>
  );
}

export default EmployeeRegister;