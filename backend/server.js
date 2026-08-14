const payrollRoutes = require("./routes/payrollRoutes");
const express = require("express");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
  cors({
    origin: "http://localhost:5173",
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

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HRM Backend API is running",
  });
});

// ============================================================
// MONGODB CONNECTION
// ============================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI is missing in .env");
      process.exit(1);
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`HRM server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

startServer();