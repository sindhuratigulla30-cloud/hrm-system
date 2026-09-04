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
    },

    employeeName: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Present", "Late", "Absent"],
      default: "Present",
    },

    checkIn: {
      type: String,
      default: "-",
    },

    checkOut: {
      type: String,
      default: "-",
    },

    workingHours: {
      type: String,
      default: "0h 0m",
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index(
  { employee: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Attendance",
  attendanceSchema
);