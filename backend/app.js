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

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://hrm-system-frontend-lovat.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests such as Postman/server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("CORS blocked origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },

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

    optionsSuccessStatus: 204,
  })
);

/* =========================================================
   BODY PARSER
========================================================= */

app.use(express.json());

/* =========================================================
   ROUTES
========================================================= */

app.use("/api/auth", authRoutes);

app.use("/api/employees", employeeRoutes);

app.use("/api/departments", departmentRoutes);

app.use("/api/leave-requests", leaveRequestRoutes);

app.use("/api/payroll", payrollRoutes);

app.use("/api/attendance", attendanceRoutes);

/* =========================================================
   HEALTH CHECK
========================================================= */

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

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Not allowed by CORS",
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

/* =========================================================
   EXPORT EXPRESS APP
========================================================= */

module.exports = app;