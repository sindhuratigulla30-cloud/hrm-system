const payrollRoutes = require("./routes/payrollRoutes");
const express = require("express");
const dns = require("dns");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  // Add your Vercel URL here after deployment
  // "https://your-hrm-system.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // such as Postman or server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
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
// LOCAL DEV SERVER
// Not used on Vercel — see api/index.js for the serverless entry.
// ============================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is missing in environment variables");
      process.exit(1);
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables");
      process.exit(1);
    }

    await connectDB();

    console.log("MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`HRM server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

startServer();
