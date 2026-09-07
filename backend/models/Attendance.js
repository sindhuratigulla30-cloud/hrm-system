const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    employeeId: {
      type: String,
      required: true,
      trim: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Present", "Late", "Absent"],
      default: "Present",
    },

    checkIn: {
      type: String,
      default: "-",
      trim: true,
    },

    checkOut: {
      type: String,
      default: "-",
      trim: true,
    },

    workingHours: {
      type: String,
      default: "0h 0m",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
  One attendance record per employee per day.
*/
attendanceSchema.index(
  { employee: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);