const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    // ============================================================
    // EMPLOYEE ID
    // ============================================================

    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // ============================================================
    // PERSONAL INFORMATION
    // ============================================================

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    // ============================================================
    // JOB INFORMATION
    // ============================================================

    department: {
      type: String,
      trim: true,
      default: "",
    },

    position: {
      type: String,
      trim: true,
      default: "",
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    salary: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ============================================================
    // LOGIN
    // ============================================================

    password: {
      type: String,
      required: true,
    },

    // ============================================================
    // ACCOUNT STATUS
    // ============================================================

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // ============================================================
    // ROLE
    // ============================================================

    role: {
      type: String,
      enum: ["employee", "admin"],
      default: "employee",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);