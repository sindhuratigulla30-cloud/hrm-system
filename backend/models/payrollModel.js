const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    employeeName: {
      type: String,
      required: true,
      trim: true,
    },

    department: {
      type: String,
      default: "",
      trim: true,
    },

    position: {
      type: String,
      default: "",
      trim: true,
    },

    salary: {
      type: Number,
      required: true,
      min: 0,
    },

    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },

    deductions: {
      type: Number,
      default: 0,
      min: 0,
    },

    netSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },

    month: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payroll", payrollSchema);