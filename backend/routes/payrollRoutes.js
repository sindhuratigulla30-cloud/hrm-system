const express = require("express");

const {
  getPayroll,
  getPayrollById,
  createPayroll,
  updatePayroll,
  deletePayroll,
} = require("../controllers/payrollController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================================
// PAYROLL ROUTES
// ============================================================

// Get all payroll records
router.get("/", protect, getPayroll);

// Get single payroll record
router.get("/:id", protect, getPayrollById);

// Create payroll record
router.post("/", protect, createPayroll);

// Update payroll record
router.put("/:id", protect, updatePayroll);

// Delete payroll record
router.delete("/:id", protect, deletePayroll);

module.exports = router;