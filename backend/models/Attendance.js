const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    // ============================================================
    // EMPLOYEE
    // ============================================================

    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // ============================================================
    // ATTENDANCE DATE
    // ============================================================

    date: {
      type: String,
      required: true,
    },

    // ============================================================
    // LOGIN / CHECK-IN TIME
    // ============================================================

    loginTime: {
      type: Date,
      default: null,
    },

    // ============================================================
    // LOGOUT / CHECK-OUT TIME
    // ============================================================

    logoutTime: {
      type: Date,
      default: null,
    },

    // ============================================================
    // TOTAL WORKING HOURS
    // ============================================================

    workingHours: {
      type: Number,
      default: 0,
    },

    // ============================================================
    // ATTENDANCE STATUS
    // ============================================================

    status: {
      type: String,
      enum: [
        "Present",
        "Absent",
        "Half Day",
        "Leave",
      ],
      default: "Present",
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// PREVENT DUPLICATE ATTENDANCE FOR SAME EMPLOYEE + DATE
// ============================================================

attendanceSchema.index(
  {
    employeeId: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);