const express = require("express");
const dns = require("dns");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const payrollRoutes = require("./routes/payrollRoutes");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const leaveRequestRoutes = require("./routes/leaveRequestRoutes");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config();

const app = express();

// ============================================================
// MONGODB CONNECTION
// ============================================================

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing in environment variables"
      );
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error(
      "MongoDB connection error:",
      error.message
    );

    throw error;
  }
};

// ============================================================
// MIDDLEWARE
// ============================================================

// Allow frontend requests during local development
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// ============================================================
// ROUTES
// ============================================================

// Authentication
app.use("/api/auth", authRoutes);

// Employees
app.use("/api/employees", employeeRoutes);

// Departments
app.use("/api/departments", departmentRoutes);

// Leave Requests
app.use("/api/leave-requests", leaveRequestRoutes);

// Payroll
app.use("/api/payroll", payrollRoutes);

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

// ============================================================
// ERROR HANDLER
// ============================================================

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  if (error.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Not allowed by CORS",
    });
  }

  res.status(500).json({
    success: false,
    message:
      error.message || "Internal server error",
  });
});

// ============================================================
// START SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is missing in environment variables"
      );

      process.exit(1);
    }

    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `HRM server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Unable to start HRM server:",
      error.message
    );

    process.exit(1);
  }
};

startServer();

