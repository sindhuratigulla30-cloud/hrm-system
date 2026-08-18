import { useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

const Login = ({
  apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000",
  onLoginSuccess,
  onBack,
}) => {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (mode === "register" && form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const response = await axios.post(`${apiUrl}/api/auth/login`, {
          email: form.email,
          password: form.password,
        });

        const newToken = response.data?.token;

        if (!newToken) {
          alert("Login failed: token was not received.");
          return;
        }

        alert("Employee login successful.");
        await onLoginSuccess(newToken);
      } else {
        const response = await axios.post(`${apiUrl}/api/auth/register`, {
          name: `${form.firstName} ${form.lastName}`.trim(),
          firstName: form.firstName,
          lastName: form.lastName,
          employeeId: form.employeeId,
          email: form.email,
          password: form.password,
          role: "employee",
        });

        const newToken = response.data?.token;

        if (newToken) {
          alert("Employee registered successfully.");
          await onLoginSuccess(newToken);
        } else {
          alert("Registration successful. Please login with your email and password.");
          setMode("login");
          setForm((previous) => ({
            ...previous,
            password: "",
            confirmPassword: "",
          }));
        }
      }
    } catch (error) {
      console.error("Employee authentication error:", error);
      alert(
        error.response?.data?.message ||
          (mode === "login"
            ? "Unable to login. Please check your email and password."
            : "Unable to register employee.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="employee-modal login-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>
              {mode === "login"
                ? "Employee Login"
                : "Employee Registration"}
            </h2>
            <p>
              {mode === "login"
                ? "Login with your employee account."
                : "Create your employee account."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onBack}
            aria-label="Back to administrator login"
          >
            <FaTimes />
          </button>
        </div>

        <form className="employee-form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Employee ID *</label>
                <input
                  type="text"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  placeholder="e.g. EMP001"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="employee@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <div style={{ position: "relative", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                minLength={6}
                style={{ paddingRight: "45px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "#64748b",
                  fontSize: "18px",
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {mode === "register" && (
            <div className="form-group">
              <label>Confirm Password *</label>
              <div style={{ position: "relative", width: "100%" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  minLength={6}
                  style={{ paddingRight: "45px" }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#64748b",
                    fontSize: "18px",
                  }}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onBack}
              disabled={loading}
            >
              Back
            </button>

            <button type="submit" className="save-button" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Employee Login"
                : "Register"}
            </button>
          </div>
        </form>

        <div
          style={{
            marginTop: "18px",
            paddingTop: "18px",
            borderTop: "1px solid #e5eaf2",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            {mode === "login"
              ? "Don't have an employee account?"
              : "Already have an employee account?"}
          </p>

          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            style={{
              border: "none",
              background: "transparent",
              color: "#2563eb",
              fontSize: "14px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {mode === "login"
              ? "Employee Registration"
              : "Employee Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;