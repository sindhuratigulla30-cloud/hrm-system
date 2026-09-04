import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaUserPlus,
  FaSignInAlt,
  FaUserShield,
} from "react-icons/fa";

import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-background">
        {/* Gradient background elements */}
        <div className="gradient-circle gradient-1"></div>
        <div className="gradient-circle gradient-2"></div>
        <div className="gradient-circle gradient-3"></div>
      </div>

      <div className="landing-container">
        {/* Logo Section */}
        <div className="landing-header">
          <div className="logo-icon">
            <FaUserTie />
          </div>
          <h1>HR Management System</h1>
          <p className="subtitle">
            Efficient Employee Management & Attendance Tracking
          </p>
        </div>

        {/* Main Content */}
        <div className="landing-content">
          <div className="landing-grid">
            {/* Employee Register Card */}
            <div className="landing-card">
              <div className="card-icon employee-icon">
                <FaUserPlus />
              </div>
              <h2>New Employee?</h2>
              <p>Create your account and join our organization</p>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="btn btn-primary"
              >
                <FaUserPlus /> Register Now
              </button>
            </div>

            {/* Employee Login Card */}
            <div className="landing-card">
              <div className="card-icon employee-icon">
                <FaSignInAlt />
              </div>
              <h2>Employee Login</h2>
              <p>Access your dashboard and manage your attendance</p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="btn btn-secondary"
              >
                <FaSignInAlt /> Login
              </button>
            </div>

            {/* Admin Login Card */}
            <div className="landing-card">
              <div className="card-icon admin-icon">
                <FaUserShield />
              </div>
              <h2>HR/Admin Portal</h2>
              <p>Manage employees, attendance, and payroll</p>
              <button
                type="button"
                onClick={() => navigate("/admin-login")}
                className="btn btn-admin"
              >
                <FaUserShield /> Admin Login
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="landing-features">
          <h3>Key Features</h3>
          <div className="features-grid">
            <div className="feature">
              <span className="feature-icon">✓</span>
              <p>Employee Attendance Tracking</p>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <p>Leave Request Management</p>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <p>Payroll Processing</p>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <p>Employee Reporting</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="landing-footer">
          <p>© 2026 HR Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

export default Landing;
