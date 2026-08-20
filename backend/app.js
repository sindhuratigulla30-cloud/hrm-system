const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

const allowedOrigins = [
  "https://hrm-frontend-steel.vercel.app",
  "https://hrm-frontend-wine.vercel.app",
  "https://hrm-frontend-git-main-med-nova1.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ============================================================
// ROUTES
// ============================================================

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const leaveRequestRoutes = require("./routes/leaveRequestRoutes");
const payrollRoutes = require("./routes/payrollRoutes");

app.use("/api/payroll", payrollRoutes);

// Authentication
app.use("/api/auth", authRoutes);

// Employees
app.use("/api/employees", employeeRoutes);

// Departments
app.use("/api/departments", departmentRoutes);

// Leave Requests
app.use("/api/leave-requests", leaveRequestRoutes);

// ============================================================
// TEST ROUTE
// ============================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HRM Backend API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "HRM server is healthy",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
  });
});

module.exports = app;
