const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const leaveRequestRoutes = require("./routes/leaveRequestRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

dotenv.config();

const app = express();

/* =========================
   CORS
========================= */

app.use(
  cors({
    origin: [
      "https://hrm-frontend-indol.vercel.app",
      "http://localhost:5173",
    ],
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

/* =========================
   BODY PARSER
========================= */

app.use(express.json());

/* =========================
   ROUTES
========================= */

app.use("/api/auth", authRoutes);

app.use("/api/employees", employeeRoutes);

app.use("/api/departments", departmentRoutes);

app.use("/api/leave-requests", leaveRequestRoutes);

app.use("/api/payroll", payrollRoutes);

app.use("/api/attendance", attendanceRoutes);

/* =========================
   HEALTH
========================= */

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
  });
});

/* =========================
   ERROR HANDLER
========================= */

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

module.exports = app;