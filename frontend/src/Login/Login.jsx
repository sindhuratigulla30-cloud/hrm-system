import { useState } from "react";
import axios from "axios";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";

const API_URL = "http://127.0.0.1:5000";

const Login = ({ onLoginSuccess, onBack }) => {
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

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // -----------------------------------------
    // VALIDATE REGISTRATION PASSWORD
    // -----------------------------------------
    if (mode === "register") {
      if (form.password.length < 6) {
        alert("Password must contain at least 6 characters.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      // =====================================================
      // EMPLOYEE LOGIN
      // =====================================================
      if (mode === "login") {
        const loginUrl = `${API_URL}/api/auth/login`;

        console.log("------------------------------------");
        console.log("EMPLOYEE LOGIN");
        console.log("API URL:", API_URL);
        console.log("Login endpoint:", loginUrl);
        console.log("Email:", form.email);
        console.log("------------------------------------");

        const response = await axios.post(
          loginUrl,
          {
            email: form.email.trim().toLowerCase(),
            password: form.password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        console.log("Employee login response:", response.data);

        const newToken = response.data?.token;

        if (!newToken) {
          alert("Login failed: token was not received from the server.");
          return;
        }

        localStorage.setItem("token", newToken);

        if (response.data?.user) {
          localStorage.setItem(
            "employeeUser",
            JSON.stringify(response.data.user)
          );
        }

        alert("Employee login successful.");

        if (typeof onLoginSuccess === "function") {
          await onLoginSuccess(newToken);
        }

        return;
      }

      // =====================================================
      // EMPLOYEE REGISTRATION
      // =====================================================
      const registerUrl = `${API_URL}/api/auth/register`;

      console.log("------------------------------------");
      console.log("EMPLOYEE REGISTRATION");
      console.log("API URL:", API_URL);
      console.log("Registration endpoint:", registerUrl);
      console.log("------------------------------------");

      const response = await axios.post(
        registerUrl,
        {
          name: `${form.firstName} ${form.lastName}`.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          employeeId: form.employeeId.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: "employee",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("Employee registration response:", response.data);

      alert(
        "Employee registration successful.\n\nPlease use your email and password to login."
      );

      // Switch back to login
      setMode("login");

      // Keep email so employee doesn't have to type it again
      setForm((previous) => ({
        ...previous,
        password: "",
        confirmPassword: "",
      }));
    } catch (error) {
      console.error("------------------------------------");
      console.error("EMPLOYEE AUTHENTICATION ERROR");
      console.error("Error:", error);
      console.error("Response:", error.response);
      console.error("Request:", error.request);
      console.error("------------------------------------");

      // Server responded with an error
      if (error.response) {
        const message =
          error.response.data?.message ||
          `Server returned status ${error.response.status}.`;

        alert(message);
      }

      // Request was sent but no response received
      else if (error.request) {
        alert(
          "Cannot connect to the HRM backend.\n\n" +
            "Please make sure the backend is running on:\n" +
            "http://127.0.0.1:5000\n\n" +
            "Also make sure you restarted the frontend after changing .env."
        );
      }

      // Something else happened
      else {
        alert(
          error.message ||
            (mode === "login"
              ? "Unable to login."
              : "Unable to register employee.")
        );
      }
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
        {/* =========================================
            HEADER
        ========================================= */}
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

        {/* =========================================
            FORM
        ========================================= */}
        <form className="employee-form" onSubmit={handleSubmit}>
          {/* =========================================
              REGISTRATION FIELDS
          ========================================= */}
          {mode === "register" && (
            <>
              <div className="form-grid">
                {/* FIRST NAME */}
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

                {/* LAST NAME */}
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

              {/* EMPLOYEE ID */}
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

          {/* =========================================
              EMAIL
          ========================================= */}
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

          {/* =========================================
              PASSWORD
          ========================================= */}
          <div className="form-group">
            <label>Password *</label>

            <div
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                minLength={6}
                style={{
                  paddingRight: "45px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((previous) => !previous)
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
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* =========================================
              CONFIRM PASSWORD
          ========================================= */}
          {mode === "register" && (
            <div className="form-group">
              <label>Confirm Password *</label>

              <div
                style={{
                  position: "relative",
                  width: "100%",
                }}
              >
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  minLength={6}
                  style={{
                    paddingRight: "45px",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
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
                  {showConfirmPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* =========================================
              BUTTONS
          ========================================= */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onBack}
              disabled={loading}
            >
              Back
            </button>

            <button
              type="submit"
              className="save-button"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Employee Login"
                : "Register"}
            </button>
          </div>
        </form>

        {/* =========================================
            SWITCH LOGIN / REGISTRATION
        ========================================= */}
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
      margin: "0 0 12px",
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
    onClick={() =>
      setMode(mode === "login" ? "register" : "login")
    }
    disabled={loading}
    style={{
      border: "none",
      background: "transparent",
      color: "#2563eb",
      fontSize: "14px",
      fontWeight: "700",
      cursor: loading ? "not-allowed" : "pointer",
      textDecoration: "underline",
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