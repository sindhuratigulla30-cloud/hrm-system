const express = require("express");

const {
  createEmployee,
  getEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// ==========================================
// ADMIN ONLY EMPLOYEE MANAGEMENT
// ==========================================

// Create employee
router.post(
  "/",
  protect,
  allowRoles("admin"),
  createEmployee
);

// Get all employees
router.get(
  "/",
  protect,
  allowRoles("admin"),
  getEmployees
);

// Get a specific employee
router.get(
  "/:id",
  protect,
  allowRoles("admin"),
  getEmployee
);

// Update employee
router.put(
  "/:id",
  protect,
  allowRoles("admin"),
  updateEmployee
);

// Delete employee
router.delete(
  "/:id",
  protect,
  allowRoles("admin"),
  deleteEmployee
);

module.exports = router;