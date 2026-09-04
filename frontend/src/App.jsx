import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";

// ============================================================
// PAGES
// ============================================================

import Landing from "./pages/Landing";
import Login from "./Login/Login";
import AdminLogin from "./AdminLogin/AdminLogin";
import Register from "./EmployeeRegister/EmployeeRegister";

import EmployeeDashboard from "./EmployeeDashboard/EmployeeDashboard";
import AdminDashboard from "./AdminDashboard/AdminDashboard";

// ============================================================
// COMPONENTS
// ============================================================

import ProtectedRoute from "./components/ProtectedRoute";

// ============================================================
// STYLES
// ============================================================

import "./App.css";

// ============================================================
// API CONFIGURATION
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// ============================================================
// APP COMPONENT
// ============================================================

function App() {
  // ==========================================================
  // AUTHENTICATION STATE
  // ==========================================================

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");

      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("USER STORAGE ERROR:", error);

      localStorage.removeItem("user");

      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // ==========================================================
  // VERIFY EXISTING LOGIN SESSION
  // ==========================================================

  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      // ------------------------------------------------------
      // NO SESSION
      // ------------------------------------------------------

      if (!savedToken) {
        setToken(null);
        setUser(null);
        setLoading(false);

        return;
      }

      try {
        const parsedUser = savedUser
          ? JSON.parse(savedUser)
          : null;

        // ----------------------------------------------------
        // ADMIN SESSION
        // ----------------------------------------------------

        if (parsedUser?.role === "admin") {
          setToken(savedToken);
          setUser(parsedUser);
          setLoading(false);

          return;
        }

        // ----------------------------------------------------
        // EMPLOYEE SESSION
        // ----------------------------------------------------

        const response = await axios.get(
          `${API_URL}/api/employees/me`,
          {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          }
        );

        if (response.data?.data) {
          const employeeData = {
            ...response.data.data,
            role: "employee",
          };

          localStorage.setItem(
            "user",
            JSON.stringify(employeeData)
          );

          setToken(savedToken);
          setUser(employeeData);
        } else {
          throw new Error(
            "Invalid employee session"
          );
        }
      } catch (error) {
        console.error(
          "SESSION VERIFICATION ERROR:",
          error
        );

        // ----------------------------------------------------
        // CLEAR INVALID SESSION
        // ----------------------------------------------------

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // ==========================================================
  // SAVE LOGIN SESSION
  // ==========================================================

  const saveLoginSession = (
    receivedToken,
    receivedUser,
    forcedRole = null
  ) => {
    if (!receivedToken || !receivedUser) {
      console.error(
        "INVALID LOGIN RESPONSE"
      );

      return false;
    }

    const userData = {
      ...receivedUser,

      role:
        forcedRole ||
        receivedUser.role ||
        "employee",
    };

    // --------------------------------------------------------
    // SAVE TOKEN
    // --------------------------------------------------------

    localStorage.setItem(
      "token",
      receivedToken
    );

    // --------------------------------------------------------
    // SAVE USER
    // --------------------------------------------------------

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    // --------------------------------------------------------
    // UPDATE REACT STATE
    // --------------------------------------------------------

    setToken(receivedToken);
    setUser(userData);

    return true;
  };

  // ==========================================================
  // EMPLOYEE LOGIN SUCCESS
  // ==========================================================

  const handleEmployeeLoginSuccess = (
    receivedToken,
    receivedUser
  ) => {
    return saveLoginSession(
      receivedToken,
      receivedUser,
      "employee"
    );
  };

  // ==========================================================
  // ADMIN LOGIN SUCCESS
  // ==========================================================

  const handleAdminLoginSuccess = (
    receivedToken,
    receivedUser
  ) => {
    return saveLoginSession(
      receivedToken,
      receivedUser,
      "admin"
    );
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    // --------------------------------------------------------
    // REMOVE AUTH DATA
    // --------------------------------------------------------

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // --------------------------------------------------------
    // CLEAR STATE
    // --------------------------------------------------------

    setToken(null);
    setUser(null);
  };

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-card">

          <div className="app-loading-spinner" />

          <h2>
            HRM System
          </h2>

          <p>
            Loading your secure session...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================================
  // APPLICATION ROUTES
  // ==========================================================

  return (
    <Router>

      <Routes>

        {/* ==================================================
            LANDING PAGE
        ================================================== */}

        <Route
          path="/"
          element={
            <Landing />
          }
        />

        {/* ==================================================
            EMPLOYEE REGISTRATION
        ================================================== */}

        <Route
          path="/register"
          element={
            token ? (
              <Navigate
                to={
                  user?.role === "admin"
                    ? "/admin-dashboard"
                    : "/employee-dashboard"
                }
                replace
              />
            ) : (
              <Register
                apiUrl={API_URL}

                onBackToLogin={() => {
                  window.location.href =
                    "/login";
                }}
              />
            )
          }
        />

        {/* ==================================================
            EMPLOYEE LOGIN
        ================================================== */}

        <Route
          path="/login"
          element={
            token ? (
              <Navigate
                to={
                  user?.role === "admin"
                    ? "/admin-dashboard"
                    : "/employee-dashboard"
                }
                replace
              />
            ) : (
              <Login
                apiUrl={API_URL}

                onLoginSuccess={
                  handleEmployeeLoginSuccess
                }

                onRegister={() => {
                  window.location.href =
                    "/register";
                }}

                onBack={() => {
                  window.location.href =
                    "/";
                }}
              />
            )
          }
        />

        {/* ==================================================
            ADMIN LOGIN
        ================================================== */}

        <Route
          path="/admin-login"
          element={
            token ? (
              <Navigate
                to={
                  user?.role === "admin"
                    ? "/admin-dashboard"
                    : "/employee-dashboard"
                }
                replace
              />
            ) : (
              <AdminLogin
                apiUrl={API_URL}

                onLoginSuccess={
                  handleAdminLoginSuccess
                }
              />
            )
          }
        />

        {/* ==================================================
            EMPLOYEE DASHBOARD
        ================================================== */}

        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute
              requiredRole="employee"
            >
              <EmployeeDashboard
                user={user}
                token={token}
                apiUrl={API_URL}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            ADMIN DASHBOARD
        ================================================== */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              requiredRole="admin"
            >
              <AdminDashboard
                user={user}
                token={token}
                apiUrl={API_URL}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }
        />

        {/* ==================================================
            INVALID ROUTE
        ================================================== */}

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

    </Router>
  );
}

export default App;